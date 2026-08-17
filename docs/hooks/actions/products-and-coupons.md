# Products & Coupons

All hooks related to catalog management including [Product](/database/models/product) lifecycle, single product page rendering, product card rendering, and [Coupon](/database/models/coupon) management.

## Product Lifecycle

Hooks that fire during product create/update/duplicate operations in the admin.

### <code> product_duplicated </code>
<details open>
<summary><code>fluent_cart/product_duplicated</code> &mdash; Fired after a product is duplicated</summary>

**When it runs:**
This action fires after a [Product](/database/models/product) has been fully duplicated, including all variants, taxonomy terms, and post meta. The database transaction has already been committed when this hook runs.

**Parameters:**

- `$data` (array): Duplication result data
    ```php
    $data = [
        'original_product_id' => 123,        // (int) The source product's post ID
        'new_product_id'      => 456,        // (int) The newly created product's post ID
        'options'             => [
            'import_stock_management'   => true,  // (bool) Whether stock settings were copied
            'import_license_settings'   => true,  // (bool) Whether license settings were copied
            'import_downloadable_files' => false,  // (bool) Whether downloadable files were copied
        ],
    ];
    ```

**Source:** `app/Models/Product.php`

**Usage:**
```php
add_action('fluent_cart/product_duplicated', function($data) {
    $originalId = $data['original_product_id'];
    $newId      = $data['new_product_id'];

    // Copy custom meta that the core duplication doesn't handle
    $custom = get_post_meta($originalId, '_my_custom_field', true);
    if ($custom) {
        update_post_meta($newId, '_my_custom_field', $custom);
    }
}, 10, 1);
```
</details>

### <code> product_updated </code>
<details>
<summary><code>fluent_cart/product_updated</code> &mdash; Fired when a product is updated via the admin API</summary>

**When it runs:**
This action fires after a product has been successfully updated through the admin REST API (ProductController). It runs after `ProductResource::update()` has persisted all changes, including variants and product details.

**Parameters:**

- `$data` (array): Contains the raw request data and the updated [Product](/database/models/product) model
    ```php
    $data = [
        'data'    => [              // (array) Sanitized request payload
            'title'   => 'Product Name',
            'detail'  => [
                'variation_type' => 'simple',
                // ... other product detail fields
            ],
            'variants' => [
                // ... variant data
            ],
        ],
        'product' => $product,      // (Product model) The updated Product instance
    ];
    ```

**Source:** `app/Http/Controllers/ProductController.php`

**Usage:**
```php
add_action('fluent_cart/product_updated', function($data) {
    $product = $data['product'];

    // Sync product to an external inventory system
    do_action('my_plugin/sync_inventory', [
        'product_id' => $product->ID,
        'title'      => $product->post_title,
    ]);

    // Clear any cached product data
    wp_cache_delete('fct_product_' . $product->ID, 'fluent_cart');
}, 10, 1);
```
</details>

---

## Single Product Page Rendering

Hooks that fire during the server-side rendering of a single product page. All rendering hooks use **output buffering** -- your callback should `echo` HTML directly rather than return a value.

### <code> render_product_header </code>
<details>
<summary><code>fluent_cart/product/render_product_header</code> &mdash; Before the single product page content</summary>

**When it runs:**
This action fires at the very top of a single product page, before the main post content is rendered. Output is captured via `ob_start()` / `ob_get_clean()` and prepended to the product content.

**Parameters:**

- `$postId` (int): The product's WordPress post ID

**Source:** `app/Modules/Templating/TemplateActions.php`

**Usage:**
```php
add_action('fluent_cart/product/render_product_header', function($postId) {
    // Display a promotional banner above the product
    echo '<div class="my-promo-banner">Free shipping on this item!</div>';
}, 10, 1);
```
</details>

### <code> after_product_content </code>
<details>
<summary><code>fluent_cart/product/after_product_content</code> &mdash; After the single product page content</summary>

**When it runs:**
This action fires immediately after the main product content on a single product page. Output is captured via `ob_start()` / `ob_get_clean()` and appended to the product content.

**Parameters:**

- `$postId` (int): The product's WordPress post ID

**Source:** `app/Modules/Templating/TemplateActions.php`

**Usage:**
```php
add_action('fluent_cart/product/after_product_content', function($postId) {
    // Add a trust badge section below the product
    echo '<div class="trust-badges">';
    echo '<span>30-day money back guarantee</span>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> product_archive </code>
<details>
<summary><code>fluent_cart/template/product_archive</code> &mdash; Render the product archive/taxonomy page</summary>

**When it runs:**
This action fires when a product taxonomy archive page (category, tag, etc.) is being rendered. It is triggered inside `renderMainContent()` when the current page is a taxonomy page for `fluent-products`.

**Parameters:**

None.

**Source:** `app/Modules/Templating/TemplateActions.php`

**Usage:**
```php
add_action('fluent_cart/template/product_archive', function() {
    // Render a custom product archive layout
    echo '<div class="my-custom-archive">';
    // ... your custom archive rendering
    echo '</div>';
}, 10, 0);
```
</details>

### <code> before_price_block </code>
<details>
<summary><code>fluent_cart/product/single/before_price_block</code> &mdash; Before the price block on a single product page</summary>

**When it runs:**
This action fires immediately before the price wrapper `<div>` is rendered on a single product page. It fires in two contexts: once for simple products showing a single price, and once for multi-variant products showing the selected variant's price.

**Parameters:**

- `$data` (array): Price block context
    ```php
    $data = [
        'product'       => $product,      // (Product model) The current product
        'current_price' => 5000,          // (int) Price in cents
        'scope'         => 'price_range', // (string) 'price_range' for simple products,
                                          //          'product_variant_price' for variant pricing
    ];
    ```

**Source:** `app/Services/Renderer/ProductRenderer.php`

**Usage:**
```php
add_action('fluent_cart/product/single/before_price_block', function($data) {
    if ($data['scope'] === 'price_range') {
        echo '<div class="price-label">Our Price:</div>';
    }
}, 10, 1);
```
</details>

### <code> after_price (single & card) </code>
<details>
<summary><code>fluent_cart/product/after_price</code> &mdash; Inline after the price is rendered</summary>

**When it runs:**
This action fires inline immediately after a price value is echoed, while still inside the price `<span>` or `<div>`. It fires in multiple contexts: simple product prices, price ranges, individual variant prices, and product cards. Use the `scope` key to distinguish between contexts.

**Parameters:**

- `$data` (array): Price context
    ```php
    $data = [
        'product'       => $product,              // (Product model) The current product
        'current_price' => 5000,                  // (int) Price in cents
        'scope'         => 'price_range',         // (string) One of:
                                                  //   'price_range'          - simple product or min/max range
                                                  //   'product_variant_price' - individual variant price
                                                  //   'product_card'         - product card on archive/group pages
    ];
    ```

**Source:** `app/Services/Renderer/ProductRenderer.php`, `app/Services/Renderer/ProductCardRender.php`

**Usage:**
```php
add_action('fluent_cart/product/after_price', function($data) {
    // Show a "per unit" label next to the price
    if ($data['scope'] === 'product_variant_price') {
        echo '<span class="per-unit"> / unit</span>';
    }

    // Show a sale badge on product cards
    if ($data['scope'] === 'product_card') {
        echo '<span class="sale-badge">Sale</span>';
    }
}, 10, 1);
```
</details>

### <code> after_price_block </code>
<details>
<summary><code>fluent_cart/product/single/after_price_block</code> &mdash; After the price block wrapper closes on a single product page</summary>

**When it runs:**
This action fires immediately after the closing `</div>` of the price block on a single product page. Like `before_price_block`, it fires in two contexts: simple product pricing and variant pricing.

**Parameters:**

- `$data` (array): Price block context
    ```php
    $data = [
        'product'       => $product,      // (Product model) The current product
        'current_price' => 5000,          // (int) Price in cents
        'scope'         => 'price_range', // (string) 'price_range' for simple products,
                                          //          'product_variant_price' for variant pricing
    ];
    ```

**Source:** `app/Services/Renderer/ProductRenderer.php`

**Usage:**
```php
add_action('fluent_cart/product/single/after_price_block', function($data) {
    // Add installment info below the price
    $monthly = \FluentCart\App\Helpers\Helper::toDecimal(intval($data['current_price'] / 3));
    echo '<p class="installment-info">Or 3 payments of ' . esc_html($monthly) . '</p>';
}, 10, 1);
```
</details>

### <code> before_price_range_block </code>
<details>
<summary><code>fluent_cart/product/single/before_price_range_block</code> &mdash; Before the price range block for multi-variant products</summary>

**When it runs:**
This action fires before the min-max price range `<div>` is rendered on multi-variant products (products with more than one variant that show a "from X - Y" price range). It does **not** fire for simple products.

**Parameters:**

- `$data` (array): Price range context
    ```php
    $data = [
        'product'       => $product,      // (Product model) The current product
        'current_price' => 2000,          // (int) Minimum price in cents
        'scope'         => 'price_range',
    ];
    ```

**Source:** `app/Services/Renderer/ProductRenderer.php`

**Usage:**
```php
add_action('fluent_cart/product/single/before_price_range_block', function($data) {
    echo '<div class="pricing-note">Choose a plan below:</div>';
}, 10, 1);
```
</details>

### <code> after_price_range_block </code>
<details>
<summary><code>fluent_cart/product/single/after_price_range_block</code> &mdash; After the price range block for multi-variant products</summary>

**When it runs:**
This action fires after the closing `</div>` of the min-max price range block on multi-variant products. It does **not** fire for simple products.

**Parameters:**

- `$data` (array): Price range context
    ```php
    $data = [
        'product'       => $product,      // (Product model) The current product
        'current_price' => 2000,          // (int) Minimum price in cents
        'scope'         => 'price_range',
    ];
    ```

**Source:** `app/Services/Renderer/ProductRenderer.php`

**Usage:**
```php
add_action('fluent_cart/product/single/after_price_range_block', function($data) {
    echo '<p class="bulk-discount">Bulk discounts available for 10+ licenses.</p>';
}, 10, 1);
```
</details>

### <code> before_variant_item </code>
<details>
<summary><code>fluent_cart/product/single/before_variant_item</code> &mdash; Before each variant item in the variant list</summary>

**When it runs:**
This action fires before each individual [ProductVariation](/database/models/product-variation) option is rendered in the variant selection list. It fires once per variant, inside the `foreach` loop that iterates over sorted variants. It fires in both the standard variant list and the tabbed (subscription/onetime) variant layout.

**Parameters:**

- `$data` (array): Variant item context
    ```php
    $data = [
        'product' => $product,               // (Product model) The current product
        'variant' => $variant,               // (ProductVariant model) The current variant being rendered
        'scope'   => 'product_variant_item',
    ];
    ```

**Source:** `app/Services/Renderer/ProductRenderer.php`

**Usage:**
```php
add_action('fluent_cart/product/single/before_variant_item', function($data) {
    $variant = $data['variant'];

    // Add a "Most Popular" badge before a specific variant
    if ($variant->id === 42) {
        echo '<div class="popular-badge">Most Popular</div>';
    }
}, 10, 1);
```
</details>

### <code> after_variant_item </code>
<details>
<summary><code>fluent_cart/product/single/after_variant_item</code> &mdash; After each variant item in the variant list</summary>

**When it runs:**
This action fires after each individual variant option is rendered in the variant selection list. It fires once per variant, immediately after `renderVariationItem()` completes. It fires in both the standard variant list and the tabbed variant layout.

**Parameters:**

- `$data` (array): Variant item context
    ```php
    $data = [
        'product' => $product,               // (Product model) The current product
        'variant' => $variant,               // (ProductVariant model) The current variant being rendered
        'scope'   => 'product_variant_item',
    ];
    ```

**Source:** `app/Services/Renderer/ProductRenderer.php`

**Usage:**
```php
add_action('fluent_cart/product/single/after_variant_item', function($data) {
    $variant = $data['variant'];

    // Show remaining stock below each variant
    if ($variant->stock_quantity > 0 && $variant->stock_quantity < 10) {
        echo '<span class="low-stock">Only ' . esc_html($variant->stock_quantity) . ' left!</span>';
    }
}, 10, 1);
```
</details>

### <code> before_quantity_block </code>
<details>
<summary><code>fluent_cart/product/single/before_quantity_block</code> &mdash; Before the quantity selector on a single product page</summary>

**When it runs:**
This action fires immediately before the quantity input container is rendered on a single product page. It only fires if the product allows quantity selection (not hidden by sold-individually or other conditions).

**Parameters:**

- `$data` (array): Quantity block context
    ```php
    $data = [
        'product' => $product,                   // (Product model) The current product
        'scope'   => 'product_quantity_block',
    ];
    ```

**Source:** `app/Services/Renderer/ProductRenderer.php`

**Usage:**
```php
add_action('fluent_cart/product/single/before_quantity_block', function($data) {
    echo '<p class="quantity-hint">Select your desired quantity:</p>';
}, 10, 1);
```
</details>

### <code> after_quantity_block </code>
<details>
<summary><code>fluent_cart/product/single/after_quantity_block</code> &mdash; After the quantity selector on a single product page</summary>

**When it runs:**
This action fires immediately after the quantity input container is rendered on a single product page, after the closing `</div>` of the quantity wrapper.

**Parameters:**

- `$data` (array): Quantity block context
    ```php
    $data = [
        'product' => $product,                   // (Product model) The current product
        'scope'   => 'product_quantity_block',
    ];
    ```

**Source:** `app/Services/Renderer/ProductRenderer.php`

**Usage:**
```php
add_action('fluent_cart/product/single/after_quantity_block', function($data) {
    // Show bulk pricing table after the quantity selector
    echo '<div class="bulk-pricing">';
    echo '<small>Buy 5+ and save 10% &bull; Buy 10+ and save 20%</small>';
    echo '</div>';
}, 10, 1);
```
</details>

---

## Product Card Rendering (Archive / Group Pages)

Hooks that fire during server-side rendering of product cards on archive pages, product group blocks, and shop listings. All rendering hooks use **output buffering** -- your callback should `echo` HTML directly.

### <code> group/before_image_block </code>
<details>
<summary><code>fluent_cart/product/group/before_image_block</code> &mdash; Before the product card image</summary>

**When it runs:**
This action fires before the product card image link and `<img>` tag are rendered inside a product card on archive or group pages.

**Parameters:**

- `$data` (array): Product card context
    ```php
    $data = [
        'product' => $product,        // (Product model) The current product
        'scope'   => 'product_card',
    ];
    ```

**Source:** `app/Services/Renderer/ProductCardRender.php`

**Usage:**
```php
add_action('fluent_cart/product/group/before_image_block', function($data) {
    // Add a "New" ribbon over the product card image
    $product = $data['product'];
    $created = strtotime($product->post_date);
    if ($created > strtotime('-30 days')) {
        echo '<span class="new-ribbon">New</span>';
    }
}, 10, 1);
```
</details>

### <code> group/after_image_block </code>
<details>
<summary><code>fluent_cart/product/group/after_image_block</code> &mdash; After the product card image</summary>

**When it runs:**
This action fires immediately after the product card image link closes, before the rest of the card content (title, price, button) is rendered.

**Parameters:**

- `$data` (array): Product card context
    ```php
    $data = [
        'product' => $product,        // (Product model) The current product
        'scope'   => 'product_card',
    ];
    ```

**Source:** `app/Services/Renderer/ProductCardRender.php`

**Usage:**
```php
add_action('fluent_cart/product/group/after_image_block', function($data) {
    // Add a quick-view button overlay after the image
    echo '<button class="quick-view-btn" data-product="' . esc_attr($data['product']->ID) . '">Quick View</button>';
}, 10, 1);
```
</details>

### <code> group/before_price_block </code>
<details>
<summary><code>fluent_cart/product/group/before_price_block</code> &mdash; Before the price section in product cards</summary>

**When it runs:**
This action fires before the price wrapper `<div class="fct-product-card-prices">` is rendered inside a product card on archive or group pages.

**Parameters:**

- `$data` (array): Product card price context
    ```php
    $data = [
        'product'       => $product,       // (Product model) The current product
        'current_price' => 2000,           // (int) Minimum price in cents
        'scope'         => 'product_card',
    ];
    ```

**Source:** `app/Services/Renderer/ProductCardRender.php`

**Usage:**
```php
add_action('fluent_cart/product/group/before_price_block', function($data) {
    // Show a "Starting at" label before the price
    echo '<span class="price-prefix">Starting at</span>';
}, 10, 1);
```
</details>

### <code> group/after_price_block </code>
<details>
<summary><code>fluent_cart/product/group/after_price_block</code> &mdash; After the price section in product cards</summary>

**When it runs:**
This action fires immediately after the closing `</div>` of the product card price wrapper, after prices and the inline `fluent_cart/product/after_price` hook have been rendered.

**Parameters:**

- `$data` (array): Product card price context
    ```php
    $data = [
        'product'       => $product,       // (Product model) The current product
        'current_price' => 2000,           // (int) Minimum price in cents
        'scope'         => 'product_card',
    ];
    ```

**Source:** `app/Services/Renderer/ProductCardRender.php`

**Usage:**
```php
add_action('fluent_cart/product/group/after_price_block', function($data) {
    // Show a short feature list below the price on product cards
    $features = get_post_meta($data['product']->ID, '_card_features', true);
    if ($features) {
        echo '<ul class="card-features">';
        foreach ((array) $features as $feature) {
            echo '<li>' . esc_html($feature) . '</li>';
        }
        echo '</ul>';
    }
}, 10, 1);
```
</details>

---

## Product Card & Single-Page Render Hooks

Positional markers wrapping the card and single-product-page blocks (title, excerpt, purchase actions), plus a data hook that fires after a batch of variants is saved. Unlike the `$data`-array hooks above, these pass a `$gateContext` array built by `RenderGate::context()` / `RenderContext::decorate()` -- at minimum `'product'` (the current [Product](/database/models/product) model) and `'scope'` (a `RenderGate::SCOPE_*` constant, `'card'` or `'single'`). All rendering hooks here use **output buffering** -- your callback should `echo` HTML directly rather than return a value.

### <code> product/group/before_card </code>
<details>
<summary><code>fluent_cart/product/group/before_card</code> &mdash; Before a product card's opening <code>&lt;article&gt;</code> tag</summary>

**When it runs:**
Fires on archive/group/shop listings immediately before the `<article data-fct-product-card>` wrapper for a single product card is opened.

**Parameters:**
- `$gateContext` (array): The render gate context for this card. Built here via `RenderContext::decorate(['product' => $this->product, 'scope' => RenderGate::SCOPE_CARD])`.
    ```php
    $gateContext = [
        'product' => $product,               // \FluentCart\App\Models\Product
        'scope'   => RenderGate::SCOPE_CARD,  // 'card'
    ];
    ```

**Source:** `app/Services/Renderer/ProductCardRender.php:75`

**Usage:**
```php
add_action('fluent_cart/product/group/before_card', function ($gateContext) {
    // Wrap featured products in a highlight container
    if (get_post_meta($gateContext['product']->ID, '_is_featured', true)) {
        echo '<div class="fct-featured-card-wrap">';
    }
}, 10, 1);
```
</details>

### <code> product/group/after_card </code>
<details>
<summary><code>fluent_cart/product/group/after_card</code> &mdash; After a product card's closing <code>&lt;/article&gt;</code> tag</summary>

**When it runs:**
Fires on archive/group/shop listings immediately after a product card's `</article>` tag closes, once the buy button has already been rendered.

**Parameters:**
- `$gateContext` (array): The render gate context for this card.
    ```php
    $gateContext = [
        'product' => $product,               // \FluentCart\App\Models\Product
        'scope'   => RenderGate::SCOPE_CARD,  // 'card'
    ];
    ```

**Source:** `app/Services/Renderer/ProductCardRender.php:95`

**Usage:**
```php
add_action('fluent_cart/product/group/after_card', function ($gateContext) {
    // Close the featured-product wrapper opened in before_card
    if (get_post_meta($gateContext['product']->ID, '_is_featured', true)) {
        echo '</div>';
    }
}, 10, 1);
```
</details>

### <code> product/group/before_title_block </code>
<details>
<summary><code>fluent_cart/product/group/before_title_block</code> &mdash; Before the product card title</summary>

**When it runs:**
Fires inside `renderTitle()` on a product card, immediately before the title link/text is echoed.

**Parameters:**
- `$gateContext` (array): The render gate context for this card (at minimum `'product'` and `'scope' => RenderGate::SCOPE_CARD`).

**Source:** `app/Services/Renderer/ProductCardRender.php:171`

**Usage:**
```php
add_action('fluent_cart/product/group/before_title_block', function ($gateContext) {
    // Show a category eyebrow above the card title
    $term = get_the_terms($gateContext['product']->ID, 'product-category');
    if ($term && !is_wp_error($term)) {
        echo '<span class="fct-card-eyebrow">' . esc_html($term[0]->name) . '</span>';
    }
}, 10, 1);
```
</details>

### <code> product/group/after_title_block </code>
<details>
<summary><code>fluent_cart/product/group/after_title_block</code> &mdash; After the product card title</summary>

**When it runs:**
Fires inside `renderTitle()` on a product card, immediately after the title markup is echoed.

**Parameters:**
- `$gateContext` (array): The render gate context for this card (at minimum `'product'` and `'scope' => RenderGate::SCOPE_CARD`).

**Source:** `app/Services/Renderer/ProductCardRender.php:205`

**Usage:**
```php
add_action('fluent_cart/product/group/after_title_block', function ($gateContext) {
    // Show a star rating summary right under the card title
    echo do_shortcode('[my_reviews_stars id="' . esc_attr($gateContext['product']->ID) . '"]');
}, 10, 1);
```
</details>

### <code> product/group/before_excerpt_block </code>
<details>
<summary><code>fluent_cart/product/group/before_excerpt_block</code> &mdash; Before the product card excerpt</summary>

**When it runs:**
Fires inside `renderExcerpt()`/similar on a product card, immediately before the `<p class="fct-product-card-excerpt">` is echoed.

**Parameters:**
- `$gateContext` (array): The render gate context for this card (at minimum `'product'` and `'scope' => RenderGate::SCOPE_CARD`).

**Source:** `app/Services/Renderer/ProductCardRender.php:150`

**Usage:**
```php
add_action('fluent_cart/product/group/before_excerpt_block', function ($gateContext) {
    echo '<span class="fct-card-highlight">Best Seller</span>';
}, 10, 1);
```
</details>

### <code> product/group/after_excerpt_block </code>
<details>
<summary><code>fluent_cart/product/group/after_excerpt_block</code> &mdash; After the product card excerpt</summary>

**When it runs:**
Fires on a product card immediately after the excerpt `<p>` markup is echoed.

**Parameters:**
- `$gateContext` (array): The render gate context for this card (at minimum `'product'` and `'scope' => RenderGate::SCOPE_CARD`).

**Source:** `app/Services/Renderer/ProductCardRender.php:160`

**Usage:**
```php
add_action('fluent_cart/product/group/after_excerpt_block', function ($gateContext) {
    echo '<a class="fct-card-readmore" href="' . esc_url(get_permalink($gateContext['product']->ID)) . '">Read more</a>';
}, 10, 1);
```
</details>

### <code> product/group/before_actions_block </code>
<details>
<summary><code>fluent_cart/product/group/before_actions_block</code> &mdash; Before the buy button row on a product card</summary>

**When it runs:**
Fires on a product card immediately before `renderBuyButtonMarkup()` renders the add-to-cart/buy-now buttons.

**Parameters:**
- `$gateContext` (array): The render gate context for this card (at minimum `'product'` and `'scope' => RenderGate::SCOPE_CARD`).

**Source:** `app/Services/Renderer/ProductCardRender.php:362`

**Usage:**
```php
add_action('fluent_cart/product/group/before_actions_block', function ($gateContext) {
    // Wishlist icon before the buy button
    echo '<button class="fct-wishlist-btn" data-product-id="' . esc_attr($gateContext['product']->ID) . '">&hearts;</button>';
}, 10, 1);
```
</details>

### <code> product/group/after_actions_block </code>
<details>
<summary><code>fluent_cart/product/group/after_actions_block</code> &mdash; After the buy button row on a product card</summary>

**When it runs:**
Fires on a product card immediately after `renderBuyButtonMarkup()` has rendered the add-to-cart/buy-now buttons.

**Parameters:**
- `$gateContext` (array): The render gate context for this card (at minimum `'product'` and `'scope' => RenderGate::SCOPE_CARD`).

**Source:** `app/Services/Renderer/ProductCardRender.php:366`

**Usage:**
```php
add_action('fluent_cart/product/group/after_actions_block', function ($gateContext) {
    // Social share icons below the buy button
    echo '<div class="fct-card-share">' . do_shortcode('[addtoany]') . '</div>';
}, 10, 1);
```
</details>

### <code> product/single/before_title_block </code>
<details>
<summary><code>fluent_cart/product/single/before_title_block</code> &mdash; Before the <code>&lt;h1&gt;</code> title on a single product page</summary>

**When it runs:**
Fires on a single product page immediately before the `<div class="fct-product-title">` / `<h1>` wrapper is rendered.

**Parameters:**
- `$gateContext` (array): The render gate context for the single product page, typically carrying at least `'product'` (this [Product](/database/models/product) model) and `'scope' => RenderGate::SCOPE_SINGLE`.

**Source:** `app/Services/Renderer/ProductRenderer.php:725`

**Usage:**
```php
add_action('fluent_cart/product/single/before_title_block', function ($gateContext) {
    // Breadcrumb above the product title
    echo '<nav class="fct-breadcrumb">' . get_the_term_list($gateContext['product']->ID, 'product-category', '', ', ') . '</nav>';
}, 10, 1);
```
</details>

### <code> product/single/after_title_block </code>
<details>
<summary><code>fluent_cart/product/single/after_title_block</code> &mdash; After the <code>&lt;h1&gt;</code> title on a single product page</summary>

**When it runs:**
Fires on a single product page immediately after the product title `<h1>` and its wrapper `<div>` close.

**Parameters:**
- `$gateContext` (array): The render gate context for the single product page, typically carrying at least `'product'` and `'scope' => RenderGate::SCOPE_SINGLE`.

**Source:** `app/Services/Renderer/ProductRenderer.php:731`

**Usage:**
```php
add_action('fluent_cart/product/single/after_title_block', function ($gateContext) {
    echo do_shortcode('[my_reviews_stars id="' . esc_attr($gateContext['product']->ID) . '" show_count="1"]');
}, 10, 1);
```
</details>

### <code> product/single/before_excerpt_block </code>
<details>
<summary><code>fluent_cart/product/single/before_excerpt_block</code> &mdash; Before the excerpt on a single product page</summary>

**When it runs:**
Fires on a single product page immediately before the `<div class="fct-product-excerpt">` wrapper is rendered (only when the product has an excerpt).

**Parameters:**
- `$gateContext` (array): The render gate context for the single product page, typically carrying at least `'product'` and `'scope' => RenderGate::SCOPE_SINGLE`.

**Source:** `app/Services/Renderer/ProductRenderer.php:942`

**Usage:**
```php
add_action('fluent_cart/product/single/before_excerpt_block', function ($gateContext) {
    echo '<span class="fct-single-highlight">Limited stock</span>';
}, 10, 1);
```
</details>

### <code> product/single/after_excerpt_block </code>
<details>
<summary><code>fluent_cart/product/single/after_excerpt_block</code> &mdash; After the excerpt on a single product page</summary>

**When it runs:**
Fires on a single product page immediately after the product excerpt `</div>` wrapper closes.

**Parameters:**
- `$gateContext` (array): The render gate context for the single product page, typically carrying at least `'product'` and `'scope' => RenderGate::SCOPE_SINGLE`.

**Source:** `app/Services/Renderer/ProductRenderer.php:948`

**Usage:**
```php
add_action('fluent_cart/product/single/after_excerpt_block', function ($gateContext) {
    // Trust badges below the excerpt
    echo '<div class="fct-trust-badges"><span>30-day guarantee</span><span>Secure checkout</span></div>';
}, 10, 1);
```
</details>

### <code> product/single/before_actions_block </code>
<details>
<summary><code>fluent_cart/product/single/before_actions_block</code> &mdash; Before the buy-now / add-to-cart buttons on a single product page</summary>

**When it runs:**
Fires on a single product page immediately before `renderBuyNowButton()` and `renderAddToCartButton()` render the purchase buttons.

**Parameters:**
- `$gateContext` (array): The render gate context for the single product page, typically carrying at least `'product'` and `'scope' => RenderGate::SCOPE_SINGLE`.

**Source:** `app/Services/Renderer/ProductRenderer.php:1424`

**Usage:**
```php
add_action('fluent_cart/product/single/before_actions_block', function ($gateContext) {
    // Urgency message above the purchase buttons
    if ($gateContext['product']->getStockQuantity() < 5) {
        echo '<p class="fct-urgency">Only a few left in stock!</p>';
    }
}, 10, 1);
```
</details>

### <code> product/single/after_actions_block </code>
<details>
<summary><code>fluent_cart/product/single/after_actions_block</code> &mdash; After the buy-now / add-to-cart buttons on a single product page</summary>

**When it runs:**
Fires on a single product page immediately after `renderBuyNowButton()` and `renderAddToCartButton()` have rendered the purchase buttons.

**Parameters:**
- `$gateContext` (array): The render gate context for the single product page, typically carrying at least `'product'` and `'scope' => RenderGate::SCOPE_SINGLE`.

**Source:** `app/Services/Renderer/ProductRenderer.php:1430`

**Usage:**
```php
add_action('fluent_cart/product/single/after_actions_block', function ($gateContext) {
    // Accepted payment icons below the purchase buttons
    echo '<div class="fct-payment-icons"><img src="' . esc_url(FLUENTCART_PLUGIN_URL . 'assets/images/payment-icons.svg') . '" alt="" /></div>';
}, 10, 1);
```
</details>

### <code> product/variants_updated </code>
<details>
<summary><code>fluent_cart/product/variants_updated</code> &mdash; Fired after a batch of product variants is saved</summary>

**When it runs:**
Fires after a product's variants have been persisted, whether through the bulk variant-update endpoint, a single-variant field update, or (in Pro) the advanced-variation save path. Listen here once instead of duplicating logic across every variant-save entry point.

**Parameters:**
- `$data` (array): Updated variant batch
    ```php
    $data = [
        'post_id'  => 456,          // (int) The product's WordPress post ID
        'variants' => $batchData,   // (array) The variant records that were just written
    ];
    ```

**Source:**
- `app/Http/Controllers/ProductVariationController.php:387` (bulk variant update)
- `app/Http/Controllers/ProductVariationController.php:649` (single-variant field update)
- `app/Services/AdvancedVariationService.php:280` (Pro's advanced-variation save path)

**Usage:**
```php
add_action('fluent_cart/product/variants_updated', function ($data) {
    // Push the new variant stock/prices to an external inventory system
    do_action('my_plugin/sync_variants', $data['post_id'], $data['variants']);
}, 10, 1);
```
</details>

---

## Coupons

Hooks that fire during [Coupon](/database/models/coupon) create and update operations in the admin.

### <code> coupon_created </code>
<details>
<summary><code>fluent_cart/coupon_created</code> &mdash; Fired after a new coupon is created via the admin</summary>

**When it runs:**
This action fires after a [Coupon](/database/models/coupon) has been successfully created through the admin REST API. It runs after `CouponResource::create()` has persisted the coupon and after the activity log entry has been recorded.

**Parameters:**

- `$data` (array): [Coupon](/database/models/coupon) creation data
    ```php
    $data = [
        'data'   => [                // (array) Sanitized request payload
            'title'      => 'SAVE20',
            'type'       => 'percentage',   // 'percentage' or 'fixed'
            'amount'     => 2000,           // (int) Discount amount in cents (or percentage value)
            'start_date' => '2026-01-01 00:00:00',  // (string|null) GMT start date
            'end_date'   => '2026-12-31 23:59:59',  // (string|null) GMT end date
            'conditions' => [
                'is_recurring' => 'no',
                // ... other condition fields
            ],
        ],
        'coupon' => $coupon,          // (Coupon model) The newly created Coupon instance
    ];
    ```

**Source:** `app/Http/Controllers/CouponsController.php`

**Usage:**
```php
add_action('fluent_cart/coupon_created', function($data) {
    $coupon = $data['coupon'];

    // Notify marketing team about the new coupon
    wp_mail(
        'marketing@example.com',
        'New Coupon Created: ' . $coupon->title,
        'A new coupon has been created with code: ' . $coupon->title
    );
}, 10, 1);
```
</details>

### <code> coupon_updated </code>
<details>
<summary><code>fluent_cart/coupon_updated</code> &mdash; Fired after a coupon is updated via the admin</summary>

**When it runs:**
This action fires after a [Coupon](/database/models/coupon) has been successfully updated through the admin REST API. It runs after `CouponResource::update()` has persisted the changes, but before the activity log entry is recorded.

**Parameters:**

- `$data` (array): Coupon update data
    ```php
    $data = [
        'data'   => [                // (array) Sanitized request payload
            'title'      => 'SAVE20',
            'type'       => 'percentage',
            'amount'     => 2500,
            'start_date' => '2026-01-01 00:00:00',
            'end_date'   => '2026-12-31 23:59:59',
            'conditions' => [
                'is_recurring' => 'no',
                // ... other condition fields
            ],
        ],
        'coupon' => $coupon,          // (Coupon model) The updated Coupon instance
    ];
    ```

**Source:** `app/Http/Controllers/CouponsController.php`

**Usage:**
```php
add_action('fluent_cart/coupon_updated', function($data) {
    $coupon = $data['coupon'];

    // Clear coupon validation cache when a coupon is modified
    wp_cache_delete('fct_coupon_' . $coupon->id, 'fluent_cart');

    // Sync updated coupon to external promotion platform
    do_action('my_plugin/sync_coupon', $coupon);
}, 10, 1);
```
</details>
