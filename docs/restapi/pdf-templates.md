---
title: PDF Templates API
description: FluentCart Pro REST API endpoints for receipt PDF templates, ZUGFeRD e-invoice seller details, and test PDF rendering.
---

# PDF Templates API

::: info Pro Feature
All PDF template endpoints require FluentCart Pro to be installed and activated.
:::

Manage the receipt PDF templates used for order receipts, renewal receipts, refund notices and proforma invoices; configure the ZUGFeRD / Factur-X e-invoice seller identity; and render a test PDF.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

Every route in this group lives under the `settings/` prefix, is guarded by `StoreSensitivePolicy`, and additionally requires `is_super_admin` — that is, `manage_options`. There is no finer-grained permission for these.

---

## Two prerequisites

**1. The Fluent PDF engine.** Rendering a PDF requires the Fluent PDF plugin, detected via the `FLUENT_PDF` constant. Template *editing* works without it; only `POST /settings/pdf-templates/download` needs it. Call `GET /settings/pdf-templates/status` first — when the engine is absent the response carries the add-on's install/activate state so a UI can offer a one-click install.

**2. Store settings, for e-invoicing.** Enabling ZUGFeRD requires a seller VAT ID *or* a legal registration ID, plus a store country. Both live in **Store Settings**, not in this payload — see the seller details section.

---

## Templates

Four templates ship by default:

| Slug | Title |
|------|-------|
| `order_receipt` | Order Receipt |
| `renewal_receipt` | Renewal Receipt |
| `refund_notice` | Refund Notice |
| `proforma_invoice` | Proforma Invoice |

They are marked `is_default: true` and **cannot be deleted**. Custom templates created through the API sit alongside them under their own generated slug.

A template's body is Gutenberg block markup built from `wp:fluent-cart/receipt-*` blocks, with <code v-pre>{{order.*}}</code> merge tags for the data:

```
<!-- wp:fluent-cart/receipt-header {"title":"RECEIPT"} /-->

<!-- wp:fluent-cart/receipt-addresses {"billingLabel":"BILL TO"} /-->

<!-- wp:fluent-cart/receipt-meta {"rows":[
  {"label":"Order Number","value":"{{order.invoice_no}}"},
  {"label":"Order Date","value":"{{order.created_at}}"}
]} /-->
```

Templates stored in the legacy format are migrated to the current block format transparently on read.

---

## A note on error codes

::: warning Most failures here are `422`, not `404`
This controller calls `sendError()` without an explicit status for nearly every failure, and the framework default is **422**. "Template not found" is therefore a `422`, not a `404`, and several distinct causes share one status — inspect the `message` to tell them apart.
:::

---

## Endpoints

### Get PDF Status

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/pdf-templates/status`

Reports whether the PDF engine is available.

```json
{
  "has_fluent_pdf": false,
  "addon_info": {
    "plugin_slug": "fluentforms-pdf",
    "plugin_file": "fluentforms-pdf/fluentforms-pdf.php",
    "source_type": "wordpress",
    "is_installed": false,
    "is_active": false
  }
}
```

`addon_info` is `null` when Fluent PDF is already active.

---

### List PDF Templates

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/pdf-templates/receipt`

Every template, keyed by slug, merged with the PDF status fields above.

---

### Get Saved Templates

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/pdf-templates/saved`

The same `templates` map, **without** the PDF status fields. Falls back to the defaults where nothing has been saved.

---

### Get Factory Default Templates

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/pdf-templates/factory-default`

The pristine shipped templates, ignoring saved customisations. Use this to power a "reset to default" action — diff against it, or overwrite the saved template with what it returns.

---

### Get PDF Template

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/pdf-templates/receipt/{template_id}`

One template with its block structure. Returns `422 Template not found` for an unknown slug.

---

### Save PDF Template

<badge type="tip">POST</badge> `/fluent-cart/v2/settings/pdf-templates/receipt/{template_id}`

Persists a template's block structure.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pdf_structure` | object | **Yes** | The block document. An empty value returns `422`. |

::: warning Wholesale replacement
`pdf_structure` is replaced entirely, not merged. Send the complete document — a partial edit will drop everything you omit.
:::

---

### Create PDF Template

<badge type="tip">POST</badge> `/fluent-cart/v2/settings/pdf-templates/create`

Creates a custom template and returns its generated `slug`, which you use for subsequent get/save/delete calls.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | **Yes** | Display title. Empty returns `422`. |

---

### Delete PDF Template

<badge type="danger">DELETE</badge> `/fluent-cart/v2/settings/pdf-templates/delete/{template_id}`

Deletes a custom template. Returns `422` when the template does not exist, when it is a protected built-in (`Default templates cannot be deleted`), or when the delete fails.

---

### Get Seller Details

<badge type="tip">GET</badge> `/fluent-cart/v2/settings/pdf-templates/seller-details`

The e-invoice seller identity, plus `store_country_set` and a deep link to the store settings screen.

---

### Save Seller Details

<badge type="tip">POST</badge> `/fluent-cart/v2/settings/pdf-templates/seller-details`

Saves the seller identity. Validation runs **before anything is written** and returns *all* failures at once, keyed by field:

```json
{
  "message": "Validation failed. Please correct the errors below.",
  "data": {
    "seller_vat_id": [
      "Seller VAT ID or Legal Registration ID is required when ZUGFeRD is enabled. Please add it in Settings → Store Settings."
    ],
    "seller_bank_iban": ["Please provide a valid IBAN."]
  }
}
```

Validation rules:

| Field | Rule |
|-------|------|
| `zugferd_enabled` | When `"1"`, requires a seller VAT ID **or** legal registration ID, **and** a store country — all read from Store Settings, not from this payload. |
| `seller_legal_registration_scheme` | Must be a valid ISO 6523 ICD code. |
| `seller_contact_email` | Must pass `is_email()` when non-empty. |
| `seller_bank_iban` | 2 letters + 2 digits + 4–30 alphanumerics, whitespace ignored. |

The store country requirement exists because **BT-40** (seller country code) is mandatory under EN 16931.

---

### Download PDF Preview

<badge type="tip">POST</badge> `/fluent-cart/v2/settings/pdf-templates/download`

Renders a test PDF and returns it base64-encoded.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `template_id` | string | No | Template to render. Defaults to `order_receipt`. |

```json
{
  "pdf_base64": "JVBERi0xLjcKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2c...",
  "filename": "order_receipt-INV-001042.pdf"
}
```

The sample is built from a **real order** — the most recent order with an invoice number, falling back to the most recent order of any kind. The rendered file is deleted from disk immediately after encoding, so no artifact is left behind and no URL is issued; decode `pdf_base64` client-side.

Returns `422` when Fluent PDF is inactive, the template does not exist, the store has no orders to sample, or rendering fails. Rendering failures are also written to the activity log.
