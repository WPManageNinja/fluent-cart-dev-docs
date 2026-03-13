# Payments & Integrations

All hooks related to payment processing, payment gateway webhooks, third-party integrations, file storage drivers, and development logging. Many of these hooks provide [Order](/database/models/order), [Customer](/database/models/customer), and [OrderTransaction](/database/models/order-transaction) model instances.

## Payment Events

### <code> payment_{$paymentStatus} </code>
<details open>
<summary><code>fluent_cart/payment_{$paymentStatus}</code> &mdash; Fires after order creation when a transaction succeeds</summary>

**When it runs:**
This dynamic action fires during [Order](/database/models/order) finalization, after the transaction has been recorded and the payment status is determined. It only fires when the transaction status is one of the recognized success statuses (e.g. `paid`, `pending`). The `{$paymentStatus}` portion is replaced with the order's actual payment status.

**Parameters:**

- `$data` (array): [Order](/database/models/order), [Customer](/database/models/customer), and [OrderTransaction](/database/models/order-transaction) data
    ```php
    $data = [
        'order'       => $order,       // Order model instance
        'customer'    => $customer,    // Customer model (via $order->customer)
        'transaction' => $transaction, // Transaction model (via $order->latest_transaction)
    ];
    ```

**Source:** `api/Resource/OrderResource.php`

**Dynamic variants:**
- `fluent_cart/payment_paid` -- payment completed successfully
- `fluent_cart/payment_pending` -- payment is pending confirmation

**Usage:**
```php
add_action('fluent_cart/payment_paid', function ($data) {
    $order = $data['order'];
    $customer = $data['customer'];

    // Grant access after successful payment
    update_user_meta($customer->user_id, 'has_premium_access', true);

    fluent_cart_add_log(
        'Payment Received',
        'Order #' . $order->id . ' paid successfully.',
        'success'
    );
}, 10, 1);
```
</details>

### <code> payment_{$transactionType}_{$paymentStatus} </code>
<details>
<summary><code>fluent_cart/payment_{$transactionType}_{$paymentStatus}</code> &mdash; Fires after order creation with both transaction type and payment status</summary>

**When it runs:**
This dynamic action fires immediately after `fluent_cart/payment_{$paymentStatus}` during [Order](/database/models/order) finalization. It provides more granular filtering by combining the transaction type (e.g. `one_time`, `subscription`) with the payment status (e.g. `paid`, `pending`).

**Parameters:**

- `$data` (array): Order, customer, and transaction data
    ```php
    $data = [
        'order'       => $order,       // Order model instance
        'customer'    => $customer,    // Customer model (via $order->customer)
        'transaction' => $transaction, // Transaction model (via $order->latest_transaction)
    ];
    ```

**Source:** `api/Resource/OrderResource.php`

**Dynamic variants:**
- `fluent_cart/payment_one_time_paid` -- one-time purchase paid
- `fluent_cart/payment_subscription_paid` -- subscription payment paid
- `fluent_cart/payment_one_time_pending` -- one-time purchase pending
- `fluent_cart/payment_subscription_pending` -- subscription payment pending

**Usage:**
```php
add_action('fluent_cart/payment_subscription_paid', function ($data) {
    $order = $data['order'];
    $transaction = $data['transaction'];

    // Handle subscription-specific logic after payment
    fluent_cart_add_log(
        'Subscription Payment',
        'Subscription payment received for Order #' . $order->id,
        'success'
    );
}, 10, 1);
```
</details>

### <code> after_payment_{$paymentStatus} </code>
<details>
<summary><code>fluent_cart/payments/after_payment_{$paymentStatus}</code> &mdash; Fires in abstract gateway after payment processing completes</summary>

**When it runs:**
This dynamic action fires inside the abstract payment gateway base class after a payment has been processed, the [OrderTransaction](/database/models/order-transaction) recorded, and the [Order](/database/models/order) status updated. It runs after `changeOrderStatus()` and any automatic digital-product completion logic. The `{$paymentStatus}` is the resulting payment status (e.g. `paid`, `failed`).

**Parameters:**

- `$data` (array): The order that was just processed
    ```php
    $data = [
        'order' => $order, // Order model instance with updated status
    ];
    ```

**Source:** `app/Modules/PaymentMethods/Core/AbstractPaymentGateway.php`

**Usage:**
```php
add_action('fluent_cart/payments/after_payment_paid', function ($data) {
    $order = $data['order'];

    // Trigger external fulfillment after any gateway marks payment as paid
    wp_remote_post('https://fulfillment.example.com/api/orders', [
        'body' => wp_json_encode([
            'order_id' => $order->id,
            'total'    => $order->total_amount,
        ]),
    ]);
}, 10, 1);
```
</details>

### <code> payment_success </code>
<details>
<summary><code>fluent_cart/payment_success</code> &mdash; Fires when an Airwallex or Square payment succeeds</summary>

**When it runs:**
This action fires inside the Airwallex and Square gateway handlers when a payment intent or payment object is confirmed as successful. The order status is updated to `processing` and payment status to `paid` before this hook runs.

**Parameters:**

- `$data` (array): The order and payment intent/payment data
    ```php
    $data = [
        'order'          => $order,         // Order model with updated status
        'payment_intent' => $paymentIntent, // Gateway-specific payment intent or payment object (array)
    ];
    ```

**Source:** `app/Modules/PaymentMethods/AirwallexGateway/Airwallex.php`, `app/Modules/PaymentMethods/SquareGateway/Square.php`

**Usage:**
```php
add_action('fluent_cart/payment_success', function ($data) {
    $order = $data['order'];
    $paymentIntent = $data['payment_intent'];

    // Log the gateway-specific payment reference
    fluent_cart_add_log(
        'Gateway Payment Success',
        'Payment intent ' . $paymentIntent['id'] . ' for Order #' . $order->id,
        'success'
    );
}, 10, 1);
```
</details>

### <code> payment_failed </code>
<details>
<summary><code>fluent_cart/payment_failed</code> &mdash; Fires when an Airwallex payment fails</summary>

> **Note:** This hook is fired by multiple payment gateways with different parameter structures. See the gateway-specific documentation for exact parameters. The Airwallex variant passes `order` and `payment_intent`; the Mollie variant (Pro) passes `order`, `transaction`, `old_payment_status`, `new_payment_status`, and `reason`.

**When it runs:**
This action fires inside the Airwallex gateway handler when a payment intent is determined to have failed. The order status and payment status are both set to `failed` before this hook runs.

**Parameters:**

- `$data` (array): The order and failed payment intent data
    ```php
    $data = [
        'order'          => $order,         // Order model with failed status
        'payment_intent' => $paymentIntent, // Airwallex payment intent object (array)
    ];
    ```

**Source:** `app/Modules/PaymentMethods/AirwallexGateway/Airwallex.php`

**Usage:**
```php
add_action('fluent_cart/payment_failed', function ($data) {
    $order = $data['order'];
    $paymentIntent = $data['payment_intent'];

    // Notify admin about failed payment
    wp_mail(
        get_option('admin_email'),
        'Payment Failed - Order #' . $order->id,
        'Airwallex payment intent ' . $paymentIntent['id'] . ' failed.'
    );
}, 10, 1);
```
</details>

---

## Payment Gateway Registration

### <code> register_payment_methods </code>
<details>
<summary><code>fluent_cart/register_payment_methods</code> &mdash; Register custom payment gateways</summary>

**When it runs:**
This action fires during initialization after all built-in payment gateways (Stripe, PayPal, Razorpay, Paystack, COD, Square, Airwallex) have been registered. Use this hook to register your own custom payment gateway with the gateway manager.

**Parameters:**

- `$data` (array): Contains the gateway manager instance
    ```php
    $data = [
        'gatewayManager' => $gateway, // GatewayManager instance for registering gateways
    ];
    ```

**Source:** `app/Hooks/Handlers/GlobalPaymentHandler.php`

**Usage:**
```php
add_action('fluent_cart/register_payment_methods', function ($data) {
    $gatewayManager = $data['gatewayManager'];

    // Register a custom payment gateway
    $gatewayManager->register('my_gateway', new MyCustomPaymentGateway());
}, 10, 1);
```
</details>

### <code> after_render_payment_method_{$route} </code>
<details>
<summary><code>fluent-cart/after_render_payment_method_{$route}</code> &mdash; Fires after a payment method UI renders on the checkout page</summary>

**When it runs:**
This action fires after a payment method's frontend UI (logo or radio button) has been rendered on the checkout form. The `{$route}` is the gateway's route identifier. Note that this hook uses a **hyphenated** prefix (`fluent-cart/`) rather than the usual underscored prefix.

> **Deprecated since 1.4.0.** Use `fluent_cart/after_render_payment_method_{$route}` instead. The hyphenated prefix still works but triggers a deprecation notice when `WP_DEBUG` is enabled.

**Parameters:**

None.

**Source:** `app/Modules/PaymentMethods/Core/AbstractPaymentGateway.php`

**Dynamic variants:**
- `fluent-cart/after_render_payment_method_stripe`
- `fluent-cart/after_render_payment_method_paypal`
- `fluent-cart/after_render_payment_method_square`
- `fluent-cart/after_render_payment_method_airwallex`
- `fluent-cart/after_render_payment_method_offline_payment`
- `fluent-cart/after_render_payment_method_razorpay`
- `fluent-cart/after_render_payment_method_paystack`

**Usage:**
```php
add_action('fluent-cart/after_render_payment_method_stripe', function () {
    // Add custom messaging below the Stripe payment option
    echo '<p class="payment-note">Secure payments powered by Stripe.</p>';
}, 10, 0);
```
</details>

---

## Stripe Webhooks

### <code> stripe/webhook_{$eventType} </code>
<details>
<summary><code>fluent_cart/payments/stripe/webhook_{$eventType}</code> &mdash; Fires for each Stripe webhook event</summary>

**When it runs:**
This dynamic action fires during Stripe webhook (IPN) processing after the event has been verified and the associated [Order](/database/models/order) has been found. The `{$eventType}` is the Stripe event type with dots replaced by underscores (e.g. `invoice.payment_succeeded` becomes `invoice_payment_succeeded`). The webhook handler checks if any listener is registered via `has_action()` before dispatching.

**Parameters:**

- `$data` (array): The Stripe event object and associated order
    ```php
    $data = [
        'event' => $event, // Stripe Event object (contains type, data, etc.)
        'order' => $order, // Order model instance (may be WP_Error if not found)
    ];
    ```

**Source:** `app/Modules/PaymentMethods/StripeGateway/Webhook/IPN.php`

**Dynamic variants (common Stripe events):**
- `fluent_cart/payments/stripe/webhook_invoice_payment_succeeded`
- `fluent_cart/payments/stripe/webhook_invoice_payment_failed`
- `fluent_cart/payments/stripe/webhook_charge_refunded`
- `fluent_cart/payments/stripe/webhook_customer_subscription_deleted`
- `fluent_cart/payments/stripe/webhook_customer_subscription_updated`
- `fluent_cart/payments/stripe/webhook_payment_intent_succeeded`
- `fluent_cart/payments/stripe/webhook_payment_intent_payment_failed`

**Usage:**
```php
add_action('fluent_cart/payments/stripe/webhook_charge_refunded', function ($data) {
    $event = $data['event'];
    $order = $data['order'];

    if (is_wp_error($order)) {
        return;
    }

    $charge = $event->data->object;

    // Custom refund handling
    fluent_cart_add_log(
        'Stripe Refund Webhook',
        'Charge ' . $charge->id . ' refunded for Order #' . $order->id,
        'info'
    );
}, 10, 1);
```
</details>

---

## PayPal Webhooks

### <code> paypal_webhook_received </code>
<details>
<summary><code>fluent_cart/paypal_webhook_received</code> &mdash; Fires when raw PayPal webhook data is received before processing</summary>

**When it runs:**
This action fires early in PayPal webhook processing, after the webhook type has been validated against the list of supported events but before any event-specific handling occurs. Use this to log or inspect all incoming PayPal webhook payloads.

**Parameters:**

- `$data` (array): The parsed and raw webhook data
    ```php
    $data = [
        'data' => $data,      // Parsed webhook payload (array)
        'raw'  => $post_data, // Raw POST body string
    ];
    ```

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php`

**Usage:**
```php
add_action('fluent_cart/paypal_webhook_received', function ($data) {
    // Log all incoming PayPal webhooks for debugging
    error_log('PayPal webhook received: ' . wp_json_encode($data['data']));
}, 10, 1);
```
</details>

### <code> paypal/webhook_subscription_payment_received </code>
<details>
<summary><code>fluent_cart/payments/paypal/webhook_subscription_payment_received</code> &mdash; Fires when a PayPal recurring subscription payment is received</summary>

**When it runs:**
This action fires when a PayPal `PAYMENT.SALE.COMPLETED` webhook is received and the resource contains a `billing_agreement_id`, indicating it is a recurring subscription payment rather than a one-time purchase.

**Parameters:**

- `$data` (array): The charge resource and billing agreement ID
    ```php
    $data = [
        'charge'                 => $resource,           // PayPal sale resource object (array)
        'vendor_subscription_id' => $billingAgreementId, // PayPal billing agreement ID (string)
    ];
    ```

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php`

**Usage:**
```php
add_action('fluent_cart/payments/paypal/webhook_subscription_payment_received', function ($data) {
    $charge = $data['charge'];
    $billingAgreementId = $data['vendor_subscription_id'];

    // Track recurring payment
    fluent_cart_add_log(
        'PayPal Recurring Payment',
        'Billing agreement ' . $billingAgreementId . ' payment received.',
        'success'
    );
}, 10, 1);
```
</details>

### <code> paypal/webhook_payment_capture_completed </code>
<details>
<summary><code>fluent_cart/payments/paypal/webhook_payment_capture_completed</code> &mdash; Fires when a PayPal one-time payment capture completes</summary>

**When it runs:**
This action fires when a PayPal `PAYMENT.SALE.COMPLETED` webhook arrives without a billing agreement ID (one-time payment), or when a `PAYMENT.CAPTURE.COMPLETED` event is received. Both indicate a successful one-time payment capture.

**Parameters:**

- `$data` (array): The charge resource from PayPal
    ```php
    $data = [
        'charge' => $resource, // PayPal capture/sale resource object (array)
    ];
    ```

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php`

**Usage:**
```php
add_action('fluent_cart/payments/paypal/webhook_payment_capture_completed', function ($data) {
    $charge = $data['charge'];

    // Handle one-time payment capture confirmation
    fluent_cart_add_log(
        'PayPal Capture Completed',
        'Capture completed for resource: ' . wp_json_encode($charge),
        'success'
    );
}, 10, 1);
```
</details>

### <code> paypal/webhook_payment_sale_refunded </code>
<details>
<summary><code>fluent_cart/payments/paypal/webhook_payment_sale_refunded</code> &mdash; Fires when a PayPal recurring sale is refunded</summary>

**When it runs:**
This action fires when a PayPal `PAYMENT.SALE.REFUNDED` webhook is received, indicating that a refund has been issued for a recurring/subscription payment sale.

**Parameters:**

- `$data` (array): The refund resource from PayPal
    ```php
    $data = [
        'refund' => $resource, // PayPal refund resource object (array)
    ];
    ```

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php`

**Usage:**
```php
add_action('fluent_cart/payments/paypal/webhook_payment_sale_refunded', function ($data) {
    $refund = $data['refund'];

    // Handle recurring payment refund
    fluent_cart_add_log(
        'PayPal Sale Refund',
        'Recurring payment sale refunded: ' . wp_json_encode($refund),
        'info'
    );
}, 10, 1);
```
</details>

### <code> paypal/webhook_payment_capture_refunded </code>
<details>
<summary><code>fluent_cart/payments/paypal/webhook_payment_capture_refunded</code> &mdash; Fires when a PayPal one-time payment capture is refunded</summary>

**When it runs:**
This action fires when a PayPal `PAYMENT.CAPTURE.REFUNDED` webhook is received, indicating that a refund has been issued for a one-time payment capture.

**Parameters:**

- `$data` (array): The refund resource from PayPal
    ```php
    $data = [
        'refund' => $resource, // PayPal refund resource object (array)
    ];
    ```

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php`

**Usage:**
```php
add_action('fluent_cart/payments/paypal/webhook_payment_capture_refunded', function ($data) {
    $refund = $data['refund'];

    // Handle one-time payment refund
    fluent_cart_add_log(
        'PayPal Capture Refund',
        'One-time payment capture refunded: ' . wp_json_encode($refund),
        'info'
    );
}, 10, 1);
```
</details>

### <code> paypal/webhook_{$eventType} (disputes) </code>
<details>
<summary><code>fluent_cart/payments/paypal/webhook_{$eventType}</code> &mdash; Fires for PayPal customer dispute events</summary>

**When it runs:**
This dynamic action fires when a PayPal dispute-related webhook is received. The `{$eventType}` is the PayPal event type converted to lowercase with dots replaced by underscores.

**Parameters:**

- `$data` (array): The dispute resource from PayPal
    ```php
    $data = [
        'dispute' => $resource, // PayPal dispute resource object (array)
    ];
    ```

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php`

**Dynamic variants:**
- `fluent_cart/payments/paypal/webhook_customer_dispute_created`
- `fluent_cart/payments/paypal/webhook_customer_dispute_updated`
- `fluent_cart/payments/paypal/webhook_customer_dispute_resolved`

**Usage:**
```php
add_action('fluent_cart/payments/paypal/webhook_customer_dispute_created', function ($data) {
    $dispute = $data['dispute'];

    // Alert admin about a new PayPal dispute
    wp_mail(
        get_option('admin_email'),
        'PayPal Dispute Created',
        'A customer has opened a dispute. Details: ' . wp_json_encode($dispute)
    );
}, 10, 1);
```
</details>

### <code> paypal/webhook_{$eventType} (subscriptions) </code>
<details>
<summary><code>fluent_cart/payments/paypal/webhook_{$eventType}</code> &mdash; Fires for PayPal billing subscription lifecycle events</summary>

**When it runs:**
This dynamic action fires as a catch-all for PayPal webhook events that are not payments, refunds, or disputes. These are primarily billing subscription lifecycle events. The `{$eventType}` is the PayPal event type converted to lowercase with dots replaced by underscores.

**Parameters:**

- `$data` (array): The PayPal subscription resource
    ```php
    $data = [
        'paypal_subscription' => $resource, // PayPal subscription resource object (array)
    ];
    ```

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php`

**Dynamic variants:**
- `fluent_cart/payments/paypal/webhook_billing_subscription_activated`
- `fluent_cart/payments/paypal/webhook_billing_subscription_created`
- `fluent_cart/payments/paypal/webhook_billing_subscription_cancelled`
- `fluent_cart/payments/paypal/webhook_billing_subscription_expired`
- `fluent_cart/payments/paypal/webhook_billing_subscription_suspended`
- `fluent_cart/payments/paypal/webhook_billing_subscription_re-activated`

**Usage:**
```php
add_action('fluent_cart/payments/paypal/webhook_billing_subscription_cancelled', function ($data) {
    $subscription = $data['paypal_subscription'];

    // Handle PayPal subscription cancellation
    fluent_cart_add_log(
        'PayPal Subscription Cancelled',
        'PayPal subscription cancelled: ' . wp_json_encode($subscription),
        'warning'
    );
}, 10, 1);
```
</details>

---

## Mollie Webhooks <Badge type="warning" text="Pro" />

### <code> mollie/webhook_subscription_payment_{$status} </code>
<details>
<summary><code>fluent_cart/payments/mollie/webhook_subscription_payment_{$status}</code> <Badge type="warning" text="Pro" /> &mdash; Fires for each Mollie subscription payment status change</summary>

**When it runs:**
This dynamic action fires during Mollie webhook (IPN) processing when a subscription payment status is determined. The `{$status}` is replaced with the Mollie payment status (e.g. `paid`, `failed`, `expired`, `canceled`). Use this hook to react to specific subscription payment outcomes from Mollie.

**Parameters:**

- `$molliePayment` (object): The Mollie Payment object from the API
- `$order` ([Order](/database/models/order)): The Order model instance associated with this payment

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/Webhook/MollieIPN.php`

**Dynamic variants:**
- `fluent_cart/payments/mollie/webhook_subscription_payment_paid` -- subscription payment succeeded
- `fluent_cart/payments/mollie/webhook_subscription_payment_failed` -- subscription payment failed
- `fluent_cart/payments/mollie/webhook_subscription_payment_expired` -- subscription payment expired
- `fluent_cart/payments/mollie/webhook_subscription_payment_canceled` -- subscription payment canceled

**Usage:**
```php
add_action('fluent_cart/payments/mollie/webhook_subscription_payment_paid', function ($molliePayment, $order) {
    // Handle successful Mollie subscription payment
    fluent_cart_add_log(
        'Mollie Subscription Payment',
        'Subscription payment received for Order #' . $order->id . ' (Mollie ID: ' . $molliePayment->id . ')',
        'success'
    );
}, 10, 2);
```
</details>

### <code> mollie/webhook_payment_{$status} </code>
<details>
<summary><code>fluent_cart/payments/mollie/webhook_payment_{$status}</code> <Badge type="warning" text="Pro" /> &mdash; Fires for each Mollie one-time payment status change</summary>

**When it runs:**
This dynamic action fires during Mollie webhook processing when a one-time (non-subscription) payment status is determined. The `{$status}` is replaced with the Mollie payment status. Use this hook to react to specific one-time payment outcomes from Mollie.

**Parameters:**

- `$molliePayment` (object): The Mollie Payment object from the API
- `$order` ([Order](/database/models/order)): The Order model instance associated with this payment

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/Webhook/MollieIPN.php`

**Dynamic variants:**
- `fluent_cart/payments/mollie/webhook_payment_paid` -- one-time payment succeeded
- `fluent_cart/payments/mollie/webhook_payment_failed` -- one-time payment failed
- `fluent_cart/payments/mollie/webhook_payment_expired` -- one-time payment expired
- `fluent_cart/payments/mollie/webhook_payment_canceled` -- one-time payment canceled

**Usage:**
```php
add_action('fluent_cart/payments/mollie/webhook_payment_paid', function ($molliePayment, $order) {
    // Handle successful Mollie one-time payment
    wp_remote_post('https://fulfillment.example.com/api/orders', [
        'body' => wp_json_encode([
            'order_id'   => $order->id,
            'mollie_id'  => $molliePayment->id,
            'amount'     => $molliePayment->amount->value,
            'currency'   => $molliePayment->amount->currency,
        ]),
    ]);
}, 10, 2);
```
</details>

### <code> payment_failed (Mollie) </code>
<details>
<summary><code>fluent_cart/payment_failed</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a Mollie payment fails, is canceled, or expires</summary>

> **Note:** This hook is fired by multiple payment gateways with different parameter structures. See the gateway-specific documentation for exact parameters. The Mollie variant passes `order`, `transaction`, `old_payment_status`, `new_payment_status`, and `reason`; the Airwallex variant passes `order` and `payment_intent`.

**When it runs:**
This action fires inside the Mollie IPN handler when a payment is determined to have failed, been canceled, or expired. The order status and payment status are updated before this hook runs. Note that this is the same `fluent_cart/payment_failed` hook used by the base plugin for Airwallex; the Pro plugin adds Mollie as an additional source that fires it.

**Parameters:**

- `$data` (array): Payment failure data
    ```php
    $data = [
        'order'              => $order,              // \FluentCart\App\Models\Order — with updated failed status
        'transaction'        => $transactionModel,   // \FluentCart\App\Models\OrderTransaction
        'old_payment_status' => $oldStatus,          // string — previous payment status
        'new_payment_status' => Status::PAYMENT_FAILED, // string — new payment status
        'reason'             => $reason,             // string — 'failed', 'canceled', or 'expired'
    ];
    ```

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/Webhook/MollieIPN.php`

**Usage:**
```php
add_action('fluent_cart/payment_failed', function ($data) {
    $order       = $data['order'];
    $transaction = $data['transaction'];
    $oldStatus   = $data['old_payment_status'];
    $newStatus   = $data['new_payment_status'];
    $reason      = $data['reason'];

    // Notify admin about failed Mollie payment
    if ($order->payment_method !== 'mollie') {
        return; // Only handle Mollie failures in this callback
    }

    wp_mail(
        get_option('admin_email'),
        'Mollie Payment Failed - Order #' . $order->id,
        sprintf(
            "Payment for Order #%d has %s.\nPrevious status: %s\nNew status: %s\nTransaction ID: %s",
            $order->id,
            $reason,
            $oldStatus,
            $newStatus,
            $transaction->id
        )
    );
}, 10, 1);
```
</details>

---

## Paddle Webhooks <Badge type="warning" text="Pro" />

### <code> paddle_webhook_received </code>
<details>
<summary><code>fluent_cart/paddle_webhook_received</code> <Badge type="warning" text="Pro" /> &mdash; Fires when raw Paddle webhook data is received before processing</summary>

**When it runs:**
This action fires early in Paddle webhook processing, after the event type has been extracted from the payload but before any event-specific handling occurs. Use this to log or inspect all incoming Paddle webhook payloads for debugging purposes.

**Parameters:**

- `$eventType` (string): The Paddle event type (e.g. `transaction.paid`, `subscription.created`)
- `$data` (array): The parsed webhook payload
- `$raw` (string): The raw POST body string
- `$order` ([Order](/database/models/order)|null): The associated Order model instance, or null if not yet resolved

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/Webhook/IPN.php`

**Usage:**
```php
add_action('fluent_cart/paddle_webhook_received', function ($eventType, $data, $raw, $order) {
    // Log all incoming Paddle webhooks for debugging
    fluent_cart_add_log(
        'Paddle Webhook Received',
        sprintf(
            'Event: %s | Order: %s | Payload size: %d bytes',
            $eventType,
            $order ? '#' . $order->id : 'N/A',
            strlen($raw)
        ),
        'info'
    );
}, 10, 4);
```
</details>

### <code> paddle/webhook_{$eventType} </code>
<details>
<summary><code>fluent_cart/payments/paddle/webhook_{$eventType}</code> <Badge type="warning" text="Pro" /> &mdash; Fires for each Paddle webhook event</summary>

**When it runs:**
This dynamic action fires during Paddle webhook (IPN) processing after the event has been received and the associated order has been resolved (if applicable). The `{$eventType}` is the Paddle event type with dots replaced by underscores (e.g. `transaction.paid` becomes `transaction_paid`). The webhook handler validates incoming events against a list of accepted event types before dispatching.

**Parameters:**

- `$eventType` (string): The Paddle event type with dots replaced by underscores
- `$data` (array): The parsed webhook payload
- `$raw` (string): The raw POST body string
- `$order` ([Order](/database/models/order)|null): The associated Order model instance, or null if not resolved

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/Webhook/IPN.php`

**Accepted events (dynamic variants):**
- `fluent_cart/payments/paddle/webhook_transaction_paid` -- transaction payment succeeded
- `fluent_cart/payments/paddle/webhook_transaction_completed` -- transaction fully completed
- `fluent_cart/payments/paddle/webhook_transaction_payment_failed` -- transaction payment failed
- `fluent_cart/payments/paddle/webhook_transaction_refunded` -- transaction refunded
- `fluent_cart/payments/paddle/webhook_adjustment_created` -- adjustment (refund/credit) created
- `fluent_cart/payments/paddle/webhook_adjustment_updated` -- adjustment updated
- `fluent_cart/payments/paddle/webhook_subscription_created` -- subscription created
- `fluent_cart/payments/paddle/webhook_subscription_activated` -- subscription activated
- `fluent_cart/payments/paddle/webhook_subscription_updated` -- subscription updated
- `fluent_cart/payments/paddle/webhook_subscription_canceled` -- subscription canceled
- `fluent_cart/payments/paddle/webhook_subscription_paused` -- subscription paused
- `fluent_cart/payments/paddle/webhook_subscription_resumed` -- subscription resumed
- `fluent_cart/payments/paddle/webhook_subscription_past_due` -- subscription past due

**Usage:**
```php
add_action('fluent_cart/payments/paddle/webhook_transaction_paid', function ($eventType, $data, $raw, $order) {
    if (!$order) {
        return;
    }

    // Handle successful Paddle transaction payment
    fluent_cart_add_log(
        'Paddle Transaction Paid',
        'Paddle payment completed for Order #' . $order->id,
        'success'
    );
}, 10, 4);

add_action('fluent_cart/payments/paddle/webhook_subscription_canceled', function ($eventType, $data, $raw, $order) {
    if (!$order) {
        return;
    }

    // Handle Paddle subscription cancellation
    wp_mail(
        get_option('admin_email'),
        'Paddle Subscription Canceled - Order #' . $order->id,
        'A Paddle subscription has been canceled. Event data: ' . wp_json_encode($data)
    );
}, 10, 4);

add_action('fluent_cart/payments/paddle/webhook_transaction_refunded', function ($eventType, $data, $raw, $order) {
    if (!$order) {
        return;
    }

    // Track Paddle refund
    fluent_cart_add_log(
        'Paddle Refund',
        'Paddle transaction refunded for Order #' . $order->id,
        'warning'
    );
}, 10, 4);
```
</details>

---

## Integrations

### <code> register_integration_action </code>
<details>
<summary><code>fluent_cart/register_integration_action</code> &mdash; Register custom integration actions during initialization</summary>

**When it runs:**
This action fires during WordPress `init` to allow registration of custom integration actions. Use this hook to register your integration provider so it appears in the FluentCart integration action settings.

**Parameters:**

None.

**Source:** `app/Modules/IntegrationActions/GlobalIntegrationActionHandler.php`

**Usage:**
```php
add_action('fluent_cart/register_integration_action', function () {
    // Register a custom integration action provider
    add_filter('fluent_cart/integration/get_global_integration_actions', function ($actions) {
        $actions['my_crm'] = [
            'title'    => 'My CRM',
            'logo'     => plugin_dir_url(__FILE__) . 'logo.png',
            'handler'  => 'MyCrmIntegrationHandler',
        ];
        return $actions;
    });
}, 10, 0);
```
</details>

### <code> authenticate_global_credentials_{$settingsKey} </code>
<details>
<summary><code>fluent_cart/integration/authenticate_global_credentials_{$settingsKey}</code> &mdash; Verify integration credentials for a specific provider</summary>

**When it runs:**
This dynamic action fires when a user clicks the "Verify" or "Authenticate" button for an integration's global credentials in the FluentCart admin settings. The `{$settingsKey}` is the integration provider's settings key (e.g. `mailchimp`, `activecampaign`). The handler is expected to validate the credentials and send a JSON response.

**Parameters:**

- `$data` (array): The settings key and integration configuration
    ```php
    $data = [
        'settings_key' => $settingsKey, // Integration provider key (string)
        'integration'  => $integration, // Integration settings data (array, unslashed)
    ];
    ```

**Source:** `app/Modules/Integrations/GlobalIntegrationSettings.php`

**Usage:**
```php
add_action('fluent_cart/integration/authenticate_global_credentials_my_crm', function ($data) {
    $apiKey = $data['integration']['api_key'] ?? '';

    // Verify the API key with the external service
    $response = wp_remote_get('https://api.mycrm.com/verify', [
        'headers' => ['Authorization' => 'Bearer ' . $apiKey],
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        wp_send_json_error(['message' => 'Invalid API credentials.'], 400);
    }

    wp_send_json_success(['message' => 'Credentials verified successfully.']);
}, 10, 1);
```
</details>

### <code> save_global_integration_settings_{$settingsKey} </code>
<details>
<summary><code>fluent_cart/integration/save_global_integration_settings_{$settingsKey}</code> &mdash; Save integration settings for a specific provider</summary>

**When it runs:**
This dynamic action fires when a user saves the global integration settings for a specific provider. The `{$settingsKey}` is the integration provider's settings key. The handler is expected to persist the settings and send a JSON response. If no handler catches this action, a fallback error message is returned.

**Parameters:**

- `$data` (array): The settings key and integration configuration
    ```php
    $data = [
        'settings_key' => $settingsKey, // Integration provider key (string)
        'integration'  => $integration, // Integration settings data (array, unslashed)
    ];
    ```

**Source:** `app/Modules/Integrations/GlobalIntegrationSettings.php`

**Usage:**
```php
add_action('fluent_cart/integration/save_global_integration_settings_my_crm', function ($data) {
    $settings = $data['integration'];

    // Persist integration settings
    fluent_cart_update_option('my_crm_settings', $settings);

    wp_send_json_success([
        'message' => 'Settings saved successfully.',
    ]);
}, 10, 1);
```
</details>

### <code> integration/chained_{$route} </code>
<details>
<summary><code>fluent_cart/integration/chained_{$route}</code> &mdash; Fires for chained data requests in cascading dropdowns</summary>

**When it runs:**
This dynamic action fires when the integration settings UI requests chained/dependent data for cascading dropdown fields. For example, after selecting a mailing list, this hook loads the available tags or groups for that list. The `{$route}` is the integration's route identifier.

**Parameters:**

- `$data` (array): The request data for the chained lookup
    ```php
    $data = [
        'data' => $requestData, // Request data array (contains route, selected values, etc.)
    ];
    ```

**Source:** `app/Modules/Integrations/GlobalIntegrationSettings.php`

**Usage:**
```php
add_action('fluent_cart/integration/chained_my_crm', function ($data) {
    $requestData = $data['data'];
    $listId = $requestData['list_id'] ?? '';

    // Fetch tags for the selected list
    $tags = my_crm_get_tags($listId);

    wp_send_json_success([
        'tags' => $tags,
    ]);
}, 10, 1);
```
</details>

### <code> integration/run/{$provider} </code>
<details>
<summary><code>fluent_cart/integration/run/{$provider}</code> &mdash; Execute a specific integration feed for a provider</summary>

**When it runs:**
This dynamic action fires when an integration feed needs to be executed for a specific provider, both in real-time (synchronous) and async (via scheduled actions) processing. The `{$provider}` is the integration provider's slug (e.g. `mailchimp`, `activecampaign`). It runs within a try/catch block, and errors are logged to the [Order](/database/models/order)'s activity log.

**Parameters:**

- `$integrationArray` (array): The full integration feed configuration and context
    ```php
    $integrationArray = [
        'provider'   => 'mailchimp',  // Integration provider slug
        'order'      => $order,       // Order model instance
        'event_data' => $data,        // Event trigger data (may include subscription)
        'feed'       => [],           // Feed configuration array
        // ... additional feed configuration fields
    ];
    ```

**Source:** `app/Listeners/IntegrationEventListener.php`

**Usage:**
```php
add_action('fluent_cart/integration/run/my_crm', function ($integrationArray) {
    $order = $integrationArray['order'];
    $feed = $integrationArray['feed'] ?? [];
    $customer = $order->customer;

    // Push customer data to your CRM
    wp_remote_post('https://api.mycrm.com/contacts', [
        'headers' => [
            'Authorization' => 'Bearer ' . fluent_cart_get_option('my_crm_api_key'),
            'Content-Type'  => 'application/json',
        ],
        'body' => wp_json_encode([
            'email' => $customer->email,
            'name'  => $customer->full_name,
            'tags'  => $feed['tags'] ?? [],
        ]),
    ]);
}, 10, 1);
```
</details>

### <code> global_notify_completed </code>
<details>
<summary><code>fluent_cart/integrations/global_notify_completed</code> &mdash; Fires after all synchronous global notification feeds have completed</summary>

**When it runs:**
This action fires after all sync (non-async) global notification integration feeds have been processed for an order. It does not fire if there are async feeds still pending.

**Parameters:**

- `$order` ([Order](/database/models/order)): The Order model instance
- `$feeds` (array): Array of feed configurations that were processed

**Source:** `app/Modules/Integrations/GlobalNotificationHandler.php`

**Usage:**
```php
add_action('fluent_cart/integrations/global_notify_completed', function ($order, $feeds) {
    // All sync integrations are done for this order
    fluent_cart_add_log(
        'Integrations Complete',
        count($feeds) . ' integration feeds processed for Order #' . $order->id,
        'info'
    );
}, 10, 2);
```
</details>

### <code> reindex_integration_feeds </code>
<details>
<summary><code>fluent_cart/reindex_integration_feeds</code> &mdash; Fires when integration feeds need to be re-indexed</summary>

**When it runs:**
This action fires after integration feed configurations are saved or updated, both at the global level (via `IntegrationController`) and at the product level (via `ProductIntegrationsController`). It signals that the cached integration feed index should be rebuilt.

**Parameters:**

- `$data` (array): Empty array
    ```php
    $data = []; // No data passed
    ```

**Source:** `app/Http/Controllers/IntegrationController.php`, `app/Http/Controllers/ProductIntegrationsController.php`

**Usage:**
```php
add_action('fluent_cart/reindex_integration_feeds', function ($data) {
    // Clear any cached integration feed data
    delete_transient('my_plugin_integration_cache');
}, 10, 1);
```
</details>

---

## Storage Drivers

### <code> register_storage_drivers </code>
<details>
<summary><code>fluent_cart/register_storage_drivers</code> &mdash; Register custom file storage drivers</summary>

**When it runs:**
This action fires during WordPress `init` at priority 9, after the built-in Local and S3 storage drivers have been initialized. Use this hook to register a custom file storage driver (e.g. Google Cloud Storage, Azure Blob Storage) for digital product file delivery.

**Parameters:**

None.

**Source:** `app/Hooks/Handlers/GlobalStorageHandler.php`

**Usage:**
```php
add_action('fluent_cart/register_storage_drivers', function () {
    // Register a custom storage driver
    add_filter('fluent_cart/storage_drivers', function ($drivers) {
        $drivers['gcs'] = [
            'title'   => 'Google Cloud Storage',
            'handler' => new MyGcsStorageDriver(),
        ];
        return $drivers;
    });
}, 10, 0);
```
</details>

---

## Development Logging

### <code> dev_log </code>
<details>
<summary><code>fluent_cart/dev_log</code> &mdash; Fires for development and debug logging (requires FLUENT_CART_DEV_MODE)</summary>

**When it runs:**
This action fires at various points during payment gateway webhook processing (primarily in the PayPal IPN handler) when the `FLUENT_CART_DEV_MODE` constant is defined. It provides detailed diagnostic data for debugging webhook failures, signature verification issues, and missing transaction references. There are 8+ call sites in the PayPal IPN handler alone.

**Parameters:**

- `$data` (array): Logging context with raw data and metadata
    ```php
    $data = [
        'raw_data'    => $rawData,     // Raw webhook payload or resource data (mixed)
        'status'      => 'failed',     // Log status: 'failed', 'received', etc.
        'title'       => 'Log title',  // Human-readable log title (string)
        'log_type'    => 'webhook',    // Type of log entry (string)
        'module_type' => 'paypal_ipn', // Module identifier (string)
        'module_name' => 'PayPal',     // Display name of the module (string)
    ];
    ```

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php` (multiple call sites)

**Usage:**
```php
// First, define the constant in wp-config.php:
// define('FLUENT_CART_DEV_MODE', true);

add_action('fluent_cart/dev_log', function ($data) {
    // Write detailed logs to a custom file
    $logEntry = sprintf(
        "[%s] [%s] %s - %s\n%s\n\n",
        gmdate('Y-m-d H:i:s'),
        $data['status'] ?? 'unknown',
        $data['module_name'] ?? 'General',
        $data['title'] ?? 'No title',
        wp_json_encode($data['raw_data'] ?? [], JSON_PRETTY_PRINT)
    );

    error_log($logEntry, 3, WP_CONTENT_DIR . '/fluent-cart-debug.log');
}, 10, 1);
```
</details>

---
