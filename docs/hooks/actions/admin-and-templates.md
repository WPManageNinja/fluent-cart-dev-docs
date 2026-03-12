# Admin & Templates

All hooks related to plugin boot/initialization, admin UI, modules, the block/email editor, form rendering, page templating, shortcode-driven views, policy verification, and custom web routes.

---

## Boot / Initialization

Fired during plugin startup. These are the earliest FluentCart hooks and let you tap into the container before any other logic runs.

### <code> fluentcart_loaded </code>
<details open>
<summary><code>fluentcart_loaded</code> &mdash; Plugin application container loaded (first hook)</summary>

**When it runs:**
Fires inside the `plugins_loaded` WordPress hook, immediately after the FluentCart `Application` container is constructed and the Action Scheduler is loaded. This is the very first FluentCart hook — use it to register early bindings, service providers, or listeners before anything else initialises.

**Parameters:**

- `$app` (\FluentCart\Framework\Foundation\Application): The FluentCart application container instance
    ```php
    // $app is the IoC container — you can resolve services from it:
    $app->make(\FluentCart\App\Services\SomeService::class);
    ```

**Source:** `boot/app.php` (line 30)

**Usage:**
```php
add_action('fluentcart_loaded', function ($app) {
    // Register a custom service into the FluentCart container early
    $app->bind('myCustomService', function () {
        return new \MyPlugin\CustomService();
    });
}, 10, 1);
```
</details>

### <code> fluent_cart/init </code>
<details>
<summary><code>fluent_cart/init</code> &mdash; FluentCart fully initialised on WP <code>init</code></summary>

**When it runs:**
Fires inside the WordPress `init` hook (which itself runs after `plugins_loaded`). By this point, all post types, taxonomies, and rewrite rules are available. Use this for logic that depends on WordPress being fully bootstrapped — custom post type queries, REST route registration, etc.

**Parameters:**

- `$app` (\FluentCart\Framework\Foundation\Application): The FluentCart application container instance

**Source:** `boot/app.php` (line 35)

**Usage:**
```php
add_action('fluent_cart/init', function ($app) {
    // Safe to query custom post types or register REST routes here
    register_rest_route('my-plugin/v1', '/data', [
        'methods'  => 'GET',
        'callback' => 'my_custom_handler',
    ]);
}, 10, 1);
```
</details>

---

## Admin

Hooks that fire during admin page rendering, menu setup, and asset enqueueing. Use these to extend the FluentCart admin panel.

### <code> fluent_cart/admin_menu </code>
<details>
<summary><code>fluent_cart/admin_menu</code> &mdash; Render admin navigation menu</summary>

**When it runs:**
Fires in two places: inside the admin Vue SPA wrapper (`admin_app.php`) and on the product CPT taxonomy pages. It is the hook that renders the FluentCart admin navigation bar. The default handler (`MenuHandler::renderAdminMenu`) is attached to it to output the menu HTML.

**Parameters:**

None — this is a rendering hook. Callbacks should echo HTML.

**Source:** `app/CPT/FluentProducts.php` (line 333), `app/Views/admin/admin_app.php` (line 4)

**Usage:**
```php
add_action('fluent_cart/admin_menu', function () {
    // Append a custom link to the admin navigation bar
    echo '<a href="#/my-custom-page" class="fct-nav-item">My Page</a>';
}, 20);
```
</details>

### <code> fluent_cart/admin_submenu_added </code>
<details>
<summary><code>fluent_cart/admin_submenu_added</code> &mdash; After all admin submenus registered</summary>

**When it runs:**
Fires at the end of `MenuHandler::addAdminMenu()`, after all default submenu items (Dashboard, Orders, Customers, Products, Integrations, Reports, Settings, Coupons, Logs, and taxonomy pages) have been registered under the FluentCart admin menu.

**Parameters:**

- `$submenu` (array): The WordPress global `$submenu` array (keyed by parent slug). The `fluent-cart` key contains all FluentCart submenu items.
    ```php
    $submenu = [
        'fluent-cart' => [
            'dashboard'    => ['Dashboard', 'manage_options', 'admin.php?page=fluent-cart#/', ...],
            'orders'       => ['Orders', 'manage_options', 'admin.php?page=fluent-cart#/orders', ...],
            'customers'    => ['Customers', ...],
            'products'     => ['Products', ...],
            'integrations' => ['Integrations', ...],
            'reports'      => ['Reports', ...],
            'settings'     => ['Settings', ...],
            'coupons'      => ['Coupons', ...],
            'logs'         => ['Logs', ...],
            // ... taxonomy submenus
        ],
    ];
    ```

**Source:** `app/Hooks/Handlers/MenuHandler.php` (line 283)

**Usage:**
```php
add_action('fluent_cart/admin_submenu_added', function ($submenu) {
    // Add a custom submenu item programmatically
    global $submenu;
    $submenu['fluent-cart']['my_page'] = [
        __('My Custom Page', 'my-plugin'),
        'manage_options',
        'admin.php?page=fluent-cart#/my-custom',
    ];
}, 10, 1);
```
</details>

### <code> fluent_cart/loading_app </code>
<details>
<summary><code>fluent_cart/loading_app</code> &mdash; Admin Vue SPA assets about to be enqueued</summary>

**When it runs:**
Fires at the very beginning of `MenuHandler::enqueueAssets()`, before any admin JavaScript or CSS is registered. Use this to enqueue your own scripts or styles that need to load alongside (or before) the admin SPA.

**Parameters:**

- `$app` (\FluentCart\Framework\Foundation\Application): The FluentCart application container instance

**Source:** `app/Hooks/Handlers/MenuHandler.php` (line 355)

**Usage:**
```php
add_action('fluent_cart/loading_app', function ($app) {
    // Enqueue a custom admin stylesheet before the SPA loads
    wp_enqueue_style('my-fct-admin-style', plugins_url('css/admin.css', __FILE__));
}, 10, 1);
```
</details>

### <code> fluent_cart/admin_js_loaded </code>
<details>
<summary><code>fluent_cart/admin_js_loaded</code> &mdash; After all admin JS enqueued and localised</summary>

**When it runs:**
Fires at the end of `MenuHandler::enqueueAssets()`, after all admin scripts have been enqueued and `wp_localize_script` has injected the `fluentCartAdminApp` and `fluentCartRestVars` objects. Use this to enqueue scripts that depend on the admin SPA data being available, or to add inline script data.

**Parameters:**

- `$app` (\FluentCart\Framework\Foundation\Application): The FluentCart application container instance

**Source:** `app/Hooks/Handlers/MenuHandler.php` (line 465)

**Usage:**
```php
add_action('fluent_cart/admin_js_loaded', function ($app) {
    // Enqueue a script that depends on the admin app being fully loaded
    wp_enqueue_script('my-fct-addon', plugins_url('js/addon.js', __FILE__), [], '1.0', true);

    // Add inline data that references fluentCartAdminApp
    wp_add_inline_script('my-fct-addon', 'window.myAddonConfig = { ready: true };', 'before');
}, 10, 1);
```
</details>

---

## Modules

Hooks that fire when built-in FluentCart modules (e.g. stock management, subscriptions, shipping) are activated or deactivated via the admin settings panel.

### <code> module/deactivated/{module_key} </code>
<details>
<summary><code>fluent_cart/module/deactivated/{$moduleKey}</code> &mdash; Module deactivated (dynamic)</summary>

**When it runs:**
Fires inside `ModuleSettingsController::saveSettings()` when a module's `active` status transitions from `'yes'` to `'no'`. The `{$moduleKey}` portion is replaced dynamically with the module identifier.

**Available dynamic variants:** `stock_management`, `subscriptions`, `shipping`, `tax`, `coupon`, `license`, `digital_downloads`, and any other registered module key.

**Parameters:**

- `$moduleData` (array): The newly saved settings for this module
    ```php
    $moduleData = [
        'active' => 'no',
        // ... other module-specific settings
    ];
    ```
- `$prevModuleData` (array): The previous settings for this module before the save
    ```php
    $prevModuleData = [
        'active' => 'yes',
        // ... previous module-specific settings
    ];
    ```

**Source:** `app/Http/Controllers/ModuleSettingsController.php` (line 58)

**Usage:**
```php
add_action('fluent_cart/module/deactivated/stock_management', function ($moduleData, $prevModuleData) {
    // Clean up stock-related cron jobs when stock management is turned off
    as_unschedule_all_actions('fluent_cart/stock_check');
}, 10, 2);
```
</details>

### <code> module/activated/{module_key} </code>
<details>
<summary><code>fluent_cart/module/activated/{$moduleKey}</code> &mdash; Module activated (dynamic)</summary>

**When it runs:**
Fires inside `ModuleSettingsController::saveSettings()` when a module's `active` status transitions from `'no'` to `'yes'`. The `{$moduleKey}` portion is replaced dynamically with the module identifier.

**Available dynamic variants:** `stock_management`, `subscriptions`, `shipping`, `tax`, `coupon`, `license`, `digital_downloads`, and any other registered module key.

**Parameters:**

- `$moduleData` (array): The newly saved settings for this module
    ```php
    $moduleData = [
        'active' => 'yes',
        // ... other module-specific settings
    ];
    ```
- `$prevModuleData` (array): The previous settings for this module before the save
    ```php
    $prevModuleData = [
        'active' => 'no',
        // ... previous module-specific settings
    ];
    ```

**Source:** `app/Http/Controllers/ModuleSettingsController.php` (line 61)

**Usage:**
```php
add_action('fluent_cart/module/activated/subscriptions', function ($moduleData, $prevModuleData) {
    // Run database migrations when the subscriptions module is first activated
    \FluentCart\Database\DBMigrator::run('subscription_tables');
}, 10, 2);
```
</details>

---

## Block Editor / Email Editor

Hooks for the custom FluentCart block editor used to compose email templates. These fire during the editor page lifecycle and asset loading.

### <code> fluent_cart_enqueue_block_editor_assets </code>
<details>
<summary><code>fluent_cart_enqueue_block_editor_assets</code> &mdash; Block editor assets being enqueued</summary>

**When it runs:**
Fires at the end of `FluentCartBlockEditorHandler::enqueueEditorStyles()`, after all core WordPress block editor styles (`wp-edit-post`, `wp-block-library`, etc.) have been enqueued. WordPress's own `wp_enqueue_editor_format_library_assets` is also attached to this hook. Use it to add custom styles or scripts to the email block editor.

**Parameters:**

None.

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php` (line 428)

**Usage:**
```php
add_action('fluent_cart_enqueue_block_editor_assets', function () {
    // Add custom styles for the email block editor
    wp_enqueue_style('my-email-editor-styles', plugins_url('css/email-editor.css', __FILE__));
}, 10);
```
</details>

### <code> fluent_cart_block_editor/head </code>
<details>
<summary><code>fluent_cart_block_editor/head</code> &mdash; In <code>&lt;head&gt;</code> of custom block editor page</summary>

**When it runs:**
Fires inside the `<head>` tag of the custom block editor HTML page. WordPress core hooks (`wp_enqueue_scripts`, `wp_print_styles`, `wp_print_head_scripts`, etc.) are pre-attached to this action so that editor stylesheets and scripts are output in the correct location. Use this to inject additional `<meta>`, `<link>`, or `<style>` tags into the editor page head.

**Parameters:**

None.

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php` (line 620)

**Usage:**
```php
add_action('fluent_cart_block_editor/head', function () {
    // Inject a custom font into the email block editor page
    echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap">';
}, 20);
```
</details>

### <code> fluent_cart/block_editor_head </code>
<details>
<summary><code>fluent_cart/block_editor_head</code> &mdash; Second head hook in block editor page</summary>

**When it runs:**
Fires immediately after `fluent_cart_block_editor/head` inside the `<head>` tag, right before the closing `</head>`. This is a secondary head hook — use it for last-minute style overrides or scripts that must load after everything else in the head.

**Parameters:**

None.

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php` (line 622)

**Usage:**
```php
add_action('fluent_cart/block_editor_head', function () {
    // Override editor styles as the final head injection
    echo '<style>.editor-styles-wrapper { font-family: "Inter", sans-serif; }</style>';
}, 10);
```
</details>

### <code> fluent_cart/new_block_editor_footer </code>
<details>
<summary><code>fluent_cart/new_block_editor_footer</code> &mdash; Footer of custom block editor page (for JS)</summary>

**When it runs:**
Fires inside the `<body>` of the custom block editor page, after the editor `<div>` and before `</body>`. This is the recommended place to inject footer JavaScript for the email editor.

**Parameters:**

None.

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php` (line 629)

**Usage:**
```php
add_action('fluent_cart/new_block_editor_footer', function () {
    // Inject custom JS into the email editor page footer
    echo '<script>console.log("FluentCart email editor loaded");</script>';
}, 10);
```
</details>

### <code> fluent_cart/block_editor/enqueue_assets </code>
<details>
<summary><code>fluent_cart/block_editor/enqueue_assets</code> &mdash; After email editor block assets enqueued</summary>

**When it runs:**
Fires at the end of `FluentCartBlockEditorHandler::enqueueEmailEditorBlocks()`, after all FluentCart-specific email editor block scripts, styles, and global editor SCSS have been enqueued. Use this to register additional custom blocks or scripts for the email editor.

**Parameters:**

None.

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php` (line 1232)

**Usage:**
```php
add_action('fluent_cart/block_editor/enqueue_assets', function () {
    // Register a custom email block
    wp_enqueue_script('my-email-block', plugins_url('js/my-email-block.js', __FILE__), ['wp-blocks'], '1.0', true);
}, 10);
```
</details>

### <code> fluent_cart/block_editor/render_block </code>
<details>
<summary><code>fluent_cart/block_editor/render_block</code> &mdash; Render unknown block types in email parser</summary>

**When it runs:**
Fires inside `FluentBlockParser` when processing a block whose name is not recognised by any built-in handler and is not a standard email editor block. The hook runs inside `ob_start()` — any output you `echo` will be captured and used as the block's rendered HTML in the email. If nothing is output, the parser falls back to raw `innerHTML`.

**Parameters:**

- `$data` (array): Block rendering context
    ```php
    $data = [
        'block'      => [...],        // Full block array (name, attrs, innerBlocks, innerHTML, etc.)
        'block_name' => 'my/custom',  // The block type name string
        'attributes' => [...],        // Block attributes array
    ];
    ```

**Source:** `app/Services/Email/FluentBlockParser.php` (line 278)

**Usage:**
```php
add_action('fluent_cart/block_editor/render_block', function ($data) {
    if ($data['block_name'] === 'my-plugin/promo-banner') {
        $heading = $data['attributes']['heading'] ?? 'Special Offer';
        echo '<div style="background: #f0f0f0; padding: 20px; text-align: center;">';
        echo '<h2>' . esc_html($heading) . '</h2>';
        echo '</div>';
    }
}, 10, 1);
```
</details>

---

## Form Rendering

Hooks for extending the checkout form field renderer with custom field types.

### <code> fluent_cart/render_custom_form_field </code>
<details>
<summary><code>fluent_cart/render_custom_form_field</code> &mdash; Unrecognised form field type fallback</summary>

**When it runs:**
Fires inside the `default` case of `FormFieldRenderer::renderField()` when the field `type` does not match any built-in type (`section`, `sub_section`, `text`, `email`, `tel`, `number`, `textarea`, `checkbox`, `select`, `address_select`). Use this to render custom field types in the checkout or registration forms.

**Parameters:**

- `$fieldData` (array): The field configuration array
    ```php
    $fieldData = [
        'type'          => 'my_custom_type',  // The unrecognised field type
        'label'         => 'Custom Field',    // Field label
        'id'            => 'my_field',        // Field HTML ID
        'name'          => 'my_field',        // Field name attribute
        'required'      => true,              // Whether the field is required
        'wrapper_class' => '',                // CSS class for the wrapper
        'options'       => [],                // Options (if applicable)
        // ... other field-specific keys
    ];
    ```

**Source:** `app/Services/Renderer/FormFieldRenderer.php` (line 58)

**Usage:**
```php
add_action('fluent_cart/render_custom_form_field', function ($fieldData) {
    if ($fieldData['type'] === 'date_picker') {
        $id = esc_attr($fieldData['id'] ?? '');
        $name = esc_attr($fieldData['name'] ?? '');
        $label = esc_html($fieldData['label'] ?? '');
        $required = !empty($fieldData['required']) ? 'required' : '';
        echo "<div class='fct_form_field'>";
        echo "<label for='{$id}'>{$label}</label>";
        echo "<input type='date' id='{$id}' name='{$name}' {$required} />";
        echo "</div>";
    }
}, 10, 1);
```
</details>

---

## Templating

Hooks for the generic fallback template used on product archive pages and other FluentCart template-driven pages. They fire in sequence from top to bottom of the page layout.

### <code> fluent_cart/generic_template/rendering </code>
<details>
<summary><code>fluent_cart/generic_template/rendering</code> &mdash; Start of generic fallback template</summary>

**When it runs:**
Fires at the very top of `fallback-generic-template.php`, before `get_header()` is called. Use this to set up global variables, enqueue assets, or modify the page state before any template output begins.

**Parameters:**

None.

**Source:** `app/Modules/Templating/fallback-generic-template.php` (line 7)

**Usage:**
```php
add_action('fluent_cart/generic_template/rendering', function () {
    // Enqueue custom styles for the product archive template
    wp_enqueue_style('my-archive-styles', plugins_url('css/archive.css', __FILE__));
}, 10);
```
</details>

### <code> fluent_cart/generic_template/before_content </code>
<details>
<summary><code>fluent_cart/generic_template/before_content</code> &mdash; After <code>get_header()</code>, before main wrapper</summary>

**When it runs:**
Fires after the WordPress header has been rendered by `get_header()` and before the main content wrapper `<div>` opens. Use this for banners, breadcrumbs, or other full-width elements above the content area.

**Parameters:**

None.

**Source:** `app/Modules/Templating/fallback-generic-template.php` (line 10)

**Usage:**
```php
add_action('fluent_cart/generic_template/before_content', function () {
    // Add a breadcrumb trail above the product archive
    echo '<nav class="fct-breadcrumb">Home &raquo; Shop</nav>';
}, 10);
```
</details>

### <code> fluent_cart/template/before_content </code>
<details>
<summary><code>fluent_cart/template/before_content</code> &mdash; Inside main wrapper, before content</summary>

**When it runs:**
Fires inside the `<div id="main">` site-main wrapper, before the main content hook. Use this for content-width elements like filter bars or category headers that sit above the product grid.

**Parameters:**

None.

**Source:** `app/Modules/Templating/fallback-generic-template.php` (line 13)

**Usage:**
```php
add_action('fluent_cart/template/before_content', function () {
    // Show a category filter bar above the product grid
    echo '<div class="fct-filter-bar">Filter by category...</div>';
}, 10);
```
</details>

### <code> fluent_cart/template/main_content </code>
<details>
<summary><code>fluent_cart/template/main_content</code> &mdash; Main content area</summary>

**When it runs:**
Fires inside the `<div id="main">` wrapper between the `before_content` and `after_content` hooks. This is where the primary page content (product grid, archive loop, etc.) is rendered. FluentCart's templating module hooks its archive rendering here.

**Parameters:**

None.

**Source:** `app/Modules/Templating/fallback-generic-template.php` (line 14)

**Usage:**
```php
add_action('fluent_cart/template/main_content', function () {
    // Replace or supplement the default archive content
    echo '<div class="my-custom-product-grid">Custom grid here</div>';
}, 10);
```
</details>

### <code> fluent_cart/template/after_content </code>
<details>
<summary><code>fluent_cart/template/after_content</code> &mdash; After main content</summary>

**When it runs:**
Fires inside the `<div id="main">` wrapper after the main content has been rendered. Use this for pagination, call-to-action blocks, or related products sections that sit below the product grid.

**Parameters:**

None.

**Source:** `app/Modules/Templating/fallback-generic-template.php` (line 15)

**Usage:**
```php
add_action('fluent_cart/template/after_content', function () {
    // Add pagination below the product grid
    echo '<div class="fct-pagination"><!-- pagination links --></div>';
}, 10);
```
</details>

### <code> fluent_cart/generic_template/after_content </code>
<details>
<summary><code>fluent_cart/generic_template/after_content</code> &mdash; After main wrapper, before <code>get_footer()</code></summary>

**When it runs:**
Fires after the main content wrapper `<div>` closes and before `get_footer()` renders the site footer. Use this for full-width elements below the content area like newsletter signups or related content.

**Parameters:**

None.

**Source:** `app/Modules/Templating/fallback-generic-template.php` (line 18)

**Usage:**
```php
add_action('fluent_cart/generic_template/after_content', function () {
    // Add a full-width newsletter signup section
    echo '<section class="fct-newsletter">Subscribe to our newsletter</section>';
}, 10);
```
</details>

---

## Views (Shortcode-Driven Rendering)

Hooks that render specific view partials on the checkout page, receipt emails, and customer-facing forms. These fire inside `ob_start()` / `ob_get_clean()` blocks — your callbacks should `echo` HTML output.

### <code> views/checkout_page_cart_item_list </code>
<details>
<summary><code>fluent_cart/views/checkout_page_cart_item_list</code> &mdash; Render cart item list on checkout</summary>

**When it runs:**
Fires inside `CheckoutController::getCheckoutSummary()` to render the cart item list partial on the checkout page. The output is captured via `ob_start()` and returned as part of the checkout summary AJAX response.

**Parameters:**

- `$data` (array): Checkout context
    ```php
    $data = [
        'checkout' => $checkOutHelper,  // \FluentCart\App\Helpers\CartCheckoutHelper instance
        'items'    => [...],            // Array of cart items from $checkOutHelper->getItems()
    ];
    ```

**Source:** `app/Http/Controllers/CheckoutController.php` (line 39)

**Usage:**
```php
add_action('fluent_cart/views/checkout_page_cart_item_list', function ($data) {
    $items = $data['items'];
    echo '<div class="fct-cart-items">';
    foreach ($items as $item) {
        echo '<div class="fct-cart-item">' . esc_html($item['title'] ?? '') . '</div>';
    }
    echo '</div>';
}, 10, 1);
```
</details>

### <code> views/checkout_page_registration_form </code>
<details>
<summary><code>fluent_cart/views/checkout_page_registration_form</code> &mdash; Render registration form on checkout</summary>

**When it runs:**
Fires inside `CustomerRegistrationHandler::render()` to output the guest registration form on the checkout page. The output is captured via `ob_start()` and returned as the rendered form HTML.

**Parameters:**

- `$viewData` (array): View context
    ```php
    $viewData = [
        'checkout' => $checkOutHelper,  // \FluentCart\App\Helpers\CartCheckoutHelper instance
    ];
    ```

**Source:** `app/Hooks/Handlers/ShortCodes/CustomerRegistrationHandler.php` (line 79)

**Usage:**
```php
add_action('fluent_cart/views/checkout_page_registration_form', function ($viewData) {
    $checkout = $viewData['checkout'];
    echo '<div class="fct-registration-form">';
    echo '<h3>Create an Account</h3>';
    // Render custom registration fields
    echo '<input type="text" name="full_name" placeholder="Full Name" />';
    echo '<input type="email" name="email" placeholder="Email" />';
    echo '<input type="password" name="password" placeholder="Password" />';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> views/checkout_page_login_form </code>
<details>
<summary><code>fluent_cart/views/checkout_page_login_form</code> &mdash; Render login form on checkout</summary>

**When it runs:**
Fires inside `CustomerLoginHandler::render()` to output the login form on the checkout page for returning customers. The output is captured via `ob_start()` and returned as the rendered form HTML.

**Parameters:**

- `$viewData` (array): View context
    ```php
    $viewData = [
        'checkout' => $checkOutHelper,  // \FluentCart\App\Helpers\CartCheckoutHelper instance
    ];
    ```

**Source:** `app/Hooks/Handlers/ShortCodes/CustomerLoginHandler.php` (line 81)

**Usage:**
```php
add_action('fluent_cart/views/checkout_page_login_form', function ($viewData) {
    echo '<div class="fct-login-form">';
    echo '<h3>Returning Customer? Log In</h3>';
    echo '<input type="email" name="email" placeholder="Email" />';
    echo '<input type="password" name="password" placeholder="Password" />';
    echo '<button type="submit">Log In</button>';
    echo '</div>';
}, 10, 1);
```
</details>

### <code> views/checkout_order_summary </code>
<details>
<summary><code>fluent_cart/views/checkout_order_summary</code> &mdash; Render order summary (email shortcodes)</summary>

**When it runs:**
Fires inside `ShortcodeParser::getSummary()` when the `{{order_summary}}` shortcode is parsed in email templates. The output is captured via `ob_start()` and inserted into the email body as the order summary block. Receives the [Order](/database/models/order) model instance.

**Parameters:**

- `$data` (array): Order summary context
    ```php
    $data = [
        'order'          => $order,          // \FluentCart\App\Models\Order instance
        'paymentReceipt' => $paymentReceipt, // \FluentCart\App\Services\PaymentReceipt instance
    ];
    ```

**Source:** `app/Services/ShortCodeParser/ShortcodeParser.php` (line 248)

**Usage:**
```php
add_action('fluent_cart/views/checkout_order_summary', function ($data) {
    $order = $data['order'];
    $receipt = $data['paymentReceipt'];
    echo '<table class="fct-order-summary">';
    echo '<tr><th>Order #' . esc_html($order->id) . '</th></tr>';
    // Render line items, totals, etc.
    echo '</table>';
}, 10, 1);
```
</details>

### <code> views/checkout_order_receipt </code>
<details>
<summary><code>fluent_cart/views/checkout_order_receipt</code> &mdash; Render full order receipt (email shortcodes)</summary>

**When it runs:**
Fires inside `ShortcodeParser::getReceipt()` when the `{{order_receipt}}` shortcode is parsed in email templates. The output is captured via `ob_start()` and inserted into the email body as the complete [Order](/database/models/order) receipt.

**Parameters:**

- `$data` (array): Order receipt context
    ```php
    $data = [
        'order'          => $order,          // \FluentCart\App\Models\Order instance
        'paymentReceipt' => $paymentReceipt, // \FluentCart\App\Services\PaymentReceipt instance
    ];
    ```

**Source:** `app/Services/ShortCodeParser/ShortcodeParser.php` (line 256)

**Usage:**
```php
add_action('fluent_cart/views/checkout_order_receipt', function ($data) {
    $order = $data['order'];
    $receipt = $data['paymentReceipt'];
    echo '<div class="fct-receipt">';
    echo '<h2>Receipt for Order #' . esc_html($order->id) . '</h2>';
    // Render full receipt with items, addresses, payment info, etc.
    echo '</div>';
}, 10, 1);
```
</details>

### <code> views/checkout_page_shipping_method_list </code>
<details>
<summary><code>fluent_cart/views/checkout_page_shipping_method_list</code> &mdash; Render shipping method list</summary>

**When it runs:**
Fires inside `ShippingFrontendController::getShippingMethodsListView()` to render the list of available [ShippingMethod](/database/models/shipping-method) instances on the checkout page. The output is captured via `ob_start()` and returned as part of the shipping methods AJAX response.

**Parameters:**

- `$data` (array): Shipping methods context
    ```php
    $data = [
        'shipping_methods' => [
            // Array of available \FluentCart\App\Models\ShippingMethod instances
            // filtered by the customer's country/address
        ],
    ];
    ```

**Source:** `app/Modules/Shipping/Http/Controllers/Frontend/ShippingFrontendController.php` (line 75)

**Usage:**
```php
add_action('fluent_cart/views/checkout_page_shipping_method_list', function ($data) {
    $methods = $data['shipping_methods'];
    echo '<div class="fct-shipping-methods">';
    foreach ($methods as $method) {
        echo '<label>';
        echo '<input type="radio" name="shipping_method" value="' . esc_attr($method->id) . '" />';
        echo esc_html($method->title);
        echo '</label>';
    }
    echo '</div>';
}, 10, 1);
```
</details>

### <code> views/checkout_page_form_address_info_wrapper </code>
<details>
<summary><code>fluent_cart/views/checkout_page_form_address_info_wrapper</code> &mdash; Render address info card</summary>

**When it runs:**
Fires inside `CustomerController` when rendering the address information card on the checkout page after a customer selects or submits their address. The output is captured via `ob_start()` and returned in the AJAX response.

**Parameters:**

- `$data` (array): Address display data
    ```php
    $data = [
        'name'    => 'John Doe',                           // Customer name
        'phone'   => '+1234567890',                        // Customer phone number
        'label'   => 'Home',                               // Address label
        'address' => '123 Main St, City, State, Country',  // Formatted address string
    ];
    ```

**Source:** `app/Http/Controllers/FrontendControllers/CustomerController.php` (line 137)

**Usage:**
```php
add_action('fluent_cart/views/checkout_page_form_address_info_wrapper', function ($data) {
    echo '<div class="fct-address-card">';
    echo '<strong>' . esc_html($data['name']) . '</strong>';
    if (!empty($data['phone'])) {
        echo '<br />' . esc_html($data['phone']);
    }
    echo '<br />' . esc_html($data['address']);
    echo '</div>';
}, 10, 1);
```
</details>

---

## Policies / Security

Hooks that fire during REST API policy verification. These allow you to add custom security checks, rate limiting, or audit logging before the standard permission check runs.

### <code> policy/store_sensitive_request </code>
<details>
<summary><code>fluent_cart/policy/store_sensitive_request</code> &mdash; Store-sensitive API request verification</summary>

**When it runs:**
Fires at the beginning of `StoreSensitivePolicy::verifyRequest()`, before the `store/sensitive` capability check is performed. This policy protects sensitive store operations (e.g. payment gateway configuration, API key management). Use this to add additional security measures like IP whitelisting or two-factor verification.

**Parameters:**

- `$data` (array): Request context
    ```php
    $data = [
        'request' => $request,  // \FluentCart\Framework\Http\Request\Request instance
    ];
    ```

**Source:** `app/Http/Policies/StoreSensitivePolicy.php` (line 11)

**Usage:**
```php
add_action('fluent_cart/policy/store_sensitive_request', function ($data) {
    $request = $data['request'];
    $ip = $request->server('REMOTE_ADDR');

    // Log sensitive API access attempts
    fluent_cart_add_log(
        'Sensitive API Access',
        sprintf('IP: %s, Endpoint: %s', $ip, $request->url()),
        'info'
    );
}, 10, 1);
```
</details>

### <code> policy/store_settings_request </code>
<details>
<summary><code>fluent_cart/policy/store_settings_request</code> &mdash; Store-settings API request verification</summary>

**When it runs:**
Fires at the beginning of `StoreSettingsPolicy::verifyRequest()`, before the route-meta permission check (`hasRoutePermissions()`) is performed. This policy protects store settings endpoints (e.g. general settings, email templates, checkout configuration). Use this for additional validation or logging.

**Parameters:**

- `$data` (array): Request context
    ```php
    $data = [
        'request' => $request,  // \FluentCart\Framework\Http\Request\Request instance
    ];
    ```

**Source:** `app/Http/Policies/StoreSettingsPolicy.php` (line 11)

**Usage:**
```php
add_action('fluent_cart/policy/store_settings_request', function ($data) {
    $request = $data['request'];

    // Restrict settings changes to specific admin users
    $allowedUserIds = [1, 2, 3];
    if (!in_array(get_current_user_id(), $allowedUserIds)) {
        wp_die('You are not allowed to modify store settings.', 403);
    }
}, 10, 1);
```
</details>

---

## Web Routes

Dynamic hooks for custom web route endpoints. Used primarily by payment gateways for IPN (Instant Payment Notification) callbacks, webhook handlers, and other server-to-server endpoints.

### <code> fluent_cart_action_{page} </code>
<details>
<summary><code>fluent_cart_action_{$page}</code> &mdash; Custom web route action handler (dynamic)</summary>

**When it runs:**
Fires inside `WebRoutes` when the current FluentCart web route `$page` slug matches a registered action. After the action fires, `die()` is called immediately — your callback must handle the full response (headers, body, exit). This is typically used by payment gateway modules to register IPN/webhook listeners (e.g. `fluent_cart_action_stripe_ipn`).

**Parameters:**

- `$requestData` (array): All request parameters from `App::request()->all()`, which includes merged GET and POST data.
    ```php
    $requestData = [
        // All query string and POST body parameters, e.g.:
        'webhook_id'   => 'evt_123abc',
        'payment_type' => 'subscription',
        // ... any other request params
    ];
    ```

**Source:** `app/Http/Routes/WebRoutes.php` (line 198)

**Usage:**
```php
add_action('fluent_cart_action_my_gateway_ipn', function ($requestData) {
    // Verify the webhook signature
    $payload = file_get_contents('php://input');
    $signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';

    if (!verify_webhook_signature($payload, $signature)) {
        status_header(403);
        echo 'Invalid signature';
        return; // die() is called by WebRoutes after the action
    }

    // Process the payment notification
    process_ipn_notification($requestData);

    status_header(200);
    echo 'OK';
}, 10, 1);
```
</details>
