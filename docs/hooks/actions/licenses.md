<Badge type="warning" text="Pro" />

# Licenses

Action hooks for software licensing lifecycle management including [License](/database/models/license) status changes, [LicenseActivation](/database/models/license-activation) management, [LicenseSite](/database/models/license-site) activations/deactivations, and bulk operations. All hooks in this section require the FluentCart Pro plugin.

---

## License Status

### <code> license_status_updated </code>
<details open>
<summary><code>fluent_cart_sl/license_status_updated</code> <Badge type="warning" text="Pro" /> &mdash; Fires on any license status change</summary>

**When it runs:**
This action fires whenever a [License](/database/models/license)'s status transitions from one value to another (e.g., `active` to `expired`, `active` to `disabled`, etc.).

**Parameters:**

- `$data` (array): License status change data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The license model after the status change
    - `old_status` (string) — The previous status value
    - `new_status` (string) — The new status value

**Source:** `fluent-cart-pro/app/Modules/Licensing/Models/License.php:206`

**Usage:**
```php
add_action('fluent_cart_sl/license_status_updated', function ($data) {
    $license   = $data['license'];
    $oldStatus = $data['old_status'];
    $newStatus = $data['new_status'];

    fluent_cart_add_log(
        'License Status Changed',
        sprintf('License #%d changed from %s to %s', $license->id, $oldStatus, $newStatus),
        'info'
    );
}, 10, 1);
```
</details>

### <code> license_status_updated_to_{$newStatus} </code>
<details>
<summary><code>fluent_cart_sl/license_status_updated_to_{$newStatus}</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license transitions to a specific status</summary>

**When it runs:**
This is a dynamic hook that fires for a specific target status. For example, `fluent_cart_sl/license_status_updated_to_expired` fires only when a [License](/database/models/license) becomes `expired`.

**Parameters:**

- `$data` (array): License status change data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The license model after the status change
    - `old_status` (string) — The previous status value
    - `new_status` (string) — The new status value

**Source:** `fluent-cart-pro/app/Modules/Licensing/Models/License.php:211`

**Usage:**
```php
add_action('fluent_cart_sl/license_status_updated_to_expired', function ($data) {
    $license   = $data['license'];
    $oldStatus = $data['old_status'];
    $newStatus = $data['new_status'];

    // Handle license expiration
    wp_mail(get_option('admin_email'), 'License Expired', sprintf('License #%d has expired.', $license->id));
}, 10, 1);
```
</details>

---

## License Activation Status

### <code> license_activation_status_updated </code>
<details>
<summary><code>fluent_cart_sl/license_activation_status_updated</code> <Badge type="warning" text="Pro" /> &mdash; Fires on any license activation status change</summary>

**When it runs:**
This action fires whenever a [LicenseActivation](/database/models/license-activation)'s status transitions from one value to another.

**Parameters:**

- `$data` (array): License activation status change data
    - `license` ([`\FluentCart\App\Models\LicenseActivation`](/database/models/license-activation)) — The license activation model (note: key is `license` but value is a LicenseActivation instance)
    - `old_status` (string) — The previous activation status
    - `new_status` (string) — The new activation status

**Source:** `fluent-cart-pro/app/Modules/Licensing/Models/LicenseActivation.php:52`

**Usage:**
```php
add_action('fluent_cart_sl/license_activation_status_updated', function ($data) {
    $activation = $data['license']; // Note: key is 'license' but value is a LicenseActivation instance
    $oldStatus  = $data['old_status'];
    $newStatus  = $data['new_status'];

    fluent_cart_add_log(
        'License Activation Status Changed',
        sprintf('Activation #%d status changed from %s to %s', $activation->id, $oldStatus, $newStatus),
        'info'
    );
}, 10, 1);
```
</details>

### <code> license_activation_status_updated_to_{$newStatus} </code>
<details>
<summary><code>fluent_cart_sl/license_activation_status_updated_to_{$newStatus}</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license activation transitions to a specific status</summary>

**When it runs:**
This is a dynamic hook that fires for a specific target [LicenseActivation](/database/models/license-activation) status.

**Parameters:**

- `$data` (array): License activation status change data
    - `license` ([`\FluentCart\App\Models\LicenseActivation`](/database/models/license-activation)) — The license activation model (note: key is `license` but value is a LicenseActivation instance)
    - `old_status` (string) — The previous activation status
    - `new_status` (string) — The new activation status

**Source:** `fluent-cart-pro/app/Modules/Licensing/Models/LicenseActivation.php:57`

**Usage:**
```php
add_action('fluent_cart_sl/license_activation_status_updated_to_active', function ($data) {
    $activation = $data['license']; // Note: key is 'license' but value is a LicenseActivation instance
    $oldStatus  = $data['old_status'];
    $newStatus  = $data['new_status'];

    // Handle activation becoming active
}, 10, 1);
```
</details>

---

## License Limits

### <code> license_limit_increased (activation count) </code>
<details>
<summary><code>fluent_cart_sl/license_limit_increased</code> <Badge type="warning" text="Pro" /> &mdash; Fires when the license activation count is increased</summary>

**When it runs:**
This action fires when a [License](/database/models/license)'s activation count is increased.

**Parameters:**

- `$data` (array): License limit change data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The license model
    - `old_count` (int) — The previous activation count

**Source:** `fluent-cart-pro/app/Modules/Licensing/Models/License.php:224`

**Usage:**
```php
add_action('fluent_cart_sl/license_limit_increased', function ($data) {
    $license  = $data['license'];
    $oldCount = $data['old_count'];

    fluent_cart_add_log(
        'License Activation Count Increased',
        sprintf('License #%d activation count increased from %d', $license->id, $oldCount),
        'info'
    );
}, 10, 1);
```
</details>

### <code> license_limit_decreased </code>
<details>
<summary><code>fluent_cart_sl/license_limit_decreased</code> <Badge type="warning" text="Pro" /> &mdash; Fires when the license activation count is decreased</summary>

**When it runs:**
This action fires when a [License](/database/models/license)'s activation count is decreased.

**Parameters:**

- `$data` (array): License limit change data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The license model
    - `old_count` (int) — The previous activation count

**Source:** `fluent-cart-pro/app/Modules/Licensing/Models/License.php:239`

**Usage:**
```php
add_action('fluent_cart_sl/license_limit_decreased', function ($data) {
    $license  = $data['license'];
    $oldCount = $data['old_count'];

    fluent_cart_add_log(
        'License Activation Count Decreased',
        sprintf('License #%d activation count decreased from %d', $license->id, $oldCount),
        'info'
    );
}, 10, 1);
```
</details>

### <code> license_limit_increased (limit slots) </code>
<details>
<summary><code>fluent_cart_sl/license_limit_increased</code> <Badge type="warning" text="Pro" /> &mdash; Fires when the license activation limit (slots) is increased</summary>

**When it runs:**
This action fires when a [License](/database/models/license)'s activation limit (maximum allowed activations) is increased.

**Parameters:**

- `$data` (array): License limit change data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The license model
    - `old_count` (int) — The previous activation limit

**Source:** `fluent-cart-pro/app/Modules/Licensing/Models/License.php:259`

**Usage:**
```php
add_action('fluent_cart_sl/license_limit_increased', function ($data) {
    $license  = $data['license'];
    $oldCount = $data['old_count'];

    fluent_cart_add_log(
        'License Limit Increased',
        sprintf('License #%d activation limit increased from %d', $license->id, $oldCount),
        'info'
    );
}, 10, 1);
```
</details>

---

## License Key & Validity

### <code> license_key_regenerated </code>
<details>
<summary><code>fluent_cart_sl/license_key_regenerated</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license key is regenerated</summary>

**When it runs:**
This action fires when a license key is regenerated, replacing the old key with a new one.

**Parameters:**

- `$data` (array): License key change data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The license model with the new key
    - `old_key` (string) — The previous license key

**Source:** `fluent-cart-pro/app/Modules/Licensing/Models/License.php:318`

**Usage:**
```php
add_action('fluent_cart_sl/license_key_regenerated', function ($data) {
    $license = $data['license'];
    $oldKey  = $data['old_key'];

    fluent_cart_add_log(
        'License Key Regenerated',
        sprintf('License #%d key was regenerated', $license->id),
        'info'
    );
}, 10, 1);
```
</details>

### <code> license_validity_extended </code>
<details>
<summary><code>fluent_cart_sl/license_validity_extended</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license expiration date is changed</summary>

**When it runs:**
This action fires when a license's expiration date is modified to a new date.

**Parameters:**

- `$data` (array): License validity change data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The license model
    - `old_date` (string) — The previous expiration date
    - `new_date` (string) — The new expiration date

**Source:** `fluent-cart-pro/app/Modules/Licensing/Models/License.php:348`

**Usage:**
```php
add_action('fluent_cart_sl/license_validity_extended', function ($data) {
    $license = $data['license'];
    $oldDate = $data['old_date'];
    $newDate = $data['new_date'];

    fluent_cart_add_log(
        'License Validity Extended',
        sprintf('License #%d expiration changed from %s to %s', $license->id, $oldDate, $newDate),
        'info'
    );
}, 10, 1);
```
</details>

---

## License Lifecycle

### <code> license_issued (order) </code>
<details>
<summary><code>fluent_cart/licensing/license_issued</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a new license is created for an order</summary>

**When it runs:**
This action fires when a new license is generated as part of an order fulfillment process.

**Parameters:**

- `$data` (array): License issuance data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The newly created license
    - `data` (array) — License creation data
    - `order` ([`\FluentCart\App\Models\Order`](/database/models/order)) — The associated order
    - `subscription` ([`\FluentCart\App\Models\Subscription`](/database/models/subscription)|null) — The associated subscription, if any

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseGenerationHandler.php:532`

**Usage:**
```php
add_action('fluent_cart/licensing/license_issued', function ($data) {
    $license      = $data['license'];
    $order        = $data['order'];
    $subscription = $data['subscription'];

    // Notify customer about their new license
    wp_mail(
        $order->customer->email,
        'Your License Key',
        sprintf('Your license key for order #%d is: %s', $order->id, $license->license_key)
    );
}, 10, 1);
```
</details>

### <code> license_issued (manager) </code>
<details>
<summary><code>fluent_cart_sl/license_issued</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license is issued via the license manager</summary>

**When it runs:**
This action fires when a license is created through the admin license management interface.

**Parameters:**

- `$data` (array): License issuance data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The newly created license
    - `data` (array) — License creation data

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/LicenseManager.php:261`

**Usage:**
```php
add_action('fluent_cart_sl/license_issued', function ($data) {
    $license    = $data['license'];
    $createData = $data['data'];

    fluent_cart_add_log(
        'License Issued via Manager',
        sprintf('License #%d issued manually', $license->id),
        'info'
    );
}, 10, 1);
```
</details>

### <code> license_renewed </code>
<details>
<summary><code>fluent_cart/licensing/license_renewed</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license expiration is extended on subscription renewal</summary>

**When it runs:**
This action fires when a license's expiration date is extended because the associated subscription has been successfully renewed.

**Parameters:**

- `$data` (array): License renewal data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The renewed license
    - `subscription` ([`\FluentCart\App\Models\Subscription`](/database/models/subscription)) — The associated subscription
    - `prev_status` (string) — The previous license status

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseGenerationHandler.php:231`

**Usage:**
```php
add_action('fluent_cart/licensing/license_renewed', function ($data) {
    $license      = $data['license'];
    $subscription = $data['subscription'];
    $prevStatus   = $data['prev_status'];

    fluent_cart_add_log(
        'License Renewed',
        sprintf('License #%d renewed via subscription #%d', $license->id, $subscription->id),
        'info'
    );
}, 10, 1);
```
</details>

### <code> license_expired </code>
<details>
<summary><code>fluent_cart/licensing/license_expired</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license expires due to subscription cancellation or scheduler</summary>

**When it runs:**
This action fires when a license is marked as expired, either because the associated subscription was cancelled or because the license scheduler determined it has passed its expiration date.

**Parameters:**

- `$data` (array): License expiration data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The expired license
    - `subscription` ([`\FluentCart\App\Models\Subscription`](/database/models/subscription)) — The associated subscription
    - `prev_status` (string) — The previous license status

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseGenerationHandler.php:267`, `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseSchedulerHandler.php:46`

**Usage:**
```php
add_action('fluent_cart/licensing/license_expired', function ($data) {
    $license      = $data['license'];
    $subscription = $data['subscription'];
    $prevStatus   = $data['prev_status'];

    // Notify customer about license expiration
    wp_mail(
        $license->customer->email,
        'License Expired',
        sprintf('Your license #%d has expired.', $license->id)
    );
}, 10, 1);
```
</details>

### <code> license_disabled </code>
<details>
<summary><code>fluent_cart/licensing/license_disabled</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license is disabled due to payment failure or refund</summary>

**When it runs:**
This action fires when a license is disabled, typically because the associated order's payment failed or a refund was processed.

**Parameters:**

- `$data` (array): License disabled data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The disabled license
    - `order` ([`\FluentCart\App\Models\Order`](/database/models/order)) — The associated order
    - `reason` (string|undefined) — The reason for disabling (only present on payment failure; absent on refund)

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseGenerationHandler.php:158`, `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseGenerationHandler.php:196`

**Usage:**
```php
add_action('fluent_cart/licensing/license_disabled', function ($data) {
    $license = $data['license'];
    $order   = $data['order'];
    $reason  = $data['reason'] ?? '';

    fluent_cart_add_log(
        'License Disabled',
        sprintf('License #%d disabled for order #%d. Reason: %s', $license->id, $order->id, $reason ?: 'refund'),
        'warning'
    );
}, 10, 1);
```
</details>

### <code> extended_to_lifetime </code>
<details>
<summary><code>fluent_cart/licensing/extended_to_lifetime</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license is extended to lifetime on subscription end-of-term</summary>

**When it runs:**
This action fires when a license is converted to a lifetime license because its associated subscription has completed all billing cycles (end-of-term).

**Parameters:**

- `$data` (array): License lifetime extension data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The license extended to lifetime
    - `subscription` ([`\FluentCart\App\Models\Subscription`](/database/models/subscription)) — The associated subscription
    - `prev_status` (string) — The previous license status

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseGenerationHandler.php:302`

**Usage:**
```php
add_action('fluent_cart/licensing/extended_to_lifetime', function ($data) {
    $license      = $data['license'];
    $subscription = $data['subscription'];
    $prevStatus   = $data['prev_status'];

    wp_mail(
        $license->customer->email,
        'License Extended to Lifetime',
        sprintf('Your license #%d has been extended to lifetime access!', $license->id)
    );
}, 10, 1);
```
</details>

### <code> license_upgraded </code>
<details>
<summary><code>fluent_cart/licensing/license_upgraded</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license is upgraded to a new plan</summary>

**When it runs:**
This action fires when a license is upgraded to a different plan, typically through a plan change or upgrade flow.

**Parameters:**

- `$data` (array): License upgrade data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The upgraded license
    - `order` ([`\FluentCart\App\Models\Order`](/database/models/order)) — The associated order
    - `subscription` ([`\FluentCart\App\Models\Subscription`](/database/models/subscription)) — The associated subscription
    - `updates` (array) — The update data applied to the license

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseGenerationHandler.php:375`

**Usage:**
```php
add_action('fluent_cart/licensing/license_upgraded', function ($data) {
    $license      = $data['license'];
    $order        = $data['order'];
    $subscription = $data['subscription'];
    $updates      = $data['updates'];

    fluent_cart_add_log(
        'License Upgraded',
        sprintf('License #%d upgraded for order #%d', $license->id, $order->id),
        'info'
    );
}, 10, 1);
```
</details>

### <code> license_deleted (admin) </code>
<details>
<summary><code>fluent_cart_sl/license_deleted</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license is deleted from the admin interface</summary>

**When it runs:**
This action fires when an admin deletes a license through the license management UI.

**Parameters:**

- `$data` (array): License deletion data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The license being deleted

**Source:** `fluent-cart-pro/app/Modules/Licensing/Http/Controllers/LicenseController.php:255`

**Usage:**
```php
add_action('fluent_cart_sl/license_deleted', function ($data) {
    $license = $data['license'];

    fluent_cart_add_log(
        'License Deleted',
        sprintf('License #%d was deleted by admin', $license->id),
        'warning'
    );
}, 10, 1);
```
</details>

### <code> license_deleted (order deleted) </code>
<details>
<summary><code>fluent_cart/licensing/license_deleted</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license is deleted because its parent order was deleted</summary>

**When it runs:**
This action fires when a license is automatically deleted as a result of its parent order being deleted.

**Parameters:**

- `$data` (array): License deletion data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The license being deleted
    - `order` ([`\FluentCart\App\Models\Order`](/database/models/order)) — The parent order being deleted

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/license-actions.php:141`

**Usage:**
```php
add_action('fluent_cart/licensing/license_deleted', function ($data) {
    $license = $data['license'];
    $order   = $data['order'];

    fluent_cart_add_log(
        'License Deleted with Order',
        sprintf('License #%d deleted because order #%d was deleted', $license->id, $order->id),
        'warning'
    );
}, 10, 1);
```
</details>

---

## License Site Activation

### <code> site_activated (API) </code>
<details>
<summary><code>fluent_cart/license/site_activated</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a site is activated for a license via the public API</summary>

**When it runs:**
This action fires when a site is successfully activated for a license through the external licensing API.

**Parameters:**

- `$site` ([`\FluentCart\App\Models\LicenseSite`](/database/models/license-site)) — The activated site
- `$activation` ([`\FluentCart\App\Models\LicenseActivation`](/database/models/license-activation)) — The license activation record
- `$license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The associated license
- `$data` (array) — The activation request data

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseApiHandler.php:255`

**Usage:**
```php
add_action('fluent_cart/license/site_activated', function ($site, $activation, $license, $data) {
    fluent_cart_add_log(
        'Site Activated via API',
        sprintf('Site %s activated for license #%d', $site->site_url, $license->id),
        'info'
    );
}, 10, 4);
```
</details>

### <code> site_deactivated (API) </code>
<details>
<summary><code>fluent_cart/license/site_deactivated</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a site is deactivated via the public API</summary>

**When it runs:**
This action fires when a site is successfully deactivated for a license through the external licensing API.

**Parameters:**

- `$site` ([`\FluentCart\App\Models\LicenseSite`](/database/models/license-site)) — The deactivated site
- `$activation` ([`\FluentCart\App\Models\LicenseActivation`](/database/models/license-activation)) — The license activation record
- `$license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The associated license
- `$data` (array) — The deactivation request data

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseApiHandler.php:340`

**Usage:**
```php
add_action('fluent_cart/license/site_deactivated', function ($site, $activation, $license, $data) {
    fluent_cart_add_log(
        'Site Deactivated via API',
        sprintf('Site %s deactivated for license #%d', $site->site_url, $license->id),
        'info'
    );
}, 10, 4);
```
</details>

### <code> site_deactivated_failed </code>
<details>
<summary><code>fluent_cart/license/site_deactivated_failed</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a site deactivation attempt fails</summary>

**When it runs:**
This action fires when a site deactivation request fails. This can happen for multiple reasons such as an invalid license key, site not found, or activation mismatch.

**Parameters:**

- `$formattedData` (array) — Error information including the reason for failure

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseApiHandler.php:295,309,321`

**Usage:**
```php
add_action('fluent_cart/license/site_deactivated_failed', function ($formattedData) {
    fluent_cart_add_log(
        'Site Deactivation Failed',
        wp_json_encode($formattedData),
        'error'
    );
}, 10, 1);
```
</details>

### <code> site_activated (local) </code>
<details>
<summary><code>fluent_cart_sl/site_activated</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a site is activated via the local API method</summary>

**When it runs:**
This action fires when a site is activated through the internal (local) license site management method.

**Parameters:**

- `$data` (array): Site activation data
    - `site` ([`\FluentCart\App\Models\LicenseSite`](/database/models/license-site)) — The activated site
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The associated license
    - `activation` ([`\FluentCart\App\Models\LicenseActivation`](/database/models/license-activation)) — The license activation record

**Source:** `fluent-cart-pro/app/Modules/Licensing/Concerns/CanManageLicenseSites.php:84`

**Usage:**
```php
add_action('fluent_cart_sl/site_activated', function ($data) {
    $site       = $data['site'];
    $license    = $data['license'];
    $activation = $data['activation'];

    fluent_cart_add_log(
        'Site Activated Locally',
        sprintf('Site %s activated for license #%d', $site->site_url, $license->id),
        'info'
    );
}, 10, 1);
```
</details>

### <code> site_license_deactivated </code>
<details>
<summary><code>fluent_cart_sl/site_license_deactivated</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a license is deactivated from a site (admin or customer)</summary>

**When it runs:**
This action fires when a license is deactivated from a specific site, either by an admin through the management interface or by the customer through their profile.

**Parameters:**

- `$data` (array): Site deactivation data
    - `site` ([`\FluentCart\App\Models\LicenseSite`](/database/models/license-site)) — The site being deactivated
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The associated license

**Source:** `fluent-cart-pro/app/Modules/Licensing/Concerns/CanManageLicenseSites.php:141,177`, `fluent-cart-pro/app/Modules/Licensing/Http/Controllers/CustomerProfileController.php:192`

**Usage:**
```php
add_action('fluent_cart_sl/site_license_deactivated', function ($data) {
    $site    = $data['site'];
    $license = $data['license'];

    fluent_cart_add_log(
        'Site License Deactivated',
        sprintf('License #%d deactivated from site %s', $license->id, $site->site_url),
        'info'
    );
}, 10, 1);
```
</details>

---

## Bulk License Operations

### <code> before_deleting_licenses </code>
<details>
<summary><code>fluent_cart_sl/before_deleting_licenses</code> <Badge type="warning" text="Pro" /> &mdash; Fires before licenses are bulk deleted by order</summary>

**When it runs:**
This action fires immediately before a collection of licenses is deleted as part of a bulk operation (e.g., when an order is deleted).

**Parameters:**

- `$data` (array): Bulk deletion data
    - `licenses` (`\Illuminate\Support\Collection`) — Collection of [License](/database/models/license) models about to be deleted

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/LicenseManager.php:232`

**Usage:**
```php
add_action('fluent_cart_sl/before_deleting_licenses', function ($data) {
    $licenses = $data['licenses'];

    foreach ($licenses as $license) {
        fluent_cart_add_log('License Bulk Delete', sprintf('About to delete license #%d', $license->id), 'warning');
    }
}, 10, 1);
```
</details>

### <code> after_deleting_licenses </code>
<details>
<summary><code>fluent_cart_sl/after_deleting_licenses</code> <Badge type="warning" text="Pro" /> &mdash; Fires after licenses are bulk deleted</summary>

**When it runs:**
This action fires immediately after a collection of licenses has been deleted.

**Parameters:**

- `$data` (array): Bulk deletion data
    - `licenses` (`\Illuminate\Support\Collection`) — Collection of [License](/database/models/license) models that were deleted

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/LicenseManager.php:237`

**Usage:**
```php
add_action('fluent_cart_sl/after_deleting_licenses', function ($data) {
    $licenses = $data['licenses'];

    fluent_cart_add_log('Licenses Bulk Deleted', sprintf('%d licenses were deleted', $licenses->count()), 'warning');
}, 10, 1);
```
</details>

### <code> before_updating_licenses_status </code>
<details>
<summary><code>fluent_cart_sl/before_updating_licenses_status</code> <Badge type="warning" text="Pro" /> &mdash; Fires before a bulk license status update</summary>

**When it runs:**
This action fires immediately before a collection of licenses has their status updated in bulk.

**Parameters:**

- `$data` (array): Bulk status update data
    - `licenses` (`\Illuminate\Support\Collection`) — Collection of [License](/database/models/license) models about to be updated

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/LicenseManager.php:285`

**Usage:**
```php
add_action('fluent_cart_sl/before_updating_licenses_status', function ($data) {
    $licenses = $data['licenses'];

    // Log or validate before bulk status change
}, 10, 1);
```
</details>

### <code> before_updating_licenses_status_to_disabled </code>
<details>
<summary><code>fluent_cart_sl/before_updating_licenses_status_to_disabled</code> <Badge type="warning" text="Pro" /> &mdash; Fires before licenses are bulk disabled</summary>

**When it runs:**
This action fires immediately before a collection of licenses is bulk-disabled.

**Parameters:**

- `$data` (array): Bulk disable data
    - `licenses` (`\Illuminate\Support\Collection`) — Collection of [License](/database/models/license) models about to be disabled

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/LicenseManager.php:286`

**Usage:**
```php
add_action('fluent_cart_sl/before_updating_licenses_status_to_disabled', function ($data) {
    $licenses = $data['licenses'];

    // Perform pre-disable checks
}, 10, 1);
```
</details>

### <code> after_updating_licenses_status </code>
<details>
<summary><code>fluent_cart_sl/after_updating_licenses_status</code> <Badge type="warning" text="Pro" /> &mdash; Fires after a bulk license status update</summary>

**When it runs:**
This action fires immediately after a collection of licenses has had their status updated in bulk.

**Parameters:**

- `$data` (array): Bulk status update data
    - `licenses` (`\Illuminate\Support\Collection`) — Collection of [License](/database/models/license) models that were updated

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/LicenseManager.php:290`

**Usage:**
```php
add_action('fluent_cart_sl/after_updating_licenses_status', function ($data) {
    $licenses = $data['licenses'];

    fluent_cart_add_log('Licenses Status Updated', sprintf('%d licenses updated', $licenses->count()), 'info');
}, 10, 1);
```
</details>

### <code> after_updating_licenses_status_to_disabled </code>
<details>
<summary><code>fluent_cart_sl/after_updating_licenses_status_to_disabled</code> <Badge type="warning" text="Pro" /> &mdash; Fires after licenses are bulk disabled</summary>

**When it runs:**
This action fires immediately after a collection of licenses has been bulk-disabled.

**Parameters:**

- `$data` (array): Bulk disable data
    - `licenses` (`\Illuminate\Support\Collection`) — Collection of [License](/database/models/license) models that were disabled

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/LicenseManager.php:291`

**Usage:**
```php
add_action('fluent_cart_sl/after_updating_licenses_status_to_disabled', function ($data) {
    $licenses = $data['licenses'];

    fluent_cart_add_log('Licenses Bulk Disabled', sprintf('%d licenses disabled', $licenses->count()), 'warning');
}, 10, 1);
```
</details>

---
