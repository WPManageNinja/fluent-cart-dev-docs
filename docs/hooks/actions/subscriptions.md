# Subscriptions

Action hooks for [Subscription](/database/models/subscription) lifecycle management, status transitions, and scheduled reminder notifications. These hooks let you react to subscription state changes, send custom notifications, and integrate with external systems. Most hooks pass the related [Order](/database/models/order) and [Customer](/database/models/customer) models as well.

---

## Subscription Status Changes

### <code> subscription_status_changed </code>
<details open>
<summary><code>fluent_cart/payments/subscription_status_changed</code> &mdash; Fires on any subscription status transition</summary>

**When it runs:**
This action fires whenever a [Subscription](/database/models/subscription)'s status changes from one value to another (e.g., `pending` to `active`, `active` to `cancelled`, etc.). It does **not** fire when other subscription data changes without a status transition. This is the generic handler -- for status-specific hooks, see `fluent_cart/payments/subscription_{$status}` below.

**Parameters:**

- `$data` (array): Subscription status change data
    ```php
    $data = [
        'subscription' => $subscriptionModel, // \FluentCart\App\Models\Subscription
        'order'        => $subscriptionModel->order, // \FluentCart\App\Models\Order
        'customer'     => $subscriptionModel->customer, // \FluentCart\App\Models\Customer
        'old_status'   => 'pending', // string — previous status
        'new_status'   => 'active', // string — current status after update
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php`

**Usage:**
```php
add_action('fluent_cart/payments/subscription_status_changed', function ($data) {
    $subscription = $data['subscription'];
    $oldStatus    = $data['old_status'];
    $newStatus    = $data['new_status'];

    // Log every status transition
    fluent_cart_add_log(
        'Subscription Status Changed',
        sprintf('Subscription #%d changed from %s to %s', $subscription->id, $oldStatus, $newStatus),
        'info'
    );
}, 10, 1);
```
</details>

### <code> subscription_active </code>
<details>
<summary><code>fluent_cart/payments/subscription_active</code> &mdash; Fires when a subscription becomes active</summary>

**When it runs:**
This action fires when a subscription's status transitions to `active`. This may occur after initial payment, after reactivation, or when moving from `trialing` to `active`.

**Parameters:**

- `$data` (array): Subscription data
    ```php
    $data = [
        'subscription' => $subscriptionModel, // \FluentCart\App\Models\Subscription
        'order'        => $subscriptionModel->order, // \FluentCart\App\Models\Order
        'customer'     => $subscriptionModel->customer, // \FluentCart\App\Models\Customer
        'old_status'   => 'pending', // string — previous status
        'new_status'   => 'active', // string — always 'active'
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php`

**Usage:**
```php
add_action('fluent_cart/payments/subscription_active', function ($data) {
    $customer = $data['customer'];

    // Grant premium access when subscription activates
    update_user_meta($customer->user_id, 'premium_member', true);
}, 10, 1);
```
</details>

### <code> subscription_canceled </code>
<details>
<summary><code>fluent_cart/payments/subscription_canceled</code> &mdash; Fires when a subscription is cancelled</summary>

**When it runs:**
This action fires when a subscription's status transitions to `canceled`. The `canceled_at` timestamp is automatically set if not already provided.

**Parameters:**

- `$data` (array): Subscription data
    ```php
    $data = [
        'subscription' => $subscriptionModel, // \FluentCart\App\Models\Subscription
        'order'        => $subscriptionModel->order, // \FluentCart\App\Models\Order
        'customer'     => $subscriptionModel->customer, // \FluentCart\App\Models\Customer
        'old_status'   => 'active', // string — previous status
        'new_status'   => 'canceled', // string — always 'canceled'
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php`

**Usage:**
```php
add_action('fluent_cart/payments/subscription_canceled', function ($data) {
    $subscription = $data['subscription'];
    $customer     = $data['customer'];

    // Revoke premium access on cancellation
    update_user_meta($customer->user_id, 'premium_member', false);

    // Notify admin
    wp_mail(
        get_option('admin_email'),
        'Subscription Cancelled',
        sprintf('Subscription #%d for %s has been cancelled.', $subscription->id, $customer->email)
    );
}, 10, 1);
```
</details>

### <code> subscription_paused </code>
<details>
<summary><code>fluent_cart/payments/subscription_paused</code> &mdash; Fires when a subscription is paused</summary>

**When it runs:**
This action fires when a subscription's status transitions to `paused`. The subscription remains in the system but billing is temporarily halted.

**Parameters:**

- `$data` (array): Subscription data
    ```php
    $data = [
        'subscription' => $subscriptionModel, // \FluentCart\App\Models\Subscription
        'order'        => $subscriptionModel->order, // \FluentCart\App\Models\Order
        'customer'     => $subscriptionModel->customer, // \FluentCart\App\Models\Customer
        'old_status'   => 'active', // string — previous status
        'new_status'   => 'paused', // string — always 'paused'
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php`

**Usage:**
```php
add_action('fluent_cart/payments/subscription_paused', function ($data) {
    $subscription = $data['subscription'];

    // Temporarily suspend feature access
    update_user_meta($data['customer']->user_id, 'subscription_paused', true);
}, 10, 1);
```
</details>

### <code> subscription_expired </code>
<details>
<summary><code>fluent_cart/payments/subscription_expired</code> &mdash; Fires when a subscription expires</summary>

**When it runs:**
This action fires when a subscription's status transitions to `expired`. After this hook fires, the system also stores a `validity_expired_at` meta value and dispatches the `SubscriptionValidityExpired` event.

**Parameters:**

- `$data` (array): Subscription data
    ```php
    $data = [
        'subscription' => $subscriptionModel, // \FluentCart\App\Models\Subscription
        'order'        => $subscriptionModel->order, // \FluentCart\App\Models\Order
        'customer'     => $subscriptionModel->customer, // \FluentCart\App\Models\Customer
        'old_status'   => 'active', // string — previous status
        'new_status'   => 'expired', // string — always 'expired'
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php`

**Usage:**
```php
add_action('fluent_cart/payments/subscription_expired', function ($data) {
    $customer = $data['customer'];

    // Remove premium access
    update_user_meta($customer->user_id, 'premium_member', false);

    // Notify the customer
    wp_mail(
        $customer->email,
        'Your Subscription Has Expired',
        'Your subscription has expired. Please renew to continue using premium features.'
    );
}, 10, 1);
```
</details>

### <code> subscription_failing </code>
<details>
<summary><code>fluent_cart/payments/subscription_failing</code> &mdash; Fires when a subscription payment is failing</summary>

**When it runs:**
This action fires when a subscription's status transitions to `failing`, indicating that a renewal payment attempt has failed. The subscription is still technically active but requires payment attention.

**Parameters:**

- `$data` (array): Subscription data
    ```php
    $data = [
        'subscription' => $subscriptionModel, // \FluentCart\App\Models\Subscription
        'order'        => $subscriptionModel->order, // \FluentCart\App\Models\Order
        'customer'     => $subscriptionModel->customer, // \FluentCart\App\Models\Customer
        'old_status'   => 'active', // string — previous status
        'new_status'   => 'failing', // string — always 'failing'
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php`

**Usage:**
```php
add_action('fluent_cart/payments/subscription_failing', function ($data) {
    $subscription = $data['subscription'];
    $customer     = $data['customer'];

    // Alert the customer about the payment failure
    wp_mail(
        $customer->email,
        'Payment Failed for Your Subscription',
        sprintf('We were unable to process payment for subscription #%d. Please update your payment method.', $subscription->id)
    );
}, 10, 1);
```
</details>

### <code> subscription_expiring </code>
<details>
<summary><code>fluent_cart/payments/subscription_expiring</code> &mdash; Fires when a subscription is marked as expiring soon</summary>

**When it runs:**
This action fires when a subscription's status transitions to `expiring`, indicating that the subscription is approaching its end-of-term and will not be renewed.

**Parameters:**

- `$data` (array): Subscription data
    ```php
    $data = [
        'subscription' => $subscriptionModel, // \FluentCart\App\Models\Subscription
        'order'        => $subscriptionModel->order, // \FluentCart\App\Models\Order
        'customer'     => $subscriptionModel->customer, // \FluentCart\App\Models\Customer
        'old_status'   => 'active', // string — previous status
        'new_status'   => 'expiring', // string — always 'expiring'
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php`

**Usage:**
```php
add_action('fluent_cart/payments/subscription_expiring', function ($data) {
    $subscription = $data['subscription'];
    $customer     = $data['customer'];

    // Send a win-back offer before the subscription fully expires
    wp_mail(
        $customer->email,
        'Your Subscription is About to Expire',
        'Renew now and get 10% off your next billing cycle!'
    );
}, 10, 1);
```
</details>

### <code> subscription_completed </code>
<details>
<summary><code>fluent_cart/payments/subscription_completed</code> &mdash; Fires when a subscription completes all billing cycles</summary>

**When it runs:**
This action fires when a subscription's status transitions to `completed`. This occurs when the subscription has reached its end-of-term (EOT) -- i.e., the `bill_count` has met or exceeded `bill_times`. The `next_billing_date` is set to `NULL` and `canceled_at` is cleared.

**Parameters:**

- `$data` (array): Subscription data
    ```php
    $data = [
        'subscription' => $subscriptionModel, // \FluentCart\App\Models\Subscription
        'order'        => $subscriptionModel->order, // \FluentCart\App\Models\Order
        'customer'     => $subscriptionModel->customer, // \FluentCart\App\Models\Customer
        'old_status'   => 'active', // string — previous status
        'new_status'   => 'completed', // string — always 'completed'
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php`

**Usage:**
```php
add_action('fluent_cart/payments/subscription_completed', function ($data) {
    $subscription = $data['subscription'];
    $customer     = $data['customer'];

    // Thank the customer for completing their subscription term
    wp_mail(
        $customer->email,
        'Subscription Complete',
        sprintf('Your subscription #%d has completed all %d billing cycles. Thank you!', $subscription->id, $subscription->bill_times)
    );
}, 10, 1);
```
</details>

### <code> subscription_trialing </code>
<details>
<summary><code>fluent_cart/payments/subscription_trialing</code> &mdash; Fires when a subscription enters trial status</summary>

**When it runs:**
This action fires when a subscription's status transitions to `trialing`. The subscription is in a free trial period and will transition to `active` (with billing) when the trial ends.

**Parameters:**

- `$data` (array): Subscription data
    ```php
    $data = [
        'subscription' => $subscriptionModel, // \FluentCart\App\Models\Subscription
        'order'        => $subscriptionModel->order, // \FluentCart\App\Models\Order
        'customer'     => $subscriptionModel->customer, // \FluentCart\App\Models\Customer
        'old_status'   => 'pending', // string — previous status
        'new_status'   => 'trialing', // string — always 'trialing'
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php`

**Usage:**
```php
add_action('fluent_cart/payments/subscription_trialing', function ($data) {
    $subscription = $data['subscription'];
    $customer     = $data['customer'];

    // Grant trial access
    update_user_meta($customer->user_id, 'trial_active', true);

    // Schedule a welcome email
    wp_mail(
        $customer->email,
        'Your Free Trial Has Started',
        sprintf('Enjoy your trial! Your first payment will be on %s.', $subscription->next_billing_date)
    );
}, 10, 1);
```
</details>

---

## Subscription Data Updates

### <code> subscription_data_updated </code>
<details>
<summary><code>fluent_cart/subscription/data_updated</code> &mdash; Fires when subscription data changes without a status transition</summary>

**When it runs:**
This action fires when [Subscription](/database/models/subscription) attributes are modified but the status remains the same. Examples include billing amount changes, next payment date adjustments, or metadata updates. It only fires when there are actual dirty (changed) fields on the model.

**Parameters:**

- `$data` (array): Subscription update data
    ```php
    $data = [
        'subscription' => $subscriptionModel, // \FluentCart\App\Models\Subscription (already saved)
        'updated_data' => [
            // Only the fields that actually changed (dirty attributes), e.g.:
            'recurring_total'   => 2999, // int — new amount in cents
            'next_billing_date' => '2025-03-15 00:00:00', // string — updated billing date
        ],
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php`

**Usage:**
```php
add_action('fluent_cart/subscription/data_updated', function ($data) {
    $subscription = $data['subscription'];
    $updatedData  = $data['updated_data'];

    // Log billing amount changes
    if (isset($updatedData['recurring_total'])) {
        fluent_cart_add_log(
            'Subscription Amount Changed',
            sprintf(
                'Subscription #%d recurring total changed to %s',
                $subscription->id,
                number_format($updatedData['recurring_total'] / 100, 2)
            ),
            'info'
        );
    }

    // Sync next billing date with external calendar
    if (isset($updatedData['next_billing_date'])) {
        do_action('my_plugin/sync_billing_date', $subscription->id, $updatedData['next_billing_date']);
    }
}, 10, 1);
```
</details>

---

## Reminders & Notifications

### <code> subscription_renewal_reminder </code>
<details>
<summary><code>fluent_cart/subscription_renewal_reminder</code> &mdash; Fires when a subscription renewal reminder is due</summary>

**When it runs:**
This action fires on a scheduled basis (via Action Scheduler) when a subscription's next billing date is approaching. The reminder system supports multiple billing cycles (yearly, monthly, quarterly, half-yearly) and configurable "days before" thresholds. Only fires for subscriptions with `active` or `trialing` status. The stage name indicates how many days before renewal (e.g., `before_30`, `before_7`).

**Parameters:**

- `$data` (array): Renewal reminder data
    ```php
    $data = [
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'order'        => $subscription->order, // \FluentCart\App\Models\Order
        'customer'     => $subscription->customer, // \FluentCart\App\Models\Customer
        'reminder'     => [
            'stage'         => 'before_30', // string — e.g., 'before_30', 'before_7'
            'billing_cycle' => 'yearly', // string — 'yearly', 'monthly', 'quarterly', 'half_yearly'
            'billing_date'  => '2025-03-15 00:00:00', // string — GMT formatted next billing date
        ],
    ];
    ```

**Source:** `app/Services/Reminders/SubscriptionReminderService.php`

**Usage:**
```php
add_action('fluent_cart/subscription_renewal_reminder', function ($data) {
    $subscription = $data['subscription'];
    $customer     = $data['customer'];
    $reminder     = $data['reminder'];

    // Send a custom renewal reminder email
    wp_mail(
        $customer->email,
        'Subscription Renewal Coming Up',
        sprintf(
            'Your %s subscription #%d will renew on %s.',
            $reminder['billing_cycle'],
            $subscription->id,
            date('F j, Y', strtotime($reminder['billing_date']))
        )
    );
}, 10, 1);
```
</details>

### <code> subscription_trial_end_reminder </code>
<details>
<summary><code>fluent_cart/subscription_trial_end_reminder</code> &mdash; Fires when a trial ending reminder is due</summary>

**When it runs:**
This action fires on a scheduled basis when a trialing subscription's trial period is about to end. Only fires for subscriptions with `trialing` status (excluding simulated trials). The stage name indicates how many days before the trial ends (e.g., `trial_end_3`, `trial_end_1`). Configurable via the `trial_end_reminder_days` store setting.

**Parameters:**

- `$data` (array): Trial end reminder data
    ```php
    $data = [
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'order'        => $subscription->order, // \FluentCart\App\Models\Order
        'customer'     => $subscription->customer, // \FluentCart\App\Models\Customer
        'reminder'     => [
            'stage'          => 'trial_end_3', // string — e.g., 'trial_end_3', 'trial_end_1'
            'trial_end_date' => '2025-02-01 00:00:00', // string — GMT formatted trial end date
        ],
    ];
    ```

**Source:** `app/Services/Reminders/SubscriptionReminderService.php`

**Usage:**
```php
add_action('fluent_cart/subscription_trial_end_reminder', function ($data) {
    $subscription = $data['subscription'];
    $customer     = $data['customer'];
    $reminder     = $data['reminder'];

    // Notify customer that their trial is ending soon
    wp_mail(
        $customer->email,
        'Your Free Trial is Ending Soon',
        sprintf(
            'Your trial for subscription #%d ends on %s. After that, you will be billed %s.',
            $subscription->id,
            date('F j, Y', strtotime($reminder['trial_end_date'])),
            number_format($subscription->recurring_total / 100, 2)
        )
    );
}, 10, 1);
```
</details>

### <code> renewal_reminder_overdue </code>
<details>
<summary><code>fluent_cart/renewal_reminder_overdue</code> &mdash; Fires when an overdue renewal reminder is triggered</summary>

**When it runs:**
This action fires on a scheduled basis when a renewal [Order](/database/models/order) with an outstanding balance has passed its due date by a configured number of days. The stage name indicates how many days overdue (e.g., `overdue_1`, `overdue_3`, `overdue_7`). The overdue offsets are configurable via the `renewal_reminder_overdue_days` store setting (defaults to `1,3,7`) and the `fluent_cart/reminders/renewal_overdue_days` filter. Reminders as a whole are gated by the `renewal_reminders_enabled` setting.

**Parameters:**

- `$data` (array): Renewal overdue reminder data
    ```php
    $data = [
        'order'    => $order, // \FluentCart\App\Models\Order
        'customer' => $order->customer, // \FluentCart\App\Models\Customer
        'reminder' => [
            'stage'        => 'overdue_3', // string — e.g., 'overdue_1', 'overdue_3', 'overdue_7'
            'order_id'     => 123, // int — order ID
            'order_ref'    => 'INV-00123', // string — invoice number or '#123' fallback
            'due_at'       => '2025-01-15 00:00:00', // string — GMT formatted due date
            'due_amount'   => 5000, // int — outstanding amount in cents
            'payment_link' => 'https://example.com/checkout/pay/uuid', // string — customer payment URL
        ],
    ];
    ```

**Source:** `app/Services/Reminders/RenewalReminderService.php`

**Usage:**
```php
add_action('fluent_cart/renewal_reminder_overdue', function ($data) {
    $order    = $data['order'];
    $customer = $data['customer'];
    $reminder = $data['reminder'];

    // Send a payment reminder with a direct payment link
    wp_mail(
        $customer->email,
        sprintf('Payment Overdue for %s', $reminder['order_ref']),
        sprintf(
            "Your payment of %s for order %s is overdue.\n\nPay now: %s",
            number_format($reminder['due_amount'] / 100, 2),
            $reminder['order_ref'],
            $reminder['payment_link']
        )
    );
}, 10, 1);
```
</details>

### <code> renewal_reminder_due </code>
<details>
<summary><code>fluent_cart/renewal_reminder_due</code> &mdash; Fires when a renewal due-date reminder is triggered</summary>

**When it runs:**
This action fires on a scheduled basis when a renewal order with an outstanding balance reaches its due-date reminder window. This is the pre-/on-due-date notification, as opposed to the overdue reminders that fire after the due date has passed. Shares the same parameter structure as the overdue reminder. Gated by the `renewal_reminder_due_days` store setting (default `0` — no due reminder until set) and the `fluent_cart/reminders/renewal_due_days` filter.

**Parameters:**

- `$data` (array): Renewal due reminder data
    ```php
    $data = [
        'order'    => $order, // \FluentCart\App\Models\Order
        'customer' => $order->customer, // \FluentCart\App\Models\Customer
        'reminder' => [
            'stage'        => 'before_0', // string — due-date reminder stage
            'order_id'     => 123, // int — order ID
            'order_ref'    => 'INV-00123', // string — invoice number or '#123' fallback
            'due_at'       => '2025-01-15 00:00:00', // string — GMT formatted due date
            'due_amount'   => 5000, // int — outstanding amount in cents
            'payment_link' => 'https://example.com/checkout/pay/uuid', // string — customer payment URL
        ],
    ];
    ```

**Source:** `app/Services/Reminders/RenewalReminderService.php`

**Usage:**
```php
add_action('fluent_cart/renewal_reminder_due', function ($data) {
    $order    = $data['order'];
    $customer = $data['customer'];
    $reminder = $data['reminder'];

    // Notify customer that their renewal is due
    wp_mail(
        $customer->email,
        sprintf('Payment Due for %s', $reminder['order_ref']),
        sprintf(
            "Your payment of %s for order %s is due.\n\nPay now: %s",
            number_format($reminder['due_amount'] / 100, 2),
            $reminder['order_ref'],
            $reminder['payment_link']
        )
    );
}, 10, 1);
```
</details>

---

## Renewal Lifecycle <Badge type="tip" text="Store-managed" />

These fire for **store-managed** renewals (the `manual` / `system` collection methods), where FluentCart generates renewal orders on a schedule rather than mirroring a gateway subscription. See the [Subscriptions Module](/modules/subscriptions) for the full engine.

### <code> renewal_created </code>
<details open>
<summary><code>fluent_cart/renewal_created</code> &mdash; Fires when a renewal order is generated</summary>

**When it runs:**
This action fires whenever the renewal engine creates a renewal [Order](/database/models/order) for a store-managed [Subscription](/database/models/subscription) — from the advance-window cron (`system`/`manual`), from a `system` auto-charge cycle, and from the admin "Create Renewal Now" action.

**Parameters:**

- `$data` (array): Renewal creation data
    ```php
    $data = [
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'order'        => $order,        // \FluentCart\App\Models\Order — the new renewal order
        'parent_order' => $parentOrder,  // \FluentCart\App\Models\Order — the original order
        'customer'     => $customer,     // \FluentCart\App\Models\Customer
        'transaction'  => $transaction,  // \FluentCart\App\Models\OrderTransaction
    ];
    ```

**Source:** `app/Http/Controllers/RenewalController.php:155`, `app/Modules/Subscriptions/Services/SystemChargeService.php:310`, `app/Modules/StoreManagedRenewal/Services/RenewalService.php:237`

**Usage:**
```php
add_action('fluent_cart/renewal_created', function ($data) {
    $order = $data['order'];
    // Sync the freshly generated renewal order to an external ledger
}, 10, 1);
```
</details>

### <code> renewal_paid </code>
<details>
<summary><code>fluent_cart/renewal_paid</code> &mdash; Fires once when a renewal order is paid</summary>

**When it runs:**
This action fires exactly once when a renewal [Order](/database/models/order) transitions to paid — the single edge-triggered "a renewal was collected" signal, whether the payment came from a `system` off-session charge, a customer Pay-Now, or a gateway-managed renewal webhook. It is the canonical place to grant/extend access on renewal.

**Parameters:**

- `$data` (array): Renewal payment data
    ```php
    $data = [
        'order' => $order, // \FluentCart\App\Models\Order — the paid renewal order
    ];
    ```

**Source:** `app/Helpers/StatusHelper.php:208`

**Usage:**
```php
add_action('fluent_cart/renewal_paid', function ($data) {
    $order = $data['order'];
    // Extend the customer's access period for this renewal
}, 10, 1);
```
</details>

### <code> renewal_payment_scheduled </code>
<details>
<summary><code>fluent_cart/renewal_payment_scheduled</code> &mdash; Fires when a gateway renewal payment is scheduled (positional args)</summary>

**When it runs:**
This action fires when a gateway confirms a renewal payment is scheduled at the vendor (Stripe/PayPal confirmation paths). Fires alongside `fluent_cart/renewal/payment_scheduled` (array shape) — this is the legacy positional-argument variant.

::: warning Positional arguments
This hook passes **two positional arguments**, not a single array. Register with `, 10, 2`.
:::

**Parameters:**

- `$order` ([Order](/database/models/order)): The renewal order
- `$subscription` ([Subscription](/database/models/subscription)): The subscription

**Source:** `app/Modules/PaymentMethods/PayPalGateway/Processor.php:476`, `app/Modules/PaymentMethods/StripeGateway/Confirmations.php:485`

**Usage:**
```php
add_action('fluent_cart/renewal_payment_scheduled', function ($order, $subscription) {
    // React to a scheduled gateway renewal payment
}, 10, 2);
```
</details>

### <code> renewal/payment_scheduled </code>
<details>
<summary><code>fluent_cart/renewal/payment_scheduled</code> &mdash; Fires when a gateway renewal payment is scheduled (array payload)</summary>

**When it runs:**
The array-payload variant of the hook above, fired back-to-back with `fluent_cart/renewal_payment_scheduled`. Prefer this one for new integrations.

**Parameters:**

- `$data` (array): Scheduled renewal payment data
    ```php
    $data = [
        'order'        => $order,        // \FluentCart\App\Models\Order
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
    ];
    ```

**Source:** `app/Modules/PaymentMethods/PayPalGateway/Processor.php:477`, `app/Modules/PaymentMethods/StripeGateway/Confirmations.php:486`

**Usage:**
```php
add_action('fluent_cart/renewal/payment_scheduled', function ($data) {
    $order = $data['order'];
}, 10, 1);
```
</details>

### <code> renewal_voided </code>
<details>
<summary><code>fluent_cart/renewal_voided</code> &mdash; Fires when a renewal order is voided</summary>

**When it runs:**
This action fires when an open renewal order is voided (e.g., superseded or cancelled before payment).

**Parameters:**

- `$data` (array): Voided renewal data
    ```php
    $data = [
        'order'    => $order,    // \FluentCart\App\Models\Order — the voided renewal order
        'customer' => $customer, // \FluentCart\App\Models\Customer
    ];
    ```

**Source:** `app/Http/Controllers/RenewalController.php:126`

**Usage:**
```php
add_action('fluent_cart/renewal_voided', function ($data) {
    // Clean up any external state tied to the voided renewal
}, 10, 1);
```
</details>

### <code> subscriptions/system_renewal_scheduled </code>
<details>
<summary><code>fluent_cart/subscriptions/system_renewal_scheduled</code> &mdash; Fires when a store-managed renewal is scheduled for auto-charge</summary>

**When it runs:**
This action fires when the renewal engine schedules a store-managed renewal order for its due-date off-session charge attempt.

**Parameters:**

- `$data` (array): Scheduled renewal data
    ```php
    $data = [
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'order'        => $order,        // \FluentCart\App\Models\Order
        'parent_order' => $parentOrder,  // \FluentCart\App\Models\Order
        'customer'     => $customer,     // \FluentCart\App\Models\Customer
        'transaction'  => $transaction,  // \FluentCart\App\Models\OrderTransaction
    ];
    ```

**Source:** `app/Modules/StoreManagedRenewal/Services/RenewalService.php:227`

**Usage:**
```php
add_action('fluent_cart/subscriptions/system_renewal_scheduled', function ($data) {
    // Notify the customer that an automatic charge is upcoming
}, 10, 1);
```
</details>

---

## Collection Method & Status <Badge type="tip" text="Store-managed" />

### <code> subscription_converted_to_automatic </code>
<details>
<summary><code>fluent_cart/subscription_converted_to_automatic</code> &mdash; Fires when a subscription becomes gateway-managed</summary>

**When it runs:**
This action fires when a subscription's collection method is converted to `automatic` — a live vendor subscription now owns the billing schedule (legacy manual→automatic conversion at a subscription-capable gateway).

**Parameters:**

- `$data` (array): Conversion data
    ```php
    $data = [
        'subscription'   => $subscription,   // \FluentCart\App\Models\Subscription
        'payment_method' => $paymentMethod,  // string — gateway slug now managing billing
    ];
    ```

**Source:** `app/Modules/PaymentMethods/PayPalGateway/PayPal.php:128`, `app/Modules/PaymentMethods/StripeGateway/Stripe.php:140`

**Usage:**
```php
add_action('fluent_cart/subscription_converted_to_automatic', function ($data) {
    $subscription = $data['subscription'];
}, 10, 1);
```
</details>

### <code> subscription_converted_to_manual </code>
<details>
<summary><code>fluent_cart/subscription_converted_to_manual</code> &mdash; Fires when a subscription falls back to manual invoicing</summary>

**When it runs:**
This action fires when a subscription is demoted to the `manual` collection method — for example, a `system` subscription whose gateway can no longer token-charge (see [demotion](/modules/subscriptions#store-managed-auto-charge-system)).

**Parameters:**

- `$data` (array): Conversion data
    ```php
    $data = [
        'subscription'   => $subscription,   // \FluentCart\App\Models\Subscription
        'payment_method' => $paymentMethod,  // string — current payment method slug
    ];
    ```

**Source:** `app/Modules/PaymentMethods/Core/AbstractPaymentGateway.php:340`

**Usage:**
```php
add_action('fluent_cart/subscription_converted_to_manual', function ($data) {
    // Alert staff that automatic billing was lost for this subscription
}, 10, 1);
```
</details>

### <code> subscription_past_due </code>
<details>
<summary><code>fluent_cart/subscription_past_due</code> &mdash; Fires when a store-managed subscription enters dunning</summary>

**When it runs:**
This action fires when a store-managed subscription's renewal passes its grace anchor and the subscription enters the past-due (dunning) window, before eventual expiry.

**Parameters:**

- `$data` (array): Past-due data
    ```php
    $data = [
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'order'        => $order,        // \FluentCart\App\Models\Order — the unpaid renewal
        'customer'     => $customer,     // \FluentCart\App\Models\Customer
    ];
    ```

**Source:** `app/Modules/StoreManagedRenewal/Services/RenewalService.php:696`

**Usage:**
```php
add_action('fluent_cart/subscription_past_due', function ($data) {
    // Trigger a custom dunning sequence
}, 10, 1);
```
</details>

### <code> subscription/reactivated_locally </code>
<details>
<summary><code>fluent_cart/subscription/reactivated_locally</code> &mdash; Fires when a store-managed subscription is reactivated locally (positional arg)</summary>

**When it runs:**
This action fires when a store-managed subscription is reactivated by FluentCart itself (no vendor call), e.g., after a successful late payment.

::: warning Positional argument
This hook passes the **Subscription model directly**, not an array. Register with `, 10, 1` and type-hint the model.
:::

**Parameters:**

- `$subscription` ([Subscription](/database/models/subscription)): The reactivated subscription

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php:814`

**Usage:**
```php
add_action('fluent_cart/subscription/reactivated_locally', function ($subscription) {
    // Restore access for the reactivated subscription
}, 10, 1);
```
</details>

---

## Native Subscription Events <Badge type="tip" text="Store-managed" />

::: tip Distinct from the `payments/subscription_{status}` bus
These `fluent_cart/subscription_*` events carry richer payloads (`reason`, `updates`, `changes`) and are **separate hooks** from the like-named [status bus](#subscription-status-changes) (`fluent_cart/payments/subscription_paused`, etc.). Both may fire for the same transition.
:::

### <code> subscription_paused </code>
<details>
<summary><code>fluent_cart/subscription_paused</code> &mdash; Native event: subscription paused</summary>

**When it runs:**
Dispatched when a subscription is paused, via the subscription event dispatcher.

**Parameters:**

- `$data` (array): Pause event data
    ```php
    $data = [
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'reason'       => 'user_request', // string — pause reason
        'order'        => $order,        // \FluentCart\App\Models\Order
        'customer'     => $customer,     // \FluentCart\App\Models\Customer
        'old_status'   => 'active',      // string — status before pause
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php:527` (via `EventDispatcher`)

**Usage:**
```php
add_action('fluent_cart/subscription_paused', function ($data) {
    $reason = $data['reason'];
}, 10, 1);
```
</details>

### <code> subscription_resumed </code>
<details>
<summary><code>fluent_cart/subscription_resumed</code> &mdash; Native event: subscription resumed</summary>

**When it runs:**
Dispatched when a paused subscription is resumed.

**Parameters:**

- `$data` (array): Resume event data
    ```php
    $data = [
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'reason'       => 'user_request', // string — resume reason
        'order'        => $order,        // \FluentCart\App\Models\Order
        'customer'     => $customer,     // \FluentCart\App\Models\Customer
        'old_status'   => 'paused',      // string — status before resume
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php:530` (via `EventDispatcher`)

**Usage:**
```php
add_action('fluent_cart/subscription_resumed', function ($data) {
    $subscription = $data['subscription'];
}, 10, 1);
```
</details>

### <code> subscription_updated </code>
<details>
<summary><code>fluent_cart/subscription_updated</code> &mdash; Native event: subscription terms updated</summary>

**When it runs:**
Dispatched when a store-managed subscription's editable terms change (amount, interval, next billing date, etc.).

**Parameters:**

- `$data` (array): Update event data
    ```php
    $data = [
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'updates'      => [ /* ... */ ], // array — fields submitted for update
        'changes'      => [ /* ... */ ], // array — fields that actually changed
        'order'        => $order,        // \FluentCart\App\Models\Order
        'customer'     => $customer,     // \FluentCart\App\Models\Customer
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SubscriptionService.php:533` (via `EventDispatcher`)

**Usage:**
```php
add_action('fluent_cart/subscription_updated', function ($data) {
    $changes = $data['changes'];
}, 10, 1);
```
</details>

---

## System Auto-Charge <Badge type="tip" text="system" />

These fire only for `system` subscriptions — store-managed subscriptions that auto-charge a saved token each renewal. See [Store-managed + auto-charge](/modules/subscriptions#store-managed-auto-charge-system).

### <code> subscriptions/system_charge_succeeded </code>
<details open>
<summary><code>fluent_cart/subscriptions/system_charge_succeeded</code> &mdash; Fires when an off-session renewal charge succeeds</summary>

**When it runs:**
This action fires when a `system` subscription's off-session renewal charge is confirmed successful.

**Parameters:**

- `$data` (array): Successful charge data
    ```php
    $data = [
        'order'        => $order,        // \FluentCart\App\Models\Order — the renewal order
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'attempt'      => 1,             // int — which retry attempt succeeded
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SystemChargeService.php:584`

**Usage:**
```php
add_action('fluent_cart/subscriptions/system_charge_succeeded', function ($data) {
    $order = $data['order'];
}, 10, 1);
```
</details>

### <code> subscriptions/system_charge_failed </code>
<details>
<summary><code>fluent_cart/subscriptions/system_charge_failed</code> &mdash; Fires when an off-session renewal charge fails</summary>

**When it runs:**
This action fires when a `system` renewal charge attempt fails. The retry ladder may schedule further attempts within the grace window before the subscription is marked past due.

**Parameters:**

- `$data` (array): Failed charge data
    ```php
    $data = [
        'order'         => $order,        // \FluentCart\App\Models\Order
        'subscription'  => $subscription, // \FluentCart\App\Models\Subscription
        'attempt'       => 2,             // int — attempt number that failed
        'error'         => 'card_declined', // string — gateway error
        'next_retry_at' => '2025-01-18 00:00:00', // string|null — GMT time of next attempt, null if exhausted
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SystemChargeService.php:730`

**Usage:**
```php
add_action('fluent_cart/subscriptions/system_charge_failed', function ($data) {
    if (empty($data['next_retry_at'])) {
        // Retries exhausted — escalate
    }
}, 10, 1);
```
</details>

### <code> subscriptions/system_charge_failed_notification </code>
<details>
<summary><code>fluent_cart/subscriptions/system_charge_failed_notification</code> &mdash; Fires when a charge-failure notification should be sent</summary>

**When it runs:**
This action fires when a `system` charge failure warrants notifying the customer (gated by `fluent_cart/subscriptions/system_charge_failure_notify`). Carries the full context needed to render an email.

**Parameters:**

- `$data` (array): Failure notification data
    ```php
    $data = [
        'order'         => $order,        // \FluentCart\App\Models\Order
        'subscription'  => $subscription, // \FluentCart\App\Models\Subscription
        'parent_order'  => $parentOrder,  // \FluentCart\App\Models\Order
        'customer'      => $customer,     // \FluentCart\App\Models\Customer
        'transaction'   => $transaction,  // \FluentCart\App\Models\OrderTransaction
        'error'         => 'card_declined', // string — gateway error
        'attempt'       => 2,             // int — attempt number
        'next_retry_at' => '2025-01-18 00:00:00', // string|null — GMT time of next attempt
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SystemChargeService.php:746`

**Usage:**
```php
add_action('fluent_cart/subscriptions/system_charge_failed_notification', function ($data) {
    // Send a custom "payment failed" email
}, 10, 1);
```
</details>

### <code> subscriptions/system_charge_disabled </code>
<details>
<summary><code>fluent_cart/subscriptions/system_charge_disabled</code> &mdash; Fires when auto-charge is turned off for a subscription</summary>

**When it runs:**
This action fires when a subscription loses `system` auto-charge and is handed back to plain manual invoicing (`demoteToManual()`), e.g., its gateway can no longer token-charge.

**Parameters:**

- `$data` (array): Disable data
    ```php
    $data = [
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'reason'       => 'gateway_incapable', // string — why auto-charge was disabled
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SystemChargeService.php:325`

**Usage:**
```php
add_action('fluent_cart/subscriptions/system_charge_disabled', function ($data) {
    $reason = $data['reason'];
}, 10, 1);
```
</details>

### <code> subscriptions/system_charge_manual_triggered </code>
<details>
<summary><code>fluent_cart/subscriptions/system_charge_manual_triggered</code> &mdash; Fires when an admin triggers an off-session charge</summary>

**When it runs:**
This action fires when a store admin manually triggers a `system` charge (the "Charge Now" / "Charge Next Renewal Now" actions).

**Parameters:**

- `$data` (array): Manual trigger data
    ```php
    $data = [
        'order'        => $order,        // \FluentCart\App\Models\Order
        'subscription' => $subscription, // \FluentCart\App\Models\Subscription
        'attempt'      => 1,             // int — attempt number
        'actor_id'     => 5,             // int — admin user ID who triggered it
        'result'       => 'success',     // mixed — charge result
    ];
    ```

**Source:** `app/Modules/Subscriptions/Services/SystemChargeService.php:444`

**Usage:**
```php
add_action('fluent_cart/subscriptions/system_charge_manual_triggered', function ($data) {
    // Audit-log the admin-initiated charge
}, 10, 1);
```
</details>

### <code> subscriptions/system_payment_method_updated </code>
<details>
<summary><code>fluent_cart/subscriptions/system_payment_method_updated</code> &mdash; Fires when the saved token for a system subscription changes</summary>

**When it runs:**
This action fires when the vaulted payment method (token) backing a `system` subscription is updated — e.g., the customer updates the card on file.

**Parameters:**

- `$data` (array): Payment method update data
    ```php
    $data = [
        'subscription'   => $subscription,  // \FluentCart\App\Models\Subscription
        'payment_method' => $paymentMethod, // array|string — the new vaulted method reference
    ];
    ```

**Source:** `app/Modules/PaymentMethods/StripeGateway/UpdateCustomerPaymentMethod.php:129`

**Usage:**
```php
add_action('fluent_cart/subscriptions/system_payment_method_updated', function ($data) {
    // Confirm the new card to the customer
}, 10, 1);
```
</details>

---

## Subscription Upgrades & Early Payments <Badge type="warning" text="Pro" />

### <code> early_payment_completed </code>
<details>
<summary><code>fluent_cart/subscription/early_payment_completed</code> <Badge type="warning" text="Pro" /> &mdash; Fires when an early installment payment is completed</summary>

**When it runs:**
This action fires when a customer makes an early installment payment on their subscription, paying for one or more future billing cycles ahead of schedule.

**Parameters:**

- `$data` (array): Early payment completion data
    ```php
    $data = [
        'subscription'      => $subscription,      // \FluentCart\App\Models\Subscription
        'order'             => $order,              // \FluentCart\App\Models\Order
        'installment_count' => $installmentCount,   // int — number of installments paid early
    ];
    ```

**Source:** `fluent-cart-pro/app/Hooks/Handlers/EarlyInstallmentPaymentHandler.php:279`

**Usage:**
```php
add_action('fluent_cart/subscription/early_payment_completed', function ($data) {
    $subscription     = $data['subscription'];
    $order            = $data['order'];
    $installmentCount = $data['installment_count'];

    fluent_cart_add_log(
        'Early Payment Completed',
        sprintf('Subscription #%d received %d early installment(s) via order #%d', $subscription->id, $installmentCount, $order->id),
        'info'
    );
}, 10, 1);
```
</details>

### <code> order_upgraded </code>
<details>
<summary><code>fluent_cart/order/upgraded</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a plan upgrade is completed</summary>

**When it runs:**
This action fires when a customer completes a plan upgrade, transitioning from one product variant to another. The upgrade creates a new order and transaction record.

**Parameters:**

- `$data` (array): Upgrade completion data
    ```php
    $data = [
        'order'           => $newOrder,          // \FluentCart\App\Models\Order — the new upgrade order
        'from_order'      => $upgradeFromOrder,  // \FluentCart\App\Models\Order — the original order
        'cart'            => $cartModel,         // \FluentCart\App\Models\Cart — the cart used for the upgrade
        'from_variant_id' => $fromVariantId,     // int — ID of the original product variant
        'transaction'     => $transaction,       // \FluentCart\App\Models\OrderTransaction — the upgrade payment transaction
    ];
    ```

**Source:** `fluent-cart-pro/app/Hooks/Handlers/UpgradeHandler.php:242`

**Usage:**
```php
add_action('fluent_cart/order/upgraded', function ($data) {
    $order          = $data['order'];
    $fromOrder      = $data['from_order'];
    $fromVariantId  = $data['from_variant_id'];
    $transaction    = $data['transaction'];

    fluent_cart_add_log(
        'Plan Upgraded',
        sprintf(
            'Order #%d upgraded from order #%d (variant %d). Transaction: %s',
            $order->id,
            $fromOrder->id,
            $fromVariantId,
            $transaction->charge_id
        ),
        'info'
    );
}, 10, 1);
```
</details>

---
