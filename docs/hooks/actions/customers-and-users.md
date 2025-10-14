# Customers & Users

All hooks related to user and customer management.

### <code> after_register </code>
<details open>
<summary><code>fluent_cart/user/after_register</code> &mdash; Fired after user registration</summary>

**When it runs:**
This action is fired after a new user is successfully registered.

**Parameters:**

- `$data` (array): User registration data
    ```php
    $data = [
        'user' => [
            'ID' => 789,
            'user_email' => 'user@example.com',
            'user_login' => 'johndoe'
        ],
        'customer' => []
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/user/after_register', function($data) {
    $user = $data['user'];
    // Send welcome email
    wp_mail($user->user_email, 'Welcome!', 'Welcome to our store!');
}, 10, 1);
```
</details>

### <code> customer_email_changed </code>
<details>
<summary><code>fluent_cart/customer_email_changed</code> &mdash; Fired when customer email is changed</summary>

**When it runs:**
This action is fired when a customer's email address is updated.

**Parameters:**

- `$data` (array): Email change data
    ```php
    $data = [
        'customer' => [
            'id' => 456,
            'email' => 'newemail@example.com'
        ],
        'old_email' => 'oldemail@example.com',
        'new_email' => 'newemail@example.com'
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/customer_email_changed', function($data) {
    $customer = $data['customer'];
    // Update external systems
    update_external_crm($customer->id, $data['new_email']);
}, 10, 1);
```
</details>

### <code> customer_status_updated </code>
<details>
<summary><code>fluent_cart/customer_status_updated</code> &mdash; Fired when customer status is updated</summary>

**When it runs:**
This action is fired when a customer's status changes (active/inactive).

**Parameters:**

- `$data` (array): Customer status data
    ```php
    $data = [
        'customer' => [
            'id' => 456,
            'status' => 'active'
        ],
        'old_status' => 'inactive',
        'new_status' => 'active'
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/customer_status_updated', function($data) {
    $customer = $data['customer'];
    // Log status change
    error_log('Customer #' . $customer->id . ' status: ' . $data['new_status']);
}, 10, 1);
```
</details>

---