---
title: Labels & Attributes API
description: FluentCart REST API endpoints for managing order labels and product attribute groups/terms.
---

# Labels & Attributes API

Manage order/customer labels for organization, and product attribute groups and terms for product variations.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

---

## Labels

Labels are tags that can be attached to orders, customers, or other entities for organizational purposes. Each label has a unique `value` (name) and can be associated with multiple entities through a polymorphic relationship.

**Prefix:** `labels`
**Policy:** `LabelPolicy`

---

### List Labels

<badge type="tip">GET</badge> `/fluent-cart/v2/labels`

Retrieve all available labels.

- **Permission:** `labels/view`

#### Parameters

No parameters required.

#### Response

```json
{
  "labels": {
    "labels": [
      {
        "id": 1,
        "value": "VIP"
      },
      {
        "id": 2,
        "value": "Wholesale"
      },
      {
        "id": 3,
        "value": "Priority"
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/labels" \
  -u "username:app_password"
```

---

### Create Label

<badge type="warning">POST</badge> `/fluent-cart/v2/labels`

Create a new label and optionally attach it to an entity (order, customer, etc.) in a single request.

- **Permission:** `labels/manage`
- **Request Class:** `LabelRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `value` | string | body | Yes | The label name. Must be unique across all labels. |
| `bind_to_type` | string | body | No | The model class name to attach the label to (e.g., `Order`, `Customer`). Short class name or fully-qualified namespace. |
| `bind_to_id` | string | body | No | The ID of the entity to attach the label to. Required if `bind_to_type` is provided. |

#### Validation Rules

| Field | Rules |
|-------|-------|
| `value` | Required, sanitized text, unique in `fct_label` table |

#### Response

```json
{
  "data": {
    "id": 4,
    "value": "Returning Customer"
  },
  "message": "Label created successfully!"
}
```

#### Error Response

**Duplicate label:**
```json
{
  "errors": {
    "value": ["Label must be unique."]
  }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/labels" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "Returning Customer",
    "bind_to_type": "Order",
    "bind_to_id": "42"
  }'
```

---

### Update Label Selections

<badge type="warning">POST</badge> `/fluent-cart/v2/labels/update-label-selections`

Update the labels attached to a specific entity. This endpoint syncs the label assignments -- labels in `selectedLabels` are attached, and previously attached labels not in the list are detached.

- **Permission:** `labels/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `bind_to_type` | string | body | Yes | The model class name (e.g., `Order`, `Customer`). Short class name or fully-qualified namespace. |
| `bind_to_id` | string | body | Yes | The ID of the entity to update labels for |
| `selectedLabels` | array | body | No | Array of label IDs to attach. Omit or pass empty array to remove all labels. |

#### Response

```json
{
  "message": "Labels Updated Successfully"
}
```

#### Error Response

```json
{
  "message": "Failed To Update Labels"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/labels/update-label-selections" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "bind_to_type": "Order",
    "bind_to_id": "42",
    "selectedLabels": ["1", "3", "4"]
  }'
```

---

## Attribute Groups

Attribute groups represent product attribute categories (e.g., Color, Size, Material) used to create product variations. Each group contains multiple terms.

**Prefix:** `options/attr`
**Policy:** `ProductPolicy`

---

### List Attribute Groups

<badge type="tip">GET</badge> `/fluent-cart/v2/options/attr/groups`

Retrieve a paginated list of attribute groups with optional search, filtering, and sorting.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `search` | object | query | No | Search criteria. Each key is a column name with `column`, `operator`, and `value` fields. Searchable columns: `title`, `slug`. |
| `filters` | object | query | No | Filter criteria. Same format as `search`. Supports `terms_count` with comparison operators. |
| `with` | array | query | No | Relations to eager load (e.g., `["terms"]`) |
| `order_by` | string | query | No | Column to sort by: `title`, `id`, `slug`, `created_at` (default: `title`) |
| `order_type` | string | query | No | Sort direction: `ASC` or `DESC` (default: `ASC`) |
| `per_page` | integer | query | No | Number of results per page (default: `10`) |
| `page` | integer | query | No | Page number for pagination |

#### Response

```json
{
  "groups": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "title": "Color",
        "slug": "color",
        "description": "Product color options",
        "settings": null,
        "created_at": "2025-01-10 08:30:00",
        "updated_at": "2025-01-10 08:30:00",
        "terms_count": 5
      },
      {
        "id": 2,
        "title": "Size",
        "slug": "size",
        "description": "Product size options",
        "settings": null,
        "created_at": "2025-01-10 08:35:00",
        "updated_at": "2025-01-10 08:35:00",
        "terms_count": 4
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/options/attr/groups?with[]=terms&order_by=title&order_type=ASC&per_page=20" \
  -u "username:app_password"
```

---

### Create Attribute Group

<badge type="warning">POST</badge> `/fluent-cart/v2/options/attr/group`

Create a new attribute group.

- **Permission:** `products/create`
- **Request Class:** `AttrGroupRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `title` | string | body | Yes | Group title (max 50 characters). Must be unique. |
| `slug` | string | body | Yes | Group slug (max 50 characters). Must be unique. Used as an identifier in variation data. |
| `description` | string | body | No | Group description |
| `settings` | object | body | No | Additional group settings (stored as JSON) |

#### Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, sanitized text, max 50 chars, unique in `fct_atts_groups` |
| `slug` | Required, sanitized text, max 50 chars, unique in `fct_atts_groups` |
| `description` | Nullable, sanitized textarea |

#### Response

```json
{
  "data": {
    "id": 3,
    "title": "Material",
    "slug": "material",
    "description": "Product material type",
    "settings": null,
    "created_at": "2025-01-15 12:00:00",
    "updated_at": "2025-01-15 12:00:00"
  },
  "message": "Successfully created!"
}
```

#### Error Response

**Duplicate title or slug:**
```json
{
  "errors": {
    "title": ["Group title can not be empty and must be unique."],
    "slug": ["Group slug can not be empty and must be unique."]
  }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/options/attr/group" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Material",
    "slug": "material",
    "description": "Product material type"
  }'
```

---

### Get Attribute Group

<badge type="tip">GET</badge> `/fluent-cart/v2/options/attr/group/{group_id}`

Retrieve a single attribute group by ID, optionally with its terms.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `group_id` | integer | path | Yes | The attribute group ID |
| `with` | array | query | No | Relations to eager load. Supported: `terms` |

#### Response

```json
{
  "group": {
    "id": 1,
    "title": "Color",
    "slug": "color",
    "description": "Product color options",
    "settings": null,
    "created_at": "2025-01-10 08:30:00",
    "updated_at": "2025-01-10 08:30:00",
    "terms": [
      {
        "id": 1,
        "group_id": 1,
        "title": "Red",
        "slug": "red",
        "serial": 1,
        "description": null,
        "settings": null
      },
      {
        "id": 2,
        "group_id": 1,
        "title": "Blue",
        "slug": "blue",
        "serial": 2,
        "description": null,
        "settings": null
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/options/attr/group/1?with[]=terms" \
  -u "username:app_password"
```

---

### Update Attribute Group

<badge type="info">PUT</badge> `/fluent-cart/v2/options/attr/group/{group_id}`

Update an existing attribute group.

- **Permission:** `products/edit`
- **Request Class:** `AttrGroupRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `group_id` | integer | path | Yes | The attribute group ID |
| `title` | string | body | Yes | Updated group title (max 50 characters). Must be unique (excluding the current group). |
| `slug` | string | body | Yes | Updated group slug (max 50 characters). Must be unique (excluding the current group). |
| `description` | string | body | No | Updated group description |
| `settings` | object | body | No | Updated group settings (stored as JSON) |

#### Response

```json
{
  "data": true,
  "message": "Group updated successfully!"
}
```

#### Error Response

```json
{
  "errors": {
    "title": ["Group title can not be empty and must be unique."]
  }
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/options/attr/group/1" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Color Options",
    "slug": "color",
    "description": "Available color options for products"
  }'
```

---

### Delete Attribute Group

<badge type="danger">DELETE</badge> `/fluent-cart/v2/options/attr/group/{group_id}`

Delete an attribute group. The group can only be deleted if none of its terms are currently in use by any product variations. Deleting a group also deletes all its terms.

- **Permission:** `products/delete`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `group_id` | integer | path | Yes | The attribute group ID to delete |

#### Response

```json
{
  "data": "",
  "message": "Attribute group successfully deleted!"
}
```

#### Error Responses

**Group is in use:**
```json
{
  "message": "This group is already in use, can not be deleted.",
  "code": 403
}
```

**Group not found:**
```json
{
  "message": "Attribute group not found in database, failed to remove.",
  "code": 404
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/options/attr/group/3" \
  -u "username:app_password"
```

---

## Attribute Terms

Attribute terms are the individual values within an attribute group (e.g., "Red", "Blue", "Green" within the "Color" group). Terms are ordered by a `serial` field and are used to define product variation options.

**Prefix:** `options/attr/group/{group_id}`
**Policy:** `ProductPolicy`

---

### List Attribute Terms

<badge type="tip">GET</badge> `/fluent-cart/v2/options/attr/group/{group_id}/terms`

Retrieve a paginated list of terms for a specific attribute group.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `group_id` | integer | path | Yes | The attribute group ID |
| `search` | object | query | No | Search criteria. Each key is a column name with `column`, `operator`, and `value` fields. Searchable columns: `title`, `slug`. |
| `filters` | object | query | No | Filter criteria. Same format as `search`. Filterable columns: `group_id`, `serial`, `title`, `slug`, `description`, `settings`. |
| `order_by` | string | query | No | Column to sort by: `id`, `title`, `slug`, `serial`, `created_at` (default: `serial`) |
| `order_type` | string | query | No | Sort direction: `ASC` or `DESC` (default: `ASC`) |
| `per_page` | integer | query | No | Number of results per page (default: `15`) |
| `page` | integer | query | No | Page number for pagination |

#### Response

```json
{
  "terms": {
    "total": 5,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "group_id": 1,
        "serial": 1,
        "title": "Red",
        "slug": "red",
        "description": null,
        "settings": null,
        "created_at": "2025-01-10 08:30:00",
        "updated_at": "2025-01-10 08:30:00"
      },
      {
        "id": 2,
        "group_id": 1,
        "serial": 2,
        "title": "Blue",
        "slug": "blue",
        "description": null,
        "settings": null,
        "created_at": "2025-01-10 08:35:00",
        "updated_at": "2025-01-10 08:35:00"
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/options/attr/group/1/terms?order_by=serial&order_type=ASC" \
  -u "username:app_password"
```

---

### Create Attribute Term

<badge type="warning">POST</badge> `/fluent-cart/v2/options/attr/group/{group_id}/term`

Create a new term within an attribute group.

- **Permission:** `products/create`
- **Request Class:** `AttrTermRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `group_id` | integer | path | Yes | The attribute group ID |
| `title` | string | body | Yes | Term title (max 50 characters). Must be unique across all terms. |
| `slug` | string | body | Yes | Term slug (max 50 characters). Must be unique across all terms. Used as an identifier in variation data. |
| `description` | string | body | No | Term description |
| `serial` | integer | body | No | Sort order position (default: `10`). Lower values appear first. |

#### Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, sanitized text, max 50 chars, unique in `fct_atts_terms` |
| `slug` | Required, sanitized text, max 50 chars, unique in `fct_atts_terms` |
| `description` | Nullable, sanitized textarea |
| `serial` | Nullable, numeric |

#### Response

```json
{
  "data": {
    "id": 6,
    "group_id": 1,
    "serial": 10,
    "title": "Green",
    "slug": "green",
    "description": null,
    "settings": null,
    "created_at": "2025-01-15 12:00:00",
    "updated_at": "2025-01-15 12:00:00"
  },
  "message": "Successfully created!"
}
```

#### Error Responses

**Group not found:**
```json
{
  "message": "Information mismatch.",
  "code": 404
}
```

**Validation error:**
```json
{
  "errors": {
    "title": ["Title is required"],
    "slug": ["Slug is required"]
  }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/options/attr/group/1/term" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Green",
    "slug": "green",
    "serial": 3
  }'
```

---

### Update Attribute Term

<badge type="warning">POST</badge> `/fluent-cart/v2/options/attr/group/{group_id}/term/{term_id}`

Update an existing attribute term.

- **Permission:** `products/edit`
- **Request Class:** `AttrTermRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `group_id` | integer | path | Yes | The attribute group ID |
| `term_id` | integer | path | Yes | The term ID to update |
| `title` | string | body | Yes | Updated term title (max 50 characters). Must be unique (excluding the current term). |
| `slug` | string | body | Yes | Updated term slug (max 50 characters). Must be unique (excluding the current term). |
| `description` | string | body | No | Updated term description |
| `serial` | integer | body | No | Updated sort order position |

#### Response

```json
{
  "data": true,
  "message": "Successfully updated!"
}
```

#### Error Response

**Term not found or group mismatch:**
```json
{
  "message": "Information mismatch.",
  "code": 404
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/options/attr/group/1/term/6" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Forest Green",
    "slug": "forest-green",
    "serial": 3,
    "description": "A deep green color"
  }'
```

---

### Delete Attribute Term

<badge type="danger">DELETE</badge> `/fluent-cart/v2/options/attr/group/{group_id}/term/{term_id}`

Delete an attribute term. The term can only be deleted if it is not currently in use by any product variations.

- **Permission:** `products/delete`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `group_id` | integer | path | Yes | The attribute group ID |
| `term_id` | integer | path | Yes | The term ID to delete |

#### Response

```json
{
  "data": "",
  "message": "Attribute term successfully deleted!"
}
```

#### Error Responses

**Term is in use:**
```json
{
  "message": "This term is already in use, can not be deleted.",
  "code": 403
}
```

**Term not found or group mismatch:**
```json
{
  "message": "Term not found in database, failed to remove.",
  "code": 404
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/options/attr/group/1/term/6" \
  -u "username:app_password"
```

---

### Change Term Sort Order

<badge type="warning">POST</badge> `/fluent-cart/v2/options/attr/group/{group_id}/term/{term_id}/serial`

Move a term up or down in the sort order by incrementing or decrementing its `serial` value.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `group_id` | integer | path | Yes | The attribute group ID |
| `term_id` | integer | path | Yes | The term ID to reorder |
| `direction` | string | body | No | Direction to move: `up` (decrements serial) or `down` (increments serial). Default: `up`. |

#### Behavior

- **`up`** -- Decrements the serial value by 1. If the serial is already `0`, it stays at `0`.
- **`down`** -- Increments the serial value by 1.

#### Response

```json
{
  "data": 2,
  "message": "Serial updated."
}
```

The `data` field contains the new serial value after the change.

#### Error Response

**Term not found or group mismatch:**
```json
{
  "message": "Info mismatch.",
  "code": 404
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/options/attr/group/1/term/2/serial" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "direction": "up"
  }'
```
