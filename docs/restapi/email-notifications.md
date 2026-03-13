---
title: Email Notifications API
description: FluentCart REST API endpoints for managing email notification templates and settings.
---

<div v-pre>

# Email Notifications API

Configure email notification templates, manage scheduling reminders, preview templates, and update notification settings.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/email-notification`

**Policy:** `StoreSensitivePolicy` — Requires `store/sensitive` capability.

---

## List All Notifications

<badge type="tip">GET</badge> `/fluent-cart/v2/email-notification`

Retrieve all registered email notification templates with their current configuration. Returns both default and customized notification settings for orders, subscriptions, and scheduler/reminder actions.

### Parameters

No parameters required.

### Response

```json
{
  "data": {
    "order_paid_admin": {
      "event": "order_paid_done",
      "group": "order",
      "group_label": "Order Actions",
      "title": "Send mail to admin after New Order Paid",
      "description": "This email will be sent to the admin after an order is placed.",
      "recipient": "admin",
      "smartcode_groups": [],
      "template_path": "order.paid.admin",
      "is_async": false,
      "pre_header": "You got a new order on your shop...",
      "name": "order_paid_admin",
      "settings": {
        "active": "yes",
        "subject": "New Sales On {{settings.store_name}}",
        "is_default_body": "yes",
        "email_body": ""
      }
    },
    "order_paid_customer": {
      "event": "order_paid",
      "group": "order",
      "group_label": "Order Actions",
      "title": "Purchase receipt to customer",
      "description": "This email will be sent to the customer after an order is placed.",
      "recipient": "customer",
      "smartcode_groups": [],
      "template_path": "order.paid.customer",
      "is_async": false,
      "name": "order_paid_customer",
      "settings": {
        "active": "yes",
        "subject": "Purchase Receipt #{{order.invoice_no}}",
        "is_default_body": "yes",
        "email_body": ""
      }
    }
  }
}
```

### Available Notifications

The following notification keys are returned, organized by group:

**Order Actions (`order` group)**

| Key | Event | Recipient | Description |
|-----|-------|-----------|-------------|
| `order_paid_admin` | `order_paid_done` | `admin` | New order paid notification to admin |
| `order_paid_customer` | `order_paid` | `customer` | Purchase receipt to customer |
| `order_refunded_admin` | `order_refunded` | `admin` | Refund notification to admin |
| `order_refunded_customer` | `order_refunded` | `customer` | Refund confirmation to customer |
| `order_shipped_customer` | `shipping_status_changed_to_shipped` | `customer` | Shipping notification to customer |
| `order_delivered_customer` | `shipping_status_changed_to_delivered` | `customer` | Delivery notification to customer |
| `order_placed_admin` | `order_placed_offline` | `admin` | Offline payment order to admin |
| `order_placed_customer` | `order_placed_offline` | `customer` | Offline payment confirmation to customer |

**Subscription Actions (`subscription` group)**

| Key | Event | Recipient | Description |
|-----|-------|-----------|-------------|
| `subscription_renewal_customer` | `subscription_renewed` | `customer` | Renewal confirmation to customer |
| `subscription_renewal_admin` | `subscription_renewed` | `admin` | Renewal notification to admin |
| `subscription_canceled_customer` | `subscription_canceled` | `customer` | Cancellation notice to customer |
| `subscription_canceled_admin` | `subscription_canceled` | `admin` | Cancellation notice to admin |

**Scheduler / Reminder Actions (`scheduler` group)**

| Key | Event | Recipient | Description |
|-----|-------|-----------|-------------|
| `invoice_reminder_overdue_customer` | `invoice_reminder_overdue` | `customer` | Payment reminder to customer |
| `invoice_reminder_overdue_admin` | `invoice_reminder_overdue` | `admin` | Payment reminder copy to admin |
| `subscription_renewal_reminder_customer` | `subscription_renewal_reminder` | `customer` | Upcoming renewal reminder to customer |
| `subscription_renewal_reminder_admin` | `subscription_renewal_reminder` | `admin` | Upcoming renewal reminder copy to admin |
| `subscription_trial_end_reminder_customer` | `subscription_trial_end_reminder` | `customer` | Trial ending soon reminder to customer |
| `subscription_trial_end_reminder_admin` | `subscription_trial_end_reminder` | `admin` | Trial ending soon reminder copy to admin |

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/email-notification" \
  -u "username:app_password"
```

---

## Get Single Notification

<badge type="tip">GET</badge> `/fluent-cart/v2/email-notification/{notification}`

Retrieve a single email notification template by its name, along with available shortcodes for the email editor.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `notification` | string | path | Yes | The notification key (e.g., `order_paid_customer`, `subscription_renewal_admin`) |

### Response

```json
{
  "data": {
    "event": "order_paid",
    "group": "order",
    "group_label": "Order Actions",
    "title": "Purchase receipt to customer",
    "description": "This email will be sent to the customer after an order is placed.",
    "recipient": "customer",
    "smartcode_groups": [],
    "template_path": "order.paid.customer",
    "is_async": false,
    "name": "order_paid_customer",
    "settings": {
      "active": "yes",
      "subject": "Purchase Receipt #{{order.invoice_no}}",
      "is_default_body": "yes",
      "email_body": ""
    }
  },
  "shortcodes": {
    "order": {
      "title": "Order",
      "key": "order",
      "shortcodes": {
        "{{order.id}}": "Order ID",
        "{{order.invoice_no}}": "Order Number",
        "{{order.status}}": "Order Status",
        "{{order.total_amount_formatted}}": "Order Total Amount (Formatted)"
      }
    },
    "general": {
      "title": "General",
      "key": "wp",
      "shortcodes": {
        "{{wp.admin_email}}": "Admin Email",
        "{{wp.site_url}}": "Site URL",
        "{{wp.site_title}}": "Site Title"
      }
    },
    "customer": {
      "title": "Customer",
      "key": "customer",
      "shortcodes": {
        "{{order.billing.first_name}}": "First Name",
        "{{order.billing.last_name}}": "Last Name",
        "{{order.billing.email}}": "Email"
      }
    },
    "transaction": {
      "title": "transaction",
      "key": "settings",
      "shortcodes": {
        "{{transaction.total_formatted}}": "Total Amount (Formatted)",
        "{{transaction.payment_method}}": "Payment Method",
        "{{transaction.status}}": "Status"
      }
    },
    "settings": {
      "title": "Settings",
      "key": "settings",
      "shortcodes": {
        "{{settings.store_name}}": "Store Name",
        "{{settings.store_logo}}": "Store Logo"
      }
    },
    "license": {
      "title": "License (Loop)",
      "key": "license",
      "shortcodes": {
        "{{license.key}}": "License Key",
        "{{license.status}}": "Status"
      }
    }
  }
}
```

### Error Response

Returned when the notification key is not found:

```json
{
  "message": "Notification Details not found"
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/email-notification/order_paid_customer" \
  -u "username:app_password"
```

---

## Update Notification

<badge type="info">PUT</badge> `/fluent-cart/v2/email-notification/{notification}`

Update an email notification template's settings including subject, body content, and active status.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `notification` | string | path | Yes | The notification key (e.g., `order_paid_customer`) |
| `settings.subject` | string | body | Yes | Email subject line (max 255 characters). Supports shortcodes like `{{order.invoice_no}}` |
| `settings.email_body` | string | body | No | Custom email body content (HTML). Sanitized with `wp_kses_post` |
| `settings.active` | string | body | No | Enable or disable the notification: `yes` or `no` |
| `settings.is_default_body` | string | body | No | Whether to use the default template body: `yes` or `no`. When set to `yes`, the custom `email_body` is cleared |

### Validation Rules

| Field | Rules |
|-------|-------|
| `settings.subject` | Required, sanitized text, max 255 characters |
| `settings.email_body` | Nullable, string, sanitized with `wp_kses_post` |
| `settings.active` | Nullable, sanitized text |
| `settings.is_default_body` | Nullable, sanitized text |

### Response

```json
{
  "message": "Notification updated successfully"
}
```

### Error Response

```json
{
  "message": "Failed to update notification"
}
```

### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/email-notification/order_paid_customer" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "subject": "Your Order #{{order.invoice_no}} is Confirmed!",
      "email_body": "<p>Thank you for your purchase, {{order.billing.first_name}}!</p>",
      "active": "yes",
      "is_default_body": "no"
    }
  }'
```

---

## Enable/Disable Notification

<badge type="warning">POST</badge> `/fluent-cart/v2/email-notification/enable-notification/{name}`

Toggle a notification template on or off without modifying other settings.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `name` | string | path | Yes | The notification key (e.g., `order_paid_admin`) |
| `active` | string | body | Yes | Set to `yes` to enable or `no` to disable the notification |

### Response

```json
{
  "message": "Notification updated successfully"
}
```

### Error Response

```json
{
  "message": "Failed to update notification"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/email-notification/enable-notification/order_refunded_admin" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "active": "yes"
  }'
```

---

## Get Shortcodes

<badge type="tip">GET</badge> `/fluent-cart/v2/email-notification/get-short-codes`

Retrieve available shortcodes, email template files, and editor buttons for the email notification editor.

### Parameters

No parameters required.

### Response

```json
{
  "data": {
    "email_templates": [
      {
        "path": "fluent_cart_order_paid",
        "label": "Order Paid"
      },
      {
        "path": "fluent_cart_subscription_renewal",
        "label": "Subscription Renewal"
      }
    ],
    "shortcodes": {
      "order": {
        "title": "Order",
        "key": "order",
        "shortcodes": {
          "{{order.id}}": "Order ID",
          "{{order.customer_dashboard_link}}": "Customer Dashboard Link",
          "{{order.status}}": "Order Status",
          "{{order.invoice_no}}": "Order Number",
          "{{order.total_amount_formatted}}": "Order Total Amount (Formatted)",
          "{{order.created_at}}": "Order Create Date"
        }
      },
      "general": {
        "title": "General",
        "key": "wp",
        "shortcodes": {
          "{{wp.admin_email}}": "Admin Email",
          "{{wp.site_url}}": "Site URL",
          "{{wp.site_title}}": "Site Title",
          "{{user.display_name}}": "User Display Name",
          "{{user.user_email}}": "User Email"
        }
      },
      "customer": {
        "title": "Customer",
        "key": "customer",
        "shortcodes": {
          "{{order.billing.first_name}}": "First Name",
          "{{order.billing.last_name}}": "Last Name",
          "{{order.billing.email}}": "Email",
          "{{order.billing.city}}": "City",
          "{{order.billing.state}}": "State",
          "{{order.billing.country}}": "Country"
        }
      },
      "transaction": {
        "title": "transaction",
        "key": "settings",
        "shortcodes": {
          "{{transaction.total}}": "Total Amount",
          "{{transaction.total_formatted}}": "Total Amount (Formatted)",
          "{{transaction.refund_amount}}": "Refund Amount",
          "{{transaction.refund_amount_formatted}}": "Refund Amount (Formatted)",
          "{{transaction.payment_method}}": "Payment Method",
          "{{transaction.card_last_4}}": "Card Last 4",
          "{{transaction.card_brand}}": "Card Brand",
          "{{transaction.status}}": "Status",
          "{{transaction.currency}}": "Currency"
        }
      },
      "settings": {
        "title": "Settings",
        "key": "settings",
        "shortcodes": {
          "{{settings.store_name}}": "Store Name",
          "{{settings.store_logo}}": "Store Logo",
          "{{settings.store_address}}": "Store Address Line 1",
          "{{settings.store_address2}}": "Store Address Line 2",
          "{{settings.store_country}}": "Store Country",
          "{{settings.store_state}}": "Store State",
          "{{settings.store_city}}": "Store City",
          "{{settings.store_postcode}}": "Store Postcode"
        }
      },
      "license": {
        "title": "License (Loop)",
        "key": "license",
        "shortcodes": {
          "{{license.sl}}": "Serial Number",
          "{{license.key}}": "License Key",
          "{{license.status}}": "Status",
          "{{license.product_name}}": "Product Name",
          "{{license.variant}}": "Variant",
          "{{license.limit}}": "Activation Limit",
          "{{license.activation_count}}": "Activation Count",
          "{{license.expiration_date}}": "Expiration Date"
        }
      }
    },
    "buttons": {
      "View Order": "<a href=\"https://example.com/wp-admin/admin.php?page=fluent-cart#/orders/{{order.id}}/view\" style=\"background-color: green; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">View Order</a>"
    }
  }
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/email-notification/get-short-codes" \
  -u "username:app_password"
```

---

## Get Global Email Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/email-notification/get-settings`

Retrieve the global email configuration settings used across all notification emails (sender name, email addresses, footer, etc.).

### Parameters

No parameters required.

### Response

```json
{
  "data": {
    "from_name": "My Store",
    "from_email": "store@example.com",
    "reply_to_name": "",
    "reply_to_email": "",
    "email_footer": "<p>Thank you for shopping with us!</p>",
    "show_email_footer": "yes",
    "admin_email": "{{wp.admin_email}}",
    "notification_config": {}
  },
  "shortcodes": [
    {
      "title": "General",
      "key": "wp",
      "shortcodes": {
        "{{wp.admin_email}}": "Admin Email",
        "{{wp.site_url}}": "Site URL",
        "{{wp.site_title}}": "Site Title",
        "{{user.display_name}}": "User Display Name",
        "{{user.user_email}}": "User Email"
      }
    },
    {
      "title": "Settings",
      "key": "settings",
      "shortcodes": {
        "{{settings.store_name}}": "Store Name",
        "{{settings.store_logo}}": "Store Logo",
        "{{settings.store_address}}": "Store Address Line 1"
      }
    }
  ]
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/email-notification/get-settings" \
  -u "username:app_password"
```

---

## Save Global Email Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/email-notification/save-settings`

Update the global email configuration settings for all notification emails.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `from_name` | string | body | Yes | Sender name displayed in emails (max 255 characters) |
| `from_email` | string | body | Yes | Sender email address (must be valid email, max 255 characters) |
| `reply_to_name` | string | body | No | Reply-to name (max 255 characters) |
| `reply_to_email` | string | body | No | Reply-to email address (must be valid email, max 255 characters) |
| `email_footer` | string | body | No | HTML content for the email footer. Sanitized with `wp_kses_post` |
| `admin_email` | string | body | Yes | Admin notification recipient email(s). Supports shortcodes like `{{wp.admin_email}}` |
| `show_email_footer` | string | body | No | Show or hide the email footer: `yes` or `no`. Note: On free plans, this is always forced to `yes` |

### Validation Rules

| Field | Rules |
|-------|-------|
| `from_name` | Required, sanitized text, max 255 characters |
| `from_email` | Required, valid email, max 255 characters |
| `reply_to_name` | Nullable, sanitized text, max 255 characters |
| `reply_to_email` | Nullable, valid email, max 255 characters |
| `email_footer` | Nullable, string, sanitized with `wp_kses_post` |
| `admin_email` | Required, string |
| `show_email_footer` | Nullable, string |

### Response

```json
{
  "message": "Email settings saved successfully"
}
```

### Error Response

```json
{
  "message": "Failed to save email settings"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/email-notification/save-settings" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "from_name": "My Store",
    "from_email": "noreply@example.com",
    "reply_to_name": "Support",
    "reply_to_email": "support@example.com",
    "email_footer": "<p>Thank you for shopping with us!</p>",
    "admin_email": "admin@example.com",
    "show_email_footer": "yes"
  }'
```

---

## Get Scheduling Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/email-notification/reminders`

Retrieve reminder/scheduling settings for automated email notifications such as payment reminders, renewal reminders, and trial-end reminders. Returns both the current settings and the form field definitions for the reminders tab.

### Parameters

No parameters required.

### Response

```json
{
  "settings": {
    "reminders_enabled": "yes",
    "invoice_reminders_enabled": "yes",
    "invoice_reminder_due_days": 3,
    "invoice_reminder_overdue_days": "1,3,7",
    "yearly_renewal_reminders_enabled": "yes",
    "yearly_renewal_reminder_days": 30,
    "trial_end_reminders_enabled": "yes",
    "trial_end_reminder_days": 3,
    "monthly_renewal_reminders_enabled": "no",
    "monthly_renewal_reminder_days": 7,
    "quarterly_renewal_reminders_enabled": "no",
    "quarterly_renewal_reminder_days": 14,
    "half_yearly_renewal_reminders_enabled": "no",
    "half_yearly_renewal_reminder_days": 14
  },
  "fields": {
    "reminders": { }
  }
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/email-notification/reminders" \
  -u "username:app_password"
```

---

## Save Scheduling Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/email-notification/reminders`

Update reminder/scheduling settings for automated email notifications. Each reminder type has an enable toggle and a days configuration that controls how many days before the event the reminder is sent.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `reminders_enabled` | string | body | No | Master toggle for all reminders: `yes` or `no` |
| `invoice_reminders_enabled` | string | body | No | Enable invoice payment reminders: `yes` or `no` |
| `invoice_reminder_due_days` | integer | body | No | Days before due date to send invoice reminder (0-365). Required when `invoice_reminders_enabled` is `yes` |
| `invoice_reminder_overdue_days` | string | body | No | Comma-separated day intervals for overdue reminders (e.g., `1,3,7`) |
| `yearly_renewal_reminders_enabled` | string | body | No | Enable yearly subscription renewal reminders: `yes` or `no` |
| `yearly_renewal_reminder_days` | integer | body | No | Days before renewal to send reminder (7-90). Required when `yearly_renewal_reminders_enabled` is `yes` |
| `trial_end_reminders_enabled` | string | body | No | Enable trial ending reminders: `yes` or `no` |
| `trial_end_reminder_days` | integer | body | No | Days before trial ends to send reminder (1-14). Required when `trial_end_reminders_enabled` is `yes` |
| `monthly_renewal_reminders_enabled` | string | body | No | Enable monthly renewal reminders: `yes` or `no` |
| `monthly_renewal_reminder_days` | integer | body | No | Days before renewal to send reminder (3-28). Required when `monthly_renewal_reminders_enabled` is `yes` |
| `quarterly_renewal_reminders_enabled` | string | body | No | Enable quarterly renewal reminders: `yes` or `no` |
| `quarterly_renewal_reminder_days` | integer | body | No | Days before renewal to send reminder (7-60). Required when `quarterly_renewal_reminders_enabled` is `yes` |
| `half_yearly_renewal_reminders_enabled` | string | body | No | Enable half-yearly renewal reminders: `yes` or `no` |
| `half_yearly_renewal_reminder_days` | integer | body | No | Days before renewal to send reminder (7-60). Required when `half_yearly_renewal_reminders_enabled` is `yes` |

### Validation Rules

Validation for the days fields is conditional -- rules are only enforced when the corresponding toggle is set to `yes`:

| Toggle Field | Days Field | Rules (when enabled) |
|--------------|------------|----------------------|
| `invoice_reminders_enabled` | `invoice_reminder_due_days` | Integer, min: 0, max: 365 |
| `yearly_renewal_reminders_enabled` | `yearly_renewal_reminder_days` | Integer, min: 7, max: 90 |
| `trial_end_reminders_enabled` | `trial_end_reminder_days` | Integer, min: 1, max: 14 |
| `monthly_renewal_reminders_enabled` | `monthly_renewal_reminder_days` | Integer, min: 3, max: 28 |
| `quarterly_renewal_reminders_enabled` | `quarterly_renewal_reminder_days` | Integer, min: 7, max: 60 |
| `half_yearly_renewal_reminders_enabled` | `half_yearly_renewal_reminder_days` | Integer, min: 7, max: 60 |

### Response

```json
{
  "data": { },
  "message": "Scheduling settings saved successfully"
}
```

### Error Response

```json
{
  "message": "Failed to save scheduling settings"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/email-notification/reminders" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "reminders_enabled": "yes",
    "invoice_reminders_enabled": "yes",
    "invoice_reminder_due_days": 3,
    "invoice_reminder_overdue_days": "1,3,7",
    "yearly_renewal_reminders_enabled": "yes",
    "yearly_renewal_reminder_days": 30,
    "trial_end_reminders_enabled": "yes",
    "trial_end_reminder_days": 3,
    "monthly_renewal_reminders_enabled": "no",
    "monthly_renewal_reminder_days": 7,
    "quarterly_renewal_reminders_enabled": "no",
    "quarterly_renewal_reminder_days": 14,
    "half_yearly_renewal_reminders_enabled": "no",
    "half_yearly_renewal_reminder_days": 14
  }'
```

---

## Preview Notification

<badge type="warning">POST</badge> `/fluent-cart/v2/email-notification/preview`

Generate an HTML preview of a custom email notification template. Uses the block editor email body from the notification's saved settings, parses it through the block parser, wraps it in the email template layout, and resolves shortcodes using real or fallback order data.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `notification_name` | string | body | Yes | The notification key to preview (e.g., `order_paid_customer`) |
| `order_id` | integer | body | No | Specific order ID to use for shortcode data. If not provided or not found, the most recent order is used |

### Response

```json
{
  "html": "<!DOCTYPE html><html>...rendered email HTML...</html>"
}
```

The `html` field contains the fully rendered email including:
- The parsed block editor content
- Email header and footer
- Resolved shortcodes (order data, customer info, store settings)

### Error Response

When no notification name is provided:

```json
{
  "message": "No notification name provided."
}
```

When the notification key is not found:

```json
{
  "message": "Notification not found."
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/email-notification/preview" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "notification_name": "order_paid_customer",
    "order_id": 42
  }'
```

---

## Preview Default Template

<badge type="warning">POST</badge> `/fluent-cart/v2/email-notification/preview-default-template`

Generate an HTML preview of a default (built-in) email template. Unlike the custom block editor preview, this renders the PHP-based default template using dummy preview data, wrapped in the standard email layout with header and footer.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `template` | string | body | Yes | The template path name to preview (e.g., `order.paid.customer`, `subscription.renewal.admin`). Corresponds to the `template_path` value from the notification configuration |

### Available Template Paths

| Template Path | Description |
|---------------|-------------|
| `order.paid.admin` | Admin notification for paid order |
| `order.paid.customer` | Customer receipt for paid order |
| `order.refunded.admin` | Admin notification for refund |
| `order.refunded.customer` | Customer refund confirmation |
| `order.shipped.customer` | Customer shipping notification |
| `order.delivered.customer` | Customer delivery notification |
| `order.placed.admin` | Admin notification for offline payment order |
| `order.placed.customer` | Customer confirmation for offline payment order |
| `order.reminder.overdue.customer` | Customer payment reminder |
| `order.reminder.overdue.admin` | Admin copy of payment reminder |
| `subscription.renewal.customer` | Customer renewal confirmation |
| `subscription.renewal.admin` | Admin renewal notification |
| `subscription.canceled.customer` | Customer cancellation notice |
| `subscription.canceled.admin` | Admin cancellation notice |
| `subscription.reminder.customer` | Customer renewal reminder |
| `subscription.reminder.admin` | Admin copy of renewal reminder |
| `subscription.trial_end.customer` | Customer trial ending reminder |
| `subscription.trial_end.admin` | Admin copy of trial ending reminder |

### Response

```json
{
  "data": {
    "content": "<!DOCTYPE html><html>...rendered email HTML...</html>"
  }
}
```

The `content` field contains the fully rendered email HTML with:
- The default PHP template rendered with dummy preview data
- Email header and footer
- Resolved shortcodes
- All links and buttons disabled (not clickable) via injected CSS

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/email-notification/preview-default-template" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "order.paid.customer"
  }'
```

---

## Notification Object Reference

Each notification object contains the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Unique notification key identifier |
| `event` | string | The event hook that triggers this notification |
| `group` | string | Grouping category: `order`, `subscription`, or `scheduler` |
| `group_label` | string | Human-readable group label |
| `title` | string | Descriptive title of the notification |
| `description` | string | Explanation of when this notification is sent |
| `recipient` | string | Target recipient: `admin` or `customer` |
| `smartcode_groups` | array | Additional shortcode groups (extensible via filters) |
| `template_path` | string | Dot-notation path to the default PHP email template |
| `is_async` | boolean | Whether the email is sent asynchronously |
| `pre_header` | string | Email pre-header text (admin notifications only) |
| `manage_toggle` | string | If set to `no`, the notification cannot be toggled off (e.g., offline payment confirmations) |
| `settings` | object | Notification settings (see below) |

### Notification Settings Object

| Property | Type | Description |
|----------|------|-------------|
| `active` | string | Whether the notification is enabled: `yes` or `no` |
| `subject` | string | Email subject line. Supports shortcodes |
| `is_default_body` | string | Whether to use the built-in PHP template: `yes` or `no` |
| `email_body` | string | Custom email body content (HTML). Empty when using default body |

</div>
