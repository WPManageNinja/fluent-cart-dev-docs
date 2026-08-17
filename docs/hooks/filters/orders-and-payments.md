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

**Source:** `app/Helpers/Status.php:164`

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


::: warning Deprecated since 1.3.16
`fluent-cart/order_statuses` is fired through `apply_filters_deprecated()` and is kept only for backward compatibility. Use **`fluent_cart/order_statuses`** instead — it receives the same value.
:::
**When it runs:**
Legacy location of the order statuses filter. Applied in the older Helper class. Prefer `fluent_cart/order_statuses` for new code.

**Parameters:**
- `$statuses` (array): Associative array of order statuses (key => translated label)
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified order statuses array

**Source:** `app/Helpers/Helper.php:282`

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
<summary><code>fluent-cart/editable_order_statuses</code> &mdash; Filter manually settable order statuses</summary>


::: warning Deprecated since 1.3.16
`fluent-cart/editable_order_statuses` is fired through `apply_filters_deprecated()` and is kept only for backward compatibility. It is reused for more than one list, so a single callback on the legacy name runs against all of them. Use **`fluent_cart/editable_order_statuses`** and **`fluent_cart/editable_shipping_statuses`** instead — each targets only its own list.
:::
**When it runs:**
Applied when building the list of order statuses an admin can manually set on an order. This controls the dropdown options in the order edit screen.

> **Note:** This hook uses a non-standard hyphenated prefix (`fluent-cart/`) rather than the standard `fluent_cart/` convention. This is a legacy naming that may be standardized in a future release.

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

**Source:** `app/Helpers/Helper.php:151`, `app/Helpers/Status.php:170,242`

**Usage:**
```php
add_filter('fluent-cart/editable_order_statuses', function ($statuses, $data) {
    // Remove the ability to manually set "canceled"
    unset($statuses['canceled']);
    return $statuses;
}, 10, 2);
```
</details>

### <code> editable_order_statuses (current) </code>
<details>
<summary><code>fluent_cart/editable_order_statuses</code> &mdash; Filter manually settable order statuses (current hook)</summary>

**When it runs:**
This is the current, non-deprecated counterpart to the `fluent-cart/editable_order_statuses` hook documented above — `Status::getEditableOrderStatuses()` fires the deprecated hyphenated hook first via `apply_filters_deprecated()` for backward compatibility, then applies this one on the same `$statuses` value and returns its result.

**Parameters:**
- `$statuses` (array): Associative array of editable order statuses (key => translated label) — same default shape as the deprecated hook
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified editable order statuses array

**Source:** `app/Helpers/Status.php:185`

**Usage:**
```php
add_filter('fluent_cart/editable_order_statuses', function ($statuses, $data) {
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

**Source:** `app/Helpers/Status.php:192`

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

**Source:** `app/Helpers/Status.php:207`

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


::: warning Deprecated since 1.3.16
`fluent-cart/transaction_statuses` is fired through `apply_filters_deprecated()` and is kept only for backward compatibility. Use **`fluent_cart/transaction_statuses`** instead — it receives the same value.
:::
**When it runs:**
Legacy location of the transaction statuses filter. Applied in the older Helper class. Prefer `fluent_cart/transaction_statuses` for new code.

**Parameters:**
- `$statuses` (array): Associative array of transaction statuses (key => translated label)
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified transaction statuses array

**Source:** `app/Helpers/Helper.php:377`

**Usage:**
```php
add_filter('fluent-cart/transaction_statuses', function ($statuses, $data) {
    return $statuses;
}, 10, 2);
```
</details>

### <code> editable_transaction_statuses </code>
<details>
<summary><code>fluent-cart/editable_transaction_statuses</code> &mdash; Filter manually editable transaction statuses</summary>


::: warning Deprecated since 1.3.16
`fluent-cart/editable_transaction_statuses` is fired through `apply_filters_deprecated()` and is kept only for backward compatibility. Use **`fluent_cart/editable_transaction_statuses`** instead — it receives the same value.
:::
**When it runs:**
Applied when building the list of transaction statuses that an admin can manually set.

> **Note:** This hook uses a non-standard hyphenated prefix (`fluent-cart/`) rather than the standard `fluent_cart/` convention. This is a legacy naming that may be standardized in a future release.

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

**Source:** `app/Helpers/Helper.php:399`, `app/Helpers/Status.php:214`

**Usage:**
```php
add_filter('fluent-cart/editable_transaction_statuses', function ($statuses, $data) {
    unset($statuses['refunded']);
    return $statuses;
}, 10, 2);
```
</details>

### <code> editable_transaction_statuses (current) </code>
<details>
<summary><code>fluent_cart/editable_transaction_statuses</code> &mdash; Filter manually editable transaction statuses (current hook)</summary>

**When it runs:**
This is the current, non-deprecated counterpart to the `fluent-cart/editable_transaction_statuses` hook documented above — fires on the value the deprecated hook already returned, when building the list of transaction statuses an admin can manually set.

**Parameters:**
- `$statuses` (array): Associative array of editable transaction statuses (key => translated label) — same default shape as the deprecated hook
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified editable transaction statuses array

**Source:** `app/Helpers/Status.php:234`

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

**Source:** `app/Helpers/Status.php:357`

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


::: warning Deprecated since 1.3.16
`fluent-cart/shipping_statuses` is fired through `apply_filters_deprecated()` and is kept only for backward compatibility. Use **`fluent_cart/shipping_statuses`** instead — it receives the same value.
:::
**When it runs:**
Legacy location of the shipping statuses filter. Applied in the older Helper class. Prefer `fluent_cart/shipping_statuses` for new code.

**Parameters:**
- `$statuses` (array): Associative array of shipping statuses (key => translated label)
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified shipping statuses array

**Source:** `app/Helpers/Helper.php:324`

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

**Source:** `app/Helpers/Status.php:246`

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
Applied when building the list of shipping statuses an admin can manually set on an order. This controls the dropdown options in the order edit screen. A deprecated hyphenated predecessor, `fluent-cart/editable_shipping_statuses`, still fires immediately before this one via `apply_filters_deprecated()` for backward compatibility (note its deprecation message incorrectly points to `fluent-cart/editable_order_statuses` — that's a bug in the source string, not a real alias).

**Parameters:**
- `$statuses` (array): Associative array of editable shipping statuses (key => translated label) — same default shape as `fluent_cart/shipping_statuses` above
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified editable shipping statuses array

**Source:** `app/Helpers/Status.php:265`

**Usage:**
```php
add_filter('fluent_cart/editable_shipping_statuses', function ($statuses, $data) {
    unset($statuses['unshippable']);
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

**Source:** `app/Http/Controllers/OrderController.php:62`

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

**Source:** `app/Http/Controllers/OrderController.php:691`

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

**Source:** `app/Http/Controllers/OrderController.php:1085`

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

**Source:** `app/Http/Controllers/OrderController.php:95`

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

**Source:** `app/Http/Controllers/OrderController.php:108`

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

**Source:** `app/Models/Order.php:1044`

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

**Source:** `app/Models/Order.php:1250`

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

### <code> min_receipt_number </code>
<details>
<summary><code>fluent_cart/min_receipt_number</code> &mdash; Filter the minimum receipt number</summary>

**When it runs:**
Applied when calculating the next receipt number. If the computed next number is below this minimum, it will be bumped up.

**Parameters:**
- `$min` (int): The minimum receipt number from store settings (default `1`)

**Returns:** `int` — The minimum receipt number to enforce

**Source:** `app/Services/OrderService.php:590`

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

**Source:** `app/Services/OrderService.php:602`

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

### <code> transaction/max_refundable_amount </code>
<details>
<summary><code>fluent_cart/transaction/max_refundable_amount</code> &mdash; Filter the maximum amount that can still be refunded on a transaction</summary>

**When it runs:**
Applied on the [`OrderTransaction`](/database/models/order-transaction) model when computing how much of a transaction is still refundable. The base amount is the transaction's total minus what has already been refunded. **Note:** the filtered value is clamped by the caller to `[0, $baseAmount]` — a value greater than the base amount you were passed is silently capped back down, so this filter can only shrink the refundable amount, never grow it beyond what's actually left on the transaction.

**Parameters:**
- `$baseAmount` (int): The unfiltered max refundable amount in cents (`total - refunded_total`)
- `$transaction` ([OrderTransaction](/database/models/order-transaction)): The transaction instance (`$this`)

**Returns:** `int` — The (possibly reduced) max refundable amount in cents; automatically clamped to `[0, $baseAmount]`

**Source:** `app/Models/OrderTransaction.php:188`

**Usage:**
```php
add_filter('fluent_cart/transaction/max_refundable_amount', function ($baseAmount, $transaction) {
    // Hold back a $1 processing fee from what support can refund
    return max(0, $baseAmount - 100);
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

**Source:** `app/Helpers/StatusHelper.php:281`

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

**Source:** `app/Http/Controllers/FrontendControllers/CustomerOrderController.php:337`

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

**Source:** `app/Http/Controllers/FrontendControllers/CustomerOrderController.php:344`

**Usage:**
```php
add_filter('fluent_cart/customer/order_details_section_parts', function ($sections, $context) {
    $sections['after_summary'] = '<div class="custom-notice">Thank you for your order!</div>';
    return $sections;
}, 10, 2);
```
</details>

### <code> order/custom_item_changed </code>
<details>
<summary><code>fluent_cart/order/custom_item_changed</code> &mdash; Filter a custom order item's data before it's saved from the order edit screen</summary>

**When it runs:**
Applied in `OrderItemResource` when an admin edits a **custom** (product + variation, non-catalog) line item on the order edit screen. The result is cast to an array and only a fixed set of keys (`id`, `quantity`, `unit_price`, `cost`, `subtotal`, `tax_amount`, `discount_total`, `line_total`, `shipping_charge`) is kept from it — anything else you add is dropped.

**Parameters:**
- `$oldItem` (array|object): The existing order item row before this edit (matched by `object_id` = variation ID)
- `$item` (array): The incoming edited item payload from the request

**Returns:** `array` — The item data to persist; only the keys listed above are used. Amounts (`unit_price`, `cost`, `subtotal`, `tax_amount`, `discount_total`, `line_total`, `shipping_charge`) are in cents.

**Source:** `api/Resource/OrderItemResource.php:282`

**Usage:**
```php
add_filter('fluent_cart/order/custom_item_changed', function ($oldItem, $item) {
    // Never let a custom item's unit price go negative
    $item['unit_price'] = max(0, (int) $item['unit_price']);
    return $item;
}, 10, 2);
```
</details>

### <code> order/delete_test_orders_batch_size </code>
<details>
<summary><code>fluent_cart/order/delete_test_orders_batch_size</code> &mdash; Filter the batch size for the "delete all test orders" bulk action</summary>

**When it runs:**
Applied at the start of `OrderController::handleDeleteTestOrdersBulkAction()`, before querying which test orders to delete in this batch. The admin UI calls this endpoint repeatedly (paging by `last_order_id`) until all test orders are gone; this filter controls how many are deleted per request.

**Parameters:**
- `$batchSize` (int): The batch size (default `50`); the filtered result is floored to a minimum of `1`

**Returns:** `int` — The number of test orders to delete per request

**Source:** `app/Http/Controllers/OrderController.php:955`

**Usage:**
```php
add_filter('fluent_cart/order/delete_test_orders_batch_size', function ($batchSize) {
    // Smaller batches on a resource-constrained host
    return 20;
}, 10, 1);
```
</details>

### <code> order/should_restore_stock_on_delete </code>
<details>
<summary><code>fluent_cart/order/should_restore_stock_on_delete</code> &mdash; Filter whether deleting an order restores its reserved/sold stock</summary>

**When it runs:**
Applied in `OrderDeleting::shouldRestoreStockOnOrderDelete()` when an order is being permanently deleted. By default, stock is only restored automatically when the order being deleted is a **test-mode** order — deleting a live order does not touch stock unless you opt in here.

**Parameters:**
- `$shouldRestore` (bool): Whether to restore stock; default is `true` only when the order is in test mode
- `$order` ([Order](/database/models/order)): The order being deleted (`$event->order`)
- `$eventData` (array): The full `OrderDeletingEvent` payload as an array

**Returns:** `bool` — Whether to restore stock for the items on this order as part of the delete

**Source:** `app/Listeners/Order/OrderDeleting.php:89`

**Usage:**
```php
add_filter('fluent_cart/order/should_restore_stock_on_delete', function ($shouldRestore, $order, $eventData) {
    // Also restore stock when deleting canceled live orders
    if ($order->status === 'canceled') {
        return true;
    }
    return $shouldRestore;
}, 10, 3);
```
</details>

---

## Payment Processing

### <code> ipn_url_{$slug} </code>
<details>
<summary><code>fluent_cart_ipn_url_{$slug}</code> &mdash; Filter IPN/webhook listener URL for a payment gateway</summary>


::: warning Deprecated since 1.3.16
`fluent_cart_ipn_url_{var}` is fired through `apply_filters_deprecated()` and is kept only for backward compatibility. Use **`fluent_cart/ipn_url_{var}`** instead — it receives the same value.
:::
**When it runs:**
Applied when generating the IPN (Instant Payment Notification) or webhook listener URL for a specific payment method. The `{$slug}` is the gateway slug (e.g., `stripe`, `paypal`).

**Parameters:**
- `$urlData` (array): Array containing the listener URL
    ```php
    $urlData = [
        'listener_url' => 'https://yoursite.com/?fct_payment_listener=1&method=stripe'
    ];
    ```

**Returns:** `array` — The modified URL data array

**Source:** `app/Services/Payments/PaymentHelper.php:24`

**Usage:**
```php
add_filter('fluent_cart_ipn_url_stripe', function ($urlData) {
    // Use a custom endpoint for Stripe webhooks
    $urlData['listener_url'] = home_url('/custom-stripe-webhook/');
    return $urlData;
}, 10, 1);
```
</details>

### <code> ipn_url_{$slug} (current) </code>
<details>
<summary><code>fluent_cart/ipn_url_{$slug}</code> &mdash; Filter IPN/webhook listener URL for a payment gateway (current hook)</summary>

**When it runs:**
This is the current, non-deprecated counterpart to the `fluent_cart_ipn_url_{$slug}` hook documented above — fires on the same `$data` value the deprecated hook already returned. `{$slug}` is the gateway slug (e.g. `stripe`, `paypal`).

**Parameters:**
- `$data` (array): Array containing the listener URL — same shape as the deprecated hook
    ```php
    $data = [
        'listener_url' => 'https://yoursite.com/?fct_payment_listener=1&method=stripe'
    ];
    ```

**Returns:** `array` — The modified URL data array

**Source:** `app/Services/Payments/PaymentHelper.php:29`

**Usage:**
```php
add_filter('fluent_cart/ipn_url_stripe', function ($data) {
    $data['listener_url'] = home_url('/custom-stripe-webhook/');
    return $data;
}, 10, 1);
```
</details>

### <code> payment/validate_custom_item </code>
<details>
<summary><code>fluent_cart/payment/validate_custom_item</code> &mdash; Filter/validate the product and variation resolved for a custom order item during payment</summary>

**When it runs:**
Applied in `ProductItemService` while resolving a **custom** (externally-priced) order item's product and variation objects during payment processing. Returning anything other than an object for either the product or the variation causes the item to be rejected — the caller treats it as invalid and stops processing it.

**Parameters:**
- `$productVariationPair` (array): Two-element array `[$product, $variation]` — `$variation` starts as a synthetic object built from the order item, with `id` set to the item's `object_id`
- `$data` (array): The raw custom item data being validated

**Returns:** `array` — `[$product, $variation]`; both elements must be objects or the item is treated as invalid

**Source:** `app/Services/ProductItemService.php:53`

**Usage:**
```php
add_filter('fluent_cart/payment/validate_custom_item', function ($pair, $data) {
    [$product, $variation] = $pair;
    // Reject custom items over $10,000 (stored in cents)
    if ($variation && $variation->item_price > 1000000) {
        return [null, null];
    }
    return [$product, $variation];
}, 10, 2);
```
</details>

### <code> payment/success_url </code>
<details>
<summary><code>fluent_cart/payment/success_url</code> &mdash; Filter the payment success redirect URL</summary>

**When it runs:**
Applied when generating the URL the customer is redirected to after a successful payment, just before the redirect is issued.

**Parameters:**
- `$url` (string): The success redirect URL (receipt page with query args already appended)
- `$context` (array): Context data
    ```php
    $context = [
        'transaction_hash' => 'abc123...',  // Transaction UUID
        'args'             => [],           // Additional arguments
        'payment_method'   => 'stripe',     // Gateway slug
        'transaction'      => $transaction, // \FluentCart\App\Models\OrderTransaction|null
        'order'            => $order,       // \FluentCart\App\Models\Order|null
    ];
    ```

**Returns:** `string` — The modified success URL

**Source:** `app/Services/Payments/PaymentHelper.php:71`

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

**Source:** `app/Services/Payments/PaymentHelper.php:92`

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

**Source:** `app/Models/OrderTransaction.php:129`

**Usage:**
```php
add_filter('fluent_cart/transaction/url_stripe', function ($url, $context) {
    $chargeId = $context['vendor_charge_id'];
    $mode = $context['payment_mode'] === 'test' ? 'test/' : '';
    return "https://dashboard.stripe.com/{$mode}payments/{$chargeId}";
}, 10, 2);
```
</details>

### <code> fluent_cart/transaction/receipt_page_url </code>
<details>
<summary><code>fluent_cart/transaction/receipt_page_url</code> &mdash; Filter the transaction receipt page URL</summary>

**When it runs:**
Applied when generating the public-facing receipt page URL for a transaction, typically used in email notifications and customer-facing links.

::: warning Renamed in 1.3.16
The old, non-standard name `fluentcart/transaction/receipt_page_url` (no underscore) still fires via
`apply_filters_deprecated()`, but it is **scheduled for removal in v1.4.3**. Use
`fluent_cart/transaction/receipt_page_url` instead. Both names run on the same value; the deprecated
one fires first.
:::

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

**Source:** `app/Models/OrderTransaction.php:220`

**Usage:**
```php
add_filter('fluent_cart/transaction/receipt_page_url', function ($url, $context) {
    // Use a custom receipt page
    return add_query_arg('trx_hash', $context['transaction']->uuid, home_url('/my-receipt/'));
}, 10, 2);
```
</details>

### <code> pdf/can_generate_receipt </code>
<details>
<summary><code>fluent_cart/pdf/can_generate_receipt</code> &mdash; Filter whether PDF receipt generation is available</summary>

**When it runs:**
Applied in `OrderService::canGenerateReceiptPdf()`, a capability check used by the UI (e.g. a "Download PDF" button) and by callers before attempting `fluent_cart/pdf/generate_receipt`. The default is `true` only when FluentCart Pro is active **and** the FluentPDF plugin is loaded.

**Parameters:**
- `$canGenerate` (bool): Whether PDF receipt generation is available, before filtering

**Returns:** `bool` — Whether to advertise/allow PDF receipt generation

**Source:** `app/Services/OrderService.php:688`

**Usage:**
```php
add_filter('fluent_cart/pdf/can_generate_receipt', function ($canGenerate) {
    // Enable PDF receipts via a custom generator, without FluentPDF
    return true;
}, 10, 1);
```
</details>

### <code> pdf/generate_receipt </code>
<details>
<summary><code>fluent_cart/pdf/generate_receipt</code> &mdash; Generate (or return the path to) a PDF receipt for an order</summary>

**When it runs:**
Applied wherever FluentCart needs an actual PDF file for an order's receipt: when a customer downloads their receipt as a PDF (`ReceiptHandler`), and when an email notification attaches the receipt PDF (`EmailNotificationMailer`). Core passes `null` and relies entirely on a listener (normally FluentCart Pro + FluentPDF) to generate the file and return its local path; see `fluent_cart/pdf/can_generate_receipt` to check availability first.

**Parameters:**
- `$pdfPath` (string|null): The generated PDF's local file path; `null` until a listener supplies one
- `$context` (array): Context data
    ```php
    $context = [
        'order'       => $order,          // \FluentCart\App\Models\Order
        'template_id' => 'order_receipt', // string — the PDF template to use (varies by call site)
    ];
    ```

**Returns:** `string|null` — The absolute local path to the generated PDF, or `null` if generation isn't available

**Source:**
- `app/Hooks/Handlers/ShortCodes/ReceiptHandler.php:98` (customer-facing PDF download)
- `app/Services/Email/EmailNotificationMailer.php:435` (email attachment)

**Usage:**
```php
add_filter('fluent_cart/pdf/generate_receipt', function ($pdfPath, $context) {
    $order = $context['order'];
    return my_plugin_generate_receipt_pdf($order, $context['template_id']);
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

**Source:** `app/Modules/PaymentMethods/StripeGateway/Processor.php:129`

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

**Source:** `app/Modules/PaymentMethods/StripeGateway/Processor.php:664`

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

**Source:** `app/Modules/PaymentMethods/StripeGateway/Processor.php:976`

**Usage:**
```php
add_filter('fluent_cart/payments/stripe_subscription_checkout_session_args', function ($sessionData, $context) {
    // Add tax ID collection
    $sessionData['tax_id_collection'] = ['enabled' => true];
    return $sessionData;
}, 10, 2);
```
</details>

### <code> stripe/client_setup_future_usage </code>
<details>
<summary><code>fluent_cart/stripe/client_setup_future_usage</code> &mdash; Filter the client-side `setup_future_usage` value for a Stripe PaymentIntent</summary>

**When it runs:**
Applied when building the **client-side** PaymentIntent update data for Stripe Elements. **Important:** whatever value this filter resolves to must also be matched on the server-side PaymentIntent built by `fluent_cart/payments/stripe_onetime_intent_args` at place-order time — a mismatch causes Stripe to reject the confirmation. A falsy return removes `setup_future_usage` from the intent entirely.

**Parameters:**
- `$setupFutureUsage` (string|null): The current `setup_future_usage` value (e.g. `'off_session'`, `'on_session'`), read from the intent data
- `$context` (array): Context data
    ```php
    $context = [
        'data'             => $data,            // array — the raw request data for the intent
        'has_subscription' => $hasSubscription, // bool — whether the cart contains a subscription item
    ];
    ```

**Returns:** `string|null` — The `setup_future_usage` value to use, or a falsy value to omit it

**Source:** `app/Modules/PaymentMethods/StripeGateway/Stripe.php:852`

**Usage:**
```php
add_filter('fluent_cart/stripe/client_setup_future_usage', function ($setupFutureUsage, $context) {
    // Always save the card on file when the cart has a subscription
    return $context['has_subscription'] ? 'off_session' : $setupFutureUsage;
}, 10, 2);
```
</details>

### <code> stripe_idempotency_key </code>
<details>
<summary><code>fluent_cart_stripe_idempotency_key</code> &mdash; Filter the Stripe idempotency key</summary>


::: warning Deprecated since 1.3.16
`fluent_cart_stripe_idempotency_key` is fired through `apply_filters_deprecated()` and is kept only for backward compatibility. Use **`fluent_cart/stripe_idempotency_key`** instead — it receives the same value.
:::
**When it runs:**
Applied when sending charge requests to the Stripe API. The idempotency key prevents duplicate charges from being created.

**Parameters:**
- `$key` (string): The generated idempotency key
- `$context` (array): Context data
    ```php
    $context = [
        'request' => [...] // The Stripe API request body
    ];
    ```

**Returns:** `string` — The modified idempotency key

**Source:** `app/Modules/PaymentMethods/StripeGateway/API/ApiRequest.php:115`

**Usage:**
```php
add_filter('fluent_cart_stripe_idempotency_key', function ($key, $context) {
    // Use a custom idempotency key format
    return 'fct_' . md5($key . time());
}, 10, 2);
```
</details>

### <code> stripe_idempotency_key (current) </code>
<details>
<summary><code>fluent_cart/stripe_idempotency_key</code> &mdash; Filter the Stripe idempotency key (current hook)</summary>

**When it runs:**
This is the current, non-deprecated counterpart to the `fluent_cart_stripe_idempotency_key` hook documented above — fires on the same key value the deprecated hook already returned, and its result is used as the `Idempotency-Key` request header.

**Parameters:**
- `$idempotency_key` (string): The generated idempotency key
- `$context` (array): Context data
    ```php
    $context = [
        'request' => $request, // array — the Stripe API request body
    ];
    ```

**Returns:** `string` — The idempotency key to send in the `Idempotency-Key` header

**Source:** `app/Modules/PaymentMethods/StripeGateway/API/ApiRequest.php:119`

**Usage:**
```php
add_filter('fluent_cart/stripe_idempotency_key', function ($key, $context) {
    return 'fct_' . md5($key . time());
}, 10, 2);
```
</details>

### <code> stripe_request_body </code>
<details>
<summary><code>fluent_cart_stripe_request_body</code> &mdash; Filter the Stripe API request body</summary>


::: warning Deprecated since 1.3.16
`fluent_cart_stripe_request_body` is fired through `apply_filters_deprecated()` and is kept only for backward compatibility. Use **`fluent_cart/stripe_request_body`** instead — it receives the same value.
:::
**When it runs:**
Applied just before every request is sent to the Stripe API. This is a low-level filter that affects all Stripe API calls.

**Parameters:**
- `$request` (array): The request body data
- `$context` (array): Context data
    ```php
    $context = [
        'api' => 'charges' // The Stripe API endpoint being called
    ];
    ```

**Returns:** `array` — The modified request body

**Source:** `app/Modules/PaymentMethods/StripeGateway/API/ApiRequest.php:129`

**Usage:**
```php
add_filter('fluent_cart_stripe_request_body', function ($request, $context) {
    // Log all Stripe API requests
    error_log('Stripe API call to: ' . $context['api']);
    return $request;
}, 10, 2);
```
</details>

### <code> stripe_request_body (current) </code>
<details>
<summary><code>fluent_cart/stripe_request_body</code> &mdash; Filter the Stripe API request body (current hook)</summary>

**When it runs:**
This is the current, non-deprecated counterpart to the `fluent_cart_stripe_request_body` hook documented above — fires on the value the deprecated hook already returned, immediately before every request sent to the Stripe API.

**Parameters:**
- `$body` (array): The request body data
- `$context` (array): Context data
    ```php
    $context = [
        'api' => $api, // string — the Stripe API endpoint being called
    ];
    ```

**Returns:** `array` — The modified request body

**Source:** `app/Modules/PaymentMethods/StripeGateway/API/ApiRequest.php:130`

**Usage:**
```php
add_filter('fluent_cart/stripe_request_body', function ($body, $context) {
    error_log('Stripe API call to: ' . $context['api']);
    return $body;
}, 10, 2);
```
</details>

### <code> stripe_request_headers </code>
<details>
<summary><code>fluent_cart_stripe_request_headers</code> &mdash; Filter the HTTP headers sent with every Stripe API request</summary>

**When it runs:**
Applied each time a request is sent to the Stripe API — the header-level sibling of `fluent_cart/stripe_request_body`. Unlike most Stripe filters in this file, this one was never migrated to the `fluent_cart/` namespace and has no deprecated wrapper — it is the live, current hook name.

**Parameters:**
- `$headers` (array): The request headers
    ```php
    $headers = [
        'Authorization'              => 'Basic ' . base64_encode($secretKey . ':'),
        'Stripe-Version'             => '2020-08-27', // Stripe API version pinned by FluentCart
        'User-Agent'                 => 'FluentCart/1.x (https://fluentcart.com)',
        'X-Stripe-Client-User-Agent' => '{"name":"FluentCart",...}', // JSON-encoded user agent info
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified request headers

**Source:** `app/Modules/PaymentMethods/StripeGateway/API/ApiRequest.php:87`

**Usage:**
```php
add_filter('fluent_cart_stripe_request_headers', function ($headers, $data) {
    // Route Stripe calls through a corporate outbound proxy that needs a custom header
    $headers['X-Forwarded-Via'] = 'my-proxy';
    return $headers;
}, 10, 2);
```
</details>

### <code> form_disable_stripe_connect </code>
<details>
<summary><code>fluent_cart_form_disable_stripe_connect</code> &mdash; Disable Stripe Connect provider option</summary>


::: warning Deprecated since 1.3.16
`fluent_cart_form_disable_stripe_connect` is fired through `apply_filters_deprecated()` and is kept only for backward compatibility. Use **`fluent_cart/form_disable_stripe_connect`** instead — it receives the same value.
:::
**When it runs:**
Applied when rendering the Stripe settings form. Return `true` to force the use of manual API keys instead of Stripe Connect.

**Parameters:**
- `$disable` (bool): Whether to disable Stripe Connect (default `false`)
- `$data` (array): Additional context data (empty array)

**Returns:** `bool` — `true` to disable Stripe Connect and force API keys mode

**Source:** `app/Modules/PaymentMethods/StripeGateway/Stripe.php:583`

**Usage:**
```php
add_filter('fluent_cart_form_disable_stripe_connect', function ($disable, $data) {
    // Force manual API keys
    return true;
}, 10, 2);
```
</details>

### <code> form_disable_stripe_connect (current) </code>
<details>
<summary><code>fluent_cart/form_disable_stripe_connect</code> &mdash; Disable Stripe Connect provider option (current hook)</summary>

**When it runs:**
This is the current, non-deprecated counterpart to the `fluent_cart_form_disable_stripe_connect` hook documented above — fires on the value the deprecated hook already returned, when rendering the Stripe settings form. Return `true` to force manual API keys instead of Stripe Connect.

**Parameters:**
- `$disable` (bool): Whether to disable Stripe Connect (default `false`)
- `$data` (array): Additional context data (empty array)

**Returns:** `bool` — `true` to disable Stripe Connect and force API keys mode

**Source:** `app/Modules/PaymentMethods/StripeGateway/Stripe.php:584`

**Usage:**
```php
add_filter('fluent_cart/form_disable_stripe_connect', function ($disable, $data) {
    return true;
}, 10, 2);
```
</details>

### <code> stripe_appearance </code>
<details>
<summary><code>fluent_cart_stripe_appearance</code> &mdash; Filter Stripe Elements appearance configuration</summary>


::: warning Deprecated since 1.3.16
`fluent_cart_stripe_appearance` is fired through `apply_filters_deprecated()` and is kept only for backward compatibility. Use **`fluent_cart/stripe_appearance`** instead — it receives the same value.
:::
**When it runs:**
Applied when initializing Stripe Elements on the checkout page. Controls the visual theme and styling of the embedded payment form.

**Parameters:**
- `$appearance` (array): Stripe Elements appearance configuration
    ```php
    $appearance = [
        'theme' => 'stripe' // 'stripe', 'night', 'flat', or custom
    ];
    ```

**Returns:** `array` — The modified appearance configuration (follows [Stripe Appearance API](https://docs.stripe.com/elements/appearance-api))

**Source:** `app/Modules/PaymentMethods/StripeGateway/Stripe.php:795`

**Usage:**
```php
add_filter('fluent_cart_stripe_appearance', function ($appearance) {
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

### <code> stripe_appearance (current) </code>
<details>
<summary><code>fluent_cart/stripe_appearance</code> &mdash; Filter Stripe Elements appearance configuration (current hook)</summary>

**When it runs:**
This is the current, non-deprecated counterpart to the `fluent_cart_stripe_appearance` hook documented above — fires on the value the deprecated hook already returned, when initializing Stripe Elements on the checkout page.

**Parameters:**
- `$appearance` (array): Stripe Elements appearance configuration — same default shape as the deprecated hook

**Returns:** `array` — The modified appearance configuration (follows the [Stripe Appearance API](https://docs.stripe.com/elements/appearance-api))

**Source:** `app/Modules/PaymentMethods/StripeGateway/Stripe.php:798`

**Usage:**
```php
add_filter('fluent_cart/stripe_appearance', function ($appearance) {
    $appearance['theme'] = 'night';
    return $appearance;
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

**Source:** `app/Modules/PaymentMethods/StripeGateway/Webhook/Webhook.php:171`

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

**Source:** `app/Modules/PaymentMethods/PayPalGateway/PayPal.php:1187`

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

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php:358`

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

**Source:** `app/Modules/PaymentMethods/PayPalGateway/IPN.php:481`

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

### <code> paypal/vault_attributes </code>
<details>
<summary><code>fluent_cart/paypal/vault_attributes</code> &mdash; Filter PayPal Vault v3 attributes when saving a buyer for auto-charge</summary>

**When it runs:**
This filter is applied during a **`system` (auto-charged, store-billed) subscription** checkout when PayPal vaults the buyer's account (Vault v3 save-on-success), so future renewal invoices can be charged merchant-initiated. It lets you adjust the vault attributes sent to PayPal. See [Store-managed + auto-charge](/modules/subscriptions#store-managed-auto-charge-system).

**Parameters:**

- `$defaults` (array): The vault attributes
    ```php
    [
        'store_in_vault' => 'ON_SUCCESS', // string
        'usage_type'     => 'MERCHANT',   // string
        'customer_type'  => 'CONSUMER',   // string
    ]
    ```
- `$context` (array): `['order' => Order, 'subscription' => Subscription]`

**Returns:**
- `$defaults` (array): The (possibly modified) vault attributes

**Source:** `app/Modules/PaymentMethods/PayPalGateway/Processor.php:226`

**Usage:**
```php
add_filter('fluent_cart/paypal/vault_attributes', function($attributes, $context) {
    return $attributes;
}, 10, 2);
```
</details>

### <code> payments/paypal_vault_one_time </code>
<details>
<summary><code>fluent_cart/payments/paypal_vault_one_time</code> &mdash; Filter whether a one-time PayPal order should vault the buyer's payment method</summary>

**When it runs:**
Applied when building a one-time (non-subscription) PayPal order, wherever `vault_on_success` would otherwise be decided. Letting this vault is what allows the saved-payment-methods module to offer the buyer's PayPal account for future purchases. The default simply preserves whatever `vault_on_success` was already resolved to, so with no listener attached, behavior is unchanged.

**Parameters:**
- `$vaultOnSuccess` (bool): Whether to vault on success (default: `!empty($args['vault_on_success'])`)
- `$context` (array): Context data
    ```php
    $context = [
        'order'        => $order,        // \FluentCart\App\Models\Order
        'transaction'  => $transaction,  // \FluentCart\App\Models\OrderTransaction
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription|null
    ];
    ```

**Returns:** `bool` — Whether PayPal should vault the buyer's payment method on this one-time order

**Source:** `app/Modules/PaymentMethods/PayPalGateway/Processor.php:214`

**Usage:**
```php
add_filter('fluent_cart/payments/paypal_vault_one_time', function ($vaultOnSuccess, $context) {
    // Never vault for guest (no-account) checkouts
    if (!$context['order']->customer_id) {
        return false;
    }
    return $vaultOnSuccess;
}, 10, 2);
```
</details>

### <code> payments/paypal_vault_rejection_issues </code>
<details>
<summary><code>fluent_cart/payments/paypal_vault_rejection_issues</code> &mdash; Filter which PayPal error codes are treated as a vaulting rejection</summary>

**When it runs:**
Applied when inspecting a failed PayPal order-creation response to decide whether the failure was caused specifically by a vaulting/save-on-success problem (as opposed to some other error). If the response's error `details` contain one of these issue codes, FluentCart retries the request without the vault attributes instead of failing the checkout outright — see the `fluent_cart/payments/paypal_vault_rejected` action, fired right before that retry.

**Parameters:**
- `$vaultIssues` (array): PayPal issue codes that indicate a vaulting rejection
    ```php
    $vaultIssues = [
        'PAYMENT_SOURCE_CANNOT_BE_USED',
        'PAYMENT_SOURCE_NOT_VAULTABLE',
        'VAULTING_NOT_ENABLED',
        'MERCHANT_NOT_ENABLED_FOR_VAULTING',
        'VAULT_ID_NOT_SUPPORTED',
    ];
    ```

**Returns:** `array` — The issue codes to treat as a vaulting rejection

**Source:** `app/Modules/PaymentMethods/PayPalGateway/Processor.php:50`

**Usage:**
```php
add_filter('fluent_cart/payments/paypal_vault_rejection_issues', function ($vaultIssues) {
    // Also retry-without-vault on this less common PayPal issue code
    $vaultIssues[] = 'CUSTOMER_ALREADY_HAS_A_SIMILAR_PAYMENT_SOURCE_SAVED';
    return $vaultIssues;
}, 10, 1);
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

**Source:** `app/Modules/Tax/TaxModule.php (line 1730)`

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

### <code> tax_summary_should_render </code>
<details>
<summary><code>fluent_cart/tax_summary_should_render</code> &mdash; Filter whether the tax summary is rendered for an order receipt</summary>

**When it runs:**
Applied in `TaxSummaryHelper::computeTaxSummary()` while building the tax summary for an order's receipt surfaces (thank-you page, receipts, emails, PDFs). It runs after the zero-tax short-circuit — when the order has no tax at all and no reverse charge, the summary is already skipped without this filter firing — so it lets you hide the tax summary for orders that do carry tax data.

**Parameters:**

- `$shouldRender` (bool): Whether the tax summary should render (default `true`)
- `$order` (\FluentCart\App\Models\Order): The order being rendered

**Returns:**
- `bool` — `false` to hide the tax summary block

**Source:** `app/Services/Renderer/Receipt/TaxSummaryHelper.php (line 172)`

**Usage:**
```php
add_filter('fluent_cart/tax_summary_should_render', function ($shouldRender, $order) {
    // Hide the tax summary for test-mode orders
    if ($order->mode === 'test') {
        return false;
    }

    return $shouldRender;
}, 10, 2);
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

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/MollieProcessor.php:169`

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

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/MollieProcessor.php:155`

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

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/MollieProcessor.php:341`

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
Applied when FluentCart creates the corresponding product on Paddle, to determine the tax category sent with the product data. Paddle uses tax categories to apply the correct tax rates.

**Parameters:**
- `$taxCategory` (string): The tax category (default `'standard'`)
- `$data` (array): Context data
    ```php
    $data = [
        'product'      => $fctProduct,  // \FluentCart\App\Models\Product|null — the FluentCart product
        'variation_id' => $variationId, // int|null — the product variation ID
    ];
    ```

**Returns:** `string` — The Paddle tax category (e.g., `'standard'`, `'digital-goods'`, `'saas'`)

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/Product.php (line 53)`

**Usage:**
```php
add_filter('fluent_cart/paddle_product_tax_category', function ($taxCategory, $data) {
    if ($data['product'] && $data['product']->ID === 123) {
        return 'digital-goods';
    }

    return $taxCategory;
}, 10, 2);
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

### <code> authorize_dot_net/transaction_request </code>
<details>
<summary><code>fluent_cart/authorize_dot_net/transaction_request</code> <Badge type="warning" text="Pro" /> &mdash; Filter the Authorize.net transaction request before it is sent to the API</summary>

**When it runs:**
Applied to the assembled `transactionRequest` payload immediately before it is sent to the Authorize.net API. Fires on both the one-time payment path and the subscription first-payment path, so developers can override any Auth.net field (invoice number, customer ID/email, `userFields`, line items, billing/shipping, etc.) without core changes.

**Parameters:**
- `$transactionRequest` (array): The Authorize.net transaction request payload (amount, payment, billTo, shipTo, lineItems, etc.)
- `$data` (array): Context data
    ```php
    $data = [
        'order'       => $order,        // Order model instance
        'transaction' => $transaction,  // OrderTransaction model instance
    ];
    ```

**Returns:** `array` — The modified transaction request payload

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/AuthorizeDotNetGateway/AuthorizeDotNetProcessor.php:71` (one-time) and `:542` (subscription first payment)

**Usage:**
```php
add_filter('fluent_cart/authorize_dot_net/transaction_request', function ($transactionRequest, $data) {
    // Attach a custom purchase order number via userFields
    $transactionRequest['userFields'] = [
        'userField' => [
            ['name' => 'po_number', 'value' => 'PO-' . $data['order']->id],
        ],
    ];
    return $transactionRequest;
}, 10, 2);
```
</details>

### <code> authorize_dot_net/order_description </code>
<details>
<summary><code>fluent_cart/authorize_dot_net/order_description</code> <Badge type="warning" text="Pro" /> &mdash; Filter the order description sent to Authorize.net</summary>

**When it runs:**
Applied when building the order metadata (invoice number and description) for an Authorize.net transaction. The default description is the comma-separated list of item names, or `Order #{id}` when no names are available. The returned value is truncated to 255 characters.

**Parameters:**
- `$default` (string): The default order description (item names or `Order #{id}`)
- `$data` (array): Context data
    ```php
    $data = [
        'order' => $order,  // Order model instance
    ];
    ```

**Returns:** `string` — The order description (truncated to 255 chars)

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/AuthorizeDotNetGateway/AuthorizeDotNetHelper.php:234`

**Usage:**
```php
add_filter('fluent_cart/authorize_dot_net/order_description', function ($description, $data) {
    // Prefix the description with the store name
    return 'My Store — ' . $description;
}, 10, 2);
```
</details>

### <code> should_send_email_notification </code>
<details>
<summary><code>fluent_cart/should_send_email_notification</code> &mdash; Control whether an automatic email notification should be sent</summary>

**When it runs:**
This filter is applied before each automatic email notification is sent for an order event. It allows you to selectively block or allow specific email notifications, for example when using a Merchant of Record payment gateway (like Paddle) that handles its own transactional emails.

**Parameters:**

- `$should` (bool): Whether the email should be sent (default: `true`)
- `$args` (array): Context data about the notification
    ```php
    $args = [
        'event'     => 'order_paid',          // The event triggering the email
        'mail_name' => 'order_paid_customer',  // The specific notification identifier
        'order'     => $order,                 // Order model instance
    ];
    ```

**Available `mail_name` values:**
- `order_paid_customer` — Purchase receipt to customer
- `order_paid_admin` — New order alert to admin
- `order_refunded_customer` — Refund confirmation to customer
- `order_refunded_admin` — Refund alert to admin
- `subscription_renewed_customer` — Renewal receipt to customer
- `subscription_renewed_admin` — Renewal alert to admin
- `subscription_canceled_customer` — Cancellation notice to customer
- `subscription_canceled_admin` — Cancellation alert to admin
- `order_placed_customer` — Order confirmation to customer (offline payment)
- `order_placed_admin` — Order placed alert to admin (offline payment)

**Returns:**
- `$should` (bool): Whether the email notification should be sent

**Usage:**
```php
// Block all customer-facing emails for a specific payment gateway
add_filter('fluent_cart/should_send_email_notification', function($should, $args) {
    $order = $args['order'];

    if ($order->payment_method !== 'my_gateway') {
        return $should;
    }

    // Only allow order confirmation and admin notifications
    $allowedEmails = [
        'order_paid_customer',
        'order_paid_admin',
    ];

    return in_array($args['mail_name'], $allowedEmails, true);
}, 10, 2);
```

**Note:** This filter only affects automatic event-driven emails. Manual actions like generating invoices or printing receipts from the admin panel are not affected.
</details>

### <code> paddle_allowed_email_notifications </code>
<details>
<summary><code>fluent_cart/paddle_allowed_email_notifications</code> &mdash; Control which email notifications are allowed for Paddle orders</summary>

**When it runs:**
This filter is applied when determining whether to send an automatic email notification for a Paddle order. Since Paddle is a Merchant of Record and handles its own payment receipts, refund confirmations, and subscription billing emails, FluentCart blocks most automatic emails for Paddle orders by default. Use this filter to customize which emails are still sent by FluentCart.

**Parameters:**

- `$allowedEmails` (array): List of notification identifiers that FluentCart is allowed to send for Paddle orders
    ```php
    // Default allowed emails
    $allowedEmails = [
        'order_paid_customer',  // Order confirmation to customer
        'order_paid_admin',     // New order alert to admin
    ];
    ```

**Returns:**
- `$allowedEmails` (array): The modified list of allowed notification identifiers

**Usage:**
```php
// Allow shipping notifications for Paddle orders
add_filter('fluent_cart/paddle_allowed_email_notifications', function($allowedEmails) {
    $allowedEmails[] = 'shipping_status_changed_to_shipped_customer';
    $allowedEmails[] = 'shipping_status_changed_to_delivered_customer';
    return $allowedEmails;
});
```

**Available notification identifiers:**
- `order_paid_customer` — Purchase receipt / order confirmation to customer (allowed by default)
- `order_paid_admin` — New order alert to admin (allowed by default)
- `order_refunded_customer` — Refund confirmation to customer
- `order_refunded_admin` — Refund alert to admin
- `subscription_renewed_customer` — Renewal receipt to customer
- `subscription_renewed_admin` — Renewal alert to admin
- `subscription_canceled_customer` — Cancellation notice to customer
- `subscription_canceled_admin` — Cancellation alert to admin

**Note:** This filter is specific to Paddle orders. For general email notification control across all payment gateways, use the `fluent_cart/should_send_email_notification` filter instead.
</details>

---
