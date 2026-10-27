---
title: Query Builder
description: FluentCart query builder documentation for advanced database queries and operations.
---

# FluentCart Query Builder

## Introduction

FluentCart uses an Eloquent-based ORM system compatible with Laravel's Eloquent ORM. You can interact with database tables through Model classes or using direct query builder methods.

::: tip TIP
FluentCart's ORM is compatible with Laravel Framework's Eloquent ORM. If you are familiar with Laravel's Eloquent, you will feel right at home using FluentCart's database system.
:::

Every query-builder example on this page uses `App::db()`, so each needs:

```php
use FluentCart\App\App;
```

::: warning Table names in raw SQL are not prefixed
`App::db()->table('fct_orders')` resolves the WordPress table prefix for you, but raw
fragments passed to `raw()`, `selectRaw()`, `whereRaw()` or `havingRaw()` are sent to
MySQL untouched. A raw fragment naming a table must interpolate the prefix itself:

```php
global $wpdb;
->whereRaw("{$wpdb->prefix}fct_order_items.order_id = {$wpdb->prefix}fct_orders.id")
```

Writing `fct_orders` in raw SQL fails with `Unknown column 'fct_orders.id'`.
:::

::: warning There is no global now() helper
FluentCart does not define `now()`. Use `DateTime::gmtNow()` from
`FluentCart\App\Services\DateTime\DateTime`, which returns UTC — all FluentCart
timestamps are stored in GMT.

```php
use FluentCart\App\Services\DateTime\DateTime;

DateTime::gmtNow()->format('Y-m-d H:i:s');            // now
DateTime::gmtNow()->modify('-1 day')->format('Y-m-d H:i:s');   // 24 hours ago
```
:::

### Example Using Models

Here is an example using FluentCart models:

```php
use FluentCart\App\Models\Order;

// Using the Order model
$orders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', ['2024-01-01 00:00:00', '2024-12-30 23:59:59'])
            ->when($customerId, function ($query) use ($customerId) {
                return $query->where('customer_id', $customerId);
            })
            ->orderBy('created_at', 'ASC')
            ->get();
```

### Example Using Query Builder

You can also use the query builder directly:

```php
use FluentCart\App\Models\Order;

$query = Order::query()
            ->select(['total_amount', 'status', 'payment_method'])
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', ['2024-01-01 00:00:00', '2024-12-30 23:59:59'])
            ->when($customerId, function ($query) use ($customerId) {
                return $query->where('customer_id', $customerId);
            })
            ->orderBy('created_at', 'ASC');
```

## Retrieving Results

### Retrieving All Rows From A Table

You can use the model's query builder to retrieve all rows from a table. The query builder provides a fluent interface for building database queries:

```php
<?php

use FluentCart\App\Models\Order;

class OrderController extends Controller
{
    /**
     * Show a list of all the application's orders.
     *
     * @return Response
     */
    public function index()
    {
        $orders = Order::all();
        // or using query builder
        $orders = Order::query()->get();

        return [
            'orders' => $orders
        ];   
    }
}
```

The `get` method returns a collection containing the results where each result is an instance of the Model object. You may access each column's value by accessing the column as a property of the object:

```php
foreach ($orders as $order) {
    echo $order->total_amount;
}
```

### Retrieving A Single Row / Column From A Table

If you just need to retrieve a single row from the database table, you may use the `first` method. This method will return a single Model object:

```php
use FluentCart\App\Models\Order;

$order = Order::where('status', 'completed')->first();

echo $order->total_amount;
```

If you don't even need an entire row, you may extract a single value from a record using the `value` method. This method will return the value of the column directly:

```php
use FluentCart\App\Models\Order;

$totalAmount = Order::where('status', 'completed')->value('total_amount');
```

### Retrieving A List Of Column Values

If you would like to retrieve an array containing the values of a single column, you may use the `pluck` method. In this example, we'll retrieve an array of order IDs:

```php
$orderIds = App::db()->table('fct_orders')->pluck('id');

foreach ($orderIds as $orderId) {
    echo $orderId;
}
```

You may also specify a custom key column for the returned Collection:

```php
$orderIds = App::db()->table('fct_orders')->pluck('id', 'customer_id');

foreach ($orderIds as $customerId => $orderId) {
    echo $orderId;
}
```

### Chunking Results

If you need to work with thousands of database records, consider using the `chunk` method. This method retrieves a small chunk of the results at a time and feeds each chunk into a Closure for processing. This method is very useful for process thousands of records. For example, let's work with the entire `fct_orders` table in chunks of 100 records at a time:

```php
App::db()->table('fct_orders')->orderBy('id')->chunk(100, function ($orders) {
    foreach ($orders as $order) {
        //
    }
});
```

You may stop further chunks from being processed by returning false from the Closure:

```php
App::db()->table('fct_orders')->orderBy('id')->chunk(100, function ($orders) {
    // Process the records...
    
    return false;
});
```

### Aggregates

The query builder also provides a variety of aggregate methods such as `count`, `max`, `min`, `avg`, and `sum`. You may call any of these methods after constructing your query:

```php
$orders = App::db()->table('fct_orders')->count();

$maxAmount = App::db()->table('fct_orders')->max('total_amount');
```

Of course, you may combine these methods with other clauses:

```php
$avgAmount = App::db()->table('fct_orders')
                ->where('payment_status', 'paid')
                ->avg('total_amount');
```

### Determining If Records Exist

Instead of using the `count` method to determine if any records exist that match your query's constraints, you may use the `exists`:

```php
return App::db()->table('fct_orders')->where('payment_status', 'paid')->exists();
```

## Selects

### Specifying A Select Clause

Of course, you may not always want to select all columns from a database table. Using the `select` method, you can specify a custom `select` clause for the query:

```php
$orders = App::db()->table('fct_orders')->select('status', 'total_amount as order_total')->get();
```

The `distinct` method allows you to force the query to return distinct results:

```php
$orders = App::db()->table('fct_orders')->distinct()->get();
```

If you already have a query builder instance and wish to add a column to its existing select clause, you may use the `addSelect` method:

```php
$query = App::db()->table('fct_orders')->select('status');

$orders = $query->addSelect('total_amount')->get();
```

## Raw Expressions

Sometimes you may need to use a raw expression in a query. To create a raw expression, you may use the `raw` method:

```php
$orders = App::db()->table('fct_orders')
                     ->select(App::db()->raw('count(*) as order_count, status'))
                     ->where('status', '<>', 'draft')
                     ->groupBy('status')
                     ->get();
```

### Raw Methods

Instead of using `App::db()->raw`, you may also use the following methods to insert a raw expression into various parts of your query.

#### `selectRaw`

The `selectRaw` method can be used in place of `select(App::db()->raw(...))`. This method accepts an optional array of bindings as its second argument:

```php
$orders = App::db()->table('fct_orders')
                ->selectRaw('total_amount * ? as price_with_tax', [1.0825])
                ->get();
```

#### `whereRaw / orWhereRaw`

The `whereRaw` and `orWhereRaw` methods can be used to inject a raw `where` clause into your query. These methods accept an optional array of bindings as their second argument:

```php
$orders = App::db()->table('fct_orders')
                ->whereRaw('total_amount > (subtotal * 1.1)')
                ->get();
```

#### `havingRaw / orHavingRaw`

The `havingRaw` and `orHavingRaw` methods may be used to set a raw string as the value of the `having` clause. These methods accept an optional array of bindings as their second argument:

```php
$orders = App::db()->table('fct_orders')
                ->select('customer_id', App::db()->raw('SUM(total_amount) as total'))
                ->groupBy('customer_id')
                ->havingRaw('SUM(total_amount) > ?', [1000])
                ->get();
```

#### `orderByRaw`

The `orderByRaw` method may be used to set a raw string as the value of the `order by` clause:

```php
$orders = App::db()->table('fct_orders')
                ->orderByRaw('FIELD(status, "pending", "processing", "completed")')
                ->get();
```

## Joins

### Inner Join Statement

The query builder may also be used to write join statements. To perform a basic "inner join", you may use the `join` method on a query builder instance. The first argument passed to the `join` method is the name of the table you need to join to, while the remaining arguments specify the column constraints for the join. Of course, as you can see, you can join to multiple tables in a single query:

```php
$orders = App::db()->table('fct_orders')
            ->join('fct_customers', 'fct_orders.customer_id', '=', 'fct_customers.id')
            ->join('fct_order_items', 'fct_orders.id', '=', 'fct_order_items.order_id')
            ->select('fct_orders.*', 'fct_customers.email', 'fct_customers.first_name')
            ->get();
```

### Left Join / Right Join Statement

If you would like to perform a "left join" instead of an "inner join", use the `leftJoin` method. The `leftJoin` method has the same signature as the `join` method:

```php
$orders = App::db()->table('fct_orders')
            ->leftJoin('fct_customers', 'fct_orders.customer_id', '=', 'fct_customers.id')
            ->get();
```

Similarly, you may use the `rightJoin` method to perform a "right join":

```php
$orders = App::db()->table('fct_orders')
            ->rightJoin('fct_customers', 'fct_orders.customer_id', '=', 'fct_customers.id')
            ->get();
```

### Cross Join Statement

To perform a "cross join" use the `crossJoin` method with the name of the table you wish to cross join to. Cross joins generate a cartesian product between the first table and the joined table:

```php
$products = App::db()->table('fct_product_details')
            ->crossJoin('fct_product_variations')
            ->get();
```

### Advanced Join Clauses

You may also specify more advanced join clauses. To get started, pass a `Closure` as the second argument into the `join` method. The `Closure` will receive a `JoinClause` object which allows you to specify constraints on the `join` clause:

```php
App::db()->table('fct_orders')
        ->join('fct_customers', function ($join) {
            $join->on('fct_orders.customer_id', '=', 'fct_customers.id')
                 ->where('fct_customers.status', '=', 'active');
        })
        ->get();
```

### Subquery Joins

You may use the `joinSub`, `leftJoinSub`, and `rightJoinSub` methods to join a query to a subquery. Each of these methods receive three arguments: the subquery, its table alias, and a Closure that defines the related columns:

```php
$latestOrders = App::db()->table('fct_orders')
        ->select('customer_id', App::db()->raw('MAX(created_at) as last_order_date'))
        ->groupBy('customer_id');

$customers = App::db()->table('fct_customers')
        ->joinSub($latestOrders, 'latest_orders', function ($join) {
            $join->on('fct_customers.id', '=', 'latest_orders.customer_id');
        })->get();
```

## Unions

The query builder also provides a quick way to "union" two or more queries together. For example, you may create an initial query and use the `union` method to union it with a second query:

```php
$first = App::db()->table('fct_orders')
            ->whereNull('completed_at');

$orders = App::db()->table('fct_orders')
            ->whereNull('cancelled_at')
            ->union($first)
            ->get();
```

The `unionAll` method may also be used and has the same method signature as `union`. The difference between `union` and `unionAll` is that `unionAll` will not remove duplicate entries from your resultset.

## Where Clauses

### Simple Where Clauses

You may use the `where` method on a query builder instance to add `where` clauses to the query. The most basic call to `where` requires three arguments. The first argument is the name of the column. The second argument is an operator, which can be any of the database's supported operators. Finally, the third argument is the value to evaluate against the column.

For example, here is a query that verifies the value of a "status" column equals "completed":

```php
$orders = App::db()->table('fct_orders')->where('status', '=', 'completed')->get();
```

For convenience, if you want to verify that a column is equal to a given value, you may pass the value directly as the second argument to the `where` method:

```php
$orders = App::db()->table('fct_orders')->where('status', 'completed')->get();
```

Of course, you may use a variety of other operators when writing a `where` clause:

```php
$orders = App::db()->table('fct_orders')->where('total_amount', '>', 1000)->get();

$orders = App::db()->table('fct_orders')->where('total_amount', '>=', 1000)->get();

$orders = App::db()->table('fct_orders')->where('total_amount', '<', 1000)->get();

$orders = App::db()->table('fct_orders')->where('total_amount', '<=', 1000)->get();

$orders = App::db()->table('fct_orders')->where('status', '!=', 'draft')->get();

$orders = App::db()->table('fct_orders')->where('status', '<>', 'draft')->get();
```

### Or Statements

You may chain where constraints together as well as add `or` clauses to the query. The `orWhere` method accepts the same arguments as the `where` method:

```php
$orders = App::db()->table('fct_orders')
                    ->where('status', 'completed')
                    ->orWhere('payment_status', 'paid')
                    ->get();
```

### Additional Where Clauses

#### whereBetween / orWhereBetween

The `whereBetween` method verifies that a column's value is between two values:

```php
$orders = App::db()->table('fct_orders')
                    ->whereBetween('total_amount', [100, 500])
                    ->get();
```

The `orWhereBetween` method verifies that a column's value is outside of two values:

```php
$orders = App::db()->table('fct_orders')
                    ->whereNotBetween('total_amount', [100, 500])
                    ->get();
```

#### whereIn / whereNotIn / orWhereIn / orWhereNotIn

The `whereIn` method verifies that a given column's value is contained within the given array:

```php
$orders = App::db()->table('fct_orders')
                    ->whereIn('status', ['pending', 'processing', 'completed'])
                    ->get();
```

The `whereNotIn` method verifies that the given column's value is not contained in the given array:

```php
$orders = App::db()->table('fct_orders')
                    ->whereNotIn('status', ['canceled', 'expired'])
                    ->get();
```

#### whereNull / whereNotNull / orWhereNull / orWhereNotNull

The `whereNull` method verifies that the value of the given column is `NULL`:

```php
$orders = App::db()->table('fct_orders')
                    ->whereNull('completed_at')
                    ->get();
```

The `whereNotNull` method verifies that the column's value is not `NULL`:

```php
$orders = App::db()->table('fct_orders')
                    ->whereNotNull('completed_at')
                    ->get();
```

#### whereDate / whereYear

The `whereDate` method may be used to compare a column's value against a date:

```php
$orders = App::db()->table('fct_orders')
                ->whereDate('created_at', '2024-12-31')
                ->get();
```

The `whereYear` method may be used to compare a column's value against a specific year:

```php
$orders = App::db()->table('fct_orders')
                ->whereYear('created_at', '2024')
                ->get();
```


### Parameter Grouping

Sometimes you may need to create more advanced where clauses such as "where exists" or nested parameter groupings. The FluentCart query builder can handle these as well. To get started, let's look at an example of grouping constraints within parenthesis:

```php
App::db()->table('fct_orders')
            ->where('status', '=', 'completed')
            ->where(function ($query) {
                $query->where('total_amount', '>', 1000)
                      ->orWhere('payment_method', '=', 'stripe');
            })
            ->get();
```

As you can see, passing a `Closure` into the `where` method instructs the query builder to begin a constraint group. The `Closure` will receive a query builder instance which you can use to set the constraints that should be contained within the parenthesis group. The example above will produce the following SQL:

```sql
select * from fct_orders where status = 'completed' and (total_amount > 1000 or payment_method = 'stripe')
```

### Where Exists Clauses

The `whereExists` method allows you to write `where exists` SQL clauses. The `whereExists` method accepts a `Closure` argument, which will receive a query builder instance allowing you to define the query that should be placed inside the "exists" clause:

```php
global $wpdb;

App::db()->table('fct_orders')
            ->whereExists(function ($query) use ($wpdb) {
                $query->select(App::db()->raw(1))
                      ->from('fct_order_items')
                      ->whereRaw("{$wpdb->prefix}fct_order_items.order_id = {$wpdb->prefix}fct_orders.id");
            })
            ->get();
```

The query above will produce the following SQL:

```sql
select * from fct_orders
where exists (
    select 1 from fct_order_items where fct_order_items.order_id = fct_orders.id
)
```

### Ordering, Grouping, Limit, & Offset

#### orderBy

The `orderBy` method allows you to sort the result of the query by a given column. The first argument to the `orderBy` method should be the column you wish to sort by, while the second argument controls the direction of the sort and may be either `asc` or `desc`:

```php
$orders = App::db()->table('fct_orders')
                 ->orderBy('created_at', 'DESC')
                ->get();
```

#### latest / oldest

The `latest` and `oldest` methods allow you to easily order results by date. By default, result will be ordered by the `created_at` column. Or, you may pass the column name that you wish to sort by:

```php
$orders = App::db()->table('fct_orders')
                 ->latest()
                ->get();
```


#### groupBy / having

The `groupBy` and `having` methods may be used to group the query results. The `having` method's signature is similar to that of the `where` method:

```php
$orders = App::db()->table('fct_orders')
                ->groupBy('customer_id')
                ->having('customer_id', '>', 100)
                ->get();
```

You may pass multiple arguments to the `groupBy` method to group by multiple columns:

```php
$orders = App::db()->table('fct_orders')
                ->groupBy('customer_id', 'status')
                ->having('customer_id', '>', 100)
                ->get();
```

#### skip / take

To limit the number of results returned from the query, or to skip a given number of results in the query, you may use the `skip` and `take` methods:

```php
$orders = App::db()->table('fct_orders')
                ->skip(10)
                ->take(5)
                ->get();
```

Alternatively, you may use the `limit` and `offset` methods:

```php
$orders = App::db()->table('fct_orders')
                ->limit(10)
                ->offset(5)
                ->get();
```

### Conditional Clauses

Sometimes you may want clauses to apply to a query only when something else is true. For instance, you may only want to apply a `where` statement if a given input value is present on the incoming request. You may accomplish this using `when` method:

```php
$customerId = $request->get('customer_id');

$orders = App::db()->table('fct_orders')
                ->when($customerId, function ($query, $customerId) {
                    return $query->where('customer_id', $customerId);
                })
                ->get();
```

The `when` method only executes the given `Closure` when the first parameter is `true`. If the first parameter is `false`, the Closure will not be executed.

You may pass another Closure as the third parameter to the `when` method. This Closure will execute if the first parameter evaluates as `false`. To illustrate how this feature may be used, we will use it to configure the default sorting of a query:

```php
$sortBy = null;

$orders = App::db()->table('fct_orders')
                ->when($sortBy, function ($query, $sortBy) {
                    return $query->orderBy($sortBy);
                }, function ($query) {
                    return $query->orderBy('created_at');
                })
                ->get();
```

## Inserts

The query builder also provides an `insert` method for inserting records into the database table. The `insert` method accepts an array of column names and values:

```php
App::db()->table('fct_orders')->insert(
    ['customer_id' => 1, 'status' => 'pending', 'total_amount' => 1000]
);
```

You may even insert several records into the table with a single call to `insert` by passing an array of arrays. Each array represents a row to be inserted into the table:

```php
App::db()->table('fct_orders')->insert([
    ['customer_id' => 1, 'status' => 'pending', 'total_amount' => 1000],
    ['customer_id' => 2, 'status' => 'processing', 'total_amount' => 2000]
]);
```

### Auto-Incrementing IDs

If the table has an auto-incrementing id, use the `insertGetId` method to insert a record and then retrieve the ID:

```php
App::db()->table('fct_orders')->insertGetId(
    ['customer_id' => 1, 'status' => 'pending', 'total_amount' => 1000]
);
```

## Updates

Of course, in addition to inserting records into the database, the query builder can also update existing records using the `update` method. The `update` method, like the `insert` method, accepts an array of column and value pairs containing the columns to be updated. You may constrain the `update` query using `where` clauses:

```php
App::db()->table('fct_orders')
            ->where('id', 1)
            ->update(['status' => 'completed']);
```

## Increment & Decrement

The query builder also provides convenient methods for incrementing or decrementing the value of a given column. This is useful for updating stock quantities or order counts.

Both of these methods accept at least one argument: the column to modify. A second argument may optionally be passed to control the amount by which the column should be incremented or decremented:

```php
// Decrement product stock when order is placed
App::db()->table('fct_product_variations')->decrement('available', 1);

// Increment the customer's purchase count (the column is purchase_count, not order_count)
App::db()->table('fct_customers')->increment('purchase_count');
```

You may also specify additional columns to update during the operation:

```php
App::db()->table('fct_product_variations')
    ->decrement('available', 1, ['updated_at' => DateTime::gmtNow()->format('Y-m-d H:i:s')]);
```

## Deletes

The query builder may also be used to delete records from the table via the `delete` method. You may constrain delete statements by adding where clauses before calling the `delete` method:

```php
App::db()->table('fct_orders')->delete();

App::db()->table('fct_orders')->where('status', 'draft')->delete();
```

If you wish to truncate the entire table, which will remove all rows and reset the auto-incrementing ID to zero, you may use the `truncate` method:

```php
App::db()->table('fct_orders')->truncate();
```

## FluentCart-Specific Query Examples

### Activity Logging Queries

```php
// Get all activities for a specific order
$orderActivities = App::db()->table('fct_activity')
    ->where('module_type', 'FluentCart\App\Models\Order')
    ->where('module_id', 123)
    ->orderBy('created_at', 'desc')
    ->get();

// Get failed activities in the last 24 hours.
// The logger writes info / success / warning / error — nothing writes 'failed'.
$failedActivities = App::db()->table('fct_activity')
    ->where('status', 'error')
    ->where('created_at', '>=', DateTime::gmtNow()->modify('-1 day')->format('Y-m-d H:i:s'))
    ->get();
```

### Attribute System Queries

```php
// Get all products with specific color attribute
$redProducts = App::db()->table('fct_atts_relations')
    ->join('fct_atts_terms', 'fct_atts_relations.term_id', '=', 'fct_atts_terms.id')
    ->join('fct_atts_groups', 'fct_atts_relations.group_id', '=', 'fct_atts_groups.id')
    ->where('fct_atts_groups.slug', 'color')
    ->where('fct_atts_terms.slug', 'red')
    ->pluck('object_id');

// Get all attribute groups with their terms
$attributeGroups = App::db()->table('fct_atts_groups')
    ->leftJoin('fct_atts_terms', 'fct_atts_groups.id', '=', 'fct_atts_terms.group_id')
    ->select('fct_atts_groups.*', 'fct_atts_terms.title as term_title')
    ->get();
```

### Label System Queries

```php
// Get all orders with 'featured' label
$featuredOrders = App::db()->table('fct_orders')
    ->join('fct_label_relationships', 'fct_orders.id', '=', 'fct_label_relationships.labelable_id')
    ->join('fct_label', 'fct_label_relationships.label_id', '=', 'fct_label.id')
    ->where('fct_label_relationships.labelable_type', 'FluentCart\App\Models\Order')
    ->where('fct_label.value', 'featured')
    ->get();

// Get all labels for a specific order
$orderLabels = App::db()->table('fct_label_relationships')
    ->join('fct_label', 'fct_label_relationships.label_id', '=', 'fct_label.id')
    ->where('fct_label_relationships.labelable_id', 123)
    ->where('fct_label_relationships.labelable_type', 'FluentCart\App\Models\Order')
    ->pluck('fct_label.value');
```

### Scheduled Actions Queries

```php
// Get all pending scheduled actions that are due
$dueActions = App::db()->table('fct_scheduled_actions')
    ->where('status', 'pending')
    ->where('scheduled_at', '<=', DateTime::gmtNow()->format('Y-m-d H:i:s'))
    ->orderBy('scheduled_at', 'asc')
    ->get();

// Get failed actions that need retry
$failedActions = App::db()->table('fct_scheduled_actions')
    ->where('status', 'failed')
    ->where('retry_count', '<', 3)
    ->get();
```

### Pro Licensing Queries

```php
// Get all active licenses for a customer
$customerLicenses = App::db()->table('fct_licenses')
    ->where('customer_id', 123)
    ->where('status', 'active')
    ->where('expiration_date', '>', DateTime::gmtNow()->format('Y-m-d H:i:s'))
    ->get();

// Get license activation count
$activationCount = App::db()->table('fct_license_activations')
    ->where('license_id', 456)
    ->where('status', 'active')
    ->count();

// Get all sites for a license.
// fct_license_sites has no license_id and no status column — reach it through
// fct_license_activations, which carries both license_id and site_id.
$licenseSites = App::db()->table('fct_license_sites')
    ->join('fct_license_activations', 'fct_license_sites.id', '=', 'fct_license_activations.site_id')
    ->where('fct_license_activations.license_id', 456)
    ->where('fct_license_activations.status', 'active')
    ->select(['fct_license_sites.id', 'fct_license_sites.site_url', 'fct_license_sites.server_version'])
    ->get();
```

### Webhook Logging Queries

::: warning fct_webhook_logger is not populated
The table is created by the migrator, but no code in FluentCart or FluentCart Pro reads
or writes it, so it stays empty and no `status` value is ever stored. The queries below
are kept for reference and will return no rows on a live store.
:::

```php
// Get failed webhook deliveries
$failedWebhooks = App::db()->table('fct_webhook_logger')
    ->where('status', 'failed')
    ->where('created_at', '>=', DateTime::gmtNow()->modify('-1 day')->format('Y-m-d H:i:s'))
    ->get();

// Get webhook delivery statistics
$webhookStats = App::db()->table('fct_webhook_logger')
    ->select('status', App::db()->raw('COUNT(*) as count'))
    ->where('created_at', '>=', DateTime::gmtNow()->modify('-1 week')->format('Y-m-d H:i:s'))
    ->groupBy('status')
    ->get();
```

### Complex E-commerce Queries

```php
// Get customer lifetime value with order count
$customerStats = App::db()->table('fct_customers')
    ->leftJoin('fct_orders', 'fct_customers.id', '=', 'fct_orders.customer_id')
    ->select([
        'fct_customers.id',
        'fct_customers.email',
        'fct_customers.first_name',
        'fct_customers.last_name',
        App::db()->raw("COUNT({$wpdb->prefix}fct_orders.id) as order_count"),
        App::db()->raw("SUM({$wpdb->prefix}fct_orders.total_amount) as total_spent"),
        App::db()->raw("AVG({$wpdb->prefix}fct_orders.total_amount) as avg_order_value")
    ])
    ->where('fct_orders.payment_status', 'paid')
    ->groupBy('fct_customers.id', 'fct_customers.email', 'fct_customers.first_name', 'fct_customers.last_name')
    ->having('order_count', '>', 0)
    ->get();

// Get product sales report with variations.
// total_amount and line_total are BIGINT cents; divide by 100 for display.
$productSales = App::db()->table('fct_order_items')
    ->join('fct_orders', 'fct_order_items.order_id', '=', 'fct_orders.id')
    ->leftJoin('fct_product_variations', 'fct_order_items.post_id', '=', 'fct_product_variations.post_id')
    ->select([
        'fct_order_items.post_id',
        'fct_product_variations.variation_title',
        App::db()->raw("SUM({$wpdb->prefix}fct_order_items.quantity) as total_sold"),
        App::db()->raw("SUM({$wpdb->prefix}fct_order_items.line_total) as total_revenue")
    ])
    ->where('fct_orders.payment_status', 'paid')
    ->groupBy('fct_order_items.post_id', 'fct_product_variations.variation_title')
    ->orderBy('total_revenue', 'desc')
    ->get();
```

---

