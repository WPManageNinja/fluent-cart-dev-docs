---
title: Subscriptions API
description: FluentCart REST API endpoints for managing subscriptions, renewals, and payment methods.
---

# Subscriptions API

Manage recurring subscriptions including listing, cancellation, reactivation, payment method updates, and customer self-service operations.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

> All monetary values are in **cents** (e.g., `$10.00` = `1000`).

---

## Admin Endpoints

Admin endpoints require an authenticated WordPress user with the appropriate FluentCart capability. Authorization is handled by the `OrderPolicy`.

---

### List Subscriptions

<badge type="tip">GET</badge> `/fluent-cart/v2/subscriptions`

Retrieve a paginated list of subscriptions with optional filtering, sorting, and search.

- **Permission:** `subscriptions/view`
- **Policy:** `OrderPolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `page` | integer | query | No | Page number for pagination |
| `per_page` | integer | query | No | Number of records per page (default: 10, max: 200) |
| `search` | string | query | No | Search term. Searches status, subscription ID (`#123`), customer email (`user@example.com`), parent order ID, item name, vendor subscription/customer/plan IDs, payment method, billing interval, and bill count. Also supports operator syntax (e.g., `ID = 5`) |
| `sort_by` | string | query | No | Column to sort by (default: `id`). Must be a fillable column on the Subscription model |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `active_view` | string | query | No | Tab filter. One of: `active`, `pending`, `intended`, `paused`, `trialing`, `canceled`, `failing`, `expiring`, `expired` |
| `filter_type` | string | query | No | Filter mode: `simple` (default) or `advanced` |
| `advanced_filters` | string (JSON) | query | No | JSON-encoded array of advanced filter groups (requires Pro). Supports filtering by subscription, transaction, product, and license properties |
| `with` | array/string | query | No | Eager-load relations. Supports relation names and `{relation}Count` for counts |
| `select` | array/string | query | No | Comma-separated list of columns to select |
| `scopes` | array | query | No | Model scopes to apply |
| `include_ids` | array/string | query | No | Comma-separated IDs that must always be included in results |
| `limit` | integer | query | No | Limit number of records (used with non-paginated queries) |
| `offset` | integer | query | No | Offset for records |
| `user_tz` | string | query | No | User timezone for date filtering (e.g., `America/New_York`) |

#### Search Behavior

The `search` parameter supports several input formats:

| Input Format | Behavior |
|-------------|----------|
| `#123` | Searches by subscription ID |
| `user@example.com` | Searches by customer email |
| `canceled` or `cancelled` | Matches canceled status |
| Any other string | Searches across `parent_order_id`, `item_name`, `vendor_subscription_id`, `vendor_customer_id`, `vendor_plan_id`, `current_payment_method`, `billing_interval`, and `bill_count` |

#### Advanced Filter Options

When using `filter_type=advanced`, the following filter categories are available:

| Category | Filter | Type | Description |
|----------|--------|------|-------------|
| Subscription | `vendor_subscription_id` | text | Filter by vendor subscription ID |
| Subscription | `status` | selections (multiple) | Filter by subscription status |
| Subscription | `variation` | remote tree select | Filter by product variation / order items |
| Subscription | `billing_interval` | selections (multiple) | Filter by billing interval: `yearly`, `half_yearly`, `quarterly`, `monthly`, `weekly`, `daily` |
| Subscription | `current_payment_method` | selections (multiple) | Filter by payment method |
| Subscription | `created_at` | dates | Filter by creation date range |
| Subscription | `next_billing_date` | dates | Filter by next billing date range |
| Subscription | `bill_count` | numeric | Filter by bill count |
| Transaction | `transaction_id` | text (relation) | Filter by transaction vendor charge ID |
| Transaction | `current_payment_method` | selections (multiple) | Filter by transaction payment method |
| Product | `product` | remote tree select | Filter by product variation |
| License | `license_key` | text (relation) | Filter by license key (Pro only) |
| License | `license_status` | selections (multiple) | Filter by license status: `active`, `disabled`, `expired` (Pro only) |

#### Response

```json
{
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "uuid": "abc123-def456",
        "status": "active",
        "item_name": "Pro Plan",
        "parent_order_id": 10,
        "customer_id": 5,
        "product_id": 3,
        "variation_id": 7,
        "vendor_subscription_id": "sub_1234567890",
        "vendor_customer_id": "cus_abc123",
        "vendor_plan_id": "price_xyz789",
        "current_payment_method": "stripe",
        "billing_interval": "monthly",
        "recurring_amount": 2999,
        "bill_times": 0,
        "bill_count": 6,
        "next_billing_date": "2025-02-15 00:00:00",
        "created_at": "2025-01-15 10:30:00",
        "updated_at": "2025-01-15 10:35:00"
      }
    ],
    "per_page": 10,
    "total": 50,
    "last_page": 5
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/subscriptions?page=1&per_page=10&active_view=active" \
  -u "username:app_password"
```

---

### Get Subscription Details

<badge type="tip">GET</badge> `/fluent-cart/v2/subscriptions/{subscriptionOrderId}`

Retrieve the full details of a single subscription including customer addresses, labels, activities, and related orders.

- **Permission:** `subscriptions/view`
- **Policy:** `OrderPolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `subscriptionOrderId` | integer | path | Yes | The subscription ID |

#### Response

The response includes the subscription with eager-loaded relations:
- `labels` -- associated labels
- `activities.user` -- activity log with user info
- `customer.shipping_address` -- customer's primary shipping address
- `customer.billing_address` -- customer's primary billing address
- `order.billing_address` -- parent order's billing address
- `order.shipping_address` -- parent order's shipping address

Also includes:
- `related_orders` -- the parent order and all renewal orders (with order items)
- `selected_labels` -- array of label IDs applied to the subscription

```json
{
  "subscription": {
    "id": 1,
    "uuid": "abc123-def456",
    "status": "active",
    "item_name": "Pro Plan",
    "parent_order_id": 10,
    "customer_id": 5,
    "product_id": 3,
    "variation_id": 7,
    "vendor_subscription_id": "sub_1234567890",
    "vendor_customer_id": "cus_abc123",
    "current_payment_method": "stripe",
    "billing_interval": "monthly",
    "recurring_amount": 2999,
    "bill_times": 0,
    "bill_count": 6,
    "next_billing_date": "2025-02-15 00:00:00",
    "billing_address": { ... },
    "shipping_address": { ... },
    "labels": [ ... ],
    "activities": [ ... ],
    "customer": {
      "id": 5,
      "shipping_address": { ... },
      "billing_address": { ... }
    },
    "related_orders": [
      {
        "id": 10,
        "order_items": [
          {
            "id": 1,
            "order_id": 10,
            "post_title": "Pro Plan",
            "title": "Pro Plan",
            "quantity": 1,
            "payment_type": "subscription",
            "line_meta": { ... }
          }
        ]
      }
    ]
  },
  "selected_labels": [1, 3, 5]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/subscriptions/1" \
  -u "username:app_password"
```

#### Error Response (404)

```json
{
  "message": "Subscription not found",
  "action_text": "Back to Subscription list",
  "action_url": "/subscriptions"
}
```

---

### Cancel Subscription

<badge type="warning">PUT</badge> `/fluent-cart/v2/orders/{order}/subscriptions/{subscription}/cancel`

Cancel a subscription both locally and with the remote payment gateway.

- **Permission:** `subscriptions/manage`
- **Policy:** `OrderPolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | The parent order ID |
| `subscription` | integer | path | Yes | The subscription ID |
| `cancel_reason` | string | body | Yes | Reason for cancellation. Sanitized with `sanitize_text_field` |

#### Response

```json
{
  "message": "Subscription has been cancelled successfully!",
  "subscription": {
    "id": 1,
    "status": "canceled",
    ...
  }
}
```

#### Error Responses

Missing cancel reason:
```json
{
  "message": "Please select cancel reason!"
}
```

Remote cancellation failure (subscription still cancelled locally):
```json
{
  "message": "Subscription cancelled locally. Vendor Response: <vendor error message>"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/orders/10/subscriptions/1/cancel" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"cancel_reason": "Customer requested cancellation"}'
```

---

### Fetch Subscription from Remote

<badge type="warning">PUT</badge> `/fluent-cart/v2/orders/{order}/subscriptions/{subscription}/fetch`

Re-sync a subscription's data from the remote payment gateway (e.g., Stripe, PayPal). Useful for resolving data inconsistencies between local records and the payment provider.

- **Permission:** `subscriptions/view`
- **Policy:** `OrderPolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | The parent order ID |
| `subscription` | integer | path | Yes | The subscription ID |

#### Response

```json
{
  "message": "Subscription fetched successfully from remote payment gateway!",
  "subscription": {
    "id": 1,
    "status": "active",
    "vendor_subscription_id": "sub_1234567890",
    ...
  }
}
```

#### Error Response

```json
{
  "message": "<gateway error message>"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/orders/10/subscriptions/1/fetch" \
  -u "username:app_password"
```

---

### Generate Early Payment Link

<badge type="warning">POST</badge> `/fluent-cart/v2/orders/{order}/subscriptions/{subscription}/early-payment-link`

Generate a URL that allows early payment of remaining installments on an installment-based subscription.

- **Permission:** `subscriptions/manage`
- **Policy:** `OrderPolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | The parent order ID |
| `subscription` | integer | path | Yes | The subscription ID |

#### Conditions

This endpoint requires all of the following conditions to be met:

- Early payment feature must be enabled on the site
- The subscription must belong to the specified order (`parent_order_id` must match `order.id`)
- The subscription must have a finite number of installments (`bill_times > 0`)
- The subscription status must be `active` or `trialing`
- There must be remaining installments (`bill_times - bill_count > 0`)

#### Response

```json
{
  "message": "Early payment link generated.",
  "payment_url": "https://your-site.com/?fluent-cart=early-installment-payment&subscription_hash=abc123-def456"
}
```

#### Error Responses

Feature not enabled:
```json
{
  "message": "Early payment is not enabled for this site."
}
```

Invalid subscription for order:
```json
{
  "message": "Invalid subscription for the specified order."
}
```

Not an installment subscription:
```json
{
  "message": "Early payment is only available for installment subscriptions."
}
```

Subscription not active:
```json
{
  "message": "Subscription must be active to make early payments."
}
```

All installments already paid:
```json
{
  "message": "All installments have already been paid."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/orders/10/subscriptions/1/early-payment-link" \
  -u "username:app_password"
```

---

### Reactivate Subscription

<badge type="warning">PUT</badge> `/fluent-cart/v2/orders/{order}/subscriptions/{subscription}/reactivate`

Reactivate a previously canceled or paused subscription.

- **Permission:** `subscriptions/manage`
- **Policy:** `OrderPolicy`

> **Not Yet Available.** This endpoint is registered but currently returns a "Not available yet" error. It is reserved for future implementation.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | The parent order ID |
| `subscription` | integer | path | Yes | The subscription ID |

#### Response

```json
{
  "message": "Not available yet"
}
```

---

### Pause Subscription

<badge type="warning">PUT</badge> `/fluent-cart/v2/orders/{order}/subscriptions/{subscription}/pause`

Pause an active subscription.

- **Permission:** `subscriptions/manage`
- **Policy:** `OrderPolicy`

> **Not Yet Available.** This endpoint is registered but currently returns a "Not available yet" error. It is reserved for future implementation.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | The parent order ID |
| `subscription` | integer | path | Yes | The subscription ID |

#### Response

```json
{
  "message": "Not available yet"
}
```

---

### Resume Subscription

<badge type="warning">PUT</badge> `/fluent-cart/v2/orders/{order}/subscriptions/{subscription}/resume`

Resume a paused subscription.

- **Permission:** `subscriptions/manage`
- **Policy:** `OrderPolicy`

> **Not Yet Available.** This endpoint is registered but currently returns a "Not available yet" error. It is reserved for future implementation.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order` | integer | path | Yes | The parent order ID |
| `subscription` | integer | path | Yes | The subscription ID |

#### Response

```json
{
  "message": "Not available yet"
}
```

---

## Customer Portal Endpoints

Customer portal endpoints are authenticated via the logged-in WordPress user. The system resolves the customer from the current user session. Authorization is handled by the `CustomerFrontendPolicy`.

All customer portal subscription endpoints use the subscription's **UUID** (not the numeric ID) for identification.

---

### List Customer Subscriptions

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/subscriptions`

Retrieve a paginated list of subscriptions belonging to the currently logged-in customer. Subscriptions with `pending` or `intended` status are excluded.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `page` | integer | query | No | Page number for pagination (default: 1) |
| `per_page` | integer | query | No | Number of records per page (default: 10) |

#### Response

If the user is not logged in, the endpoint returns an empty result set rather than an error:

```json
{
  "message": "Success",
  "subscriptions": {
    "data": [],
    "total": 0,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```

Successful response with data:

```json
{
  "message": "Success",
  "subscriptions": {
    "data": [
      {
        "uuid": "abc123-def456",
        "status": "active",
        "item_name": "Pro Plan",
        "billing_interval": "monthly",
        "recurring_amount": 2999,
        "next_billing_date": "2025-02-15 00:00:00",
        "bill_times": 0,
        "bill_count": 6,
        ...
      }
    ],
    "total": 5,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/subscriptions?page=1&per_page=10" \
  -H "X-WP-Nonce: <nonce>"
```

---

### Get Customer Subscription Details

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/subscriptions/{subscription_uuid}`

Retrieve full details of a specific subscription for the currently logged-in customer, including transactions, upgrade eligibility, and payment method capabilities.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `subscription_uuid` | string | path | Yes | The subscription UUID (alphanumeric with dashes) |

#### Response

```json
{
  "message": "Success",
  "subscription": {
    "uuid": "abc123-def456",
    "status": "active",
    "overridden_status": null,
    "vendor_subscription_id": "sub_1234567890",
    "next_billing_date": "2025-02-15 00:00:00",
    "billing_info": {
      "interval": "monthly",
      "interval_count": 1,
      "amount": 2999,
      "currency": "USD"
    },
    "current_payment_method": "stripe",
    "payment_method": "stripe",
    "payment_info": { ... },
    "bill_times": 0,
    "bill_count": 6,
    "variation_id": 7,
    "product_id": 3,
    "config": { ... },
    "reactivate_url": "https://your-site.com/?fluent-cart=reactivate&hash=abc123",
    "title": "Pro Plan",
    "subtitle": "Monthly",
    "can_upgrade": true,
    "can_switch_payment_method": true,
    "switchable_payment_methods": ["stripe", "paypal"],
    "can_update_payment_method": true,
    "order": {
      "uuid": "order-uuid-here"
    },
    "billing_addresses": [ ... ],
    "recurring_amount": 2999,
    "can_early_pay": false,
    "remaining_installments": 0,
    "transactions": [
      {
        "id": 1,
        "order_id": 10,
        "vendor_charge_id": "ch_abc123",
        "amount": 2999,
        "status": "completed",
        "created_at": "2025-01-15 10:30:00",
        "order": { ... }
      }
    ]
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique subscription identifier |
| `status` | string | Current status: `active`, `trialing`, `canceled`, `paused`, `failing`, `expiring`, `expired`, `completed`, `past_due` |
| `overridden_status` | string/null | Overridden status if manually set |
| `vendor_subscription_id` | string | Remote gateway subscription ID |
| `next_billing_date` | string | Next billing date in GMT |
| `billing_info` | object | Billing interval and amount details |
| `current_payment_method` | string | Current payment method slug |
| `payment_method` | string | Original payment method slug |
| `payment_info` | object | Payment method details (card brand, last4, etc.) |
| `bill_times` | integer | Total number of billing cycles (0 = unlimited) |
| `bill_count` | integer | Number of completed billing cycles |
| `variation_id` | integer | Product variation ID |
| `product_id` | integer | Product ID |
| `config` | object | Subscription configuration |
| `reactivate_url` | string | URL for reactivating a canceled subscription |
| `title` | string | Product title |
| `subtitle` | string | Variation title (if applicable) |
| `can_upgrade` | boolean | Whether the subscription is eligible for plan upgrade |
| `can_switch_payment_method` | boolean | Whether the payment method can be switched to a different gateway |
| `switchable_payment_methods` | array | List of available payment method slugs to switch to |
| `can_update_payment_method` | boolean | Whether the payment method can be updated (e.g., new card) within the same gateway |
| `order.uuid` | string | Parent order UUID |
| `billing_addresses` | array | Billing addresses associated with the subscription |
| `recurring_amount` | integer | Recurring payment amount in cents |
| `can_early_pay` | boolean | Whether early installment payment is available |
| `remaining_installments` | integer | Number of remaining installments (0 if unlimited) |
| `transactions` | array | All transactions related to this subscription and its renewal orders |

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/subscriptions/abc123-def456" \
  -H "X-WP-Nonce: <nonce>"
```

---

### Get Setup Intent Remaining Attempts

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/subscriptions/{subscription_uuid}/setup-intent-attempts`

Check how many Stripe SetupIntent attempts remain for the customer. This is used to enforce rate limiting on payment method update attempts.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user
- **Stripe Only:** Only works when `current_payment_method` is `stripe`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `subscription_uuid` | string | path | Yes | The subscription UUID (alphanumeric with dashes) |

#### Conditions

- Customer must own the subscription
- Subscription's `current_payment_method` must be `stripe`
- Subscription must have a `vendor_customer_id`

#### Response

```json
{
  "remaining": 5
}
```

#### Error Responses

Payment method not supported (non-Stripe subscription):
```json
{
  "message": "Payment method not supported"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/subscriptions/abc123-def456/setup-intent-attempts" \
  -H "X-WP-Nonce: <nonce>"
```

---

### Update Payment Method

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/subscriptions/{subscription_uuid}/update-payment-method`

Update the payment method (e.g., replace the card on file) for an existing subscription within the **same** payment gateway.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `subscription_uuid` | string | path | Yes | The subscription UUID (alphanumeric with dashes) |
| `data` | object | body | Yes | Payment method data object |
| `data.method` | string | body | Yes | Payment gateway slug (e.g., `stripe`, `paypal`) |

Additional fields inside `data` depend on the specific payment gateway implementation (e.g., Stripe token, PayPal billing agreement ID).

#### Response

The response depends on the gateway's `cardUpdate` implementation. On failure:

```json
{
  "message": "Could not update payment method"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/subscriptions/abc123-def456/update-payment-method" \
  -H "X-WP-Nonce: <nonce>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "method": "stripe",
      "payment_method_id": "pm_1234567890"
    }
  }'
```

---

### Get or Create Plan

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/subscriptions/{subscription_uuid}/get-or-create-plan`

Get or create a subscription plan on the remote payment gateway. This is typically used during the payment method switch flow to ensure the target gateway has a matching plan configured.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `subscription_uuid` | string | path | Yes | The subscription UUID (alphanumeric with dashes) |
| `data` | object | body | Yes | Plan data object |
| `data.method` | string | body | Yes | Target payment gateway slug (e.g., `stripe`, `paypal`) |
| `data.reason` | string | body | No | Reason for creating the plan |

#### Response

The response depends on the gateway's `getOrCreateNewPlan` implementation. On failure:

```json
{
  "message": "Could not get or create plan"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/subscriptions/abc123-def456/get-or-create-plan" \
  -H "X-WP-Nonce: <nonce>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "method": "stripe",
      "reason": "switching_payment_method"
    }
  }'
```

---

### Switch Payment Method

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/subscriptions/{subscription_uuid}/switch-payment-method`

Switch a subscription's payment method from one gateway to another (e.g., from Stripe to PayPal). This initiates the switch process, which may require a confirmation step depending on the target gateway.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `subscription_uuid` | string | path | Yes | The subscription UUID (alphanumeric with dashes) |
| `data` | object | body | Yes | Payment method switch data |
| `data.newPaymentMethod` | string | body | Yes | Target payment gateway slug (e.g., `paypal`) |
| `data.currentPaymentMethod` | string | body | Yes | Current payment gateway slug (e.g., `stripe`) |

Additional fields inside `data` depend on the specific payment gateway implementation.

#### Response

The response depends on the gateway's `switchPaymentMethod` implementation. May return a redirect URL or client secret for the new gateway. On failure:

```json
{
  "message": "Could not switch payment method"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/subscriptions/abc123-def456/switch-payment-method" \
  -H "X-WP-Nonce: <nonce>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "newPaymentMethod": "paypal",
      "currentPaymentMethod": "stripe"
    }
  }'
```

---

### Confirm Subscription Switch

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/subscriptions/{subscription_uuid}/confirm-subscription-switch`

Confirm a two-step payment method switch. After the initial `switch-payment-method` call creates a new subscription on the target gateway, this endpoint finalizes the switch by confirming the new subscription and deactivating the old one.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `subscription_uuid` | string | path | Yes | The subscription UUID (alphanumeric with dashes) |
| `data` | object | body | Yes | Confirmation data |
| `data.newVendorSubscriptionId` | string | body | Yes | The new subscription ID from the target payment gateway |
| `data.method` | string | body | Yes | The target payment gateway slug (e.g., `paypal`) |

Additional fields inside `data` depend on the specific payment gateway implementation.

#### Response

The response depends on the gateway's `confirmSubscriptionSwitch` implementation. On failure:

```json
{
  "message": "Could not confirm subscription switch"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/subscriptions/abc123-def456/confirm-subscription-switch" \
  -H "X-WP-Nonce: <nonce>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "newVendorSubscriptionId": "I-ABC123DEF456",
      "method": "paypal"
    }
  }'
```

---

### Cancel Auto-Renew

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/subscriptions/{subscription_uuid}/cancel-auto-renew`

Cancel auto-renewal for a subscription from the customer portal. The subscription is cancelled both locally and with the remote payment gateway. The cancellation reason is automatically set to `cancelled_by_customer`.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `subscription_uuid` | string | path | Yes | The subscription UUID (alphanumeric with dashes) |

No request body is required. The cancellation reason and note are set automatically.

#### Response

```json
{
  "message": "Your subscription has been successfully cancelled"
}
```

#### Error Responses

Customer not found:
```json
{
  "message": "Customer not found"
}
```

Subscription not found (or does not belong to the customer):
```json
{
  "message": "Subscription not found"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/subscriptions/abc123-def456/cancel-auto-renew" \
  -H "X-WP-Nonce: <nonce>"
```

---

### Initiate Early Payment

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/subscriptions/{subscription_uuid}/initiate-early-payment`

Generate a checkout URL for paying remaining installments early on an installment-based subscription.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `subscription_uuid` | string | path | Yes | The subscription UUID (alphanumeric with dashes) |

No request body is required.

#### Conditions

The early payment feature must be enabled, and the subscription must meet the following criteria:
- Pro license must be active
- `bill_times > 0` (finite installments)
- `bill_count < bill_times` (remaining installments exist)
- Status must be `active` or `trialing`

#### Response

```json
{
  "message": "Early payment URL generated.",
  "checkout_url": "https://your-site.com/?fluent-cart=early-installment-payment&subscription_hash=abc123-def456"
}
```

#### Error Responses

Early payment not available:
```json
{
  "message": "Early payment is not available for this subscription."
}
```

Customer not found:
```json
{
  "message": "Customer not found"
}
```

Subscription not found:
```json
{
  "message": "Subscription not found"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/subscriptions/abc123-def456/initiate-early-payment" \
  -H "X-WP-Nonce: <nonce>"
```

---

## Subscription Statuses

| Status | Constant | Description |
|--------|----------|-------------|
| `pending` | `SUBSCRIPTION_PENDING` | Subscription created but not yet activated |
| `intended` | `SUBSCRIPTION_INTENDED` | Payment intent created, awaiting completion |
| `trialing` | `SUBSCRIPTION_TRIALING` | In trial period |
| `active` | `SUBSCRIPTION_ACTIVE` | Active and billing normally |
| `paused` | `SUBSCRIPTION_PAUSED` | Temporarily paused |
| `failing` | `SUBSCRIPTION_FAILING` | Payment attempts are failing |
| `expiring` | `SUBSCRIPTION_EXPIRING` | Approaching expiration |
| `expired` | `SUBSCRIPTION_EXPIRED` | Subscription has expired |
| `canceled` | `SUBSCRIPTION_CANCELED` | Cancelled by admin or customer |
| `past_due` | `SUBSCRIPTION_PAST_DUE` | Payment is overdue |
| `completed` | `SUBSCRIPTION_COMPLETED` | All installments paid |
| `authenticated` | `SUBSCRIPTION_AUTHENTICATED` | Authentication completed (SCA flow) |
| `created` | `SUBSCRIPTION_CREATED` | Created on the remote gateway |

## Hooks and Filters

| Hook | Type | Description |
|------|------|-------------|
| `fluent_cart/subscription/view` | filter | Modify subscription data before returning in admin detail view |
| `fluent_cart/customer_portal/subscription_data` | filter | Modify subscription data before returning in customer portal detail view |
| `fluent_cart/subscriptions_list_filter_query` | filter | Modify the subscription list query before execution |
| `fluent_cart/subscriptions_filter/{provider}/{property}` | action | Custom advanced filter handler for subscription list |
