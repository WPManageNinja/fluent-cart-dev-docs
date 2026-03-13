---
title: Settings API
description: FluentCart REST API endpoints for managing store settings, payment methods, modules, storage, and checkout fields.
---

<div v-pre>

# Settings API

Configure your store settings, payment gateways, modules, file storage, checkout fields, and permissions.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/settings`

**Policy:** `StoreSettingsPolicy` (most endpoints require `is_super_admin`)

---

## Payment Methods

### Get Payment Method Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/payment-methods`

Retrieve the configuration and settings for a specific payment method gateway (e.g., Stripe, PayPal).

- **Permission:** `is_super_admin`

#### Parameters

| Parameter | Type     | Location | Required | Description                                                            |
|-----------|----------|----------|----------|------------------------------------------------------------------------|
| `method`  | string   | query    | Yes      | The payment method key to retrieve settings for (e.g., `stripe`, `paypal`, `cod`). |

#### Response

```json
{
    "settings": {
        "is_active": "yes",
        "payment_mode": "live",
        "checkout_label": "Pay with Stripe",
        "checkout_logo": "https://example.com/stripe-logo.png",
        "checkout_instructions": "",
        "thank_you_page_instructions": ""
    },
    "fields": { ... }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods?method=stripe" \
  -u "username:app_password"
```

---

### Save Payment Method Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/payment-methods`

Create or update the configuration for a specific payment method gateway.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter  | Type   | Location | Required | Description                                                          |
|------------|--------|----------|----------|----------------------------------------------------------------------|
| `method`   | string | body     | Yes      | The payment method key (e.g., `stripe`, `paypal`, `cod`).            |
| `settings` | object | body     | Yes      | Key-value object of gateway-specific settings to save. Fields vary by payment method. |

#### Response

```json
{
    "settings": {
        "is_active": "yes",
        "payment_mode": "live",
        ...
    },
    "message": "Settings saved successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "cod",
    "settings": {
      "is_active": "yes",
      "checkout_label": "Cash on Delivery"
    }
  }'
```

---

### List All Payment Methods

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/payment-methods/all`

Retrieve all registered payment method gateways categorized by availability status.

- **Permission:** `is_super_admin`

#### Parameters

None.

#### Response

```json
{
    "gateways": [
        {
            "method_key": "stripe",
            "title": "Stripe",
            "is_active": "yes",
            "description": "Accept payments via Stripe",
            "logo": "https://...",
            "upcoming": false
        },
        {
            "method_key": "paypal",
            "title": "PayPal",
            "is_active": "no",
            "requires_pro": true
        }
    ]
}
```

Gateways are sorted in order: available gateways first, then those requiring Pro, then upcoming.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods/all" \
  -u "username:app_password"
```

---

### Reorder Payment Methods

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/payment-methods/reorder`

Set the display order of payment methods on the checkout page.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter | Type  | Location | Required | Description                                                    |
|-----------|-------|----------|----------|----------------------------------------------------------------|
| `order`   | array | body     | Yes      | Ordered array of payment method keys (e.g., `["stripe", "paypal", "cod"]`). |

#### Response

```json
{
    "message": "Payment methods order saved successfully",
    "order": ["stripe", "paypal", "cod"]
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods/reorder" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "order": ["stripe", "paypal", "cod"]
  }'
```

---

### Get Payment Method Connection Info

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/payment-methods/connect/info`

Retrieve connection information (OAuth URLs, account status) for a connectable payment gateway.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter | Type   | Location | Required | Description                                               |
|-----------|--------|----------|----------|-----------------------------------------------------------|
| `method`  | string | query    | Yes      | The payment method key (e.g., `stripe`, `paypal`).        |

#### Response

The response structure varies by gateway. For Stripe, it may include OAuth redirect URLs and connected account information. For PayPal, it includes test/live redirect URLs and account details.

```json
{
    "connect_config": {
        "test_redirect": "https://example.com/wp-admin/?fluent-cart=...",
        "live_redirect": "https://example.com/wp-admin/?fluent-cart=...",
        "disconnect_note": "Disconnecting will prevent..."
    },
    "test_account": { ... },
    "live_account": { ... },
    "settings": { ... }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods/connect/info?method=paypal" \
  -u "username:app_password"
```

---

### Disconnect Payment Method

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/payment-methods/disconnect`

Disconnect a payment gateway account (e.g., revoke Stripe or PayPal connection).

- **Permission:** `is_super_admin`

#### Parameters

| Parameter | Type   | Location | Required | Description                                                |
|-----------|--------|----------|----------|------------------------------------------------------------|
| `method`  | string | body     | Yes      | The payment method key to disconnect (e.g., `stripe`, `paypal`). |
| `mode`    | string | body     | Yes      | The environment mode to disconnect: `test` or `live`.      |

#### Response

```json
{
    "message": "PayPal settings has been disconnected",
    "settings": { ... }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods/disconnect" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "paypal",
    "mode": "test"
  }'
```

---

### Save Payment Method Design

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/payment-methods/design`

Customize the checkout appearance for a specific payment method, including its label, logo, and instructions.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter                    | Type   | Location | Required | Description                                                        |
|------------------------------|--------|----------|----------|--------------------------------------------------------------------|
| `method`                     | string | body     | Yes      | The payment method key (e.g., `stripe`, `paypal`, `cod`).          |
| `checkout_label`             | string | body     | No       | Custom label displayed on the checkout form for this method.       |
| `checkout_logo`              | string | body     | No       | URL to a custom logo image for the checkout form.                  |
| `checkout_instructions`      | string | body     | No       | HTML instructions shown on the checkout page when this method is selected. |
| `thank_you_page_instructions`| string | body     | No       | HTML instructions shown on the thank-you/receipt page.             |

#### Response

```json
{
    "message": "Checkout design settings saved",
    "settings": { ... }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods/design" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "stripe",
    "checkout_label": "Credit / Debit Card",
    "checkout_logo": "https://example.com/card-icon.png",
    "checkout_instructions": "<p>You will be charged securely via Stripe.</p>"
  }'
```

---

### Install Payment Addon

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/payment-methods/install-addon`

Install a payment gateway addon plugin from a remote source (WordPress.org or GitHub).

- **Permission:** `is_super_admin`

#### Parameters

| Parameter     | Type   | Location | Required | Description                                                             |
|---------------|--------|----------|----------|-------------------------------------------------------------------------|
| `plugin_slug` | string | body     | Yes      | The slug of the plugin to install (e.g., `fluent-cart-pro`).            |
| `source_type` | string | body     | Yes      | Source type: `wordpress` (WordPress.org) or `github`.                   |
| `source_link` | string | body     | Conditional | The URL to the plugin source. Required when `source_type` is `github`. |

#### Response

```json
{
    "message": "Payment addon installed successfully!",
    "plugin_file": "fluent-cart-pro/fluent-cart-pro.php"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods/install-addon" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "plugin_slug": "fluent-cart-pro",
    "source_type": "wordpress"
  }'
```

---

### Activate Payment Addon

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/payment-methods/activate-addon`

Activate an already-installed payment gateway addon plugin.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter     | Type   | Location | Required | Description                                                                |
|---------------|--------|----------|----------|----------------------------------------------------------------------------|
| `plugin_file` | string | body     | Yes      | The plugin file path (e.g., `fluent-cart-pro/fluent-cart-pro.php`).         |

#### Response

```json
{
    "message": "Payment addon activated successfully!"
}
```

For FluentCart Pro specifically:

```json
{
    "message": "FluentCart Pro activated successfully! All premium features are now available."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods/activate-addon" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "plugin_file": "fluent-cart-pro/fluent-cart-pro.php"
  }'
```

---

## PayPal Configuration

These endpoints are used during the PayPal gateway onboarding and webhook setup process.

**Policy:** `AdminPolicy` (requires `super_admin`)

### Exchange PayPal Seller Auth Token

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/payment-methods/paypal/seller-auth-token`

Exchange the PayPal authorization code for a seller access token during the PayPal Connect onboarding flow. This retrieves merchant credentials and saves them to the gateway settings.

- **Permission:** `super_admin`

#### Parameters

| Parameter  | Type   | Location | Required | Description                                                    |
|------------|--------|----------|----------|----------------------------------------------------------------|
| `authCode` | string | body     | Yes      | The authorization code received from PayPal OAuth redirect.    |
| `sharedId` | string | body     | Yes      | The PayPal partner shared/client ID used during authentication.|
| `mode`     | string | body     | Yes      | Environment mode: `test` or `live`.                            |

#### Response

On success, credentials are saved to the PayPal gateway settings and webhooks are automatically registered. No explicit JSON response body is returned.

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods/paypal/seller-auth-token" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "authCode": "C21AAF...",
    "sharedId": "AaBbCc...",
    "mode": "live"
  }'
```

---

### Setup PayPal Webhook

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/payment-methods/paypal/webhook/setup`

Register a webhook endpoint with PayPal to receive payment event notifications.

- **Permission:** `super_admin`

#### Parameters

| Parameter | Type   | Location | Required | Description                             |
|-----------|--------|----------|----------|-----------------------------------------|
| `mode`    | string | body     | Yes      | Environment mode: `test` or `live`.     |

#### Response

```json
{
    "message": "Webhook setup successfully! Please reload the page."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods/paypal/webhook/setup" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "live"
  }'
```

---

### Check PayPal Webhook

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/payment-methods/paypal/webhook/check`

Verify the current PayPal webhook registration status and set up the webhook if it is missing.

- **Permission:** `super_admin`

#### Parameters

| Parameter | Type   | Location | Required | Description                             |
|-----------|--------|----------|----------|-----------------------------------------|
| `mode`    | string | query    | Yes      | Environment mode: `test` or `live`.     |

#### Response

Returns the webhook status and configuration details from PayPal.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/payment-methods/paypal/webhook/check?mode=live" \
  -u "username:app_password"
```

---

## Permissions

### Get Permissions

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/permissions`

Retrieve the current role-to-capability permission mappings for FluentCart.

- **Permission:** `is_super_admin`

#### Parameters

None.

#### Response

```json
{
    "roles": {
        "administrator": {
            "name": "Administrator",
            "capabilities": {
                "orders/view": true,
                "orders/manage": true,
                "customers/view": true,
                "products/manage": true,
                ...
            }
        },
        "shop_manager": {
            "name": "Shop Manager",
            "capabilities": { ... }
        }
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/permissions" \
  -u "username:app_password"
```

---

### Save Permissions

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/permissions`

Update the role-to-capability permission mappings for FluentCart.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter    | Type   | Location | Required | Description                                                    |
|--------------|--------|----------|----------|----------------------------------------------------------------|
| `capability` | object | body     | Yes      | An object mapping WordPress role slugs to their FluentCart capability assignments. |

#### Response

```json
{
    "message": "Permissions saved successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/permissions" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "capability": {
      "shop_manager": {
        "orders/view": true,
        "orders/manage": true,
        "customers/view": true,
        "products/manage": false
      }
    }
  }'
```

---

## Store Settings

### Get Store Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/store`

Retrieve all store configuration settings along with the field schema for a given settings tab.

- **Permission:** `store/settings`

#### Parameters

| Parameter       | Type   | Location | Required | Description                                                   |
|-----------------|--------|----------|----------|---------------------------------------------------------------|
| `settings_name` | string | query    | No       | The settings tab to return fields for (e.g., `store_setup`, `checkout`, `pages`). |

#### Response

```json
{
    "settings": {
        "store_name": "My Store",
        "currency": "USD",
        "currency_position": "before",
        "decimal_separator": "dot",
        "checkout_button_text": "Checkout",
        "view_cart_button_text": "View Cart",
        "cart_button_text": "Add To Cart",
        "popup_button_text": "View Product",
        "out_of_stock_button_text": "Not Available",
        "checkout_method_style": "logo",
        "enable_modal_checkout": "no",
        "require_logged_in": "no",
        "show_cart_icon_in_nav": "no",
        "show_cart_icon_in_body": "yes",
        "additional_address_field": "yes",
        "hide_coupon_field": "no",
        "user_account_creation_mode": "all",
        "checkout_page_id": "",
        "cart_page_id": "",
        "receipt_page_id": "",
        "shop_page_id": "",
        "customer_profile_page_id": "",
        "store_address1": "",
        "store_address2": "",
        "store_city": "",
        "store_country": "",
        "store_postcode": "",
        "store_state": "",
        "order_mode": "test",
        "variation_view": "both",
        "variation_columns": "masonry",
        "min_receipt_number": "1",
        "inv_prefix": "INV-",
        "show_email_footer": "yes",
        ...
    },
    "fields": {
        "store_setup": { ... }
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/store?settings_name=store_setup" \
  -u "username:app_password"
```

---

### Save Store Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/store`

Update store configuration settings. Submitted values are merged with existing settings.

- **Permission:** `store/settings`
- **Request Class:** `FluentMetaRequest` (validates and sanitizes input)

#### Parameters

| Parameter                              | Type    | Location | Required | Description                                                    |
|----------------------------------------|---------|----------|----------|----------------------------------------------------------------|
| `settings_name`                        | string  | body     | Conditional | Settings tab identifier. Required for `store_setup` tab validation (enforces `store_name` and `store_country`). |
| `store_name`                           | string  | body     | Conditional | Store name. Required when `settings_name` is `store_setup`. Max 200 characters. |
| `store_logo`                           | object  | body     | No       | Store logo with `id` (integer), `url` (string), and `title` (string). |
| `currency`                             | string  | body     | No       | Store currency code (e.g., `USD`, `EUR`, `GBP`).               |
| `currency_position`                    | string  | body     | No       | Currency symbol position: `before` or `after`.                 |
| `decimal_separator`                    | string  | body     | No       | Decimal separator style: `dot` or `comma`.                     |
| `checkout_button_text`                 | string  | body     | No       | Custom text for the checkout button.                           |
| `view_cart_button_text`                | string  | body     | No       | Custom text for the view cart button.                          |
| `cart_button_text`                     | string  | body     | No       | Custom text for the add-to-cart button.                        |
| `popup_button_text`                    | string  | body     | No       | Custom text for the product popup button.                      |
| `out_of_stock_button_text`             | string  | body     | No       | Custom text for the out-of-stock button.                       |
| `checkout_method_style`                | string  | body     | No       | Payment method display on checkout: `logo` or other styles.    |
| `enable_modal_checkout`                | string  | body     | No       | Enable modal/popup checkout: `yes` or `no`.                    |
| `show_cart_icon_in_nav`                | string  | body     | No       | Show cart icon in navigation: `yes` or `no`.                   |
| `show_cart_icon_in_body`               | string  | body     | No       | Show floating cart icon: `yes` or `no`.                        |
| `additional_address_field`             | string  | body     | No       | Show additional address field: `yes` or `no`.                  |
| `hide_coupon_field`                    | string  | body     | No       | Hide coupon input on checkout: `yes` or `no`.                  |
| `user_account_creation_mode`           | string  | body     | No       | Account creation mode: `all`, `optional`, or `disabled`.       |
| `force_ssl`                            | string  | body     | No       | Force SSL on checkout: `yes` or `no`.                          |
| `checkout_page_id`                     | integer | body     | No       | WordPress page ID for the checkout page.                       |
| `cart_page_id`                         | integer | body     | No       | WordPress page ID for the cart page.                           |
| `receipt_page_id`                      | integer | body     | No       | WordPress page ID for the order receipt page.                  |
| `shop_page_id`                         | integer | body     | No       | WordPress page ID for the shop page.                           |
| `customer_profile_page_id`             | integer | body     | No       | WordPress page ID for the customer profile page.               |
| `customer_profile_page_slug`           | string  | body     | No       | Custom slug for the customer profile page.                     |
| `registration_page_id`                 | integer | body     | No       | WordPress page ID for the registration page.                   |
| `login_page_id`                        | integer | body     | No       | WordPress page ID for the login page.                          |
| `store_address1`                       | string  | body     | No       | Store address line 1.                                          |
| `store_address2`                       | string  | body     | No       | Store address line 2.                                          |
| `store_city`                           | string  | body     | No       | Store city.                                                    |
| `store_country`                        | string  | body     | Conditional | Store country code. Required when `settings_name` is `store_setup`. Max 200 characters. |
| `store_postcode`                       | string  | body     | No       | Store postal/zip code.                                         |
| `store_state`                          | string  | body     | No       | Store state/province code.                                     |
| `order_mode`                           | string  | body     | No       | Order/payment mode: `test` or `live`.                          |
| `variation_view`                       | string  | body     | No       | Product variation display: `both`, `grid`, or `list`.          |
| `variation_columns`                    | string  | body     | No       | Variation layout style: `masonry` or other layouts.            |
| `enable_early_payment_for_installment` | string  | body     | No       | Allow early installment payments: `yes` or `no`.               |
| `product_slug`                         | string  | body     | No       | Custom product URL slug.                                       |
| `min_receipt_number`                   | string  | body     | No       | Minimum receipt/invoice number.                                |
| `inv_prefix`                           | string  | body     | No       | Invoice number prefix (e.g., `INV-`).                          |
| `frontend_theme`                       | object  | body     | No       | Theme color overrides. Object of key-value pairs where values are hex colors. |

#### Response

```json
{
    "data": {
        "store_name": "My Store",
        "currency": "USD",
        ...
    }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/store" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "settings_name": "store_setup",
    "store_name": "My Awesome Store",
    "store_country": "US",
    "currency": "USD",
    "order_mode": "live"
  }'
```

---

## Modules

### Get Plugin Addons

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/modules/plugin-addons`

List all registered plugin addons (e.g., Elementor Blocks) with their installation and activation status.

- **Permission:** `is_super_admin`

#### Parameters

None.

#### Response

```json
{
    "addons": {
        "elementor-block": {
            "title": "Elementor Blocks",
            "description": "Enable to get Elementor Blocks for FluentCart. Minimum Requirement: Elementor V3.34",
            "logo": "https://...",
            "dark_logo": "https://...",
            "plugin_slug": "fluent-cart-elementor-blocks",
            "plugin_file": "fluent-cart-elementor-blocks/fluent-cart-elementor-blocks.php",
            "source_type": "cdn",
            "source_link": "https://addons-cdn.fluentcart.com/fluent-cart-elementor-blocks.zip",
            "upcoming": false,
            "repo_link": "https://fluentcart.com/fluentcart-addons",
            "is_installed": false,
            "is_active": false
        }
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/modules/plugin-addons" \
  -u "username:app_password"
```

---

### Install Plugin Addon

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/modules/plugin-addons/install`

Install a registered plugin addon from its configured source (WordPress.org, GitHub, or CDN).

- **Permission:** `is_super_admin`

#### Parameters

| Parameter     | Type   | Location | Required | Description                                                                 |
|---------------|--------|----------|----------|-----------------------------------------------------------------------------|
| `plugin_slug` | string | body     | Yes      | The slug of the addon to install. Must match a registered addon slug.       |
| `source_type` | string | body     | No       | Source type: `wordpress`, `github`, or `cdn`. Defaults to the addon's registered source. |
| `source_link` | string | body     | No       | URL to the addon source. Defaults to the addon's registered source link.    |
| `asset_path`  | string | body     | No       | GitHub release asset path (defaults to `zipball_url`).                      |

#### Response

```json
{
    "message": "Addon installed successfully",
    "plugin_file": "fluent-cart-elementor-blocks/fluent-cart-elementor-blocks.php"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/modules/plugin-addons/install" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "plugin_slug": "fluent-cart-elementor-blocks"
  }'
```

---

### Activate Plugin Addon

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/modules/plugin-addons/activate`

Activate an already-installed plugin addon.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter     | Type   | Location | Required | Description                                                                        |
|---------------|--------|----------|----------|------------------------------------------------------------------------------------|
| `plugin_file` | string | body     | Yes      | The plugin file path to activate (e.g., `fluent-cart-elementor-blocks/fluent-cart-elementor-blocks.php`). |

#### Response

```json
{
    "message": "Addon activated successfully."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/modules/plugin-addons/activate" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "plugin_file": "fluent-cart-elementor-blocks/fluent-cart-elementor-blocks.php"
  }'
```

---

### Get Module Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/modules`

Retrieve all module (feature toggle) settings and their field definitions.

- **Permission:** `is_super_admin`

#### Parameters

None.

#### Response

```json
{
    "fields": {
        "modules_settings": {
            "title": "Features & addon",
            "type": "section",
            "class": "no-padding",
            "disable_nesting": true,
            "columns": {
                "default": 1,
                "md": 1
            },
            "schema": {
                "shipping": {
                    "title": "Shipping",
                    "type": "toggle",
                    ...
                },
                "tax": {
                    "title": "Tax",
                    "type": "toggle",
                    ...
                },
                "coupons": { ... },
                "subscriptions": { ... }
            }
        }
    },
    "settings": {
        "shipping": {
            "active": "yes"
        },
        "tax": {
            "active": "no"
        },
        ...
    }
}
```

Module keys are dynamically registered via the `fluent_cart/module_setting/fields` filter.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/modules" \
  -u "username:app_password"
```

---

### Save Module Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/modules`

Enable or disable modules (features) and update their configuration. Fires `fluent_cart/module/activated/{key}` or `fluent_cart/module/deactivated/{key}` hooks when a module's active status changes.

- **Permission:** `is_super_admin`

#### Parameters

The request body should include module key-value pairs matching the registered module keys. Each module object typically contains:

| Parameter            | Type   | Location | Required | Description                                                |
|----------------------|--------|----------|----------|------------------------------------------------------------|
| `{module_key}`       | object | body     | Yes      | Module configuration object. Keys vary per module.         |
| `{module_key}.active`| string | body     | Yes      | Whether the module is enabled: `yes` or `no`.              |

Only keys returned by `ModuleSettings::validKeys()` (derived from registered module fields) are accepted. Unrecognized keys are ignored.

#### Response

```json
{
    "message": "Settings saved successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/modules" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping": {
      "active": "yes"
    },
    "tax": {
      "active": "no"
    },
    "coupons": {
      "active": "yes"
    }
  }'
```

---

## Confirmation Pages

### Save Confirmation Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/confirmation`

Update the order confirmation/receipt page settings, including the confirmation type, message content, and the receipt page assignment.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter              | Type    | Location | Required | Description                                                                |
|------------------------|---------|----------|----------|----------------------------------------------------------------------------|
| `settings`             | object  | body     | Yes      | Confirmation settings object.                                              |
| `settings.confirmation_type` | string | body | No | Confirmation behavior: `same_page` (show confirmation on same page) or `custom_page` (redirect to a custom page). |
| `settings.message_to_show`   | string | body | No | HTML content to display as the order confirmation message. Sanitized with `wp_kses_post`. |
| `settings.confirmation_page_id` | integer | body | No | WordPress page ID for a custom confirmation/receipt page. Also updates the store's `receipt_page_id`. |

#### Response

```json
{
    "confirmation_type": "same_page",
    "message_to_show": "<p>Thank you for your order!</p>"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/confirmation" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "confirmation_type": "custom_page",
      "confirmation_page_id": 42,
      "message_to_show": "<h2>Order Confirmed!</h2><p>Thank you for your purchase.</p>"
    }
  }'
```

---

### Get Email Shortcodes

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/confirmation/shortcode`

Retrieve available shortcodes/merge tags that can be used in email notification templates and confirmation messages.

- **Permission:** `is_super_admin`

#### Parameters

None.

#### Response

```json
{
    "data": {
        "order": {
            "title": "Order",
            "shortcodes": {
                "{{order.id}}": "Order ID",
                "{{order.total}}": "Order Total",
                "{{order.status}}": "Order Status",
                ...
            }
        },
        "customer": {
            "title": "Customer",
            "shortcodes": {
                "{{customer.first_name}}": "First Name",
                "{{customer.email}}": "Email",
                ...
            }
        },
        "store": {
            "title": "Store",
            "shortcodes": {
                "{{store.name}}": "Store Name",
                ...
            }
        }
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/confirmation/shortcode" \
  -u "username:app_password"
```

---

## Storage Drivers

Manage file storage drivers for digital product delivery (e.g., local filesystem, Amazon S3, Bunny CDN).

### List All Storage Drivers

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/storage-drivers`

Retrieve all registered file storage drivers and their current status.

- **Permission:** `is_super_admin`

#### Parameters

None.

#### Response

```json
{
    "drivers": [
        {
            "key": "local",
            "title": "Local Storage",
            "description": "Store files on your server",
            "is_active": true,
            "logo": "https://..."
        },
        {
            "key": "s3",
            "title": "Amazon S3",
            "description": "Store files on Amazon S3",
            "is_active": false,
            "logo": "https://..."
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/storage-drivers" \
  -u "username:app_password"
```

---

### Save Storage Driver Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/storage-drivers`

Create or update settings for a specific file storage driver.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter  | Type   | Location | Required | Description                                                         |
|------------|--------|----------|----------|---------------------------------------------------------------------|
| `driver`   | string | body     | Yes      | The storage driver key (e.g., `local`, `s3`, `bunny`).              |
| `settings` | object | body     | Yes      | Driver-specific configuration settings. Fields vary by driver.      |

#### Response

```json
{
    "message": "Settings saved successfully",
    "data": { ... }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/storage-drivers" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "driver": "s3",
    "settings": {
      "access_key": "AKIA...",
      "secret_key": "wJalr...",
      "bucket": "my-store-files",
      "region": "us-east-1"
    }
  }'
```

---

### Get Active Storage Drivers

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/storage-drivers/active-drivers`

Retrieve only the currently active/enabled file storage drivers.

- **Permission:** `is_super_admin`

#### Parameters

None.

#### Response

```json
{
    "drivers": [
        {
            "key": "local",
            "title": "Local Storage",
            "is_active": true,
            ...
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/storage-drivers/active-drivers" \
  -u "username:app_password"
```

---

### Get Storage Driver Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/storage-drivers/{driver}`

Retrieve the configuration settings and field schema for a specific storage driver.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter | Type   | Location | Required | Description                                                         |
|-----------|--------|----------|----------|---------------------------------------------------------------------|
| `driver`  | string | path     | Yes      | The storage driver key (e.g., `local`, `s3`, `bunny`).              |

#### Response

```json
{
    "settings": {
        "access_key": "AKIA...",
        "secret_key": "****",
        "bucket": "my-store-files",
        "region": "us-east-1"
    },
    "fields": { ... }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/settings/storage-drivers/s3" \
  -u "username:app_password"
```

---

### Verify Storage Driver Connection

<badge type="warning">POST</badge> `/fluent-cart/v2/settings/storage-drivers/verify-info`

Test the connection to a storage driver using the provided credentials without saving them.

- **Permission:** `is_super_admin`

#### Parameters

| Parameter  | Type   | Location | Required | Description                                                                 |
|------------|--------|----------|----------|-----------------------------------------------------------------------------|
| `driver`   | string | body     | Yes      | The storage driver key (e.g., `s3`, `bunny`).                               |
| `settings` | object | body     | Yes      | Driver-specific credentials and configuration to verify. Fields vary by driver. |

#### Response

```json
{
    "message": "Connection verified successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/settings/storage-drivers/verify-info" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "driver": "s3",
    "settings": {
      "access_key": "AKIA...",
      "secret_key": "wJalr...",
      "bucket": "my-store-files",
      "region": "us-east-1"
    }
  }'
```

---

## Checkout Fields

Manage which fields are displayed on the checkout form and their required/optional status.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/checkout-fields`

**Policy:** `StoreSensitivePolicy` (requires `store/sensitive` capability)

### Get Checkout Fields

<badge type="tip">GET</badge> `/fluent-cart/v2/checkout-fields/get-fields`

Retrieve the checkout field configuration including the schema definition and current settings.

- **Permission:** `store/sensitive`

#### Parameters

None.

#### Response

```json
{
    "fields": {
        "basic_info": {
            "full_name": {
                "label": "Full Name",
                "type": "text",
                "configurable": true
            },
            "first_name": {
                "label": "First Name",
                "type": "text",
                "configurable": true
            },
            "last_name": {
                "label": "Last Name",
                "type": "text",
                "configurable": true
            },
            "email": {
                "label": "Email",
                "type": "email",
                "configurable": false
            }
        },
        "billing_address": { ... },
        "shipping_address": { ... }
    },
    "settings": {
        "basic_info": {
            "full_name": {
                "enabled": "yes",
                "required": "yes"
            },
            "first_name": {
                "enabled": "no",
                "required": "no"
            },
            "last_name": {
                "enabled": "no",
                "required": "no"
            }
        },
        "billing_address": { ... },
        "shipping_address": { ... }
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/checkout-fields/get-fields" \
  -u "username:app_password"
```

---

### Save Checkout Fields

<badge type="warning">POST</badge> `/fluent-cart/v2/checkout-fields/save-fields`

Update the checkout field visibility and required settings. The endpoint enforces name field logic automatically:

- If `first_name` or `last_name` is enabled, `full_name` is automatically disabled.
- If neither `first_name` nor `last_name` is enabled, `full_name` is automatically enabled and marked as required.
- If `first_name` is enabled, it is forced to be required. Same for `last_name`.

- **Permission:** `store/sensitive`

#### Parameters

| Parameter  | Type   | Location | Required | Description                                                              |
|------------|--------|----------|----------|--------------------------------------------------------------------------|
| `settings` | object | body     | Yes      | Checkout field settings object. Only keys matching existing settings are accepted. |
| `settings.basic_info` | object | body | No | Basic information field settings. |
| `settings.basic_info.{field}.enabled`  | string | body | No | Whether the field is shown: `yes` or `no`.   |
| `settings.basic_info.{field}.required` | string | body | No | Whether the field is required: `yes` or `no`. |
| `settings.billing_address`  | object | body | No | Billing address field settings (same structure as `basic_info`).   |
| `settings.shipping_address` | object | body | No | Shipping address field settings (same structure as `basic_info`).  |

#### Response

```json
{
    "message": "Checkout fields has been updated successfully."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/checkout-fields/save-fields" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "basic_info": {
        "full_name": {
          "enabled": "no",
          "required": "no"
        },
        "first_name": {
          "enabled": "yes",
          "required": "yes"
        },
        "last_name": {
          "enabled": "yes",
          "required": "no"
        }
      }
    }
  }'
```

</div>
