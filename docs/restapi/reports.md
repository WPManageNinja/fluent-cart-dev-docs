---
title: Reports API
description: FluentCart REST API endpoints for accessing sales analytics, revenue reports, order statistics, and business intelligence.
---

# Reports API

Access comprehensive sales analytics, revenue data, order statistics, customer insights, subscription metrics, and more.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/reports`

**Policy:** `ReportPolicy`

**Required Permission:** `reports/view`

> All monetary values are in **cents** unless stated otherwise. Most report endpoints accept date range filters via `startDate` and `endDate` query parameters. Pro license is required for custom date ranges; free plan defaults to the last 30 days.

---

## Common Parameters

Many report endpoints share a common set of parameters processed through `ReportHelper::processParams()`. These are referenced throughout this document as **Standard Report Parameters**.

### Standard Report Parameters

Passed as nested `params` object in the query string (e.g., `?params[startDate]=2025-01-01`).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params[startDate]` | string | No | Start date for the report period (e.g., `2025-01-01`). Defaults to 30 days ago on free plan. |
| `params[endDate]` | string | No | End date for the report period (e.g., `2025-12-31`). Defaults to today on free plan. |
| `params[groupKey]` | string | No | Grouping interval. Accepted values: `default`, `monthly`, `yearly`, `billing_country`, `shipping_country`, `payment_method`, `payment_status`. When `default`, the interval is auto-determined based on date range (daily for <=91 days, monthly for <=365 days, yearly otherwise). |
| `params[currency]` | string | No | Currency code to filter by (e.g., `USD`). Defaults to store currency. |
| `params[filterMode]` | string | No | Payment mode filter (e.g., `live` or `test`). Defaults to store setting. |
| `params[variation_ids]` | array | No | Array of product variation IDs to filter orders that contain these items. |
| `params[compareType]` | string | No | Comparison period type: `previous_period`, `previous_month`, `previous_quarter`, `previous_year`, or `custom`. |
| `params[compareDate]` | string | No | Custom comparison start date. Required when `compareType` is `custom`. |

### Additional Filter Parameters

Some endpoints accept additional filter keys beyond the standard set:

| Parameter | Type | Description |
|-----------|------|-------------|
| `params[paymentStatus]` | array | Payment status filter. Automatically set to report-eligible statuses (`paid`, `partially-paid`, `refunded`, `partially-refunded`). |
| `params[orderTypes]` | array | Order type filter (e.g., `one-time`, `subscription`). |
| `params[orderStatus]` | array | Order status filter. If `all` is included, defaults to excluding `on-hold` and `failed`. |
| `params[subscriptionType]` | string | Subscription type filter. Defaults to `subscription`. |

---

## Overview

### Get Revenue Overview

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/overview`

Retrieve a comprehensive year-over-year revenue overview comparing the last 12 months against the same months in the prior year. Includes monthly breakdowns, quarterly aggregations, and top revenue-generating countries.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[currency]` | string | query | No | Currency code to filter by. Defaults to store currency. |

#### Response

```json
{
    "data": {
        "gross_revenue": {
            "2025-01": {
                "current": 500000,
                "prev": 350000,
                "yoy_growth": "42.86"
            }
        },
        "gross_revenue_quarterly": {
            "Q1-2025": {
                "current": 1500000,
                "prev_year": 1200000,
                "yy_growth": "25.00"
            }
        },
        "net_revenue": { },
        "net_revenue_quarterly": { },
        "gross_summary": {
            "total": 6000000,
            "total_prev": 4800000,
            "yoy_growth": "25.00"
        },
        "net_summary": {
            "total": 5400000,
            "total_prev": 4300000,
            "yoy_growth": "25.58"
        },
        "top_country_net": {
            "by_month": {
                "2025-01": {
                    "US": 300000,
                    "GB": 150000
                }
            },
            "by_countries": {
                "US": 3600000,
                "GB": 1800000
            }
        },
        "top_country_gross": { }
    }
}
```

**Notes:**
- Gross revenue = `total_paid`
- Net revenue = `total_paid - total_refund - tax_total - shipping_tax`
- Data covers the last 30 months to enable 12-month YoY comparisons
- Country data is limited to the top 5 countries by revenue

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/overview?params[currency]=USD" \
  -u "username:app_password"
```

---

## General Reports

### Get Report Meta

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/fetch-report-meta`

Retrieve metadata for the reporting interface, including available currencies, the earliest order date, and store mode.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[startDate]` | string | query | No | Start date to scope the currency lookup. |
| `params[endDate]` | string | query | No | End date to scope the currency lookup. |

#### Response

```json
{
    "currencies": {
        "USD": {
            "code": "USD",
            "sign": "$"
        }
    },
    "min_date": "2024-01-15 08:30:00",
    "storeMode": "live",
    "first_order_date": "2024-01-15 08:30:00"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/fetch-report-meta" \
  -u "username:app_password"
```

---

### Get Quick Order Stats

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/quick-order-stats`

Retrieve quick summary statistics for orders within a specified range, with automatic comparison against the equivalent prior period.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `day_range` | string | query | No | Date range shortcut. Accepts relative date strings (e.g., `-7 days`, `-30 days`), `this_month`, or `all_time`. Default: `-0 days` (today). |

#### Response

```json
{
    "stats": { },
    "from_date": "2025-06-01 00:00:00",
    "to_date": "2025-06-15 23:59:59"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/quick-order-stats?day_range=-30%20days" \
  -u "username:app_password"
```

---

### Get Sales Growth

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/sales-growth`

Retrieve sales growth data over a specified period. Filters to orders with successful payment and order statuses.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `start_date` | string | query | No | Start date. Defaults to the earliest order date. |
| `end_date` | string | query | No | End date. Defaults to the latest order date. |

#### Response

```json
{
    "sales_data": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/sales-growth?start_date=2025-01-01&end_date=2025-12-31" \
  -u "username:app_password"
```

---

### Get Report Overview

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/report-overview`

Retrieve an aggregated report overview including order summary statistics and breakdowns by payment method.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[created_at]` | object | query | No | Date filter with `column`, `operator`, and `value` keys. |

#### Response

```json
{
    "data": { },
    "orders_by_payment_method": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/report-overview" \
  -u "username:app_password"
```

---

### Search Repeat Customers

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/search-repeat-customer`

Search and paginate through customers who have made multiple purchases.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[per_page]` | integer | query | No | Number of results per page. |
| `params[current_page]` | integer | query | No | Current page number. |

Additional search/filter parameters may be supported through `CustomerHelper::getRepeatCustomerBySearch()`.

#### Response

```json
{
    "repeat_customers": {
        "total": 50,
        "per_page": 15,
        "current_page": 1,
        "data": [ ]
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/search-repeat-customer?params[per_page]=20&params[current_page]=1" \
  -u "username:app_password"
```

---

### Get Top Products Sold

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/top-products-sold`

Retrieve a list of top-selling products based on order item data, using the Resource API layer.

- **Permission:** `reports/view`

#### Parameters

Parameters are passed via the `params` object and forwarded to `OrderItemResource::topProductsSold()`.

#### Response

```json
{
    "top_products_sold": [ ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/top-products-sold" \
  -u "username:app_password"
```

---

## Revenue Reports

### Get Revenue Data

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/revenue`

Retrieve detailed revenue data grouped by the specified interval, with optional comparison against a prior period. Includes summary totals, period-over-period fluctuations, and the applied group key.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter (auto-set to report statuses). |
| `params[orderTypes]` | array | query | No | Filter by order type (e.g., `one-time`, `subscription`). |

#### Response

```json
{
    "revenueReport": [
        {
            "year": "2025",
            "group": "2025-01",
            "gross_revenue": 500000,
            "net_revenue": 450000,
            "orders": 45
        }
    ],
    "summary": {
        "gross_revenue": 6000000,
        "net_revenue": 5400000,
        "total_orders": 540
    },
    "previousSummary": { },
    "fluctuations": {
        "gross_revenue": {
            "value": 25.0,
            "direction": "up"
        }
    },
    "previousMetrics": [ ],
    "appliedGroupKey": "monthly"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/revenue?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[groupKey]=monthly&params[compareType]=previous_period" \
  -u "username:app_password"
```

---

### Get Revenue by Group

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/revenue-by-group`

Retrieve revenue data broken down by a specific grouping dimension (e.g., payment method, billing country).

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter (auto-set to report statuses). |
| `params[orderTypes]` | array | query | No | Filter by order type. |

#### Response

```json
{
    "data": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/revenue-by-group?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[groupKey]=payment_method" \
  -u "username:app_password"
```

---

## Order Reports

### Get Order Value Distribution

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/order-value-distribution`

Retrieve the distribution of orders by their total value, showing how orders are spread across different price ranges.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "data": [ ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/order-value-distribution?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

### Get New vs Returning Customers

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/fetch-new-vs-returning-customer`

Compare the ratio of orders from new customers versus returning customers over the given period.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "newVsReturning": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/fetch-new-vs-returning-customer?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

### Get Orders by Group

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/fetch-order-by-group`

Retrieve order data broken down by a specified grouping dimension (e.g., payment method, country, payment status).

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "data": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/fetch-order-by-group?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[groupKey]=payment_method" \
  -u "username:app_password"
```

---

### Get Report by Day and Hour

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/fetch-report-by-day-and-hour`

Retrieve a heatmap-style report showing order distribution by day of the week and hour of the day.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

Returns day-and-hour matrix data suitable for heatmap visualization.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/fetch-report-by-day-and-hour?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

### Get Item Count Distribution

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/item-count-distribution`

Retrieve the distribution of orders by the number of items per order (e.g., how many orders have 1 item, 2 items, etc.).

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "data": [ ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/item-count-distribution?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

### Get Order Completion Time

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/order-completion-time`

Retrieve statistics on how long orders take to be completed (time between creation and completion).

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "data": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/order-completion-time?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

### Get Order Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/order-chart`

Retrieve order count and statistics as time-series chart data, with optional comparison against a prior period. Includes summary totals and fluctuation calculations.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "orderChartData": [
        {
            "year": "2025",
            "group": "2025-01-15",
            "orders": 12
        }
    ],
    "summary": {
        "total_orders": 540,
        "average_orders_per_day": 18
    },
    "previousSummary": { },
    "fluctuations": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/order-chart?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[compareType]=previous_period" \
  -u "username:app_password"
```

---

## Sales Reports

### Get Sales Report

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/sales-report`

Retrieve comprehensive sales report data with multiple graph metrics (revenue, orders, items, etc.) broken down by the specified time interval. Supports comparison against a prior period with fluctuation calculations.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "graphs": {
        "gross_revenue": [ ],
        "net_revenue": [ ],
        "orders": [ ],
        "items_sold": [ ]
    },
    "summaryData": {
        "gross_revenue": 6000000,
        "net_revenue": 5400000,
        "total_orders": 540,
        "items_sold": 1200
    },
    "previousSummary": { },
    "fluctuations": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/sales-report?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[groupKey]=monthly" \
  -u "username:app_password"
```

---

### Get Top Sold Products

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/fetch-top-sold-products`

Retrieve a ranked list of the best-selling products within the specified date range.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

Returns ranked product list with sales counts and revenue data.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/fetch-top-sold-products?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

### Get Top Sold Variants

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/fetch-top-sold-variants`

Retrieve a ranked list of the best-selling product variants within the specified date range.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

Returns ranked variant list with sales counts and revenue data.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/fetch-top-sold-variants?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

## Refund Reports

### Get Refund Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/refund-chart`

Retrieve refund data as time-series chart data with summary totals. Supports comparison against a prior period with fluctuation calculations.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "summary": {
        "total_refunds": 25,
        "total_refund_amount": 125000,
        "average_refund": 5000
    },
    "previousSummary": { },
    "chartData": [
        {
            "year": "2025",
            "group": "2025-01",
            "refund_count": 3,
            "refund_amount": 15000
        }
    ],
    "fluctuations": { },
    "previousMetrics": [ ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/refund-chart?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[compareType]=previous_period" \
  -u "username:app_password"
```

---

### Get Weeks Between Refund

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/weeks-between-refund`

Retrieve analysis data showing the distribution of time (in weeks) between order placement and refund request.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "data": [ ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/weeks-between-refund?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

### Get Refund Data by Group

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/refund-data-by-group`

Retrieve refund data broken down by a grouping dimension (e.g., payment method, country).

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "data": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/refund-data-by-group?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[groupKey]=payment_method" \
  -u "username:app_password"
```

---

## License Reports

### Get License Line Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/license-chart`

Retrieve license creation/activation data as time-series chart data, grouped by the specified interval.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[startDate]` | string | query | No | Start date for the report period. |
| `params[endDate]` | string | query | No | End date for the report period. |
| `params[groupKey]` | string | query | No | Time grouping interval: `daily`, `monthly`, or `yearly`. Default: `daily`. |
| `params[paymentStatus]` | string | query | No | Payment status filter. |
| `params[orderStatus]` | string | query | No | Order status filter. |
| `params[currency]` | string | query | No | Currency code filter. |
| `params[filterMode]` | string | query | No | Payment mode filter (`live` or `test`). |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

Returns time-series chart data for license metrics.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/license-chart?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[groupKey]=monthly" \
  -u "username:app_password"
```

---

### Get License Pie Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/license-pie-chart`

Retrieve license distribution data suitable for pie/donut chart visualization (e.g., active vs expired vs revoked).

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[startDate]` | string | query | No | Start date for the report period. |
| `params[endDate]` | string | query | No | End date for the report period. |
| `params[paymentStatus]` | string | query | No | Payment status filter. |
| `params[orderStatus]` | string | query | No | Order status filter. |
| `params[currency]` | string | query | No | Currency code filter. |
| `params[filterMode]` | string | query | No | Payment mode filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

Returns license status distribution data.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/license-pie-chart?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

### Get License Summary

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/license-summary`

Retrieve summary statistics for licenses (total issued, active, expired, revoked, etc.) within the specified date range.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[startDate]` | string | query | No | Start date for the report period. |
| `params[endDate]` | string | query | No | End date for the report period. |
| `params[paymentStatus]` | string | query | No | Payment status filter. |
| `params[orderStatus]` | string | query | No | Order status filter. |
| `params[currency]` | string | query | No | Currency code filter. |
| `params[filterMode]` | string | query | No | Payment mode filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

Returns license summary statistics.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/license-summary?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

## Dashboard Reports

### Get Dashboard Stats

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/dashboard-stats`

Retrieve key dashboard statistics including total orders, paid orders, paid order items, and total paid amounts. Automatically calculates comparison against the equivalent prior period based on the selected date range.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[startDate]` | string | query | No | Start date. If omitted, defaults to the earliest order date. |
| `params[endDate]` | string | query | No | End date. If omitted, defaults to today. |
| `params[currency]` | string | query | No | Currency code filter. Defaults to store currency. |
| `params[paymentStatus]` | string | query | No | Payment status filter. Set to `all` to include all statuses. |

#### Response

```json
{
    "dashBoardStats": {
        "total_orders": {
            "title": "All Orders",
            "icon": "AllOrdersIcon",
            "current_count": 540,
            "compare_count": 480
        },
        "paid_orders": {
            "title": "Paid Orders",
            "icon": "Money",
            "current_count": 520,
            "compare_count": 460
        },
        "total_paid_order_items": {
            "title": "Paid Order Items",
            "icon": "OrderItemsIcon",
            "current_count": 1200,
            "compare_count": 1050
        },
        "total_paid_amounts": {
            "title": "Order Value (Paid)",
            "icon": "OrderValueIcon",
            "current_count": 6000000,
            "compare_count": 5200000,
            "is_cents": true
        }
    }
}
```

**Notes:**
- `total_paid_amounts.current_count` is in **cents** (indicated by `is_cents: true`)
- The comparison period is automatically calculated as the same number of days immediately preceding the selected start date

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/dashboard-stats?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[currency]=USD" \
  -u "username:app_password"
```

---

### Get Sales Growth Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/sales-growth-chart`

Retrieve time-series chart data for sales growth on the dashboard, showing order counts and net revenue grouped by the specified interval.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[orderStatus]` | array | query | No | Order status filter. |

#### Response

```json
{
    "salesGrowthChart": [
        {
            "year": "2025",
            "group": "2025-01",
            "orders": 45,
            "net_revenue": 4500.00
        }
    ]
}
```

**Note:** The `net_revenue` values in this response are in **decimal** (dollars), not cents. The calculation is: `(total_paid - total_refund - tax_total - shipping_tax) / 100`.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/sales-growth-chart?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[groupKey]=monthly" \
  -u "username:app_password"
```

---

### Get Country Heat Map

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/country-heat-map`

Retrieve order counts grouped by billing country for world map / heat map visualization.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[currency]` | string | query | No | Currency code filter. Defaults to store currency. |

#### Response

```json
{
    "countryHeatMap": [
        {
            "name": "United States",
            "value": 250
        },
        {
            "name": "United Kingdom",
            "value": 120
        },
        {
            "name": "Germany",
            "value": 85
        }
    ]
}
```

**Notes:**
- Country codes are resolved to full country names
- Orders without a billing country are grouped under "Uncategorized"
- Results are sorted by value in ascending order

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/country-heat-map?params[currency]=USD" \
  -u "username:app_password"
```

---

### Get Recent Orders

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/get-recent-orders`

Retrieve the 10 most recent orders for the dashboard with basic customer and order information.

- **Permission:** `reports/view`

#### Parameters

None.

#### Response

```json
{
    "recentOrders": [
        {
            "id": 150,
            "customer_id": 42,
            "customer_name": "John Doe",
            "total_amount": 99.99,
            "created_at": "2025-06-15 14:30:00",
            "order_items_count": 3
        }
    ]
}
```

**Note:** The `total_amount` is returned in **decimal** (dollars), not cents.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/get-recent-orders" \
  -u "username:app_password"
```

---

### Get Unfulfilled Orders

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/get-unfulfilled-orders`

Retrieve all orders that are not yet completed, canceled, or failed. Useful for dashboard fulfillment queues.

- **Permission:** `reports/view`

#### Parameters

None.

#### Response

```json
{
    "unfulfilledOrders": [
        {
            "id": 148,
            "customer_id": 38,
            "customer_name": "Jane Smith",
            "total_amount": 49.99,
            "created_at": "2025-06-14 10:15:00",
            "order_items_count": 1
        }
    ]
}
```

**Notes:**
- `total_amount` is in **decimal** (dollars), not cents
- Excludes orders with status `canceled`, `failed`, or `completed`
- Ordered by most recent first

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/get-unfulfilled-orders" \
  -u "username:app_password"
```

---

### Get Recent Activities

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/get-recent-activities`

Retrieve the 10 most recent activity log entries, optionally filtered by time period.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `groupKey` | string | query | No | Time filter: `today`, `yesterday`, `this_week`, or `all` (default: `all`). |

#### Response

```json
{
    "recentActivities": [
        {
            "title": "Order #150 created",
            "content": "New order placed by John Doe",
            "created_at": "2025-06-15 14:30:00",
            "created_by": 1,
            "module_name": "orders",
            "module_id": 150
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/get-recent-activities?groupKey=today" \
  -u "username:app_password"
```

---

### Get Dashboard Summary

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/get-dashboard-summary`

Retrieve a high-level summary of the store including product counts and coupon statistics.

- **Permission:** `reports/view`

#### Parameters

None.

#### Response

```json
{
    "summaryData": {
        "total_products": 25,
        "draft_products": 3,
        "active_coupons": 5,
        "expired_coupons": 2
    }
}
```

**Notes:**
- `total_products` counts all `fluent-products` custom post type entries
- `draft_products` counts products with `post_status = 'draft'`
- `active_coupons` are coupons that are either unexpired or have no end date and are in `active` status
- `expired_coupons` are coupons past their end date with `expired` or `disabled` status

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/get-dashboard-summary" \
  -u "username:app_password"
```

---

## Cart Reports

### Get Cart Report

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/cart-report`

Retrieve abandoned cart data showing which products are most frequently abandoned, along with their unit prices and abandonment counts. A cart is considered abandoned if it has been inactive for more than 60 seconds.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[startDate]` | string | query | No | Start date to scope the cart data. |
| `params[endDate]` | string | query | No | End date to scope the cart data. |
| `params[groupKey]` | string | query | No | Grouping key (reserved for future use). |

#### Response

```json
{
    "abandonedItems": [
        {
            "product_name": "Premium Plan",
            "abandoned_times": 15,
            "unit_price": 4999
        },
        {
            "product_name": "Basic Plan",
            "abandoned_times": 8,
            "unit_price": 1999
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/cart-report?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

## Subscription Reports

### Get Subscription Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/subscription-chart`

Retrieve subscription data as time-series chart data, including total subscription counts and future installment projections. Supports comparison against a prior period.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[subscriptionType]` | string | query | No | Subscription type filter. Defaults to `subscription`. |

#### Response

```json
{
    "currentMetrics": [
        {
            "year": "2025",
            "group": "2025-01",
            "subscriptions": 20,
            "mrr": 100000
        }
    ],
    "compareMetrics": [ ],
    "summary": {
        "future_installments": 500000.00,
        "total_subscriptions": 150
    },
    "fluctuations": []
}
```

**Note:** `future_installments` is calculated as the sum of `(bill_times - bill_count) * recurring_total` for active subscriptions, returned in **decimal** (dollars).

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/subscription-chart?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[compareType]=previous_year" \
  -u "username:app_password"
```

---

### Get Daily Signups

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/daily-signups`

Retrieve daily subscription signup counts over the specified date range.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[subscriptionType]` | string | query | No | Subscription type filter. |

#### Response

```json
{
    "signups": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/daily-signups?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

### Get Retention Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/retention-chart`

Retrieve subscription retention data as chart data, showing how many subscribers remain active over time.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[customDays]` | integer | query | No | Custom number of days for the retention period. |

#### Response

```json
{
    "chartData": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/retention-chart?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[customDays]=90" \
  -u "username:app_password"
```

---

### Get Future Renewals

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/future-renewals`

Retrieve projected future subscription renewal data.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) (only `startDate` and `endDate` are explicitly extracted).

#### Response

Returns future renewal projection data.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/future-renewals?params[startDate]=2025-01-01&params[endDate]=2025-12-31" \
  -u "username:app_password"
```

---

### Get Subscription Retention

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/subscription-retention`

Retrieve subscription retention data showing the percentage of subscribers who remain active over successive billing periods.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters).

#### Response

```json
{
    "retention_data": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/subscription-retention?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

### Get Subscription Cohorts

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/subscription-cohorts`

Retrieve cohort analysis data for subscriptions. Groups subscribers by their signup period and tracks retention over subsequent periods. Uses pre-generated retention snapshots for efficient querying.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[groupBy]` | string | query | No | Cohort grouping interval: `month` or `year`. Default: `year`. |
| `params[metric]` | string | query | No | Metric to track: `subscribers` or other supported metric. Default: `subscribers`. |
| `params[variation_ids]` | array | query | No | Product variation IDs to filter by. These are converted to product IDs internally for snapshot lookup. |

**Notes:**
- When `groupBy` is `year`, the default max periods is 8 years (or date range + 1, whichever is greater)
- When `groupBy` is `month`, the default max periods is 18 months (to capture yearly subscription renewal patterns)
- This endpoint requires retention snapshots to be pre-generated via the `retention-snapshots/generate` endpoint

#### Response

Returns cohort matrix data.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/subscription-cohorts?params[startDate]=2023-01-01&params[endDate]=2025-06-30&params[groupBy]=year&params[metric]=subscribers" \
  -u "username:app_password"
```

---

## Retention Snapshots

### Generate Retention Snapshots

<badge type="warning">POST</badge> `/fluent-cart/v2/reports/retention-snapshots/generate`

Trigger generation of retention snapshot data. If Action Scheduler is available, the job runs in the background; otherwise it runs synchronously.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product_id` | integer | body | No | Specific product ID to generate snapshots for. If omitted, generates for all products. |

#### Response (Background Mode)

```json
{
    "success": true,
    "message": "Snapshot generation queued",
    "job_id": 1718456789,
    "mode": "background"
}
```

#### Response (Synchronous Mode)

```json
{
    "success": true,
    "message": "Snapshots generated successfully",
    "stats": { },
    "mode": "synchronous"
}
```

**Notes:**
- Background mode uses WordPress Action Scheduler (`as_schedule_single_action`)
- The returned `job_id` is a Unix timestamp used to track the job
- Use the `retention-snapshots/status` endpoint to poll for completion

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/reports/retention-snapshots/generate" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 42}' \
  -u "username:app_password"
```

---

### Check Retention Snapshot Status

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/retention-snapshots/status`

Check the status of a previously queued retention snapshot generation job.

- **Permission:** `reports/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[job_id]` | integer | query | Yes | The job ID returned from the `retention-snapshots/generate` endpoint. |

#### Response (Running)

```json
{
    "success": true,
    "status": "running",
    "message": "Job is still running",
    "data": {
        "status": "pending",
        "started_at": "2025-06-15 14:30:00",
        "product_id": 42
    }
}
```

#### Response (Completed)

```json
{
    "success": true,
    "status": "completed",
    "message": "Job completed",
    "stats": { },
    "data": { }
}
```

#### Response (Job Not Found)

```json
{
    "success": false,
    "message": "Job not found",
    "job_id": 1718456789
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/retention-snapshots/status?params[job_id]=1718456789" \
  -u "username:app_password"
```

---

## Product Reports

### Get Product Report

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/product-report`

Retrieve product-level report data as time-series chart data with summary statistics. Supports comparison against a prior period with fluctuation calculations.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "summary": {
        "total_products_sold": 1200,
        "total_revenue": 6000000,
        "unique_products": 25
    },
    "previousSummary": { },
    "fluctuations": { },
    "currentMetrics": [
        {
            "year": "2025",
            "group": "2025-01",
            "products_sold": 100,
            "revenue": 500000
        }
    ],
    "previousMetrics": [ ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/product-report?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[compareType]=previous_period" \
  -u "username:app_password"
```

---

### Get Product Performance

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/product-performance`

Retrieve a ranked performance chart of top-performing products within the specified date range.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "productPerformance": [ ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/product-performance?params[startDate]=2025-01-01&params[endDate]=2025-06-30" \
  -u "username:app_password"
```

---

## Customer Reports

### Get Customer Report

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/customer-report`

Retrieve customer acquisition and activity data as time-series chart data with summary statistics. Supports comparison against a prior period with fluctuation calculations.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters).

#### Response

```json
{
    "summary": {
        "total_customers": 300,
        "new_customers": 50,
        "returning_customers": 250
    },
    "previousSummary": { },
    "fluctuations": { },
    "currentMetrics": [
        {
            "year": "2025",
            "group": "2025-01",
            "new_customers": 8,
            "total_customers": 25
        }
    ],
    "previousMetrics": [ ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/customer-report?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[compareType]=previous_year" \
  -u "username:app_password"
```

---

## Source Reports

### Get Source Report

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/sources`

Retrieve order source/attribution data showing where orders originated from. Supports comparison against a prior period with fluctuation calculations.

- **Permission:** `reports/view`

#### Parameters

Uses [Standard Report Parameters](#standard-report-parameters) plus:

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[paymentStatus]` | array | query | No | Payment status filter. |
| `params[orderTypes]` | array | query | No | Order type filter. |

#### Response

```json
{
    "sourceReportData": { },
    "fluctuations": { }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/sources?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[compareType]=previous_period" \
  -u "username:app_password"
```

---

## Authentication

All report endpoints require authentication via WordPress REST API authentication methods:

- **Application Passwords** (recommended): Pass via Basic Auth header
- **Cookie Authentication**: For logged-in admin users with appropriate capabilities
- **JWT or OAuth**: If configured via third-party plugins

The authenticated user must have the `reports/view` capability, which is available to the following FluentCart roles:

| Role | Has Access |
|------|-----------|
| `super_admin` | Yes |
| `manager` | Yes |
| `worker` | No |
| `accountant` | Yes |

---

## Group Key Reference

When using `groupKey` with report endpoints, the following values control how data is aggregated:

| Value | SQL Format | Use Case |
|-------|-----------|----------|
| `default` | Auto-detected | Automatically selects based on date range span |
| `daily` | `%Y-%m-%d` | Date ranges up to 91 days |
| `monthly` | `%Y-%m` | Date ranges between 92 and 365 days |
| `yearly` | `%Y` | Date ranges over 365 days |
| `payment_method` | N/A | Group by payment gateway (e.g., `stripe`, `paypal`) |
| `payment_status` | N/A | Group by payment status |
| `billing_country` | N/A | Group by customer billing country |
| `shipping_country` | N/A | Group by customer shipping country |

**Note:** Not all group key values are supported by every endpoint. Time-based keys (`daily`, `monthly`, `yearly`, `default`) are universally supported. Dimension-based keys (`payment_method`, `billing_country`, etc.) are supported by "by-group" endpoints.

---

## Comparison Periods

When `compareType` is set, the API returns both current and previous period data along with fluctuation percentages:

| compareType | Behavior |
|-------------|----------|
| `previous_period` | Same number of days immediately before the start date |
| `previous_month` | Same period shifted back 1 month |
| `previous_quarter` | Same period shifted back 3 months |
| `previous_year` | Same period shifted back 1 year |
| `custom` | Custom start date specified via `compareDate`; same duration |

The fluctuation object returned typically contains:

```json
{
    "metric_name": {
        "value": 25.0,
        "direction": "up"
    }
}
```

---

## Error Handling

All report endpoints return standard WordPress REST API error responses:

```json
{
    "code": "rest_forbidden",
    "message": "Sorry, you are not allowed to do that.",
    "data": {
        "status": 403
    }
}
```

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `400` | Invalid parameters |
| `401` | Not authenticated |
| `403` | Insufficient permissions (`reports/view` required) |
| `500` | Server error |
