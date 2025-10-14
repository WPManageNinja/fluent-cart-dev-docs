# Settings & Configuration

All filters related to admin settings, store configuration, and module management.

### <code> admin_app_data </code>

<details open>
<summary><code>fluent_cart/admin_app_data</code> &mdash; Filter admin app data</summary>

**When it runs:**
This filter is applied when loading the admin app, allowing you to modify the data passed to the admin interface.

**Parameters:**

- `$adminLocalizeData` (array): The admin app localization data
    ```php
    $adminLocalizeData = [
        'settings' => [],
        'currencies' => [],
        'user' => [],
        'permissions' => []
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$adminLocalizeData` (array): The modified admin app data

**Usage:**
```php
add_filter('fluent_cart/admin_app_data', function($adminLocalizeData, $data) {
    // Add custom data to admin app
    $adminLocalizeData['custom_setting'] = 'custom_value';
    return $adminLocalizeData;
}, 10, 2);
```
</details>

### <code> store_settings/values </code>
<details>
<summary><code>fluent_cart/store_settings/values</code> &mdash; Filter store settings values</summary>

**When it runs:**
This filter is applied when retrieving store settings values.

**Parameters:**

- `$defaultSettings` (array): The default store settings
    ```php
    $defaultSettings = [
        'store_name' => 'My Store',
        'store_email' => 'store@example.com',
        'currency' => 'USD',
        'tax_enabled' => false
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$defaultSettings` (array): The modified settings array

**Usage:**
```php
add_filter('fluent_cart/store_settings/values', function($defaultSettings, $data) {
    // Modify default store settings
    $defaultSettings['store_name'] = 'My Custom Store';
    return $defaultSettings;
}, 10, 2);
```
</details>

### <code> store_settings/fields </code>
<details>
<summary><code>fluent_cart/store_settings/fields</code> &mdash; Filter store settings fields</summary>

**When it runs:**
This filter is applied when rendering store settings fields in the admin interface.

**Parameters:**

- `$fields` (array): Array of settings field definitions
    ```php
    $fields = [
        'general' => [
            'title' => 'General Settings',
            'fields' => []
        ]
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$fields` (array): The modified fields array

**Usage:**
```php
add_filter('fluent_cart/store_settings/fields', function($fields, $data) {
    // Add a custom settings field
    $fields['custom_section']['fields'][] = [
        'key' => 'custom_field',
        'label' => 'Custom Field',
        'type' => 'text'
    ];
    return $fields;
}, 10, 2);
```
</details>

### <code> admin_menu_title </code>
<details>
<summary><code>fluent_cart/admin_menu_title</code> &mdash; Filter admin menu title</summary>

**When it runs:**
This filter is applied when registering the admin menu, allowing you to change the menu title.

**Parameters:**

- `$menuTitle` (string): The default menu title ('FluentCart')
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$menuTitle` (string): The modified menu title

**Usage:**
```php
add_filter('fluent_cart/admin_menu_title', function($menuTitle, $data) {
    // Change menu title
    return 'My Store';
}, 10, 2);
```
</details>

### <code> module_setting/fields </code>
<details>
<summary><code>fluent_cart/module_setting/fields</code> &mdash; Filter module setting fields</summary>

**When it runs:**
This filter is applied when rendering module settings fields.

**Parameters:**

- `$fields` (array): Array of module settings field definitions
    ```php
    $fields = [
        [
            'key' => 'module_enabled',
            'label' => 'Enable Module',
            'type' => 'checkbox'
        ]
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$fields` (array): The modified fields array

**Usage:**
```php
add_filter('fluent_cart/module_setting/fields', function($fields, $data) {
    // Add custom module field
    $fields[] = [
        'key' => 'custom_module_option',
        'label' => 'Custom Module Option',
        'type' => 'checkbox'
    ];
    return $fields;
}, 10, 2);
```
</details>

---