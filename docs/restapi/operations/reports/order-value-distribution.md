---
title: Get Order Value Distribution
description: "Counts the orders in the range by order total, in steps of 100 in the report currency. A bucket key such as `100-200` means a total above 100.00 and up to 200.00 (`total_amount`, cents 10001-20000). Every value is an order count."
outline: false
aside: false
---

::: info Pro Feature
This endpoint requires FluentCart Pro.
:::

<OAOperation operationId="getOrderValueDistribution" specUrl="/openapi/public/reports/order-value-distribution.json" />
