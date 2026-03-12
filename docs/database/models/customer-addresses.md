---
title: Customer Addresses Model
description: FluentCart CustomerAddresses model documentation with attributes, scopes, relationships, and methods.
---

# Customer Addresses Model

| DB Table Name | {wp_db_prefix}_fct_customer_addresses               |
| ------------- | --------------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-customer-addresses-table) |
| Source File   | fluent-cart/app/Models/CustomerAddresses.php       |
| Name Space    | FluentCart\App\Models                              |
| Class         | FluentCart\App\Models\CustomerAddresses             |

## Traits

| Trait     | Description                            |
| --------- | -------------------------------------- |
| CanSearch | Provides `search()`, `groupSearch()`, `whereLike()`, `whereBeginsWith()`, `whereEndsWith()` query scopes |

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key |
| customer_id        | Integer   | Reference to customer |
| is_primary         | Boolean   | Whether this is the primary address |
| type               | String    | Address type (billing, shipping, etc.) |
| status             | String    | Address status (active, archived) |
| label              | String    | Address label/name |
| name               | String    | Full name |
| address_1          | String    | Primary address line |
| address_2          | String    | Secondary address line |
| city               | String    | City |
| state              | String    | State/Province |
| postcode           | String    | Postal/ZIP code |
| country            | String    | Country code |
| phone              | String    | Phone number |
| email              | String    | Email address |
| meta               | JSON NULL | Stored as JSON string, auto-encoded/decoded via mutator/accessor |
| company_name       | Virtual   | Stored inside `meta->other_data.company_name`, accessible as a virtual attribute via mutator/accessor |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Appended Attributes

The following attributes are appended to every model serialization (e.g. `toArray()`, `toJson()`):

| Attribute          | Type   | Description |
| ------------------ | ------ | ----------- |
| formatted_address  | Array  | Full formatted address with resolved country/state names, full address string, etc. |
| company_name       | String | Company name extracted from `meta->other_data.company_name` |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$customerAddress = FluentCart\App\Models\CustomerAddresses::find(1);

$customerAddress->id; // returns id
$customerAddress->customer_id; // returns customer ID
$customerAddress->is_primary; // returns primary status
$customerAddress->type; // returns address type
$customerAddress->company_name; // returns company name from meta
$customerAddress->formatted_address; // returns formatted address array
```

## Scopes

This model has the following scopes that you can use

### ofActive()

Filter active addresses

* Parameters
   * none

#### Usage:

```php
// Get all active addresses
$activeAddresses = FluentCart\App\Models\CustomerAddresses::ofActive()->get();
```

### ofArchived()

Filter archived addresses

* Parameters
   * none

#### Usage:

```php
// Get all archived addresses
$archivedAddresses = FluentCart\App\Models\CustomerAddresses::ofArchived()->get();
```

### search($params) <Badge type="tip" text="from CanSearch" />

Search addresses by parameters. Supports operators: `=`, `between`, `like_all`, `in`, `not_in`, `is_null`, `is_not_null`, and more.

* Parameters
   * `$params` (Array) - Search parameters

#### Usage:

```php
$addresses = FluentCart\App\Models\CustomerAddresses::search([
    'country' => ['value' => 'US', 'operator' => '=']
])->get();
```

## Relations

This model has the following relationships that you can use

### customer

Access the associated customer

* return `FluentCart\App\Models\Customer` Model (BelongsTo)

#### Example:

```php
// Accessing Customer
$customer = $customerAddress->customer;

// For Filtering by customer relationship
$customerAddresses = FluentCart\App\Models\CustomerAddresses::whereHas('customer', function($query) {
    $query->where('status', 'active');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### setMetaAttribute($value)

Set meta value with automatic JSON encoding (mutator). Called when setting `$address->meta = [...]`.

* Parameters
   * `$value` - mixed (array or other value)
* Returns `void`

#### Usage

```php
$customerAddress->meta = ['other_data' => ['company_name' => 'Acme Inc']];
// Automatically JSON encodes the value
```

### getMetaAttribute($value)

Get meta value with automatic JSON decoding (accessor). Called when accessing `$address->meta`.

* Parameters
   * `$value` - string (raw JSON from database)
* Returns `array`

#### Usage

```php
$meta = $customerAddress->meta; // Returns decoded array
```

### setCompanyNameAttribute($value)

Set the company name inside the `meta` JSON field at `other_data.company_name` (mutator). Called when setting `$address->company_name = '...'`.

* Parameters
   * `$value` - string
* Returns `void`

#### Usage

```php
$customerAddress->company_name = 'Acme Inc';
// Stores the value inside meta->other_data.company_name
```

### getCompanyNameAttribute()

Get the company name from the `meta` JSON field at `other_data.company_name` (accessor).

* Parameters
   * none
* Returns `string` (empty string if not set)

#### Usage

```php
$companyName = $customerAddress->company_name; // Returns company name or ''
```

### getFormattedAddressAttribute()

Get formatted address as array (accessor). This is an appended attribute available as `$address->formatted_address`.

* Parameters
   * none
* Returns `array`

The returned array contains:

| Key           | Description |
| ------------- | ----------- |
| country       | Full country name (resolved from country code) |
| state         | Full state name (resolved from state code) |
| city          | City |
| postcode      | Postal/ZIP code |
| address_1     | Primary address line |
| address_2     | Secondary address line |
| type          | Address type |
| name          | Full name |
| first_name    | First name |
| last_name     | Last name |
| full_name     | Full name |
| company_name  | Company name |
| label         | Address label |
| phone         | Phone number |
| full_address  | Comma-separated full address string |

#### Usage

```php
$formattedAddress = $customerAddress->formatted_address;
echo $formattedAddress['full_address']; // "Acme Inc, 123 Main St, New York, NY, United States"
echo $formattedAddress['country']; // "United States"
```

### getFormattedDataForCheckout($prefix)

Get address data formatted for checkout forms with a configurable field prefix.

* Parameters
   * `$prefix` - string (default: `'billing_'`)
* Returns `array`

The returned array keys are prefixed with the given `$prefix`:

| Key (with default prefix)       | Value |
| ------------------------------- | ----- |
| billing_full_name               | Name |
| billing_address_1               | Address line 1 |
| billing_address_2               | Address line 2 |
| billing_city                    | City |
| billing_state                   | State |
| billing_phone                   | Phone |
| billing_postcode                | Postcode |
| billing_country                 | Country |
| billing_company_name            | Company name |

#### Usage

```php
$billingData = $customerAddress->getFormattedDataForCheckout(); // Uses 'billing_' prefix
$shippingData = $customerAddress->getFormattedDataForCheckout('shipping_'); // Uses 'shipping_' prefix
```

## Usage Examples

### Get Customer Addresses

```php
$customer = FluentCart\App\Models\Customer::find(123);
$addresses = $customer->addresses;

foreach ($addresses as $address) {
    echo "Address Type: " . $address->type;
    echo "Label: " . $address->label;
    echo "Is Primary: " . ($address->is_primary ? 'Yes' : 'No');
}
```

### Get Active Addresses

```php
$activeAddresses = FluentCart\App\Models\CustomerAddresses::ofActive()->get();
```

### Get Primary Address

```php
$primaryAddress = FluentCart\App\Models\CustomerAddresses::where('customer_id', 123)
    ->where('is_primary', true)
    ->first();
```

### Create Customer Address

```php
$customerAddress = FluentCart\App\Models\CustomerAddresses::create([
    'customer_id' => 123,
    'is_primary' => true,
    'type' => 'billing',
    'status' => 'active',
    'label' => 'Home Address',
    'name' => 'John Doe',
    'address_1' => '123 Main Street',
    'city' => 'New York',
    'state' => 'NY',
    'postcode' => '10001',
    'country' => 'US',
    'phone' => '+1-555-123-4567',
    'email' => 'john@example.com',
    'company_name' => 'Acme Inc'
]);
```

### Get Formatted Address

```php
$address = FluentCart\App\Models\CustomerAddresses::find(1);
$formatted = $address->formatted_address;
// Returns array with formatted address components including full_address string
echo $formatted['full_address'];
```

### Get Checkout-Formatted Data

```php
$address = FluentCart\App\Models\CustomerAddresses::find(1);
$billingFields = $address->getFormattedDataForCheckout('billing_');
$shippingFields = $address->getFormattedDataForCheckout('shipping_');
```

### Archive Address

```php
$address = FluentCart\App\Models\CustomerAddresses::find(1);
$address->status = 'archived';
$address->save();
```

---
