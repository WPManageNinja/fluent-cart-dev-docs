---
title: Why FluentCart Uses a Custom Database Schema, Not WooCommerce's
date: 2026-07-10
author: Shahjahan Jewel
authorTitle: Founder & Lead Developer
tags: [architecture, database, performance]
description: The postmeta pattern is where e-commerce reporting goes to die. Here's why FluentCart stores orders in purpose-built tables — and what that trade-off costs us.
---

The most consequential decision we made in FluentCart wasn't a feature. It was
refusing to store orders in `wp_posts`. Every architectural property people
notice about FluentCart — fast admin lists, honest reports, subscriptions that
don't fall over — traces back to that one call.

<!-- more -->

## The postmeta tax

Classic WordPress e-commerce modeling stores an order as a post of type
`shop_order` and everything about it — totals, customer, addresses, statuses,
gateway references — as rows in `wp_postmeta`. It's the entity–attribute–value
pattern: one table, three columns, infinite flexibility.

The flexibility is real. So is the bill:

- **Every attribute is a `LONGTEXT`.** Order totals are strings. Dates are
  strings. Compare, sum, or sort them and MySQL casts row by row, index-free.
- **Every attribute is a join.** "Orders over $100 from Germany last month"
  means three self-joins on a table with tens of millions of rows before your
  store is even big.
- **Nothing is enforced.** No types, no foreign keys, no NOT NULL. Data quality
  becomes a convention maintained by whichever plugin wrote last.

WooCommerce itself acknowledged this — HPOS (custom order tables) is the
largest migration project in its history, and it has to maintain compatibility
with a decade of extensions reading `wp_postmeta` directly. That is not a
criticism; it's the strongest evidence available that the schema matters and
that retrofitting one is brutally expensive. We had the luxury of starting
clean, so we did.

## What we built instead

FluentCart ships its own tables, created by real migrations:
`fct_orders`, `fct_order_items`, `fct_order_transactions`, `fct_customers`,
`fct_subscriptions`, `fct_carts`, and friends — typed columns, proper indexes,
managed by an Eloquent-style ORM from the WPFluent framework. The full map is
in the [database schema docs](/database/schema).

A few decisions inside that schema do a lot of the heavy lifting:

**Money is a `BIGINT`, in cents.** Not a float, not a decimal string in a meta
row. Floating-point money leaks pennies at scale, and string money can't use an
index. Every amount passes through `Helper::toCent()` on the way in and
`Helper::toDecimal()` on the way out. Summing a year of revenue is `SUM()` on
an indexed integer column.

**Timestamps are UTC, always.** Everything is stored via `DateTime::gmtNow()`
and converted at the display edge. Server timezone changes, DST, a store owner
moving from Dhaka to Denver — none of it silently shifts your revenue-by-day
report.

**Customers are first-class, decoupled from `wp_users`.** A customer row
carries purchase count, lifetime value, and addresses, and only optionally
links to a WordPress user. Guest checkout doesn't require conjuring user
accounts, and LTV is a column you can sort by, not a nightly aggregation job.

**Subscriptions are rows, not order metadata.** A subscription has its own
lifecycle, its own table, and its own transactions trail. When a renewal
payment lands, we update a typed row and dispatch a domain event — we don't
append another meta blob to a post.

## What it costs

Honesty requires the other column. Walking away from `wp_posts` means walking
away from the ecosystem that assumes it:

- **No WooCommerce plugin compatibility.** The thousands of Woo extensions
  don't work with FluentCart. Integrations get built against our
  [REST API](/restapi/) and [hooks](/hooks/actions) instead — deliberately,
  one at a time.
- **We own every migration.** Schema changes ship as versioned migrations we
  write and test. There's no "it's just postmeta, add a key" escape hatch.
- **Tooling assumptions break.** Generic WP export/backup/search plugins that
  only understand posts see nothing. We have to provide our own answers.

We think it's a good trade because the costs are one-time and ours, while the
postmeta tax compounds forever and lands on every store owner.

## Where it pays off

Open the FluentCart reports screen on a store with a few hundred thousand
orders. Revenue by period, new-versus-returning customers, subscription
cohorts, refund rates — each of those is a straightforward indexed query
against typed columns. That's the whole story. There is no caching layer
heroically hiding an EAV swamp, because there's no swamp.

The same schema is what makes the [REST API](/restapi/) resources clean:
an order serializes from a row and its relations, not from a bag of meta keys
with three naming conventions.

If you're building on FluentCart, start with the
[schema documentation](/database/schema) and the
[model reference](/database/models) — the database is the real API contract,
and unlike a postmeta store, this one is written down.
