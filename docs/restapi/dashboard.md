---
title: Dashboard & Utilities API
description: FluentCart REST API endpoints for dashboard stats, onboarding, app initialization, activity logs, and utility functions.
---

# Dashboard & Utilities API

Administrative endpoints for dashboard statistics, onboarding setup, app initialization, activity logging, print templates, and utility functions.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

---

## Dashboard

Overview and statistics endpoints for the admin dashboard.

**Prefix:** `dashboard`

---

### Get Onboarding Data

<badge type="tip">GET</badge> `/fluent-cart/v2/dashboard`

Retrieve the onboarding checklist with completion status for each setup step. Used to display the getting-started wizard on the dashboard.

- **Policy:** `AdminPolicy`

#### Parameters

No parameters required.

#### Response

```json
{
  "data": {
    "steps": {
      "page_setup": {
        "title": "Setup Pages",
        "text": "Customers to find what they're looking for by organising.",
        "icon": "Cart",
        "completed": false,
        "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/settings/store-settings/pages_setup"
      },
      "store_info": {
        "title": "Add Details to Store",
        "text": "Store details such as addresses, company info etc.",
        "icon": "StoreIcon",
        "completed": true,
        "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/settings/store-settings/"
      },
      "product_info": {
        "title": "Add Your First Product",
        "text": "Share your brand story and build trust with customers.",
        "icon": "ShoppingCartIcon",
        "completed": false,
        "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products"
      },
      "setup_payments": {
        "title": "Setup Payment Methods",
        "text": "Choose from fast & secure online and offline payment.",
        "icon": "PaymentIcon",
        "completed": true,
        "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/settings/payments"
      }
    },
    "completed": 2
  }
}
```

#### Completion Logic

| Step | Completed When |
|------|---------------|
| `page_setup` | All generatable pages (shop, checkout, etc.) have page IDs assigned in store settings |
| `store_info` | Both `store_name` and `store_logo` are set in store settings |
| `product_info` | At least one product exists in the database |
| `setup_payments` | At least one payment gateway is enabled |

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/dashboard" \
  -u "username:app_password"
```

---

### Get Dashboard Stats

<badge type="tip">GET</badge> `/fluent-cart/v2/dashboard/stats`

Retrieve dashboard statistics widgets including total products, orders, net revenue, and refunds for the last 30 days.

- **Policy:** `DashboardPolicy`
- **Permission:** `dashboard_stats/view`

#### Parameters

No parameters required.

#### Response

```json
{
  "stats": [
    {
      "title": "Total Products",
      "current_count": 45,
      "icon": "Frame",
      "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products?active_view=all"
    },
    {
      "title": "Orders",
      "current_count": 128,
      "icon": "AllOrdersIcon",
      "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/orders"
    },
    {
      "title": "Revenue",
      "current_count": 15420.50,
      "icon": "Currency",
      "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/reports/revenue",
      "has_currency": true
    },
    {
      "title": "Refund",
      "current_count": 350.00,
      "icon": "Failed",
      "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/reports/refunds",
      "has_currency": true
    }
  ]
}
```

::: info
- **Orders, Revenue, and Refunds** are calculated for the last 30 days only (from the start of the day 30 days ago to the end of the current day).
- **Revenue** is net revenue: `total_paid - total_refund - tax_total - shipping_tax`, converted from cents to decimal.
- Orders with `on_hold` or `failed` status are excluded from the calculations.
- **Total Products** counts all products excluding those in `trash` or `auto-draft` status.
- Widgets with `has_currency: true` should be formatted with the store's currency symbol.
:::

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/dashboard/stats" \
  -u "username:app_password"
```

---

## Onboarding

Endpoints for the initial store setup wizard.

**Prefix:** `onboarding`
**Policy:** `AdminPolicy`

---

### Get Onboarding Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/onboarding`

Retrieve the current store settings, available pages, and currency options for the onboarding wizard.

#### Parameters

No parameters required.

#### Response

```json
{
  "pages": [
    {
      "id": 10,
      "title": "Shop",
      "link": "https://example.com/shop/"
    },
    {
      "id": 12,
      "title": "Checkout",
      "link": "https://example.com/checkout/"
    }
  ],
  "currencies": {
    "USD": "United States Dollar ($)",
    "EUR": "Euro (EUR)",
    "GBP": "British Pound (GBP)"
  },
  "default_settings": {
    "store_name": "My Store",
    "store_logo": "",
    "currency": "USD",
    "shop_page_id": "10",
    "checkout_page_id": "12",
    "customer_profile_page_id": ""
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/onboarding" \
  -u "username:app_password"
```

---

### Save Onboarding Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/onboarding`

Save store settings during the onboarding process. Merges submitted values with existing store settings. If a `category` value is provided, dummy products are created asynchronously.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `store_name` | string | body | No | The store name |
| `store_logo` | string | body | No | URL of the store logo |
| `currency` | string | body | No | Store currency code (e.g., `USD`, `EUR`) |
| `category` | string | body | No | Product category for generating dummy products. Excluded from saved settings but triggers async dummy product creation. |
| _...any store setting key_ | mixed | body | No | Any valid store settings field |

#### Response

**Success:**
```json
{
  "message": "Store has been updated successfully"
}
```

**Error:**
```json
{
  "errors": "Failed to update!"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/onboarding" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "store_name": "My Awesome Store",
    "store_logo": "https://example.com/wp-content/uploads/logo.png",
    "currency": "USD"
  }'
```

---

### Create All Pages

<badge type="warning">POST</badge> `/fluent-cart/v2/onboarding/create-pages`

Create all required store pages (shop, checkout, customer profile, etc.) in bulk. Skips pages that already have valid page IDs assigned. After creation, returns the updated onboarding settings (same response as [Get Onboarding Settings](#get-onboarding-settings)).

#### Parameters

No parameters required.

#### Response

Same as [Get Onboarding Settings](#get-onboarding-settings) -- returns the updated pages, currencies, and default settings after page creation.

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/onboarding/create-pages" \
  -u "username:app_password"
```

---

### Create Single Page

<badge type="warning">POST</badge> `/fluent-cart/v2/onboarding/create-page`

Create a single store page (e.g., shop, checkout, customer profile) and optionally save the page ID to store settings.

- **Request Class:** `CreatePageRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `content` | string | body | Yes | The page key identifier with `_page_id` suffix (e.g., `shop_page_id`, `checkout_page_id`, `customer_profile_page_id`) |
| `page_name` | string | body | Yes | The title for the new WordPress page |
| `save_settings` | boolean | body | No | Whether to save the new page ID to store settings (default: `false`). When `true`, also flushes rewrite rules. |

#### Response

**Success:**
```json
{
  "page_id": "156",
  "page_name": "Shop",
  "link": "https://example.com/shop/"
}
```

**Error:**
```json
{
  "message": "Unable to create page"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/onboarding/create-page" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "shop_page_id",
    "page_name": "Shop",
    "save_settings": true
  }'
```

---

## App Initialization

Endpoints for initializing the admin SPA and managing media attachments.

**Prefix:** `app`
**Policy:** `AdminPolicy`

---

### Initialize App

<badge type="tip">GET</badge> `/fluent-cart/v2/app/init`

Initialize the admin application by loading REST API configuration, asset URLs, translation strings, and shop configuration. This is the first call made when the admin SPA loads.

#### Parameters

No parameters required.

#### Response

```json
{
  "rest": {
    "base_url": "https://example.com/wp-json/",
    "url": "https://example.com/wp-json/fluent-cart/v2/",
    "nonce": "abc123def456",
    "namespace": "fluent-cart",
    "version": "v2"
  },
  "asset_url": "https://example.com/wp-content/plugins/fluent-cart/assets/",
  "trans": {
    "Dashboard": "Dashboard",
    "Products": "Products",
    "Orders": "Orders"
  },
  "shop": {
    "currency": "USD",
    "currency_sign": "$",
    "currency_sign_position": "left",
    "decimal_separator": ".",
    "thousands_separator": ",",
    "number_of_decimals": 2,
    "store_name": "My Store",
    "store_logo": "https://example.com/wp-content/uploads/logo.png"
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/app/init" \
  -u "username:app_password"
```

---

### List Attachments

<badge type="tip">GET</badge> `/fluent-cart/v2/app/attachments`

Retrieve all image attachments from the WordPress media library. Used for the media picker in the admin interface.

#### Parameters

No parameters required.

#### Response

**Success:**
```json
{
  "attachments": [
    {
      "id": 101,
      "title": "product-image",
      "url": "https://example.com/wp-content/uploads/2025/01/product-image.jpg"
    },
    {
      "id": 102,
      "title": "store-logo",
      "url": "https://example.com/wp-content/uploads/2025/01/store-logo.png"
    }
  ]
}
```

**No images found:**
```json
{
  "message": "No Images Found"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/app/attachments" \
  -u "username:app_password"
```

---

### Upload Attachment

<badge type="warning">POST</badge> `/fluent-cart/v2/app/upload-attachments`

Upload an image file to the WordPress media library.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `file` | file | multipart | Yes | Image file to upload. Only image MIME types are accepted. |

#### Response

**Success:**
```json
{
  "id": 103,
  "title": "new-product-photo",
  "url": "https://example.com/wp-content/uploads/2025/01/new-product-photo.jpg"
}
```

**Invalid file type:**
```json
{
  "error": "Error Uploading File"
}
```

**No file attached:**
```json
{
  "message": "No File Attached"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/app/upload-attachments" \
  -u "username:app_password" \
  -F "file=@/path/to/image.jpg"
```

---

## Activity Log

Endpoints for managing system activity logs. Activities track events like order status changes, payment events, API calls, and system errors.

**Prefix:** `activity`
**Policy:** `AdminPolicy`

---

### List Activities

<badge type="tip">GET</badge> `/fluent-cart/v2/activity`

Retrieve a paginated list of activity log entries with filtering and sorting support.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `search` | string | query | No | Search by ID (prefix with `#`), title, content, or module name |
| `active_view` | string | query | No | Filter by tab: `success`, `warning`, `error`, `failed`, `info`, `api` |
| `sort_by` | string | query | No | Column to sort by (default: `id`) |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `per_page` | integer | query | No | Results per page, max `200` (default: `10`) |
| `page` | integer | query | No | Page number for pagination |
| `filter_type` | string | query | No | Filter mode: `simple` or `advanced` (default: `simple`) |
| `advanced_filters` | string (JSON) | query | No | JSON-encoded advanced filter groups (requires `filter_type=advanced` and Pro) |

#### Active View Tabs

| Tab | Column Filtered | Description |
|-----|----------------|-------------|
| `success` | `status` | Successful operations |
| `warning` | `status` | Warning events |
| `error` | `status` | Error events |
| `failed` | `status` | Failed operations |
| `info` | `status` | Informational entries |
| `api` | `log_type` | API call logs |

#### Response

```json
{
  "activities": {
    "total": 156,
    "per_page": 10,
    "current_page": 1,
    "last_page": 16,
    "data": [
      {
        "id": 42,
        "title": "Order #1024 status changed",
        "content": "Order status changed from pending to completed",
        "status": "success",
        "log_type": "activity",
        "module_name": "orders",
        "read_status": "unread",
        "created_at": "2025-06-15 14:30:00",
        "updated_at": "2025-06-15 14:30:00"
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/activity?active_view=error&per_page=20&sort_type=desc" \
  -u "username:app_password"
```

---

### Delete Activity

<badge type="danger">DELETE</badge> `/fluent-cart/v2/activity/{id}`

Delete a specific activity log entry.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The activity log entry ID |

#### Response

**Success:**
```json
{
  "message": "Activity Deleted Successfully"
}
```

**Error:**
```json
{
  "message": "Activity not found"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/activity/42" \
  -u "username:app_password"
```

---

### Mark Activity Read/Unread

<badge type="info">PUT</badge> `/fluent-cart/v2/activity/{id}/mark-read`

Toggle the read status of an activity log entry.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The activity log entry ID |
| `status` | string | body | Yes | New read status: `read` or `unread` |

#### Response

**Marked as read:**
```json
{
  "message": "Activity Marked as Read"
}
```

**Marked as unread:**
```json
{
  "message": "Activity Marked as Unread"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/activity/42/mark-read" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"status": "read"}'
```

---

## Notes

Endpoints for managing order notes.

**Prefix:** `notes`
**Policy:** `AdminPolicy`

---

### Attach Note to Order

<badge type="warning">POST</badge> `/fluent-cart/v2/notes/attach`

Add or update a note on an order. The note is stored directly on the order record.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_id` | integer | body | Yes | The order ID to attach the note to |
| `note` | string | body | Yes | The note content (sanitized as text field) |

#### Response

**Success:**
```json
{
  "message": "Order Note Updated successfully."
}
```

**Error:**
```json
{
  "message": "Failed to update order note."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/notes/attach" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 1024,
    "note": "Customer requested express shipping. Upgraded at no charge."
  }'
```

---

## Print Templates

Endpoints for managing invoice, packing slip, and other print templates.

**Prefix:** `templates`
**Policy:** `AdminPolicy`

---

### Get Print Templates

<badge type="tip">GET</badge> `/fluent-cart/v2/templates/print-templates`

Retrieve all available print templates. Returns saved custom templates or falls back to default templates.

#### Parameters

No parameters required.

#### Available Templates

| Key | Title |
|-----|-------|
| `invoice_template` | Invoice Template |
| `packing_slip` | Packing Slip Template |
| `delivery_slip` | Delivery Slip Template |
| `shipping_slip` | Shipping Slip Template |
| `dispatch_slip` | Dispatch Slip Template |

#### Response

```json
{
  "templates": [
    {
      "key": "invoice_template",
      "title": "Invoice Template",
      "content": "<html>...invoice HTML template with shortcodes...</html>"
    },
    {
      "key": "packing_slip",
      "title": "Packing Slip Template",
      "content": "<html>...packing slip HTML template...</html>"
    },
    {
      "key": "delivery_slip",
      "title": "Delivery Slip Template",
      "content": "<html>...delivery slip HTML template...</html>"
    },
    {
      "key": "shipping_slip",
      "title": "Shipping Slip Template",
      "content": "<html>...shipping slip HTML template...</html>"
    },
    {
      "key": "dispatch_slip",
      "title": "Dispatch Slip Template",
      "content": "<html>...dispatch slip HTML template...</html>"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/templates/print-templates" \
  -u "username:app_password"
```

---

### Save Print Templates

<badge type="info">PUT</badge> `/fluent-cart/v2/templates/print-templates`

Save customized print templates. Each template's content is sanitized with `wp_kses_post` before saving.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `templates` | array | body | Yes | Array of template objects to save |
| `templates[].key` | string | body | Yes | Template identifier (e.g., `invoice_template`, `packing_slip`) |
| `templates[].content` | string | body | Yes | HTML template content with shortcodes |

#### Response

```json
{
  "message": "Template saved successfully"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/templates/print-templates" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "templates": [
      {
        "key": "invoice_template",
        "content": "<html><body><h1>Invoice #{order_id}</h1>...</body></html>"
      }
    ]
  }'
```

---

## Widgets

Dynamic widget data endpoint for contextual UI components.

---

### Get Widgets

<badge type="tip">GET</badge> `/fluent-cart/v2/widgets`

Retrieve dynamic widget data for a specific context. Widgets are loaded via WordPress filters (`fluent_cart/widgets/{filter}`), allowing modules and extensions to register custom widgets.

- **Policy:** `OrderPolicy`
- **Permission:** `customers/view` OR `orders/view` (any)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `filter` | string | query | No | Widget context identifier (the `fluent_cart_` prefix is automatically stripped). Example: `single_order_page` |
| `data` | object | query | No | Additional context data passed to the widget filter. For `single_order_page`, must include `order_id`. |

#### Response

```json
{
  "widgets": [
    {
      "title": "Customer Lifetime Value",
      "value": "$1,250.00",
      "type": "stat"
    }
  ]
}
```

**Order not found (when filter is `single_order_page`):**
```json
{
  "message": "Order not found"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/widgets?filter=single_order_page&data[order_id]=1024" \
  -u "username:app_password"
```

---

## Address Info

Endpoints for retrieving country and state/province data for address forms.

**Prefix:** `address-info`
**Policy:** `UserPolicy`

---

### List Countries

<badge type="tip">GET</badge> `/fluent-cart/v2/address-info/countries`

Retrieve a list of all available countries formatted as select options.

#### Parameters

No parameters required.

#### Response

```json
{
  "data": [
    {
      "label": "United States",
      "value": "US"
    },
    {
      "label": "United Kingdom",
      "value": "GB"
    },
    {
      "label": "Canada",
      "value": "CA"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/address-info/countries" \
  -u "username:app_password"
```

---

### Get Country Info

<badge type="tip">GET</badge> `/fluent-cart/v2/address-info/get-country-info`

Retrieve detailed information for a specific country including states/provinces and address locale formatting rules. Can identify the country from either a country code or a timezone string.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | query | Conditional | Two-letter ISO country code (e.g., `US`, `GB`). Required if `timezone` is not provided. |
| `timezone` | string | query | Conditional | IANA timezone string (e.g., `America/New_York`). Used to guess the country. Takes priority over `country_code`. |

#### Response

```json
{
  "country_code": "US",
  "country_name": "United States",
  "states": [
    {
      "label": "Alabama",
      "value": "AL"
    },
    {
      "label": "Alaska",
      "value": "AK"
    },
    {
      "label": "California",
      "value": "CA"
    }
  ],
  "address_locale": {
    "state": {
      "label": "State",
      "required": true
    },
    "postcode": {
      "label": "ZIP Code",
      "required": true
    },
    "city": {
      "label": "City",
      "required": true
    }
  }
}
```

::: info
The `address_locale` object provides localized field labels and requirements that vary by country. For example, the UK uses "Postcode" while the US uses "ZIP Code", and some countries do not require a state/province field.
:::

#### Example

```bash
# By country code
curl -X GET "https://example.com/wp-json/fluent-cart/v2/address-info/get-country-info?country_code=US" \
  -u "username:app_password"

# By timezone
curl -X GET "https://example.com/wp-json/fluent-cart/v2/address-info/get-country-info?timezone=America/New_York" \
  -u "username:app_password"
```

---

## Advanced Filters

Endpoints for retrieving filter options used by the advanced filter UI across orders, customers, products, and labels.

**Prefix:** `advance_filter`
**Policy:** `OrderPolicy`

---

### Get Filter Options

<badge type="tip">GET</badge> `/fluent-cart/v2/advance_filter/get-filter-options`

Retrieve dynamic filter options for the advanced filter dropdowns. Supports loading product variations, labels, and extensible custom data keys via WordPress filters.

- **Permission:** `orders/view` OR `customers/view` OR `products/view` OR `labels/view` (any)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `remote_data_key` | string | query | Yes | The type of filter options to retrieve. Built-in values: `product_variations`, `labels`. Custom values are resolved via the `fluent_cart/advanced_filter_options_{key}` filter. |
| `search` | string | query | No | Search query to filter options |
| `include_ids` | array/string | query | No | Specific IDs to include in results |
| `limit` | integer | query | No | Maximum number of options to return |

#### Response

```json
{
  "options": [
    {
      "id": 1,
      "title": "Premium T-Shirt - Small / Red",
      "children": [
        {
          "id": 10,
          "title": "Small / Red"
        },
        {
          "id": 11,
          "title": "Medium / Blue"
        }
      ]
    }
  ]
}
```

::: info
When `remote_data_key` is `product_variations`, options are returned as a tree structure with products as parents and their variations as children. For `labels`, options are returned as a flat list of label objects.
:::

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/advance_filter/get-filter-options?remote_data_key=product_variations&search=shirt&limit=20" \
  -u "username:app_password"
```

---

### Get Search Options

<badge type="tip">GET</badge> `/fluent-cart/v2/forms/search_options`

Retrieve dynamic search/autocomplete options for form fields. Options are resolved via the `fluent_cart/get_dynamic_search_{search_for}` WordPress filter, allowing modules to provide context-specific search data.

- **Policy:** `AdminPolicy`
- **Permission:** `super_admin`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `search_for` | string | query | Yes | The type of search options to retrieve (used as the filter key suffix) |
| `search_by` | string | query | No | Additional search context or query string passed to the filter |

#### Response

```json
{
  "options": [
    {
      "id": "option_1",
      "label": "Option Label",
      "value": "option_value"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/forms/search_options?search_for=products&search_by=shirt" \
  -u "username:app_password"
```
