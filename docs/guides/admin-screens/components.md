---
title: Layout Components
description: Page, Section, SettingRow, List, SortableList and the other layout components that @fluent-cart/ui exports for admin screens.
---

# Layout Components

Import these from `@fluent-cart/ui` in a screen that FluentCart loads (see [Admin Screens](./)). FluentCart's own screens use the same components, so your screen matches them in spacing, headings, dark mode and right-to-left layouts.

```js
import {Page, Section, Title, SettingRow, List, ListItem, SortableList, KeyValueList, KeyValue,
    StatGrid, StatTile, EmptyState, DetailLayout, Alert, FluidTab} from '@fluent-cart/ui';
```

::: info Requirements
FluentCart **X.Y.Z** or later. `Card`, `Badge`, `Empty`, `PageHeading` and `Heading` exist in earlier versions and keep working.
:::

## Rules for every component

- **Your class stays on the root.** `<Section class="gift-wrap-papers">` renders `class="fct-section … gift-wrap-papers"`. Use your own prefixed class for screen-specific CSS.
- **Rich content goes in slots.** A prop takes plain text or one fixed choice. For links, badges or icons, use the slot of the same name.
- **Headings are automatic.** `Page` renders the only `h1`. Each `Section` inside it is one level lower, down to `h4`.
- **Translate in your screen.** Pass `translate('…')` results to the props. The components translate only their own default text.

## Page

The screen wrapper: header, then content.

```vue
<Page :title="translate('Gift Wrap')" :breadcrumbs="[{label: translate('Settings'), to: {name: 'settings'}}]">
  <template #status><Badge status="active" :text="translate('Active')"/></template>
  <template #actions><el-button type="primary">{{ translate('Save') }}</el-button></template>
  <Section :title="translate('Settings')">…</Section>
</Page>
```

| Prop | Type | Default | Notes |
| ---- | ---- | ------- | ----- |
| `title` | String | | The page's `h1`. |
| `description` | String | | A line under the title. |
| `breadcrumbs` | Array of `{label, to}` | `[]` | Parent pages, outermost first. The title is the last step. |
| `header` | `'default'` \| `'bar'` | `'default'` | `bar` draws the white header strip that settings screens use. |

| Slot | Use |
| ---- | --- |
| `title` | Rich title, still inside the `h1`. |
| `status` | Badges next to the title. |
| `actions` | Buttons on the right. They wrap on narrow screens. |
| `leading` | Content before the title, outside the `h1` (for example a menu button). |
| default | The page content. Children are 30px apart. |

## Section

The default content block. A top-level section is a card. A section inside another section is a sub-section: no second card, a divider above it, and a heading one level lower.

```vue
<Section :title="translate('Shipping')" :description="translate('Where you ship')" divided>
  <template #actions><el-button size="small">{{ translate('Add zone') }}</el-button></template>
  …
  <Section :title="translate('Defaults')">…</Section>
</Section>
```

| Prop | Type | Default | Notes |
| ---- | ---- | ------- | ----- |
| `title` | String | | The heading. Without a title, there is no header and the section is a plain `div`. |
| `description` | String | | Text under the title. |
| `size` | `'md'` \| `'sm'` | `'md'` | `sm` for sidebars and dense cards. |
| `flush` | Boolean | `false` | No body padding, for tables and lists that touch the edges. |
| `divided` | Boolean | `false` | A line between header and body. |

Slots: `title`, `description`, `actions`, default (body), `footer` (top level only).

The section is labelled by its own heading, so screen readers list it by name.

## Title

A heading. `level` sets the tag, `size` sets the look.

| Prop | Type | Default | Notes |
| ---- | ---- | ------- | ----- |
| `level` | 1–6 | parent level + 1 | The `h1`–`h6` tag. Inside a `Section`, it is one level below the section. |
| `size` | `'lg'` \| `'md'` \| `'sm'` \| `'xs'` | from the level | `xs` is the small muted sidebar heading. |

## SettingRow

One setting: label and help text on the left, control on the right. The row connects the label to your control, so pass the `id` it gives you.

```vue
<SettingRow :label="translate('API key')" :description="translate('From your carrier dashboard')" v-slot="{id, describedBy}">
  <el-input :id="id" :aria-describedby="describedBy" v-model="apiKey"/>
</SettingRow>
```

| Prop | Type | Default | Notes |
| ---- | ---- | ------- | ----- |
| `label` | String | required | |
| `description` | String | | Help text under the label. |
| `error` | String | | Shown under the control in red. Screen readers announce it. |
| `layout` | `'columns'` \| `'inline'` \| `'toggle'` | `'columns'` | `columns`: a 300px label column. `inline`: a lone switch or number box on the right edge. `toggle`: a feature switch before its label. |
| `group` | Boolean | `false` | For radio and checkbox groups. The row becomes a group labelled by the label, instead of a `<label for>`. |

| Slot | Use |
| ---- | --- |
| default | The control. It receives `{id, describedBy}`. |
| `label`, `description` | Rich versions of the props. The description can hold links and buttons. |

- **Switches:** `el-switch` takes the `id`, but it does not pass `aria-describedby` to its input. The label still names the switch.
- **Required fields:** put `<LabelHint :title="…" :required="true"/>` in the `label` slot.
- Rows are separated by a divider, except the last one.

## List and ListItem

Rows with an icon or logo, a title, a line of text and actions.

```vue
<List>
  <ListItem v-for="method in methods" :key="method.id" :title="method.name" :meta="method.description">
    <template #media><img :src="method.logo" alt=""/></template>
    <template #badges><Badge :status="method.active ? 'active' : 'disabled'" :text="method.status_label"/></template>
    <template #actions><el-button size="small">{{ translate('Manage') }}</el-button></template>
  </ListItem>
</List>
```

`List` renders a `<ul>` and has no props. `ListItem` renders an `<li>`.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `title` | String | The main line. |
| `meta` | String | The line under the title (14px, muted). |
| `to` | Object | A route. The title becomes a link. |

| Slot | Use |
| ---- | --- |
| `handle` | Before everything, for the drag handle of a [SortableList](#sortablelist). |
| `media` | Logo, icon or avatar. Images are 24px high. |
| `title`, `meta` | Rich versions of the props. |
| `badges` | Status badges after the title. |
| default | Extra content under the meta line. |
| `aside` | A value on the right (price, count, date). |
| `actions` | Buttons on the far right. |

A clickable row is fine (`<ListItem @click="open(item)">`), but keep a button or link in it for keyboard users.

## SortableList

A list the user can reorder by dragging or with the arrow keys.

```vue
<SortableList v-model="methods" item-key="id"
              :handle-label="method => translate('Reorder %1$s', method.name)"
              @reorder="saveOrder">
  <template #item="{item, handle}">
    <ListItem :title="item.name">
      <template #handle><component :is="handle"/></template>
    </ListItem>
  </template>
</SortableList>
```

| Prop | Type | Default | Notes |
| ---- | ---- | ------- | ----- |
| `modelValue` | Array | required | Use `v-model`. Each move gives you a new array. |
| `itemKey` | String \| Function | `'id'` | A field name, or `(item, index) => key` for items without an id. |
| `handleLabel` | Function | generic text | `(item) => ` the handle's accessible name. |
| `disabled` | Boolean | `false` | No drag and no arrow-key moves. |
| `filter` | Function | | `(item) => false` hides an item but keeps its place in the order, for search. |
| `tag` | String | `'ul'` | Use `'div'` when your items are not `ListItem`s. |

- **Event:** `reorder`, with the new array, after each drag or arrow-key move. Save the order in this handler.
- **Slot `item`** receives `{item, index, handle}`. Put `<component :is="handle"/>` where the drag grip goes.
- **The handle** is a button. Arrow Up and Arrow Down move the row, focus stays on the handle, and screen readers hear "Moved to position 2 of 3".
- **A `class` on `SortableList`** goes on the list element itself, so `.my-list > .my-row` selectors work.

## KeyValueList and KeyValue

Read-only label and value pairs, for example an order summary.

```vue
<KeyValueList>
  <KeyValue :label="translate('Status')" :value="order.status_label"/>
  <KeyValue :label="translate('Paid')" :value="order.paid_at"/>
</KeyValueList>
```

- `KeyValueList` renders a `<dl>`. Prop `layout`: `'row'` (label left, value right, the default) or `'stacked'`.
- `KeyValue` props `label` and `value`. Slots `label` and default for rich content. An empty value (`null`, `''`) shows "—"; `0` shows as `0`.
- Format money yourself: `CurrencyFormatter.formatFixed(amountInCents)` from `@fluent-cart/ui` (always shows the decimals, for example "$2.00"). FluentCart stores amounts in cents.

## StatGrid and StatTile

Summary numbers at the top of a report or dashboard.

```vue
<StatGrid :columns="3">
  <StatTile :label="translate('Gross sales')" :value="CurrencyFormatter.formatFixed(totalInCents)" :loading="loading"/>
  <StatTile :label="translate('Orders')" :value="count"/>
</StatGrid>
```

- `StatGrid` renders a `<dl>`. Prop `columns` fixes the number of columns on wide screens; without it, tiles fill the row.
- `StatTile` props: `label` (required), `value`, `icon` and `loading`. The loading state has the same size as the loaded tile. Slots: `trend` and `footer`.

## EmptyState

What a screen or section shows when it has no data.

```vue
<EmptyState :title="translate('No packages yet')" :text="translate('Add a box size to get accurate rates.')">
  <template #actions><el-button type="primary">{{ translate('Add package') }}</el-button></template>
</EmptyState>
```

| Prop | Type | Default | Notes |
| ---- | ---- | ------- | ----- |
| `variant` | `'empty'` \| `'no-results'` | `'empty'` | `no-results`: data exists, but the search or filter hides it. It has default text. |
| `title`, `text` | String | | Say what will show here and how to add the first item. |
| `icon` | String | `Empty/ListView` | An illustration name. |
| `size` | `'md'` \| `'sm'` | `'md'` | `sm` is compact and has no illustration. |

## DetailLayout

A detail screen: the main column and a 360px sidebar. Below 1360px, the sidebar moves under the main column.

```vue
<DetailLayout>
  <Section :title="translate('Items')">…</Section>
  <template #sidebar>
    <Section :title="translate('Customer')" size="sm">…</Section>
  </template>
</DetailLayout>
```

## Alert

A message with an optional close button.

```vue
<Alert type="warning" icon="AlertIcon" :content="translate('Your API key expires in 3 days.')" closable @close="hide"/>
```

- Props: `type` (`info`, `success`, `warning` or `error`), `content`, `icon` and `closable`. Slot `content` for rich text.
- The close button is a real button labelled "Dismiss". It emits `close`; your screen hides the alert.

## FluidTab

A switch between a few views, for example Day, Week and Month on a chart.

```vue
<FluidTab.Tab small>
  <FluidTab.Item :label="translate('Day')" class="active" @click="period = 'day'"/>
  <FluidTab.Item :label="translate('Week')" @click="period = 'week'"/>
</FluidTab.Tab>
```

- Give the selected item the `active` class when the screen loads.
- Each item is a button. Screen readers hear which one is selected.

## CoreUpdateCard

The card your screen shows when FluentCart is older than your add-on needs. It shows your title and reason, the installed FluentCart version, an **Update FluentCart** button for site administrators (it opens the Plugins page, filtered to FluentCart), and "Ask a site administrator to update FluentCart." for other users.

```vue
<Page :title="translate('Gift Wrap')">
  <CoreUpdateCard
      :title="translate('Update FluentCart to manage gift wraps')"
      :text="translate('This version of Gift Wrap needs a newer FluentCart.')"
      :note="translate('Checkout keeps offering gift wrap in the meantime.')"
  />
</Page>
```

| Prop | Type | Default | Notes |
| ---- | ---- | ------- | ----- |
| `title` | String | required | What the user cannot do until they update. |
| `text` | String | required | Why, in your add-on's words. |
| `note` | String | `''` | What keeps working meanwhile. Leave it out when nothing does. |

- Use it in a small fallback bundle, not in your main screens. See [When FluentCart is too old](./#when-fluentcart-is-too-old).
- It exists from module API 3. An add-on that needs only API 3 cannot use it on an older FluentCart: show an admin notice there instead.

## Charts

For charts, see [Charts](./charts): the shared ECharts module, the report colors and the chart helpers.

## Design tokens

Use these CSS variables in your own CSS. They change for dark mode by themselves.

| Variable | Role |
| -------- | ---- |
| `--fct-surface` | Card and section background |
| `--fct-surface-subtle` | Header bars and hover rows |
| `--fct-border` | Dividers and borders |
| `--fct-text` | Body text |
| `--fct-text-muted` | Descriptions and labels |
| `--fct-radius` | Card radius |
| `--fct-space-section` | Section padding (20px) |
| `--fct-space-row` | Padding between list rows (16px) |
| `--fct-space-stack` | Gap between sections (30px) |

```css
.gift-wrap-preview {
    border: 1px solid var(--fct-border);
    border-radius: var(--fct-radius);
    color: var(--fct-text-muted);
}
```

## Class names

Each component writes `fct-` classes in BEM form: a block, its parts (`__`) and its options (`--`). Screens that FluentCart renders in PHP, or add-ons that do not use Vue, can write the same markup by hand.

| Component | Block class | Example part and option classes |
| --------- | ----------- | -------------------------------- |
| Page | `fct-page` | `fct-page__header`, `fct-page__title`, `fct-page__actions`, `fct-page--bar` |
| Section | `fct-section` (+ `fct-card` at top level) | `fct-section__header`, `fct-section__body`, `fct-section--nested`, `fct-section--divided` |
| Title | `fct-title` | `fct-title--md`, `fct-title--sm` |
| SettingRow | `fct-setting-field` | `fct-setting-field__label`, `fct-setting-field__control`, `fct-setting-field--inline` |
| List, ListItem | `fct-list`, `fct-list-item` | `fct-list-item__media`, `fct-list-item__title`, `fct-list-item__actions` |
| SortableList | `fct-sortable-list` | `fct-sortable-list__handle` |
| KeyValueList, KeyValue | `fct-kv-list`, `fct-kv` | `fct-kv__label`, `fct-kv__value`, `fct-kv-list--stacked` |
| StatGrid, StatTile | `fct-stat-grid`, `fct-stat` | `fct-stat__label`, `fct-stat__value` |
| EmptyState | `fct-empty-state` | `fct-empty-state__title`, `fct-empty-state--sm` |
| DetailLayout | `fct-detail-layout` | `fct-detail-layout__main`, `fct-detail-layout__sidebar` |

These classes are stable. Other markup inside a component can change between versions.
