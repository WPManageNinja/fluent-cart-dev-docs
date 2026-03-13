---
title: REST API Overview
description: Complete reference for all FluentCart REST API endpoints — 367+ endpoints across 20 modules.
---

# FluentCart REST API

Complete REST API reference for FluentCart and FluentCart Pro. This documentation covers **367+ endpoints** organized by module, with full parameter details, response examples, and authentication guides.

## Getting Started

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

All admin endpoints require authentication. Public and customer portal endpoints have different authentication requirements as noted in each module.

### Authentication

**Admin API** — Use WordPress Application Passwords (HTTP Basic Auth):

1. Go to **WordPress Dashboard** → **Users** → **Your Profile**
2. Scroll to **Application Passwords** section
3. Create a new application password
4. Use the credentials with every request:

```bash
curl -X GET "https://your-site.com/wp-json/fluent-cart/v2/orders" \
  -u "username:application_password"
```

**Customer Portal API** — Uses WordPress cookie-based authentication with nonce verification:

```bash
curl -X GET "https://your-site.com/wp-json/fluent-cart/v2/customer-profile/" \
  -H "X-WP-Nonce: <nonce>" \
  --cookie "wordpress_logged_in_xxx=..."
```

**Public API** — No authentication required.

### Conventions

- All monetary values are in **cents** (e.g., `$10.00` = `1000`). Use integer arithmetic.
- All timestamps are in **UTC/GMT**.
- Pagination uses `page` and `per_page` parameters (default: `per_page=10`).
- Responses use standard HTTP status codes (`200`, `400`, `403`, `404`, `422`).
- The REST namespace is `fluent-cart/v2`.

---

## API Modules

### Core Resources

| Module | Endpoints | Description |
|--------|-----------|-------------|
| [Orders](/restapi/orders) | 22 | Order CRUD, payments, refunds, shipping, fulfillment, notes, transactions |
| [Products](/restapi/products) | 59 | Product CRUD, variations, attributes, downloadables, pricing, bundles |
| [Customers](/restapi/customers) | 18 | Customer CRUD, addresses, WordPress user association, notes |
| [Coupons](/restapi/coupons) | 12 | Coupon CRUD, validation, usage tracking |
| [Subscriptions](/restapi/subscriptions) | 17 | Subscription lifecycle, billing, cancellations, payment method management |

### Configuration

| Module | Endpoints | Description |
|--------|-----------|-------------|
| [Tax](/restapi/tax) | 26 | Tax classes, rates, EU VAT, configuration |
| [Shipping](/restapi/shipping) | 15 | Shipping zones, methods, classes |
| [Settings](/restapi/settings) | 30 | Store settings, payment methods, modules, storage, permissions, checkout fields |
| [Email Notifications](/restapi/email-notifications) | 11 | Email template management, previews, test sending |

### Analytics & Content

| Module | Endpoints | Description |
|--------|-----------|-------------|
| [Reports](/restapi/reports) | 45 | Revenue, orders, sales, refunds, subscriptions, dashboards, retention |
| [Integrations](/restapi/integrations) | 17 | Add-ons, global feeds, product integration feeds |
| [Files](/restapi/files) | 5 | File uploads, storage management, editor uploads |
| [Labels & Attributes](/restapi/labels-and-attributes) | 13 | Product labels, attribute groups, attribute terms |
| [Dashboard](/restapi/dashboard) | 20 | Dashboard stats, onboarding, activity log, print templates, widgets |

### Storefront & Checkout

| Module | Endpoints | Description |
|--------|-----------|-------------|
| [Public Shop](/restapi/public-shop) | 3 | Public product listing, search, server-rendered views |
| [Checkout](/restapi/checkout) | 7 | Order placement, payment processing, shipping methods, country info |
| [Customer Profile](/restapi/customer-profile) | 21 | Customer portal — orders, downloads, addresses, profile management |

### Pro Features

| Module | Endpoints | Description |
|--------|-----------|-------------|
| [Licensing](/restapi/licensing) | 24 | License management, activations, public license API, WordPress update API |
| [Roles & Permissions](/restapi/roles) | 7 | FluentCart role assignment and management |
| [Order Bumps](/restapi/order-bumps) | 5 | Order bump CRUD with display conditions |

---

## Permission System

FluentCart uses a policy-based authorization system with 32 granular permissions across 4 built-in roles:

| Role | Description |
|------|-------------|
| `super_admin` | Full access to all features |
| `manager` | Manage orders, customers, products, and settings |
| `worker` | Day-to-day operations — orders, customers, products |
| `accountant` | Read-only access to orders, customers, and reports |

Each endpoint documents its required permission (e.g., `orders/view`, `products/edit`, `store/sensitive`).

## Error Handling

All error responses follow a consistent format:

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

| Status Code | Meaning |
|-------------|---------|
| `200` | Success |
| `400` | Bad Request — validation failed or invalid parameters |
| `403` | Forbidden — insufficient permissions |
| `404` | Not Found — resource does not exist |
| `422` | Unprocessable Entity — business logic error |
| `429` | Too Many Requests — rate limited |
