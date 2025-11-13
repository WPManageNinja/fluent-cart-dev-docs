---
title: Settings API
description: FluentCart Settings API for managing store settings, payment methods, storage drivers, modules, and permissions.
---

# Settings API

The Settings API provides endpoints for managing various FluentCart settings including store configuration, payment methods, storage drivers, module settings, and permissions.

## Base URL

All Settings API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

Settings API endpoints require different policies and permissions:

- **Store Settings**: `StoreSettingsPolicy` with `store/settings` permission
- **Payment Methods**: `StoreSettingsPolicy` with `is_super_admin` permission
- **Storage Drivers**: `StoreSettingsPolicy` with `is_super_admin` permission
- **Module Settings**: `StoreSettingsPolicy` with `is_supper_admin` permission
- **Permissions**: `StoreSettingsPolicy` with `is_super_admin` permission
- **PayPal Webhooks**: `AdminPolicy` with `super_admin` permission

## Store Settings

### Get Store Settings

Retrieve store settings for a specific settings tab.

**Endpoint:** `GET /settings/store`

**Permission Required**: `store/settings`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `settings_name` | string | Yes | Settings tab name to retrieve |

#### Response

```json
{
  "settings": {
    "store_name": "My Store",
    "store_email": "store@example.com",
    "store_logo": {
      "id": 123,
      "url": "https://yoursite.com/wp-content/uploads/logo.png",
      "title": "Store Logo"
    }
  },
  "fields": {
    "general": {
      "title": "General Settings",
      "schema": {}
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/settings/store?settings_name=general" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Save Store Settings

Update store settings.

**Endpoint:** `POST /settings/store`

**Permission Required**: `store/settings`

#### Request Body

The request body should contain the settings fields to update. The structure depends on the settings tab being updated.

```json
{
  "store_name": "My Updated Store",
  "store_email": "newemail@example.com",
  "store_logo": {
    "id": 456,
    "url": "https://yoursite.com/wp-content/uploads/new-logo.png",
    "title": "New Store Logo"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Settings saved successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/settings/store" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "store_name": "My Updated Store",
    "store_email": "newemail@example.com"
  }'
```

## Payment Methods

### Get Payment Method Settings

Retrieve settings for a specific payment method.

**Endpoint:** `GET /settings/payment-methods`

**Permission Required**: `is_super_admin`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | string | Yes | Payment method identifier (e.g., 'stripe', 'paypal') |

#### Response

```json
{
  "success": true,
  "data": {
    "settings": {
      "enabled": true,
      "title": "Credit Card",
      "description": "Pay with credit card"
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/settings/payment-methods?method=stripe" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get All Payment Methods

Retrieve a list of all available payment methods, categorized by availability.

**Endpoint:** `GET /settings/payment-methods/all`

**Permission Required**: `is_super_admin`

#### Response

```json
{
  "gateways": [
    {
      "key": "stripe",
      "title": "Stripe",
      "description": "Accept credit card payments",
      "enabled": true,
      "requires_pro": false,
      "upcoming": false
    }
  ]
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/settings/payment-methods/all" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Save Payment Method Settings

Update settings for a payment method.

**Endpoint:** `POST /settings/payment-methods`

**Permission Required**: `is_super_admin`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | string | Yes | Payment method identifier |
| `settings` | object | Yes | Payment method settings object |

```json
{
  "method": "stripe",
  "settings": {
    "enabled": true,
    "title": "Credit Card",
    "api_key": "sk_test_...",
    "publishable_key": "pk_test_..."
  }
}
```

#### Response

```json
{
  "success": true,
  "message": "Settings saved successfully"
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/settings/payment-methods" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "stripe",
    "settings": {
      "enabled": true,
      "title": "Credit Card"
    }
  }'
```

### Reorder Payment Methods

Update the display order of payment methods.

**Endpoint:** `POST /settings/payment-methods/reorder`

**Permission Required**: `is_super_admin`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order` | array | Yes | Array of payment method keys in desired order |

```json
{
  "order": ["stripe", "paypal", "manual"]
}
```

#### Response

```json
{
  "success": true,
  "message": "Payment methods reordered successfully"
}
```

### Get Payment Method Connect Info

Retrieve connection information for a payment method.

**Endpoint:** `GET /settings/payment-methods/connect/info`

**Permission Required**: `is_super_admin`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | string | Yes | Payment method identifier |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/settings/payment-methods/connect/info?method=stripe" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Disconnect Payment Method

Disconnect a payment method.

**Endpoint:** `POST /settings/payment-methods/disconnect`

**Permission Required**: `is_super_admin`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | string | Yes | Payment method identifier |
| `mode` | string | Yes | Connection mode (e.g., 'live', 'test') |

```json
{
  "method": "stripe",
  "mode": "live"
}
```

#### Response

```json
{
  "success": true,
  "message": "Payment method disconnected successfully"
}
```

### Save Payment Method Design

Update checkout design settings for a payment method.

**Endpoint:** `POST /settings/payment-methods/design`

**Permission Required**: `is_super_admin`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | string | Yes | Payment method identifier |
| `checkout_label` | string | No | Custom label for checkout |
| `checkout_logo` | string | No | Logo URL for checkout |
| `checkout_instructions` | string | No | Checkout instructions (HTML allowed) |

```json
{
  "method": "stripe",
  "checkout_label": "Pay with Stripe",
  "checkout_logo": "https://yoursite.com/wp-content/uploads/stripe-logo.png",
  "checkout_instructions": "<p>Secure payment processing</p>"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Checkout design settings saved",
    "settings": {}
  }
}
```

## PayPal Webhooks

### Get PayPal Seller Auth Token

Get seller authentication token for PayPal.

**Endpoint:** `POST /settings/payment-methods/paypal/seller-auth-token`

**Policy**: `AdminPolicy`

**Permission Required**: `super_admin`

#### Request Body

The request body structure depends on PayPal integration requirements.

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/settings/payment-methods/paypal/seller-auth-token" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json"
```

### Setup PayPal Webhook

Set up PayPal webhook for payment notifications.

**Endpoint:** `POST /settings/payment-methods/paypal/webhook/setup`

**Policy**: `AdminPolicy`

**Permission Required**: `super_admin`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | PayPal mode: `'live'` or `'test'` |

```json
{
  "mode": "live"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Webhook setup successfully! Please reload the page."
  }
}
```

### Check PayPal Webhook

Check PayPal webhook status.

**Endpoint:** `GET /settings/payment-methods/paypal/webhook/check`

**Policy**: `AdminPolicy`

**Permission Required**: `super_admin`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | PayPal mode: `'live'` or `'test'` |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/settings/payment-methods/paypal/webhook/check?mode=live" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Storage Drivers

### List Storage Drivers

Retrieve a list of all available storage drivers.

**Endpoint:** `GET /settings/storage-drivers`

**Permission Required**: `is_super_admin`

#### Response

```json
{
  "drivers": [
    {
      "key": "local",
      "title": "Local Storage",
      "description": "Store files on your server",
      "enabled": true
    },
    {
      "key": "s3",
      "title": "Amazon S3",
      "description": "Store files on Amazon S3",
      "enabled": false
    }
  ]
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/settings/storage-drivers" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Active Storage Drivers

Retrieve a list of active storage drivers.

**Endpoint:** `GET /settings/storage-drivers/active-drivers`

**Permission Required**: `is_super_admin`

#### Response

```json
{
  "drivers": [
    {
      "key": "local",
      "title": "Local Storage",
      "enabled": true
    }
  ]
}
```

### Get Storage Driver Settings

Retrieve settings for a specific storage driver.

**Endpoint:** `GET /settings/storage-drivers/{driver}`

**Permission Required**: `is_super_admin`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driver` | string | Yes | Storage driver key (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "settings": {
      "bucket": "my-bucket",
      "region": "us-east-1",
      "access_key": "***",
      "secret_key": "***"
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/settings/storage-drivers/s3" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Save Storage Driver Settings

Update settings for a storage driver.

**Endpoint:** `POST /settings/storage-drivers`

**Permission Required**: `is_super_admin`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driver` | string | Yes | Storage driver key |
| `settings` | object | Yes | Storage driver settings object |

```json
{
  "driver": "s3",
  "settings": {
    "bucket": "my-bucket",
    "region": "us-east-1",
    "access_key": "AKIAIOSFODNN7EXAMPLE",
    "secret_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Settings saved successfully",
    "data": {}
  }
}
```

### Verify Storage Driver Connection

Verify connection information for a storage driver.

**Endpoint:** `POST /settings/storage-drivers/verify-info`

**Permission Required**: `is_super_admin`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driver` | string | Yes | Storage driver key |
| `settings` | object | Yes | Storage driver settings to verify |

```json
{
  "driver": "s3",
  "settings": {
    "bucket": "my-bucket",
    "region": "us-east-1",
    "access_key": "AKIAIOSFODNN7EXAMPLE",
    "secret_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Connection verified successfully"
  }
}
```

## Module Settings

### Get Module Settings

Retrieve module settings and available modules.

**Endpoint:** `GET /settings/modules/`

**Permission Required**: `is_supper_admin`

#### Response

```json
{
  "success": true,
  "data": {
    "fields": {
      "modules_settings": {
        "title": "Features & addon",
        "type": "section",
        "schema": {}
      }
    },
    "settings": {
      "shipping": {
        "active": "yes"
      },
      "subscriptions": {
        "active": "no"
      }
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/settings/modules/" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Save Module Settings

Update module settings (activate/deactivate modules).

**Endpoint:** `POST /settings/modules/`

**Permission Required**: `is_supper_admin`

#### Request Body

The request body should contain module settings with `active` status for each module.

```json
{
  "shipping": {
    "active": "yes"
  },
  "subscriptions": {
    "active": "yes"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Settings saved successfully"
  }
}
```

**Note**: When modules are activated or deactivated, the following actions are triggered:
- `fluent_cart/module/activated/{moduleKey}` - When a module is activated
- `fluent_cart/module/deactivated/{moduleKey}` - When a module is deactivated

## Confirmation Settings

### Save Confirmation Settings

Update confirmation page settings.

**Endpoint:** `POST /settings/confirmation`

**Permission Required**: `is_supper_admin`

#### Request Body

The request body structure depends on confirmation settings fields.

```json
{
  "confirmation_page_id": 123,
  "settings": {}
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Settings saved successfully"
  }
}
```

### Get Confirmation Shortcodes

Retrieve available shortcodes for confirmation pages.

**Endpoint:** `GET /settings/confirmation/shortcode`

**Permission Required**: `is_supper_admin`

#### Response

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "shortcode": "[order_id]",
        "description": "Order ID"
      }
    ]
  }
}
```

## Permissions

**Note**: Permission endpoints are documented in the [Roles & Permissions API](./roles-permissions) documentation.

- `GET /settings/permissions` - Get permissions
- `POST /settings/permissions` - Save permissions

---

## Checkout Fields

### Get Checkout Fields

Retrieve checkout field schema configuration and settings.

**Endpoint:** `GET /checkout-fields/get-fields`

**Permission Required**: `StoreSensitivePolicy`

#### Response

```json
{
  "fields": {
    "billing": {
      "first_name": {
        "label": "First Name",
        "required": true,
        "type": "text"
      },
      "last_name": {
        "label": "Last Name",
        "required": true,
        "type": "text"
      }
    },
    "shipping": {
      "first_name": {
        "label": "First Name",
        "required": true,
        "type": "text"
      }
    }
  },
  "settings": {
    "enable_shipping_fields": true,
    "enable_billing_fields": true
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/checkout-fields/get-fields" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Save Checkout Fields

Update checkout field settings.

**Endpoint:** `POST /checkout-fields/save-fields`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `settings` | object | Yes | Checkout field settings object |

```json
{
  "settings": {
    "enable_shipping_fields": true,
    "enable_billing_fields": true,
    "billing_first_name_required": true,
    "billing_last_name_required": true
  }
}
```

#### Response

```json
{
  "message": "Checkout fields has been updated successfully."
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/checkout-fields/save-fields" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "enable_shipping_fields": true,
      "enable_billing_fields": true
    }
  }'
```


