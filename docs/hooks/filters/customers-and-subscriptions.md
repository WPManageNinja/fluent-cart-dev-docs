# Customers & Subscriptions

All filters related to [Customer](/database/models/customer) management, the customer portal, [Subscription](/database/models/subscription) lifecycle, billing configuration, and automated reminders.

---

## Customer Data & Portal

### <code> customer/view </code>
<details open>
<summary><code>fluent_cart/customer/view</code> &mdash; Filter admin single customer view data</summary>

**When it runs:**
This filter is applied when preparing a single customer's data for display in the admin panel.

**Parameters:**

- `$customer` ([Customer](/database/models/customer)): The Customer model instance with loaded relations
    ```php
    $customer = [
        'id' => 456,
        'email' => 'customer@example.com',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'total_orders' => 5,
        'total_spent' => 50000,
        'selected_labels' => [...]
    ];
    ```
- `$requestData` (array): The full request data from `$request->all()`

**Returns:**
- `$customer` ([Customer](/database/models/customer)): The modified customer data

**Source:** `app/Http/Controllers/CustomerController.php:74`

**Usage:**
```php
add_filter('fluent_cart/customer/view', function($customer, $requestData) {
    // Add loyalty points to customer view
    $customer['loyalty_points'] = get_user_meta($customer['user_id'], 'loyalty_points', true);
    return $customer;
}, 10, 2);
```
</details>

### <code> widgets/single_customer </code>
<details>
<summary><code>fluent_cart/widgets/single_customer</code> &mdash; Filter single customer admin widgets</summary>

**When it runs:**
This filter is applied when loading widget data for a single customer's admin view, allowing you to inject custom widget sections.

**Parameters:**

- `$widgets` (array): Array of widget definitions (default: `[]`)
- `$customer` ([Customer](/database/models/customer)): The Customer model instance

**Returns:**
- `$widgets` (array): The modified widgets array

**Source:** `app/Http/Controllers/CustomerController.php:177`

**Usage:**
```php
add_filter('fluent_cart/widgets/single_customer', function($widgets, $customer) {
    // Add a custom CRM widget
    $widgets[] = [
        'title' => 'CRM Notes',
        'content' => get_user_meta($customer->user_id, 'crm_notes', true)
    ];
    return $widgets;
}, 10, 2);
```
</details>

### <code> customer_dashboard_data </code>
<details>
<summary><code>fluent_cart/customer_dashboard_data</code> &mdash; Filter customer dashboard data</summary>

**When it runs:**
This filter is applied when preparing the customer portal dashboard data, including the recent orders list and section parts. Runs both when a customer exists and when no customer is found.

**Parameters:**

- `$data` (array): The dashboard response data
    ```php
    $data = [
        'message' => 'Success',
        'dashboard_data' => [
            'orders' => [...] // Recent orders collection
        ],
        'sections_parts' => [
            'before_orders_table' => '',
            'after_orders_table' => ''
        ]
    ];
    ```
- `$context` (array): Context data containing the customer
    ```php
    $context = [
        'customer' => $customer // Customer model or null
    ];
    ```

**Returns:**
- `$data` (array): The modified dashboard data

**Source:** `app/Http/Controllers/FrontendControllers/CustomerProfileController.php:58,114`

**Usage:**
```php
add_filter('fluent_cart/customer_dashboard_data', function($data, $context) {
    $customer = $context['customer'];
    if ($customer) {
        // Add a welcome banner above the orders table
        $data['sections_parts']['before_orders_table'] = '<div class="welcome-banner">Welcome back!</div>';
    }
    return $data;
}, 10, 2);
```
</details>

### <code> global_customer_menu_items </code>
<details>
<summary><code>fluent_cart/global_customer_menu_items</code> &mdash; Filter customer portal menu items</summary>

**When it runs:**
This filter is applied when building the customer portal sidebar navigation menu, after built-in items have been conditionally removed (e.g., subscriptions, licenses).

**Parameters:**

- `$menuItems` (array): Associative array of menu items keyed by slug
    ```php
    $menuItems = [
        'orders' => [
            'label' => 'Orders',
            'css_class' => 'fct_route',
            'link' => '/customer-portal/#/orders',
            'icon_svg' => '<svg>...</svg>'
        ],
        'subscriptions' => [...],
        'licenses' => [...],
        'downloads' => [...],
        'profile' => [...]
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'base_url' => '/customer-portal/#/'
    ];
    ```

**Returns:**
- `$menuItems` (array): The modified menu items array

**Source:** `app/Hooks/Handlers/ShortCodes/CustomerProfileHandler.php:266`

**Usage:**
```php
add_filter('fluent_cart/global_customer_menu_items', function($menuItems, $context) {
    // Add a custom "Support" tab before "profile"
    $baseUrl = $context['base_url'];
    $menuItems['support'] = [
        'label' => 'Support',
        'css_class' => 'fct_route',
        'link' => $baseUrl . 'support',
        'icon_svg' => '<svg>...</svg>'
    ];
    return $menuItems;
}, 10, 2);
```
</details>

### <code> customer_portal/active_tab </code>
<details>
<summary><code>fluent_cart/customer_portal/active_tab</code> &mdash; Filter the active tab in customer portal</summary>

**When it runs:**
This filter is applied when rendering the customer portal to determine which tab should be visually active by default.

**Parameters:**

- `$activeTab` (string): The active tab identifier (default: `''`)

**Returns:**
- `$activeTab` (string): The modified active tab slug

**Source:** `app/Hooks/Handlers/ShortCodes/CustomerProfileHandler.php:117`

**Usage:**
```php
add_filter('fluent_cart/customer_portal/active_tab', function($activeTab) {
    // Default to subscriptions tab
    return 'subscriptions';
}, 10, 1);
```
</details>

### <code> customer_portal/custom_endpoints </code>
<details>
<summary><code>fluent_cart/customer_portal/custom_endpoints</code> &mdash; Filter custom portal endpoints</summary>

**When it runs:**
This filter is applied when routing customer portal requests to check for registered custom endpoint paths. Use this to add entirely new pages to the customer portal.

**Parameters:**

- `$endpoints` (array): Associative array of custom endpoints (default: `[]`)
    ```php
    $endpoints = [
        'my-page' => [
            'render_callback' => callable,
            // or 'page_id' => 123
        ]
    ];
    ```

**Returns:**
- `$endpoints` (array): The modified endpoints array

**Source:** `app/Hooks/Handlers/ShortCodes/CustomerProfileHandler.php:141`

**Usage:**
```php
add_filter('fluent_cart/customer_portal/custom_endpoints', function($endpoints) {
    $endpoints['warranty'] = [
        'render_callback' => function() {
            echo '<div class="warranty-page">Warranty info here</div>';
        }
    ];
    return $endpoints;
}, 10, 1);
```

::: tip
Consider using the `FluentCartGeneralApi::addCustomerPortalEndpoint()` helper method instead, which registers both the menu item and the endpoint in one call.
:::
</details>

### <code> customer_portal/subscription_data </code>
<details>
<summary><code>fluent_cart/customer_portal/subscription_data</code> &mdash; Filter customer portal subscription data</summary>

**When it runs:**
This filter is applied when preparing a single subscription's data for display in the customer portal, after transactions have been loaded.

**Parameters:**

- `$formattedData` (array): The formatted subscription data including transactions
- `$context` (array): Context data
    ```php
    $context = [
        'subscription' => $subscription, // Subscription model
        'customer' => $customer           // Customer model
    ];
    ```

**Returns:**
- `$formattedData` (array): The modified subscription data

**Source:** `app/Http/Controllers/FrontendControllers/CustomerSubscriptionController.php:157`

**Usage:**
```php
add_filter('fluent_cart/customer_portal/subscription_data', function($formattedData, $context) {
    // Add next invoice preview
    $subscription = $context['subscription'];
    $formattedData['next_invoice_preview'] = [
        'amount' => $subscription->recurring_amount,
        'date' => $subscription->expiration_at
    ];
    return $formattedData;
}, 10, 2);
```
</details>

### <code> payment_methods/stripe_pub_key </code>
<details>
<summary><code>fluent_cart/payment_methods/stripe_pub_key</code> &mdash; Filter Stripe public key for customer portal</summary>

**When it runs:**
This filter is applied when localizing JavaScript data for the customer portal, providing the Stripe publishable key for client-side payment operations.

**Parameters:**

- `$pubKey` (string): The Stripe publishable key (default: `''`)

**Returns:**
- `$pubKey` (string): The modified Stripe public key

**Source:** `app/Hooks/Handlers/ShortCodes/CustomerProfileHandler.php:356`

**Usage:**
```php
add_filter('fluent_cart/payment_methods/stripe_pub_key', function($pubKey) {
    // Override Stripe key for specific conditions
    if (defined('STRIPE_TEST_MODE') && STRIPE_TEST_MODE) {
        return 'pk_test_xxxxxxxxxxxx';
    }
    return $pubKey;
}, 10, 1);
```
</details>

### <code> payment_methods/paypal_client_id </code>
<details>
<summary><code>fluent_cart/payment_methods/paypal_client_id</code> &mdash; Filter PayPal client ID for customer portal</summary>

**When it runs:**
This filter is applied when localizing JavaScript data for the customer portal, providing the PayPal client ID for client-side payment operations.

**Parameters:**

- `$clientId` (string): The PayPal client ID (default: `''`)
- `$context` (array): Additional context data (default: `[]`)

**Returns:**
- `$clientId` (string): The modified PayPal client ID

**Source:** `app/Hooks/Handlers/ShortCodes/CustomerProfileHandler.php:357`

**Usage:**
```php
add_filter('fluent_cart/payment_methods/paypal_client_id', function($clientId, $context) {
    // Provide the PayPal sandbox client ID for testing
    return 'AYourPayPalClientId';
}, 10, 2);
```
</details>

---

## Customer Statuses & Auth

### <code> editable_customer_statuses </code>
<details>
<summary><code>fluent_cart/editable_customer_statuses</code> &mdash; Filter editable customer statuses</summary>

**When it runs:**
This filter is applied when retrieving the list of customer statuses that can be set in the admin panel.

> **Deprecated:** The old hook name `fluent-cart/editable_customer_statuses` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**

- `$statuses` (array): Associative array of status key => label
    ```php
    $statuses = [
        'active' => 'Active',
        'inactive' => 'Inactive'
    ];
    ```
- `$context` (array): Additional context data (default: `[]`)

**Returns:**
- `$statuses` (array): The modified statuses array

**Source:** `app/Helpers/Status.php:350`

**Usage:**
```php
add_filter('fluent_cart/editable_customer_statuses', function($statuses, $context) {
    // Add a "suspended" customer status
    $statuses['suspended'] = __('Suspended', 'my-plugin');
    return $statuses;
}, 10, 2);
```
</details>

### <code> user/after_register/skip_hooks </code>
<details>
<summary><code>fluent_cart/user/after_register/skip_hooks</code> &mdash; Skip post-registration hooks</summary>

**When it runs:**
This filter is applied after a new WordPress user has been created during checkout registration. When it returns `true`, standard WordPress post-registration hooks like `register_new_user` are skipped.

**Parameters:**

- `$skip` (bool): Whether to skip the hooks (default: `false`)
- `$user_id` (int): The newly created WordPress user ID

**Returns:**
- `$skip` (bool): Whether to skip the post-registration hooks

**Source:** `app/Services/AuthService.php:122`

**Usage:**
```php
add_filter('fluent_cart/user/after_register/skip_hooks', function($skip, $userId) {
    // Skip default WP registration hooks to prevent welcome emails
    // when creating users during checkout
    return true;
}, 10, 2);
```
</details>

---

## Subscription Statuses & Configuration

### <code> subscription_statuses </code>
<details>
<summary><code>fluent_cart/subscription_statuses</code> &mdash; Filter subscription statuses</summary>

**When it runs:**
This filter is applied when retrieving the list of all available subscription statuses used throughout the system.

**Parameters:**

- `$statuses` (array): Associative array of status key => label
    ```php
    $statuses = [
        'pending' => 'Pending',
        'active' => 'Active',
        'failing' => 'Failing',
        'paused' => 'Paused',
        'expired' => 'Expired',
        'expiring' => 'Expiring',
        'canceled' => 'Canceled',
        'trialing' => 'Trialing',
        'intended' => 'Intended',
        'past_due' => 'Past Due',
        'completed' => 'Completed'
    ];
    ```
- `$context` (array): Additional context data (default: `[]`)

**Returns:**
- `$statuses` (array): The modified subscription statuses array

**Source:** `app/Helpers/Status.php:253`

**Usage:**
```php
add_filter('fluent_cart/subscription_statuses', function($statuses, $context) {
    // Add a custom "on_hold" status
    $statuses['on_hold'] = __('On Hold', 'my-plugin');
    return $statuses;
}, 10, 2);
```
</details>

### <code> validable_subscription_statuses </code>
<details>
<summary><code>fluent_cart/validable_subscription_statuses</code> &mdash; Filter valid (active) subscription statuses</summary>

**When it runs:**
This filter is applied when determining which subscription statuses should be considered "valid" (i.e., the subscription grants access to the product/service). Used for license validation, download access, etc.

**Parameters:**

- `$statuses` (array): Array of status keys considered valid
    ```php
    $statuses = ['active', 'trialing'];
    ```
- `$context` (array): Additional context data (default: `[]`)

**Returns:**
- `$statuses` (array): The modified list of valid statuses

**Source:** `app/Helpers/Status.php:271`

**Usage:**
```php
add_filter('fluent_cart/validable_subscription_statuses', function($statuses, $context) {
    // Also treat "expiring" subscriptions as valid until they actually expire
    $statuses[] = 'expiring';
    return $statuses;
}, 10, 2);
```
</details>

### <code> subscription/view </code>
<details>
<summary><code>fluent_cart/subscription/view</code> &mdash; Filter admin subscription view data</summary>

**When it runs:**
This filter is applied when preparing a single subscription's data for display in the admin panel.

**Parameters:**

- `$subscription` ([Subscription](/database/models/subscription)): The Subscription model with loaded relations
- `$context` (array): Additional context data (default: `[]`)

**Returns:**
- `$subscription` (array): The modified subscription data

**Source:** `app/Modules/Subscriptions/Http/Controllers/SubscriptionController.php:63`

**Usage:**
```php
add_filter('fluent_cart/subscription/view', function($subscription, $context) {
    // Add external gateway link
    $subscription['external_url'] = 'https://dashboard.stripe.com/subscriptions/' . $subscription['vendor_subscription_id'];
    return $subscription;
}, 10, 2);
```
</details>

### <code> subscription/url_{$payment_method} </code>
<details>
<summary><code>fluent_cart/subscription/url_{$payment_method}</code> &mdash; Filter vendor dashboard URL for a subscription (dynamic)</summary>

**When it runs:**
This filter is applied when generating the external vendor dashboard URL for a subscription. The hook name is dynamic, with `{$payment_method}` replaced by the subscription's current payment method (e.g., `stripe`, `paypal`).

**Parameters:**

- `$url` (string): The vendor dashboard URL (default: `''`)
- `$context` (array): Context data
    ```php
    $context = [
        'vendor_subscription_id' => 'sub_1234567890',
        'payment_mode' => 'live', // or 'test'
        'subscription' => $subscription // Subscription model
    ];
    ```

**Returns:**
- `$url` (string): The modified vendor dashboard URL

**Source:** `app/Models/Subscription.php:158`

**Usage:**
```php
// Provide the Stripe dashboard URL for subscriptions
add_filter('fluent_cart/subscription/url_stripe', function($url, $context) {
    $subId = $context['vendor_subscription_id'];
    $mode = $context['payment_mode'];
    $base = ($mode === 'test')
        ? 'https://dashboard.stripe.com/test'
        : 'https://dashboard.stripe.com';
    return $base . '/subscriptions/' . $subId;
}, 10, 2);
```
</details>

### <code> subscription/can_reactivate </code>
<details>
<summary><code>fluent_cart/subscription/can_reactivate</code> &mdash; Filter whether a subscription can be reactivated</summary>

**When it runs:**
This filter is applied when checking if a canceled, failing, expired, paused, expiring, or past-due subscription is eligible for reactivation.

**Parameters:**

- `$canReactivate` (bool): Whether the subscription can be reactivated (based on its current status)
- `$context` (array): Context data
    ```php
    $context = [
        'subscription' => $subscription // Subscription model
    ];
    ```

**Returns:**
- `$canReactivate` (bool): The modified reactivation eligibility

**Source:** `app/Models/Subscription.php:427`

**Usage:**
```php
add_filter('fluent_cart/subscription/can_reactivate', function($canReactivate, $context) {
    $subscription = $context['subscription'];

    // Prevent reactivation if canceled more than 90 days ago
    if ($subscription->status === 'canceled') {
        $canceledAt = strtotime($subscription->updated_at);
        if ((time() - $canceledAt) > (90 * DAY_IN_SECONDS)) {
            return false;
        }
    }
    return $canReactivate;
}, 10, 2);
```
</details>

### <code> available_subscription_interval_options </code>
<details>
<summary><code>fluent_cart/available_subscription_interval_options</code> &mdash; Filter subscription interval options</summary>

**When it runs:**
This filter is applied when retrieving the list of available subscription billing interval options for product configuration.

**Parameters:**

- `$intervals` (array): Array of interval option objects
    ```php
    $intervals = [
        ['label' => 'Yearly', 'value' => 'yearly', 'map_value' => 'year'],
        ['label' => 'Half Yearly', 'value' => 'half_yearly', 'map_value' => 'half_year'],
        ['label' => 'Quarterly', 'value' => 'quarterly', 'map_value' => 'quarter'],
        ['label' => 'Monthly', 'value' => 'monthly', 'map_value' => 'month'],
        ['label' => 'Weekly', 'value' => 'weekly', 'map_value' => 'week'],
        ['label' => 'Daily', 'value' => 'daily', 'map_value' => 'day']
    ];
    ```

**Returns:**
- `$intervals` (array): The modified intervals array

**Source:** `app/Helpers/Helper.php:1531`

**Usage:**
```php
add_filter('fluent_cart/available_subscription_interval_options', function($intervals) {
    // Add a custom "Every 10 days" interval
    $intervals[] = [
        'label' => __('Every 10th Day', 'my-plugin'),
        'value' => 'every_tenth_day',
        'map_value' => '10th Day'
    ];
    return $intervals;
});
```

::: tip
When adding custom intervals, you must also implement the `fluent_cart/subscription_interval_in_days` and `fluent_cart/subscription_billing_period` filters so the system knows how to calculate dates and communicate with payment gateways.
:::
</details>

### <code> subscription_interval_in_days </code>
<details>
<summary><code>fluent_cart/subscription_interval_in_days</code> &mdash; Filter the number of days for a custom subscription interval</summary>

**When it runs:**
This filter is applied when converting a subscription interval to its day count. For built-in intervals (yearly, half_yearly, quarterly, monthly, weekly, daily), the value is calculated automatically. This filter fires for custom/unknown intervals with a default of `0`.

**Parameters:**

- `$days` (int): Number of days for the interval (default: `0` for custom intervals)
- `$context` (array): Context data
    ```php
    $context = [
        'interval' => 'every_tenth_day' // The interval key
    ];
    ```

**Returns:**
- `$days` (int): The number of days in this interval

**Source:** `app/Helpers/Helper.php:1592`, `app/Services/Payments/PaymentHelper.php:236`

**Usage:**
```php
add_filter('fluent_cart/subscription_interval_in_days', function($days, $args) {
    $interval = $args['interval'];

    if ($interval === 'every_tenth_day') {
        return 10;
    }

    if ($interval === 'biweekly') {
        return 14;
    }

    return $days;
}, 10, 2);
```
</details>

### <code> max_trial_days_allowed </code>
<details>
<summary><code>fluent_cart/max_trial_days_allowed</code> &mdash; Filter maximum trial days allowed</summary>

**When it runs:**
This filter is applied when calculating adjusted trial days for a subscription interval. The system ensures the trial period does not exceed this maximum.

**Parameters:**

- `$maxDays` (int): Maximum trial days allowed (default: `365`)
- `$context` (array): Context data
    ```php
    $context = [
        'existing_trial_days' => 14,
        'repeat_interval' => 'monthly',
        'interval_in_days' => 30
    ];
    ```

**Returns:**
- `$maxDays` (int): The modified maximum trial days

**Source:** `app/Helpers/Helper.php:1566`

**Usage:**
```php
add_filter('fluent_cart/max_trial_days_allowed', function($maxDays, $args) {
    // Cap trials at 30 days for monthly subscriptions
    if ($args['repeat_interval'] === 'monthly') {
        return 30;
    }
    return $maxDays;
}, 10, 2);
```
</details>

### <code> trial_info </code>
<details>
<summary><code>fluent_cart/trial_info</code> &mdash; Filter trial info display text</summary>

**When it runs:**
This filter is applied when generating the human-readable trial information text shown to customers (e.g., "Free Trial: 14 days").

**Parameters:**

- `$trialInfo` (string): The generated trial info text (e.g., `'Free Trial: 14 days'` or `''` if no trial)
- `$otherInfo` (array): The product/variant pricing metadata
    ```php
    $otherInfo = [
        'trial_days' => 14,
        'is_trial_days_simulated' => 'no',
        'signup_fee' => 0,
        'manage_setup_fee' => 'no',
        // ... other pricing info
    ];
    ```

**Returns:**
- `$trialInfo` (string): The modified trial info text

**Source:** `app/Helpers/Helper.php:1133`

**Usage:**
```php
add_filter('fluent_cart/trial_info', function($trialInfo, $otherInfo) {
    $days = $otherInfo['trial_days'] ?? 0;
    if ($days > 0) {
        return sprintf('Try free for %d days - no credit card required!', $days);
    }
    return $trialInfo;
}, 10, 2);
```
</details>

---

## Subscription Billing

### <code> subscription_billing_period </code>
<details>
<summary><code>fluent_cart/subscription_billing_period</code> &mdash; Filter billing period for payment gateways</summary>

**When it runs:**
This filter is applied when translating a FluentCart subscription interval into the payment gateway's billing period format (used by Stripe Plans and PayPal billing cycles).

**Parameters:**

- `$billingPeriod` (array): The billing period for the gateway
    ```php
    $billingPeriod = [
        'interval_unit' => 'month',      // day, week, month, year
        'interval_frequency' => 1         // e.g., 3 for quarterly
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'subscription_interval' => 'quarterly', // Original FluentCart interval
        'payment_method' => 'stripe'             // or 'paypal'
    ];
    ```

**Returns:**
- `$billingPeriod` (array): The modified billing period

**Source:** `app/Modules/PaymentMethods/StripeGateway/Plan.php:58`, `app/Modules/PaymentMethods/PayPalGateway/PayPalHelper.php:243`

**Usage:**
```php
add_filter('fluent_cart/subscription_billing_period', function($billingPeriod, $args) {
    $interval = $args['subscription_interval'];
    $method = $args['payment_method'];

    if ($interval === 'every_tenth_day') {
        if ($method === 'stripe') {
            return [
                'interval_unit' => 'day',
                'interval_frequency' => 10
            ];
        }
        if ($method === 'paypal') {
            return [
                'interval_unit' => 'DAY',
                'interval_frequency' => 10
            ];
        }
    }

    return $billingPeriod;
}, 10, 2);
```
</details>

### <code> subscription/grace_period_days </code>
<details>
<summary><code>fluent_cart/subscription/grace_period_days</code> &mdash; Filter grace period days per billing interval</summary>

**When it runs:**
This filter is applied when retrieving the grace period (number of extra days after a payment fails before the subscription is marked as expired) for each billing interval.

**Parameters:**

- `$gracePeriods` (array): Associative array of interval => days
    ```php
    $gracePeriods = [
        'daily' => 1,
        'weekly' => 3,
        'monthly' => 7,
        'quarterly' => 15,
        'half_yearly' => 15,
        'yearly' => 15
    ];
    ```

**Returns:**
- `$gracePeriods` (array): The modified grace period days

**Source:** `app/Services/Payments/SubscriptionHelper.php:159`

**Usage:**
```php
add_filter('fluent_cart/subscription/grace_period_days', function($gracePeriods) {
    // Give yearly subscribers more time
    $gracePeriods['yearly'] = 30;

    // Add grace period for custom interval
    $gracePeriods['every_tenth_day'] = 5;

    return $gracePeriods;
});
```
</details>

---

## Reminders

### <code> reminders/scan_batch_size </code>
<details>
<summary><code>fluent_cart/reminders/scan_batch_size</code> &mdash; Filter reminder scan batch size</summary>

**When it runs:**
This filter is applied when the automated reminder system scans for subscriptions or invoices that need reminders. Controls how many records are processed per batch.

**Parameters:**

- `$batchSize` (int): Number of records per scan batch (default: `100`, min: `10`, max: `500`)

**Returns:**
- `$batchSize` (int): The modified batch size

**Source:** `app/Services/Reminders/ReminderService.php:75`

**Usage:**
```php
add_filter('fluent_cart/reminders/scan_batch_size', function($batchSize) {
    // Process more records per batch on high-traffic sites
    return 250;
});
```
</details>

### <code> reminders/invoice_due_days </code>
<details>
<summary><code>fluent_cart/reminders/invoice_due_days</code> &mdash; Filter invoice due reminder days</summary>

**When it runs:**
This filter is applied when determining how many days before an invoice is due to send a reminder. The value comes from store settings but can be overridden.

**Parameters:**

- `$days` (int): Number of days before due date to send reminder (from store settings, min: `0`)

**Returns:**
- `$days` (int): The modified number of days

**Source:** `app/Services/Reminders/InvoiceReminderService.php:288`

**Usage:**
```php
add_filter('fluent_cart/reminders/invoice_due_days', function($days) {
    // Always remind 3 days before invoice is due
    return 3;
});
```
</details>

### <code> reminders/invoice_overdue_days </code>
<details>
<summary><code>fluent_cart/reminders/invoice_overdue_days</code> &mdash; Filter overdue invoice reminder intervals</summary>

**When it runs:**
This filter is applied when determining at which day intervals after an invoice becomes overdue to send follow-up reminders.

**Parameters:**

- `$days` (array): Array of day intervals for overdue reminders (default from settings: `[1, 3, 7]`)

**Returns:**
- `$days` (array): The modified array of overdue reminder day intervals

**Source:** `app/Services/Reminders/InvoiceReminderService.php:299`

**Usage:**
```php
add_filter('fluent_cart/reminders/invoice_overdue_days', function($days) {
    // Send overdue reminders at 1, 3, 7, and 14 days past due
    return [1, 3, 7, 14];
});
```
</details>

### <code> reminders/billing_cycle </code>
<details>
<summary><code>fluent_cart/reminders/billing_cycle</code> &mdash; Filter billing cycle name for reminder processing</summary>

**When it runs:**
This filter is applied when mapping a subscription's billing interval to a billing cycle identifier used by the reminder system. Returns `'unsupported'` for unknown intervals by default.

**Parameters:**

- `$cycle` (string): The billing cycle name (e.g., `'monthly'`, `'yearly'`, `'unsupported'`)
- `$subscription` ([Subscription](/database/models/subscription)): The Subscription model instance

**Returns:**
- `$cycle` (string): The modified billing cycle name

**Source:** `app/Services/Reminders/SubscriptionReminderService.php:502`

**Usage:**
```php
add_filter('fluent_cart/reminders/billing_cycle', function($cycle, $subscription) {
    // Map custom intervals to supported reminder cycles
    if ($subscription->billing_interval === 'every_tenth_day') {
        return 'daily'; // Use daily reminder logic
    }
    return $cycle;
}, 10, 2);
```
</details>

### <code> reminders/yearly_before_days </code>
<details>
<summary><code>fluent_cart/reminders/yearly_before_days</code> &mdash; Filter days before yearly renewal reminder</summary>

**When it runs:**
This filter is applied when determining at which day intervals before a yearly subscription renewal to send reminders.

**Parameters:**

- `$days` (array): Array of day intervals before renewal (default from settings: `[30]`, range: 7-90)

**Returns:**
- `$days` (array): The modified array of reminder day intervals

**Source:** `app/Services/Reminders/SubscriptionReminderService.php:534`

**Usage:**
```php
add_filter('fluent_cart/reminders/yearly_before_days', function($days) {
    // Remind at 60, 30, and 7 days before yearly renewal
    return [60, 30, 7];
});
```
</details>

### <code> reminders/monthly_before_days </code>
<details>
<summary><code>fluent_cart/reminders/monthly_before_days</code> &mdash; Filter days before monthly renewal reminder</summary>

**When it runs:**
This filter is applied when determining at which day intervals before a monthly subscription renewal to send reminders.

**Parameters:**

- `$days` (array): Array of day intervals before renewal (default from settings: `[7]`, range: 3-28)

**Returns:**
- `$days` (array): The modified array of reminder day intervals

**Source:** `app/Services/Reminders/SubscriptionReminderService.php:546`

**Usage:**
```php
add_filter('fluent_cart/reminders/monthly_before_days', function($days) {
    // Remind at 7 and 3 days before monthly renewal
    return [7, 3];
});
```
</details>

### <code> reminders/quarterly_before_days </code>
<details>
<summary><code>fluent_cart/reminders/quarterly_before_days</code> &mdash; Filter days before quarterly renewal reminder</summary>

**When it runs:**
This filter is applied when determining at which day intervals before a quarterly subscription renewal to send reminders.

**Parameters:**

- `$days` (array): Array of day intervals before renewal (default from settings: `[14]`, range: 7-60)

**Returns:**
- `$days` (array): The modified array of reminder day intervals

**Source:** `app/Services/Reminders/SubscriptionReminderService.php:558`

**Usage:**
```php
add_filter('fluent_cart/reminders/quarterly_before_days', function($days) {
    // Remind at 21 and 7 days before quarterly renewal
    return [21, 7];
});
```
</details>

### <code> reminders/half_yearly_before_days </code>
<details>
<summary><code>fluent_cart/reminders/half_yearly_before_days</code> &mdash; Filter days before half-yearly renewal reminder</summary>

**When it runs:**
This filter is applied when determining at which day intervals before a half-yearly subscription renewal to send reminders.

**Parameters:**

- `$days` (array): Array of day intervals before renewal (default from settings: `[21]`, range: 7-60)

**Returns:**
- `$days` (array): The modified array of reminder day intervals

**Source:** `app/Services/Reminders/SubscriptionReminderService.php:570`

**Usage:**
```php
add_filter('fluent_cart/reminders/half_yearly_before_days', function($days) {
    // Remind at 30 and 7 days before half-yearly renewal
    return [30, 7];
});
```
</details>

### <code> reminders/trial_end_days </code>
<details>
<summary><code>fluent_cart/reminders/trial_end_days</code> &mdash; Filter days before trial end reminder</summary>

**When it runs:**
This filter is applied when determining at which day intervals before a trial period ends to send reminders to the customer.

**Parameters:**

- `$days` (array): Array of day intervals before trial ends (default from settings: `[3]`, range: 1-14)

**Returns:**
- `$days` (array): The modified array of reminder day intervals

**Source:** `app/Services/Reminders/SubscriptionReminderService.php:582`

**Usage:**
```php
add_filter('fluent_cart/reminders/trial_end_days', function($days) {
    // Remind at 7, 3, and 1 day before trial ends
    return [7, 3, 1];
});
```
</details>

---

## Pro: Early Payments & Reactivation

### <code> subscription/early_payment_enabled </code>
<details>
<summary><code>fluent_cart/subscription/early_payment_enabled</code> <Badge type="warning" text="Pro" /> &mdash; Filter whether early installment payments are enabled</summary>

**When it runs:**
This filter is applied when checking if the early payment feature for installment subscriptions is globally enabled. Requires FluentCart Pro to be active.

**Parameters:**

- `$isEnabled` (bool): Whether early payments are enabled (from store settings `enable_early_payment_for_installment`)

**Returns:**
- `$isEnabled` (bool): The modified enabled state

**Source:** `app/Modules/Subscriptions/Services/EarlyPaymentFeature.php:14`

**Usage:**
```php
add_filter('fluent_cart/subscription/early_payment_enabled', function($isEnabled) {
    // Disable early payments during a specific promotion period
    if (current_time('Y-m') === '2026-12') {
        return false;
    }
    return $isEnabled;
});
```
</details>

### <code> subscription/can_early_pay </code>
<details>
<summary><code>fluent_cart/subscription/can_early_pay</code> <Badge type="warning" text="Pro" /> &mdash; Filter whether a specific subscription can make an early payment</summary>

**When it runs:**
This filter is applied when checking if a specific installment subscription is eligible for early payment. The default check requires that early payments are globally enabled, the subscription has a finite bill count, there are remaining installments, and the subscription status is `active` or `trialing`.

**Parameters:**

- `$canPay` (bool): Whether the subscription can make an early payment
- `$context` (array): Context data
    ```php
    $context = [
        'subscription' => $subscription // Subscription model
    ];
    ```

**Returns:**
- `$canPay` (bool): The modified eligibility

**Source:** `app/Modules/Subscriptions/Services/EarlyPaymentFeature.php:26`

**Usage:**
```php
add_filter('fluent_cart/subscription/can_early_pay', function($canPay, $context) {
    $subscription = $context['subscription'];

    // Only allow early payments for subscriptions with more than 2 remaining installments
    $remaining = $subscription->bill_times - $subscription->bill_count;
    if ($remaining <= 2) {
        return false;
    }

    return $canPay;
}, 10, 2);
```
</details>

### <code> subscription/reactivation_same_price_days_limit </code>
<details>
<summary><code>fluent_cart/subscription/reactivation_same_price_days_limit</code> <Badge type="warning" text="Pro" /> &mdash; Filter days limit for same-price reactivation</summary>

**When it runs:**
This filter is applied when a customer reactivates a canceled or expired subscription. If the subscription was canceled within this many days, the customer can reactivate at the original price without going through a new checkout.

**Parameters:**

- `$daysLimit` (int): Number of days within which same-price reactivation is allowed (default: `60`)
- `$context` (array): Context data
    ```php
    $context = [
        'subscription' => $subscription // Subscription model
    ];
    ```

**Returns:**
- `$daysLimit` (int): The modified days limit

**Source:** `fluent-cart-pro/.../SubscriptionRenewalHandler.php:234`

**Usage:**
```php
add_filter('fluent_cart/subscription/reactivation_same_price_days_limit', function($daysLimit, $context) {
    $subscription = $context['subscription'];

    // Give yearly subscribers a longer reactivation window
    if ($subscription->billing_interval === 'yearly') {
        return 180; // 6 months
    }

    return $daysLimit;
}, 10, 2);
```
</details>

---

## Pro: License Customer Portal

### <code> customer/license_details_section_parts </code>
<details>
<summary><code>fluent_cart/customer/license_details_section_parts</code> <Badge type="warning" text="Pro" /> &mdash; Filter license details section parts in customer portal</summary>

**When it runs:**
This filter is applied when rendering a license details page in the customer portal, allowing you to inject custom HTML into specific sections of the license view.

**Parameters:**

- `$sectionParts` (array): Associative array of injectable HTML sections
    ```php
    $sectionParts = [
        'before_summary' => '',
        'after_summary' => '',
        'end_of_details' => '',
        'additional_actions' => ''
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'license' => $license,          // License model
        'formattedData' => $formattedData // Formatted license data for display
    ];
    ```

**Returns:**
- `$sectionParts` (array): The modified section parts

**Source:** `fluent-cart-pro/.../CustomerProfileController.php:97`

**Usage:**
```php
add_filter('fluent_cart/customer/license_details_section_parts', function($parts, $context) {
    $license = $context['license'];

    // Add activation instructions after the summary
    $parts['after_summary'] = '<div class="activation-guide">'
        . '<h4>How to Activate</h4>'
        . '<p>Copy your license key and paste it in your plugin settings.</p>'
        . '</div>';

    // Add a custom action button
    $parts['additional_actions'] = '<button class="btn-regenerate" onclick="regenerateLicense(\'' . $license->id . '\')">Regenerate Key</button>';

    return $parts;
}, 10, 2);
```
</details>

---
