# System & Admin


## UI & Templates
All hooks related to system-level and administrative functions.

### <code> fluentcart_loaded </code>
<details open>
<summary><code>fluentcart_loaded</code> &mdash; Fired when FluentCart is loaded</summary>

**When it runs:**
This action is fired when the FluentCart plugin is fully loaded and initialized.

**Parameters:**

- `$data` (array): Plugin data (empty array)

**Usage:**
```php
add_action('fluentcart_loaded', function($data) {
    // Initialize custom functionality
    do_action('my_custom_fluentcart_init');
}, 10, 1);
```
</details>

### <code> module/activated/{module_key} </code>
<details>
<summary><code>fluent_cart/module/activated/{module_key}</code> &mdash; Fired when a module is activated</summary>

**When it runs:**
This action is fired when a FluentCart module is activated.

**Parameters:**

- `$data` (array): Module activation data
    ```php
    $data = [
        'module_key' => 'subscriptions',
        'module' => []
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/module/activated/subscriptions', function($data) {
    // Setup subscription tables
    setup_subscription_database();
}, 10, 1);
```
</details>


## UI & Templates

All hooks related to frontend rendering and display.

### <code> before_checkout_form </code>
<details>
<summary><code>fluent_cart/before_checkout_form</code> &mdash; Fired before checkout form</summary>

**When it runs:**
This action is fired before the checkout form is rendered.

**Parameters:**

- `$data` (array): Checkout data (empty array)

**Usage:**
```php
add_action('fluent_cart/before_checkout_form', function($data) {
    // Display custom message
    echo '<div class="custom-notice">Special offer available!</div>';
}, 10, 1);
```
</details>

### <code> after_checkout_form </code>
<details>
<summary><code>fluent_cart/after_checkout_form</code> &mdash; Fired after checkout form</summary>

**When it runs:**
This action is fired after the checkout form is rendered.

**Parameters:**

- `$data` (array): Checkout data (empty array)

**Usage:**
```php
add_action('fluent_cart/after_checkout_form', function($data) {
    // Display trust badges
    echo '<div class="trust-badges">Secure Checkout</div>';
}, 10, 1);
```
</details>

---
