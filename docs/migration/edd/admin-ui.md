---
title: Admin UI Migration Guide
description: Step-by-step guide for migrating EDD data to FluentCart using the Admin UI.
---

# Admin UI Migration Guide

The Admin UI provides a visual, step-by-step migration experience with live progress tracking, pause/resume support, and an error log.

## Navigating to the Migrator

Go to **FluentCart → Migration** in the WordPress admin sidebar.

---

## Step 1 — Select Migration Source

The intro screen shows all available migration sources. Easy Digital Downloads displays a **Detected** badge when EDD is active on your site. Click the **Easy Digital Downloads** card to begin.

![Source selection screen showing EDD detected](./images/screenshot-01-source-selection.png)

::: info
WooCommerce and SureCart show as "Coming Soon" and are not yet selectable.
:::

---

## Step 2 — Compatibility Check

The compatibility check verifies your environment before migration starts.

![Compatibility check showing EDD 3.x detected and passing](./images/screenshot-02-compatibility.png)

**What it checks:**

- EDD 3.x is installed and active (verified via the `edd_orders` table).
- FluentCart is active.
- FluentCart Pro is active — only required if EDD Software Licensing is detected (`EDD_SL_PLUGIN_DIR`).

If any check fails, the error message explains what is missing. Resolve the issue, click **Back**, and re-select the source.

Click **Continue** once all checks pass.

---

## Step 3 — Pre-Migration Overview

The Overview screen shows a summary of your EDD store data and lets you select which migration steps to run.

![Pre-migration overview showing EDD stats grid and migration step checkboxes](./images/screenshot-03-overview.png)

**Stats grid** — counts for products, orders, customers, coupons, subscriptions, licenses, and transactions pulled directly from EDD.

**Payment Gateways / Order Statuses** — lists the gateways and statuses present in your EDD orders so you can anticipate what will be mapped.

**Migration Steps** — all steps are checked by default. You can deselect steps to skip them, though this is only recommended when resuming a partial migration.

If a previous migration exists, a **"Previous migration detected"** banner appears showing each step's status (`COMPLETED` in green). You can re-run individual steps from this screen — completed steps are always skipped automatically regardless.

Click **Start Migration** to begin.

---

## Step 4 — Running the Migration

The migration screen shows live progress for each step.

**Products, Tax Rates, and Coupons** complete in a single request each.

**Orders & Payments** runs in batches of 100 orders per 25-second window. A progress bar shows the current count, errors in the batch, and an estimated time remaining. Large stores may take several minutes to hours depending on order volume.

**Recount & Verify** runs five internal sub-steps: fix reactivations, fix subscription UUIDs, recount coupons, recount customer stats, and recount subscription bill counts. Each sub-step completes quickly.

**Pause and Resume** — you can pause at any time using the pause button. Progress is saved server-side and in browser session storage. If the page is refreshed during migration, it automatically resumes from where it left off.

---

## Step 5 — Completion

When all steps finish, you're returned to the intro screen with a completion summary.

![Completed migration summary with stats, step checkmarks, and backward-compat notice](./images/screenshot-04-completed.png)

The summary shows:

- **Completion date** — when the migration finished.
- **Stats** — final migrated counts for products, orders, customers, coupons, subscriptions, and licenses. Each stat is a link to the corresponding FluentCart list.
- **Step checkmarks** — green tags for Products, Tax Rates, Coupons, Orders, and Verified.
- **Backward-compat notice** — a reminder to keep the plugin active. See [After Migration](/migration/edd/#after-migration) for why this matters.

Click **View FluentCart Dashboard** to start working with your migrated data.

---

## Resetting a Migration

::: warning Dev Mode Required
The Reset function is only available when `FLUENT_CART_DEV_MODE` is defined. See [Enabling Dev Mode](/migration/edd/troubleshooting#fluent_cart_dev_mode) for setup instructions.
:::

When dev mode is active, a **Reset Migration** link appears on the Overview screen. Clicking it opens a confirmation modal that lists exactly what will be deleted.

![Reset Migration confirmation modal showing items to be deleted](./images/screenshot-05-reset-modal.png)

The modal shows:

- Products and variations
- Orders and transactions
- Customers and subscriptions
- Coupons
- Migration progress

Click **Yes, Reset Everything** to confirm. This drops and recreates all FluentCart database tables — **it cannot be undone**.

After resetting, migration can be run again from the beginning.

---

## Related Documentation

- [CLI Reference](/migration/edd/cli-reference) — All WP-CLI commands and flags
- [Troubleshooting & Reset](/migration/edd/troubleshooting) — Error logs, resume, and reset instructions
- [EDD Migration Overview](/migration/edd/) — Prerequisites and what gets migrated
- [All Migrations](/migration/) — Migration hub
