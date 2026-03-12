---
title: License Activation Model
description: FluentCart Pro LicenseActivation model documentation with attributes, scopes, relationships, and methods.
---

<Badge type="warning" text="Pro" />

# License Activation Model

| DB Table Name | {wp_db_prefix}_fct_license_activations      |
| ------------- | -------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-license-activations-table) |
| Source File   | fluent-cart-pro/app/Modules/Licensing/Models/LicenseActivation.php |
| Name Space    | FluentCartPro\App\Modules\Licensing\Models  |
| Class         | FluentCartPro\App\Modules\Licensing\Models\LicenseActivation |
| Plugin        | FluentCart Pro                               |

## Properties

- **Table**: `fct_license_activations`
- **Primary Key**: `id`
- **Guarded**: `['id']`
- **Fillable**: `['site_id', 'license_id', 'status', 'is_local', 'product_id', 'last_update_date', 'last_update_version', 'variation_id', 'activation_method', 'activation_hash']`

## Attributes

| Attribute           | Data Type | Comment |
| ------------------- | --------- | ------- |
| id                  | Integer   | Primary Key |
| site_id             | Integer   | Foreign key to license sites |
| license_id          | Integer   | Foreign key to licenses |
| status              | String    | Activation status |
| is_local            | Boolean   | Whether this is a local activation |
| product_id          | Integer   | Associated product ID |
| last_update_date    | DateTime  | Last update timestamp |
| last_update_version | String    | Last update version |
| variation_id        | Integer   | Product variation ID |
| activation_method   | String    | Method used for activation |
| activation_hash     | String    | Unique activation hash |
| created_at          | DateTime  | Creation timestamp |
| updated_at          | DateTime  | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$activation = FluentCartPro\App\Modules\Licensing\Models\LicenseActivation::find(1);

$activation->id; // returns id
$activation->license_id; // returns license ID
$activation->site_id; // returns site ID
$activation->status; // returns status
$activation->is_local; // returns whether local
$activation->activation_hash; // returns activation hash
```

## Relations

This model has the following relationships that you can use

### license

Access the associated license (BelongsTo)

* return `FluentCartPro\App\Modules\Licensing\Models\License` Model

#### Example:

```php
// Accessing License
$license = $activation->license;

// For Filtering by license relationship
$activations = FluentCartPro\App\Modules\Licensing\Models\LicenseActivation::whereHas('license', function($query) {
    $query->where('status', 'active');
})->get();
```

### site

Access the associated license site (BelongsTo)

* return `FluentCartPro\App\Modules\Licensing\Models\LicenseSite` Model

#### Example:

```php
// Accessing Site
$site = $activation->site;

// For Filtering by site relationship
$activations = FluentCartPro\App\Modules\Licensing\Models\LicenseActivation::whereHas('site', function($query) {
    $query->where('site_url', 'like', '%example.com%');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### updateStatus($newStatus)

Updates the activation status and triggers related action hooks.

* Parameters
   * $newStatus - string - New status value
* Returns `$this` - Current model instance

**Actions Triggered:**
- `fluent_cart_sl/license_activation_status_updated`
- `fluent_cart_sl/license_activation_status_updated_to_{$newStatus}`

#### Usage

```php
$activation = FluentCartPro\App\Modules\Licensing\Models\LicenseActivation::find(1);
$activation->updateStatus('active');
```

## Usage Examples

### Creating License Activation

```php
use FluentCartPro\App\Modules\Licensing\Models\LicenseActivation;

$activation = LicenseActivation::create([
    'site_id' => 1,
    'license_id' => 123,
    'status' => 'active',
    'is_local' => false,
    'product_id' => 456,
    'variation_id' => 789,
    'activation_method' => 'api',
    'activation_hash' => 'unique_hash_here'
]);
```

### Querying Activations

```php
// Get all activations for a license
$activations = LicenseActivation::where('license_id', 123)->get();

// Get active activations
$activeActivations = LicenseActivation::where('status', 'active')->get();

// Get non-local active activations
$remoteActivations = LicenseActivation::where('status', 'active')
    ->where('is_local', '!=', 1)
    ->get();

// Get activations with license relationship
$activationsWithLicense = LicenseActivation::with('license')->get();

// Get activations with site relationship
$activationsWithSite = LicenseActivation::with('site')->get();
```

### Updating Activation Status

```php
$activation = LicenseActivation::find(1);

// Update status (triggers action hooks)
$activation->updateStatus('inactive');

// Direct status update (no action hooks)
$activation->status = 'inactive';
$activation->save();
```

## Related Documentation

- [License Model](./license) - Main license model
- [License Site Model](./license-site) - Licensed site management
- [License Meta Model](./license-meta) - License metadata

---

**Plugin**: FluentCart Pro
