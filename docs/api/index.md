---
title: REST API
description: FluentCart REST API documentation with complete endpoint reference and usage examples.
---

# FluentCart REST API

FluentCart provides a comprehensive REST API that allows developers to interact with all e-commerce functionality programmatically. The API is built on WordPress's REST API foundation with FluentCart-specific endpoints and authentication.

## API Overview

The FluentCart REST API provides programmatic access to:

- **Order Management** - Create, read, update, and manage orders
- **Customer Management** - Handle customer data and relationships
- **Product Management** - Manage products, variations, and pricing
- **Payment Processing** - Handle payments and transactions
- **Subscription Management** - Manage recurring subscriptions
- **Coupon System** - Apply and manage discount coupons
- **File Management** - Handle file uploads and downloads
- **Settings Management** - Configure store and module settings

## Base URL

All API endpoints are prefixed with the WordPress REST API base URL:

```
https://yoursite.com/wp-json/fluent-cart/v2/
```

## Authentication

FluentCart uses WordPress's built-in authentication system with additional policy-based authorization:

### 1. WordPress Authentication
- **Cookie Authentication** - For logged-in users
- **Application Passwords** - For external applications
- **OAuth** - For third-party integrations

### 2. Policy-Based Authorization
FluentCart implements a policy system for fine-grained access control:

- **AdminPolicy** - Super admin access
- **OrderPolicy** - Order management permissions
- **CustomerPolicy** - Customer management permissions
- **ProductPolicy** - Product management permissions
- **CouponPolicy** - Coupon management permissions

### Authentication Example

```php
// Using WordPress Application Passwords
$headers = [
    'Authorization' => 'Basic ' . base64_encode('username:application_password'),
    'Content-Type' => 'application/json'
];

$response = wp_remote_get('https://yoursite.com/wp-json/fluent-cart/v1/orders', [
    'headers' => $headers
]);
```

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
    "success": true,
    "data": {
        // Response data
    },
    "message": "Operation completed successfully"
}
```

### Error Response
```json
{
    "success": false,
    "error": {
        "code": "error_code",
        "message": "Error description"
    }
}
```

## Pagination

List endpoints support pagination using WordPress's standard pagination parameters:

- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10, max: 100)

### Pagination Response
```json
{
    "data": [...],
    "pagination": {
        "current_page": 1,
        "per_page": 10,
        "total": 100,
        "total_pages": 10
    }
}
```

## Core Endpoints

### Orders API
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/{id}` - Get order details
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Delete order
- `POST /orders/{id}/mark-as-paid` - Mark order as paid
- `POST /orders/{id}/refund` - Refund order
- `PUT /orders/{id}/statuses` - Update order statuses

[View Orders API Documentation →](./orders)

### Customers API
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `GET /customers/{id}` - Get customer details
- `PUT /customers/{id}` - Update customer
- `GET /customers/{id}/orders` - Get customer orders
- `GET /customers/{id}/address` - Get customer addresses
- `PUT /customers/{id}/address` - Update customer address

[View Customers API Documentation →](./customers)

### Products API
- `GET /products` - List products
- `POST /products` - Create product
- `GET /products/{id}` - Get product details
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product
- `GET /products/variants` - List product variations
- `POST /products/variants` - Create product variation
- `PUT /products/variants/{id}` - Update product variation

[View Products API Documentation →](./products)

### Subscriptions API
- `GET /subscriptions` - List subscriptions
- `GET /subscriptions/{id}` - Get subscription details
- `PUT /subscriptions/{id}` - Update subscription
- `POST /subscriptions/{id}/cancel` - Cancel subscription
- `POST /subscriptions/{id}/reactivate` - Reactivate subscription

[View Subscriptions API Documentation →](./subscriptions)

### Coupons API
- `GET /coupons` - List coupons
- `POST /coupons` - Create coupon
- `GET /coupons/{id}` - Get coupon details
- `PUT /coupons/{id}` - Update coupon
- `DELETE /coupons/{id}` - Delete coupon
- `POST /coupons/apply` - Apply coupon
- `POST /coupons/cancel` - Cancel coupon

### Settings API
- `GET /settings/store` - Get store settings
- `POST /settings/store` - Update store settings
- `GET /settings/payment-methods` - Get payment method settings
- `POST /settings/payment-methods` - Update payment method settings
- `GET /settings/storage-drivers` - Get storage driver settings
- `POST /settings/storage-drivers` - Update storage driver settings

### File Management API
- `GET /files` - List files
- `POST /files/upload` - Upload file
- `DELETE /files/delete` - Delete file
- `GET /files/bucket-list` - Get file bucket list

### Integration API
- `GET /integration/global-settings` - Get global integration settings
- `POST /integration/global-settings` - Update global integration settings
- `GET /integration/global-feeds` - Get integration feeds
- `POST /integration/global-feeds/settings` - Save integration feed settings

### Reports API
- `GET /reports/overview` - Get overview report
- `GET /reports/orders` - Get order report
- `GET /reports/customers` - Get customer report
- `GET /reports/products` - Get product report
- `GET /reports/revenue` - Get revenue report

## Pro Endpoints ⭐ **PRO ONLY**

### Licensing API (Pro)
- `GET /licenses` - List licenses
- `POST /licenses` - Create license
- `GET /licenses/{id}` - Get license details
- `PUT /licenses/{id}` - Update license
- `POST /licenses/{id}/activate` - Activate license

[View Licensing API Documentation →](./licensing)

### Roles & Permissions API (Pro)
- `GET /settings/permissions` - Get permissions
- `POST /settings/permissions` - Update permissions
- `GET /users/{id}/capabilities` - Get user capabilities
- `POST /users/{id}/capabilities` - Update user capabilities

[View Roles & Permissions API Documentation →](./roles-permissions)

### Order Bump API (Pro)
- `GET /order-bumps` - List order bumps
- `POST /order-bumps` - Create order bump
- `GET /order-bumps/{id}` - Get order bump details
- `PUT /order-bumps/{id}` - Update order bump
- `DELETE /order-bumps/{id}` - Delete order bump

[View Order Bump API Documentation →](./order-bump)

## Frontend Endpoints

### Cart API
- `GET /cart` - Get cart contents
- `POST /cart/add` - Add item to cart
- `PUT /cart/update` - Update cart item
- `DELETE /cart/remove` - Remove item from cart
- `POST /cart/apply-coupon` - Apply coupon to cart

### Checkout API
- `POST /checkout/process` - Process checkout
- `GET /checkout/shipping-methods` - Get shipping methods
- `POST /checkout/calculate-shipping` - Calculate shipping

### Public API
- `GET /public/products` - Get public product catalog
- `GET /public/products/{id}` - Get public product details
- `GET /public/categories` - Get product categories


