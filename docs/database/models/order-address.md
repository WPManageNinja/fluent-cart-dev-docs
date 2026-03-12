---
title: Order Address Model
description: FluentCart OrderAddress model documentation with attributes, scopes, relationships, and methods.
---

# Order Address Model

| DB Table Name | {wp_db_prefix}_fct_order_addresses               |
| ------------- | ------------------------------------------------ |
| Schema        | [Check Schema](/database/schema#fct-order-addresses-table) |
| Source File   | fluent-cart/app/Models/OrderAddress.php          |
| Name Space    | FluentCart\App\Models                            |
| Class         | FluentCart\App\Models\OrderAddress               |

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key |
| order_id           | Integer   | Reference to order |
| type               | String    | Address type (billing, shipping) |
| name               | String    | Full name |
| address_1          | String    | Primary address line |
| address_2          | String    | Secondary address line |
| city               | String    | City |
| state              | String    | State/Province |
| postcode           | String    | Postal/ZIP code |
| country            | String    | Country code |
| meta               | JSON NULL | Additional address data (stores phone, company_name, label in `other_data`) |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Appended Attributes

The following virtual attributes are appended to every serialized response via `$appends`:

| Attribute          | Data Type    | Description |
| ------------------ | ------------ | ----------- |
| email              | String/Null  | Email from associated order's customer |
| first_name         | String/Null  | First part of name (split by space) |
| last_name          | String/Null  | Last part of name (split by space) |
| full_name          | String/Null  | Same as `name` attribute |
| formatted_address  | Array        | Full formatted address array with resolved country/state names |
| company_name       | String       | Company name stored in `meta.other_data.company_name` |
| phone              | String       | Phone number stored in `meta.other_data.phone` |
| label              | String       | Address label stored in `meta.other_data.label` |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$orderAddress = FluentCart\App\Models\OrderAddress::find(1);

$orderAddress->id; // returns id
$orderAddress->order_id; // returns order ID
$orderAddress->type; // returns address type
$orderAddress->name; // returns full name
$orderAddress->email; // returns email from order's customer
$orderAddress->first_name; // returns first name
$orderAddress->last_name; // returns last name
$orderAddress->full_name; // returns full name (alias for name)
$orderAddress->company_name; // returns company name from meta
$orderAddress->phone; // returns phone from meta
$orderAddress->label; // returns label from meta
$orderAddress->formatted_address; // returns formatted address array
```

## Relations

This model has the following relationships that you can use

### order

Access the associated order

* return `FluentCart\App\Models\Order` Model

#### Example:

```php
// Accessing Order
$order = $orderAddress->order;

// For Filtering by order relationship
$orderAddresses = FluentCart\App\Models\OrderAddress::whereHas('order', function($query) {
    $query->where('status', 'completed');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### setMetaAttribute($value)

Set meta from array/object (mutator). Automatically JSON-encodes the value.

* Parameters
   * $value - array|object|null
* Returns `void`

#### Usage

```php
$orderAddress->meta = ['other_data' => ['phone' => '555-1234', 'company_name' => 'Acme Inc']];
```

### getMetaAttribute($value)

Get meta as array (accessor). Automatically JSON-decodes the stored value.

* Parameters
   * $value - mixed
* Returns `array`

#### Usage

```php
$meta = $orderAddress->meta; // Returns array
```

### getFullNameAttribute()

Get full name (accessor). Returns the `name` attribute directly.

* Parameters
   * none
* Returns `string|null`

#### Usage

```php
$fullName = $orderAddress->full_name; // Returns full name
```

### getFirstNameAttribute()

Get first name (accessor). Splits `name` by space and returns the first part.

* Parameters
   * none
* Returns `string|null`

#### Usage

```php
$firstName = $orderAddress->first_name; // Returns first name
```

### getLastNameAttribute()

Get last name (accessor). Splits `name` by space and returns the last part.

* Parameters
   * none
* Returns `string|null`

#### Usage

```php
$lastName = $orderAddress->last_name; // Returns last name
```

### getEmailAttribute()

Get email address from associated order's customer (accessor).

* Parameters
   * none
* Returns `string|null`

#### Usage

```php
$email = $orderAddress->email; // Returns email from order's customer
```

### getCompanyNameAttribute()

Get company name from meta `other_data.company_name` (accessor).

* Parameters
   * none
* Returns `string`

#### Usage

```php
$companyName = $orderAddress->company_name; // Returns company name or empty string
```

### setCompanyNameAttribute($value)

Set company name in meta `other_data.company_name` (mutator). Skips if value is falsy.

* Parameters
   * $value - string|null
* Returns `void`

#### Usage

```php
$orderAddress->company_name = 'Acme Inc';
```

### getPhoneAttribute()

Get phone number from meta `other_data.phone` (accessor).

* Parameters
   * none
* Returns `string`

#### Usage

```php
$phone = $orderAddress->phone; // Returns phone number or empty string
```

### setPhoneAttribute($value)

Set phone number in meta `other_data.phone` (mutator). Skips if value is falsy.

* Parameters
   * $value - string|null
* Returns `void`

#### Usage

```php
$orderAddress->phone = '555-1234';
```

### getLabelAttribute()

Get address label from meta `other_data.label` (accessor).

* Parameters
   * none
* Returns `string`

#### Usage

```php
$label = $orderAddress->label; // Returns label or empty string
```

### setLabelAttribute($value)

Set address label in meta `other_data.label` (mutator). Skips if value is falsy.

* Parameters
   * $value - string|null
* Returns `void`

#### Usage

```php
$orderAddress->label = 'Home';
```

### getFormattedAddressAttribute()

Get formatted address as array (accessor). Delegates to `getFormattedAddress()`.

* Parameters
   * none
* Returns `array`

#### Usage

```php
$formattedAddress = $orderAddress->formatted_address; // Returns formatted address array
```

### getFormattedAddress($filtered = false)

Get formatted address with optional filtering. Returns an array including resolved country/state names, full address string, and all name/email/company fields.

* Parameters
   * $filtered - boolean (default: false) - When true, removes empty values from the address array
* Returns `array` - Keys: `country`, `state`, `city`, `postcode`, `address_1`, `address_2`, `type`, `name`, `first_name`, `last_name`, `full_name`, `email`, `company_name`, `label`, `full_address`

#### Usage

```php
$formattedAddress = $orderAddress->getFormattedAddress(true); // Returns filtered formatted address
```

### getAddressAsText($isHtml = false, $includeName = true, $separator = ', ')

Get address as formatted text string.

* Parameters
   * $isHtml - boolean (default: false)
   * $includeName - boolean (default: true)
   * $separator - string (default: ', ')
* Returns `string`

#### Usage

```php
$addressText = $orderAddress->getAddressAsText(false, true, ', '); // Returns: "John Doe, 123 Main St, New York, NY, 10001, US"
```

### getFormattedDataForCheckout($prefix = 'billing_')

Get address data formatted for checkout forms. Returns an associative array with prefixed keys suitable for pre-filling checkout fields. When prefix is `billing_`, the `billing_full_name` key is excluded.

* Parameters
   * $prefix - string (default: 'billing_')
* Returns `array` - Keys like `{prefix}address_id`, `{prefix}full_name`, `{prefix}address_1`, `{prefix}address_2`, `{prefix}city`, `{prefix}state`, `{prefix}phone`, `{prefix}postcode`, `{prefix}country`, `{prefix}company_name`

#### Usage

```php
$checkoutData = $orderAddress->getFormattedDataForCheckout('billing_');
// Returns: ['billing_address_id' => 1, 'billing_address_1' => '123 Main St', ...]

$shippingData = $orderAddress->getFormattedDataForCheckout('shipping_');
// Returns: ['shipping_address_id' => 1, 'shipping_full_name' => 'John Doe', ...]
```

## Address Types

Common address types in FluentCart:

- `billing` - Billing address for payment processing
- `shipping` - Shipping address for order fulfillment

## Usage Examples

### Get Order Addresses

```php
$order = FluentCart\App\Models\Order::find(123);
$addresses = $order->order_addresses;

foreach ($addresses as $address) {
    echo "Address Type: " . $address->type;
    echo "Name: " . $address->name;
    echo "Address: " . $address->getAddressAsText();
}
```

### Get Billing Address

```php
$billingAddress = FluentCart\App\Models\OrderAddress::where('order_id', 123)
    ->where('type', 'billing')
    ->first();
```

### Get Shipping Address

```php
$shippingAddress = FluentCart\App\Models\OrderAddress::where('order_id', 123)
    ->where('type', 'shipping')
    ->first();
```

### Create Order Address

```php
$orderAddress = FluentCart\App\Models\OrderAddress::create([
    'order_id' => 123,
    'type' => 'billing',
    'name' => 'John Doe',
    'address_1' => '123 Main Street',
    'city' => 'New York',
    'state' => 'NY',
    'postcode' => '10001',
    'country' => 'US'
]);
```

### Get Formatted Address

```php
$address = FluentCart\App\Models\OrderAddress::find(1);
$formattedText = $address->getAddressAsText();
// Returns: "John Doe, 123 Main Street, New York, NY, 10001, US"
```

### Get Checkout-Ready Data

```php
$address = FluentCart\App\Models\OrderAddress::find(1);
$billingData = $address->getFormattedDataForCheckout('billing_');
$shippingData = $address->getFormattedDataForCheckout('shipping_');
```

---
