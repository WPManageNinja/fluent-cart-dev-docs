# FluentCart REST API

Welcome to the FluentCart REST API documentation. Our API allows you to programmatically interact with your FluentCart store, manage orders, customers, products, and more.

## Getting Started

The FluentCart API uses WordPress Application Passwords for authentication and follows RESTful principles. All endpoints return JSON responses.

**Base URL**: `https://your-site.com/wp-json/fluent-cart/v2`

### Authentication

All API requests require authentication using WordPress Application Passwords:

1. Go to **WordPress Dashboard** → **Users** → **Your Profile**
2. Scroll to **Application Passwords** section
3. Create a new application password
4. Use the credentials in the format: `username:application_password`

## API Resources

### Core Resources

- **[Orders](/restapi/operations/orders/list-orders)** - Manage customer orders, payments, and fulfillment
- **[Products](/restapi/operations/products/list-products)** - Create and manage your product catalog
- **[Customers](/restapi/operations/customers/list-customers)** - Handle customer data and profiles
- **[Coupons](/restapi/operations/coupons/list-coupons)** - Create and apply discount coupons

### Additional Resources

- **[Subscriptions](/restapi/operations/subscriptions/list-subscriptions)** - Manage recurring subscriptions
- **[Tax](/restapi/operations/tax/list-tax-classes)** - Configure tax classes and rates
- **[Shipping](/restapi/operations/shipping/list-shipping-zones)** - Set up shipping zones and methods
- **[Settings](/restapi/operations/settings/get-store-settings)** - Manage store configuration
- **[Reports](/restapi/operations/reports/get-overview)** - Access sales and analytics data

### Advanced Features

- **[Files](/restapi/operations/files/list-files)** - Upload and manage downloadable files
- **[Email Notifications](/restapi/operations/email-notification/list-notifications)** - Configure email templates
- **[Roles & Permissions](/restapi/operations/roles-permissions/get-permissions)** - Manage user access
- **[Integration](/restapi/operations/integration/list-addons)** - Configure integrations and addons
- **[Licensing](/restapi/operations/licensing/get-license-summary)** - Manage software licenses

## Quick Example

```bash
# List all orders
curl -X GET "https://your-site.com/wp-json/fluent-cart/v2/orders" \
  -u "username:application_password"
```

## Need Help?

- Browse the endpoint documentation in the sidebar
- Try out endpoints using the interactive playground
- Each endpoint includes request/response examples

::: tip Interactive Playground
Every API endpoint page includes an interactive playground where you can test requests directly from your browser.
:::

