---
title: Dashboard API
description: FluentCart Dashboard API for retrieving dashboard statistics and onboarding data.
---

# Dashboard API

The Dashboard API provides endpoints for retrieving dashboard statistics and onboarding data in FluentCart.

## Base URL

All Dashboard API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

Dashboard API endpoints require:
- **Policy**: `AdminPolicy` or `DashboardPolicy`
- **Permissions**: Varies by endpoint (see individual endpoints)

## Dashboard Statistics

### Get Dashboard Stats

Retrieve dashboard statistics and widgets.

**Endpoint:** `GET /dashboard/stats`

**Policy**: `DashboardPolicy`

**Permission Required**: `dashboard_stats/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | No | Optional parameters for filtering stats |

#### Response

```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "title": "Total Revenue",
        "value": "10000.00",
        "currency": "USD"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/dashboard/stats" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Notes

- Dashboard stats are filtered based on user permissions
- Onboarding steps are automatically marked as completed based on store configuration
- The onboarding endpoint checks for:
  - Page setup completion
  - Store information completion
  - Product creation
  - Payment method setup

---

## Widgets

### Get Widgets

Retrieve widgets based on a filter type.

**Endpoint:** `GET /widgets`

**Permission Required**: `customers/view` OR `orders/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | Yes | Widget filter identifier (e.g., `'fluent_cart_single_customer'`, `'fluent_cart_single_order'`) |
| `data` | object | No | Additional data to pass to the widget filter |

#### Response

```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "title": "Customer Overview",
        "body": "<div>Customer statistics...</div>"
      },
      {
        "title": "Recent Orders",
        "body": "<div>Order list...</div>"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/widgets?filter=fluent_cart_single_customer&data[customer_id]=123" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

#### Widget Filters

Widgets are retrieved through WordPress filters. Common filter names include:

- `fluent_cart_single_customer` - Widgets for a single customer view
- `fluent_cart_single_order` - Widgets for a single order view
- `fluent_cart_dashboard` - Dashboard widgets

The `fluent_cart_` prefix is automatically removed from the filter parameter.

---

## Welcome

### Get Welcome Message

Retrieve the welcome message.

**Endpoint:** `GET /welcome`

**Permission Required**: None (public endpoint)

#### Response

The response structure depends on the WelcomeController implementation. Typically returns a welcome message or configuration.

```json
{
  "message": "Welcome to FluentCart API",
  "version": "2.0"
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/welcome"
```

---

## Onboarding

### Get Onboarding Data

Retrieve onboarding configuration including available pages, currencies, and default settings.

**Endpoint:** `GET /onboarding/`

**Permission Required**: `AdminPolicy`

#### Response

```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "key": "checkout_page_id",
        "title": "Checkout Page",
        "page_id": null
      },
      {
        "key": "customer_profile_page_id",
        "title": "Customer Profile Page",
        "page_id": null
      }
    ],
    "currencies": [
      {
        "code": "USD",
        "name": "US Dollar",
        "symbol": "$"
      }
    ],
    "default_settings": {
      "store_name": "My Store",
      "store_email": "store@example.com"
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/onboarding/" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Save Onboarding Settings

Save initial store settings during onboarding.

**Endpoint:** `POST /onboarding/`

**Permission Required**: `AdminPolicy`

#### Request Body

The request body should contain store settings to save. Can include:
- Store name, email, address
- Currency settings
- Page IDs
- Category selection (optional, triggers dummy product creation)

```json
{
  "store_name": "My New Store",
  "store_email": "store@example.com",
  "currency": "USD",
  "category": "electronics"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Store has been updated successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/onboarding/" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "store_name": "My New Store",
    "store_email": "store@example.com",
    "currency": "USD"
  }'
```

### Create Pages

Create all required FluentCart pages at once.

**Endpoint:** `POST /onboarding/create-pages`

**Permission Required**: `AdminPolicy`

#### Response

Returns the same structure as `GET /onboarding/` with updated page IDs.

```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "key": "checkout_page_id",
        "title": "Checkout Page",
        "page_id": 123
      }
    ],
    "currencies": [],
    "default_settings": {}
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/onboarding/create-pages" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Create Single Page

Create a single specific page.

**Endpoint:** `POST /onboarding/create-page`

**Permission Required**: `AdminPolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | Page key (e.g., `'checkout_page_id'`) |
| `page_name` | string | Yes | Page title/name |
| `save_settings` | boolean | No | Whether to save the page ID to settings (default: false) |

```json
{
  "content": "checkout_page_id",
  "page_name": "Checkout",
  "save_settings": true
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "page_id": 123,
    "page_name": "Checkout",
    "link": "https://yoursite.com/checkout/"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/onboarding/create-page" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "checkout_page_id",
    "page_name": "Checkout",
    "save_settings": true
  }'
```


