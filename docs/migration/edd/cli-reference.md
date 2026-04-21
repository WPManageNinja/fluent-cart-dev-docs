---
title: WP-CLI Migration Reference
description: Complete WP-CLI command reference for migrating EDD data to FluentCart.
---

# WP-CLI Migration Reference

The WP-CLI interface provides the same migration logic as the Admin UI but runs without HTTP timeouts, making it the preferred method for large stores.

## Main Command

```bash
wp fluent_cart_migrator migrate_from_edd [flags]
```

All flags are optional and combinable. At the start of every run, store settings (name, address, currency, separators) are automatically synced from EDD into FluentCart — only fields that are currently empty in FluentCart are populated.

---

## Migration Flags

### `--all`

Runs all five steps in sequence: products → tax_rates → coupons → payments → recount.

```bash
wp fluent_cart_migrator migrate_from_edd --all
```

Each step checks its own completion state before running. Steps already marked as done are skipped automatically. This makes `--all` safe to re-run on a partially completed migration.

---

### `--products`

Migrates EDD downloads to FluentCart products.

```bash
wp fluent_cart_migrator migrate_from_edd --products
```

- Creates FluentCart products (WP post type `fluent-products`) from EDD downloads.
- Maps EDD variable prices → FluentCart product variations.
- Handles bundles, license settings, subscription products, and featured images.
- Stores the EDD ID → FluentCart ID mapping used during order migration.

Output:
```
Migrated 142 Products of 142
```

---

### `--tax_rates`

Migrates EDD tax configuration to FluentCart.

```bash
wp fluent_cart_migrator migrate_from_edd --tax_rates
```

- Creates default tax classes (Standard, Reduced, Zero).
- Generates FluentCart tax rates for every country in your EDD tax table.
- Stores the EDD rate ID → FluentCart rate ID mapping.
- Syncs tax inclusion mode (inclusive/exclusive).

Output:
```
Generated tax rates for countries: US, GB, DE, AU
Mapped 12 EDD tax rates to FluentCart rates
Prices include tax: no
```

---

### `--coupons`

Migrates EDD discount codes to FluentCart coupons.

```bash
wp fluent_cart_migrator migrate_from_edd --coupons
```

- Maps discount types: `flat` → `fixed`, `percent` → `percentage`.
- Preserves all restrictions: product scope, max uses, once-per-customer, minimum charge, and recurring rules.
- Links AffiliateWP affiliate IDs to coupon meta (`_fa_affiliate_id`) when present.

Output:
```
Migrated 28 Coupon Codes
```

---

### `--payments`

Migrates all orders, transactions, customers, subscriptions, and licenses.

```bash
wp fluent_cart_migrator migrate_from_edd --payments
```

- Processes 1,000 orders per page with no time limit.
- Shows a progress bar with total order count.
- Logs failed orders without stopping the batch. View failures with `--log`.
- Automatically resumes from the last completed page if interrupted and re-run.

Output:
```
Starting orders Migration. Page: 1
Migrating Payments: (12,847) [========================================] 100%
All Payments Migration has been completed
```

**Supported EDD order statuses:** `complete`, `edd_subscription`, `partially_refunded`, `refunded`, `processing`, `revoked`, `pending`, `publish`.

**Resuming:** If the command is interrupted, re-run `--payments`. It reads `last_order_page` from the migration state and starts from the next page.

---

### `--recount`

Recalculates statistics and verifies data integrity across all migrated records.

```bash
wp fluent_cart_migrator migrate_from_edd --recount
```

Runs five sub-steps in order:

| Sub-step | Description |
|----------|-------------|
| Fix reactivations | Reconnects orphaned subscription renewal orders that are missing a `subscription_id` |
| Fix subscription UUIDs | Generates UUIDs for subscriptions that don't have one |
| Recount coupons | Counts applied coupons per order and updates `use_count` on each coupon |
| Recount customers | Recalculates LTV, AOV, `purchase_count`, and first/last purchase dates for all customers |
| Recount subscriptions | Counts renewal orders per subscription; marks subscriptions `completed` when `bill_count >= bill_times` |

Output:
```
Fixed 0 reactivations of 0 orphans
No subscriptions found to fix UUID
Recounted 28 Coupons
Recounting Customer stats: (523) [=========================] 100%
Recounting Subscriptions Bills count: (87) [=================] 100%
```

---

## Diagnostic Flags

These flags display information without performing any migration.

### `--stats`

Prints a count of all EDD data. Run this before migration to understand what will be migrated.

```bash
wp fluent_cart_migrator migrate_from_edd --stats
```

Output:
```
Products: 142
Total Orders: 12,847
Total Transactions: 15,203
Customers: 4,891
Subscriptions: 312
Licenses: 1,024
Gateways: stripe, paypal
Order Statuses: complete, edd_subscription, refunded, pending
```

---

### `--verify_license`

Checks that all EDD Software Licensing licenses were migrated correctly.

```bash
wp fluent_cart_migrator migrate_from_edd --verify_license
```

Compares each EDD license against the migrated FluentCart license. Reports missing licenses, status mismatches, and expiry discrepancies.

Output:
```
Verified 1024 licenses, 0 issues found.
```

---

### `--log`

Prints the failed payment log.

```bash
wp fluent_cart_migrator migrate_from_edd --log
```

Prints the raw `_fluent_edd_failed_payment_logs` option. Each entry includes the EDD payment ID, the stage where the failure occurred (`data_setup`, `validation`, or `migration`), and the error message.

---

### `--reset`

Wipes all migrated data. Prompts for confirmation before proceeding. Does not require `FLUENT_CART_DEV_MODE`.

```bash
wp fluent_cart_migrator migrate_from_edd --reset
```

See [What Reset Deletes](/migration/troubleshooting#what-reset-deletes) for the full list.

---

## Standalone Commands

### `wp fluent_cart_migrator reset`

Wipes all migrated data. **Requires `FLUENT_CART_DEV_MODE`.**

```bash
wp fluent_cart_migrator reset
```

Functionally identical to `--reset` above, but gated behind the dev mode constant. See [FLUENT_CART_DEV_MODE](/migration/troubleshooting#fluent_cart_dev_mode) for setup instructions.

---

### `wp fluent_cart_migrator edd_cleanup`

Deletes legacy EDD data from WordPress after migration is confirmed complete.

```bash
wp fluent_cart_migrator edd_cleanup
```

::: warning Destructive — run only after verifying migration is complete
This permanently deletes EDD posts and database records and cannot be undone.
:::

Deletes the following post types (with associated postmeta and comments):
- `edd_payment`
- `edd_discount`
- `edd_log`
- `edd_license_log`
- `edd_advanced_report`

Also cleans up:
- Orphaned comment meta (comment meta where the parent comment no longer exists)
- Orphaned post meta (post meta where the parent post no longer exists)
- Term taxonomies: `download_category`, `edd_log_type`

Each post type deletion prompts for confirmation individually.

---

### `wp fluent_cart_migrator fix_subs_uuid`

Generates UUIDs for FluentCart subscriptions that are missing them.

```bash
wp fluent_cart_migrator fix_subs_uuid
```

This runs automatically as part of `--recount`. Run it standalone only if you need to fix subscription UUIDs outside of a full migration run.

---

## CLI vs Admin UI

| | CLI | Admin UI |
|-|-----|---------|
| Orders per batch | 1,000 | 100 |
| Time limit per batch | None | 25 seconds |
| Pause / Resume | Re-run the same flag | Built-in pause button |
| Best for | Stores with 10,000+ orders | Stores with fewer orders |
| Migration logic | Identical | Identical |

---

## Related Documentation

- [Admin UI Guide](/migration/edd/admin-ui) — Visual step-by-step walkthrough with screenshots
- [Troubleshooting & Reset](/migration/edd/troubleshooting) — Error logs, resume, and reset instructions
- [Migration Overview](/migration/edd/) — Prerequisites and what gets migrated
