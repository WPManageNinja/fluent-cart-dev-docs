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
        "email_body": "",
        "attach_pdf_template": ""
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
        "email_body": "",
        "attach_pdf_template": ""
      }
    }
  }
}
```

### Available Notifications

Thirty-five notification keys are registered. `group` is the machine key and `group_label` the
label the admin screen shows.

::: tip Review notifications
The three `review_*` keys are only offered while the **Reviews** module is active. With the module
off, the list returns 32 keys and the stored settings of the review notifications are kept by name.
:::

**Order Actions** — `group: order`

| Key | Event | Recipient |
|-----|-------|-----------|
| `order_paid_admin` | `order_paid_done` | `admin` |
| `order_paid_customer` | `order_paid` | `customer` |
| `order_refunded_admin` | `order_refunded` | `admin` |
| `order_refunded_customer` | `order_refunded` | `customer` |
| `order_shipped_customer` | `shipping_status_changed_to_shipped` | `customer` |
| `order_delivered_customer` | `shipping_status_changed_to_delivered` | `customer` |
| `order_placed_admin` | `order_placed_offline` | `admin` |
| `order_placed_customer` | `order_placed_offline` | `customer` |

**Subscription Actions** — `group: subscription`

| Key | Event | Recipient |
|-----|-------|-----------|
| `subscription_renewal_customer` | `subscription_renewed` | `customer` |
| `subscription_renewal_admin` | `subscription_renewed` | `admin` |
| `subscription_renewal_failed_customer` | `subscription_renewal_failed` | `customer` |
| `subscription_renewal_failed_admin` | `subscription_renewal_failed` | `admin` |
| `subscription_canceled_customer` | `subscription_canceled` | `customer` |
| `subscription_canceled_admin` | `subscription_canceled` | `admin` |
| `subscription_period_skipped_customer` | `subscription_period_skipped` | `customer` |
| `subscription_past_due_customer` | `subscription_past_due` | `customer` |
| `subscription_past_due_admin` | `subscription_past_due` | `admin` |

**Store-Managed Renewals** — `group: manual_subscription`

| Key | Event | Recipient |
|-----|-------|-----------|
| `renewal_created_admin` | `renewal_created` | `admin` |
| `renewal_created_customer` | `renewal_created` | `customer` |
| `renewal_reminder_due_admin` | `renewal_reminder_due` | `admin` |
| `renewal_reminder_due_customer` | `renewal_reminder_due` | `customer` |

**Store-Managed Renewals · Auto-Charge** — `group: system_subscription`

| Key | Event | Recipient |
|-----|-------|-----------|
| `system_upcoming_charge_customer` | `system_upcoming_charge` | `customer` |
| `system_charge_failed_customer` | `system_charge_failed` | `customer` |
| `system_charge_failed_admin` | `system_charge_failed` | `admin` |

**Scheduler / Reminder Actions** — `group: scheduler`

| Key | Event | Recipient |
|-----|-------|-----------|
| `renewal_reminder_overdue_customer` | `renewal_reminder_overdue` | `customer` |
| `renewal_overdue_first_customer` | `renewal_overdue_first` | `customer` |
| `renewal_overdue_followup_customer` | `renewal_overdue_followup` | `customer` |
| `renewal_overdue_final_customer` | `renewal_overdue_final` | `customer` |
| `subscription_renewal_reminder_customer` | `subscription_renewal_reminder` | `customer` |
| `subscription_renewal_reminder_admin` | `subscription_renewal_reminder` | `admin` |
| `subscription_trial_end_reminder_customer` | `subscription_trial_end_reminder` | `customer` |
| `subscription_trial_end_reminder_admin` | `subscription_trial_end_reminder` | `admin` |

**Review Actions** — `group: review`

| Key | Event | Recipient |
|-----|-------|-----------|
| `review_submitted_admin` | `review_created` | `admin` |
| `review_approved_customer` | `review_approved_done` | `customer` |
| `review_replied_customer` | `review_replied_done` | `customer` |

::: tip pre_header
`pre_header` carries the preview text shown next to the subject in an inbox. It is set on the
`admin`-recipient notifications and on the three review notifications; on the rest it is absent.
:::

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/email-notification" \
  -u "username:app_password"
```

---

## Get Single Notification

<badge type="tip">GET</badge> `/fluent-cart/v2/email-notification/{notification}`

Retrieve a single email notification template by its name, along with available shortcodes for the
email editor and the PDF-attachment context the editor needs.

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
      "email_body": "",
      "attach_pdf_template": ""
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
  },
  "has_fluent_pdf": false,
  "fonts_ready": false,
  "setup_url": "",
  "pdf_templates": []
}
```

### PDF attachment context

Four keys sit beside `data` and `shortcodes`. They describe the state of the
[Fluent PDF](https://fluentpdf.com/) plugin so the editor can offer, or withhold, a PDF attachment.

| Field | Type | Description |
|-------|------|-------------|
| `has_fluent_pdf` | boolean | `true` when Fluent PDF is active (its `FLUENT_PDF` constant is defined) |
| `fonts_ready` | boolean | `true` when Fluent PDF has every downloadable font in place. Always `false` while `has_fluent_pdf` is `false` |
| `setup_url` | string | Admin URL of the Fluent PDF setup screen, or an empty string while Fluent PDF is inactive |
| `pdf_templates` | array | Receipt templates selectable in `settings.attach_pdf_template`. Empty while Fluent PDF is inactive |

The notification payload passes through the `fluent_cart/email_notification_data` filter before it is
returned, so an add-on can add its own editor fields to `data`.

### Error Response

An unknown notification key answers **422**, not 404:

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
| `settings.subject` | string | body | Yes | Email subject line (max 255 characters). Supports shortcodes like <code v-pre>{{order.invoice_no}}</code> |
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
| `admin_email` | string | body | Yes | Admin notification recipient email(s). Supports shortcodes like <code v-pre>{{wp.admin_email}}</code> |
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

Retrieve the store's reminder settings together with the field definitions that render the
**Reminder Emails** settings tab.

The payload comes back unwrapped: `settings` and `fields` are at the top level, with no `data`
envelope. `settings` is the **complete** store settings object -- the reminder keys documented below
are the subset this endpoint reads and writes, and every other store setting is returned alongside
them. `fields.reminders` holds the settings-schema section for the tab.

### Parameters

No parameters required.

### Response

```json
{
  "settings": {
    "reminders_enabled": "no",
    "yearly_renewal_reminders_enabled": "yes",
    "yearly_renewal_reminder_days": "30",
    "trial_end_reminders_enabled": "yes",
    "trial_end_reminder_days": "3",
    "monthly_renewal_reminders_enabled": "no",
    "monthly_renewal_reminder_days": "7",
    "quarterly_renewal_reminders_enabled": "no",
    "quarterly_renewal_reminder_days": "14",
    "half_yearly_renewal_reminders_enabled": "no",
    "half_yearly_renewal_reminder_days": "21",
    "renewal_reminders_enabled": "no",
    "renewal_reminder_overdue_days": "1,3,7"
  },
  "fields": {
    "reminders": {
      "title": "Reminder Emails",
      "show_title": false,
      "type": "section",
      "columns": { "default": 1, "md": 1 },
      "disable_nesting": true,
      "schema": { }
    }
  }
}
```

The values above are the defaults. They are stored as strings, so a days field reads back as `"30"`
rather than `30`.

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/email-notification/reminders" \
  -u "username:app_password"
```

---

## Save Scheduling Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/email-notification/reminders`

Update the store's reminder settings. Each scheduled cycle has an enable toggle and a days value
that sets how many days before the event its reminder goes out. Overdue renewal reminders take a
comma-separated list of day offsets instead.

Submitted keys are merged into the existing store settings, so a key left out of the body keeps its
current value. The response returns the merged settings in full.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `reminders_enabled` | string | body | No | Master toggle for all reminders: `yes` or `no`. Default `no` |
| `yearly_renewal_reminders_enabled` | string | body | No | Enable yearly subscription renewal reminders: `yes` or `no`. Default `yes` |
| `yearly_renewal_reminder_days` | integer | body | No | Days before renewal to send the reminder (7-90). Default `30` |
| `trial_end_reminders_enabled` | string | body | No | Enable trial ending reminders: `yes` or `no`. Default `yes` |
| `trial_end_reminder_days` | integer | body | No | Days before the trial ends to send the reminder (1-14). Default `3` |
| `monthly_renewal_reminders_enabled` | string | body | No | Enable monthly renewal reminders: `yes` or `no`. Default `no` |
| `monthly_renewal_reminder_days` | integer | body | No | Days before renewal to send the reminder (3-28). Default `7` |
| `quarterly_renewal_reminders_enabled` | string | body | No | Enable quarterly renewal reminders: `yes` or `no`. Default `no` |
| `quarterly_renewal_reminder_days` | integer | body | No | Days before renewal to send the reminder (7-60). Default `14` |
| `half_yearly_renewal_reminders_enabled` | string | body | No | Enable half-yearly renewal reminders: `yes` or `no`. Default `no` |
| `half_yearly_renewal_reminder_days` | integer | body | No | Days before renewal to send the reminder (7-60). Default `21` |
| `renewal_reminders_enabled` | string | body | No | Enable overdue payment reminders for store-managed renewal orders: `yes` or `no`. Default `no` |
| `renewal_reminder_overdue_days` | string | body | No | Comma-separated day offsets after the due date at which overdue reminders are sent, for example `1,3,7` |

### Validation Rules

Validation of the days fields is conditional -- a range is enforced only while its toggle is set to
`yes`:

| Toggle Field | Days Field | Rules (when enabled) |
|--------------|------------|----------------------|
| `yearly_renewal_reminders_enabled` | `yearly_renewal_reminder_days` | Integer, min: 7, max: 90 |
| `trial_end_reminders_enabled` | `trial_end_reminder_days` | Integer, min: 1, max: 14 |
| `monthly_renewal_reminders_enabled` | `monthly_renewal_reminder_days` | Integer, min: 3, max: 28 |
| `quarterly_renewal_reminders_enabled` | `quarterly_renewal_reminder_days` | Integer, min: 7, max: 60 |
| `half_yearly_renewal_reminders_enabled` | `half_yearly_renewal_reminder_days` | Integer, min: 7, max: 60 |

`renewal_reminder_overdue_days` is a free-text list and carries no range rule, so the overdue
offsets are not validated against each other.

### Response

```json
{
  "data": { },
  "message": "Scheduling settings saved successfully"
}
```

`data` is the merged store settings, in the same shape the GET returns.

### Error Response

A save that throws answers **423**:

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
    "yearly_renewal_reminders_enabled": "yes",
    "yearly_renewal_reminder_days": 30,
    "trial_end_reminders_enabled": "yes",
    "trial_end_reminder_days": 3,
    "renewal_reminders_enabled": "yes",
    "renewal_reminder_overdue_days": "1,3,7"
  }'
```

---

## Send Manual Reminder

<badge type="warning">POST</badge> `/fluent-cart/v2/email-notification/send-manual-reminder`

Send one reminder email now, outside its normal schedule.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `event` | string | body | Yes | Which reminder to send. See the table below |
| `entity_id` | integer | body | Yes | The record the reminder is about. Which record depends on `event` |

`event` accepts three values:

| `event` | `entity_id` is | Sent when |
|---------|----------------|-----------|
| `renewal_reminder_overdue` | an Order ID | The order's payment status is reminder-eligible and it still has an outstanding balance |
| `subscription_renewal_reminder` | a Subscription ID | The subscription is active, or on a simulated trial, and has a next billing date |
| `subscription_trial_end_reminder` | a Subscription ID | The subscription is in a real trial period and has a trial end date |

Reminders must be enabled store-wide (`reminders_enabled`). The two subscription events also require
their notification to be active; `renewal_reminder_overdue` is on-demand and has no per-notification
toggle, so only the store-wide switch is checked for it.

Sending a manual renewal or trial reminder marks that cycle's queued reminder stages as sent, so the
scheduled reminder for the same cycle does not follow it.

### Response

```json
{
  "message": "Renewal reminder sent successfully"
}
```

### Error Response

Every failure answers **422** with the reason in `message`:

| Message | Cause |
|---------|-------|
| `Event type and entity ID are required` | `event` or `entity_id` is missing or zero |
| `Reminders are disabled for this store.` | `reminders_enabled` is not `yes` |
| `This reminder notification is currently disabled.` | No active notification is registered for `event`. An unrecognised `event` lands here too |
| `Unknown reminder type` | `event` names a registered, active notification that is not one of the three reminders above |
| `Order or customer not found` / `Subscription or customer not found` | No such record, or it has no customer |
| `Order is not eligible for payment reminder` | The order's payment status is not reminder-eligible |
| `No outstanding amount on this order` | The order is already paid in full |
| `Subscription is not active` | The subscription is neither active nor on a simulated trial |
| `Subscription is not in a trial period` | A trial reminder was asked for a subscription that is not in a real trial |
| `No next billing date set` / `No trial end date set` | The date the reminder counts from is missing |
| `An unexpected error occurred while sending the reminder.` | The send threw; the detail is in the error log |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/email-notification/send-manual-reminder" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "subscription_renewal_reminder",
    "entity_id": 15
  }'
```

---

## Get Digest Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/email-notification/digest-settings`

Retrieve the store digest settings. The digest is a periodic activity summary emailed to the store's
recipients. It keeps its own settings store, separate from the notification config above.

### Parameters

No parameters required.

### Response

```json
{
  "data": {
    "enabled": "yes",
    "recipients": "{{wp.admin_email}}",
    "send_when_empty": "no",
    "daily": {
      "enabled": "no",
      "send_hour": 8
    },
    "weekly": {
      "enabled": "yes",
      "send_hour": 8,
      "send_dow": 1
    },
    "monthly": {
      "enabled": "no",
      "send_hour": 8
    }
  }
}
```

Those are the defaults: the weekly digest is on, at 08:00 on Monday, to the WordPress admin email.

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | string | Master flag, **derived on save**: `yes` when any cadence is enabled. It cannot be set directly |
| `recipients` | string | Comma-separated recipient list, shared by every cadence. Shortcodes are allowed |
| `send_when_empty` | string | `yes` sends the digest for periods with no activity; `no` skips them |
| `daily`, `weekly`, `monthly` | object | Per-cadence settings |
| `<cadence>.enabled` | string | `yes` or `no` |
| `<cadence>.send_hour` | integer | Site-local hour to send, clamped to 0-23 |
| `weekly.send_dow` | integer | Day of week, clamped to 1-7 (Monday to Sunday). Weekly only |

The monthly digest is always sent on the 1st, so it has no day field.

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/email-notification/digest-settings" \
  -u "username:app_password"
```

---

## Save Digest Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/email-notification/digest-settings`

Replace the store digest settings.

::: danger Send the whole object
This endpoint rebuilds the stored settings from the body rather than merging into them. Any field
left out falls back to its default, so posting only `{"daily": {"enabled": "yes"}}` also resets
`recipients` and turns the weekly digest off. Read the current settings, change what you need, and
post the whole object back.
:::

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `recipients` | string | body | No | Comma-separated recipient list. Defaults to `{{wp.admin_email}}` |
| `send_when_empty` | string | body | No | `yes` to send digests for empty periods. Anything other than `yes` stores `no` |
| `daily` | object | body | No | Keys `enabled` (`yes` or `no`) and `send_hour` (0-23) |
| `weekly` | object | body | No | Keys `enabled` (`yes` or `no`), `send_hour` (0-23) and `send_dow` (1-7) |
| `monthly` | object | body | No | Keys `enabled` (`yes` or `no`) and `send_hour` (0-23) |

Out-of-range hours and days are clamped rather than rejected, and `enabled` is derived from the
cadences, so this endpoint has no validation errors of its own.

### Response

```json
{
  "data": { },
  "message": "Store digest settings saved successfully"
}
```

`data` is the settings as stored, after sanitising and after `enabled` is derived.

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/email-notification/digest-settings" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": "owner@example.com,manager@example.com",
    "send_when_empty": "no",
    "daily": { "enabled": "no", "send_hour": 8 },
    "weekly": { "enabled": "yes", "send_hour": 9, "send_dow": 1 },
    "monthly": { "enabled": "no", "send_hour": 8 }
  }'
```

---

## Send Test Digest

<badge type="warning">POST</badge> `/fluent-cart/v2/email-notification/digest-settings/send-test`

Send a digest immediately to the configured recipients, to check the template and the mail setup.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `frequency` | string | body | No | Which digest to build: `daily`, `weekly` or `monthly`. Any other value, or none, falls back to `daily` |

The test goes to the saved `recipients`, or to the WordPress admin email when that is empty. The
cadence's own `enabled` flag is not consulted, so a disabled cadence can still be test-sent.

### Response

```json
{
  "message": "Test digest email sent."
}
```

### Error Response

```json
{
  "message": "Could not send the test email. Please check your mailing settings and recipients."
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/email-notification/digest-settings/send-test" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"frequency": "weekly"}'
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
| `group` | string | Grouping category: `order`, `subscription`, `manual_subscription`, `system_subscription`, `scheduler` or `review` |
| `group_label` | string | Human-readable group label |
| `title` | string | Descriptive title of the notification |
| `description` | string | Explanation of when this notification is sent |
| `recipient` | string | Target recipient: `admin` or `customer` |
| `smartcode_groups` | array | Additional shortcode groups (extensible via filters) |
| `template_path` | string | Dot-notation path to the default PHP email template |
| `is_async` | boolean | Whether the email is sent asynchronously |
| `pre_header` | string | Inbox preview text. Present on the `admin`-recipient notifications and the three review notifications |
| `manage_toggle` | string | `no` on a notification the store cannot toggle off: `order_placed_admin`, `order_placed_customer` and `renewal_reminder_overdue_customer`. Absent on the rest |
| `toggle_label` | string | Label shown in place of the toggle when `manage_toggle` is `no` |
| `settings` | object | Notification settings (see below) |

### Notification Settings Object

| Property | Type | Description |
|----------|------|-------------|
| `active` | string | Whether the notification is enabled: `yes` or `no` |
| `subject` | string | Email subject line. Supports shortcodes |
| `is_default_body` | string | Whether to use the built-in PHP template: `yes` or `no` |
| `email_body` | string | Custom email body content (HTML). Empty when using default body |
| `attach_pdf_template` | string | Slug of the receipt PDF template to attach, or an empty string for none. A legacy `attach_pdf: "yes"` is migrated to `order_receipt` on read |

</div>
