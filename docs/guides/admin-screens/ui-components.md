---
title: UI Components
description: The fct-* buttons, inputs, selects, tables, dialogs and other controls that FluentCart registers for admin screens.
---

# UI Components

FluentCart registers 14 controls under the `fct-` prefix: buttons, inputs, selects, tables, dialogs and more. Use them in your screens instead of `<el-*>` tags.

::: info Requirements
FluentCart **X.Y.Z** or later, which sets `FLUENTCART_MODULE_API` to **3**. This is the same check as for the layout components (see [Admin Screens](./)).
:::

## Why fct-*

The `fct-*` components wrap Element Plus today. Their names, props, events and slots belong to FluentCart. When FluentCart moves to a different UI library, it rewrites the inside of each component, and your screens keep working.

An `<el-*>` tag talks to Element Plus directly. It still works today, but it breaks when Element Plus goes.

## No import

FluentCart registers the components on its admin app and on the customer portal app. Write the tag in your template and do not import anything:

```vue
<template>
  <fct-button type="primary" @click="save">{{ translate('Save') }}</fct-button>
</template>
```

They are not exported from `@fluent-cart/ui`. This also works in templates that FluentCart compiles in the browser, which cannot import anything.

::: warning Fallback bundles
A FluentCart before API 3 does not know these tags. The small fallback bundle you load on an older FluentCart (see [When FluentCart is too old](./#when-fluentcart-is-too-old)) must not use them.
:::

## Rules for every component

- **Only declared props reach the component.** Each component passes on the props listed on this page, plus `class` and `style` (and `data-*` attributes on `fct-button` and `fct-input`). Other attributes are ignored. This keeps your screen independent of Element Plus.
- **Write props in kebab-case** in templates: `active-value`, `field-key`, `confirm-button-text`.
- **`size`** takes `small` on every control that has a size. Buttons, inputs, selects and date pickers also take `x-small`.
- **`aria-label`** is a declared prop on the controls that need it. Use it when a control has no visible label.

## Field props

Every input (`fct-input`, `fct-select`, `fct-choice`, `fct-switch`, `fct-date-picker`) can draw its own label, help text and error. There is no form component: set these props on the input.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `label` | String | The label above the input. Its `for` points at the input. |
| `tooltip` | String | An info icon after the label. |
| `required` | Boolean | A `*` after the label. |
| `help` | String | A line of help text under the input. |
| `validation-errors` | Object | The errors object from a FluentCart REST response, for example `{fee: {required: 'The fee is required.'}}`. |
| `field-key` | String | The key in `validation-errors` that belongs to this input. |
| `id` | String | The input's id. Without one, the input gets a generated id when it has a label. |

```vue
<fct-input v-model="form.title" :label="translate('Title')" :tooltip="translate('Shown at checkout.')" required
           :help="translate('Up to 60 characters.')" :validation-errors="errors" field-key="title"/>
```

With none of these props set, the input renders alone. Inside a [SettingRow](./components#settingrow), leave `label` out and pass the row's `id`: the row already draws the label.

```vue
<SettingRow :label="translate('API key')" v-slot="{id, describedBy}">
  <fct-input :id="id" :aria-describedby="describedBy" v-model="apiKey"/>
</SettingRow>
```

## fct-button

```vue
<fct-button type="primary" :loading="saving" @click="save">{{ translate('Save') }}</fct-button>
<fct-button size="small" :to="{name: 'gift_wrap_settings'}">{{ translate('Settings') }}</fct-button>
```

- **Props:** `type` (`primary`, `success`, `warning`, `danger`, `info`), `size`, `disabled`, `loading`, `plain`, `text`, `link`, `soft` (FluentCart's lighter style), `to` (a route: the button becomes a router link), `tag="a"` with `href`, `target` and `rel`, `id`, `title`, `aria-label`, `aria-expanded`, `aria-controls`, `aria-haspopup`, `aria-busy`.
- **Event:** `click`. **Slot:** default (the text).

## fct-input

Text, password, textarea and number fields in one component.

```vue
<fct-input v-model="note" type="textarea" :rows="3" :placeholder="translate('We hand-write every message.')"/>
<fct-input v-model="limit" type="number" :min="20" :max="500" :step="10"/>
```

- **Props:** `v-model`, `type` (`text`, `password`, `textarea`, `number`, `email`, `url`), `placeholder`, `size`, `disabled`, `readonly`, `clearable`, `show-password`, `rows`, `autosize`, `maxlength`, `minlength`, `show-word-limit`, `autocomplete`, `autofocus`, `spellcheck`, `inputmode`, `aria-label`, `aria-describedby`, `aria-invalid`, and the [field props](#field-props).
- **`type="number"`** is a stepper with minus and plus buttons, and `v-model` gives a Number. It takes `min`, `max`, `step`, `precision` and `controls-position="right"`. `:controls="false"` gives a plain number box instead (its value is a String). With `precision` set, the plain box rounds and its value is a Number.
- **Events:** `change`, `input`, `clear`, `focus`, `blur`, `click`, `keyup`, `keydown`, `keypress`.
- **Slots:** `prefix`, `suffix`, `prepend`, `append`. A stepper has `prefix`, `decrease-icon` and `increase-icon`.
- **Ref methods:** `focus()`, `blur()`, `select()`.

## fct-select

```vue
<fct-select v-model="country" filterable clearable :placeholder="translate('Select a country')"
            :options="[{label: translate('Germany'), value: 'DE'}, {label: translate('France'), value: 'FR'}]"/>
```

- **`options`:** `[{label, value, disabled}]`, or groups: `[{label, options: [...]}]`. There is no option component.
- **Props:** `v-model`, `placeholder`, `size`, `disabled`, `clearable`, `filterable`, `multiple`, `collapse-tags`, `allow-create`, `value-key` (for object values), `remote` with `remote-method` and `loading`, `no-data-text`, `no-match-text`, `aria-label`, and the [field props](#field-props).
- **Events:** `change`, `visible-change`, `clear`, `remove-tag`, `focus`, `blur`.
- **Slots:** `option` (receives `{option}`, replaces each option's content), `prefix`, `header`, `footer`, `empty`, `loading`.

```vue
<fct-select v-model="paper" :options="papers">
  <template #option="{option}">
    <span class="gift-wrap-swatch" :style="{background: option.swatch}"></span> {{ option.label }}
  </template>
</fct-select>
```

## fct-choice

Checkboxes and radios. Without `options` it is one checkbox. With `options` it is a group.

```vue
<fct-choice v-model="settings.notify" true-value="yes" false-value="no">{{ translate('Email me new orders') }}</fct-choice>

<fct-choice v-model="settings.style" type="radio" :label="translate('Style')"
            :options="[{label: translate('Classic'), value: 'classic'}, {label: translate('Kraft'), value: 'kraft'}]"/>
```

- **One checkbox:** `v-model`, `true-value`, `false-value`, `indeterminate`. The default slot is its text.
- **A group:** `options` (`[{label, value, disabled}]`), `type` (`checkbox` or `radio`), `button` (draws the options as a button bar), `border` (radios only). `v-model` is an array for checkboxes and one value for radios.
- **Props for both:** `size`, `disabled`, `aria-label`, and the [field props](#field-props). With `label`, the group is labelled by it.
- **Events:** `change`; `click` with the event and the option.
- **Slot `option`** receives `{option}` and replaces the option's text.

## fct-switch

```vue
<fct-switch v-model="settings.enabled" active-value="yes" inactive-value="no" :aria-label="translate('Enable gift wrap')"/>
```

- **Props:** `v-model`, `active-value`, `inactive-value`, `active-text`, `inactive-text`, `before-change` (return `false` or a rejected promise to stop the toggle), `loading`, `size`, `disabled`, `aria-label`, and the [field props](#field-props).
- **Event:** `change`.

## fct-date-picker

```vue
<fct-date-picker v-model="range" type="daterange" value-format="YYYY-MM-DD"
                 :start-placeholder="translate('Start date')" :end-placeholder="translate('End date')"/>
```

- **Props:** `v-model`, `type` (`date`, `datetime`, `daterange`), `placeholder`, `start-placeholder`, `end-placeholder`, `range-separator`, `format`, `value-format`, `default-value`, `disabled-date`, `shortcuts`, `clearable`, `unlink-panels`, `size`, `disabled`, `aria-label`, and the [field props](#field-props).
- **Event:** `change`. **Ref method:** `focus()`.

## fct-dropdown

A menu. The default slot is the trigger. The menu items come from `items`.

```vue
<fct-dropdown trigger="click" placement="bottom-end" @command="onCommand"
              :items="[{command: 'edit', label: translate('Edit')}, {command: 'delete', label: translate('Delete'), danger: true, divided: true}]">
  <fct-button size="small">{{ translate('More') }}</fct-button>
</fct-dropdown>
```

- **`items`:** `[{command, label, icon, disabled, danger, divided, href, target, class}]`. `danger` draws the item in red. An item with `href` is a link.
- **Props:** `trigger` (`hover` or `click`), `placement`, `disabled`, `hide-on-click`.
- **Events:** `command` (the picked item's `command`), `visible-change`.
- **Slot `item`** receives `{item}` and replaces an item's content.

## fct-tooltip

```vue
<fct-tooltip :content="translate('Charged once per order')" :trigger="['hover', 'focus']">
  <fct-button text :aria-label="translate('About the fee')">?</fct-button>
</fct-tooltip>
```

- **Props:** `content`, `placement` (default `top`), `trigger` (`hover`, `click`, `focus`, or an array of them), `disabled`, `show-after`, `hide-after`, `popper-class` (added next to FluentCart's tooltip class).
- **Slots:** default (the element the tooltip belongs to), `content` (rich content).

## fct-popover

A panel next to an element. With `confirm`, it asks a yes/no question.

```vue
<fct-popover confirm :title="translate('Delete this paper?')" confirm-button-type="danger"
             :confirm-button-text="translate('Delete')" :cancel-button-text="translate('Cancel')" @confirm="remove(paper)">
  <template #reference>
    <fct-button size="small" type="danger" plain>{{ translate('Delete') }}</fct-button>
  </template>
</fct-popover>
```

- **Props for both:** `placement`, `width`, `disabled`, `popper-class`.
- **A panel:** `trigger` (`hover`, `click`, `focus`, `contextmenu`), `show-arrow`, `role`, and `v-model:visible` to open it from code. Slot default is the panel content.
- **With `confirm`:** `title`, `confirm-button-text`, `cancel-button-text`, `confirm-button-type` (`primary` or `danger`). Events `confirm` and `cancel`.
- **Slot `reference`:** the element it opens from. **Ref method:** `hide()`.

## fct-dialog

A modal dialog. With `drawer`, the same panel slides in from the side.

```vue
<fct-dialog v-model="open" :title="translate('Add paper')" width="480px">
  <fct-input v-model="name" :label="translate('Name')"/>
  <template #footer>
    <fct-button @click="open = false">{{ translate('Cancel') }}</fct-button>
    <fct-button type="primary" @click="add">{{ translate('Add') }}</fct-button>
  </template>
</fct-dialog>
```

- **Props:** `v-model`, `title`, `width` (the drawer's width with `drawer`, default 30%), `drawer`, `append-to-body`, `destroy-on-close`, `close-on-click-modal`, `close-on-press-escape`, `show-close`, `before-close`. Dialog only: `align-center`, `center`, `fullscreen`. Drawer only: `with-header`.
- **Events:** `open`, `opened`, `close`, `closed`.
- **Slots:** default (the body), `header`, `footer`.
- The dialog traps focus, closes on Esc and returns focus to where it was.

## fct-table and fct-table-column

```vue
<fct-table :data="orders" :loading="loading" :default-sort="{prop: 'date', order: 'descending'}">
  <fct-table-column prop="number" :label="translate('Order')" width="120"/>
  <fct-table-column prop="date" :label="translate('Date')" sortable/>
  <fct-table-column :label="translate('Total')" align="right">
    <template #default="{row}">{{ CurrencyFormatter.formatFixed(row.total) }}</template>
  </fct-table-column>
  <template #empty>{{ translate('No orders yet') }}</template>
</fct-table>
```

- **Table props:** `data`, `loading` (a loading layer over the table), `loading-text`, `default-sort`, `row-key`, `row-class-name`, `size`, `stripe`, `border`, `show-header`, `max-height`, `empty-text`, `show-summary` with `summary-method`, `span-method`, `cell-style`, `default-expand-all`, `aria-label`.
- **Table events:** `sort-change`, `row-click` (row, event), `expand-change` (row, expanded), `selection-change`.
- **Table slot:** `empty`. **Ref methods:** `toggleRowSelection()`, `toggleRowExpansion()`, `clearSelection()`.
- **Column props:** `prop`, `label`, `width`, `min-width`, `sortable`, `sort-method`, `align`, `header-align`, `fixed`, `type` (`expand` or `selection`), `selectable`, `class-name`, `show-overflow-tooltip`.
- **Column slots:** default (the cell, receives `{row, index}`), `header`.

## fct-skeleton

A placeholder while data loads.

```vue
<fct-skeleton v-if="loading" :rows="4" animated/>
```

- **Props:** `rows` (default 3), `animated`, `aria-label`.
- **`variant`** draws one bar instead of rows: `text`, `p`, `h1`, `h3`, `caption`, `button`, `image`, `circle` or `rect`.
- **Default slot:** your own layout, built from `variant` items.

```vue
<fct-skeleton animated>
  <fct-skeleton variant="h3" style="width: 40%"/>
  <fct-skeleton variant="p"/>
</fct-skeleton>
```

## fct-progress

```vue
<fct-progress :percentage="62" :stroke-width="8" status="success"/>
```

- **Props:** `percentage` (required), `show-text`, `stroke-width`, `text-inside`, `status` (`success`, `exception`, `warning`), `striped`, `striped-flow`, `duration`.
- **Default slot:** replaces the text. It receives `{percentage}`.

## Still el-* for now

These have no `fct-*` component yet. Keep the `<el-*>` tag:

- `el-breadcrumb`, `el-tag`, `el-alert`, `el-tabs`, `el-icon`, `el-empty`, `el-timeline`, `el-steps`, `el-tree-select`, `el-upload`, `el-color-picker`.
- Forms that use Element Plus validation (`rules` and `validate()`) or labels beside the inputs. Keep `el-form` and `el-form-item` there.

For alerts, badges and empty states, the layout components already have [`Alert`](./components#alert), `Badge` and [`EmptyState`](./components#emptystate).
