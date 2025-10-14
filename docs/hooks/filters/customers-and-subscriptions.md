# Customers & Subscriptions

All filters related to customer management and recurring revenue.

### <code> customer/view </code>
<details open>
<summary><code>fluent_cart/customer/view</code> &mdash; Filter customer view data</summary>

**When it runs:**
This filter is applied when preparing customer data for display in the admin.

**Parameters:**

- `$customer` (array): The customer data array
    ```php
    $customer = [
        'id' => 456,
        'email' => 'customer@example.com',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'total_orders' => 5,
        'total_spent' => 50000
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$customer` (array): The modified customer data

**Usage:**
```php
add_filter('fluent_cart/customer/view', function($customer, $data) {
    // Add custom field to customer view
    $customer['loyalty_points'] = get_user_meta($customer['id'], 'loyalty_points', true);
    return $customer;
}, 10, 2);
```
</details>

### <code> subscription_statuses </code>
<details>
<summary><code>fluent_cart/subscription_statuses</code> &mdash; Filter subscription statuses</summary>

**When it runs:**
This filter is applied when retrieving the list of available subscription statuses.

**Parameters:**

- `$statuses` (array): Array of subscription statuses (key => label)
    ```php
    $statuses = [
        'pending' => 'Pending',
        'active' => 'Active',
        'canceled' => 'Canceled',
        'expired' => 'Expired',
        'paused' => 'Paused'
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$statuses` (array): The modified subscription statuses array

**Usage:**
```php
add_filter('fluent_cart/subscription_statuses', function($statuses, $data) {
    // Add custom subscription status
    $statuses['on_hold'] = 'On Hold';
    return $statuses;
}, 10, 2);
```
</details>

### <code> subscription/view </code>
<details>
<summary><code>fluent_cart/subscription/view</code> &mdash; Filter subscription view data</summary>

**When it runs:**
This filter is applied when preparing subscription data for display.

**Parameters:**

- `$subscription` (array): The subscription data array
    ```php
    $subscription = [
        'id' => 789,
        'customer_id' => 456,
        'status' => 'active',
        'plan_id' => 123,
        'billing_interval' => 'month',
        'next_payment_date' => '2025-02-15'
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$subscription` (array): The modified subscription data

**Usage:**
```php
add_filter('fluent_cart/subscription/view', function($subscription, $data) {
    // Add custom field to subscription view
    $subscription['custom_note'] = 'Premium Member';
    return $subscription;
}, 10, 2);
```
</details>

### <code> customer_portal/active_tab </code>
<details>
<summary><code>fluent_cart/customer_portal/active_tab</code> &mdash; Filter customer portal active tab</summary>

**When it runs:**
This filter is applied when determining which tab should be active in the customer portal.

**Parameters:**

- `$activeTab` (string): The active tab identifier
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$activeTab` (string): The modified active tab

**Usage:**
```php
add_filter('fluent_cart/customer_portal/active_tab', function($activeTab, $data) {
    // Set default active tab
    return 'subscriptions';
}, 10, 2);
```
</details>

---