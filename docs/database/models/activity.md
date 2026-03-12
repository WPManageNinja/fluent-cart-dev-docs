---
title: Activity Model
description: FluentCart Activity model documentation with attributes, scopes, relationships, and methods.
---

# Activity Model

| DB Table Name | {wp_db_prefix}_fct_activity               |
| ------------- | ----------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-activity-table) |
| Source File   | fluent-cart/app/Models/Activity.php        |
| Name Space    | FluentCart\App\Models                      |
| Class         | FluentCart\App\Models\Activity             |

## Traits

| Trait     | Description                            |
| --------- | -------------------------------------- |
| CanSearch | Provides `search()`, `groupSearch()`, `whereLike()`, `whereBeginsWith()`, `whereEndsWith()` query scopes |

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key (guarded) |
| status             | String    | Activity status (success, warning, failed, info) |
| log_type           | String    | Log type (activity, api, etc.) |
| module_id          | Integer   | Module ID (cast to integer) |
| module_type        | String    | Module type (full model path) |
| module_name        | String    | Module name (order, product, user, etc.) |
| title              | String    | Activity title |
| content            | Text      | Activity content |
| user_id            | Integer   | User ID |
| read_status        | String    | Read status (read, unread) |
| created_by         | String    | Created by (FCT-BOT, username) |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Casts

| Attribute  | Cast Type |
| ---------- | --------- |
| module_id  | integer   |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$activity = FluentCart\App\Models\Activity::find(1);

$activity->id; // returns activity ID
$activity->status; // returns activity status
$activity->title; // returns activity title
$activity->content; // returns activity content
$activity->module_name; // returns module name
$activity->module_id; // returns module ID (always cast to integer)
```

## Relations

This model has the following relationships that you can use

### activity

Access the parent activity model (polymorphic). Uses `module_type` and `module_id` columns for polymorphic resolution.

* Returns `MorphTo` - Polymorphic relationship

```php
$activity = FluentCart\App\Models\Activity::find(1);
$parentModel = $activity->activity; // Returns the related model (Order, Product, etc.)
```

### user

Access the user who performed the activity. Returns a limited set of columns (`ID`, `display_name`, `user_email`) for performance.

* Returns `FluentCart\App\Models\User` Model (HasOne via `user_id` -> `ID`)
* Selected columns: `ID`, `display_name`, `user_email`

```php
$activity = FluentCart\App\Models\Activity::find(1);
$user = $activity->user;

if ($user) {
    echo $user->display_name;
    echo $user->user_email;
}
```

## Scopes

This model has the following scopes that you can use

This model uses the `CanSearch` trait which provides search functionality.

### search($params) <Badge type="tip" text="from CanSearch" />

Search activities by parameters. Supports operators: `=`, `between`, `like_all`, `in`, `not_in`, `is_null`, `is_not_null`, and more.

* Parameters: `$params` (Array) - Search parameters

```php
$activities = FluentCart\App\Models\Activity::search([
    'status' => ['value' => 'success', 'operator' => '=']
])->get();

// Multiple search criteria
$activities = FluentCart\App\Models\Activity::search([
    'module_name' => ['value' => 'order', 'operator' => '='],
    'status' => ['value' => 'success', 'operator' => '=']
])->get();
```

## Usage Examples

### Creating an Activity

```php
use FluentCart\App\Models\Activity;

$activity = Activity::create([
    'status' => 'success',
    'log_type' => 'activity',
    'module_type' => 'FluentCart\App\Models\Order',
    'module_id' => 123,
    'module_name' => 'order',
    'user_id' => 1,
    'title' => 'Order Status Updated',
    'content' => 'Order status changed from pending to completed',
    'created_by' => 'admin'
]);
```

### Retrieving Activities

```php
// Get activity by ID
$activity = Activity::find(1);

// Get activities by status
$activities = Activity::where('status', 'success')->get();

// Get activities by module
$activities = Activity::where('module_name', 'order')->get();

// Get unread activities
$activities = Activity::where('read_status', 'unread')->get();
```

### Loading Activity with User

```php
$activity = Activity::with('user')->find(1);
echo $activity->user->display_name; // Only ID, display_name, user_email are loaded
```

### Updating an Activity

```php
$activity = Activity::find(1);
$activity->read_status = 'read';
$activity->save();
```

### Deleting an Activity

```php
$activity = Activity::find(1);
$activity->delete();
```

---
