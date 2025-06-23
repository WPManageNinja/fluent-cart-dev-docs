# PayPal Subscription Payment Flow

This document provides a comprehensive guide to implementing PayPal subscription payments in FluentCart. It covers the complete flow from checkout to ongoing subscription management, including plan creation, webhook handling, and status management.

## Overview

PayPal subscription payments follow a specialized flow that differs from one-time payments. The process involves creating PayPal plans, managing subscription objects, and handling complex billing cycles including trials and signup fees.

### Key Differences from One-Time Payments

1. **Plan Requirement**: PayPal requires pre-created plans for subscriptions
2. **Billing Cycles**: Complex billing cycle configuration with multiple phases
3. **SDK Integration**: Uses PayPal JavaScript SDK instead of Elements
4. **Webhook Events**: Different event types and data structures
5. **Trial Handling**: Trial periods are part of billing cycle configuration
6. **Signup Fees**: Handled as separate billing cycles, not add-on charges

---

## Architecture Overview

### Core Components

- **Main Entry Point**: `app/Modules/PaymentMethods/PayPal/PayPal.php` - `makePayment()` method
- **Payment Handler**: `app/Modules/PaymentMethods/PayPal/PayPalHandler.php` - `handleSubscriptionPayment()` method
- **Subscription Handler**: `app/Modules/Subscriptions/Modules/PayPal/Subscriptions.php` - `handleOnsiteSubscription()` method
- **Plan Management**: `app/Modules/Subscriptions/Modules/PayPal/Plan.php`
- **API Handler**: `app/Modules/PaymentMethods/PayPal/API/API.php`
- **Webhook Handler**: `app/Modules/Subscriptions/Modules/PayPal/RemoteEventsListener.php`
- **Frontend**: `resources/public/payment-methods/paypal-checkout.js`

### Flow Overview

1. **Order Creation**: Customer proceeds to checkout with subscription items
2. **Subscription Processing**: PayPal subscription method is selected and processed
3. **Plan Creation**: PayPal subscription plan is created or retrieved
4. **Subscription Creation**: PayPal subscription is created via JavaScript SDK
5. **Payment Confirmation**: Payment is confirmed via frontend JavaScript and backend verification
6. **Order Completion**: Order status is updated and subscription is activated

---

## Step 1: Payment Initiation

The subscription flow starts with the same `makePayment` method but routes to specialized PayPal handlers.

### Main Entry Point

```php
public function makePayment($orderHelper)
{
    // 1. Check currency support
    $this->checkCurrencySupport();

    try {
        // 2. Delegate to PayPalHandler for actual processing
        return (new PayPalHandler())->handlePayment($orderHelper);
    } catch (\Exception $e) {
        wp_send_json_error([
            'status'  => 'failed',
            'message' => $e->getMessage()
        ], 423);
    }
}
```

### PayPalHandler Subscription Routing

The `PayPalHandler` class routes subscription payments:

```php
public function handlePayment(OrderHelper $orderHelper)
{
    $paypalSettings = new PayPalSettings();
    
    // 1. Handle subscription payments if present
    if (!empty($orderHelper->subscriptionItems)) {
       $this->handleSubscriptionPayment($orderHelper, $paypalSettings);
    }
}
```

### Subscription Payment Routing

Routes subscription payments based on checkout mode:

```php
public function handleSubscriptionPayment($orderHelper, $paypalSettings)
{
    // Handle onsite subscription payment (PayPal Pro), by default we use 'paypal_pro'
     if (Arr::get($paypalSettings->settings, 'checkout_mode') === 'paypal_pro' || $orderHelper->paymentFrom === 'custom_page') {
        $this->handleOneTimePayment($orderHelper, $paypalSettings);
    }
}
```

### Main Subscription Processing

```php
public function handleOnsiteSubscription($orderHelper): void
{
    // 1. Validate subscription items exist
    if (empty($orderHelper->subscriptionItems)) return;

    // 2. Process and get subscription arguments
    $subscriptionArgs = $this->processAndGetSubscriptionArgs($orderHelper);

    // 3. Return success response with subscription data
    wp_send_json_success([
        'nextAction' => 'paypal',
        'actionName' => 'custom',
        'status' => 'success',
        'message' => __('Order has been placed successfully', 'fluent-cart'),
        'data' => $orderHelper,
        'response' => $subscriptionArgs
    ], 200);
}
```

---

## Step 2: PayPal Plan Creation

PayPal requires pre-created plans for subscriptions. The plan creation process handles complex billing cycles including trials and sign-up fees.

### Plan Creation Process

The `processAndGetSubscriptionArgs` method triggers plan creation:

```php
public function processAndGetSubscriptionArgs($orderHelper)
{
   return $this->processArgs([], $orderHelper);
}
```

### Core Plan Creation Logic

```php
public static function getOrCreatePlan($orderHelper)
{
    // 1. Extract subscription and order data
    $subscription = $orderHelper->subscriptionItems[0];
    $order = $orderHelper->order;
    $onetimeItems = $orderHelper->items;

    // 2. Process one-time items (signup fees, etc.)
    list($onetimePayment, $oneTimeItem, $oneTimeType) = self::processOnetimeItems($onetimeItems);

    // 3. Handle signup fee if present
    if ($onetimePayment && $oneTimeType === 'signup_fee') {
        self::processSignupFee($oneTimeItem, $order, $subscription);
    }

    // 4. Normalize recurring amount
    self::normalizeRecurringAmount($subscription, $order);

    // 5. Generate plan string identifier
    $vendorSubsPlanId = static::makePlanString($subscription, $order, $oneTimeItem);

    // 6. Check if plan already exists in PayPal
    if ($response = static::getOrCreatePlanId($vendorSubsPlanId)) {
        return $response;
    }

    // 7. Create new plan components
    $catalogProductId = static::getCatalogProductId($subscription, $order);
    $billingCycles = self::createBillingCycles($subscription, $order, $onetimePayment, $oneTimeItem, $oneTimeType);
    $paymentPreference = self::createPaymentPreference($onetimePayment, $oneTimeType, $order, $oneTimeItem);

    // 8. Build plan data
    $plan = self::buildPlanData($catalogProductId, $vendorSubsPlanId, $billingCycles, $paymentPreference);

    // 9. Create plan via PayPal API
    return self::create($plan, $vendorSubsPlanId, $order->id);
}
```

### Billing Cycles Creation

PayPal plans support complex billing cycles with trials, signup fees, and regular billing:

```php
public static function createBillingCycles($subscription, $order, $onetimePayment, $oneTimeItem, $oneTimeType)
{
    $billingCycles = [];
    $sequence = 1;

    // 1. Add trial period if specified
    $trialDays = Arr::get($subscription, 'trial_days', 0);
    if ($trialDays > 0) {
        $freeTrialCycle = [
            'frequency' => [
                'interval_unit' => 'DAY',
                'interval_count' => $trialDays,
            ],
            'tenure_type' => 'TRIAL',
            'sequence' => $sequence++,
            'total_cycles' => 1,
        ];
        $billingCycles[] = $freeTrialCycle;
    }

    // 2. Add signup fee cycle if present
    if ($onetimePayment && $oneTimeType === 'signup_fee') {
        $signupFeeCycle = [
            'frequency' => [
                'interval_unit' => self::getIntervalUnit($subscription),
                'interval_count' => 1,
            ],
            'tenure_type' => 'REGULAR',
            'sequence' => $sequence++,
            'total_cycles' => 1,
            'pricing_scheme' => [
                'fixed_price' => [
                    'value' => Helper::toDecimal($onetimePayment, false, $order->currency, true, true, false),
                    'currency_code' => strtoupper($order->currency)
                ]
            ]
        ];
        $billingCycles[] = $signupFeeCycle;
    }

    // 3. Add regular billing cycle
    $billTimes = Arr::get($subscription, 'bill_times', 0);
    $regularCycle = [
        'frequency' => [
            'interval_unit' => self::getIntervalUnit($subscription),
            'interval_count' => self::getIntervalCount($subscription),
        ],
        'tenure_type' => 'REGULAR',
        'sequence' => $sequence,
        'total_cycles' => $billTimes > 0 ? $billTimes : 0, // 0 means infinite
        'pricing_scheme' => [
            'fixed_price' => [
                'value' => Helper::toDecimal(Arr::get($subscription, 'recurring_amount'), false, $order->currency, true, true, false),
                'currency_code' => strtoupper($order->currency)
            ]
        ]
    ];
    $billingCycles[] = $regularCycle;

    return $billingCycles;
}
```

### Plan Creation via API

```php
public static function create($plan, $vendorSubsPlanId, $orderId)
{
    try {
        // 1. Create plan via PayPal API
        $response = (new API())->makeRequest('billing/plans', 'v1', 'POST', $plan);
    } catch(\Exception $e) {
        return SubscriptionHelper::errorHandler('non_paypal', esc_html__('General Error', 'fluent-cart-subscriptions') . ': ' . $e->getMessage());
    }

    // 2. Handle API errors
    if ($response && is_wp_error($response)) {
        return SubscriptionHelper::errorHandler($response->get_error_code(), $response->get_error_message());
    }

    // 3. Store plan ID and return response
    if (Arr::get($response, 'id')) {
        fluent_cart_update_option('paypal_plan_' . $vendorSubsPlanId, Arr::get($response, 'id'));
        return [
            'planId' => Arr::get($response, 'id'),
            'status' => 'success'
        ];
    }

    return SubscriptionHelper::errorHandler('plan_creation_failed', __('Plan creation failed', 'fluent-cart'));
}
```

---

## Step 3: Frontend Subscription Handling

The frontend JavaScript handles subscription creation via PayPal SDK.

### JavaScript Subscription Payment

```javascript
// paypal-checkout.js - Subscription payment handler
async subscriptionPaymentHandler(ref, paymentData, orderData, paypalButtonContainer) {
    const that = this;

    // 1. Create PayPal subscription buttons
    const buttons = paypal.Buttons({
        style: {
            shape: 'pill',
            layout: 'vertical',
            label: 'paypal',
            size: 'responsive',
            disableMaxWidth: true
        },

        // 2. Create subscription when button is clicked
        createSubscription: function(data, actions) {
            return actions.subscription.create({
                'plan_id': orderData.data.response.planId
            });
        },

        // 3. Handle subscription approval
        onApprove: function(data, actions) {
            that.paymentLoader?.changeLoaderStatus('confirming');

            if (data.subscriptionID) {
                that.paymentLoader?.changeLoaderStatus('completed');

                // 4. Send confirmation to backend
                const params = new URLSearchParams({
                    action: 'fluent_cart_confirm_paypal_subscription',
                    order_id: data.orderID,
                    subscription_id: data.subscriptionID,
                    ref_id: orderData?.data?.data?.transaction.uuid,
                    order_item: orderData.data.data
                });

                // 5. Make AJAX request to confirm subscription
                const xhr = new XMLHttpRequest();
                xhr.open('POST', window.fluentcart_checkout_vars.ajaxurl, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const res = JSON.parse(xhr.responseText);
                            if (res.data.success_url) {
                                that.paymentLoader?.changeLoaderStatus('redirecting');
                                window.location.href = res.data.success_url;
                            }
                        } catch (error) {
                            console.error('An error occurred while parsing the response:', error);
                        }
                    } else {
                        console.error('Network response was not ok');
                    }
                };

                xhr.send(params.toString());
            } else {
                that.paymentLoader?.changeLoaderStatus('No Subscription ID');
                that.paymentLoader?.hideLoader();
            }
        },

        // 6. Handle errors
        onError: function(err) {
            console.error('PayPal subscription error:', err);
            that.paymentLoader?.hideLoader();
        }
    });

    // 7. Render buttons in container
    buttons.render(paypalButtonContainer);
}
```

---

## Step 4: Backend Subscription Confirmation

After successful subscription creation on the frontend, the backend confirmation process is triggered.

### Main Confirmation Method

```php
public function confirmPayPalSubscription()
{
    // 1. Validate required parameters
    if (empty($_REQUEST['subscription_id']) || empty($_REQUEST['ref_id'])) {
        wp_send_json_error([
            'status' => 'failed',
            'message' => __('No Subscription ID!', 'fluent-cart')
        ], 423);
    }

    // 2. Extract request data
    $subscriptionId = sanitize_text_field($_REQUEST['subscription_id']);
    $refId = sanitize_text_field($_REQUEST['ref_id']);
    $orderItem = Arr::get($_REQUEST, 'order_item', []);

    // 3. Find transaction and order
    $transaction = OrderTransaction::query()->where('uuid', $refId)->first();
    if (!$transaction) {
        wp_send_json_error([
            'status' => 'failed',
            'message' => __('Transaction not found!', 'fluent-cart')
        ], 423);
    }

    $orderId = $transaction->order_id;
    $paymentHelper = new PaymentHelper('paypal');

    // 4. Handle subscription upgrades (cancel old subscription)
    $newVendorId = $subscriptionId;
    $olderSubsChargeId = Arr::get($orderItem, 'activeSubscription.vendor_subscription_id');
    $oldOrderId = Arr::get($orderItem, 'activeSubscription.parent_order_id');

    if ($newVendorId && $olderSubsChargeId) {
        $olderPaymentMethod = Arr::get($orderItem, 'activeSubscription.current_payment_method');
        do_action('fluent_cart/payments/cancel_subscription_custom_'. $olderPaymentMethod,
                  $olderSubsChargeId, $oldOrderId,
                  Arr::get($orderItem, 'activeSubscription.id'), 'Upgrading License');
    }

    // 5. Find existing subscription
    $subscription = Subscription::query()->where('parent_order_id', $orderId)->first();

    // 6. Check if subscription is already active
    if ($subscription && $subscription->status == Status::SUBSCRIPTION_ACTIVE) {
       wp_send_json_success([
            'status' => 'success',
            'message' => __('Subscription is already active!', 'fluent-cart'),
            'success_url' => $paymentHelper->successUrl($transaction->uuid, []),
        ], 200);
    }

    // 7. Verify subscription with PayPal API
    try {
        $subscriptionInfo = (new API())->verifySubscription($subscriptionId);
    } catch (\Exception $e) {
        wp_send_json_error([
            'success' => 'false',
            'message' => $e->getMessage(),
        ], $e->getCode());
    }

    // 8. Handle API errors
    if (is_wp_error($subscriptionInfo)) {
        wp_send_json_error([
            'status' => 'failed',
            'message' => $subscriptionInfo->get_error_message(),
            'success_url' => $paymentHelper->successUrl($transaction->uuid, []),
        ], $subscriptionInfo->get_error_code());
    }

    // 9. Process successful verification
    if (Arr::get($subscriptionInfo, 'id')) {
        $this->processSubscriptionConfirmation($subscriptionInfo, $subscription, $transaction, $orderId, $paymentHelper);
    } else {
        wp_send_json_error([
            'status' => 'failed',
            'message' => __('Subscription cannot confirmed!', 'fluent-cart'),
            'success_url' => $paymentHelper->successUrl($transaction->uuid, []),
        ], 423);
    }
}
```

### Subscription Confirmation Processing

```php
private function processSubscriptionConfirmation($subscriptionInfo, $subscription, $transaction, $orderId, $paymentHelper)
{
    // 1. Extract subscription data from PayPal response
    $vendorSubscriptionId = Arr::get($subscriptionInfo, 'id');
    $vendorCustomerId = Arr::get($subscriptionInfo, 'subscriber.payer_id');
    $vendorPlanId = Arr::get($subscriptionInfo, 'plan_id');
    $status = $this->getCorrectSubscriptionStatus(Arr::get($subscriptionInfo, 'status'));

    // 2. Calculate next billing date
    $nextBillingDate = Arr::get($subscriptionInfo, 'billing_info.next_billing_time') ?? null;
    if (!empty($nextBillingDate)) {
        $nextBillingDate = DateTime::anyTimeToGmt($nextBillingDate);
    }

    // 3. Prepare subscription update data
    $updatedData = [
        'vendor_subscription_id' => $vendorSubscriptionId,
        'vendor_customer_id' => $vendorCustomerId,
        'vendor_plan_id' => $vendorPlanId,
        'status' => $status,
        'next_billing_date' => $nextBillingDate,
        'current_payment_method' => 'paypal',
    ];

    // 4. Update subscription record
    Subscription::query()->where('parent_order_id', $orderId)->update($updatedData);

    // 5. Update subscription meta with payment method info
    $vendorPaypalEmail = Arr::get($subscriptionInfo, 'subscriber.email_address');
    $paymentInfo = [
        'email' => $vendorPaypalEmail,
        'method' => 'paypal'
    ];

    SubscriptionMeta::updateOrCreate([
        'subscription_id' => $subscription->id,
        'meta_key' => 'active_payment_method'
    ], [
        'meta_value' => json_encode($paymentInfo)
    ]);

    // 6. Update order payment method
    $orderQuery = Order::query()->where('id', $orderId);
    $order = $orderQuery->first();
    if ($order->payment_method != 'paypal') {
        $orderQuery->update(['payment_method' => 'paypal']);
    }

    // 7. Update transaction with subscription ID
    $transactionQuery = OrderTransaction::query()->where('id', $transaction->id);
    if (!$transaction->subscription_id) {
        $transactionQuery->update(['subscription_id' => $subscription->id]);
    }

    // 8. Mark order as completed if applicable
    $this->maybeMarkOrderCompleted($subscription);

    // 9. Trigger subscription activation events
    $msg = 'Subscription has been activated!';
    if ($status == Status::SUBSCRIPTION_ACTIVE) {
        do_action('fluent_cart/payments/subscription_activated', $subscription->id, $order->id);
        do_action('fluent_cart/payments/subscription_activated_paypal', $subscription->id, $order->id);
    }

    // 10. Return success response
    wp_send_json_success([
        'status' => 'success',
        'message' => $msg,
        'success_url' => $paymentHelper->successUrl($transaction->uuid, []),
    ], 200);
}
```

---

## Subscription Status Management

### Status Mapping

PayPal subscription statuses are mapped to internal statuses:

```php
public function getCorrectSubscriptionStatus($paypalStatus)
{
    $statusMap = [
        'ACTIVE' => Status::SUBSCRIPTION_ACTIVE,
        'APPROVAL_PENDING' => Status::SUBSCRIPTION_PENDING,
        'APPROVED' => Status::SUBSCRIPTION_PENDING,
        'SUSPENDED' => Status::SUBSCRIPTION_SUSPENDED,
        'CANCELLED' => Status::SUBSCRIPTION_CANCELED,
        'EXPIRED' => Status::SUBSCRIPTION_EXPIRED
    ];

    return $statusMap[$paypalStatus] ?? Status::SUBSCRIPTION_PENDING;
}
```

---

## Webhook Event Handling

### Remote Event Listener

The `RemoteEventsListener` class handles subscription webhook events:

```php
public function register()
{
    add_action('fluent_cart/payments/paypal/webhook_billing_subscription_activated', [$this, 'handleSubscriptionActivated'], 10, 2);
    add_action('fluent_cart/payments/paypal/webhook_billing_subscription_cancelled', [$this, 'handleSubscriptionCancelled'], 10, 2);
    add_action('fluent_cart/payments/paypal/webhook_billing_subscription_suspended', [$this, 'handleSubscriptionSuspended'], 10, 2);
    add_action('fluent_cart/payments/paypal/webhook_billing_subscription_expired', [$this, 'handleSubscriptionExpired'], 10, 2);
    add_action('fluent_cart/payments/paypal/webhook_payment_sale_completed', [$this, 'handleRecurringPaymentReceived'], 10, 2);
}
```

### Subscription Activated Event

```php
public function handleSubscriptionActivated($data, $order)
{
    // 1. Extract subscription ID
    $vendorSubscriptionId = Arr::get($data, 'id');
    $subscription = Subscription::where('vendor_subscription_id', $vendorSubscriptionId)->first();

    if (!$subscription) {
        return;
    }

    // 2. Get subscription details from PayPal
    $response = (new API())::makeRequest('billing/subscriptions/' . $vendorSubscriptionId, 'v1', 'GET');
    $billingInfo = Arr::get($response, 'billing_info', []);

    // 3. Calculate next billing date
    $nextBillingDate = Arr::get($billingInfo, 'next_billing_time') ?? null;
    if (!empty($nextBillingDate)) {
        $dateTime = new DateTime($nextBillingDate);
        $nextBillingDate = $dateTime->format('Y-m-d H:i:s');
    }

    // 4. Update subscription status
    $updateSubscriptionData = [
        'status' => Status::SUBSCRIPTION_ACTIVE,
        'next_billing_date' => $nextBillingDate,
        'current_payment_method' => 'paypal',
    ];

    Subscriptions::updateSubscription($subscription->id, $updateSubscriptionData);

    // 5. Trigger activation events
    do_action('fluent_cart/payments/subscription_activated', $subscription->id, $order->id);
    do_action('fluent_cart/payments/subscription_activated_paypal', $subscription->id, $order->id);

    // 6. Log the event
    fluent_cart_add_log('PayPal webhook billing.subscription.activated processed', $data, 'info', [
        'log_type' => 'webhook',
        'module_type' => 'FluentCart\App\Modules\Subscriptions\Modules\PayPal',
        'module_name' => 'PayPal',
        'module_id' => $order->id ?: null,
    ]);
}
```

### Recurring Payment Received Event

```php
public function handleRecurringPaymentReceived($data, $order)
{
    // 1. Extract payment data
    $vendorSubscriptionId = Arr::get($data, 'billing_agreement_id');
    $amount = Arr::get($data, 'amount.total');
    $subscription = Subscription::where('vendor_subscription_id', $vendorSubscriptionId)->first();

    if (!$subscription) {
        return;
    }

    // 2. Check if this is a signup fee
    $isSignUpFee = (new Subscriptions())->checkIsSignupFee($subscription, $amount);
    $isSignUpFeeProcessed = (new Subscriptions())->checkIsSignupFeeProcessed($subscription, $amount);

    if ($isSignUpFee && !$isSignUpFeeProcessed) {
        // 3. Process signup fee
        $chargeId = Arr::get($data, 'id');
        (new Subscriptions())->processSignupFeeReceived($subscription, $amount, $chargeId);
    } else {
        // 4. Process regular recurring payment
        $this->handleWebhookRecurringPaymentReceived($data, $subscription);
    }

    // 5. Log the event
    fluent_cart_add_log('PayPal webhook payment.sale.completed processed', $data, 'info', [
        'log_type' => 'webhook',
        'module_type' => 'FluentCart\App\Modules\Subscriptions\Modules\PayPal',
        'module_name' => 'PayPal',
        'module_id' => $order->id ?: null,
    ]);
}
```

---

## Webhook Configuration

### Required Webhook Events

```php
const EVENTS = [
    [ "name" => "PAYMENT.SALE.COMPLETED" ],        // Recurring payments
    [ "name" => "PAYMENT.SALE.REFUNDED" ],         // Recurring payment refunds
    [ "name" => "BILLING.SUBSCRIPTION.CREATED" ],   // Subscription created
    [ "name" => "BILLING.SUBSCRIPTION.ACTIVATED" ], // Subscription activated
    [ "name" => "BILLING.SUBSCRIPTION.SUSPENDED" ], // Subscription suspended
    [ "name" => "BILLING.SUBSCRIPTION.CANCELLED" ], // Subscription cancelled
    [ "name" => "BILLING.SUBSCRIPTION.EXPIRED" ]    // Subscription expired
];
```

### Webhook URL

```php
public static function getWebhookURL(): string
{
    return site_url() . '/wp-json/fluent-cart/v2/webhook?fct_payment_listener=1&method=paypal';
}
```

---

## Error Handling

### Common Error Scenarios

**Subscription Module Not Found:**
```php
if (!(new PayPal())->hasSubscriptionModule()) {
    $this->sendError(__('Please activate subscription module to get payment!', 'fluent-cart'));
}
```

**Plan Creation Failed:**
```php
if ($response && is_wp_error($response)) {
    return SubscriptionHelper::errorHandler($response->get_error_code(), $response->get_error_message());
}
```

**Subscription Creation Failed:**
```javascript
onError: function(err) {
    console.error('PayPal subscription error:', err);
    that.paymentLoader?.hideLoader();
}
```

---

## Security Considerations

- **Plan Validation**: Plans are validated before subscription creation
- **Webhook Verification**: All webhook events are verified for authenticity
- **Subscription Validation**: Subscription IDs are validated against PayPal
- **Amount Verification**: Payment amounts are verified against plan amounts
- **Status Validation**: Only valid status transitions are processed

---

## Configuration

### Required Settings

- **PayPal API Credentials**: Client ID and Secret for API access
- **Webhook Configuration**: Subscription events enabled
- **Subscription Module**: FluentCart subscription module activated

### Plan Management

- **Plan Caching**: Plans are cached to avoid duplicate creation
- **Plan Naming**: Consistent plan naming convention
- **Billing Cycles**: Support for trial, signup fee, and regular cycles
- **Currency Support**: Multi-currency plan support

---

## Testing

### Test Scenarios

1. **Trial Subscription**: Create subscription with trial period
2. **Signup Fee**: Create subscription with signup fee
3. **Regular Billing**: Create subscription with regular billing
4. **Webhook Events**: Test subscription status changes via webhooks
5. **Plan Reuse**: Test plan caching and reuse
6. **Error Handling**: Test various error scenarios

### Test Data

- Use PayPal sandbox environment
- Test with various billing intervals (daily, weekly, monthly, yearly)
- Test with different trial periods and signup fees
- Verify webhook delivery and processing
- Check subscription status transitions

### PayPal-Specific Features

- **Catalog Products**: Plans are associated with catalog products
- **Billing Cycles**: Support for trial, regular, and one-time cycles
- **Payment Preferences**: Auto-billing and failure handling configuration
- **Plan Caching**: Efficient plan reuse to avoid API limits
- **Multi-Phase Billing**: Support for complex billing scenarios

This completes the comprehensive documentation for PayPal subscription payment processing, covering the complete flow from checkout to subscription confirmation and activation.
