---
title: Authentication
description: FluentCart API authentication documentation with complete reference and usage examples.
---

# API Authentication

FluentCart uses WordPress's built-in authentication system with additional policy-based authorization for fine-grained access control. This guide covers all authentication methods and authorization policies.

## Authentication Methods

### 1. WordPress Application Passwords

Application passwords provide secure API access without exposing user credentials.

#### Creating Application Passwords

1. **WordPress Admin**: Go to Users → Profile
2. **Application Passwords**: Scroll to "Application Passwords" section
3. **Create New**: Enter application name and click "Add New Application Password"
4. **Copy Password**: Save the generated password securely

#### Using Application Passwords

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/orders" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

```php
$headers = [
    'Authorization' => 'Basic ' . base64_encode('username:application_password'),
    'Content-Type' => 'application/json'
];

$response = wp_remote_get('https://yoursite.com/wp-json/fluent-cart/v2/orders', [
    'headers' => $headers
]);
```

```javascript
const response = await fetch('https://yoursite.com/wp-json/fluent-cart/v2/orders', {
    headers: {
        'Authorization': 'Basic ' + btoa('username:application_password'),
        'Content-Type': 'application/json'
    }
});
```

### 2. Cookie Authentication

For logged-in WordPress users, cookies can be used for authentication.

#### Using Cookie Authentication

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/orders" \
  -H "Cookie: wordpress_logged_in_abc123=user_hash"
```

```javascript
// In browser environment with logged-in user
const response = await fetch('https://yoursite.com/wp-json/fluent-cart/v2/orders', {
    credentials: 'include'
});
```

### 3. OAuth (Third-party Integrations)

For third-party applications, OAuth can be implemented using WordPress OAuth plugins.

#### OAuth Flow

1. **Authorization Request**: Redirect user to authorization endpoint
2. **User Consent**: User grants permission to your application
3. **Authorization Code**: Receive authorization code
4. **Access Token**: Exchange code for access token
5. **API Requests**: Use access token for API calls

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/orders" \
  -H "Authorization: Bearer oauth_access_token"
```

## Authorization Policies

FluentCart implements a policy-based authorization system for fine-grained access control.

### Policy System Overview

Policies are classes that determine whether a user can perform specific actions. Each API endpoint is protected by one or more policies.

### Core Policies

#### 1. AdminPolicy

**Purpose**: Super admin access to all FluentCart functionality  
**Usage**: System administration, global settings, module management

```php
// Policy check example
if ($user->can('super_admin')) {
    // Allow access to admin functions
}
```

**Endpoints Protected**:
- Dashboard settings
- Module management
- Global configuration
- System administration

#### 2. OrderPolicy

**Purpose**: Order management permissions  
**Usage**: Order creation, updates, refunds, status changes

**Permissions**:
- `orders/view` - View orders
- `orders/create` - Create orders
- `orders/manage` - Update orders
- `orders/delete` - Delete orders
- `orders/manage_statuses` - Change order statuses
- `orders/can_refund` - Process refunds

**Endpoints Protected**:
- `GET /orders` - List orders
- `POST /orders` - Create order
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Delete order
- `POST /orders/{id}/refund` - Refund order

#### 3. CustomerPolicy

**Purpose**: Customer management permissions  
**Usage**: Customer data access, address management, user attachment

**Permissions**:
- `customers/view` - View customers
- `customers/manage` - Update customers
- `customers/delete` - Delete customers

**Endpoints Protected**:
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `PUT /customers/{id}` - Update customer
- `GET /customers/{id}/address` - Get addresses

#### 4. ProductPolicy

**Purpose**: Product management permissions  
**Usage**: Product catalog, variations, attributes, pricing

**Permissions**:
- `products/view` - View products
- `products/create` - Create products
- `products/edit` - Update products
- `products/delete` - Delete products
- `products/manage` - Full product management

**Endpoints Protected**:
- `GET /products` - List products
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

#### 5. CouponPolicy

**Purpose**: Coupon management permissions  
**Usage**: Discount codes, promotional offers

**Permissions**:
- `coupons/view` - View coupons
- `coupons/manage` - Create/update coupons
- `coupons/delete` - Delete coupons

**Endpoints Protected**:
- `GET /coupons` - List coupons
- `POST /coupons` - Create coupon
- `PUT /coupons/{id}` - Update coupon

#### 6. StoreSettingsPolicy

**Purpose**: Store configuration permissions  
**Usage**: Store settings, payment methods, storage drivers

**Permissions**:
- `store/settings` - Manage store settings
- `is_super_admin` - Super admin access

**Endpoints Protected**:
- `GET /settings/store` - Get store settings
- `POST /settings/store` - Update store settings
- `GET /settings/payment-methods` - Payment method settings

#### 7. PublicPolicy

**Purpose**: Public access permissions  
**Usage**: Public product catalog, cart operations, checkout

**Endpoints Protected**:
- `GET /public/products` - Public product catalog
- `GET /cart/add_item` - Add to cart
- `POST /checkout/place-order` - Place order

#### 8. CustomerFrontendPolicy

**Purpose**: Customer frontend access  
**Usage**: Customer profile, orders, subscriptions

**Endpoints Protected**:
- `GET /customer-profile/` - Customer profile
- `GET /customer-profile/orders` - Customer orders
- `GET /customer-profile/subscriptions` - Customer subscriptions

### Permission System

#### Permission Structure

Permissions follow a hierarchical structure:

```
{resource}/{action}
```

**Examples**:
- `orders/view` - View orders
- `orders/create` - Create orders
- `orders/manage` - Manage orders
- `products/edit` - Edit products
- `customers/delete` - Delete customers

#### Special Permissions

- `super_admin` - Full system access
- `is_super_admin` - Super admin check
- `is_supper_admin` - Alternative super admin check (typo in codebase)

### Policy Implementation

#### Policy Class Structure

```php
<?php

namespace FluentCart\App\Http\Policies;

use FluentCart\Framework\Http\Policy;

class OrderPolicy extends Policy
{
    public function canView($user)
    {
        return $user->hasPermission('orders/view');
    }
    
    public function canCreate($user)
    {
        return $user->hasPermission('orders/create');
    }
    
    public function canManage($user)
    {
        return $user->hasPermission('orders/manage');
    }
}
```

#### Route Protection

```php
// Single policy
$router->get('/orders', [OrderController::class, 'index'])
    ->withPolicy('OrderPolicy');

// Multiple policies
$router->get('/orders', [OrderController::class, 'index'])
    ->withPolicy(['OrderPolicy', 'AdminPolicy']);

// Policy with specific permissions
$router->get('/orders', [OrderController::class, 'index'])
    ->withPolicy('OrderPolicy')
    ->meta(['permissions' => 'orders/view']);
```

## Frontend Authentication

### User Login

**POST** `/user/login`

Authenticate a user for frontend access.

#### Request Body

```json
{
  "username": "user@example.com",
  "password": "user_password"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "display_name": "John Doe"
    },
    "auth_cookie": "wordpress_logged_in_abc123"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/user/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "user_password"
  }'
```

## Error Handling

### Authentication Errors

| Code | Description |
|------|-------------|
| `authentication_required` | No authentication provided |
| `authentication_failed` | Invalid credentials |
| `authentication_expired` | Token/session expired |
| `insufficient_permissions` | User lacks required permissions |
| `policy_violation` | Policy check failed |

### Error Response Examples

#### Authentication Required

```json
{
  "success": false,
  "error": {
    "code": "authentication_required",
    "message": "Authentication is required to access this endpoint"
  }
}
```

#### Insufficient Permissions

```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You do not have permission to perform this action"
  }
}
```

## Security Best Practices

### 1. Use Application Passwords

- **Never** use WordPress admin passwords in API calls
- Create dedicated application passwords for each integration
- Rotate application passwords regularly

### 2. HTTPS Only

- Always use HTTPS for API calls
- Never send credentials over unencrypted connections

### 3. Permission Principle

- Grant minimum required permissions
- Use specific permissions rather than broad access
- Regularly audit user permissions

### 4. Rate Limiting

- Implement rate limiting on your API calls
- Respect FluentCart's rate limits
- Use exponential backoff for retries

### 5. Error Handling

- Handle authentication errors gracefully
- Don't expose sensitive information in error messages
- Log authentication failures for monitoring

## Testing Authentication

### Test Credentials

```bash
# Test with valid credentials
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/orders" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="

# Test with invalid credentials
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/orders" \
  -H "Authorization: Basic aW52YWxpZDppbnZhbGlk"
```

### Permission Testing

```bash
# Test with insufficient permissions
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v2/orders/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Related Documentation

- [Orders API](./orders) - Order management endpoints
- [Customers API](./customers) - Customer management endpoints
- [Products API](./products) - Product management endpoints
- [Subscriptions API](./subscriptions) - Subscription management endpoints
- [Database Models](/database/models) - User and permission data models

## Next Steps

Continue with API development:

1. **[Orders API](./orders)** - Start with order management
2. **[Customers API](./customers)** - Customer management
3. **[Products API](./products)** - Product catalog
4. **[Subscriptions API](./subscriptions)** - Subscription management

## Previous/Next Navigation

- **Previous**: [Subscriptions API](./subscriptions) - Subscription management endpoints
- **Next**: [Orders API](./orders) - Order management endpoints

---

