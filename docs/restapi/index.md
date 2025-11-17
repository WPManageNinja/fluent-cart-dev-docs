---
layout: home

hero:
  name: FluentCart OpenAPI
  text: API Documentation
  tagline: Complete OpenAPI specification for FluentCart REST API - All endpoints verified and tested
  actions:
    - theme: brand
      text: View API Reference
      link: /api
---

## Features

- **Complete OpenAPI 3.0 specification** - Comprehensive API documentation
- **Interactive API documentation** - Test endpoints directly from your browser
- **Request/Response examples** - Real examples from the live API
- **Authentication guide** - WordPress Application Password authentication
- **Verified endpoints** - All 44 endpoints tested and verified against the live API

## Quick Start

This documentation is generated from OpenAPI specifications. All endpoints have been verified and tested to ensure accuracy.

### Authentication

All API endpoints require authentication using WordPress Application Password:

1. Create an Application Password in WordPress (Users → Profile → Application Passwords)
2. Use the format: `username:application_password`
3. Base64 encode the credentials
4. Include in the `Authorization` header as: `Basic {encoded_credentials}`

### Base URL

The API base URL follows this pattern:
```
https://yourwebsite.com/wp-json/fluent-cart/v2
```

You can customize the server URL in the interactive documentation playground.

## API Sections

The FluentCart API includes the following sections:

- **Orders** (8 endpoints) - Manage orders, payments, refunds, and statuses
- **Products** (5 endpoints) - Manage products, pricing, and inventory
- **Customers** (4 endpoints) - Manage customer information
- **Coupons** (6 endpoints) - Create and manage discount coupons
- **Subscriptions** (4 endpoints) - Manage subscription orders
- **Dashboard** (1 endpoint) - Get dashboard statistics
- **Settings** (2 endpoints) - Manage store settings
- **Shipping** (1 endpoint) - Manage shipping zones
- **Tax** (2 endpoints) - Manage tax classes
- **Integration** (4 endpoints) - Manage integrations and feeds
- **Reports** (2 endpoints) - View reports and statistics
- **Files** (2 endpoints) - Upload and manage files
- **Email Notification** (3 endpoints) - Configure email notifications
- **Roles & Permissions** (2 endpoints) - Manage user permissions

Use the navigation menu to explore different API endpoints. Each endpoint includes detailed documentation, request/response schemas, and interactive examples.
