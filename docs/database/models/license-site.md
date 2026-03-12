---
title: License Site Model
description: FluentCart Pro LicenseSite model documentation with attributes, scopes, relationships, and methods.
---

<Badge type="warning" text="Pro" />

# License Site Model

| DB Table Name | {wp_db_prefix}_fct_license_sites               |
| ------------- | --------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-license-sites-table) |
| Source File   | fluent-cart-pro/app/Modules/Licensing/Models/LicenseSite.php |
| Name Space    | FluentCartPro\App\Modules\Licensing\Models    |
| Class         | FluentCartPro\App\Modules\Licensing\Models\LicenseSite |
| Plugin        | FluentCart Pro                                 |

## Properties

- **Table**: `fct_license_sites`
- **Primary Key**: `id`
- **Guarded**: `['id']`
- **Fillable**: `['site_url', 'server_version', 'platform_version', 'other']`

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key |
| site_url           | String    | Site URL |
| server_version     | String    | Server version |
| platform_version   | String    | Platform version |
| other              | JSON      | Additional site information (auto JSON encode/decode via accessor/mutator) |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$licenseSite = FluentCartPro\App\Modules\Licensing\Models\LicenseSite::find(1);

$licenseSite->id; // returns id
$licenseSite->site_url; // returns site URL
$licenseSite->server_version; // returns server version
$licenseSite->platform_version; // returns platform version
$licenseSite->other; // returns decoded array
```

## Relations

This model has the following relationships that you can use

### activations

Access all license activations for this site (HasMany)

* return `FluentCartPro\App\Modules\Licensing\Models\LicenseActivation` Model Collection

#### Example:

```php
// Accessing Activations
$activations = $licenseSite->activations;

// For Filtering by activations relationship
$licenseSites = FluentCartPro\App\Modules\Licensing\Models\LicenseSite::whereHas('activations', function($query) {
    $query->where('status', 'active');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### setOtherAttribute($value)

Set other information with automatic JSON encoding (mutator). Arrays and objects are JSON encoded before storage.

* Parameters
   * $value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$licenseSite->other = ['domain' => 'example.com', 'ssl' => true];
// Automatically JSON encodes arrays and objects
```

### getOtherAttribute($value)

Get other information with automatic JSON decoding (accessor). Returns the decoded array if valid JSON, otherwise returns an empty array.

* Parameters
   * $value - mixed
* Returns `array`

#### Usage

```php
$other = $licenseSite->other; // Returns decoded array, or empty array if invalid
```

### isLocalSite()

Check if the site is a local development site. Checks the `url` property against local domain extensions (`.lab`, `.local`, `.test`, `.localhost`) and development subdomains (`staging`, `dev`, `development`, `test`, `testing`). Result is filterable via the `fluent_cart_sl/is_local_site` filter hook.

* Parameters
   * none
* Returns `boolean`

#### Usage

```php
$isLocal = $licenseSite->isLocalSite();
// Returns true if site is local (lab, local, test, localhost, staging, dev, etc.)
```

## Usage Examples

### Get License Sites

```php
$licenseSite = FluentCartPro\App\Modules\Licensing\Models\LicenseSite::find(1);
echo "Site URL: " . $licenseSite->site_url;
echo "Server Version: " . $licenseSite->server_version;
echo "Platform Version: " . $licenseSite->platform_version;
```

### Create License Site

```php
$licenseSite = FluentCartPro\App\Modules\Licensing\Models\LicenseSite::create([
    'site_url' => 'https://example.com',
    'server_version' => 'PHP 8.1',
    'platform_version' => 'WordPress 6.0',
    'other' => [
        'domain' => 'example.com',
        'ssl' => true,
        'theme' => 'custom-theme'
    ]
]);
```

### Get License Sites with Activations

```php
$licenseSites = FluentCartPro\App\Modules\Licensing\Models\LicenseSite::with('activations')->get();

foreach ($licenseSites as $site) {
    echo "Site: " . $site->site_url;
    echo "Activations: " . $site->activations->count();
}
```

### Get Local Sites

```php
$licenseSites = FluentCartPro\App\Modules\Licensing\Models\LicenseSite::all();

foreach ($licenseSites as $site) {
    if ($site->isLocalSite()) {
        echo "Local Site: " . $site->site_url;
    }
}
```

### Get Sites by URL

```php
$site = FluentCartPro\App\Modules\Licensing\Models\LicenseSite::where('site_url', 'https://example.com')->first();
```

### Update License Site

```php
$licenseSite = FluentCartPro\App\Modules\Licensing\Models\LicenseSite::find(1);
$licenseSite->update([
    'server_version' => 'PHP 8.2',
    'platform_version' => 'WordPress 6.1',
    'other' => ['updated' => true]
]);
```

### Get Sites with Other Information

```php
$licenseSites = FluentCartPro\App\Modules\Licensing\Models\LicenseSite::all();

foreach ($licenseSites as $site) {
    $other = $site->other;
    if (isset($other['ssl']) && $other['ssl']) {
        echo "SSL Site: " . $site->site_url;
    }
}
```

### Delete License Site

```php
$licenseSite = FluentCartPro\App\Modules\Licensing\Models\LicenseSite::find(1);
$licenseSite->delete();
```

---

**Plugin**: FluentCart Pro
