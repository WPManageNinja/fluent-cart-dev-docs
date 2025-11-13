---
title: Email Notification API
description: FluentCart Email Notification API for managing email notifications and templates.
---

# Email Notification API

The Email Notification API provides endpoints for managing email notifications, templates, and email settings in FluentCart.

## Base URL

All Email Notification API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

All Email Notification API endpoints require:
- **Policy**: `StoreSensitivePolicy`

## Notifications

### List Notifications

Retrieve all available email notifications.

**Endpoint:** `GET /email-notification/`

**Permission Required**: `StoreSensitivePolicy`

#### Response

```json
{
  "success": true,
  "data": [
    {
      "name": "order_placed",
      "title": "Order Placed",
      "description": "Sent when an order is placed",
      "active": true,
      "settings": {}
    },
    {
      "name": "order_completed",
      "title": "Order Completed",
      "description": "Sent when an order is completed",
      "active": false,
      "settings": {}
    }
  ]
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/email-notification/" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Notification Details

Retrieve details for a specific email notification.

**Endpoint:** `GET /email-notification/{notification}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notification` | string | Yes | Notification name/identifier (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "name": "order_placed",
    "title": "Order Placed",
    "description": "Sent when an order is placed",
    "active": true,
    "settings": {
      "subject": "Order #{{order_id}}",
      "content": "Thank you for your order..."
    }
  },
  "shortcodes": [
    {
      "shortcode": "[order_id]",
      "description": "Order ID"
    }
  ]
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/email-notification/order_placed" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Notification

Update settings for a specific email notification.

**Endpoint:** `PUT /email-notification/{notification}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notification` | string | Yes | Notification name/identifier (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `settings` | object | Yes | Notification settings object |

```json
{
  "settings": {
    "active": true,
    "subject": "Order #{{order_id}}",
    "content": "Thank you for your order...",
    "from_name": "My Store",
    "from_email": "store@example.com"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Notification updated successfully"
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/email-notification/order_placed" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "active": true,
      "subject": "Order #{{order_id}}"
    }
  }'
```

### Enable/Disable Notification

Enable or disable a specific email notification.

**Endpoint:** `POST /email-notification/enable-notification/{name}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Notification name/identifier (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `active` | string | Yes | Status: `'yes'` to enable, `'no'` to disable |

```json
{
  "active": "yes"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Notification updated successfully"
  }
}
```

## Shortcodes

### Get Shortcodes

Retrieve available shortcodes for email templates and settings.

**Endpoint:** `GET /email-notification/get-short-codes`

**Permission Required**: `StoreSensitivePolicy`

#### Response

```json
{
  "success": true,
  "data": {
    "email_templates": [
      {
        "path": "order_placed",
        "label": "Order Placed"
      }
    ],
    "shortcodes": [
      {
        "shortcode": "[order_id]",
        "description": "Order ID"
      },
      {
        "shortcode": "[customer_name]",
        "description": "Customer Name"
      }
    ],
    "buttons": [
      {
        "label": "View Order",
        "shortcode": "[view_order_button]"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/email-notification/get-short-codes" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Template

Retrieve email template content by path name.

**Endpoint:** `POST /email-notification/get-template`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `template` | string | Yes | Template path name |

```json
{
  "template": "order_placed"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "content": "<html>...</html>"
  }
}
```

## Settings

### Get Email Settings

Retrieve global email notification settings.

**Endpoint:** `GET /email-notification/get-settings`

**Permission Required**: `StoreSensitivePolicy`

#### Response

```json
{
  "success": true,
  "data": {
    "from_name": "My Store",
    "from_email": "store@example.com",
    "reply_to": "support@example.com",
    "show_email_footer": "yes"
  },
  "shortcodes": [
    {
      "shortcode": "[site_name]",
      "description": "Site Name"
    }
  ]
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/email-notification/get-settings" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Save Email Settings

Update global email notification settings.

**Endpoint:** `POST /email-notification/save-settings`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

The request body should contain email settings fields.

```json
{
  "from_name": "My Store",
  "from_email": "store@example.com",
  "reply_to": "support@example.com",
  "show_email_footer": "yes"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Email settings saved successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/email-notification/save-settings" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "from_name": "My Store",
    "from_email": "store@example.com"
  }'
```

## Notes

- Email notifications can be enabled/disabled individually
- Shortcodes can be used in email templates and settings
- Email templates are stored as PHP files
- Global email settings apply to all notifications unless overridden
- The `show_email_footer` setting is always `'yes'` in the free version

---

**Related Documentation:**
- [Settings API](./settings) - Store settings management
- [Orders API](./orders) - Order management

