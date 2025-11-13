---
title: Licensing API
description: FluentCart Licensing API for license reports and license generation.
---

# Licensing API

The Licensing API provides endpoints for license reports and license generation. Full license management features may be available in FluentCart Pro.

## Base URL

All Licensing API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

License report endpoints require:
- **Policy**: `ReportPolicy`
- **Permission**: `reports/view` (inherited from ReportPolicy)

License generation endpoint requires:
- **Policy**: `OrderPolicy`
- **Permission**: `orders/manage`

## License Reports

License report endpoints provide analytics and statistics about licenses in your store.

### Get License Line Chart

Retrieve license data formatted for a line chart visualization.

**Endpoint:** `GET /reports/license-chart`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Request parameters object containing filters, date range, and grouping |

The `params` object should contain:
- `filters` (object, optional): Filter criteria
- `startDate` (string, required): Start date for the report (ISO 8601 format)
- `endDate` (string, required): End date for the report (ISO 8601 format)
- `groupKey` (string, required): Grouping key for the chart (e.g., 'day', 'week', 'month')

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/license-chart?params[startDate]=2024-01-01&params[endDate]=2024-12-31&params[groupKey]=month" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

#### Example Request (JavaScript)

```javascript
const params = {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    groupKey: 'month',
    filters: {}
};

const response = await fetch(`https://yoursite.com/wp-json/fluent-cart/v2/reports/license-chart?params=${encodeURIComponent(JSON.stringify(params))}`, {
    headers: {
        'Authorization': 'Basic ' + btoa('username:application_password')
    }
});

const data = await response.json();
```

### Get License Pie Chart

Retrieve license data formatted for a pie chart visualization.

**Endpoint:** `GET /reports/license-pie-chart`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Request parameters object containing filters and date range |

The `params` object should contain:
- `filters` (object, optional): Filter criteria
- `startDate` (string, required): Start date for the report (ISO 8601 format)
- `endDate` (string, required): End date for the report (ISO 8601 format)

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/license-pie-chart?params[startDate]=2024-01-01&params[endDate]=2024-12-31" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get License Summary

Retrieve a summary of license statistics.

**Endpoint:** `GET /reports/license-summary`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Request parameters object containing filters and date range |

The `params` object should contain:
- `filters` (object, optional): Filter criteria
- `startDate` (string, required): Start date for the report (ISO 8601 format)
- `endDate` (string, required): End date for the report (ISO 8601 format)

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/license-summary?params[startDate]=2024-01-01&params[endDate]=2024-12-31" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## License Generation

### Generate Missing Licenses

Generate licenses for an order that should have licenses but don't yet.

**Endpoint:** `POST /orders/{order}/generate-missing-licenses`

**Permission Required**: `orders/manage`

**Note**: This endpoint is documented in the [Orders API](./orders#generate-missing-licenses) documentation.

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order` | string/int | Yes | Order ID or UUID (route parameter) |

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/123/generate-missing-licenses" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Permissions

License-related permissions:

- `licenses/view` - View licenses (used by LicensePolicy)
- `licenses/manage` - Manage licenses (used by LicensePolicy)
- `licenses/delete` - Delete licenses (used by LicensePolicy)
- `reports/view` - View reports (required for license report endpoints)
- `orders/manage` - Manage orders (required for license generation)

## Notes

- License report endpoints are part of the Reports API and require `ReportPolicy` access
- Full license management features (CRUD operations, activation/deactivation, etc.) may be available in FluentCart Pro
- The `LicensePolicy` exists in the codebase but may not have corresponding routes in the core version
- License generation is typically handled automatically when orders are completed, but can be manually triggered using the generate-missing-licenses endpoint

---

**Related Documentation:**
- [Roles & Permissions API](./roles-permissions) - User role management
- [Order Bump API](./order-bump) - Promotional features
- [REST API Overview](../api/) - General API information
