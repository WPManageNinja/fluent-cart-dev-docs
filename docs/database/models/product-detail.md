---
title: Product Detail Model
description: FluentCart ProductDetail model documentation with attributes, casts, appends, relationships, and methods.
---

# Product Detail Model

| DB Table Name | {wp_db_prefix}_fct_product_details               |
| ------------- | ------------------------------------------------ |
| Schema        | [Check Schema](/database/schema#fct-product-details-table) |
| Source File   | fluent-cart/app/Models/ProductDetail.php        |
| Name Space    | FluentCart\App\Models                            |
| Class         | FluentCart\App\Models\ProductDetail              |

## Traits

| Trait            | Description |
| ---------------- | ----------- |
| CanSearch         | Adds search scope capabilities to the model |
| CanUpdateBatch    | Adds batch update capabilities to the model |

## Attributes

| Attribute            | Data Type | Comment |
| -------------------- | --------- | ------- |
| id                   | Integer   | Primary Key (guarded) |
| post_id              | Integer   | Reference to WordPress post (product). Cast as `integer`. |
| fulfillment_type     | String    | Fulfillment type (physical, digital) |
| min_price            | Double    | Minimum price (cents). Cast as `double`. Dynamically computed from variants via accessor. |
| max_price            | Double    | Maximum price (cents). Cast as `double`. Dynamically computed from variants via accessor. |
| default_variation_id | String    | Default variation ID |
| variation_type       | String    | Variation type (simple, variable) |
| stock_availability   | String    | Stock availability quantity / status |
| other_info           | JSON      | Additional product information (auto JSON encoded/decoded via mutator/accessor) |
| default_media        | JSON      | Default media information (auto JSON encoded/decoded via mutator/accessor) |
| manage_stock         | String    | Whether to manage stock |
| manage_downloadable  | String    | Whether to manage downloadable files |
| created_at           | Date Time | Creation timestamp |
| updated_at           | Date Time | Last update timestamp |

## Fillable Attributes

The following attributes are mass-assignable:

`post_id`, `fulfillment_type`, `min_price`, `max_price`, `default_variation_id`, `variation_type`, `stock_availability`, `other_info`, `default_media`, `manage_stock`, `manage_downloadable`

The `id` attribute is guarded and cannot be mass-assigned.

## Casts

| Attribute | Cast Type |
| --------- | --------- |
| post_id   | integer   |
| min_price | double    |
| max_price | double    |

## Appends

The following computed attributes are automatically appended to the model's array/JSON output:

| Appended Attribute    | Description |
| --------------------- | ----------- |
| featured_media        | First image from the gallery (via `getFeaturedMediaAttribute`) |
| formatted_min_price   | Human-readable minimum price (via `getFormattedMinPriceAttribute`) |
| formatted_max_price   | Human-readable maximum price (via `getFormattedMaxPriceAttribute`) |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$productDetail = FluentCart\App\Models\ProductDetail::find(1);

$productDetail->id; // returns id
$productDetail->post_id; // returns post ID (cast as integer)
$productDetail->min_price; // returns minimum price (dynamically computed from variants)
$productDetail->max_price; // returns maximum price (dynamically computed from variants)
$productDetail->featured_media; // returns first gallery image or null (appended)
$productDetail->formatted_min_price; // returns formatted min price string (appended)
$productDetail->formatted_max_price; // returns formatted max price string (appended)
```

## Relations

This model has the following relationships that you can use

### product

Access the associated product (WordPress post). Linked via `post_id` to `ID` on the products table.

* Relationship type: `BelongsTo`
* return `FluentCart\App\Models\Product` Model

#### Example:

```php
// Accessing Product
$product = $productDetail->product;

// For Filtering by product relationship
$productDetails = FluentCart\App\Models\ProductDetail::whereHas('product', function($query) {
    $query->where('post_status', 'publish');
})->get();
```

### galleryImage

Access the associated gallery image meta. This is a `HasOne` relation to `PostMeta` filtered by `meta_key = 'fluent-products-gallery-image'`, linked via `post_id`.

* Relationship type: `HasOne`
* return `FluentCart\App\Models\WpModels\PostMeta` Model

#### Example:

```php
// Accessing Gallery Image
$galleryImage = $productDetail->galleryImage;
```

### variants

Access all product variations, ordered by `serial_index` ascending. Linked via `post_id` on both tables.

* Relationship type: `HasMany`
* return `FluentCart\App\Models\ProductVariation` Model Collection

#### Example:

```php
// Accessing Variants
$variants = $productDetail->variants;

// For Filtering by variants relationship
$productDetails = FluentCart\App\Models\ProductDetail::whereHas('variants', function($query) {
    $query->where('status', 'active');
})->get();
```

### attrMap

Access all attribute relations. Linked via `object_id` (on `AttributeRelation`) to `id` (on `ProductDetail`).

When a `ProductDetail` record is deleted, all related `attrMap` records are automatically cascade-deleted via the model's `boot()` method.

* Relationship type: `HasMany`
* return `FluentCart\App\Models\AttributeRelation` Model Collection

#### Example:

```php
// Accessing Attribute Relations
$attrMap = $productDetail->attrMap;
```

## Cascade Deletes

The model registers a `deleting` event in its `boot()` method. When a `ProductDetail` is deleted, all associated `attrMap` (AttributeRelation) records are automatically deleted:

```php
// When you delete a ProductDetail, its attrMap relations are removed automatically
$productDetail->delete(); // Also deletes all related AttributeRelation records
```

## Methods

Along with Global Model methods, this model has few helper methods.

### setOtherInfoAttribute($value)

Set other info with automatic JSON encoding (mutator). Arrays and objects are JSON encoded; strings are stored as-is.

* Parameters
   * $value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$productDetail->other_info = ['custom_data' => 'value', 'settings' => ['key' => 'value']];
// Automatically JSON encodes arrays and objects
```

### getOtherInfoAttribute($value)

Get other info with automatic JSON decoding (accessor). Returns the decoded array or `null` if empty.

* Parameters
   * $value - mixed
* Returns `array|null`

#### Usage

```php
$otherInfo = $productDetail->other_info; // Returns decoded array or null
```

### setDefaultMediaAttribute($value)

Set default media with automatic JSON encoding (mutator). Arrays and objects are JSON encoded; strings are stored as-is.

* Parameters
   * $value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$productDetail->default_media = ['url' => 'image.jpg', 'alt' => 'Product Image'];
// Automatically JSON encodes arrays and objects
```

### getDefaultMediaAttribute($value)

Get default media with automatic JSON decoding (accessor). Returns the decoded array or `null` if empty.

* Parameters
   * $value - mixed
* Returns `array|null`

#### Usage

```php
$defaultMedia = $productDetail->default_media; // Returns decoded array or null
```

### getMinPriceAttribute()

Dynamic accessor that overrides the `min_price` database column. Instead of returning the stored value, it computes the minimum `item_price` from all associated variants.

* Parameters
   * none
* Returns `double|null`

#### Usage

```php
$minPrice = $productDetail->min_price; // Returns the minimum item_price across all variants
```

### getMaxPriceAttribute()

Dynamic accessor that overrides the `max_price` database column. Instead of returning the stored value, it computes the maximum `item_price` from all associated variants.

* Parameters
   * none
* Returns `double|null`

#### Usage

```php
$maxPrice = $productDetail->max_price; // Returns the maximum item_price across all variants
```

### getFormattedMinPriceAttribute()

Get formatted minimum price (accessor). Uses `Helper::toDecimal()` to convert the min_price (in cents) to a human-readable decimal string.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$formattedMinPrice = $productDetail->formatted_min_price; // Returns formatted price string
```

### getFormattedMaxPriceAttribute()

Get formatted maximum price (accessor). Uses `Helper::toDecimal()` to convert the max_price (in cents) to a human-readable decimal string.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$formattedMaxPrice = $productDetail->formatted_max_price; // Returns formatted price string
```

### getFeaturedMediaAttribute()

Get featured media from gallery (accessor). Returns the first element from the gallery image meta value, or `null` if the gallery is empty or not set.

* Parameters
   * none
* Returns `mixed|null`

#### Usage

```php
$featuredMedia = $productDetail->featured_media; // Returns first gallery image or null
```

### hasPriceVariation()

Check if product has a price variation. Returns `true` only when the product's `variation_type` is `'simple'` **and** `max_price` differs from `min_price`.

* Parameters
   * none
* Returns `boolean`

#### Usage

```php
$hasVariation = $productDetail->hasPriceVariation();
// Returns true if variation_type is 'simple' AND min_price != max_price
```

### getStockAvailability($variationId = null)

Get stock availability information. Returns an array describing stock status. The result is passed through the `fluent_cart/product_stock_availability` filter hook, allowing external modification.

* Parameters
   * $variationId - integer|null (default: null)
* Returns `array` with keys: `manage_stock` (bool), `availability` (string), `class` (string), `available_quantity` (int|null)

**Return scenarios:**

| Condition | manage_stock | availability | class | available_quantity |
| --------- | ------------ | ------------ | ----- | ------------------ |
| `manage_stock` is falsy | `false` | "In Stock" | "in-stock" | `null` |
| `manage_stock` truthy, `stock_availability` truthy | `true` | "In Stock" | "in-stock" | `stock_availability` value |
| `manage_stock` truthy, `stock_availability` falsy | `true` | "Out of Stock" | "out-of-stock" | `stock_availability` value |

**Filter hook:** `fluent_cart/product_stock_availability`
- Receives: `$availability` array, `['detail' => $this, 'variation_id' => $variationId]`

#### Usage

```php
$stockInfo = $productDetail->getStockAvailability();
// Returns array with manage_stock, availability, class, available_quantity

// With a specific variation
$stockInfo = $productDetail->getStockAvailability($variationId);
```

## Usage Examples

### Get Product Details

```php
$productDetail = FluentCart\App\Models\ProductDetail::find(1);
echo "Min Price: " . $productDetail->formatted_min_price;
echo "Max Price: " . $productDetail->formatted_max_price;
echo "Stock: " . $productDetail->getStockAvailability()['availability'];
```

### Get Product with Variations

```php
$productDetail = FluentCart\App\Models\ProductDetail::with(['product', 'variants'])->find(1);
$product = $productDetail->product;
$variants = $productDetail->variants;
```

### Create Product Detail

```php
$productDetail = FluentCart\App\Models\ProductDetail::create([
    'post_id' => 123,
    'fulfillment_type' => 'physical',
    'min_price' => 19.99,
    'max_price' => 29.99,
    'variation_type' => 'simple',
    'stock_availability' => 'in-stock',
    'manage_stock' => '1',
    'manage_downloadable' => '0'
]);
```

### Check Stock Availability

```php
$productDetail = FluentCart\App\Models\ProductDetail::find(1);
$stockInfo = $productDetail->getStockAvailability();

if ($stockInfo['manage_stock']) {
    echo "Stock: " . $stockInfo['available_quantity'];
} else {
    echo "Stock: " . $stockInfo['availability'];
}
```

### Get Featured Media

```php
$productDetail = FluentCart\App\Models\ProductDetail::find(1);
$featuredMedia = $productDetail->featured_media;

if ($featuredMedia) {
    echo "Featured Image: " . $featuredMedia['url'];
}
```

### Dynamic Price Computation

```php
// min_price and max_price are dynamically computed from variants
$productDetail = FluentCart\App\Models\ProductDetail::find(1);

// These pull min/max item_price from the variants table, not the stored column values
$minPrice = $productDetail->min_price;
$maxPrice = $productDetail->max_price;

// Check if a simple product has a price range
if ($productDetail->hasPriceVariation()) {
    echo "Price range: $minPrice - $maxPrice";
}
```

---
