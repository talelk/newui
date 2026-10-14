import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ChartContainer } from './ChartContainer'

const container = (el: HTMLElement) =>
  el.querySelector('[data-slot="chart-container"]') as HTMLElement

describe('ChartContainer', () => {
  it('draws the plot it is given, with no header of its own', () => {
    const { container: root } = render(() => (
      <ChartContainer>
        <div id="plot">Plot</div>
      </ChartContainer>
    ))
    expect(container(root).getAttribute('data-state')).toBe('ready')
    expect(root.querySelector('#plot')).not.toBeNull()
    expect(root.querySelector('[data-slot="chart-header"]')).toBeNull()
  })

  it('prints the title and the subtitle, and hangs actions off the row', () => {
    const { container: root } = render(() => (
      <ChartContainer
        title="Revenue"
        subtitle="By month"
        actions={
          <button type="button" id="period">
            Last 30 days
          </button>
        }
      >
        <div id="plot">Plot</div>
      </ChartContainer>
    ))
    const header = root.querySelector('[data-slot="chart-header"]')
    expect(header?.textContent).toContain('Revenue')
    expect(header?.textContent).toContain('By month')
    expect(header?.querySelector('#period')).not.toBeNull()
  })

  describe('state', () => {
    it('reads ready when nothing is wrong', () => {
      const { container: root } = render(() => (
        <ChartContainer>
          <div id="plot" />
        </ChartContainer>
      ))
      expect(container(root).getAttribute('data-state')).toBe('ready')
      expect(root.querySelector('[data-slot="chart-loading"]')).toBeNull()
    })

    it('reads loading, and says so for a screen reader', () => {
      const { container: root } = render(() => (
        <ChartContainer loading>
          <div id="plot" />
        </ChartContainer>
      ))
      expect(container(root).getAttribute('data-state')).toBe('loading')
      const status = root.querySelector(
        '[data-slot="chart-loading"] [role="status"]',
      )
      expect(status?.textContent).toBe('Loading chart')
    })

    it('reads error, and prints the reason under the message', () => {
      const { container: root } = render(() => (
        <ChartContainer error="Query timed out">
          <div id="plot" />
        </ChartContainer>
      ))
      expect(container(root).getAttribute('data-state')).toBe('error')
      expect(root.textContent).toContain('Could not render this chart')
      expect(root.textContent).toContain('Query timed out')
    })

    it('reads empty, and says there is nothing to draw', () => {
      const { container: root } = render(() => (
        <ChartContainer empty>
          <div id="plot" />
        </ChartContainer>
      ))
      expect(container(root).getAttribute('data-state')).toBe('empty')
      expect(root.textContent).toContain('No data to show')
    })

    it('takes error over loading and over empty', () => {
      const { container: root } = render(() => (
        <ChartContainer error="Query timed out" loading empty>
          <div id="plot" />
        </ChartContainer>
      ))
      expect(container(root).getAttribute('data-state')).toBe('error')
      expect(root.querySelector('[data-slot="chart-loading"]')).toBeNull()
      expect(root.textContent).not.toContain('No data to show')
    })

    it('takes loading over empty', () => {
      const { container: root } = render(() => (
        <ChartContainer loading empty>
          <div id="plot" />
        </ChartContainer>
      ))
      expect(container(root).getAttribute('data-state')).toBe('loading')
      expect(root.textContent).not.toContain('No data to show')
    })

    // Unmounting the plot would dispose the echarts instance and pay to build
    // it again on the way back, so it is hidden rather than removed.
    it('keeps the plot mounted but out of sight in every state', () => {
      for (const props of [
        { loading: true },
        { error: 'Query timed out' },
        { empty: true },
      ]) {
        const { container: root } = render(() => (
          <ChartContainer {...props}>
            <div id="plot" />
          </ChartContainer>
        ))
        expect(root.querySelector('#plot')).not.toBeNull()
        const content = root.querySelector(
          '[data-slot="chart-plot-content"]',
        ) as HTMLElement
        expect(content.style.visibility).toBe('hidden')
      }
    })
  })

  describe('state content', () => {
    it('takes a caller’s own placeholder in place of the default', () => {
      const { container: root } = render(() => (
        <ChartContainer loading loadingContent={<div id="own">Fetching</div>}>
          <div id="plot" />
        </ChartContainer>
      ))
      expect(
        root.querySelector('[data-slot="chart-loading"] #own'),
      ).not.toBeNull()
    })

    it('takes a caller’s retry button in place of the error message', () => {
      const { container: root } = render(() => (
        <ChartContainer
          error="Query timed out"
          errorContent={
            <button type="button" id="retry">
              Retry
            </button>
          }
        >
          <div id="plot" />
        </ChartContainer>
      ))
      expect(root.querySelector('#retry')).not.toBeNull()
      expect(root.textContent).not.toContain('Could not render this chart')
    })

    it('takes a caller’s own line in place of “No data to show”', () => {
      const { container: root } = render(() => (
        <ChartContainer
          empty
          emptyContent={<div id="own">Widen the range</div>}
        >
          <div id="plot" />
        </ChartContainer>
      ))
      expect(root.querySelector('#own')).not.toBeNull()
      expect(root.textContent).not.toContain('No data to show')
    })
  })

  describe('legend and axis titles', () => {
    it('renders the legend under the plot, and drops the pad that stands in', () => {
      const { container: root } = render(() => (
        <ChartContainer legend={<span id="legend">Sales</span>}>
          <div id="plot" />
        </ChartContainer>
      ))
      expect(root.querySelector('#legend')).not.toBeNull()
      const plot = root.querySelector('[data-slot="chart-plot"]') as HTMLElement
      expect(plot.style.paddingBottom).toBe('')
    })

    it('pads the plot in place of a legend when there is none', () => {
      const { container: root } = render(() => (
        <ChartContainer>
          <div id="plot" />
        </ChartContainer>
      ))
      const plot = root.querySelector('[data-slot="chart-plot"]') as HTMLElement
      expect(plot.style.paddingBottom).toBe('0.75rem')
    })

    it('heads the plot with the axis titles, and puts them under when asked', () => {
      const top = render(() => (
        <ChartContainer yAxisTitle="Revenue" y2AxisTitle="Orders">
          <div id="plot" />
        </ChartContainer>
      ))
      expect(top.container.textContent).toContain('Revenue')
      expect(top.container.textContent).toContain('Orders')

      const bottom = render(() => (
        <ChartContainer yAxisTitle="Revenue" axisTitlePlacement="bottom">
          <div id="plot" />
        </ChartContainer>
      ))
      expect(bottom.container.textContent).toContain('Revenue')
    })

    it('leaves the titles off while a state is showing', () => {
      const { container: root } = render(() => (
        <ChartContainer yAxisTitle="Revenue" loading>
          <div id="plot" />
        </ChartContainer>
      ))
      expect(root.textContent).not.toContain('Revenue')
    })
  })

  it('carries the direction it is told to lay out in', () => {
    const { container: root } = render(() => (
      <ChartContainer dir="rtl">
        <div id="plot" />
      </ChartContainer>
    ))
    expect(container(root).getAttribute('dir')).toBe('rtl')
  })
})
