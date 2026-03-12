---
title: Shipping Zone Model
description: FluentCart ShippingZone model documentation with attributes, scopes, relationships, and methods.
---

# Shipping Zone Model

| DB Table Name | {wp_db_prefix}_fct_shipping_zones               |
| ------------- | ---------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-shipping-zones-table) |
| Source File   | fluent-cart/app/Models/ShippingZone.php       |
| Name Space    | FluentCart\App\Models                          |
| Class         | FluentCart\App\Models\ShippingZone             |

## Traits

- `FluentCart\App\Models\Concerns\CanSearch` - Provides `search()`, `groupSearch()`, `whereLike()`, `whereBeginsWith()`, `whereEndsWith()` scopes

## Appended Attributes

The following computed attributes are automatically appended to the model's array/JSON output:

- `formatted_region` - Human-readable region name

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key |
| name               | String    | Shipping zone name |
| region             | String    | Region/country code (or `'all'` for whole world) |
| order              | Integer   | Display order |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$shippingZone = FluentCart\App\Models\ShippingZone::find(1);

$shippingZone->id; // returns id
$shippingZone->name; // returns zone name
$shippingZone->region; // returns region code
$shippingZone->order; // returns display order
$shippingZone->formatted_region; // returns formatted region name (appended attribute)
```

## Relations

This model has the following relationships that you can use

### methods

Access all shipping methods in this zone. Results are ordered by `id` descending.

* return `FluentCart\App\Models\ShippingMethod` Model Collection

#### Example:

```php
// Accessing Methods
$methods = $shippingZone->methods;

// For Filtering by methods relationship
$shippingZones = FluentCart\App\Models\ShippingZone::whereHas('methods', function($query) {
    $query->where('is_enabled', 1);
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### getFormattedRegionAttribute()

Get formatted region name (accessor). Returns `'Whole World'` if region is `'all'`, otherwise resolves the country code to its full name via `AddressHelper::getCountryNameByCode()`.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$formattedRegion = $shippingZone->formatted_region; // e.g., "United States" or "Whole World"
```

## Usage Examples

### Get Shipping Zones

```php
$shippingZone = FluentCart\App\Models\ShippingZone::find(1);
echo "Zone Name: " . $shippingZone->name;
echo "Region: " . $shippingZone->region;
echo "Formatted Region: " . $shippingZone->formatted_region;
```

### Create Shipping Zone

```php
$shippingZone = FluentCart\App\Models\ShippingZone::create([
    'name' => 'United States',
    'region' => 'US',
    'order' => 1
]);
```

### Get Shipping Zones with Methods

```php
$shippingZones = FluentCart\App\Models\ShippingZone::with('methods')->get();

foreach ($shippingZones as $zone) {
    echo "Zone: " . $zone->name;
    foreach ($zone->methods as $method) {
        echo "  - Method: " . $method->title;
    }
}
```

### Get Zones by Region

```php
$usZones = FluentCart\App\Models\ShippingZone::where('region', 'US')->get();
$allWorldZones = FluentCart\App\Models\ShippingZone::where('region', 'all')->get();
```

### Get Zones Ordered by Display Order

```php
$orderedZones = FluentCart\App\Models\ShippingZone::orderBy('order', 'asc')->get();
```

### Get Zones with Enabled Methods

```php
$zonesWithEnabledMethods = FluentCart\App\Models\ShippingZone::whereHas('methods', function($query) {
    $query->where('is_enabled', 1);
})->get();
```

### Update Shipping Zone

```php
$shippingZone = FluentCart\App\Models\ShippingZone::find(1);
$shippingZone->update([
    'name' => 'United States & Canada',
    'order' => 2
]);
```

### Get Zone by Name

```php
$zone = FluentCart\App\Models\ShippingZone::where('name', 'United States')->first();
```

### Get Zones with Method Count

```php
$zonesWithCounts = FluentCart\App\Models\ShippingZone::withCount('methods')->get();

foreach ($zonesWithCounts as $zone) {
    echo "Zone: " . $zone->name . " (" . $zone->methods_count . " methods)";
}
```

### Delete Shipping Zone

```php
$shippingZone = FluentCart\App\Models\ShippingZone::find(1);
$shippingZone->delete();
```

---
