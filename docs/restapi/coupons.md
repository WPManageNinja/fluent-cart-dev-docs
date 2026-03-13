---
title: Coupons API
description: FluentCart REST API endpoints for managing discount coupons and coupon settings.
---

# Coupons API

Create and manage discount coupons, apply coupons to orders, and configure coupon settings.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/coupons`

**Policy:** `CouponPolicy`

> All monetary values are in **cents** (e.g., `$10.00` = `1000`).

---

## List Coupon Codes

<badge type="tip">GET</badge> `/fluent-cart/v2/coupons/listCoupons`

Retrieve a simple array of active coupon codes. This lightweight endpoint is designed for use in order creation forms and quick coupon lookups.

- **Permission:** `orders/create` or `orders/manage` or `coupons/view`

### Response

```json
{
  "coupons": [
    "SAVE10",
    "WELCOME20",
    "FREESHIP"
  ]
}
```

The response returns only the `code` values of coupons with `active` status.

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/coupons/listCoupons" \
  -u "username:app_password"
```

---

## List Coupons (Paginated)

<badge type="tip">GET</badge> `/fluent-cart/v2/coupons`

Retrieve a paginated list of coupons with optional filtering, sorting, and search. Coupon statuses are automatically updated based on their start/end dates before the response is returned.

- **Permission:** `coupons/view`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `page` | integer | query | No | Page number for pagination |
| `per_page` | integer | query | No | Number of records per page (1-199, default: 10) |
| `search` | string | query | No | Search by coupon title, code, or ID. If the search string contains `%`, it searches percentage-type coupons by amount. Numeric values also match the `amount` field (auto-converted to cents). Supports operator syntax (e.g., `status = active`, `id > 5`) |
| `sort_by` | string | query | No | Column to sort by (default: `id`). Must be a fillable column on the Coupon model |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `active_view` | string | query | No | Tab filter. One of: `active`, `expired` |
| `filter_type` | string | query | No | Filter mode: `simple` (default) or `advanced` |
| `advanced_filters` | string (JSON) | query | No | JSON-encoded array of advanced filter groups (requires Pro) |
| `with` | array/string | query | No | Eager-load relations |
| `select` | array/string | query | No | Comma-separated list of columns to select |
| `include_ids` | array/string | query | No | Comma-separated IDs that must always be included in results |
| `user_tz` | string | query | No | User timezone for date filtering (e.g., `America/New_York`) |

### Active View Filters

| View | Behavior |
|------|----------|
| `active` | Coupons where `status = 'active'` |
| `expired` | Coupons where the `end_date` has passed (and is not null/empty), or where `status != 'active'` |

### Response

```json
{
  "coupons": {
    "total": 25,
    "per_page": 10,
    "current_page": 1,
    "last_page": 3,
    "data": [
      {
        "id": 1,
        "parent": null,
        "title": "10% Off Everything",
        "code": "SAVE10",
        "status": "active",
        "type": "percentage",
        "conditions": {
          "min_purchase_amount": 5000,
          "max_discount_amount": 10000,
          "max_purchase_amount": 0,
          "apply_to_whole_cart": "no",
          "apply_to_quantity": "no",
          "max_uses": 100,
          "max_per_customer": 1,
          "excluded_categories": [],
          "included_categories": [],
          "excluded_products": [],
          "included_products": [],
          "email_restrictions": "",
          "is_recurring": "no"
        },
        "amount": 10,
        "stackable": "yes",
        "priority": 1,
        "use_count": 12,
        "notes": "",
        "show_on_checkout": "yes",
        "start_date": "2025-01-01 00:00:00",
        "end_date": "2025-12-31 23:59:59",
        "created_at": "2025-01-01 10:00:00",
        "updated_at": "2025-06-15 14:30:00",
        "total_items": 12
      }
    ]
  }
}
```

**Notes:**

- `total_items` is an aggregate count of how many times this coupon has been applied (from the `fct_applied_coupons` table).
- For `percentage` type coupons, `amount` represents the percentage value (e.g., `10` = 10%).
- For `fixed` type coupons, `amount` is stored in **cents** (e.g., `1000` = $10.00).

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/coupons?page=1&per_page=20&search=SAVE&active_view=active" \
  -u "username:app_password"
```

---

## Get Coupon Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/coupons/getSettings`

Retrieve the global coupon settings (currently, whether coupon input is shown on the checkout page).

- **Permission:** `coupons/view`

### Response

```json
{
  "show_on_checkout": 1
}
```

| Field | Type | Description |
|-------|------|-------------|
| `show_on_checkout` | integer/boolean | Whether the coupon code input is displayed on the checkout page. `1` or `true` for yes, `0`, `false`, or `null` for no. |

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/coupons/getSettings" \
  -u "username:app_password"
```

---

## View Coupon Details

<badge type="tip">GET</badge> `/fluent-cart/v2/coupons/{id}`

Retrieve detailed information about a specific coupon, including its activity log. The coupon status is automatically updated to `expired` if its `end_date` has passed.

- **Permission:** `coupons/view`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The coupon ID |

### Response

```json
{
  "coupon": {
    "id": 1,
    "parent": null,
    "title": "10% Off Everything",
    "code": "SAVE10",
    "status": "active",
    "type": "percentage",
    "conditions": {
      "min_purchase_amount": 5000,
      "max_discount_amount": 10000,
      "max_purchase_amount": 0,
      "apply_to_whole_cart": "no",
      "apply_to_quantity": "no",
      "max_uses": 100,
      "max_per_customer": 1,
      "excluded_categories": [],
      "included_categories": [],
      "excluded_products": [],
      "included_products": [],
      "email_restrictions": "",
      "is_recurring": "no"
    },
    "amount": 10,
    "stackable": "yes",
    "priority": 1,
    "use_count": 12,
    "notes": "Internal note about this coupon",
    "show_on_checkout": "yes",
    "start_date": "2025-01-01 00:00:00",
    "end_date": "2025-12-31 23:59:59",
    "created_at": "2025-01-01 10:00:00",
    "updated_at": "2025-06-15 14:30:00",
    "activities": [
      {
        "id": 1,
        "title": "Coupon Created",
        "content": "Coupon \"SAVE10\" created by Admin",
        "status": "success",
        "user_id": 1,
        "created_at": "2025-01-01 10:00:00",
        "user": {
          "ID": 1,
          "display_name": "Admin"
        }
      }
    ]
  }
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/coupons/1" \
  -u "username:app_password"
```

---

## Create Coupon

<badge type="warning">POST</badge> `/fluent-cart/v2/coupons`

Create a new discount coupon.

- **Permission:** `coupons/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `title` | string | body | Yes | Coupon display name. Max 200 characters. |
| `code` | string | body | Yes | Unique coupon code. Max 50 characters. Must be unique across all coupons. |
| `type` | string | body | Yes | Discount type. One of: `fixed`, `percentage`, `free_shipping`, `buy_x_get_y` |
| `amount` | number | body | Yes | Discount amount. For `percentage` type: value between 0-100 (e.g., `10` for 10%). For `fixed` type: amount in store currency (e.g., `10.00` for $10). Automatically converted to cents for `fixed` type. |
| `status` | string | body | Yes | Coupon status. One of: `active`, `expired`, `disabled`, `scheduled` |
| `stackable` | string | body | Yes | Whether coupon can be combined with others. `yes` or `no`. Max 50 characters. |
| `show_on_checkout` | string | body | Yes | Whether to display the coupon on checkout. `yes` or `no`. Max 50 characters. |
| `priority` | integer | body | No | Sort priority for discount calculation order. Lower numbers are applied first. Min: 0. |
| `notes` | string | body | No | Internal notes about the coupon. |
| `start_date` | string | body | Conditional | Start date in any parseable datetime format. Required if `end_date` is provided. Automatically converted to GMT. |
| `end_date` | string | body | No | End date in any parseable datetime format. Must be after `start_date` if provided. Automatically converted to GMT. |
| `conditions` | object | body | No | Coupon conditions and restrictions (see below). |

### Conditions Object

| Field | Type | Description |
|-------|------|-------------|
| `min_purchase_amount` | number | Minimum purchase amount in store currency (e.g., `10.00`). Automatically converted to cents. |
| `max_discount_amount` | number | Maximum discount cap in store currency. Automatically converted to cents. Useful for percentage coupons. |
| `max_purchase_amount` | number | Maximum purchase amount allowed. |
| `apply_to_whole_cart` | string | Apply discount to the entire cart. `yes` or `no`. |
| `apply_to_quantity` | string | Apply discount per quantity. `yes` or `no`. |
| `max_uses` | integer | Maximum total uses across all customers. Must be greater than or equal to `max_per_customer`. |
| `max_per_customer` | integer | Maximum uses per individual customer. |
| `included_products` | array | Array of product IDs the coupon is limited to. |
| `excluded_products` | array | Array of product IDs excluded from the coupon. |
| `included_categories` | array | Array of category (term taxonomy) IDs the coupon is limited to. |
| `excluded_categories` | array | Array of category (term taxonomy) IDs excluded from the coupon. |
| `email_restrictions` | string | Email-based restriction. |
| `is_recurring` | string | Whether the coupon applies to subscription renewals. `yes` or `no`. |
| `buy_products` | array | Product IDs for the "buy" part of buy-x-get-y coupons. |
| `get_products` | array | Product IDs for the "get" part of buy-x-get-y coupons. |

### Response

```json
{
  "message": "Coupon created successfully!",
  "data": {
    "id": 5,
    "parent": null,
    "title": "Summer Sale 20%",
    "code": "SUMMER20",
    "status": "active",
    "type": "percentage",
    "conditions": {
      "min_purchase_amount": 2000,
      "max_discount_amount": 5000,
      "max_purchase_amount": 0,
      "apply_to_whole_cart": "yes",
      "apply_to_quantity": "no",
      "max_uses": 500,
      "max_per_customer": 2,
      "excluded_categories": [],
      "included_categories": [],
      "excluded_products": [],
      "included_products": [],
      "email_restrictions": "",
      "is_recurring": "no"
    },
    "amount": 20,
    "stackable": "yes",
    "priority": 1,
    "use_count": 0,
    "notes": "",
    "show_on_checkout": "yes",
    "start_date": "2025-06-01 00:00:00",
    "end_date": "2025-08-31 23:59:59",
    "created_at": "2025-05-25 10:00:00",
    "updated_at": "2025-05-25 10:00:00"
  }
}
```

### Validation Errors

| Field | Rule | Message |
|-------|------|---------|
| `title` | required | Title is required. |
| `code` | required, unique | Code is required. / This coupon code is already in use. |
| `type` | required, in:fixed,percentage,free_shipping,buy_x_get_y | Type is required. |
| `amount` | required, numeric, min:0, max:100 (percentage only) | Amount is required. / For percentage type, the amount should not be greater than 100. |
| `status` | required, in:active,expired,disabled,scheduled | Status is required. |
| `stackable` | required | Stackable is required. |
| `show_on_checkout` | required | Show on checkout is required. |
| `start_date` | required_if:end_date | Start date is required. |
| `end_date` | after start_date | The end date must be after the start date. |
| `conditions.max_uses` | >= max_per_customer | Max uses must be greater than or equal to max per customer. |

### Hooks

- `fluent_cart/coupon_created` -- Fired after a coupon is successfully created.

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/coupons" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Sale 20%",
    "code": "SUMMER20",
    "type": "percentage",
    "amount": 20,
    "status": "active",
    "stackable": "yes",
    "show_on_checkout": "yes",
    "priority": 1,
    "start_date": "2025-06-01 00:00:00",
    "end_date": "2025-08-31 23:59:59",
    "conditions": {
      "min_purchase_amount": 20.00,
      "max_discount_amount": 50.00,
      "max_uses": 500,
      "max_per_customer": 2,
      "apply_to_whole_cart": "yes",
      "is_recurring": "no"
    }
  }'
```

---

## Update Coupon

<badge type="info">PUT</badge> `/fluent-cart/v2/coupons/{id}`

Update an existing coupon. Accepts the same fields as Create Coupon.

- **Permission:** `coupons/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The coupon ID |

The request body accepts the same fields as [Create Coupon](#create-coupon). All validation rules apply identically. The `code` uniqueness check excludes the current coupon (allowing you to keep the same code).

Empty string values for `max_uses`, `max_per_customer`, `max_discount_amount`, and `min_purchase_amount` are automatically converted to `null`.

### Response

```json
{
  "message": "Coupon updated successfully!",
  "data": {
    "id": 5,
    "title": "Summer Sale 25%",
    "code": "SUMMER25",
    "status": "active",
    "type": "percentage",
    "amount": 25,
    "conditions": { ... },
    "stackable": "yes",
    "priority": 1,
    "use_count": 12,
    "notes": "",
    "show_on_checkout": "yes",
    "start_date": "2025-06-01 00:00:00",
    "end_date": "2025-08-31 23:59:59",
    "created_at": "2025-05-25 10:00:00",
    "updated_at": "2025-06-20 11:00:00"
  }
}
```

### Error Responses

| Code | Message |
|------|---------|
| 403 | Please edit a valid coupon! |
| 404 | Coupon not found, please reload the page and try again! |
| 400 | Coupon update failed. |

### Hooks

- `fluent_cart/coupon_updated` -- Fired after a coupon is successfully updated.

### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/coupons/5" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Sale 25%",
    "code": "SUMMER25",
    "type": "percentage",
    "amount": 25,
    "status": "active",
    "stackable": "yes",
    "show_on_checkout": "yes"
  }'
```

---

## Delete Coupon

<badge type="danger">DELETE</badge> `/fluent-cart/v2/coupons/{id}`

Permanently delete a coupon.

- **Permission:** `coupons/delete`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path/body | Yes | The coupon ID. Passed as a URL segment, but read from the request body internally. |

### Response

```json
{
  "message": "Coupon successfully deleted.",
  "data": ""
}
```

### Error Responses

| Code | Message |
|------|---------|
| 403 | Please use a valid coupon ID! |
| 404 | Coupon not found in database, failed to remove. |
| 400 | Coupon deletion failed! |

### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/coupons/5" \
  -u "username:app_password"
```

---

## Apply Coupon

<badge type="warning">POST</badge> `/fluent-cart/v2/coupons/apply`

Apply a coupon code to a set of order line items. This endpoint validates the coupon, checks eligibility for each line item, and returns the recalculated discount breakdown.

- **Permission:** `orders/create` or `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `coupon_code` | string | body | Yes | The coupon code to apply. |
| `order_items` | array | body | Yes | Array of order line item objects. |
| `order_uuid` | string | body | No | UUID of an existing order to apply the coupon to. When provided, previously applied coupons from the order are included. Max 100 characters. |
| `applied_coupons` | array | body | No | Array of coupon IDs that are already applied (but not yet persisted to the order). |
| `customer_email` | string | body | No | Customer email for email-based coupon restrictions. |

### Order Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | No | Line item ID (for existing orders). Min: 1. |
| `order_id` | integer | No | Parent order ID. Min: 1. |
| `post_id` | integer | No | Product post ID. Min: 1. |
| `variation_id` | integer | No | Variation ID. Min: 1. |
| `type` | string | No | Item type. Max 100 characters. |
| `quantity` | integer | No | Item quantity. Min: 1. |
| `title` | string | No | Item title. Max 100 characters. |
| `price` | number | No | Item price in cents. |
| `unit_price` | number | No | Unit price in cents. |
| `item_cost` | number | No | Item cost in cents. |
| `item_total` | number | No | Item total in cents. |
| `tax_amount` | number | No | Tax amount in cents. |
| `discount_total` | number | No | Discount total in cents. |
| `total` | number | No | Total in cents. |
| `line_total` | number | No | Line total in cents. |
| `cart_index` | integer | No | Position in cart. |
| `rate` | number | No | Tax rate. |
| `line_meta` | string | No | Line item metadata. |
| `other_info` | object | No | Additional item info (e.g., `payment_type`, `manage_setup_fee`, `signup_fee`). |

### Response

```json
{
  "applied_coupons": {
    "SAVE10": {
      "id": 1,
      "title": "10% Off",
      "code": "SAVE10",
      "type": "percentage",
      "amount": 10,
      "discount_amount": 500,
      "stackable": "yes",
      "priority": 1
    }
  },
  "calculated_items": [
    {
      "post_id": 42,
      "quantity": 2,
      "price": 2500,
      "discounted_price": 2250,
      "discount_total": 500
    }
  ]
}
```

### Error Responses

The coupon application may fail with a `WP_Error` for reasons including:

- Coupon code not found
- Coupon is expired or inactive
- Coupon usage limit reached
- Minimum purchase amount not met
- Product/category not eligible
- Coupon is not stackable with already-applied coupons

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/coupons/apply" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "coupon_code": "SAVE10",
    "order_items": [
      {
        "post_id": 42,
        "quantity": 2,
        "price": 2500,
        "unit_price": 2500,
        "item_total": 5000,
        "line_total": 5000,
        "other_info": {
          "payment_type": "onetime"
        }
      }
    ],
    "applied_coupons": []
  }'
```

---

## Cancel Coupon

<badge type="warning">POST</badge> `/fluent-cart/v2/coupons/cancel`

Remove a coupon from an order and recalculate the remaining discounts. If an `order_uuid` is provided and the coupon was already persisted to the order, it is deleted from the `fct_applied_coupons` table and the coupon's `use_count` is decremented.

- **Permission:** `orders/create` or `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `coupon_code` | string | body | Yes | The coupon code to cancel. |
| `order_items` | array | body | Yes | Array of current order line item objects (same structure as Apply Coupon). |
| `id` | integer | body | No | The applied coupon record ID (from `fct_applied_coupons`). Required to delete the persisted record from an existing order. |
| `order_uuid` | string | body | No | UUID of the existing order. Max 100 characters. |
| `applied_coupons` | array | body | No | Array of remaining coupon IDs that should stay applied. |
| `customer_email` | string | body | No | Customer email address. |

### Response

```json
{
  "applied_coupons": {
    "WELCOME5": {
      "id": 2,
      "title": "Welcome $5 Off",
      "code": "WELCOME5",
      "type": "fixed",
      "amount": 500,
      "discount_amount": 500,
      "stackable": "yes",
      "priority": 2
    }
  },
  "calculated_items": [
    {
      "post_id": 42,
      "quantity": 2,
      "price": 2500,
      "discounted_price": 2250,
      "discount_total": 500
    }
  ]
}
```

If all coupons are cancelled, `applied_coupons` will be an empty object and `calculated_items` will reflect the original prices.

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/coupons/cancel" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "coupon_code": "SAVE10",
    "id": 15,
    "order_uuid": "abc123-def456",
    "order_items": [
      {
        "post_id": 42,
        "quantity": 2,
        "price": 2500,
        "unit_price": 2500,
        "item_total": 5000,
        "line_total": 5000
      }
    ],
    "applied_coupons": [2]
  }'
```

---

## Re-apply Coupons

<badge type="warning">POST</badge> `/fluent-cart/v2/coupons/re-apply`

Recalculate all previously applied coupons against the current order items. This is used when order items change (e.g., quantity update, item added/removed) and discounts need to be recalculated. If `order_items` is empty, all applied coupons on the order are deleted.

- **Permission:** `orders/create` or `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_uuid` | string | body | No | UUID of the existing order whose applied coupons should be reapplied. |
| `order_items` | array | body | No | Array of current order line item objects. If empty, all applied coupons on the order are removed. Each item key is sanitized as text. |
| `applied_coupons` | array | body | No | Array of coupon IDs to include (in addition to those already on the order). Values are cast to integers. |

### Response

```json
{
  "applied_coupons": {
    "SAVE10": {
      "id": 1,
      "title": "10% Off",
      "code": "SAVE10",
      "type": "percentage",
      "amount": 10,
      "discount_amount": 450,
      "stackable": "yes",
      "priority": 1
    }
  },
  "calculated_items": [
    {
      "post_id": 42,
      "quantity": 1,
      "price": 2500,
      "discounted_price": 2250,
      "discount_total": 250
    },
    {
      "post_id": 55,
      "quantity": 1,
      "price": 2000,
      "discounted_price": 1800,
      "discount_total": 200
    }
  ]
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/coupons/re-apply" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "order_uuid": "abc123-def456",
    "order_items": [
      {
        "post_id": 42,
        "quantity": 1,
        "price": 2500,
        "unit_price": 2500,
        "item_total": 2500,
        "line_total": 2500
      },
      {
        "post_id": 55,
        "quantity": 1,
        "price": 2000,
        "unit_price": 2000,
        "item_total": 2000,
        "line_total": 2000
      }
    ],
    "applied_coupons": [1]
  }'
```

---

## Check Product Eligibility

<badge type="warning">POST</badge> `/fluent-cart/v2/coupons/checkProductEligibility`

Check whether a product is eligible for a set of applied coupons. This is used in the order form to validate that adding a product does not conflict with currently applied coupons.

- **Permission:** `orders/create` or `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `productId` | integer | body | Yes | The product (post) ID to check eligibility for. |
| `appliedCoupons` | array | body | No | Array of coupon codes currently applied. Each code is checked against the product's categories and the coupon's inclusion/exclusion rules. |
| `origin` | string | body | No | The context where the check originates (e.g., `checkout`). |

### Response (Eligible)

```json
{
  "isApplicable": true
}
```

### Response (Not Eligible)

```json
{
  "isApplicable": false,
  "message": "Product A conflicts with SAVE10 coupon. Remove the coupon first."
}
```

### Eligibility Rules

The eligibility check evaluates these rules in order:

1. If the coupon has `included_products` and the product is not in the list, check `included_categories` as a fallback.
2. If no restrictions are set (no included/excluded products or categories), the product is eligible.
3. If the product is in `excluded_products`, it is not eligible.
4. If the product is in `included_products`, it is eligible.
5. If the product's categories overlap with `excluded_categories`, it is not eligible.
6. If `included_categories` is set and the product's categories do not overlap, it is not eligible.

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/coupons/checkProductEligibility" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 42,
    "appliedCoupons": ["SAVE10", "WELCOME5"],
    "origin": "admin_order"
  }'
```

---

## Store Coupon Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/coupons/storeCouponSettings`

Update the global coupon settings. Currently controls whether the coupon input field is displayed on the checkout page.

- **Permission:** `coupons/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `show_on_checkout` | boolean | body | No | Whether to show the coupon input on the checkout page. Any truthy value sets it to `1`, falsy sets to `0`. |

### Response

The response varies based on whether the setting already existed:

**If updating an existing setting:**

```json
true
```

**If creating the setting for the first time:**

```json
{
  "id": 1,
  "meta_key": "fluent_cart_coupon_settings",
  "meta_value": 1,
  "object_id": 0,
  "object_type": ""
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/coupons/storeCouponSettings" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "show_on_checkout": true
  }'
```

---

## Coupon Model Reference

### Coupon Types

| Type | Description | Amount Handling |
|------|-------------|-----------------|
| `fixed` | Fixed amount discount | Stored in **cents** (e.g., `1000` = $10.00) |
| `percentage` | Percentage discount | Stored as percentage (e.g., `10` = 10%). Max: 100. |
| `free_shipping` | Free shipping coupon | Amount is typically `0` |
| `buy_x_get_y` | Buy X Get Y promotion | Uses `conditions.buy_products` and `conditions.get_products` |

### Coupon Statuses

| Status | Description |
|--------|-------------|
| `active` | Coupon is available for use |
| `expired` | Coupon has passed its end date (automatically set) |
| `disabled` | Coupon has been manually disabled |
| `scheduled` | Coupon start date is in the future (automatically set) |

### Status Auto-Update Rules

Coupon statuses are automatically updated when retrieved:

- If `end_date` has passed and status is not `expired`, it is set to `expired`.
- If `start_date` is in the future and status is not `disabled` or `scheduled`, it is set to `scheduled`.
- If `start_date` has passed and status is not `disabled` or `active`, it is set to `active`.

### Stackability

| Value | Behavior |
|-------|----------|
| `yes` | Coupon can be combined with other stackable coupons |
| `no` | Coupon cannot be used alongside any other coupon |

If a non-stackable coupon is already applied, no additional coupons can be added. If a non-stackable coupon is being applied while other coupons are already present, the application is rejected.

### Database Table

Coupons are stored in the `fct_coupons` table with the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment ID |
| `parent` | BIGINT | Parent coupon ID (for variations) |
| `title` | VARCHAR(200) | Display name |
| `code` | VARCHAR(50) | Unique coupon code |
| `status` | VARCHAR(20) | Coupon status |
| `type` | VARCHAR(20) | Discount type |
| `conditions` | TEXT (JSON) | JSON-encoded conditions object |
| `amount` | BIGINT | Discount amount (cents for fixed, percentage for percentage type) |
| `stackable` | VARCHAR(10) | Stackability flag |
| `priority` | INT | Sort priority |
| `use_count` | INT | Current usage count |
| `notes` | TEXT | Internal notes |
| `show_on_checkout` | VARCHAR(10) | Display on checkout flag |
| `start_date` | DATETIME | Start date (GMT) |
| `end_date` | DATETIME | End date (GMT) |
| `created_at` | DATETIME | Creation timestamp |
| `updated_at` | DATETIME | Last update timestamp |

---

## Permissions Reference

| Endpoint | Permission(s) |
|----------|---------------|
| `GET /coupons/listCoupons` | `orders/create` or `orders/manage` or `coupons/view` |
| `GET /coupons` | `coupons/view` |
| `GET /coupons/getSettings` | `coupons/view` |
| `GET /coupons/{id}` | `coupons/view` |
| `POST /coupons` | `coupons/manage` |
| `PUT /coupons/{id}` | `coupons/manage` |
| `DELETE /coupons/{id}` | `coupons/delete` |
| `POST /coupons/apply` | `orders/create` or `orders/manage` |
| `POST /coupons/cancel` | `orders/create` or `orders/manage` |
| `POST /coupons/re-apply` | `orders/create` or `orders/manage` |
| `POST /coupons/checkProductEligibility` | `orders/create` or `orders/manage` |
| `POST /coupons/storeCouponSettings` | `coupons/manage` |

---

## Related Hooks

| Hook | Type | Description |
|------|------|-------------|
| `fluent_cart/coupon_created` | Action | Fired after a coupon is created. Receives array with `data` and `coupon`. |
| `fluent_cart/coupon_updated` | Action | Fired after a coupon is updated. Receives array with `data` and `coupon`. |
| `fluent_cart/coupons_list_filter_query` | Filter | Modify the coupon list query before execution. |
