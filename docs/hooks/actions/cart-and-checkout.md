# Cart & Checkout

All hooks related to the shopping flow — from adding items to the [Cart](/database/models/cart) through checkout rendering and the receipt/thank-you page.

## Cart Events

---

### <code> item_added </code>
<details open>
<summary><code>fluent_cart/cart/item_added</code> &mdash; Fired after an item is added to the cart</summary>

**When it runs:**
This action fires immediately after a product item has been successfully added to the [Cart](/database/models/cart) model and saved to the database. It runs before the `cart_data_items_updated` hook with the `item_added` scope.

**Parameters:**

- `$data` (array): Cart and item data
    ```php
    $data = [
        'cart' => $cart,   // \FluentCart\App\Models\Cart instance
        'item' => $item,   // array — the cart item that was just added
    ];
    ```

**Source:** `app/Models/Cart.php`

**Usage:**
```php
add_action('fluent_cart/cart/item_added', function ($data) {
    $cart = $data['cart'];
    $item = $data['item'];

    // Log the added product for analytics
    error_log('Product ' . $item['post_id'] . ' added to cart #' . $cart->id);
}, 10, 1);
```
</details>

### <code> item_removed </code>
<details>
<summary><code>fluent_cart/cart/item_removed</code> &mdash; Fired after an item is removed from the cart</summary>

**When it runs:**
This action fires after a product item has been removed from the [Cart](/database/models/cart) and saved, but only when the `$triggerEvent` parameter is `true` (the default). When an item is removed silently (e.g., during a replacement operation), this hook does not fire.

**Parameters:**

- `$data` (array): Cart and removal context
    ```php
    $data = [
        'cart'         => $cart,          // \FluentCart\App\Models\Cart instance
        'variation_id' => $variationId,   // int — the variation ID that was removed
        'extra_args'   => $extraArgs,     // array — additional matching arguments
        'removed_item' => $removingItem,  // array — the full cart item that was removed
    ];
    ```

**Source:** `app/Models/Cart.php`

**Usage:**
```php
add_action('fluent_cart/cart/item_removed', function ($data) {
    $removedItem = $data['removed_item'];
    $cart = $data['cart'];

    // Track removal for abandoned cart analytics
    do_action('my_plugin/track_cart_removal', [
        'variation_id' => $data['variation_id'],
        'product_id'   => $removedItem['post_id'] ?? null,
        'cart_id'      => $cart->id,
    ]);
}, 10, 1);
```
</details>

### <code> cart_data_items_updated </code>
<details>
<summary><code>fluent_cart/cart/cart_data_items_updated</code> &mdash; General-purpose hook for any cart data change</summary>

**When it runs:**
This action fires whenever the cart data array is modified. The `scope` field tells you what operation triggered the update. It fires on item add, item remove, coupon apply, coupon remove, discount recalculation, and checkout page loading.

**Parameters:**

- `$data` (array): Cart and scope context
    ```php
    $data = [
        'cart'       => $cart,        // \FluentCart\App\Models\Cart instance
        'scope'      => 'item_added', // string — one of the scope values below
        'scope_data' => $scopeData,   // mixed — context data depending on scope
    ];
    ```

    Possible `scope` values and their `scope_data`:
    | scope | scope_data |
    |---|---|
    | `'item_added'` | The cart item array that was added |
    | `'item_removed'` | The variation ID (int) that was removed |
    | `'discounts_recalculated'` | Array of applied coupon codes |
    | `'remove_coupon'` | Array of coupon codes that were removed |
    | `'apply_coupons'` | Array of coupon codes that were applied |
    | `'loading'` | Empty string (fired on checkout page load) |

**Source:** `app/Models/Cart.php`, `app/Hooks/Handlers/ShortCodes/Checkout/CheckoutPageHandler.php`

**Usage:**
```php
add_action('fluent_cart/cart/cart_data_items_updated', function ($data) {
    $cart = $data['cart'];
    $scope = $data['scope'];

    if ($scope === 'item_added' || $scope === 'item_removed') {
        // Recalculate custom surcharges whenever items change
        my_plugin_recalculate_surcharges($cart);
    }

    if ($scope === 'apply_coupons') {
        // Log coupon usage
        error_log('Coupons applied to cart #' . $cart->id . ': ' . implode(', ', $data['scope_data']));
    }
}, 10, 1);
```
</details>

### <code> cart_completed </code>
<details>
<summary><code>fluent_cart/cart_completed</code> &mdash; Fired when a cart is marked as completed after payment</summary>

**When it runs:**
This action fires when the cart's stage is set to `completed` after a successful [Order](/database/models/order) payment. The cart's `completed_at` timestamp has already been saved at this point. This is triggered inside `StatusHelper` during order status transitions when payment is marked as paid.

**Parameters:**

- `$data` (array): Completed cart and associated order
    ```php
    $data = [
        'cart'  => $relatedCart,  // \FluentCart\App\Models\Cart instance (stage = 'completed')
        'order' => $order,        // \FluentCart\App\Models\Order instance
    ];
    ```

**Source:** `app/Helpers/StatusHelper.php`

**Usage:**
```php
add_action('fluent_cart/cart_completed', function ($data) {
    $cart = $data['cart'];
    $order = $data['order'];

    // Fire a conversion pixel or sync to analytics
    my_plugin_track_conversion([
        'order_id'    => $order->id,
        'total'       => $order->total_amount,
        'customer_id' => $order->customer_id,
    ]);
}, 10, 1);
```
</details>

---

## Checkout Data Events

---

### <code> prepare_other_data </code>
<details>
<summary><code>fluent_cart/checkout/prepare_other_data</code> &mdash; After order creation, before finalizing</summary>

**When it runs:**
This action fires during the checkout submission flow, after the draft [Order](/database/models/order) has been created but before it is finalized (before addresses and items are attached). This gives modules a chance to attach additional data to the order.

**Parameters:**

- `$data` (array): Full checkout context
    ```php
    $data = [
        'cart'           => $cart,           // \FluentCart\App\Models\Cart instance
        'order'          => $createdOrder,   // \FluentCart\App\Models\Order — the newly created draft order
        'prev_order'     => $prevOrder,      // \FluentCart\App\Models\Order|null — previous order if retrying
        'request_data'   => $data,           // array — raw validated request data from checkout form
        'validated_data' => $validatedData,  // array — sanitized/validated checkout field values
    ];
    ```

**Source:** `api/Checkout/CheckoutApi.php`

**Usage:**
```php
add_action('fluent_cart/checkout/prepare_other_data', function ($data) {
    $order = $data['order'];
    $requestData = $data['request_data'];

    // Attach custom metadata to the order before it finalizes
    $customField = sanitize_text_field($requestData['custom_gift_message'] ?? '');
    if ($customField) {
        $order->updateMeta('gift_message', $customField);
    }
}, 10, 1);
```
</details>

### <code> cart_amount_updated </code>
<details>
<summary><code>fluent_cart/checkout/cart_amount_updated</code> &mdash; Fired when the cart total may have changed</summary>

**When it runs:**
This action fires whenever an operation changes (or may change) the cart total. This includes: item removal (silent mode), coupon application, coupon removal, discount recalculation, quantity updates, order bump toggles, and tax recalculations. Use this hook to react to price changes regardless of the specific cause.

**Parameters:**

- `$data` (array): The affected cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Models/Cart.php`, `app/Hooks/Cart/WebCheckoutHandler.php`, `app/Modules/Tax/TaxModule.php`

**Usage:**
```php
add_action('fluent_cart/checkout/cart_amount_updated', function ($data) {
    $cart = $data['cart'];

    // Recalculate a custom fee based on the new cart total
    $estimatedTotal = $cart->getEstimatedTotal();
    if ($estimatedTotal > 10000) { // over $100.00
        // Apply free shipping threshold logic
        my_plugin_apply_free_shipping($cart);
    }
}, 10, 1);
```
</details>

### <code> shipping_data_changed </code>
<details>
<summary><code>fluent_cart/checkout/shipping_data_changed</code> &mdash; Fired when shipping data changes</summary>

**When it runs:**
This action fires when shipping-related data on the cart changes, such as when a new shipping method is selected, the shipping charge changes, or the shipping address is updated in a way that affects shipping calculations.

**Parameters:**

- `$data` (array): The affected cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Helpers/CartHelper.php`, `app/Hooks/Cart/WebCheckoutHandler.php`

**Usage:**
```php
add_action('fluent_cart/checkout/shipping_data_changed', function ($data) {
    $cart = $data['cart'];
    $shippingData = $cart->checkout_data['shipping_data'] ?? [];

    // Log shipping method selection for analytics
    error_log('Cart #' . $cart->id . ' shipping method: ' . ($shippingData['shipping_method_id'] ?? 'none'));
}, 10, 1);
```
</details>

### <code> form_data_changed </code>
<details>
<summary><code>fluent_cart/checkout/form_data_changed</code> &mdash; Fired when checkout form data changes</summary>

**When it runs:**
This action fires when the checkout form data is updated via AJAX, such as when a customer changes their address, toggles "ship to different address", or any form field is updated that triggers a server-side recalculation.

**Parameters:**

- `$data` (array): The affected cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Hooks/Cart/WebCheckoutHandler.php`

**Usage:**
```php
add_action('fluent_cart/checkout/form_data_changed', function ($data) {
    $cart = $data['cart'];
    $formData = $cart->checkout_data['form_data'] ?? [];

    // Check if the billing country requires special handling
    $billingCountry = $formData['billing_country'] ?? '';
    if (in_array($billingCountry, ['BR', 'IN'])) {
        // Add country-specific checkout notices
        my_plugin_add_country_notice($cart, $billingCountry);
    }
}, 10, 1);
```
</details>

### <code> customer_data_saved </code>
<details>
<summary><code>fluent_cart/checkout/customer_data_saved</code> &mdash; Fired when customer checkout data is saved</summary>

**When it runs:**
This action fires when a specific piece of customer data is saved during the checkout process. The hook provides both the old and new values, making it useful for detecting changes. It fires after the data has already been persisted to the cart model.

**Parameters:**

- `$data` (array): Customer data change context
    ```php
    $data = [
        'cart'      => $cart,            // \FluentCart\App\Models\Cart instance
        'key'       => $key,             // string — the data key that changed (e.g. 'billing_country')
        'value'     => $value,           // mixed — the new value
        'old_value' => $prevValue,       // mixed — the previous value
        'old_data'  => $oldCheckoutData, // array — the full previous checkout_data array
    ];
    ```

**Source:** `app/Hooks/Cart/WebCheckoutHandler.php`

**Usage:**
```php
add_action('fluent_cart/checkout/customer_data_saved', function ($data) {
    $cart = $data['cart'];
    $key = $data['key'];

    // React to billing country changes for tax recalculation
    if ($key === 'billing_country' && $data['value'] !== $data['old_value']) {
        error_log('Cart #' . $cart->id . ' billing country changed from '
            . $data['old_value'] . ' to ' . $data['value']);
    }
}, 10, 1);
```
</details>

### <code> tax_data_changed </code>
<details>
<summary><code>fluent_cart/checkout/tax_data_changed</code> &mdash; Fired when tax-relevant data changes</summary>

**When it runs:**
This action fires when customer data changes in a way that could affect tax calculations (e.g., billing country, state, or VAT number changes). It is dispatched from within the `customer_data_saved` listener and shares the same parameter structure.

**Parameters:**

- `$data` (array): Same structure as `customer_data_saved`
    ```php
    $data = [
        'cart'      => $cart,            // \FluentCart\App\Models\Cart instance
        'key'       => $key,             // string — the data key that changed
        'value'     => $value,           // mixed — the new value
        'old_value' => $prevValue,       // mixed — the previous value
        'old_data'  => $oldCheckoutData, // array — the full previous checkout_data array
    ];
    ```

**Source:** `app/Hooks/Cart/WebCheckoutHandler.php`

**Usage:**
```php
add_action('fluent_cart/checkout/tax_data_changed', function ($data) {
    $cart = $data['cart'];

    // Trigger a third-party tax service recalculation
    my_tax_service_recalculate($cart);
}, 10, 1);
```
</details>

---

## Checkout Page Rendering

All hooks in this section fire during server-side HTML rendering of the checkout page. They use output buffering, so you should **echo** (not return) any custom HTML you want to inject.

---

### <code> before_checkout_page_start </code>
<details>
<summary><code>fluent_cart/before_checkout_page_start</code> &mdash; Before the checkout page wrapper div</summary>

**When it runs:**
This action fires immediately before the main checkout page `<div>` wrapper is opened. Use it to output HTML or scripts that should appear above the entire checkout page.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/before_checkout_page_start', function ($data) {
    $cart = $data['cart'];
    echo '<div class="my-checkout-banner">';
    echo '<p>Free shipping on orders over $50!</p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> afrer_checkout_page_start </code>
<details>
<summary><code>fluent_cart/afrer_checkout_page_start</code> &mdash; After the checkout page wrapper div opens</summary>

**When it runs:**
This action fires right after the main checkout page `<div>` wrapper opens. Note the typo in the hook name (`afrer` instead of `after`) — this matches the actual hook name in the source code and must be used as-is.

> **Deprecated since 1.4.0.** Use `fluent_cart/after_checkout_page_start` instead. The typo'd name still works but triggers a deprecation notice when `WP_DEBUG` is enabled.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/afrer_checkout_page_start', function ($data) {
    $cart = $data['cart'];
    // Insert a progress indicator at the top of the checkout page
    echo '<div class="my-checkout-progress-bar">Step 1 of 3: Checkout</div>';
}, 10, 1);
```
</details>

### <code> before_checkout_form </code>
<details>
<summary><code>fluent_cart/before_checkout_form</code> &mdash; Before the checkout form element</summary>

**When it runs:**
This action fires just before the `<form>` tag for the checkout form is rendered.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/before_checkout_form', function ($data) {
    echo '<div class="my-trust-badges">';
    echo '<img src="/wp-content/uploads/secure-checkout.svg" alt="Secure Checkout" />';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> checkout_form_opening </code>
<details>
<summary><code>fluent_cart/checkout_form_opening</code> &mdash; Right after the checkout form tag opens</summary>

**When it runs:**
This action fires immediately after the `<form>` tag opens, before any form fields are rendered. Use it to insert hidden fields, nonce fields, or other elements that must be inside the form.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/checkout_form_opening', function ($data) {
    // Add a hidden field for tracking
    echo '<input type="hidden" name="my_tracking_ref" value="' . esc_attr(my_get_tracking_ref()) . '" />';
}, 10, 1);
```
</details>

### <code> before_billing_fields </code>
<details>
<summary><code>fluent_cart/before_billing_fields</code> &mdash; Before billing address fields</summary>

**When it runs:**
This action fires after the name/email fields and the "create account" checkbox, but before the billing address fields section is rendered.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/before_billing_fields', function ($data) {
    echo '<p class="my-billing-note">Please enter your billing address exactly as it appears on your card statement.</p>';
}, 10, 1);
```
</details>

### <code> before_billing_fields_section </code>
<details>
<summary><code>fluent_cart/before_billing_fields_section</code> &mdash; Before the billing address field section renders</summary>

**When it runs:**
This action fires right before the billing address form section (with its heading and input fields) is rendered. It fires inside the `renderBillingAddressFields()` method, after billing field data has been prepared and filtered.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/before_billing_fields_section', function ($data) {
    echo '<div class="my-billing-section-intro">';
    echo '<h4>Where should we send the invoice?</h4>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> after_billing_fields_section </code>
<details>
<summary><code>fluent_cart/after_billing_fields_section</code> &mdash; After the billing address field section</summary>

**When it runs:**
This action fires after the billing address fields section and the "ship to different address" checkbox have been rendered. It only fires when the cart requires shipping.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/after_billing_fields_section', function ($data) {
    $cart = $data['cart'];
    // Add a note between billing and shipping sections
    echo '<div class="my-address-note">';
    echo '<p>Shipping is calculated based on your delivery address.</p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> before_shipping_fields_section </code>
<details>
<summary><code>fluent_cart/before_shipping_fields_section</code> &mdash; Before the shipping address field section</summary>

**When it runs:**
This action fires right before the shipping address form section is rendered. The shipping section may be hidden via CSS if "ship to different address" is not checked.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/before_shipping_fields_section', function ($data) {
    echo '<p class="my-shipping-note">Enter the address where you want us to deliver your order.</p>';
}, 10, 1);
```
</details>

### <code> after_shipping_fields_section </code>
<details>
<summary><code>fluent_cart/after_shipping_fields_section</code> &mdash; After the shipping address field section</summary>

**When it runs:**
This action fires immediately after the shipping address form section is rendered.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/after_shipping_fields_section', function ($data) {
    echo '<div class="my-delivery-estimate">';
    echo '<p>Estimated delivery: 3-5 business days</p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> before_payment_methods </code>
<details>
<summary><code>fluent_cart/before_payment_methods</code> &mdash; Before payment method options</summary>

**When it runs:**
This action fires before the payment methods section is rendered on the checkout page. It also fires in the modal checkout renderer and the Gutenberg block inner blocks renderer.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`, `app/Services/Renderer/ModalCheckoutRenderer.php`, `app/Hooks/Handlers/BlockEditors/Checkout/InnerBlocks/InnerBlocks.php`

**Usage:**
```php
add_action('fluent_cart/before_payment_methods', function ($data) {
    echo '<div class="my-payment-security-note">';
    echo '<p>All transactions are encrypted and secure.</p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> after_payment_methods </code>
<details>
<summary><code>fluent_cart/after_payment_methods</code> &mdash; After payment method options</summary>

**When it runs:**
This action fires after the payment methods section has been rendered, before the checkout submit button.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/after_payment_methods', function ($data) {
    echo '<div class="my-payment-icons">';
    echo '<img src="/wp-content/uploads/visa.svg" alt="Visa" />';
    echo '<img src="/wp-content/uploads/mastercard.svg" alt="Mastercard" />';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> after_checkout_button </code>
<details>
<summary><code>fluent_cart/after_checkout_button</code> &mdash; After the checkout submit button</summary>

**When it runs:**
This action fires immediately after the "Place order" submit button is rendered.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/after_checkout_button', function ($data) {
    echo '<p class="my-checkout-disclaimer">';
    echo 'By placing your order you agree to our <a href="/terms">Terms of Service</a>.';
    echo '</p>';
}, 10, 1);
```
</details>

### <code> after_order_notes </code>
<details>
<summary><code>fluent_cart/after_order_notes</code> &mdash; After the order notes section in the summary sidebar</summary>

**When it runs:**
This action fires after the order notes field in the checkout summary/sidebar section, inside the order summary wrapper.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/after_order_notes', function ($data) {
    echo '<div class="my-gift-wrap-option">';
    echo '<label><input type="checkbox" name="gift_wrap" value="yes" /> Add gift wrapping (+$5.00)</label>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> after_order_notes_field </code>
<details>
<summary><code>fluent_cart/after_order_notes_field</code> &mdash; After the order notes form field</summary>

**When it runs:**
This action fires right after the order notes textarea field is rendered, inside the `renderOrderNoteField()` method. Note that the order notes field only appears when the cart requires shipping (unless overridden by the `fluent_cart/disable_order_notes_for_digital_products` filter).

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/after_order_notes_field', function ($data) {
    echo '<p class="my-notes-hint"><em>Example: Leave package at the back door.</em></p>';
}, 10, 1);
```
</details>

### <code> after_checkout_form </code>
<details>
<summary><code>fluent_cart/after_checkout_form</code> &mdash; After the checkout form closes</summary>

**When it runs:**
This action fires immediately after the closing `</form>` tag of the checkout form.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/after_checkout_form', function ($data) {
    // Render a support chat widget below the form
    echo '<div class="my-checkout-support">';
    echo '<p>Need help? <a href="#" onclick="openChat()">Chat with us</a></p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> before_checkout_page_close </code>
<details>
<summary><code>fluent_cart/before_checkout_page_close</code> &mdash; Before the checkout page wrapper div closes</summary>

**When it runs:**
This action fires just before the closing `</div>` of the main checkout page wrapper.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/before_checkout_page_close', function ($data) {
    echo '<div class="my-checkout-footer-badges">';
    echo '<p>30-day money-back guarantee</p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> after_checkout_page </code>
<details>
<summary><code>fluent_cart/after_checkout_page</code> &mdash; After the entire checkout page wrapper</summary>

**When it runs:**
This action fires after the checkout page wrapper `</div>` has been closed. Use it for scripts, tracking pixels, or other content that should appear after the entire checkout page.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CheckoutRenderer.php`

**Usage:**
```php
add_action('fluent_cart/after_checkout_page', function ($data) {
    $cart = $data['cart'];
    // Output a tracking script after the checkout page
    echo '<script>myAnalytics.trackCheckoutView({ cartId: ' . intval($cart->id) . ' });</script>';
}, 10, 1);
```
</details>

### <code> before_summary_total </code>
<details>
<summary><code>fluent_cart/checkout/before_summary_total</code> &mdash; Before the total line in the cart summary</summary>

**When it runs:**
This action fires in the cart summary sidebar, after the subtotal, shipping, and discount lines but before the coupon input field and the final total line.

**Parameters:**

- `$data` (array): The current cart
    ```php
    $data = [
        'cart' => $cart,  // \FluentCart\App\Models\Cart instance
    ];
    ```

**Source:** `app/Services/Renderer/CartSummaryRender.php`

**Usage:**
```php
add_action('fluent_cart/checkout/before_summary_total', function ($data) {
    $cart = $data['cart'];
    // Add a custom fee line in the summary
    echo '<li class="my-custom-fee">';
    echo '<span class="fct_summary_label">Processing Fee</span>';
    echo '<span class="fct_summary_value">$2.50</span>';
    echo '</li>';
}, 10, 1);
```
</details>

---

## Cart Line Items Rendering

These hooks fire during the rendering of individual cart line items on the checkout page. They all receive the same parameter structure from `CartItemRenderer::getEventInfo()`, which includes [Cart](/database/models/cart), [Product](/database/models/product), and [ProductVariation](/database/models/product-variation) model instances. Use **echo** to output custom HTML.

---

### <code> line_meta </code>
<details>
<summary><code>fluent_cart/cart/line_item/line_meta</code> &mdash; After line item content, for custom metadata</summary>

**When it runs:**
This action fires after the main item content (title, variant info, child variants) inside the item info area, but before the price section. Use it to display custom per-item metadata such as personalization details or custom options.

**Parameters:**

- `$data` (array): Line item rendering context
    ```php
    $data = [
        'item'    => $item,     // array — the cart item data (post_id, title, quantity, unit_price, etc.)
        'cart'    => $cart,     // \FluentCart\App\Models\Cart|null instance
        'product' => $product,  // Product model or null
        'variant' => $variant,  // ProductVariation model or null
    ];
    ```

**Source:** `app/Services/Renderer/CartItemRenderer.php`

**Usage:**
```php
add_action('fluent_cart/cart/line_item/line_meta', function ($data) {
    $item = $data['item'];

    // Display custom engraving text if present
    $engraving = $item['custom_fields']['engraving'] ?? '';
    if ($engraving) {
        echo '<div class="my-engraving-preview">';
        echo '<small>Engraving: ' . esc_html($engraving) . '</small>';
        echo '</div>';
    }
}, 10, 1);
```
</details>

### <code> before_total </code>
<details>
<summary><code>fluent_cart/cart/line_item/before_total</code> &mdash; Before the line item price/total</summary>

**When it runs:**
This action fires inside the price area of a cart line item, before the item total (and any promotional strikethrough price) is displayed.

**Parameters:**

- `$data` (array): Line item rendering context
    ```php
    $data = [
        'item'    => $item,     // array — the cart item data
        'cart'    => $cart,     // \FluentCart\App\Models\Cart|null instance
        'product' => $product,  // Product model or null
        'variant' => $variant,  // ProductVariation model or null
    ];
    ```

**Source:** `app/Services/Renderer/CartItemRenderer.php`

**Usage:**
```php
add_action('fluent_cart/cart/line_item/before_total', function ($data) {
    $item = $data['item'];
    $savings = ($item['other_info']['original_price'] ?? 0) - ($item['unit_price'] ?? 0);
    if ($savings > 0) {
        echo '<span class="my-savings-badge">You save ' . esc_html(\FluentCart\App\Helpers\Helper::toDecimal($savings)) . '</span>';
    }
}, 10, 1);
```
</details>

### <code> after_total </code>
<details>
<summary><code>fluent_cart/cart/line_item/after_total</code> &mdash; After the line item price/total</summary>

**When it runs:**
This action fires inside the price area of a cart line item, after the item total is displayed.

**Parameters:**

- `$data` (array): Line item rendering context
    ```php
    $data = [
        'item'    => $item,     // array — the cart item data
        'cart'    => $cart,     // \FluentCart\App\Models\Cart|null instance
        'product' => $product,  // Product model or null
        'variant' => $variant,  // ProductVariation model or null
    ];
    ```

**Source:** `app/Services/Renderer/CartItemRenderer.php`

**Usage:**
```php
add_action('fluent_cart/cart/line_item/after_total', function ($data) {
    $item = $data['item'];
    $paymentType = $item['other_info']['payment_type'] ?? '';
    if ($paymentType === 'subscription') {
        echo '<span class="my-recurring-label"><small>Recurring</small></span>';
    }
}, 10, 1);
```
</details>

### <code> before_main_title </code>
<details>
<summary><code>fluent_cart/cart/line_item/before_main_title</code> &mdash; Before the product title in a line item</summary>

**When it runs:**
This action fires at the very beginning of the item title area, before the quantity badge, product name, and variant title.

**Parameters:**

- `$data` (array): Line item rendering context
    ```php
    $data = [
        'item'    => $item,     // array — the cart item data
        'cart'    => $cart,     // \FluentCart\App\Models\Cart|null instance
        'product' => $product,  // Product model or null
        'variant' => $variant,  // ProductVariation model or null
    ];
    ```

**Source:** `app/Services/Renderer/CartItemRenderer.php`

**Usage:**
```php
add_action('fluent_cart/cart/line_item/before_main_title', function ($data) {
    $item = $data['item'];
    // Add a "Sale" badge before the product title
    if (!empty($item['other_info']['is_on_sale'])) {
        echo '<span class="my-sale-badge">Sale</span>';
    }
}, 10, 1);
```
</details>

### <code> after_main_title </code>
<details>
<summary><code>fluent_cart/cart/line_item/after_main_title</code> &mdash; After the product title in a line item</summary>

**When it runs:**
This action fires at the end of the item title area, after the product name, variant title, and payment type information (subscription details / per-unit price).

**Parameters:**

- `$data` (array): Line item rendering context
    ```php
    $data = [
        'item'    => $item,     // array — the cart item data
        'cart'    => $cart,     // \FluentCart\App\Models\Cart|null instance
        'product' => $product,  // Product model or null
        'variant' => $variant,  // ProductVariation model or null
    ];
    ```

**Source:** `app/Services/Renderer/CartItemRenderer.php`

**Usage:**
```php
add_action('fluent_cart/cart/line_item/after_main_title', function ($data) {
    $item = $data['item'];
    // Show estimated delivery date per item
    $deliveryDays = $item['other_info']['delivery_days'] ?? null;
    if ($deliveryDays) {
        $date = date('M j', strtotime("+{$deliveryDays} days"));
        echo '<div class="my-delivery-estimate"><small>Est. delivery: ' . esc_html($date) . '</small></div>';
    }
}, 10, 1);
```
</details>

---

## Receipt / Thank You Page

These hooks fire during the rendering of the thank-you / receipt page shown after a successful checkout. The `$config` parameter passed to most hooks contains the [Order](/database/models/order) model instance along with view context. All rendering hooks use output buffering — use **echo** to inject custom HTML.

---

### <code> before_header </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/before_header</code> &mdash; Before the thank-you page header</summary>

**When it runs:**
This action fires at the very beginning of the thank-you page content, before the header section (which contains the success/pending icon and title).

**Parameters:**

- `$config` (array): Thank-you page configuration
    ```php
    $config = [
        'order'           => $order,           // \FluentCart\App\Models\Order instance
        'is_first_time'   => true|false,       // bool — whether this is the first view of this receipt
        'order_operation' => $orderOperation,  // mixed — order operation context or null
    ];
    ```

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/before_header', function ($config) {
    $order = $config['order'];
    echo '<div class="my-confetti-wrapper" data-order-id="' . intval($order->id) . '"></div>';
}, 10, 1);
```
</details>

### <code> after_header </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/after_header</code> &mdash; After the thank-you page header</summary>

**When it runs:**
This action fires after the header section (the success/pending icon and title) is fully rendered, before the body section begins.

**Parameters:**

- `$config` (array): Thank-you page configuration (same structure as `before_header`)

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/after_header', function ($config) {
    $order = $config['order'];
    if ($order->payment_status === 'paid') {
        echo '<div class="my-share-prompt">';
        echo '<p>Love your purchase? Share it with friends!</p>';
        echo '</div>';
    }
}, 10, 1);
```
</details>

### <code> after_header_title </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/after_header_title</code> &mdash; After the header title text</summary>

**When it runs:**
This action fires inside the header section, after the "Purchase Successful!" or "Payment Pending!" heading, but still within the header wrapper div. Use it to add a subtitle or additional context below the main title.

**Parameters:**

- `$config` (array): Thank-you page configuration (same structure as `before_header`)

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/after_header_title', function ($config) {
    $order = $config['order'];
    echo '<p class="my-order-ref">Order Reference: #' . esc_html($order->invoice_no) . '</p>';
}, 10, 1);
```
</details>

### <code> before_body </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/before_body</code> &mdash; Before the thank-you page body</summary>

**When it runs:**
This action fires after the header section and before the body section, which contains the order details, items, subscriptions, downloads, licenses, and addresses.

**Parameters:**

- `$config` (array): Thank-you page configuration (same structure as `before_header`)

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/before_body', function ($config) {
    echo '<div class="my-receipt-notice">';
    echo '<p>A confirmation email has been sent to your email address.</p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> after_body </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/after_body</code> &mdash; After the thank-you page body</summary>

**When it runs:**
This action fires after the body section (order details, items, addresses) is fully rendered, before the page wrapper closes.

**Parameters:**

- `$config` (array): Thank-you page configuration (same structure as `before_header`)

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/after_body', function ($config) {
    echo '<div class="my-upsell-section">';
    echo '<h3>You might also like</h3>';
    // Render recommended products
    echo '</div>';
}, 10, 1);
```
</details>

### <code> before_order_header </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/before_order_header</code> &mdash; Before the order header in the receipt body</summary>

**When it runs:**
This action fires inside the receipt body, before the order header area (which shows the customer greeting and order number).

**Parameters:**

- `$config` (array): Thank-you page configuration (same structure as `before_header`)

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/before_order_header', function ($config) {
    echo '<div class="my-receipt-date">';
    echo '<p>Order placed on: ' . esc_html(date('F j, Y')) . '</p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> after_order_header </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/after_order_header</code> &mdash; After the order header in the receipt body</summary>

**When it runs:**
This action fires after the order header (customer greeting, order number, and payment status message), before the tax information and order items.

**Parameters:**

- `$config` (array): Thank-you page configuration (same structure as `before_header`)

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/after_order_header', function ($config) {
    $order = $config['order'];
    if ($order->note) {
        echo '<div class="my-order-note">';
        echo '<strong>Your note:</strong> ' . esc_html($order->note);
        echo '</div>';
    }
}, 10, 1);
```
</details>

### <code> before_order_items </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/before_order_items</code> &mdash; Before the order items list in the receipt</summary>

**When it runs:**
This action fires after the store tax information and before the order items table is rendered.

**Parameters:**

- `$config` (array): Thank-you page configuration (same structure as `before_header`)

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/before_order_items', function ($config) {
    echo '<div class="my-items-intro"><h4>Here is what you ordered:</h4></div>';
}, 10, 1);
```
</details>

### <code> after_order_items </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/after_order_items</code> &mdash; After the order items list in the receipt</summary>

**When it runs:**
This action fires after the order items table (including the totals breakdown), before the subscription items, downloads, licenses, and address sections.

**Parameters:**

- `$config` (array): Thank-you page configuration (same structure as `before_header`)

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/after_order_items', function ($config) {
    $order = $config['order'];
    // Show a referral code after the items list
    echo '<div class="my-referral-block">';
    echo '<p>Share your referral code <strong>REF-' . intval($order->customer_id) . '</strong> and earn 10% credit!</p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> before_footer_buttons </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/before_footer_buttons</code> &mdash; Before the footer buttons</summary>

**When it runs:**
This action fires in the receipt footer area, before the "View Order" and "Download Receipt" buttons are rendered.

**Parameters:**

- `$config` (array): Thank-you page configuration (same structure as `before_header`)

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/before_footer_buttons', function ($config) {
    echo '<div class="my-footer-message">';
    echo '<p>Thank you for shopping with us!</p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> after_footer_buttons </code>
<details>
<summary><code>fluent_cart/receipt/thank_you/after_footer_buttons</code> &mdash; After the footer buttons</summary>

**When it runs:**
This action fires in the receipt footer area, after the "View Order" and "Download Receipt" buttons have been rendered.

**Parameters:**

- `$config` (array): Thank-you page configuration (same structure as `before_header`)

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`

**Usage:**
```php
add_action('fluent_cart/receipt/thank_you/after_footer_buttons', function ($config) {
    echo '<div class="my-social-share">';
    echo '<p>Follow us on social media for updates and exclusive offers.</p>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> after_receipt </code>
<details>
<summary><code>fluent_cart/after_receipt</code> &mdash; After the entire receipt/thank-you page</summary>

**When it runs:**
This action fires after the complete thank-you page has been rendered, including the footer. It fires on every receipt view (both first-time and returning visits). This hook is also present in the legacy `thank_you.php` view template.

**Parameters:**

- `$data` (array): Order and view context
    ```php
    $data = [
        'order'           => $order,           // \FluentCart\App\Models\Order instance
        'is_first_time'   => true|false,       // bool — whether this is the first view of this receipt
        'order_operation' => $orderOperation,  // mixed — order operation context or null
    ];
    ```

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`, `app/Views/invoice/thank_you.php`

**Usage:**
```php
add_action('fluent_cart/after_receipt', function ($data) {
    $order = $data['order'];

    // Render a customer satisfaction survey
    echo '<div class="my-survey-widget">';
    echo '<h4>How was your experience?</h4>';
    echo '<a href="/survey?order=' . intval($order->id) . '">Take a quick survey</a>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> after_receipt_first_time </code>
<details>
<summary><code>fluent_cart/after_receipt_first_time</code> &mdash; Only on the first receipt view (for conversion tracking)</summary>

**When it runs:**
This action fires only on the first time a customer views the receipt page after a purchase. It does not fire on subsequent visits to the same receipt URL. This is the ideal hook for firing conversion tracking pixels, analytics events, or affiliate postback URLs.

**Parameters:**

- `$data` (array): Order and operation context
    ```php
    $data = [
        'order'           => $order,           // \FluentCart\App\Models\Order instance
        'order_operation' => $orderOperation,  // mixed — order operation context or null
    ];
    ```

**Source:** `app/Services/Renderer/Receipt/ThankYouRender.php`, `app/Views/invoice/thank_you.php`

**Usage:**
```php
add_action('fluent_cart/after_receipt_first_time', function ($data) {
    $order = $data['order'];
    $total = \FluentCart\App\Helpers\Helper::toDecimal($order->total_amount);

    // Fire a conversion pixel only on first receipt view
    echo '<script>';
    echo 'fbq("track", "Purchase", { value: ' . esc_js($total) . ', currency: "' . esc_js($order->currency) . '" });';
    echo '</script>';

    // Google Ads conversion
    echo '<script>';
    echo 'gtag("event", "conversion", { send_to: "AW-XXXXX/YYYYY", value: ' . esc_js($total) . ', currency: "' . esc_js($order->currency) . '", transaction_id: "' . esc_js($order->invoice_no) . '" });';
    echo '</script>';
}, 10, 1);
```
</details>

### <code> before_render_redirect_page </code>
<details>
<summary><code>fluent_cart/before_render_redirect_page</code> &mdash; Before the payment redirect/receipt page renders</summary>

**When it runs:**
This action fires at the very beginning of the receipt shortcode handler, before any receipt or redirect page content is rendered. It provides the raw URL parameters used to identify the order and transaction. Use it for early validation, logging, or to set up resources needed by the receipt page.

**Parameters:**

- `$data` (array): URL parameters for the receipt/redirect
    ```php
    $data = [
        'order_hash' => $orderHash,       // string — the order UUID from the URL
        'trx_hash'   => $transactionHash, // string — the transaction hash from the URL
        'method'     => $method,          // string — the payment method slug
        'is_receipt' => $isReceipt,       // bool — true if this is a receipt page, false if redirect
    ];
    ```

**Source:** `app/Hooks/Handlers/ShortCodes/ReceiptHandler.php`

**Usage:**
```php
add_action('fluent_cart/before_render_redirect_page', function ($data) {
    // Log receipt page visits for debugging payment callbacks
    if ($data['is_receipt'] && $data['order_hash']) {
        error_log('Receipt page visited for order: ' . $data['order_hash']
            . ' via method: ' . $data['method']);
    }
}, 10, 1);
```
</details>
