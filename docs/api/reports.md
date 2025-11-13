---
title: Reports API
description: FluentCart Reports API for analytics, statistics, and business intelligence.
---

# Reports API

The Reports API provides comprehensive analytics and reporting endpoints for FluentCart, including sales reports, order analytics, revenue tracking, customer insights, and more.

## Base URL

All Reports API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

All Reports API endpoints require:
- **Policy**: `ReportPolicy`
- **Permission**: `reports/view`

## Common Parameters

Most report endpoints accept a `params` query parameter (as an object) that can include:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | Yes | Start date for the report (ISO 8601 format) |
| `endDate` | string | Yes | End date for the report (ISO 8601 format) |
| `groupKey` | string | No | Grouping key: `'daily'`, `'monthly'`, or `'yearly'` (auto-determined if not provided) |
| `filters` | object | No | Filter criteria (see Filters section below) |
| `filterMode` | string | No | Filter mode: `'live'` or `'test'` (defaults to store mode) |
| `paymentStatus` | array | No | Array of payment statuses to filter |
| `orderStatus` | array | No | Array of order statuses to filter |
| `currency` | string | No | Currency code to filter |
| `orderTypes` | array | No | Array of order types to filter |
| `variation_ids` | array | No | Array of variation IDs to filter |

### Filters Object

The `filters` object can contain:
- `payment_status`: Payment status filter
- `status`: Order status filter
- `currency`: Currency filter
- `mode`: Order mode filter (`'live'` or `'test'`)
- `type`: Order types filter

## Overview Reports

### Get Overview

Retrieve a comprehensive overview report with key metrics.

**Endpoint:** `GET /reports/overview`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/overview?params[startDate]=2024-01-01&params[endDate]=2024-12-31" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Default Reports

### Get Report Meta

Retrieve metadata for reports, including available filters and options.

**Endpoint:** `GET /reports/fetch-report-meta`

**Permission Required**: `reports/view`

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/fetch-report-meta" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Quick Order Stats

Retrieve quick statistics about orders.

**Endpoint:** `GET /reports/quick-order-stats`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `day_range` | string | No | Date range: `'-0 days'`, `'this_month'`, or `'all_time'` (default: `'-0 days'`) |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/quick-order-stats?day_range=this_month" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Sales Growth

Retrieve sales growth data over time.

**Endpoint:** `GET /reports/sales-growth`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | No | Start date (defaults to first order date) |
| `end_date` | string | No | End date (defaults to last order date) |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/sales-growth?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Report Overview

Retrieve a detailed report overview with order summaries.

**Endpoint:** `GET /reports/report-overview`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/report-overview?params[startDate]=2024-01-01&params[endDate]=2024-12-31" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Search Repeat Customers

Search for repeat customers based on criteria.

**Endpoint:** `GET /reports/search-repeat-customer`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Search parameters including filters, pagination, etc. |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/search-repeat-customer?params[per_page]=10&params[current_page]=1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Top Products Sold

Retrieve a list of top-selling products.

**Endpoint:** `GET /reports/top-products-sold`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/top-products-sold?params[startDate]=2024-01-01&params[endDate]=2024-12-31" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Default Report

Retrieve the default sales report.

**Endpoint:** `GET /reports/fetch-default-report`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/fetch-default-report?params[startDate]=2024-01-01&params[endDate]=2024-12-31" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Sales Report

Retrieve a sales report.

**Endpoint:** `GET /reports/sales-report`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Top Sold Products

Retrieve top-selling products.

**Endpoint:** `GET /reports/fetch-top-sold-products`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Failed Orders

Retrieve a list of failed orders.

**Endpoint:** `GET /reports/fetch-failed-orders`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Top Sold Variants

Retrieve top-selling product variants.

**Endpoint:** `GET /reports/fetch-top-sold-variants`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Default Report Graphs

Retrieve graph data for the default report.

**Endpoint:** `GET /reports/fetch-default-report-graphs`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Default Report Fluctuations

Retrieve fluctuation data for the default report.

**Endpoint:** `GET /reports/fetch-default-report-fluctuations`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Frequently Bought Together

Retrieve products that are frequently bought together.

**Endpoint:** `GET /reports/fetch-frequently-bought-together`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

## Revenue Reports

### Get Revenue

Retrieve revenue data.

**Endpoint:** `GET /reports/revenue`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/revenue?params[startDate]=2024-01-01&params[endDate]=2024-12-31&params[groupKey]=monthly" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Revenue by Group

Retrieve revenue data grouped by specified criteria.

**Endpoint:** `GET /reports/revenue-by-group`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

## Order Reports

### Get Order Value Distribution

Retrieve distribution of order values.

**Endpoint:** `GET /reports/order-value-distribution`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get New vs Returning Customers

Retrieve statistics comparing new and returning customers.

**Endpoint:** `GET /reports/fetch-new-vs-returning-customer`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Orders by Group

Retrieve orders grouped by specified criteria.

**Endpoint:** `GET /reports/fetch-order-by-group`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Report by Day and Hour

Retrieve order statistics grouped by day and hour.

**Endpoint:** `GET /reports/fetch-report-by-day-and-hour`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Item Count Distribution

Retrieve distribution of item counts per order.

**Endpoint:** `GET /reports/item-count-distribution`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Order Completion Time

Retrieve statistics about order completion times.

**Endpoint:** `GET /reports/order-completion-time`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Order Chart

Retrieve chart data for orders.

**Endpoint:** `GET /reports/order-chart`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

## Refund Reports

### Get Refund Chart

Retrieve chart data for refunds.

**Endpoint:** `GET /reports/refund-chart`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Weeks Between Refund

Retrieve statistics about time between purchase and refund.

**Endpoint:** `GET /reports/weeks-between-refund`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Refund Data by Group

Retrieve refund data grouped by specified criteria.

**Endpoint:** `GET /reports/refund-data-by-group`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

## License Reports

**Note**: License report endpoints are documented in the [Licensing API](./licensing) documentation.

- `GET /reports/license-chart` - License line chart
- `GET /reports/license-pie-chart` - License pie chart
- `GET /reports/license-summary` - License summary

## Dashboard Reports

### Get Dashboard Stats

Retrieve dashboard statistics.

**Endpoint:** `GET /reports/dashboard-stats`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | No | Optional report parameters |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/reports/dashboard-stats" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Sales Growth Chart

Retrieve sales growth chart data.

**Endpoint:** `GET /reports/sales-growth-chart`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Country Heat Map

Retrieve country-based order heat map data.

**Endpoint:** `GET /reports/country-heat-map`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Recent Orders

Retrieve a list of recent orders.

**Endpoint:** `GET /reports/get-recent-orders`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | No | Optional parameters for filtering/pagination |

### Get Unfulfilled Orders

Retrieve a list of unfulfilled orders.

**Endpoint:** `GET /reports/get-unfulfilled-orders`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | No | Optional parameters for filtering/pagination |

### Get Recent Activities

Retrieve recent activity logs.

**Endpoint:** `GET /reports/get-recent-activities`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | No | Optional parameters for filtering/pagination |

### Get Dashboard Summary

Retrieve a summary of dashboard data.

**Endpoint:** `GET /reports/get-dashboard-summary`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | No | Optional report parameters |

## Cart Reports

### Get Abandoned Cart Items

Retrieve abandoned cart statistics.

**Endpoint:** `GET /reports/cart-report`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

## Subscription Reports

### Get Subscription Chart

Retrieve chart data for subscriptions.

**Endpoint:** `GET /reports/subscription-chart`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Daily Signups

Retrieve daily subscription signup statistics.

**Endpoint:** `GET /reports/daily-signups`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Retention Chart

Retrieve subscription retention chart data.

**Endpoint:** `GET /reports/retention-chart`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Future Renewals

Retrieve statistics about future subscription renewals.

**Endpoint:** `GET /reports/future-renewals`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

## Product Reports

### Get Product Report

Retrieve product performance report.

**Endpoint:** `GET /reports/product-report`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

### Get Product Performance

Retrieve detailed product performance metrics.

**Endpoint:** `GET /reports/product-performance`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

## Customer Reports

### Get Customer Report

Retrieve customer analytics report.

**Endpoint:** `GET /reports/customer-report`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

## Source Reports

### Get Sources

Retrieve order source statistics.

**Endpoint:** `GET /reports/sources`

**Permission Required**: `reports/view`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | object | Yes | Report parameters (see Common Parameters) |

## Group Key Auto-Determination

The `groupKey` parameter is automatically determined based on the date range if not provided:

- **Daily**: Date range ≤ 91 days
- **Monthly**: Date range ≤ 365 days
- **Yearly**: Date range > 365 days


