import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { FileCard } from './FileCard'

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

describe('FileCard accessibility', () => {
  it('has no axe violations as a plain card', async () => {
    const { container } = render(() => (
      <ul aria-label="Files">
        <FileCard
          role="listitem"
          name="Q4 report.pdf"
          meta="Ana Costa · 2.4 MB"
        />
      </ul>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations as a button card', async () => {
    const { container } = render(() => (
      <div>
        <FileCard as="button" name="Brief.docx" badge={<span>Shared</span>} />
        <FileCard as="button" name="Archive.zip" />
      </div>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations with app actions on a non-interactive root', async () => {
    const { container } = render(() => (
      <div>
        <FileCard
          name="Archive.zip"
          meta="Shared · read-only"
          suffix={
            <button type="button" aria-label="Delete Archive.zip">
              Delete
            </button>
          }
        />
      </div>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
