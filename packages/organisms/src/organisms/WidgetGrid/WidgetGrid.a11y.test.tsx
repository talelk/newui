import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { WidgetGrid } from './WidgetGrid'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

describe('WidgetGrid accessibility', () => {
  it('has no axe violations in view mode', async () => {
    const { container } = render(() => (
      <WidgetGrid label="Analytics">
        <WidgetGrid.Widget id="kpi" span={12} rows={1} title="Totals">
          kpi
        </WidgetGrid.Widget>
        <WidgetGrid.Widget id="trend" span={8} rows={4} title="Trend">
          trend
        </WidgetGrid.Widget>
      </WidgetGrid>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations in edit mode, where the handles exist', async () => {
    const { container } = render(() => (
      <WidgetGrid editable label="Analytics">
        <WidgetGrid.Widget id="trend" span={8} rows={4} title="Trend">
          trend
        </WidgetGrid.Widget>
      </WidgetGrid>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
