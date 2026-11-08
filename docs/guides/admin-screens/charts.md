---
title: Charts
description: Draw charts in your FluentCart admin screens with the shared ECharts module, FluentCart's report colors and its chart helpers.
---

# Charts

FluentCart draws its report charts with [Apache ECharts](https://echarts.apache.org/). Your screens use the same copy of ECharts, so your plugin does not ship it, and your charts can match FluentCart's colors, tooltips and dark mode.

::: info Requirements
The build config maps `echarts` to `@fluent-cart/echarts`, as in [Build a Screen](./#_2-the-build-config). FluentCart **X.Y.Z** or later for `ChartTab` in `@fluent-cart/ui`.
:::

## What you get

| From | Name | Use |
| ---- | ---- | --- |
| `echarts` (mapped to `@fluent-cart/echarts`) | `init` | Creates a chart on an element. |
| | `registerMap` | Registers a map for map charts. |
| `@fluent-cart/ui` | `Theme` | `Theme.isDark()`, the report palette in `Theme.colors.report`, and `Theme.THEME_CHANGE_EVENT`. |
| | `chartTooltipAmount(cents, currency?)` | Formats an amount in cents for a tooltip or an axis label, in the store currency. |
| | `chartTooltipPosition` | An ECharts tooltip `position` function that keeps the tooltip on the side with more room. Use it with `confine: true`. |
| | `chartAxisPointer(isDark, darkColor, lightColor, type)` | FluentCart's hover highlight: a band for bar charts, a line for line charts. |
| | `getXAxisConfig(pointCount)` | `{splitNumber, interval}`, so long date ranges do not crowd the x axis. |
| | `getEmphasisColor(color)` | The hover color FluentCart uses for a report color. |
| | `ChartTab` | The bar and line switch that FluentCart's reports show in a card header. |

`init` and `registerMap` are the only ECharts names that FluentCart shares. Import them by name: `import {init} from 'echarts'`.

## Report colors

`Theme.colors.report` holds FluentCart's chart palette. The example below uses `royal_blue` for its series in light mode and `blue_dark_mode` in dark mode.

| Key | Value | Key | Value |
| --- | ----- | --- | ----- |
| `royal_blue` | `#4D6EF5` | `blue_dark_mode` | `#6F8CFF` |
| `medium_turquoise` | `#33D3BB` | `purple` | `#8C71F6` |
| `hot_pink` | `#FB4BA3` | `deep_sky_blue` | `#47C2FF` |
| `golden_rod` | `#F6B51E` | `sea_green` | `#23A682` |
| `coral` | `#FF8447` | `light_gray_blue` | `#E3E9F5` |

## Rules for a chart component

- **Read the theme when you draw.** Call `Theme.isDark()` inside your options function, and redraw on `Theme.THEME_CHANGE_EVENT`. The admin's theme switch fires that event on `window`.
- **Resize with the element, not the window.** A `ResizeObserver` on the chart's element also catches the settings sidebar collapsing, which a window `resize` listener misses.
- **Clean up on unmount.** Remove the theme listener, disconnect the observer and call `chart.dispose()`. A listener that stays after the screen closes keeps the chart in memory.
- **Replace the options.** `chart.setOption(options, true)` drops the old series, so a switch from bars to a line leaves nothing behind.
- **Money is in cents.** Pass cents to `chartTooltipAmount` and keep them in your data; format only for display.
- **Give the numbers in text too.** A chart canvas is not readable by a screen reader. Give the chart element `role="img"` and an `aria-label`, and show the key numbers in a `StatGrid` above it.

## A complete chart component

This component draws a revenue chart in cents, as bars or a line. It is the chart from the [Report example](./examples#report-with-a-chart).

```vue [SalesChart.vue]
<script setup>
import {ref, watch, onMounted, onBeforeUnmount} from 'vue';
import {init} from 'echarts';
import {Theme, chartAxisPointer, chartTooltipAmount, chartTooltipPosition, getXAxisConfig, translate} from '@fluent-cart/ui';

const props = defineProps({
    // [{date: 'YYYY-MM-DD', revenue: cents}]
    points: {type: Array, required: true},
    type: {type: String, default: 'bar'},
});

const chartEl = ref(null);
let chart = null;
let resizeObserver = null;
const report = Theme.colors.report;

const options = () => {
    const dark = Theme.isDark();
    const text = dark ? '#C0C2C4' : '#565865';
    const line = dark ? '#253241' : '#EAECF0';

    return {
        grid: {left: 8, right: 16, top: 16, bottom: 8, containLabel: true},
        tooltip: {
            trigger: 'axis',
            confine: true,
            position: chartTooltipPosition,
            axisPointer: chartAxisPointer(dark, report.dark_cyan_blue_16, report.light_gray_blue, props.type),
            backgroundColor: dark ? '#253241' : '#ffffff',
            borderColor: dark ? '#2C3C4E' : '#D6DAE1',
            textStyle: {color: dark ? '#ffffff' : '#565865'},
            valueFormatter: (cents) => chartTooltipAmount(cents),
        },
        xAxis: {
            type: 'category',
            data: props.points.map((point) => point.date.slice(5)),
            axisLabel: {color: text, interval: getXAxisConfig(props.points.length).interval},
            axisLine: {lineStyle: {color: line}},
            axisTick: {show: false},
        },
        yAxis: {
            type: 'value',
            axisLabel: {color: text, formatter: (cents) => chartTooltipAmount(cents)},
            splitLine: {lineStyle: {color: line}},
        },
        series: [{
            name: translate('Revenue'),
            type: props.type,
            data: props.points.map((point) => point.revenue),
            color: dark ? report.blue_dark_mode : report.royal_blue,
            barMaxWidth: 28,
            itemStyle: {borderRadius: props.type === 'bar' ? [4, 4, 0, 0] : 0},
            smooth: true,
            showSymbol: false,
            areaStyle: props.type === 'line' ? {opacity: 0.12} : undefined,
        }],
    };
};

// `true` replaces the old options, so switching bar/line leaves nothing behind.
const draw = () => chart && chart.setOption(options(), true);

onMounted(() => {
    chart = init(chartEl.value);
    draw();
    resizeObserver = new ResizeObserver(() => chart && chart.resize());
    resizeObserver.observe(chartEl.value);
    window.addEventListener(Theme.THEME_CHANGE_EVENT, draw);
});

onBeforeUnmount(() => {
    window.removeEventListener(Theme.THEME_CHANGE_EVENT, draw);
    resizeObserver && resizeObserver.disconnect();
    chart && chart.dispose();
    chart = null;
});

watch(() => [props.points, props.type], draw);
</script>

<template>
  <div ref="chartEl" class="gift-wrap-chart" role="img" :aria-label="translate('Gift wrap revenue per day')"></div>
</template>
```

Use it with `ChartTab` in the section header:

```vue
<Section :title="translate('Revenue per day')" divided>
  <template #actions>
    <ChartTab :active-type="chartType" :types="{bar: 'BarChart', line: 'LineChart'}" @change="type => chartType = type"/>
  </template>
  <SalesChart :points="points" :type="chartType"/>
</Section>
```

`types` maps each chart type to an icon name. `BarChart` and `LineChart` are icons that FluentCart ships. `ChartTab` emits `change` with the chosen type.
