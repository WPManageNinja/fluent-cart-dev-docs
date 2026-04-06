# Settings & Configuration

All filters related to admin settings, store configuration, module management, currency formatting, admin UI, permissions, translations, email notifications, and block editor.

## Store Settings

### <code> store_settings/values </code>

<details open>
<summary><code>fluent_cart/store_settings/values</code> &mdash; Filter default store settings values</summary>

**When it runs:**
This filter is applied when retrieving the default store settings, before merging with saved values. Use it to add or modify defaults for all store configuration options.

**Parameters:**

- `$defaultSettings` (array): The default store settings
    ```php
    $defaultSettings = [
        'store_name'                           => get_bloginfo('name'),
        'note_for_user_account_creation'       => 'An user account will be created',
        'checkout_button_text'                 => 'Checkout',
        'view_cart_button_text'                => 'View Cart',
        'cart_button_text'                     => 'Add To Cart',
        'popup_button_text'                    => 'View Product',
        'out_of_stock_button_text'             => 'Not Available',
        'currency_position'                    => 'before',
        'decimal_separator'                    => 'dot',
        'checkout_method_style'                => 'logo',
        'enable_modal_checkout'                => 'no',
        'require_logged_in'                    => 'no',
        'show_cart_icon_in_nav'                => 'no',
        'show_cart_icon_in_body'               => 'yes',
        'additional_address_field'             => 'yes',
        'hide_coupon_field'                    => 'no',
        'user_account_creation_mode'           => 'all',
        'checkout_page_id'                     => '',
        'custom_payment_page_id'               => '',
        'registration_page_id'                 => '',
        'login_page_id'                        => '',
        'cart_page_id'                         => '',
        'receipt_page_id'                      => '',
        'shop_page_id'                         => '',
        'customer_profile_page_id'             => '',
        'customer_profile_page_slug'           => '',
        'currency'                             => 'USD',
        'store_address1'                       => '',
        'store_address2'                       => '',
        'store_city'                           => '',
        'store_country'                        => '',
        'store_postcode'                       => '',
        'store_state'                          => '',
        'show_relevant_product_in_single_page' => 'yes',
        'show_relevant_product_in_modal'       => '',
        'order_mode'                           => 'test',
        'variation_view'                       => 'both',
        'variation_columns'                    => 'masonry',
        'enable_early_payment_for_installment' => 'yes',
        'modules_settings'                     => [],
        'min_receipt_number'                   => '1',
        'inv_prefix'                           => 'INV-',
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified default settings array

**Source:** `api/StoreSettings.php:89`

**Usage:**
```php
add_filter('fluent_cart/store_settings/values', function ($defaultSettings, $data) {
    // Change default currency and order mode
    $defaultSettings['currency'] = 'EUR';
    $defaultSettings['order_mode'] = 'live';
    return $defaultSettings;
}, 10, 2);
```
</details>

### <code> store_settings/fields </code>
<details>
<summary><code>fluent_cart/store_settings/fields</code> &mdash; Filter store settings form field definitions</summary>

**When it runs:**
This filter is applied when rendering the store settings form in the admin interface. Use it to add, remove, or modify settings tabs and fields.

**Parameters:**

- `$fields` (array): Nested array of settings tabs and field definitions
    ```php
    $fields = [
        'setting_tabs' => [
            'schema' => [
                'general_tab' => [
                    'title'  => 'General Settings',
                    'fields' => [...]
                ],
                'checkout_tab' => [
                    'title'  => 'Checkout Settings',
                    'fields' => [...]
                ],
                'modules_tab' => [
                    'title'  => 'Modules',
                    'fields' => [...]
                ],
            ]
        ]
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified fields array

**Source:** `api/StoreSettings.php:1141`

**Usage:**
```php
add_filter('fluent_cart/store_settings/fields', function ($fields, $data) {
    // Add a custom settings section
    $fields['setting_tabs']['schema']['custom_tab'] = [
        'title'  => 'Custom Settings',
        'fields' => [
            [
                'key'   => 'custom_field',
                'label' => 'Custom Field',
                'type'  => 'text',
            ]
        ]
    ];
    return $fields;
}, 10, 2);
```
</details>

### <code> store_settings/rules </code>
<details>
<summary><code>fluent_cart/store_settings/rules</code> &mdash; Filter validation rules for store settings</summary>

**When it runs:**
This filter is applied when validating store settings form submissions. Use it to add or modify validation rules for settings fields.

**Parameters:**

- `$rules` (array): Validation rules keyed by field name
    ```php
    $rules = [
        'store_name'    => 'required|sanitizeText|maxLength:200',
        'store_country' => 'required|sanitizeText|maxLength:200',
    ];
    ```

**Returns:** `array` — The modified validation rules array

**Source:** `app/Http/Requests/FluentMetaRequest.php:34`

**Usage:**
```php
add_filter('fluent_cart/store_settings/rules', function ($rules) {
    // Add validation for a custom field
    $rules['custom_field'] = 'required|sanitizeText|maxLength:100';
    return $rules;
});
```
</details>

### <code> store_settings/sanitizer </code>
<details>
<summary><code>fluent_cart/store_settings/sanitizer</code> &mdash; Filter sanitization rules for store settings</summary>

**When it runs:**
This filter is applied when sanitizing store settings input before saving. Each key maps to a sanitize callback function or a callable.

**Parameters:**

- `$sanitizer` (array): Sanitization callbacks keyed by field name
    ```php
    $sanitizer = [
        'store_name'          => 'sanitize_text_field',
        'currency'            => 'sanitize_text_field',
        'checkout_page_id'    => 'intval',
        'shop_page_id'        => 'intval',
        'store_address1'      => 'sanitize_text_field',
        'store_country'       => 'sanitize_text_field',
        'order_mode'          => 'sanitize_text_field',
        // ... more fields
    ];
    ```

**Returns:** `array` — The modified sanitizer array

**Source:** `app/Http/Requests/FluentMetaRequest.php:136`

**Usage:**
```php
add_filter('fluent_cart/store_settings/sanitizer', function ($sanitizer) {
    // Add sanitizer for a custom field
    $sanitizer['custom_field'] = 'sanitize_text_field';
    return $sanitizer;
});
```
</details>

### <code> confirmation_setting_fields </code>
<details>
<summary><code>fluent_cart/confirmation_setting_fields</code> &mdash; Filter confirmation page settings fields</summary>

**When it runs:**
This filter is applied when rendering the confirmation (receipt) page settings in the admin. Use it to add additional settings fields for the order confirmation page.

**Parameters:**

- `$fields` (array): Field definitions for the confirmation page settings
    ```php
    $fields = [
        'confirmation_page_id' => [
            'label'   => 'Select custom page',
            'type'    => 'select',
            'options' => $pages, // array of WordPress pages
            'value'   => '',
            'note'    => '[fluent_cart_receipt] shortcode instruction',
        ],
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified fields array

**Source:** `api/Confirmation.php:76`

**Usage:**
```php
add_filter('fluent_cart/confirmation_setting_fields', function ($fields, $data) {
    // Add a custom confirmation setting
    $fields['show_social_share'] = [
        'label' => 'Show social share buttons',
        'type'  => 'checkbox',
        'value' => 'no',
    ];
    return $fields;
}, 10, 2);
```
</details>

---

## Module Settings

### <code> module_setting/fields </code>
<details>
<summary><code>fluent_cart/module_setting/fields</code> &mdash; Filter module settings form fields</summary>

**When it runs:**
This filter is applied when retrieving module settings field definitions. Modules register their settings fields through this filter.

**Parameters:**

- `$fields` (array): Array of module settings field definitions (empty by default)
    ```php
    $fields = [];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified fields array

**Source:** `api/ModuleSettings.php:21`

**Usage:**
```php
add_filter('fluent_cart/module_setting/fields', function ($fields, $data) {
    // Register a custom module's settings fields
    $fields['custom_module'] = [
        'title'  => 'Custom Module',
        'fields' => [
            [
                'key'   => 'api_key',
                'label' => 'API Key',
                'type'  => 'text',
            ]
        ]
    ];
    return $fields;
}, 10, 2);
```
</details>

### <code> module_setting/default_values </code>
<details>
<summary><code>fluent_cart/module_setting/default_values</code> &mdash; Filter module settings default values</summary>

**When it runs:**
This filter is applied when retrieving all module settings. It provides default values that are merged with saved settings, ensuring newly registered modules have their defaults applied.

**Parameters:**

- `$defaults` (array): Default values for module settings (empty by default)
    ```php
    $defaults = [];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified defaults array keyed by module name

**Source:** `api/ModuleSettings.php:42`

**Usage:**
```php
add_filter('fluent_cart/module_setting/default_values', function ($defaults, $data) {
    // Set defaults for a custom module
    $defaults['custom_module'] = [
        'active'  => 'no',
        'api_key' => '',
        'mode'    => 'sandbox',
    ];
    return $defaults;
}, 10, 2);
```
</details>

### <code> module_settings/plugin_addons </code>
<details>
<summary><code>fluent_cart/module_settings/plugin_addons</code> &mdash; Filter plugin add-on modules list</summary>

**When it runs:**
This filter is applied when listing available plugin add-ons in the module settings page. Use it to register third-party add-on modules that can be installed from the admin.

**Parameters:**

- `$addons` (array): Array of add-on module definitions
    ```php
    $addons = [
        [
            'title'       => 'Elementor Blocks',
            'description' => 'Enable to get Elementor Blocks for FluentCart.',
            'logo'        => 'path/to/logo.svg',
            'dark_logo'   => 'path/to/dark-logo.svg',
            'plugin_slug' => 'fluent-cart-elementor-blocks',
            'plugin_file' => 'fluent-cart-elementor-blocks/fluent-cart-elementor-blocks.php',
            'source_type' => 'cdn',
            'source_link' => 'https://example.com/plugin.zip',
            'upcoming'    => false,
            'repo_link'   => 'https://fluentcart.com/fluentcart-addons',
        ]
    ];
    ```

**Returns:** `array` — The modified add-ons array

**Source:** `app/Http/Controllers/ModuleSettingsController.php:199`

**Usage:**
```php
add_filter('fluent_cart/module_settings/plugin_addons', function ($addons) {
    // Register a custom add-on module
    $addons[] = [
        'title'       => 'My Custom Add-on',
        'description' => 'Extends FluentCart with custom features.',
        'logo'        => plugin_dir_url(__FILE__) . 'logo.svg',
        'plugin_slug' => 'my-custom-addon',
        'plugin_file' => 'my-custom-addon/my-custom-addon.php',
        'source_type' => 'cdn',
        'source_link' => 'https://example.com/my-addon.zip',
        'upcoming'    => false,
    ];
    return $addons;
});
```
</details>

---

## Currency & Formatting

### <code> global_currency_setting </code>
<details>
<summary><code>fluent_cart/global_currency_setting</code> &mdash; Filter global currency settings</summary>

**When it runs:**
This filter is applied when retrieving the global currency configuration. It runs after all currency settings have been resolved from stored values and defaults.

**Parameters:**

- `$settings` (array): The resolved currency settings
    ```php
    $settings = [
        'currency'           => 'USD',
        'locale'             => 'auto',
        'currency_position'  => 'left',
        'currency_separator' => 'dot',
        'decimal_separator'  => '.',
        'decimal_points'     => 0,
        'settings_type'      => 'global',
        'order_mode'         => 'test',
        'is_zero_decimal'    => false,
        'currency_sign'      => '$',
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified currency settings

**Source:** `api/CurrencySettings.php:52`

**Usage:**
```php
add_filter('fluent_cart/global_currency_setting', function ($settings, $data) {
    // Override currency settings
    $settings['currency'] = 'EUR';
    $settings['currency_sign'] = '€';
    $settings['currency_position'] = 'right';
    return $settings;
}, 10, 2);
```
</details>

### <code> available_currencies </code>
<details>
<summary><code>fluent_cart/available_currencies</code> &mdash; Filter available currencies for the store</summary>

**When it runs:**
This filter is applied when retrieving the list of available currencies for the currency selector in store settings.

> **Deprecated:** The old hook name `fluent-cart/available_currencies` is deprecated since 1.3.16. Use the new name shown above.

**Parameters:**

- `$currencies` (array): Array of currency definitions keyed by currency code
    ```php
    $currencies = [
        'BDT' => [
            'label'  => 'Bangladeshi Taka',
            'value'  => 'BDT',
            'symbol' => '৳',
        ],
        'USD' => [
            'label'  => 'United State Dollar',
            'value'  => 'USD',
            'symbol' => '$',
        ],
        'GBP' => [
            'label'  => 'United Kingdom',
            'value'  => 'GBP',
            'symbol' => '£',
        ],
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified currencies array

**Source:** `app/Helpers/Status.php`

**Usage:**
```php
add_filter('fluent_cart/available_currencies', function ($currencies, $data) {
    // Add a custom currency option
    $currencies['BTC'] = [
        'label'  => 'Bitcoin',
        'value'  => 'BTC',
        'symbol' => '₿',
    ];
    return $currencies;
}, 10, 2);
```
</details>

### <code> accepted_currencies </code>
<details>
<summary><code>fluent_cart/accepted_currencies</code> &mdash; Filter the full list of accepted currencies</summary>

**When it runs:**
This filter is applied when retrieving the complete list of currencies supported by payment gateways (based on Stripe's currency list). Used for currency validation and display throughout the plugin.

**Parameters:**

- `$currencies` (array): Associative array of currency code to localized name
    ```php
    $currencies = [
        'AED' => 'United Arab Emirates Dirham',
        'AFN' => 'Afghan Afghani',
        'ALL' => 'Albanian Lek',
        'AMD' => 'Armenian Dram',
        'ANG' => 'Netherlands Antillean Gulden',
        'AUD' => 'Australian Dollar',
        'USD' => 'United States Dollar',
        // ... 130+ currencies
    ];
    ```

**Returns:** `array` — The modified currencies array

**Source:** `app/Helpers/CurrenciesHelper.php:20`

**Usage:**
```php
add_filter('fluent_cart/accepted_currencies', function ($currencies) {
    // Remove a currency from the accepted list
    unset($currencies['XRP']);
    // Add a custom currency
    $currencies['CUSTOM'] = 'My Custom Currency';
    return $currencies;
});
```
</details>

### <code> global_currency_symbols </code>
<details>
<summary><code>fluent_cart/global_currency_symbols</code> &mdash; Filter currency symbols map</summary>

**When it runs:**
This filter is applied when retrieving the mapping of currency codes to their display symbols. Used for formatting prices throughout the plugin.

**Parameters:**

- `$symbols` (array): Associative array of currency code to HTML symbol entity
    ```php
    $symbols = [
        'AED' => '&#x62f;.&#x625;',
        'AUD' => '&#36;',
        'BDT' => '&#2547;&nbsp;',
        'EUR' => '&euro;',
        'GBP' => '&pound;',
        'USD' => '&#36;',
        // ... many more
    ];
    ```

**Returns:** `array` — The modified currency symbols array

**Source:** `app/Helpers/CurrenciesHelper.php:195`

**Usage:**
```php
add_filter('fluent_cart/global_currency_symbols', function ($symbols) {
    // Override a symbol
    $symbols['BDT'] = 'Tk';
    return $symbols;
});
```
</details>

### <code> zero_decimal_currencies </code>
<details>
<summary><code>fluent_cart/zero_decimal_currencies</code> &mdash; Filter zero-decimal currencies list</summary>

**When it runs:**
This filter is applied when retrieving currencies that do not use decimal subunits (e.g., Japanese Yen). These currencies store amounts without dividing by 100.

**Parameters:**

- `$currencies` (array): Associative array of zero-decimal currency code to localized name
    ```php
    $currencies = [
        'BIF' => 'Burundian Franc',
        'CLP' => 'Chilean Peso',
        'DJF' => 'Djiboutian Franc',
        'GNF' => 'Guinean Franc',
        'JPY' => 'Japanese Yen',
        'KMF' => 'Comorian Franc',
        'KRW' => 'South Korean Won',
        'MGA' => 'Malagasy Ariary',
        'PYG' => 'Paraguayan Guaraní',
        'RWF' => 'Rwandan Franc',
        'VND' => 'Vietnamese Dong',
        'VUV' => 'Vanuatu Vatu',
        'XAF' => 'Central African Cfa Franc',
        'XOF' => 'West African Cfa Franc',
        'XPF' => 'Cfp Franc',
        'UGX' => 'Ugandan Shilling',
    ];
    ```

**Returns:** `array` — The modified zero-decimal currencies array

**Source:** `app/Helpers/CurrenciesHelper.php:383`

**Usage:**
```php
add_filter('fluent_cart/zero_decimal_currencies', function ($currencies) {
    // Add a custom zero-decimal currency
    $currencies['ISK'] = 'Icelandic Krona';
    return $currencies;
});
```
</details>

### <code> hide_unnecessary_decimals </code>
<details>
<summary><code>fluent_cart/hide_unnecessary_decimals</code> &mdash; Filter whether to hide .00 decimals in formatted prices</summary>

**When it runs:**
This filter is applied during price formatting. When true, prices like `$10.00` will display as `$10` instead.

**Parameters:**

- `$hide` (bool): Whether to hide unnecessary decimals (default: `false`)
- `$context` (array): The amount and decimal context
    ```php
    $context = [
        'amount'  => 10.00,  // The amount being formatted
        'decimal' => 2,      // Number of decimal places
    ];
    ```

**Returns:** `bool` — Whether to hide unnecessary trailing zeros

**Source:** `app/Helpers/Helper.php:343`

**Usage:**
```php
add_filter('fluent_cart/hide_unnecessary_decimals', function ($hide, $context) {
    // Always hide .00 from displayed prices
    return true;
}, 10, 2);
```
</details>

---

## Admin UI & Menu

### <code> admin_menu_title </code>
<details>
<summary><code>fluent_cart/admin_menu_title</code> &mdash; Filter admin menu title</summary>

**When it runs:**
This filter is applied when registering the WordPress admin menu, allowing you to change the menu label shown in the sidebar.

**Parameters:**

- `$menuTitle` (string): The default menu title (`'FluentCart'`)
- `$data` (array): Additional context data (empty array)

**Returns:** `string` — The modified menu title

**Source:** `app/Hooks/Handlers/MenuHandler.php:164`

**Usage:**
```php
add_filter('fluent_cart/admin_menu_title', function ($menuTitle, $data) {
    return 'My Store';
}, 10, 2);
```
</details>

### <code> admin_menu_position </code>
<details>
<summary><code>fluent_cart/admin_menu_position</code> &mdash; Filter admin menu position</summary>

**When it runs:**
This filter is applied when registering the admin menu, controlling its position in the WordPress sidebar.

**Parameters:**

- `$position` (int): The menu position (default: `3`)

**Returns:** `int` — The modified menu position

**Source:** `app/Hooks/Handlers/MenuHandler.php:173`

**Usage:**
```php
add_filter('fluent_cart/admin_menu_position', function ($position) {
    // Move menu lower in the sidebar
    return 25;
});
```
</details>

### <code> admin_filter_options </code>
<details>
<summary><code>fluent_cart/admin_filter_options</code> &mdash; Filter admin filter options for list pages</summary>

**When it runs:**
This filter is applied when loading admin filter options for orders, customers, products, licenses, and tax list pages.

**Parameters:**

- `$filterOptions` (array): Filter configurations for each list page
    ```php
    $filterOptions = [
        'order_filter_options'    => [...], // Order list filters
        'customer_filter_options' => [...], // Customer list filters
        'product_filter_options'  => [...], // Product list filters
        'license_filter_options'  => [...], // License list filters
        'tax_filter_options'      => [...], // Tax list filters
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified filter options array

**Source:** `app/Hooks/Handlers/MenuHandler.php:380`

**Usage:**
```php
add_filter('fluent_cart/admin_filter_options', function ($filterOptions, $data) {
    // Add a custom filter for the orders list
    $filterOptions['order_filter_options']['custom_status'] = [
        'label'   => 'Custom Status',
        'type'    => 'select',
        'options' => ['pending', 'approved'],
    ];
    return $filterOptions;
}, 10, 2);
```
</details>

### <code> admin_app_data </code>
<details>
<summary><code>fluent_cart/admin_app_data</code> &mdash; Filter admin Vue app localized data</summary>

**When it runs:**
This filter is applied when loading the admin SPA, providing the full configuration object passed to the Vue application via `wp_localize_script`.

**Parameters:**

- `$adminLocalizeData` (array): The complete admin app data
    ```php
    $adminLocalizeData = [
        'app_config'        => [...],    // App version, permissions, logos
        'slug'              => 'fluent-cart',
        'admin_url'         => 'https://site.com/wp-admin/admin.php?page=fluent-cart#/',
        'frontend_url'      => '...',
        'nonce'             => '...',
        'rest'              => [...],    // REST API config
        'me'                => [...],    // Current user info
        'shop'              => [...],    // Shop configuration
        'product_statuses'  => [...],
        'payment_routes'    => [...],    // Payment gateway admin routes
        'order_statues'     => [...],
        'trans'             => [...],    // Translation strings
        'filter_options'    => [...],
        'modules_settings'  => [...],
        'admin_notices'     => [...],
        // ... many more properties
    ];
    ```

**Returns:** `array` — The modified admin app data

**Source:** `app/Hooks/Handlers/MenuHandler.php:398`

**Usage:**
```php
add_filter('fluent_cart/admin_app_data', function ($adminLocalizeData) {
    // Add custom data accessible from the Vue admin app
    $adminLocalizeData['custom_setting'] = 'custom_value';
    $adminLocalizeData['my_plugin_config'] = [
        'enabled' => true,
        'api_url' => 'https://api.example.com',
    ];
    return $adminLocalizeData;
});
```
</details>

### <code> admin_notices </code>
<details>
<summary><code>fluent_cart/admin_notices</code> &mdash; Filter admin notices</summary>

**When it runs:**
This filter is applied when loading the admin interface, allowing plugins to inject notices that display in the FluentCart admin panel.

**Parameters:**

- `$notices` (array): Array of notice objects (default: `[]`)

**Returns:** `array` — The modified notices array

**Source:** `app/Hooks/Handlers/MenuHandler.php:449`

**Usage:**
```php
add_filter('fluent_cart/admin_notices', function ($notices) {
    $notices[] = [
        'type'    => 'warning',
        'message' => 'Please configure your payment gateway before going live.',
    ];
    return $notices;
});
```
</details>

### <code> admin_base_url </code>
<details>
<summary><code>fluent_cart/admin_base_url</code> &mdash; Filter admin base URL</summary>

**When it runs:**
This filter is applied when constructing admin navigation URLs throughout the plugin, including product menus and global navigation items.

**Parameters:**

- `$baseUrl` (string): The default admin base URL (`admin_url('admin.php?page=fluent-cart#/')`)
- `$data` (array): Additional context data (empty array)

**Returns:** `string` — The modified base URL

**Source:** `app/Helpers/AdminHelper.php:22`

**Usage:**
```php
add_filter('fluent_cart/admin_base_url', function ($baseUrl, $data) {
    // Use a custom admin page
    return admin_url('admin.php?page=my-custom-cart#/');
}, 10, 2);
```
</details>

### <code> admin_saved_views </code>
<details>
<summary><code>fluent_cart/admin_saved_views</code> &mdash; Filter admin table saved views configuration</summary>

**When it runs:**
Applied when loading the admin panel table configuration, including saved views for orders, products, customers, and other list tables.

**Source:** `app/Hooks/Handlers/MenuHandler.php:385`

**Parameters:**

- `$tableConfig` (array): The table configuration with saved views
- `$data` (array): Context data
    ```php
    $data = [
        'filterOptions' => [...], // Available filter options for tables
    ];
    ```

**Returns:**
- `array` — The modified table configuration

**Usage:**
```php
add_filter('fluent_cart/admin_saved_views', function ($tableConfig, $data) {
    // Add a custom saved view for orders
    $tableConfig['orders']['views'][] = [
        'title'   => __('High Value Orders', 'my-plugin'),
        'filters' => ['min_total' => 10000],
    ];
    return $tableConfig;
}, 10, 2);
```
</details>

### <code> frontend_assets/should_load_global </code>
<details>
<summary><code>fluent_cart/frontend_assets/should_load_global</code> &mdash; Control global frontend asset loading</summary>

**When it runs:**
Applied when determining whether to load FluentCart's global frontend CSS and JS assets on the current page.

**Source:** `app/Modules/Templating/AssetLoader.php:44`

**Parameters:**

- `$shouldLoad` (bool): Whether assets should be loaded
- `$data` (array): Context data
    ```php
    $data = [
        'page_type'             => 'shop',   // Current FC page type
        'is_marked'             => false,     // Whether page is marked for assets
        'is_fluentcart_context' => true,      // Whether in FC context
        'is_instant_checkout'   => false,     // Instant checkout request
        'is_modal_checkout'     => false,     // Modal checkout request
    ];
    ```

**Returns:**
- `bool` — Whether to load global assets

**Usage:**
```php
add_filter('fluent_cart/frontend_assets/should_load_global', function ($shouldLoad, $data) {
    // Always load assets on the homepage
    if (is_front_page()) {
        return true;
    }
    return $shouldLoad;
}, 10, 2);
```
</details>

### <code> product_admin_items </code>
<details>
<summary><code>fluent_cart/product_admin_items</code> &mdash; Filter admin product action menu items</summary>

**When it runs:**
This filter is applied when rendering the product action menu in the admin product detail view. Use it to add custom navigation tabs to individual product pages.

**Parameters:**

- `$menuItems` (array): Array of menu item definitions
    ```php
    $menuItems = [
        'product_edit' => [
            'label' => 'Edit Product',
            'link'  => 'admin.php?page=fluent-cart#/products/123',
        ],
        'product_upgrade_paths' => [
            'label' => 'Upgrade Paths',
            'link'  => 'admin.php?page=fluent-cart#/products/123/upgrade-paths',
        ],
        'product_integrations' => [
            'label' => 'Integrations',
            'link'  => 'admin.php?page=fluent-cart#/products/123/integrations',
        ],
    ];
    ```
- `$context` (array): Context data with product info
    ```php
    $context = [
        'product_id' => 123,
        'base_url'   => 'admin.php?page=fluent-cart#/',
    ];
    ```

**Returns:** `array` — The modified menu items array

**Source:** `app/Helpers/AdminHelper.php:24`

**Usage:**
```php
add_filter('fluent_cart/product_admin_items', function ($menuItems, $context) {
    $productId = $context['product_id'];
    $baseUrl = $context['base_url'];
    // Add a custom product tab
    $menuItems['product_analytics'] = [
        'label' => 'Analytics',
        'link'  => $baseUrl . 'products/' . $productId . '/analytics',
    ];
    return $menuItems;
}, 10, 2);
```
</details>

### <code> global_admin_menu_items </code>
<details>
<summary><code>fluent_cart/global_admin_menu_items</code> &mdash; Filter global admin navigation menu</summary>

**When it runs:**
This filter is applied when rendering the global admin navigation bar at the top of the FluentCart admin pages. Use it to add or modify top-level navigation items.

**Parameters:**

- `$menuItems` (array): Array of navigation items
    ```php
    $menuItems = [
        'dashboard' => [
            'label' => 'Dashboard',
            'link'  => 'admin.php?page=fluent-cart#/',
        ],
        'orders' => [
            'label'      => 'Orders',
            'link'       => 'admin.php?page=fluent-cart#/orders',
            'permission' => ['orders/view'],
        ],
        'customers' => [
            'label'      => 'Customers',
            'link'       => 'admin.php?page=fluent-cart#/customers',
            'permission' => ['customers/view', 'customers/manage'],
        ],
        'products' => [
            'label'      => 'Products',
            'link'       => 'admin.php?page=fluent-cart#/products',
            'permission' => ['products/view'],
        ],
    ];
    ```

**Returns:** `array` — The modified menu items array

**Source:** `app/Helpers/AdminHelper.php:80`

**Usage:**
```php
add_filter('fluent_cart/global_admin_menu_items', function ($menuItems) {
    // Add a custom top-level navigation item
    $menuItems['custom_reports'] = [
        'label'      => 'Custom Reports',
        'link'       => admin_url('admin.php?page=fluent-cart#/custom-reports'),
        'permission' => ['reports/view'],
    ];
    return $menuItems;
});
```
</details>

### <code> dummy_product_info </code>
<details>
<summary><code>fluent_cart/dummy_product_info</code> &mdash; Filter dummy product for onboarding</summary>

**When it runs:**
This filter is applied when loading the admin app data. It provides dummy product information used during the onboarding flow when the store has no products yet.

**Parameters:**

- `$dummyProduct` (array): Dummy product info (default: `[]`)

**Returns:** `array` — The modified dummy product info

**Source:** `app/Hooks/Handlers/MenuHandler.php:435`

**Usage:**
```php
add_filter('fluent_cart/dummy_product_info', function ($dummyProduct) {
    return [
        'title' => 'Sample Digital Product',
        'price' => 2999, // in cents
        'type'  => 'digital',
    ];
});
```
</details>

### <code> storage_driver_settings_routes </code>
<details>
<summary><code>fluent_cart/storage/storage_driver_settings_routes</code> &mdash; Filter storage driver admin routes</summary>

**When it runs:**
This filter is applied when loading the admin app, allowing storage driver plugins to register their settings routes in the admin SPA navigation.

**Parameters:**

- `$routes` (array): Array of storage driver route definitions (default: `[]`)
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified routes array

**Source:** `app/Hooks/Handlers/MenuHandler.php:367`

**Usage:**
```php
add_filter('fluent_cart/storage/storage_driver_settings_routes', function ($routes, $data) {
    $routes[] = [
        'key'   => 's3_storage',
        'title' => 'S3 Storage',
        'route' => 'settings/storage/s3',
    ];
    return $routes;
}, 10, 2);
```
</details>

---

## Permissions & Auth

### <code> permission/all_roles </code>
<details>
<summary><code>fluent_cart/permission/all_roles</code> &mdash; Filter permission roles</summary>

**When it runs:**
This filter is applied when retrieving all available permission roles. FluentCart ships with four roles (super_admin, manager, worker, accountant), each with predefined permission sets.

**Parameters:**

- `$allRoles` (array): Array of role definitions
    ```php
    $allRoles = [
        'super_admin' => [
            'title'        => 'Super Admin',
            'descriptions' => 'All permissions...',
            'permissions'  => ['*'],
        ],
        'manager' => [
            'title'        => 'Manager',
            'descriptions' => 'Everything except settings...',
            'permissions'  => [
                'orders/view', 'orders/manage', 'orders/manage_statuses',
                'orders/export', 'orders/delete', 'products/view',
                'products/manage', 'products/delete', 'customers/view',
                'customers/manage', 'subscriptions/view',
                'subscriptions/manage', 'licenses/view', 'licenses/manage',
                'coupons/view', 'coupons/manage', 'coupons/delete',
                'reports/view', 'reports/export', 'integrations/view',
                'integrations/manage', 'integrations/delete',
            ],
        ],
        'worker' => [
            'title'        => 'Worker',
            'descriptions' => 'View access for products, customers...',
            'permissions'  => [
                'products/view', 'customers/view', 'orders/view',
                'orders/manage_statuses', 'subscriptions/view',
                'licenses/view', 'coupons/view', 'coupons/manage',
                'integrations/view',
            ],
        ],
        'accountant' => [
            'title'        => 'Accountant',
            'descriptions' => 'View access for products, customers, orders...',
            'permissions'  => [
                'orders/view', 'orders/export', 'reports/view',
                'reports/export', 'products/view', 'customers/view',
                'subscriptions/view', 'licenses/view', 'coupons/view',
                'integrations/view',
            ],
        ],
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified roles array

**Source:** `app/Services/Permission/PermissionManager.php:92`

**Usage:**
```php
add_filter('fluent_cart/permission/all_roles', function ($allRoles, $data) {
    // Add a custom role
    $allRoles['support_agent'] = [
        'title'        => 'Support Agent',
        'descriptions' => 'View orders and customers, manage order statuses',
        'permissions'  => [
            'orders/view',
            'orders/manage_statuses',
            'customers/view',
        ],
    ];
    return $allRoles;
}, 10, 2);
```
</details>

---

## Translations

### <code> admin_translations </code>
<details>
<summary><code>fluent_cart/admin_translations</code> &mdash; Filter admin panel translations</summary>

**When it runs:**
This filter is applied when loading translation strings for the admin Vue SPA. The translations are passed to the frontend as a localized JavaScript object.

**Parameters:**

- `$translations` (array): Key-value pairs of translation strings loaded from `admin-translation.php`
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified translations array

**Source:** `app/Services/Translations/TransStrings.php:9`

**Usage:**
```php
add_filter('fluent_cart/admin_translations', function ($translations, $data) {
    // Override or add admin translations
    $translations['custom_label'] = __('My Custom Label', 'my-plugin');
    return $translations;
}, 10, 2);
```
</details>

### <code> blocks_translations </code>
<details>
<summary><code>fluent_cart/blocks_translations</code> &mdash; Filter block editor translations</summary>

**When it runs:**
This filter is applied when loading translation strings for the FluentCart block editor interface.

**Parameters:**

- `$translations` (array): Key-value pairs of translation strings loaded from `block-editor-translation.php`
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified translations array

**Source:** `app/Services/Translations/TransStrings.php:15`

**Usage:**
```php
add_filter('fluent_cart/blocks_translations', function ($translations, $data) {
    // Override block editor translations
    $translations['Save'] = __('Save Changes', 'my-plugin');
    return $translations;
}, 10, 2);
```
</details>

### <code> customer_profile_translations </code>
<details>
<summary><code>fluent_cart/customer_profile_translations</code> &mdash; Filter customer profile translations</summary>

**When it runs:**
This filter is applied when loading translation strings for the customer profile (My Account) frontend page.

**Parameters:**

- `$translations` (array): Key-value pairs of translation strings loaded from `customer-profile-translation.php`
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified translations array

**Source:** `app/Services/Translations/TransStrings.php:87`

**Usage:**
```php
add_filter('fluent_cart/customer_profile_translations', function ($translations, $data) {
    // Customize customer-facing labels
    $translations['My Orders'] = __('Purchase History', 'my-plugin');
    return $translations;
}, 10, 2);
```
</details>

### <code> checkout_translations </code>
<details>
<summary><code>fluent_cart/checkout_translations</code> &mdash; Filter checkout page translations</summary>

**When it runs:**
This filter is applied when loading translation strings for the checkout page frontend.

**Parameters:**

- `$translations` (array): Key-value pairs of translation strings loaded from `checkout-translation.php`
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified translations array

**Source:** `app/Services/Translations/TransStrings.php:101`

**Usage:**
```php
add_filter('fluent_cart/checkout_translations', function ($translations, $data) {
    // Customize checkout button text
    $translations['Place Order'] = __('Complete Purchase', 'my-plugin');
    return $translations;
}, 10, 2);
```
</details>

### <code> payments_translations </code>
<details>
<summary><code>fluent_cart/payments_translations</code> &mdash; Filter payment translations</summary>

**When it runs:**
This filter is applied when loading translation strings for payment-related UI elements on the frontend.

**Parameters:**

- `$translations` (array): Key-value pairs of translation strings loaded from `payments-translation.php`
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified translations array

**Source:** `app/Services/Translations/TransStrings.php:107`

**Usage:**
```php
add_filter('fluent_cart/payments_translations', function ($translations, $data) {
    // Customize payment labels
    $translations['Credit Card'] = __('Debit/Credit Card', 'my-plugin');
    return $translations;
}, 10, 2);
```
</details>

### <code> pro/admin_translations </code> <Badge type="warning" text="Pro" />
<details>
<summary><code>fluent_cart_pro/admin_translations</code> &mdash; Filter Pro admin translations</summary>

**When it runs:**
This filter is applied when loading translation strings specific to FluentCart Pro features in the admin panel.

**Parameters:**

- `$translations` (array): Key-value pairs of Pro-specific translation strings
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified translations array

**Source:** `fluent-cart-pro/app/Services/Translations/Translations.php:24`

**Usage:**
```php
add_filter('fluent_cart_pro/admin_translations', function ($translations, $data) {
    // Override Pro admin translations
    $translations['License Management'] = __('License Keys', 'my-plugin');
    return $translations;
}, 10, 2);
```
</details>

---

## Email & Notifications

### <code> email_notifications </code>
<details>
<summary><code>fluent_cart/email_notifications</code> &mdash; Filter email notification settings</summary>

**When it runs:**
This filter is applied when retrieving the list of available email notifications. Each notification includes its configuration such as recipients, subject template, and default body. Runs before merging with saved notification configs.

**Parameters:**

- `$settings` (array): Associative array of notification definitions keyed by notification name
    ```php
    $settings = [
        'order_completed' => [
            'title'       => 'Order Completed',
            'group_label' => 'Order Actions',
            'settings'    => [
                'subject'         => 'Order #{order.id} Completed',
                'email_body'      => '',
                'is_default_body' => 'yes',
                'to'              => '{{order.customer.email}}',
                'status'          => 'active',
            ],
        ],
        // ... more notification types
    ];
    ```

**Returns:** `array` — The modified notification settings array

**Source:** `app/Services/Email/EmailNotifications.php:24`

**Usage:**
```php
add_filter('fluent_cart/email_notifications', function ($settings) {
    // Add a custom email notification
    $settings['custom_notification'] = [
        'title'       => 'Custom Alert',
        'group_label' => 'Custom Actions',
        'settings'    => [
            'subject'         => 'Custom Alert for Order #{order.id}',
            'email_body'      => '',
            'is_default_body' => 'yes',
            'to'              => '{{settings.admin_email}}',
            'status'          => 'active',
        ],
    ];
    return $settings;
});
```
</details>

### <code> keep_email_body_draft </code>
<details>
<summary><code>fluent_cart/keep_email_body_draft</code> &mdash; Filter whether to prevent email body reset</summary>

**When it runs:**
This filter is applied when a notification is switched back to its default body. By default, the custom email body is cleared. Return `true` to preserve the custom body as a draft.

**Parameters:**

- `$keepDraft` (bool): Whether to keep the custom body as draft (default: `false`)
- `$context` (array): The notification context
    ```php
    $context = [
        'notification_name' => 'order_completed',
    ];
    ```

**Returns:** `bool` — Whether to preserve the custom email body

**Source:** `app/Services/Email/EmailNotifications.php:520`

**Usage:**
```php
add_filter('fluent_cart/keep_email_body_draft', function ($keepDraft, $context) {
    // Always preserve custom email bodies as drafts
    return true;
}, 10, 2);
```
</details>

### <code> prepare_email_template_data </code>
<details>
<summary><code>fluent_cart/prepare_email_template_data</code> &mdash; Filter email notification template data before saving</summary>

**When it runs:**
Applied when saving email notification settings, allowing the pro version to restore custom email body and template fields.

**Source:** `app/Http/Controllers/EmailNotificationController.php:84`

**Parameters:**

- `$settingsWithoutTemplate` (array): The email settings with template fields stripped
- `$settings` (array): The original complete settings array

**Returns:**
- `array` — The modified settings data to save

**Usage:**
```php
add_filter('fluent_cart/prepare_email_template_data', function ($settings, $original) {
    // Restore custom template fields for pro
    if (isset($original['email_body'])) {
        $settings['email_body'] = $original['email_body'];
    }
    return $settings;
}, 10, 2);
```
</details>

### <code> parse_email_block_content </code>
<details>
<summary><code>fluent_cart/parse_email_block_content</code> &mdash; Parse block editor email content into HTML</summary>

**When it runs:**
Applied when sending email notifications that use block editor content. The pro version hooks this to convert block markup into rendered HTML.

**Source:**
- `app/Services/Email/EmailNotificationMailer.php:249`
- `app/Hooks/CLI/Commands.php:1340`

**Parameters:**

- `$html` (string): The parsed HTML output (default `''`)
- `$blockMarkup` (string): The raw block editor markup
- `$data` (array): Template data for shortcode replacement

**Returns:**
- `string` — The rendered HTML from block content

**Usage:**
```php
add_filter('fluent_cart/parse_email_block_content', function ($html, $blockMarkup, $data) {
    // Custom block parser
    return my_custom_block_parser($blockMarkup, $data);
}, 10, 3);
```
</details>

### <code> render_block_email_template </code>
<details>
<summary><code>fluent_cart/render_block_email_template</code> &mdash; Wrap parsed email content in a template</summary>

**When it runs:**
Applied after block email content is parsed, allowing the pro version to wrap it in an email template with header, footer, and styling.

**Source:**
- `app/Services/Email/EmailNotificationMailer.php:256`
- `app/Hooks/CLI/Commands.php:1351`

**Parameters:**

- `$html` (string): The parsed email body HTML
- `$data` (array): Template data
    ```php
    $data = [
        'emailBody'   => '...',  // The parsed email body
        'preheader'   => '...',  // Email preheader text
        'emailFooter' => '...',  // Email footer HTML
    ];
    ```

**Returns:**
- `string` — The fully wrapped email HTML

**Usage:**
```php
add_filter('fluent_cart/render_block_email_template', function ($html, $data) {
    // Use a custom email wrapper template
    return my_email_wrapper($data['emailBody'], $data['preheader'], $data['emailFooter']);
}, 10, 2);
```
</details>

### <code> pdf_einvoice_data </code>
<details>
<summary><code>fluent_cart/pdf_einvoice_data</code> &mdash; Filter e-invoice data for PDF generation</summary>

**When it runs:**
Applied when generating order receipt PDFs, allowing the pro version to attach e-invoice data (ZUGFeRD/Factur-X XML) for electronic invoicing compliance.

**Source:** `app/Services/PDF/OrderReceiptPdfService.php:81`

**Parameters:**

- `$eInvoiceData` (array): E-invoice configuration
    ```php
    $eInvoiceData = [
        'enabled'         => false, // Whether e-invoicing is enabled
        'xml'             => null,  // The XML data to embed
        'pdfa_compatible' => false, // Whether PDF/A compatibility is needed
    ];
    ```
- `$order` (Order): The order model
- `$meta` (array): Order metadata

**Returns:**
- `array` — The modified e-invoice data

**Usage:**
```php
add_filter('fluent_cart/pdf_einvoice_data', function ($data, $order, $meta) {
    // Enable ZUGFeRD for EU orders
    if (in_array($order->country, ['DE', 'FR', 'IT'])) {
        $data['enabled'] = true;
        $data['pdfa_compatible'] = true;
        $data['xml'] = generate_zugferd_xml($order);
    }
    return $data;
}, 10, 3);
```
</details>

### <code> pdf_templates/mpdf_config </code>
<details>
<summary><code>fluent_cart/pdf_templates/mpdf_config</code> &mdash; Filter mPDF configuration for PDF generation</summary>

**When it runs:**
Applied before PDF generation, allowing customization of mPDF rendering options such as fonts, margins, and encoding.

**Source:** `app/Services/PDF/PdfGeneratorService.php:61`

**Parameters:**

- `$mpdfConfig` (array): The mPDF configuration array

**Returns:**
- `array` — The modified mPDF configuration

**Usage:**
```php
add_filter('fluent_cart/pdf_templates/mpdf_config', function ($config) {
    // Set custom margins and default font
    $config['margin_left'] = 15;
    $config['margin_right'] = 15;
    $config['default_font'] = 'dejavusans';
    return $config;
});
```
</details>

### <code> theme_pref </code>
<details>
<summary><code>fluent_cart/theme_pref</code> &mdash; Filter email template theme preferences</summary>

**When it runs:**
This filter is applied when the block parser resolves the email theme preferences, including the color palette and font sizes used in email templates.

**Parameters:**

- `$pref` (array): Theme preference settings
    ```php
    $pref = [
        'colors'     => [...], // Color palette array
        'font_sizes' => [...], // Font size definitions
    ];
    ```

**Returns:** `array` — The modified theme preferences

**Source:** `app/Services/Email/FluentBlockParser.php:1997`

**Usage:**
```php
add_filter('fluent_cart/theme_pref', function ($pref) {
    // Add brand colors to the email palette
    $pref['colors'][] = [
        'name'  => 'Brand Primary',
        'slug'  => 'brand-primary',
        'color' => '#FF6600',
    ];
    return $pref;
});
```
</details>

### <code> condition_presets </code>
<details>
<summary><code>fluent_cart/condition_presets</code> &mdash; Filter email condition presets</summary>

**When it runs:**
This filter is applied when retrieving available condition presets for email template conditional blocks. Presets define reusable conditions like "has note" or "has downloads" that control block visibility.

**Parameters:**

- `$presets` (array): Array of condition preset definitions
    ```php
    $presets = [
        [
            'id'           => 'has_order_note',
            'label'        => 'Has Order Note',
            'hint'         => 'Show when the order has a note.',
            'shortcode'    => '{{order.note}}',
            'condition'    => 'not_empty',
            'compareValue' => '',
        ],
        [
            'id'           => 'has_downloads',
            'label'        => 'Has Downloads',
            'hint'         => 'Show when downloadable files are attached.',
            'shortcode'    => '{{order.downloads}}',
            'condition'    => 'not_empty',
            'compareValue' => '',
        ],
    ];
    ```

**Returns:** `array` — The modified presets array

**Source:** `app/Services/Email/ConditionPresets.php:124`

**Usage:**
```php
add_filter('fluent_cart/condition_presets', function ($presets) {
    // Add a custom condition preset
    $presets[] = [
        'id'           => 'is_high_value',
        'label'        => 'High Value Order',
        'hint'         => 'Show when order total exceeds $100.',
        'shortcode'    => '{{order.total_amount}}',
        'condition'    => 'greater_than',
        'compareValue' => '10000', // in cents
    ];
    return $presets;
});
```
</details>

### <code> evaluate_condition_preset </code>
<details>
<summary><code>fluent_cart/evaluate_condition_preset</code> &mdash; Filter evaluate condition preset</summary>

**When it runs:**
This filter is applied when evaluating a condition preset that has no shortcode and no callback defined. It serves as a fallback for custom condition evaluation logic.

**Parameters:**

- `$result` (bool): The evaluation result (default: `false`)
- `$context` (array): Full context for the condition evaluation
    ```php
    $context = [
        'preset'      => [...],  // The resolved preset definition
        'resolved'    => [...],  // Resolved condition data
        'data'        => [...],  // Template data (order, customer, etc.)
        'block_attrs' => [...],  // Block attributes
    ];
    ```

**Returns:** `bool` — Whether the condition is met

**Source:** `app/Services/Email/Blocks/BaseBlock.php:196`

**Usage:**
```php
add_filter('fluent_cart/evaluate_condition_preset', function ($result, $context) {
    $preset = $context['preset'];
    if ($preset && $preset['id'] === 'my_custom_condition') {
        $order = $context['data']['order'] ?? null;
        return $order && $order->total_amount > 10000;
    }
    return $result;
}, 10, 2);
```
</details>

### <code> confirmation_shortcodes </code>
<details>
<summary><code>fluent_cart/confirmation_shortcodes</code> &mdash; Filter confirmation page shortcodes</summary>

**When it runs:**
This filter is applied when retrieving available shortcodes for the order confirmation (receipt) page template editor.

**Parameters:**

- `$groups` (array): Array of shortcode groups (customer, order, general, settings)
    ```php
    $groups = [
        [
            'title'      => 'Customer',
            'key'        => 'customer',
            'shortcodes' => [
                '{{customer.first_name}}' => 'First Name',
                '{{customer.email}}'      => 'Email',
            ],
        ],
        [
            'title'      => 'Order',
            'key'        => 'order',
            'shortcodes' => [
                '{{order.id}}'                     => 'Order ID',
                '{{order.total_amount_formatted}}' => 'Order Total',
                // ... many more
            ],
        ],
        // ... general, settings groups
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified shortcode groups array

**Source:** `app/Helpers/EditorShortCodeHelper.php:201`

**Usage:**
```php
add_filter('fluent_cart/confirmation_shortcodes', function ($groups, $data) {
    // Add a custom shortcode group
    $groups[] = [
        'title'      => 'Custom Data',
        'key'        => 'custom',
        'shortcodes' => [
            '{{custom.tracking_url}}' => 'Tracking URL',
        ],
    ];
    return $groups;
}, 10, 2);
```
</details>

### <code> editor_shortcodes </code>
<details>
<summary><code>fluent_cart/editor_shortcodes</code> &mdash; Filter email editor shortcodes</summary>

**When it runs:**
This filter is applied when retrieving available shortcodes for the email notification template editor. Includes order, general, customer, transaction, settings, and license shortcode groups.

**Parameters:**

- `$shortCodes` (array): Associative array of shortcode groups
    ```php
    $shortCodes = [
        'order'       => [...], // Order shortcodes
        'general'     => [...], // General shortcodes
        'customer'    => [...], // Customer shortcodes
        'transaction' => [...], // Transaction shortcodes
        'settings'    => [...], // Settings shortcodes
        'license'     => [...], // License shortcodes
    ];
    ```

**Returns:** `array` — The modified shortcodes array

**Source:** `app/Helpers/EditorShortCodeHelper.php:277`

**Usage:**
```php
add_filter('fluent_cart/editor_shortcodes', function ($shortCodes) {
    // Add a custom shortcode group for email templates
    $shortCodes['custom'] = [
        'title'      => 'Custom Fields',
        'key'        => 'custom',
        'shortcodes' => [
            '{{custom.loyalty_points}}' => 'Loyalty Points',
            '{{custom.referral_code}}'  => 'Referral Code',
        ],
    ];
    return $shortCodes;
});
```
</details>

### <code> disable_email_celebration_messages </code>
<details>
<summary><code>fluent_cart/disable_email_celebration_messages</code> &mdash; Filter whether to disable celebration messages in admin emails</summary>

**When it runs:**
This filter is applied when generating admin notification emails. By default, FluentCart adds a random celebration message (e.g., "Woo-Hoo! Another Sale!") to admin order emails.

**Parameters:**

- `$disable` (bool): Whether to disable celebration messages (default: `false`)
- `$context` (array): The notification type context
    ```php
    $context = [
        'type' => 'order', // or 'subscription', etc.
    ];
    ```

**Returns:** `bool` — Whether to disable the celebration messages

**Source:** `app/Services/TemplateService.php:114`

**Usage:**
```php
add_filter('fluent_cart/disable_email_celebration_messages', function ($disable, $context) {
    // Disable celebrations for all admin emails
    return true;
}, 10, 2);
```
</details>

---

## Block Editor

### <code> block_editor_require_nonce </code>
<details>
<summary><code>fluent_cart/block_editor_require_nonce</code> &mdash; Filter whether the block editor requires nonce verification</summary>

**When it runs:**
This filter is applied when loading the FluentCart block editor (email template editor). It controls whether nonce verification is enforced for editor access.

**Parameters:**

- `$requireNonce` (bool): Whether to require nonce (default: `true`)
- `$blockType` (string): The block editor type being loaded
- `$request` (array): The current request data

**Returns:** `bool` — Whether to enforce nonce verification

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php:54`

**Usage:**
```php
add_filter('fluent_cart/block_editor_require_nonce', function ($requireNonce, $blockType, $request) {
    // Disable nonce for specific block types (use with caution)
    if ($blockType === 'preview') {
        return false;
    }
    return $requireNonce;
}, 10, 3);
```
</details>

### <code> disable_pro_email_templates </code>
<details>
<summary><code>fluent_cart/disable_pro_email_templates</code> &mdash; Filter whether to disable Pro email templates</summary>

**When it runs:**
This filter is applied when loading starter templates in the email block editor. When `true`, templates with `/pro` or `/modern` in their IDs are excluded from the template picker.

**Parameters:**

- `$disable` (bool): Whether to disable Pro templates (default: `true`)

**Returns:** `bool` — Whether to filter out Pro email templates

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php:230`

**Usage:**
```php
add_filter('fluent_cart/disable_pro_email_templates', function ($disable) {
    // Enable Pro templates when Pro is active
    if (defined('FLUENT_CART_PRO')) {
        return false;
    }
    return $disable;
});
```
</details>

### <code> skip_no_conflict (editor) </code>
<details>
<summary><code>fluent_cart_editor/skip_no_conflict</code> &mdash; Filter whether to skip script unloading in the block editor</summary>

**When it runs:**
This filter is applied when the email block editor loads. FluentCart aggressively unloads third-party scripts to prevent conflicts. Return `true` to skip this behavior and allow all scripts.

**Parameters:**

- `$skip` (bool): Whether to skip no-conflict mode (default: `false`)

**Returns:** `bool` — Whether to skip unloading third-party scripts

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php:638`

**Usage:**
```php
add_filter('fluent_cart_editor/skip_no_conflict', function ($skip) {
    // Allow all scripts in the block editor
    return true;
});
```
</details>

### <code> asset_listed_slugs (editor) </code>
<details>
<summary><code>fluent_cart_editor/asset_listed_slugs</code> &mdash; Filter approved script slugs in block editor</summary>

**When it runs:**
This filter is applied when unloading third-party scripts from the email block editor. Only scripts matching these slug patterns (regex) will be kept.

**Parameters:**

- `$approvedSlugs` (array): Array of regex slug patterns to keep
    ```php
    $approvedSlugs = [
        '\/gutenberg\/',
    ];
    // 'fluent-cart' is always appended automatically
    ```

**Returns:** `array` — The modified approved slugs array

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php:650`

**Usage:**
```php
add_filter('fluent_cart_editor/asset_listed_slugs', function ($approvedSlugs) {
    // Allow scripts from a specific plugin
    $approvedSlugs[] = '\/my-custom-plugin\/';
    return $approvedSlugs;
});
```
</details>

### <code> skip_no_conflict (styles) </code>
<details>
<summary><code>fluent_cart/skip_no_conflict</code> &mdash; Filter whether to skip style unloading in the block editor</summary>

**When it runs:**
This filter is applied when unloading third-party stylesheets from the email block editor. Return `true` to allow all styles to load without filtering.

**Parameters:**

- `$skip` (bool): Whether to skip no-conflict mode for styles (default: `false`)
- `$type` (string): The asset type (`'styles'`)

**Returns:** `bool` — Whether to skip unloading third-party styles

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php:707`

**Usage:**
```php
add_filter('fluent_cart/skip_no_conflict', function ($skip, $type) {
    if ($type === 'styles') {
        return true; // Allow all styles
    }
    return $skip;
}, 10, 2);
```
</details>

### <code> asset_listed_slugs (styles) </code>
<details>
<summary><code>fluent_cart/asset_listed_slugs</code> &mdash; Filter approved style slugs in block editor</summary>

**When it runs:**
This filter is applied when filtering third-party stylesheets from the email block editor. Only styles matching these slug patterns (regex) will be kept.

**Parameters:**

- `$approvedSlugs` (array): Array of regex slug patterns to keep
    ```php
    $approvedSlugs = [
        '\/gutenberg\/',
    ];
    // '\/fluent-cart\/' is always appended automatically
    ```

**Returns:** `array` — The modified approved slugs array

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php:720`

**Usage:**
```php
add_filter('fluent_cart/asset_listed_slugs', function ($approvedSlugs) {
    // Allow styles from a specific plugin
    $approvedSlugs[] = '\/my-custom-plugin\/';
    return $approvedSlugs;
});
```
</details>

### <code> block_editor_unregister_all_patterns </code>
<details>
<summary><code>fluent_cart/block_editor_unregister_all_patterns</code> &mdash; Filter whether to unregister default block patterns</summary>

**When it runs:**
This filter is applied when loading the email block editor. By default, all WordPress core block patterns are removed since they are designed for web pages, not emails.

**Parameters:**

- `$shouldUnregister` (bool): Whether to unregister patterns (default: `true`)
- `$context` (string): The editor context
- `$data` (array): Additional context data

**Returns:** `bool` — Whether to unregister default block patterns

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php:764`

**Usage:**
```php
add_filter('fluent_cart/block_editor_unregister_all_patterns', function ($shouldUnregister, $context, $data) {
    // Keep default patterns for a specific context
    if ($context === 'page') {
        return false;
    }
    return $shouldUnregister;
}, 10, 3);
```
</details>

### <code> block_editor_settings </code>
<details>
<summary><code>fluent_cart/block_editor_settings</code> &mdash; Filter block editor settings</summary>

**When it runs:**
This filter is applied when preparing the settings object for the Gutenberg-based email block editor. It includes styles, image sizes, block categories, and editor configuration.

**Parameters:**

- `$editor_settings` (array): Editor configuration array
    ```php
    $editor_settings = [
        '__experimentalFeatures' => [...],
        'styles'                 => [...],   // Editor stylesheets
        'defaultEditorStyles'    => [...],   // Base CSS
        'imageSizes'             => [...],   // Available image sizes
        'blockCategories'        => [...],   // Block categories
    ];
    ```

**Returns:** `array` — The modified editor settings

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php:1142`

**Usage:**
```php
add_filter('fluent_cart/block_editor_settings', function ($editor_settings) {
    // Add a custom block category
    $editor_settings['blockCategories'][] = [
        'slug'  => 'custom-blocks',
        'title' => 'Custom Blocks',
    ];
    return $editor_settings;
});
```
</details>

### <code> editor_allowed_block_types </code>
<details>
<summary><code>fluent_cart/editor_allowed_block_types</code> &mdash; Filter allowed block types in the email editor</summary>

**When it runs:**
This filter is applied when determining which Gutenberg block types are available in the email block editor. Only whitelisted blocks appear in the inserter.

**Parameters:**

- `$allowedBlockTypes` (array): Array of allowed block type names (e.g., `'core/paragraph'`, `'core/image'`, `'fluent-cart/button'`)
- `$editorContext` (string): The editor context such as `'template'`, `'campaign'`, or `'recurring_campaign'`

**Returns:** `array` — The modified allowed block types array

**Source:** `app/Hooks/Handlers/FluentCartBlockEditorHandler.php:1282`

**Usage:**
```php
add_filter('fluent_cart/editor_allowed_block_types', function ($allowedBlockTypes, $editorContext) {
    // Add a custom block to the email editor
    $allowedBlockTypes[] = 'my-plugin/custom-email-block';
    return $allowedBlockTypes;
}, 10, 2);
```
</details>

---

## Logging & Utilities

### <code> logs/allowed_models </code>
<details>
<summary><code>fluent_cart/logs/allowed_models</code> &mdash; Filter models allowed in activity logs</summary>

**When it runs:**
This filter is applied when creating activity log entries. Only module names matching this list will have their model type auto-resolved for log categorization.

**Parameters:**

- `$allowedModels` (array): Array of allowed model name strings
    ```php
    $allowedModels = [
        'order',
        'product',
        'productVariation',
        'user',
        'coupon',
        'subscription',
    ];
    ```

**Returns:** `array` — The modified allowed models array

**Source:** `boot/globals.php:88`

**Usage:**
```php
add_filter('fluent_cart/logs/allowed_models', function ($allowedModels) {
    // Add a custom model for logging
    $allowedModels[] = 'license';
    $allowedModels[] = 'customEntity';
    return $allowedModels;
});
```
</details>

### <code> site_prefix </code>
<details>
<summary><code>fluent_cart/site_prefix</code> &mdash; Filter site prefix for external APIs</summary>

**When it runs:**
This filter is applied when generating a site-specific prefix string derived from the home URL. Used as an identifier when communicating with external APIs or services.

**Parameters:**

- `$sitePrefix` (string): The generated prefix (e.g., `'example_com'` from `https://example.com`)
- `$data` (array): Additional context data (empty array)

**Returns:** `string` — The modified site prefix

**Source:** `app/Helpers/Helper.php:1478`

**Usage:**
```php
add_filter('fluent_cart/site_prefix', function ($sitePrefix, $data) {
    // Use a custom site identifier
    return 'my_store_prod';
}, 10, 2);
```
</details>

### <code> utm/allowed_keys </code>
<details>
<summary><code>fluent_cart/utm/allowed_keys</code> &mdash; Filter allowed UTM parameter keys</summary>

**When it runs:**
This filter is applied when capturing UTM tracking parameters from the checkout URL. Only parameters matching these keys will be stored with orders.

**Parameters:**

- `$keys` (array): Array of allowed UTM parameter key names
    ```php
    $keys = [
        'utm_campaign',
        'utm_content',
        'utm_term',
        'utm_source',
        'utm_medium',
        'utm_id',
        'refer_url',
        'fbclid',
        'gclid',
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:** `array` — The modified allowed keys array

**Source:** `app/Helpers/UtmHelper.php:26`

**Usage:**
```php
add_filter('fluent_cart/utm/allowed_keys', function ($keys, $data) {
    // Track additional parameters
    $keys[] = 'msclkid';     // Microsoft Ads
    $keys[] = 'ttclid';      // TikTok Ads
    $keys[] = 'affiliate_id';
    return $keys;
}, 10, 2);
```
</details>

### <code> cleanup/old_carts_days </code>
<details>
<summary><code>fluent_cart/cleanup/old_carts_days</code> &mdash; Filter days before abandoned cart cleanup</summary>

**When it runs:**
This filter is applied during the daily scheduled cleanup task. Carts older than this number of days (based on `updated_at`) are automatically deleted.

**Parameters:**

- `$days` (int): Number of days before cart deletion (default: `30`)

**Returns:** `int` — The modified number of days

**Source:** `app/Hooks/Scheduler/AutoSchedules/DailyScheduler.php:32`

**Usage:**
```php
add_filter('fluent_cart/cleanup/old_carts_days', function ($days) {
    // Keep abandoned carts for 90 days instead of 30
    return 90;
});
```
</details>

### <code> get_dynamic_search_{$key} </code>
<details>
<summary><code>fluent_cart/get_dynamic_search_{$key}</code> &mdash; Filter dynamic search option results</summary>

**When it runs:**
This filter is applied when the admin settings page performs a dynamic search (e.g., searching for pages, users, or custom entities in select fields). The `{$key}` portion is the `search_for` parameter value.

**Parameters:**

- `$results` (array): Search results (default: `[]`)
- `$context` (array): Search context
    ```php
    $context = [
        'searchBy' => 'search term entered by user',
    ];
    ```

**Returns:** `array` — The search results array

**Source:** `api/Helper.php:165`

**Usage:**
```php
// Example: Register a dynamic search handler for "custom_entities"
add_filter('fluent_cart/get_dynamic_search_custom_entities', function ($results, $context) {
    $searchTerm = $context['searchBy'];
    // Return matching entities
    return [
        ['id' => 1, 'label' => 'Entity One'],
        ['id' => 2, 'label' => 'Entity Two'],
    ];
}, 10, 2);
```
</details>

---
