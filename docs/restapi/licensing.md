---
title: Licensing API
description: FluentCart Pro REST API endpoints for managing software licenses, activations, and the public license validation API.
---

# Licensing API

::: info Pro Feature
All licensing endpoints require FluentCart Pro to be installed and activated.
:::

Manage software licenses including listing, activation, site management, product license settings, and the public license validation API for integrating with your software products.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

---

## Admin License Management

Admin endpoints require an authenticated WordPress user with the appropriate FluentCart capability. Authorization is handled by the `LicensePolicy`.

---

### List Licenses

<badge type="tip">GET</badge> `/fluent-cart/v2/licensing/licenses`

Retrieve a paginated list of all licenses with optional filtering, sorting, and search.

- **Permission:** `licenses/view`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `page` | integer | query | No | Page number for pagination |
| `per_page` | integer | query | No | Number of records per page (default: 10, max: 200) |
| `search` | string | query | No | Search term. Searches across license key, order ID, customer name, customer email, and activated site URLs. Also supports operator syntax (e.g., `license_key = abc123`) |
| `sort_by` | string | query | No | Column to sort by (default: `id`). Must be a fillable column on the License model |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `active_view` | string | query | No | Tab filter. One of: `active`, `expired`, `disabled`, `inactive` |
| `filter_type` | string | query | No | Filter mode: `simple` (default) or `advanced` |
| `advanced_filters` | string (JSON) | query | No | JSON-encoded array of advanced filter groups (requires Pro). Supports filtering by product, customer, and license properties |
| `with` | array/string | query | No | Eager-load relations. Supports relation names and `{relation}Count` for counts |
| `select` | array/string | query | No | Comma-separated list of columns to select |
| `scopes` | array | query | No | Model scopes to apply |
| `include_ids` | array/string | query | No | Comma-separated IDs that must always be included in results |
| `limit` | integer | query | No | Limit number of records (used with non-paginated queries) |
| `offset` | integer | query | No | Offset for records |
| `user_tz` | string | query | No | User timezone for date filtering (e.g., `America/New_York`) |

#### Tab Filter Behavior

| `active_view` Value | Behavior |
|---------------------|----------|
| `active` | Licenses with status `active` whose expiration date is in the future or is null (lifetime) |
| `expired` | Licenses whose expiration date is in the past |
| `disabled` | Licenses with status `disabled` |
| `inactive` | Licenses with status `active` but no site activations |

#### Advanced Filter Options

When using `filter_type=advanced`, the following filter categories are available:

| Category | Filter | Type | Description |
|----------|--------|------|-------------|
| Product | `product` | remote tree select | Filter by product variation |
| Customer | `customer_first_name` | text (relation) | Filter by customer first name |
| Customer | `customer_last_name` | text (relation) | Filter by customer last name |
| License | `license_key` | text | Filter by license key |
| License | `status` | selections (multiple) | Filter by license status: `active`, `disabled`, `expired` |
| License | `activation_count` | numeric | Filter by number of activations |
| License | `expiration_date` | dates | Filter by expiration date range |

#### Response

```json
{
  "licenses": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "status": "active",
        "limit": 5,
        "activation_count": 2,
        "license_key": "XXXX-XXXX-XXXX-XXXX",
        "product_id": 10,
        "variation_id": 15,
        "order_id": 42,
        "parent_id": null,
        "customer_id": 7,
        "expiration_date": "2026-01-15 00:00:00",
        "subscription_id": 3,
        "created_at": "2025-01-15 10:30:00",
        "updated_at": "2025-06-15 10:35:00"
      }
    ],
    "per_page": 10,
    "total": 50,
    "last_page": 5
  }
}
```

::: tip Status Override
If a license has an `expiration_date` in the past, its `status` field is dynamically overridden to `expired` in the response, even if the stored status is `active`.
:::

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/licensing/licenses?page=1&per_page=10&active_view=active" \
  -u "username:app_password"
```

---

### Get Customer Licenses (Admin)

<badge type="tip">GET</badge> `/fluent-cart/v2/licensing/licenses/customer/{id}`

Retrieve a paginated list of licenses belonging to a specific customer.

- **Permission:** `licenses/view`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The customer ID |
| `page` | integer | query | No | Page number for pagination (default: 1) |
| `per_page` | integer | query | No | Number of records per page (default: 10) |

#### Response

```json
{
  "licenses": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "status": "active",
        "limit": 5,
        "activation_count": 2,
        "license_key": "XXXX-XXXX-XXXX-XXXX",
        "product_id": 10,
        "variation_id": 15,
        "order_id": 42,
        "customer_id": 7,
        "expiration_date": "2026-01-15 00:00:00",
        "customer": { ... },
        "product_variant": { ... },
        "order": { ... },
        "product": { ... },
        "activations_count": 2
      }
    ],
    "per_page": 10,
    "total": 5,
    "last_page": 1
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/licensing/licenses/customer/7?per_page=10" \
  -u "username:app_password"
```

---

### Get License Details

<badge type="tip">GET</badge> `/fluent-cart/v2/licensing/licenses/{id}`

Retrieve the full details of a single license including the associated order, activations, product information, downloads, labels, and previous orders.

- **Permission:** `licenses/view`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The license ID |

#### Response

```json
{
  "license": {
    "id": 1,
    "status": "active",
    "limit": 5,
    "activation_count": 2,
    "license_key": "XXXX-XXXX-XXXX-XXXX",
    "product_id": 10,
    "variation_id": 15,
    "order_id": 42,
    "customer_id": 7,
    "expiration_date": "2026-01-15 00:00:00",
    "subscription_id": 3,
    "config": {},
    "customer": { ... },
    "product_variant": { ... },
    "labels": [ ... ]
  },
  "downloads": [
    {
      "id": 1,
      "post_id": 10,
      "product_title": "My Plugin",
      "variation_titles": ["Pro License"],
      "download_url": "https://example.com/?fluent-cart=download&..."
    }
  ],
  "order": {
    "id": 42,
    "order_items": [ ... ],
    "billing_address": { ... },
    "shipping_address": { ... }
  },
  "activations": [
    {
      "id": 1,
      "license_id": 1,
      "site_id": 5,
      "status": "active",
      "is_local": 0,
      "activation_hash": "abc123def456...",
      "site": {
        "id": 5,
        "site_url": "example.com"
      }
    }
  ],
  "product": {
    "ID": 10,
    "post_title": "My Plugin",
    "variants": [ ... ]
  },
  "selected_labels": [1, 3],
  "orders": [
    {
      "id": 42,
      ...
    }
  ],
  "prev_orders": [ ... ],
  "subscription": null,
  "upgrade_path_base": "https://example.com/?fluent-cart=custom-payment"
}
```

#### Error Response (404)

```json
{
  "data": {
    "message": "License not found",
    "buttonText": "Back to License List",
    "route": "/licenses"
  },
  "code": "fluent_cart_entity_not_found"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/licensing/licenses/1" \
  -u "username:app_password"
```

---

### Regenerate License Key

<badge type="warning">POST</badge> `/fluent-cart/v2/licensing/licenses/{id}/regenerate-key`

Generate a new random license key for an existing license. The old key is immediately invalidated.

- **Permission:** `licenses/manage`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The license ID |

#### Response

```json
{
  "license": {
    "id": 1,
    "license_key": "NEW-XXXX-XXXX-XXXX",
    "status": "active",
    ...
  },
  "message": "License key regenerated successfully!"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/licensing/licenses/1/regenerate-key" \
  -u "username:app_password"
```

---

### Extend License Validity

<badge type="warning">POST</badge> `/fluent-cart/v2/licensing/licenses/{id}/extend-validity`

Change the expiration date of a license. Can extend, reduce, or set to lifetime. If the license status is not `active` or `inactive`, it will be automatically set to `active`.

- **Permission:** `licenses/manage`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The license ID |
| `expiration_date` | string | body | Yes | New expiration date in `YYYY-MM-DD HH:MM:SS` format, or the string `lifetime` to remove expiration |

#### Response

```json
{
  "license": {
    "id": 1,
    "expiration_date": "2027-01-15 00:00:00",
    "status": "active",
    ...
  },
  "message": "License validity extended!"
}
```

The response message varies based on the change:
- `"License validity extended!"` -- when the new date is later than the current date
- `"License validity reduced!"` -- when the new date is earlier than the current date
- `"Marked license as lifetime!"` -- when set to `lifetime`

#### Error Response (423)

```json
{
  "message": "Invalid expiration date!"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/licensing/licenses/1/extend-validity" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"expiration_date": "2027-06-15 00:00:00"}'
```

Set to lifetime:

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/licensing/licenses/1/extend-validity" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"expiration_date": "lifetime"}'
```

---

### Update License Status

<badge type="warning">POST</badge> `/fluent-cart/v2/licensing/licenses/{id}/update_status`

Change the status of a license.

- **Permission:** `licenses/manage`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The license ID |
| `status` | string | body | Yes | New status. One of: `active`, `disabled`, `expired` |

#### Response

```json
{
  "license": {
    "id": 1,
    "status": "disabled",
    ...
  },
  "message": "License status has been updated successfully!"
}
```

#### Error Response (423)

```json
{
  "message": "Invalid status!"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/licensing/licenses/1/update_status" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"status": "disabled"}'
```

---

### Update License Activation Limit

<badge type="warning">POST</badge> `/fluent-cart/v2/licensing/licenses/{id}/update_limit`

Change the maximum number of site activations allowed for a license.

- **Permission:** `licenses/manage`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The license ID |
| `limit` | integer/string | body | Yes | New activation limit. Use a positive integer for a specific limit, or `0` / `"unlimited"` for unlimited activations |

#### Response

```json
{
  "license": {
    "id": 1,
    "limit": 10,
    ...
  },
  "message": "License limit has been updated successfully!"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/licensing/licenses/1/update_limit" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'
```

---

### Deactivate Site (Admin)

<badge type="warning">POST</badge> `/fluent-cart/v2/licensing/licenses/{id}/deactivate_site`

Deactivate a specific site activation from a license using the activation ID.

- **Permission:** `licenses/manage`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The license ID (URL parameter, used for routing) |
| `id` | string/integer | body | Yes | The license ID or key (used by the service internally) |
| `activation_id` | string/integer | body | Yes | The activation record ID to deactivate |

#### Response

```json
{
  "message": "Site has been deactivated successfully!"
}
```

#### Error Response

```json
{
  "message": "<error message from license manager>"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/licensing/licenses/1/deactivate_site" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "activation_id": 5}'
```

---

### Activate Site (Admin)

<badge type="warning">POST</badge> `/fluent-cart/v2/licensing/licenses/{id}/activate_site`

Manually activate a site URL on a license from the admin panel.

- **Permission:** `licenses/manage`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The license ID (URL parameter, used for routing) |
| `id` | string/integer | body | Yes | The license ID or key (used by the service internally) |
| `url` | string | body | Yes | The site URL to activate |

#### Response

```json
{
  "message": "Site has been activated successfully!"
}
```

#### Error Response (423)

```json
{
  "message": "<error message from license manager>"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/licensing/licenses/1/activate_site" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "url": "https://my-client-site.com"}'
```

---

### Delete License

<badge type="danger">DELETE</badge> `/fluent-cart/v2/licensing/licenses/{id}/delete`

Permanently delete a license and all its associated data.

- **Permission:** `licenses/delete`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The license ID |

#### Response

```json
{
  "message": "License deleted successfully!"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/licensing/licenses/1/delete" \
  -u "username:app_password"
```

---

## Product License Settings

Endpoints for configuring license settings on a per-product basis. These control how licenses are generated when customers purchase the product.

---

### Get Product License Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/licensing/products/{id}/settings`

Retrieve the license configuration for a specific product, including per-variation activation limits and validity periods.

- **Permission:** `licenses/view`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The product ID |

#### Response

```json
{
  "settings": {
    "enabled": "yes",
    "version": "1.2.0",
    "global_update_file": {
      "id": "",
      "driver": "local",
      "path": "",
      "url": ""
    },
    "variations": [
      {
        "variation_id": 15,
        "title": "Single Site License",
        "activation_limit": 1,
        "validity": {
          "unit": "year",
          "value": 1
        },
        "media": [ ... ],
        "subscription_info": "Billed yearly at $49.00",
        "setup_fee_info": ""
      },
      {
        "variation_id": 16,
        "title": "Unlimited Sites License",
        "activation_limit": "",
        "validity": {
          "unit": "lifetime",
          "value": 1
        },
        "media": [ ... ],
        "subscription_info": "",
        "setup_fee_info": ""
      }
    ],
    "wp": {
      "is_wp": "yes",
      "readme_url": "https://example.com/changelog",
      "banner_url": "https://example.com/banner.png",
      "icon_url": "https://example.com/icon.png",
      "required_php": "7.4",
      "required_wp": "5.6"
    },
    "prefix": "",
    "changelog": "<h4>1.2.0</h4><ul><li>New feature added</li></ul>",
    "license_keys": ""
  },
  "is_bundle_product": false
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `settings.enabled` | string | Whether licensing is enabled: `yes` or `no` |
| `settings.version` | string | Current software version number |
| `settings.global_update_file` | object | The downloadable file used for auto-updates |
| `settings.variations` | array | Per-variation license configuration |
| `settings.variations[].activation_limit` | integer/string | Max activations for this variation (empty = unlimited) |
| `settings.variations[].validity.unit` | string | Validity unit: `day`, `week`, `month`, `year`, or `lifetime` |
| `settings.variations[].validity.value` | integer | Number of validity units |
| `settings.wp` | object | WordPress-specific settings for plugin/theme update API |
| `settings.changelog` | string | HTML changelog content |
| `settings.license_keys` | string | Pre-defined license keys (if applicable) |
| `is_bundle_product` | boolean | Whether the product is a bundle (licensing is disabled for bundles) |

::: warning Bundle Products
Licensing is automatically disabled for bundle products. Bundle item licenses are generated based on each individual bundle item's license settings.
:::

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/licensing/products/10/settings" \
  -u "username:app_password"
```

---

### Save Product License Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/licensing/products/{id}/settings`

Update the license configuration for a specific product.

- **Permission:** `licenses/manage`
- **Policy:** `LicensePolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The product ID |
| `settings` | object | body | Yes | The license settings object |
| `settings.enabled` | string | body | Yes | Enable licensing: `yes` or `no` |
| `settings.version` | string | body | Conditional | Software version (required when `enabled` is `yes`) |
| `settings.global_update_file` | string | body | No | ID of the downloadable file to use for auto-updates |
| `settings.prefix` | string | body | No | License key prefix |
| `settings.variations` | array | body | Yes | Per-variation license configuration |
| `settings.variations[].variation_id` | integer | body | Yes | The variation ID |
| `settings.variations[].activation_limit` | integer/string | body | No | Max site activations (empty or 0 = unlimited, must be >= 0) |
| `settings.variations[].validity` | object | body | Yes | Validity period configuration |
| `settings.variations[].validity.unit` | string | body | Conditional | Validity unit: `day`, `week`, `month`, `year`, or `lifetime` (required when `enabled` is `yes`) |
| `settings.variations[].validity.value` | integer | body | No | Number of validity units (default: 1) |
| `settings.wp` | object | body | No | WordPress update API settings |
| `settings.wp.is_wp` | string | body | No | Whether this is a WordPress plugin/theme: `yes` or `no` |
| `settings.wp.readme_url` | string | body | No | URL to the changelog/readme page |
| `settings.wp.banner_url` | string | body | No | URL to the plugin banner image |
| `settings.wp.icon_url` | string | body | No | URL to the plugin icon |
| `settings.wp.required_php` | string | body | No | Minimum required PHP version |
| `settings.wp.required_wp` | string | body | No | Minimum required WordPress version |
| `settings.changelog` | string | body | No | HTML changelog content |
| `settings.license_keys` | string | body | No | Pre-defined license keys |

#### Response

```json
{
  "message": "Settings has been updated successfully."
}
```

#### Error Response (422)

For bundle products:

```json
{
  "message": "License settings cannot be saved for bundle products. Licenses are generated according to bundle items' license settings."
}
```

#### Validation Errors

```json
{
  "errors": {
    "version": ["The version field is required."]
  }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/licensing/products/10/settings" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "enabled": "yes",
      "version": "1.3.0",
      "global_update_file": "file_abc123",
      "variations": [
        {
          "variation_id": 15,
          "activation_limit": 1,
          "validity": {
            "unit": "year",
            "value": 1
          }
        },
        {
          "variation_id": 16,
          "activation_limit": "",
          "validity": {
            "unit": "lifetime",
            "value": 1
          }
        }
      ],
      "wp": {
        "is_wp": "yes",
        "readme_url": "https://example.com/changelog",
        "banner_url": "https://example.com/banner.png",
        "icon_url": "https://example.com/icon.png",
        "required_php": "7.4",
        "required_wp": "5.6"
      },
      "changelog": "<h4>1.3.0</h4><ul><li>Performance improvements</li></ul>",
      "license_keys": ""
    }
  }'
```

---

## Customer Portal

Customer portal endpoints are authenticated via the logged-in WordPress user. The system resolves the customer from the current user session. Authorization is handled by the `CustomerFrontendPolicy`.

All customer portal license endpoints use the **license key** (not the numeric ID) for identification.

---

### List Customer Licenses

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/licenses/`

Retrieve a paginated list of licenses belonging to the currently logged-in customer.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `page` | integer | query | No | Page number for pagination (default: 1) |
| `per_page` | integer | query | No | Number of records per page (default: 10) |

#### Response

If the user has no associated customer record, the endpoint returns an empty result set rather than an error:

```json
{
  "message": "Unable to find licenses",
  "licenses": {
    "data": [],
    "total": 0
  }
}
```

Successful response with data:

```json
{
  "licenses": {
    "data": [
      {
        "license_key": "XXXX-XXXX-XXXX-XXXX",
        "status": "active",
        "expiration_date": "2026-01-15 00:00:00",
        "variation_id": 15,
        "activation_count": 2,
        "limit": 5,
        "product_id": 10,
        "created_at": "2025-01-15 10:30:00",
        "title": "My Plugin",
        "subtitle": "Pro License",
        "renewal_url": "",
        "has_upgrades": true,
        "order": {
          "uuid": "order-uuid-here"
        }
      }
    ],
    "total": 5,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `license_key` | string | The license key |
| `status` | string | Human-readable status: `active` or `expired` or `disabled` |
| `expiration_date` | string/null | Expiration date in GMT, or `null` for lifetime licenses |
| `activation_count` | integer | Current number of active site activations |
| `limit` | integer | Maximum allowed activations (0 = unlimited) |
| `title` | string | Product title |
| `subtitle` | string | Product variation title |
| `renewal_url` | string | URL to renew an expired subscription-based license (empty if not applicable) |
| `has_upgrades` | boolean | Whether upgrade paths exist for this license's variation |
| `order.uuid` | string | Parent order UUID |

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/licenses/?page=1&per_page=10" \
  -H "X-WP-Nonce: <nonce>"
```

---

### Get Customer License Details

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/licenses/{license_key}`

Retrieve full details of a specific license for the currently logged-in customer.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `license_key` | string | path | Yes | The license key (alphanumeric with dashes) |

#### Response

```json
{
  "message": "Success",
  "license": {
    "license_key": "XXXX-XXXX-XXXX-XXXX",
    "status": "active",
    "expiration_date": "2026-01-15 00:00:00",
    "variation_id": 15,
    "activation_count": 2,
    "limit": 5,
    "product_id": 10,
    "created_at": "2025-01-15 10:30:00",
    "title": "My Plugin",
    "subtitle": "Pro License",
    "renewal_url": "",
    "has_upgrades": true,
    "order": {
      "uuid": "order-uuid-here"
    }
  },
  "section_parts": {
    "before_summary": "",
    "after_summary": "",
    "end_of_details": "",
    "additional_actions": ""
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `license` | object | The formatted license details (see fields in List Customer Licenses) |
| `section_parts` | object | HTML content blocks injected via the `fluent_cart/customer/license_details_section_parts` filter. Used by extensions to add custom UI sections |

#### Error Response (422)

```json
{
  "message": "License not found"
}
```

Customer not found:

```json
{
  "message": "Customer not found"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/licenses/XXXX-XXXX-XXXX-XXXX" \
  -H "X-WP-Nonce: <nonce>"
```

---

### Get License Activations

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/licenses/{license_key}/activations`

Retrieve all site activations for a specific license belonging to the currently logged-in customer.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `license_key` | string | path | Yes | The license key (alphanumeric with dashes) |

#### Response

```json
{
  "activations": [
    {
      "site_url": "example.com",
      "is_local": 0,
      "status": "active",
      "created_at": "2025-03-10 14:22:00"
    },
    {
      "site_url": "staging.example.com",
      "is_local": 1,
      "status": "active",
      "created_at": "2025-03-12 09:15:00"
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `site_url` | string | The activated site URL (without protocol) |
| `is_local` | integer | Whether this is a local/staging site (1) or production site (0). Local sites do not count toward the activation limit |
| `status` | string | Activation status |
| `created_at` | string | When the activation was created |

#### Error Responses

License not found (422):

```json
{
  "message": "License not found"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/licenses/XXXX-XXXX-XXXX-XXXX/activations" \
  -H "X-WP-Nonce: <nonce>"
```

---

### Deactivate Site (Customer)

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/licenses/{license_key}/deactivate_site`

Deactivate a specific site from a license. The customer can only deactivate sites from their own licenses.

- **Policy:** `CustomerFrontendPolicy`
- **Auth:** Logged-in WordPress user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `license_key` | string | path | Yes | The license key (alphanumeric with dashes) |
| `site_url` | string | body | Yes | The site URL to deactivate |

#### Response

```json
{
  "message": "Site deactivated successfully"
}
```

#### Error Responses

License not found (422):

```json
{
  "message": "License not found"
}
```

Site not found or not activated (422):

```json
{
  "message": "Site not found or not activated for this license"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/licenses/XXXX-XXXX-XXXX-XXXX/deactivate_site" \
  -H "X-WP-Nonce: <nonce>" \
  -H "Content-Type: application/json" \
  -d '{"site_url": "example.com"}'
```

---

## Plugin License Management

These endpoints manage the FluentCart Pro plugin's own license activation on your WordPress site. They are used by the FluentCart Pro settings panel to activate, check, and deactivate the plugin license.

Authorization is handled by the `AdminPolicy` (requires WordPress administrator).

---

### Get Plugin License Status

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/license/`

Retrieve the current activation status of the FluentCart Pro plugin license on this site.

- **Policy:** `AdminPolicy`

#### Parameters

None.

#### Response

```json
{
  "status": "valid",
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "expires": "2026-01-15",
  ...
}
```

The response structure depends on the FluentCart licensing server's response format.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/license/" \
  -u "username:app_password"
```

---

### Activate Plugin License

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/license/`

Activate a FluentCart Pro license key on this WordPress site.

- **Policy:** `AdminPolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `license_key` | string | body | Yes | The FluentCart Pro license key to activate |

#### Response

On success:

```json
{
  "status": "valid",
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "notice": {
    "id": "fluent_cart_license_activated",
    "html": "<div>Your FluentCart Pro license has been activated successfully.</div>",
    "timeout": 5000
  },
  ...
}
```

#### Error Response

Returns a `WP_Error` if the license key is invalid or activation fails.

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/license/" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"license_key": "XXXX-XXXX-XXXX-XXXX"}'
```

---

### Deactivate Plugin License

<badge type="danger">DELETE</badge> `/fluent-cart/v2/settings/license/`

Deactivate the FluentCart Pro license from this WordPress site.

- **Policy:** `AdminPolicy`

#### Parameters

None.

#### Response

```json
{
  "status": "deactivated",
  "notice": {
    "id": "activate_license",
    "html": "<div>License deactivation message</div>"
  },
  ...
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/settings/license/" \
  -u "username:app_password"
```

---

## Public License API

::: warning Not a REST API
The public license API does **not** use the WordPress REST API (`wp-json`). Instead, it uses query parameter-based URLs on the site's front end. No authentication is required -- these endpoints are designed to be called by your software products (plugins, themes, apps) from customer sites.
:::

**Base URL:** `https://your-site.com/?fluent-cart={action}`

All public license API endpoints accept parameters via query strings (GET) or POST body, and return JSON responses. These are the endpoints your distributed software should call for license validation, activation, deactivation, version checking, and downloading updates.

---

### Check License

`GET/POST` `https://your-site.com/?fluent-cart=check_license`

Verify the validity of a license key and check its activation status for a specific site.

- **Auth:** None required

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `license_key` | string | Conditional | The license key to check. Required if `activation_hash` is not provided |
| `activation_hash` | string | Conditional | The activation hash from a previous activation. Required if `license_key` is not provided |
| `item_id` | string | Yes | The product ID (must match the license's product) |
| `site_url` | string | Yes | The site URL making the request |

#### Response (Valid License)

```json
{
  "success": true,
  "status": "valid",
  "activation_limit": 5,
  "activation_hash": "abc123def456...",
  "activations_count": 2,
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "expiration_date": "2026-01-15 00:00:00",
  "product_id": 10,
  "variation_id": 15,
  "variation_title": "Pro License",
  "product_title": "My Plugin",
  "created_at": "2025-01-15 10:30:00",
  "updated_at": "2025-06-15 10:35:00"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | License status: `valid`, `expired`, or `invalid` |
| `activation_limit` | integer | Maximum allowed site activations (0 = unlimited) |
| `activation_hash` | string | Unique hash for this site's activation (empty if not activated) |
| `activations_count` | integer | Current number of active site activations |
| `license_key` | string | The license key |
| `expiration_date` | string | Expiration date in GMT, or `lifetime` for non-expiring licenses |
| `product_id` | string | The product ID |
| `variation_id` | integer | The product variation ID |
| `variation_title` | string | The product variation title |
| `product_title` | string | The product title |

#### Error Response (Validation)

```json
{
  "success": true,
  "status": "invalid",
  "error_type": "validation_error",
  "message": "license_key, site_url and item_id is required"
}
```

#### Error Types

| `error_type` | Description |
|--------------|-------------|
| `validation_error` | Missing required parameters |
| `invalid_license` | License key not found |
| `invalid_activation` | No activation found for this site |
| `key_mismatch` | License key does not match the provided `item_id` |

#### Example

```bash
curl -X GET "https://example.com/?fluent-cart=check_license&license_key=XXXX-XXXX-XXXX-XXXX&item_id=10&site_url=https://customer-site.com"
```

---

### Activate License

`POST` `https://your-site.com/?fluent-cart=activate_license`

Activate a license key on a specific site URL. If the site is already activated for this license, the existing activation details are returned. Local/staging sites are detected automatically and do not count toward the activation limit.

- **Auth:** None required

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `license_key` | string | Yes | The license key to activate |
| `item_id` | string | Yes | The product ID (must match the license's product) |
| `site_url` | string | Yes | The site URL to activate |
| `server_version` | string | No | The server software version (e.g., PHP version) |
| `platform_version` | string | No | The platform version (e.g., WordPress version) |

#### Response (Success)

```json
{
  "success": true,
  "status": "valid",
  "activation_limit": 5,
  "activation_hash": "abc123def456...",
  "activations_count": 3,
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "expiration_date": "2026-01-15 00:00:00",
  "product_id": 10,
  "variation_id": 15,
  "variation_title": "Pro License",
  "product_title": "My Plugin",
  "created_at": "2025-01-15 10:30:00",
  "updated_at": "2025-06-15 10:35:00"
}
```

::: tip Local/Staging Detection
Sites matching common local/staging patterns are automatically detected and marked with `is_local = 1`. These activations do not count toward the activation limit. Detected patterns include:
- **Subdomains:** `staging.`, `dev.`, `test.`, `qa.`, `sandbox.`, `beta.`, `preview.`, `uat.`, `development.`
- **Subfolders:** `/staging/`, `/dev/`, `/test/`, etc.
- **Domains:** `localhost`, `.wpengine.com`, `.kinsta.cloud`, `.cloudwaysapps.com`, `.pantheonsite.io`, and other popular hosting staging domains
:::

#### Error Responses (422)

Missing required fields:

```json
{
  "success": false,
  "message": "license_key, site_url and item_id is required",
  "error_type": "validation_error"
}
```

License not found:

```json
{
  "success": false,
  "message": "License not found",
  "error_type": "license_not_found"
}
```

Product mismatch:

```json
{
  "success": false,
  "message": "This license key is not valid for this product. Did you provide the valid license key?",
  "error_type": "key_mismatch"
}
```

License expired:

```json
{
  "success": false,
  "message": "The license key is expired. Please renew or purchase a new license",
  "error_type": "license_expired"
}
```

License not active:

```json
{
  "success": false,
  "message": "The license is not Active. Please contact the support.",
  "error_type": "license_not_active"
}
```

Activation limit reached:

```json
{
  "success": false,
  "message": "This license key has no activation limit. Please upgrade or purchase a new license.",
  "error_type": "activation_limit_exceeded"
}
```

#### Error Types

| `error_type` | Description |
|--------------|-------------|
| `validation_error` | Missing required parameters |
| `license_not_found` | License key does not exist |
| `key_mismatch` | License key does not match the provided `item_id` |
| `license_expired` | License has expired |
| `license_not_active` | License status is not active (e.g., disabled) |
| `activation_limit_exceeded` | No remaining activations available |
| `activation_error` | General activation error (from filter) |

#### Example

```bash
curl -X POST "https://example.com/?fluent-cart=activate_license" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "license_key=XXXX-XXXX-XXXX-XXXX&item_id=10&site_url=https://customer-site.com&server_version=8.1&platform_version=6.4"
```

---

### Deactivate License

`POST` `https://your-site.com/?fluent-cart=deactivate_license`

Deactivate a license from a specific site URL. Removes the site activation and decrements the activation count.

- **Auth:** None required

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `license_key` | string | Yes | The license key to deactivate |
| `item_id` | string | Yes | The product ID (must match the license's product) |
| `site_url` | string | Yes | The site URL to deactivate |

#### Response (Success)

```json
{
  "success": true,
  "status": "deactivated",
  "activation_limit": 5,
  "activations_count": 2,
  "expiration_date": "2026-01-15 00:00:00",
  "product_id": 10,
  "variation_id": 15,
  "product_title": "My Plugin",
  "variation_title": "Pro License",
  "created_at": "2025-01-15 10:30:00",
  "updated_at": "2025-06-15 10:35:00"
}
```

#### Error Responses (422)

Missing required fields:

```json
{
  "success": false,
  "message": "license_key, site_url and item_id is required",
  "error_type": "validation_error"
}
```

License not found or product mismatch:

```json
{
  "success": false,
  "message": "License not found or does not match with the item_id",
  "error_type": "license_not_found"
}
```

Site not found:

```json
{
  "success": false,
  "message": "Site not found",
  "error_type": "site_not_found"
}
```

#### Example

```bash
curl -X POST "https://example.com/?fluent-cart=deactivate_license" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "license_key=XXXX-XXXX-XXXX-XXXX&item_id=10&site_url=https://customer-site.com"
```

---

### Get License Version

`GET/POST` `https://your-site.com/?fluent-cart=get_license_version`

Retrieve the latest version information for a licensed product. This endpoint is designed to integrate with WordPress plugin/theme update mechanisms. It returns version data, changelog, download links, and banner/icon URLs.

- **Auth:** None required

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item_id` | string | Yes | The product ID |
| `license_key` | string | Conditional | License key for authenticated download links. Required if `activation_hash` is not provided |
| `activation_hash` | string | Conditional | Activation hash for authenticated download links. Required if `license_key` is not provided |
| `site_url` | string | No | The site URL making the request |

#### Response (Valid License)

```json
{
  "success": true,
  "new_version": "1.3.0",
  "stable_version": "1.3.0",
  "name": "My Plugin",
  "slug": "my-plugin",
  "url": "https://example.com/my-plugin",
  "last_updated": "2025-06-15 10:30:00",
  "homepage": "https://example.com/my-plugin",
  "package": "https://example.com/?fluent-cart=download_license_package&fct_package=...",
  "download_link": "https://example.com/?fluent-cart=download_license_package&fct_package=...",
  "trunk": "https://example.com/?fluent-cart=download_license_package&fct_package=...",
  "license_status": "valid",
  "sections": {
    "description": "Product description here",
    "changelog": "<h4>1.3.0</h4><ul><li>New feature</li></ul>"
  },
  "banners": {
    "low": "https://example.com/banner.png",
    "high": "https://example.com/banner.png"
  },
  "icons": {
    "2x": "https://example.com/icon.png",
    "1x": "https://example.com/icon.png"
  }
}
```

#### Response (Invalid License)

When the license is invalid or expired, version information is still returned but without download links:

```json
{
  "success": true,
  "new_version": "1.3.0",
  "stable_version": "1.3.0",
  "name": "My Plugin",
  "slug": "my-plugin",
  "package": "",
  "download_link": "",
  "license_message": "Invalid License Key",
  "license_status": "invalid",
  "sections": { ... },
  "banners": { ... },
  "icons": { ... }
}
```

::: tip Download Link Expiry
The `package` / `download_link` URL contains a time-limited token that expires after 48 hours. WordPress will use this URL to download the update package.
:::

#### Error Response (422)

Product not found:

```json
{
  "success": false,
  "message": "Product not found",
  "error_type": "product_not_found"
}
```

Licensing not enabled:

```json
{
  "success": false,
  "message": "License is not enabled for this product",
  "error_type": "license_not_enabled"
}
```

License settings not found:

```json
{
  "success": false,
  "message": "License settings not found for this product",
  "error_type": "license_settings_not_found"
}
```

#### Example

```bash
curl -X GET "https://example.com/?fluent-cart=get_license_version&item_id=10&license_key=XXXX-XXXX-XXXX-XXXX&site_url=https://customer-site.com"
```

---

### Download License Package

`GET` `https://your-site.com/?fluent-cart=download_license_package`

Download the product's update package file. This endpoint is not called directly -- it is used via the signed URLs generated by the [Get License Version](#get-license-version) endpoint. The URL contains an encoded token (`fct_package`) that includes the license key, activation hash, site URL, product ID, and expiration timestamp.

- **Auth:** None required (authentication is embedded in the signed URL)

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fct_package` | string | Yes | Base64-encoded package data containing license credentials and expiration. This is automatically generated by the version check endpoint |

#### Response

On success, the endpoint responds with an HTTP 302 redirect to the signed download URL for the file. The browser or update mechanism follows the redirect to download the file.

#### Error Responses (422)

Invalid package data:

```json
{
  "success": false,
  "message": "Invalid package data",
  "error_type": "invalid_package_data"
}
```

Invalid license:

```json
{
  "success": false,
  "message": "This license key is not valid",
  "error_type": "expired_license"
}
```

No downloadable file:

```json
{
  "success": false,
  "message": "No downloadable file found for this product",
  "error_type": "downloadable_file_not_found"
}
```

#### Example

This endpoint is typically not called directly. It is accessed via the `package` URL returned by the version check endpoint:

```
https://example.com/?fluent-cart=download_license_package&fct_package=WFhYWC1YWFhYLVhYWFgtWFhYWDo6Y3VzdG9tZXItc2l0ZS5jb206MTA6MTczNzAwMDAwMA==
```

---

## License Statuses

| Status | Description |
|--------|-------------|
| `active` | License is valid and in use |
| `inactive` | License is valid but has no site activations |
| `expired` | License expiration date has passed (includes a configurable grace period, default 15 days) |
| `disabled` | License has been manually disabled by an admin |

### Public Status Mapping

The public license API returns simplified statuses:

| Internal Status | Public Status |
|----------------|---------------|
| `active` (not expired) | `valid` |
| `inactive` (not expired) | `valid` |
| `expired` | `expired` |
| `disabled` | `invalid` |

---

## Hooks and Filters

| Hook | Type | Description |
|------|------|-------------|
| `fluent_cart/license/check_license_response` | filter | Modify the check license response before returning |
| `fluent_cart/license/activate_license_response` | filter | Modify the activate license response before returning |
| `fluent_cart/license/deactivate_license_response` | filter | Modify the deactivate license response before returning |
| `fluent_cart/license/get_version_response` | filter | Modify the version check response before returning |
| `fluent_cart/license/checking_error` | filter | Modify error responses during license checking |
| `fluent_cart/license/check_item_id` | filter | Control whether `item_id` validation is enforced |
| `fluent_cart/license/site_activated` | action | Fired after a site is successfully activated |
| `fluent_cart/license/site_deactivated` | action | Fired after a site is successfully deactivated |
| `fluent_cart/license/santized_url` | filter | Modify the sanitized site URL |
| `fluent_cart/license/staging_subdomain_patterns` | filter | Customize subdomain patterns for local site detection |
| `fluent_cart/license/staging_subfolder_patterns` | filter | Customize subfolder patterns for local site detection |
| `fluent_cart/license/staging_domains` | filter | Customize domain patterns for local site detection |
| `fluent_cart/license/is_staging_site_result` | filter | Override the final local site detection result |
| `fluent_cart/license/grace_period_in_days` | filter | Change the license expiration grace period (default: 15 days) |
| `fluent_cart/license/validity_by_variation` | filter | Modify validity settings for a variation during save |
| `fluent_cart/license/default_validity_by_variation` | filter | Modify the default validity for a new variation |
| `fluent_cart/license/expiration_date_by_variation` | filter | Modify the calculated expiration timestamp |
| `fluent_cart/customer/license_details_section_parts` | filter | Add custom HTML sections to the customer portal license detail view |
| `fluent_cart/licenses_list_filter_query` | filter | Modify the license list query before execution |
| `fluent_cart_sl/license_deleted` | action | Fired after a license is deleted |
| `fluent_cart_sl/license_status_updated` | action | Fired after a license status changes |
| `fluent_cart_sl/license_key_regenerated` | action | Fired after a license key is regenerated |
| `fluent_cart_sl/license_validity_extended` | action | Fired after a license expiration date is changed |
| `fluent_cart_sl/license_limit_increased` | action | Fired after a license activation limit is changed |
| `fluent_cart_sl/site_license_deactivated` | action | Fired after a customer deactivates a site from the portal |
