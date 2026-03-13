---
title: Orders API
description: FluentCart REST API endpoints for managing orders, payments, refunds, and fulfillment.
---

# Orders API

Manage customer orders including creation, updates, payments, refunds, shipping, and status management.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/orders`

**Policy:** `OrderPolicy`

> All monetary values are in **cents** (e.g., `$10.00` = `1000`).

---

## List Orders

<badge type="tip">GET</badge> `/fluent-cart/v2/orders`

Retrieve a paginated list of orders with optional filtering, sorting, and search.

- **Permission:** `orders/view`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `page` | integer | query | No | Page number for pagination |
| `per_page` | integer | query | No | Number of records per page (default: 10, max: 200) |
| `search` | string | query | No | Search term. Searches invoice number, customer name/email, and order item titles. Also supports operator syntax (e.g., `status = completed`, `id > 5`, `id :: 1-10`) |
| `sort_by` | string | query | No | Column to sort by (default: `id`). Must be a fillable column on the Order model |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `active_view` | string | query | No | Tab filter. One of: `on-hold`, `paid`, `completed`, `processing`, `renewal`, `subscription`, `onetime`, `refunded`, `partially_refunded`, `upgraded_to`, `upgraded_from` |
| `filter_type` | string | query | No | Filter mode: `simple` (default) or `advanced` |
| `advanced_filters` | string (JSON) | query | No | JSON-encoded array of advanced filter groups (requires Pro). Supports filtering by order properties, customer properties, transaction properties, license properties, and UTM properties |
| `with` | array/string | query | No | Eager-load relations. Supports relation names and `{relation}Count` for counts |
| `select` | array/string | query | No | Comma-separated list of columns to select |
| `scopes` | array | query | No | Model scopes to apply |
| `include_ids` | array/string | query | No | Comma-separated IDs that must always be included in results |
| `limit` | integer | query | No | Limit number of records (used with non-paginated queries) |
| `offset` | integer | query | No | Offset for records |
| `user_tz` | string | query | No | User timezone for date filtering (e.g., `America/New_York`) |
| `payment_statuses` | array | query | No | Filter by payment statuses |
| `order_statuses` | array | query | No | Filter by order statuses |
| `shipping_statuses` | array | query | No | Filter by shipping statuses |

### Searchable Fields (Operator Syntax)

The `search` parameter supports operator syntax like `field = value`, `field > value`, or `field :: range`:

| Field | Column | Type | Examples |
|-------|--------|------|----------|
| `id` | `id` | numeric | `id = 1`, `id > 5`, `id :: 1-10` |
| `status` | `status` | string | `status = completed` |
| `invoice` | `status` | string | Invoice number search |
| `payment` | `payment_status` | string | `payment = paid`, `payment = partially_refunded` |
| `payment_by` | `payment_method` | string | `payment_by = stripe`, `payment_by = paypal` |
| `customer` | (custom) | custom | `customer = john` (searches name and email) |
| `license` | (custom) | custom | `license = ff-78d47b3fed89bda25cdc5b60d0298d60` (Pro only) |

### Response

```json
{
  "orders": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "uuid": "abc123-def456",
        "invoice_no": "INV-001",
        "status": "completed",
        "payment_status": "paid",
        "payment_method": "stripe",
        "type": "payment",
        "fulfillment_type": "digital",
        "currency": "USD",
        "subtotal": 5000,
        "total_amount": 5000,
        "total_paid": 5000,
        "total_refund": 0,
        "shipping_total": 0,
        "tax_total": 0,
        "manual_discount_total": 0,
        "coupon_discount_total": 0,
        "customer_id": 1,
        "customer": { ... },
        "created_at": "2025-01-15 10:30:00",
        "updated_at": "2025-01-15 10:35:00"
      }
    ],
    "per_page": 10,
    "total": 100,
    "last_page": 10
  }
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/orders?page=1&per_page=10&sort_by=id&sort_type=desc" \
  -u "username:app_password"
```

---

## Calculate Shipping

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/calculate-shipping`

Calculate shipping charges for order items with a specific shipping method.

- **Permission:** `orders/create` or `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_items` | array | body | Yes | Array of order items, each with `id` (variation ID) and `quantity` |
| `shipping_id` | integer | body | Yes | ID of the shipping method to calculate charges for |

### Response

```json
{
  "message": "Shipping updated",
  "shipping_charge": 500,
  "order_items": {
    "1": {
      "id": 1,
      "quantity": 2,
      "shipping_charge": 500,
      "unit_price": 2500,
      "other_info": {},
      "discount_total": 0,
      "fulfillment_type": "physical"
    }
  }
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/calculate-shipping" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "order_items": [{"id": 1, "quantity": 2}],
    "shipping_id": 5
  }'
```

---

## Create Order

<badge type="warning">POST</badge> `/fluent-cart/v2/orders`

Create a new order manually from the admin panel.

- **Permission:** `orders/create`
- **Request Class:** `OrderRequest`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customer_id` | integer | body | Yes | ID of the customer placing the order |
| `order_items` | array | body | Yes | Array of order items (see Order Items below) |
| `status` | string | body | No | Order status (max 50 chars) |
| `invoice_no` | string | body | No | Invoice number (max 100 chars) |
| `fulfillment_type` | string | body | No | Fulfillment type (max 50 chars) |
| `type` | string | body | No | Order type (max 50 chars) |
| `payment_method` | string | body | No | Payment method key (max 50 chars) |
| `payment_method_title` | string | body | No | Payment method display title (max 50 chars) |
| `payment_status` | string | body | No | Payment status (max 50 chars) |
| `currency` | string | body | No | Currency code, e.g., `USD` (max 10 chars) |
| `subtotal` | numeric | body | No | Order subtotal in cents |
| `discount_tax` | numeric | body | No | Discount tax amount in cents |
| `manual_discount_total` | numeric | body | No | Manual discount total in cents |
| `coupon_discount_total` | numeric | body | No | Coupon discount total in cents |
| `shipping_tax` | numeric | body | No | Shipping tax in cents |
| `shipping_total` | numeric | body | No | Shipping total in cents |
| `tax_total` | numeric | body | No | Tax total in cents |
| `total_amount` | numeric | body | No | Total order amount in cents |
| `rate` | numeric | body | No | Exchange rate |
| `note` | string | body | No | Order note (max 5000 chars) |
| `uuid` | string | body | No | Order UUID (max 100 chars) |
| `ip_address` | string | body | No | Customer IP address (max 100 chars) |
| `completed_at` | string | body | No | Completion timestamp (max 100 chars) |
| `refunded_at` | string | body | No | Refund timestamp (max 100 chars) |
| `user_tz` | string | body | No | User timezone (max 50 chars) |
| `discount` | object | body | No | Manual discount details |
| `shipping` | array | body | No | Shipping method details |
| `applied_coupon` | array | body | No | Applied coupon details |
| `trigger` | string | body | No | Trigger source |

#### Order Items Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | No | Order item ID (for updates) |
| `order_id` | integer | No | Parent order ID |
| `post_id` | integer | No | WordPress post ID of the product |
| `variation_id` | integer | No | Product variation ID |
| `object_id` | integer | No | Object reference ID |
| `fulfillment_type` | string | No | `digital` or `physical` |
| `payment_type` | string | No | Payment type (max 100 chars), e.g., `subscription` |
| `quantity` | integer | No | Item quantity (min: 1) |
| `post_title` | string | No | Product title (max 255 chars) |
| `title` | string | No | Item title (max 255 chars) |
| `price` | numeric | No | Item price in cents |
| `unit_price` | numeric | No | Unit price in cents |
| `shipping_charge` | numeric | No | Shipping charge in cents |
| `item_cost` | numeric | No | Item cost in cents |
| `item_total` | numeric | No | Item total in cents |
| `tax_amount` | numeric | No | Tax amount in cents |
| `discount_total` | numeric | No | Discount total in cents |
| `total` | numeric | No | Total in cents |
| `line_total` | numeric | No | Line total in cents |
| `cart_index` | integer | No | Cart position index |
| `rate` | numeric | No | Exchange rate |
| `line_meta` | array | No | Line item metadata |
| `other_info` | array | No | Additional item information |

#### Discount Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Discount type (max 100 chars) |
| `value` | numeric | No | Discount value |
| `label` | string | No | Discount label (max 100 chars) |
| `reason` | string | No | Discount reason (max 100 chars) |
| `action` | string | No | Discount action (max 100 chars) |

#### Shipping Object (array)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Shipping type (max 100 chars) |
| `rate_name` | string | No | Shipping rate name (max 100 chars) |
| `custom_price` | numeric | No | Custom shipping price in cents |

#### Applied Coupon Object (array)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | No | Applied coupon record ID |
| `order_id` | integer | No | Order ID |
| `coupon_id` | integer | Yes | Coupon ID (min: 1) |
| `code` | string | Yes | Coupon code (max 100 chars) |
| `amount` | numeric | No | Coupon amount |
| `discounted_amount` | numeric | Yes | Discounted amount in cents |
| `discount` | numeric | No | Discount value |
| `stackable` | integer | Yes | Whether coupon is stackable (0 or 1) |
| `priority` | integer | No | Coupon priority |
| `max_uses` | integer | No | Maximum uses |
| `use_count` | integer | No | Current use count |
| `max_per_customer` | integer | No | Max uses per customer (min: 1) |
| `min_purchase_amount` | numeric | No | Minimum purchase amount in cents |
| `max_discount_amount` | numeric | No | Maximum discount amount in cents |
| `notes` | string | No | Coupon notes (max 100 chars) |

### Response

```json
{
  "message": "Order created successfully!",
  "order_id": 42,
  "uuid": "abc123-def456-ghi789"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "order_items": [
      {
        "post_id": 10,
        "variation_id": 5,
        "object_id": 5,
        "quantity": 1,
        "unit_price": 2500,
        "price": 2500,
        "item_total": 2500,
        "total": 2500,
        "line_total": 2500,
        "title": "Pro License"
      }
    ],
    "subtotal": 2500,
    "total_amount": 2500,
    "payment_method": "offline_payment"
  }'
```

---

## Bulk Actions

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/do-bulk-action`

Perform bulk actions on multiple orders at once.

- **Permission:** `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `action` | string | body | Yes | Bulk action to perform. One of: `delete_orders`, `change_shipping_status`, `change_order_status`, `capture_payments`, `change_payment_status` |
| `order_ids` | array | body | Yes | Array of order IDs to act upon |
| `new_status` | string | body | Conditional | New status value. Required for `change_shipping_status`, `change_order_status`, and `change_payment_status` actions |
| `manage_stock` | string | body | No | Whether to manage stock on status change (`true`/`false`) |

### Supported Actions

| Action | Description | Valid `new_status` Values |
|--------|-------------|--------------------------|
| `delete_orders` | Delete selected orders and related data | N/A |
| `change_shipping_status` | Update shipping status | Valid shipping statuses (e.g., `shipped`, `delivered`) |
| `change_order_status` | Update order status | `completed`, `processing`, `on-hold`, `canceled` |
| `capture_payments` | Capture authorized payments | N/A |
| `change_payment_status` | Update payment status | Valid transaction statuses |

### Response

```json
{
  "message": "Order Status has been changed for the selected orders"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/do-bulk-action" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "change_order_status",
    "order_ids": [1, 2, 3],
    "new_status": "processing"
  }'
```

---

## Mark Order as Paid

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/{order}/mark-as-paid`

Mark a pending order as paid, creating or updating the transaction record.

- **Permission:** `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | Order ID |
| `payment_method` | string | body | No | Payment method used (e.g., `offline_payment`, `stripe`) |
| `vendor_charge_id` | string | body | No | External payment reference/charge ID |
| `transaction_type` | string | body | No | Transaction type identifier |
| `mark_paid_note` | string | body | No | Note to attach to the order |

### Response

```json
{
  "message": "Order has been marked as paid"
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 423 | Order has already been paid |
| 423 | Unable to mark paid for canceled order |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/42/mark-as-paid" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "offline_payment",
    "vendor_charge_id": "CHK-12345",
    "mark_paid_note": "Payment received via bank transfer"
  }'
```

---

## Generate Missing Licenses

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/{order}/generate-missing-licenses`

Generate any missing license keys for an order's items (requires Pro with licensing module).

- **Permission:** `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | Order ID |

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Order not found |
| 400 | No missing licenses found! |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/42/generate-missing-licenses" \
  -u "username:app_password"
```

---

## Get Order Details

<badge type="tip">GET</badge> `/fluent-cart/v2/orders/{order_id}`

Retrieve detailed information about a specific order, including items, transactions, addresses, subscriptions, and activities.

- **Permission:** `orders/view`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_id` | integer | path | Yes | Order ID |

### Response

```json
{
  "order": {
    "id": 42,
    "uuid": "abc123-def456",
    "invoice_no": "INV-042",
    "status": "completed",
    "payment_status": "paid",
    "payment_method": "stripe",
    "type": "payment",
    "fulfillment_type": "digital",
    "currency": "USD",
    "subtotal": 5000,
    "total_amount": 5000,
    "total_paid": 5000,
    "total_refund": 0,
    "shipping_total": 0,
    "tax_total": 0,
    "manual_discount_total": 0,
    "coupon_discount_total": 0,
    "customer_id": 1,
    "customer": { ... },
    "order_items": [ ... ],
    "transactions": [ ... ],
    "billing_address": { ... },
    "shipping_address": { ... },
    "subscriptions": [ ... ],
    "activities": [ ... ],
    "labels": [ ... ],
    "applied_coupons": [ ... ],
    "children": [ ... ],
    "parent_order": null,
    "order_operation": { ... },
    "receipt_url": "https://example.com/receipt/?order_hash=abc123",
    "custom_checkout_url": "https://example.com/checkout/?payment_hash=...",
    "has_missing_licenses": false,
    "created_at": "2025-01-15 10:30:00",
    "updated_at": "2025-01-15 10:35:00"
  },
  "discount_meta": { ... },
  "shipping_meta": { ... },
  "order_settings": {},
  "selected_labels": [1, 2],
  "tax_id": null
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/orders/42" \
  -u "username:app_password"
```

---

## Update Order

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/{order_id}`

Update an existing order's details, items, discounts, shipping, and coupons. Subscription orders cannot be edited.

- **Permission:** `orders/manage`
- **Request Class:** `OrderRequest`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_id` | integer | path | Yes | Order ID |
| `customer_id` | integer | body | Yes | Customer ID |
| `order_items` | array | body | Yes | Updated array of order items (same structure as Create Order) |
| `status` | string | body | No | Order status (cannot be set to `completed`) |
| `payment_status` | string | body | No | Payment status |
| `subtotal` | numeric | body | No | Updated subtotal in cents |
| `total_amount` | numeric | body | No | Updated total amount in cents |
| `total_paid` | numeric | body | No | Total amount already paid in cents |
| `shipping_total` | numeric | body | No | Updated shipping total in cents |
| `tax_total` | numeric | body | No | Updated tax total in cents |
| `manual_discount_total` | numeric | body | No | Manual discount in cents |
| `coupon_discount_total` | numeric | body | No | Coupon discount in cents |
| `discount` | object | body | No | Discount details (see Create Order) |
| `shipping` | array | body | No | Shipping details (see Create Order) |
| `applied_coupon` | array | body | No | Applied coupon details (see Create Order) |
| `deletedItems` | array | body | No | Array of order item IDs to remove |
| `couponCalculation` | array | body | No | Coupon calculation details |

All other fields from `OrderRequest` are also accepted (see Create Order).

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Subscription Order cannot be edited |
| 400 | Completed status can not be updated |

### Response

```json
{
  "message": "Order updated successfully",
  "order": { ... }
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/42" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "order_items": [
      {
        "id": 10,
        "order_id": 42,
        "quantity": 2,
        "unit_price": 2500,
        "line_total": 5000
      }
    ],
    "subtotal": 5000,
    "total_amount": 5000
  }'
```

---

## Update Order Address ID

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/{order_id}/update-address-id`

Assign an existing customer address to an order's billing or shipping address.

- **Permission:** `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_id` | integer | path | Yes | Order ID |
| `address_id` | integer | body | Yes | Customer address ID to assign |
| `address_type` | string | body | No | Address type: `billing` (default) or `shipping` |

### Response

```json
{
  "message": "Address updated successfully"
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Order not found |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/42/update-address-id" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "address_id": 5,
    "address_type": "billing"
  }'
```

---

## Refund Order

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/{order_id}/refund`

Process a full or partial refund for an order. Supports both gateway refunds and manual refunds, with optional subscription cancellation.

- **Permission:** `orders/can_refund`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_id` | integer | path | Yes | Order ID |
| `refund_info` | object | body | Yes | Refund details object |
| `refund_info.transaction_id` | integer | body | Yes | ID of the transaction to refund |
| `refund_info.amount` | numeric | body | Yes | Refund amount in **decimal** format (e.g., `10.00` not cents). Will be converted to cents internally |
| `refund_info.cancelSubscription` | string | body | No | Set to `"true"` to cancel associated subscription |

### Response

```json
{
  "fluent_cart_refund": {
    "status": "success",
    "message": "Refund processed on FluentCart."
  },
  "gateway_refund": {
    "status": "success",
    "message": "Refund processed on Stripe"
  },
  "subscription_cancel": {
    "status": "success",
    "message": "Subscription cancelled successfully"
  }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Order can not be refunded |
| 422 | Transaction ID is required |
| 422 | Refund amount is required |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/42/refund" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "refund_info": {
      "transaction_id": 15,
      "amount": 25.00,
      "cancelSubscription": "true"
    }
  }'
```

---

## Change Customer

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/{order_id}/change-customer`

Reassign an order to a different existing customer. Updates all connected orders (parent/child/renewals), subscriptions, and customer statistics.

- **Permission:** `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_id` | integer | path | Yes | Order ID |
| `customer_id` | integer | body | Yes | New customer ID to assign |

### Response

```json
{
  "message": "Customer changed successfully"
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 423 | Customer id is required |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/42/change-customer" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 15
  }'
```

---

## Create and Change Customer

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/{order_id}/create-and-change-customer`

Create a new customer and immediately assign them to the order. Combines customer creation with order reassignment.

- **Permission:** `orders/manage`
- **Request Class:** `CustomerRequest`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_id` | integer | path | Yes | Order ID |
| `first_name` | string | body | Conditional | Customer first name (max 255 chars). Required if full name mode is disabled |
| `last_name` | string | body | No | Customer last name (max 255 chars) |
| `full_name` | string | body | Conditional | Customer full name (max 255 chars). Required if full name mode is enabled |
| `email` | string | body | Yes | Customer email address (max 255 chars, must be unique) |
| `city` | string | body | No | Customer city |
| `user_id` | integer | body | No | WordPress user ID to link |
| `status` | string | body | No | Customer status |
| `country` | string | body | No | Customer country |
| `state` | string | body | No | Customer state |
| `postcode` | string | body | No | Customer postal code |
| `notes` | string | body | No | Customer notes |

### Response

```json
{
  "message": "Customer changed successfully"
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 422 | Email is required |
| 422 | Email already exists |
| 422 | First Name is required |
| 400 | Failed to attach customer |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/42/create-and-change-customer" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com"
  }'
```

---

## Delete Order

<badge type="danger">DELETE</badge> `/fluent-cart/v2/orders/{order_id}`

Permanently delete an order and all associated data (transactions, items, meta, addresses, coupons, cart data, download permissions, labels). For subscription orders, also deletes all child renewal orders and subscriptions.

- **Permission:** `orders/delete`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_id` | integer | path | Yes | Order ID to delete |

### Response

```json
{
  "message": "Order 42 deleted successfully",
  "data": {
    "order_id": 42,
    "invoice_no": "INV-042",
    "status": "success"
  },
  "errors": []
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | Order not found |
| 400 | (Various reasons why order cannot be deleted) |

### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/orders/42" \
  -u "username:app_password"
```

---

## Update Statuses

<badge type="info">PUT</badge> `/fluent-cart/v2/orders/{order}/statuses`

Update the order status or shipping status for an order.

- **Permission:** `orders/manage_statuses`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | Order ID |
| `action` | string | body | Yes | Status change type: `change_order_status` or `change_shipping_status` |
| `statuses` | object | body | Yes | Status values object |
| `statuses.order_status` | string | body | Conditional | New order status. Required when `action` is `change_order_status`. One of: `completed`, `processing`, `on-hold`, `canceled` |
| `statuses.shipping_status` | string | body | Conditional | New shipping status. Required when `action` is `change_shipping_status` |
| `manage_stock` | string/boolean | body | No | Whether to adjust stock levels on status change |

### Response

```json
{
  "message": "Status has been updated",
  "data": { ... }
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Order already has the same status |
| 400 | You cannot change the order status once it has been canceled |

### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/orders/42/statuses" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "change_order_status",
    "statuses": {
      "order_status": "processing"
    },
    "manage_stock": true
  }'
```

---

## Get Order Transactions

<badge type="tip">GET</badge> `/fluent-cart/v2/orders/{order}/transactions`

Retrieve all transactions for an order. This endpoint returns the full order details (same as Get Order Details), which includes the `transactions` relation.

- **Permission:** `orders/view`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | Order ID |

### Response

Same response structure as [Get Order Details](#get-order-details), with the `order.transactions` array populated.

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/orders/42/transactions" \
  -u "username:app_password"
```

---

## Accept Dispute

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/{order}/transactions/{transaction_id}/accept-dispute/`

Accept a payment dispute (chargeback) for a specific transaction.

- **Permission:** `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | Order ID |
| `transaction_id` | integer | path | Yes | Transaction ID with the dispute |
| `dispute_note` | string | body | No | Note about the dispute acceptance |

### Response

```json
{
  "message": "Dispute accepted!"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/42/transactions/15/accept-dispute/" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "dispute_note": "Customer provided valid reason for dispute"
  }'
```

---

## Get Single Transaction

<badge type="tip">GET</badge> `/fluent-cart/v2/orders/{id}/transactions/{transaction_id}`

Retrieve details of a specific transaction within an order. This endpoint returns the full order details (same as Get Order Details).

- **Permission:** `orders/view`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | Order ID |
| `transaction_id` | integer | path | Yes | Transaction ID |

### Response

Same response structure as [Get Order Details](#get-order-details).

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/orders/42/transactions/15" \
  -u "username:app_password"
```

---

## Update Order Address

<badge type="info">PUT</badge> `/fluent-cart/v2/orders/{order}/address/{id}`

Update an existing order address (billing or shipping) with new address data.

- **Permission:** `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | Order ID |
| `id` | integer | path | Yes | Order address ID |
| `order_id` | integer | body | Yes | Order ID (must match the path parameter) |
| `name` | string | body | No | Full name |
| `first_name` | string | body | No | First name |
| `last_name` | string | body | No | Last name |
| `full_name` | string | body | No | Full name |
| `address_1` | string | body | No | Address line 1 |
| `address_2` | string | body | No | Address line 2 |
| `city` | string | body | No | City |
| `state` | string | body | No | State/province |
| `postcode` | string | body | No | Postal/ZIP code |
| `country` | string | body | No | Country code |

### Response

```json
{
  "message": "Address updated successfully"
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | The address information does not match |

### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/orders/42/address/5" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 42,
    "first_name": "John",
    "last_name": "Doe",
    "address_1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postcode": "10001",
    "country": "US"
  }'
```

---

## Update Transaction Status

<badge type="info">PUT</badge> `/fluent-cart/v2/orders/{order}/transactions/{transaction}/status`

Update the payment status of a specific transaction and sync the order's payment status accordingly.

- **Permission:** `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | Order ID |
| `transaction` | integer | path | Yes | Transaction ID |
| `status` | string | body | Yes | New transaction status (e.g., `succeeded`, `pending`, `refunded`, `failed`) |

### Response

```json
{
  "transaction": {
    "id": 15,
    "order_id": 42,
    "status": "succeeded",
    "total": 5000,
    "payment_method": "stripe",
    ...
  },
  "message": "Payment status has been successfully updated"
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 400 | Transaction already has the same status |
| 400 | The selected transaction does not match with the provided order |

### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/orders/42/transactions/15/status" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "succeeded"
  }'
```

---

## Create Custom Order Item

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/{order}/create-custom`

Add a custom product/item to an existing order.

- **Permission:** `orders/create`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | Order ID |
| `product` | object | body | Yes | Product data to add as a custom item |

### Response

Returns the result of processing the custom item addition.

### Error Responses

| Status | Message |
|--------|---------|
| 423 | (Error message from processing) |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/42/create-custom" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "title": "Custom Service",
      "price": 1500,
      "quantity": 1
    }
  }'
```

---

## Get Shipping Methods

<badge type="tip">GET</badge> `/fluent-cart/v2/orders/shipping_methods`

Retrieve available shipping methods, optionally filtered by country and state. Returns methods applicable to the specified location and all other enabled methods separately.

- **Permission:** `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | query | No | Country code to filter applicable shipping methods (e.g., `US`, `GB`) |
| `state` | string | query | No | State/province code for more specific filtering |
| `order_items` | array | query | No | Array of order items (each with `id` and `quantity`) to calculate shipping charges |

### Response

```json
{
  "shipping_methods": [
    {
      "id": 1,
      "title": "Standard Shipping",
      "is_enabled": "1",
      "shipping_charge": 500,
      ...
    }
  ],
  "other_shipping_methods": [
    {
      "id": 2,
      "title": "International Shipping",
      "is_enabled": "1",
      "shipping_charge": 1500,
      ...
    }
  ]
}
```

When `country_code` is empty, `shipping_methods` will be an empty array and all enabled methods appear in `other_shipping_methods`.

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/orders/shipping_methods?country_code=US&state=CA" \
  -u "username:app_password"
```

---

## Sync Order Statuses

<badge type="info">PUT</badge> `/fluent-cart/v2/orders/{order}/sync-statuses`

Synchronize the order's status and payment status based on the latest transaction data. Useful for resolving status mismatches.

- **Permission:** `orders/manage`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | Order ID |

### Response

```json
{
  "message": "Order statuses synced successfully",
  "order": { ... },
  "payment_status": "paid",
  "status": "processing"
}
```

### Error Responses

| Status | Message |
|--------|---------|
| 404 | No transaction found for this order |

### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/orders/42/sync-statuses" \
  -u "username:app_password"
```
