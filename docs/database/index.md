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

## Documentation Sections

### [Database Schema](/database/schema)
Complete database schema with table structures and relationships.

### [Models](/database/models)
ORM models for interacting with database tables.

### [Query Builder](/database/query-builder)
Advanced query building capabilities and custom methods.

## Quick Start

```php
// Example of using FluentCart models
use FluentCart\App\Models\Order;
use FluentCart\App\Models\Customer;

// Get an order
$order = Order::find(123);

// Get customer orders
$customer = Customer::find(456);
$orders = $customer->orders;
```