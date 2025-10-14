
# Cart & Checkout

All filters related to the shopping flow from cart to checkout.

### <code> estimated_total </code>
<details open>
<summary><code>fluent_cart/cart/estimated_total</code> &mdash; Filter cart estimated total</summary>

**When it runs:**
This filter is applied when calculating the cart total, allowing you to modify the final total amount.

**Parameters:**

- `$total` (int): The cart total in cents
- `$data` (array): Context data
    ```php
    $data = [
        'cart' => [
            'id' => 123,
            'subtotal' => 10000,
            'tax' => 1000,
            'discount' => 500
        ]
    ];
    ```

**Returns:**
- `$total` (int): The modified cart total in cents

**Usage:**
```php
add_filter('fluent_cart/cart/estimated_total', function($total, $data) {
    $cart = $data['cart'];
    // Add a processing fee
    $processingFee = 200; // $2.00 in cents
    return $total + $processingFee;
}, 10, 2);
```
</details>

### <code> checkout_address_fields </code>
<details>
<summary><code>fluent_cart/checkout_address_fields</code> &mdash; Filter checkout address fields</summary>

**When it runs:**
This filter is applied when rendering address fields on the checkout page.

**Parameters:**

- `$fields` (array): Array of address field definitions
    ```php
    $fields = [
        'first_name' => [
            'label' => 'First Name',
            'type' => 'text',
            'required' => true
        ],
        'last_name' => [
            'label' => 'Last Name',
            'type' => 'text',
            'required' => true
        ],
        'email' => [
            'label' => 'Email',
            'type' => 'email',
            'required' => true
        ]
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$fields` (array): The modified fields array

**Usage:**
```php
add_filter('fluent_cart/checkout_address_fields', function($fields, $data) {
    // Add a custom address field
    $fields['company'] = [
        'label' => 'Company Name',
        'type' => 'text',
        'required' => false
    ];
    return $fields;
}, 10, 2);
```
</details>

### <code> checkout_page_css_classes </code>
<details>
<summary><code>fluent_cart/checkout_page_css_classes</code> &mdash; Filter checkout page CSS classes</summary>

**When it runs:**
This filter is applied when rendering the checkout page to customize CSS classes.

**Parameters:**

- `$classes` (array): Array of CSS classes
    ```php
    $classes = [
        'fluent-cart-checkout',
        'checkout-page'
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$classes` (array): The modified CSS classes array

**Usage:**
```php
add_filter('fluent_cart/checkout_page_css_classes', function($classes, $data) {
    // Add custom CSS class
    $classes[] = 'custom-checkout-theme';
    return $classes;
}, 10, 2);
```
</details>

---