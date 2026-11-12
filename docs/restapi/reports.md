---
title: Reports API
description: FluentCart REST API endpoints for sales, order, product, customer, coupon, source and subscription reports.
---

# Reports API

Read sales, order, product, customer, coupon, source and subscription reports.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/reports`

**Policy:** `ReportPolicy`

**Required Permission:** `reports/view`

::: warning Amounts: cents or decimals
The unit of money fields differs per endpoint. Some reports return **cents** (e.g. `$10.00` = `1000`); others return **decimals** in major units (e.g. `10.00`). Each endpoint below states its unit.
:::

::: info Pro report endpoints
Endpoints marked **Pro Feature** are registered by FluentCart Pro (module API 2 or later). Without Pro they return `404`. Some core endpoints also return extra fields when Pro is active; those fields are named in the endpoint's description and come from the [report filters](/hooks/filters/settings-and-configuration#reports).
:::

---

## Common Parameters

Most report endpoints read a `params` object from the query string (for example `?params[startDate]=2025-01-01`) and pass it through `ReportHelper::processParams()`. The parameters below are referred to as **Standard params** in each endpoint's table.

### Standard Report Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params[startDate]` | string | No | First day of the report period (`YYYY-MM-DD`). Read as a calendar day in the WordPress site timezone. |
| `params[endDate]` | string | No | Last day of the report period (`YYYY-MM-DD`), included. Site timezone. |
| `params[rangeKey]` | string | No | A date preset, resolved from today on the server: `today`, `last_7`, `last_30`, `this_month`, `last_month`, `last_12_months`, `year_to_date` or `all_time`. A known preset replaces `startDate` and `endDate` (`all_time` keeps the sent `startDate`). |
| `params[groupKey]` | string | No | Chart interval: `default`, `daily`, `monthly` or `yearly`. With `default` (or none), the interval follows the range: daily up to 91 days, monthly up to 365 days, yearly above. Send only these values. |
| `params[currency]` | string | No | Three-letter currency code. Defaults to the store's base currency. Endpoints that support it also accept `__all__`: every currency converted to the base currency. Elsewhere `__all__` reads as the base currency. A report never sums different currencies without conversion. |
| `params[filterMode]` | string | No | Payment mode: `live` or `test`. When not sent, live and test orders both count. |
| `params[variation_ids][]` | array | No | Product variation IDs. Limits the report to orders that contain these variations. |
| `params[compareType]` | string | No | Comparison period: `previous_period`, `previous_month`, `previous_quarter`, `previous_year` or `custom`. Needs `compareDate`. |
| `params[compareDate]` | string | No | Required with `compareType`. For `custom`, it is the first day of the compared period. For the other types, send any date (the period is computed from the report range). |

Report days, months and hours are store days in the WordPress site timezone. The server converts the range bounds to UTC before it queries the GMT columns.

### Order Types

Endpoints that list `params[orderTypes][]` limit the report to these sale types: `payment` (one-time), `subscription` (new subscription), `renewal`, `installment` (installment sign-up) and `installment_payment`. An installment plan is a subscription with a fixed number of bills.

### Report Statuses

Reports count orders with payment status `paid`, `partially-paid`, `refunded` or `partially-refunded`. A `params[paymentStatus]` value sent by the client is ignored.

---

## Metric Definitions

All reports share these definitions.

| Metric | Definition |
|--------|------------|
| **Net sales** | What the customer paid, less refunds and less the tax, shipping and fees the store kept. Every field this page calls net sales uses one formula (`ReportHelper::netSalesSql()`), so Revenue, Orders, Payment methods, Products, Locations, Coupons, Sources, Customers, Subscriptions and the dashboard tiles agree. |
| **Net revenue** | A different, older figure: paid, less refunds, less the tax not refunded. Shipping and fees stay in. Fields named `net_revenue` (Revenue report, Reports overview) use it. |
| **Gross sales** | Net sales plus discounts and refunded sales (the Revenue report's breakdown). |
| **Orders** | Every order in a report status, including $0 orders. |
| **New and returning customers** | A customer is new on their first paid purchase (`total_paid > 0`, not a renewal, in any currency). Later purchases make them returning. A $0 order never makes a customer new. Customer counts, repeat rate and lifetime value in the Products, Coupons, Sources, Customers overview and Pro customer reports count paid orders only. Exception: `customer-insights` reads every order in a report status. |
| **Locations** | In one location row, a customer counts once. A customer who is both new and returning there counts as new. |
| **Subscription renewals amount** | In the subscriptions overview, the renewals amount is the net sales of renewal orders. |
| **Dashboard tiles** | `GET /dashboard/stats` shows the Revenue report's figures for the last 30 store days, in all currencies converted to the base currency. See [Dashboard API](/restapi/dashboard#get-dashboard-stats). |

---

## Removed Endpoints

FluentCart removed these report endpoints because no screen called them. They now return `404`. Use the replacement listed.

| Removed endpoint | Use instead |
|------------------|-------------|
| `GET /reports/report-overview` | [`overview`](#get-reports-overview) |
| `GET /reports/quick-order-stats` | [`dashboard-stats`](#get-dashboard-stats) (the same order stat tiles) |
| `GET /reports/sales-report` | [`revenue`](#get-revenue-data) |
| `GET /reports/revenue-by-group` | [`revenue`](#get-revenue-data); by payment method: [`payment-methods`](#get-payment-methods); by country: [`locations`](#get-locations) |
| `GET /reports/fetch-order-by-group` | [`order-chart`](#get-order-chart); by payment method: [`payment-methods`](#get-payment-methods); by country: [`locations`](#get-locations) |
| `GET /reports/top-products-sold` | [`product-sales`](#get-product-sales) or [`fetch-top-sold-products`](#get-top-sold-products) |
| `GET /reports/fetch-top-sold-variants` | [`product-sales`](#get-product-sales) (each product row lists its variations) |
| `GET /reports/product-report` | [`product-sales`](#get-product-sales) |
| `GET /reports/product-performance` | [`product-sales`](#get-product-sales) |
| `GET /reports/customer-report` | [`customer-overview`](#get-customer-overview) |
| `GET /reports/search-repeat-customer` | No direct replacement. [`customer-insights`](#get-customer-insights) lists the top 100 customers by lifetime net sales and the repeat rates. |
| `GET /reports/refund-chart` | [`refunds-overview`](#get-refunds-overview) |
| `GET /reports/refund-data-by-group` | [`refunds-overview`](#get-refunds-overview) |
| `GET /reports/get-dashboard-summary` | No direct replacement (it counted products and coupons). For the dashboard tiles, use [`GET /dashboard/stats`](/restapi/dashboard#get-dashboard-stats). |
| `GET /reports/subscription-chart` | [`subscriptions-overview`](#get-subscriptions-overview) |
| `GET /reports/daily-signups` | [`subscriptions-overview`](#get-subscriptions-overview) (new subscriptions per period in `chart[].new`) |
| `GET /reports/retention-chart` | [`subscription-retention`](#get-subscription-retention) |
| `GET /reports/sales-growth` | [`sales-growth-chart`](#get-sales-growth-chart) (removed earlier) |

---

## Overview and Dashboard

### Get Reports Overview

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/overview`

Returns year-over-year gross and net revenue for the last 12 store months, the last 4 quarters and the top 5 billing countries, plus 24 months of net sales. The date range does not apply. The revenue series are in cents; `net_sales_months` is a decimal.

- **Permission:** `reports/view`
- **Operation page:** [Get Reports Overview](/restapi/operations/reports/get-overview)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[currency]` | string | query | No | 3-letter code. Defaults to the base currency. `__all__` applies only to `net_sales_months`; the other series read it as the base currency. |
| `params[net_sales_only]` | integer | query | No | `1` returns only `net_sales_months`. |
| `params[cached]` | integer | query | No | With `net_sales_only`, `1` lets the result come from a 10-minute cache. |

| Field | Meaning |
|-------|---------|
| `gross_revenue`, `net_revenue` | Per month: `current`, `prev` (same month a year earlier, or null) and `yoy_growth` (string percent, or null). Cents. |
| `*_quarterly` | Last 4 quarters: `current`, `prev_year`, `yy_growth`. Cents. |
| `gross_summary`, `net_summary` | 12-month `total`, `total_prev`, `yoy_growth`. Cents. |
| `top_country_net`, `top_country_gross` | Top 5 billing countries per month (`by_month`) and over the 12 months (`by_countries`). Cents. |
| `net_sales_months` | Last 24 store months of the Revenue report's net sales. Decimal. |

Gross = `total_paid`. `net_revenue` = paid − refunds − unrefunded tax; shipping and fees stay in, so it is not net sales.

#### Response

```json
{
    "data": {
        "gross_revenue": { "2025-01": { "current": 500000, "prev": 400000, "yoy_growth": "25.00" } },
        "gross_revenue_quarterly": { "Q1-2025": { "current": 1500000, "prev_year": 1200000, "yy_growth": "25.00" } },
        "net_revenue": { "2025-01": { "current": 450000, "prev": 360000, "yoy_growth": "25.00" } },
        "net_revenue_quarterly": { "Q1-2025": { "current": 1350000, "prev_year": 1080000, "yy_growth": "25.00" } },
        "gross_summary": { "total": 6000000, "total_prev": 4800000, "yoy_growth": "25.00" },
        "net_summary": { "total": 5400000, "total_prev": 4320000, "yoy_growth": "25.00" },
        "top_country_net": {
            "by_month": { "2025-01": { "US": 300000, "GB": 100000 } },
            "by_countries": { "US": 3600000, "GB": 1200000 }
        },
        "top_country_gross": { "by_month": { }, "by_countries": { } },
        "net_sales_months": [ { "group": "2025-01", "net_sales": 4100.0 } ]
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/overview?params[currency]=USD" \
  -u "username:app_password"
```

---

### Get Report Meta

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/fetch-report-meta`

Returns what the report filters need: currencies with orders in the range, order counts per currency, the base currency, the earliest order date and the store mode. Dates are store-timezone strings.

- **Permission:** `reports/view`
- **Operation page:** [Get Report Meta](/restapi/operations/reports/fetch-report-meta)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[startDate]` | string | query | No | First store day for the currency lookup. |
| `params[endDate]` | string | query | No | Last store day for the currency lookup. |

`currencies` maps each code to its sign, most orders first. With more than one currency it also holds `__all__` (all currencies converted to the base currency), and `converted_excluded_orders` counts orders that cannot convert.

#### Response

```json
{
    "currencies": { "USD": "$", "EUR": "€", "__all__": "$" },
    "currency_order_counts": { "USD": 120, "EUR": 30 },
    "default_currency": "USD",
    "base_currency": "USD",
    "converted_excluded_orders": 0,
    "min_date": "2025-01-01 00:00:00",
    "storeMode": "live",
    "first_order_date": "2024-03-15 10:20:00"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/fetch-report-meta?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Dashboard Stats

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/dashboard-stats`

Returns four order tiles for a date range and for the previous period of the same length: all orders, paid orders, paid order items and paid order value. "Paid" means the report statuses (paid, partially paid, refunded, partially refunded). The paid order value is `SUM(total_paid)` in cents, not net sales.

The admin Orders page stat bar reads this endpoint. The Dashboard page tiles come from `GET /dashboard/stats` instead.

- **Permission:** `reports/view`
- **Operation page:** [Get Dashboard Stats](/restapi/operations/reports/dashboard-stats)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[startDate]` | string | query | No | First store day. With no dates the range runs from the first order to today. |
| `params[endDate]` | string | query | No | Last store day. |
| `params[currency]` | string | query | No | 3-letter code. Defaults to the base currency. `__all__` is not supported. |

#### Response

```json
{
    "dashBoardStats": {
        "total_orders": { "title": "All Orders", "icon": "AllOrdersIcon", "current_count": 150, "compare_count": 120 },
        "paid_orders": { "title": "Paid Orders", "icon": "Money", "current_count": 140, "compare_count": 110 },
        "total_paid_order_items": { "title": "Paid Order Items", "icon": "OrderItemsIcon", "current_count": 210, "compare_count": 180 },
        "total_paid_amounts": { "title": "Order Value (Paid)", "icon": "OrderValueIcon", "current_count": 1250000, "compare_count": 1000000, "is_cents": true }
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/dashboard-stats?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Sales Growth Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/sales-growth-chart`

Returns orders and net sales per day, month or year in the range. `net_revenue` is the Revenue report's net sales, as a decimal. On-hold and failed orders are left out by default, and the range end is clamped to today.

- **Permission:** `reports/view`
- **Operation page:** [Get Sales Growth Chart](/restapi/operations/reports/sales-growth-chart)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `__all__` currency works. |
| `params[orderStatus][]` | array | query | No | Order statuses to leave out. Defaults to `on-hold` and `failed`. |

#### Response

```json
{
    "salesGrowthChart": [
        { "year": "2025", "group": "2025-01-01", "orders": 12, "net_revenue": 840.5 },
        { "year": "2025", "group": "2025-01-02", "orders": 0, "net_revenue": 0 }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/sales-growth-chart?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Country Heat Map

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/country-heat-map`

Returns the number of orders per billing country, smallest first. It counts every order with a billing address, of any status, in all currencies, over all time. The endpoint reads `params[currency]` but does not apply it. An unknown country code returns `country_code: null` and the name "Uncategorized".

- **Permission:** `reports/view`
- **Operation page:** [Get Country Heat Map](/restapi/operations/reports/country-heat-map)

#### Parameters

This endpoint takes no parameters.

#### Response

```json
{
    "countryHeatMap": [
        { "country_code": "GB", "name": "United Kingdom", "value": 20 },
        { "country_code": "US", "name": "United States (US)", "value": 85 }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/country-heat-map" \
  -u "username:app_password"
```

---

### Get Recent Orders

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/get-recent-orders`

Returns the 10 newest orders of any status, with the customer name and item count. `total_amount` is a decimal in the order's own currency.

- **Permission:** `reports/view`
- **Operation page:** [Get Recent Orders](/restapi/operations/reports/get-recent-orders)

#### Parameters

This endpoint takes no parameters.

#### Response

```json
{
    "recentOrders": [
        {
            "id": 1050,
            "customer_id": 42,
            "customer_name": "Jane Doe",
            "total_amount": "49.0000",
            "currency": "USD",
            "created_at": "2025-01-31 14:20:00",
            "order_items_count": 2
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/get-recent-orders" \
  -u "username:app_password"
```

---

### Get Recent Activities

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/get-recent-activities`

Returns the 10 newest activity log entries. You can limit them to today, yesterday or this week in the store timezone.

- **Permission:** `reports/view`
- **Operation page:** [Get Recent Activities](/restapi/operations/reports/get-recent-activities)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `groupKey` | string | query | No | `all` (default), `today`, `yesterday` or `this_week`. Top-level, not inside `params`. |

#### Response

```json
{
    "recentActivities": [
        {
            "title": "Order status updated",
            "content": "Order status changed from processing to completed",
            "created_at": "2025-01-31 14:25:00",
            "created_by": "admin",
            "module_name": "order",
            "module_id": 1050
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

## Revenue and Orders

### Get Revenue Data

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/revenue`

Returns gross sales, net revenue, net sales and the sales breakdown per day, month or year, with totals and net sales by order type. Amounts are decimal currency units (cents divided by 100).

- **Permission:** `reports/view`
- **Operation page:** [Get Revenue Data](/restapi/operations/reports/get-revenue)

`net_revenue` is paid minus refunds minus the tax the store kept (shipping and fees stay in). `net_sales` is the Revenue report's net sales: paid minus refunds minus the tax, shipping and fees the store kept. `gross_sales` = `net_sales` + `discounts` + `refunds`. `total_collected` = `net_sales` + `shipping_net` + `fees` + `taxes_net`. With a comparison, `fluctuations` holds the percent change per summary key (`null` when the previous value is 0), and each `byOrderType` row gets `previous_net_sales` and `change`.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

| Field | Meaning |
|-------|---------|
| `total_sales` / `gross_sale` | Sum of `total_paid` (per bucket / in `summary`). |
| `net_revenue` | Paid − refunds − unrefunded tax. |
| `net_sales` | Paid − refunds − tax, shipping and fees kept. |
| `refunds` | Refunded sales without tax, shipping or fees. `total_refunds` / `total_refunded_amount` is the full refunded amount. |
| `shipping_net`, `fees`, `taxes_net` | Shipping, fees and tax the store kept after refunds. |
| `byOrderType[].share` | Percent of the period's net sales. |

#### Response

```json
{
  "revenueReport": [
    {
      "year": "2025",
      "group": "2025-01",
      "total_sales": 1250.0,
      "net_revenue": 1152.0,
      "shipping_total": 50.0,
      "total_tax": 38.0,
      "total_refunds": 60.0,
      "order_count": 42,
      "refunded_orders": 2,
      "discounts": 30.0,
      "fees": 0,
      "shipping_net": 45.0,
      "taxes_net": 38.0,
      "refunds": 55.0,
      "net_sales": 1107.0,
      "gross_sales": 1192.0,
      "total_collected": 1190.0
    }
  ],
  "summary": {
    "net_revenue": 1152.0,
    "gross_sale": 1250.0,
    "total_refunded_amount": 60.0,
    "tax_total": 38.0,
    "shipping_total": 50.0,
    "order_count": 42,
    "refunded_orders": 2,
    "discounts": 30.0,
    "fees": 0,
    "shipping_net": 45.0,
    "taxes_net": 38.0,
    "refunds": 55.0,
    "net_sales": 1107.0,
    "gross_sales": 1192.0,
    "total_collected": 1190.0
  },
  "previousSummary": [],
  "fluctuations": [],
  "previousMetrics": [],
  "appliedGroupKey": "monthly",
  "compare_range": null,
  "compare_ranges": {
    "previous_period": {
      "start": "2024-12-01 00:00:00",
      "end": "2024-12-31 23:59:59"
    },
    "...": "..."
  },
  "byOrderType": [
    {
      "key": "payment",
      "label": "One-time",
      "orders": 30,
      "net_sales": 800.0,
      "average": 26.67,
      "share": 72.27
    },
    {
      "key": "renewal",
      "label": "Renewal",
      "orders": 12,
      "net_sales": 307.0,
      "average": 25.58,
      "share": 27.73
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/revenue?params[startDate]=2025-01-01&params[endDate]=2025-06-30&params[groupKey]=monthly&params[compareType]=previous_period" \
  -u "username:app_password"
```

---

### Get Order Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/order-chart`

Returns order counts, items and money per day, month or year, with totals and rates. Amounts are decimal currency units.

- **Permission:** `reports/view`
- **Operation page:** [Get Order Chart](/restapi/operations/reports/order-chart)

`average_net` uses the Revenue report's net sales; `net_revenue` is paid minus refunds minus unrefunded tax. `monthly_net`, `monthly_gross`, `monthly_orders` and `monthly_items` appear in `summary` only when the range has orders. `refund_rate` is refunded orders as a percent of orders. With a comparison, `fluctuations` holds the percent change per summary key (`null` when the previous value is 0) and `previousChartData` holds the comparison buckets.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

| Field | Meaning |
|-------|---------|
| `gross_sale` | Sum of `total_paid`. |
| `net_sales` | Revenue report net sales. |
| `average_net` | `net_sales` / `order_count`. |
| `total_item_count` | Units on the orders (only the filtered variations when `variation_ids` is set). |
| `orders_per_day` | Orders per elapsed store day. |

#### Response

```json
{
  "orderChartData": [
    {
      "group": "2025-01",
      "year": "2025",
      "gross_sale": 1250.0,
      "net_revenue": 1152.0,
      "order_count": 42,
      "total_refund": 60.0,
      "shipping_total": 50.0,
      "tax_total": 38.0,
      "average_net": 26.36,
      "average_gross": 29.76,
      "total_item_count": 50,
      "average_order_items_count": 1.19,
      "refunded_orders": 2,
      "average_order_gross": 30,
      "net_sales": 1107.0
    }
  ],
  "summary": {
    "net_revenue": 1152.0,
    "net_sales": 1107.0,
    "gross_sale": 1250.0,
    "order_count": 42,
    "total_item_count": 50,
    "average_net": 26.36,
    "average_order_items_count": 1.19,
    "average_gross": 29.76,
    "total_refund": 60.0,
    "tax_total": 38.0,
    "shipping_total": 50.0,
    "refunded_orders": 2,
    "monthly_net": 1152.0,
    "monthly_gross": 1250.0,
    "monthly_orders": 42,
    "monthly_items": 50,
    "refund_rate": 4.76,
    "orders_per_day": 1.35,
    "orders_per_month": 42
  },
  "previousSummary": [],
  "fluctuations": [],
  "compare_range": null,
  "compare_ranges": {
    "previous_period": {
      "start": "2024-12-01 00:00:00",
      "end": "2024-12-31 23:59:59"
    },
    "...": "..."
  },
  "previousChartData": []
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/order-chart?params[startDate]=2025-01-01&params[endDate]=2025-01-31&params[groupKey]=daily" \
  -u "username:app_password"
```

---

### Get Order Mix

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/order-mix`

Splits the period's orders four ways: sale type, order status, discounted orders, and physical orders by shipping status. Counts and percent shares only; no money fields.

- **Permission:** `reports/view`
- **Operation page:** [Get Order Mix](/restapi/operations/reports/order-mix)

Every split adds up to `total`. `share` is a percent of `total`, except `fulfillment.statuses[].share`, which is a percent of `fulfillment.orders` (physical orders only). Orders with no shipping status count as `unshipped`.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

#### Response

```json
{
  "total": 120,
  "types": [
    {
      "key": "payment",
      "label": "One-time",
      "orders": 80,
      "share": 66.67
    },
    {
      "key": "renewal",
      "label": "Renewal",
      "orders": 40,
      "share": 33.33
    }
  ],
  "statuses": [
    {
      "key": "completed",
      "label": "Completed",
      "orders": 100,
      "share": 83.33
    },
    {
      "key": "processing",
      "label": "Processing",
      "orders": 20,
      "share": 16.67
    }
  ],
  "discounted": {
    "orders": 25,
    "share": 20.83
  },
  "fulfillment": {
    "orders": 30,
    "statuses": [
      {
        "key": "shipped",
        "label": "Shipped",
        "orders": 20,
        "share": 66.67
      },
      {
        "key": "unshipped",
        "label": "Unshipped",
        "orders": 10,
        "share": 33.33
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/order-mix?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Failed Orders

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/failed-orders`

Returns how many orders created in the range have the `failed` payment status, and the latest 10 of them. `total_amount` is in decimal currency units.

- **Permission:** `reports/view`
- **Operation page:** [Get Failed Orders](/restapi/operations/reports/failed-orders)

The payment status filter is always `failed` here. `created_at` is the order's GMT time. In `__all__` mode `total_amount` is converted to the base currency.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

#### Response

```json
{
  "count": 12,
  "orders": [
    {
      "order_id": 1001,
      "customer_name": "Jane Doe",
      "total_amount": 49.0,
      "items": 1,
      "payment_method": "stripe",
      "created_at": "2025-01-20 10:15:00"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/failed-orders?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get New vs Returning Customers

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/fetch-new-vs-returning-customer`

Splits the period's orders by customer type: New, Returning, Renewal, Installment payment, Free order and Guest. Amounts are decimal currency units; `net_sales` is the Revenue report's net sales.

- **Permission:** `reports/view`
- **Operation page:** [Get New vs Returning Customers](/restapi/operations/reports/fetch-new-vs-returning-customer)

Each order gets one type, checked in this order: a renewal (`Installment payment` for an installment plan, else `Renewal`), `Guest` (no customer), `Free order` (nothing paid), `New` (the customer's first paid purchase), else `Returning`. `Installment payment` and `Free order` rows appear only when such orders exist. `customer_count` counts distinct customers inside one row, so a customer can appear in both `New` and `Returning`.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

#### Response

```json
{
  "newVsReturning": [
    {
      "customer_type": "New",
      "customer_count": 20,
      "order_count": 20,
      "gross_sales": 1000.0,
      "net_sales": 900.0,
      "average_gross": 50.0,
      "average_net": 45.0
    },
    {
      "customer_type": "Returning",
      "customer_count": 8,
      "order_count": 10,
      "gross_sales": 500.0,
      "net_sales": 450.0,
      "average_gross": 50.0,
      "average_net": 45.0
    },
    {
      "customer_type": "Renewal",
      "customer_count": 15,
      "order_count": 15,
      "gross_sales": 750.0,
      "net_sales": 700.0,
      "average_gross": 50.0,
      "average_net": 46.67
    },
    {
      "customer_type": "Guest",
      "customer_count": 0,
      "order_count": 0,
      "gross_sales": 0,
      "net_sales": 0,
      "average_gross": 0,
      "average_net": 0
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/fetch-new-vs-returning-customer?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Payment Methods

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/payment-methods`

Returns orders, money, refunds, failures and failing subscriptions per payment gateway, the totals, the previous period's totals and net sales by gateway over time. Amounts are decimal currency units; `net_sales` is the Revenue report's net sales.

- **Permission:** `reports/view`
- **Operation page:** [Get Payment Methods](/restapi/operations/reports/payment-methods)

A saved-card payment counts under the gateway that charged it. Disputes per gateway and sales by card brand are FluentCart Pro reports (`reports/payment-methods/disputes`, `reports/payment-methods/methods`); this endpoint removes the dispute fields from `rows` and `previous`, and keeps only `totals.dispute_rate`. `failing_subscriptions` and `mrr_at_risk` describe open-ended subscriptions failing or past due now, with no date filter. `success_rate` = orders / (orders + recorded failed charges). `previous` is `null` without a comparison.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

| Field | Meaning |
|-------|---------|
| `gross_sales` | Sum of `total_paid`. |
| `renewal_net` | Net sales of renewal orders. |
| `failed_orders` | Orders with the `failed` payment status. |
| `failed_charges`, `failed_charge_amount` | Failed charge transactions in the range (only some gateways record them). |
| `mrr_at_risk` | Monthly recurring revenue of the failing subscriptions. |
| `net_share` | Percent of all net sales. |
| `chart[].gateways` | Net sales per gateway key for the bucket. |

#### Response

```json
{
  "rows": [
    {
      "gateway": "stripe",
      "label": "Stripe",
      "orders": 40,
      "refunded_orders": 2,
      "gross_sales": 2000.0,
      "refunds": 100.0,
      "net_sales": 1800.0,
      "renewal_net": 600.0,
      "refund_rate": 5.0,
      "average_order": 50.0,
      "failed_orders": 3,
      "success_rate": 95.24,
      "failed_charges": 2,
      "failed_charge_amount": 100.0,
      "failing_subscriptions": 1,
      "mrr_at_risk": 20.0,
      "net_share": 75.0
    }
  ],
  "totals": {
    "orders": 55,
    "refunded_orders": 3,
    "gross_sales": 2650.0,
    "refunds": 120.0,
    "net_sales": 2400.0,
    "renewal_net": 800.0,
    "refund_rate": 5.45,
    "average_order": 48.18,
    "failed_orders": 4,
    "success_rate": 96.49,
    "failed_charges": 2,
    "failed_charge_amount": 100.0,
    "failing_subscriptions": 1,
    "mrr_at_risk": 20.0,
    "net_share": 100,
    "dispute_rate": 0
  },
  "previous": null,
  "chart": [
    {
      "year": "2025",
      "group": "2025-01-01",
      "gateways": {
        "paypal": 30.0,
        "stripe": 120.0
      }
    }
  ],
  "compare_ranges": {
    "previous_period": {
      "start": "2024-12-01 00:00:00",
      "end": "2024-12-31 23:59:59"
    },
    "...": "..."
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/payment-methods?params[startDate]=2025-01-01&params[endDate]=2025-01-31&params[compareType]=previous_period" \
  -u "username:app_password"
```

---

### Get Locations

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/locations`

Returns orders, customers and money by country. With FluentCart Pro it also drills down to states and cities and adds lifetime value, repeat rate and the biggest movers. Amounts are decimal currency units; `net_sales` is the Revenue report's net sales.

- **Permission:** `reports/view`
- **Operation page:** [Get Locations](/restapi/operations/reports/locations)

Without Pro, the report is always at country level (`level` is ignored) and `full` is `false`. Pro answers the `fluent_cart/report/locations` filter with the full report (`full: true`): `level`, `country` and `state` work, each row gets `average_ltv` and `repeat_rate` of the new customers it won, and `movers` lists the three biggest gains and drops in net sales against the comparison period.

An order's location is its latest address of the chosen type (shipping falls back to billing), else a renewal's parent order billing address, else the customer record's country, else `__unknown__`. In a row, a customer counts once: new wins over returning (`returning_customers` leaves out customers who are new there). Renewal orders count in `renewal_orders`, not as new or returning. With `variation_ids`, the money fields are the picked variations' share of each order.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[level]` | string | query | No | Pro only. `country` (default), `state` or `city`. Core always answers at country level. |
| `params[country]` | string | query | No | Pro only. Country code to drill into. Needed for `state` and `city`. |
| `params[state]` | string | query | No | Pro only. State for `city` level. `__unknown__` selects orders with no state. |
| `params[address_type]` | string | query | No | `billing` (default) or `shipping`. Shipping falls back to billing. |
| `params[with_summary]` | boolean | query | No | At `state` or `city` level, also return `summary` and `previous`. Country level always returns them. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

| Field | Meaning |
|-------|---------|
| `rows[].key` | Country code (upper case), state or city name; `__unknown__` for no location. |
| `rows[].net_change` | Percent change of net sales against the comparison period; `null` without one or when the previous net is 0. |
| `rows[].via_parent`, `via_customer` | Orders located from the parent order or the customer record. |
| `outsized` | At state level, a state with at least 50% of orders and 3x the next one (often a checkout default); else `null`. |
| `summary` | Store-wide cards. `international_*` are `null` when the store country is not set. |
| `movers` | Pro with a comparison only; else `null`. |

#### Response

```json
{
  "level": "country",
  "rows": [
    {
      "key": "US",
      "unknown": false,
      "orders": 40,
      "customers": 30,
      "new_customers": 18,
      "returning_customers": 7,
      "new_orders": 18,
      "returning_orders": 9,
      "renewal_orders": 13,
      "gross_sales": 2000.0,
      "refunds": 100.0,
      "net_sales": 1800.0,
      "average_net_order": 45.0,
      "refund_rate": 5.0,
      "via_parent": 2,
      "via_customer": 1,
      "previous_net": null,
      "net_change": null,
      "net_share": 75.0
    }
  ],
  "totals": {
    "orders": 55,
    "customers": 42,
    "new_customers": 25,
    "returning_customers": 9,
    "new_orders": 25,
    "returning_orders": 12,
    "renewal_orders": 18,
    "gross_sales": 2650.0,
    "refunds": 120.0,
    "net_sales": 2400.0,
    "average_net_order": 43.64,
    "refund_rate": 5.45,
    "via_parent": 3,
    "via_customer": 1
  },
  "sources": {
    "parent_order": 3,
    "customer_record": 1
  },
  "outsized": null,
  "summary": {
    "store_country": "US",
    "net_sales": 2400.0,
    "orders": 55,
    "international_net": 600.0,
    "international_share": 25.0,
    "international_new_customers": 7,
    "countries": 6,
    "top_country": "US",
    "top_share": 75.0
  },
  "previous": null,
  "movers": null,
  "full": false,
  "compare_ranges": {
    "previous_period": {
      "start": "2024-12-01 00:00:00",
      "end": "2024-12-31 23:59:59"
    },
    "...": "..."
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/locations?params[startDate]=2025-01-01&params[endDate]=2025-01-31&params[level]=state&params[country]=US" \
  -u "username:app_password"
```

---

## Order Patterns

These endpoints moved from core to FluentCart Pro. Without Pro they return `404`.

### Get Order Value Distribution

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/order-value-distribution`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Counts the orders in the range by order total, in steps of 100 in the report currency. A bucket key such as `100-200` means a total above 100.00 and up to 200.00 (`total_amount`, cents 10001-20000). Every value is an order count.

- **Permission:** `reports/view`
- **Operation page:** [Get Order Value Distribution](/restapi/operations/reports/order-value-distribution)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[orderTypes][]` | array | query | No | Sale types to include: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. Default: all. |

`params[currency]=__all__` works (orders are converted to the base currency first).

#### Response

```json
{
    "data": {
        "0-100": 42,
        "100-200": 18,
        "200-300": 7,
        "300-400": 3,
        "400-500": 1,
        "500-600": 0,
        "600-700": 0,
        "700-800": 0,
        "800-900": 0,
        "900-1000": 0,
        "1000+": 2
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/order-value-distribution?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Report by Day and Hour

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/fetch-report-by-day-and-hour`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Groups the orders in the range by weekday and hour of the store's local time. `gross_sale` is the sum of `total_paid` in decimal currency units (not cents), before refunds.

- **Permission:** `reports/view`
- **Operation page:** [Get Report by Day and Hour](/restapi/operations/reports/fetch-report-by-day-and-hour)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[orderTypes][]` | array | query | No | Sale types to include: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. Default: all. |

`params[currency]=__all__` works.

#### Response

| Field | Meaning |
|-------|---------|
| `orderByDayAndHour` | 24 rows, one per hour. `hour` is a label in the site's time format (`3 PM` or `15`); each weekday key holds an order count. |
| `grossSaleByDay` | 7 rows, Sunday first. `day` is 1 (Sunday) to 7 (Saturday); it stays `0` for a weekday with no orders. |
| `grossSaleByHour` | 24 rows: `hour` label, `gross_sale` (decimal), `order_count`. |

```json
{
    "orderByDayAndHour": [
        {
            "hour": "12 AM",
            "Sunday": 0,
            "Monday": 2,
            "Tuesday": 1,
            "Wednesday": 0,
            "Thursday": 3,
            "Friday": 1,
            "Saturday": 0
        }
    ],
    "grossSaleByDay": [
        {
            "day": 1,
            "gross_sale": 450.0,
            "order_count": 5
        },
        {
            "day": 0,
            "gross_sale": 0,
            "order_count": 0
        }
    ],
    "grossSaleByHour": [
        {
            "hour": "12 AM",
            "gross_sale": 320.0,
            "order_count": 7
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/fetch-report-by-day-and-hour?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Item Count Distribution

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/item-count-distribution`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Counts the orders in the range by the number of items in each order (the sum of line quantities). No money fields.

- **Permission:** `reports/view`
- **Operation page:** [Get Item Count Distribution](/restapi/operations/reports/item-count-distribution)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[orderTypes][]` | array | query | No | Sale types to include: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. Default: all. |

`params[currency]=__all__` works. With `params[variation_ids][]`, only the lines of those variations are counted.

#### Response

```json
{
    "data": [
        {
            "order_count": 120,
            "item_count": 1
        },
        {
            "order_count": 35,
            "item_count": 2
        },
        {
            "order_count": 6,
            "item_count": 3
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/item-count-distribution?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Order Completion Time

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/order-completion-time`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Counts the orders in the range by the whole hours between `created_at` and `completed_at`. Orders with no `completed_at` are left out. No money fields.

- **Permission:** `reports/view`
- **Operation page:** [Get Order Completion Time](/restapi/operations/reports/order-completion-time)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[orderTypes][]` | array | query | No | Sale types to include: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. Default: all. |

`params[currency]=__all__` works.

#### Response

```json
{
    "data": [
        {
            "hour": 0,
            "orders": 140
        },
        {
            "hour": 1,
            "orders": 12
        },
        {
            "hour": 24,
            "orders": 3
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/order-completion-time?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Weeks Between Refund

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/weeks-between-refund`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Counts orders by the weeks from the order to its first refund. The range applies to the date of the first refund, not the order date. A refund on day 0 to 7 is week 1. No money fields.

- **Permission:** `reports/view`
- **Operation page:** [Get Weeks Between Refund](/restapi/operations/reports/weeks-between-refund)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[orderTypes][]` | array | query | No | Sale types to include: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. Default: all. |

`params[currency]=__all__` works. The order filters (currency, mode, sale type, variations) still apply to the refunded orders.

#### Response

```json
{
    "data": [
        {
            "occurrence": 8,
            "weekBetween": 1
        },
        {
            "occurrence": 3,
            "weekBetween": 2
        },
        {
            "occurrence": 1,
            "weekBetween": 6
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/weeks-between-refund?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

## Payment Methods

### Get Payment Method Disputes

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/payment-methods/disputes`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Returns disputes per payment gateway, with totals and the previous period's totals. `dispute_amount` is in decimal currency units (not cents). `dispute_rate` is a percent.

`disputed_orders` counts orders placed in the range whose charge was disputed (failed orders included). `disputes_lost` and `dispute_amount` count lost-dispute transactions dated in the range. `dispute_rate` = disputed orders / (orders + failed disputed orders) x 100. A saved-card payment counts under the gateway that charged it.

- **Permission:** `reports/view`
- **Operation page:** [Get Payment Method Disputes](/restapi/operations/reports/payment-methods-disputes)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[orderTypes][]` | array | query | No | Sale types to include: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. Default: all. |

`params[currency]=__all__` works. `previous` is `null` unless `params[compareType]` and `params[compareDate]` are sent.

#### Response

| Field | Meaning |
|-------|---------|
| `orders` | Report orders (paid, partially paid, refunded, partially refunded) placed in the range. |
| `disputed_orders` | Orders placed in the range whose charge was disputed, failed orders included. |
| `dispute_rate` | `disputed_orders` / (`orders` + failed disputed orders) x 100. |
| `disputes_lost` | Lost-dispute transactions dated in the range. |
| `dispute_amount` | Sum of those lost disputes, decimal. |

```json
{
    "rows": [
        {
            "gateway": "stripe",
            "label": "Stripe",
            "orders": 400,
            "disputed_orders": 4,
            "dispute_rate": 1.0,
            "disputes_lost": 1,
            "dispute_amount": 49.0
        }
    ],
    "totals": {
        "orders": 520,
        "disputed_orders": 4,
        "dispute_rate": 0.77,
        "disputes_lost": 1,
        "dispute_amount": 49.0
    },
    "previous": {
        "orders": 480,
        "disputed_orders": 2,
        "dispute_rate": 0.42,
        "disputes_lost": 0,
        "dispute_amount": 0.0
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/payment-methods/disputes?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Payment Method Types

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/payment-methods/methods`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Returns net sales by the card brand or payment method type that each order's charge recorded (Visa, PayPal, SEPA Direct Debit, ...). `net_sales` is in decimal currency units (not cents) and uses the Revenue report's net sales.

Orders with no recognised brand or method are left out of `rows`. `orders` is the number of orders that had one, and `coverage` is that number as a percent of all report orders in the range. `net_share` is a percent of the net sales in `rows`.

- **Permission:** `reports/view`
- **Operation page:** [Get Payment Method Types](/restapi/operations/reports/payment-methods-methods)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[orderTypes][]` | array | query | No | Sale types to include: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. Default: all. |

`params[currency]=__all__` works.

#### Response

| Field | Meaning |
|-------|---------|
| `rows[].method` | Brand or method key, e.g. `visa`, `paypal`, `card` (card, brand not recorded). |
| `rows[].net_sales` | Net sales, decimal. |
| `rows[].net_share` | Percent of the net sales in `rows`. |
| `orders` | Orders with a recorded brand or method. |
| `coverage` | `orders` as a percent of all report orders in the range. |

```json
{
    "rows": [
        {
            "method": "visa",
            "label": "Visa",
            "orders": 210,
            "net_share": 62.5,
            "net_sales": 12500.0
        },
        {
            "method": "paypal",
            "label": "PayPal",
            "orders": 90,
            "net_share": 37.5,
            "net_sales": 7500.0
        }
    ],
    "orders": 300,
    "coverage": 75.0
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/payment-methods/methods?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

## Refunds

### Get Refunds Overview

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/refunds-overview`

Returns the refunds made in the period: totals, full vs partial, a chart, splits by sale type and payment method, reasons and refund rates. Amounts are decimal currency units.

- **Permission:** `reports/view`
- **Operation page:** [Get Refunds Overview](/restapi/operations/reports/refunds-overview)

Money out counts on the refund date, on orders of any date. Refund rates divide by the orders placed in the period: `refund_rate_cohort` (period orders refunded at all), `refund_rate_orders` (orders refunded in the period / orders placed), `refund_rate_amount` (refunded amount / paid amount). A rate is `null` when no orders were placed. `median_days` counts store calendar days from order to its first refund. `by_product` (the 10 most refunded products, by order date) is a FluentCart Pro report: it appears only when the `fluent_cart/report/refund_products` filter returns true. With a comparison, `fluctuations` gives rates as a point difference and other keys as a percent change (`null` when the previous value is 0).

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

| Field | Meaning |
|-------|---------|
| `summary.refunded_amount` | Sum of refund transactions in the period. |
| `chart[].refund_rate` | Orders refunded in the bucket / orders placed in it; `null` when none were placed. |
| `reasons.coverage` | Percent of refunds that have a reason; `top` is the 5 most common. |
| `by_product[].sold` | Line totals sold, with tax added on top of the price (Pro). |

#### Response

```json
{
  "summary": {
    "refunded_amount": 300.0,
    "refunds": 6,
    "refunded_orders": 5,
    "average_refund": 50.0,
    "full": {
      "count": 3,
      "amount": 220.0
    },
    "partial": {
      "count": 2,
      "amount": 80.0
    },
    "refund_rate_cohort": 4.0,
    "refund_rate_orders": 5.0,
    "refund_rate_amount": 3.5,
    "median_days": 4.0
  },
  "chart": [
    {
      "year": "2025",
      "group": "2025-01-01",
      "amount": 50.0,
      "count": 1,
      "refunded_orders": 1,
      "orders": 4,
      "refund_rate": 25.0
    }
  ],
  "by_sale_type": [
    {
      "key": "payment",
      "label": "One-time",
      "amount": 200.0,
      "refunds": 4
    }
  ],
  "by_payment_method": [
    {
      "key": "stripe",
      "label": "stripe",
      "amount": 250.0,
      "refunds": 5
    }
  ],
  "by_product": [
    {
      "variation_id": 12,
      "product": "Pro Plan",
      "variation": "Yearly",
      "sold": 1000.0,
      "refunded": 100.0,
      "refunded_orders": 2,
      "refund_rate": 10.0
    }
  ],
  "reasons": {
    "coverage": 50.0,
    "top": [
      {
        "reason": "Not needed",
        "count": 2
      }
    ]
  },
  "previousSummary": null,
  "previousChart": [],
  "fluctuations": [],
  "compare_range": null,
  "compare_ranges": {
    "previous_period": {
      "start": "2024-12-01 00:00:00",
      "end": "2024-12-31 23:59:59"
    },
    "...": "..."
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/refunds-overview?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

## Products

### Get Product Sales

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/product-sales`

Returns one row per product with its variations, the totals and a chart. Each order's payment, refunds and net sales are shared across its lines by line amount. Amounts are integers in cents; `net` is the Revenue report's net sales.

- **Permission:** `reports/view`
- **Operation page:** [Get Product Sales](/restapi/operations/reports/product-sales)

`net` splits into `new_net` (non-renewal orders), `renewal_net` and `installment_net`. `units` leaves out signup-fee and fee lines. A $0 order counts as an order; `customers` and `new_customers` count paid orders only. `refund_rate` is `refunds` / `gross` as a percent. With a comparison, `previous` holds the comparison totals and each product gets `previous_net`; else `previous` and `previous_net` are `null`. Lines with no variation (fees, custom items) count in `summary` only.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

#### Response

```json
{
  "summary": {
    "gross": 250000,
    "refunds": 10000,
    "net": 220000,
    "new_net": 150000,
    "renewal_net": 60000,
    "installment_net": 10000,
    "units": 120,
    "orders": 100,
    "customers": 80,
    "new_customers": 50,
    "refund_rate": 4.0,
    "average_order": 2200
  },
  "previous": null,
  "products": [
    {
      "product_id": 10,
      "product_title": "Pro Plan",
      "orders": 60,
      "customers": 50,
      "new_customers": 30,
      "variations": [
        {
          "variation_id": 12,
          "variation_title": "Yearly",
          "orders": 60,
          "gross": 150000,
          "refunds": 5000,
          "net": 135000,
          "new_net": 90000,
          "renewal_net": 45000,
          "installment_net": 0,
          "units": 60,
          "customers": 50,
          "new_customers": 30,
          "refund_rate": 3.3
        }
      ],
      "gross": 150000,
      "refunds": 5000,
      "net": 135000,
      "new_net": 90000,
      "renewal_net": 45000,
      "installment_net": 0,
      "units": 60,
      "refund_rate": 3.3,
      "previous_net": null
    }
  ],
  "chart": [
    {
      "year": "2025",
      "group": "2025-01-01",
      "units": 4,
      "new_net": 5000,
      "renewal_net": 2000,
      "installment_net": 0
    }
  ],
  "compare_ranges": {
    "previous_period": {
      "start": "2024-12-01 00:00:00",
      "end": "2024-12-31 23:59:59"
    },
    "...": "..."
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/product-sales?params[startDate]=2025-01-01&params[endDate]=2025-01-31&params[compareType]=previous_period" \
  -u "username:app_password"
```

---

### Get Top Sold Products

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/fetch-top-sold-products`

Returns the 20 products with the most units sold in the range. `total_amount` is in decimal currency units: the line totals after order-level discounts, before refunds.

- **Permission:** `reports/view`
- **Operation page:** [Get Top Sold Products](/restapi/operations/reports/fetch-top-sold-products)

With `variation_ids`, only the lines of those variations count (other lines on the same order stay out). `media` is the product thumbnail URL or `null`. `product_name` is the title from the latest order line.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

#### Response

```json
{
  "topSoldProducts": [
    {
      "product_id": 10,
      "product_name": "Pro Plan",
      "quantity_sold": 60,
      "total_amount": 1500.0,
      "media": "https://example.com/wp-content/uploads/pro-plan.png"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/fetch-top-sold-products?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Product Detail

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/product-detail`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Returns the detail of one product: its paid orders in the range, the products bought in the same orders, and its subscriptions. Subscription `mrr` values are in decimal currency units (not cents).

Orders count only paid orders (`total_paid` > 0) that are not renewals. `bought_together` lists at most 5 products; `share` is the percent of this product's orders that also hold the other product. `subscriptions` covers every variant of the product: live count and MRR now, and renewals paid and lost in the range. It is `null` when no variant or subscription of the product is found.

- **Permission:** `reports/view`
- **Operation page:** [Get Product Detail](/restapi/operations/reports/product-detail)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product_id` | integer | query | Yes | The product (post) ID. Top-level, not inside `params`. |
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[orderTypes][]` | array | query | No | Sale types to include: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. Default: all. |

`params[currency]=__all__` works. `params[variation_ids][]` limits the product's variants; when empty, all of its variants count.

#### Response

```json
{
    "orders": 120,
    "bought_together": [
        {
            "product_id": 55,
            "product_title": "Add-on Pack",
            "orders": 30,
            "share": 25.0
        }
    ],
    "subscriptions": {
        "subscriptions": 40,
        "mrr": 1200.0,
        "canceling": {
            "count": 3,
            "mrr": 90.0
        },
        "failing": {
            "count": 2,
            "mrr": 60.0
        },
        "renewals_paid": 25,
        "renewals_lost": 5,
        "renewal_rate": 83.3
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/product-detail?product_id=42&params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Product Comparison

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/product-comparison`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Compares up to 6 products or variations side by side: a summary, a chart per period, subscriptions and customer overlap. Summary and chart money fields are in cents; subscription `mrr` values are in decimal currency units.

Each line takes its share of the order's net sales (the Revenue report's net sales). `new_net` comes from non-renewal orders; `renewal_net` and `installment_net` split renewal orders. A $0 order counts as an order, but `customers` and `new_customers` count paid customers only. `overlap` pairs use item indexes: of `from`'s customers in the range, `both` have ever bought `to`, and `to_first` bought `to` first.

- **Permission:** `reports/view`
- **Operation page:** [Get Product Comparison](/restapi/operations/reports/product-comparison)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `items[]` | array | query | Yes | Item keys, top-level: `p:<product_id>` (whole product) or `v:<variation_id>` (one variation). At most 6; repeats and other values are dropped. |
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[orderTypes][]` | array | query | No | Sale types to include: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. Default: all. |

`params[currency]=__all__` works. `previous` is `null` unless a compare period is sent.

#### Response

| Field | Meaning |
|-------|---------|
| `summary` | Cents: `gross`, `refunds`, `net`, `new_net`, `renewal_net`, `installment_net`, `average_order` (net / orders), `average_price` (net / units). Counts: `units`, `orders`, `customers`, `new_customers`. `refund_rate`: refunds / gross x 100. |
| `chart[]` | One point per bucket: `group`, `net`, `units`, `orders`, `new_customers`, `new_net`, `renewal_net`, `installment_net` (cents). |
| `subscriptions` | Live `subscriptions`, `mrr` (decimal), `canceling` and `failing` (`count`, `mrr`), `renewals_paid`, `renewals_lost`, `renewal_rate`. |
| `overlap[]` | `from`, `to` (item indexes), `customers`, `both`, `to_first`. |
| `compare_ranges` | Start and end of each compare type for this range, store time. |

```json
{
    "items": [
        {
            "key": "p:42",
            "type": "product",
            "id": 42,
            "product_id": 42,
            "title": "Pro Plugin",
            "subtitle": "",
            "summary": {
                "gross": 500000,
                "refunds": 20000,
                "net": 450000,
                "new_net": 300000,
                "renewal_net": 150000,
                "installment_net": 0,
                "units": 100,
                "orders": 95,
                "customers": 90,
                "new_customers": 60,
                "refund_rate": 4.0,
                "average_order": 4737,
                "average_price": 4500
            },
            "previous": null,
            "chart": [
                {
                    "group": "2025-01",
                    "net": 450000,
                    "units": 100,
                    "orders": 95,
                    "new_customers": 60,
                    "new_net": 300000,
                    "renewal_net": 150000,
                    "installment_net": 0
                }
            ],
            "subscriptions": {
                "subscriptions": 40,
                "mrr": 1200.0,
                "canceling": {
                    "count": 3,
                    "mrr": 90.0
                },
                "failing": {
                    "count": 2,
                    "mrr": 60.0
                },
                "renewals_paid": 25,
                "renewals_lost": 5,
                "renewal_rate": 83.3
            }
        }
    ],
    "buckets": [
        "2025-01"
    ],
    "group_key": "monthly",
    "item_limit": 6,
    "overlap": [
        {
            "from": 0,
            "to": 1,
            "customers": 90,
            "both": 12,
            "to_first": 4
        }
    ],
    "compare_ranges": {
        "previous_period": {
            "start": "2024-12-01 00:00:00",
            "end": "2024-12-31 23:59:59"
        },
        "previous_month": {
            "start": "2024-12-01 00:00:00",
            "end": "2024-12-31 23:59:59"
        },
        "previous_quarter": {
            "start": "2024-10-01 00:00:00",
            "end": "2024-10-31 23:59:59"
        },
        "previous_year": {
            "start": "2024-01-01 00:00:00",
            "end": "2024-01-31 23:59:59"
        }
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/product-comparison?items[]=p:42&items[]=v:108&params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Product Comparison Since Launch

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/product-comparison-launch`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

For each compared item, returns net sales and units per store month from its launch month. `net` is in cents and uses the Revenue report's net sales. The date range is ignored.

The launch month is the first of three months in a row with net sales; a younger item launches with its first month with net sales. Months run to the item's last month with a sale, at most 60. `launched_at` and `months` are empty when the item has no paid sale.

- **Permission:** `reports/view`
- **Operation page:** [Get Product Comparison Since Launch](/restapi/operations/reports/product-comparison-launch)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `items[]` | array | query | Yes | Item keys, top-level: `p:<product_id>` or `v:<variation_id>`. At most 6. |
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[orderTypes][]` | array | query | No | Sale types to include: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. Default: all. |

The dates, `rangeKey` and `variation_ids` are ignored: each item reads from its first sale to now. `params[currency]=__all__` works.

#### Response

```json
{
    "items": [
        {
            "key": "p:42",
            "type": "product",
            "id": 42,
            "product_id": 42,
            "title": "Pro Plugin",
            "subtitle": "",
            "launched_at": "2024-03-01 00:00:00",
            "months": [
                {
                    "month": "2024-03",
                    "net": 120000,
                    "units": 30
                },
                {
                    "month": "2024-04",
                    "net": 95000,
                    "units": 24
                }
            ]
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/product-comparison-launch?items[]=p:42&items[]=v:108" \
  -u "username:app_password"
```

---

## Customers

### Get Customer Overview

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/customer-overview`

Returns the customers who paid in the period, split into new, returning and renewing, with their net sales, the repeat purchase rate, average lifetime value and a chart. Amounts are integers in cents; net figures are the Revenue report's net sales.

- **Permission:** `reports/view`
- **Operation page:** [Get Customer Overview](/restapi/operations/reports/customer-overview)

Only orders with a customer and a paid amount above 0 count. Each customer gets one kind: new (first purchase in the range) before returning (bought again, not a renewal) before renewing (renewals only). `repeat_rate` is the share with two or more purchases (renewals are not purchases) and `average_ltv` the average lifetime net, both over each customer's history up to the range end. `previous` (comparison period) has the same keys without `repeat_rate` and `average_ltv`; it is `null` without a comparison.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |

#### Response

```json
{
  "summary": {
    "customers": 80,
    "new_customers": 50,
    "returning_customers": 10,
    "renewing_customers": 20,
    "new_net": 150000,
    "returning_net": 30000,
    "renewal_net": 40000,
    "net": 220000,
    "repeat_rate": 22.5,
    "average_ltv": 4500
  },
  "previous": null,
  "chart": [
    {
      "year": "2025",
      "group": "2025-01-01",
      "new_customers": 2,
      "returning_customers": 1,
      "renewing_customers": 1,
      "new_net": 6000,
      "returning_net": 2000,
      "renewal_net": 1500
    }
  ],
  "compare_ranges": {
    "previous_period": {
      "start": "2024-12-01 00:00:00",
      "end": "2024-12-31 23:59:59"
    },
    "...": "..."
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/customer-overview?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Customer Insights

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/customer-insights`

Returns repeat rates, lifetime value and the top 100 customers by lifetime net, for customers with an order in the range. Amounts are decimal currency units; net figures are the Revenue report's net sales.

- **Permission:** `reports/view`
- **Operation page:** [Get Customer Insights](/restapi/operations/reports/customer-insights)

A customer's history is every order with a report payment status (paid, partially paid, refunded, partially refunded) up to the range end, in the report currency. `repeat_any` counts customers with two or more orders of any type; `repeat_new` counts two or more purchases (one-time or new subscription). `range_net` is the net of orders from the range start. This endpoint reads only the date range and currency: `filterMode`, `variation_ids` and comparison params have no effect.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). Only the date range and currency apply. `params[currency]=__all__` works. |

#### Response

```json
{
  "summary": {
    "customers": 80,
    "repeat_any": 30,
    "repeat_any_rate": 37.5,
    "repeat_new": 12,
    "repeat_new_rate": 15.0,
    "lifetime_net": 6000.0,
    "average_ltv": 75.0,
    "range_net": 2200.0,
    "average_range_net": 27.5
  },
  "top_customers": [
    {
      "customer_id": 7,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "orders": 6,
      "renewals": 4,
      "lifetime_net": 400.0,
      "range_net": 50.0,
      "first_order_at": "2023-03-01 09:00:00",
      "last_order_at": "2025-01-15 12:00:00"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/customer-insights?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Customer Value

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/customer-value`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Returns customer lifetime value by first-purchase month, value by first product, and revenue concentration. Amounts are in cents and use the Revenue report's net sales. Only paid orders (`total_paid` > 0) with a customer count.

`cohorts` covers the 12 months ending with the range's last month; `values[n]` is the average cumulative net per customer after month n (at most 24 months). A customer is gained in a month when their first non-renewal paid order is there, with no earlier paid purchase in any currency. `first_products` covers customers gained in the range; `repeat_rate` is the percent who made another non-renewal purchase. `concentration.period` is the percent of net sales from the top 1, 5, 10, 20 and 50 percent of customers in the range; customers with net 0 or less are left out. `concentration.lifetime` is `null` unless `span=lifetime` is sent.

- **Permission:** `reports/view`
- **Operation page:** [Get Customer Value](/restapi/operations/reports/customer-value)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `span` | string | query | No | Top-level. `lifetime` returns only `{ "concentration": { "lifetime": [...] } }`, read over all time. |
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |

`params[currency]=__all__` works. `params[filterMode]`, `params[variation_ids][]` and `params[orderTypes]` are not used.

#### Response

| Field | Meaning |
|-------|---------|
| `cohorts[]` | `cohort` (Y-m), `customers`, `values[]` (average cumulative net per customer, cents). |
| `first_products[]` | `product_id`, `product_title`, `customers`, `average_value` (cents), `repeat_rate` (percent). |
| `concentration.period[]` | `top` (percent tier), `customers` in the tier, `share` (percent of net sales). |

```json
{
    "cohorts": [
        {
            "cohort": "2024-02",
            "customers": 40,
            "values": [
                5000,
                6200,
                7100
            ]
        }
    ],
    "first_products": [
        {
            "product_id": 42,
            "product_title": "Pro Plugin",
            "customers": 25,
            "average_value": 8900,
            "repeat_rate": 32.0
        }
    ],
    "concentration": {
        "period": [
            {
                "top": 1,
                "customers": 1,
                "share": 12.5
            },
            {
                "top": 5,
                "customers": 3,
                "share": 30.0
            },
            {
                "top": 10,
                "customers": 5,
                "share": 42.0
            },
            {
                "top": 20,
                "customers": 10,
                "share": 60.0
            },
            {
                "top": 50,
                "customers": 25,
                "share": 85.0
            }
        ],
        "lifetime": null
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/customer-value?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Customer Repeat Purchases

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/customer-repeat`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Returns how many purchases and orders each customer made, and the time to a second purchase. No money fields. Only paid orders (`total_paid` > 0) with a customer count.

`purchases` and `orders` cover customers who paid in the range, over their history up to the range end. Purchases leave out renewals, so a customer who paid only renewals is in bucket `0`; `orders` include renewals. `second_purchase` covers customers gained in the 12 months ending with the range's last month: `repeaters` made another non-renewal purchase, and `median_days` is the median days to it.

- **Permission:** `reports/view`
- **Operation page:** [Get Customer Repeat Purchases](/restapi/operations/reports/customer-repeat)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |

`params[currency]=__all__` works. `params[filterMode]` and `params[variation_ids][]` pick the customers who paid in the range; their history is not filtered by them.

#### Response

```json
{
    "purchases": [
        {
            "bucket": "0",
            "customers": 2
        },
        {
            "bucket": "1",
            "customers": 80
        },
        {
            "bucket": "2",
            "customers": 15
        },
        {
            "bucket": "3",
            "customers": 4
        },
        {
            "bucket": "4",
            "customers": 1
        },
        {
            "bucket": "5+",
            "customers": 1
        }
    ],
    "orders": [
        {
            "bucket": "1",
            "customers": 70
        },
        {
            "bucket": "2",
            "customers": 20
        },
        {
            "bucket": "3",
            "customers": 7
        },
        {
            "bucket": "4",
            "customers": 3
        },
        {
            "bucket": "5+",
            "customers": 3
        }
    ],
    "second_purchase": {
        "customers": 500,
        "repeaters": 90,
        "repeat_rate": 18.0,
        "median_days": 45,
        "buckets": [
            {
                "bucket": "0-7",
                "customers": 10
            },
            {
                "bucket": "8-30",
                "customers": 25
            },
            {
                "bucket": "31-90",
                "customers": 30
            },
            {
                "bucket": "91-180",
                "customers": 15
            },
            {
                "bucket": "181-365",
                "customers": 8
            },
            {
                "bucket": "365+",
                "customers": 2
            }
        ]
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/customer-repeat?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Customer Segments

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/customer-segments`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Places every customer with a paid order in the report currency into one RFM segment, as of now. Amounts are in cents and use the Revenue report's net sales. The date range is ignored.

Recency (days since the last order) and money (lifetime net) score 1-5 by the store's own quintiles (`cuts`, read from at most 20,000 customers). Frequency scores by order count: 1, 2, 3, 4-5, 6+. Segments, in order: `champions`, `loyal`, `new`, `promising`, `at_risk`, `cant_lose`, `hibernating`. Pass `cuts` and `as_of` to [Get Customer Segment Customers](/restapi/operations/reports/customer-segment-customers) so the export reads the same segments.

- **Permission:** `reports/view`
- **Operation page:** [Get Customer Segments](/restapi/operations/reports/customer-segments)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |

Only `params[currency]` is used (`__all__` works). Dates, `filterMode` and `variation_ids` are ignored.

#### Response

| Field | Meaning |
|-------|---------|
| `net` | Lifetime net sales of all scored customers, cents. |
| `segments[]` | `key`, `customers`, `net` (cents), `share` (percent of `net`), `average_orders`, `average_days` (since last order), `average_net` (cents). |
| `cuts` | Quintile cut points: `days` and `net` (cents), four integers each. |
| `as_of` | UTC time the segments were read at. |

```json
{
    "customers": 1000,
    "net": 9000000,
    "segments": [
        {
            "key": "champions",
            "customers": 50,
            "net": 2500000,
            "share": 27.8,
            "average_orders": 6.2,
            "average_days": 20,
            "average_net": 50000
        }
    ],
    "cuts": {
        "days": [
            30,
            90,
            180,
            365
        ],
        "net": [
            2000,
            5000,
            10000,
            25000
        ]
    },
    "as_of": "2025-02-01 10:00:00"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/customer-segments?params[currency]=USD" \
  -u "username:app_password"
```

---

### Get Customer Segment Customers

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/customer-segment-customers`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Lists the customers of one RFM segment for a CSV export, highest lifetime net first. `net` is in cents and uses the Revenue report's net sales.

Also needs the `customers/export` permission; without it the route returns 403. An unknown `segment` returns `{"total": 0, "data": []}`.

- **Permission:** `reports/view` and `customers/export`
- **Operation page:** [Get Customer Segment Customers](/restapi/operations/reports/customer-segment-customers)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `segment` | string | query | Yes | Top-level. One of `champions`, `loyal`, `new`, `promising`, `at_risk`, `cant_lose`, `hibernating`. |
| `page` | integer | query | No | Top-level. Page number. Default `1`. |
| `per_page` | integer | query | No | Top-level. Rows per page, 1-1000. Default `1000`. |
| `cuts[days][]`, `cuts[net][]` | array | query | No | Top-level. The four cut points of each from Get Customer Segments. Default: read again. |
| `as_of` | string | query | No | Top-level. UTC `Y-m-d H:i:s` from Get Customer Segments. Default: now. |
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |

Only `params[currency]` of the standard params is used (`__all__` works).

#### Response

```json
{
    "total": 50,
    "data": [
        {
            "customer_id": 7,
            "name": "Jane Doe",
            "email": "jane@example.com",
            "orders": 6,
            "net": 60000,
            "last_order": "2025-01-20 14:00:00"
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/customer-segment-customers?segment=champions&page=1&per_page=500&params[currency]=USD" \
  -u "username:app_password"
```

---

## Coupons

### Get Coupons

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/coupons`

Returns one row per coupon used in the range with orders, customers, sales, discount and refunds, plus totals and the discount given without a coupon row. Amounts are decimal currency units; `net_sales` is the Revenue report's net sales.

- **Permission:** `reports/view`
- **Operation page:** [Get Coupons](/restapi/operations/reports/coupons)

An order with several coupons shares its money by each coupon's discount. A renamed coupon stays one row under its current code; `used_as` lists the other codes it was used under. A deleted coupon keeps its rows under its code (`coupon_id` `null`). Rows sort by orders. `no_code` covers orders with a coupon discount in the header but no coupon row (for example imported renewals).

Without FluentCart Pro the rows and totals leave out `won_ltv`, `first_order_net`, `later_net`, `lifetime_net` and `refund_rate`. Pro adds them through the `fluent_cart/report/coupon_quality` filter.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

| Field | Meaning |
|-------|---------|
| `discount_rate` | Discount as a percent of gross + discount. |
| `first_order_net` | Pro. Net sales of first orders (one-time or new subscription) with the coupon. |
| `later_net` | Pro. Net sales of those orders' renewals, any date. |
| `won_ltv` | Pro. Average lifetime net to date of the new customers the coupon won. |

#### Response

```json
{
  "rows": [
    {
      "coupon_key": "3",
      "coupon_id": 3,
      "code": "SAVE10",
      "used_as": [],
      "title": "Save 10%",
      "orders": 20,
      "customers": 18,
      "new_orders": 12,
      "returning_orders": 8,
      "guest_orders": 0,
      "gross_sales": 900.0,
      "discount": 100.0,
      "refunds": 30.0,
      "net_sales": 820.0,
      "first_order_net": 820.0,
      "later_net": 300.0,
      "lifetime_net": 1120.0,
      "discount_rate": 10.0,
      "refund_rate": 5.0,
      "won_ltv": 95.0,
      "average_order": 45.0
    }
  ],
  "totals": {
    "orders": 25,
    "customers": 22,
    "new_orders": 15,
    "returning_orders": 10,
    "guest_orders": 0,
    "gross_sales": 1100.0,
    "discount": 125.0,
    "refunds": 30.0,
    "net_sales": 1010.0,
    "first_order_net": 1010.0,
    "later_net": 300.0,
    "lifetime_net": 1310.0,
    "discount_rate": 10.2,
    "refund_rate": 4.0,
    "won_ltv": 90.0,
    "average_order": 44.0
  },
  "no_code": {
    "orders": 2,
    "discount": 10.0
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/coupons?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Coupon Overview

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/coupon-overview`

Returns the discount given, how many orders and new customers used a coupon, a chart by period and the previous period's figures. Amounts are integers in cents.

- **Permission:** `reports/view`
- **Operation page:** [Get Coupon Overview](/restapi/operations/reports/coupon-overview)

`orders` counts paid orders plus orders a coupon made free. `discount_rate` is the discount as a percent of what the coupon orders would have cost at full price. `new_customers` uses the shared first-purchase rule. `comparison` (new customers won with a coupon vs at full price: average first order net, average lifetime value, repeat and refund rates) is a FluentCart Pro report: it appears only when the `fluent_cart/report/coupon_quality` filter returns true. `previous` is `null` without a comparison.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

#### Response

```json
{
  "summary": {
    "discount": 12500,
    "orders": 100,
    "coupon_orders": 25,
    "coupon_share": 25.0,
    "new_customers": 50,
    "coupon_new_customers": 15,
    "new_share": 30.0,
    "discount_rate": 10.2
  },
  "previous": null,
  "comparison": {
    "coupon": {
      "customers": 15,
      "average_first": 4000,
      "average_ltv": 9000,
      "repeat_rate": 20.0,
      "refund_rate": 6.7
    },
    "full_price": {
      "customers": 35,
      "average_first": 4500,
      "average_ltv": 10000,
      "repeat_rate": 25.0,
      "refund_rate": 2.9
    }
  },
  "chart": [
    {
      "year": "2025",
      "group": "2025-01-01",
      "discount": 500,
      "orders": 4,
      "coupon_orders": 1
    }
  ],
  "compare_ranges": {
    "previous_period": {
      "start": "2024-12-01 00:00:00",
      "end": "2024-12-31 23:59:59"
    },
    "...": "..."
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/coupon-overview?params[startDate]=2025-01-01&params[endDate]=2025-01-31&params[compareType]=previous_period" \
  -u "username:app_password"
```

---

## Sources

### Get Source Report

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/sources`

Returns orders and money grouped by UTM tags, and with FluentCart Pro also by product, variation, period or referrer. Amounts are decimal currency units; `net_sales` is the Revenue report's net sales.

- **Permission:** `reports/view`
- **Operation page:** [Get Source Report](/restapi/operations/reports/sources)

Only orders with the grouped source data count (a `utm_source`, or a referrer for `referrer`), unless `include_none` adds a `(none)` row. UTM values group case-insensitively, with `_`, `-` and spaces treated alike. `totals` come from the order set, not from adding rows. `first_order_net` is the net of first orders (one-time or new subscription); `later_net` is the net of their renewals, any date.

The groupings `product`, `variation`, `day`, `week`, `month` and `referrer` need FluentCart Pro (the `fluent_cart/report/source_groupings` filter); without it they fall back to `campaign_source_medium`. Pro also applies `filter_type` and `advanced_filters` through the `fluent_cart/report/sources_query` filter.

With `page`, one page of rows comes back with `pagination`; a period grouping then also returns every period in `chart`. With a comparison, `fluctuations` is keyed by `utm_key` and holds `previous_<field>` and `<field>_fluctuation` (percent) for `orders`, `gross_sales`, `net_sales`, `average_order`, `average_net_order`; a row new in this period reads `100`.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[group_by]` | string | query | No | `campaign_source_medium` (default), `campaign`, `source`, `medium`, `source_medium`, `term`, `content`. Pro: `product`, `variation`, `day`, `week`, `month`, `referrer`. |
| `params[include_none]` | boolean | query | No | Add a `(none)` row for orders without source data. |
| `params[page]` | integer | query | No | Page number. Without it, every row comes back. |
| `params[per_page]` | integer | query | No | Rows per page, 10 to 150. Default `50`. |
| `params[search]` | string | query | No | Filter rows by label (with `page`). |
| `params[sort_by]` | string | query | No | `orders`, `gross_sales`, `net_sales`, `refunds`, `refund_rate`, `average_order`, `average_net_order`, `first_order_net`, `later_net`, `lifetime_net` (with `page`). |
| `params[sort_order]` | string | query | No | `asc` or `desc` (default). |
| `params[filter_type]` | string | query | No | Pro. Advanced filter mode. |
| `params[advanced_filters]` | string | query | No | Pro. Advanced filter conditions (JSON). |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

#### Response

```json
{
  "sourceReportData": [
    {
      "group_key": "spring sale|google|cpc",
      "utm_key": "spring sale|google|cpc",
      "utm_campaign": "spring_sale",
      "utm_source": "google",
      "utm_medium": "cpc",
      "label": "spring_sale / google / cpc",
      "orders": 20,
      "refunded_orders": 1,
      "gross_sales": 1000.0,
      "refunds": 50.0,
      "net_sales": 900.0,
      "average_order": 50.0,
      "average_net_order": 45.0,
      "refund_rate": 5.0,
      "first_order_net": 900.0,
      "later_net": 200.0,
      "lifetime_net": 1100.0
    }
  ],
  "totals": {
    "orders": 30,
    "refunded_orders": 1,
    "gross_sales": 1500.0,
    "refunds": 50.0,
    "net_sales": 1350.0,
    "average_order": 50.0,
    "average_net_order": 45.0,
    "refund_rate": 3.33,
    "first_order_net": 1350.0,
    "later_net": 300.0,
    "lifetime_net": 1650.0
  },
  "group_by": "campaign_source_medium",
  "fluctuations": [],
  "compare_range": null,
  "compare_ranges": {
    "previous_period": {
      "start": "2024-12-01 00:00:00",
      "end": "2024-12-31 23:59:59"
    },
    "...": "..."
  },
  "pagination": {
    "total": 12,
    "current_page": 1,
    "per_page": 50,
    "last_page": 1
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/sources?params[startDate]=2025-01-01&params[endDate]=2025-01-31&params[group_by]=source&params[page]=1" \
  -u "username:app_password"
```

---

### Get Source Channels

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/source-channels`

Returns the new customers won per marketing channel (email, paid, social, AI, search, referral, campaign, direct) with first-order net, lifetime value, repeat and refund rates, tracking coverage and a chart. Amounts are integers in cents; net figures are the Revenue report's net sales.

- **Permission:** `reports/view`
- **Operation page:** [Get Source Channels](/restapi/operations/reports/source-channels)

A new customer is one whose first paid purchase falls in the range. The channel comes from the store's own rules first, then the UTM tags, then the referrer. Custom channel rules come from FluentCart Pro (the `fluent_cart/report/channel_rules` filter); custom channels come first, with their `label`; built-in channels have `label` `null`. Pro's `filter_type` and `advanced_filters` apply here too. `coverage.tracked` is customers not in `direct`. `chart[]` holds new customers per channel key per bucket.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `params[currency]=__all__` works. |
| `params[filter_type]` | string | query | No | Pro. Advanced filter mode. |
| `params[advanced_filters]` | string | query | No | Pro. Advanced filter conditions (JSON). |
| `params[orderTypes][]` | array | query | No | Only these sale types: `payment`, `subscription`, `renewal`, `installment`, `installment_payment`. |

#### Response

```json
{
  "coverage": {
    "customers": 50,
    "tracked": 30,
    "share": 60.0,
    "revenue_share": 58.5
  },
  "channels": [
    {
      "key": "email",
      "label": null,
      "customers": 10,
      "share": 20.0,
      "first_net": 40000,
      "average_ltv": 9000,
      "repeat_rate": 30.0,
      "refund_rate": 0.0
    },
    {
      "key": "direct",
      "label": null,
      "customers": 20,
      "share": 40.0,
      "first_net": 85000,
      "average_ltv": 7000,
      "repeat_rate": 15.0,
      "refund_rate": 5.0
    }
  ],
  "chart": [
    {
      "year": "2025",
      "group": "2025-01-01",
      "email": 1,
      "paid": 0,
      "social": 0,
      "ai": 0,
      "search": 0,
      "referral": 0,
      "campaign": 0,
      "direct": 1
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/source-channels?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Channel Rules

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/channel-rules`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Returns the store's custom channel rules for the Sources report, its own domains, and whether the current user may change them. No money fields.

A rule matches when any of its groups matches; a group matches when all its conditions match. Rules are checked in order, before the built-in channels. A referrer on one of `own_domains` (or a subdomain) counts as direct. `can_edit` is true when the user has the `store/settings` permission.

- **Permission:** `reports/view`
- **Operation page:** [Get Channel Rules](/restapi/operations/reports/channel-rules)

#### Parameters

None.

#### Response

```json
{
    "rules": [
        {
            "id": "a1b2c3d4",
            "name": "Partner newsletter",
            "groups": [
                [
                    {
                        "field": "source",
                        "operator": "is",
                        "value": "partner"
                    },
                    {
                        "field": "medium",
                        "operator": "is",
                        "value": "email"
                    }
                ]
            ]
        }
    ],
    "own_domains": [
        "shop.example.com"
    ],
    "can_edit": true
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/channel-rules" \
  -u "username:app_password"
```

---

### Save Channel Rules

<badge type="warning">POST</badge> `/fluent-cart/v2/reports/channel-rules`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Replaces the store's custom channel rules and own domains, then returns the saved values. Invalid rules, conditions and domains are dropped without an error.

Also needs the `store/settings` permission; without it the route returns 403. Limits: 20 rules, 5 groups per rule, 5 conditions per group, 20 domains. A rule needs a name (max 60 characters) and one valid condition. `field` is `source`, `medium`, `campaign` or `domain`; `operator` is `is`, `contains` or `starts_with`; `value` is lower-cased, max 100 characters (a pasted URL keeps only its host, without `www.`). Keep a rule's `id` (a-z, 0-9, max 12) to keep its channel history; a missing or repeated id gets a new one. A rule sent as `{name, conditions: [...]}` is read as one group.

- **Permission:** `reports/view` and `store/settings`
- **Operation page:** [Save Channel Rules](/restapi/operations/reports/save-channel-rules)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `rules` | array | body | No | Top-level. Rules: `{id?, name, groups: [[{field, operator, value}]]}`. Sending none clears the rules. |
| `own_domains` | array | body | No | Top-level. The store's own domains, e.g. `shop.example.com`. Sending none clears them. |

#### Response

```json
{
    "rules": [
        {
            "id": "a1b2c3d4",
            "name": "Partner newsletter",
            "groups": [
                [
                    {
                        "field": "source",
                        "operator": "is",
                        "value": "partner"
                    },
                    {
                        "field": "medium",
                        "operator": "is",
                        "value": "email"
                    }
                ]
            ]
        }
    ],
    "own_domains": [
        "shop.example.com"
    ],
    "can_edit": true
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/reports/channel-rules" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"rules": [{"id": "a1b2c3d4", "name": "Partner newsletter", "groups": [[{"field": "source", "operator": "is", "value": "partner"}, {"field": "medium", "operator": "is", "value": "email"}]]}], "own_domains": ["shop.example.com"]}'
```

---

## Subscriptions

### Get Subscriptions Overview

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/subscriptions-overview`

Returns subscription movement in the range: new, churned, churn rate, MRR movement, renewals paid and failed, and a movement chart. Open-ended plans only; installment plans are left out. MRR and amounts are decimals. `renewal_amount` is the net sales of paid renewal orders, as the Revenue report's Renewal row counts it.

`mrr_by_plan` (top 10 plus "Other plans"), `mrr_by_interval` and `trials` come only when FluentCart Pro answers the `fluent_cart/report/mrr_breakdown` filter and `params[summary_only]` is not set. `compare_range` and `compare_ranges` are always present; `compare_range` is null without a comparison.

- **Permission:** `reports/view`
- **Operation page:** [Get Subscriptions Overview](/restapi/operations/reports/subscriptions-overview)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `__all__` currency works. |
| `params[summary_only]` | integer | query | No | `1` leaves out the Pro MRR breakdown and trial conversion. |

| Field | Meaning |
|-------|---------|
| `period.churn_rate` | Churned from the base active at the start ÷ `active_at_start`, percent. Null when `active_at_start` is 0. |
| `period.net_mrr` | `new_mrr − churned_mrr + expansion_mrr − contraction_mrr`. |
| `period.failed_renewals`, `failed_amount` | Failed renewal charge transactions in the range. |
| `previousPeriod`, `previousChart`, `fluctuations` | With a comparison: the compare period's `period` and `chart`, and the percent change per field (null when no honest percent exists). |

#### Response

```json
{
    "period": {
        "new": 40, "churned": 10, "churned_new": 2, "active_at_start": 500, "churn_rate": 1.6, "net_change": 30,
        "new_mrr": 1200.0, "churned_mrr": 300.0, "expansion_mrr": 50.0, "contraction_mrr": 20.0, "net_mrr": 930.0,
        "renewals": 200, "renewal_amount": 5800.0, "failed_renewals": 5, "failed_amount": 150.0
    },
    "chart": [
        { "year": "2025", "group": "2025-01-01", "new": 2, "churned": 1, "new_mrr": 60.0, "churned_mrr": 30.0, "expansion_mrr": 0, "contraction_mrr": 0 }
    ],
    "mrr_by_plan": [ { "key": "12", "label": "Pro Plan", "variation": "Monthly", "subscriptions": 300, "mrr": 9000.0 } ],
    "mrr_by_interval": [ { "key": "month", "label": "month", "variation": "", "subscriptions": 400, "mrr": 12000.0 } ],
    "trials": { "started": 20, "converted": 8, "lost": 4, "in_trial": 8, "conversion_rate": 66.67 },
    "previousPeriod": null,
    "previousChart": [],
    "fluctuations": [],
    "compare_range": null,
    "compare_ranges": {
        "previous_period": { "start": "2024-12-01 00:00:00", "end": "2024-12-31 23:59:59" },
        "previous_month": { "start": "2024-12-01 00:00:00", "end": "2024-12-31 23:59:59" },
        "previous_quarter": { "start": "2024-10-01 00:00:00", "end": "2024-10-31 23:59:59" },
        "previous_year": { "start": "2024-01-01 00:00:00", "end": "2024-01-31 23:59:59" }
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/subscriptions-overview?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get Subscription Health

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/subscription-health`

Returns subscription health now: MRR, live subscriptions, ARPU, and the count and MRR of active, discounted first-cycle, trial, canceling (canceled but still in the paid term), failing and paused plans. Open-ended plans only. The date range does not apply. MRR values are decimals.

- **Permission:** `reports/view`
- **Operation page:** [Get Subscription Health](/restapi/operations/reports/subscription-health)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). Only `currency` (`__all__` works) and `variation_ids` apply. |
| `params[cached]` | integer | query | No | `1` lets the result come from a 10-minute cache. |

#### Response

```json
{
    "health": {
        "mrr": 12000.0,
        "subscriptions": 420,
        "canceling": { "count": 10, "mrr": 300.0 },
        "arpu": 28.57,
        "active": { "count": 390, "mrr": 11400.0 },
        "discounted": { "count": 20, "mrr": 300.0, "renewal_mrr": 600.0, "uplift": 300.0 },
        "trial": { "count": 15, "renewal_mrr": 450.0 },
        "failing": { "count": 5, "mrr": 150.0 },
        "paused": { "count": 2, "mrr": 60.0 }
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/subscription-health?params[currency]=USD" \
  -u "username:app_password"
```

---

### Get Subscription Variations

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/subscription-variations`

Returns the products and variations that have a started open-ended subscription, grouped by product. The subscription report pages use it for the product picker. A deleted variation keeps its ID under "Deleted product" with `product_id: 0`.

- **Permission:** `reports/view`
- **Operation page:** [Get Subscription Variations](/restapi/operations/reports/subscription-variations)

#### Parameters

This endpoint takes no parameters.

#### Response

```json
{
    "products": [
        {
            "product_id": 10,
            "product_title": "Pro Plan",
            "variations": [ { "id": 12, "title": "Monthly" }, { "id": 13, "title": "Yearly" } ]
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/subscription-variations" \
  -u "username:app_password"
```

---

### Get Future Renewals

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/future-renewals`

Projects the renewals of live open-ended subscriptions (active, expiring, trialing) month by month for the next 3, 6 or 12 months. It also returns the store's renewal rates for the last 12 full months, so a client can weigh the projection. The date range does not apply. Amounts are in cents.

`by_variation` comes only when FluentCart Pro answers the `fluent_cart/report/future_renewals_by_variation` filter.

- **Permission:** `reports/view`
- **Operation page:** [Get Future Renewals](/restapi/operations/reports/future-renewals)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). Only `currency` (`__all__` works) and `variation_ids` apply. |
| `params[horizon]` | string | query | No | `3` (default), `6` or `12` months. |
| `params[as_of]` | string | query | No | Start day (Y-m-d). Defaults to today. |

| Field | Meaning |
|-------|---------|
| `by_interval`, `trial` | Scheduled cents per billing interval, keyed by the renewal's position in the window. `trial` holds free trials not paid yet (position 0 is the converting charge). |
| `rates`, `trial_rate` | Renewal rate per interval and trial conversion rate over `rate_window`, percent or null. |
| `overdue` | Live subscriptions whose next billing date is already past. |
| `retrying` | Failing and past-due subscriptions. |
| `wont_renew` | Canceled subscriptions whose paid term ends in the window, with `by_month`. |

#### Response

```json
{
    "totalProjected": 1250000,
    "totalRenewals": 420,
    "projections": [
        { "group": "2025-02", "renewals_count": 140, "projected_amount": 420000, "by_interval": { "month": { "1": 400000 } }, "trial": { "month": [20000] } }
    ],
    "by_interval": { "month": { "1": 400000, "2": 400000 } },
    "trial": { "month": [20000] },
    "trial_first": { "count": 4, "amount": 20000 },
    "rates": { "month": 92.5, "year": 80.0 },
    "trial_rate": 40.0,
    "rate_window": ["2024-02-01", "2025-01-31"],
    "overdue": { "count": 3, "amount": 9000 },
    "retrying": { "count": 5, "amount": 15000 },
    "wont_renew": { "count": 6, "amount": 18000, "by_month": { "2025-02": 6000 } },
    "period": ["2025-02-01 00:00:00", "2025-04-30 23:59:59"],
    "groupBy": "monthly",
    "horizon": "3",
    "by_variation": [
        { "variation_id": 12, "product_id": 10, "product_title": "Pro Plan", "variation_title": "Monthly", "renewals_count": 300, "projected_amount": 900000, "by_interval": { "month": { "1": 300000 } }, "trial": [] }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/future-renewals?params[horizon]=6&params[currency]=USD" \
  -u "username:app_password"
```

---

### Get Subscription Retention

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/subscription-retention`

Returns one row per store month (or year) in the range: new, churned, retained and active subscriptions, MRR, churn reasons and the renewal rate. Open-ended plans only. Retained = the starting base still active at period end. MRR and `period_gross` are decimals; `retained_mrr`, `mrr` and `start_mrr` are decimal strings. The range end is clamped to today.

- **Permission:** `reports/view`
- **Operation page:** [Get Subscription Retention](/restapi/operations/reports/subscription-retention)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). `__all__` currency works. |
| `params[period]` | string | query | No | `year` gives one row per year; any other value one row per month. |
| `params[billingInterval]` | string | query | No | Only subscriptions with this billing interval, e.g. `month`. |

`intervals` lists the billing intervals that have subscriptions, most first. `renewal_rate` = paid ÷ (paid + lost) of the renewals due in the period; retrying ones are not counted yet.

#### Response

```json
{
    "retention_data": [
        {
            "day": "2025-01-31", "week": "2025-05", "group": "2025-01", "year": "2025",
            "is_complete": true, "is_running": false,
            "new_subscriptions": 40, "new_subscriptions_mrr": 1200.0,
            "churned_subscriptions": 10, "churned_subscriptions_mrr": 300.0, "churned_new_subscriptions": 2,
            "left_by_reason": { "canceled": 6, "payment_failed": 2, "retrying": 1, "paused": 1, "completed": 0 },
            "renewals_paid": 190, "renewals_lost": 10, "renewals_retrying": 3, "renewal_rate": 95.0,
            "retained_subscriptions": 490, "retained_mrr": "14700.00",
            "active_subscriptions": "528", "active_paid_subscriptions": "520", "active_free_subscriptions": "8",
            "mrr": "15600.00", "start_subscriptions": 500, "start_mrr": "15000.00",
            "retention_rate": 98.0, "retention_rate_money": 98.0,
            "period_gross": 1200.0, "period_subscriptions": 40
        }
    ],
    "intervals": ["month", "year"]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/subscription-retention?params[startDate]=2024-01-01&params[endDate]=2024-12-31" \
  -u "username:app_password"
```

---

### Get Subscription Cohorts

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/subscription-cohorts`

Returns cohort retention by start month or start year, read from the retention snapshots table. The date range does not apply: the month view shows the last 24 months of cohorts, the year view every year. One currency only. MRR values are decimals.

`metric=mrr`, `billingInterval` and `rebuyAdjusted` need FluentCart Pro (filter `fluent_cart/report/cohort_options`). Without Pro the metric is `subscribers` and `full` is `false`. Build the snapshots with [Generate Retention Snapshots](#generate-retention-snapshots), then [Retention Snapshot Step](#retention-snapshot-step).

- **Permission:** `reports/view`
- **Operation page:** [Get Subscription Cohorts](/restapi/operations/reports/subscription-cohorts)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). Only `currency` and `variation_ids` apply; `__all__` is read as the base currency. |
| `params[groupBy]` | string | query | No | `year` (default) or `month`. |
| `params[metric]` | string | query | No | Pro. `subscribers` (default) or `mrr`. |
| `params[billingInterval]` | string | query | No | Pro. Only cohorts of this billing interval. |
| `params[rebuyAdjusted]` | boolean | query | No | Pro. Count a cancel-and-rebuy as retained. |

In the year view a cell also has `base_mrr`, `base_count`, `partial`, `matured_cohorts` and `total_cohorts`, because a year cell covers only the monthly cohorts that reached it. In the month view the current month's cell has `partial: true`. `generated_at` is when the snapshots were built; `intervals` lists the intervals they hold.

#### Response

```json
{
    "cohorts": [
        {
            "cohort": "2024",
            "start_mrr": 3000.0,
            "start_count": 100,
            "periods": [
                {
                    "offset": 1,
                    "retained_mrr": 2400.0, "retained_count": 80,
                    "churned_mrr": 600.0, "churned_count": 20,
                    "retention_rate_mrr": 80.0, "retention_rate_count": 80.0,
                    "retention_rate_previous_mrr": 80.0, "retention_rate_previous_count": 80.0,
                    "churn_rate_total_mrr": 20.0, "churn_rate_total_count": 20.0,
                    "base_mrr": 3000.0, "base_count": 100, "partial": false, "matured_cohorts": 12, "total_cohorts": 12
                }
            ]
        }
    ],
    "weighted_averages": [
        { "offset": 1, "weighted_avg_mrr": 80.0, "weighted_avg_count": 80.0, "weighted_avg_prev_mrr": 80.0, "weighted_avg_prev_count": 80.0, "weighted_avg_churn_mrr": 20.0, "weighted_avg_churn_count": 20.0 }
    ],
    "group_by": "year",
    "metric": "subscribers",
    "max_periods": 8,
    "generated_at": "2025-01-31 10:00:00",
    "intervals": ["month", "year"],
    "full": true
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/subscription-cohorts?params[groupBy]=month&params[currency]=USD" \
  -u "username:app_password"
```

---

### Get Installments

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/installments`

Returns installment-plan health over all time: plans started, money collected and still owed, plans per status bucket, payments due in the next 30 days and the product picker options. Installment plans are subscriptions with a fixed number of payments. The date range does not apply. Amounts are in cents.

`schedule`, `starts` and `summary.collection_rate` come only when FluentCart Pro answers the `fluent_cart/report/installment_forecast` filter.

- **Permission:** `reports/view`
- **Operation page:** [Get Installments](/restapi/operations/reports/installments)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). Only `currency` (`__all__` works) and `variation_ids` apply. |
| `params[started_from]` | string | query | No | Only plans whose first paid order is on or after this store day (Y-m-d). |
| `params[started_to]` | string | query | No | Only plans whose first paid order is on or before this store day (Y-m-d). |
| `params[as_of]` | string | query | No | Day to measure from (Y-m-d). Defaults to today. |
| `params[at_risk_limit]` | integer | query | No | At-risk rows to include, 0 to 500. Default `0` (none); page them with [Get Installments at Risk](#get-installments-at-risk). |

Buckets: `completed`, `running`, `overdue`, `paused`, `upgraded`, `lapsed`, `refunded`. `summary.scheduled` is what running plans still owe; `overdue` and `lapsed_unpaid` are what overdue and lapsed plans still owe. `completion_rate` counts ended plans only (completed, lapsed, refunded).

#### Response

```json
{
    "as_of": "2025-02-01",
    "currency": "USD",
    "started_from": null,
    "started_to": null,
    "summary": {
        "plans_started": 50, "payments": 180, "collected": 900000, "scheduled": 300000,
        "overdue": 20000, "lapsed_unpaid": 40000, "completion_rate": 85.0, "collection_rate": 92.5,
        "completed_count": 30, "running_count": 12, "overdue_count": 2, "paused_count": 0,
        "upgraded_count": 1, "lapsed_count": 4, "refunded_count": 1
    },
    "schedule": [ { "month": "2025-02", "payments": 14, "amount": 70000, "scheduled": 60000, "overdue": 10000 } ],
    "due_soon": { "count": 14, "amount": 70000, "overdue": { "count": 2, "amount": 10000 } },
    "starts": [ { "month": "2024-06", "plans_started": 5, "collected": 100000, "completed_count": 3, "running_count": 2, "overdue_count": 0, "paused_count": 0, "upgraded_count": 0, "lapsed_count": 0, "refunded_count": 0 } ],
    "at_risk": [],
    "filter_options": [ { "product_id": 20, "product_title": "Course", "variations": [ { "id": 31, "title": "3 payments" } ] } ],
    "at_risk_count": 6,
    "at_risk_amount": 60000
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/installments?params[currency]=USD" \
  -u "username:app_password"
```

---

### Get Installments at Risk

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/installments/at-risk`

Returns one page of overdue and lapsed installment plans, largest unpaid balance first. Amounts are in cents. `reactivate_url` is empty when the user cannot reactivate the plan.

- **Permission:** `reports/view`
- **Operation page:** [Get Installments at Risk](/restapi/operations/reports/installments-at-risk)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). Only `currency` (`__all__` works) and `variation_ids` apply. |
| `params[started_from]` | string | query | No | Only plans whose first paid order is on or after this store day (Y-m-d). |
| `params[started_to]` | string | query | No | Only plans whose first paid order is on or before this store day (Y-m-d). |
| `search` | string | query | No | Customer name or email contains this text. Top-level. |
| `bucket` | string | query | No | `overdue` or `lapsed`. Both when omitted. Top-level. |
| `page` | integer | query | No | Page number. Default `1`. Top-level. |
| `per_page` | integer | query | No | Rows per page, 1 to 150. Default `20`. Top-level. |

#### Response

```json
{
    "data": [
        {
            "subscription_id": 77, "customer_id": 42, "customer_name": "Jane Doe", "email": "jane@example.com",
            "variation_id": 31, "product_title": "Course", "variation_title": "3 payments",
            "status": "failing", "bucket": "overdue",
            "payments": 1, "bill_times": 3, "bill_count": 1, "installments_left": 2,
            "collected": 10000, "left_amount": 20000,
            "next_billing_date": "2025-01-15 00:00:00", "reactivate_url": ""
        }
    ],
    "total": 6,
    "page": 1,
    "per_page": 20
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/installments/at-risk?bucket=overdue&page=1&per_page=20" \
  -u "username:app_password"
```

---

### Get Subscription Rebuys

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/subscription-rebuys`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Finds subscriptions whose paid term ended in the range without renewing (canceled or expired) and counts the customers who bought the same product again near that end. `discount_total` and `discount_average` are in decimal currency units (not cents).

A rebuy is a new subscription to the same product, by the same customer, in the same currency, created within `windowDays` before or after the term end. Free trials that never paid and plans changed by an upgrade do not count as ended. `timing` splits rebuys into before the end, within 7 days after, and later. `discounted` counts rebuys that paid less than the old renewal price (same interval, not via a trial); `discount_total` sums the saving. `rebuy_rate` and `discount_average` are `null` when there is nothing to divide.

- **Permission:** `reports/view`
- **Operation page:** [Get Subscription Rebuys](/restapi/operations/reports/subscription-rebuys)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[windowDays]` | integer | query | No | Days before or after the term end that count as a rebuy, 1-365. Default `30`. |
| `params[billingInterval]` | string | query | No | Only subscriptions with this billing interval, e.g. `monthly`, `yearly`. |

One currency only: `__all__` falls back to the base currency. `params[filterMode]` is not used.

#### Response

```json
{
    "window_days": 30,
    "ended": 40,
    "rebought": 6,
    "rebuy_rate": 15.0,
    "timing": {
        "before": 1,
        "within_7": 4,
        "later": 1
    },
    "discounted": 3,
    "discount_total": 75.0,
    "discount_average": 25.0,
    "chart": [
        {
            "year": "2025",
            "group": "2025-01",
            "ended": 40,
            "rebought": 6
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/subscription-rebuys?params[startDate]=2025-01-01&params[endDate]=2025-01-31&params[windowDays]=30" \
  -u "username:app_password"
```

---

### Get Installments by Variation

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/installments/variations`

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

Returns installment plans grouped by the variation they were sold on: how many started, what they collected, and what is still owed. Amounts are in cents.

`collected` is paid less refunded on the plans' orders. `scheduled` is still owed on running plans, `overdue_amount` on overdue plans, `lapsed_amount` on lapsed plans. `total` = `collected` + `scheduled`; rows sort by it. Each plan falls in one `<bucket>_count`: completed, running, overdue, paused, upgraded, lapsed, refunded.

- **Permission:** `reports/view`
- **Operation page:** [Get Installments by Variation](/restapi/operations/reports/installments-variations)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| Standard params | — | query | No | See [Common Parameters](#common-parameters). |
| `params[started_from]` | string | query | No | Only plans started on or after this day (Y-m-d). |
| `params[started_to]` | string | query | No | Only plans started on or before this day (Y-m-d). |

Only `params[currency]` (`__all__` works) and `params[variation_ids][]` of the standard params are used. `startDate`, `endDate` and `rangeKey` are ignored; use `started_from` / `started_to`.

#### Response

```json
{
    "data": [
        {
            "variation_id": 108,
            "product_id": 42,
            "product_title": "Pro Plugin",
            "variation_title": "3 payments",
            "min_price": 10000,
            "max_price": 10000,
            "min_bill_times": 3,
            "max_bill_times": 3,
            "is_installment_price": true,
            "plans_started": 20,
            "payments": 45,
            "collected": 450000,
            "scheduled": 100000,
            "overdue_amount": 20000,
            "lapsed_amount": 10000,
            "completed_count": 10,
            "running_count": 6,
            "overdue_count": 2,
            "paused_count": 0,
            "upgraded_count": 0,
            "lapsed_count": 1,
            "refunded_count": 1,
            "total": 550000
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/installments/variations?params[started_from]=2025-01-01&params[started_to]=2025-06-30" \
  -u "username:app_password"
```

---

## Retention Snapshots

The cohort report reads the retention snapshots table. A rebuild runs in short requests, not in the background:

1. Call [Generate Retention Snapshots](#generate-retention-snapshots). It starts a build and returns a `token`.
2. Call [Retention Snapshot Step](#retention-snapshot-step) with that `token`. Repeat until the response has `done: true`.

The current snapshots stay in place until the last step. Only one build runs at a time.

::: warning Changed in the next release
`GET /reports/retention-snapshots/status` is removed. Action Scheduler is no longer used. `POST /reports/retention-snapshots/generate` now starts a stepped build and returns a `token`, not a `job_id`. It ignores `product_id`. Call `POST /reports/retention-snapshots/step` to run the build.
:::

### Generate Retention Snapshots

<badge type="warning">POST</badge> `/fluent-cart/v2/reports/retention-snapshots/generate`

Starts a rebuild. The request takes a lock, plans the steps and returns `step: 0`, the number of `steps` and a `token`. It does not build any rows. Send the `token` to [Retention Snapshot Step](#retention-snapshot-step).

If another build holds the lock, the response is HTTP 200 with `success: false` and `code: "already_running"`. A lock that nobody steps expires after 5 minutes.

- **Permission:** `reports/view`
- **Operation page:** [Generate Retention Snapshots](/restapi/operations/reports/generate-retention-snapshots)

#### Parameters

None. A `product_id` is ignored: every product is rebuilt.

#### Response

```json
{
    "success": true,
    "step": 0,
    "steps": 4,
    "token": "aB3dE5fG7hJ9kL1mN3pQ"
}
```

Another build is running:

```json
{
    "success": false,
    "code": "already_running",
    "message": "A snapshot rebuild is already running. Try again in a few minutes.",
    "stats": []
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/reports/retention-snapshots/generate" \
  -u "username:app_password"
```

---

### Retention Snapshot Step

<badge type="warning">POST</badge> `/fluent-cart/v2/reports/retention-snapshots/step`

Runs the next step of the started build. Each step builds one range of customer IDs into a build table and returns `done: false`. The last step publishes the build in place of the old snapshots, releases the lock and returns `done: true` with `message` and `stats`. A store with no subscriptions has one step.

Errors return HTTP 200 with `success: false` and a `code`:

| `code` | Meaning |
|--------|---------|
| `no_build` | No build is running. Call generate again. |
| `already_running` | The `token` does not match the running build. |
| `failed` | The step threw an error. The build stops and the lock is released. The old snapshots stay. |

- **Permission:** `reports/view`
- **Operation page:** [Retention Snapshot Step](/restapi/operations/reports/retention-snapshots-step)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `token` | string | body | Yes | The `token` from the generate response. |

#### Response

More steps to run:

```json
{
    "success": true,
    "done": false,
    "step": 1,
    "steps": 4
}
```

Last step:

```json
{
    "success": true,
    "done": true,
    "step": 4,
    "steps": 4,
    "message": "Retention snapshots generated successfully",
    "stats": { "total_records": 5000, "unique_cohorts": 24, "unique_periods": 36, "unique_products": 6 }
}
```

#### Example

Start a build, then step it until it is done. The loop needs `jq`.

```bash
SITE="https://example.com/wp-json/fluent-cart/v2/reports/retention-snapshots"
AUTH="username:app_password"

TOKEN=$(curl -s -X POST "$SITE/generate" -u "$AUTH" | jq -r '.token // empty')
[ -z "$TOKEN" ] && { echo "Could not start the build"; exit 1; }

while true; do
  RESPONSE=$(curl -s -X POST "$SITE/step" -u "$AUTH" \
    -H "Content-Type: application/json" \
    -d "{\"token\": \"$TOKEN\"}")
  echo "$RESPONSE"
  [ "$(echo "$RESPONSE" | jq -r '.success')" != "true" ] && exit 1
  [ "$(echo "$RESPONSE" | jq -r '.done')" = "true" ] && break
done
```

---

## License Reports

These routes are in core, but they read the `fct_licenses` table that the FluentCart Pro licensing module creates. Without that table, the chart returns zero buckets and the pie chart and summary fail with a database error.

### Get License Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/license-chart`

Returns the number of licenses created per day, month or year in the range. This is a core route, but it reads the `fct_licenses` table that the FluentCart Pro licensing module creates. Without that table the query fails silently and every bucket is `0`.

- **Permission:** `reports/view`
- **Operation page:** [Get License Chart](/restapi/operations/reports/license-chart)

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params[startDate]` | string | query | No | First store day. |
| `params[endDate]` | string | query | No | Last store day. |
| `params[groupKey]` | string | query | No | `daily` (default), `monthly`, `yearly`, or `default` to pick by range length. |

Daily rows have `date`; monthly rows have `year` and `month`; yearly rows have `year`.

#### Response

```json
{
    "lineChartData": [
        { "date": "2025-01-01", "license_count": 4 },
        { "date": "2025-01-02", "license_count": 0 }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/license-chart?params[startDate]=2025-01-01&params[endDate]=2025-01-31" \
  -u "username:app_password"
```

---

### Get License Pie Chart

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/license-pie-chart`

Returns active licenses per product, with each product's share of all active licenses. The date range does not apply. This is a core route, but it reads the `fct_licenses` table that the FluentCart Pro licensing module creates, so it requires FluentCart Pro.

- **Permission:** `reports/view`
- **Operation page:** [Get License Pie Chart](/restapi/operations/reports/license-pie-chart)

#### Parameters

This endpoint takes no parameters that change the result.

#### Response

```json
{
    "pieChartData": [
        { "product_id": 10, "post_title": "Pro Plugin", "activation_count": 120, "percentage": "60.00" },
        { "product_id": 11, "post_title": "Add-on", "activation_count": 80, "percentage": "40.00" }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/license-pie-chart" \
  -u "username:app_password"
```

---

### Get License Summary

<badge type="tip">GET</badge> `/fluent-cart/v2/reports/license-summary`

Returns license counts by current status, the total number of activated sites and the number of licensed products. The date range does not apply. This is a core route, but it reads the `fct_licenses` table that the FluentCart Pro licensing module creates, so it requires FluentCart Pro.

- **Permission:** `reports/view`
- **Operation page:** [Get License Summary](/restapi/operations/reports/license-summary)

#### Parameters

This endpoint takes no parameters that change the result.

#### Response

```json
{
    "summaryData": {
        "totalLicense": 200,
        "totalActiveLicense": 150,
        "totalInactiveLicense": 20,
        "totalDisabledLicense": 5,
        "totalExpiredLicense": 25,
        "totalActivatedSites": 310,
        "totalLicensedProducts": 4
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/reports/license-summary" \
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

## Comparison Periods

When `compareType` and `compareDate` are both set, endpoints that support comparison also return the compared period's figures and the change against it:

| compareType | Behavior |
|-------------|----------|
| `previous_period` | Same number of days immediately before the start date |
| `previous_month` | Same days shifted back 1 month, never overlapping the current range |
| `previous_quarter` | Same days shifted back 3 months, never overlapping the current range |
| `previous_year` | Same days shifted back 1 year, never overlapping the current range |
| `custom` | Starts on `compareDate`; same number of days |

When the range ends in the future (for example `this_month`), the compared period is sized to the days that have passed.

A `fluctuations` object maps a metric key to its percent change, or `null` when the earlier value is `0` or missing (no made-up +100%). On some endpoints a rate changes in points instead. Endpoints that return `compare_ranges` list the four preset compare ranges (`start` and `end`, site timezone) for a date picker; `compare_range` is the range used, or `null`.

```json
{
    "fluctuations": {
        "net_sales": 12.5,
        "order_count": -4.2,
        "refunds": null
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
| `401` | Not authenticated |
| `403` | Insufficient permissions (`reports/view` required) |
| `404` | Unknown route, a removed endpoint, or a Pro endpoint without FluentCart Pro |
| `500` | Server error |
