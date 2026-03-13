---
title: Roles & Permissions API
description: FluentCart Pro REST API endpoints for managing custom roles and user permissions.
---

# Roles & Permissions API

::: info Pro Feature
All roles and permissions endpoints require FluentCart Pro.
:::

Manage custom roles, assign permissions, and control user access to FluentCart features.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/roles`

**Policy:** `AdminPolicy`

> The `AdminPolicy` requires the current user to have the `is_super_admin` permission (WordPress `manage_options` capability). All endpoints in this group are restricted to site administrators.

---

## List Managers

<badge type="tip">GET</badge> `/fluent-cart/v2/roles/managers`

Retrieve a list of all WordPress users who have been assigned a FluentCart shop role. Returns user details along with their assigned role and resolved permissions.

### Response

```json
{
  "managers": [
    {
      "id": 5,
      "email": "manager@example.com",
      "display_name": "Jane Manager",
      "username": "janemanager",
      "shop_role": "manager",
      "description": "With All Permissions Except Sensitive Settings",
      "registered_at": "2025-03-10 08:00:00",
      "role_permissions": [
        "store/settings",
        "products/view",
        "products/create",
        "products/edit",
        "products/delete",
        "customers/view",
        "customers/manage",
        "customers/delete",
        "orders/view",
        "orders/manage_statuses",
        "orders/can_refund",
        "orders/manage",
        "orders/export",
        "orders/delete",
        "subscriptions/view",
        "subscriptions/manage",
        "subscriptions/delete",
        "licenses/view",
        "licenses/manage",
        "licenses/delete",
        "coupons/view",
        "coupons/manage",
        "coupons/delete",
        "reports/view",
        "reports/export",
        "integrations/view",
        "integrations/manage",
        "integrations/delete"
      ]
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | WordPress user ID |
| `email` | string | User email address |
| `display_name` | string | WordPress display name |
| `username` | string | WordPress login username |
| `shop_role` | string | Assigned FluentCart role key (e.g., `manager`, `worker`, `accountant`) |
| `description` | string | Human-readable description of the role |
| `registered_at` | string | WordPress user registration date |
| `role_permissions` | array | Resolved list of permission strings for this user's role |

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/roles/managers" \
  -u "username:app_password"
```

---

## Search Users

<badge type="tip">GET</badge> `/fluent-cart/v2/roles/user-list`

Search for WordPress users who can be assigned a FluentCart role. Returns users matching the search query, excluding those who already have a WordPress administrator role.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `search` | string | query | No | Search by display name or email address. Partial matches supported. |
| `user_ids` | string/array | query | No | Comma-separated user IDs to include in results regardless of search filter |

### Response

```json
{
  "users": {
    "total": 25,
    "per_page": 15,
    "current_page": 1,
    "last_page": 2,
    "data": [
      {
        "ID": 10,
        "name": "Alice Johnson",
        "email": "alice@example.com"
      },
      {
        "ID": 15,
        "name": "Bob Wilson",
        "email": "bob@example.com"
      }
    ]
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `ID` | integer | WordPress user ID |
| `name` | string | WordPress display name |
| `email` | string | User email address |

> Users who already have the WordPress `manage_options` capability (administrators) are excluded from results, as they automatically have full FluentCart access.

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/roles/user-list?search=alice" \
  -u "username:app_password"
```

---

## List Roles

<badge type="tip">GET</badge> `/fluent-cart/v2/roles`

Retrieve all available FluentCart roles with their titles and descriptions. This returns the role definitions (not user assignments).

### Response

```json
{
  "roles": {
    "super_admin": {
      "title": "Super Admin",
      "description": "With All Permissions"
    },
    "manager": {
      "title": "Manager",
      "description": "With All Permissions Except Sensitive Settings"
    },
    "worker": {
      "title": "Worker",
      "description": "View Access for products, customers, coupons, integrations. Manage Access for Order Statuses"
    },
    "accountant": {
      "title": "Accountant",
      "description": "View Access for products, customers, orders, subscriptions, licenses, coupons, reports and integrations"
    }
  }
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/roles" \
  -u "username:app_password"
```

---

## Assign Role

<badge type="warning">POST</badge> `/fluent-cart/v2/roles`

Assign a FluentCart role to a WordPress user. The user receives the `fluent_cart_admin` capability and their role is stored as user meta. If the user already has an assigned role, it is replaced.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `user_id` | integer | body | Yes | WordPress user ID. Must reference an existing user. |
| `role_key` | string | body | Yes | The role key to assign. Must be one of the valid role keys returned by the List Roles endpoint (e.g., `super_admin`, `manager`, `worker`, `accountant`). Max 50 characters. |

### Response

**Success (200):**

```json
{
  "message": "Role synced successfully",
  "is_updated": true
}
```

### Error Responses

| Scenario | Message |
|----------|---------|
| User not found | User not found. |
| Invalid role key | Invalid role. |
| User is WP administrator | The user already has all the accesses as part of Administrator Role |

### Validation Rules

| Field | Rule | Message |
|-------|------|---------|
| `user_id` | required, must exist as user | Title is required. |
| `role_key` | required, string, max:50, must be valid role | Key is required. |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/roles" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 10,
    "role_key": "manager"
  }'
```

---

## Get Role

<badge type="tip">GET</badge> `/fluent-cart/v2/roles/{key}`

Retrieve details for a specific role by its key.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `key` | string | path | Yes | The role key (e.g., `manager`, `worker`, `accountant`) |

> This endpoint is currently a placeholder and returns no data. It is reserved for future use.

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/roles/manager" \
  -u "username:app_password"
```

---

## Update Role

<badge type="warning">POST</badge> `/fluent-cart/v2/roles/{key}`

Update a specific role definition.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `key` | string | path | Yes | The role key to update |

> This endpoint is currently a placeholder and returns no data. It is reserved for future use.

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/roles/manager" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Delete Role Assignment

<badge type="danger">DELETE</badge> `/fluent-cart/v2/roles/{key}`

Remove a FluentCart role assignment from a user. The user's `fluent_cart_admin` capability is removed and their role meta is deleted. The user's WordPress account is not affected.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `key` | string | path | Yes | The role key to remove (e.g., `manager`, `worker`) |
| `user_id` | integer | body/query | Yes | The WordPress user ID to remove the role from |

### Response

**Success (200):**

```json
{
  "message": "Role deleted successfully"
}
```

### Error Responses

| Scenario | Message |
|----------|---------|
| Missing role key | Role key is required |
| User not found | User not found |
| User is WP administrator | The user already has all the accesses as part of Administrator Role |

### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/roles/manager" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 10
  }'
```

---

## Role Definitions

FluentCart includes four built-in roles with predefined permission sets:

### super_admin

Full access to all FluentCart features and settings.

| Category | Permissions |
|----------|-------------|
| Store | `store/settings`, `store/sensitive` |
| Products | `products/view`, `products/create`, `products/edit`, `products/delete` |
| Customers | `customers/view`, `customers/manage`, `customers/delete` |
| Orders | `orders/view`, `orders/create`, `orders/manage_statuses`, `orders/manage`, `orders/can_refund`, `orders/export`, `orders/delete` |
| Subscriptions | `subscriptions/view`, `subscriptions/manage`, `subscriptions/delete` |
| Licenses | `licenses/view`, `licenses/manage`, `licenses/delete` |
| Coupons | `coupons/view`, `coupons/manage`, `coupons/delete` |
| Reports | `reports/view`, `reports/export` |
| Integrations | `integrations/view`, `integrations/manage`, `integrations/delete` |
| Labels | `labels/view`, `labels/manage`, `labels/delete` |
| Dashboard | `dashboard_stats/view` |

### manager

All permissions except sensitive store settings (`store/sensitive`).

### worker

Limited access focused on day-to-day operations:
- View products, customers, orders, subscriptions, licenses, integrations
- Manage order statuses
- View and manage coupons

### accountant

Read-only access with export capabilities:
- View products, customers, orders, subscriptions, licenses, coupons, integrations
- View and export orders
- View and export reports

---

## Related Hooks

| Hook | Type | Description |
|------|------|-------------|
| `fluent_cart/permission/all_roles` | Filter | Modify or extend the available role definitions. Receives the roles array. |
