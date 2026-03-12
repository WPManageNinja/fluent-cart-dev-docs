---
title: Order Meta Model
description: FluentCart OrderMeta model documentation with attributes, scopes, relationships, and methods.
---

# Order Meta Model

| DB Table Name | {wp_db_prefix}_fct_order_meta                |
| ------------- | -------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-order-meta-table) |
| Source File   | fluent-cart/app/Models/OrderMeta.php        |
| Name Space    | FluentCart\App\Models                        |
| Class         | FluentCart\App\Models\OrderMeta              |

## Traits

- **CanSearch** - Provides `search()`, `whereLike()`, `whereBeginsWith()`, `whereEndsWith()`, and `groupSearch()` scopes

## Attributes

| Attribute  | Data Type | Comment |
| ---------- | --------- | ------- |
| id         | Integer   | Primary Key |
| order_id   | Integer   | Reference to order |
| meta_key   | String    | Meta key name |
| meta_value | Text      | Meta value (JSON or string) |
| created_at | Date Time | Creation timestamp |
| updated_at | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$orderMeta = FluentCart\App\Models\OrderMeta::find(1);

$orderMeta->id; // returns id
$orderMeta->order_id; // returns order ID
$orderMeta->meta_key; // returns meta key
$orderMeta->meta_value; // returns meta value (auto-decoded if JSON)
```

## Scopes

This model has the following scopes via the `CanSearch` trait.

### search($params)

Perform a parameterized search with various operators (=, like_all, between, in, not_in, etc.).

* Parameters
   * $params - array of search parameters

#### Usage:

```php
$orderMeta = FluentCart\App\Models\OrderMeta::search([
    'meta_key' => 'billing_address',
])->get();
```

### whereLike($column, $value, $boolean = 'and')

Filter with a WHERE LIKE %value% query.

* Parameters
   * $column - string
   * $value - string
   * $boolean - string (default: 'and')

#### Usage:

```php
$orderMeta = FluentCart\App\Models\OrderMeta::whereLike('meta_key', 'billing')->get();
```

### whereBeginsWith($column, $value, $boolean = 'and')

Filter with a WHERE LIKE value% query.

* Parameters
   * $column - string
   * $value - string
   * $boolean - string (default: 'and')

#### Usage:

```php
$orderMeta = FluentCart\App\Models\OrderMeta::whereBeginsWith('meta_key', 'shipping_')->get();
```

### whereEndsWith($column, $value, $boolean = 'and')

Filter with a WHERE LIKE %value query.

* Parameters
   * $column - string
   * $value - string
   * $boolean - string (default: 'and')

#### Usage:

```php
$orderMeta = FluentCart\App\Models\OrderMeta::whereEndsWith('meta_key', '_address')->get();
```

### groupSearch($groups)

Perform grouped searches across the model and its relationships.

* Parameters
   * $groups - array of grouped search parameters

#### Usage:

```php
$orderMeta = FluentCart\App\Models\OrderMeta::groupSearch([
    'OrderMeta.meta_key' => [
        'column' => 'meta_key',
        'operator' => '=',
        'value' => 'billing_address'
    ],
])->get();
```

## Relations

This model has the following relationships that you can use

### order

Access the associated order

* return `FluentCart\App\Models\Order` Model

#### Example:

```php
// Accessing Order
$order = $orderMeta->order;

// For Filtering by order relationship
$orderMeta = FluentCart\App\Models\OrderMeta::whereHas('order', function($query) {
    $query->where('status', 'completed');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### setMetaValueAttribute($value)

Set meta value with automatic JSON encoding for arrays and objects (mutator). Uses `JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES` flags.

* Parameters
   * $value - array|object|string
* Returns `void`

#### Usage

```php
// Set array value (will be JSON encoded)
$orderMeta->meta_value = ['address' => '123 Main St', 'city' => 'New York'];

// Set string value
$orderMeta->meta_value = 'simple string value';
```

### getMetaValueAttribute($value)

Get meta value with automatic JSON decoding (accessor). Returns the decoded array if the value is valid JSON, otherwise returns the original string.

* Parameters
   * $value - mixed
* Returns `mixed` - array if valid JSON, original string otherwise

#### Usage

```php
$metaValue = $orderMeta->meta_value; // Returns array if JSON, string otherwise
```

### updateMeta($metaKey, $metaValue)

Create or update a meta entry for the current order. If a record with the same `order_id` and `meta_key` exists, it updates the value; otherwise, it creates a new record.

* Parameters
   * $metaKey - string
   * $metaValue - mixed
* Returns `FluentCart\App\Models\OrderMeta`

#### Usage

```php
$orderMeta = FluentCart\App\Models\OrderMeta::find(1);
$result = $orderMeta->updateMeta('custom_field', ['key' => 'value']);
```

## Common Meta Keys

Here are some common meta keys used in FluentCart:

### Billing Information
- `billing_address` - Billing address data
- `billing_first_name` - Billing first name
- `billing_last_name` - Billing last name
- `billing_company` - Billing company
- `billing_address_1` - Billing address line 1
- `billing_address_2` - Billing address line 2
- `billing_city` - Billing city
- `billing_state` - Billing state
- `billing_postcode` - Billing postal code
- `billing_country` - Billing country
- `billing_phone` - Billing phone number
- `billing_email` - Billing email

### Shipping Information
- `shipping_address` - Shipping address data
- `shipping_first_name` - Shipping first name
- `shipping_last_name` - Shipping last name
- `shipping_company` - Shipping company
- `shipping_address_1` - Shipping address line 1
- `shipping_address_2` - Shipping address line 2
- `shipping_city` - Shipping city
- `shipping_state` - Shipping state
- `shipping_postcode` - Shipping postal code
- `shipping_country` - Shipping country
- `shipping_phone` - Shipping phone number

### Order Information
- `order_notes` - Order notes
- `customer_notes` - Customer notes
- `admin_notes` - Admin notes
- `payment_method` - Payment method used
- `payment_method_title` - Payment method display name
- `transaction_id` - Payment transaction ID
- `gateway_transaction_id` - Gateway transaction ID
- `gateway_order_id` - Gateway order ID

### Subscription Information
- `subscription_id` - Associated subscription ID
- `subscription_status` - Subscription status
- `next_payment_date` - Next payment date
- `subscription_interval` - Subscription interval

### Custom Fields
- `custom_field_*` - Custom field values
- `_custom_*` - Custom meta fields

## Usage Examples

### Get Order Billing Address

```php
$order = FluentCart\App\Models\Order::find(123);
$billingAddress = $order->meta()->where('meta_key', 'billing_address')->first();

if ($billingAddress) {
    $address = $billingAddress->meta_value; // Returns array
    echo $address['address_1'] . ', ' . $address['city'];
}
```

### Set Order Custom Meta

```php
$order = FluentCart\App\Models\Order::find(123);

// Set custom meta
$order->meta()->updateOrCreate(
    ['meta_key' => 'custom_field'],
    ['meta_value' => ['value' => 'custom data', 'type' => 'text']]
);
```

### Update Meta via updateMeta()

```php
$orderMeta = FluentCart\App\Models\OrderMeta::where('order_id', 123)->first();
$orderMeta->updateMeta('shipping_notes', 'Leave at front door');
```

### Get All Order Meta as Key-Value Array

```php
$order = FluentCart\App\Models\Order::find(123);
$metaData = $order->meta()->pluck('meta_value', 'meta_key')->toArray();
```

---
