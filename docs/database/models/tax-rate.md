---
title: Tax Rate Model
description: FluentCart TaxRate model documentation with attributes, scopes, relationships, and methods.
---

# Tax Rate Model

| DB Table Name | {wp_db_prefix}_fct_tax_rates               |
| ------------- | ----------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-tax-rates-table) |
| Source File   | fluent-cart/app/Models/TaxRate.php       |
| Name Space    | FluentCart\App\Models                     |
| Class         | FluentCart\App\Models\TaxRate             |

## Guarded & Fillable

This model uses both `$guarded` and `$fillable`:

- **Guarded:** `['id']`
- **Fillable:** `['class_id', 'country', 'state', 'postcode', 'city', 'rate', 'name', 'group', 'priority', 'is_compound', 'for_shipping', 'for_order']`

## Timestamps

This model has **timestamps disabled** (`$timestamps = false`). The `created_at` and `updated_at` columns are not automatically managed.

## Appended Attributes

The following computed attributes are automatically appended to the model's array/JSON output:

- `formatted_state` - Human-readable state name

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key (guarded) |
| class_id           | Integer   | Reference to tax class |
| country            | String    | Country code |
| state              | String    | State/Province code |
| postcode           | String    | Postal/ZIP code |
| city               | String    | City name |
| rate               | Decimal   | Tax rate percentage |
| name               | String    | Tax rate name |
| group              | String    | Tax group |
| priority           | Integer   | Priority order |
| is_compound        | Boolean   | Whether tax is compound |
| for_shipping       | Boolean   | Whether tax applies to shipping |
| for_order          | Boolean   | Whether tax applies to order |

::: warning No Timestamps
This model does not use automatic timestamps. There are no `created_at` or `updated_at` columns managed by the ORM.
:::

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$taxRate = FluentCart\App\Models\TaxRate::find(1);

$taxRate->id; // returns id
$taxRate->class_id; // returns class ID
$taxRate->country; // returns country code
$taxRate->state; // returns state code
$taxRate->rate; // returns tax rate
$taxRate->formatted_state; // returns formatted state name (appended attribute)
```

## Relations

This model has the following relationships that you can use

### tax_class

Access the associated tax class

* return `FluentCart\App\Models\TaxClass` Model

#### Example:

```php
// Accessing Tax Class
$taxClass = $taxRate->tax_class;

// For Filtering by tax class relationship
$taxRates = FluentCart\App\Models\TaxRate::whereHas('tax_class', function($query) {
    $query->where('title', 'Standard Tax');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### getFormattedStateAttribute()

Get formatted state name (accessor). Resolves the state code to its human-readable name using `AddressHelper::getStateNameByCode()`, using the model's `country` attribute for context.

* Parameters
   * none
* Returns `string` - Formatted state name, or empty string if state is empty

#### Usage

```php
$formattedState = $taxRate->formatted_state; // e.g., "California"
```

## Usage Examples

### Get Tax Rates

```php
$taxRate = FluentCart\App\Models\TaxRate::find(1);
echo "Name: " . $taxRate->name;
echo "Rate: " . $taxRate->rate . "%";
echo "Country: " . $taxRate->country;
echo "State: " . $taxRate->state;
echo "Formatted State: " . $taxRate->formatted_state;
```

### Create Tax Rate

```php
$taxRate = FluentCart\App\Models\TaxRate::create([
    'class_id' => 1,
    'country' => 'US',
    'state' => 'CA',
    'postcode' => '90210',
    'city' => 'Beverly Hills',
    'rate' => 8.75,
    'name' => 'California Sales Tax',
    'group' => 'sales_tax',
    'priority' => 1,
    'is_compound' => false,
    'for_shipping' => true,
    'for_order' => true
]);
```

### Get Tax Rates by Country

```php
$usTaxRates = FluentCart\App\Models\TaxRate::where('country', 'US')->get();
$caTaxRates = FluentCart\App\Models\TaxRate::where('country', 'CA')->get();
```

### Get Tax Rates by State

```php
$caTaxRates = FluentCart\App\Models\TaxRate::where('country', 'US')
    ->where('state', 'CA')
    ->get();
```

### Get Tax Rates with Tax Class

```php
$taxRates = FluentCart\App\Models\TaxRate::with('tax_class')->get();

foreach ($taxRates as $rate) {
    echo "Rate: " . $rate->name . " (" . $rate->rate . "%)";
    echo "Class: " . $rate->tax_class->title;
}
```

### Get Tax Rates by Priority

```php
$orderedTaxRates = FluentCart\App\Models\TaxRate::orderBy('priority', 'asc')->get();
```

### Get Compound Tax Rates

```php
$compoundTaxRates = FluentCart\App\Models\TaxRate::where('is_compound', true)->get();
$nonCompoundTaxRates = FluentCart\App\Models\TaxRate::where('is_compound', false)->get();
```

### Get Tax Rates for Shipping

```php
$shippingTaxRates = FluentCart\App\Models\TaxRate::where('for_shipping', true)->get();
```

### Get Tax Rates for Orders

```php
$orderTaxRates = FluentCart\App\Models\TaxRate::where('for_order', true)->get();
```

### Update Tax Rate

```php
$taxRate = FluentCart\App\Models\TaxRate::find(1);
$taxRate->update([
    'rate' => 9.25,
    'name' => 'Updated California Sales Tax'
]);
```

### Get Tax Rates by Postcode

```php
$postcodeTaxRates = FluentCart\App\Models\TaxRate::where('postcode', '90210')->get();
```

### Get Tax Rates by City

```php
$cityTaxRates = FluentCart\App\Models\TaxRate::where('city', 'Beverly Hills')->get();
```

### Delete Tax Rate

```php
$taxRate = FluentCart\App\Models\TaxRate::find(1);
$taxRate->delete();
```

### Get Tax Rates by Group

```php
$salesTaxRates = FluentCart\App\Models\TaxRate::where('group', 'sales_tax')->get();
$vatTaxRates = FluentCart\App\Models\TaxRate::where('group', 'vat')->get();
```

---
