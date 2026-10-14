import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ChartCard } from './ChartCard'

describe('ChartCard', () => {
  it('draws a bordered surface and clips its contents', () => {
    const { container } = render(() => (
      <ChartCard class="my-card">
        <span>plot</span>
      </ChartCard>
    ))
    const card = container.querySelector(
      '[data-slot="chart-card"]',
    ) as HTMLElement
    expect(card.className).toContain('my-card')
    expect(card.style.overflow).toBe('hidden')
    expect(card.style.borderColor).toBe('var(--outline-gray-1)')
    expect(card.textContent).toBe('plot')
  })

  it('drops the surface but keeps the clipping box when `card` is false', () => {
    const { container } = render(() => <ChartCard card={false} />)
    const card = container.querySelector(
      '[data-slot="chart-card"]',
    ) as HTMLElement
    expect(card.style.borderWidth).toBe('')
    expect(card.style.overflow).toBe('hidden')
  })
})
