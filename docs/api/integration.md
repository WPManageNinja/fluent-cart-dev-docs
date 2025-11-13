---
title: Integration API
description: FluentCart Integration API for managing global and product-specific integrations and addons.
---

# Integration API

The Integration API provides endpoints for managing global integrations, product-specific integrations, addons, and integration feeds in FluentCart.

## Base URL

All Integration API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

All Integration API endpoints require:
- **Policy**: `IntegrationPolicy`
- **Permissions**: Varies by endpoint (see individual endpoints)

## Global Integrations

### List Addons

Retrieve a list of available integration addons.

**Endpoint:** `GET /integration/addons`

**Permission Required**: `integrations/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status |

#### Response

```json
{
  "addons": [
    {
      "key": "mailchimp",
      "title": "Mailchimp",
      "description": "Email marketing integration",
      "enabled": true,
      "installed": true
    }
  ]
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/integration/addons" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Global Settings

Retrieve global settings for integrations.

**Endpoint:** `GET /integration/global-settings`

**Permission Required**: `integrations/view`

#### Response

```json
{
  "settings": {
    "enabled": true,
    "default_provider": "mailchimp"
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/integration/global-settings" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Set Global Settings

Update global settings for integrations.

**Endpoint:** `POST /integration/global-settings`

**Permission Required**: `integrations/manage`

#### Request Body

The request body structure depends on the integration settings.

```json
{
  "enabled": true,
  "default_provider": "mailchimp"
}
```

#### Response

```json
{
  "message": "Global settings saved successfully",
  "settings": {}
}
```

### Get Global Feeds

Retrieve all global integration feeds.

**Endpoint:** `GET /integration/global-feeds`

**Permission Required**: `integrations/view`

#### Response

```json
{
  "feeds": [
    {
      "id": 1,
      "name": "Main Mailchimp Feed",
      "enabled": true,
      "provider": "mailchimp",
      "feed": {
        "name": "Main Mailchimp Feed",
        "enabled": true,
        "settings": {}
      },
      "scope": "global"
    }
  ],
  "available_integrations": {
    "mailchimp": {
      "title": "Mailchimp",
      "enabled": true
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/integration/global-feeds" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Integration Feed Settings

Retrieve settings for a specific integration feed (for editing).

**Endpoint:** `GET /integration/global-feeds/settings`

**Permission Required**: `integrations/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `integration_name` | string | Yes | Integration provider name (e.g., 'mailchimp') |
| `integration_id` | int | No | Integration feed ID (for existing feeds) |

#### Response

```json
{
  "settings": {
    "name": "Main Mailchimp Feed",
    "enabled": true,
    "fields": {}
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/integration/global-feeds/settings?integration_name=mailchimp" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Save Integration Feed Settings

Create or update an integration feed.

**Endpoint:** `POST /integration/global-feeds/settings`

**Permission Required**: `integrations/manage`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `integration_name` | string | Yes | Integration provider name |
| `integration_id` | int | No | Integration feed ID (for updates) |
| `integration` | object | Yes | Integration feed configuration |

```json
{
  "integration_name": "mailchimp",
  "integration_id": 1,
  "integration": {
    "name": "Main Mailchimp Feed",
    "enabled": true,
    "settings": {
      "list_id": "abc123",
      "tags": ["customer"]
    }
  }
}
```

#### Response

```json
{
  "message": "Integration has been successfully saved",
  "integration_id": 1,
  "integration_name": "mailchimp",
  "created": false,
  "feedData": {
    "name": "Main Mailchimp Feed",
    "enabled": true
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/integration/global-feeds/settings" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "integration_name": "mailchimp",
    "integration": {
      "name": "Main Mailchimp Feed",
      "enabled": true
    }
  }'
```

### Change Integration Feed Status

Enable or disable an integration feed.

**Endpoint:** `POST /integration/global-feeds/change-status/{integration_id}`

**Permission Required**: `integrations/manage`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `integration_id` | int | Yes | Integration feed ID (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | Yes | Status: `'yes'` to enable, `'no'` to disable |

```json
{
  "status": "yes"
}
```

#### Response

```json
{
  "message": "Integration status updated successfully.",
  "meta": {
    "enabled": "yes"
  }
}
```

### Delete Integration Feed

Delete a global integration feed.

**Endpoint:** `DELETE /integration/global-feeds/{integration_id}`

**Permission Required**: `integrations/delete`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `integration_id` | int | Yes | Integration feed ID (route parameter) |

#### Response

```json
{
  "message": "Integration has been deleted successfully.",
  "id": 1
}
```

### Get Feed Lists

Retrieve a list of integration feeds.

**Endpoint:** `GET /integration/feed/lists`

**Permission Required**: `integrations/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `provider` | string | No | Filter by provider |

#### Response

```json
{
  "feeds": [
    {
      "id": 1,
      "name": "Main Mailchimp Feed",
      "provider": "mailchimp"
    }
  ]
}
```

### Get Dynamic Options

Retrieve dynamic options for integration fields (e.g., lists, tags, custom fields).

**Endpoint:** `GET /integration/feed/dynamic_options`

**Permission Required**: `integrations/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `option_key` | string | Yes | Option key identifier |
| `search` | string | No | Search term for filtering options |
| `values` | array | No | Array of values to include |
| `sub_option_key` | string | No | Sub-option key (e.g., post type for post_type option) |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/integration/feed/dynamic_options?option_key=post_type&sub_option_key=post&search=test" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

#### Response

```json
{
  "options": [
    {
      "id": "123",
      "title": "Test Post"
    }
  ]
}
```

### Get Chained Data

Retrieve chained/dependent data for integration fields.

**Endpoint:** `POST /integration/feed/chained`

**Permission Required**: `integrations/manage`

#### Request Body

The request body structure depends on the integration and field type.

```json
{
  "option_key": "list",
  "parent_value": "list_id_123"
}
```

#### Response

```json
{
  "options": [
    {
      "id": "tag1",
      "title": "Tag 1"
    }
  ]
}
```

### Install Plugin

Install an integration plugin/addon.

**Endpoint:** `POST /integration/install-plugin`

**Permission Required**: `integrations/manage`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `addon_key` | string | Yes | Addon identifier key |

```json
{
  "addon_key": "mailchimp"
}
```

#### Response

```json
{
  "message": "Plugin installed successfully",
  "addon": {
    "key": "mailchimp",
    "installed": true
  }
}
```

## Product-Specific Integrations

### Get Product Integration Settings

Retrieve integration settings for a specific product.

**Endpoint:** `GET /products/{product_id}/integrations/{integration_name}/settings`

**Permission Required**: `products/view`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product_id` | int | Yes | Product ID (route parameter) |
| `integration_name` | string | Yes | Integration provider name (route parameter) |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `integration_id` | int | No | Integration feed ID (for existing feeds) |

#### Response

```json
{
  "settings": {
    "name": "Product Mailchimp Feed",
    "enabled": true,
    "fields": {}
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/products/123/integrations/mailchimp/settings" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Save Product Integration

Create or update a product-specific integration feed.

**Endpoint:** `POST /products/{product_id}/integrations`

**Permission Required**: `products/manage`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product_id` | int | Yes | Product ID (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `integration_name` | string | Yes | Integration provider name |
| `integration_id` | int | No | Integration feed ID (for updates) |
| `integration` | object | Yes | Integration feed configuration |

```json
{
  "integration_name": "mailchimp",
  "integration": {
    "name": "Product Mailchimp Feed",
    "enabled": true,
    "settings": {}
  }
}
```

#### Response

```json
{
  "message": "Product integration saved successfully",
  "integration_id": 1
}
```

### Delete Product Integration

Delete a product-specific integration feed.

**Endpoint:** `DELETE /products/{product_id}/integrations/{integration_id}`

**Permission Required**: `products/manage`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product_id` | int | Yes | Product ID (route parameter) |
| `integration_id` | int | Yes | Integration feed ID (route parameter) |

#### Response

```json
{
  "message": "Product integration deleted successfully",
  "id": 1
}
```

### Change Product Integration Status

Enable or disable a product-specific integration feed.

**Endpoint:** `POST /products/{product_id}/integrations/feed/change-status`

**Permission Required**: `products/manage`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product_id` | int | Yes | Product ID (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `integration_id` | int | Yes | Integration feed ID |
| `status` | string | Yes | Status: `'yes'` to enable, `'no'` to disable |

```json
{
  "integration_id": 1,
  "status": "yes"
}
```

#### Response

```json
{
  "message": "Integration status updated successfully"
}
```

### Get Product Integration Feeds

Retrieve all integration feeds for a specific product.

**Endpoint:** `GET /products/{productId}/integrations`

**Permission Required**: `products/view`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | int | Yes | Product ID (route parameter) |

#### Response

```json
{
  "feeds": [
    {
      "id": 1,
      "name": "Product Mailchimp Feed",
      "enabled": true,
      "provider": "mailchimp"
    }
  ]
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/products/123/integrations" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Notes

- Global integrations apply to all orders
- Product-specific integrations apply only to orders containing that product
- Integration feeds can be enabled/disabled independently
- Dynamic options are used for fields that require API calls to fetch available values
- Chained data is used for dependent fields (e.g., tags depend on selected list)
- Integration settings are validated before saving

