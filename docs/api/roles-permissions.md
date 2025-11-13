---
title: Roles & Permissions API
description: FluentCart Roles & Permissions API for managing WordPress role access to FluentCart.
---

# Roles & Permissions API

The Roles & Permissions API allows you to manage which WordPress user roles have access to FluentCart. This API is used to configure which roles can access FluentCart features and capabilities.

## Base URL

All Roles & Permissions API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

All Roles & Permissions API endpoints require:
- **Policy**: `StoreSettingsPolicy`
- **Permission**: `is_super_admin` (WordPress administrator with `manage_options` capability)

## Permission Management

### Get Permissions

Retrieve a list of available WordPress roles and the currently configured capability permissions.

**Endpoint:** `GET /settings/permissions`

**Permission Required**: `is_super_admin`

**Parameters:** None

#### Response

```json
{
  "roles": {
    "capability": [
      "editor",
      "author"
    ],
    "roles": [
      {
        "name": "Editor",
        "key": "editor"
      },
      {
        "name": "Author",
        "key": "author"
      },
      {
        "name": "Contributor",
        "key": "contributor"
      }
    ]
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `roles.capability` | array | Array of WordPress role keys that currently have FluentCart access |
| `roles.roles` | array | Array of available WordPress roles (excluding `administrator` and `subscriber`) |
| `roles.roles[].name` | string | Display name of the role |
| `roles.roles[].key` | string | WordPress role key/identifier |

**Note**: The `administrator` role is excluded from the list as administrators always have full access. The `subscriber` role is also excluded.

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/settings/permissions" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

#### Example Request (JavaScript)

```javascript
const response = await fetch('https://yoursite.com/wp-json/fluent-cart/v2/settings/permissions', {
    headers: {
        'Authorization': 'Basic ' + btoa('username:application_password')
    }
});

const data = await response.json();
console.log(data.roles);
```

### Save Permissions

Update which WordPress roles have access to FluentCart.

**Endpoint:** `POST /settings/permissions`

**Permission Required**: `is_super_admin`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capability` | array | Yes | Array of WordPress role keys that should have FluentCart access |

```json
{
  "capability": ["editor", "author"]
}
```

#### Response

**Success Response** (200):

```json
{
  "message": "Successfully updated the role(s)."
}
```

**Error Response** (403):

If the user doesn't have `manage_options` capability:

```json
{
  "success": false,
  "data": {
    "message": "Sorry, You can not update permissions. Only administrators can update permissions"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/settings/permissions" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "capability": ["editor", "author"]
  }'
```

#### Example Request (JavaScript)

```javascript
const response = await fetch('https://yoursite.com/wp-json/fluent-cart/v2/settings/permissions', {
    method: 'POST',
    headers: {
        'Authorization': 'Basic ' + btoa('username:application_password'),
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        capability: ['editor', 'author']
    })
});

const data = await response.json();
```

## How It Works

The Permissions API manages which WordPress user roles can access FluentCart:

1. **WordPress Roles**: FluentCart uses existing WordPress user roles (Editor, Author, Contributor, etc.)
2. **Role Selection**: Administrators can select which WordPress roles should have access to FluentCart
3. **Capability Storage**: Selected roles are stored in the `_fluent_cart_admin_permissions` option
4. **Access Control**: Users with selected roles can access FluentCart features based on their assigned permissions

## FluentCart Internal Roles

FluentCart also has internal role management through `PermissionManager` (used in FluentCart Pro), which provides fine-grained permissions like:
- `super_admin` - Full access to all FluentCart features
- `manager` - Access to most features except sensitive settings
- Custom roles with specific capability sets

These internal roles are separate from WordPress roles and are managed through user meta (`_fluent_cart_admin_role`).

## Available Permissions

FluentCart uses a permission-based system for fine-grained access control. Common permissions include:

### Order Permissions
- `orders/view` - View orders
- `orders/create` - Create orders
- `orders/manage` - Update orders
- `orders/delete` - Delete orders
- `orders/manage_statuses` - Change order statuses
- `orders/can_refund` - Process refunds
- `orders/export` - Export orders

### Product Permissions
- `products/view` - View products
- `products/create` - Create products
- `products/edit` - Update products
- `products/delete` - Delete products
- `products/manage` - Full product management

### Customer Permissions
- `customers/view` - View customers
- `customers/manage` - Update customers
- `customers/delete` - Delete customers

### Coupon Permissions
- `coupons/view` - View coupons
- `coupons/manage` - Create/update coupons
- `coupons/delete` - Delete coupons

### Store Permissions
- `store/settings` - Manage store settings
- `is_super_admin` - Super admin access (full system access)

### Other Permissions
- `subscriptions/view` - View subscriptions
- `subscriptions/manage` - Manage subscriptions
- `subscriptions/delete` - Delete subscriptions
- `licenses/view` - View licenses
- `licenses/manage` - Manage licenses
- `licenses/delete` - Delete licenses
- `reports/view` - View reports
- `reports/export` - Export reports
- `integrations/view` - View integrations
- `integrations/manage` - Manage integrations
- `integrations/delete` - Delete integrations
- `labels/view` - View labels
- `labels/manage` - Manage labels
- `dashboard_stats/view` - View dashboard statistics

For more information about permissions, see the [Authentication API documentation](./authentication).
