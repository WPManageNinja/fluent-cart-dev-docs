## Onetime Payment - PayPal

This document covers the PayPal one-time payment flow and what happens when customers place an order using PayPal. The main entry point is the `makePayment` method in the `PayPal.php` class.

## PayPal Payment Flow Overview

1. **Order Creation**: Customer proceeds to checkout, order is created with `ORDER_ON_HOLD` status
2. **Payment Processing**: PayPal payment method is selected and processed
3. **Payment Confirmation**: Payment is confirmed via webhooks
4. **Order Completion**: Order status is updated to `ORDER_PROCESSING` or `ORDER_COMPLETED`

### Key Components

- **Main Class**: `app/Modules/PaymentMethods/PayPal/PayPal.php`
- **Payment Method**: `makePayment()` - Main entry point for processing payments
- **Payment Handler**: `app/Modules/PaymentMethods/PayPal/PayPalHandler.php`
- **API Handler**: `app/Modules/PaymentMethods/PayPal/API/API.php`
- **Webhook Handler**: `app/Modules/PaymentMethods/PayPal/API/Webhook.php`
- **Frontend**: `resources/public/payment-methods/paypal-checkout.js`

## 1. Initiate Payment

PayPal payment method initiated by the event triggered from frontend paypal-checkout.js. When PayPal button is clicked  `onClick` function is called as callback to place the order and return orderData to the `createOrder` function to create vendor order in PayPal.

`createOrder` and `onClick` methods are as followed:


```javascript
async onetimePaymentHandler(ref, paymentData, orderData, paypalButtonContainer) {
    const that = this;
    const buttons = paypal.Buttons({
        ....
        createOrder: (data, actions) => {
            that.paymentLoader?.changeLoaderStatus('processing');
            return actions.order.create({
                purchase_units: [orderData.data.response]
            });
        },
        onClick: async function(data, actions) {
            if (typeof ref.orderHandler === 'function') {
                let response = await ref.orderHandler();
                if (!response) {
                    that.paymentLoader?.changeLoaderStatus('Order creation failed');
                    that.paymentLoader?.hideLoader();
                    return actions.reject();
                }
                orderData = response;
            } else {
                that.paymentLoader?.changeLoaderStatus('Not proper order handler');
                that.paymentLoader?.hideLoader();
                return actions.reject();
            }}
        });
    .......
}
```

## 2. Place Order and trigger the payment action

When onClick event triggered the FluentCart order creation (<a href="../CoreDocs/checkout-flow" target="_blank">Checkout Flow</a>) starts. 
After completing the checkout flow we process payment through the `makePayment` method.

The `makePayment($orderHelper)` method in `PayPal.php` handles the core payment processing:

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

### PayPalHandler Payment Processing

The `PayPalHandler` class manages the actual payment flow:

```php
public function handlePayment(OrderHelper $orderHelper)
{
    $paypalSettings = new PayPalSettings();
    .......
    // Handle one-time payments for PayPal Pro or custom pages
    if (Arr::get($paypalSettings->settings, 'checkout_mode') === 'paypal_pro' || 
        $orderHelper->paymentFrom === 'custom_page') {
        $this->handleOneTimePayment($orderHelper, $paypalSettings);
    }
    ......
}
```

## 3. Prepare payment data for PayPal sdk

**Modern PayPal JavaScript SDK integration:**
- Payment processed on merchant's site using PayPal SDK
- Better user experience (no redirect)
- Real-time payment confirmation
- Uses PayPal's REST API

**Key Steps:**
1. Format order items for PayPal API
2. Create PayPal order via JavaScript SDK
3. Handle payment approval and capture
4. Confirm payment via AJAX call

For PayPal Pro payments, the system formats items for the JavaScript SDK:

```php
public function handleOneTimePayment($orderHelper, $paypalSettings)
{
    $order = $orderHelper->order;
    $orderItems = $order->order_items->toArray();
    $formattedItems = [];
    $total = 0;

    foreach ($orderItems as $item) {
        $itemTotal = Helper::toDecimal(Arr::get($item, 'line_total'), false, $currency, true, true, false);
        $total += $itemTotal;
        
        $formattedItems[] = [
            'name' => Arr::get($item, 'title', 'item'),
            'unit_amount' => [
                'currency_code' => $currency,
                'value' => $itemTotal,
            ],
            'quantity' => 1,
        ];
    }

    $orderHelper->paypalProData = [
        'items' => $formattedItems,
        'total' => $total,
        'currency' => $currency
    ];
}
```

## 4. Frontend Integration

The frontend JavaScript (`paypal-checkout.js`) handles PayPal Pro payments through the `createOrder` method, where the returned data is passed as purchase_unit:

Returned data:
```php
[
    'items'     => $formattedItems,
    'total'     => $total,
    'currency'  => $currency
]
```
Frontend JS to create the PayPal order:
```javascript
async onetimePaymentHandler(ref, paymentData, orderData, paypalButtonContainer) {
    ...
    createOrder: (data, actions) => {
        // Create PayPal order
        return actions.order.create({
            purchase_units: [orderData.data.response]
        });
    },
    ...
}
```

## 5. Manage payment success or failed

After a successful payment is processed, the payment modal closes and triggers the onApprove method as a callback.

Which will trigger the AJAX action `fluent_cart_confirm_paypal_payment` to call the `confirmPayPalPayment` method in `PayPal.php` to confirm and update the order.
Steps:
1. Trigger the AJAX request to confirm the payment
2. Confirm the payment and update the order
3. Redirect to the success page

#### 1. Trigger the AJAX request to confirm the payment (`paypal-checkout.js`)
```javascript
async onetimePaymentHandler(ref, paymentData, orderData, paypalButtonContainer) {
    ....
    onApprove: (data, actions) => {
        that.paymentLoader?.changeLoaderStatus('confirming');
        return actions.order.capture().then((details) => {
            if (details.id) {
                that.paymentLoader?.changeLoaderStatus('completed');
                const params = new URLSearchParams({
                    action: 'fluent_cart_confirm_paypal_payment',
                    payId: details.id,
                    ref_id: orderData?.data?.data?.transaction.uuid ? orderData?.data?.data?.transaction.uuid : 'uuid not found'
                });
                    
                fetch(window.fluentcart_checkout_vars.ajaxurl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: params.toString()
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Network response was not ok');
                    }
                })
                .then(res => {
                    // redirect to the success page
                })
                .catch(error => {
                    // handle error
                });
            }
        });
    },
    ...
```

#### 2. Confirm the payment and update the order
- verify the payment through the API
- update the transaction and order for the successful payment
- return the success response with the success URL

```php
public function confirmPayPalPayment()
{
    // verify the payment through the API 
    $payment_intent = (new API())->verifyPayment($payId);
    .....
    .....
    // update the transaction and order for the successful payment
    if (isset($payment_intent["status"]) && $payment_intent["status"] == "COMPLETED") {
        $totalAmount = Helper::toCent(Arr::get($payment_intent, 'purchase_units.0.payments.captures.0.amount.value', 0));
        $transactionData = [
            'status'           => Status::TRANSACTION_COMPLETED,
            'vendor_charge_id' => Arr::get($payment_intent, 'purchase_units.0.payments.captures.0.id', $payId),
            'total'            => $totalAmount,
            'payment_method'   => $this->slug,
            'payment_mode'     => $order->mode
        ];
        .....
        .....
        $this->updateOrderDataByOrder($order, $transactionData, $transaction);
        wp_send_json_success([
            'status'      => 'success',
            'success_url' => $paymentHelper->successUrl($transaction->uuid, []),
            'message'     => __('Payment update successfully!', 'fluent-cart')
        ], 200);
    } else {
        wp_send_json_error([
            'status'      => 'failed',
            'success_url' => $paymentHelper->successUrl($transaction->uuid, []),
            'message'     => __('Payment not completed!', 'fluent-cart')
        ], 423);
    }

}
```

After the payment is confirmed, the order status is updated to `ORDER_PROCESSING` and the payment status is updated to `PAYMENT_PAID`. For digital products, the order status is automatically updated to `ORDER_COMPLETED`.
And payment paid event is triggered for other actions. Finally, paypal-checkout.js redirect to the success page.

## Webhook Processing (optional for onetime)

For PayPal Pro payments, the system also supports modern webhook notifications:

#### Webhook Events that we are using

```php
const EVENTS = [
    [ "name" => "PAYMENT.SALE.COMPLETED" ],
    [ "name" => "PAYMENT.SALE.REFUNDED" ],
    [ "name" => "PAYMENT.CAPTURE.REFUNDED" ], // one time payment refund
    [ "name" => "BILLING.SUBSCRIPTION.CREATED" ],
    [ "name" => "BILLING.SUBSCRIPTION.ACTIVATED" ],
    [ "name" => "BILLING.SUBSCRIPTION.SUSPENDED" ],
    [ "name" => "BILLING.SUBSCRIPTION.CANCELLED" ],
    [ "name" => "BILLING.SUBSCRIPTION.EXPIRED" ]
];
```

#### Webhook Processing Flow

```php
public function processWebhook()
{
    // 1. Parse webhook data
    $post_data = file_get_contents('php://input');
    $data = json_decode($post_data, true);
    $eventType = Arr::get($data, 'event_type', '');

    // 2. Verify webhook authenticity
    $webhookId = Arr::get($paymentSettings, $mode . '_webhook_id', '');
    if ($this->verifyWebhook($webhookId)) {
        // 3. Process webhook events
        do_action('fluent_cart/payments/process_paypal_webhooks', $data);
        exit(200);
    } else {
        // Log verification failure
        fluent_cart_add_log('PayPal webhook verification failed', $data, 'error');
        exit(400);
    }
}
```

### Order Status Updates

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

## Error Handling and Other Considerations

**Common Error Scenarios:**
- **Invalid PayPal Credentials**: API authentication failures
- **Currency Not Supported**: PayPal doesn't support the store currency
- **IPN Verification Failed**: IPN authenticity verification fails
- **Order Not Found**: Order UUID not found in IPN data
- **Network Issues**: API communication failures

**Error Response Format:**
```php
wp_send_json_error([
    'status' => 'failed',
    'message' => $errorMessage
], 423);
```

### Security Considerations

- **Webhook Verification**: Verify webhook signatures for PayPal Pro
- **Data Sanitization**: Sanitize all input data from PayPal
- **Order Validation**: Validate order exists and belongs to customer
- **Amount Verification**: Verify payment amount matches order total

### Logging

The system logs important events:
- IPN/Webhook reception and processing
- Payment confirmations
- Error conditions
- Order status changes

**Log Types:**
- `webhook` - Webhook processing
- `error` - Error conditions
- `info` - General information

### Configuration

PayPal payment method configuration includes:

#### PayPal Pro Settings:
- **Client ID**: PayPal REST API client ID
- **Client Secret**: PayPal REST API client secret
- **Webhook Configuration**: Webhook URL and events

### Currency Support

PayPal supports multiple currencies, but the system checks currency compatibility:

```php
public function checkCurrencySupport()
{
    $currency = CurrencySettings::get('currency');
    $supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']; // etc.
    
    if (!in_array($currency, $supportedCurrencies)) {
        throw new \Exception(__('Currency not supported by PayPal', 'fluent-cart'));
    }
}
```

### Testing

For testing PayPal payments:

1. Use PayPal sandbox app credentials
2. Set payment mode to 'test'
3. Use test credit card numbers
4. Monitor webhook events in PayPal developer dashboard

### API Integration

PayPal Pro uses REST API for modern integration:

```php
public static function makeRequest($path, $version = 'v1', $method = 'POST', $args = [], $mode = '')
{
    // 1. Get access token
    $accessToken = self::getAccessToken($mode);
    
    // 2. Prepare headers
    $headers = array(
        "Authorization" => "Bearer " . $accessToken,
        "Content-Type" => "application/json",
        "Accept" => "application/json" 
    );

    // 3. Make API request
    $response = wp_safe_remote_request($paypal_api_url, [
        'headers' => $headers,
        'method'  => $method,
        'body'    => json_encode($args)
    ]);

    // 4. Handle response
    $http_code = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);
    
    if ($http_code > 299) {
        return new \WP_Error($http_code, $body['message'], $body);
    }
    
    return $body;
}
```

This completes the one-time payment flow documentation for PayPal integration, covering PayPal Pro payment methods.
