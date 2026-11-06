import { render } from '@solidjs/testing-library'
import { getInstanceByDom } from 'echarts/core'
import { createSignal, Show } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { joinChartGroup, leaveChartGroup, useChartGroup } from './chartGroup'
import { LineChart } from './LineChart'

const data = [
  { month: 'Jan', sales: 10 },
  { month: 'Feb', sales: 20 },
  { month: 'Mar', sales: 15 },
]

/** The group tag of the echarts instance drawn on a plot element. */
function groupOf(plot: HTMLElement): string | undefined {
  return getInstanceByDom(plot)?.group
}

describe('chart groups', () => {
  it('namespaces the id so unrelated widgets cannot collide', () => {
    function Probe() {
      const group = useChartGroup('trends')
      return <span>{group.id}</span>
    }
    const { container } = render(() => <Probe />)
    expect(container.textContent).toMatch(/^newui\.trends\./)
  })

  it('links charts rendered under one provider', () => {
    function Dashboard() {
      const trends = useChartGroup('trends')
      return (
        <trends.Provider>
          <LineChart data={data} x="month" y="sales" />
          <LineChart data={data} x="month" y="sales" />
        </trends.Provider>
      )
    }
    const { container } = render(() => <Dashboard />)
    const plots = [
      ...container.querySelectorAll('[data-slot="chart-canvas"]'),
    ] as HTMLElement[]
    const groups = plots.map((plot) => groupOf(plot))
    expect(groups[0]).toMatch(/^newui\.trends\./)
    expect(groups[1]).toBe(groups[0])
  })

  it('leaves a sibling alone when one chart unmounts', () => {
    const [show, setShow] = createSignal(true)
    function Dashboard() {
      const trends = useChartGroup('sibling')
      return (
        <trends.Provider>
          <LineChart data={data} x="month" y="sales" />
          <Show when={show()}>
            <LineChart data={data} x="month" y="sales" />
          </Show>
        </trends.Provider>
      )
    }
    const { container } = render(() => <Dashboard />)
    const survivor = container.querySelectorAll(
      '[data-slot="chart-canvas"]',
    )[0] as HTMLElement
    setShow(false)
    // The survivor keeps its group tag; only the departed instance left.
    expect(groupOf(survivor)).toMatch(/^newui\.sibling\./)
  })

  it('joins and leaves through the helpers directly', () => {
    const fake = { group: '' } as never as Parameters<typeof joinChartGroup>[1]
    joinChartGroup('newui.manual.1', fake)
    expect(fake.group).toBe('newui.manual.1')
    leaveChartGroup('newui.manual.1', fake)
    leaveChartGroup('newui.manual.1', fake) // leaving twice is harmless
  })

  it('the group prop wins over the provider', () => {
    function Dashboard() {
      const trends = useChartGroup('trends')
      return (
        <trends.Provider>
          <LineChart data={data} x="month" y="sales" group="newui.other.9" />
        </trends.Provider>
      )
    }
    const { container } = render(() => <Dashboard />)
    const plot = container.querySelector(
      '[data-slot="chart-canvas"]',
    ) as HTMLElement
    expect(groupOf(plot)).toBe('newui.other.9')
  })
})
