---
title: Migration Hub
description: Migrate your existing eCommerce store data to FluentCart. Choose your platform below.
---

# FluentCart Migration

The FluentCart Migrator plugin transfers your existing store data into FluentCart. Each migration source has its own dedicated guide.

## Available Migrations

### Easy Digital Downloads

Migrate products, orders, customers, subscriptions, licenses, coupons, and tax rates from EDD v3+.

- [Overview](/migration/edd/) — What gets migrated, prerequisites, install
- [Admin UI Guide](/migration/edd/admin-ui) — Visual step-by-step walkthrough
- [CLI Reference](/migration/edd/cli-reference) — All WP-CLI commands and flags
- [Troubleshooting & Reset](/migration/edd/troubleshooting) — Error logs, resume, reset

### WooCommerce

::: info Coming Soon
WooCommerce migration is under development.
:::

### SureCart

::: info Coming Soon
SureCart migration is under development.
:::

---

## General Notes

- The **FluentCart Migrator** plugin must stay active after migration for backward compatibility with legacy endpoints.
- Migration is always resumable — interrupted runs pick up where they left off.
- Both the Admin UI and WP-CLI produce identical results and share the same underlying migration logic.
