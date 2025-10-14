# Products & Pricing

All filters related to catalog management, pricing, and coupons.

### <code> global_currency_setting </code>

<details open>
<summary><code>fluent_cart/global_currency_setting</code> &mdash; Filter global currency settings</summary>

**When it runs:**
This filter is applied when retrieving global currency settings.

**Parameters:**

- `$settings` (array): Currency settings array
    ```php
    $settings = [
        'currency' => 'USD',
        'currency_sign' => '$',
        'currency_position' => 'left',
        'decimal_separator' => '.',
        'thousand_separator' => ',',
        'number_of_decimals' => 2
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$settings` (array): The modified currency settings

**Usage:**
```php
add_filter('fluent_cart/global_currency_setting', function($settings, $data) {
    // Change currency settings
    $settings['currency'] = 'EUR';
    $settings['currency_sign'] = '€';
    return $settings;
}, 10, 2);
```
</details>

### <code> product/add_to_cart_text </code>
<details>
<summary><code>fluent_cart/product/add_to_cart_text</code> &mdash; Filter add to cart button text</summary>

**When it runs:**
This filter is applied when rendering the "Add to Cart" button text.

**Parameters:**

- `$text` (string): The button text
- `$data` (array): Context data
    ```php
    $data = [
        'product' => [
            'id' => 123,
            'title' => 'Product Name',
            'price' => 5000
        ]
    ];
    ```

**Returns:**
- `$text` (string): The modified button text

**Usage:**
```php
add_filter('fluent_cart/product/add_to_cart_text', function($text, $data) {
    // Customize button text
    return 'Add to Basket';
}, 10, 2);
```
</details>

### <code> product_stock_availability </code>
<details>
<summary><code>fluent_cart/product_stock_availability</code> &mdash; Filter product stock availability</summary>

**When it runs:**
This filter is applied when checking product stock availability.

**Parameters:**

- `$availability` (array): Stock availability data
    ```php
    $availability = [
        'is_available' => true,
        'message' => 'In Stock',
        'quantity' => 10
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$availability` (array): The modified availability data

**Usage:**
```php
add_filter('fluent_cart/product_stock_availability', function($availability, $data) {
    // Customize stock message
    if ($availability['quantity'] < 5) {
        $availability['message'] = 'Only ' . $availability['quantity'] . ' left!';
    }
    return $availability;
}, 10, 2);
```
</details>

### <code> product_download/can_be_downloaded </code>
<details>
<summary><code>fluent_cart/product_download/can_be_downloaded</code> &mdash; Filter whether product can be downloaded</summary>

**When it runs:**
This filter is applied when determining if a product file can be downloaded by the customer.

**Parameters:**

- `$canBeDownloaded` (bool): Whether the file can be downloaded
- `$data` (array): Context data
    ```php
    $data = [
        'download' => [
            'id' => 1,
            'name' => 'file.pdf'
        ],
        'order' => [
            'id' => 123,
            'payment_status' => 'paid'
        ],
        'customer' => []
    ];
    ```

**Returns:**
- `$canBeDownloaded` (bool): The modified boolean value

**Usage:**
```php
add_filter('fluent_cart/product_download/can_be_downloaded', function($canBeDownloaded, $data) {
    $order = $data['order'];
    // Only allow downloads for paid orders
    if ($order['payment_status'] !== 'paid') {
        return false;
    }
    return $canBeDownloaded;
}, 10, 2);
```
</details>

### <code> coupon/validating_coupon </code>
<details>
<summary><code>fluent_cart/coupon/validating_coupon</code> &mdash; Filter when validating coupon</summary>

**When it runs:**
This filter is applied when validating a coupon code before applying it to the cart.

**Parameters:**

- `$isValid` (bool): Whether the coupon is valid
- `$data` (array): Coupon validation data
    ```php
    $data = [
        'coupon' => [
            'id' => 999,
            'code' => 'SAVE20',
            'discount_type' => 'percentage',
            'discount_value' => 20
        ],
        'cart' => []
    ];
    ```

**Returns:**
- `$isValid` (bool): The modified validation result

**Usage:**
```php
add_filter('fluent_cart/coupon/validating_coupon', function($isValid, $data) {
    $coupon = $data['coupon'];
    $cart = $data['cart'];
    // Add custom validation logic
    if ($cart['total'] < 5000) {
        return false; // Minimum order $50
    }
    return $isValid;
}, 10, 2);
```
</details>

---