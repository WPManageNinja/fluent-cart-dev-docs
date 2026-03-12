---
title: Tax Class Model
description: FluentCart TaxClass model documentation with attributes, scopes, relationships, and methods.
---

# Tax Class Model

| DB Table Name | {wp_db_prefix}_fct_tax_classes               |
| ------------- | -------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-tax-classes-table) |
| Source File   | fluent-cart/app/Models/TaxClass.php         |
| Name Space    | FluentCart\App\Models                        |
| Class         | FluentCart\App\Models\TaxClass               |

## Guarded & Fillable

This model uses both `$guarded` and `$fillable`:

- **Guarded:** `['id']`
- **Fillable:** `['title', 'description', 'meta', 'slug']`

## Lifecycle Hooks (booted)

The model registers lifecycle hooks in the `booted()` method:

- **Creating:** Automatically generates a unique slug from `title` via `generateUniqueSlug()`.
- **Updating:** If `title` has changed (is dirty), the slug is regenerated to match the new title.

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key (guarded) |
| title              | String    | Tax class title |
| description        | Text      | Tax class description |
| meta               | JSON      | Additional metadata (manual JSON mutator/accessor) |
| slug               | String    | URL-friendly slug (auto-generated from title) |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$taxClass = FluentCart\App\Models\TaxClass::find(1);

$taxClass->id; // returns id
$taxClass->title; // returns title
$taxClass->description; // returns description
$taxClass->slug; // returns slug
$taxClass->meta; // returns array (accessor)
```

## Methods

Along with Global Model methods, this model has few helper methods.

### setMetaAttribute($value)

Set meta with automatic JSON encoding (mutator). Encodes the value with `json_encode()`. Falls back to `'[]'` if encoding fails or value is falsy.

* Parameters
   * $value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$taxClass->meta = ['tax_rate' => 8.5, 'exempt_products' => [1, 2, 3]];
// Automatically JSON encodes arrays and objects
```

### getMetaAttribute($value)

Get meta with automatic JSON decoding (accessor). Decodes the stored JSON string into an associative array.

* Parameters
   * $value - mixed
* Returns `array` - Decoded array, or empty array if value is falsy

#### Usage

```php
$meta = $taxClass->meta; // Returns decoded array
```

### generateUniqueSlug($title, $ignoreId = null)

Generate unique slug for tax class (protected static method). Uses `Str::slug()` to create a URL-friendly slug from the title, then appends a numeric suffix if the slug already exists. Falls back to `'tax-class'` as the base slug if `Str::slug()` returns empty.

This method is called automatically by the model's lifecycle hooks -- you typically do not need to call it directly.

* Parameters
   * $title - string
   * $ignoreId - integer|null (default: null) - Exclude this ID when checking for uniqueness (used during updates)
* Returns `string`

::: info Note
This method is `protected static`, so it is not callable from outside the model class. Slug generation happens automatically on create and on update (when the title changes).
:::

## Usage Examples

### Get Tax Classes

```php
$taxClass = FluentCart\App\Models\TaxClass::find(1);
echo "Title: " . $taxClass->title;
echo "Description: " . $taxClass->description;
echo "Slug: " . $taxClass->slug;
```

### Create Tax Class

```php
$taxClass = FluentCart\App\Models\TaxClass::create([
    'title' => 'Standard Tax',
    'description' => 'Standard tax rate for most products',
    'meta' => [
        'tax_rate' => 8.5,
        'exempt_products' => [],
        'applicable_regions' => ['US', 'CA']
    ]
]);
// Slug will be automatically generated as "standard-tax"
```

### Get All Tax Classes

```php
$taxClasses = FluentCart\App\Models\TaxClass::all();

foreach ($taxClasses as $class) {
    echo "Class: " . $class->title . " (" . $class->slug . ")";
}
```

### Get Tax Class by Slug

```php
$taxClass = FluentCart\App\Models\TaxClass::where('slug', 'standard-tax')->first();
```

### Update Tax Class

```php
$taxClass = FluentCart\App\Models\TaxClass::find(1);
$taxClass->update([
    'title' => 'Updated Tax Class',
    'description' => 'Updated description',
    'meta' => ['tax_rate' => 9.0, 'updated' => true]
]);
// Slug will be automatically updated if title changes
```

### Get Tax Classes with Meta

```php
$taxClasses = FluentCart\App\Models\TaxClass::all();

foreach ($taxClasses as $class) {
    $meta = $class->meta;
    if (isset($meta['tax_rate'])) {
        echo "Class: " . $class->title . " - Rate: " . $meta['tax_rate'] . "%";
    }
}
```

### Search Tax Classes

```php
$searchResults = FluentCart\App\Models\TaxClass::where('title', 'like', '%Standard%')->get();
```

### Delete Tax Class

```php
$taxClass = FluentCart\App\Models\TaxClass::find(1);
$taxClass->delete();
```

### Get Tax Classes Ordered by Title

```php
$orderedClasses = FluentCart\App\Models\TaxClass::orderBy('title', 'asc')->get();
```

### Automatic Slug Generation

```php
// Creating a class with a duplicate title auto-generates a unique slug
$taxClass1 = FluentCart\App\Models\TaxClass::create(['title' => 'Sales Tax']);
// slug: "sales-tax"

$taxClass2 = FluentCart\App\Models\TaxClass::create(['title' => 'Sales Tax']);
// slug: "sales-tax-2"
```

---
