# Customers & Users

All hooks related to [Customer](/database/models/customer) lifecycle, user registration, and the customer-facing frontend portal.

## Customer Status Changes

### <code> customer_status_to_{status} </code>
<details open>
<summary><code>fluent_cart/customer_status_to_{$newStatus}</code> &mdash; Fired when a customer's status changes to a specific status</summary>

**When it runs:**
This dynamic action fires immediately after a [Customer](/database/models/customer)'s status is updated and saved to the database. A separate hook is dispatched for each target status, allowing you to listen for transitions to a single status (e.g., `active` or `inactive`) without inspecting the payload.

**Parameters:**

- `$data` (array): Customer status transition data
    ```php
    $data = [
        'customer'   => $customer,   // (Customer) The customer model instance (already updated)
        'old_status' => 'inactive',  // (string) Previous status before the change
        'new_status' => 'active',    // (string) The new status that was just applied
    ];
    ```

**Available dynamic variants:** `active`, `inactive`

**Source:** `app/Models/Customer.php`

**Usage:**
```php
// Listen specifically for customers becoming active
add_action('fluent_cart/customer_status_to_active', function ($data) {
    $customer = $data['customer'];
    // Send a reactivation welcome-back email
    wp_mail(
        $customer->email,
        'Welcome back!',
        'Your account has been reactivated.'
    );
}, 10, 1);
```
</details>

### <code> customer_status_updated </code>
<details>
<summary><code>fluent_cart/customer_status_updated</code> &mdash; Fired on any customer status change</summary>

**When it runs:**
This action fires immediately after the dynamic `fluent_cart/customer_status_to_{$newStatus}` hook for every customer status change. Use this hook when you need to respond to all status transitions regardless of the target status.

**Parameters:**

- `$data` (array): Customer status transition data
    ```php
    $data = [
        'customer'   => $customer,   // (Customer) The customer model instance (already updated)
        'old_status' => 'active',    // (string) Previous status before the change
        'new_status' => 'inactive',  // (string) The new status that was just applied
    ];
    ```

**Source:** `app/Models/Customer.php`

**Usage:**
```php
add_action('fluent_cart/customer_status_updated', function ($data) {
    $customer = $data['customer'];
    // Log every status transition
    fluent_cart_add_log(
        'Customer Status Changed',
        sprintf(
            'Customer #%d (%s) status changed from %s to %s',
            $customer->id,
            $customer->email,
            $data['old_status'],
            $data['new_status']
        ),
        'info'
    );
}, 10, 1);
```
</details>

---

## Customer Data

### <code> customer_email_changed </code>
<details>
<summary><code>fluent_cart/customer_email_changed</code> &mdash; Fired when a customer's email is updated via WordPress profile</summary>

**When it runs:**
This action fires when a WordPress user updates their email address (via `profile_update`) and no existing FluentCart [Customer](/database/models/customer) record matches the new email. In that case the existing customer row is updated in place with the new email. If a customer record already exists for the new email, this hook does **not** fire -- instead, resources are moved and `fluent_cart/customer_resources_moved` fires.

**Parameters:**

- `$data` (array): Email change data
    ```php
    $data = [
        'old_customer' => $oldCustomer,  // (Customer) The customer model (already updated with new email)
        'new_customer' => $oldCustomer,  // (Customer) Same customer instance (already updated)
        'old_email'    => 'old@example.com',  // (string) The previous email address
        'new_email'    => 'new@example.com',  // (string) The new email address
        'userId'       => 42,                 // (int) WordPress user ID
    ];
    ```

> **Note:** Both `old_customer` and `new_customer` reference the same Customer model instance. The customer record has already been updated with the new email at the time this hook fires.

**Source:** `app/Hooks/Handlers/UserHandler.php`

**Usage:**
```php
add_action('fluent_cart/customer_email_changed', function ($data) {
    $customer = $data['old_customer'];
    // Sync the email change to an external CRM
    my_crm_update_email(
        $customer->id,
        $data['old_email'],
        $data['new_email']
    );
}, 10, 1);
```
</details>

### <code> customer_resources_moved </code>
<details>
<summary><code>fluent_cart/customer_resources_moved</code> &mdash; Fired after all resources are moved between customers</summary>

**When it runs:**
This action fires after a WordPress user's email change triggers a merge between two [Customer](/database/models/customer) records. When the new email already belongs to an existing FluentCart customer, all resources ([Order](/database/models/order), [Subscription](/database/models/subscription), [AppliedCoupon](/database/models/applied-coupon), [Cart](/database/models/cart), customer meta, addresses, and download permissions) are transferred from the old customer to the existing customer. This hook fires once the migration is complete.

**Parameters:**

- `$data` (array): Resource migration data
    ```php
    $data = [
        'from_customer_id' => 10,  // (int) The source customer ID (resources moved away)
        'to_customer_id'   => 25,  // (int) The target customer ID (resources moved to)
    ];
    ```

**Migrated resources:**
- `OrderDownloadPermission` records
- [Order](/database/models/order) records
- [AppliedCoupon](/database/models/applied-coupon) records
- [Cart](/database/models/cart) records
- `CustomerMeta` records
- `CustomerAddresses` records
- [Subscription](/database/models/subscription) records

**Source:** `app/Hooks/Handlers/UserHandler.php`

**Usage:**
```php
add_action('fluent_cart/customer_resources_moved', function ($data) {
    $fromId = $data['from_customer_id'];
    $toId   = $data['to_customer_id'];

    // Sync merged customer data to an external system
    fluent_cart_add_log(
        'Customer Resources Merged',
        sprintf('All resources moved from customer #%d to customer #%d', $fromId, $toId),
        'info'
    );
}, 10, 1);
```
</details>

---

## User Registration

### <code> before_registration </code>
<details>
<summary><code>fluent_cart/user/before_registration</code> &mdash; Fired before a new WordPress user is created during FluentCart registration</summary>

**When it runs:**
This action fires after the registration form data has been validated and processed, but before `wp_create_user()` is called. Use it to perform additional validation, modify the processed data, or trigger external pre-registration workflows.

**Parameters:**

- `$processedData` (array): Processed registration form data
    ```php
    $processedData = [
        'email'      => 'user@example.com',  // (string) Sanitized email address
        'password'   => 'securepass123',      // (string) User-provided or auto-generated password
        'first_name' => 'John',               // (string) Extracted from full name
        'last_name'  => 'Doe',                // (string) Extracted from full name
        'username'   => 'user@example.com',   // (string) Defaults to the email address
    ];
    ```

> **Note:** This parameter is passed directly as an array, not wrapped inside a parent key.

**Source:** `api/User.php`

**Usage:**
```php
add_action('fluent_cart/user/before_registration', function ($processedData) {
    // Log registration attempts
    fluent_cart_add_log(
        'User Registration Attempt',
        sprintf('Registration initiated for %s', $processedData['email']),
        'info'
    );
}, 10, 1);
```
</details>

### <code> after_register </code>
<details>
<summary><code>fluent_cart/user/after_register</code> &mdash; Fired after a new WordPress user is created during checkout registration</summary>

**When it runs:**
This action fires after `wp_insert_user()` succeeds during the checkout registration flow (handled by `AuthService`). At this point the WordPress user has been created, locale preferences have been saved, and the password change nag has been set if applicable. This hook fires before the standard WordPress `register_new_user` action.

**Parameters:**

- `$user_id` (int): The newly created WordPress user ID
- `$data` (array): Additional context data
    ```php
    // Argument 1
    $user_id = 42;

    // Argument 2
    $data = [
        'user_id' => 42,  // (int) Same WordPress user ID
    ];
    ```

> **Note:** This hook passes **two** arguments. Make sure to set the accepted argument count to `2` in `add_action`.

**Source:** `app/Services/AuthService.php`

**Usage:**
```php
add_action('fluent_cart/user/after_register', function ($user_id, $data) {
    // Auto-login the newly registered user
    wp_set_current_user($user_id);
    wp_set_auth_cookie($user_id);

    // Send a custom welcome email
    $user = get_user_by('ID', $user_id);
    wp_mail(
        $user->user_email,
        'Welcome to our store!',
        'Your account has been created successfully.'
    );
}, 10, 2);
```
</details>

---

## Customer Frontend

### <code> customer_menu </code>
<details>
<summary><code>fluent_cart/customer_menu</code> &mdash; Renders the customer dashboard navigation menu</summary>

**When it runs:**
This output action fires inside the customer dashboard template, within the main container and before the content area. It is used to render the sidebar navigation menu for the customer portal. This is a rendering hook with no parameters.

**Parameters:**

None.

**Source:** `app/Views/frontend/customer_app.php`

**Usage:**
```php
add_action('fluent_cart/customer_menu', function () {
    // Add a custom menu item to the customer dashboard navigation
    echo '<a href="/my-account/custom-page/" class="fct-customer-nav-link">';
    echo esc_html__('My Custom Page', 'my-plugin');
    echo '</a>';
}, 20);
```
</details>

### <code> customer_app </code>
<details>
<summary><code>fluent_cart/customer_app</code> &mdash; Renders the customer dashboard main content area</summary>

**When it runs:**
This output action fires inside the customer dashboard template, within the main content container (`.fct-customer-dashboard-main-content`). It is used to render the primary content of the customer portal. This is a rendering hook with no parameters.

**Parameters:**

None.

**Source:** `app/Views/frontend/customer_app.php`

**Usage:**
```php
add_action('fluent_cart/customer_app', function () {
    // Append custom content to the customer dashboard
    echo '<div class="my-custom-section">';
    echo '<h3>' . esc_html__('My Custom Section', 'my-plugin') . '</h3>';
    echo '<p>' . esc_html__('Additional dashboard content here.', 'my-plugin') . '</p>';
    echo '</div>';
}, 20);
```
</details>

---
