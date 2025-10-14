---
title: Database
description: FluentCart database schema documentation including table structures, models, and query builder.
---

# FluentCart Database

FluentCart uses a combination of custom database tables and WordPress's existing structure to store e-commerce data. The plugin creates custom tables with the `fct_` prefix for e-commerce specific data while leveraging WordPress's `posts` table for products.

## Database Architecture

FluentCart uses a custom database schema built on top of WordPress's existing database structure. The plugin creates its own tables with the `fct_` prefix to store e-commerce specific data.

### Key Features

- **Custom Tables** - E-commerce specific data storage with `fct_` prefix
- **WordPress Integration** - Products stored in WordPress `posts` table
- **Framework ORM** - Custom ORM based on Laravel Eloquent patterns
- **Relationship Mapping** - Complex data relationships between models
- **Migration System** - Version-controlled schema updates
- **Meta Support** - Flexible metadata storage for orders, customers, etc.

## Database Tables

FluentCart creates the following database tables:

### Core Tables
- `fct_orders` - Order management and tracking
- `fct_order_items` - Order line items and product details  
- `fct_order_meta` - Order metadata and custom fields
- `fct_order_transactions` - Payment transactions and gateway responses
- `fct_customers` - Customer profiles and purchase history
- `fct_customer_meta` - Customer metadata and custom fields
- `fct_customer_addresses` - Customer address management
- `fct_subscriptions` - Subscription management and recurring payments
- `fct_subscription_meta` - Subscription metadata
- `fct_carts` - Shopping cart sessions (primary key: `cart_hash`)
- `fct_coupons` - Coupon codes and discount management
- `fct_applied_coupons` - Applied coupon tracking
- `fct_activity` - Activity tracking and audit logs

### Product & Attribute Tables
- `fct_product_details` - Product details and configurations
- `fct_product_meta` - Product metadata
- `fct_product_variations` - Product variations
- `fct_product_downloads` - Digital product download permissions
- `fct_atts_groups` - Attribute groups
- `fct_atts_terms` - Attribute terms
- `fct_atts_relations` - Attribute object relations

### Shipping & Tax Tables
- `fct_shipping_zones` - Shipping zone management
- `fct_shipping_methods` - Shipping method configurations
- `fct_shipping_classes` - Product shipping classes
- `fct_tax_classes` - Tax class definitions
- `fct_tax_rates` - Tax rate configurations
- `fct_order_tax_rates` - Order-specific tax rates

### Additional Tables
- `fct_order_addresses` - Order billing and shipping addresses
- `fct_order_download_permissions` - Digital product download permissions
- `fct_order_operations` - Order operation logs
- `fct_labels` - Customer labeling system
- `fct_label_relationships` - Label-customer relationships
- `fct_scheduled_actions` - Background job scheduling
- `fct_webhook_logger` - Webhook logging
- `fct_meta` - General metadata storage

### WordPress Integration
- `posts` - Products stored as custom post type `fc_product`
- `postmeta` - Product metadata and custom fields

### Pro Plugin Tables
- `fct_licenses` - Software license management
- `fct_license_meta` - License metadata and custom fields
- `fct_license_activations` - License activation tracking
- `fct_license_sites` - Licensed site management
- `fct_order_promotions` - Order bump and promotional features
- `fct_order_promotion_stats` - Order promotion statistics and tracking

*[View Complete Schema →](./schema)*

## Database Models

FluentCart uses Eloquent ORM for database operations. Here are the main models:

### Core Models

#### Order Management
- [Order Model](./models/order) - Order management and processing
- [Order Item Model](./models/order-item) - Order line items and fulfillment
- [Order Meta Model](./models/order-meta) - Order metadata and custom fields
- [Order Transaction Model](./models/order-transaction) - Payment transactions and refunds
- [Order Address Model](./models/order-address) - Order shipping and billing addresses
- [Order Operation Model](./models/order-operation) - Order operation logs and analytics
- [Order Tax Rate Model](./models/order-tax-rate) - Tax calculations for orders
- [Order Download Permission Model](./models/order-download-permission) - Download permissions

#### Customer Management
- [Customer Model](./models/customer) - Customer data and management
- [Customer Addresses Model](./models/customer-addresses) - Customer address management
- [Customer Meta Model](./models/customer-meta) - Customer metadata storage

#### Product Management
- [Product Model](./models/product) - Product catalog and variations
- [Product Detail Model](./models/product-detail) - Product configuration and details
- [Product Variation Model](./models/product-variation) - Product variations and options
- [Product Meta Model](./models/product-meta) - Product metadata storage
- [Product Download Model](./models/product-download) - Downloadable products management

#### Subscription Management
- [Subscription Model](./models/subscription) - Subscription management
- [Subscription Meta Model](./models/subscription-meta) - Subscription metadata

#### Cart & Coupon Management
- [Cart Model](./models/cart) - Shopping cart and session management
- [Coupon Model](./models/coupon) - Coupon and discount management
- [Applied Coupon Model](./models/applied-coupon) - Applied coupons tracking

#### System Models
- [Activity Model](./models/activity) - Activity tracking and logging
- [Scheduled Action Model](./models/scheduled-action) - Background job scheduling
- [Meta Model](./models/meta) - Generic metadata storage system
- [User Model](./models/user) - WordPress user integration
- [Dynamic Model](./models/dynamic-model) - Dynamic model functionality

#### Attribute System
- [Attribute Group Model](./models/attribute-group) - Attribute groups (Color, Size, etc.)
- [Attribute Term Model](./models/attribute-term) - Attribute terms within groups
- [Attribute Relation Model](./models/attribute-relation) - Attribute relationships

#### Shipping & Tax
- [Shipping Zone Model](./models/shipping-zone) - Shipping zones and regions
- [Shipping Method Model](./models/shipping-method) - Shipping methods and rates
- [Shipping Class Model](./models/shipping-class) - Shipping classes and rules
- [Tax Class Model](./models/tax-class) - Tax classes and categories
- [Tax Rate Model](./models/tax-rate) - Tax rates and calculations

#### Label System
- [Label Model](./models/label) - Customer labeling system
- [Label Relationship Model](./models/label-relationship) - Polymorphic label relationships

### Pro Plugin Models

#### Licensing
- [License Model](./models/license) - License management (Pro)
- [License Meta Model](./models/license-meta) - License metadata (Pro)
- [License Activation Model](./models/license-activation) - License activations (Pro)
- [License Site Model](./models/license-site) - Licensed sites (Pro)

#### Promotional
- [Order Promotion Model](./models/order-promotion) - Order promotions and order bumps (Pro)
- [Order Promotion Stat Model](./models/order-promotion-stat) - Promotion statistics (Pro)

#### User Management
- [User Meta Model](./models/user-meta) - User metadata (Pro)

*[View All Models →](./models)*

## Query Builder

FluentCart provides a powerful query builder based on Laravel's Eloquent ORM:

- **Fluent Syntax** - Chainable query methods
- **Relationship Loading** - Eager loading and lazy loading
- **Scopes** - Reusable query constraints
- **Accessors/Mutators** - Data transformation
- **Events** - Model lifecycle hooks

*[View Query Builder Guide →](./query-builder)*

## Quick Start

### Basic Model Usage

```php
use FluentCart\App\Models\Order;
use FluentCart\App\Models\Customer;

// Get all orders
$orders = Order::all();

// Get order with relationships
$order = Order::with(['customer', 'items', 'transactions'])->find(1);

// Create new order
$order = Order::create([
    'customer_id' => 1,
    'status' => 'pending',
    'total' => 9999
]);
```

### Query Examples

```php
// Get orders by status
$completedOrders = Order::where('status', 'completed')->get();

// Get orders with specific customer
$customerOrders = Order::whereHas('customer', function($query) {
    $query->where('email', 'customer@example.com');
})->get();

// Get orders with total greater than $100
$highValueOrders = Order::where('total', '>', 10000)->get();
```

## Database Relationships

FluentCart models have complex relationships:

- **Orders** → Customers, Order Items, Transactions, Meta
- **Products** → Variations, Categories, Meta
- **Subscriptions** → Customers, Orders, Transactions
- **Customers** → Orders, Subscriptions, Activities

*[View Relationship Documentation →](./models)*

## Migration System

FluentCart includes a robust migration system:

- **Version Control** - Track schema changes
- **Rollback Support** - Revert changes if needed
- **Data Seeding** - Populate initial data
- **Index Management** - Optimize query performance

## Best Practices

1. **Use Relationships** - Leverage Eloquent relationships for efficient queries
2. **Eager Loading** - Use `with()` to prevent N+1 queries
3. **Scopes** - Create reusable query constraints
4. **Indexing** - Add indexes for frequently queried columns
5. **Meta Usage** - Use meta tables for flexible data storage

## Related Documentation

- [Database Schema](/database/schema) - Complete table structure and relationships
- [Database Models](/database/models) - Detailed model documentation
- [Model Relationships](/database/models/relationships) - How models connect
- [Query Builder](/database/query-builder) - Advanced query techniques
- [Developer Hooks](/hooks/) - Database-related hooks and filters
- [REST API](/api/) - API endpoints for database operations

## Next Steps

Continue your database journey:

1. **[Database Schema](/database/schema)** - Understand table structures
2. **[Core Models](/database/models/order)** - Start with Order model
3. **[Model Relationships](/database/models/relationships)** - Learn data connections
4. **[Query Builder](/database/query-builder)** - Advanced querying techniques

## Support

For database-related questions:

- Check the [Schema Documentation](./schema) for table structures
- Review [Model Documentation](./models) for usage examples
- Consult [Query Builder Guide](./query-builder) for advanced queries
- Visit [GitHub Issues](https://github.com/fluentcart/issues) for technical support
- Join [Developer Community](https://community.fluentcart.com) for discussions
