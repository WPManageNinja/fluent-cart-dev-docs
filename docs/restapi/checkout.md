---
title: Checkout API
description: FluentCart REST API endpoints for the checkout process, order placement, and user authentication.
---

# Checkout API

Handle the checkout process including placing orders, retrieving checkout summaries, shipping method availability, and user login.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

**Policy:** `PublicPolicy` (no authentication required for most endpoints)

> These are public-facing endpoints used by the storefront checkout flow. All monetary values are in **cents** (e.g., `$10.00` = `1000`).

---

## Checkout

### Place Order

<badge type="warning">POST</badge> `/fluent-cart/v2/checkout/place-order`

Submit a checkout order with billing/shipping details and payment method. This endpoint validates the cart, creates a customer (or matches an existing one), creates a draft order, and initiates the payment flow with the selected gateway.

- **Authentication:** Optional (logged-in users have their email and name auto-populated)
- **Rate Limit:** 5 requests per 60 seconds per IP/user

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `billing_email` | string | body | Yes | Customer email address. Auto-populated for logged-in users |
| `billing_full_name` | string | body | Conditional | Full name of the customer. Required when the store uses full name mode. Auto-populated for logged-in users if available |
| `billing_first_name` | string | body | Conditional | Customer first name. Required when the store uses separate first/last name mode |
| `billing_last_name` | string | body | Conditional | Customer last name. Required when the store uses separate name mode and last name is configured as required |
| `billing_country` | string | body | Conditional | ISO country code (e.g., `US`, `GB`). Required based on checkout field configuration. Defaults to store country if not provided |
| `billing_address_1` | string | body | Conditional | Street address line 1. Required based on checkout field configuration |
| `billing_address_2` | string | body | No | Street address line 2 (apt, suite, unit) |
| `billing_city` | string | body | Conditional | City name. Required based on checkout field configuration |
| `billing_state` | string | body | Conditional | State/province code. Required if the selected country has states |
| `billing_postcode` | string | body | Conditional | Postal/ZIP code. Required based on checkout field configuration |
| `billing_phone` | string | body | No | Phone number |
| `billing_tax_id` | string | body | No | Customer tax ID / VAT number |
| `billing_address_id` | integer | body | No | ID of a saved customer billing address (for returning customers) |
| `ship_to_different` | string | body | No | Set to `yes` to use a different shipping address. Default: `no` |
| `shipping_full_name` | string | body | Conditional | Shipping recipient name. Required when `ship_to_different` is `yes` |
| `shipping_country` | string | body | Conditional | Shipping country code. Required when `ship_to_different` is `yes` |
| `shipping_address_1` | string | body | Conditional | Shipping street address. Required when `ship_to_different` is `yes` |
| `shipping_address_2` | string | body | No | Shipping address line 2 |
| `shipping_city` | string | body | Conditional | Shipping city. Required when `ship_to_different` is `yes` |
| `shipping_state` | string | body | Conditional | Shipping state/province code |
| `shipping_postcode` | string | body | Conditional | Shipping postal code |
| `shipping_phone` | string | body | No | Shipping phone number |
| `shipping_address_id` | integer | body | No | ID of a saved customer shipping address |
| `fc_selected_shipping_method` | integer | body | Conditional | ID of the selected shipping method. Required for orders containing physical products |
| `payment_method` | string | body | Yes | Payment gateway slug (e.g., `stripe`, `paypal`, `cod`, `square`) |
| `order_notes` | string | body | No | Optional order notes from the customer. Max 200 characters |
| `agree_terms` | string | body | Conditional | Terms agreement flag. Required if terms acceptance is enabled in store settings |
| `allow_create_account` | string | body | No | Set to `yes` to create a WordPress user account (when store setting is `user_choice`) |
| `user_tz` | string | body | No | Customer timezone (e.g., `America/New_York`). Default: `UTC` |

#### Response (Success — 200)

The response varies by payment gateway. Common patterns include:

**Redirect-based gateways** (PayPal, hosted Stripe checkout):
```json
{
  "status": "success",
  "redirect_url": "https://checkout.stripe.com/pay/cs_...",
  "message": "Order placed successfully"
}
```

**On-site gateways** (Stripe Elements):
```json
{
  "status": "success",
  "payment_args": {
    "client_secret": "pi_..._secret_...",
    "checkout_mode": "onsite"
  },
  "order_id": 42,
  "message": "Order placed successfully"
}
```

**Free / COD orders:**
```json
{
  "status": "success",
  "redirect_url": "https://your-site.com/checkout/order-received/?order=abc123",
  "message": "Order placed successfully"
}
```

#### Error Responses

**Empty/completed cart (200):**
```json
{
  "status": "failed",
  "message": "Cart is empty or already completed"
}
```

**Validation errors (200):**
```json
{
  "status": "failed",
  "errors": {
    "billing_email": {
      "invalid": "Email must be a valid email address."
    },
    "billing_country": {
      "required": "Country is required."
    },
    "shipping_method": {
      "required": "You must select a shipping method."
    }
  }
}
```

**Product validation failure (422):**
```json
{
  "message": "Product is out of stock"
}
```

**Duplicate order (200):**
```json
{
  "status": "failed",
  "message": "You have already completed this order."
}
```

**Rate limit exceeded (429):**
```json
{
  "message": "Too many requests. Please try again later."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/checkout/place-order" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: your_nonce_here" \
  -d '{
    "billing_email": "john@example.com",
    "billing_full_name": "John Doe",
    "billing_country": "US",
    "billing_address_1": "123 Main St",
    "billing_city": "New York",
    "billing_state": "NY",
    "billing_postcode": "10001",
    "payment_method": "stripe",
    "user_tz": "America/New_York"
  }'
```

---

### Get Order Info

<badge type="tip">GET</badge> `/fluent-cart/v2/checkout/get-order-info`

Retrieve payment-gateway-specific order information needed by the frontend to initialize payment UI elements. This is typically called after the checkout page loads to set up payment forms (e.g., Stripe Elements configuration, PayPal button setup).

- **Authentication:** Optional

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `method` | string | query | Yes | Payment gateway slug (e.g., `stripe`, `paypal`, `square`, `airwallex`) |

#### Response (Success — 200)

The response structure is gateway-specific. Example for Stripe:

**Stripe (hosted mode):**
```json
{
  "status": "success",
  "message": "Order info retrieved!",
  "data": [],
  "payment_args": {
    "checkout_mode": "hosted"
  }
}
```

**Stripe (on-site mode):**
```json
{
  "status": "success",
  "message": "Order info retrieved!",
  "data": {
    "client_secret": "seti_..._secret_...",
    "publishable_key": "pk_live_..."
  },
  "payment_args": {
    "checkout_mode": "onsite",
    "appearance": {
      "theme": "stripe"
    }
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/checkout/get-order-info?method=stripe"
```

---

### Get Checkout Summary

<badge type="tip">GET</badge> `/fluent-cart/v2/checkout/get-checkout-summary-view`

Retrieve a rendered HTML summary of the current cart along with pricing totals. Used to dynamically update the checkout page when the customer changes shipping methods or other options.

- **Authentication:** Optional (cart is identified by session/cookie)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `shipping_method_id` | integer | query | No | ID of the selected shipping method to include its charge in the totals |

#### Response (Success — 200)

```json
{
  "items": {
    "views": "<div class=\"fct-checkout-items\">...rendered HTML...</div>",
    "subtotal": "$50.00",
    "has_subscriptions": false,
    "shipping_charge": 500,
    "unformatted_total": 5500,
    "total": "$55.00",
    "shipping_charge_formated": "$5.00",
    "shipping_method_id": "3"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `items.views` | string (HTML) | Server-rendered HTML of the cart item list for the checkout page |
| `items.subtotal` | string | Formatted subtotal of all cart items (before shipping) |
| `items.has_subscriptions` | boolean | Whether the cart contains subscription products |
| `items.shipping_charge` | integer | Shipping charge in cents |
| `items.unformatted_total` | integer | Grand total in cents (subtotal + shipping) |
| `items.total` | string | Formatted grand total string |
| `items.shipping_charge_formated` | string | Formatted shipping charge string |
| `items.shipping_method_id` | string | The shipping method ID used for calculation |

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/checkout/get-checkout-summary-view?shipping_method_id=3"
```

---

### Get Available Shipping Methods

<badge type="tip">GET</badge> `/fluent-cart/v2/checkout/get-available-shipping-methods`

Retrieve shipping methods available for a given country and state. The country can be auto-detected from the customer's timezone or provided directly via country code.

- **Authentication:** Not required

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `timezone` | string | query | Conditional | IANA timezone string (e.g., `America/New_York`, `Europe/London`). Used to auto-detect the country. Either `timezone` or `country_code` must be provided |
| `country_code` | string | query | Conditional | ISO 3166-1 alpha-2 country code (e.g., `US`, `GB`). Used when `timezone` is not provided |
| `state` | string | query | No | State/province code to further filter applicable shipping methods |

#### Response (Success — 200)

```json
{
  "available_shipping_methods": [
    {
      "id": 1,
      "title": "Standard Shipping",
      "charge_type": "flat_rate",
      "charge_amount": 500,
      "status": "active",
      "countries": ["US", "CA"],
      "states": []
    },
    {
      "id": 2,
      "title": "Express Shipping",
      "charge_type": "flat_rate",
      "charge_amount": 1500,
      "status": "active",
      "countries": ["US"],
      "states": ["NY", "CA"]
    }
  ],
  "country_code": "US"
}
```

#### Error Responses

**Missing country (200):**
```json
{
  "status": false,
  "message": "Country code is required"
}
```

**No methods available (200):**
```json
{
  "status": false,
  "country_code": "XX",
  "view": "<div class=\"fct-empty-state\">No shipping methods available for this address.</div>"
}
```

> **Note:** When the current user is a WordPress admin, the `view` field in the "no methods" response includes a link to the shipping settings page.

#### Example

```bash
# Using timezone auto-detection
curl -X GET "https://example.com/wp-json/fluent-cart/v2/checkout/get-available-shipping-methods?timezone=America/New_York"

# Using explicit country code
curl -X GET "https://example.com/wp-json/fluent-cart/v2/checkout/get-available-shipping-methods?country_code=US&state=NY"
```

---

### Get Shipping Methods List View

<badge type="tip">GET</badge> `/fluent-cart/v2/checkout/get-shipping-methods-list-view`

Retrieve a server-rendered HTML view of available shipping methods for the checkout page. This endpoint wraps `get-available-shipping-methods` and returns a pre-rendered HTML list suitable for direct insertion into the checkout form.

- **Authentication:** Not required

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `timezone` | string | query | Conditional | IANA timezone string (e.g., `America/New_York`). Used to auto-detect the country. Either `timezone` or `country_code` must be provided |
| `country_code` | string | query | Conditional | ISO 3166-1 alpha-2 country code (e.g., `US`, `GB`). Used when `timezone` is not provided |
| `state` | string | query | No | State/province code to further filter applicable shipping methods |

#### Response (Success — 200)

```json
{
  "data": {
    "status": true,
    "view": "<div class=\"fct-shipping-methods\">...rendered shipping method list HTML...</div>",
    "country_code": "US"
  }
}
```

#### Error Responses

Returns the same error responses as [Get Available Shipping Methods](#get-available-shipping-methods) when no country is provided or no methods are available for the given location.

**No methods available (200):**
```json
{
  "status": false,
  "country_code": "XX",
  "view": "<div class=\"fct-empty-state\">No shipping methods available for this address.</div>"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/checkout/get-shipping-methods-list-view?country_code=US&state=CA"
```

---

### Get Country Info

<badge type="tip">GET</badge> `/fluent-cart/v2/checkout/get-country-info`

Retrieve localization details for a country including available states/provinces and address field configuration. Used by the checkout form to dynamically adjust address fields based on the selected country.

- **Authentication:** Not required

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `timezone` | string | query | Conditional | IANA timezone string (e.g., `Asia/Tokyo`). Used to auto-detect the country. Either `timezone` or `country_code` must be provided |
| `country_code` | string | query | Conditional | ISO 3166-1 alpha-2 country code (e.g., `US`, `JP`). Used when `timezone` is not provided |

#### Response (Success — 200)

```json
{
  "data": {
    "country_code": "US",
    "states": [
      { "label": "Alabama", "value": "AL" },
      { "label": "Alaska", "value": "AK" },
      { "label": "California", "value": "CA" },
      { "label": "New York", "value": "NY" }
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
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data.country_code` | string | The resolved ISO country code |
| `data.states` | array | List of state/province options with `label` and `value`. Empty array if the country has no states |
| `data.address_locale` | object | Country-specific address field labels and requirements (e.g., "State" vs "Province", "ZIP Code" vs "Postal Code") |

#### Example

```bash
# Auto-detect from timezone
curl -X GET "https://example.com/wp-json/fluent-cart/v2/checkout/get-country-info?timezone=America/Chicago"

# Explicit country code
curl -X GET "https://example.com/wp-json/fluent-cart/v2/checkout/get-country-info?country_code=CA"
```

---

## User Authentication

### Login

<badge type="warning">POST</badge> `/fluent-cart/v2/user/login`

Authenticate a user during the checkout process. On success, sets the WordPress authentication cookie and returns a redirect URL to the customer profile page.

- **Authentication:** Requires a valid WordPress REST API nonce (`X-WP-Nonce` header)
- **Policy:** `PublicPolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `user_login` | string | body | Yes | WordPress username or email address |
| `password` | string | body | Yes | Account password |
| `remember_me` | string | body | No | Set to `on` to persist the login session ("Remember Me"). Default: not remembered |

#### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `X-WP-Nonce` | Yes | WordPress REST API nonce for `wp_rest` action. Required to prevent CSRF attacks |

#### Response (Success — 200)

```json
{
  "success": true,
  "data": {
    "message": "Login successful",
    "redirect_url": "https://your-site.com/customer-profile/#/profile"
  }
}
```

#### Error Responses

**Invalid nonce (403):**
```json
{
  "message": "Invalid security token. Please refresh the page and try again.",
  "code": "invalid_nonce"
}
```

**Missing username (400):**
```json
{
  "success": false,
  "data": {
    "message": "Email or username is required",
    "code": "missing_login"
  }
}
```

**Missing password (400):**
```json
{
  "success": false,
  "data": {
    "message": "Password is required",
    "code": "missing_password"
  }
}
```

**Invalid credentials (401):**
```json
{
  "success": false,
  "data": {
    "message": "The password you entered for the username john@example.com is incorrect.",
    "code": "login_failed"
  }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/user/login" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: your_nonce_here" \
  -d '{
    "user_login": "john@example.com",
    "password": "securepassword123",
    "remember_me": "on"
  }'
```

> **Note:** The `X-WP-Nonce` is typically generated by WordPress on the checkout page and is available to frontend JavaScript. It is required for this endpoint to function correctly.
