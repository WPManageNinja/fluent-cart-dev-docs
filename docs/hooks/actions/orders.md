# Orders

All hooks related to order lifecycle, status transitions, payments, shipping, refunds, and order items. These action hooks allow you to respond to key order events in FluentCart.

Each hook passes an associative array as its single parameter. The `order` value is always an [`\FluentCart\App\Models\Order`](/database/models/order) model instance with the [`customer`](/database/models/customer), `shipping_address`, and `billing_address` relationships eager-loaded (unless noted otherwise).

> **Amounts are in cents.** All monetary values (`total`, `refunded_amount`, etc.) are stored as integers in the smallest currency unit. Use `Helper::toDecimal($amount)` to convert for display.

---

## Order Status Changes

Fired when the **order status** field changes (e.g. `processing` &rarr; `completed`). Both a dynamic, status-specific hook and a generic hook fire on every change.

### <code> order_status_changed_to_{status} </code>
<details open>
<summary><code>fluent_cart/order_status_changed_to_{$newStatus}</code> &mdash; Fires when the order status changes to a specific status</summary>

**When it runs:**
Fires inside `OrderStatusUpdated::afterDispatch()` whenever the order status type transitions to a new value. The `{$newStatus}` portion is replaced dynamically with the target status, so you can listen for a single status you care about.

**Available dynamic variants:** `completed`, `canceled`, `processing`, `on-hold`, `failed`

**Parameters:**

- `$data` (array): Order status change data
    ```php
    $data = [
        'order'       => $order,       // \FluentCart\App\Models\Order (with customer, addresses loaded)
        'old_status'  => 'processing', // Previous order status string
        'new_status'  => 'completed',  // New order status string (matches the dynamic suffix)
        'manageStock' => true,         // Whether stock management should be applied
        'activity'    => [             // Optional activity log context
            'title'   => '',
            'content' => '',
        ],
    ];
    ```

**Source:** `app/Events/Order/OrderStatusUpdated.php` (line 91)

**Usage:**
```php
add_action('fluent_cart/order_status_changed_to_completed', function ($data) {
    $order = $data['order'];
    // Grant digital access when order completes
    grant_digital_access($order->customer_id, $order->id);
}, 10, 1);
```
</details>

### <code> order_status_changed </code>
<details>
<summary><code>fluent_cart/order_status_changed</code> &mdash; Fires on any order status change</summary>

**When it runs:**
Fires immediately after the dynamic `order_status_changed_to_{$newStatus}` hook, on every order status transition regardless of the target status. Use this when you need to react to all status changes in a single callback.

**Parameters:**

- `$data` (array): Order status change data
    ```php
    $data = [
        'order'       => $order,       // \FluentCart\App\Models\Order
        'old_status'  => 'processing', // Previous order status
        'new_status'  => 'completed',  // New order status
        'manageStock' => true,         // Whether stock management applies
        'activity'    => [
            'title'   => '',
            'content' => '',
        ],
    ];
    ```

**Source:** `app/Events/Order/OrderStatusUpdated.php` (line 92)

**Usage:**
```php
add_action('fluent_cart/order_status_changed', function ($data) {
    $order = $data['order'];
    // Log every status transition
    fluent_cart_add_log(
        'Order status changed',
        sprintf('Order #%d: %s -> %s', $order->id, $data['old_status'], $data['new_status']),
        'info'
    );
}, 10, 1);
```
</details>

---

## Payment Status Changes

Fired when the **payment status** field changes (e.g. `pending` &rarr; `paid`). Both a dynamic, status-specific hook and a generic hook fire on every change.

### <code> payment_status_changed_to_{status} </code>
<details>
<summary><code>fluent_cart/payment_status_changed_to_{$newStatus}</code> &mdash; Fires when payment status changes to a specific status</summary>

**When it runs:**
Fires inside `OrderStatusUpdated::afterDispatch()` when the status change type is `payment_status`. The `{$newStatus}` suffix is replaced dynamically so you can target a single payment state.

**Available dynamic variants:** `pending`, `paid`, `partially_paid`, `failed`, `refunded`, `partially_refunded`, `authorized`

**Parameters:**

- `$data` (array): Payment status change data
    ```php
    $data = [
        'order'       => $order,     // \FluentCart\App\Models\Order
        'old_status'  => 'pending',  // Previous payment status
        'new_status'  => 'paid',     // New payment status (matches the dynamic suffix)
        'manageStock' => true,       // Whether stock management applies
        'activity'    => [
            'title'   => '',
            'content' => '',
        ],
    ];
    ```

**Source:** `app/Events/Order/OrderStatusUpdated.php` (line 81)

**Usage:**
```php
add_action('fluent_cart/payment_status_changed_to_paid', function ($data) {
    $order = $data['order'];
    // Trigger fulfillment workflow when payment is confirmed
    do_action('my_custom_fulfillment_start', $order->id);
}, 10, 1);
```
</details>

### <code> payment_status_changed </code>
<details>
<summary><code>fluent_cart/payment_status_changed</code> &mdash; Fires on any payment status change</summary>

**When it runs:**
Fires immediately after the dynamic `payment_status_changed_to_{$newStatus}` hook, on every payment status transition. Use this when you need a single callback for all payment status changes.

**Parameters:**

- `$data` (array): Payment status change data
    ```php
    $data = [
        'order'       => $order,     // \FluentCart\App\Models\Order
        'old_status'  => 'pending',  // Previous payment status
        'new_status'  => 'paid',     // New payment status
        'manageStock' => true,       // Whether stock management applies
        'activity'    => [
            'title'   => '',
            'content' => '',
        ],
    ];
    ```

**Source:** `app/Events/Order/OrderStatusUpdated.php` (line 82)

**Usage:**
```php
add_action('fluent_cart/payment_status_changed', function ($data) {
    $order = $data['order'];
    // Send payment status update notification
    if ($data['new_status'] === 'paid') {
        wp_mail($order->customer->email, 'Payment Confirmed', 'Your payment has been received.');
    }
}, 10, 1);
```
</details>

---

## Shipping Status Changes

Fired when the **shipping status** field changes (e.g. `unshipped` &rarr; `shipped`). Both a dynamic, status-specific hook and a generic hook fire on every change.

### <code> shipping_status_changed_to_{status} </code>
<details>
<summary><code>fluent_cart/shipping_status_changed_to_{$newStatus}</code> &mdash; Fires when shipping status changes to a specific status</summary>

**When it runs:**
Fires inside `OrderStatusUpdated::afterDispatch()` when the status change type is `shipping_status`. The `{$newStatus}` suffix is replaced dynamically so you can target a single shipping state.

**Available dynamic variants:** `unshipped`, `shipped`, `delivered`, `unshippable`

**Parameters:**

- `$data` (array): Shipping status change data
    ```php
    $data = [
        'order'       => $order,      // \FluentCart\App\Models\Order
        'old_status'  => 'unshipped', // Previous shipping status
        'new_status'  => 'shipped',   // New shipping status (matches the dynamic suffix)
        'manageStock' => true,        // Whether stock management applies
        'activity'    => [
            'title'   => '',
            'content' => '',
        ],
    ];
    ```

**Source:** `app/Events/Order/OrderStatusUpdated.php` (line 86)

**Usage:**
```php
add_action('fluent_cart/shipping_status_changed_to_shipped', function ($data) {
    $order = $data['order'];
    // Notify customer that their order has shipped
    wp_mail(
        $order->customer->email,
        'Your Order Has Shipped!',
        sprintf('Order #%d has been shipped.', $order->id)
    );
}, 10, 1);
```
</details>

### <code> shipping_status_changed </code>
<details>
<summary><code>fluent_cart/shipping_status_changed</code> &mdash; Fires on any shipping status change</summary>

**When it runs:**
Fires immediately after the dynamic `shipping_status_changed_to_{$newStatus}` hook, on every shipping status transition. Use this when you need a single callback for all shipping status changes.

**Parameters:**

- `$data` (array): Shipping status change data
    ```php
    $data = [
        'order'       => $order,      // \FluentCart\App\Models\Order
        'old_status'  => 'unshipped', // Previous shipping status
        'new_status'  => 'shipped',   // New shipping status
        'manageStock' => true,        // Whether stock management applies
        'activity'    => [
            'title'   => '',
            'content' => '',
        ],
    ];
    ```

**Source:** `app/Events/Order/OrderStatusUpdated.php` (line 87)

**Usage:**
```php
add_action('fluent_cart/shipping_status_changed', function ($data) {
    $order = $data['order'];
    // Log all shipping status transitions
    fluent_cart_add_log(
        'Shipping status changed',
        sprintf('Order #%d: %s -> %s', $order->id, $data['old_status'], $data['new_status']),
        'info'
    );
}, 10, 1);
```
</details>

---

## Refunds

Fired during the refund flow after transaction records have been created. The generic `order_refunded` hook fires on every refund, followed by either `order_fully_refunded` or `order_partially_refunded` depending on the refund type. Refund data includes the [Order](/database/models/order), [OrderItem](/database/models/order-item), [OrderTransaction](/database/models/order-transaction), and [Customer](/database/models/customer) models.

### <code> order_refunded </code>
<details>
<summary><code>fluent_cart/order_refunded</code> &mdash; Fires after any refund (full or partial)</summary>

**When it runs:**
Fires inside `OrderRefund::afterDispatch()` after a refund transaction is recorded and the refund amount is calculated. This hook fires for both full and partial refunds. It fires before the type-specific hooks below.

**Parameters:**

- `$data` (array): Refund data
    ```php
    $data = [
        'order'              => $order,          // \FluentCart\App\Models\Order
        'refunded_items'     => [],              // Array of OrderItem models (looked up from refundedItemIds)
        'new_refunded_items' => [],              // Raw refunded items array with restore_quantity info
        'refunded_amount'    => 5000,            // Newly refunded amount in cents
        'manage_stock'       => true,            // Whether stock should be restored
        'transaction'        => $transaction,    // \FluentCart\App\Models\OrderTransaction (the refund transaction)
        'customer'           => $customer,       // \FluentCart\App\Models\Customer
        'type'               => 'full',          // 'full' or 'partial'
    ];
    ```

**Source:** `app/Events/Order/OrderRefund.php` (line 141)

**Usage:**
```php
add_action('fluent_cart/order_refunded', function ($data) {
    $order = $data['order'];
    $amount = \FluentCart\App\Helpers\Helper::toDecimal($data['refunded_amount']);
    // Notify admin of any refund
    wp_mail(
        get_option('admin_email'),
        sprintf('Refund on Order #%d', $order->id),
        sprintf('A %s refund of %s has been processed.', $data['type'], $amount)
    );
}, 10, 1);
```
</details>

### <code> order_fully_refunded </code>
<details>
<summary><code>fluent_cart/order_fully_refunded</code> &mdash; Fires only when an order is fully refunded</summary>

**When it runs:**
Fires inside `OrderRefund::afterDispatch()` immediately after the generic `order_refunded` hook, but only when the total refunded amount meets or exceeds the order's total paid amount (i.e. full refund).

**Parameters:**

- `$data` (array): Full refund data (identical structure to `order_refunded`)
    ```php
    $data = [
        'order'              => $order,          // \FluentCart\App\Models\Order
        'refunded_items'     => [],              // Array of OrderItem models
        'new_refunded_items' => [],              // Raw refunded items with restore_quantity
        'refunded_amount'    => 10000,           // Refunded amount in cents
        'manage_stock'       => true,            // Whether stock should be restored
        'transaction'        => $transaction,    // \FluentCart\App\Models\OrderTransaction
        'customer'           => $customer,       // \FluentCart\App\Models\Customer
        'type'               => 'full',          // Always 'full' for this hook
    ];
    ```

**Source:** `app/Events/Order/OrderRefund.php` (line 144)

**Usage:**
```php
add_action('fluent_cart/order_fully_refunded', function ($data) {
    $order = $data['order'];
    // Revoke digital access on full refund
    update_user_meta($order->customer_id, 'membership_active', false);
}, 10, 1);
```
</details>

### <code> order_partially_refunded </code>
<details>
<summary><code>fluent_cart/order_partially_refunded</code> &mdash; Fires only when an order is partially refunded</summary>

**When it runs:**
Fires inside `OrderRefund::afterDispatch()` immediately after the generic `order_refunded` hook, but only when the total refunded amount is less than the order's total paid amount (i.e. partial refund).

**Parameters:**

- `$data` (array): Partial refund data (identical structure to `order_refunded`)
    ```php
    $data = [
        'order'              => $order,          // \FluentCart\App\Models\Order
        'refunded_items'     => [],              // Array of OrderItem models
        'new_refunded_items' => [],              // Raw refunded items with restore_quantity
        'refunded_amount'    => 3000,            // Refunded amount in cents
        'manage_stock'       => true,            // Whether stock should be restored
        'transaction'        => $transaction,    // \FluentCart\App\Models\OrderTransaction
        'customer'           => $customer,       // \FluentCart\App\Models\Customer
        'type'               => 'partial',       // Always 'partial' for this hook
    ];
    ```

**Source:** `app/Events/Order/OrderRefund.php` (line 146)

**Usage:**
```php
add_action('fluent_cart/order_partially_refunded', function ($data) {
    $order = $data['order'];
    $customer = $data['customer'];
    // Notify customer of partial refund
    wp_mail(
        $customer->email,
        'Partial Refund Processed',
        sprintf('A partial refund has been issued for Order #%d.', $order->id)
    );
}, 10, 1);
```
</details>

---

## Order Items

Hooks that fire when custom line items on an order are being deleted. These are useful for cleanup or audit logging on custom [OrderItem](/database/models/order-item) records.

### <code> order/before_custom_items_deleted </code>
<details>
<summary><code>fluent_cart/order/before_custom_items_deleted</code> &mdash; Fires before custom line items are deleted</summary>

**When it runs:**
Fires inside `OrderResource::updateOrderItems()` just before custom order items (flagged as `is_custom`) are permanently deleted from the database. Only fires if the filtered collection of custom items is not empty.

**Parameters:**

- `$customItems` (\Illuminate\Support\Collection): Collection of [`\FluentCart\App\Models\OrderItem`](/database/models/order-item) models about to be deleted (only items where `is_custom` is true)
- `$order` ([`\FluentCart\App\Models\Order`](/database/models/order)): The parent order model

**Source:** `api/Resource/OrderResource.php` (line 535)

**Usage:**
```php
add_action('fluent_cart/order/before_custom_items_deleted', function ($customItems, $order) {
    // Archive custom items before they are removed
    foreach ($customItems as $item) {
        fluent_cart_add_log(
            'Custom item removed',
            sprintf('Item "%s" removed from Order #%d', $item->title, $order->id),
            'info'
        );
    }
}, 10, 2);
```
</details>

### <code> order/after_custom_items_deleted </code>
<details>
<summary><code>fluent_cart/order/after_custom_items_deleted</code> &mdash; Fires after custom line items are deleted</summary>

**When it runs:**
Fires inside `OrderResource::updateOrderItems()` immediately after custom order items have been permanently deleted from the database. The collection still holds the model instances (now removed from DB). Only fires if the collection is not empty.

**Parameters:**

- `$customItems` (\Illuminate\Support\Collection): Collection of [`\FluentCart\App\Models\OrderItem`](/database/models/order-item) models that were just deleted
- `$order` ([`\FluentCart\App\Models\Order`](/database/models/order)): The parent order model

**Source:** `api/Resource/OrderResource.php` (line 541)

**Usage:**
```php
add_action('fluent_cart/order/after_custom_items_deleted', function ($customItems, $order) {
    // Recalculate order totals after custom items removed
    $order->recalculateTotals();
}, 10, 2);
```
</details>

---

## Order Lifecycle

General lifecycle hooks that fire at key moments during an [Order](/database/models/order)'s existence: invoice generation, [Customer](/database/models/customer) changes, payment completion, license generation, and receipt viewing.

### <code> order/invoice_number_added </code>
<details>
<summary><code>fluent_cart/order/invoice_number_added</code> &mdash; Fires after an invoice/receipt number is assigned to an order</summary>

**When it runs:**
Fires in two places:
1. Inside the `Order::booted()` `created` callback, immediately after a new order is persisted to the database with an invoice number already set (when payment status is `paid` at creation time).
2. Inside `Order::generateReceiptNumber()`, when a receipt number is generated for an existing order that did not previously have one.

**Parameters:**

- `$data` (array): Order data
    ```php
    $data = [
        'order' => $order, // \FluentCart\App\Models\Order
    ];
    ```

**Source:** `app/Models/Order.php` (lines 60 and 734)

**Usage:**
```php
add_action('fluent_cart/order/invoice_number_added', function ($data) {
    $order = $data['order'];
    // Sync invoice number to external accounting system
    sync_to_accounting($order->id, $order->invoice_no, $order->receipt_number);
}, 10, 1);
```
</details>

### <code> order_customer_changed </code>
<details>
<summary><code>fluent_cart/order_customer_changed</code> &mdash; Fires when the customer assigned to an order changes</summary>

**When it runs:**
Fires inside `OrderController::changeCustomer()` after the order (and any child orders and [subscriptions](/database/models/subscription)) have been reassigned to a new customer, and both the old and new customer stats have been recounted.

**Parameters:**

- `$data` (array): Customer change data
    ```php
    $data = [
        'order'               => $order,        // \FluentCart\App\Models\Order
        'old_customer'        => $oldCustomer,  // \FluentCart\App\Models\Customer|null
        'new_customer'        => $newCustomer,  // \FluentCart\App\Models\Customer
        'connected_order_ids' => [123, 124],    // Array of all order IDs updated (parent + children)
    ];
    ```

**Source:** `app/Http/Controllers/OrderController.php` (line 427)

**Usage:**
```php
add_action('fluent_cart/order_customer_changed', function ($data) {
    $order = $data['order'];
    $oldCustomer = $data['old_customer'];
    $newCustomer = $data['new_customer'];
    // Notify the new customer about the transfer
    wp_mail(
        $newCustomer->email,
        'Order Transferred to Your Account',
        sprintf('Order #%d has been assigned to your account.', $order->id)
    );
}, 10, 1);
```
</details>

### <code> order/generateMissingLicenses </code>
<details>
<summary><code>fluent_cart/order/generateMissingLicenses</code> &mdash; Fires when an admin triggers license generation for an order</summary>

**When it runs:**
Fires inside `OrderController::generateLicense()` when an admin requests license generation for an order that has fewer licenses than expected. This allows license modules to hook in and create the missing license keys.

**Parameters:**

- `$data` (array): Order data
    ```php
    $data = [
        'order' => $order, // \FluentCart\App\Models\Order (with order_items and licenses loaded)
    ];
    ```

**Source:** `app/Http/Controllers/OrderController.php` (line 225)

**Usage:**
```php
add_action('fluent_cart/order/generateMissingLicenses', function ($data) {
    $order = $data['order'];
    // Generate licenses for each eligible order item
    foreach ($order->order_items as $item) {
        generate_license_key($order->id, $item->product_id);
    }
}, 10, 1);
```
</details>

### <code> order_placed_offline </code>
<details>
<summary><code>fluent_cart/order_placed_offline</code> &mdash; Fires when an order is placed via Cash on Delivery or other offline payment</summary>

**When it runs:**
Fires inside `CodHandler::processPayment()` after the order and its [transaction](/database/models/order-transaction) have been created for an offline/COD payment. The [Order](/database/models/order), [Customer](/database/models/customer), and transaction data are all available at this point. The order has its `customer`, `shipping_address`, and `billing_address` relationships loaded.

**Parameters:**

- `$data` (array): Offline order data
    ```php
    $data = [
        'order'       => $order,                  // \FluentCart\App\Models\Order
        'customer'    => $order->customer ?? [],   // \FluentCart\App\Models\Customer or empty array
        'transaction' => $transaction ?? [],        // \FluentCart\App\Models\OrderTransaction or empty array
    ];
    ```

**Source:** `app/Modules/PaymentMethods/Cod/CodHandler.php` (line 55)

**Usage:**
```php
add_action('fluent_cart/order_placed_offline', function ($data) {
    $order = $data['order'];
    // Notify warehouse of new COD order
    wp_mail(
        'warehouse@example.com',
        sprintf('New COD Order #%d', $order->id),
        'A new Cash on Delivery order needs to be prepared for shipment.'
    );
}, 10, 1);
```
</details>

### <code> order_paid_done </code>
<details>
<summary><code>fluent_cart/order_paid_done</code> &mdash; Main lifecycle hook when order payment completes (recommended for integrations)</summary>

**When it runs:**
Fires asynchronously via Action Scheduler after an order's payment is confirmed as `paid`. The `OrderPaid` event enqueues a `fluent_cart/order_paid_ansyc_private_handle` async action, which validates the order is still paid, then dispatches this hook. This is the **recommended hook for third-party integrations** because it runs outside the payment gateway request cycle, avoiding race conditions and timeouts. For subscription or renewal orders, the associated [Subscription](/database/models/subscription) model is included in the data.

**Parameters:**

- `$data` (array): Order payment completion data
    ```php
    $data = [
        'order'        => $order,        // \FluentCart\App\Models\Order
        'transaction'  => $transaction,  // \FluentCart\App\Models\OrderTransaction (latest successful transaction)
        'customer'     => $customer,     // \FluentCart\App\Models\Customer
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription (only for subscription/renewal orders)
    ];
    ```

    > **Note:** The `subscription` key is only present when the order type is `subscription` or `renewal`.

**Source:** `app/Hooks/actions.php` (line 159)

**Usage:**
```php
add_action('fluent_cart/order_paid_done', function ($data) {
    $order = $data['order'];
    $customer = $data['customer'];

    // Grant membership access after payment
    update_user_meta($customer->user_id, 'membership_active', true);

    // Handle subscription orders differently
    if (!empty($data['subscription'])) {
        $subscription = $data['subscription'];
        update_user_meta($customer->user_id, 'subscription_id', $subscription->id);
    }
}, 10, 1);
```
</details>

### <code> order_paid_ansyc_private_handle </code>
<details>
<summary><code>fluent_cart/order_paid_ansyc_private_handle</code> &mdash; Internal async handler that processes post-payment integrations</summary>

**When it runs:**
Enqueued by `OrderPaid::afterDispatch()` as an Action Scheduler async action. The handler in `app/Hooks/actions.php` validates the order, clears the scheduler meta, and then dispatches `fluent_cart/order_paid_done`. It is also dispatched manually in `IntegrationEventListener` for retry scenarios. **You should generally hook into `order_paid_done` instead of this hook.**

**Parameters:**

- `$data` (array): Order identifier
    ```php
    $data = [
        'order_id' => 123, // int: The order ID to process
    ];
    ```

**Source:** `app/Listeners/IntegrationEventListener.php` (line 360), `app/Hooks/actions.php` (line 126)

**Usage:**
```php
// Not recommended for third-party use. Use fluent_cart/order_paid_done instead.
add_action('fluent_cart/order_paid_ansyc_private_handle', function ($data) {
    $orderId = $data['order_id'];
    // Internal processing only
}, 10, 1);
```
</details>

### <code> order/receipt_viewed </code>
<details>
<summary><code>fluent_cart/order/receipt_viewed</code> &mdash; Fires the first time a customer views their order receipt</summary>

**When it runs:**
Fires at the end of receipt rendering (both the `ReceiptRenderer` class and the `receipt_slip.php` view template) when the `$is_first_time` flag is true. This means it only fires once per order, the very first time the receipt page is loaded. Subsequent views do not trigger this hook. The data includes both the [Order](/database/models/order) and [OrderOperation](/database/models/order-operation) models.

**Parameters:**

- `$data` (array): Receipt view data
    ```php
    $data = [
        'order'           => $order,           // \FluentCart\App\Models\Order
        'order_operation' => $order_operation,  // \FluentCart\App\Models\OrderOperation
    ];
    ```

**Source:** `app/Services/Renderer/Receipt/ReceiptRenderer.php` (line 151), `app/Views/invoice/receipt_slip.php` (line 482)

**Usage:**
```php
add_action('fluent_cart/order/receipt_viewed', function ($data) {
    $order = $data['order'];
    // Track receipt view for analytics
    fluent_cart_add_log(
        'Receipt viewed',
        sprintf('Customer viewed receipt for Order #%d', $order->id),
        'info',
        ['module_name' => 'order', 'module_id' => $order->id]
    );
}, 10, 1);
```
</details>

---
