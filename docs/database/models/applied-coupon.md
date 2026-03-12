---
title: Applied Coupon Model
description: FluentCart AppliedCoupon model documentation with attributes, scopes, relationships, and methods.
---

# Applied Coupon Model

| DB Table Name | {wp_db_prefix}_fct_applied_coupons               |
| ------------- | ------------------------------------------------ |
| Schema        | [Check Schema](/database/schema#fct-applied-coupons-table) |
| Source File   | fluent-cart/app/Models/AppliedCoupon.php        |
| Name Space    | FluentCart\App\Models                            |
| Class         | FluentCart\App\Models\AppliedCoupon              |

## Traits

- **CanUpdateBatch** - Provides `batchUpdate()` scope for batch updating multiple records

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key (guarded) |
| order_id           | Integer   | Reference to order |
| coupon_id          | Integer   | Reference to coupon |
| code               | String    | Coupon code |
| amount             | Decimal   | Discount amount applied (in cents) |
| settings           | JSON      | (Dynamic/Meta) Coupon settings, may not be a physical DB column |
| other_info         | JSON      | (Dynamic/Meta) Additional coupon information (buy/get product IDs), may not be a physical DB column |
| categories         | JSON      | (Dynamic/Meta) Product categories, may not be a physical DB column |
| products           | JSON      | (Dynamic/Meta) Product IDs (stored as integers), may not be a physical DB column |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

> **Note:** Some fields above (settings, other_info, categories, products) are handled as dynamic/meta properties in the model and may not exist as physical columns in the database schema. They are available via accessors/mutators for developer convenience. The `id` column is both guarded and declared as `$primaryKey`.

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$appliedCoupon = FluentCart\App\Models\AppliedCoupon::find(1);

$appliedCoupon->id; // returns id
$appliedCoupon->order_id; // returns order ID
$appliedCoupon->coupon_id; // returns coupon ID
$appliedCoupon->code; // returns coupon code
$appliedCoupon->amount; // returns discount amount
```

## Scopes

This model has the following scopes via the `CanUpdateBatch` trait.

### batchUpdate($values, $index = null)

Batch update multiple records at once. Uses the primary key as the default index column.

* Parameters
   * $values - array of records to update
   * $index - string|null (default: primary key)

#### Usage:

```php
FluentCart\App\Models\AppliedCoupon::batchUpdate([
    ['id' => 1, 'amount' => 500],
    ['id' => 2, 'amount' => 1000],
]);
```

## Relations

This model has the following relationships that you can use

### order

Access the associated order

* return `FluentCart\App\Models\Order` Model

#### Example:

```php
// Accessing Order
$order = $appliedCoupon->order;

// For Filtering by order relationship
$appliedCoupons = FluentCart\App\Models\AppliedCoupon::whereHas('order', function($query) {
    $query->where('status', 'completed');
})->get();
```

### coupon

Access the associated coupon. This relationship uses `code` as the foreign key and `id` as the owner key on the `Coupon` model.

* return `FluentCart\App\Models\Coupon` Model

#### Example:

```php
// Accessing Coupon
$coupon = $appliedCoupon->coupon;

// For Filtering by coupon relationship
$appliedCoupons = FluentCart\App\Models\AppliedCoupon::whereHas('coupon', function($query) {
    $query->where('status', 'active');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### setSettingsAttribute($value)

Set settings with automatic JSON encoding (mutator). Uses `JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES` flags. Stores the encoded value in the `meta_value` column.

* Parameters
   * $value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$appliedCoupon->settings = ['discount_type' => 'percentage', 'value' => 10];
// Automatically JSON encodes arrays and objects
```

### getSettingsAttribute($value)

Get settings with automatic JSON decoding (accessor). Returns decoded array if valid JSON, otherwise returns the original value.

* Parameters
   * $value - mixed
* Returns `mixed`

#### Usage

```php
$settings = $appliedCoupon->settings; // Returns decoded value (array, object, or string)
```

### setOtherInfoAttribute($value)

Set other info with automatic JSON encoding and product ID conversion (mutator). Accepts JSON strings, arrays, or objects. Automatically converts `buy_products` and `get_products` arrays to integer values.

* Parameters
   * $value - mixed (array, object, or JSON string)
* Returns `void`

#### Usage

```php
$appliedCoupon->other_info = [
    'buy_products' => [1, 2, 3],
    'get_products' => [4, 5, 6]
];
// Automatically JSON encodes and converts product IDs to integers
```

### getOtherInfoAttribute($value)

Get other info with automatic JSON decoding (accessor). Returns empty array if value is empty.

* Parameters
   * $value - mixed
* Returns `array`

#### Usage

```php
$otherInfo = $appliedCoupon->other_info; // Returns decoded array or empty array
```

### setCategoriesAttribute($value)

Set categories with automatic JSON encoding (mutator). Arrays and objects are JSON-encoded; other types result in an empty JSON array.

* Parameters
   * $value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$appliedCoupon->categories = ['electronics', 'books', 'clothing'];
// Automatically JSON encodes arrays and objects
```

### getCategoriesAttribute($value)

Get categories with automatic JSON decoding (accessor). Returns empty array if value is empty.

* Parameters
   * $value - mixed
* Returns `array`

#### Usage

```php
$categories = $appliedCoupon->categories; // Returns decoded array or empty array
```

### setProductsAttribute($value)

Set products with automatic JSON encoding and integer conversion (mutator). Each item in the array is converted to an integer via `intval()`. Non-array/object values result in an empty JSON array.

* Parameters
   * $value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$appliedCoupon->products = [1, 2, 3, 4, 5];
// Automatically JSON encodes and converts to integers
```

### getProductsAttribute($value)

Get products with automatic JSON decoding (accessor). Returns empty array if value is empty.

* Parameters
   * $value - mixed
* Returns `array`

#### Usage

```php
$products = $appliedCoupon->products; // Returns decoded array of integers or empty array
```

## Usage Examples

### Get Applied Coupons

```php
$appliedCoupon = FluentCart\App\Models\AppliedCoupon::find(1);
echo "Coupon Code: " . $appliedCoupon->code;
echo "Discount Amount: " . $appliedCoupon->amount;
echo "Order ID: " . $appliedCoupon->order_id;
```

### Get Coupons Applied to Order

```php
$order = FluentCart\App\Models\Order::find(123);
$appliedCoupons = $order->applied_coupons;

foreach ($appliedCoupons as $appliedCoupon) {
    echo "Coupon: " . $appliedCoupon->code;
    echo "Discount: " . $appliedCoupon->amount;
}
```

### Create Applied Coupon

```php
$appliedCoupon = FluentCart\App\Models\AppliedCoupon::create([
    'order_id' => 123,
    'coupon_id' => 5,
    'code' => 'SAVE10',
    'amount' => 1000,
]);
```

### Get Coupon Details

```php
$appliedCoupon = FluentCart\App\Models\AppliedCoupon::with(['order', 'coupon'])->find(1);
$order = $appliedCoupon->order;
$coupon = $appliedCoupon->coupon;
```

### Get Applied Coupons by Code

```php
$appliedCoupons = FluentCart\App\Models\AppliedCoupon::where('code', 'SAVE10')->get();
```

### Get Applied Coupons for Date Range

```php
$appliedCoupons = FluentCart\App\Models\AppliedCoupon::whereBetween('created_at', ['2024-01-01', '2024-01-31'])->get();
```

### Batch Update Coupon Amounts

```php
FluentCart\App\Models\AppliedCoupon::batchUpdate([
    ['id' => 1, 'amount' => 500],
    ['id' => 2, 'amount' => 1500],
    ['id' => 3, 'amount' => 2000],
]);
```

---
