---
title: Calculate Order Tax
description: "Calculate tax for an admin-created order given a destination address and a list of line items. This is a pure calculation helper — no database writes occur and no order is created or modified. Up to 100 items are processed per request; any beyond that are silently dropped. If tax calculation isn't available for the given address, all totals are returned as zero."
outline: false
aside: false
---
<OAOperation operationId="calculateTax" specUrl="/openapi/public/orders/calculate-tax.json" />
