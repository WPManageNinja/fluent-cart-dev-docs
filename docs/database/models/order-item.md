---
title: Order Item Model
description: FluentCart OrderItem model documentation with attributes, casts, appends, relationships, and methods.
---

# Order Item Model

| DB Table Name | {wp_db_prefix}_fct_order_items               |
| ------------- | -------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-order-items-table) |
| Source File   | fluent-cart/app/Models/OrderItem.php        |
| Name Space    | FluentCart\App\Models                        |
| Class         | FluentCart\App\Models\OrderItem              |

## Traits

| Trait           | Description                                                |
| --------------- | ---------------------------------------------------------- |
| CanSearch       | Provides `search()`, `whereLike()`, `whereBeginsWith()`, `whereEndsWith()`, `groupSearch()` scopes |
| CanUpdateBatch  | Provides `batchUpdate()` scope for bulk updates            |

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key |
| order_id           | Integer   | Reference to order |
| post_id            | Integer   | WordPress post ID (product) |
| fulfillment_type   | String    | Fulfillment type (physical, digital, service) |
| fulfilled_quantity | Integer   | Quantity fulfilled |
| post_title         | Text      | Product title |
| title              | Text      | Item title (variation) |
| object_id          | Integer   | Variation ID |
| cart_index         | Integer   | Position in cart |
| quantity           | Integer   | Item quantity |
| unit_price         | Bigint    | Price per unit in cents |
| cost               | Bigint    | Cost in cents |
| subtotal           | Bigint    | Line subtotal |
| tax_amount         | Bigint    | Tax amount for this line |
| shipping_charge    | Bigint    | Shipping charge (not in fillable) |
| discount_total     | Bigint    | Discount amount |
| line_total         | Bigint    | Total line amount |
| refund_total       | Bigint    | Refunded amount |
| rate               | Bigint    | Exchange rate |
| other_info         | JSON      | Additional item data (auto-encoded/decoded) |
| line_meta          | JSON      | Line-specific metadata (auto-encoded/decoded) |
| referrer           | Text      | Referral information |
| object_type        | String    | Object type |
| payment_type       | String    | Payment type (onetime, subscription, signup_fee) |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Casts

The following attributes are automatically cast to `double` when accessed:

| Attribute        | Cast Type |
| ---------------- | --------- |
| unit_price       | double    |
| cost             | double    |
| subtotal         | double    |
| tax_amount       | double    |
| shipping_charge  | double    |
| discount_total   | double    |
| line_total       | double    |
| refund_total     | double    |

## Appends

The following virtual attributes are appended to the model:

| Append          | Type    | Description |
| --------------- | ------- | ----------- |
| payment_info    | string  | Subscription payment info (empty string if not a subscription) |
| setup_info      | string  | Subscription setup fee info (empty string if not a subscription) |
| is_custom       | boolean | Whether the item is a custom item (from `other_info['is_custom']`) |
| formatted_total | float   | Decimal-formatted subtotal (appended via `booted()` on retrieval) |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$orderItem = FluentCart\App\Models\OrderItem::find(1);

$orderItem->id; // returns id
$orderItem->order_id; // returns order ID
$orderItem->quantity; // returns quantity
$orderItem->unit_price; // returns unit price (cast to double)
$orderItem->line_total; // returns line total (cast to double)
$orderItem->payment_info; // returns subscription payment info string
$orderItem->setup_info; // returns subscription setup info string
$orderItem->is_custom; // returns boolean
$orderItem->formatted_total; // returns decimal-formatted subtotal
$orderItem->full_name; // returns title + post_title combined
$orderItem->view_url; // returns view URL for custom items
```

## Relations

This model has the following relationships that you can use

### order

Access the associated order

* Relation type: `belongsTo`
* return `FluentCart\App\Models\Order` Model
* Foreign key: `order_id`

#### Example:

```php
// Accessing Order
$order = $orderItem->order;

// For Filtering by order relationship
$orderItems = FluentCart\App\Models\OrderItem::whereHas('order', function($query) {
    $query->where('status', 'completed');
})->get();
```

### product

Access the associated product

* Relation type: `belongsTo`
* return `FluentCart\App\Models\Product` Model
* Foreign key: `post_id` -> `ID`

#### Example:

```php
// Accessing Product
$product = $orderItem->product;

// For Filtering by product relationship
$orderItems = FluentCart\App\Models\OrderItem::whereHas('product', function($query) {
    $query->where('post_status', 'publish');
})->get();
```

### variants

Access the associated product variation

* Relation type: `belongsTo`
* return `FluentCart\App\Models\ProductVariation` Model
* Foreign key: `object_id` -> `id`

#### Example:

```php
// Accessing Product Variation
$variation = $orderItem->variants;
```

### product_downloads

Access the associated product downloads

* Relation type: `belongsTo`
* return `FluentCart\App\Models\ProductDownload` Model
* Foreign key: `post_id` -> `post_id`

#### Example:

```php
// Accessing Product Downloads
$downloads = $orderItem->product_downloads;
```

### productImage

Access the product gallery image via WordPress post meta

* Relation type: `hasOne`
* return `FluentCart\App\Models\WpModels\PostMeta` Model
* Foreign key: `post_id` -> `post_id`
* Condition: `postmeta.meta_key = 'fluent-products-gallery-image'`

#### Example:

```php
// Accessing Product Image
$image = $orderItem->productImage;
```

### variantImages

Access the variant thumbnail image via product meta

* Relation type: `hasOne`
* return `FluentCart\App\Models\ProductMeta` Model
* Foreign key: `object_id` -> `object_id`
* Conditions: `object_type = 'product_variant_info'` and `meta_key = 'product_thumbnail'`

#### Example:

```php
// Accessing Variant Image
$variantImage = $orderItem->variantImages;
```

## Methods

Along with Global Model methods, this model has few helper methods.

### getFormattedTotalAttribute()

Get formatted line total as a decimal value (accessor). This attribute is appended automatically when the model is retrieved from the database via the `booted()` method.

* Parameters
   * none
* Returns `float`

#### Usage

```php
$formattedTotal = $orderItem->formatted_total; // Returns: 99.99
```

### getPaymentInfoAttribute()

Get subscription payment info string. Returns an empty string if the item's `payment_type` is not `subscription`. For subscription items, delegates to `Helper::generateSubscriptionInfo()` using `other_info` and `unit_price`.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$paymentInfo = $orderItem->payment_info; // e.g. "$9.99 / month"
```

### getSetupInfoAttribute()

Get subscription setup fee info string. Returns an empty string if the item's `payment_type` is not `subscription`. For subscription items, delegates to `Helper::generateSetupFeeInfo()` using `other_info`.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$setupInfo = $orderItem->setup_info; // e.g. "$19.99 setup fee"
```

### getIsCustomAttribute()

Check if this is a custom item (accessor). Reads the `is_custom` key from the `other_info` JSON field.

* Parameters
   * none
* Returns `boolean`

#### Usage

```php
$isCustom = $orderItem->is_custom; // Returns: true or false
```

### getViewUrlAttribute()

Get the view URL for custom items (accessor). Returns an empty string for non-custom items.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$viewUrl = $orderItem->view_url; // Returns URL string or empty string
```

### getFullNameAttribute()

Get the full name by combining the item title and product title.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$fullName = $orderItem->full_name; // Returns: "Variation Name Product Title"
```

### getOtherInfoAttribute($value)

Get other info as array (accessor). Automatically decodes the JSON string stored in the database.

* Parameters
   * $value - mixed (raw database value)
* Returns `array`

#### Usage

```php
$otherInfo = $orderItem->other_info; // Returns array
```

### setOtherInfoAttribute($value)

Set other info from array (mutator). Automatically encodes arrays/objects to JSON for storage.

* Parameters
   * $value - array|object|string
* Returns `void`

#### Usage

```php
$orderItem->other_info = ['custom_field' => 'value'];
```

### getLineMetaAttribute($value)

Get line meta as array (accessor). Automatically decodes the JSON string stored in the database.

* Parameters
   * $value - mixed (raw database value)
* Returns `array`

#### Usage

```php
$lineMeta = $orderItem->line_meta; // Returns array
```

### setLineMetaAttribute($value)

Set line meta from array (mutator). Automatically encodes arrays/objects to JSON for storage.

* Parameters
   * $value - array|object
* Returns `void`

#### Usage

```php
$orderItem->line_meta = ['custom_meta' => 'value'];
```

### processCustom($product, $orderId)

Process a custom item for an order. Delegates to `OrderItemHelper::processCustom()`.

* Parameters
   * $product - mixed (product data)
   * $orderId - integer (order ID)
* Returns `mixed`

#### Usage

```php
$orderItem = new FluentCart\App\Models\OrderItem();
$result = $orderItem->processCustom($productData, 123);
```

### createItem($orderItems)

Create an item (note: the method body returns a `belongsTo` relation to `ProductVariation` via `variation_id`).

* Parameters
   * $orderItems - mixed
* Returns `BelongsTo` relation to `FluentCart\App\Models\ProductVariation`

---
