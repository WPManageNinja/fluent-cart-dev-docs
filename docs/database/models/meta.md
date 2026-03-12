---
title: Meta Model
description: FluentCart Meta model documentation with attributes, scopes, relationships, and methods.
---

# Meta Model

| DB Table Name | {wp_db_prefix}_fct_meta               |
| ------------- | ------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-meta-table) |
| Source File   | fluent-cart/app/Models/Meta.php      |
| Name Space    | FluentCart\App\Models                 |
| Class         | FluentCart\App\Models\Meta            |

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key |
| object_type        | String    | Type of object (User, ProductVariation, etc.) |
| object_id          | Integer   | ID of the associated object |
| meta_key           | String    | Meta key name |
| meta_value         | Text      | Meta value (JSON encoded for arrays/objects) |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Guarded Attributes

The `id` field is explicitly guarded via `$guarded = ['id']`.

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$meta = FluentCart\App\Models\Meta::find(1);

$meta->id; // returns id
$meta->object_type; // returns object type
$meta->object_id; // returns object ID
$meta->meta_key; // returns meta key
$meta->meta_value; // returns meta value (auto-decoded from JSON)
```

## Scopes

This model has the following scopes that you can use

### userTheme()

Filter meta for current user's theme setting. Filters by `object_type = User::class`, `object_id = current user ID`, and `meta_key = 'theme'`.

* Parameters
   * none

#### Usage:

```php
// Get current user's theme meta
$userTheme = FluentCart\App\Models\Meta::userTheme()->first();
```

### upgradeablePath($productId)

Filter meta for upgradeable paths by product ID. Uses a `whereHas` on the `upgradeableVariants` relationship and filters by `PlanUpgradeService::$metaType` and `PlanUpgradeService::$metaKey`.

* Parameters
   * $productId - integer

#### Usage:

```php
// Get upgradeable paths for a product
$upgradePaths = FluentCart\App\Models\Meta::upgradeablePath(123)->get();
```

## Relations

This model has the following relationships that you can use

### upgradeableVariants

Access all upgradeable variants (`hasMany`). Links via `object_id` to `ProductVariation.id`.

* return `FluentCart\App\Models\ProductVariation` Model Collection

#### Example:

```php
// Accessing Upgradeable Variants
$variants = $meta->upgradeableVariants;

// For Filtering by upgradeable variants relationship
$metas = FluentCart\App\Models\Meta::whereHas('upgradeableVariants', function($query) {
    $query->where('status', 'active');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### setMetaValueAttribute($meta_value)

Set meta value with automatic JSON encoding (mutator). If the value is an array or object, it is JSON-encoded with `JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES` flags.

* Parameters
   * $meta_value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$meta->meta_value = ['custom_data' => 'value', 'settings' => ['key' => 'value']];
// Automatically JSON encodes arrays and objects
```

### getMetaValueAttribute($value)

Get meta value with automatic JSON decoding (accessor). If the stored value is a string, it attempts to JSON-decode it. Returns the decoded value if successful, or the original string if decoding returns `null`.

* Parameters
   * $value - mixed
* Returns `mixed`

#### Usage

```php
$metaValue = $meta->meta_value; // Returns decoded value (array or string)
```

## Usage Examples

### Get Meta

```php
$meta = FluentCart\App\Models\Meta::where('object_type', 'User')
    ->where('object_id', 123)
    ->get();

foreach ($meta as $metaItem) {
    echo "Key: " . $metaItem->meta_key;
    echo "Value: " . print_r($metaItem->meta_value, true);
}
```

### Create Meta

```php
$meta = FluentCart\App\Models\Meta::create([
    'object_type' => 'User',
    'object_id' => 123,
    'meta_key' => 'preferences',
    'meta_value' => 'dark_mode'
]);
```

### Store Complex Meta Data

```php
$meta = FluentCart\App\Models\Meta::create([
    'object_type' => 'ProductVariation',
    'object_id' => 456,
    'meta_key' => 'upgrade_paths',
    'meta_value' => [
        'upgrade_to' => [789, 101],
        'discount_percentage' => 20,
        'conditions' => ['active_subscription' => true]
    ]
]);
```

### Get User Theme

```php
$userTheme = FluentCart\App\Models\Meta::userTheme()->first();
if ($userTheme) {
    echo "User Theme: " . $userTheme->meta_value;
}
```

### Get Upgradeable Paths

```php
$upgradePaths = FluentCart\App\Models\Meta::upgradeablePath(123)->get();
foreach ($upgradePaths as $path) {
    echo "Upgrade Path: " . print_r($path->meta_value, true);
}
```

### Get Meta by Key

```php
$meta = FluentCart\App\Models\Meta::where('object_type', 'User')
    ->where('object_id', 123)
    ->where('meta_key', 'preferences')
    ->first();

if ($meta) {
    echo "Preferences: " . $meta->meta_value;
}
```

### Update Meta Value

```php
$meta = FluentCart\App\Models\Meta::find(1);
$meta->meta_value = ['updated' => true, 'timestamp' => now()];
$meta->save();
```

### Get All Meta for Object

```php
$objectMetas = FluentCart\App\Models\Meta::where('object_type', 'ProductVariation')
    ->where('object_id', 456)
    ->get();
```

---
