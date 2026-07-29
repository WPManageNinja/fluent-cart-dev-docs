---
title: Giving AI Agents the Full Power of Advanced Search — Without Bloating the Context Window
date: 2026-07-14
author: Shahjahan Jewel
authorTitle: Founder & Lead Developer
tags: [mcp, ai-agents, architecture]
description: Our admin has a filter engine with 28 filterable properties on orders alone. Exposing all of it to an AI agent would have cost thousands of tokens on every request. Here's the progressive-disclosure design that gave agents the same power for the price of one sentence per tool.
---

Every tool you hand an MCP agent is a tax. Its schema — every parameter, every
enum, every description — is loaded into the model's context on **every single
request**, whether the agent uses that tool or not. So when we set out to give
AI agents the same advanced search our admin UI has, we hit an uncomfortable
wall: the honest version of that feature is enormous, and the naive way to ship
it would have made every unrelated question — "how many orders today?" — drag a
few thousand tokens of filter grammar along for the ride.

This is the story of how we gave agents the *entire* advanced-search surface for
roughly one sentence of standing context per tool.

<!-- more -->

## The surface we were trying to expose

FluentCart's admin has a real filter engine. On the orders list alone it exposes
**28 filterable properties** — order status, payment status, totals, dates,
customer email and lifetime value, the products and variations an order
contains, transaction card metadata, UTM attribution, labels, license keys — and
each property carries its own set of legal operators (`in`, `not_in`, `>`,
`contains`, `days_within`, `before`…), its own value format, and sometimes a list
of enum options. Multiply that across five entities — orders, customers,
products, subscriptions, licenses — and you have hundreds of property
definitions.

That catalog is the feature. An agent that can't see it can't build
`(completed orders over $100 in the last 90 days) OR (customers whose email
contains "@acme.")`. But a catalog that large, inlined into tool schemas, is a
context disaster.

## The decision: describe the door, not the building

The core move was **progressive disclosure**. Instead of teaching every agent
everything up front, we teach it *where to look* and let it fetch the detail only
when it actually needs it.

Concretely, that became two pieces:

1. **One discovery tool, `get-search-schema`.** It takes a single `entity`
   argument and returns the full reference for that one entity on demand — every
   filterable property, its operators, its value format, its enum options, and a
   worked example the agent can copy.
2. **One lean parameter, `advanced_filters`,** added to each list tool. Its
   schema is a single sentence: *"condition groups {property, operator, value} —
   call get-search-schema first."*

The always-loaded cost of the whole feature is now that one parameter and one
sentence, per tool. The 28-property orders catalog only enters the context when
an agent is genuinely about to search orders — and even then, only the orders
catalog, not all five. We rejected the two obvious alternatives on the way here:
inlining the catalogs (the context bomb) and minting a dozen `search-orders-by-x`
tools (a different context bomb, plus a maintenance one).

## The decision that made it trustworthy: derive the schema live

A discovery endpoint is only useful if it tells the truth. The trap would have
been to hand-write the schema `get-search-schema` returns — a second description
of the filters that drifts out of sync with the engine the moment someone adds a
property.

So we don't hand-write it. The schema is built from the **same** source the
engine executes: each filter class's `advanceFilterOptions()`, read through the
`fluent_cart/{name}_filter_options` filter hook — the exact hook the admin list
runs. When the attributes module registers a new `attribute_term` filter through
that hook, it shows up in the agent's schema automatically, because the agent's
schema and the running query are reading the same catalog. Schema and behavior
**cannot** drift, because they are the same thing viewed from two angles.

## The decision to reuse, not reimplement

The advanced-search grammar — OR groups of AND conditions, relation filters,
cent conversion, relative dates — already lives in `BaseFilter`, the admin
filter engine. We could have reimplemented a "lite" version for the MCP layer.
We didn't. The bridge normalizes the agent's payload and hands it straight to
`BaseFilter::make(...)->buildQuery()`, the same entry point the admin list uses,
then layers the tool's own eager-loads, sorting, and pagination on top.

The payoff is a guarantee we could put in one sentence: **MCP search power equals
web-UI search power**, because it *is* the web UI's search, with no second
implementation to fall behind. And it all lives in the MCP module — the engine
in `app/Services` was never touched, only consumed through its public surface.

## What the agent actually sends

The agent sends a lean triple and nothing more:

```json
{
  "advanced_filters": [
    [
      { "property": "order.status",       "operator": "in",          "value": ["completed", "processing"] },
      { "property": "order.total_amount", "operator": ">",           "value": 100 },
      { "property": "order.created_at",   "operator": "days_within", "value": 90 }
    ],
    [
      { "property": "customer.customer_email", "operator": "=", "value": "jane@acme.com" }
    ]
  ]
}
```

The outer array is OR; each inner array is AND. What the agent does **not** send
is just as important: the engine-internal fields — which relation to join, which
column, which dispatch path — are never trusted from input. The bridge looks each
`property` up in the trusted catalog and fills those in itself. The agent
controls *what* to match; the catalog controls *how* it's matched. That single
rule is what keeps agent-authored strings from ever reaching a raw column name or
SQL operator.

## The decision to fail loud

Here's the subtle part, and the one most transferable to anyone building
agent-facing tools. The filter engine was built for a UI, where a human notices a
weird result and adjusts. It has two behaviors that are perfectly reasonable
there and quietly dangerous for an agent:

- it **silently skips** a malformed condition, and
- it **silently returns everything** when a required capability is inactive.

For a person, a filter that didn't apply is a visible non-event. For an agent, it
is a *confidently wrong answer*: it asked for "refunded orders over $9 quintillion,"
the condition silently overflowed and vanished, and it received all 5,140 orders
formatted as if they were the filtered set. The agent has no way to know. It will
summarize that number to a user as fact.

So the bridge validates everything before the engine ever runs. An unknown
property returns an error listing the valid ones. A bad operator returns the
operators that *are* allowed for that property. An out-of-range money value, a
malformed date, an empty relation value — each becomes a specific, structured
error the agent can read and correct from, instead of a silently mangled query.
Values that are merely *unusual* (an enum option we don't recognize) run, but
carry a warning back in the response. The guiding principle is one we now apply
across the whole MCP surface, including plain parameter handling: **an agent
should never be able to receive a wrong answer that looks right.** If we can't
honor the request, we say so; we don't guess.

## The three doors, and the self-correcting one

Put together, an agent meets the feature at three widening levels of detail:

1. **The tool list** it already has: the `advanced_filters` sentence tells it the
   capability exists and where the manual is.
2. **`get-store-context`**, the orientation call agents make first anyway, lists
   `get-search-schema` under discovery and says *when* to reach for it.
3. **`get-search-schema {entity}`** — the second call — delivers the full catalog
   for exactly one entity, on demand.

And if an agent skips the manual and guesses a property name wrong? The
validation error hands back the list of valid properties — an inline, just-in-time
mini-schema, delivered only in the failure case that needs it. The context is
spent precisely where a mistake was made, and nowhere else.

## The lesson

Context is a budget, and the instinct to "just expose everything so the agent is
capable" spends it in the worst possible place — uniformly, on every request,
mostly on tools the agent won't touch this turn. The alternative isn't giving the
agent less power. It's **deferring the description of that power until the moment
it's used**, deriving that description from the code that already exists so it
can't lie, and making every failure mode loud enough that the agent can recover.

We added the full admin filter engine to our AI tools and the standing context
cost barely moved. If you're building MCP tools over a large existing surface,
that's the pattern worth stealing: a thin, honest pointer in the always-loaded
schema, a live-derived manual one call away, and a validation layer that turns
the engine's convenient silences into errors an agent can actually learn from.
