# Cart & Checkout

All filters related to the shopping flow from [Cart](/database/models/cart) to checkout.

---

## Cart Items & Validation

### <code> cart/item_modify </code>
<details open>
<summary><code>fluent_cart/cart/item_modify</code> &mdash; Modify cart item variation before adding</summary>

**When it runs:**
This filter is applied when a product variation is being added to the cart or when an existing cart item is updated. It allows you to modify the variation object before it gets processed, or return `null` to block the item from being added.

**Source:**
- `api/Resource/FrontendResource/CartResource.php:44` (add to cart)
- `api/Resource/FrontendResource/CartResource.php:307` (update cart item)

**Parameters:**

- `$variation` ([ProductVariation](/database/models/product-variation)|null): The product variation model instance
- `$data` (array): Context data
    ```php
    $data = [
        'item_id'  => 42,    // Variation ID being added
        'quantity' => 1,     // Requested quantity
    ];
    ```

**Returns:**
- [ProductVariation](/database/models/product-variation)|null — The modified variation, or `null` to prevent the item from being added

**Usage:**
```php
add_filter('fluent_cart/cart/item_modify', function ($variation, $data) {
    if (!$variation) {
        return $variation;
    }

    // Block a specific variation from being added
    if ($variation->id === 99) {
        return null;
    }

    return $variation;
}, 10, 2);
```
</details>

### <code> item_max_quantity </code>
<details>
<summary><code>fluent_cart/item_max_quantity</code> &mdash; Limit the maximum quantity for a cart item</summary>

**When it runs:**
This filter is applied immediately after the variation is resolved, before the item is added to the cart. It allows you to cap or adjust the quantity a customer can add.

**Source:** `api/Resource/FrontendResource/CartResource.php:54`

**Parameters:**

- `$quantity` (int): The requested quantity
- `$data` (array): Context data
    ```php
    $data = [
        'variation' => $variation,  // ProductVariation instance
        'product'   => $product,    // Product instance (empty array for custom items)
    ];
    ```

**Returns:**
- `int` — The (possibly capped) quantity

**Usage:**
```php
add_filter('fluent_cart/item_max_quantity', function ($quantity, $data) {
    $variation = $data['variation'];

    // Limit subscription products to 1
    if ($variation->payment_type === 'subscription') {
        return 1;
    }

    // Cap all items at 10
    return min($quantity, 10);
}, 10, 2);
```
</details>

### <code> cart/custom_item_quantity_changed </code>
<details>
<summary><code>fluent_cart/cart/custom_item_quantity_changed</code> &mdash; Handle custom item quantity changes</summary>

**When it runs:**
This filter fires when the quantity of a custom (externally-managed) item already in the cart is changed. It lets you recalculate pricing or validate the new quantity.

**Source:** `api/Resource/FrontendResource/CartResource.php:269`

**Parameters:**

- `$existingItem` (object): The existing cart item object
- `$data` (array): Context data
    ```php
    $data = [
        'old_quantity' => 2,       // Previous quantity
        'new_quantity' => 3,       // Requested new quantity
        'by_input'     => false,   // Whether quantity was set directly
        'is_changed'   => true,    // Whether a change occurred
        'is_custom'    => true,    // Whether this is a custom item
    ];
    ```

**Returns:**
- `object` — The modified item object with updated quantity and totals

**Usage:**
```php
add_filter('fluent_cart/cart/custom_item_quantity_changed', function ($variation, $data) {
    if (empty($data['is_custom'])) {
        return $variation;
    }

    // Recalculate line total based on new quantity
    $variation->quantity = $data['new_quantity'];
    $variation->line_total = $variation->price * $data['new_quantity'];

    return $variation;
}, 10, 2);
```
</details>

### <code> cart/validate_custom_item </code>
<details>
<summary><code>fluent_cart/cart/validate_custom_item</code> &mdash; Validate a custom or externally-managed cart item</summary>

**When it runs:**
This filter fires when a custom (non-FluentCart) item is being added to the cart. Use it to validate and construct the item object that will be stored in the cart. Runs both during regular add-to-cart and instant checkout flows.

**Source:**
- `api/Resource/FrontendResource/CartResource.php:289`
- `app/Http/Routes/WebRoutes.php:99`

**Parameters:**

- `$existingItem` (object|null): The existing item object, or `null` for new items
- `$data` (array): Context data
    ```php
    $data = [
        'item_id'   => 'custom_item_123',  // External item identifier
        'quantity'  => 1,                   // Requested quantity
        'is_custom' => true,               // Always true for custom items
    ];
    ```

**Returns:**
- `object` — A variation-like object with the required cart item properties

**Usage:**
```php
add_filter('fluent_cart/cart/validate_custom_item', function ($variation, $data) {
    if (!(bool) $data['is_custom']) {
        return $variation;
    }

    // Build a custom item object
    return (object) [
        'item_id'      => absint($data['item_id']),
        'object_id'    => absint($data['item_id']),
        'title'        => 'Custom Product',
        'price'        => 2500, // $25.00 in cents
        'quantity'     => (int) $data['quantity'],
        'payment_type' => 'one_time',
        'is_custom'    => true,
    ];
}, 10, 2);
```
</details>

### <code> cart_item_product_variation </code>
<details>
<summary><code>fluent_cart/cart_item_product_variation</code> &mdash; Provide a fallback product variation for a cart item</summary>

**When it runs:**
This filter fires when a product variation cannot be found in the database during cart operations. It serves as a fallback mechanism to supply a variation from an external source.

**Source:** `api/Resource/FrontendResource/CartResource.php:631`

**Parameters:**

- `$productVariation` ([ProductVariation](/database/models/product-variation)|null): Always `null` at this point (no variation found)
- `$itemId` (int): The variation/item ID being looked up
- `$incrementBy` (int): The quantity increment value
- `$existingItemsArray` (array): The current cart items array

**Returns:**
- [ProductVariation](/database/models/product-variation)|null — A variation model instance, or `null` if the item should be skipped

**Usage:**
```php
add_filter('fluent_cart/cart_item_product_variation', function ($variation, $itemId, $incrementBy, $existingItems) {
    if (!$variation && $itemId > 10000) {
        // Provide a variation for external items
        return MyExternalService::getVariation($itemId);
    }
    return $variation;
}, 10, 4);
```
</details>

### <code> cart/can_purchase </code>
<details>
<summary><code>fluent_cart/cart/can_purchase</code> &mdash; Determine whether a variation can be added to the cart</summary>

**When it runs:**
This filter fires after the built-in `canPurchase()` check on the variation model, inside `Cart::addItem()`. It allows you to add additional purchase restrictions or override the default validation.

**Source:** `app/Models/Cart.php:333`

**Parameters:**

- `$canPurchase` (true|WP_Error): The result of the built-in purchase validation
- `$data` (array): Context data
    ```php
    $data = [
        'cart'      => $cart,       // Cart model instance
        'variation' => $variation,  // ProductVariation model
        'quantity'  => 2,           // Requested quantity
    ];
    ```

**Returns:**
- `true|WP_Error` — Return `true` to allow purchase, or a `WP_Error` to block it with a message

**Usage:**
```php
add_filter('fluent_cart/cart/can_purchase', function ($canPurchase, $data) {
    if (is_wp_error($canPurchase)) {
        return $canPurchase;
    }

    $cart = $data['cart'];
    $variation = $data['variation'];

    // Limit cart to 5 unique items
    $existingItems = $cart->getItems();
    if (count($existingItems) >= 5 && !isset($existingItems[$variation->id])) {
        return new \WP_Error(
            'cart_limit',
            __('You can only have up to 5 different items in your cart.', 'fluent-cart')
        );
    }

    return true;
}, 10, 2);
```
</details>

### <code> cart/estimated_total </code>
<details>
<summary><code>fluent_cart/cart/estimated_total</code> &mdash; Filter the cart estimated total</summary>

**When it runs:**
This filter is applied when calculating the cart's estimated total. It fires in both the [Cart](/database/models/cart) model's `getEstimatedTotal()` method and the web checkout handler. The total includes item subtotals, shipping, and any custom checkout adjustments.

**Source:**
- `app/Models/Cart.php:766`
- `app/Hooks/Cart/WebCheckoutHandler.php:358`

**Parameters:**

- `$total` (int): The cart total in cents
- `$data` (array): Context data
    ```php
    $data = [
        'cart' => $cart,  // Cart model instance
    ];
    ```

**Returns:**
- `int` — The modified cart total in cents

**Usage:**
```php
add_filter('fluent_cart/cart/estimated_total', function ($total, $data) {
    $cart = $data['cart'];

    // Add a flat processing fee of $2.00
    $processingFee = 200; // in cents
    return $total + $processingFee;
}, 10, 2);
```
</details>

### <code> cart_cookie_minutes </code>
<details>
<summary><code>fluent_cart/cart_cookie_minutes</code> &mdash; Control cart cookie expiration time</summary>

**When it runs:**
This filter fires when setting the cart hash cookie. Despite the name, the default value is a Unix timestamp (not minutes). You can change how long the cart cookie persists in the browser.

**Source:** `api/Cookie/Cookie.php:22`

**Parameters:**

- `$expireTime` (int): Unix timestamp for cookie expiration. Default is `time() + 24 * 60 * 30` (30 days from now)

**Returns:**
- `int` — The Unix timestamp when the cookie should expire

**Usage:**
```php
add_filter('fluent_cart/cart_cookie_minutes', function ($expireTime) {
    // Set cookie to expire in 7 days instead of 30
    return time() + (7 * DAY_IN_SECONDS);
});
```
</details>

### <code> variation/can_purchase_bundle </code>
<details>
<summary><code>fluent_cart/variation/can_purchase_bundle</code> &mdash; Validate whether a bundle product can be purchased</summary>

**When it runs:**
This filter fires during the `canPurchase()` check on a [ProductVariation](/database/models/product-variation) when the product is a bundle. It allows external modules (like StockManagement) to validate stock for bundled child items.

**Source:** `app/Models/ProductVariation.php:265`

**Parameters:**

- `$result` (null): Always `null` initially
- `$data` (array): Context data
    ```php
    $data = [
        'variation' => $variation,  // ProductVariation model
        'quantity'  => 1,           // Requested purchase quantity
    ];
    ```

**Returns:**
- `null|true|false|WP_Error` — Return `null` or `true` to allow, `false` for a generic out-of-stock error, or `WP_Error` with a custom message to block

**Usage:**
```php
add_filter('fluent_cart/variation/can_purchase_bundle', function ($result, $data) {
    $variation = $data['variation'];
    $quantity = (int) $data['quantity'];

    // Check if all bundle children have sufficient stock
    $children = $variation->bundleChildren()->get();
    foreach ($children as $child) {
        if ($child->available < ($child->pivot->quantity * $quantity)) {
            return new \WP_Error(
                'bundle_stock',
                sprintf(__('%s does not have enough stock.', 'fluent-cart'), $child->title)
            );
        }
    }

    return $result;
}, 10, 2);
```
</details>

---

## Checkout Validation

### <code> checkout/validate_before_process </code>
<details>
<summary><code>fluent_cart/checkout/validate_before_process</code> &mdash; Pre-validate the checkout before processing</summary>

**When it runs:**
This filter fires early in the `placeOrder()` flow, before any field or product validation occurs. It is the first opportunity for modules to reject a checkout attempt (e.g., CAPTCHA verification, rate limiting, or custom business rules).

**Source:** `api/Checkout/CheckoutApi.php:83`

**Parameters:**

- `$validation` (true): Always `true` initially
- `$data` (array): The full checkout submission data (billing address, payment method, form fields, etc.)

**Returns:**
- `true|WP_Error` — Return `true` to continue processing, or a `WP_Error` to abort checkout with an error message

**Usage:**
```php
add_filter('fluent_cart/checkout/validate_before_process', function ($validation, $data) {
    // Require a minimum order amount
    $cart = \FluentCart\App\Models\Cart::query()
        ->where('cart_hash', $data['cart_hash'])
        ->first();

    if ($cart && $cart->getEstimatedTotal() < 500) {
        return new \WP_Error(
            'min_order',
            __('Minimum order amount is $5.00.', 'fluent-cart')
        );
    }

    return $validation;
}, 10, 2);
```
</details>

### <code> cart/tax_behavior </code>
<details>
<summary><code>fluent_cart/cart/tax_behavior</code> &mdash; Filter the tax behavior amount for the cart</summary>

**When it runs:**
This filter fires during order creation in `CheckoutApi::placeOrder()`. It determines the tax behavior value that controls how tax is applied to the order total. The TaxModule hooks into this to read the computed tax behavior from the cart's checkout data.

**Source:** `api/Checkout/CheckoutApi.php:171`

**Parameters:**

- `$behavior` (int): The default tax behavior value (`0`)
- `$data` (array): Context data
    ```php
    $data = [
        'cart' => $cart,  // Cart model instance
    ];
    ```

**Returns:**
- `int` — The tax behavior value (e.g., `0` for tax-exclusive, `1` for tax-inclusive)

**Usage:**
```php
add_filter('fluent_cart/cart/tax_behavior', function ($behavior, $data) {
    $cart = $data['cart'];

    // Force tax-inclusive behavior for a specific region
    $country = $cart->checkout_data['billing_address']['country'] ?? '';
    if (in_array($country, ['DE', 'FR', 'GB'])) {
        return 1; // Inclusive
    }

    return $behavior;
}, 10, 2);
```
</details>

### <code> checkout/validate_data </code>
<details>
<summary><code>fluent_cart/checkout/validate_data</code> &mdash; Add or modify checkout validation errors</summary>

**When it runs:**
This filter fires after the core field, shipping, and terms validation has run, but before the order is created. It lets you append custom validation errors or clear existing ones.

**Source:** `api/Checkout/CheckoutApi.php:890`

**Parameters:**

- `$errors` (array): Associative array of validation errors (keyed by field name)
- `$data` (array): Context data
    ```php
    $data = [
        'data' => $submittedData,  // The checkout form data
        'cart' => $cart,           // Cart model instance
    ];
    ```

**Returns:**
- `array` — The modified errors array. An empty array means validation passes.

**Usage:**
```php
add_filter('fluent_cart/checkout/validate_data', function ($errors, $data) {
    $formData = $data['data'];

    // Require a phone number for physical products
    $cart = $data['cart'];
    if ($cart->requireShipping() && empty($formData['billing_address']['phone'])) {
        $errors['billing_phone'] = [
            'required' => __('Phone number is required for physical products.', 'fluent-cart'),
        ];
    }

    return $errors;
}, 10, 2);
```
</details>

---

## Checkout Page Rendering

### <code> checkout_page_css_classes </code>
<details>
<summary><code>fluent_cart/checkout_page_css_classes</code> &mdash; Modify checkout page CSS classes</summary>

**When it runs:**
This filter fires when the checkout page container is being rendered. It lets you add, remove, or modify the CSS classes on the checkout wrapper element.

**Source:** `app/Services/Renderer/CheckoutRenderer.php:144`

**Parameters:**

- `$classNames` (array): Array of CSS class strings
- `$data` (array): Context data
    ```php
    $data = [
        'cart' => $cart,  // Cart model instance
    ];
    ```

**Returns:**
- `array` — The modified array of CSS class strings

**Usage:**
```php
add_filter('fluent_cart/checkout_page_css_classes', function ($classes, $data) {
    $cart = $data['cart'];

    // Add a class when cart has subscription items
    if ($cart->hasSubscription()) {
        $classes[] = 'has-subscription-items';
    }

    return $classes;
}, 10, 2);
```
</details>

### <code> checkout_page_notices </code>
<details>
<summary><code>fluent_cart/checkout_page_notices</code> &mdash; Add custom notices to the checkout page</summary>

**When it runs:**
This filter fires during checkout page rendering, allowing you to inject notice messages that appear at the top of the checkout form.

**Source:** `app/Services/Renderer/CheckoutRenderer.php:170`

**Parameters:**

- `$notices` (array): Array of notice items (empty by default)
- `$data` (array): Context data
    ```php
    $data = [
        'cart' => $cart,  // Cart model instance
    ];
    ```

**Returns:**
- `array` — Array of notice items to display

**Usage:**
```php
add_filter('fluent_cart/checkout_page_notices', function ($notices, $data) {
    $cart = $data['cart'];

    // Show a free shipping notice
    $total = $cart->getEstimatedTotal();
    if ($total < 5000 && $cart->requireShipping()) {
        $notices[] = [
            'type'    => 'info',
            'message' => sprintf(
                __('Add %s more to qualify for free shipping!', 'fluent-cart'),
                '$' . number_format((5000 - $total) / 100, 2)
            ),
        ];
    }

    return $notices;
}, 10, 2);
```
</details>

### <code> checkout_renderer/billing_fields </code>
<details>
<summary><code>fluent_cart/checkout_renderer/billing_fields</code> &mdash; Modify rendered billing fields on the checkout page</summary>

**When it runs:**
This filter fires after the billing address fields have been assembled and rearranged in the checkout renderer. It allows modification of the fully prepared billing field HTML structures before output.

**Source:** `app/Services/Renderer/CheckoutRenderer.php:448`

**Parameters:**

- `$billingFields` (array): Array of billing field definitions with their rendered state
- `$data` (array): Context data
    ```php
    $data = [
        'checkout_renderer' => $renderer,  // CheckoutRenderer instance
        'cart'              => $cart,       // Cart model instance
    ];
    ```

**Returns:**
- `array` — The modified billing fields array

**Usage:**
```php
add_filter('fluent_cart/checkout_renderer/billing_fields', function ($fields, $data) {
    // Remove the company field from rendered billing fields
    foreach ($fields as $sectionKey => &$section) {
        if (isset($section['schema']) && is_array($section['schema'])) {
            unset($section['schema']['billing_company']);
        }
    }

    return $fields;
}, 10, 2);
```
</details>

### <code> checkout_renderer/shipping_fields </code>
<details>
<summary><code>fluent_cart/checkout_renderer/shipping_fields</code> &mdash; Modify rendered shipping fields on the checkout page</summary>

**When it runs:**
This filter fires after shipping address fields have been assembled and validated in the checkout renderer, before they are output as HTML.

**Source:** `app/Services/Renderer/CheckoutRenderer.php:521`

**Parameters:**

- `$shippingFields` (array): Array of shipping field definitions
- `$data` (array): Context data
    ```php
    $data = [
        'checkout_renderer' => $renderer,  // CheckoutRenderer instance
        'cart'              => $cart,       // Cart model instance
    ];
    ```

**Returns:**
- `array` — The modified shipping fields array

**Usage:**
```php
add_filter('fluent_cart/checkout_renderer/shipping_fields', function ($fields, $data) {
    // Make the address line 2 required for shipping
    foreach ($fields as &$field) {
        if (isset($field['name']) && $field['name'] === 'shipping_address_2') {
            $field['required'] = 'yes';
        }
    }

    return $fields;
}, 10, 2);
```
</details>

### <code> disable_order_notes_for_digital_products </code>
<details>
<summary><code>fluent_cart/disable_order_notes_for_digital_products</code> &mdash; Control order notes visibility for digital products</summary>

**When it runs:**
This filter fires when the checkout renderer decides whether to show the order notes textarea. By default, order notes are hidden when the cart contains only digital (non-shippable) products.

**Source:** `app/Services/Renderer/CheckoutRenderer.php:560`

**Parameters:**

- `$disable` (bool): Whether to hide order notes for digital-only carts. Default `true`.
- `$data` (array): Context data
    ```php
    $data = [
        'cart' => $cart,  // Cart model instance
    ];
    ```

**Returns:**
- `bool` — `true` to hide order notes for digital products, `false` to always show them

**Usage:**
```php
add_filter('fluent_cart/disable_order_notes_for_digital_products', function ($disable, $data) {
    // Always show order notes, even for digital products
    return false;
}, 10, 2);
```
</details>

### <code> checkout_active_payment_methods </code>
<details>
<summary><code>fluent_cart/checkout_active_payment_methods</code> &mdash; Filter active payment methods on the checkout page</summary>

**When it runs:**
This filter fires when listing the available payment methods on both the standard checkout and modal checkout renderers. It lets you add, remove, or reorder payment gateway instances.

**Source:**
- `app/Services/Renderer/CheckoutRenderer.php:652`
- `app/Services/Renderer/ModalCheckoutRenderer.php:450`

**Parameters:**

- `$activePaymentMethods` (array): Array of payment method instances
- `$data` (array): Context data
    ```php
    $data = [
        'cart' => $cart,  // Cart model instance
    ];
    ```

**Returns:**
- `array` — The modified array of payment method instances

**Usage:**
```php
add_filter('fluent_cart/checkout_active_payment_methods', function ($methods, $data) {
    $cart = $data['cart'];

    // Remove COD for orders over $500
    if ($cart->getEstimatedTotal() > 50000) {
        $methods = array_filter($methods, function ($method) {
            return $method->getMeta('route') !== 'cod';
        });
    }

    return array_values($methods);
}, 10, 2);
```
</details>

### <code> checkout_page_order_button_text </code>
<details>
<summary><code>fluent_cart/checkout_page_order_button_text</code> &mdash; Customize the place order button text</summary>

**When it runs:**
This filter fires when the checkout submit button is being rendered, allowing you to change its label.

**Source:** `app/Services/Renderer/CheckoutRenderer.php:705`

**Parameters:**

- `$text` (string): The button text. Default: `__('Place order', 'fluent-cart')`

**Returns:**
- `string` — The modified button text

**Usage:**
```php
add_filter('fluent_cart/checkout_page_order_button_text', function ($text) {
    return __('Complete Purchase', 'fluent-cart');
});
```
</details>

### <code> payment_method_list_class </code>
<details>
<summary><code>fluent_cart_payment_method_list_class</code> &mdash; Add CSS classes to a payment method wrapper</summary>

**When it runs:**
This filter fires when rendering each individual payment method option in both the standard and modal checkout. It lets you add custom CSS classes to the payment method container element.

> **Note:** This hook uses a non-standard prefix (`fluent_cart_`) rather than the standard `fluent_cart/` convention. This is a legacy naming that may be standardized in a future release.

**Source:**
- `app/Services/Renderer/CheckoutRenderer.php:797`
- `app/Services/Renderer/ModalCheckoutRenderer.php:569`

**Parameters:**

- `$class` (string): The CSS class string. Default: `''`
- `$data` (array): Context data
    ```php
    $data = [
        'route'        => 'stripe',   // Payment method route/slug
        'method_title' => 'Stripe',   // Display title
        'method_style' => 'logo',     // Display style
    ];
    ```

**Returns:**
- `string` — The modified CSS class string

**Usage:**
```php
add_filter('fluent_cart_payment_method_list_class', function ($class, $data) {
    // Add a highlight class for COD payment
    if ($data['route'] === 'cod') {
        return $class . ' payment-method-highlighted';
    }
    return $class;
}, 10, 2);
```
</details>

### <code> modal_checkout/filter_active_payment_methods </code>
<details>
<summary><code>fluent_cart/modal_checkout/filter_active_payment_methods</code> &mdash; Restrict payment methods in modal checkout</summary>

**When it runs:**
This filter fires during modal checkout rendering, after the active payment methods have been resolved. If a non-empty array of payment method route slugs is returned, only those methods will be shown in the modal.

**Source:** `app/Services/Renderer/ModalCheckoutRenderer.php:455`

**Parameters:**

- `$selectedMethods` (array): Empty array by default

**Returns:**
- `array` — Array of payment method route slugs to show (e.g., `['stripe', 'paypal']`). An empty array shows all active methods.

**Usage:**
```php
add_filter('fluent_cart/modal_checkout/filter_active_payment_methods', function ($methods) {
    // Only show Stripe in the modal checkout
    return ['stripe'];
});
```
</details>

### <code> enable_modal_checkout </code>
<details>
<summary><code>fluent_cart/enable_modal_checkout</code> &mdash; Enable or disable modal checkout</summary>

**When it runs:**
This filter fires when checking whether modal (popup) checkout is enabled. By default, modal checkout is disabled.

**Source:** `app/Helpers/Helper.php:1710`

**Parameters:**

- `$enabled` (bool): Whether modal checkout is enabled. Default: `false`

**Returns:**
- `bool` — `true` to enable modal checkout, `false` to use the standard checkout page

**Usage:**
```php
add_filter('fluent_cart/enable_modal_checkout', function ($enabled) {
    // Enable modal checkout
    return true;
});
```
</details>

---

## Checkout Data & Session

### <code> checkout/checkout_data_changed </code>
<details>
<summary><code>fluent_cart/checkout/checkout_data_changed</code> &mdash; Modify checkout data after a change is detected</summary>

**When it runs:**
This filter fires after checkout session data has been patched and saved, letting you modify the response data that is sent back to the browser. It runs in both the standard and AJAX checkout data change handlers.

**Source:**
- `app/Hooks/Cart/WebCheckoutHandler.php:495`
- `app/Hooks/Cart/WebCheckoutHandler.php:1115`

**Parameters:**

- `$checkoutData` (array): The checkout change response data
    ```php
    $checkoutData = [
        'message'                 => 'Data saved',
        'fragments'               => [...],
        'estimated_total'         => 15000,
        'estimated_total_changed' => true,
        'totals'                  => [
            'old' => 14000,
            'new' => 15000,
        ],
        'tax_total_changes'       => false,
        'shipping_charge_changes' => true,
    ];
    ```
- `$data` (array): Context data
    ```php
    $data = [
        'cart' => $cart,  // Cart model instance
    ];
    ```

**Returns:**
- `array` — The modified checkout data response

**Usage:**
```php
add_filter('fluent_cart/checkout/checkout_data_changed', function ($checkoutData, $data) {
    // Add custom data to the response
    $checkoutData['custom_notice'] = __('Your order qualifies for a bonus!', 'fluent-cart');
    return $checkoutData;
}, 10, 2);
```
</details>

### <code> checkout/cart_updated </code>
<details>
<summary><code>fluent_cart/checkout/cart_updated</code> &mdash; Filter the cart update response data</summary>

**When it runs:**
This filter fires when the cart has been updated during the checkout session (e.g., items added or removed). It lets you append additional data to the success response.

**Source:** `app/Hooks/Cart/WebCheckoutHandler.php:683`

**Parameters:**

- `$data` (array): The response data
    ```php
    $data = [
        'cart' => $cart,  // The updated Cart model instance
    ];
    ```

**Returns:**
- `array` — The modified response data array

**Usage:**
```php
add_filter('fluent_cart/checkout/cart_updated', function ($data) {
    $cart = $data['cart'];
    $data['item_count'] = count($cart->getItems());
    $data['free_shipping_eligible'] = $cart->getEstimatedTotal() >= 5000;
    return $data;
});
```
</details>

### <code> checkout/before_patch_checkout_data </code>
<details>
<summary><code>fluent_cart/checkout/before_patch_checkout_data</code> &mdash; Modify fill data before patching the checkout session</summary>

**When it runs:**
This filter fires before the checkout session data is persisted to the database. Modules like Shipping and Tax hook in to recalculate charges whenever address or form data changes.

**Source:**
- `app/Hooks/Cart/WebCheckoutHandler.php:791`
- `app/Hooks/Cart/WebCheckoutHandler.php:967`

**Parameters:**

- `$fillData` (array): The data to be merged into the cart's checkout session
    ```php
    $fillData = [
        'checkout_data' => [...],   // Checkout data to persist
        'cart_data'     => [...],   // Cart data updates
        'hook_changes'  => [
            'shipping' => false,    // Whether shipping was recalculated
            'tax'      => false,    // Whether tax was recalculated
        ],
    ];
    ```
- `$data` (array): Context data
    ```php
    $data = [
        'cart'      => $cart,           // Cart model instance
        'prev_data' => $prevFlatData,   // Previous checkout data
        'changes'   => $normalizeData,  // The incoming changes
        'all_data'  => $allData,        // All submitted data
    ];
    ```

**Returns:**
- `array` — The modified fill data

**Usage:**
```php
add_filter('fluent_cart/checkout/before_patch_checkout_data', function ($fillData, $data) {
    $cart = $data['cart'];
    $changes = $data['changes'];

    // Recalculate a custom surcharge when the country changes
    if (isset($changes['billing_country'])) {
        $surcharge = MyModule::calculateSurcharge($changes['billing_country']);
        $fillData['checkout_data']['custom_surcharge'] = $surcharge;
        $fillData['hook_changes']['custom'] = true;
    }

    return $fillData;
}, 10, 2);
```
</details>

### <code> checkout/after_patch_checkout_data_fragments </code>
<details>
<summary><code>fluent_cart/checkout/after_patch_checkout_data_fragments</code> &mdash; Modify HTML fragments returned after patching checkout data</summary>

**When it runs:**
This filter fires after the checkout session has been patched and the HTML fragments for the AJAX response have been generated. It allows modules to add or modify the HTML fragments that will be swapped into the checkout page.

**Source:** `app/Hooks/Cart/WebCheckoutHandler.php:901`

**Parameters:**

- `$fragments` (array): Associative array of HTML fragment selectors and content
- `$data` (array): Context data
    ```php
    $data = [
        'cart'    => $cart,           // Cart model instance
        'changes' => $normalizeData,  // The changes that were applied
    ];
    ```

**Returns:**
- `array` — The modified fragments array

**Usage:**
```php
add_filter('fluent_cart/checkout/after_patch_checkout_data_fragments', function ($fragments, $data) {
    $cart = $data['cart'];

    // Add a custom fragment for a surcharge display
    $fragments['.custom-surcharge-display'] = [
        'content' => '<span class="custom-surcharge">' . esc_html('$5.00') . '</span>',
        'type'    => 'replace',
    ];

    return $fragments;
}, 10, 2);
```
</details>

### <code> apply_order_bump </code>
<details>
<summary><code>fluent_cart/apply_order_bump</code> &mdash; Handle order bump application on the checkout page</summary>

**When it runs:**
This filter fires when a customer toggles an order bump on the checkout page. By default it returns a `WP_Error`; modules that implement order bumps must hook in to handle the logic and return success data.

**Source:** `app/Hooks/Cart/WebCheckoutHandler.php:1144`

**Parameters:**

- `$response` (WP_Error): Default error response
- `$data` (array): Context data
    ```php
    $data = [
        'bump_id'      => 5,             // The order bump ID
        'cart'         => $cart,          // Cart model instance
        'request_data' => $requestData,   // The full request data
    ];
    ```

**Returns:**
- `array|WP_Error` — Return an array with success data to apply the bump, or a `WP_Error` to reject it

**Usage:**
```php
add_filter('fluent_cart/apply_order_bump', function ($response, $data) {
    $bumpId = $data['bump_id'];
    $cart = $data['cart'];

    $bump = MyOrderBumpModule::find($bumpId);
    if (!$bump) {
        return $response; // Keep the WP_Error
    }

    // Apply the bump to the cart
    $cart->addItem($bump->variation_id, 1);

    return [
        'message' => __('Order bump applied!', 'fluent-cart'),
        'cart'    => $cart,
    ];
}, 10, 2);
```
</details>

---

## Checkout Field Schema

### <code> checkout_address_fields </code>
<details>
<summary><code>fluent_cart/checkout_address_fields</code> &mdash; Modify address field definitions</summary>

**When it runs:**
This filter fires when the address field schema is built inside `CartCheckoutHelper`. It controls which fields appear in both billing and shipping address sections.

**Source:** `app/Helpers/CartCheckoutHelper.php:692`

**Parameters:**

- `$fields` (array): Associative array of address field definitions

**Returns:**
- `array` — The modified fields array

**Usage:**
```php
add_filter('fluent_cart/checkout_address_fields', function ($fields) {
    // Add a company field
    $fields['company'] = [
        'label'    => __('Company Name', 'fluent-cart'),
        'type'     => 'text',
        'required' => false,
    ];

    return $fields;
});
```
</details>

### <code> checkout_billing_fields </code>
<details>
<summary><code>fluent_cart/checkout_billing_fields</code> &mdash; Modify billing address field schema</summary>

**When it runs:**
This filter fires when the billing fields are being assembled in `CartCheckoutHelper`. It runs after address fields have been merged with account creation options and section labels.

**Source:** `app/Helpers/CartCheckoutHelper.php:730`

**Parameters:**

- `$fields` (array): The billing field definitions organized in sections
- `$data` (array): Context data
    ```php
    $data = [
        'viewData'         => $viewData,   // Block/view configuration data
        'customer'         => $customer,   // Current customer (or null)
        'labels'           => $labels,     // Custom labels from block settings
        'has_subscription' => false,       // Whether the cart has subscription items
    ];
    ```

**Returns:**
- `array` — The modified billing fields array

**Usage:**
```php
add_filter('fluent_cart/checkout_billing_fields', function ($fields, $data) {
    // Make the phone field required when cart has subscriptions
    if ($data['has_subscription']) {
        if (isset($fields['address_section']['schema']['billing_phone'])) {
            $fields['address_section']['schema']['billing_phone']['required'] = 'yes';
        }
    }

    return $fields;
}, 10, 2);
```
</details>

### <code> checkout_shipping_fields </code>
<details>
<summary><code>fluent_cart/checkout_shipping_fields</code> &mdash; Modify shipping address field schema</summary>

**When it runs:**
This filter fires when the shipping address fields are being assembled in `CartCheckoutHelper`.

**Source:** `app/Helpers/CartCheckoutHelper.php:771`

**Parameters:**

- `$fields` (array): The shipping field definitions organized in sections
- `$data` (array): Context data
    ```php
    $data = [
        'viewData' => $viewData,  // Block/view configuration data
        'labels'   => $labels,    // Custom labels from block settings
    ];
    ```

**Returns:**
- `array` — The modified shipping fields array

**Usage:**
```php
add_filter('fluent_cart/checkout_shipping_fields', function ($fields, $data) {
    // Remove address line 2 from shipping
    if (isset($fields['address_section']['schema']['shipping_address_2'])) {
        unset($fields['address_section']['schema']['shipping_address_2']);
    }

    return $fields;
}, 10, 2);
```
</details>

### <code> checkout_signup_fields </code>
<details>
<summary><code>fluent_cart/checkout_signup_fields</code> &mdash; Modify the account signup form fields</summary>

**When it runs:**
This filter fires when the guest checkout signup form fields (username, email, password) are assembled.

**Source:** `app/Helpers/CartCheckoutHelper.php:846`

**Parameters:**

- `$fields` (array): Associative array of signup field definitions
    ```php
    $fields = [
        'user_login' => [
            'type'     => 'text',
            'label'    => 'Username or Email',
            'required' => 'yes',
            ...
        ],
        'user_pass' => [
            'type'     => 'password',
            'label'    => 'Password',
            'required' => 'no',
            ...
        ],
    ];
    ```

**Returns:**
- `array` — The modified signup fields array

**Usage:**
```php
add_filter('fluent_cart/checkout_signup_fields', function ($fields) {
    // Make password required
    if (isset($fields['user_pass'])) {
        $fields['user_pass']['required'] = 'yes';
    }

    return $fields;
});
```
</details>

### <code> checkout_login_fields </code>
<details>
<summary><code>fluent_cart/checkout_login_fields</code> &mdash; Modify the checkout login form fields</summary>

**When it runs:**
This filter fires when the login form fields (username, password) are assembled for the checkout page.

**Source:** `app/Helpers/CartCheckoutHelper.php:872`

**Parameters:**

- `$fields` (array): Associative array of login field definitions
    ```php
    $fields = [
        'user_login' => [
            'type'     => 'text',
            'label'    => 'Username or Email',
            'required' => 'yes',
            ...
        ],
        'user_pass' => [
            'type'     => 'password',
            'label'    => 'Password',
            'required' => 'yes',
            ...
        ],
    ];
    ```

**Returns:**
- `array` — The modified login fields array

**Usage:**
```php
add_filter('fluent_cart/checkout_login_fields', function ($fields) {
    // Change the username label
    if (isset($fields['user_login'])) {
        $fields['user_login']['label'] = __('Email Address', 'fluent-cart');
        $fields['user_login']['placeholder'] = __('Enter your email', 'fluent-cart');
    }

    return $fields;
});
```
</details>

### <code> checkout_coupon_fields </code>
<details>
<summary><code>fluent_cart/checkout_coupon_fields</code> &mdash; Modify the coupon input fields</summary>

**When it runs:**
This filter fires when the coupon code input fields are assembled for the checkout page.

**Source:** `app/Helpers/CartCheckoutHelper.php:925`

**Parameters:**

- `$fields` (array): Associative array of coupon field definitions (typically includes a coupon code input and a hidden applied-coupons field)

**Returns:**
- `array` — The modified coupon fields array

**Usage:**
```php
add_filter('fluent_cart/checkout_coupon_fields', function ($fields) {
    // Customize the coupon input placeholder
    if (isset($fields['coupon_code'])) {
        $fields['coupon_code']['placeholder'] = __('Got a discount code?', 'fluent-cart');
    }

    return $fields;
});
```
</details>

### <code> checkout_page_name_fields_schema </code>
<details>
<summary><code>fluent_cart/checkout_page_name_fields_schema</code> &mdash; Modify name fields on the checkout page</summary>

**When it runs:**
This filter fires when the checkout name fields schema (first name, last name, email, and optionally company) is being built. Modules like FluentCRM hook in to pre-fill name and email from CRM contact data.

**Source:** `app/Services/Renderer/CheckoutFieldsSchema.php:86`

**Parameters:**

- `$nameFields` (array): Associative array of name/email field definitions
- `$data` (array): Context data
    ```php
    $data = [
        'cart'  => $cart,     // Cart model instance (may be null)
        'scope' => 'billing', // Field scope (billing or shipping)
    ];
    ```

**Returns:**
- `array` — The modified name fields array

**Usage:**
```php
add_filter('fluent_cart/checkout_page_name_fields_schema', function ($fields, $data) {
    // Pre-fill from logged-in user
    if ($userId = get_current_user_id()) {
        $user = get_userdata($userId);
        if (!empty($fields['billing_email']) && empty($fields['billing_email']['value'])) {
            $fields['billing_email']['value'] = $user->user_email;
        }
    }

    return $fields;
}, 10, 2);
```
</details>

### <code> fields/address_base_fields </code>
<details>
<summary><code>fluent_cart/fields/address_base_fields</code> &mdash; Modify base address field definitions</summary>

**When it runs:**
This filter fires when the low-level address field definitions are assembled in `CheckoutFieldsSchema`. These are the raw field configurations (country, state, city, zip, address lines) that form the foundation for both billing and shipping sections.

**Source:** `app/Services/Renderer/CheckoutFieldsSchema.php:320`

**Parameters:**

- `$fields` (array): Array of base address field definitions
- `$data` (array): Context data
    ```php
    $data = [
        'config'       => $config,          // Address field configuration
        'scope'        => 'billing',        // Field scope (billing or shipping)
        'requirements' => $requireFields,   // Required field requirements
    ];
    ```

**Returns:**
- `array` — The modified base address fields array

**Usage:**
```php
add_filter('fluent_cart/fields/address_base_fields', function ($fields, $data) {
    // Make the city field optional for billing
    if ($data['scope'] === 'billing') {
        foreach ($fields as &$field) {
            if (isset($field['name']) && $field['name'] === 'billing_city') {
                unset($field['required']);
            }
        }
    }

    return $fields;
}, 10, 2);
```
</details>

### <code> default_billing_country_for_checkout </code>
<details>
<summary><code>fluent_cart/default_billing_country_for_checkout</code> &mdash; Set the default billing country</summary>

**When it runs:**
This filter fires when determining the default billing country for the checkout form. By default, it attempts to read the country from the Cloudflare `HTTP_CF_IPCOUNTRY` header for geo-detection.

**Source:** `app/Helpers/AddressHelper.php:639`

**Parameters:**

- `$countryCode` (string): The detected country code (ISO 3166-1 alpha-2), or an empty string if not detected

**Returns:**
- `string` — A valid ISO 3166-1 alpha-2 country code

**Usage:**
```php
add_filter('fluent_cart/default_billing_country_for_checkout', function ($countryCode) {
    // Default to US if no country was detected
    if (empty($countryCode)) {
        return 'US';
    }

    return $countryCode;
});
```
</details>

---

## Checkout Localization

### <code> checkout/localize_data </code>
<details>
<summary><code>fluent_cart/checkout/localize_data</code> &mdash; Modify checkout JavaScript localized data</summary>

**When it runs:**
This filter fires when the checkout page assets are being enqueued. It allows modules to add or modify the data that is passed to the checkout JavaScript via `wp_localize_script()`. Modules like Turnstile hook in to add their client-side configuration.

**Source:** `app/Modules/Templating/AssetLoader.php:497`

**Parameters:**

- `$data` (array): The localized data array
    ```php
    $data = [
        'fluentcart_checkout_vars' => [
            'rest'                => [...],   // REST API info
            'ajaxurl'             => '...',   // Admin AJAX URL
            'is_all_digital'      => false,   // Whether cart is digital-only
            'is_cart_locked'      => 'no',    // Cart lock state
            'disable_coupons'     => 'no',    // Coupon toggle
            'tax_settings'        => [...],   // Tax configuration
            'cart_hash'           => '...',   // Cart hash
            'is_instant_checkout' => false,   // Instant checkout flag
            'redirect_url'        => '...',   // Checkout page URL
            'store_country'       => 'US',    // Store country
            'is_zero_payment'     => 'no',    // Zero total flag
            // ...and more
        ],
    ];
    ```
- `$cart` ([Cart](/database/models/cart)): The Cart model instance

**Returns:**
- `array` — The modified localized data array

**Usage:**
```php
add_filter('fluent_cart/checkout/localize_data', function ($data, $cart) {
    // Add custom JS configuration
    $data['fluentcart_checkout_vars']['my_module'] = [
        'enabled'  => true,
        'endpoint' => rest_url('my-module/v1/validate'),
    ];

    return $data;
}, 10, 2);
```
</details>

### <code> payment_methods_with_custom_checkout_buttons </code>
<details>
<summary><code>fluent_cart/payment_methods_with_custom_checkout_buttons</code> &mdash; Register payment methods that use custom checkout buttons</summary>

**When it runs:**
This filter fires when building the checkout localized data. Payment gateways that render their own submit button (like PayPal's smart buttons) register themselves here so the default "Place Order" button behavior is adapted accordingly.

**Source:** `app/Modules/Templating/AssetLoader.php:465`

**Parameters:**

- `$methods` (array): Array of payment method route slugs that have custom buttons. Default: `[]`

**Returns:**
- `array` — The modified array of payment method route slugs

**Usage:**
```php
add_filter('fluent_cart/payment_methods_with_custom_checkout_buttons', function ($methods) {
    // Register my custom gateway as having its own button
    $methods[] = 'my_custom_gateway';
    return $methods;
});
```
</details>

### <code> instant_checkout/allowed_redirect_hosts </code>
<details>
<summary><code>fluent_cart/instant_checkout/allowed_redirect_hosts</code> &mdash; Control allowed redirect hosts for instant checkout</summary>

**When it runs:**
This filter fires during the instant checkout (add-to-cart via URL) flow when a `redirect_to` parameter is provided. For security, only URLs whose hosts are in the allowed list will be accepted as redirect targets.

**Source:** `app/Http/Routes/WebRoutes.php:155`

**Parameters:**

- `$allowedHosts` (array): Array of allowed hostnames. Default: the current site's host.
    ```php
    $allowedHosts = [
        'example.com',  // parse_url(home_url(), PHP_URL_HOST)
    ];
    ```
- `$data` (array): Context data
    ```php
    $data = [
        'allowed_hosts' => $allowedHosts,
    ];
    ```

**Returns:**
- `array` — Array of allowed redirect hostnames

**Usage:**
```php
add_filter('fluent_cart/instant_checkout/allowed_redirect_hosts', function ($hosts) {
    // Allow redirects to a subdomain
    $hosts[] = 'shop.example.com';
    $hosts[] = 'members.example.com';
    return $hosts;
});
```
</details>

---
