---
title: Product Variation Model
description: FluentCart ProductVariation model documentation with attributes, casts, scopes, relationships, methods, and lifecycle hooks.
---

# Product Variation Model

| DB Table Name | {wp_db_prefix}_fct_product_variations               |
| ------------- | --------------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-product-variations-table) |
| Source File   | fluent-cart/app/Models/ProductVariation.php        |
| Name Space    | FluentCart\App\Models                               |
| Class         | FluentCart\App\Models\ProductVariation              |

## Traits

| Trait            | Description                          |
| ---------------- | ------------------------------------ |
| `CanSearch`      | Adds search scope capabilities       |
| `CanUpdateBatch` | Adds batch update capabilities       |

## Attributes

| Attribute            | Data Type | Comment                                      |
| -------------------- | --------- | -------------------------------------------- |
| id                   | Integer   | Primary Key                                  |
| post_id              | Integer   | Reference to WordPress post (product)        |
| media_id             | Integer   | Reference to media                           |
| serial_index         | Integer   | Serial index for ordering                    |
| sold_individually    | Integer   | Whether sold individually (0 or 1)           |
| variation_title      | String    | Variation title                              |
| variation_identifier | String    | Variation identifier                         |
| sku                  | String    | Stock keeping unit                           |
| manage_stock         | String    | Whether to manage stock                      |
| payment_type         | String    | Payment type (`onetime`, `subscription`)     |
| stock_status         | String    | Stock status                                 |
| backorders           | Integer   | Backorder quantity                           |
| total_stock          | Integer   | Total stock quantity                         |
| available            | Integer   | Available quantity                           |
| committed            | Integer   | Committed quantity                           |
| on_hold              | Integer   | On hold quantity                             |
| fulfillment_type     | String    | Fulfillment type (`physical`, `digital`)     |
| item_status          | String    | Item status (`active`, `inactive`)           |
| manage_cost          | String    | Whether to manage cost                       |
| item_price           | Decimal   | Item price (stored in cents, cast to double) |
| item_cost            | Decimal   | Item cost (stored in cents, cast to double)  |
| compare_price        | Decimal   | Compare price (stored in cents, cast to double) |
| other_info           | Array     | Additional variation information (JSON, cast to array) |
| downloadable         | String    | Whether downloadable                         |
| shipping_class       | String    | Shipping class ID                            |
| created_at           | Date Time | Creation timestamp                           |
| updated_at           | Date Time | Last update timestamp                        |

## Casts

The following attributes are automatically cast when accessed:

| Attribute          | Cast Type |
| ------------------ | --------- |
| post_id            | integer   |
| media_id           | integer   |
| item_cost          | double    |
| item_price         | double    |
| compare_price      | double    |
| backorders         | integer   |
| total_stock        | integer   |
| available          | integer   |
| committed          | integer   |
| on_hold            | integer   |
| sold_individually  | integer   |
| serial_index       | integer   |
| other_info         | array     |

## Appends

The following computed attributes are appended to every model instance:

| Appended Attribute | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `thumbnail`        | Always appended via `$appends`. Returns the first thumbnail URL from the `media` relation, or `null`. |
| `formatted_total`  | Appended at runtime inside `booted()` on every `retrieved` event. Returns `Helper::toDecimal($this->item_price)`. |

## Custom `other_info` Accessor

The `getOtherInfoAttribute` accessor decodes the JSON value and, when `payment_type` is `subscription`, injects sensible defaults for subscription fields that may not yet be stored:

| Injected Key       | Default Value                                  |
| ------------------- | ---------------------------------------------- |
| `payment_type`      | `'subscription'`                               |
| `installment`       | `'yes'` only if value is `'yes'` AND Pro is active; otherwise `'no'` |
| `repeat_interval`   | `'yearly'`                                     |
| `times`             | `0`                                            |
| `trial_days`        | `0`                                            |
| `manage_setup_fee`  | `'no'`                                         |

This means reading `$variation->other_info` on a subscription variation always returns these keys even if they were not explicitly saved.

## Cascade Deletes

When a `ProductVariation` is deleted, the `boot()` method fires the following cleanup:

1. **Media** -- calls `\FluentCart\Api\Meta::deleteVariationMedia($model->id)` to remove associated media metadata.
2. **Attribute Map** -- calls `$model->attrMap()->delete()` to remove all related `AttributeRelation` records.

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$productVariation = FluentCart\App\Models\ProductVariation::find(1);

$productVariation->id; // returns id
$productVariation->post_id; // returns post ID
$productVariation->item_price; // returns item price (cast to double)
$productVariation->stock_status; // returns stock status
$productVariation->sku; // returns SKU
$productVariation->thumbnail; // returns thumbnail URL or null (appended attribute)
$productVariation->formatted_total; // returns formatted price string (appended on retrieval)
```

## Scopes

This model has the following scopes that you can use

### getWithShippingClass()

Get variations with their shipping class information. This scope executes the query, then looks up `ShippingMethod` records whose IDs match the `other_info.shipping_class` value on each variation, and attaches the matching method as a `shipping_method` dynamic attribute.

* Parameters
   * none
* Returns the query result (executes `$query->get()` internally)

#### Usage:

```php
// Get variations with shipping class data
$variations = FluentCart\App\Models\ProductVariation::getWithShippingClass();

foreach ($variations as $variation) {
    if (isset($variation->shipping_method)) {
        echo $variation->shipping_method->title;
    }
}
```

## Relations

This model has the following relationships that you can use

### product

Access the associated product (WordPress post). BelongsTo via `post_id` -> `Product.ID`.

* return `FluentCart\App\Models\Product` Model

#### Example:

```php
// Accessing Product
$product = $productVariation->product;

// For Filtering by product relationship
$productVariations = FluentCart\App\Models\ProductVariation::whereHas('product', function($query) {
    $query->where('post_status', 'publish');
})->get();
```

### shippingClass

Access the associated shipping class. BelongsTo via `shipping_class` -> `ShippingClass.id`.

* return `FluentCart\App\Models\ShippingClass` Model

#### Example:

```php
// Accessing Shipping Class
$shippingClass = $productVariation->shippingClass;
```

### product_detail

Access the associated product detail. BelongsTo via `post_id` -> `ProductDetail.post_id`.

* return `FluentCart\App\Models\ProductDetail` Model

#### Example:

```php
// Accessing Product Detail
$productDetail = $productVariation->product_detail;
```

### media

Access the associated product thumbnail media. HasOne to `ProductMeta` via `object_id` -> `id`, filtered to `meta_key = 'product_thumbnail'`. Only selects `id`, `object_id`, `meta_value`.

* return `FluentCart\App\Models\ProductMeta` Model (single record)

#### Example:

```php
// Accessing Media
$media = $productVariation->media;

// The thumbnail appended attribute reads from this relation:
$url = $productVariation->thumbnail; // shortcut
```

### product_downloads

Access all product downloads associated with this variation's product. HasMany to `ProductDownload` via `post_id` -> `post_id`, filtered to rows where `product_variation_id` contains this variation's ID, or is `NULL`, or is `'[]'`.

* return `FluentCart\App\Models\ProductDownload` Model Collection

#### Example:

```php
// Accessing Product Downloads
$downloads = $productVariation->product_downloads;
```

### order_items

Access all order items for this variation. HasMany to `OrderItem` via `object_id` -> `id`.

* return `FluentCart\App\Models\OrderItem` Model Collection

#### Example:

```php
// Accessing Order Items
$orderItems = $productVariation->order_items;
```

### downloadable_files

Access all downloadable files directly linked to this variation. HasMany to `ProductDownload` via `product_variation_id` -> `id`.

* return `FluentCart\App\Models\ProductDownload` Model Collection

#### Example:

```php
// Accessing Downloadable Files
$downloadableFiles = $productVariation->downloadable_files;
```

### upgrade_paths

Access all upgrade path meta entries for this variation. HasMany to `Meta` via `object_id` -> `id`, filtered by `object_type = PlanUpgradeService::$metaType` and `meta_key = PlanUpgradeService::$metaKey`.

* return `FluentCart\App\Models\Meta` Model Collection

#### Example:

```php
// Accessing Upgrade Paths
$upgradePaths = $productVariation->upgrade_paths;
```

### attrMap

Access all attribute relation mappings for this variation. HasMany to `AttributeRelation` via `object_id` -> `id`.

**Note:** These records are cascade-deleted when the variation is deleted.

* return `FluentCart\App\Models\AttributeRelation` Model Collection

#### Example:

```php
// Accessing Attribute Relations
$attrMap = $productVariation->attrMap;
```

### bundleChildren

Access the child variations of a bundle product. Uses a custom `BundleChildrenRelation` that reads child IDs from the `other_info` JSON column (key `bundle_child_ids`) and loads the corresponding `ProductVariation` records. Supports eager loading.

* return `FluentCart\App\Models\ProductVariation` Model Collection (via `BundleChildrenRelation`)

#### Example:

```php
// Accessing Bundle Children
$children = $productVariation->bundleChildren;

// Eager loading bundle children
$variations = FluentCart\App\Models\ProductVariation::with('bundleChildren')->where('post_id', $postId)->get();

foreach ($variations as $variation) {
    foreach ($variation->bundleChildren as $child) {
        echo $child->variation_title;
    }
}
```

## Methods

Along with Global Model methods, this model has few helper methods.

### getFormattedTotalAttribute()

Get formatted total price (accessor). Automatically appended on every `retrieved` event via the `booted()` method.

* Parameters
   * none
* Returns `string` -- the decimal-formatted item price

#### Usage

```php
$formattedTotal = $productVariation->formatted_total; // Returns formatted price string
```

### getThumbnailAttribute()

Get thumbnail URL (accessor). Reads from the `media` relation. Returns the `url` key of the first element in `media->meta_value`, or `null` if no media is set.

* Parameters
   * none
* Returns `string|null`

#### Usage

```php
$thumbnail = $productVariation->thumbnail; // Returns thumbnail URL or null
```

### canPurchase($quantity = 1)

Check if the variation can be purchased. Validates:

1. `item_status` must be `active` and parent product must be `publish` or `private`.
2. Subscription variations cannot have `$quantity > 1`.
3. A related `product_detail` must exist.
4. If stock management module is active and both `productDetail->manage_stock` and `$this->manage_stock` are truthy, `$quantity` must not exceed `$this->available`.
5. Bundle products require Pro to be active.
6. Applies the `fluent_cart/variation/can_purchase_bundle` filter for additional bundle checks.

* Parameters
   * `$quantity` - integer (default: 1)
* Returns `true` on success, or `\WP_Error` with an error code on failure

**Error codes:** `unpublished`, `invalid_subscription_quantity`, `insufficient_stock`, `invalid_bundle_product`

#### Usage

```php
$canPurchase = $productVariation->canPurchase(2);
if (is_wp_error($canPurchase)) {
    echo "Error: " . $canPurchase->get_error_message();
} else {
    echo "Available for purchase";
}
```

### getSubscriptionTermsText($withComparePrice = false)

Get human-readable subscription terms text. Returns an empty string for non-subscription variations. Reads `trial_days`, `repeat_interval`, `times`, `signup_fee`, `signup_fee_name` from `other_info` and delegates to `Helper::getSubscriptionTermText()`.

* Parameters
   * `$withComparePrice` - boolean (default: false). When `true` and `compare_price > item_price`, the compare price is included in the formatted output.
* Returns `string`

#### Usage

```php
$termsText = $productVariation->getSubscriptionTermsText(true);
echo "Subscription Terms: " . $termsText;
```

### getPurchaseUrl()

Get the instant checkout purchase URL for this variation.

* Parameters
   * none
* Returns `string` -- URL in the format `site_url('?fluent-cart=instant_checkout&item_id={id}&quantity=1')`

#### Usage

```php
$purchaseUrl = $productVariation->getPurchaseUrl();
echo "Purchase URL: " . $purchaseUrl;
```

### soldIndividually()

Check whether this variation's parent product is sold individually. Delegates to `$this->product->soldIndividually()`.

* Parameters
   * none
* Returns `bool` -- `false` if no product is loaded

#### Usage

```php
if ($productVariation->soldIndividually()) {
    echo "This product can only be purchased one at a time.";
}
```

### isStock()

Check whether this variation is currently in stock. The logic handles both regular and bundle products:

1. Returns `false` if `item_status` is not `active`.
2. If `manage_stock` is disabled:
   - For bundle products, delegates to `isBundleChildrenInStock()`.
   - For regular products, returns `true` when `stock_status` equals `Helper::IN_STOCK`.
3. If `manage_stock` is enabled, checks `available > 0` AND `stock_status === Helper::IN_STOCK`.
4. For bundle products with stock management enabled, the parent must be in stock AND all children must pass `isBundleChildrenInStock()`.

* Parameters
   * none
* Returns `bool`

#### Usage

```php
$variation = FluentCart\App\Models\ProductVariation::find(1);
if ($variation->isStock()) {
    echo "In stock";
} else {
    echo "Out of stock";
}
```

### isBundleChildrenInStock() (protected)

Check if all bundle children are in stock. Reads `bundle_child_ids` from `other_info`, loads those variations, and verifies each child is `active` and (if `manage_stock` is enabled) has `available > 0` with `stock_status === Helper::IN_STOCK`. Returns `true` if there are no bundle children.

* Visibility: `protected`
* Parameters
   * none
* Returns `bool`

## Hooks / Filters

| Hook | Type | Location | Description |
| ---- | ---- | -------- | ----------- |
| `fluent_cart/variation/can_purchase_bundle` | Filter | `canPurchase()` | Allows external code to block or allow bundle purchases. Receives `null` and an array with `variation` and `quantity`. Return `\WP_Error` to block, `false` for out-of-stock, or `null`/`true` to allow. |

## Usage Examples

### Get Product Variations

```php
$productVariation = FluentCart\App\Models\ProductVariation::find(1);
echo "Price: " . $productVariation->formatted_total;
echo "Stock: " . $productVariation->available;
echo "Status: " . $productVariation->item_status;
echo "SKU: " . $productVariation->sku;
```

### Get Variations with Shipping Class

```php
$variations = FluentCart\App\Models\ProductVariation::getWithShippingClass();
foreach ($variations as $variation) {
    echo "Variation: " . $variation->variation_title;
    if (isset($variation->shipping_method)) {
        echo "Shipping Method: " . $variation->shipping_method->title;
    }
}
```

### Check Purchase Availability

```php
$variation = FluentCart\App\Models\ProductVariation::find(1);
$canPurchase = $variation->canPurchase(1);

if (is_wp_error($canPurchase)) {
    echo "Cannot purchase: " . $canPurchase->get_error_message();
} else {
    echo "Available for purchase";
}
```

### Check Stock Status (Including Bundles)

```php
$variation = FluentCart\App\Models\ProductVariation::find(1);
if ($variation->isStock()) {
    echo "Variation is in stock";
} else {
    echo "Variation is out of stock";
}
```

### Get Subscription Terms

```php
$variation = FluentCart\App\Models\ProductVariation::find(1);
if ($variation->payment_type === 'subscription') {
    $terms = $variation->getSubscriptionTermsText(true);
    echo "Subscription: " . $terms;
}
```

### Get Downloadable Files

```php
$variation = FluentCart\App\Models\ProductVariation::find(1);
$downloads = $variation->downloadable_files;

foreach ($downloads as $download) {
    echo "Download: " . $download->title;
}
```

### Work with Bundle Children

```php
$variation = FluentCart\App\Models\ProductVariation::find(1);
$children = $variation->bundleChildren;

foreach ($children as $child) {
    echo "Child: " . $child->variation_title . " - Price: " . $child->formatted_total;
}
```

---
