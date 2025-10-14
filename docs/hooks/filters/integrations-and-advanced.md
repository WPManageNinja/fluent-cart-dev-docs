# Integrations & Advanced

All filters related to external integrations and advanced features.

### <code> integration/get_global_integration_actions </code>
<details open>
<summary><code>fluent_cart/integration/get_global_integration_actions</code> &mdash; Filter global integration actions</summary>

**When it runs:**
This filter is applied when retrieving available integration actions.

**Parameters:**

- `$actions` (array): Array of integration actions
    ```php
    $actions = [
        'mailchimp' => [
            'title' => 'MailChimp',
            'enabled' => true
        ],
        'zapier' => [
            'title' => 'Zapier',
            'enabled' => true
        ]
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$actions` (array): The modified integration actions array

**Usage:**
```php
add_filter('fluent_cart/integration/get_global_integration_actions', function($actions, $data) {
    // Add custom integration
    $actions['custom_crm'] = [
        'title' => 'Custom CRM',
        'enabled' => true
    ];
    return $actions;
}, 10, 2);
```
</details>

### <code> smartcode_fallback </code>
<details>
<summary><code>fluent_cart/smartcode_fallback</code> &mdash; Filter smartcode fallback value</summary>

**When it runs:**
This filter is applied when a smartcode cannot be parsed, allowing you to provide a fallback value.

**Parameters:**

- `$fallback` (string): The fallback value
- `$data` (array): Smartcode data
    ```php
    $data = [
        'code' => 'custom_code',
        'context' => []
    ];
    ```

**Returns:**
- `$fallback` (string): The modified fallback value

**Usage:**
```php
add_filter('fluent_cart/smartcode_fallback', function($fallback, $data) {
    // Provide custom fallback for specific smartcode
    if ($data['code'] === 'custom_code') {
        return 'Custom Value';
    }
    return $fallback;
}, 10, 2);
```
</details>

### <code> register_storage_drivers </code>
<details>
<summary><code>fluent_cart/register_storage_drivers</code> &mdash; Filter storage drivers</summary>

**When it runs:**
This filter is applied when registering storage drivers for file uploads.

**Parameters:**

- `$drivers` (array): Array of storage drivers
    ```php
    $drivers = [
        'local' => [
            'title' => 'Local Storage',
            'handler' => 'LocalStorageHandler'
        ]
    ];
    ```
- `$data` (array): Additional context data (empty array)

**Returns:**
- `$drivers` (array): The modified storage drivers array

**Usage:**
```php
add_filter('fluent_cart/register_storage_drivers', function($drivers, $data) {
    // Add custom storage driver
    $drivers['s3'] = [
        'title' => 'Amazon S3',
        'handler' => 'S3StorageHandler'
    ];
    return $drivers;
}, 10, 2);
```
</details>

---