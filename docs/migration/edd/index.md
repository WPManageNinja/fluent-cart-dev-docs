---
title: EDD Migration — Overview
description: Migrate your Easy Digital Downloads store data to FluentCart. Products, orders, subscriptions, licenses, and more.
---

# EDD Migration

FluentCart Migrator is a standalone plugin that transfers your Easy Digital Downloads (EDD) store data into FluentCart. Once migration is complete, the migrator plugin must stay active to maintain backward compatibility for legacy EDD endpoints.

## What Gets Migrated

| Data | Notes |
|------|-------|
| **Products** | EDD Downloads → FluentCart products with variations. Bundles, license-enabled products, and subscription products included. |
| **Tax Rates** | EDD tax configuration → FluentCart tax classes and rates. Tax inclusion mode synced. |
| **Coupons** | EDD discount codes → FluentCart coupons with all restrictions (product scope, usage limits, minimum charge, recurring rules). |
| **Orders & Payments** | All order statuses, transactions, refunds, gateway references, customer addresses, and order notes. |
| **Customers** | Created from order data. LTV, AOV, and purchase stats are recalculated in the recount step. |
| **Subscriptions** | EDD Recurring subscriptions → FluentCart subscriptions with billing intervals, renewal counts, and statuses. |
| **Licenses** | EDD Software Licensing licenses and activations → FluentCart licenses. Requires FluentCart Pro. |
| **Store Settings** | Store name, address, currency, and separators are synced from EDD when FluentCart fields are empty. |

## Prerequisites

- **EDD v3.x** — Only EDD 3.0+ is supported. The migrator requires the `edd_orders` database table introduced in v3.
- **FluentCart** — The FluentCart free plugin must be active.
- **FluentCart Pro** — Required if EDD Software Licensing is active (detected via `EDD_SL_PLUGIN_DIR`). Without Pro, the compatibility check screen will warn you and migration cannot proceed.

## Installation

1. Install and activate the **FluentCart Migrator** plugin.
2. Navigate to **FluentCart → Migration** in the WordPress admin.
3. Your EDD store must be running on the same WordPress installation.

## Migration Methods

| Method | Best For | Orders per Batch | Time Limit |
|--------|----------|-----------------|------------|
| [Admin UI](./admin-ui) | Most users — visual progress, pause/resume | 100 | 25 sec/request |
| [WP-CLI](./cli-reference) | Large stores, server-side reliability | 1,000 | None |

Both methods use the same underlying migration logic and produce identical results. For stores with 10,000+ orders, CLI is preferred.

## Migration Steps

Steps run in this fixed sequence:

1. **Products** — Migrates EDD downloads to FluentCart products and variations.
2. **Tax Rates** — Migrates EDD tax configuration to FluentCart tax classes and rates.
3. **Coupons** — Migrates EDD discount codes with all restrictions.
4. **Orders & Payments** — Migrates all orders, transactions, customers, subscriptions, and licenses. The longest step for large stores.
5. **Recount & Verify** — Recalculates customer stats (LTV, AOV), recounts coupon usage, fixes subscription bill counts, and resolves orphaned renewal orders.

Each step is tracked independently. If migration is interrupted, you can resume — completed steps are skipped automatically.

## After Migration

Once migration completes, **keep the FluentCart Migrator plugin active**. It provides backward compatibility for:

- **License API** — EDD license activate/deactivate/check endpoints continue to route here.
- **PayPal IPN** — Renewal payment notifications for existing PayPal subscriptions.
- **Stripe webhooks** — Charge ID resolution for orders placed through EDD's Stripe gateway.
- **Download & renewal URLs** — Legacy EDD download links won't resolve without it.

Deactivating the plugin will silently break customer-facing integrations that still reference EDD endpoints.

---

**Next Steps:** Follow the [Admin UI Guide](./admin-ui) for a visual walkthrough, or jump to the [CLI Reference](./cli-reference) for server-side migration.
