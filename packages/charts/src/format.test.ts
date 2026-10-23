import { describe, expect, it } from 'vitest'
import { formatTimeAxisLabel } from './format'

describe('formatTimeAxisLabel', () => {
  it('formats the numeric timestamp echarts passes to a time-axis formatter', () => {
    // ECharts hands a time-axis formatter a number, not the ISO string from the
    // row. Returning '' here silently removed every month label in AreaChart.
    expect(formatTimeAxisLabel(Date.UTC(2026, 3, 1), 'month')).toBe('Apr')
    expect(formatTimeAxisLabel(Date.UTC(2026, 0, 1), 'month')).toBe('2026')
  })

  it('still formats ISO dates and Date values', () => {
    expect(formatTimeAxisLabel('2026-04-01', 'month')).toBe('Apr')
    expect(formatTimeAxisLabel(new Date(2026, 4, 1), 'month')).toBe('May')
  })
})
