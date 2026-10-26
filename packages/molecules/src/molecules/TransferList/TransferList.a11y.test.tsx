import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { TransferList } from './TransferList'

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

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

describe('TransferList accessibility', () => {
  it('has no axe violations bare, with search, and disabled', async () => {
    const bare = render(() => <TransferList options={FRUITS} />)
    expect(summarize(await axe.run(bare.container, AXE_OPTIONS))).toEqual([])

    const searched = render(() => <TransferList options={FRUITS} search />)
    expect(summarize(await axe.run(searched.container, AXE_OPTIONS))).toEqual(
      [],
    )

    const disabled = render(() => <TransferList options={FRUITS} disabled />)
    expect(summarize(await axe.run(disabled.container, AXE_OPTIONS))).toEqual(
      [],
    )
  })
})
