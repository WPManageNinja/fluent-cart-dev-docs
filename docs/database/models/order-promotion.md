---
title: Order Promotion Model
description: FluentCart Pro OrderPromotion model documentation with attributes, scopes, relationships, and methods.
---

<Badge type="warning" text="Pro" />

# Order Promotion Model

| DB Table Name | {wp_db_prefix}_fct_order_promotions               |
| ------------- | ------------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-order-promotions-table) |
| Source File   | fluent-cart-pro/app/Modules/Promotional/Models/OrderPromotion.php |
| Name Space    | FluentCartPro\App\Modules\Promotional\Models     |
| Class         | FluentCartPro\App\Modules\Promotional\Models\OrderPromotion |
| Plugin        | FluentCart Pro                                    |

## Properties

- **Table**: `fct_order_promotions`
- **Primary Key**: `id`
- **Guarded**: `['id']`
- **Fillable**: `['hash', 'parent_id', 'type', 'status', 'src_object_id', 'src_object_type', 'title', 'description', 'conditions', 'config', 'priority']`

## Boot Logic

The model registers a `creating` event that auto-generates a `hash` (using `md5('fct_promotion_' . wp_generate_uuid4() . time())`) if one is not provided, and defaults empty `conditions` and `config` to empty JSON arrays.

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key |
| hash               | String    | Unique promotion hash (auto-generated on creation) |
| parent_id          | Integer   | Parent promotion ID |
| type               | String    | Promotion type |
| status             | String    | Promotion status |
| src_object_id      | Integer   | Source object ID |
| src_object_type    | String    | Source object type |
| title              | String    | Promotion title |
| description        | Text      | Promotion description |
| conditions         | JSON      | Promotion conditions (auto JSON encode/decode via accessor/mutator) |
| config             | JSON      | Promotion configuration (auto JSON encode/decode via accessor/mutator) |
| priority           | Integer   | Promotion priority |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$orderPromotion = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::find(1);

$orderPromotion->id; // returns id
$orderPromotion->hash; // returns hash
$orderPromotion->type; // returns type
$orderPromotion->status; // returns status
$orderPromotion->conditions; // returns decoded array
$orderPromotion->config; // returns decoded array
```

## Relations

This model has the following relationships that you can use

### product_variant

Access the associated product variant (BelongsTo via `src_object_id`)

* return `FluentCart\App\Models\ProductVariation` Model

#### Example:

```php
// Accessing Product Variant
$productVariant = $orderPromotion->product_variant;

// For Filtering by product variant relationship
$orderPromotions = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::whereHas('product_variant', function($query) {
    $query->where('status', 'active');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### setConditionsAttribute($value)

Set conditions with automatic JSON encoding (mutator). Arrays and objects are JSON encoded before storage.

* Parameters
   * $value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$orderPromotion->conditions = ['min_amount' => 100, 'product_ids' => [1, 2, 3]];
// Automatically JSON encodes arrays and objects
```

### getConditionsAttribute($value)

Get conditions with automatic JSON decoding (accessor). If the stored value is a JSON string, it is decoded to an array.

* Parameters
   * $value - mixed
* Returns `mixed` - array if JSON string, otherwise original value

#### Usage

```php
$conditions = $orderPromotion->conditions; // Returns decoded array
```

### setConfigAttribute($value)

Set config with automatic JSON encoding (mutator). Arrays and objects are JSON encoded before storage.

* Parameters
   * $value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$orderPromotion->config = ['discount_type' => 'percentage', 'discount_value' => 10];
// Automatically JSON encodes arrays and objects
```

### getConfigAttribute($value)

Get config with automatic JSON decoding (accessor). If the stored value is a JSON string, it is decoded to an array.

* Parameters
   * $value - mixed
* Returns `mixed` - array if JSON string, otherwise original value

#### Usage

```php
$config = $orderPromotion->config; // Returns decoded array
```

## Usage Examples

### Create Order Promotion

```php
$orderPromotion = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::create([
    'type' => 'order_bump',
    'status' => 'active',
    'src_object_id' => 123,
    'src_object_type' => 'product_variation',
    'title' => 'Add-on Product',
    'description' => 'Enhance your order with this add-on',
    'conditions' => [
        'min_amount' => 50,
        'product_ids' => [1, 2, 3]
    ],
    'config' => [
        'discount_type' => 'percentage',
        'discount_value' => 15,
        'display_position' => 'checkout'
    ],
    'priority' => 1
]);
// Hash is automatically generated during creation
```

### Get Active Promotions

```php
$activePromotions = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::where('status', 'active')->get();
```

### Get Promotions by Type

```php
$orderBumps = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::where('type', 'order_bump')->get();
$upsells = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::where('type', 'upsell')->get();
```

### Get Promotions with Product Variants

```php
$promotionsWithVariants = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::with('product_variant')->get();

foreach ($promotionsWithVariants as $promotion) {
    echo "Promotion: " . $promotion->title;
    if ($promotion->product_variant) {
        echo "Product: " . $promotion->product_variant->variation_title;
    }
}
```

### Get Promotions by Priority

```php
$orderedPromotions = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::orderBy('priority', 'asc')->get();
```

### Update Order Promotion

```php
$orderPromotion = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::find(1);
$orderPromotion->update([
    'status' => 'inactive',
    'config' => ['discount_value' => 20, 'updated' => true]
]);
```

### Get Promotions by Source Object

```php
$promotions = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::where('src_object_type', 'product_variation')
    ->where('src_object_id', 123)
    ->get();
```

### Get Promotions by Hash

```php
$promotion = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::where('hash', 'abc123def456')->first();
```

### Delete Order Promotion

```php
$orderPromotion = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::find(1);
$orderPromotion->delete();
```

### Get Promotions with Conditions

```php
$promotions = FluentCartPro\App\Modules\Promotional\Models\OrderPromotion::all();

foreach ($promotions as $promotion) {
    $conditions = $promotion->conditions;
    if (isset($conditions['min_amount'])) {
        echo "Min Amount: " . $conditions['min_amount'];
    }
}
```

---

**Plugin**: FluentCart Pro
