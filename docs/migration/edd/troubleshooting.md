---
title: Troubleshooting & Reset
description: How to view error logs, resume a stalled migration, reset migrated data, and enable FLUENT_CART_DEV_MODE.
---

# Troubleshooting & Reset

## Viewing Error Logs

Failed orders during payment migration are logged without stopping the batch. You can review them at any point.

### Admin UI

On the completion summary, the **Orders** step tag shows a failure count in parentheses. Click it to expand the error log table inline.

| Column | Description |
|--------|-------------|
| EDD Payment ID | The EDD order ID that failed |
| Stage | Where the failure occurred: `data_setup`, `validation`, or `migration` |
| Message | The error description |

### WP-CLI

```bash
wp fluent_cart_migrator migrate_from_edd --log
```

Prints the raw `_fluent_edd_failed_payment_logs` WP option. Each entry is keyed by EDD payment ID.

---

## Resuming a Stalled Migration

Migration tracks each step independently. If interrupted, you can resume without re-running completed steps.

### Admin UI

Go to **FluentCart → Migration** and click the **Easy Digital Downloads** card. The Overview screen shows a "**Previous migration detected**" banner with each step's status (green `COMPLETED` tags for finished steps). Select the steps you want to run and click **Resume Migration** — completed steps are skipped automatically regardless of what is checked.

### WP-CLI

Re-run the command. Completed steps are skipped:

```bash
# Resume all remaining steps
wp fluent_cart_migrator migrate_from_edd --all

# Resume only the payments step (picks up from the last completed page)
wp fluent_cart_migrator migrate_from_edd --payments
```

For the payments step specifically, the migrator stores `last_order_page` in the migration state option. Re-running `--payments` reads this value and starts from the next page automatically.

---

## Resetting a Migration

Reset wipes all FluentCart data and migration state so you can start fresh. This is irreversible.

### `FLUENT_CART_DEV_MODE`

Most reset paths require the `FLUENT_CART_DEV_MODE` constant. This safety gate exists because resetting drops and recreates all FluentCart database tables — a destructive operation that must be intentional. Without this constant, the Admin UI reset button is hidden and the standalone `wp fluent_cart_migrator reset` command returns an error.

**To enable:**

Add this to your `wp-config.php`:

```php
define('FLUENT_CART_DEV_MODE', true);
```

**What it unlocks:**

- Reset button in the Admin UI Overview step
- `wp fluent_cart_migrator reset` standalone CLI command
- `POST fct-migrator/v1/reset` REST API endpoint

**Recommendation:** Enable the constant only when you intend to reset. Remove it from `wp-config.php` when done to prevent accidental resets.

---

### Reset via Admin UI

Requires `FLUENT_CART_DEV_MODE`.

1. Go to **FluentCart → Migration** and click the **Easy Digital Downloads** card.
2. On the Overview screen, click **Reset Migration** (visible only when dev mode is active).
3. Review the list of items to be deleted in the confirmation modal.
4. Click **Yes, Reset Everything** to confirm.

---

### Reset via WP-CLI

**With `FLUENT_CART_DEV_MODE`:**

```bash
wp fluent_cart_migrator reset
```

**Without the constant** (confirmation prompt only, no constant required):

```bash
wp fluent_cart_migrator migrate_from_edd --reset
```

::: info
`migrate_from_edd --reset` calls the wipe function directly without checking `FLUENT_CART_DEV_MODE`. It still prompts for confirmation. Use this on environments where adding a constant to `wp-config.php` is not practical.
:::

---

### What Reset Deletes

| Item | Details |
|------|---------|
| Migration state | `__fluent_cart_edd3_migration_steps` — step completion flags and `last_order_page` |
| Error log | `_fluent_edd_failed_payment_logs` — failed payment records |
| Migration summary | `__fluent_cart_migration_summary` — the completion summary shown on the intro screen |
| Activation flag | `fluent_cart_plugin_once_activated` |
| FluentCart database | All `fct_*` tables are dropped and recreated via `DBMigrator::refresh()` |
| Products | All `fluent-products` WP posts and their postmeta |
| EDD mapping meta | `_edd_migrated_from`, `_fcart_migrated_id`, `__edd_migrated_variation_maps` postmeta keys removed from EDD download posts |

After reset, migration can be run again from step 1.

---

## Backward Compatibility

After migration, **keep the FluentCart Migrator plugin active**. It handles requests that still target legacy EDD endpoints.

| Endpoint | Why It's Needed |
|----------|----------------|
| **License API** | Public `activate`, `deactivate`, and `check-license` endpoints route through the migrator to FluentCart's license system. |
| **PayPal IPN** | Renewal payment notifications for subscriptions originally created via EDD's PayPal gateway. |
| **Stripe webhooks** | Charge ID lookups for legacy EDD orders when Stripe sends webhook events. |
| **Download & renewal URLs** | EDD-style download and renewal links embedded in old email receipts. |

Deactivating the plugin will silently break these integrations — no error is thrown, the request simply fails.

---

## Common Issues

**Products not appearing after migration**
Confirm EDD is fully active and that `wp_posts` contains rows with `post_type = 'download'`. Run `--stats` to see the product count EDD reports.

**Orders failing in batch**
View the error log. Most failures are isolated to specific orders with bad data (missing customer email, unmapped product IDs). The migrator skips the failed order and continues — you do not need to re-run the full payments step for these.

**Payments resuming from the wrong page**
The page counter is stored in the `__fluent_cart_edd3_migration_steps` WP option. Inspect it directly:

```bash
wp option get __fluent_cart_edd3_migration_steps
```

**Tax rates not mapped**
Rates are matched by country + state. If your EDD rates use country codes that don't exist in FluentCart's country list, they are skipped. Check the output of `--tax_rates` for a list of countries that were mapped.

**License verification issues**
Run `--verify_license` after migration for a detailed list of discrepancies. Status mismatches are usually caused by subscriptions that expired or were cancelled between EDD and FluentCart's import.

---

## Related Documentation

- [Admin UI Guide](/migration/edd/admin-ui) — Step-by-step visual walkthrough with screenshots
- [CLI Reference](/migration/edd/cli-reference) — All WP-CLI commands and flags
- [Migration Overview](/migration/edd/) — Prerequisites and what gets migrated
