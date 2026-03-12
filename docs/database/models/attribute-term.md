---
title: Attribute Term Model
description: FluentCart AttributeTerm model documentation with attributes, scopes, relationships, and methods.
---

# Attribute Term Model

| DB Table Name | {wp_db_prefix}_fct_atts_terms               |
| ------------- | ------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-atts-terms-table) |
| Source File   | fluent-cart/app/Models/AttributeTerm.php   |
| Name Space    | FluentCart\App\Models                       |
| Class         | FluentCart\App\Models\AttributeTerm         |

## Traits

- **CanSearch** (`FluentCart\App\Models\Concerns\CanSearch`) - Provides `search()`, `groupSearch()`, `whereLike()`, `whereBeginsWith()`, and `whereEndsWith()` query scopes.

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key |
| group_id           | Integer   | Reference to attribute group |
| serial             | Integer   | Serial number for ordering |
| title              | String    | Attribute term title (e.g., Red, Small, Large) |
| slug               | String    | Attribute term slug |
| description        | Text      | Attribute term description |
| settings           | JSON      | Attribute term settings |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$attributeTerm = FluentCart\App\Models\AttributeTerm::find(1);

$attributeTerm->id; // returns id
$attributeTerm->group_id; // returns group ID
$attributeTerm->serial; // returns serial number
$attributeTerm->title; // returns title
$attributeTerm->slug; // returns slug
$attributeTerm->description; // returns description
$attributeTerm->settings; // returns settings (auto-decoded from JSON)
```

## Scopes

This model has the following scopes that you can use

### applyCustomFilters($filters)

Apply custom filters to the query. Accepts filters for any fillable attribute (`group_id`, `serial`, `title`, `slug`, `description`, `settings`). Supported operators: `includes` (LIKE), `not_includes` (NOT LIKE), `gt` (>), `lt` (<), and standard SQL comparison operators.

* Parameters
   * $filters - array of filter arrays, each with `value` and `operator` keys

#### Usage:

```php
// Apply custom filters
$filteredTerms = FluentCart\App\Models\AttributeTerm::applyCustomFilters([
    'title' => ['value' => 'Red', 'operator' => 'includes'],
    'group_id' => ['value' => 1, 'operator' => '=']
])->get();
```

## Relations

This model has the following relationships that you can use

### group

Access the associated attribute group (`belongsTo`)

* return `FluentCart\App\Models\AttributeGroup` Model

#### Example:

```php
// Accessing Group
$group = $attributeTerm->group;

// For Filtering by group relationship
$attributeTerms = FluentCart\App\Models\AttributeTerm::whereHas('group', function($query) {
    $query->where('title', 'Color');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### setSettingsAttribute($value)

Set settings with automatic JSON encoding (mutator). If the value is an array or object, it is JSON-encoded with `JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES` flags.

* Parameters
   * $value - mixed (array, object, or string)
* Returns `void`

#### Usage

```php
$attributeTerm->settings = ['color_code' => '#FF0000', 'display_order' => 1];
// Automatically JSON encodes arrays and objects
```

### getSettingsAttribute($value)

Get settings with automatic JSON decoding (accessor). If the stored value is a string, it attempts to JSON-decode it. Returns the original string if decoding fails.

* Parameters
   * $value - mixed
* Returns `mixed`

#### Usage

```php
$settings = $attributeTerm->settings; // Returns decoded value (array, object, or string)
```

## Usage Examples

### Get Attribute Terms

```php
$attributeTerm = FluentCart\App\Models\AttributeTerm::find(1);
echo "Title: " . $attributeTerm->title;
echo "Slug: " . $attributeTerm->slug;
echo "Group ID: " . $attributeTerm->group_id;
```

### Create Attribute Term

```php
$attributeTerm = FluentCart\App\Models\AttributeTerm::create([
    'group_id' => 1,
    'serial' => 1,
    'title' => 'Red',
    'slug' => 'red',
    'description' => 'Red color variant',
    'settings' => [
        'color_code' => '#FF0000',
        'display_order' => 1,
        'is_default' => false
    ]
]);
```

### Get Terms by Group

```php
$colorTerms = FluentCart\App\Models\AttributeTerm::where('group_id', 1)->get();
$sizeTerms = FluentCart\App\Models\AttributeTerm::where('group_id', 2)->get();
```

### Get Terms with Group Information

```php
$attributeTerms = FluentCart\App\Models\AttributeTerm::with('group')->get();

foreach ($attributeTerms as $term) {
    echo "Term: " . $term->title;
    echo "Group: " . $term->group->title;
}
```

### Apply Custom Filters

```php
$filters = [
    'title' => ['value' => 'Red', 'operator' => 'includes'],
    'group_id' => ['value' => 1, 'operator' => '=']
];

$filteredTerms = FluentCart\App\Models\AttributeTerm::applyCustomFilters($filters)->get();
```

### Get Terms Ordered by Serial

```php
$orderedTerms = FluentCart\App\Models\AttributeTerm::where('group_id', 1)
    ->orderBy('serial', 'asc')
    ->get();
```

### Update Attribute Term

```php
$attributeTerm = FluentCart\App\Models\AttributeTerm::find(1);
$attributeTerm->update([
    'title' => 'Bright Red',
    'settings' => ['color_code' => '#CC0000', 'display_order' => 2]
]);
```

### Get Terms with Settings

```php
$termsWithSettings = FluentCart\App\Models\AttributeTerm::where('group_id', 1)->get();

foreach ($termsWithSettings as $term) {
    $settings = $term->settings;
    if (isset($settings['color_code'])) {
        echo "Term: " . $term->title . " - Color: " . $settings['color_code'];
    }
}
```

### Use CanSearch Trait Scopes

```php
// Search with the search scope (from CanSearch trait)
$terms = FluentCart\App\Models\AttributeTerm::search([
    'title' => ['column' => 'title', 'operator' => 'like_all', 'value' => 'Red']
])->get();

// Use whereLike scope
$terms = FluentCart\App\Models\AttributeTerm::whereLike('title', 'Re')->get();
```

---
