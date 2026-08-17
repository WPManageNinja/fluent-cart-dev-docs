---
title: Reorder Attribute Groups
description: "Persist the merchant's drag-reorder of attribute groups in the library. Submit group IDs in the desired display order; every ID must exist. Writes a dense, 1-indexed `serial` to each group. The list is capped at 500 IDs per request (filterable via `fluent_cart/attribute_groups/max_reorder`) — a reorder cannot be split into batches, so an oversized payload is rejected rather than truncated."
outline: false
aside: false
---
<OAOperation operationId="reorderGroups" specUrl="/openapi/public/labels-attributes/reorder-groups.json" />
