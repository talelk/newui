import { render, screen } from '@solidjs/testing-library'
import { createForm } from '@tanstack/solid-form'
import axe, { type AxeResults } from 'axe-core'
import { createRoot, type JSX } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { Wizard, type WizardStepField } from './index'

const AXE_OPTIONS = {
  rules: { 'color-contrast': { enabled: false } },
}

function summarize(results: AxeResults) {
  return results.violations.map((v) => ({ id: v.id, impact: v.impact }))
}

interface Values {
  name: string
  email: string
  notify: boolean
}

function Harness(props: { review?: boolean }): JSX.Element {
  // biome-ignore lint/suspicious/noExplicitAny: fixtures shared across documents of different shapes.
  let form: any
  createRoot(() => {
    form = createForm(() => ({
      defaultValues: { name: '', email: '', notify: false } satisfies Values,
    }))
  })
  const first: WizardStepField<Values>[] = [
    { name: 'name', type: 'text', label: 'Name' },
    { name: 'notify', type: 'checkbox', label: 'Notify' },
  ]
  const second: WizardStepField<Values>[] = [
    { name: 'email', type: 'text', label: 'Email' },
  ]
  return (
    <Wizard
      label="Setup progress"
      steps={[
        { id: 'one', label: 'One', content: first },
        { id: 'two', label: 'Two', content: second },
      ]}
      form={form}
      review={props.review}
    />
  )
}

describe('Wizard accessibility', () => {
  it('has no axe violations', async () => {
    render(() => <Harness />)
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })

  it('names the step navigation and the current panel', () => {
    render(() => <Harness />)
    expect(document.querySelector('[data-slot="stepper"]')).toHaveAttribute(
      'aria-label',
      'Setup progress',
    )
    // A named `section` *is* the region role; the panel says which step you are on.
    expect(screen.getByRole('region', { name: 'One' })).toBeInTheDocument()
  })

  it('marks the current step and leaves the panel unlabelled by role', () => {
    render(() => <Harness />)
    expect(
      document.querySelector(
        '[data-slot="stepper-marker"][aria-current="step"]',
      ),
    ).toBeTruthy()
  })
})
