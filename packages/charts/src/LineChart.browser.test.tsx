import { render, waitFor } from '@solidjs/testing-library'
import { getInstanceByDom } from 'echarts/core'
import { expect, it } from 'vitest'
import { LineChart } from './LineChart'

// Import only this wrapper: a neighbouring chart must not register its marks.
it('LineChart renders its supported mixed cartesian marks in isolation', async () => {
  const { container } = render(() => (
    <div class="w-96">
      <LineChart
        data={[{ month: 'Sep', Revenue: 120, Target: 140, Forecast: 150 }]}
        x="month"
        y={['Revenue', 'Target', 'Forecast']}
        seriesConfig={{
          Revenue: { type: 'bar' },
          Target: { type: 'line' },
          Forecast: { type: 'area' },
        }}
        height={240}
      />
    </div>
  ))
  const plot = container.querySelector<HTMLElement>(
    '[data-slot="chart-canvas"]',
  )
  expect(plot).toBeTruthy()
  await waitFor(() => {
    const option = getInstanceByDom(plot as HTMLElement)?.getOption()
    const series = option?.['series'] as { type: string }[] | undefined
    expect(series?.map((item) => item.type)).toEqual(['bar', 'line', 'line'])
    expect(plot?.querySelectorAll('svg path').length).toBeGreaterThan(3)
  })
})
