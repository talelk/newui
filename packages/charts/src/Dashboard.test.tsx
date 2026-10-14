import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ChartCard } from './ChartCard'
import { Dashboard } from './Dashboard'
import { NumberCard } from './NumberCard'

describe('Dashboard', () => {
  it('tiles its children in a grid and composes chart components', () => {
    const { container } = render(() => (
      <Dashboard columns={2} gap={16}>
        <ChartCard>
          <NumberCard title="Revenue" value={1234} />
        </ChartCard>
        <ChartCard>
          <NumberCard title="Orders" value={42} />
        </ChartCard>
      </Dashboard>
    ))

    const grid = container.querySelector(
      '[data-slot="dashboard"]',
    ) as HTMLElement
    expect(grid.style.display).toBe('grid')
    expect(grid.style.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))')
    expect(grid.style.gap).toBe('16px')
    expect(container.querySelectorAll('[data-slot="chart-card"]')).toHaveLength(
      2,
    )
    expect(
      container.querySelectorAll('[data-slot="number-card"]'),
    ).toHaveLength(2)
  })

  it('fits as many tiles as the width allows when no column count is given', () => {
    const { container } = render(() => <Dashboard />)
    const grid = container.querySelector(
      '[data-slot="dashboard"]',
    ) as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fit, minmax(260px, 1fr))',
    )
    expect(grid.style.gap).toBe('1rem')
  })
})
