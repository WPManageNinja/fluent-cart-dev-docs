---
title: Bulk Update Product Variants
description: "Update price and status fields on multiple product variants in one request. All targeted variants must belong to the same product. Rows in the payload that target the same variant ID are merged (last field wins), the batch is applied inside a single locked transaction, and the `item_price` / `compare_price` relationship is enforced in both directions — raising `item_price` above an existing `compare_price` clears `compare_price`, and a `compare_price` below `item_price` is rejected back to 0. Up to 500 update rows are processed per request; additional rows are silently dropped. Note `item_price` and `compare_price` are submitted as decimal amounts (e.g. `29.99`), not cents — they are converted to cents internally."
outline: false
aside: false
---
<OAOperation operationId="bulkUpdate" specUrl="/openapi/public/products/bulk-update-variants.json" />
