---
title: Update Subscription
description: "Update a manual subscription's billing details — recurring amount, remaining bill count, billing interval, status, or next billing date. Only subscriptions with a manual collection method can be updated through this endpoint; system (auto-charge) and gateway-managed subscriptions are rejected. Note `recurring_total` is submitted as a decimal amount in the store's currency (e.g. `29.99`), not cents, unlike most other money fields in this API."
outline: false
aside: false
---
<OAOperation operationId="updateSubscription" specUrl="/openapi/public/orders/update-subscription-details.json" />
