---
title: Model Relationships
description: FluentCart model relationships documentation with examples and usage patterns.
---

# Model Relationships

FluentCart uses Eloquent ORM relationships to establish connections between different models. Understanding these relationships is crucial for efficient data querying and manipulation.

## Relationship Types

FluentCart models use the following relationship types:

- **One-to-One** - Each model has one related model
- **One-to-Many** - One model has many related models
- **Many-to-Many** - Models can have multiple related models
- **Polymorphic** - Models can relate to multiple different model types

## Core Model Relationships

### Order Relationships

The Order model is central to FluentCart and has the most relationships:

```php
$order = Order::find(1);

$order->customer;          // belongsTo Customer
$order->order_items;       // hasMany OrderItem
$order->feeItems;          // order_items filtered to payment_type = 'fee'
$order->transactions;      // hasMany OrderTransaction
$order->orderMeta;         // hasMany OrderMeta
$order->subscriptions;     // hasMany Subscription (parent_order_id)
$order->billing_address;   // hasOne OrderAddress where type = billing
$order->activities;        // morphMany Activity, via the HasActivity trait
```

#### Order Model Relationships

| Relationship | Type | Related Model | Foreign Key | Local Key |
|-------------|------|---------------|-------------|-----------|
| customer | belongsTo | Customer | customer_id | id |
| order_items | hasMany | OrderItem | order_id | id |
| filteredOrderItems | hasMany | OrderItem | order_id | id |
| feeItems | hasMany | OrderItem | order_id | id |
| transactions | hasMany | OrderTransaction | order_id | id |
| orderMeta | hasMany | OrderMeta | order_id | id |
| orderTaxRates | hasMany | OrderTaxRate | order_id | id |
| appliedCoupons | hasMany | AppliedCoupon | order_id | id |
| usedCoupons | hasManyThrough | Coupon via AppliedCoupon | order_id | id |
| subscriptions | hasMany | Subscription | parent_order_id | id |
| parentOrder | belongsTo | Order | parent_id | id |
| children | hasMany | Order | parent_id | id |
| shipments | hasMany | Shipment | order_id | id |
| order_addresses | hasMany | OrderAddress | order_id | id |
| billing_address | hasOne | OrderAddress (type = billing) | order_id | id |
| shipping_address | hasOne | OrderAddress (type = shipping) | order_id | id |
| orderOperation | hasOne | OrderOperation | order_id | id |
| licenses | hasMany | License (Pro) | order_id | id |
| labels | morphMany | LabelRelationship | labelable | — |
| activities | morphMany | Activity (`module`) | module_id | id |

`feeItems` is `order_items()` narrowed to `payment_type = 'fee'`, so it is a relation you
can eager-load and constrain like any other.

`parentOrder` and `children` link orders to each other through `parent_id`. A
subscription's renewal invoices hang off the subscription's `parent_order_id` instead,
which is what `subscriptions` resolves.

### Customer Relationships

```php
$customer = Customer::find(1);

$customer->orders;                     // hasMany Order
$customer->subscriptions;              // hasMany Subscription
$customer->primary_billing_address;    // hasOne CustomerAddresses where type = billing
$customer->wpUser;                     // belongsTo the WordPress user, when linked
```

#### Customer Model Relationships

| Relationship | Type | Related Model | Foreign Key | Local Key |
|-------------|------|---------------|-------------|-----------|
| orders | hasMany | Order | customer_id | id |
| subscriptions | hasMany | Subscription | customer_id | id |
| success_order_items | hasManyThrough | OrderItem via Order | customer_id / order_id | id |
| billing_address | hasMany | CustomerAddresses (type = billing) | customer_id | id |
| shipping_address | hasMany | CustomerAddresses (type = shipping) | customer_id | id |
| primary_billing_address | hasOne | CustomerAddresses (type = billing) | customer_id | id |
| primary_shipping_address | hasOne | CustomerAddresses (type = shipping) | customer_id | id |
| wpUser | belongsTo | User (`wp_users`) | user_id | ID |
| labels | morphMany | LabelRelationship | labelable | — |

`wpUser` selects a fixed column list, so `user_pass` and `user_activation_key` never load.
Customer carries no cart or licence relation — query `Cart` by `customer_id` and `License`
by `customer_id` directly.

### Product Relationships

A product is a WordPress post, so its relations key off `ID`, not `product_id`:

```php
$product = Product::find(1);

$product->detail;              // hasOne ProductDetail
$product->variants;            // hasMany ProductVariation
$product->reviews;             // approved, top-level reviews
$product->downloadable_files;  // hasMany ProductDownload
```

#### Product Model Relationships

| Relationship | Type | Related Model | Foreign Key | Local Key |
|-------------|------|---------------|-------------|-----------|
| detail | hasOne | ProductDetail | post_id | ID |
| variants | hasMany | ProductVariation | post_id | ID |
| orderItems | hasMany | OrderItem | post_id | ID |
| downloadable_files | hasMany | ProductDownload | post_id | ID |
| reviews | hasMany | ProductReview (approved, top-level) | post_id | ID |
| integrations | hasMany | ProductMeta (object_type = product_integration) | object_id | ID |
| licensesMeta | hasOne | ProductMeta (meta_key = license_settings) | object_id | ID |
| postmeta | hasOne | PostMeta (gallery image) | post_id | ID |
| wp_terms | hasMany | TermRelationship | object_id | ID |
| wpTerms | hasManyThrough | TermTaxonomy via TermRelationship | object_id | ID |

Categories and tags come through the term relations rather than a `belongsToMany`. There
is no `variations` relation — it is `variants` — and no licence relation on Product.

### Subscription Relationships

```php
$subscription = Subscription::find(1);

$subscription->order;         // belongsTo the parent Order
$subscription->customer;      // belongsTo Customer
$subscription->transactions;  // hasMany OrderTransaction
$subscription->meta;          // hasMany SubscriptionMeta
```

#### Subscription Model Relationships

| Relationship | Type | Related Model | Foreign Key | Local Key |
|-------------|------|---------------|-------------|-----------|
| order | belongsTo | Order | parent_order_id | id |
| customer | belongsTo | Customer | customer_id | id |
| product | belongsTo | Product | product_id | ID |
| variation | belongsTo | ProductVariation | variation_id | id |
| transactions | hasMany | OrderTransaction | subscription_id | id |
| meta | hasMany | SubscriptionMeta | subscription_id | id |
| billing_addresses | hasMany | CustomerAddresses | customer_id | customer_id |
| labels | morphMany | LabelRelationship | labelable | — |
| activities | morphMany | Activity (`module`) | module_id | id |

A subscription points **up** to the order that created it through `parent_order_id`. Its
renewal invoices are orders in their own right — reach them from the parent order's
`children`, or query `Order` by `type = 'renewal'`.

## Pro Plugin Relationships

### License Relationships (Pro)

Licenses have relationships with multiple entities:

```php
// License belongs to one Customer
$license = License::find(1);
$customer = $license->customer;

// License belongs to one Product
$product = $license->product;

// License belongs to one Order
$order = $license->order;

// License belongs to one Subscription (optional)
$subscription = $license->subscription;

// License has many Activations
$activations = $license->activations;

// The variation it was issued for
$variation = $license->variation;
```

#### License Model Relationships

| Relationship | Type | Related Model | Foreign Key | Local Key |
|-------------|------|---------------|-------------|-----------|
| customer | belongsTo | Customer | customer_id | id |
| product | belongsTo | Product | product_id | ID |
| order | belongsTo | Order | order_id | id |
| subscription | belongsTo | Subscription | subscription_id | id |
| activations | hasMany | LicenseActivation | license_id | id |
| variation | belongsTo | ProductVariation | variation_id | id |
| productVariant | belongsTo | ProductVariation | variation_id | id |
| labels | morphMany | LabelRelationship | labelable | — |

Licence metadata lives in `fct_license_meta`, keyed by `object_id` and `object_type`;
query `LicenseMeta` directly. Activation sites are reached through
`activations` — `fct_license_sites` holds no `license_id` of its own.
| meta | hasMany | LicenseMeta | license_id | id |
| transactions | hasMany | LicenseTransaction | license_id | id |

## Relationship Usage Examples

### Eager Loading

Prevent N+1 queries by eager loading relationships:

```php
// Load orders with their customers and items
$orders = Order::with(['customer', 'items', 'transactions'])->get();

// Load customers with their orders and subscriptions
$customers = Customer::with(['orders', 'subscriptions'])->get();

// Load products with their variations
$products = Product::with(['variants'])->get();
```

### Querying with Relationships

Use relationships in queries:

```php
// Get orders for customers with specific email
$orders = Order::whereHas('customer', function($query) {
    $query->where('email', 'customer@example.com');
})->get();

// Get customers who have active subscriptions
$customers = Customer::whereHas('subscriptions', function($query) {
    $query->where('status', 'active');
})->get();

// Get products that have been ordered
$products = Product::whereHas('orderItems')->get();
```

### Filtering by Relationship Data

```php
// Get orders with total greater than $100
$orders = Order::whereHas('items', function($query) {
    $query->where('line_total', '>', 10000);
})->get();

// Get customers with orders in specific date range
$customers = Customer::whereHas('orders', function($query) {
    $query->whereBetween('created_at', ['2024-01-01', '2024-01-31']);
})->get();
```

### Counting Relationships

```php
// Get customers with order count
$customers = Customer::withCount('orders')->get();

// Get products with order item count
$products = Product::withCount('orderItems')->get();

// Get orders with item count
$orders = Order::withCount('items')->get();
```

### Complex Relationship Queries

```php
// Get customers with their latest order
$customers = Customer::with(['orders' => function($query) {
    $query->latest()->limit(1);
}])->get();

// Get orders with their customer's subscription status
$orders = Order::with(['customer.subscriptions' => function($query) {
    $query->where('status', 'active');
}])->get();

// Get products with their most recent order
$products = Product::with(['orderItems.order' => function($query) {
    $query->latest()->limit(1);
}])->get();
```

## Relationship Best Practices

### 1. Use Eager Loading

Always eager load relationships to prevent N+1 queries:

```php
// Bad - N+1 queries
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->customer->full_name; // N+1 query
}

// Good - Eager loading
$orders = Order::with('customer')->get();
foreach ($orders as $order) {
    echo $order->customer->full_name; // No additional queries
}
```

### 2. Use Specific Columns

Only load the columns you need:

```php
// Load only specific columns
$orders = Order::with(['customer:id,first_name,last_name,email'])->get();
```

### 3. Use Constraints

Apply constraints to relationships:

```php
// Load only active subscriptions
$customers = Customer::with(['subscriptions' => function($query) {
    $query->where('status', 'active');
}])->get();
```

### 4. Use Lazy Loading Wisely

Lazy load when you don't always need the relationship:

```php
$order = Order::find(1);

// Only load when needed
if ($needCustomer) {
    $customer = $order->customer;
}
```

### 5. Use Relationship Methods

Use relationship methods for complex queries:

```php
// Get orders for specific customer
$customer = Customer::find(1);
$orders = $customer->orders()->where('status', 'completed')->get();

// Get active subscriptions for customer
$activeSubscriptions = $customer->subscriptions()
    ->where('status', 'active')
    ->get();
```

## Common Relationship Patterns

### 1. Parent-Child Relationships

```php
// Order -> Order Items
$order = Order::find(1);
$items = $order->order_items;

// Customer -> Orders
$customer = Customer::find(1);
$orders = $customer->orders;
```

### 2. Many-to-Many Relationships

```php
// Product -> Categories
$product = Product::find(1);
$categories = $product->categories;

// Customer -> Products (through orders)
$customer = Customer::find(1);
$products = $customer->orders()->with('items.product')->get();
```

### 3. Polymorphic Relationships

Activity is polymorphic on `module`, so it stores `module_type` and `module_id`. Read it
from the owning model, which the `HasActivity` trait provides on `Order`, `Subscription`
and `Coupon`:

```php
$order->activities;          // morphMany Activity
$subscription->activities;
$coupon->activities;
```

Querying the table directly works too, with the real column names:

```php
$activities = Activity::where('module_type', Order::class)
    ->where('module_id', $order->id)
    ->get();
```

## Performance Considerations

### 1. Foreign key columns are already indexed

The migrations index the columns these relations join on — `fct_orders.customer_id`,
`fct_order_items.order_id`, `fct_subscriptions.customer_id` and the rest — so there is no
`ALTER TABLE` to run before eager-loading performs well. See
[Database Schema](/database/schema) for each table's index list.

### 2. Use Query Scopes

Create scopes for common relationship queries:

```php
// In Order model
public function scopeWithCustomer($query) {
    return $query->with('customer');
}

public function scopeWithItems($query) {
    return $query->with('order_items');
}

// Usage
$orders = Order::withCustomer()->withItems()->get();
```

### 3. Cache Relationship Data

Cache frequently accessed relationship data:

```php
// Cache customer orders
$customer = Customer::find(1);
$orders = Cache::remember("customer_{$customer->id}_orders", 3600, function() use ($customer) {
    return $customer->orders()->with('order_items')->get();
});
```

---

