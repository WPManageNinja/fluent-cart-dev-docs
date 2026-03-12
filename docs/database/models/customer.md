---
title: Customer Model
description: FluentCart Customer model documentation with attributes, scopes, relationships, and methods.
---

# Customer Model

| DB Table Name | {wp_db_prefix}_fct_customers               |
| ------------- | ------------------------------------------ |
| Schema        | [Check Schema](/database/schema#fct-customers-table) |
| Source File   | fluent-cart/app/Models/Customer.php        |
| Name Space    | FluentCart\App\Models                       |
| Class         | FluentCart\App\Models\Customer              |

## Traits

| Trait           | Description |
| --------------- | ----------- |
| CanSearch        | Provides `search()`, `whereLike()`, `whereBeginsWith()`, `whereEndsWith()`, `groupSearch()` scopes for flexible query filtering |
| CanUpdateBatch   | Provides `batchUpdate()` scope for batch updating multiple records |

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer (BIGINT UNSIGNED) | Primary Key, Auto Increment |
| user_id            | Integer (BIGINT UNSIGNED) | WordPress user ID (nullable) |
| contact_id         | Integer (BIGINT UNSIGNED) | Contact ID (default 0) |
| email              | String (VARCHAR 192) | Customer email address |
| first_name         | String (VARCHAR 192) | Customer first name |
| last_name          | String (VARCHAR 192) | Customer last name |
| status             | String (VARCHAR 45) | Customer status (default: 'active') |
| purchase_value     | JSON      | Purchase value data (stored/retrieved as JSON) |
| purchase_count     | Integer (BIGINT UNSIGNED) | Number of purchases (default 0) |
| ltv                | Integer (BIGINT) | Lifetime value in cents (default 0) |
| first_purchase_date | Date Time | First purchase date (nullable) |
| last_purchase_date | Date Time | Last purchase date (nullable) |
| aov                | Decimal (18,2) | Average order value (nullable) |
| notes              | Text (LONGTEXT) | Customer notes |
| uuid               | String (VARCHAR 100) | Unique identifier (auto-generated on creation) |
| country            | String (VARCHAR 45) | Customer country code (nullable) |
| city               | String (VARCHAR 45) | Customer city (nullable) |
| state              | String (VARCHAR 45) | Customer state (nullable) |
| postcode           | String (VARCHAR 45) | Customer postcode (nullable) |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

### Appended Attributes

These virtual attributes are appended to every serialized Customer instance via the `$appends` property:

| Attribute         | Accessor Method               | Return Type | Description |
| ----------------- | ----------------------------- | ----------- | ----------- |
| full_name         | `getFullNameAttribute()`      | String      | Concatenation of first_name and last_name |
| photo             | `getPhotoAttribute()`         | String      | Custom photo URL from user meta, or Gravatar fallback |
| country_name      | `getCountryNameAttribute()`   | String      | Human-readable country name from country code |
| formatted_address | `getFormattedAddressAttribute()` | Array    | Formatted address data array |
| user_link         | `getUserLinkAttribute()`      | String      | WordPress admin user-edit URL (empty if no user_id) |

### Searchable Fields

The `$searchable` property defines which fields are used by the `searchBy` scope:

- `first_name`
- `last_name`
- `email`

### Mutators

| Mutator                      | Direction | Description |
| ---------------------------- | --------- | ----------- |
| `setPurchaseValueAttribute`  | Set       | Accepts array/object (JSON-encodes) or scalar value |
| `getPurchaseValueAttribute`  | Get       | Returns decoded JSON as array, or null if empty |

### Boot Behavior

On `creating`, the model auto-generates the `uuid` attribute using `md5($model->email . '_' . wp_generate_uuid4())`.

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$customer = FluentCart\App\Models\Customer::find(1);

$customer->id; // returns customer ID
$customer->email; // returns email address
$customer->first_name; // returns first name
$customer->last_name; // returns last name
$customer->status; // returns customer status
$customer->full_name; // returns "John Doe" (appended)
$customer->photo; // returns photo URL (appended)
$customer->country_name; // returns country name (appended)
$customer->formatted_address; // returns address array (appended)
$customer->user_link; // returns WP user edit URL (appended)
```

## Methods

Along with Global Model methods, this model has few helper methods.

### getFullNameAttribute()

Get customer full name by concatenating first_name and last_name.

* Returns `String` - Full name (first_name + last_name), trimmed

```php
$customer = FluentCart\App\Models\Customer::find(1);
$fullName = $customer->full_name; // returns "John Doe"
```

### getPhotoAttribute()

Get customer photo URL. First checks for a custom photo URL stored in user meta (`fc_customer_photo_url`). Falls back to Gravatar (100x100) if no custom photo is set.

* Returns `String` - Photo URL (custom or Gravatar)

```php
$customer = FluentCart\App\Models\Customer::find(1);
$photo = $customer->photo; // returns photo URL
```

### getCountryNameAttribute()

Get country name from country code using `Helper::getCountryName()`.

* Returns `String` - Country name

```php
$customer = FluentCart\App\Models\Customer::find(1);
$countryName = $customer->country_name; // returns country name
```

### getFormattedAddressAttribute()

Get formatted address as an associative array with resolved country and state names.

* Returns `Array` - Formatted address data with keys: `country`, `state`, `city`, `postcode`, `first_name`, `last_name`, `full_name`

```php
$customer = FluentCart\App\Models\Customer::find(1);
$address = $customer->formatted_address;
// [
//     'country'    => 'United States',
//     'state'      => 'California',
//     'city'       => 'San Francisco',
//     'postcode'   => '94102',
//     'first_name' => 'John',
//     'last_name'  => 'Doe',
//     'full_name'  => 'John Doe'
// ]
```

### getUserLinkAttribute()

Get WordPress user edit link. Returns empty string if the customer has no associated `user_id`.

* Returns `String` - User edit URL (e.g., `/wp-admin/user-edit.php?user_id=5`) or empty string

```php
$customer = FluentCart\App\Models\Customer::find(1);
$userLink = $customer->user_link; // returns user edit URL
```

### recountStats()

Recount customer order statistics. Sets `total_order_count` (count of all orders) and `total_order_value` (sum of `total_amount` across all orders) and saves the model.

* Returns `FluentCart\App\Models\Customer` - Updated customer instance

```php
$customer = FluentCart\App\Models\Customer::find(1);
$customer->recountStats();
```

### recountStat()

Recount detailed customer purchase statistics from successful payment orders only. Updates `purchase_count`, `first_purchase_date`, `last_purchase_date`, `ltv` (lifetime value as net paid minus refunds), and `aov` (average order value = ltv / purchase_count). Saves the model.

* Returns `FluentCart\App\Models\Customer` - Updated customer instance

```php
$customer = FluentCart\App\Models\Customer::find(1);
$customer->recountStat();
```

### updateCustomerStatus($newStatus)

Update customer status and fire action hooks. If the new status is the same as the current status, returns early without saving or firing hooks.

Fires the following WordPress action hooks:
- `fluent_cart/customer_status_to_{$newStatus}` - Status-specific hook
- `fluent_cart/customer_status_updated` - General status change hook

Both hooks receive an array with keys: `customer`, `old_status`, `new_status`.

* Parameters: `$newStatus` (String) - New status value
* Returns `FluentCart\App\Models\Customer` - Updated customer instance

```php
$customer = FluentCart\App\Models\Customer::find(1);
$customer->updateCustomerStatus('active');
```

### getWpUserId($recheck = false)

Get WordPress user ID. When `$recheck` is true, looks up the WordPress user by the customer's email and updates the stored `user_id` if it has changed.

* Parameters: `$recheck` (Boolean) - Whether to recheck by looking up the WP user by email (default: false)
* Returns `Integer|null` - WordPress user ID

```php
$customer = FluentCart\App\Models\Customer::find(1);
$wpUserId = $customer->getWpUserId();
$wpUserId = $customer->getWpUserId(true); // recheck and sync user_id
```

### getWpUser()

Get WordPress user object. First tries to find by `user_id`, then falls back to email lookup. If found by email and the `user_id` differs, updates the stored `user_id` and saves.

* Returns `WP_User|false` - WordPress user object or false if not found

```php
$customer = FluentCart\App\Models\Customer::find(1);
$wpUser = $customer->getWpUser();
```

### getMeta($metaKey, $default = null)

Get customer meta value from the `fct_customer_meta` table.

* Parameters: `$metaKey` (String) - Meta key, `$default` (Mixed) - Default value if not found (default: null)
* Returns `Mixed` - Meta value or default

```php
$customer = FluentCart\App\Models\Customer::find(1);
$metaValue = $customer->getMeta('custom_field', 'default');
```

### updateMeta($metaKey, $metaValue)

Create or update customer meta value in the `fct_customer_meta` table.

* Parameters: `$metaKey` (String) - Meta key, `$metaValue` (Mixed) - Meta value
* Returns `FluentCart\App\Models\CustomerMeta` - Meta instance (created or updated)

```php
$customer = FluentCart\App\Models\Customer::find(1);
$meta = $customer->updateMeta('custom_field', 'new_value');
```

## Relations

This model has the following relationships that you can use

### orders

Access the customer orders.

* Relation type: `HasMany`
* Returns collection of `FluentCart\App\Models\Order`
* Foreign key: `customer_id`

```php
$customer = FluentCart\App\Models\Customer::find(1);
$orders = $customer->orders;
```

### success_order_items

Access the successful order items (items from orders with successful payment statuses).

* Relation type: `HasManyThrough` (through `FluentCart\App\Models\Order`)
* Returns collection of `FluentCart\App\Models\OrderItem`
* Filters orders by successful payment statuses via `Status::getOrderPaymentSuccessStatuses()`

```php
$customer = FluentCart\App\Models\Customer::find(1);
$orderItems = $customer->success_order_items;
```

### subscriptions

Access the customer subscriptions.

* Relation type: `HasMany`
* Returns collection of `FluentCart\App\Models\Subscription`
* Foreign key: `customer_id`

```php
$customer = FluentCart\App\Models\Customer::find(1);
$subscriptions = $customer->subscriptions;
```

### shipping_address

Access the shipping addresses (filtered by type = 'shipping').

* Relation type: `HasMany`
* Returns collection of `FluentCart\App\Models\CustomerAddresses`
* Foreign key: `customer_id`

```php
$customer = FluentCart\App\Models\Customer::find(1);
$addresses = $customer->shipping_address;
```

### billing_address

Access the billing addresses (filtered by type = 'billing').

* Relation type: `HasMany`
* Returns collection of `FluentCart\App\Models\CustomerAddresses`
* Foreign key: `customer_id`

```php
$customer = FluentCart\App\Models\Customer::find(1);
$addresses = $customer->billing_address;
```

### primary_shipping_address

Access the primary shipping address (filtered by type = 'shipping' and is_primary = 1).

* Relation type: `HasOne`
* Returns `FluentCart\App\Models\CustomerAddresses|null`

```php
$customer = FluentCart\App\Models\Customer::find(1);
$address = $customer->primary_shipping_address;
```

### primary_billing_address

Access the primary billing address (filtered by type = 'billing' and is_primary = 1).

* Relation type: `HasOne`
* Returns `FluentCart\App\Models\CustomerAddresses|null`

```php
$customer = FluentCart\App\Models\Customer::find(1);
$address = $customer->primary_billing_address;
```

### labels

Access the customer labels (polymorphic relationship).

* Relation type: `MorphMany`
* Returns collection of `FluentCart\App\Models\LabelRelationship`

```php
$customer = FluentCart\App\Models\Customer::find(1);
$labels = $customer->labels;
```

### wpUser

Access the associated WordPress user.

* Relation type: `BelongsTo`
* Returns `FluentCart\App\Models\User|null`
* Foreign key: `user_id`

```php
$customer = FluentCart\App\Models\Customer::find(1);
$user = $customer->wpUser;
```

## Scopes

This model has the following scopes that you can use

### ofActive()

Get only active customers (where status = 'active').

```php
$customers = FluentCart\App\Models\Customer::ofActive()->get();
```

### ofArchived()

Get only archived customers (where status = 'archived').

```php
$customers = FluentCart\App\Models\Customer::ofArchived()->get();
```

### searchBy($search)

Search customers by query string. Supports multiple search modes:

- **Operator-based search**: `column_name > value`, `column_name = value`, etc. (supports `=`, `!=`, `>`, `<`)
- **Column-specific LIKE search**: `column_name:value` (searches with LIKE %value%)
- **Column-specific exact search**: `column_name=value`
- **General search**: Searches across `$searchable` fields (`first_name`, `last_name`, `email`) with LIKE matching. Also handles multi-word queries by splitting into first_name/last_name search.

* Parameters: `$search` (String) - Search query

```php
// General search across searchable fields
$customers = FluentCart\App\Models\Customer::searchBy('john')->get();

// Operator-based search
$customers = FluentCart\App\Models\Customer::searchBy('purchase_count > 5')->get();

// Column-specific LIKE search
$customers = FluentCart\App\Models\Customer::searchBy('email:example.com')->get();

// Full name search (splits "John Doe" into first_name + last_name)
$customers = FluentCart\App\Models\Customer::searchBy('John Doe')->get();
```

### applyCustomFilters($filters)

Apply custom filters using an associative array. Each filter key must be a fillable attribute. Supports operators: `includes` (LIKE), `not_includes` (NOT LIKE), `gt` (>), `lt` (<), and standard SQL operators.

* Parameters: `$filters` (Array) - Associative array of filter key => `['value' => ..., 'operator' => ...]`

```php
$customers = FluentCart\App\Models\Customer::applyCustomFilters([
    'status' => ['value' => 'active', 'operator' => '='],
    'email'  => ['value' => 'example.com', 'operator' => 'includes'],
    'ltv'    => ['value' => '1000', 'operator' => 'gt']
])->get();
```

### searchByFullName($data)

Search by concatenated full name (CONCAT(first_name, ' ', last_name)). Supports multiple matching operators.

* Parameters: `$data` (Array) - Search data with keys:
    - `value` (String) - The search term
    - `operator` (String) - One of `starts_with`, `ends_with`, `not_like`, or default (contains/like_all)

```php
$customers = FluentCart\App\Models\Customer::searchByFullName([
    'value' => 'John',
    'operator' => 'starts_with'
])->get();

$customers = FluentCart\App\Models\Customer::searchByFullName([
    'value' => 'Doe',
    'operator' => 'ends_with'
])->get();

$customers = FluentCart\App\Models\Customer::searchByFullName([
    'value' => 'Test User',
    'operator' => 'not_like'
])->get();
```

### Inherited Scopes from CanSearch Trait

These scopes are available via the `CanSearch` trait:

#### search($params)

Flexible search with multiple operators per column.

```php
$customers = FluentCart\App\Models\Customer::search([
    'email' => ['column' => 'email', 'operator' => 'like_all', 'value' => 'example.com'],
    'status' => ['column' => 'status', 'operator' => '=', 'value' => 'active']
])->get();
```

#### whereLike($column, $value)

WHERE column LIKE %value% query.

```php
$customers = FluentCart\App\Models\Customer::whereLike('email', 'example.com')->get();
```

#### whereBeginsWith($column, $value)

WHERE column LIKE value% query.

```php
$customers = FluentCart\App\Models\Customer::whereBeginsWith('first_name', 'Jo')->get();
```

#### whereEndsWith($column, $value)

WHERE column LIKE %value query.

```php
$customers = FluentCart\App\Models\Customer::whereEndsWith('email', '.com')->get();
```

#### groupSearch($groups)

Search across related models using dot notation.

```php
$customers = FluentCart\App\Models\Customer::groupSearch([
    'fct_customers.email' => ['column' => 'email', 'operator' => 'like_all', 'value' => 'test'],
])->get();
```

### Inherited Scope from CanUpdateBatch Trait

#### batchUpdate($values, $index = null)

Batch update multiple records at once.

```php
FluentCart\App\Models\Customer::batchUpdate([
    ['id' => 1, 'status' => 'active'],
    ['id' => 2, 'status' => 'archived'],
]);
```

## Usage Examples

### Creating a Customer

```php
use FluentCart\App\Models\Customer;

// uuid is auto-generated on creation
$customer = Customer::create([
    'email' => 'customer@example.com',
    'first_name' => 'John',
    'last_name' => 'Doe',
    'status' => 'active'
]);
```

### Retrieving Customers

```php
// Get all active customers
$customers = Customer::ofActive()->get();

// Get customer by email
$customer = Customer::where('email', 'customer@example.com')->first();

// Get customer with orders
$customer = Customer::with('orders')->find(1);

// Search customers
$customers = Customer::searchBy('john doe')->get();

// Get customers with custom filters
$customers = Customer::applyCustomFilters([
    'country' => ['value' => 'US', 'operator' => '=']
])->get();
```

### Updating a Customer

```php
$customer = Customer::find(1);
$customer->first_name = 'Jane';
$customer->save();

// Update status with hooks
$customer->updateCustomerStatus('archived');

// Recount purchase statistics
$customer->recountStat();
```

### Working with Meta

```php
$customer = Customer::find(1);

// Get meta
$value = $customer->getMeta('preferred_language', 'en');

// Set/update meta
$customer->updateMeta('preferred_language', 'fr');
```

### Deleting a Customer

```php
$customer = Customer::find(1);
$customer->delete();
```

---
