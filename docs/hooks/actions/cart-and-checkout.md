# Cart & Checkout

All hooks related to the shopping flow from cart to checkout completion.

### <code> item_added </code>
<details open>
<summary><code>fluent_cart/cart/item_added</code> &mdash; Fired when an item is added to cart</summary>

**When it runs:**
This action is fired when a product is successfully added to the shopping cart.

**Parameters:**

- `$data` (array): Cart item data
    ```php
    $data = [
        'cart_item' => [
            'id' => 1,
            'cart_id' => 123,
            'product_id' => 456,
            'variation_id' => 789,
            'quantity' => 2,
            'price' => 5000
        ],
        'cart' => []
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/cart/item_added', function($data) {
    $cartItem = $data['cart_item'];
    // Track add to cart event
    do_action('custom_analytics_track', 'add_to_cart', $cartItem);
}, 10, 1);
```
</details>

### <code> item_removed </code>
<details>
<summary><code>fluent_cart/cart/item_removed</code> &mdash; Fired when an item is removed from cart</summary>

**When it runs:**
This action is fired when a product is removed from the shopping cart.

**Parameters:**

- `$data` (array): Cart item removal data
    ```php
    $data = [
        'cart_item' => [
            'id' => 1,
            'cart_id' => 123,
            'product_id' => 456,
            'variation_id' => 789
        ],
        'cart' => []
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/cart/item_removed', function($data) {
    $cartItem = $data['cart_item'];
    // Track removal event
    do_action('custom_analytics_track', 'remove_from_cart', $cartItem);
}, 10, 1);
```
</details>

### <code> cart_completed </code>
<details>
<summary><code>fluent_cart/cart_completed</code> &mdash; Fired when cart is completed</summary>

**When it runs:**
This action is fired when a cart is successfully converted to an order.

**Parameters:**

- `$data` (array): Cart completion data
    ```php
    $data = [
        'cart' => [
            'id' => 123,
            'customer_id' => 456,
            'total' => 10000
        ],
        'order' => [],
        'customer' => []
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/cart_completed', function($data) {
    $cart = $data['cart'];
    $order = $data['order'];
    // Track conversion
    do_action('custom_analytics_track', 'purchase', $order);
}, 10, 1);
```
</details>

### <code> customer_data_saved </code>
<details>
<summary><code>fluent_cart/checkout/customer_data_saved</code> &mdash; Fired when customer data is saved during checkout</summary>

**When it runs:**
This action is fired when customer information is saved during the checkout process.

**Parameters:**

- `$data` (array): Customer data
    ```php
    $data = [
        'customer' => [
            'id' => 456,
            'email' => 'customer@example.com',
            'first_name' => 'John',
            'last_name' => 'Doe'
        ],
        'cart' => []
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/checkout/customer_data_saved', function($data) {
    $customer = $data['customer'];
    // Sync to CRM
    sync_to_crm($customer);
}, 10, 1);
```
</details>

### <code> after_receipt </code>
<details>
<summary><code>fluent_cart/after_receipt</code> &mdash; Fired after receipt is displayed</summary>

**When it runs:**
This action is fired after the order receipt is rendered on the thank you page.

**Parameters:**

- `$data` (array): Receipt data
    ```php
    $data = [
        'order' => [
            'id' => 123,
            'customer_id' => 456,
            'total' => 10000
        ]
    ];
    ```

**Usage:**
```php
add_action('fluent_cart/after_receipt', function($data) {
    $order = $data['order'];
    // Display custom thank you message
    echo '<div class="custom-message">Thank you for your purchase!</div>';
}, 10, 1);
```
</details>

---