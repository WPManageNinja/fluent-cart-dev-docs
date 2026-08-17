---
title: Skip Next Renewal Period
description: "Advance a store-billed (manual or auto-charge) subscription's `next_billing_date` to the following period without creating or charging a renewal for the current one. Only valid for active or trialing subscriptions with an upcoming billing date. The skip does not stack — if a skip is already pending, or there is nothing left to advance, the request fails."
outline: false
aside: false
---
<OAOperation operationId="skipRenewal" specUrl="/openapi/public/orders/skip-renewal.json" />
