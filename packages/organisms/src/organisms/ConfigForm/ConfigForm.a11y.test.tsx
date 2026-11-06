import { render } from '@solidjs/testing-library'
import { createForm } from '@tanstack/solid-form'
import axe, { type AxeResults } from 'axe-core'
import { createRoot, type JSX } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { ConfigForm, type ConfigFormApi, type ConfigFormField } from './index'

const AXE_OPTIONS = {
  rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
}

function summarize(results: AxeResults) {
  return results.violations.map((v) => ({ id: v.id, impact: v.impact }))
}

interface Values {
  mode: string
  host: string
  notify: boolean
}

function Harness(): JSX.Element {
  let form!: ConfigFormApi
  createRoot(() => {
    form = createForm(() => ({
      defaultValues: {
        mode: 'simple',
        host: '',
        notify: false,
      } satisfies Values,
    }))
  })
  const fields: Record<string, ConfigFormField<Values>> = {
    mode: { type: 'text', label: 'Mode' },
    host: { type: 'text', label: 'Host', when: (v) => v.mode === 'advanced' },
    notify: { type: 'checkbox', label: 'Notify' },
  }
  return <ConfigForm form={form} fields={fields} />
}

describe('ConfigForm accessibility', () => {
  it('has no axe violations', async () => {
    render(() => <Harness />)
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })

  it('exposes the form region', () => {
    render(() => <Harness />)
    expect(document.querySelector('[data-slot="config-form"]')).toBeTruthy()
  })
})
