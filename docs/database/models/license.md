---
title: License Model
description: FluentCart Pro License model documentation with attributes, scopes, relationships, and methods.
---

<Badge type="warning" text="Pro" />

# License Model

| DB Table Name | {wp_db_prefix}_fct_licenses                  |
| ------------- | -------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-licenses-table) |
| Source File   | fluent-cart-pro/app/Modules/Licensing/Models/License.php |
| Name Space    | FluentCartPro\App\Modules\Licensing\Models  |
| Class         | FluentCartPro\App\Modules\Licensing\Models\License |
| Plugin        | FluentCart Pro                               |

## Properties

- **Table**: `fct_licenses`
- **Primary Key**: `id`
- **Guarded**: `['id']`
- **Fillable**: `['status', 'limit', 'activation_count', 'license_key', 'product_id', 'variation_id', 'order_id', 'parent_id', 'customer_id', 'expiration_date', 'last_reminder_sent', 'last_reminder_type', 'subscription_id', 'config']`
- **Traits**: `CanSearch`

## Attributes

| Attribute           | Data Type | Comment |
| ------------------- | --------- | ------- |
| id                  | Integer   | Primary Key |
| status              | String    | License status (active, inactive, expired, disabled) |
| limit               | Integer   | Activation limit (0 = unlimited) |
| activation_count    | Integer   | Current activation count |
| license_key         | String    | Unique license key |
| product_id          | Integer   | Reference to product |
| variation_id        | Integer   | Reference to product variation |
| order_id            | Integer   | Reference to order |
| parent_id           | Integer   | Parent license ID (for renewals) |
| customer_id         | Integer   | Reference to customer |
| expiration_date     | Date Time | License expiration date (null = lifetime) |
| last_reminder_sent  | Date Time | Last reminder sent date |
| last_reminder_type  | String    | Last reminder type |
| subscription_id     | Integer   | Reference to subscription |
| config              | JSON      | License configuration (auto-cast via accessor/mutator) |
| created_at          | Date Time | Creation timestamp |
| updated_at          | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$license = FluentCartPro\App\Modules\Licensing\Models\License::find(1);

$license->id; // returns id
$license->license_key; // returns license key
$license->status; // returns status
$license->activation_count; // returns activation count
$license->limit; // returns activation limit
$license->config; // returns config as array (auto-decoded)
```

## Scopes

This model has the following scopes that you can use

### scopeSearch($query, $search)

Search licenses by license key, order ID, product title, or customer name/email

* Parameters
   * $search - string

#### Usage:

```php
// Search across license key, order ID, product title, customer name/email
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::search('example@email.com')->get();
```

### scopeStatus($query, $status)

Filter licenses by status with smart logic. Supports: `active`, `expired`, `disabled`, `inactive`. Passing `'all'` or empty value returns all licenses.

* Parameters
   * $status - string

#### Usage:

```php
// Get active licenses (not expired, status is 'active')
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::status('active')->get();

// Get expired licenses (expiration_date < now)
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::status('expired')->get();

// Get inactive licenses (status 'active' but no activations)
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::status('inactive')->get();

// Get disabled licenses
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::status('disabled')->get();
```

### scopeProducts($query, $productIds)

Filter licenses by product IDs

* Parameters
   * $productIds - array

#### Usage:

```php
// Get all licenses for specific products
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::products([1, 2, 3])->get();
```

## Relations

This model has the following relationships that you can use

### customer

Access the associated customer (BelongsTo)

* return `FluentCart\App\Models\Customer` Model

#### Example:

```php
// Accessing Customer
$customer = $license->customer;

// For Filtering by customer relationship
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::whereHas('customer', function($query) {
    $query->where('email', 'customer@example.com');
})->get();
```

### order

Access the associated order (BelongsTo)

* return `FluentCart\App\Models\Order` Model

#### Example:

```php
// Accessing Order
$order = $license->order;

// For Filtering by order relationship
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::whereHas('order', function($query) {
    $query->where('status', 'completed');
})->get();
```

### product

Access the associated product (BelongsTo)

* return `FluentCart\App\Models\Product` Model

#### Example:

```php
// Accessing Product
$product = $license->product;

// For Filtering by product relationship
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::whereHas('product', function($query) {
    $query->where('post_status', 'publish');
})->get();
```

### variation

Access the associated product variation (BelongsTo)

* return `FluentCart\App\Models\ProductVariation` Model

#### Example:

```php
// Accessing Product Variation
$variation = $license->variation;
```

### productVariant

Alias for variation - access the associated product variation (BelongsTo)

* return `FluentCart\App\Models\ProductVariation` Model

#### Example:

```php
// Accessing Product Variant
$variant = $license->productVariant;
```

### productDetails

Access the associated product details (BelongsTo)

* return `FluentCart\App\Models\ProductDetail` Model

#### Example:

```php
// Accessing Product Details
$details = $license->productDetails;
```

### subscription

Access the associated subscription (BelongsTo)

* return `FluentCart\App\Models\Subscription` Model

#### Example:

```php
// Accessing Subscription
$subscription = $license->subscription;

// For Filtering by subscription relationship
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::whereHas('subscription', function($query) {
    $query->where('status', 'active');
})->get();
```

### activations

Access license activations (HasMany)

* return `FluentCartPro\App\Modules\Licensing\Models\LicenseActivation` Collection

#### Example:

```php
// Accessing Activations
$activations = $license->activations;

// For Filtering by activations relationship
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::whereHas('activations', function($query) {
    $query->where('status', 'active');
})->get();
```

### labels

Access license labels (MorphMany)

* return `FluentCart\App\Models\LabelRelationship` Collection

#### Example:

```php
// Accessing Labels
$labels = $license->labels;
```

## Methods

Along with Global Model methods, this model has few helper methods.

### getConfigAttribute($value)

Get config as array (accessor). Returns empty array if value is null or not valid JSON.

* Parameters
   * $value - mixed
* Returns `array`

#### Usage

```php
$config = $license->config; // Returns array
```

### setConfigAttribute($value)

Set config from array (mutator). Non-array or falsy values are stored as empty array JSON.

* Parameters
   * $value - array|null
* Returns `void`

#### Usage

```php
$license->config = ['auto_renew' => true, 'max_sites' => 5];
```

### isActive()

Check if license is active. Returns true if status is `active` or `inactive`.

* Parameters
   * none
* Returns `boolean`

#### Usage

```php
$isActive = $license->isActive();
```

### isExpired()

Check if license is expired. Takes into account the configurable grace period from `LicenseHelper::getLicenseGracePeriodDays()`.

* Parameters
   * none
* Returns `boolean`

#### Usage

```php
$isExpired = $license->isExpired();
```

### isValid()

Check if license is both not expired and active.

* Parameters
   * none
* Returns `boolean`

#### Usage

```php
$isValid = $license->isValid();
```

### getPublicStatus()

Get the public-facing status string. Returns `'valid'`, `'expired'`, or `'invalid'`.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$publicStatus = $license->getPublicStatus();
```

### getHumanReadableStatus()

Get human readable status. Returns `'active'` for both `active` and `inactive` statuses, otherwise returns the raw status.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$readableStatus = $license->getHumanReadableStatus();
```

### getActivationLimit()

Get remaining activation count. Returns `'unlimited'` if limit is 0 (unlimited), otherwise returns the number of remaining activations.

* Parameters
   * none
* Returns `string|integer` - `'unlimited'` or remaining activation count

#### Usage

```php
$remaining = $license->getActivationLimit();
```

### hasActivationLeft()

Check if there are any activations remaining.

* Parameters
   * none
* Returns `boolean`

#### Usage

```php
$hasLeft = $license->hasActivationLeft();
```

### updateLicenseStatus($newStatus)

Update the license status and fire action hooks. Does nothing if the new status is the same as current.

* Parameters
   * $newStatus - string
* Returns `$this`

**Actions Triggered:**
- `fluent_cart_sl/license_status_updated`
- `fluent_cart_sl/license_status_updated_to_{$newStatus}`

#### Usage

```php
$license->updateLicenseStatus('disabled');
```

### increaseActivationCount()

Increment the activation count by 1 and fire an action hook.

* Parameters
   * none
* Returns `$this`

**Actions Triggered:**
- `fluent_cart_sl/license_limit_increased`

#### Usage

```php
$license->increaseActivationCount();
```

### decreaseActivationCount()

Decrement the activation count by 1. Does nothing if count is already 0.

* Parameters
   * none
* Returns `$this`

**Actions Triggered:**
- `fluent_cart_sl/license_limit_decreased`

#### Usage

```php
$license->decreaseActivationCount();
```

### increaseLimit($newLimit)

Set a new activation limit. Passing `'unlimited'` or `0` sets the limit to 0 (unlimited).

* Parameters
   * $newLimit - integer|string
* Returns `$this`

**Actions Triggered:**
- `fluent_cart_sl/license_limit_increased`

#### Usage

```php
$license->increaseLimit(10);
$license->increaseLimit('unlimited');
```

### regenerateKey()

Generate a new license key using `UUID::licensesKey()` and fire an action hook.

* Parameters
   * none
* Returns `$this`

**Actions Triggered:**
- `fluent_cart_sl/license_key_regenerated`

#### Usage

```php
$license->regenerateKey();
```

### extendValidity($newDate)

Extend the license expiration date. Passing `'lifetime'` or `null` removes the expiration (lifetime license). Automatically re-activates the license if status is not `active` or `inactive`.

* Parameters
   * $newDate - string|null (`'lifetime'`, `null`, or a date string)
* Returns `$this`

**Actions Triggered:**
- `fluent_cart_sl/license_validity_extended`

#### Usage

```php
$license->extendValidity('2025-12-31');
$license->extendValidity('lifetime'); // Make lifetime
```

### recountActivations()

Recount active (non-local) activations and update the `activation_count`. If status is `inactive`, it is set to `active`.

* Parameters
   * none
* Returns `$this`

#### Usage

```php
$license->recountActivations();
```

### getDownloads()

Get downloadable files associated with the license. Resolves downloads based on product and variation, with download URLs generated via `Helper::generateDownloadFileLink()`.

* Parameters
   * none
* Returns `Collection|array`

#### Usage

```php
$downloads = $license->getDownloads();
foreach ($downloads as $download) {
    echo $download->product_title;
    echo $download->download_url;
}
```

### getPreviousOrders()

Get previous orders associated with this license from the `prev_order_ids` config key.

* Parameters
   * none
* Returns `Collection|array`

#### Usage

```php
$previousOrders = $license->getPreviousOrders();
```

### getRenewalUrl()

Get the renewal URL for an expired license with a subscription. Returns empty string if not expired or no subscription.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$renewalUrl = $license->getRenewalUrl();
```

### hasUpgrades()

Check if the license has available upgrade paths. Returns false if the license is not active, or if the order item is a bundle payment type.

* Parameters
   * none
* Returns `boolean`

#### Usage

```php
if ($license->hasUpgrades()) {
    // Show upgrade options
}
```

## License Statuses

License statuses used in FluentCart Pro:

- `active` - License is active and can be used
- `inactive` - License is active but has no activations
- `expired` - License has expired (derived from expiration_date)
- `disabled` - License is disabled

## Usage Examples

### Get Customer Licenses

```php
$customer = FluentCart\App\Models\Customer::find(123);
$licenses = $customer->licenses()->status('active')->get();

foreach ($licenses as $license) {
    echo "License: " . $license->license_key . " - " . $license->status;
}
```

### Search Licenses

```php
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::search('example.com')
    ->status('active')
    ->get();
```

### Check License Activation

```php
$license = FluentCartPro\App\Modules\Licensing\Models\License::find(1);

if ($license->hasActivationLeft()) {
    echo "Remaining activations: " . $license->getActivationLimit();
} else {
    echo "No activations remaining";
}
```

### Get License with Relationships

```php
$license = FluentCartPro\App\Modules\Licensing\Models\License::with([
    'customer',
    'product',
    'order',
    'activations'
])->find(1);
```

### Filter by Products

```php
$licenses = FluentCartPro\App\Modules\Licensing\Models\License::products([1, 2, 3])
    ->status('active')
    ->get();
```

---

**Plugin**: FluentCart Pro
