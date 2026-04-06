# Products & Pricing

All filters related to [Product](/database/models/product) display, catalog management, pricing, stock, URLs, and [Coupon](/database/models/coupon)s.

---

## Product Display & Layout

### <code> products_list </code>

<details open>
<summary><code>fluent_cart/products_list</code> &mdash; Filter the admin products list</summary>

**When it runs:**
This filter is applied after fetching the paginated products collection in the admin products list view.

**Parameters:**

- `$products` (LengthAwarePaginator): The paginated products collection with appended `view_url` and `edit_url` attributes

**Returns:**
- `$products` (LengthAwarePaginator): The modified paginated collection

**Source:** `app/Http/Controllers/ProductController.php:52`

**Usage:**
```php
add_filter('fluent_cart/products_list', function($products) {
    // Modify the products collection before it is returned to the admin
    $products->getCollection()->transform(function ($product) {
        $product->custom_badge = 'Featured';
        return $product;
    });
    return $products;
}, 10, 1);
```
</details>

### <code> shop_query </code>
<details>
<summary><code>fluent_cart/shop_query</code> &mdash; Filter the shop product query builder</summary>

**When it runs:**
This filter is applied when building the query for the public-facing shop product listing, before search, status, and sorting clauses are added.

**Parameters:**

- `$query` (Builder): The Eloquent query builder instance with `select` and `with` already applied
- `$params` (array): The query parameters array
    ```php
    $params = [
        'select'               => '*',
        'with'                 => [],
        'admin_all_statuses'   => [],
        'selected_status'      => '',
        // ...additional request parameters
    ];
    ```

**Returns:**
- `$query` (Builder): The modified query builder

**Source:** `api/Resource/ShopResource.php:100`

**Usage:**
```php
add_filter('fluent_cart/shop_query', function($query, $params) {
    // Only show products from a specific category
    $query->whereHas('taxonomies', function ($q) {
        $q->where('taxonomy', 'product-category')
          ->where('term_id', 5);
    });
    return $query;
}, 10, 2);
```
</details>

### <code> single_product/variation_view_type </code>
<details>
<summary><code>fluent_cart/single_product/variation_view_type</code> &mdash; Filter the variation display type on single product pages</summary>

**When it runs:**
This filter is applied when initializing the product renderer to determine how variations are visually presented on the single product page.

**Parameters:**

- `$viewType` (string): The variation view type. Possible values: `'image'`, `'text'`, `'both'`
- `$data` (array): Context data
    ```php
    $data = [
        'product'            => $product,       // Product model
        'variants'           => $variants,       // Collection of variants
        'defaultVariationId' => $defaultVariationId // Default selected variation ID
    ];
    ```

**Returns:**
- `$viewType` (string): The modified view type

**Source:** `app/Services/Renderer/ProductRenderer.php:67`

**Usage:**
```php
add_filter('fluent_cart/single_product/variation_view_type', function($viewType, $data) {
    // Always show both image and text for variations
    return 'both';
}, 10, 2);
```
</details>

### <code> single_product/variation_column_type </code>
<details>
<summary><code>fluent_cart/single_product/variation_column_type</code> &mdash; Filter the variation column layout on single product pages</summary>

**When it runs:**
This filter is applied when initializing the product renderer to determine the column layout for product variations.

**Parameters:**

- `$columnType` (string): The column layout type. Possible values: `'one'`, `'two'`, `'three'`, `'four'`, `'masonry'`
- `$data` (array): Context data
    ```php
    $data = [
        'product'            => $product,       // Product model
        'variants'           => $variants,       // Collection of variants
        'defaultVariationId' => $defaultVariationId // Default selected variation ID
    ];
    ```

**Returns:**
- `$columnType` (string): The modified column type

**Source:** `app/Services/Renderer/ProductRenderer.php:74`

**Usage:**
```php
add_filter('fluent_cart/single_product/variation_column_type', function($columnType, $data) {
    $product = $data['product'];
    // Use two-column layout for products with many variations
    if (count($data['variants']) > 6) {
        return 'two';
    }
    return $columnType;
}, 10, 2);
```
</details>

### <code> single_product/variation_price </code>
<details>
<summary><code>fluent_cart/single_product/variation_price</code> &mdash; Filter the variation price text displayed on single product pages</summary>

**When it runs:**
This filter is applied when rendering the price text for each product variation. For one-time products the price is the formatted decimal amount; for subscriptions it includes the billing terms text.

**Parameters:**

- `$priceText` (string): The formatted price text (escaped HTML)
- `$data` (array): Context data
    ```php
    $data = [
        'product' => $product,   // Product model
        'variant' => $variant,   // ProductVariant model
        'scope'   => 'product_variant_price'
    ];
    ```

**Returns:**
- `$priceText` (string): The modified price text (HTML allowed via `wp_kses_post`)

**Source:** `app/Services/Renderer/ProductRenderer.php:827`

**Usage:**
```php
add_filter('fluent_cart/single_product/variation_price', function($priceText, $data) {
    $variant = $data['variant'];
    // Append a "per month" label for subscription variants
    if ($variant->payment_type === 'subscription') {
        return $priceText . ' <small>/month</small>';
    }
    return $priceText;
}, 10, 2);
```
</details>

### <code> shop_app_product_query_taxonomy_filters </code>
<details>
<summary><code>fluent_cart/shop_app_product_query_taxonomy_filters</code> &mdash; Filter taxonomy filters for the Shop block product query</summary>

**When it runs:**
This filter is applied in the Shop App Gutenberg block when merging URL-based taxonomy filters with default block filters, before the product query is executed.

**Parameters:**

- `$mergedTerms` (array): Merged taxonomy term IDs keyed by taxonomy name
    ```php
    $mergedTerms = [
        'product-category' => [1, 5, 12],
        'product-tag'      => [3, 7]
    ];
    ```
- `$data` (array): Context data
    ```php
    $data = [
        'default_terms'   => $defaultTerms,   // Terms from block settings
        'url_terms'       => $urlTerms,        // Terms from URL query parameters
        'url_filters'     => $urlFilters,      // Raw URL filter parameters
        'default_filters' => $defaultFilters,  // Raw block default filters
        'block'           => $block,           // Block instance
        'is_main_query'   => true|false        // Whether this is the main query
    ];
    ```

**Returns:**
- `$mergedTerms` (array): The modified taxonomy term IDs array

**Source:** `app/Hooks/Handlers/BlockEditors/ShopApp/InnerBlocks/InnerBlocks.php:1379`

**Usage:**
```php
add_filter('fluent_cart/shop_app_product_query_taxonomy_filters', function($mergedTerms, $data) {
    // Always exclude a specific category from shop listings
    if (isset($mergedTerms['product-category'])) {
        $mergedTerms['product-category'] = array_diff($mergedTerms['product-category'], [99]);
    }
    return $mergedTerms;
}, 10, 2);
```
</details>

### <code> products_views/preload_collection_{$provider} </code>
<details>
<summary><code>fluent_cart/products_views/preload_collection_{$provider}</code> &mdash; Preload product view collection for a template provider</summary>

**When it runs:**
This dynamic filter is applied when the shop controller loads products via AJAX for a specific template provider (e.g., `bricks`). The `{$provider}` portion is replaced with the template provider name from the request.

**Parameters:**

- `$html` (string): Default empty string. Return rendered HTML to use the preloaded view instead of JSON
- `$data` (array): Context data
    ```php
    $data = [
        'client_id'   => $clientId,    // Client identifier from the request
        'products'    => $products,     // Array of product data
        'total'       => $total,        // Total number of products
        'requestData' => $requestData   // Full request parameters
    ];
    ```

**Returns:**
- `$html` (string): Rendered HTML string, or empty string to fall back to default JSON response

**Source:** `app/Http/Controllers/ShopController.php:103`

**Usage:**
```php
add_filter('fluent_cart/products_views/preload_collection_bricks', function($html, $data) {
    // Return custom rendered HTML for Bricks page builder
    ob_start();
    foreach ($data['products'] as $product) {
        echo '<div class="custom-product-card">' . esc_html($product['title']) . '</div>';
    }
    return ob_get_clean();
}, 10, 2);
```
</details>

---

## Product Buttons & Text

### <code> product/buy_now_button_text </code>
<details>
<summary><code>fluent_cart/product/buy_now_button_text</code> &mdash; Filter the Buy Now button text</summary>

**When it runs:**
This filter is applied when rendering the "Buy Now" button on single product pages. It runs in both the PHP product renderer and when localizing JavaScript variables for the frontend.

**Parameters:**

- `$text` (string): The button text. Default: `'Buy Now'` (translated)
- `$data` (array): Context data
    ```php
    $data = [
        'product' => $product // Product model (when rendered server-side)
    ];
    ```

**Returns:**
- `$text` (string): The modified button text

**Source:** `app/Services/Renderer/ProductRenderer.php:1081,1181`, `app/Modules/Templating/AssetLoader.php:87,261`

**Usage:**
```php
add_filter('fluent_cart/product/buy_now_button_text', function($text, $data) {
    // Customize Buy Now text for specific products
    if (!empty($data['product']) && $data['product']->product_type === 'digital') {
        return 'Download Now';
    }
    return $text;
}, 10, 2);
```
</details>

### <code> product/add_to_cart_text </code>
<details>
<summary><code>fluent_cart/product/add_to_cart_text</code> &mdash; Filter the Add to Cart button text</summary>

**When it runs:**
This filter is applied when rendering the "Add to Cart" button text across multiple contexts: single product pages, shop blocks, product carousels, shortcodes, and localized JavaScript variables.

**Parameters:**

- `$text` (string): The button text. Default: `'Add To Cart'` (translated)
- `$data` (array): Context data
    ```php
    $data = [
        'product' => $product // Product model (when rendered server-side)
    ];
    ```

**Returns:**
- `$text` (string): The modified button text

**Source:** `app/Services/Renderer/ProductRenderer.php:1227,1314`, `app/Hooks/Handlers/ShortCodes/SingleProductShortCode.php:81`, `app/Hooks/Handlers/BlockEditors/ShopApp/InnerBlocks/InnerBlocks.php:1025,1104`, `app/Modules/Templating/AssetLoader.php:83,258`, `app/Hooks/Handlers/BlockEditors/ProductCarousel/InnerBlocks/InnerBlocks.php:493`

**Usage:**
```php
add_filter('fluent_cart/product/add_to_cart_text', function($text, $data) {
    // Change to a different label
    return 'Add to Basket';
}, 10, 2);
```
</details>

### <code> product/out_of_stock_text </code>
<details>
<summary><code>fluent_cart/product/out_of_stock_text</code> &mdash; Filter the out-of-stock button text</summary>

**When it runs:**
This filter is applied when rendering the button text for products that are out of stock. It is used across shortcodes, shop blocks, product carousels, and localized JavaScript variables.

**Parameters:**

- `$text` (string): The out-of-stock text. Default: `'Not Available'` (translated)
- `$data` (array): Context data (empty array)

**Returns:**
- `$text` (string): The modified out-of-stock text

**Source:** `app/Hooks/Handlers/ShortCodes/SingleProductShortCode.php:83`, `app/Hooks/Handlers/BlockEditors/ShopApp/InnerBlocks/InnerBlocks.php:1027,1106`, `app/Modules/Templating/AssetLoader.php:85`, `app/Hooks/Handlers/BlockEditors/ProductCarousel/InnerBlocks/InnerBlocks.php:495`

**Usage:**
```php
add_filter('fluent_cart/product/out_of_stock_text', function($text) {
    return 'Sold Out';
}, 10, 1);
```
</details>

### <code> product/out_of_stock_button_text </code>
<details>
<summary><code>fluent_cart/product/out_of_stock_button_text</code> &mdash; Filter the out-of-stock button text (block editor variant)</summary>

**When it runs:**
This filter is applied in the block editor asset loader when localizing the out-of-stock button text for JavaScript-rendered product pages. It serves the same purpose as `out_of_stock_text` but is used in a different rendering context.

**Parameters:**

- `$text` (string): The out-of-stock text. Default: `'Not Available'` (translated)
- `$data` (array): Context data (empty array)

**Returns:**
- `$text` (string): The modified out-of-stock button text

**Source:** `app/Modules/Templating/AssetLoader.php:260`

**Usage:**
```php
add_filter('fluent_cart/product/out_of_stock_button_text', function($text) {
    return 'Currently Unavailable';
}, 10, 1);
```
</details>

### <code> product/price_suffix_atts </code>
<details>
<summary><code>fluent_cart/product/price_suffix_atts</code> &mdash; Filter the price suffix for product variations</summary>

**When it runs:**
This filter is applied when rendering each variation item in the variation selector. The Tax module hooks into this filter to append a price suffix (e.g., "incl. tax") configured in tax settings.

**Parameters:**

- `$suffix` (string): The price suffix text. Default: `''` (empty string)
- `$data` (array): Context data
    ```php
    $data = [
        'product' => $product,   // Product model
        'variant' => $variant,   // ProductVariant model
        'scope'   => 'variant_item'
    ];
    ```

**Returns:**
- `$suffix` (string): The modified price suffix text

**Source:** `app/Services/Renderer/ProductRenderer.php:1408`

**Usage:**
```php
add_filter('fluent_cart/product/price_suffix_atts', function($suffix, $data) {
    // Add a custom price suffix
    return ' incl. VAT';
}, 10, 2);
```
</details>

### <code> product_short_description </code>
<details>
<summary><code>fluent_cart/product_short_description</code> &mdash; Filter the product short description</summary>

**When it runs:**
This filter is applied when rendering the short description section on the single product page, using the post excerpt as the default value.

**Parameters:**

- `$shortDescription` (string): The product short description (from `$post->post_excerpt`)
- `$data` (array): Context data (empty array)

**Returns:**
- `$shortDescription` (string): The modified short description (output via `wp_kses_post`)

**Source:** `app/Hooks/Handlers/TemplateLoader.php:26`

**Usage:**
```php
add_filter('fluent_cart/product_short_description', function($shortDescription) {
    // Append a disclaimer to all product short descriptions
    return $shortDescription . '<p class="disclaimer">Prices subject to change.</p>';
}, 10, 1);
```
</details>

### <code> product/display_price </code>
<details>
<summary><code>fluent_cart/product/display_price</code> &mdash; Filter the displayed product price</summary>

**When it runs:**
Applied when rendering product prices on product cards and single product pages, allowing custom pricing display logic (e.g., customer-specific prices, promotional pricing).

**Source:**
- `app/Services/Renderer/ProductCardRender.php:176`
- `app/Services/Renderer/ProductRenderer.php:643`

**Parameters:**

- `$price` (int): The display price in cents
- `$data` (array): Context data
    ```php
    $data = [
        'product'   => Product,          // The Product model
        'variation' => ProductVariation,  // The variation being displayed
    ];
    ```

**Returns:**
- `int` — The modified display price in cents

**Usage:**
```php
add_filter('fluent_cart/product/display_price', function ($price, $data) {
    // Show 20% off for logged-in users
    if (is_user_logged_in()) {
        return (int) ($price * 0.8);
    }
    return $price;
}, 10, 2);
```
</details>

---

## Stock & Availability

### <code> product_stock_availability </code>
<details>
<summary><code>fluent_cart/product_stock_availability</code> &mdash; Filter product stock availability information</summary>

**When it runs:**
This filter is applied when retrieving the stock availability data for a product from the `ProductDetail` model. It runs after the default availability is determined based on stock management settings and current stock levels.

**Parameters:**

- `$availability` (array): The stock availability data
    ```php
    // When stock is not managed:
    $availability = [
        'manage_stock'       => false,
        'availability'       => 'In Stock',
        'class'              => 'in-stock',
        'available_quantity' => null
    ];

    // When stock is managed and available:
    $availability = [
        'manage_stock'       => true,
        'availability'       => 'In Stock',
        'class'              => 'in-stock',
        'available_quantity' => 25 // actual stock count
    ];

    // When stock is managed and depleted:
    $availability = [
        'manage_stock'       => true,
        'availability'       => 'Out of Stock',
        'class'              => 'out-of-stock',
        'available_quantity' => 0
    ];
    ```
- `$data` (array): Context data
    ```php
    $data = [
        'detail'       => $productDetail, // ProductDetail model instance
        'variation_id' => $variationId    // Variation ID or null
    ];
    ```

**Returns:**
- `$availability` (array): The modified availability data

**Source:** `app/Models/ProductDetail.php:183`

**Usage:**
```php
add_filter('fluent_cart/product_stock_availability', function($availability, $data) {
    // Show "Low Stock" warning when fewer than 5 items remain
    if ($availability['manage_stock'] && $availability['available_quantity'] > 0 && $availability['available_quantity'] < 5) {
        $availability['availability'] = 'Only ' . $availability['available_quantity'] . ' left in stock!';
        $availability['class'] = 'low-stock';
    }
    return $availability;
}, 10, 2);
```
</details>

### <code> product_statuses </code>
<details>
<summary><code>fluent_cart/product_statuses</code> &mdash; Filter available product statuses</summary>

**When it runs:**
Applied when retrieving the list of available product statuses for admin dropdowns and filters.

**Source:** `app/Helpers/Status.php:110`

**Parameters:**

- `$statuses` (array): Array of status key => label pairs
    ```php
    $statuses = [
        'publish' => 'Publish',
        'draft'   => 'Draft',
        'private' => 'Private',
        'future'  => 'Scheduled',
        'trash'   => 'Trashed',
    ];
    ```
- `$data` (array): Additional context (empty array)

**Returns:**
- `array` — The modified statuses array

**Usage:**
```php
add_filter('fluent_cart/product_statuses', function ($statuses) {
    // Add a custom "Review" status
    $statuses['pending'] = __('Pending Review', 'my-plugin');
    return $statuses;
});
```
</details>

---

## Product URLs & Templates

### <code> price_class </code>
<details>
<summary><code>fluent_cart/price_class</code> &mdash; Filter the price element CSS class</summary>

**When it runs:**
This filter is applied when rendering the price paragraph element on the single product page template.

**Parameters:**

- `$class` (string): The CSS class for the price element. Default: `'price'`

**Returns:**
- `$class` (string): The modified CSS class string

**Source:** `app/Hooks/Handlers/TemplateLoader.php:40`

**Usage:**
```php
add_filter('fluent_cart/price_class', function($class) {
    // Add additional CSS classes to the price element
    return 'price fct-custom-price';
}, 10, 1);
```
</details>

### <code> front_url_slug </code>
<details>
<summary><code>fluent_cart/front_url_slug</code> &mdash; Filter the product URL slug</summary>

**When it runs:**
This filter is applied when registering the `fluent-products` custom post type, allowing you to change the URL slug used for product permalinks.

**Parameters:**

- `$slug` (string): The product URL slug. Default comes from store settings, typically `'item'`
- `$data` (array): Context data (empty array)

**Returns:**
- `$slug` (string): The modified URL slug

**Source:** `app/CPT/FluentProducts.php:181`

**Note:** After changing the slug, you must flush rewrite rules (visit Settings > Permalinks in WP admin) for the change to take effect.

**Usage:**
```php
add_filter('fluent_cart/front_url_slug', function($slug) {
    // Change product URLs from /item/product-name to /shop/product-name
    return 'shop';
}, 10, 1);
```
</details>

### <code> show_standalone_product_menu </code>
<details>
<summary><code>fluent_cart/show_standalone_product_menu</code> &mdash; Filter whether to show a standalone Products menu in the WordPress admin</summary>

**When it runs:**
This filter is applied during the `init` action when FluentCart registers the product custom post type. When enabled, a separate "Products" menu item appears in the WordPress admin sidebar.

**Parameters:**

- `$show` (bool): Whether to show the standalone menu. Default: `false`

**Returns:**
- `$show` (bool): The modified boolean value

**Source:** `app/CPT/FluentProducts.php:37`

**Usage:**
```php
add_filter('fluent_cart/show_standalone_product_menu', function($show) {
    // Show the standalone Products menu in WP admin
    return true;
}, 10, 1);
```
</details>

### <code> single_product_page/show_relevant_products </code>
<details>
<summary><code>fluent_cart/single_product_page/show_relevant_products</code> &mdash; Filter whether to show related products on the single product page</summary>

**When it runs:**
This filter is applied when rendering the single product page content, after checking the store setting `show_relevant_product_in_single_page`. When enabled, similar products are displayed below the main product content.

**Parameters:**

- `$show` (bool): Whether to show related products. Default comes from store settings
- `$postId` (int): The current product post ID

**Returns:**
- `$show` (bool): The modified boolean value

**Source:** `app/Modules/Templating/TemplateActions.php:240`

**Usage:**
```php
add_filter('fluent_cart/single_product_page/show_relevant_products', function($show, $postId) {
    // Disable related products for specific product IDs
    $excludedIds = [100, 200, 300];
    if (in_array($postId, $excludedIds)) {
        return false;
    }
    return $show;
}, 10, 2);
```
</details>

### <code> disable_auto_single_product_page </code>
<details>
<summary><code>fluent_cart/disable_auto_single_product_page</code> &mdash; Disable automatic single product page rendering</summary>

**When it runs:**
This filter is applied in two places: when filtering the post title and when filtering the post content for single product pages. When it returns `true`, FluentCart will not automatically inject product rendering into the default product page, allowing you to build the product page entirely with custom templates or page builders.

**Parameters:**

- `$disable` (bool): Whether to disable automatic rendering. Default: `false`

**Returns:**
- `$disable` (bool): The modified boolean value

**Source:** `app/Modules/Templating/TemplateActions.php:191,215`

**Usage:**
```php
add_filter('fluent_cart/disable_auto_single_product_page', function($disable) {
    // Disable auto-rendering when using a custom page builder
    if (class_exists('Elementor\Plugin')) {
        return true;
    }
    return $disable;
}, 10, 1);
```
</details>

---

## Coupons

### <code> coupon/validating_coupon </code>
<details>
<summary><code>fluent_cart/coupon/validating_coupon</code> &mdash; Filter the coupon code during validation</summary>

**When it runs:**
This filter is applied at the very beginning of coupon validation, before the coupon is looked up in the database. You can modify the coupon code string or return a `WP_Error` to reject it early.

**Parameters:**

- `$couponCode` (string): The coupon code being validated
- `$data` (array): Context data
    ```php
    $data = [
        'coupon_code'   => $couponCode,     // Original coupon code
        'line_items'    => $lineItems,       // Cart line items
        'couponService' => $couponService    // CouponService instance
    ];
    ```

**Returns:**
- `$couponCode` (string|WP_Error): The modified coupon code, or a `WP_Error` to reject

**Source:** `app/Services/Coupon/Concerns/CanValidateCoupon.php:21`

**Usage:**
```php
add_filter('fluent_cart/coupon/validating_coupon', function($couponCode, $data) {
    // Normalize coupon codes to uppercase
    $couponCode = strtoupper(trim($couponCode));

    // Block specific coupon codes
    $blockedCodes = ['EXPIRED2024', 'TESTONLY'];
    if (in_array($couponCode, $blockedCodes)) {
        return new \WP_Error('coupon_blocked', __('This coupon code is no longer valid.', 'fluent-cart'));
    }

    return $couponCode;
}, 10, 2);
```
</details>

### <code> coupon/can_use_coupon </code>
<details>
<summary><code>fluent_cart/coupon/can_use_coupon</code> &mdash; Filter whether a coupon can be used</summary>

**When it runs:**
This filter is applied after the coupon has been validated and found in the database, but before the discount is calculated. It allows you to add custom eligibility checks.

**Parameters:**

- `$canUse` (bool): Whether the coupon can be used. Default: `true`
- `$data` (array): Context data
    ```php
    $data = [
        'coupon'     => $coupon,     // Coupon model instance
        'cart'       => $cart,        // Cart model instance
        'cart_items' => $cartItems    // Array of cart item data
    ];
    ```

**Returns:**
- `$canUse` (bool|WP_Error): `true` to allow, `false` or `WP_Error` to reject. When a `WP_Error` is returned, its message is shown to the customer

**Source:** `app/Services/Coupon/DiscountService.php:257`

**Usage:**
```php
add_filter('fluent_cart/coupon/can_use_coupon', function($canUse, $data) {
    $coupon = $data['coupon'];
    $cart = $data['cart'];

    // Require a minimum cart subtotal of $50 (5000 cents)
    if ($cart->sub_total < 5000) {
        return new \WP_Error(
            'coupon_min_total',
            __('This coupon requires a minimum order of $50.', 'fluent-cart')
        );
    }

    return $canUse;
}, 10, 2);
```
</details>

### <code> coupon/will_skip_item </code>
<details>
<summary><code>fluent_cart/coupon/will_skip_item</code> &mdash; Filter whether an item should be skipped from coupon discount</summary>

**When it runs:**
This filter is applied for each cart item when filtering applicable items for a coupon discount. Returning `true` excludes the item from the coupon discount calculation.

**Parameters:**

- `$willSkip` (bool): Whether to skip this item. Default: `false`
- `$data` (array): Context data
    ```php
    $data = [
        'item'   => $item,    // Cart item array data
        'coupon' => $coupon,   // Coupon model instance
        'cart'   => $cart      // Cart model instance
    ];
    ```

**Returns:**
- `$willSkip` (bool): `true` to exclude the item from the coupon, `false` to include it

**Source:** `app/Services/Coupon/DiscountService.php:279`

**Usage:**
```php
add_filter('fluent_cart/coupon/will_skip_item', function($willSkip, $data) {
    $item = $data['item'];

    // Never apply coupons to gift card items
    if (!empty($item['product_type']) && $item['product_type'] === 'gift_card') {
        return true;
    }

    return $willSkip;
}, 10, 2);
```
</details>

### <code> coupon/per_customer_usage_query </code>
<details>
<summary><code>fluent_cart/coupon/per_customer_usage_query</code> &mdash; Filter the per-customer coupon usage query</summary>

**When it runs:**
This filter is applied when checking if a customer has exceeded the per-customer usage limit for a coupon. It allows you to modify the query that counts previous uses.

**Parameters:**

- `$usageQuery` (Builder): The Eloquent query builder for [`AppliedCoupon`](/database/models/applied-coupon) records, already filtered by coupon ID and customer ID
- `$data` (array): Context data
    ```php
    $data = [
        'coupon'   => $coupon,    // Coupon model instance
        'customer' => $customer,  // Customer model instance
        'cart'     => $cart       // Cart model instance
    ];
    ```

**Returns:**
- `$usageQuery` (Builder): The modified query builder

**Source:** `app/Services/Coupon/DiscountService.php:592`

**Usage:**
```php
add_filter('fluent_cart/coupon/per_customer_usage_query', function($usageQuery, $data) {
    // Only count usage from the last 30 days (rolling usage limit)
    $usageQuery->where('created_at', '>=', gmdate('Y-m-d H:i:s', strtotime('-30 days')));
    return $usageQuery;
}, 10, 2);
```
</details>

### <code> coupon_statuses </code>
<details>
<summary><code>fluent_cart/coupon_statuses</code> &mdash; Filter the available coupon statuses</summary>

**When it runs:**
This filter is applied when retrieving the list of available coupon statuses, used in the admin coupon management interface.

> **Deprecated:** The old hook name `fluent-cart/coupon_statuses` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**

- `$statuses` (array): Array of coupon statuses (key => label)
    ```php
    $statuses = [
        'active'   => 'Active',
        'expired'  => 'Expired',
        'disabled' => 'Disabled'
    ];
    ```
- `$data` (array): Context data (empty array)

**Returns:**
- `$statuses` (array): The modified coupon statuses array

**Source:** `app/Helpers/Status.php`

**Usage:**
```php
add_filter('fluent_cart/coupon_statuses', function($statuses) {
    // Add a custom coupon status
    $statuses['scheduled'] = __('Scheduled', 'fluent-cart');
    return $statuses;
}, 10, 1);
```
</details>

---
