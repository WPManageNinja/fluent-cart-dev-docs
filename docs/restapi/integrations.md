---
title: Integrations API
description: FluentCart REST API endpoints for managing third-party integrations, feeds, and product-level integration settings.
---

# Integrations API

Manage third-party integrations, configure integration feeds, and set up product-specific integration settings.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

**Policies:** `IntegrationPolicy` (global), `ProductPolicy` (product-level)

---

## Global Integrations

Endpoints for managing available add-ons and their global configuration settings. These control the overall connection and authentication for each integration provider (e.g., FluentCRM, FluentSMTP, Webhooks).

---

### List Available Add-ons

<badge type="tip">GET</badge> `/fluent-cart/v2/integration/addons`

Retrieve the list of all available integration add-ons, including their installation status and metadata.

- **Permission:** `integrations/view`
- **Controller:** `AddonsController@getAddons`

#### Parameters

_This endpoint does not accept any parameters._

#### Response

```json
{
  "addons": {
    "fluent-crm": {
      "installable": "fluent-crm",
      "enabled": true,
      "title": "FluentCRM",
      "logo": "https://example.com/wp-content/plugins/fluent-cart/assets/images/integrations/fluentcrm.svg",
      "categories": ["crm", "core", "marketing"],
      "description": "The most powerful email marketing automation plugin for WordPress."
    },
    "fluent-smtp": {
      "installable": "fluent-smtp",
      "enabled": false,
      "title": "FluentSMTP",
      "logo": "...",
      "categories": ["core", "marketing"],
      "description": "A free WordPress SMTP plugin to send emails via multiple providers."
    },
    "webhook": {
      "title": "Webhook",
      "description": "Send data anywhere via webhook",
      "logo": "...",
      "enabled": true,
      "is_pro": true,
      "is_pro_active": true,
      "categories": ["core"]
    }
  }
}
```

**Add-on Object Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `installable` | string | Plugin slug for WordPress.org installation (absent for pro add-ons) |
| `enabled` | boolean | Whether the add-on's underlying plugin is active |
| `title` | string | Display name of the add-on |
| `logo` | string | URL to the add-on's logo image |
| `categories` | array | Category tags (e.g., `core`, `crm`, `marketing`, `community`, `lms`) |
| `description` | string | Human-readable description |
| `is_pro` | boolean | Whether the add-on requires a Pro license (only present for premium add-ons) |
| `is_pro_active` | boolean | Whether the Pro license is currently active (only present for premium add-ons) |

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/integration/addons" \
  -u "username:app_password"
```

---

### Get Global Integration Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/integration/global-settings`

Retrieve global configuration settings for a specific integration provider. Used to get API key configuration, authentication fields, and current saved values.

- **Permission:** `integrations/view`
- **Controller:** `IntegrationController@getGlobalSettings`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `settings_key` | string | query | Yes | The integration provider key (e.g., `fluent-crm`, `webhook`) |

#### Response

```json
{
  "integration": {
    "api_key": "••••••••",
    "api_url": "https://example.com",
    "status": true
  },
  "settings": {
    "fields": [
      {
        "key": "api_key",
        "label": "API Key",
        "type": "password",
        "required": true
      }
    ],
    "save_button_text": "Save Settings",
    "valid_message": "Your API Key is valid",
    "invalid_message": "Your API Key is not valid"
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/integration/global-settings?settings_key=fluent-crm" \
  -u "username:app_password"
```

---

### Save Global Integration Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/integration/global-settings`

Save or update global configuration settings for a specific integration provider (e.g., API keys, authentication credentials).

- **Permission:** `integrations/manage`
- **Controller:** `IntegrationController@setGlobalSettings`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `settings_key` | string | body | Yes | The integration provider key |
| `integration` | object | body | Yes | The settings data to save (fields vary by provider) |

#### Response

The response is handled by the integration provider via the `fluent_cart/integration/save_global_integration_settings_{settings_key}` hook. A typical success response:

```json
{
  "message": "Settings saved successfully",
  "status": true
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/integration/global-settings" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "settings_key": "fluent-crm",
    "integration": {
      "api_key": "your-api-key",
      "api_url": "https://example.com"
    }
  }'
```

---

### Install and Activate Add-on Plugin

<badge type="warning">POST</badge> `/fluent-cart/v2/integration/feed/install-plugin`

Install and activate a supported integration plugin from the WordPress.org repository. Only whitelisted plugins can be installed through this endpoint.

- **Permission:** `integrations/manage`
- **Controller:** `AddonsController@installAndActivate`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `addon` | string | body | Yes | The plugin slug to install. Allowed values: `fluent-crm`, `fluent-smtp`, `fluent-community`, `fluent-security`, `fluentform`, `fluent-support` |

#### Response

```json
{
  "message": "Addon installation started successfully.",
  "redirect": "https://example.com/wp-admin/admin.php?page=fluent-cart#/integrations"
}
```

#### Error Response

```json
{
  "message": "This addon cannot be installed at this time"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/integration/feed/install-plugin" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"addon": "fluent-crm"}'
```

---

## Integration Feeds

Integration feeds define the data mapping and conditional logic that connects FluentCart order events to third-party services. Feeds are configured at the global level and fire on all matching orders.

---

### List Global Integration Feeds

<badge type="tip">GET</badge> `/fluent-cart/v2/integration/global-feeds`

Retrieve all configured global integration feeds along with the list of available integrations that support global scope.

- **Permission:** `integrations/view`
- **Controller:** `IntegrationController@getFeeds`

#### Parameters

_This endpoint does not accept any parameters._

#### Response

```json
{
  "feeds": [
    {
      "id": 42,
      "name": "Add to FluentCRM list",
      "enabled": "yes",
      "provider": "fluent-crm",
      "feed": {
        "name": "Add to FluentCRM list",
        "enabled": "yes",
        "list_id": "2",
        "list_name": "Customers",
        "merge_fields": {},
        "conditionals": {
          "conditions": [],
          "status": false,
          "type": "all"
        }
      },
      "scope": "global"
    }
  ],
  "available_integrations": {
    "fluent-crm": {
      "title": "FluentCRM",
      "logo": "...",
      "enabled": true,
      "scopes": ["global", "product"],
      "description": "..."
    }
  },
  "all_module_config_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/integrations"
}
```

**Feed Object Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | integer | Unique feed ID |
| `name` | string | Display name of the feed |
| `enabled` | string | Status: `yes` or `no` |
| `provider` | string | Integration provider key |
| `feed` | object | Full feed configuration data including field mappings and conditionals |
| `scope` | string | Always `global` for this endpoint |

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/integration/global-feeds" \
  -u "username:app_password"
```

---

### Get Feed Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/integration/global-feeds/settings`

Retrieve the settings form schema, saved values, and available shortcodes for a specific integration feed. Used to populate the feed editor when creating or editing a global feed.

- **Permission:** `integrations/view`
- **Controller:** `IntegrationController@getSettings`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `integration_name` | string | query | Yes | The integration provider key (e.g., `fluent-crm`, `webhook`) |
| `integration_id` | integer | query | No | The feed ID to load existing settings for editing. Omit to get defaults for a new feed. |

#### Response

```json
{
  "settings": {
    "conditionals": {
      "conditions": [],
      "status": false,
      "type": "all"
    },
    "enabled": "yes",
    "list_id": "",
    "list_name": "",
    "name": "",
    "merge_fields": {}
  },
  "settings_fields": {
    "fields": [
      {
        "key": "name",
        "label": "Feed Name",
        "type": "text",
        "required": true
      },
      {
        "key": "list_id",
        "label": "Contact List",
        "type": "select",
        "required": true,
        "options": []
      }
    ]
  },
  "shortcodes": {},
  "inputs": {},
  "merge_fields": {}
}
```

**Response Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `settings` | object | Current feed settings values (defaults for new, saved values for existing) |
| `settings_fields` | object | Form schema defining the feed editor fields |
| `shortcodes` | object | Available shortcodes for dynamic field mapping |
| `inputs` | object | Checkout input fields available for mapping |
| `merge_fields` | object/boolean | Merge fields for the selected list (if applicable) |

#### Example

```bash
# Get defaults for a new feed
curl -X GET "https://example.com/wp-json/fluent-cart/v2/integration/global-feeds/settings?integration_name=fluent-crm" \
  -u "username:app_password"

# Load existing feed for editing
curl -X GET "https://example.com/wp-json/fluent-cart/v2/integration/global-feeds/settings?integration_name=fluent-crm&integration_id=42" \
  -u "username:app_password"
```

---

### Save Feed Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/integration/global-feeds/settings`

Create a new integration feed or update an existing one. Validates required fields defined by the integration provider before saving.

- **Permission:** `integrations/manage`
- **Controller:** `IntegrationController@saveSettings`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `integration_name` | string | body | Yes | The integration provider key (e.g., `fluent-crm`) |
| `integration_id` | integer | body | No | The existing feed ID to update. Omit to create a new feed. |
| `integration` | string (JSON) | body | Yes | JSON-encoded feed settings data containing field mappings, conditionals, and configuration |

**The `integration` JSON string should contain:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Display name for the feed |
| `enabled` | string | Yes | Status: `yes` or `no` |
| `list_id` | string | Varies | Target list ID (provider-specific) |
| `list_name` | string | No | Target list name |
| `merge_fields` | object | No | Field mapping configuration |
| `conditionals` | object | No | Conditional logic settings |

#### Response

```json
{
  "message": "Integration has been successfully saved",
  "integration_id": 42,
  "integration_name": "fluent-crm",
  "created": true,
  "feedData": {
    "name": "Add to customers list",
    "enabled": "yes",
    "list_id": "2",
    "merge_fields": {}
  }
}
```

**Response Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `message` | string | Success message |
| `integration_id` | integer/null | The feed ID (null for newly created feeds before refresh) |
| `integration_name` | string | The integration provider key |
| `created` | boolean | `true` if a new feed was created, `false` if an existing one was updated |
| `feedData` | object | The validated and saved feed data |

#### Error Response (Validation)

```json
{
  "message": "Please fill up the required fields:",
  "errors": {
    "name": "Feed Name is required.",
    "list_id": "Contact List is required."
  }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/integration/global-feeds/settings" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "integration_name": "fluent-crm",
    "integration": "{\"name\":\"Add to customers\",\"enabled\":\"yes\",\"list_id\":\"2\",\"list_name\":\"Customers\",\"merge_fields\":{},\"conditionals\":{\"conditions\":[],\"status\":false,\"type\":\"all\"}}"
  }'
```

---

### Change Feed Status

<badge type="warning">POST</badge> `/fluent-cart/v2/integration/global-feeds/change-status/{integration_id}`

Toggle a global integration feed on or off without modifying its configuration.

- **Permission:** `integrations/manage`
- **Controller:** `IntegrationController@changeStatus`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `integration_id` | integer | path | Yes | The feed ID to update |
| `status` | string | body | Yes | New status: `yes` (enable) or `no` (disable) |

#### Response

```json
{
  "message": "Integration status updated successfully.",
  "meta": {
    "name": "Add to customers list",
    "enabled": "yes",
    "list_id": "2",
    "merge_fields": {}
  }
}
```

#### Example

```bash
# Disable a feed
curl -X POST "https://example.com/wp-json/fluent-cart/v2/integration/global-feeds/change-status/42" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"status": "no"}'
```

---

### Delete Feed

<badge type="danger">DELETE</badge> `/fluent-cart/v2/integration/global-feeds/{integration_id}`

Permanently delete a global integration feed.

- **Permission:** `integrations/delete`
- **Controller:** `IntegrationController@deleteSettings`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `integration_id` | integer | path | Yes | The feed ID to delete |

#### Response

```json
{
  "message": "Integration has been deleted successfully.",
  "id": 42
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/integration/global-feeds/42" \
  -u "username:app_password"
```

---

### Get Feed Merge Fields (Lists)

<badge type="tip">GET</badge> `/fluent-cart/v2/integration/feed/lists`

Retrieve the merge fields (field mapping options) for a specific integration provider and list. Called when a user selects a target list in the feed editor to load the available mapping fields.

- **Permission:** `integrations/view`
- **Controller:** `IntegrationController@lists`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `integration_name` | string | query | Yes | The integration provider key (e.g., `fluent-crm`) |
| `list_id` | string | query | No | The target list ID to fetch merge fields for |

#### Response

```json
{
  "merge_fields": [
    {
      "key": "email",
      "label": "Email",
      "type": "text",
      "required": true
    },
    {
      "key": "first_name",
      "label": "First Name",
      "type": "text",
      "required": false
    },
    {
      "key": "last_name",
      "label": "Last Name",
      "type": "text",
      "required": false
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/integration/feed/lists?integration_name=fluent-crm&list_id=2" \
  -u "username:app_password"
```

---

### Get Dynamic Options

<badge type="tip">GET</badge> `/fluent-cart/v2/integration/feed/dynamic_options`

Fetch dynamic select options for integration feed fields. Supports WordPress post type searches and provider-specific dynamic option lookups. Used by the feed editor to populate dropdown fields asynchronously.

- **Permission:** `integrations/view`
- **Controller:** `IntegrationController@getDynamicOptions`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `option_key` | string | query | Yes | The type of options to fetch (e.g., `post_type` for WordPress posts, or a provider-specific key) |
| `sub_option_key` | string | query | Conditional | Required when `option_key` is `post_type`. Specifies the post type slug (e.g., `post`, `page`, `fluent-products`) |
| `search` | string | query | No | Search term to filter results |
| `values` | array | query | No | Array of pre-selected IDs to ensure they are included in the response |

#### Response

```json
{
  "options": [
    {
      "id": "123",
      "title": "Example Product"
    },
    {
      "id": "456",
      "title": "Another Product"
    }
  ]
}
```

#### Example

```bash
# Search WordPress posts by post type
curl -X GET "https://example.com/wp-json/fluent-cart/v2/integration/feed/dynamic_options?option_key=post_type&sub_option_key=page&search=about" \
  -u "username:app_password"

# Fetch provider-specific options
curl -X GET "https://example.com/wp-json/fluent-cart/v2/integration/feed/dynamic_options?option_key=fluentcrm_tags&search=vip" \
  -u "username:app_password"
```

---

### Chained Data Request

<badge type="warning">POST</badge> `/fluent-cart/v2/integration/feed/chained`

Handle chained/dependent data requests for integration feeds. Used when selecting a value in one feed field needs to dynamically load options for another field. The behavior is entirely handled by the integration provider through the `fluent_cart/integration/chained_{route}` hook.

- **Permission:** `integrations/manage`
- **Controller:** `IntegrationController@chained`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `route` | string | body | Yes | The chained route identifier, determines which integration provider handles the request |
| _(additional)_ | mixed | body | Varies | Additional parameters depend on the integration provider and the chained route |

#### Response

The response format depends on the integration provider handling the chained route. A typical response:

```json
{
  "options": [
    {
      "id": "1",
      "label": "Option A"
    },
    {
      "id": "2",
      "label": "Option B"
    }
  ]
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/integration/feed/chained" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "route": "fluent-crm",
    "list_id": "2"
  }'
```

---

## Product Integrations

Product-level integrations allow you to configure integration feeds that only fire for orders containing a specific product. This enables per-product customization of CRM tagging, webhook payloads, and other integration behaviors.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/products/{product_id}/integrations`

**Policy:** `ProductPolicy`

---

### List Product Integration Feeds

<badge type="tip">GET</badge> `/fluent-cart/v2/products/{productId}/integrations`

Retrieve all integration feeds configured for a specific product, along with available product-scoped integrations.

- **Permission:** `products/view`
- **Controller:** `ProductIntegrationsController@getFeeds`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `productId` | integer | path | Yes | The product ID |

#### Response

```json
{
  "feeds": [
    {
      "id": 15,
      "name": "Tag VIP buyers",
      "enabled": "yes",
      "provider": "fluent-crm",
      "feed": {
        "name": "Tag VIP buyers",
        "enabled": "yes",
        "list_id": "3",
        "list_name": "VIP Customers",
        "merge_fields": {},
        "conditional_variation_ids": [101, 102],
        "conditionals": {
          "conditions": [],
          "status": false,
          "type": "all"
        }
      },
      "scope": "product"
    }
  ],
  "available_integrations": {
    "fluent-crm": {
      "title": "FluentCRM",
      "logo": "...",
      "enabled": true,
      "scopes": ["global", "product"]
    }
  },
  "all_module_config_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/integrations"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/123/integrations" \
  -u "username:app_password"
```

---

### Get Product Integration Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/products/{product_id}/integrations/{integration_name}/settings`

Retrieve the feed editor settings for a specific integration provider, scoped to a product. Returns form schema, saved values, available shortcodes, and the product's variation list for conditional targeting.

- **Permission:** `products/view`
- **Controller:** `ProductIntegrationsController@getProductIntegrationSettings`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product_id` | integer | path | Yes | The product ID |
| `integration_name` | string | path | Yes | The integration provider key (e.g., `fluent-crm`) |
| `integration_id` | integer | query | No | The existing feed ID to load for editing. Omit for new feed defaults. |

#### Response

```json
{
  "settings": {
    "conditionals": {
      "conditions": [],
      "status": false,
      "type": "all"
    },
    "enabled": "yes",
    "list_id": "",
    "list_name": "",
    "name": "",
    "merge_fields": {},
    "conditional_variation_ids": []
  },
  "settings_fields": {
    "fields": [
      {
        "key": "name",
        "label": "Feed Name",
        "type": "text",
        "required": true
      }
    ]
  },
  "shortcodes": {},
  "inputs": {},
  "merge_fields": {},
  "product_variations": [
    {
      "id": 101,
      "title": "Basic Plan"
    },
    {
      "id": 102,
      "title": "Pro Plan"
    }
  ],
  "scope": "product"
}
```

**Additional Properties (compared to global feed settings):**

| Property | Type | Description |
|----------|------|-------------|
| `product_variations` | array | List of the product's variations (`id` and `title`), used for targeting specific variations |
| `scope` | string | Always `product` for this endpoint |
| `settings.conditional_variation_ids` | array | Array of variation IDs this feed should apply to (empty means all variations) |

#### Example

```bash
# Get defaults for a new product feed
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/123/integrations/fluent-crm/settings" \
  -u "username:app_password"

# Load existing product feed for editing
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/123/integrations/fluent-crm/settings?integration_id=15" \
  -u "username:app_password"
```

---

### Save Product Integration Feed

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{product_id}/integrations`

Create a new product-level integration feed or update an existing one. Validates required fields and associates the feed with the specified product.

- **Permission:** `products/edit`
- **Controller:** `ProductIntegrationsController@saveProductIntegration`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product_id` | integer | path | Yes | The product ID |
| `integration_name` | string | body | Yes | The integration provider key (e.g., `fluent-crm`) |
| `integration_id` | integer | body | No | Existing feed ID to update. Omit to create a new feed. |
| `integration` | string (JSON) | body | Yes | JSON-encoded feed settings data |

**The `integration` JSON string should contain:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Display name for the feed |
| `enabled` | string | Yes | Status: `yes` or `no` |
| `list_id` | string | Varies | Target list ID (provider-specific) |
| `merge_fields` | object | No | Field mapping configuration |
| `conditional_variation_ids` | array | No | Array of variation IDs to restrict this feed to. Empty array means all variations. |
| `conditionals` | object | No | Conditional logic settings |

#### Response

```json
{
  "message": "Integration has been successfully saved",
  "integration_id": 15,
  "integration_name": "fluent-crm",
  "created": true,
  "feedData": {
    "name": "Tag VIP buyers",
    "enabled": "yes",
    "list_id": "3",
    "conditional_variation_ids": [101]
  }
}
```

#### Error Response

```json
{
  "message": "Product not found"
}
```

```json
{
  "message": "Please fill up the required fields:",
  "errors": {
    "name": "Feed Name is required."
  }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/integrations" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "integration_name": "fluent-crm",
    "integration": "{\"name\":\"Tag VIP buyers\",\"enabled\":\"yes\",\"list_id\":\"3\",\"conditional_variation_ids\":[101],\"merge_fields\":{},\"conditionals\":{\"conditions\":[],\"status\":false,\"type\":\"all\"}}"
  }'
```

---

### Change Product Feed Status

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{product_id}/integrations/feed/change-status`

Toggle a product-level integration feed on or off.

- **Permission:** `products/edit`
- **Controller:** `ProductIntegrationsController@changeStatus`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product_id` | integer | path | Yes | The product ID (from URL) |
| `product_id` | integer | body | Yes | The product ID (must also be provided in the request body) |
| `notification_id` | integer | body | Yes | The feed ID to toggle |
| `status` | string | body | Yes | New status: `yes` (enable) or `no` (disable) |

#### Response

```json
{
  "message": "Integration status has been updated"
}
```

#### Error Response

```json
{
  "message": "Product ID and Notification ID are required"
}
```

```json
{
  "message": "Notification not found"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/integrations/feed/change-status" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 123,
    "notification_id": 15,
    "status": "no"
  }'
```

---

### Delete Product Integration Feed

<badge type="danger">DELETE</badge> `/fluent-cart/v2/products/{product_id}/integrations/{integration_id}`

Permanently delete a product-level integration feed.

- **Permission:** `products/delete`
- **Controller:** `ProductIntegrationsController@deleteProductIntegration`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product_id` | integer | path | Yes | The product ID |
| `integration_id` | integer | path | Yes | The feed ID to delete |

#### Response

```json
{
  "message": "Integration deleted successfully"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/products/123/integrations/15" \
  -u "username:app_password"
```
