import { render } from '@solidjs/testing-library'
import { createForm } from '@tanstack/solid-form'
import axe, { type AxeResults } from 'axe-core'
import { createRoot, type JSX } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { Repeater, type RepeaterFormApi } from './Repeater'

const AXE_OPTIONS = {
  rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
}

function summarize(results: AxeResults) {
  return results.violations.map((v) => ({ id: v.id, impact: v.impact }))
}

function Harness(): JSX.Element {
  let form!: RepeaterFormApi
  createRoot(() => {
    form = createForm(() => ({
      defaultValues: { items: [{ title: 'first' }] },
    }))
  })
  return (
    <Repeater form={form} name="items" copyable>
      {(row) => (
        <row.Field name={`${row.name()}.title`}>
          {(field) => (
            <input
              aria-label={`Title ${row.index() + 1}`}
              value={field().state.value as string}
              onInput={(event) =>
                field().handleChange(event.currentTarget.value)
              }
            />
          )}
        </row.Field>
      )}
    </Repeater>
  )
}

describe('Repeater accessibility', () => {
  it('has no axe violations', async () => {
    render(() => <Harness />)
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })

  it('labels the row controls', () => {
    render(() => <Harness />)
    expect(document.querySelector('[data-slot="repeater-item"]')).toBeTruthy()
    // The add control is present and named.
    expect(
      Array.from(document.querySelectorAll('button')).some((b) =>
        /Add/.test(b.textContent ?? ''),
      ),
    ).toBe(true)
  })
})
