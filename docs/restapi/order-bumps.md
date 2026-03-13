---
title: Order Bumps API
description: FluentCart Pro REST API endpoints for managing order bump promotions.
---

# Order Bumps API

::: info Pro Feature
All order bump endpoints require FluentCart Pro.
:::

Create and manage order bump promotions that appear during checkout to increase average order value.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/order_bump`

**Policy:** `OrderBumpPolicy`

- **Permission:** `store/sensitive`

> All monetary values are in **cents** (e.g., `$10.00` = `1000`).

---

## List Order Bumps

<badge type="tip">GET</badge> `/fluent-cart/v2/order_bump`

Retrieve a paginated list of order bumps with optional filtering, sorting, and search.

- **Permission:** `store/sensitive`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `sort_by` | string | query | No | Column to sort by (default: `id`) |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `active_view` | string | query | No | Filter by status tab. One of: `active`, `draft` |
| `search` | string | query | No | Search by order bump title or description. Partial matches supported. |
| `page` | integer | query | No | Page number for pagination |
| `per_page` | integer | query | No | Number of records per page |

### Active View Filters

| View | Behavior |
|------|----------|
| `active` | Order bumps where `status = 'active'` |
| `draft` | Order bumps where `status = 'draft'` |

### Response

```json
{
  "order_bumps": {
    "total": 5,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "hash": "a1b2c3d4e5f6...",
        "parent_id": null,
        "type": "order_bump",
        "status": "active",
        "src_object_id": 42,
        "src_object_type": null,
        "title": "Add Extended Warranty",
        "description": "<p>Protect your purchase with our 2-year warranty plan.</p>",
        "conditions": [],
        "config": {
          "discount": {
            "discount_type": "percentage",
            "discount_amount": 10
          },
          "display_conditions_if": "",
          "call_to_action": "Yes, add warranty!"
        },
        "priority": 1,
        "created_at": "2025-06-01 10:00:00",
        "updated_at": "2025-06-15 14:30:00",
        "product_variant": {
          "id": 42,
          "product_id": 10,
          "title": "Extended Warranty - 2 Year",
          "price": 2999,
          "product": {
            "id": 10,
            "title": "Extended Warranty",
            "status": "publish"
          }
        }
      }
    ]
  }
}
```

**Notes:**

- Each order bump eagerly loads its associated `product_variant` and the variant's parent `product`.
- The `config` and `conditions` fields are automatically JSON-decoded.

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/order_bump?active_view=active&sort_by=priority&sort_type=asc" \
  -u "username:app_password"
```

---

## Create Order Bump

<badge type="warning">POST</badge> `/fluent-cart/v2/order_bump`

Create a new order bump promotion. The order bump is created with minimal data (title and source variant) and can be fully configured via the Update endpoint.

- **Permission:** `store/sensitive`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `title` | string | body | Yes | Display title for the order bump. |
| `src_object_id` | integer | body | Yes | The product variation ID that this order bump offers. Must reference an existing product variation. |

### Response

**Success (200):**

```json
{
  "message": "Order bump created successfully",
  "id": 5
}
```

### Error Responses

| Code | Message |
|------|---------|
| 400 | Title and source object id are required |
| 400 | Failed to create order bump |

### Auto-Generated Fields

The following fields are automatically set on creation:

| Field | Value |
|-------|-------|
| `type` | `order_bump` |
| `hash` | Auto-generated MD5 hash (unique identifier) |
| `conditions` | Empty JSON array `[]` |
| `config` | Empty JSON object `{}` |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/order_bump" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add Extended Warranty",
    "src_object_id": 42
  }'
```

---

## Get Order Bump

<badge type="tip">GET</badge> `/fluent-cart/v2/order_bump/{id}`

Retrieve detailed information about a specific order bump, including its configuration, conditions, and associated product variant.

- **Permission:** `store/sensitive`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The order bump ID |

### Response

```json
{
  "order_bump": {
    "id": 1,
    "hash": "a1b2c3d4e5f6...",
    "parent_id": null,
    "type": "order_bump",
    "status": "active",
    "src_object_id": 42,
    "src_object_type": null,
    "title": "Add Extended Warranty",
    "description": "<p>Protect your purchase with our 2-year warranty plan.</p>",
    "conditions": [
      {
        "type": "product",
        "operator": "in",
        "values": [10, 15]
      }
    ],
    "config": {
      "discount": {
        "discount_type": "percentage",
        "discount_amount": 10
      },
      "display_conditions_if": "",
      "call_to_action": "Yes, add warranty!"
    },
    "priority": 1,
    "created_at": "2025-06-01 10:00:00",
    "updated_at": "2025-06-15 14:30:00"
  },
  "variant": {
    "id": 42,
    "product_id": 10,
    "title": "Extended Warranty - 2 Year",
    "price": 2999,
    "product": {
      "id": 10,
      "title": "Extended Warranty",
      "status": "publish"
    }
  }
}
```

### Default Config

If the order bump has no saved configuration, the following defaults are returned:

```json
{
  "discount": {
    "discount_type": "percentage",
    "discount_amount": 0
  },
  "display_conditions_if": "",
  "call_to_action": ""
}
```

### Error Responses

| Code | Message |
|------|---------|
| 404 | Order bump not found |

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/order_bump/1" \
  -u "username:app_password"
```

---

## Update Order Bump

<badge type="info">PUT</badge> `/fluent-cart/v2/order_bump/{id}`

Update an existing order bump's configuration, conditions, status, and display settings.

- **Permission:** `store/sensitive`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The order bump ID |
| `title` | string | body | Yes | Display title. Max 194 characters. |
| `src_object_id` | integer | body | Yes | Product variation ID for the bump offer. |
| `status` | string | body | No | Order bump status. One of: `active`, `draft`. Max 50 characters. |
| `src_object_type` | string | body | No | Source object type identifier. Max 50 characters. |
| `description` | string | body | No | HTML description displayed to the customer. Sanitized with `wp_kses_post`. |
| `config` | object | body | No | Configuration object (see Config Object below). |
| `conditions` | array | body | No | Array of display condition objects (see Conditions below). |
| `priority` | integer | body | No | Display priority. Lower numbers appear first. Min: 1. |

### Config Object

| Field | Type | Description |
|-------|------|-------------|
| `discount` | object | Discount settings for the bump offer |
| `discount.discount_type` | string | Discount type. One of: `percentage`, `fixed` |
| `discount.discount_amount` | number | Discount amount. For `percentage`: value 0-100. For `fixed`: amount in cents. |
| `display_conditions_if` | string | Logical operator for combining conditions |
| `call_to_action` | string | Button or checkbox text shown to the customer |

### Conditions

The `conditions` field accepts an array of condition objects that control when the order bump is displayed during checkout. Each condition object defines a rule based on cart contents or customer attributes.

### Response

**Success (200):**

```json
{
  "message": "Order bump updated successfully"
}
```

### Error Responses

| Code | Message |
|------|---------|
| 400 | Failed to update order bump |

### Validation Rules

| Field | Rule |
|-------|------|
| `title` | required, sanitized text, max 194 characters |
| `src_object_id` | required, numeric |
| `status` | nullable, sanitized text, max 50 characters |
| `src_object_type` | nullable, sanitized text, max 50 characters |
| `description` | nullable, HTML sanitized via `wp_kses_post` |
| `config` | nullable, array |
| `conditions` | nullable, array |
| `priority` | nullable, numeric, min 1 |

### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/order_bump/1" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add Extended Warranty",
    "src_object_id": 42,
    "status": "active",
    "description": "<p>Protect your purchase with our 2-year extended warranty.</p>",
    "priority": 1,
    "config": {
      "discount": {
        "discount_type": "percentage",
        "discount_amount": 10
      },
      "display_conditions_if": "",
      "call_to_action": "Yes, add warranty!"
    },
    "conditions": []
  }'
```

---

## Delete Order Bump

<badge type="danger">DELETE</badge> `/fluent-cart/v2/order_bump/{id}`

Permanently delete an order bump.

- **Permission:** `store/sensitive`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The order bump ID |

### Response

**Success (200):**

```json
{
  "message": "Order bump deleted successfully"
}
```

### Error Responses

| Code | Message |
|------|---------|
| 400 | Failed to delete order bump |

### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/order_bump/1" \
  -u "username:app_password"
```

---

## Order Bump Model Reference

### Statuses

| Status | Description |
|--------|-------------|
| `active` | Order bump is live and displayed during checkout |
| `draft` | Order bump is saved but not displayed |

### Database Table

Order bumps are stored in the `fct_order_promotions` table with `type = 'order_bump'`:

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment ID |
| `hash` | VARCHAR | Auto-generated unique hash identifier |
| `parent_id` | BIGINT | Parent promotion ID (nullable) |
| `type` | VARCHAR | Promotion type (always `order_bump` for this API) |
| `status` | VARCHAR | Promotion status (`active`, `draft`) |
| `src_object_id` | BIGINT | Product variation ID being offered |
| `src_object_type` | VARCHAR | Source object type identifier |
| `title` | VARCHAR | Display title |
| `description` | TEXT | HTML description shown to customers |
| `conditions` | TEXT (JSON) | JSON-encoded array of display conditions |
| `config` | TEXT (JSON) | JSON-encoded configuration object |
| `priority` | INT | Display priority ordering |
| `created_at` | DATETIME | Creation timestamp (GMT) |
| `updated_at` | DATETIME | Last update timestamp (GMT) |

### Relationships

| Relation | Type | Description |
|----------|------|-------------|
| `product_variant` | BelongsTo | The product variation offered by this bump (`src_object_id` -> `fct_product_variations.id`) |

---

## Permissions Reference

| Endpoint | Permission |
|----------|------------|
| `GET /order_bump` | `store/sensitive` |
| `POST /order_bump` | `store/sensitive` |
| `GET /order_bump/{id}` | `store/sensitive` |
| `PUT /order_bump/{id}` | `store/sensitive` |
| `DELETE /order_bump/{id}` | `store/sensitive` |
