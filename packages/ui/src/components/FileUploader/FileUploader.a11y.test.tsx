import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { FileUploader } from './FileUploader'

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

describe('FileUploader accessibility', () => {
  it('has no axe violations for a labelled uploader', async () => {
    const { container } = render(() => (
      <FileUploader
        label="Attachment"
        description="PDF only"
        required
        multiple
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare uploader with an aria-label', async () => {
    const { container } = render(() => <FileUploader aria-label="Attachment" />)
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
