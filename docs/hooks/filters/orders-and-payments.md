# Orders & Payments

All filters related to [Order](/database/models/order) lifecycle, payment processing, gateway integrations, and taxes.

## Order Statuses

### <code> order_statuses </code>

<details open>
<summary><code>fluent_cart/order_statuses</code> &mdash; Filter available order statuses</summary>

**When it runs:**
Applied when retrieving the list of available order statuses throughout the admin and storefront.

**Parameters:**
- `$statuses` (array): Associative array of order statuses (key => translated label)
    ```php
    $statuses = [
        'processing' => 'Processing',
        'completed'  => 'Completed',
        'on-hold'    => 'On Hold',
        'canceled'   => 'Canceled',
        'failed'     => 'Failed',
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified order statuses array

**Source:** `app/Helpers/Status.php:159`

**Usage:**
```php
add_filter('fluent_cart/order_statuses', function ($statuses, $data) {
    // Add a custom order status
    $statuses['awaiting_pickup'] = __('Awaiting Pickup', 'my-plugin');
    return $statuses;
}, 10, 2);
```
</details>

### <code> order_statuses (legacy) </code>
<details>
<summary><code>fluent-cart/order_statuses</code> &mdash; Filter order statuses (legacy hook name)</summary>

**When it runs:**
Legacy location of the order statuses filter. Applied in the older Helper class. Prefer `fluent_cart/order_statuses` for new code.

**Parameters:**
- `$statuses` (array): Associative array of order statuses (key => translated label)
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified order statuses array

**Source:** `app/Helpers/Helper.php:140`

**Usage:**
```php
add_filter('fluent-cart/order_statuses', function ($statuses, $data) {
    $statuses['custom'] = __('Custom Status', 'my-plugin');
    return $statuses;
}, 10, 2);
```
</details>

### <code> editable_order_statuses </code>
<details>
<summary><code>fluent_cart/editable_order_statuses</code> &mdash; Filter manually settable order statuses</summary>

**When it runs:**
Applied when building the list of order statuses an admin can manually set on an order. This controls the dropdown options in the order edit screen.

> **Deprecated:** The old hook name `fluent-cart/editable_order_statuses` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**
- `$statuses` (array): Associative array of editable statuses (key => translated label)
    ```php
    $statuses = [
        'on-hold'    => 'On Hold',
        'processing' => 'Processing',
        'completed'  => 'Completed',
        'canceled'   => 'Canceled',
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified editable order statuses array

**Source:** `app/Helpers/Status.php:170,242`

**Usage:**
```php
add_filter('fluent_cart/editable_order_statuses', function ($statuses, $data) {
    // Remove the ability to manually set "canceled"
    unset($statuses['canceled']);
    return $statuses;
}, 10, 2);
```
</details>

### <code> payment_statuses </code>
<details>
<summary><code>fluent_cart/payment_statuses</code> &mdash; Filter payment statuses</summary>

**When it runs:**
Applied when retrieving the list of available payment statuses used across the order and transaction system.

**Parameters:**
- `$statuses` (array): Associative array of payment statuses (key => translated label)
    ```php
    $statuses = [
        'pending'            => 'Pending',
        'paid'               => 'Paid',
        'partially_paid'     => 'Partially Paid',
        'failed'             => 'Failed',
        'refunded'           => 'Refunded',
        'partially_refunded' => 'Partially Refunded',
        'authorized'         => 'Authorized',
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified payment statuses array

**Source:** `app/Helpers/Status.php:183`

**Usage:**
```php
add_filter('fluent_cart/payment_statuses', function ($statuses, $data) {
    $statuses['on_hold'] = __('On Hold', 'my-plugin');
    return $statuses;
}, 10, 2);
```
</details>

### <code> transaction_statuses </code>
<details>
<summary><code>fluent_cart/transaction_statuses</code> &mdash; Filter transaction statuses</summary>

**When it runs:**
Applied when retrieving available transaction statuses for the primary transaction system.

**Parameters:**
- `$statuses` (array): Associative array of transaction statuses (key => translated label)
    ```php
    $statuses = [
        'pending'    => 'Pending',
        'succeeded'  => 'Succeeded',
        'authorized' => 'Authorized',
        'failed'     => 'Failed',
        'refunded'   => 'Refunded',
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified transaction statuses array

**Source:** `app/Helpers/Status.php:197`

**Usage:**
```php
add_filter('fluent_cart/transaction_statuses', function ($statuses, $data) {
    $statuses['disputed'] = __('Disputed', 'my-plugin');
    return $statuses;
}, 10, 2);
```
</details>

### <code> transaction_statuses (legacy) </code>
<details>
<summary><code>fluent-cart/transaction_statuses</code> &mdash; Filter transaction statuses (legacy hook name)</summary>

**When it runs:**
Legacy location of the transaction statuses filter. Applied in the older Helper class. Prefer `fluent_cart/transaction_statuses` for new code.

**Parameters:**
- `$statuses` (array): Associative array of transaction statuses (key => translated label)
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified transaction statuses array

**Source:** `app/Helpers/Helper.php:215`

**Usage:**
```php
add_filter('fluent-cart/transaction_statuses', function ($statuses, $data) {
    return $statuses;
}, 10, 2);
```
</details>

### <code> editable_transaction_statuses </code>
<details>
<summary><code>fluent_cart/editable_transaction_statuses</code> &mdash; Filter manually editable transaction statuses</summary>

**When it runs:**
Applied when building the list of transaction statuses that an admin can manually set.

> **Deprecated:** The old hook name `fluent-cart/editable_transaction_statuses` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**
- `$statuses` (array): Associative array of editable transaction statuses (key => translated label)
    ```php
    $statuses = [
        'pending'    => 'Pending',
        'succeeded'  => 'Succeeded',
        'authorized' => 'Authorized',
        'failed'     => 'Failed',
        'refunded'   => 'Refunded',
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified editable transaction statuses array

**Source:** `app/Helpers/Status.php:214`

**Usage:**
```php
add_filter('fluent_cart/editable_transaction_statuses', function ($statuses, $data) {
    unset($statuses['refunded']);
    return $statuses;
}, 10, 2);
```
</details>

### <code> transaction_success_statuses </code>
<details>
<summary><code>fluent_cart/transaction_success_statuses</code> &mdash; Filter which statuses count as successful transactions</summary>

**When it runs:**
Applied when determining which transaction statuses should be considered "successful" for reporting and order completion logic.

**Parameters:**
- `$statuses` (array): Indexed array of status strings
    ```php
    $statuses = ['succeeded', 'authorized'];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified success statuses array

**Source:** `app/Helpers/Status.php:331`

**Usage:**
```php
add_filter('fluent_cart/transaction_success_statuses', function ($statuses, $data) {
    // Also count "captured" as a success status
    $statuses[] = 'captured';
    return $statuses;
}, 10, 2);
```
</details>

### <code> shipping_statuses (legacy) </code>
<details>
<summary><code>fluent-cart/shipping_statuses</code> &mdash; Filter shipping statuses (legacy hook name)</summary>

**When it runs:**
Legacy location of the shipping statuses filter. Applied in the older Helper class. Prefer `fluent_cart/shipping_statuses` for new code.

**Parameters:**
- `$statuses` (array): Associative array of shipping statuses (key => translated label)
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified shipping statuses array

**Source:** `app/Helpers/Helper.php:170`

**Usage:**
```php
add_filter('fluent-cart/shipping_statuses', function ($statuses, $data) {
    return $statuses;
}, 10, 2);
```
</details>

### <code> shipping_statuses </code>
<details>
<summary><code>fluent_cart/shipping_statuses</code> &mdash; Filter shipping statuses</summary>

**When it runs:**
Applied when retrieving the list of available shipping statuses used for order fulfillment.

**Parameters:**
- `$statuses` (array): Associative array of shipping statuses (key => translated label)
    ```php
    $statuses = [
        'unshipped'   => 'Unshipped',
        'shipped'     => 'Shipped',
        'delivered'   => 'Delivered',
        'unshippable' => 'Unshippable',
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified shipping statuses array

**Source:** `app/Helpers/Status.php:232`

**Usage:**
```php
add_filter('fluent_cart/shipping_statuses', function ($statuses, $data) {
    $statuses['in_transit'] = __('In Transit', 'my-plugin');
    return $statuses;
}, 10, 2);
```
</details>

### <code> editable_shipping_statuses </code>
<details>
<summary><code>fluent_cart/editable_shipping_statuses</code> &mdash; Filter manually settable shipping statuses</summary>

**When it runs:**
Applied when building the list of shipping statuses an admin can manually set on an order.

> **Deprecated:** The old hook name `fluent-cart/editable_order_statuses` (used for shipping) is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**
- `$statuses` (array): Associative array of editable shipping statuses (key => translated label)
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified editable shipping statuses array

**Source:** `app/Helpers/Status.php:242`

**Usage:**
```php
add_filter('fluent_cart/editable_shipping_statuses', function ($statuses, $data) {
    $statuses['ready_to_ship'] = __('Ready to Ship', 'my-plugin');
    return $statuses;
}, 10, 2);
```
</details>

---

## Order Data & Lifecycle

### <code> orders_list </code>
<details>
<summary><code>fluent_cart/orders_list</code> &mdash; Filter the admin orders list</summary>

**When it runs:**
Applied after retrieving the paginated orders collection for the admin orders list view.

**Parameters:**
- `$orders` (LengthAwarePaginator): Paginated collection of orders

**Returns:** `LengthAwarePaginator` — The modified paginated orders collection

**Source:** `app/Http/Controllers/OrderController.php:58`

**Usage:**
```php
add_filter('fluent_cart/orders_list', function ($orders) {
    // Add custom data to each order in the list
    foreach ($orders as $order) {
        $order->custom_badge = get_post_meta($order->id, '_custom_badge', true);
    }
    return $orders;
}, 10, 1);
```
</details>

### <code> order/view </code>
<details>
<summary><code>fluent_cart/order/view</code> &mdash; Filter single order view data</summary>

**When it runs:**
Applied when preparing the data for a single order view in the admin panel.

**Parameters:**
- `$order` (array): The order data array containing all order details
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified order data

**Source:** `app/Http/Controllers/OrderController.php:580`

**Usage:**
```php
add_filter('fluent_cart/order/view', function ($order, $data) {
    // Add custom data to the order view
    $order['custom_field'] = 'Custom Value';
    return $order;
}, 10, 2);
```
</details>

### <code> widgets/single_order </code>
<details>
<summary><code>fluent_cart/widgets/single_order</code> &mdash; Filter single order admin widgets</summary>

**When it runs:**
Applied when loading the stats/widgets section on the single order admin view.

**Parameters:**
- `$widgets` (array): Array of widget data (default empty)
- `$order` ([Order](/database/models/order)): The Order model instance

**Returns:** `array` — Array of widget definitions to display

**Source:** `app/Http/Controllers/OrderController.php:1009`

**Usage:**
```php
add_filter('fluent_cart/widgets/single_order', function ($widgets, $order) {
    $widgets[] = [
        'title' => __('Custom Widget', 'my-plugin'),
        'value' => 'Some data for order #' . $order->id,
    ];
    return $widgets;
}, 10, 2);
```
</details>

### <code> order/is_subscription_allowed_in_manual_order </code>
<details>
<summary><code>fluent_cart/order/is_subscription_allowed_in_manual_order</code> &mdash; Allow subscriptions in manual orders</summary>

**When it runs:**
Applied when creating a manual order that contains subscription items. By default, subscriptions in manual orders are not supported.

**Parameters:**
- `$allowed` (bool): Whether subscriptions are allowed (default `false`)
- `$context` (array): Context data
    ```php
    $context = [
        'order_items' => [...] // Array of order item data
    ];
    ```

**Returns:** `bool` — Whether to allow subscription items in manual orders

**Source:** `app/Http/Controllers/OrderController.php:78`

**Usage:**
```php
add_filter('fluent_cart/order/is_subscription_allowed_in_manual_order', function ($allowed, $context) {
    // Enable subscriptions in manual orders
    return true;
}, 10, 2);
```
</details>

### <code> order/type </code>
<details>
<summary><code>fluent_cart/order/type</code> &mdash; Filter order type during manual creation</summary>

**When it runs:**
Applied when determining the order type during manual order creation. The type is automatically set to `'subscription'` if subscription items are detected, otherwise `'payment'`.

**Parameters:**
- `$type` (string): The order type (`'payment'` or `'subscription'`)
- `$data` (array): Additional context data (empty array)

**Returns:** `string` — The order type string

**Source:** `app/Http/Controllers/OrderController.php:91`

**Usage:**
```php
add_filter('fluent_cart/order/type', function ($type, $data) {
    return $type;
}, 10, 2);
```
</details>

### <code> order/expected_license_count </code>
<details>
<summary><code>fluent_cart/order/expected_license_count</code> &mdash; Filter expected license count for an order</summary>

**When it runs:**
Applied when checking how many licenses should exist for an order. Used to detect missing licenses that need to be regenerated.

**Parameters:**
- `$count` (int): Expected number of licenses (default `0`)
- `$context` (array): Context data
    ```php
    $context = [
        'order_items' => [...] // Collection of order items
    ];
    ```

**Returns:** `int` — The expected number of licenses

**Source:** `app/Http/Controllers/OrderController.php:215,585`

**Usage:**
```php
add_filter('fluent_cart/order/expected_license_count', function ($count, $context) {
    foreach ($context['order_items'] as $item) {
        if ($item->requires_license) {
            $count += $item->quantity;
        }
    }
    return $count;
}, 10, 2);
```
</details>

### <code> create_receipt_number_on_order_create </code>
<details>
<summary><code>fluent_cart/create_receipt_number_on_order_create</code> &mdash; Force receipt number generation on order creation</summary>

**When it runs:**
Applied during the order `creating` model event. By default, receipt numbers are only generated when the payment status is `'paid'`. Return `true` to always generate a receipt number.

**Parameters:**
- `$force` (bool): Whether to force receipt number creation (default `false`)

**Returns:** `bool` — Whether to generate a receipt number regardless of payment status

**Source:** `app/Models/Order.php:52`

**Usage:**
```php
add_filter('fluent_cart/create_receipt_number_on_order_create', function ($force) {
    // Always create a receipt number when an order is created
    return true;
}, 10, 1);
```
</details>

### <code> single_order_downloads </code>
<details>
<summary><code>fluent_cart/single_order_downloads</code> &mdash; Filter order downloads data</summary>

**When it runs:**
Applied when preparing the downloadable files for a specific order, allowing you to add, remove, or modify download data.

**Parameters:**
- `$downloadData` (array): Array of download groups
    ```php
    $downloadData = [
        [
            'title'           => 'Product Name - Variation Title',
            'product_id'      => 123,
            'variation_id'    => 456,
            'additional_html' => '',
            'downloads'       => [
                ['id' => 1, 'name' => 'File Name', 'url' => '...']
            ]
        ]
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'order' => Order,  // The Order model instance
        'scope' => 'admin' // 'admin' or 'customer'
    ];
    ```

**Returns:** `array` — The modified download data array

**Source:** `app/Models/Order.php:657`

**Usage:**
```php
add_filter('fluent_cart/single_order_downloads', function ($downloadData, $context) {
    // Add a bonus download for completed orders
    if ($context['order']->status === 'completed') {
        $downloadData[] = [
            'title'     => 'Bonus Content',
            'downloads' => [
                ['name' => 'Bonus File', 'url' => 'https://example.com/bonus.pdf']
            ]
        ];
    }
    return $downloadData;
}, 10, 2);
```
</details>

### <code> order_can_be_deleted </code>
<details>
<summary><code>fluent_cart/order_can_be_deleted</code> &mdash; Filter whether an order can be deleted</summary>

**When it runs:**
Applied when checking if an order is eligible for deletion. By default, orders with active subscriptions cannot be deleted.

**Parameters:**
- `$canBeDeleted` (true|WP_Error): `true` if deletable, or a `WP_Error` with the reason
- `$context` (array): Context data
    ```php
    $context = [
        'order' => Order // The Order model instance
    ];
    ```

**Returns:** `true|WP_Error` — `true` to allow deletion, or `WP_Error` to block it

**Source:** `app/Models/Order.php:812`

**Usage:**
```php
add_filter('fluent_cart/order_can_be_deleted', function ($canBeDeleted, $context) {
    $order = $context['order'];
    // Prevent deletion of orders less than 30 days old
    if (strtotime($order->created_at) > strtotime('-30 days')) {
        return new \WP_Error('too_recent', __('Orders less than 30 days old cannot be deleted.', 'my-plugin'));
    }
    return $canBeDeleted;
}, 10, 2);
```
</details>

### <code> order/delete_test_orders_batch_size </code>
<details>
<summary><code>fluent_cart/order/delete_test_orders_batch_size</code> &mdash; Control batch size when deleting test orders</summary>

**When it runs:**
Applied when bulk-deleting test orders, controlling how many orders are processed per batch.

**Source:** `app/Http/Controllers/OrderController.php:995`

**Parameters:**

- `$batchSize` (int): The batch size (default `50`)

**Returns:**
- `int` — The modified batch size (minimum 1)

**Usage:**
```php
add_filter('fluent_cart/order/delete_test_orders_batch_size', function ($batchSize) {
    // Process smaller batches to reduce memory usage
    return 25;
});
```
</details>

### <code> order/custom_item_changed </code>
<details>
<summary><code>fluent_cart/order/custom_item_changed</code> &mdash; Filter custom order item changes</summary>

**When it runs:**
Applied when a custom order item is updated, allowing validation or modification of item changes before persistence.

**Source:** `api/Resource/OrderItemResource.php:256`

**Parameters:**

- `$oldItem` (array): The existing item data
- `$newItem` (array): The updated item data

**Returns:**
- `array` — The modified item data to save

**Usage:**
```php
add_filter('fluent_cart/order/custom_item_changed', function ($oldItem, $newItem) {
    // Recalculate tax when price changes
    if ($oldItem['item_price'] !== $newItem['item_price']) {
        $newItem['tax_amount'] = calculate_tax($newItem['item_price']);
    }
    return $newItem;
}, 10, 2);
```
</details>

### <code> min_receipt_number </code>
<details>
<summary><code>fluent_cart/min_receipt_number</code> &mdash; Filter the minimum receipt number</summary>

**When it runs:**
Applied when calculating the next receipt number. If the computed next number is below this minimum, it will be bumped up.

**Parameters:**
- `$min` (int): The minimum receipt number from store settings (default `1`)

**Returns:** `int` — The minimum receipt number to enforce

**Source:** `app/Services/OrderService.php:572`

**Usage:**
```php
add_filter('fluent_cart/min_receipt_number', function ($min) {
    // Start receipt numbers from 1000
    return 1000;
}, 10, 1);
```
</details>

### <code> invoice_prefix </code>
<details>
<summary><code>fluent_cart/invoice_prefix</code> &mdash; Filter the invoice number prefix</summary>

**When it runs:**
Applied when generating the invoice number string for new orders. The invoice number is formed as `prefix + receipt_number`.

**Parameters:**
- `$prefix` (string): The invoice prefix from store settings (default `'INV-'`)

**Returns:** `string` — The modified invoice prefix

**Source:** `app/Services/OrderService.php:584`

**Usage:**
```php
add_filter('fluent_cart/invoice_prefix', function ($prefix) {
    // Use a year-based prefix
    return 'INV-' . date('Y') . '-';
}, 10, 1);
```
</details>

### <code> order_refund_manually </code>
<details>
<summary><code>fluent_cart/order_refund_manually</code> &mdash; Intercept manual refund processing</summary>

**When it runs:**
Applied during the refund process before the payment gateway refund method is called. Allows you to handle refunds through a custom mechanism instead of the gateway.

**Parameters:**
- `$manualRefund` (array): Manual refund status
    ```php
    $manualRefund = [
        'status' => 'no',    // 'yes' to skip gateway refund
        'source' => ''       // Identifier for the manual refund source
    ];
    ```
- `$context` (array): Refund context data
    ```php
    $context = [
        'refund_amount' => 5000,           // Amount in cents
        'transaction'   => Transaction,     // OrderTransaction model
        'order'         => Order,           // Order model
        'args'          => ['reason' => ''] // Additional refund arguments
    ];
    ```

**Returns:** `array` — Array with `'status'` key set to `'yes'` to skip the gateway refund

**Source:** `app/Services/Payments/Refund.php:65`

**Usage:**
```php
add_filter('fluent_cart/order_refund_manually', function ($manualRefund, $context) {
    // Handle refund via a custom service
    $result = my_custom_refund($context['transaction'], $context['refund_amount']);
    if ($result) {
        return ['status' => 'yes', 'source' => 'my_custom_service'];
    }
    return $manualRefund;
}, 10, 2);
```
</details>

### <code> order_status/auto_complete_digital_order </code>
<details>
<summary><code>fluent_cart/order_status/auto_complete_digital_order</code> &mdash; Control auto-completion of digital orders</summary>

**When it runs:**
Applied during payment status reconciliation. When a digital (non-physical) order is paid, it is automatically marked as completed. Return `false` to prevent this behavior.

**Parameters:**
- `$autoComplete` (bool): Whether to auto-complete the order (default `true`)
- `$context` (array): Context data
    ```php
    $context = [
        'order' => Order // The Order model instance
    ];
    ```

**Returns:** `bool` — Whether to automatically complete the digital order

**Source:** `app/Helpers/StatusHelper.php:193`

**Usage:**
```php
add_filter('fluent_cart/order_status/auto_complete_digital_order', function ($autoComplete, $context) {
    // Require manual review for high-value digital orders
    if ($context['order']->total > 50000) { // > $500
        return false;
    }
    return $autoComplete;
}, 10, 2);
```
</details>

### <code> customer/order_data </code>
<details>
<summary><code>fluent_cart/customer/order_data</code> &mdash; Filter customer portal order data</summary>

**When it runs:**
Applied when preparing order data for display in the customer-facing order details page.

**Parameters:**
- `$formattedOrderData` (array): The formatted order data array
- `$context` (array): Context data
    ```php
    $context = [
        'order'    => Order,    // The Order model instance
        'customer' => Customer  // The Customer model instance
    ];
    ```

**Returns:** `array` — The modified formatted order data

**Source:** `app/Http/Controllers/FrontendControllers/CustomerOrderController.php:285`

**Usage:**
```php
add_filter('fluent_cart/customer/order_data', function ($formattedOrderData, $context) {
    // Add custom data visible to customers
    $formattedOrderData['estimated_delivery'] = get_post_meta(
        $context['order']->id, '_estimated_delivery', true
    );
    return $formattedOrderData;
}, 10, 2);
```
</details>

### <code> customer/order_details_section_parts </code>
<details>
<summary><code>fluent_cart/customer/order_details_section_parts</code> &mdash; Filter customer order detail sections</summary>

**When it runs:**
Applied when building the customer-facing order details page. Allows you to inject custom HTML content into predefined section slots.

**Parameters:**
- `$sections` (array): HTML content for each section slot
    ```php
    $sections = [
        'before_summary'      => '',
        'after_summary'       => '',
        'after_licenses'      => '',
        'after_subscriptions' => '',
        'after_downloads'     => '',
        'after_transactions'  => '',
        'end_of_order'        => '',
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'order'         => Order, // The Order model instance
        'formattedData' => [...]  // The formatted order data array
    ];
    ```

**Returns:** `array` — The modified sections array with HTML content

**Source:** `app/Http/Controllers/FrontendControllers/CustomerOrderController.php:292`

**Usage:**
```php
add_filter('fluent_cart/customer/order_details_section_parts', function ($sections, $context) {
    $sections['after_summary'] = '<div class="custom-notice">Thank you for your order!</div>';
    return $sections;
}, 10, 2);
```
</details>

---

## Payment Processing

### <code> ipn_url_{$slug} </code>
<details>
<summary><code>fluent_cart/ipn_url_{$slug}</code> &mdash; Filter IPN/webhook listener URL for a payment gateway</summary>

**When it runs:**
Applied when generating the IPN (Instant Payment Notification) or webhook listener URL for a specific payment method. The `{$slug}` is the gateway slug (e.g., `stripe`, `paypal`).

> **Deprecated:** The old hook name `fluent_cart_ipn_url_{$slug}` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**
- `$urlData` (array): Array containing the listener URL
    ```php
    $urlData = [
        'listener_url' => 'https://yoursite.com/?fct_payment_listener=1&method=stripe'
    ];
    ```

**Returns:** `array` — The modified URL data array

**Source:** `app/Services/Payments/PaymentHelper.php:28`

**Usage:**
```php
add_filter('fluent_cart/ipn_url_stripe', function ($urlData) {
    // Use a custom endpoint for Stripe webhooks
    $urlData['listener_url'] = home_url('/custom-stripe-webhook/');
    return $urlData;
}, 10, 1);
```
</details>

### <code> payment/success_url </code>
<details>
<summary><code>fluent_cart/payment/success_url</code> &mdash; Filter the payment success redirect URL</summary>

**When it runs:**
Applied when generating the URL the customer is redirected to after a successful payment.

> **Deprecated:** The old hook name `fluentcart/payment/success_url` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**
- `$url` (string): The success redirect URL (receipt page with query args)
- `$context` (array): Context data
    ```php
    $context = [
        'transaction_hash' => 'abc123...',  // Transaction UUID
        'args'             => [],           // Additional arguments
        'payment_method'   => 'stripe'      // Gateway slug
    ];
    ```

**Returns:** `string` — The modified success URL

**Source:** `app/Services/Payments/PaymentHelper.php:55`

**Usage:**
```php
add_filter('fluent_cart/payment/success_url', function ($url, $context) {
    // Redirect to a custom thank-you page
    return add_query_arg('trx_hash', $context['transaction_hash'], home_url('/thank-you/'));
}, 10, 2);
```
</details>

### <code> default_payment_method_for_zero_payment </code>
<details>
<summary><code>fluent_cart/default_payment_method_for_zero_payment</code> &mdash; Filter the default payment method for zero-total orders</summary>

**When it runs:**
Applied during checkout validation when the order total (including recurring) is zero. Determines which payment method handles the $0 transaction.

**Parameters:**
- `$method` (string): Payment method slug (default `'offline_payment'`)
- `$data` (array): Additional context data (empty array)

**Returns:** `string` — The payment method slug to use for zero-total orders

**Source:** `app/Services/Payments/PaymentHelper.php:70`

**Usage:**
```php
add_filter('fluent_cart/default_payment_method_for_zero_payment', function ($method, $data) {
    // Use Stripe for free trials that have recurring charges
    return 'stripe';
}, 10, 2);
```
</details>

### <code> get_payment_connect_info_{$method} </code>
<details>
<summary><code>fluent_cart/get_payment_connect_info_{$method}</code> &mdash; Filter payment method connection info</summary>

**When it runs:**
Applied when retrieving connection/setup information for a specific payment method. The `{$method}` is the sanitized gateway slug. Used by gateways that require an OAuth connection flow.

**Parameters:**
- `$info` (array): Connection info array (default empty)
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The payment method connection information

**Source:** `api/PaymentMethods.php:105`

**Usage:**
```php
add_filter('fluent_cart/get_payment_connect_info_stripe', function ($info, $data) {
    $info['connected'] = true;
    $info['account_id'] = 'acct_xxx';
    return $info;
}, 10, 2);
```
</details>

### <code> transaction/url_{$payment_method} </code>
<details>
<summary><code>fluent_cart/transaction/url_{$payment_method}</code> &mdash; Filter the vendor dashboard URL for a transaction</summary>

**When it runs:**
Applied when generating the URL attribute of an [`OrderTransaction`](/database/models/order-transaction) model. The `{$payment_method}` is the gateway slug. This URL typically links to the transaction in the payment provider's dashboard.

**Parameters:**
- `$url` (string): The vendor URL (default empty string)
- `$context` (array): Context data
    ```php
    $context = [
        'transaction'      => OrderTransaction, // The transaction model
        'payment_mode'     => 'live',           // 'live' or 'test'
        'vendor_charge_id' => 'ch_xxx',         // External charge ID
        'transaction_type' => 'charge'          // Transaction type
    ];
    ```

**Returns:** `string` — The URL to the transaction in the payment provider's dashboard

**Source:** `app/Models/OrderTransaction.php:111`

**Usage:**
```php
add_filter('fluent_cart/transaction/url_stripe', function ($url, $context) {
    $chargeId = $context['vendor_charge_id'];
    $mode = $context['payment_mode'] === 'test' ? 'test/' : '';
    return "https://dashboard.stripe.com/{$mode}payments/{$chargeId}";
}, 10, 2);
```
</details>

### <code> transaction/receipt_page_url </code>
<details>
<summary><code>fluent_cart/transaction/receipt_page_url</code> &mdash; Filter the transaction receipt page URL</summary>

**When it runs:**
Applied when generating the public-facing receipt page URL for a transaction, typically used in email notifications and customer-facing links.

> **Deprecated:** The old hook name `fluentcart/transaction/receipt_page_url` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**
- `$url` (string): The receipt page URL with `trx_hash` query parameter
- `$context` (array): Context data
    ```php
    $context = [
        'transaction' => OrderTransaction, // The transaction model
        'order'       => Order             // The parent order model
    ];
    ```

**Returns:** `string` — The modified receipt page URL

**Source:** `app/Models/OrderTransaction.php:188`

**Usage:**
```php
add_filter('fluent_cart/transaction/receipt_page_url', function ($url, $context) {
    // Use a custom receipt page
    return add_query_arg('trx_hash', $context['transaction']->uuid, home_url('/my-receipt/'));
}, 10, 2);
```
</details>

---

## Stripe

### <code> stripe_settings </code>
<details>
<summary><code>fluent_cart/stripe_settings</code> &mdash; Filter Stripe gateway settings</summary>

**When it runs:**
Applied when loading Stripe gateway settings during initialization.

**Parameters:**
- `$settings` (array): The Stripe settings array including keys, modes, and configuration options

**Returns:** `array` — The modified Stripe settings

**Source:** `app/Modules/PaymentMethods/StripeGateway/StripeSettingsBase.php:38`

**Usage:**
```php
add_filter('fluent_cart/stripe_settings', function ($settings) {
    // Force test mode in staging environments
    if (wp_get_environment_type() === 'staging') {
        $settings['payment_mode'] = 'test';
    }
    return $settings;
}, 10, 1);
```
</details>

### <code> payments/stripe_metadata_subscription </code>
<details>
<summary><code>fluent_cart/payments/stripe_metadata_subscription</code> &mdash; Filter Stripe subscription metadata</summary>

**When it runs:**
Applied when creating a Stripe subscription, allowing you to add or modify metadata sent to Stripe's subscription object.

**Parameters:**
- `$metadata` (array): The metadata array for the Stripe subscription
    ```php
    $metadata = [
        'fct_ref_id'        => 'order-uuid',
        'email'             => 'customer@example.com',
        'name'              => 'Customer Name',
        'subscription_item' => 'Product Name',
        'order_reference'   => 'fct_order_id_123',
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'order'        => Order,        // Order model
        'transaction'  => Transaction,  // OrderTransaction model
        'subscription' => Subscription  // Subscription model
    ];
    ```

**Returns:** `array` — The modified metadata array (max 50 keys per Stripe limits)

**Source:** `app/Modules/PaymentMethods/StripeGateway/Processor.php:90`

**Usage:**
```php
add_filter('fluent_cart/payments/stripe_metadata_subscription', function ($metadata, $context) {
    $metadata['affiliate_id'] = get_user_meta($context['order']->customer->user_id, 'affiliate_id', true);
    return $metadata;
}, 10, 2);
```
</details>

### <code> payments/stripe_metadata_onetime </code>
<details>
<summary><code>fluent_cart/payments/stripe_metadata_onetime</code> &mdash; Filter Stripe one-time payment metadata</summary>

**When it runs:**
Applied when creating a Stripe payment intent for a one-time (non-subscription) payment.

**Parameters:**
- `$metadata` (array): The metadata array for the Stripe payment intent
    ```php
    $metadata = [
        'fct_ref_id'      => 'order-uuid',
        'Name'            => 'Customer Name',
        'Email'           => 'customer@example.com',
        'order_reference' => 'fct_order_id_123',
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'order'       => Order,       // Order model
        'transaction' => Transaction  // OrderTransaction model
    ];
    ```

**Returns:** `array` — The modified metadata array (max 50 keys per Stripe limits)

**Source:** `app/Modules/PaymentMethods/StripeGateway/Processor.php:221`

**Usage:**
```php
add_filter('fluent_cart/payments/stripe_metadata_onetime', function ($metadata, $context) {
    $metadata['campaign'] = 'spring_sale_2025';
    if (isset($context['order'])) {
        $metadata['customer_id'] = $context['order']->customer_id;
    }
    return $metadata;
}, 10, 2);
```
</details>

### <code> payments/stripe_onetime_intent_args </code>
<details>
<summary><code>fluent_cart/payments/stripe_onetime_intent_args</code> &mdash; Filter Stripe payment intent arguments</summary>

**When it runs:**
Applied after building the full payment intent data array, just before creating the intent via the Stripe API. This is the last chance to modify intent parameters.

**Parameters:**
- `$intentData` (array): The payment intent arguments
    ```php
    $intentData = [
        'amount'                    => 5000,        // In smallest currency unit
        'currency'                  => 'usd',
        'automatic_payment_methods' => ['enabled' => 'true'],
        'metadata'                  => [...],
        'customer'                  => 'cus_xxx',
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'order'       => Order,       // Order model
        'transaction' => Transaction  // OrderTransaction model
    ];
    ```

**Returns:** `array` — The modified payment intent arguments

**Source:** `app/Modules/PaymentMethods/StripeGateway/Processor.php:257`

**Usage:**
```php
add_filter('fluent_cart/payments/stripe_onetime_intent_args', function ($intentData, $context) {
    // Add a statement descriptor
    $intentData['statement_descriptor_suffix'] = 'Order ' . $context['order']->id;
    return $intentData;
}, 10, 2);
```
</details>

### <code> payments/stripe_checkout_session_args </code>
<details>
<summary><code>fluent_cart/payments/stripe_checkout_session_args</code> &mdash; Filter Stripe Checkout session arguments (one-time)</summary>

**When it runs:**
Applied when creating a Stripe Checkout session for one-time (non-subscription) hosted payments.

**Parameters:**
- `$sessionData` (array): The Checkout session arguments
    ```php
    $sessionData = [
        'customer'            => 'cus_xxx',
        'client_reference_id' => 'order-uuid',
        'line_items'          => [...],
        'mode'                => 'payment',
        'success_url'         => '...',
        'cancel_url'          => '...',
        'metadata'            => [...],
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'order'       => Order,       // Order model
        'transaction' => Transaction  // OrderTransaction model
    ];
    ```

**Returns:** `array` — The modified Checkout session arguments

**Source:** `app/Modules/PaymentMethods/StripeGateway/Processor.php:356`

**Usage:**
```php
add_filter('fluent_cart/payments/stripe_checkout_session_args', function ($sessionData, $context) {
    // Enable promotion codes on the Checkout page
    $sessionData['allow_promotion_codes'] = true;
    return $sessionData;
}, 10, 2);
```
</details>

### <code> payments/stripe_subscription_checkout_session_args </code>
<details>
<summary><code>fluent_cart/payments/stripe_subscription_checkout_session_args</code> &mdash; Filter Stripe Checkout session arguments (subscription)</summary>

**When it runs:**
Applied when creating a Stripe Checkout session for subscription-based hosted payments.

**Parameters:**
- `$sessionData` (array): The Checkout session arguments
    ```php
    $sessionData = [
        'customer'            => 'cus_xxx',
        'client_reference_id' => 'order-uuid',
        'line_items'          => [...],
        'mode'                => 'subscription',
        'success_url'         => '...',
        'cancel_url'          => '...',
        'subscription_data'   => ['metadata' => [...]],
        'metadata'            => [...],
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'order'        => Order,        // Order model
        'transaction'  => Transaction,  // OrderTransaction model
        'subscription' => Subscription  // Subscription model
    ];
    ```

**Returns:** `array` — The modified Checkout session arguments

**Source:** `app/Modules/PaymentMethods/StripeGateway/Processor.php:509`

**Usage:**
```php
add_filter('fluent_cart/payments/stripe_subscription_checkout_session_args', function ($sessionData, $context) {
    // Add tax ID collection
    $sessionData['tax_id_collection'] = ['enabled' => true];
    return $sessionData;
}, 10, 2);
```
</details>

### <code> stripe_idempotency_key </code>
<details>
<summary><code>fluent_cart/stripe_idempotency_key</code> &mdash; Filter the Stripe idempotency key</summary>

**When it runs:**
Applied when sending charge requests to the Stripe API. The idempotency key prevents duplicate charges from being created.

> **Deprecated:** The old hook name `fluent_cart_stripe_idempotency_key` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**
- `$key` (string): The generated idempotency key
- `$context` (array): Context data
    ```php
    $context = [
        'request' => [...] // The Stripe API request body
    ];
    ```

**Returns:** `string` — The modified idempotency key

**Source:** `app/Modules/PaymentMethods/StripeGateway/API/ApiRequest.php:119`

**Usage:**
```php
add_filter('fluent_cart/stripe_idempotency_key', function ($key, $context) {
    // Use a custom idempotency key format
    return 'fct_' . md5($key . time());
}, 10, 2);
```
</details>

### <code> stripe_request_body </code>
<details>
<summary><code>fluent_cart/stripe_request_body</code> &mdash; Filter the Stripe API request body</summary>

**When it runs:**
Applied just before every request is sent to the Stripe API. This is a low-level filter that affects all Stripe API calls.

> **Deprecated:** The old hook name `fluent_cart_stripe_request_body` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**
- `$request` (array): The request body data
- `$context` (array): Context data
    ```php
    $context = [
        'api' => 'charges' // The Stripe API endpoint being called
    ];
    ```

**Returns:** `array` — The modified request body

**Source:** `app/Modules/PaymentMethods/StripeGateway/API/ApiRequest.php:130`

**Usage:**
```php
add_filter('fluent_cart/stripe_request_body', function ($request, $context) {
    // Log all Stripe API requests
    error_log('Stripe API call to: ' . $context['api']);
    return $request;
}, 10, 2);
```
</details>

### <code> form_disable_stripe_connect </code>
<details>
<summary><code>fluent_cart/form_disable_stripe_connect</code> &mdash; Disable Stripe Connect provider option</summary>

**When it runs:**
Applied when rendering the Stripe settings form. Return `true` to force the use of manual API keys instead of Stripe Connect.

> **Deprecated:** The old hook name `fluent_cart_form_disable_stripe_connect` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**
- `$disable` (bool): Whether to disable Stripe Connect (default `false`)
- `$data` (array): Additional context data (empty array)

**Returns:** `bool` — `true` to disable Stripe Connect and force API keys mode

**Source:** `app/Modules/PaymentMethods/StripeGateway/Stripe.php:265`

**Usage:**
```php
add_filter('fluent_cart/form_disable_stripe_connect', function ($disable, $data) {
    // Force manual API keys
    return true;
}, 10, 2);
```
</details>

### <code> stripe_appearance </code>
<details>
<summary><code>fluent_cart/stripe_appearance</code> &mdash; Filter Stripe Elements appearance configuration</summary>

**When it runs:**
Applied when initializing Stripe Elements on the checkout page. Controls the visual theme and styling of the embedded payment form.

> **Deprecated:** The old hook name `fluent_cart_stripe_appearance` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**
- `$appearance` (array): Stripe Elements appearance configuration
    ```php
    $appearance = [
        'theme' => 'stripe' // 'stripe', 'night', 'flat', or custom
    ];
    ```

**Returns:** `array` — The modified appearance configuration (follows [Stripe Appearance API](https://docs.stripe.com/elements/appearance-api))

**Source:** `app/Modules/PaymentMethods/StripeGateway/Stripe.php:433`

**Usage:**
```php
add_filter('fluent_cart/stripe_appearance', function ($appearance) {
    return [
        'theme'     => 'night',
        'variables' => [
            'colorPrimary'    => '#0570de',
            'borderRadius'    => '8px',
            'fontFamily'      => 'Inter, system-ui, sans-serif',
        ],
    ];
}, 10, 1);
```
</details>

### <code> stripe/setup_intent_rate_limit_customer_daily </code>
<details>
<summary><code>fluent_cart/stripe/setup_intent_rate_limit_customer_daily</code> &mdash; Filter the daily SetupIntent rate limit per customer</summary>

**When it runs:**
Applied when checking and enforcing the rate limit for Stripe SetupIntent creation (used for subscription card updates). Prevents card testing fraud.

**Parameters:**
- `$limit` (int): Maximum number of SetupIntent attempts per customer per day (default `3`)
- `$customerId` (string): The Stripe customer ID

**Returns:** `int` — The modified daily rate limit

**Source:** `app/Modules/PaymentMethods/StripeGateway/SubscriptionsManager.php:85,101`

**Usage:**
```php
add_filter('fluent_cart/stripe/setup_intent_rate_limit_customer_daily', function ($limit, $customerId) {
    // Allow more attempts for trusted customers
    return 5;
}, 10, 2);
```
</details>

### <code> stripe/fallback_order_transaction </code>
<details>
<summary><code>fluent_cart/stripe/fallback_order_transaction</code> &mdash; Provide a fallback transaction for Stripe webhook events</summary>

**When it runs:**
Applied during Stripe webhook processing (`charge.refunded` or `charge.succeeded`) when no matching [`OrderTransaction`](/database/models/order-transaction) can be found by `vendor_charge_id`. Allows you to resolve the transaction through custom logic.

**Parameters:**
- `$transaction` ([OrderTransaction](/database/models/order-transaction)|null): The fallback transaction (default `null`)
- `$vendorDataObject` (object): The Stripe event data object containing charge details

**Returns:** [OrderTransaction](/database/models/order-transaction)|null — An `OrderTransaction` instance or `null` if not found

**Source:** `app/Modules/PaymentMethods/StripeGateway/Webhook/Webhook.php:121`

**Usage:**
```php
add_filter('fluent_cart/stripe/fallback_order_transaction', function ($transaction, $vendorDataObject) {
    // Look up transaction by metadata
    if (isset($vendorDataObject->metadata->fct_ref_id)) {
        $order = \FluentCart\App\Models\Order::where('uuid', $vendorDataObject->metadata->fct_ref_id)->first();
        if ($order) {
            return \FluentCart\App\Models\OrderTransaction::where('order_id', $order->id)
                ->where('transaction_type', 'charge')
                ->first();
        }
    }
    return $transaction;
}, 10, 2);
```
</details>

---

## PayPal

### <code> paypal_plan_id </code>
<details>
<summary><code>fluent_cart/paypal_plan_id</code> &mdash; Filter the PayPal plan ID for subscriptions</summary>

**When it runs:**
Applied when generating or resolving the PayPal billing plan ID for a subscription product variation. The plan ID is a computed string based on currency, variation, billing interval, and other parameters.

**Parameters:**
- `$planId` (string): The generated plan ID string
- `$context` (array): Context data
    ```php
    $context = [
        'plan_data' => [...],       // Plan configuration data
        'variation' => Variation,   // Product variation model
        'product'   => Product      // Product model
    ];
    ```

**Returns:** `string` — The modified PayPal plan ID

**Source:** `app/Modules/PaymentMethods/PayPalGateway/PayPalHelper.php:54`

**Usage:**
```php
add_filter('fluent_cart/paypal_plan_id', function ($planId, $context) {
    // Use a custom plan ID format
    return 'custom_plan_' . $context['variation']->id;
}, 10, 2);
```
</details>

### <code> payments/paypal_sdk_src </code>
<details>
<summary><code>fluent_cart/payments/paypal_sdk_src</code> &mdash; Filter the PayPal SDK JavaScript source URL</summary>

**When it runs:**
Applied when generating the PayPal JavaScript SDK script URL for the checkout page.

**Parameters:**
- `$sdkSrc` (string): The PayPal SDK URL with query parameters (client-id, currency, intent, vault, etc.)
- `$data` (array): Additional context data (empty array)

**Returns:** `string` — The modified PayPal SDK URL

**Source:** `app/Modules/PaymentMethods/PayPalGateway/PayPal.php:518`

**Usage:**
```php
add_filter('fluent_cart/payments/paypal_sdk_src', function ($sdkSrc, $data) {
    // Add locale parameter
    return add_query_arg('locale', 'en_US', $sdkSrc);
}, 10, 2);
```
</details>

### <code> payments/paypal/disable_webhook_verification </code>
<details>
<summary><code>fluent_cart/payments/paypal/disable_webhook_verification</code> &mdash; Disable PayPal webhook signature verification</summary>

**When it runs:**
Applied at the start of PayPal webhook verification. Return `'yes'` to skip signature verification entirely. Only use this for debugging or in environments where verification cannot work.

**Parameters:**
- `$disable` (string): Whether to disable verification (default `'no'`)
- `$data` (array): Additional context data (empty array)

**Returns:** `string` — `'yes'` to skip verification, `'no'` to verify normally

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php:179`

**Usage:**
```php
add_filter('fluent_cart/payments/paypal/disable_webhook_verification', function ($disable, $data) {
    // Disable verification in local development
    if (wp_get_environment_type() === 'local') {
        return 'yes';
    }
    return $disable;
}, 10, 2);
```
</details>

### <code> payments/paypal/verify_webhook </code>
<details>
<summary><code>fluent_cart/payments/paypal/verify_webhook</code> &mdash; Control PayPal webhook verification</summary>

**When it runs:**
Applied before the actual PayPal webhook signature verification step in the main webhook processing flow. Return `false` to skip verification for specific webhook types or modes.

**Parameters:**
- `$verify` (bool): Whether to verify the webhook (default `true`)
- `$context` (array): Context data
    ```php
    $context = [
        'data' => [...],         // The webhook payload
        'mode' => 'live',        // 'live' or 'test'
        'type' => 'PAYMENT.SALE.COMPLETED' // Webhook event type
    ];
    ```

**Returns:** `bool` — Whether to proceed with webhook verification

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php:302`

**Usage:**
```php
add_filter('fluent_cart/payments/paypal/verify_webhook', function ($verify, $context) {
    // Skip verification for test mode
    if ($context['mode'] === 'test') {
        return false;
    }
    return $verify;
}, 10, 2);
```
</details>

---

## Tax

### <code> tax/country_tax_titles </code>
<details>
<summary><code>fluent_cart/tax/country_tax_titles</code> &mdash; Filter tax title labels per country</summary>

**When it runs:**
Applied when retrieving the mapping of country codes to their tax identification field labels (e.g., VAT, GST, ABN). Used in checkout forms and tax settings.

**Parameters:**
- `$taxTitles` (array): Associative array of country code => tax label
    ```php
    $taxTitles = [
        'AU' => 'ABN',
        'NZ' => 'GST',
        'IN' => 'GST',
        'CA' => 'GST / HST / PST / QST',
        'GB' => 'VAT',
        'EU' => 'VAT',
        'US' => 'EIN / Sales Tax',
        // ... 30+ countries
    ];
    ```

**Returns:** `array` — The modified country tax titles array

**Source:** `app/Modules/Tax/TaxModule.php:821`

**Usage:**
```php
add_filter('fluent_cart/tax/country_tax_titles', function ($taxTitles) {
    // Add or override tax labels
    $taxTitles['KR'] = __('BRN / VAT', 'my-plugin'); // South Korea
    $taxTitles['US'] = __('Tax ID', 'my-plugin');     // Simplify US label
    return $taxTitles;
}, 10, 1);
```
</details>

---

## Mollie (Pro)

### <code> mollie_settings </code>
<details>
<summary><code>fluent_cart/mollie_settings</code> <Badge type="warning" text="Pro" /> &mdash; Filter Mollie gateway settings</summary>

**When it runs:**
Applied when loading Mollie gateway settings during initialization.

**Parameters:**
- `$settings` (array): The Mollie settings array including API keys and configuration

**Returns:** `array` — The modified Mollie settings

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/MollieSettingsBase.php:26`

**Usage:**
```php
add_filter('fluent_cart/mollie_settings', function ($settings) {
    // Override settings for staging
    if (wp_get_environment_type() === 'staging') {
        $settings['payment_mode'] = 'test';
    }
    return $settings;
}, 10, 1);
```
</details>

### <code> payments/mollie_payment_args </code>
<details>
<summary><code>fluent_cart/payments/mollie_payment_args</code> <Badge type="warning" text="Pro" /> &mdash; Filter Mollie payment data</summary>

**When it runs:**
Applied when building the payment data array before sending to the Mollie API for payment creation.

**Parameters:**
- `$paymentData` (array): The payment data for the Mollie API
- `$context` (array): Context data
    ```php
    $context = [
        'order'       => Order,       // Order model
        'transaction' => Transaction  // OrderTransaction model
    ];
    ```

**Returns:** `array` — The modified payment data

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/MollieProcessor.php:142`

**Usage:**
```php
add_filter('fluent_cart/payments/mollie_payment_args', function ($paymentData, $context) {
    // Add a custom description
    $paymentData['description'] = 'Order #' . $context['order']->id . ' - My Store';
    return $paymentData;
}, 10, 2);
```
</details>

### <code> mollie/pass_line_items_details </code>
<details>
<summary><code>fluent_cart/mollie/pass_line_items_details</code> <Badge type="warning" text="Pro" /> &mdash; Control whether line item details are passed to Mollie</summary>

**When it runs:**
Applied before building the Mollie payment request. Return `true` to include individual line items in the Mollie order (useful for Klarna, iDEAL, etc.).

**Parameters:**
- `$passLineItems` (bool): Whether to include line items (default `false`)
- `$context` (array): Array containing `[$order, $transaction]`

**Returns:** `bool` — Whether to pass line item details to Mollie

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/MollieProcessor.php:128`

**Usage:**
```php
add_filter('fluent_cart/mollie/pass_line_items_details', function ($passLineItems, $context) {
    // Enable line items for Klarna support
    return true;
}, 10, 2);
```
</details>

### <code> mollie/webhook_url </code>
<details>
<summary><code>fluent_cart/mollie/webhook_url</code> <Badge type="warning" text="Pro" /> &mdash; Filter the Mollie webhook URL</summary>

**When it runs:**
Applied when generating the webhook notification URL sent to Mollie during payment creation.

**Parameters:**
- `$webhookUrl` (string): The IPN/webhook listener URL

**Returns:** `string` — The modified webhook URL

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/MollieProcessor.php:301`

**Usage:**
```php
add_filter('fluent_cart/mollie/webhook_url', function ($webhookUrl) {
    // Use a tunnel URL for local development
    if (wp_get_environment_type() === 'local') {
        return 'https://my-tunnel.ngrok.io/?fct_payment_listener=1&method=mollie';
    }
    return $webhookUrl;
}, 10, 1);
```
</details>

### <code> mollie/subscription_description </code>
<details>
<summary><code>fluent_cart/mollie/subscription_description</code> <Badge type="warning" text="Pro" /> &mdash; Filter the Mollie subscription description</summary>

**When it runs:**
Applied when creating a Mollie subscription, allowing you to customize the description shown on the customer's payment statement.

**Parameters:**
- `$description` (string): The generated subscription description
- `$context` (array): Context data
    ```php
    $context = [
        'subscription_model' => Subscription, // Subscription model
        'currency'           => 'EUR'         // Currency code
    ];
    ```

**Returns:** `string` — The modified subscription description

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/MollieHelper.php:209`

**Usage:**
```php
add_filter('fluent_cart/mollie/subscription_description', function ($description, $context) {
    return 'MyStore - ' . $context['subscription_model']->item_name;
}, 10, 2);
```
</details>

---

## Paddle (Pro)

### <code> paddle_product_tax_category </code>
<details>
<summary><code>fluent_cart/paddle_product_tax_category</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle product tax category</summary>

**When it runs:**
Applied when determining the tax category for a product in Paddle. Paddle uses tax categories to apply the correct tax rates.

**Parameters:**
- `$taxCategory` (string): The tax category (default `'standard'`)

**Returns:** `string` — The Paddle tax category (e.g., `'standard'`, `'digital-goods'`, `'saas'`)

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_product_tax_category', function ($taxCategory) {
    return 'digital-goods';
}, 10, 1);
```
</details>

### <code> paddle_onetime_price_id </code>
<details>
<summary><code>fluent_cart/paddle_onetime_price_id</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle one-time price ID</summary>

**When it runs:**
Applied when resolving the Paddle price ID for a one-time payment product.

**Parameters:**
- `$priceId` (string): The Paddle price ID

**Returns:** `string` — The modified Paddle price ID

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_onetime_price_id', function ($priceId) {
    return $priceId;
}, 10, 1);
```
</details>

### <code> paddle_recurring_price_id </code>
<details>
<summary><code>fluent_cart/paddle_recurring_price_id</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle recurring price ID</summary>

**When it runs:**
Applied when resolving the Paddle price ID for a recurring subscription product.

**Parameters:**
- `$priceId` (string): The Paddle recurring price ID

**Returns:** `string` — The modified Paddle recurring price ID

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_recurring_price_id', function ($priceId) {
    return $priceId;
}, 10, 1);
```
</details>

### <code> paddle_discount_id </code>
<details>
<summary><code>fluent_cart/paddle_discount_id</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle discount ID</summary>

**When it runs:**
Applied when resolving the Paddle discount ID to apply during checkout.

**Parameters:**
- `$discountId` (string): The Paddle discount ID

**Returns:** `string` — The modified Paddle discount ID

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_discount_id', function ($discountId) {
    return $discountId;
}, 10, 1);
```
</details>

### <code> paddle_subscription_product_type </code>
<details>
<summary><code>fluent_cart/paddle_subscription_product_type</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle subscription product type</summary>

**When it runs:**
Applied when determining the Paddle product type for subscription items.

**Parameters:**
- `$productType` (string): The Paddle product type

**Returns:** `string` — The modified Paddle product type

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_subscription_product_type', function ($productType) {
    return $productType;
}, 10, 1);
```
</details>

### <code> paddle_subscription_price_type </code>
<details>
<summary><code>fluent_cart/paddle_subscription_price_type</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle subscription price type</summary>

**When it runs:**
Applied when determining the Paddle price type for subscription items.

**Parameters:**
- `$priceType` (string): The Paddle price type

**Returns:** `string` — The modified Paddle price type

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_subscription_price_type', function ($priceType) {
    return $priceType;
}, 10, 1);
```
</details>

### <code> paddle_signup_fee_price_type </code>
<details>
<summary><code>fluent_cart/paddle_signup_fee_price_type</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle signup fee price type</summary>

**When it runs:**
Applied when determining the Paddle price type for subscription signup fees.

**Parameters:**
- `$priceType` (string): The Paddle signup fee price type

**Returns:** `string` — The modified Paddle signup fee price type

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_signup_fee_price_type', function ($priceType) {
    return $priceType;
}, 10, 1);
```
</details>

### <code> paddle_product_id </code>
<details>
<summary><code>fluent_cart/paddle_product_id</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle one-time product ID</summary>

**When it runs:**
Applied when resolving the Paddle product ID for one-time payment items.

**Parameters:**
- `$productId` (string): The Paddle product ID

**Returns:** `string` — The modified Paddle product ID

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_product_id', function ($productId) {
    return $productId;
}, 10, 1);
```
</details>

### <code> paddle_onetime_product_type </code>
<details>
<summary><code>fluent_cart/paddle_onetime_product_type</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle one-time product type</summary>

**When it runs:**
Applied when determining the Paddle product type for one-time payment items.

**Parameters:**
- `$productType` (string): The Paddle product type

**Returns:** `string` — The modified Paddle product type

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_onetime_product_type', function ($productType) {
    return $productType;
}, 10, 1);
```
</details>

### <code> paddle_onetime_price_type </code>
<details>
<summary><code>fluent_cart/paddle_onetime_price_type</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle one-time price type</summary>

**When it runs:**
Applied when determining the Paddle price type for one-time payment items.

**Parameters:**
- `$priceType` (string): The Paddle price type

**Returns:** `string` — The modified Paddle price type

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_onetime_price_type', function ($priceType) {
    return $priceType;
}, 10, 1);
```
</details>

### <code> paddle_addon_product_type </code>
<details>
<summary><code>fluent_cart/paddle_addon_product_type</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle add-on product type</summary>

**When it runs:**
Applied when determining the Paddle product type for add-on items.

**Parameters:**
- `$productType` (string): The Paddle add-on product type

**Returns:** `string` — The modified Paddle add-on product type

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_addon_product_type', function ($productType) {
    return $productType;
}, 10, 1);
```
</details>

### <code> paddle_discount_mode </code>
<details>
<summary><code>fluent_cart/paddle_discount_mode</code> <Badge type="warning" text="Pro" /> &mdash; Filter Paddle discount mode</summary>

**When it runs:**
Applied when determining how discounts are applied in Paddle transactions.

**Parameters:**
- `$discountMode` (string): The discount mode

**Returns:** `string` — The modified discount mode

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/`

**Usage:**
```php
add_filter('fluent_cart/paddle_discount_mode', function ($discountMode) {
    return $discountMode;
}, 10, 1);
```
</details>

---

## Authorize.net (Pro)

### <code> authorize_dot_net_supported_currencies </code>
<details>
<summary><code>fluent_cart/authorize_dot_net_supported_currencies</code> <Badge type="warning" text="Pro" /> &mdash; Filter Authorize.net supported currencies</summary>

**When it runs:**
Applied when checking which currencies are supported by the Authorize.net gateway.

**Parameters:**
- `$currencies` (array): Array of supported currency codes
    ```php
    $currencies = ['USD', 'CAD', 'GBP', 'EUR', ...];
    ```

**Returns:** `array` — The modified array of supported currency codes

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/AuthorizeDotNetGateway/`

**Usage:**
```php
add_filter('fluent_cart/authorize_dot_net_supported_currencies', function ($currencies) {
    // Add additional supported currencies
    $currencies[] = 'AUD';
    $currencies[] = 'NZD';
    return $currencies;
}, 10, 1);
```
</details>
