import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import {
  AreaChart,
  BarChart,
  ChartCard,
  ChartContainer,
  ChartTooltip,
  Dashboard,
  DonutChart,
  FunnelChart,
  HeatmapChart,
  LineChart,
  NumberCard,
  SankeyChart,
  ScatterChart,
} from './index'

const axisData = [
  { month: 'Jan', sales: 10 },
  { month: 'Feb', sales: 20 },
]

const flowData = [
  { from: 'A', to: 'B', v: 5 },
  { from: 'A', to: 'C', v: 3 },
]

describe('charts SSR smoke', () => {
  it('renders a bar chart to a string without a DOM', () => {
    const html = renderToString(() => (
      <BarChart data={axisData} x="month" y="sales" aria-label="Sales" />
    ))
    expect(html).toContain('data-slot="chart-plot"')
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Sales"')
    expect(html).toContain('data-slot="chart-fallback"')
  })

  it('renders a line chart and an area chart', () => {
    expect(
      renderToString(() => <LineChart data={axisData} x="month" y="sales" />),
    ).toContain('data-slot="chart-container"')
    expect(
      renderToString(() => <AreaChart data={axisData} x="month" y="sales" />),
    ).toContain('data-slot="chart-container"')
  })

  it('renders a donut chart', () => {
    const html = renderToString(() => (
      <DonutChart
        data={[{ channel: 'Search', visits: 5 }]}
        category="channel"
        value="visits"
      />
    ))
    expect(html).toContain('data-slot="chart-container"')
    expect(html).toContain('Search')
  })

  it('renders a number card', () => {
    const html = renderToString(() => (
      <NumberCard title="Revenue" value={1234} />
    ))
    expect(html).toContain('data-slot="number-card"')
    expect(html).toContain('1,234')
  })

  it('renders a funnel chart', () => {
    const html = renderToString(() => (
      <FunnelChart
        data={[{ stage: 'Visit', users: 10 }]}
        category="stage"
        value="users"
        aria-label="Funnel"
      />
    ))
    expect(html).toContain('data-slot="chart-plot"')
    expect(html).toContain('aria-label="Funnel"')
    expect(html).toContain('data-slot="chart-fallback"')
  })

  it('renders a heatmap chart', () => {
    const html = renderToString(() => (
      <HeatmapChart
        data={[{ d: 'Mon', h: '09', n: 3 }]}
        x="h"
        y="d"
        value="n"
      />
    ))
    expect(html).toContain('data-slot="chart-container"')
    expect(html).toContain('Mon')
  })

  it('renders a scatter chart', () => {
    const html = renderToString(() => (
      <ScatterChart data={[{ a: 1, b: 2 }]} x="a" y="b" />
    ))
    expect(html).toContain('data-slot="chart-container"')
    expect(html).toContain('data-slot="chart-fallback"')
  })

  it('renders a sankey chart', () => {
    const html = renderToString(() => (
      <SankeyChart data={flowData} source="from" target="to" value="v" />
    ))
    expect(html).toContain('data-slot="chart-container"')
    expect(html).toContain('data-slot="chart-fallback"')
  })

  it('renders a dashboard of cards', () => {
    const html = renderToString(() => (
      <Dashboard columns={2}>
        <ChartCard>
          <NumberCard title="Revenue" value={1} />
        </ChartCard>
      </Dashboard>
    ))
    expect(html).toContain('data-slot="dashboard"')
    expect(html).toContain('data-slot="chart-card"')
  })

  it('renders a chart container around a plot it is given', () => {
    const html = renderToString(() => (
      <ChartContainer title="Revenue" subtitle="By month" empty>
        <div data-slot="own-plot">Plot</div>
      </ChartContainer>
    ))
    expect(html).toContain('data-slot="chart-container"')
    expect(html).toContain('data-state="empty"')
    expect(html).toContain('Revenue')
    expect(html).toContain('No data to show')
  })

  it('renders no tooltip without a DOM to hang it off', () => {
    const html = renderToString(() => (
      <ChartTooltip
        open
        x={10}
        y={10}
        label="Jan"
        items={[
          {
            name: 'sales',
            label: 'Sales',
            value: 1,
            formattedValue: '1',
            kind: 'series',
          },
        ]}
      />
    ))
    expect(html).toBe('')
  })
})
