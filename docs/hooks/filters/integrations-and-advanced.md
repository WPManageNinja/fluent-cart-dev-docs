# Integrations & Advanced

All filters related to external integrations, file storage, templates, [License](/database/models/license) management, and advanced features.

---

## Integration Actions & Feeds

### <code> order_integrations </code>
<details open>
<summary><code>fluent_cart/integration/order_integrations</code> &mdash; Filter all registered order integrations</summary>

**When it runs:**
This filter is applied when retrieving the list of all registered order integrations. It is used across integration event handling, integration controllers, product integration setup, global settings, and addon modules.

**Parameters:**

- `$integrations` (array): Array of registered integrations (default `[]`)
    ```php
    $integrations = [
        'mailchimp' => [
            'title' => 'MailChimp',
            'logo' => 'https://example.com/mailchimp-logo.png',
            'enabled' => true
        ]
    ];
    ```

**Returns:**
- `$integrations` (array): The modified integrations array

**Source:** `IntegrationEventListener.php:54,247,386`, `IntegrationController.php:96,150`, `ProductIntegrationsController.php:18,48`, `GlobalIntegrationSettings.php:84`, `AddOnModule.php:16`

**Usage:**
```php
add_filter('fluent_cart/integration/order_integrations', function ($integrations) {
    $integrations['custom_crm'] = [
        'title'   => 'Custom CRM',
        'logo'    => 'https://example.com/crm-logo.png',
        'enabled' => true,
    ];
    return $integrations;
});
```
</details>

### <code> run_all_actions_on_async </code>
<details>
<summary><code>fluent_cart/integration/run_all_actions_on_async</code> &mdash; Force all integration actions to run asynchronously</summary>

**When it runs:**
This filter controls whether integration actions should be dispatched asynchronously instead of running immediately during order processing.

**Parameters:**

- `$async` (bool): Whether to force async execution (default `false`)
- `$order` ([Order](/database/models/order)): The order model
- `$hook` (string): The integration hook being fired

**Returns:**
- `$async` (bool): Whether to run actions asynchronously

**Source:** `IntegrationEventListener.php:145`

**Usage:**
```php
add_filter('fluent_cart/integration/run_all_actions_on_async', function ($async, $order, $hook) {
    // Force async for large orders to avoid timeout
    if ($order->total > 100000) {
        return true;
    }
    return $async;
}, 10, 3);
```
</details>

### <code> global_notification_types </code>
<details>
<summary><code>fluent_cart/integration/global_notification_types</code> &mdash; Filter available notification types</summary>

**When it runs:**
This filter is applied when retrieving the list of available global notification types for integrations.

**Parameters:**

- `$types` (array): Array of notification types (default `[]`)
    ```php
    $types = [
        'email' => [
            'title' => 'Email Notification',
            'description' => 'Send email notifications'
        ]
    ];
    ```

**Returns:**
- `$types` (array): The modified notification types array

**Source:** `GlobalIntegrationSettings.php:119`

**Usage:**
```php
add_filter('fluent_cart/integration/global_notification_types', function ($types) {
    $types['sms'] = [
        'title'       => 'SMS Notification',
        'description' => 'Send SMS notifications on order events',
    ];
    return $types;
});
```
</details>

### <code> global_notification_feed_{$feed_key} </code>
<details>
<summary><code>fluent_cart/integration/global_notification_feed_{$feed_key}</code> &mdash; Filter notification feed data (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving notification feed data for a specific feed key. The `{$feed_key}` portion is replaced with the actual feed identifier.

**Parameters:**

- `$feedData` (array): The notification feed data

**Returns:**
- `$feedData` (array): The modified feed data

**Source:** `GlobalIntegrationSettings.php:151`

**Usage:**
```php
add_filter('fluent_cart/integration/global_notification_feed_email_alerts', function ($feedData) {
    // Modify email alert feed data
    $feedData['recipients'][] = 'extra-admin@example.com';
    return $feedData;
});
```
</details>

### <code> get_global_integration_actions </code>
<details>
<summary><code>fluent_cart/integration/get_global_integration_actions</code> &mdash; Filter global integration actions</summary>

**When it runs:**
This filter is applied when retrieving available global integration actions that can be triggered by order events.

**Parameters:**

- `$actions` (array): Array of integration actions (default `[]`)
    ```php
    $actions = [
        'mailchimp_subscribe' => [
            'title' => 'Subscribe to MailChimp',
            'enabled' => true
        ]
    ];
    ```

**Returns:**
- `$actions` (array): The modified integration actions array

**Source:** `GlobalIntegrationActionHandler.php:22`

**Usage:**
```php
add_filter('fluent_cart/integration/get_global_integration_actions', function ($actions) {
    $actions['custom_webhook'] = [
        'title'   => 'Fire Custom Webhook',
        'enabled' => true,
    ];
    return $actions;
});
```
</details>

### <code> notifying_async_{$feedKey} </code>
<details>
<summary><code>fluent_cart/integration/notifying_async_{$feedKey}</code> &mdash; Control async notification per feed (DYNAMIC)</summary>

**When it runs:**
This dynamic filter controls whether a specific notification feed should be dispatched asynchronously. The `{$feedKey}` is replaced with the actual feed key.

**Parameters:**

- `$async` (bool): Whether to process this notification asynchronously (default `true`)

**Returns:**
- `$async` (bool): Whether to use async processing

**Source:** `GlobalNotificationHandler.php:104`

**Usage:**
```php
add_filter('fluent_cart/integration/notifying_async_email_alerts', function ($async) {
    // Force synchronous for email alerts
    return false;
});
```
</details>

---

## Integration Settings & Configuration

### <code> global_integration_settings_{$key} </code>
<details>
<summary><code>fluent_cart/integration/global_integration_settings_{$key}</code> &mdash; Filter integration settings (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving settings for a specific integration. The `{$key}` is replaced with the integration key (e.g., `mailchimp`, `zapier`).

**Parameters:**

- `$settings` (array): The integration settings (default `[]`)

**Returns:**
- `$settings` (array): The modified settings array

**Source:** `GlobalIntegrationSettings.php:24`

**Usage:**
```php
add_filter('fluent_cart/integration/global_integration_settings_mailchimp', function ($settings) {
    // Override MailChimp API key from environment
    $settings['api_key'] = defined('MAILCHIMP_API_KEY') ? MAILCHIMP_API_KEY : $settings['api_key'];
    return $settings;
});
```
</details>

### <code> global_integration_fields_{$key} </code>
<details>
<summary><code>fluent_cart/integration/global_integration_fields_{$key}</code> &mdash; Filter integration field definitions (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving field definitions for a specific integration configuration form. The `{$key}` is replaced with the integration key.

**Parameters:**

- `$fields` (array): The field definitions (default `[]`)

**Returns:**
- `$fields` (array): The modified field definitions

**Source:** `GlobalIntegrationSettings.php:25`

**Usage:**
```php
add_filter('fluent_cart/integration/global_integration_fields_mailchimp', function ($fields) {
    $fields[] = [
        'key'   => 'double_optin',
        'label' => 'Enable Double Opt-in',
        'type'  => 'checkbox',
    ];
    return $fields;
});
```
</details>

### <code> get_integration_defaults_{$name} </code>
<details>
<summary><code>fluent_cart/integration/get_integration_defaults_{$name}</code> &mdash; Filter integration defaults (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving default settings for a specific integration. The `{$name}` is replaced with the integration name.

**Parameters:**

- `$defaults` (array): The default settings values

**Returns:**
- `$defaults` (array): The modified defaults

**Source:** `GlobalIntegrationSettings.php:199,201`

**Usage:**
```php
add_filter('fluent_cart/integration/get_integration_defaults_mailchimp', function ($defaults) {
    $defaults['list_id'] = 'default_list_123';
    $defaults['tags']    = ['fluentcart-customer'];
    return $defaults;
});
```
</details>

### <code> get_integration_settings_fields_{$name} </code>
<details>
<summary><code>fluent_cart/integration/get_integration_settings_fields_{$name}</code> &mdash; Filter integration settings fields (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving the settings field definitions for a specific integration. The `{$name}` is replaced with the integration name.

**Parameters:**

- `$fields` (array): The field definitions (default `[]`)

**Returns:**
- `$fields` (array): The modified field definitions

**Source:** `GlobalIntegrationSettings.php:204,276`, `IntegrationHelper.php:27`

**Usage:**
```php
add_filter('fluent_cart/integration/get_integration_settings_fields_zapier', function ($fields) {
    $fields[] = [
        'key'         => 'webhook_url',
        'label'       => 'Webhook URL',
        'type'        => 'url',
        'required'    => true,
        'placeholder' => 'https://hooks.zapier.com/...',
    ];
    return $fields;
});
```
</details>

### <code> save_integration_values_{$name} </code>
<details>
<summary><code>fluent_cart/integration/save_integration_values_{$name}</code> &mdash; Filter before saving integration data (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied just before integration settings are saved to the database. The `{$name}` is replaced with the integration name.

**Parameters:**

- `$integration` (Meta): The Meta model instance containing the integration data

**Returns:**
- `$integration` (Meta): The modified Meta model

**Source:** `GlobalIntegrationSettings.php:248`

**Usage:**
```php
add_filter('fluent_cart/integration/save_integration_values_mailchimp', function ($integration) {
    // Encrypt API key before saving
    $value = $integration->value;
    if (!empty($value['api_key'])) {
        $value['api_key_encrypted'] = encrypt($value['api_key']);
    }
    $integration->value = $value;
    return $integration;
});
```
</details>

### <code> get_integration_merge_fields_{$name} </code>
<details>
<summary><code>fluent_cart/integration/get_integration_merge_fields_{$name}</code> &mdash; Filter integration merge/mapping fields (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving merge fields for a specific integration. These fields are used for mapping FluentCart data to external service fields.

**Parameters:**

- `$list` (array): The merge fields list
- `$listId` (string): The list or audience ID

**Returns:**
- `$list` (array): The modified merge fields

**Source:** `GlobalIntegrationSettings.php:369`

**Usage:**
```php
add_filter('fluent_cart/integration/get_integration_merge_fields_mailchimp', function ($list, $listId) {
    $list[] = [
        'key'   => 'COMPANY',
        'label' => 'Company Name',
        'type'  => 'text',
    ];
    return $list;
}, 10, 2);
```
</details>

### <code> integration_options_{$key} </code>
<details>
<summary><code>fluent_cart/integration/integration_options_{$key}</code> &mdash; Filter dynamic integration options (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving option values for an integration dropdown or selection field. The `{$key}` is replaced with the option key.

**Parameters:**

- `$options` (array): The options array (default `[]`)

**Returns:**
- `$options` (array): The modified options

**Source:** `IntegrationController.php:302`

**Usage:**
```php
add_filter('fluent_cart/integration/integration_options_mailchimp_lists', function ($options) {
    // Add a custom list option
    $options[] = [
        'id'    => 'custom_list',
        'title' => 'Custom Audience',
    ];
    return $options;
});
```
</details>

### <code> integration_saving_data_{$provider} </code>
<details>
<summary><code>fluent_cart/integration/integration_saving_data_{$provider}</code> &mdash; Filter integration data before validation (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied to integration data before it undergoes validation when saving. The `{$provider}` is replaced with the provider key.

**Parameters:**

- `$validatedData` (array): The validated integration data

**Returns:**
- `$validatedData` (array): The modified data

**Source:** `IntegrationHelper.php:62`

**Usage:**
```php
add_filter('fluent_cart/integration/integration_saving_data_mailchimp', function ($validatedData) {
    // Normalize tags before saving
    if (!empty($validatedData['tags'])) {
        $validatedData['tags'] = array_map('strtolower', $validatedData['tags']);
    }
    return $validatedData;
});
```
</details>

### <code> editing_integration_{$key} </code>
<details>
<summary><code>fluent_cart/integration/editing_integration_{$key}</code> &mdash; Filter integration data when editing (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when an integration is being loaded for editing in the admin UI.

**Parameters:**

- `$data` (array): The integration data for editing
- `$args` (array): Additional context arguments

**Returns:**
- `$data` (array): The modified integration data

**Source:** `IntegrationHelper.php:80`

**Usage:**
```php
add_filter('fluent_cart/integration/editing_integration_mailchimp', function ($data, $args) {
    // Decrypt API key for display
    if (!empty($data['api_key_encrypted'])) {
        $data['api_key'] = decrypt($data['api_key_encrypted']);
    }
    return $data;
}, 10, 2);
```
</details>

---

## Integration Addons

### <code> addons </code>
<details>
<summary><code>fluent_cart/integration/addons</code> &mdash; Filter the integration addons list</summary>

**When it runs:**
This filter is applied when retrieving the list of available integration addons in the admin interface.

**Parameters:**

- `$addons` (array): Array of addon definitions

**Returns:**
- `$addons` (array): The modified addons array

**Source:** `AddonsController.php:87`

**Usage:**
```php
add_filter('fluent_cart/integration/addons', function ($addons) {
    $addons['my_addon'] = [
        'title'       => 'My Custom Addon',
        'description' => 'Adds custom integration functionality',
        'logo'        => 'https://example.com/addon-logo.png',
        'enabled'     => true,
    ];
    return $addons;
});
```
</details>

### <code> installable_repo_plugins </code>
<details>
<summary><code>fluent_cart/installable_repo_plugins</code> &mdash; Filter installable plugin recommendations</summary>

**When it runs:**
This filter is applied when retrieving the list of recommended plugins that can be installed from within the FluentCart admin.

**Parameters:**

- `$plugins` (array): Array of installable plugin definitions

**Returns:**
- `$plugins` (array): The modified plugins array

**Source:** `AddonsController.php:121`, `GlobalIntegrationSettings.php:396`

**Usage:**
```php
add_filter('fluent_cart/installable_repo_plugins', function ($plugins) {
    $plugins[] = [
        'title'       => 'FluentCRM',
        'slug'        => 'fluent-crm',
        'description' => 'Email marketing automation',
        'url'         => 'https://wordpress.org/plugins/fluent-crm/',
    ];
    return $plugins;
});
```
</details>

---

## File Storage & Downloads

### <code> local_file_blocked_extensions </code>
<details>
<summary><code>fluent_cart/local_file_blocked_extensions</code> &mdash; Filter blocked file extensions for local storage</summary>

**When it runs:**
This filter is applied when validating a file upload to local storage, allowing you to modify the list of blocked file extensions.

**Parameters:**

- `$blockedExts` (array): Array of blocked file extensions
- `$localFilePath` (string): Local file path
- `$uploadToFilePath` (string): Target upload path
- `$fileInfo` (array): File information array
- Additional context parameters

**Returns:**
- `$blockedExts` (array): The modified blocked extensions array

**Source:** `LocalDriver.php:129`

**Usage:**
```php
add_filter('fluent_cart/local_file_blocked_extensions', function ($blockedExts, $localFilePath, $uploadToFilePath, $fileInfo) {
    // Block additional extensions
    $blockedExts[] = 'svg';
    $blockedExts[] = 'webp';
    return $blockedExts;
}, 10, 4);
```
</details>

### <code> download_expiration_minutes </code>
<details>
<summary><code>fluent_cart/download_expiration_minutes</code> &mdash; Filter S3 download link expiration time</summary>

**When it runs:**
This filter controls how long a pre-signed S3 download URL remains valid.

**Parameters:**

- `$expirationMinutes` (int): Expiration time in minutes
- `$context` (array): Context data
    ```php
    $context = [
        'file_path' => 'products/my-file.zip',
        'bucket'    => 'my-bucket',
        'driver'    => 's3'
    ];
    ```

**Returns:**
- `$expirationMinutes` (int): The modified expiration time in minutes

**Source:** `S3Driver.php:237,252`

**Usage:**
```php
add_filter('fluent_cart/download_expiration_minutes', function ($expirationMinutes, $context) {
    // Extend expiration for large files
    if (str_ends_with($context['file_path'], '.zip')) {
        return 120; // 2 hours
    }
    return $expirationMinutes;
}, 10, 2);
```
</details>

### <code> download_link_validity_in_minutes </code>
<details>
<summary><code>fluent_cart/download_link_validity_in_minutes</code> &mdash; Filter download link validity duration</summary>

**When it runs:**
This filter controls how long a download link remains valid for customer-facing downloads.

**Parameters:**

- `$minutes` (int): Link validity in minutes (default `60`)
- `$context` (array): Context data
    ```php
    $context = [
        'product_download' => $downloadModel,
        'order_id'         => 123,
        'is_admin'         => false
    ];
    ```

**Returns:**
- `$minutes` (int): The modified validity in minutes

**Source:** `Helper.php:1430`

**Usage:**
```php
add_filter('fluent_cart/download_link_validity_in_minutes', function ($minutes, $context) {
    // Give admins longer download windows
    if ($context['is_admin']) {
        return 1440; // 24 hours
    }
    return $minutes;
}, 10, 2);
```
</details>

### <code> product_download/can_be_downloaded </code>
<details>
<summary><code>fluent_cart/product_download/can_be_downloaded</code> &mdash; Filter whether a file can be downloaded</summary>

**When it runs:**
This filter is applied during download validation to determine if a customer is allowed to download a specific file.

**Parameters:**

- `$canDownload` (bool|WP_Error): Whether the file can be downloaded, or a WP_Error with rejection reason

**Returns:**
- `$canDownload` (bool|WP_Error): The modified download permission

**Source:** `FileDownloader.php:95`

**Usage:**
```php
add_filter('fluent_cart/product_download/can_be_downloaded', function ($canDownload) {
    // Block downloads during maintenance
    if (get_option('fluent_cart_maintenance_mode')) {
        return new \WP_Error('maintenance', 'Downloads are temporarily disabled during maintenance.');
    }
    return $canDownload;
});
```
</details>

### <code> get_global_storage_settings_{$driver} </code>
<details>
<summary><code>fluent_cart/storage/get_global_storage_settings_{$driver}</code> &mdash; Filter storage driver settings (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving settings for a specific storage driver. The `{$driver}` is replaced with the driver name (e.g., `s3`, `local`).

**Parameters:**

- `$settings` (array): The storage driver settings (default `[]`)

**Returns:**
- `$settings` (array): The modified settings

**Source:** `api/StorageDrivers.php:18`

**Usage:**
```php
add_filter('fluent_cart/storage/get_global_storage_settings_s3', function ($settings) {
    // Override S3 settings from environment variables
    $settings['bucket'] = defined('S3_BUCKET') ? S3_BUCKET : $settings['bucket'];
    $settings['region'] = defined('S3_REGION') ? S3_REGION : $settings['region'];
    return $settings;
});
```
</details>

### <code> get_global_storage_drivers </code>
<details>
<summary><code>fluent_cart/storage/get_global_storage_drivers</code> &mdash; Filter all available storage drivers</summary>

**When it runs:**
This filter is applied when retrieving the list of all available storage drivers.

**Parameters:**

- `$drivers` (array): Array of storage driver definitions (default `[]`)

**Returns:**
- `$drivers` (array): The modified drivers array

**Source:** `StorageDrivers.php:28`

**Usage:**
```php
add_filter('fluent_cart/storage/get_global_storage_drivers', function ($drivers) {
    $drivers['backblaze'] = [
        'title'       => 'Backblaze B2',
        'description' => 'Store files on Backblaze B2',
        'handler'     => 'BackblazeDriver',
    ];
    return $drivers;
});
```
</details>

### <code> get_global_storage_driver_status_{$driver} </code>
<details>
<summary><code>fluent_cart/storage/get_global_storage_driver_status_{$driver}</code> &mdash; Filter storage driver status (DYNAMIC)</summary>

**When it runs:**
This dynamic filter retrieves the connection status for a specific storage driver.

**Parameters:**

- `$status` (array): The driver status (default `[]`)

**Returns:**
- `$status` (array): The modified status array

**Source:** `StorageDrivers.php:65`

**Usage:**
```php
add_filter('fluent_cart/storage/get_global_storage_driver_status_s3', function ($status) {
    $status['connected'] = true;
    $status['message']   = 'Connected to S3 bucket successfully';
    return $status;
});
```
</details>

### <code> verify_driver_connect_info_{$driver} </code>
<details>
<summary><code>fluent_cart/verify_driver_connect_info_{$driver}</code> &mdash; Filter driver connection verification (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when verifying the connection info for a storage driver.

**Parameters:**

- `$settings` (array): The driver connection settings

**Returns:**
- `$settings` (array): The modified settings (may include error information)

**Source:** `StorageDrivers.php:79`

**Usage:**
```php
add_filter('fluent_cart/verify_driver_connect_info_s3', function ($settings) {
    // Validate credentials before saving
    try {
        $client = new \Aws\S3\S3Client($settings);
        $client->listBuckets();
        $settings['verified'] = true;
    } catch (\Exception $e) {
        $settings['error'] = $e->getMessage();
    }
    return $settings;
});
```
</details>

### <code> storage_settings_before_update_{$slug} </code>
<details>
<summary><code>fluent_cart/storage/storage_settings_before_update_{$slug}</code> &mdash; Filter storage settings before saving (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied just before storage driver settings are saved, allowing you to validate or modify them.

**Parameters:**

- `$settings` (array): The new settings to save
- `$oldSettings` (array): The previous settings

**Returns:**
- `$settings` (array): The modified settings

**Source:** `BaseStorageDriver.php:152`

**Usage:**
```php
add_filter('fluent_cart/storage/storage_settings_before_update_s3', function ($settings, $oldSettings) {
    // Preserve the secret key if not provided in the update
    if (empty($settings['secret_key']) && !empty($oldSettings['secret_key'])) {
        $settings['secret_key'] = $oldSettings['secret_key'];
    }
    return $settings;
}, 10, 2);
```
</details>

---

## Localization & Address

### <code> country_state_options </code>
<details>
<summary><code>fluent_cart/country_state_options</code> &mdash; Filter country and state options</summary>

**When it runs:**
This filter is applied when retrieving country and state dropdown options for address forms.

**Parameters:**

- `$options` (array): The country/state options array

**Returns:**
- `$options` (array): The modified options

**Source:** `LocalizationManager.php:425`

**Usage:**
```php
add_filter('fluent_cart/country_state_options', function ($options) {
    // Remove a country from the list
    unset($options['countries']['XX']);
    return $options;
});
```
</details>

### <code> address/postcode/format </code>
<details>
<summary><code>fluent_cart/address/postcode/format</code> &mdash; Filter postcode formatting</summary>

**When it runs:**
This filter is applied when formatting a postcode value, typically during address validation.

**Parameters:**

- `$postcode` (string): The trimmed postcode value
- `$country` (string): The country code

**Returns:**
- `$postcode` (string): The formatted postcode

**Source:** `PostcodeVerification.php:53`

**Usage:**
```php
add_filter('fluent_cart/address/postcode/format', function ($postcode, $country) {
    // Format UK postcodes with a space
    if ($country === 'GB' && strlen($postcode) > 3 && strpos($postcode, ' ') === false) {
        return substr($postcode, 0, -3) . ' ' . substr($postcode, -3);
    }
    return $postcode;
}, 10, 2);
```
</details>

### <code> address/postcode/is_valid </code>
<details>
<summary><code>fluent_cart/address/postcode/is_valid</code> &mdash; Filter postcode validation result</summary>

**When it runs:**
This filter is applied after postcode validation to allow custom validation rules.

**Parameters:**

- `$valid` (bool): Whether the postcode is valid
- `$postcode` (string): The postcode being validated
- `$country` (string): The country code

**Returns:**
- `$valid` (bool): The modified validation result

**Source:** `PostcodeVerification.php:154`

**Usage:**
```php
add_filter('fluent_cart/address/postcode/is_valid', function ($valid, $postcode, $country) {
    // Add custom validation for specific country
    if ($country === 'XX') {
        return preg_match('/^\d{5}$/', $postcode) === 1;
    }
    return $valid;
}, 10, 3);
```
</details>

### <code> util/countries </code>
<details>
<summary><code>fluent-cart/util/countries</code> &mdash; Filter the country list</summary>

**When it runs:**
This filter is applied when retrieving the full list of countries.

> **Note:** This hook uses a non-standard hyphenated prefix (`fluent-cart/`) rather than the standard `fluent_cart/` convention. This is a legacy naming that may be standardized in a future release.

**Parameters:**

- `$options` (array): Array of country code => country name pairs

**Returns:**
- `$options` (array): The modified country list

**Source:** `Helper.php:1140`

**Usage:**
```php
add_filter('fluent-cart/util/countries', function ($options) {
    // Limit to specific countries
    return array_intersect_key($options, array_flip(['US', 'CA', 'GB', 'AU']));
});
```
</details>

---

## Templates & Frontend

### <code> template/disable_taxonomy_fallback </code>
<details>
<summary><code>fluent_cart/template/disable_taxonomy_fallback</code> &mdash; Disable taxonomy fallback template</summary>

**When it runs:**
This filter controls whether the taxonomy fallback template should be disabled.

**Parameters:**

- `$disable` (bool): Whether to disable taxonomy fallback (default `false`)

**Returns:**
- `$disable` (bool): The modified value

**Source:** `TemplateLoader.php:113`

**Usage:**
```php
add_filter('fluent_cart/template/disable_taxonomy_fallback', function ($disable) {
    // Disable taxonomy fallback when using a custom theme
    return true;
});
```
</details>

### <code> has_block_template </code>
<details>
<summary><code>fluent_cart/has_block_template</code> &mdash; Filter block template existence check</summary>

**When it runs:**
This filter is applied when checking if a block template exists for the current page.

**Parameters:**

- `$hasTemplate` (bool): Whether a block template exists

**Returns:**
- `$hasTemplate` (bool): The modified result

**Source:** `TemplateLoader.php:193`

**Usage:**
```php
add_filter('fluent_cart/has_block_template', function ($hasTemplate) {
    // Force classic template rendering
    return false;
});
```
</details>

### <code> template_loader_files </code>
<details>
<summary><code>fluent_cart/template_loader_files</code> &mdash; Filter template files to load</summary>

**When it runs:**
This filter is applied when determining which template files should be loaded for the current request.

**Parameters:**

- `$files` (array): Array of template file paths (default `[]`)

**Returns:**
- `$files` (array): The modified template files array

**Source:** `TemplateLoader.php:206`

**Usage:**
```php
add_filter('fluent_cart/template_loader_files', function ($files) {
    // Add custom template file
    $files[] = get_stylesheet_directory() . '/fluent-cart/custom-template.php';
    return $files;
});
```
</details>

### <code> template_path </code>
<details>
<summary><code>fluent_cart/template_path</code> &mdash; Filter theme template path</summary>

**When it runs:**
This filter controls the directory path within a theme where FluentCart template overrides are located.

**Parameters:**

- `$path` (string): The template directory path (default `'fluent-cart/'`)

**Returns:**
- `$path` (string): The modified template path

**Source:** `TemplateLoader.php:248`

**Usage:**
```php
add_filter('fluent_cart/template_path', function ($path) {
    // Use a custom directory for template overrides
    return 'my-store/templates/';
});
```
</details>

### <code> fluent_cart_template_part_content </code>
<details>
<summary><code>fluent_cart_template_part_content</code> &mdash; Filter template part content</summary>

**When it runs:**
This filter is applied to template part content before it is rendered, allowing you to modify the HTML content.

**Parameters:**

- `$content` (string): The template part content
- `$slug` (string): The template part slug
- `$args` (array): Template arguments

**Returns:**
- `$content` (string): The modified content

**Source:** `ProductModalTemplatePart.php:245`

**Usage:**
```php
add_filter('fluent_cart_template_part_content', function ($content, $slug, $args) {
    if ($slug === 'product-card') {
        // Wrap content in a custom div
        $content = '<div class="custom-wrapper">' . $content . '</div>';
    }
    return $content;
}, 10, 3);
```
</details>

### <code> fluent_cart_template_part_content_{$slug} </code>
<details>
<summary><code>fluent_cart_template_part_content_{$slug}</code> &mdash; Filter template part content by slug (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied to a specific template part's content. The `{$slug}` is replaced with the template part slug.

**Parameters:**

- `$content` (string): The template part content
- `$args` (array): Template arguments

**Returns:**
- `$content` (string): The modified content

**Source:** `ProductModalTemplatePart.php:246`

**Usage:**
```php
add_filter('fluent_cart_template_part_content_product-card', function ($content, $args) {
    // Append a badge to product card content
    $content .= '<span class="badge">New</span>';
    return $content;
}, 10, 2);
```
</details>

### <code> fluent_cart_template_part_output </code>
<details>
<summary><code>fluent_cart_template_part_output</code> &mdash; Filter template part output</summary>

**When it runs:**
This filter is applied to the final rendered output of a template part.

**Parameters:**

- `$output` (string): The rendered template part output

**Returns:**
- `$output` (string): The modified output

**Source:** `ProductModalTemplatePart.php:252`

**Usage:**
```php
add_filter('fluent_cart_template_part_output', function ($output) {
    // Minify the output
    return preg_replace('/\s+/', ' ', $output);
});
```
</details>

### <code> fluent_cart_template_part_output_{$slug} </code>
<details>
<summary><code>fluent_cart_template_part_output_{$slug}</code> &mdash; Filter template part output by slug (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied to the final rendered output of a specific template part. The `{$slug}` is replaced with the template part slug.

**Parameters:**

- `$output` (string): The rendered output

**Returns:**
- `$output` (string): The modified output

**Source:** `ProductModalTemplatePart.php:253`

**Usage:**
```php
add_filter('fluent_cart_template_part_output_product-modal', function ($output) {
    // Add data attributes to the modal output
    return str_replace('<div class="fct-modal"', '<div class="fct-modal" data-tracking="true"', $output);
});
```
</details>

### <code> buttons/enable_floating_cart_button </code>
<details>
<summary><code>fluent_cart/buttons/enable_floating_cart_button</code> &mdash; Filter floating cart button visibility</summary>

**When it runs:**
This filter controls whether the floating cart button is displayed on the frontend.

**Parameters:**

- `$enabled` (bool): Whether the floating cart button is enabled (default `true`)

**Returns:**
- `$enabled` (bool): The modified value

**Source:** `app/Hooks/Cart/CartLoader.php:41`

**Usage:**
```php
add_filter('fluent_cart/buttons/enable_floating_cart_button', function ($enabled) {
    // Disable floating cart on specific pages
    if (is_page('landing-page')) {
        return false;
    }
    return $enabled;
});
```
</details>

---

## Widgets & Dashboard

### <code> {$widgetName} </code>
<details>
<summary><code>fluent_cart/{$widgetName}</code> &mdash; Filter widget data by name (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when a dashboard widget retrieves its data. The `{$widgetName}` is replaced with the specific widget name.

**Parameters:**

- `$widgetData` (mixed): The widget data returned by `widgetData()` method

**Returns:**
- `$widgetData` (mixed): The modified widget data

**Source:** `app/Services/Widgets/BaseWidget.php:16`

**Usage:**
```php
add_filter('fluent_cart/revenue_widget', function ($widgetData) {
    // Add custom metric to revenue widget
    $widgetData['custom_metric'] = calculate_custom_metric();
    return $widgetData;
});
```
</details>

### <code> widgets/{$filter} </code>
<details>
<summary><code>fluent_cart/widgets/{$filter}</code> &mdash; Filter widget data by filter key (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving widget data for a specific filter key in the widgets controller.

**Parameters:**

- `$result` (array): The widget result data (default `[]`)
- `$data` (array): The request data

**Returns:**
- `$result` (array): The modified widget data

**Source:** `WidgetsController.php:36`

**Usage:**
```php
add_filter('fluent_cart/widgets/sales_overview', function ($result, $data) {
    $result['custom_chart'] = [
        'labels' => ['Jan', 'Feb', 'Mar'],
        'data'   => [100, 200, 150],
    ];
    return $result;
}, 10, 2);
```
</details>

### <code> promo_gateways </code>
<details>
<summary><code>fluent_cart/promo_gateways</code> &mdash; Filter promotional gateways</summary>

**When it runs:**
This filter is applied when retrieving the list of promotional payment gateways shown in the admin.

**Parameters:**

- `$defaultGateways` (array): Array of default promotional gateways

**Returns:**
- `$defaultGateways` (array): The modified gateways array

**Source:** `PromoGatewaysHandler.php:36`

**Usage:**
```php
add_filter('fluent_cart/promo_gateways', function ($gateways) {
    // Remove a promo gateway
    unset($gateways['example_gateway']);
    return $gateways;
});
```
</details>

### <code> addon_gateways </code>
<details>
<summary><code>fluent_cart/addon_gateways</code> &mdash; Filter addon payment gateways</summary>

**When it runs:**
This filter is applied when retrieving the list of addon payment gateways.

**Parameters:**

- `$defaultGateways` (array): Array of default addon gateways

**Returns:**
- `$defaultGateways` (array): The modified gateways array

**Source:** `AddonGatewaysHandler.php:36`

**Usage:**
```php
add_filter('fluent_cart/addon_gateways', function ($gateways) {
    $gateways['custom_pay'] = [
        'title'       => 'Custom Pay',
        'description' => 'Custom payment gateway addon',
        'is_active'   => true,
    ];
    return $gateways;
});
```
</details>

---

## Advanced List Filters

### <code> {$filter}_list_filter_query </code>
<details>
<summary><code>fluent_cart/{$filter}_list_filter_query</code> &mdash; Filter list filter query (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when building database queries for filtered list pages (orders, customers, subscriptions, etc.). The `{$filter}` is replaced with the filter context name.

**Parameters:**

- `$query` (Builder): The Eloquent query builder instance

**Returns:**
- `$query` (Builder): The modified query builder

**Source:** `BaseFilter.php:962,971`

**Usage:**
```php
add_filter('fluent_cart/orders_list_filter_query', function ($query) {
    // Only show orders from the last 30 days by default
    $query->where('created_at', '>=', gmdate('Y-m-d H:i:s', strtotime('-30 days')));
    return $query;
});
```
</details>

### <code> {$filterName}_filter_options </code>
<details>
<summary><code>fluent_cart/{$filterName}_filter_options</code> &mdash; Filter options for list page filters (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving available filter options for admin list pages.

**Parameters:**

- `$options` (array): The filter options array

**Returns:**
- `$options` (array): The modified filter options

**Source:** `BaseFilter.php:995`

**Usage:**
```php
add_filter('fluent_cart/orders_filter_options', function ($options) {
    // Add a custom filter option
    $options['custom_status'] = [
        'label'   => 'Custom Status',
        'type'    => 'select',
        'options' => ['pending_review' => 'Pending Review'],
    ];
    return $options;
});
```
</details>

### <code> {$filterName}_table_columns </code>
<details>
<summary><code>fluent_cart/{$filterName}_table_columns</code> &mdash; Filter table columns for list pages (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving table column definitions for admin list pages.

**Parameters:**

- `$columns` (array): The table column definitions (default `[]`)

**Returns:**
- `$columns` (array): The modified columns array

**Source:** `BaseFilter.php:1038`

**Usage:**
```php
add_filter('fluent_cart/orders_table_columns', function ($columns) {
    $columns['custom_field'] = [
        'label'    => 'Custom Field',
        'sortable' => true,
        'width'    => '120px',
    ];
    return $columns;
});
```
</details>

### <code> advanced_filter_options_{$dataKey} </code>
<details>
<summary><code>fluent_cart/advanced_filter_options_{$dataKey}</code> &mdash; Filter advanced filter options (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied when retrieving options for the advanced filter UI. The `{$dataKey}` is replaced with the specific data key.

**Parameters:**

- `$options` (array): The filter options

**Returns:**
- `$options` (array): The modified options

**Source:** `AdvanceFilterController.php:46`

**Usage:**
```php
add_filter('fluent_cart/advanced_filter_options_payment_methods', function ($options) {
    $options[] = [
        'value' => 'custom_gateway',
        'label' => 'Custom Gateway',
    ];
    return $options;
});
```
</details>

---

## Plugin Installer

### <code> outside_addon/handle_cdn_install </code>
<details>
<summary><code>fluent_cart/outside_addon/handle_cdn_install</code> &mdash; Filter CDN addon installation</summary>

**When it runs:**
This filter is applied when attempting to install an addon from a CDN source. Return a non-null value to handle the installation yourself.

**Parameters:**

- `$result` (mixed): Installation result (default `null`)

**Returns:**
- `$result` (mixed): The installation result, or `null` to use default handling

**Source:** `BackgroundInstaller.php:143`

**Usage:**
```php
add_filter('fluent_cart/outside_addon/handle_cdn_install', function ($result) {
    // Handle custom CDN addon installation
    if ($result === null) {
        // Perform custom installation logic
        return ['success' => true, 'message' => 'Installed from custom CDN'];
    }
    return $result;
});
```
</details>

### <code> outside_addon/handle_install </code>
<details>
<summary><code>fluent_cart/outside_addon/handle_install</code> &mdash; Filter external addon installation</summary>

**When it runs:**
This filter is applied when installing an addon from an external source. Return a non-null value to handle the installation yourself.

**Parameters:**

- `$result` (mixed): Installation result (default `null`)

**Returns:**
- `$result` (mixed): The installation result, or `null` to use default handling

**Source:** `BackgroundInstaller.php:164`

**Usage:**
```php
add_filter('fluent_cart/outside_addon/handle_install', function ($result) {
    // Handle custom external addon installation
    return ['success' => true, 'message' => 'Addon installed successfully'];
});
```
</details>

---

## Pro: Licensing API <Badge type="warning" text="Pro" />

### <code> license/checking_error </code>
<details>
<summary><code>fluent_cart/license/checking_error</code> <Badge type="warning" text="Pro" /> &mdash; Filter license check error response</summary>

**When it runs:**
This filter is applied when a license check encounters an error, allowing you to customize the error response.

**Parameters:**

- `$error` (array): The error response array

**Returns:**
- `$error` (array): The modified error response

**Source:** `LicenseApiHandler.php:45,56`

**Usage:**
```php
add_filter('fluent_cart/license/checking_error', function ($error) {
    // Customize error message
    $error['message'] = 'Please contact support for license verification.';
    return $error;
});
```
</details>

### <code> license/check_item_id </code>
<details>
<summary><code>fluent_cart/license/check_item_id</code> <Badge type="warning" text="Pro" /> &mdash; Filter item ID validation during license check</summary>

**When it runs:**
This filter controls whether the item ID should be validated during a license check API request.

**Parameters:**

- `$checkItemId` (bool): Whether to check the item ID (default `true`)

**Returns:**
- `$checkItemId` (bool): The modified value

**Source:** `LicenseApiHandler.php:54`

**Usage:**
```php
add_filter('fluent_cart/license/check_item_id', function ($checkItemId) {
    // Skip item ID check for specific scenarios
    return false;
});
```
</details>

### <code> license/check_license_response </code>
<details>
<summary><code>fluent_cart/license/check_license_response</code> <Badge type="warning" text="Pro" /> &mdash; Filter license check API response</summary>

**When it runs:**
This filter is applied to the license check API response before it is returned to the client.

**Parameters:**

- `$returnData` (array): The license check response data

**Returns:**
- `$returnData` (array): The modified response data

**Source:** `LicenseApiHandler.php:83`

**Usage:**
```php
add_filter('fluent_cart/license/check_license_response', function ($returnData) {
    // Add custom data to the response
    $returnData['support_url'] = 'https://example.com/support';
    return $returnData;
});
```
</details>

### <code> license/activate_license_response </code>
<details>
<summary><code>fluent_cart/license/activate_license_response</code> <Badge type="warning" text="Pro" /> &mdash; Filter license activation API response</summary>

**When it runs:**
This filter is applied to the license activation API response before it is returned to the client.

**Parameters:**

- `$returnData` (array): The activation response data

**Returns:**
- `$returnData` (array): The modified response data

**Source:** `LicenseApiHandler.php:170,274`

**Usage:**
```php
add_filter('fluent_cart/license/activate_license_response', function ($returnData) {
    // Add activation timestamp
    $returnData['activated_at'] = gmdate('Y-m-d H:i:s');
    return $returnData;
});
```
</details>

### <code> license/deactivate_license_response </code>
<details>
<summary><code>fluent_cart/license/deactivate_license_response</code> <Badge type="warning" text="Pro" /> &mdash; Filter license deactivation API response</summary>

**When it runs:**
This filter is applied to the license deactivation API response before it is returned to the client.

**Parameters:**

- `$returnData` (array): The deactivation response data

**Returns:**
- `$returnData` (array): The modified response data

**Source:** `LicenseApiHandler.php:356`

**Usage:**
```php
add_filter('fluent_cart/license/deactivate_license_response', function ($returnData) {
    // Add deactivation notice
    $returnData['notice'] = 'License deactivated. You can reactivate on another site.';
    return $returnData;
});
```
</details>

### <code> license/get_version_response </code>
<details>
<summary><code>fluent_cart/license/get_version_response</code> <Badge type="warning" text="Pro" /> &mdash; Filter version check API response</summary>

**When it runs:**
This filter is applied to the version check API response, allowing you to modify changelog or update information.

**Parameters:**

- `$changeLogData` (array): The version/changelog response data

**Returns:**
- `$changeLogData` (array): The modified response data

**Source:** `LicenseApiHandler.php:463`

**Usage:**
```php
add_filter('fluent_cart/license/get_version_response', function ($changeLogData) {
    // Append custom changelog entry
    $changeLogData['sections']['changelog'] .= "\n* Custom patch applied";
    return $changeLogData;
});
```
</details>

### <code> license/santized_url </code>
<details>
<summary><code>fluent_cart/license/santized_url</code> <Badge type="warning" text="Pro" /> &mdash; Filter sanitized URL for license validation</summary>

**When it runs:**
This filter is applied when sanitizing a site URL during license activation or validation.

**Parameters:**

- `$url` (string): The sanitized URL
- `$originalUrl` (string): The original URL before sanitization

**Returns:**
- `$url` (string): The modified sanitized URL

**Source:** `LicenseHelper.php:36`

**Usage:**
```php
add_filter('fluent_cart/license/santized_url', function ($url, $originalUrl) {
    // Normalize www subdomain
    return str_replace('://www.', '://', $url);
}, 10, 2);
```
</details>

---

## Pro: License Validation & Staging <Badge type="warning" text="Pro" />

### <code> fluent_cart_sl/is_local_site </code>
<details>
<summary><code>fluent_cart_sl/is_local_site</code> <Badge type="warning" text="Pro" /> &mdash; Filter local/staging site detection</summary>

**When it runs:**
This filter is applied when determining if the current site is a local or staging environment for licensing purposes.

**Parameters:**

- `$isLocal` (bool): Whether the site is detected as local
- `$context` (array): Context data
    ```php
    $context = [
        'url'  => 'https://staging.example.com',
        'site' => 'staging.example.com'
    ];
    ```

**Returns:**
- `$isLocal` (bool): The modified detection result

**Source:** `fluent-cart-pro/.../LicenseSite.php:69`

**Usage:**
```php
add_filter('fluent_cart_sl/is_local_site', function ($isLocal, $context) {
    // Mark custom staging domains as local
    if (str_contains($context['url'], '.staging.')) {
        return true;
    }
    return $isLocal;
}, 10, 2);
```
</details>

### <code> license/staging_subdomain_patterns </code>
<details>
<summary><code>fluent_cart/license/staging_subdomain_patterns</code> <Badge type="warning" text="Pro" /> &mdash; Filter staging subdomain patterns</summary>

**When it runs:**
This filter is applied when checking if a URL matches known staging subdomain patterns.

**Parameters:**

- `$patterns` (array): Array of subdomain patterns that indicate staging sites

**Returns:**
- `$patterns` (array): The modified patterns array

**Source:** `LicenseHelper.php:619`

**Usage:**
```php
add_filter('fluent_cart/license/staging_subdomain_patterns', function ($patterns) {
    $patterns[] = 'dev-';
    $patterns[] = 'test-';
    return $patterns;
});
```
</details>

### <code> license/staging_subfolder_patterns </code>
<details>
<summary><code>fluent_cart/license/staging_subfolder_patterns</code> <Badge type="warning" text="Pro" /> &mdash; Filter staging subfolder patterns</summary>

**When it runs:**
This filter is applied when checking if a URL matches known staging subfolder patterns.

**Parameters:**

- `$patterns` (array): Array of subfolder patterns that indicate staging sites

**Returns:**
- `$patterns` (array): The modified patterns array

**Source:** `LicenseHelper.php:620`

**Usage:**
```php
add_filter('fluent_cart/license/staging_subfolder_patterns', function ($patterns) {
    $patterns[] = '/staging/';
    $patterns[] = '/test-site/';
    return $patterns;
});
```
</details>

### <code> license/staging_domains </code>
<details>
<summary><code>fluent_cart/license/staging_domains</code> <Badge type="warning" text="Pro" /> &mdash; Filter hosting provider staging domains</summary>

**When it runs:**
This filter is applied when checking if a URL belongs to a known hosting provider's staging domain.

**Parameters:**

- `$domains` (array): Array of hosting provider staging domain patterns

**Returns:**
- `$domains` (array): The modified domains array

**Source:** `LicenseHelper.php:621`

**Usage:**
```php
add_filter('fluent_cart/license/staging_domains', function ($domains) {
    $domains[] = 'mystaginghost.com';
    $domains[] = 'preview.myhost.io';
    return $domains;
});
```
</details>

### <code> license/is_staging_site_result </code>
<details>
<summary><code>fluent_cart/license/is_staging_site_result</code> <Badge type="warning" text="Pro" /> &mdash; Filter final staging site detection result</summary>

**When it runs:**
This filter is applied after all staging detection checks, providing the final determination of whether a site is a staging environment.

**Parameters:**

- `$isStaging` (bool): Whether the site is detected as staging (default `false`)
- `$url` (string): The site URL being checked

**Returns:**
- `$isStaging` (bool): The modified staging detection result

**Source:** `LicenseHelper.php:657`

**Usage:**
```php
add_filter('fluent_cart/license/is_staging_site_result', function ($isStaging, $url) {
    // Override staging detection for specific domains
    if (str_contains($url, 'mycompany-staging.com')) {
        return true;
    }
    return $isStaging;
}, 10, 2);
```
</details>

---

## Pro: License Configuration <Badge type="warning" text="Pro" />

### <code> license/validity_by_variation </code>
<details>
<summary><code>fluent_cart/license/validity_by_variation</code> <Badge type="warning" text="Pro" /> &mdash; Filter license validity per variation</summary>

**When it runs:**
This filter is applied when determining license validity settings for a specific product variation.

**Parameters:**

- `$validity` (array): The validity settings
- `$context` (array): Context data
    ```php
    $context = [
        'variation' => $variationModel
    ];
    ```

**Returns:**
- `$validity` (array): The modified validity settings

**Source:** `ProductLicenseController.php:74`

**Usage:**
```php
add_filter('fluent_cart/license/validity_by_variation', function ($validity, $context) {
    // Set custom validity for premium variations
    $variation = $context['variation'];
    if ($variation->slug === 'premium') {
        $validity['duration'] = 365;
        $validity['unit']     = 'days';
    }
    return $validity;
}, 10, 2);
```
</details>

### <code> licensing/delete_license_on_order_deleted </code>
<details>
<summary><code>fluent_cart/licensing/delete_license_on_order_deleted</code> <Badge type="warning" text="Pro" /> &mdash; Filter whether to delete license when order is deleted</summary>

**When it runs:**
This filter controls whether associated licenses should be deleted when an order is deleted.

**Parameters:**

- `$delete` (bool): Whether to delete the license (default `true`)

**Returns:**
- `$delete` (bool): The modified value

**Source:** `license-actions.php:117`

**Usage:**
```php
add_filter('fluent_cart/licensing/delete_license_on_order_deleted', function ($delete) {
    // Preserve licenses even when orders are deleted
    return false;
});
```
</details>

### <code> licensing/revoke_license_on_payment_failed </code>
<details>
<summary><code>fluent_cart/licensing/revoke_license_on_payment_failed</code> <Badge type="warning" text="Pro" /> &mdash; Filter whether to revoke license on payment failure</summary>

**When it runs:**
This filter controls whether a license should be revoked when a payment fails.

**Parameters:**

- `$revoke` (bool): Whether to revoke the license (default `true`)

**Returns:**
- `$revoke` (bool): The modified value

**Source:** `LicenseGenerationHandler.php:123`

**Usage:**
```php
add_filter('fluent_cart/licensing/revoke_license_on_payment_failed', function ($revoke) {
    // Give a grace period instead of immediate revocation
    return false;
});
```
</details>

### <code> licensing/license_create_data </code>
<details>
<summary><code>fluent_cart/licensing/license_create_data</code> <Badge type="warning" text="Pro" /> &mdash; Filter license creation data</summary>

**When it runs:**
This filter is applied when constructing the data for a new license before it is saved to the database.

**Parameters:**

- `$data` (array): The license creation data
- `$context` (array): Context data
    ```php
    $context = [
        'order'        => $orderModel,
        'variation'    => $variationModel,
        'subscription' => $subscriptionModel
    ];
    ```

**Returns:**
- `$data` (array): The modified license data

**Source:** `LicenseGenerationHandler.php:521`

**Usage:**
```php
add_filter('fluent_cart/licensing/license_create_data', function ($data, $context) {
    // Set custom activation limit based on variation
    $variation = $context['variation'];
    if ($variation->slug === 'enterprise') {
        $data['activation_limit'] = 100;
    }
    return $data;
}, 10, 2);
```
</details>

### <code> license/expiration_date_by_variation </code>
<details>
<summary><code>fluent_cart/license/expiration_date_by_variation</code> <Badge type="warning" text="Pro" /> &mdash; Filter license expiration date</summary>

**When it runs:**
This filter is applied when calculating the license expiration date for a specific product variation.

**Parameters:**

- `$timestamp` (int|false): The expiration timestamp, or `false` for no expiration
- `$context` (array): Context data
    ```php
    $context = [
        'variation'  => $variationModel,
        'trial_days' => 14
    ];
    ```

**Returns:**
- `$timestamp` (int|false): The modified expiration timestamp

**Source:** `LicenseHelper.php:81`

**Usage:**
```php
add_filter('fluent_cart/license/expiration_date_by_variation', function ($timestamp, $context) {
    // Add extra 30 days for trial users
    if ($context['trial_days'] > 0 && $timestamp) {
        return $timestamp + (30 * DAY_IN_SECONDS);
    }
    return $timestamp;
}, 10, 2);
```
</details>

### <code> license/default_validity_by_variation </code>
<details>
<summary><code>fluent_cart/license/default_validity_by_variation</code> <Badge type="warning" text="Pro" /> &mdash; Filter default license validity</summary>

**When it runs:**
This filter is applied when retrieving the default license validity settings for a product variation.

**Parameters:**

- `$validity` (array): The default validity settings
    ```php
    $validity = [
        'unit'  => 'years',
        'value' => 1
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'variation' => $variationModel
    ];
    ```

**Returns:**
- `$validity` (array): The modified validity settings

**Source:** `LicenseHelper.php:418`

**Usage:**
```php
add_filter('fluent_cart/license/default_validity_by_variation', function ($validity, $context) {
    // Set lifetime validity for specific variations
    $variation = $context['variation'];
    if ($variation->slug === 'lifetime') {
        return ['unit' => 'years', 'value' => 100];
    }
    return $validity;
}, 10, 2);
```
</details>

### <code> license/grace_period_in_days </code>
<details>
<summary><code>fluent_cart/license/grace_period_in_days</code> <Badge type="warning" text="Pro" /> &mdash; Filter license grace period</summary>

**When it runs:**
This filter controls the number of grace period days after a license expires before it is fully revoked.

**Parameters:**

- `$days` (int): The grace period in days (default `15`)

**Returns:**
- `$days` (int): The modified grace period

**Source:** `LicenseHelper.php:687`

**Usage:**
```php
add_filter('fluent_cart/license/grace_period_in_days', function ($days) {
    // Extend grace period to 30 days
    return 30;
});
```
</details>

### <code> fluent_cart_sl/generate_license_key </code>
<details>
<summary><code>fluent_cart_sl/generate_license_key</code> <Badge type="warning" text="Pro" /> &mdash; Filter license key generation</summary>

**When it runs:**
This filter is applied when generating a new license key, allowing you to customize the key format.

**Parameters:**

- `$key` (string): The generated license key (MD5 hash by default)
- `$context` (array): Context data
    ```php
    $context = [
        'data' => $licenseData
    ];
    ```

**Returns:**
- `$key` (string): The modified license key

**Source:** `UUID.php:32`

**Usage:**
```php
add_filter('fluent_cart_sl/generate_license_key', function ($key, $context) {
    // Use a formatted license key
    $key = strtoupper($key);
    return implode('-', str_split($key, 8));
}, 10, 2);
```
</details>

### <code> fluent_cart_sl_encoded_package_url </code>
<details>
<summary><code>fluent_cart_sl_encoded_package_url</code> <Badge type="warning" text="Pro" /> &mdash; Filter encoded download package URL</summary>

**When it runs:**
This filter is applied to the encoded package download URL returned during update checks.

**Parameters:**

- `$package_url` (string): The encoded package URL

**Returns:**
- `$package_url` (string): The modified package URL

**Source:** `LicenseManager.php:152`

**Usage:**
```php
add_filter('fluent_cart_sl_encoded_package_url', function ($package_url) {
    // Route downloads through a CDN
    return str_replace('https://example.com', 'https://cdn.example.com', $package_url);
});
```
</details>

### <code> fluent_cart_sl/issue_license_data </code>
<details>
<summary><code>fluent_cart_sl/issue_license_data</code> <Badge type="warning" text="Pro" /> &mdash; Filter license issue data</summary>

**When it runs:**
This filter is applied to license data when issuing a new license through the license manager.

**Parameters:**

- `$data` (array): The license issue data

**Returns:**
- `$data` (array): The modified license data

**Source:** `LicenseManager.php:257`

**Usage:**
```php
add_filter('fluent_cart_sl/issue_license_data', function ($data) {
    // Set default activation limit
    if (empty($data['activation_limit'])) {
        $data['activation_limit'] = 5;
    }
    return $data;
});
```
</details>

### <code> fluentcart/sanitize_user_meta </code>
<details>
<summary><code>fluentcart/sanitize_user_meta</code> <Badge type="warning" text="Pro" /> &mdash; Filter user metadata sanitization</summary>

**When it runs:**
This filter controls whether a specific user meta field should be sanitized during processing.

> **Note:** This hook uses a non-standard prefix (`fluentcart/`) rather than the standard `fluent_cart/` convention. This is a legacy naming that may be standardized in a future release.

**Parameters:**

- `$sanitize` (bool): Whether to sanitize the field (default `true`)
- `$metaFieldName` (string): The meta field name
- `$metaData` (mixed): The meta data value

**Returns:**
- `$sanitize` (bool): Whether to sanitize

**Source:** `WPUserConnect.php:219`

**Usage:**
```php
add_filter('fluentcart/sanitize_user_meta', function ($sanitize, $metaFieldName, $metaData) {
    // Skip sanitization for specific fields
    if ($metaFieldName === 'custom_html_field') {
        return false;
    }
    return $sanitize;
}, 10, 3);
```
</details>

---

## Pro: Plugin Updater <Badge type="warning" text="Pro" />

### <code> fluent_sl/api_request_query_params </code>
<details>
<summary><code>fluent_sl/api_request_query_params</code> <Badge type="warning" text="Pro" /> &mdash; Filter API request query parameters</summary>

**When it runs:**
This filter is applied when building query parameters for license API requests (update checks, activations, etc.).

**Parameters:**

- `$params` (array): The query parameters array

**Returns:**
- `$params` (array): The modified query parameters

**Source:** `PluginUpdater.php:234`

**Usage:**
```php
add_filter('fluent_sl/api_request_query_params', function ($params) {
    // Add custom tracking parameter
    $params['php_version'] = phpversion();
    $params['wp_version']  = get_bloginfo('version');
    return $params;
});
```
</details>

### <code> fluent_sl/updater_payload_{$slug} </code>
<details>
<summary><code>fluent_sl/updater_payload_{$slug}</code> <Badge type="warning" text="Pro" /> &mdash; Filter update check payload (DYNAMIC)</summary>

**When it runs:**
This dynamic filter is applied to the update check payload for a specific plugin slug. The `{$slug}` is replaced with the plugin's slug.

**Parameters:**

- `$payload` (array): The update check payload

**Returns:**
- `$payload` (array): The modified payload

**Source:** `PluginUpdater.php:251`

**Usage:**
```php
add_filter('fluent_sl/updater_payload_fluent-cart-pro', function ($payload) {
    // Add environment info to update payload
    $payload['server_software'] = $_SERVER['SERVER_SOFTWARE'] ?? 'unknown';
    return $payload;
});
```
</details>

---
