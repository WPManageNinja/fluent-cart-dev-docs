## Subscription Payment - Stripe

This document covers the Stripe subscription payment flow and what happens when customers place orders with subscription items using Stripe. The subscription flow uses the same `makePayment` method entry point but routes to specialized subscription handlers.

### Subscription Flow Overview

1. **Order Creation**: Customer proceeds to checkout with subscription items, order is created with `ORDER_ON_HOLD` status
2. **Subscription Processing**: Stripe subscription method is selected and processed
3. **Customer Creation**: Stripe customer is created or retrieved
4. **Subscription Creation**: Stripe subscription is created with payment method
5. **Payment Confirmation**: Payment is confirmed via frontend JavaScript and backend verification
6. **Order Completion**: Order status is updated and subscription is activated

### Key Components

- **Main Entry Point**: `app/Modules/PaymentMethods/Stripe/Stripe.php` - `makePayment()` method
- **Subscription Handler**: `app/Modules/Subscriptions/Modules/Stripe/Subscriptions.php` - `handleOnsiteSubscription()` method
- **Payment Confirmation**: `app/Modules/PaymentMethods/Stripe/Stripe.php` - `confirmStripePayment()` method
- **API Handler**: `app/Modules/PaymentMethods/Stripe/API/API.php`
- **Webhook Handler**: `app/Modules/Subscriptions/Modules/Stripe/RemoteEventListener.php`
- **Frontend**: `resources/public/payment-methods/stripe-checkout.js`

### Subscription Payment Flow

## 1. Initiate & prepare payment data:

The subscription flow starts with the same `makePayment` method but routes differently:

```php
public function makePayment($orderHelper)
{
    // 1. Initialize Stripe settings and validate transaction
    $hash = $this->resolveOrderHash($orderHelper);
    $stripeSettings = new StripeSettings();
    $publicKey = $stripeSettings->getPublicKey();
    $customer = $orderHelper->customer;
    $stripeSetting = $this->getSettings();
    $apiKey = $stripeSettings->getApiKey();

    $transaction = $orderHelper->transactions->first();
    if (!$transaction) {
        throw new \Exception(__('Transaction not found!', 'fluent-cart'));
    }

    // 2. Prepare payment arguments
    $paymentArgs = [
        'amount' => (int)round($this->getPayableAmount($orderHelper->order)),
        'currency' => strtolower($orderHelper->order->currency),
        'success_url' => $paymentHelper->successUrl($transaction->uuid),
        'cancel_url' => $paymentHelper->cancelUrl($transaction->uuid),
        // ... other payment data
    ];

    // 3. Route to subscription handler for onsite checkout
        ....
            // Handle subscription payment - triggers subscription module
            do_action('fluent_cart/payments/stripe_subscription_onsite', $orderHelper, $paymentArgs, $apiKey);
        ....
}
```

## 2. Subscription Handler Registration

The subscription module registers the hook handler:

```php
// In Subscriptions.php register() method
add_action('fluent_cart/payments/stripe_subscription_onsite', [$this, 'handleOnsiteSubscription'], 10, 3);
```

## 3. Process the Subscription

The main subscription processing method:

```php
public function handleOnsiteSubscription(OrderHelper $orderHelper, $paymentArgs, $apiKey): void
{
    // 1. Validate subscription items exist
    if (empty($orderHelper->subscriptionItems)) return;

    // 2. Initialize Stripe and get session data
    $stripe = new Stripe();
    $sessionData = $stripe->sessionData($orderHelper, $paymentArgs);
    $subscriptionArgs = $this->processAndGetSubscriptionArgs($orderHelper);

    $metadata = Arr::get($sessionData, 'metadata', []);

    // 3. Configure payment intent data if no subscription data
    if (empty($sessionData['subscription_data'])) {
        $sessionData['payment_intent_data'] = [
            'capture_method' => 'automatic',
            'description' => 'Payment for Order #' . $orderHelper->order->id,
            'metadata' => $metadata
        ];
    }

    // 4. Create or retrieve Stripe customer
    $sessionData = $this->addCustomer($sessionData, $orderHelper, $apiKey);

    // 5. Apply filters and prepare session data
    $sessionData = apply_filters('fluent_cart/payments/stripe_checkout_session_args', $sessionData, $orderHelper, $subscriptionArgs);
    $sessionData = array_merge($sessionData, ['locale' => 'auto']);

    // 6. Prepare subscription data for Stripe API
    $subscriptionData = [
        'customer' => Arr::get($sessionData, 'customer', ''),
        'items' => Arr::get($sessionData, 'subscription_data.items'),
        'payment_behavior' => 'default_incomplete',
        'payment_settings' => ['save_default_payment_method' => 'on_subscription'],
        'expand' => ['latest_invoice.payment_intent', 'pending_setup_intent'],
        'metadata' => $metadata
    ];

    // 7. Add expiration date if specified
    if ($expireAt = Arr::get($sessionData, 'subscription_data.expire_at', false)) {
        $subscriptionData['cancel_at'] = $expireAt;
    }

    // 8. Apply subscription data filters
    $subscriptionData = apply_filters('fluent_cart/payments/stripe_onsite_subscription_data', $subscriptionData, $sessionData, $apiKey);

    // 9. Add trial period if specified
    if ($trialEnd = Arr::get($subscriptionArgs, 'trial_end', false)) {
        $subscriptionData['trial_end'] = $trialEnd;
    }

    // 10. Create subscription via Stripe API
    $subscription = $this->createSubscription($subscriptionData, $apiKey, $orderHelper->order->id);
    if (is_wp_error($subscription)) {
        wp_send_json_error([
            'message' => $subscription->get_error_message()
        ], 423);
    }

    // 11. Update local subscription record with vendor IDs
    $chargeId = Arr::get($subscription, 'id');
    if ($chargeId) {
        Subscription::query()
            ->where('parent_order_id', $orderHelper->order->id)
            ->update([
                'vendor_subscription_id' => sanitize_text_field($chargeId),
                'vendor_customer_id' => sanitize_text_field(Arr::get($subscription, 'customer'))
            ]);
    }

    // 12. Update payment arguments with client secret
    $paymentArgs = $this->updateClientSecretInfo($paymentArgs, $subscription);

    // 13. Return success response with subscription data
    wp_send_json_success([
        'nextAction' => 'stripe',
        'actionName' => 'custom',
        'status' => 'success',
        'message' => __('Order has been placed successfully', 'fluent-cart'),
        'data' => $orderHelper,
        'payment_args' => $paymentArgs,
        'response' => $subscription
    ], 200);
}
```

## 4. Stripe Customer Creation

#### Customer Management

The `addCustomer` method creates or retrieves a Stripe customer:

```php
public function addCustomer($sessionData, $orderItem, $apiKey)
{
    // Create customer via main Stripe class
    $customer = (new Stripe())->createCustomer($orderItem, $apiKey);

    if (!empty($customer['id'])) {
        $sessionData['customer'] = $customer['id'];
    }
    return $sessionData;
}
```

## 5. Stripe Subscription Creation

#### createSubscription Method

The core subscription creation via Stripe API:

```php
public function createSubscription($subscriptionData, $apiKey, $orderId = '')
{
    ....
    // 1. Create subscription via Stripe API
    try {
        $api = new API();
        return $api->makeRequest('subscriptions', $subscriptionData, $apiKey, 'POST');
    } catch (\Exception $e) {
        return new \WP_Error('subscription_creation_failed', $e->getMessage());
    }
}
```

### 5. Handle the subscription for initial zero payment
For subscription with initial zero payment, Stripe requires a setup intent instead of a payment intent. 

There are certain cases where we have to handle the setup intent differently.
Like if we have subscription with 100% coupon and no signup fee, then Stripe will create a setup intent instead of a payment intent.
Determines the appropriate client secret for frontend payment confirmation:

```php
public function updateClientSecretInfo($paymentArgs, $subscription)
{
    // 1. Check if setup intent is required (for future payments)
    if ($subscription['pending_setup_intent'] != null) {
        $paymentArgs['vendor_subscription_info'] = [
            'type' => 'setup',
            'clientSecret' => Arr::get($subscription, 'pending_setup_intent.client_secret')
        ];
    } else {
        // 2. Use payment intent for immediate payment
        $paymentArgs['vendor_subscription_info'] = [
            'type' => 'payment',
            'clientSecret' => Arr::get($subscription, 'latest_invoice.payment_intent.client_secret')
        ];
    }

    return $paymentArgs;
}
```

### Frontend Payment Confirmation

#### JavaScript Subscription Handling

The frontend JavaScript handles subscription payment confirmation:

```javascript
// stripe-checkout.js - Subscription payment handling
window.addEventListener("fluent_cart_payment_next_action_stripe", (e) => {
    const remoteResponse = e.detail?.response?.data;
    const successUrl = remoteResponse?.payment_args?.success_url;

    let clientSecret = null;
    let intentType = 'intent';

    // 1. Determine intent type based on response
    if (remoteResponse?.response?.object === 'subscription') {
        intentType = remoteResponse?.payment_args?.vendor_subscription_info?.type;
        clientSecret = remoteResponse?.payment_args?.vendor_subscription_info?.clientSecret;
    } else {
        clientSecret = remoteResponse?.response?.client_secret;
    }

    // 2. Submit payment elements
    elements.submit().then(result => {
        // 3. Choose appropriate confirmation method
        const confirmIntent = intentType === "setup" ? stripe.confirmSetup : stripe.confirmPayment;
        const accessor = intentType === "setup" ? 'setupIntent' : 'paymentIntent';

        // 4. Prepare confirmation data
        const confirmData = {
            elements,
            clientSecret,
            confirmParams: {
                return_url: successUrl
            },
            redirect: 'if_required'
        };

        // 5. Confirm payment/setup intent
        confirmIntent(confirmData).then((result) => {
            const intentId = result[accessor]?.id;

            if (intentId) {
                // 6. Send confirmation to backend
                const params = new URLSearchParams({
                    action: 'fluent_cart_confirm_stripe_payment',
                    intentId: intentId
                }).toString();

                fetch(window.fluentcart_checkout_vars.ajaxurl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: params
                })
                .then(response => {
                    if (response.ok) {
                        window.location.href = successUrl;
                    }
                });
            } else if (result?.error) {
                window.location.href = `${successUrl}&status=failed&reason=${result?.error?.message}`;
            }
        });
    });
});
```

### Backend Payment Confirmation

#### confirmStripePayment Method

After Payment completed an AJAX called `confirmStripePayment` method in `Stripe.php` file.
The backend confirmation handler processes both payment intents and setup intents to update the Transaction and Subscription in FluentCart:
For zero payment Subscription Stripe has no payment Intent except the setup intent. So we have to handle it differently using confirmSetupIntent method.

```php
public function confirmStripePayment()
{
    // 1. Validate intent ID is provided
    if (!isset($_REQUEST['intentId'])) {
        return;
    }

    $intentId = $_REQUEST['intentId'];

    // 2. Route to setup intent confirmation for subscriptions
    if (strpos($intentId, 'seti_') === 0) {
        return $this->confirmSetupIntent($intentId);
    }

    // 3. Handle payment intent confirmation
    $path = 'payment_intents/' . $intentId;
    $api = new API();
    $response = $api->makeRequest($path, [], (new StripeSettings())->getApiKey());

    if (!$response || is_wp_error($response)) {
        return;
    }

    // 4. Extract order information from metadata
    $orderHash = Arr::get($response, 'metadata.ref_id');
    $transaction = OrderTransaction::query()
        ->where('vendor_charge_id', Arr::get($response, 'id'))
        ->first();

    // 5. Find and validate order
    $orderModel = (new Orders());
    if ($orderHash) {
        $order = $orderModel->getByHash($orderHash);
    } else {
        if (!$transaction) return;
        $order = $orderModel->getById($transaction->order_id);
    }

    if (!$order) {
        return;
    }

    // 6. Update order data with payment confirmation
    $updateData = [
        'vendor_charge_id' => Arr::get($response, 'id')
    ];

    $this->updateOrderDataByOrder($order, $updateData, $transaction);
}
```

#### Setup Intent Confirmation

For subscriptions requiring setup intents (future payments):

```php
public function confirmSetupIntent($setupIntent)
{
    // 1. Retrieve setup intent from Stripe
    $path = 'setup_intents/' . $setupIntent;
    $api = new API();
    $response = $api->makeRequest($path, [], (new StripeSettings())->getApiKey());

    // 2. Extract order information
    $orderHash = Arr::get($response, 'metadata.ref_id');
    $transaction = OrderTransaction::query()
        ->where('vendor_charge_id', Arr::get($response, 'id'))
        ->first();

    // 3. Find order
    $orderModel = (new Orders());
    if ($orderHash) {
        $order = $orderModel->getByHash($orderHash);
    } else {
        if (!$transaction) return;
        $order = $orderModel->getById($transaction->order_id);
    }

    if (!$order) {
        return;
    }

    // 4. Update order with setup intent confirmation
    $updateData = [
        'vendor_charge_id' => Arr::get($response, 'id')
    ];

    $this->updateOrderDataByOrder($order, $updateData, $transaction);
}
```

### Subscription Status Management

#### Status Mapping

The system maps Stripe subscription statuses to internal statuses:

```php
public function getCorrectSubscriptionStatus($stripeStatus)
{
    $statusMap = [
        'active' => Status::SUBSCRIPTION_ACTIVE,
        'trialing' => Status::SUBSCRIPTION_TRIALING,
        'past_due' => Status::SUBSCRIPTION_PAST_DUE,
        'canceled' => Status::SUBSCRIPTION_CANCELED,
        'unpaid' => Status::SUBSCRIPTION_UNPAID,
        'incomplete' => Status::SUBSCRIPTION_PENDING,
        'incomplete_expired' => Status::SUBSCRIPTION_CANCELED,
        'paused' => 'active(Collection paused)'
    ];

    return $statusMap[$stripeStatus] ?? Status::SUBSCRIPTION_PENDING;
}
```

#### Subscription Confirmation

The `confirmSubscription` method updates subscription details after successful payment, 
we have to update the bill count if it's a recurring payment:

```php
public function confirmSubscription($vendorId, $subscription, $billingInfo)
{
    // 1. Fetch subscription details from Stripe
    $api = new API();
    $response = $api->makeRequest('subscriptions/' . $vendorId, [], (new StripeSettings())->getApiKey());

    if (is_wp_error($response)) {
        return;
    }

    // 2. Calculate next billing date
    $nextBillingDate = Arr::get($response, 'current_period_end') ?? null;
    if ($nextBillingDate) {
        $nextBillingDate = DateTime::anyTimeToGmt($nextBillingDate);
    }

    // 3. Get correct subscription status
    $status = $this->getCorrectSubscriptionStatus(Arr::get($response, 'status'));

    // 4. Get bill count (number of paid invoices)
    $billCount = $this->getPaidInvoiceCount(0, Arr::get($response, 'id'));

    // 5. Update subscription record
    if (Arr::get($response, 'id')) {
        $subscription->next_billing_date = $nextBillingDate;
        $subscription->status = $status;
        $subscription->current_payment_method = 'stripe';
        $subscription->vendor_subscription_id = Arr::get($response, 'id');
        $subscription->bill_count = $billCount;
        $subscription->save();

        // 6. Update order payment method
        Order::query()
            ->where('id', $subscription->parent_order_id)
            ->where('payment_method', '!=', 'stripe')
            ->update(['payment_method' => 'stripe']);
    }
}
```

### Webhook Event Handling

#### Remote Event Listener

The `RemoteEventListener` class handles subscription webhook events:

```php
public function register()
{
    add_action('fluent_cart/payments/stripe/webhook_customer_subscription_updated', [$this, 'handleSubscriptionUpdated'], 10, 2);
    add_action('fluent_cart/payments/stripe/webhook_customer_subscription_deleted', [$this, 'handleSubscriptionDeleted'], 10, 2);
}
```

#### Subscription Updated Event

Handles subscription status changes:

```php
public function handleSubscriptionUpdated($event, $order)
{
    // 1. Extract subscription data
    $data = $event->data->object;
    $vendorSubscriptionId = $data->id;
    $subscription = Subscription::where('vendor_subscription_id', $vendorSubscriptionId)->first();
    
    if (!$subscription) {
        return;
    }

    // 2. Handle collection pause/resume
    $pause_collection = $data->pause_collection;
    
    // Case 1: Active -> Collection Paused
    if ($subscription->status === Status::SUBSCRIPTION_ACTIVE && $pause_collection) {
        $subscription->status = 'active(Collection paused)';
        $subscription->save();
    }

    // Case 2: Collection Paused -> Active
    if ($subscription->status === 'active(Collection paused)' && 
        ($pause_collection === null || $pause_collection === false)) {
        $subscription->status = Status::SUBSCRIPTION_ACTIVE;
        $subscription->save();
        
        // Trigger resume events
        do_action('fluent_cart/payments/subscription_resumed', $subscription->id, $order->id);
        do_action('fluent_cart/payments/subscription_resumed_stripe', $subscription->id, $order->id);
    }

    // 3. Log the event
    fluent_cart_add_log('Stripe webhook ' . $event->type . ' processed', $event, 'info', [
        'log_type' => 'webhook',
        'module_type' => 'FluentCart\App\Modules\Subscriptions\Modules\Stripe',
        'module_name' => 'Stripe',
        'module_id' => $order->id ?: null,
    ]);
}
```

#### Subscription Deleted Event

Handles subscription cancellation:

```php
public function handleSubscriptionDeleted($event, $order)
{
    // 1. Extract subscription data
    $data = $event->data->object;
    $vendorSubscriptionId = $data->id;
    $subscription = Subscription::where('vendor_subscription_id', $vendorSubscriptionId)->first();
    
    if (!$subscription) {
        return;
    }

    // 2. Update subscription status
    $subscription->status = Status::SUBSCRIPTION_CANCELED;
    $subscription->canceled_at = DateTime::gmtNow();
    $subscription->save();

    // 3. Determine cancellation reason
    $reason = '';
    if ($subscription->bill_times > 0 && 
        ($subscription->bill_count == $subscription->bill_times)) {
        $reason = 'billing cycle completed';
    }

    // 4. Trigger cancellation events
    do_action('fluent_cart/payments/subscription_canceled', $subscription->id, $order->id, $reason);
    do_action('fluent_cart/payments/subscription_canceled_stripe', $subscription->id, $order->id, $reason);

    // 5. Log the event
    fluent_cart_add_log('Stripe webhook ' . $event->type . ' processed', $event, 'info', [
        'log_type' => 'webhook',
        'module_type' => 'FluentCart\App\Modules\Subscriptions\Modules\Stripe',
        'module_name' => 'Stripe',
        'module_id' => $order->id ?: null,
    ]);
}
```

### Payment Intent vs Setup Intent

#### When Each is Used

**Payment Intent:**
- Used when subscription has an immediate charge
- Contains `latest_invoice.payment_intent.client_secret`
- Requires payment confirmation on frontend
- Used for subscriptions with no trial period or setup fees

**Setup Intent:**
- Used when subscription has no immediate charge
- Contains `pending_setup_intent.client_secret`
- Requires setup confirmation on frontend
- Used for subscriptions with trial periods or future billing

#### Frontend Handling

The frontend automatically detects the intent type:

```javascript
// Determine intent type from subscription response
if (remoteResponse?.response?.object === 'subscription') {
    intentType = remoteResponse?.payment_args?.vendor_subscription_info?.type; // 'setup' or 'payment'
    clientSecret = remoteResponse?.payment_args?.vendor_subscription_info?.clientSecret;
}

// Choose appropriate confirmation method
const confirmIntent = intentType === "setup" ? stripe.confirmSetup : stripe.confirmPayment;
const accessor = intentType === "setup" ? 'setupIntent' : 'paymentIntent';
```

### Trial Periods and Billing Cycles

#### Trial Period Handling

Trial periods are configured in the subscription data:

```php
// Add trial period if specified
if ($trialEnd = Arr::get($subscriptionArgs, 'trial_end', false)) {
    $subscriptionData['trial_end'] = $trialEnd;
}
```

#### Billing Cycle Management

The system tracks billing cycles and calculates next billing dates:

```php
// Calculate next billing date from Stripe response
$nextBillingDate = Arr::get($response, 'current_period_end') ?? null;
if ($nextBillingDate) {
    $nextBillingDate = DateTime::anyTimeToGmt($nextBillingDate);
}
```

### Error Handling

#### Common Error Scenarios

**Subscription Module Not Found:**
```php
if (!(new Stripe())->hasSubscriptionModule()) {
    $this->sendError(__('Please activate subscription module to get payment!', 'fluent-cart'));
}
```

**Subscription Creation Failed:**
```php
if (is_wp_error($subscription)) {
    wp_send_json_error([
        'message' => $subscription->get_error_message()
    ], 423);
}
```

**Payment Confirmation Failed:**
```javascript
if (result?.error) {
    window.location.href = `${successUrl}&status=failed&reason=${result?.error?.message}`;
}
```

### Security Considerations

- **Customer Verification**: Stripe customer is created/verified for each subscription
- **Payment Method Security**: Payment methods are securely stored by Stripe
- **Webhook Verification**: All webhook events are verified for authenticity
- **Metadata Validation**: Order references are validated in payment metadata
- **Setup Intent Security**: Setup intents ensure secure future payment collection

### Configuration

#### Required Settings

- **Stripe API Keys**: Live/Test secret and publishable keys
- **Webhook Configuration**: Subscription events enabled
- **Subscription Module**: FluentCart subscription module activated
- **Payment Mode**: Onsite checkout mode for subscription handling

#### Webhook Events

Required webhook events for subscription management:
- `customer.subscription.updated` - Subscription status changes
- `customer.subscription.deleted` - Subscription cancellations
- `invoice.paid` - Successful billing
- `invoice.payment_failed` - Failed billing

### Testing Subscriptions

#### Test Scenarios

1. **Trial Subscription**: Create subscription with trial period
2. **Immediate Billing**: Create subscription with immediate charge
3. **Setup Intent**: Test subscription requiring setup intent
4. **Payment Intent**: Test subscription with immediate payment
5. **Webhook Events**: Test subscription status changes via webhooks
6. **Cancellation**: Test subscription cancellation flow

#### Test Data

- Use Stripe test mode and test API keys
- Use test card numbers for payment methods
- Test with various billing intervals (monthly, yearly)
- Verify webhook delivery and processing
- Check subscription status transitions

### Key Differences from One-Time Payments

1. **Customer Requirement**: Subscriptions always require a Stripe customer
2. **Intent Types**: Uses both payment intents and setup intents
3. **Webhook Events**: Additional subscription-specific webhook events
4. **Status Management**: Complex subscription status tracking
5. **Billing Cycles**: Ongoing billing cycle management
6. **Trial Periods**: Support for trial periods and delayed billing

This completes the comprehensive documentation for Stripe subscription payment processing, covering the complete flow from checkout to ongoing subscription management.
