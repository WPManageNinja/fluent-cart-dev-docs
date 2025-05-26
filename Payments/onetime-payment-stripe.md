## Onetime Payment - Stripe
Here is the onetime payment flow and what happens when we place an order using Stripe and PayPal.

### Stripe

The Stripe one-time payment flow involves several key steps from cart checkout to order completion. The main entry point is the `makePayment` method in the `Stripe.php` class.

#### Payment Flow Overview

1. **Order Creation**: Customer proceeds to checkout, order is created with `ORDER_ON_HOLD` status
2. **Payment Processing**: Stripe payment method is selected and processed
3. **Payment Confirmation**: Payment is confirmed via webhooks or direct API responses
4. **Order Completion**: Order status is updated to `ORDER_PROCESSING` or `ORDER_COMPLETED`

#### Key Components

- **Main Class**: `app/Modules/PaymentMethods/Stripe/Stripe.php`
- **Payment Method**: `makePayment()` - Main entry point for processing payments
- **API Handler**: `app/Modules/PaymentMethods/Stripe/API/API.php`
- **Webhook Handler**: `app/Modules/PaymentMethods/Stripe/IPN.php`
- **Frontend**: `resources/public/payment-methods/stripe-checkout.js`

## 1. Initiate & prepare payment data:

The `makePayment($orderHelper)` method in `Stripe.php` handles the core payment processing:

There are several steps :
  1. Resolve order hash and get Stripe settings
  2. Get transaction and validate
  3. Prepare payment arguments
  4. Handle the oneSite payment actions for onetime

```php
public function makePayment($orderHelper)
{
    // 1. Resolve order hash and get Stripe settings
    $hash = $this->resolveOrderHash($orderHelper);
    $stripeSettings = new StripeSettings();
    $publicKey = $stripeSettings->getPublicKey();
    $apiKey = $stripeSettings->getApiKey();

    // 2. Get transaction and validate
    $transaction = $orderHelper->transactions->first();
    if (!$transaction) {
        throw new \Exception(__('Transaction not found!', 'fluent-cart'));
    }

    // 3. Prepare payment arguments
    $paymentArgs = [
        'amount' => (int)round($this->getPayableAmount($orderHelper->order)),
        'currency' => strtolower($orderHelper->order->currency),
        // ... other payment data
    ];

    // 4. Handle the oneSite payment actions for onetime
    ....
    if (empty($orderHelper->subscriptionItems)) {
        // Handle one-time payment onsite
        $this->handleOnsitePaymentOnetime($orderHelper, $paymentArgs, $apiKey);
    }
    ...
}
```

## 2. Create Payment intent and customer for checkout

### 1. Onsite Payment (`handleOnsitePaymentOnetime`)

For onsite payments, the system creates a Stripe Payment Intent:

- **Payment Intent Creation**: Creates a payment intent with customer and order metadata
- **Customer Creation**: Creates or retrieves Stripe customer using customer email
- **Application Fee**: Adds 1.9% application fee for free version users
- **Frontend Integration**: Returns payment intent data to frontend for card processing through stripe clientJS


##### 2. Hosted Payment (`handleHostedPayment`)

NB: it's only used when admin creates custom link for stripe custom pay amount through order dashboard.
For hosted checkout, the system creates a Stripe Checkout Session:

- **Checkout Session**: Creates a Stripe Checkout session
- **Redirect**: Redirects customer to Stripe's hosted checkout page
- **Return Handling**: Handles customer return after payment

## 3. Charge the intent through client js of stripe

The frontend JavaScript (`stripe-checkout.js`) handles:

**Frontend Flow:**
1. Initialize Stripe with public key
2. Create payment elements
3. Mount payment form
4. Handle form submission
5. Confirm payment with Stripe
6. Handle success/error responses

## 4. Confirm the payment and update the order
- Catch the `confirmPayment` method to trigger the payment confirmation AJAX
- Validate the payment through the API
- Update the transaction and order for the successful payment
- Return the success response with the success URL

After a successful payment is processed, the payment modal closes and triggers the `elements.submit()` method as a callback. 
which will call the `confirmPayment` method of stripe client js.
An AJAX request is then made to confirm the payment and update the order.


```javascript
class StripeCheckout {
    ...
async init() {
    ...
    ...
  paymentElement.on('ready', function(event) {
    ...
    window.addEventListener("fluent_cart_payment_next_action_stripe", (e) => {
        ...
        ...
        clientSecret = remoteResponse?.response?.client_secret;
        ...
        elements.submit().then(result => {
            // prepare the intent data
            ...
            confirmIntent(confirmData).then((result) => {
                that.paymentLoader?.changeLoaderStatus('confirming');
                const intentId = result[accessor]?.id;

                if (intentId) {
                    that.paymentLoader?.changeLoaderStatus('completed');

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
                            // manage the success actions
                        })
                        .catch(() => {
                            console.log('Request failed');
                        });
                } else if (result?.error) {
                    window.location.href = `${successUrl}&status=failed&reason=${result?.error?.message}`;
                }
            });
        }).catch(error => {
            // handle error
        });
    });
 });
}
}
```
#### Backend Payment Confirmation
  confirmStripePayment Method accept the intentId to validate through stripe api and update when payment is confirmed.

```php
 add_action('wp_ajax_fluent_cart_confirm_stripe_payment', [$this, 'confirmStripePayment']);

public function confirmStripePayment()
{
    ...
    $intentId = $_REQUEST['intentId'];
    ...
    // 1. validate payement using intentId through stripe api
    $path = 'payment_intents/' . $intentId;
    $api = new API();
    $response = $api->makeRequest($path, [], (new StripeSettings())->getApiKey());
    ...
    // 2. update the transaction
    $transaction = OrderTransaction::query()->where('vendor_charge_id', Arr::get($response, 'id'))->first();
    ...
    ...
    ...
    // 3. update the order
    $this->updateOrderDataByOrder($order, $updateData, $transaction);
}
```

After the confirmation is done the frontend will redirect to the success page.


## Webhook Processing (Optional for onetime)

Stripe sends webhooks to confirm payment status. The webhook handler (`IPN.php`) processes these events:

**Main Webhook Events:**
- `invoice.paid` - Payment successfully completed
- `charge.refunded` - Payment refunded
- `invoice.created` - Invoice created

**Webhook Flow:**
1. **Verification**: Verify webhook authenticity via Stripe API
2. **Event Processing**: Extract event data and find related order
3. **Order Update**: Update order and transaction status
4. **Status Transition**: Trigger order status change events

```php
public function handleInvoicePaid($event, $order)
{
    // Extract payment intent from webhook
    $paymentIntent = sanitize_text_field(Arr::get($eventObject, 'payment_intent'));
    $transaction = OrderTransaction::query()->where('vendor_charge_id', $paymentIntent)->first();

    // Update order data
    $updateData = [
        'vendor_charge_id' => $paymentIntent
    ];

    $this->stripe->updateOrderDataByOrder($order, $updateData, $transaction);
}
```

#### Order Status Updates

When payment is confirmed, the order goes through status transitions:

1. **Initial**: `ORDER_ON_HOLD` (when order is created)
2. **Processing**: `ORDER_PROCESSING` (when payment is confirmed)
3. **Completed**: `ORDER_COMPLETED` (for digital products or manual completion)

**Status Update Process:**
- Transaction status updated to `TRANSACTION_COMPLETED`
- Order payment status updated to `PAYMENT_PAID`
- Order status updated to `ORDER_PROCESSING`
- Events dispatched: `OrderPaid`, `OrderStatusUpdated`
- For digital products: Auto-complete to `ORDER_COMPLETED`


## Error Handling

**Common Error Scenarios:**
- **Invalid API Keys**: Stripe API authentication failures
- **Insufficient Funds**: Customer card declined
- **Network Issues**: API communication failures
- **Webhook Failures**: Webhook verification or processing errors

**Error Response Format:**
```php
wp_send_json_error([
    'status' => 'failed',
    'message' => $errorMessage
], 423);
```

### Security Considerations

- **API Key Management**: Secure storage of Stripe API keys
- **Webhook Verification**: Verify webhook authenticity
- **Data Sanitization**: Sanitize all input data
- **PCI Compliance**: Card data never touches server (handled by Stripe)

### Logging

The system logs important events:
- Payment intent creation
- Webhook processing
- Error conditions
- Order status changes

**Log Types:**
- `api` - API interactions
- `webhook` - Webhook processing
- `error` - Error conditions
- `info` - General information

### Configuration

Stripe payment method configuration includes:
- **API Keys**: Live/Test secret and publishable keys
- **Checkout Mode**: Onsite vs Hosted
- **Webhook URL**: For receiving payment confirmations
- **Currency Settings**: Supported currencies

## Testing

For testing Stripe payments:
1. Use Stripe test API keys
2. Use test card numbers (4242424242424242)
3. Monitor webhook events in Stripe dashboard
4. Check order status transitions in admin

This completes the one-time payment flow documentation for Stripe integration.


