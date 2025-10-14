# Orders

All hooks related to order lifecycle, payments, shipping, and refunds.

### <code> order_created </code>
<details open>
<summary><code>fluent_cart/order_created</code> &mdash; Fired when an order is created</summary>

**When it runs:**
This action is fired immediately after a new order is created in the database, before any payment processing occurs.

**Parameters:**

- `$data` (array): Order creation data
    ```php
    $data = [
        'order' => [
            'id' => 123,
            'customer_id' => 456,
            'status' => 'processing',
            'payment_status' => 'pending',
            'total' => 10000,
            'currency' => 'USD',
            'customer' => [],
            'shipping_address' => [],
            'billing_address' => []
        ],
        'customer' => [],
        'transaction' => []
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/order_created', function($data) {
    $order = $data['order'];
    // Send notification to admin
    wp_mail(
        get_option('admin_email'),
        'New Order #' . $order->id,
        'A new order has been created.'
    );
}, 10, 1);
```
</details>

### <code> order_paid </code>
<details>
<summary><code>fluent_cart/order_paid</code> &mdash; Fired when an order is paid</summary>

**When it runs:**
This action is fired when an order's payment status changes to 'paid', after payment processing is complete.

**Parameters:**

- `$data` (array): Order payment data
    ```php
    $data = [
        'order' => [
            'id' => 123,
            'customer_id' => 456,
            'payment_status' => 'paid',
            'total' => 10000,
            'customer' => [],
            'order_items' => [],
            'shipping_address' => [],
            'billing_address' => []
        ],
        'customer' => [],
        'transaction' => []
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/order_paid', function($data) {
    $order = $data['order'];
    // Grant access to membership
    update_user_meta($order->customer_id, 'membership_active', true);
}, 10, 1);
```
</details>

### <code> order_updated </code>
<details>
<summary><code>fluent_cart/order_updated</code> &mdash; Fired when an order is updated</summary>

**When it runs:**
This action is fired whenever an order's data is modified and saved to the database.

**Parameters:**

- `$data` (array): Order update data
    ```php
    $data = [
        'order' => [
            'id' => 123,
            'customer_id' => 456,
            'status' => 'completed',
            'updated_at' => '2025-01-15 10:30:00'
        ],
        'old_order' => [
            'id' => 123,
            'status' => 'processing'
        ]
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/order_updated', function($data) {
    $order = $data['order'];
    $oldOrder = $data['old_order'];
    // Log order changes
    error_log('Order #' . $order->id . ' updated');
}, 10, 1);
```
</details>

### <code> order_deleted </code>
<details>
<summary><code>fluent_cart/order_deleted</code> &mdash; Fired when an order is deleted</summary>

**When it runs:**
This action is fired before an order is permanently deleted from the database.

**Parameters:**

- `$data` (array): Order deletion data
    ```php
    $data = [
        'order' => [
            'id' => 123,
            'customer_id' => 456,
            'customer' => [],
            'shipping_address' => [],
            'billing_address' => []
        ],
        'customer' => [],
        'connected_order_ids' => [124, 125]
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/order_deleted', function($data) {
    $order = $data['order'];
    // Clean up related data
    delete_user_meta($order->customer_id, 'last_order_id');
}, 10, 1);
```
</details>


### <code> order_canceled </code>
<details>
<summary><code>fluent_cart/order_canceled</code> &mdash; Fired when an order is canceled</summary>

**When it runs:**
This action is fired when an order's status is changed to 'canceled'.

**Parameters:**

- `$data` (array): Order cancellation data
    ```php
    $data = [
        'order' => [
            'id' => 123,
            'customer_id' => 456,
            'status' => 'canceled',
            'customer' => [],
            'shipping_address' => [],
            'billing_address' => []
        ],
        'customer' => []
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/order_canceled', function($data) {
    $order = $data['order'];
    // Restore product stock
    foreach ($order->order_items as $item) {
        // Restore stock logic
    }
}, 10, 1);
```
</details>

### <code> order_status_changed </code>
<details>
<summary><code>fluent_cart/order_status_changed</code> &mdash; Fired when order status changes</summary>

**When it runs:**
This action is fired whenever an order's status is updated to a different value.

**Parameters:**
- `$data` (array): Order status change data
```php
    $data = [
        'order' => [
            'id' => 123,
            'status' => 'completed'
        ],
        'old_status' => 'processing',
        'new_status' => 'completed',
        'manageStock' => true,
        'activity' => []
    ];
```

**Usage:**
```php
add_action('fluent_cart/order_status_changed', function($data) {
    $order = $data['order'];
    // Send status update email
    wp_mail(
        $order->customer->email,
        'Order Status Updated',
        'Your order status: ' . $data['new_status']
    );
}, 10, 1);
```
</details>

### <code> payment_status_changed </code>
<details>
<summary><code>fluent_cart/payment_status_changed</code> &mdash; Fired when payment status changes</summary>

**When it runs:**
This action is fired whenever an order's payment status is updated to a different value.

**Parameters:**

- `$data` (array): Payment status change data
    ```php
    $data = [
        'order' => [
            'id' => 123,
            'payment_status' => 'paid'
        ],
        'old_status' => 'pending',
        'new_status' => 'paid',
        'manageStock' => true,
        'activity' => []
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/payment_status_changed', function($data) {
    $order = $data['order'];
    // Send payment confirmation
    if ($data['new_status'] === 'paid') {
        wp_mail($order->customer->email, 'Payment Confirmed', 'Payment received.');
    }
}, 10, 1);
```
</details>

### <code> payment_status_changed_to_{status} </code>
<details>
<summary><code>fluent_cart/payment_status_changed_to_{status}</code> &mdash; Fired when payment status changes to specific status</summary>

**When it runs:**
This action is fired when payment status changes to a specific status (paid, pending, failed, refunded, etc.).

**Parameters:**

- `$data` (array): Payment status change data
    ```php
    $data = [
        'order' => [
            'id' => 123,
            'payment_status' => 'paid'
        ],
        'old_status' => 'pending',
        'new_status' => 'paid'
    ];
    ```

**Available statuses:** pending, paid, partially_paid, failed, refunded, partially_refunded, authorized

**Usage:**
```php
add_action('fluent_cart/payment_status_changed_to_paid', function($data) {
    $order = $data['order'];
    // Trigger fulfillment
    do_action('custom_fulfillment_start', $order->id);
}, 10, 1);
```

</details>

### <code> order_fully_refunded </code>
<details>
<summary><code>fluent_cart/order_fully_refunded</code> &mdash; Fired when an order is fully refunded</summary>

**When it runs:**
This action is fired when an order receives a full refund.

**Parameters:**

- `$data` (array): Full refund data
    ```php
    $data = [
        'order' => [],
        'refunded_items' => [],
        'new_refunded_items' => [],
        'refunded_amount' => 10000,
        'manage_stock' => true,
        'transaction' => [],
        'customer' => [],
        'type' => 'full'
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/order_fully_refunded', function($data) {
    $order = $data['order'];
    // Revoke access
    update_user_meta($order->customer_id, 'membership_active', false);
}, 10, 1);
```
</details>

### <code> order_partially_refunded </code>
<details>
<summary><code>fluent_cart/order_partially_refunded</code> &mdash; Fired when an order is partially refunded</summary>

**When it runs:**
This action is fired when an order receives a partial refund.

**Parameters:**

- `$data` (array): Partial refund data
    ```php
    $data = [
        'order' => [],
        'refunded_items' => [],
        'new_refunded_items' => [],
        'refunded_amount' => 3000,
        'manage_stock' => true,
        'transaction' => [],
        'customer' => [],
        'type' => 'partial'
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/order_partially_refunded', function($data) {
    $order = $data['order'];
    // Notify customer
    wp_mail($order->customer->email, 'Partial Refund Processed', 'Refund issued.');
}, 10, 1);
```
</details>

---
