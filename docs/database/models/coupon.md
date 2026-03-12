---
title: Coupon Model
description: FluentCart Coupon model documentation with attributes, scopes, relationships, and methods.
---

# Coupon Model

| DB Table Name | {wp_db_prefix}_fct_coupons               |
| ------------- | --------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-coupons-table) |
| Source File   | fluent-cart/app/Models/Coupon.php        |
| Name Space    | FluentCart\App\Models                    |
| Class         | FluentCart\App\Models\Coupon             |

## Traits

| Trait       | Description |
| ----------- | ----------- |
| CanSearch   | Provides `search()`, `whereLike()`, `whereBeginsWith()`, `whereEndsWith()`, and `groupSearch()` query scopes |
| HasActivity | Provides the `activities()` polymorphic relationship to the Activity model |

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer (BIGINT UNSIGNED) | Primary Key, auto-increment |
| parent             | Integer   | Parent coupon ID |
| title              | String (VARCHAR 200) | Coupon title |
| code               | String (VARCHAR 50) | Coupon code (unique) |
| status             | String (VARCHAR 20) | Coupon status (active, inactive, expired) |
| type               | String (VARCHAR 20) | Coupon type (percentage, fixed) |
| conditions         | JSON      | Coupon conditions (auto-encoded/decoded via mutator) |
| amount             | Double    | Coupon amount (in cents for fixed, raw value for percentage) |
| stackable          | String (VARCHAR 3) | Whether coupon is stackable ('yes' or 'no', default 'no') |
| priority           | Integer   | Coupon priority |
| use_count          | Integer   | Number of times used (default 0) |
| notes              | Text (LONGTEXT) | Coupon notes |
| show_on_checkout   | String (VARCHAR 3) | Show on checkout page ('yes' or 'no', default 'yes') |
| settings           | JSON      | Coupon settings (auto-encoded/decoded via mutator) |
| other_info         | JSON      | Additional info like buy/get products (auto-encoded/decoded via mutator) |
| categories         | JSON      | Category IDs for coupon applicability (auto-encoded/decoded via mutator) |
| products           | JSON      | Product IDs for coupon applicability (auto-encoded/decoded via mutator, values cast to integer) |
| start_date         | Timestamp | Start date |
| end_date           | Timestamp | End date |
| created_at         | DateTime  | Creation timestamp |
| updated_at         | DateTime  | Last update timestamp |

### Fillable Attributes

```php
protected $fillable = [
    'parent', 'title', 'code', 'status', 'type', 'conditions',
    'amount', 'stackable', 'priority', 'use_count', 'notes',
    'show_on_checkout', 'start_date', 'end_date',
];
```

### Casts

| Attribute | Cast Type |
| --------- | --------- |
| max_uses  | integer   |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$coupon = FluentCart\App\Models\Coupon::find(1);

$coupon->id; // returns coupon ID
$coupon->code; // returns coupon code
$coupon->type; // returns coupon type
$coupon->amount; // returns coupon amount in cents
$coupon->status; // returns coupon status
$coupon->conditions; // returns decoded conditions array (via JSON mutator)
$coupon->settings; // returns decoded settings array (via JSON mutator)
$coupon->other_info; // returns decoded other info array (via JSON mutator)
$coupon->categories; // returns decoded categories array (via JSON mutator)
$coupon->products; // returns decoded products array of integers (via JSON mutator)
```

## Relations

This model has the following relationships that you can use.

### appliedCoupons

Access the applied coupons (hasMany).

- **Type:** `hasMany`
- **Related Model:** `FluentCart\App\Models\AppliedCoupon`
- **Foreign Key:** `coupon_id`
- **Local Key:** `id`
- Returns `FluentCart\Framework\Database\Orm\Collection` of `FluentCart\App\Models\AppliedCoupon`

```php
$coupon = FluentCart\App\Models\Coupon::find(1);
$appliedCoupons = $coupon->appliedCoupons;
```

### orders

Access the orders that used this coupon (belongsToMany through pivot table).

- **Type:** `belongsToMany`
- **Related Model:** `FluentCart\App\Models\Order`
- **Pivot Table:** `fct_applied_coupons`
- **Foreign Pivot Key:** `coupon_id`
- **Related Pivot Key:** `order_id`
- Returns `FluentCart\Framework\Database\Orm\Collection` of `FluentCart\App\Models\Order`

```php
$coupon = FluentCart\App\Models\Coupon::find(1);
$orders = $coupon->orders;
```

### activities

Access the activity log entries for this coupon (polymorphic, from `HasActivity` trait).

- **Type:** `morphMany`
- **Related Model:** `FluentCart\App\Models\Activity`
- **Morph Name:** `module`
- **Default Order:** `created_at DESC`, `id DESC`
- Returns `FluentCart\Framework\Database\Orm\Collection` of `FluentCart\App\Models\Activity`

```php
$coupon = FluentCart\App\Models\Coupon::find(1);
$activities = $coupon->activities;
```

## Scopes

This model has the following scopes that you can use.

### active()

Get only active coupons that have not expired.

```php
$coupons = FluentCart\App\Models\Coupon::active()->get();
```

This scope filters coupons that are:
- Status is `'active'`
- End date is null, or `'0000-00-00 00:00:00'`, or in the future (compared to `DateTime::gmtNow()`)

### Scopes from CanSearch Trait

#### search($params)

Search coupons using an array of filter parameters.

```php
$coupons = FluentCart\App\Models\Coupon::search([
    'status' => 'active',
    'type'   => 'percentage',
])->get();
```

#### whereLike($column, $value)

WHERE column LIKE %value% query.

```php
$coupons = FluentCart\App\Models\Coupon::whereLike('code', 'SAVE')->get();
```

#### whereBeginsWith($column, $value)

WHERE column LIKE value% query.

```php
$coupons = FluentCart\App\Models\Coupon::whereBeginsWith('code', 'SAVE')->get();
```

#### whereEndsWith($column, $value)

WHERE column LIKE %value query.

```php
$coupons = FluentCart\App\Models\Coupon::whereEndsWith('code', '10')->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### JSON Mutators (Accessors & Mutators)

The Coupon model uses accessor/mutator pairs to automatically handle JSON encoding and decoding for several attributes. When you set these attributes with an array or object, they are automatically JSON-encoded before storage. When you read them, they are automatically JSON-decoded into arrays.

#### conditions (setConditionsAttribute / getConditionsAttribute)

Set and get coupon conditions with automatic JSON encoding/decoding.

- **Setter:** Accepts an array or object, JSON-encodes it. Falls back to `'[]'` if value is empty or encoding fails.
- **Getter:** Returns a decoded array, or `[]` if value is empty.

```php
$coupon = FluentCart\App\Models\Coupon::find(1);

// Setting conditions
$coupon->conditions = [
    'min_purchase_amount' => 5000,
    'max_per_customer'    => 3,
    'max_uses'            => 100,
    'is_recurring'        => 'yes',
];

// Getting conditions
$conditions = $coupon->conditions; // returns array
```

#### settings (setSettingsAttribute / getSettingsAttribute)

Set and get coupon settings with automatic JSON encoding/decoding.

- **Setter:** If value is an array or object, JSON-encodes with `JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES` flags.
- **Getter:** If value is a string, JSON-decodes it. Returns the decoded array on success, or the original value if decoding fails.

```php
$coupon = FluentCart\App\Models\Coupon::find(1);

// Setting
$coupon->settings = ['custom_field' => 'value'];

// Getting
$settings = $coupon->settings; // returns array
```

#### other_info (setOtherInfoAttribute / getOtherInfoAttribute)

Set and get additional info with automatic JSON encoding/decoding. The setter has special handling: if `buy_products` or `get_products` keys are present and are arrays, their values are cast to integers via `array_map('intval', ...)`.

- **Setter:** Accepts a string (JSON-decodes it first), array, or object. Casts `buy_products` and `get_products` values to integers. Falls back to `'[]'` for non-array/non-object values.
- **Getter:** Returns a decoded array, or `[]` if value is empty.

```php
$coupon = FluentCart\App\Models\Coupon::find(1);

// Setting (buy_products and get_products values auto-cast to integers)
$coupon->other_info = [
    'buy_products' => [1, 2, 3],
    'get_products' => [4, 5],
];

// Getting
$otherInfo = $coupon->other_info; // returns array
```

#### categories (setCategoriesAttribute / getCategoriesAttribute)

Set and get categories with automatic JSON encoding/decoding.

- **Setter:** If value is an array or object, JSON-encodes it. Falls back to `'[]'` otherwise.
- **Getter:** Returns a decoded array, or `[]` if value is empty.

```php
$coupon = FluentCart\App\Models\Coupon::find(1);

// Setting
$coupon->categories = [1, 2, 3];

// Getting
$categories = $coupon->categories; // returns array
```

#### products (setProductsAttribute / getProductsAttribute)

Set and get products with automatic JSON encoding/decoding. The setter casts each product ID to an integer via `array_map('intval', ...)`.

- **Setter:** If value is an array or object, casts each item to integer, then JSON-encodes. Falls back to `'[]'` otherwise.
- **Getter:** Returns a decoded array, or `[]` if value is empty.

```php
$coupon = FluentCart\App\Models\Coupon::find(1);

// Setting (values are auto-cast to integers)
$coupon->products = [1, 2, 3];

// Getting
$products = $coupon->products; // returns array of integers
```

### getEndDate()

Get the coupon's end date.

* Returns `String|null` - End date value

```php
$coupon = FluentCart\App\Models\Coupon::find(1);
$endDate = $coupon->getEndDate();
```

### getStatus()

Get the coupon's current status.

* Returns `String` - Status value

```php
$coupon = FluentCart\App\Models\Coupon::find(1);
$status = $coupon->getStatus();
```

### setStatus($value)

Set the coupon's status.

* Parameters: `$value` (String) - Status value (e.g., 'active', 'inactive', 'expired')

```php
$coupon = FluentCart\App\Models\Coupon::find(1);
$coupon->setStatus('active');
```

### getMeta($metaKey, $default = null)

Get a coupon meta value from the `fct_meta` table where `object_type` is `'coupon'`.

* Parameters: `$metaKey` (String) - Meta key, `$default` (Mixed) - Default value if meta not found
* Returns `Mixed` - Meta value or default

```php
$coupon = FluentCart\App\Models\Coupon::find(1);
$metaValue = $coupon->getMeta('custom_field', 'default');
```

### updateMeta($metaKey, $metaValue)

Create or update a coupon meta value in the `fct_meta` table where `object_type` is `'coupon'`. If the meta key already exists for this coupon, it updates the value. Otherwise, it creates a new meta record.

* Parameters: `$metaKey` (String) - Meta key, `$metaValue` (Mixed) - Meta value
* Returns `FluentCart\App\Models\Meta` - The created or updated Meta instance

```php
$coupon = FluentCart\App\Models\Coupon::find(1);
$meta = $coupon->updateMeta('custom_field', 'new_value');
```

### isRecurringDiscount()

Check if this coupon is configured as a recurring discount. Looks at the `is_recurring` key inside the `conditions` JSON attribute.

* Returns `Boolean` - `true` if `conditions.is_recurring` equals `'yes'`, `false` otherwise

```php
$coupon = FluentCart\App\Models\Coupon::find(1);

if ($coupon->isRecurringDiscount()) {
    // This coupon applies to recurring subscription payments
}
```

## Usage Examples

### Creating a Coupon

```php
use FluentCart\App\Models\Coupon;

$coupon = Coupon::create([
    'code'       => 'SAVE10',
    'title'      => 'Save 10%',
    'type'       => 'percentage',
    'amount'     => 10, // 10%
    'status'     => 'active',
    'stackable'  => 'no',
    'conditions' => [
        'min_purchase_amount' => 5000,
        'max_uses'            => 100,
        'max_per_customer'    => 3,
        'is_recurring'        => 'yes',
    ],
    'start_date' => now(),
    'end_date'   => now()->addDays(30),
]);
```

### Retrieving Coupons

```php
// Get coupon by code
$coupon = Coupon::where('code', 'SAVE10')->first();

// Get all active coupons
$coupons = Coupon::active()->get();

// Get coupon by ID
$coupon = Coupon::find(1);

// Search coupons by code pattern
$coupons = Coupon::whereLike('code', 'SAVE')->get();

// Get coupon with activities
$coupon = Coupon::with(['activities.user'])->find(1);

// Get coupon with applied coupons count
$coupon = Coupon::withCount('appliedCoupons')->find(1);
```

### Updating a Coupon

```php
$coupon = Coupon::find(1);
$coupon->use_count = $coupon->use_count + 1;
$coupon->save();
```

### Checking Recurring Discount

```php
$coupon = Coupon::find(1);
if ($coupon->isRecurringDiscount()) {
    // Handle recurring discount logic
}
```

### Working with Meta

```php
$coupon = Coupon::find(1);

// Set meta
$coupon->updateMeta('custom_setting', 'value');

// Get meta with default
$value = $coupon->getMeta('custom_setting', 'fallback');
```

### Deleting a Coupon

```php
$coupon = Coupon::find(1);
$coupon->delete();
```

---
