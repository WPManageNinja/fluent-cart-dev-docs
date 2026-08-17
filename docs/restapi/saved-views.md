---
title: Saved Views API
description: FluentCart Pro REST API endpoints for creating and managing per-user saved filter views on admin tables.
---

# Saved Views API

::: info Pro Feature
All saved-views endpoints require FluentCart Pro to be installed and activated.
:::

A **saved view** is a named, reusable filter configuration attached to one admin table — for example "Unfulfilled orders" on the orders table. Views are per user, can optionally be shared with everyone who can access that table, and are stored as `saved_view` rows in the meta table.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

---

## The `object_type` parameter

Every endpoint in this group is scoped to a single admin table, identified by `object_type`. This is the most important thing to know about these routes:

::: warning `object_type` is read by the policy, not just the controller
`SavedViewsPolicy::verifyRequest()` inspects `object_type` **before the controller runs**. If it is missing or unrecognised, the request is rejected with `403 rest_forbidden` — not a `422` validation error, and not an empty list. A bare `GET /saved-views` with no query string always returns `403`.
:::

Each value maps to a different capability, so access is inherited from the underlying table rather than being a permission of its own:

| `object_type` | Required permission |
|---------------|---------------------|
| `product_table` | `products/view` |
| `order_table` | `orders/view` |
| `customers` | `customers/view` |
| `coupon_table` | `coupons/view` |
| `subscriptions` | `subscriptions/view` |
| `licenses` | `licenses/view` |
| `order_bump_table` | `products/view` |
| `log_table` | `orders/view` |
| `taxes_table` | `manage_options` |
| `shipping_zone_table` | `manage_options` |
| `shipping_class_table` | `manage_options` |

The map is filterable:

```php
add_filter('fluent_cart/saved_views_permission_map', function ($map) {
    $map['my_custom_table'] = 'orders/view';
    return $map;
});
```

For `PUT` and `DELETE` the `object_type` is **not** sent — the policy resolves the record from the ID in the URL and reads the stored `object_type` from it.

---

## Limits and behaviour

- **20 views per user per table.** Creating the 21st returns `422`.
- **Names are capped at 50 characters** and are required.
- **Slugs are generated,** never supplied: `sanitize_title(name)` plus a 6-character random suffix, so two views may share a name safely.
- **`query_params` is allowlisted.** Only `filter_type`, `advanced_filters`, `search` and `active_view` are stored; every other key is silently dropped. An `advanced_filters` value that is not valid JSON is stored as `[[]]`.
- **Only the creator may update or delete a view,** including public ones.
- **Public views** are stored with `object_id = 0` and are visible to every user who passes the table's permission check.

---

## Endpoints

### List Saved Views

<badge type="tip">GET</badge> `/fluent-cart/v2/saved-views`

Returns the current user's own views plus all public views for one table, ordered by ID ascending.

- **Permission:** varies by `object_type`
- **Policy:** `SavedViewsPolicy`

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `object_type` | string | query | **Yes** | The admin table. See the table above. |

---

### Create Saved View

<badge type="tip">POST</badge> `/fluent-cart/v2/saved-views`

Creates a view and returns it with its generated `id` and `slug`. Responds `201`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `object_type` | string | **Yes** | The admin table. |
| `name` | string | **Yes** | Display name, 50 characters or fewer. |
| `description` | string | No | Longer description. |
| `is_public` | boolean | No | Share with everyone who can access the table. Defaults to `false`. |
| `query_params` | object | No | Filter state. Allowlisted keys only. |

---

### Update Saved View

<badge type="warning">PUT</badge> `/fluent-cart/v2/saved-views/{id}`

Partial update — only the fields present in the body are changed. Sending `is_public` re-owns the record (`object_id` flips between `0` and the user ID).

Returns `403` if the authenticated user is not the creator, `404` if no such view exists.

---

### Delete Saved View

<badge type="danger">DELETE</badge> `/fluent-cart/v2/saved-views/{id}`

Permanently deletes the view. Only the creator may delete it.

---

## Response shape

```json
{
  "views": [
    {
      "id": 41,
      "object_type": "order_table",
      "slug": "unfulfilled-orders-x7k2p9",
      "name": "Unfulfilled orders",
      "description": "Paid orders still awaiting fulfillment",
      "query_params": {
        "filter_type": "advanced",
        "advanced_filters": "[[{\"source\":\"order\",\"property\":\"fulfillment_type\",\"operator\":\"=\",\"value\":\"unfulfilled\"}]]",
        "search": "",
        "active_view": "all"
      },
      "is_public": false,
      "owner_id": 1
    }
  ]
}
```

`owner_id` is the creator's WordPress user ID. `is_public` is derived from `object_id` being empty rather than being stored directly.
