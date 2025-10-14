---
title: Getting Started
description: Complete developer guide for FluentCart e-commerce plugin development and customization.
---

# FluentCart Developer Guide

FluentCart Core Complete Guide

Welcome to the complete developer guide for **FluentCart** - the self-hosted e-commerce plugin for WordPress. This comprehensive guide will take you from understanding the basics to building sophisticated integrations and custom functionality.

## What is FluentCart?

FluentCart is a **Self-Hosted E-commerce Plugin** for WordPress that helps businesses manage their online stores, process payments, handle orders, and manage customers. Unlike cloud-based solutions, FluentCart runs entirely on your WordPress site, ensuring data privacy, unlimited products, and no monthly fees.

## Why Extend FluentCart?

FluentCart is designed to be highly extensible, allowing developers to customize and extend its functionality far beyond what the plugin offers out-of-the-box. Whether you're a business owner looking to customize your store or a developer hired to create specific integrations, FluentCart provides the tools you need.

### 🔧 **Built for Customization**

- **Extensive hook system** - 315+ action and filter hooks for custom functionality
- **Modular architecture** - Clean separation allows safe modifications and additions
- **RESTful API** - Complete programmatic access to all e-commerce data and functions
- **WordPress-native** - Follows WordPress coding standards and best practices

### 🏗️ **Flexible Extension Points**

- **Custom payment gateways** - Integrate with any payment processor
- **Third-party integrations** - Connect with external services and platforms
- **Custom modules** - Add specialized functionality and features
- **API extensions** - Build custom endpoints for mobile apps or external systems

### 💼 **Business Benefits**

- **No vendor lock-in** - Your customizations stay with you, not dependent on external services
- **Unlimited scalability** - Extend functionality as your business needs grow
- **Cost-effective** - One-time development instead of ongoing SaaS fees
- **Complete control** - Modify any aspect to match your specific business processes

## FluentCart Versions

### FluentCart Core (Free)

The free version includes powerful core functionalities:

- ✅ **Product Management** - Unlimited products and variations
- ✅ **Order Processing** - Complete order management system
- ✅ **Customer Management** - Customer accounts and profiles
- ✅ **Payment Processing** - Multiple payment gateway support
- ✅ **Shipping Management** - Flexible shipping options
- ✅ **Coupon System** - Discount and promotional codes
- ✅ **Developer API** - Full access to hooks and REST API

### FluentCart Pro (Premium)

The premium version adds advanced e-commerce features:

- 🚀 **Licensing System** - Software license management
- 🚀 **Order Bumps** - Advanced upselling and promotional tools
- 🚀 **Roles & Permissions** - Advanced user role management
- 🚀 **Advanced Analytics** - Detailed sales and performance analytics
- 🚀 **Subscription Management** - Recurring billing and subscriptions
- 🚀 **Advanced Integrations** - Deep third-party integrations
- 🚀 **Custom Modules** - Extensible module system

## Core Development Concepts

### 📊 **Data Architecture**

FluentCart follows WordPress conventions with a clean, normalized database structure:

**Core Tables & Relationships:**

- **🛒 Orders** (`fct_orders`) - Central hub for all order data
  - Stores order information, status, customer details
  - Links to all order items, transactions, and metadata
- **👥 Customers** (`fct_customers`) - Customer management
  - Customer profiles, addresses, order history
  - Integration with WordPress users
- **📦 Products** (WordPress `posts` table) - Product catalog
  - Product information stored as WordPress custom post type
  - Additional details in `fct_product_details` and `fct_product_variations`
- **💳 Transactions** (`fct_order_transactions`) - Payment processing
  - Payment records, refunds, transaction history
  - Integration with payment gateways
- **📋 Subscriptions** (`fct_subscriptions`) - Recurring billing
  - Subscription management and renewals
  - Automated billing workflows

### 🔄 **E-commerce Workflow**

The three-component e-commerce system:

1. **Products** - Catalog management and inventory tracking
2. **Orders** - Order processing and fulfillment
3. **Payments** - Payment processing and transaction management

### 🔌 **Extension Points**

Multiple ways to extend FluentCart:

- **WordPress Hooks** - 315+ actions and filters for custom functionality
- **REST API** - Complete programmatic access to all features
- **Module System** - Add new payment gateways, shipping methods, and features
- **Custom Fields** - Extend products, orders, and customers with custom data
- **Template System** - Customize frontend templates and layouts

## Directory Structure

Understanding FluentCart's organized codebase:

```
fluent-cart/
├── app/                    # Core application logic
│   ├── Hooks/             # WordPress action/filter handlers
│   │   ├── Handlers/      # Hook handlers
│   │   ├── actions.php    # Action hooks
│   │   └── filters.php    # Filter hooks
│   ├── Http/              # Request handling and routing
│   │   ├── Controllers/   # API and admin controllers
│   │   ├── Middleware/    # Request middleware
│   │   └── Routes/        # API route definitions
│   ├── Models/            # Database models and relationships (45 files)
│   │   ├── Order.php      # Order model
│   │   ├── Customer.php   # Customer model
│   │   ├── Product.php    # Product model
│   │   └── ...           # Additional models
│   ├── Services/          # Business logic and services
│   │   ├── Payment/      # Payment processing services
│   │   ├── Shipping/     # Shipping calculation services
│   │   └── Helper.php    # Core helper utilities
│   ├── Views/            # PHP template files
│   ├── Events/           # Event system
│   ├── Listeners/        # Event listeners
│   └── Modules/          # Module system
│
├── api/                   # REST API endpoints and utilities
│   ├── Orders.php        # Order management API
│   ├── Customers.php     # Customer management API
│   ├── Products.php      # Product catalog API
│   ├── Resource/         # API resource classes
│   └── ...              # Additional API endpoints
│
├── resources/           # Frontend assets and templates
│   ├── admin/          # Admin interface (Vue.js) + Gutenberg blocks (React)
│   │   ├── Components/ # Vue components
│   │   ├── Modules/    # Feature modules
│   │   └── BlockEditor/# React Gutenberg blocks
│   ├── public/         # Public-facing components
│   │   ├── cart/       # Cart functionality
│   │   ├── checkout/   # Checkout process
│   │   └── customer-profile/ # Customer interface
│   ├── styles/         # SCSS stylesheets
│   └── images/         # Image resources
│
├── boot/                # Plugin initialization
├── config/              # Configuration files
├── database/            # Database migrations and schema
│   ├── Migrations/      # Database migration files (34 files)
│   ├── Seeder/         # Database seeders
│   └── DBMigrator.php  # Migration handler
│
├── dev/                 # Development tools and testing
│   ├── cli/            # CLI commands
│   ├── test/           # Test files
│   └── factories/      # Model factories
│
└── fluent-cart.php     # Plugin entry point
```

## Development Environment Setup

### Prerequisites

- **WordPress 5.0+** - Modern WordPress installation
- **PHP 7.4+** - Recent PHP version with required extensions
- **MySQL 5.6+** - Database with InnoDB support
- **Basic WordPress Development** - Understanding of hooks, plugins, and themes

### Development Tools

- **Code Editor** - VS Code, PhpStorm, or your preferred editor
- **Local Environment** - Laravel Herd, XAMPP, WAMP, or Docker
- **Version Control** - Git for tracking changes (optional but recommended)
- **API Testing** - Postman or Insomnia for REST API development

### Getting Started Checklist

1. **📖 Read the Fundamentals**
   - [ ] Understand the database schema
   - [ ] Review core models
   - [ ] Explore global functions

2. **🔍 Explore the Hooks**
   - [ ] Browse action hooks
   - [ ] Study filter hooks
   - [ ] Try event system

3. **🏗️ Build Your First Extension**
   - [ ] Create a custom payment gateway
   - [ ] Build a custom shipping method
   - [ ] Add a custom module

4. **🌐 API Integration**
   - [ ] Set up REST API access
   - [ ] Test order management
   - [ ] Explore webhook integration

## Quick Start Guide

### 1. Database & Models

Start by understanding FluentCart's data structure:

- [Database Schema](/database/schema) - Complete table structure
- [Core Models](/database/models) - Order, Customer, Product models
- [Model Relationships](/database/models/relationships) - How data connects

### 2. Developer Hooks

Learn how to extend FluentCart functionality:

- [Action Hooks](/hooks/actions) - Trigger custom code on events
- [Filter Hooks](/hooks/filters) - Modify data and behavior
<!-- - [Event System](/hooks/events) - Advanced event handling -->

<!-- ### 3. REST API

Access FluentCart programmatically:

- [API Overview](/api/) - Authentication and basics
- [Orders API](/api/orders) - Order management
- [Customers API](/api/customers) - Customer management
- [Products API](/api/products) - Product catalog

### 4. Modules

Build custom functionality:

- [Module System](/modules/) - Architecture overview
- [Payment Methods](/modules/payment-methods) - Payment gateway development
- [Shipping](/modules/shipping) - Shipping method development
- [Storage Drivers](/modules/storage) - File storage integration

### 5. Pro Features

Advanced functionality with FluentCart Pro:

- [Licensing Module](/modules/licensing) - Software license management
- [Order Bump](/modules/order-bump) - Promotional tools
- [Roles & Permissions](/api/roles-permissions) - User management -->

<!-- ## Development Guides

### Frontend Development

- [Vue.js Integration](/guides/frontend) - Building interactive components
- [Template System](/guides/frontend) - Customizing templates
- [Asset Management](/guides/frontend) - Vite, SCSS, JavaScript

### Integration Development

- [CRM Integrations](/guides/integrations) - Customer data sync
- [Email Marketing](/guides/integrations) - Campaign integration
- [Analytics](/guides/integrations) - Tracking and reporting
- [Custom Add-ons](/guides/integrations) - Plugin development -->

## Community & Support

### 📚 **Learning Resources**

- **[Official Documentation](https://docs.fluentcart.com)** - Complete user and developer reference
<!-- - **[Database Models](/database/models)** - Detailed model documentation
<!-- - **[REST API Reference](/api/)** - Comprehensive API guide -->
<!-- - **[Developer Hooks](/hooks/)** - Complete hook documentation  -->

### 💬 **Community**

- **[Official Support](https://fluentcart.com/account)** - Technical support

<!-- ### 🚀 **Next Steps**

Ready to start building? Choose your path:

- **Build Payment Gateways** - Create custom payment processors
- **Extend the API** - Add custom endpoints
- **Database Deep Dive** - Master the data structure
- **Hook Integration** - Leverage WordPress hooks -->


<!-- ## Related Documentation

- [Database Schema](/database/schema) - Understanding FluentCart's data structure
- [Developer Hooks](/hooks/) - Extending FluentCart functionality -->
<!-- - [REST API](/api/) - Programmatic access to FluentCart -->
<!-- - [Module System](/modules/) - Building custom modules -->
<!-- - [Frontend Development](/guides/frontend) - Vue.js and template customization -->
<!-- - [Integration Guide](/guides/integrations) - Third-party integrations -->

<!-- ## Next Steps

Ready to dive deeper? Here's the recommended learning path:

1. **[Database & Models](/database/schema)** - Start with understanding the data structure
2. **[Developer Hooks](/hooks/)** - Learn how to extend functionality
3. **[REST API](/api/)** - Explore programmatic access
<!-- 4. **[Modules](/modules/)** - Build custom functionality
5. **[Guides](/guides/)** - Advanced development topics -->

