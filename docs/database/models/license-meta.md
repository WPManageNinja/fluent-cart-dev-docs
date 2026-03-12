---
title: License Meta Model
description: FluentCart Pro LicenseMeta model documentation with attributes, scopes, relationships, and methods.
---

<Badge type="warning" text="Pro" />

# License Meta Model

| DB Table Name | {wp_db_prefix}_fct_license_meta              |
| ------------- | -------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-license-meta-table) |
| Source File   | fluent-cart-pro/app/Modules/Licensing/Models/LicenseMeta.php |
| Name Space    | FluentCartPro\App\Modules\Licensing\Models  |
| Class         | FluentCartPro\App\Modules\Licensing\Models\LicenseMeta |
| Plugin        | FluentCart Pro                               |

## Properties

- **Table**: `fct_license_meta`
- **Primary Key**: `id`
- **Guarded**: `['id']`
- **Fillable**: `['object_id', 'object_type', 'meta_key', 'meta_value']`

::: warning Note on Schema
The fillable attributes use `object_id` and `object_type` (not `license_id`). This is a polymorphic-style meta table that can store meta for different object types.
:::

## Attributes

| Attribute   | Data Type | Comment |
| ----------- | --------- | ------- |
| id          | Integer   | Primary Key |
| object_id   | Integer   | Reference to the parent object (e.g., license ID) |
| object_type | String    | Type of the parent object |
| meta_key    | String    | Meta key name |
| meta_value  | Text      | Meta value (auto JSON encode/decode via accessor/mutator) |
| created_at  | Date Time | Creation timestamp |
| updated_at  | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$licenseMeta = FluentCartPro\App\Modules\Licensing\Models\LicenseMeta::find(1);

$licenseMeta->id; // returns id
$licenseMeta->object_id; // returns object ID
$licenseMeta->object_type; // returns object type
$licenseMeta->meta_key; // returns meta key
$licenseMeta->meta_value; // returns meta value (auto-decoded from JSON if applicable)
```

## Methods

Along with Global Model methods, this model has few helper methods.

### getMetaValueAttribute($value)

Get meta value with automatic JSON decoding (accessor). If the stored value is a JSON string, it is decoded to an array. Otherwise returns the original value.

* Parameters
   * $value - mixed
* Returns `mixed` - array if valid JSON string, otherwise original value

#### Usage

```php
$metaValue = $licenseMeta->meta_value; // Returns array if JSON, original value otherwise
```

### setMetaValueAttribute($value)

Set meta value with automatic JSON encoding (mutator). Arrays and objects are JSON encoded before storage.

* Parameters
   * $value - array|object|string
* Returns `void`

#### Usage

```php
// Set array value (will be JSON encoded)
$licenseMeta->meta_value = ['site_url' => 'https://example.com', 'activated_at' => '2024-01-01'];

// Set string value (stored as-is)
$licenseMeta->meta_value = 'simple string value';
```

## Usage Examples

### Get License Meta

```php
$licenseMeta = FluentCartPro\App\Modules\Licensing\Models\LicenseMeta::where('object_id', 123)
    ->where('meta_key', 'activation_data')
    ->first();

if ($licenseMeta) {
    $data = $licenseMeta->meta_value; // Returns array (auto-decoded)
}
```

### Set License Custom Meta

```php
FluentCartPro\App\Modules\Licensing\Models\LicenseMeta::updateOrCreate(
    [
        'object_id' => 123,
        'object_type' => 'license',
        'meta_key' => 'custom_field'
    ],
    [
        'meta_value' => ['value' => 'custom data', 'type' => 'text']
    ]
);
```

### Get All Meta for an Object

```php
$metaData = FluentCartPro\App\Modules\Licensing\Models\LicenseMeta::where('object_id', 123)
    ->where('object_type', 'license')
    ->pluck('meta_value', 'meta_key')
    ->toArray();
```

### Create License Meta

```php
$licenseMeta = FluentCartPro\App\Modules\Licensing\Models\LicenseMeta::create([
    'object_id' => 123,
    'object_type' => 'license',
    'meta_key' => 'renewal_info',
    'meta_value' => ['auto_renew' => true, 'next_date' => '2025-01-01']
]);
```

### Update License Meta

```php
$licenseMeta = FluentCartPro\App\Modules\Licensing\Models\LicenseMeta::find(1);
$licenseMeta->update([
    'meta_value' => ['updated_value' => true]
]);
```

### Get Meta by Key

```php
$activationMetas = FluentCartPro\App\Modules\Licensing\Models\LicenseMeta::where('meta_key', 'activation_data')->get();
```

### Delete License Meta

```php
$licenseMeta = FluentCartPro\App\Modules\Licensing\Models\LicenseMeta::find(1);
$licenseMeta->delete();
```

---

**Plugin**: FluentCart Pro
