import { render, screen } from '@solidjs/testing-library'
import { createForm } from '@tanstack/solid-form'
import userEvent from '@testing-library/user-event'
import { createRoot } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Wizard, type WizardStep, type WizardStepField } from './index'

interface Values {
  name: string
  email: string
  notify: boolean
}

function makeForm<T>(values: T) {
  let form: any
  createRoot(() => {
    form = createForm(() => ({ defaultValues: values }))
  })
  return form
}

/** The two-field step the gating tests share. */
function step1(
  overrides: Partial<WizardStep<Values>> = {},
): WizardStep<Values> {
  const fields: WizardStepField<Values>[] = [
    { name: 'name', type: 'text', label: 'Name' },
    { name: 'notify', type: 'checkbox', label: 'Notify' },
  ]
  return { id: 'one', label: 'One', content: fields, ...overrides }
}

function step2(
  overrides: Partial<WizardStep<Values>> = {},
): WizardStep<Values> {
  const fields: WizardStepField<Values>[] = [
    { name: 'email', type: 'text', label: 'Email' },
  ]
  return { id: 'two', label: 'Two', content: fields, ...overrides }
}

const steps = (first = step1(), second = step2()) => [first, second]

describe('Wizard', () => {
  it('renders the first step and nothing else', () => {
    const form = makeForm<Values>({ name: '', email: '', notify: false })
    render(() => <Wizard label="Flow" steps={steps()} form={form} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).toBeNull()
  })

  it('gates Next on the step validator and shows the message', async () => {
    const form = makeForm<Values>({ name: '', email: '', notify: false })
    render(() => (
      <Wizard
        label="Flow"
        steps={steps(step1({ validate: () => 'Enter a name to continue' }))}
        form={form}
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a name to continue',
    )
    // Still on step one.
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).toBeNull()
  })

  it('advances once the step passes, and the next step is clean', async () => {
    const form = makeForm<Values>({ name: '', email: '', notify: false })
    const validate = vi.fn((values: Values) =>
      values.name ? undefined : 'Enter a name',
    )
    render(() => (
      <Wizard label="Flow" steps={steps(step1({ validate }))} form={form} />
    ))

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Name'), 'Ada')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
    // The gate ran twice — once per attempt — and never while typing.
    expect(validate).toHaveBeenCalledTimes(2)
  })

  it('puts a per-field error on the field, through the error contract', async () => {
    const form = makeForm<Values>({ name: '', email: '', notify: false })
    render(() => (
      <Wizard
        label="Flow"
        steps={steps(step1({ validate: () => ({ name: 'Name is required' }) }))}
        form={form}
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    const name = screen.getByLabelText('Name')
    const describedBy = name.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy ?? '')).toHaveTextContent(
      'Name is required',
    )
    // It is the field's own error, not a step banner over the whole panel.
    expect(document.querySelector('[data-slot="wizard-error"]')).toBeNull()

    // Fixing it clears it.
    await userEvent.type(name, 'Ada')
    expect(document.getElementById(describedBy ?? '')).toBeNull()
  })

  it('never invalidates a step the user has not reached', async () => {
    const form = makeForm<Values>({ name: '', email: '', notify: false })
    render(() => (
      <Wizard
        label="Flow"
        steps={steps(step1({ validate: () => ({ email: 'not reached yet' }) }))}
        form={form}
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    // Step two's field is not on this step, so it is not shown red; the block
    // says so as a step message instead of failing silently.
    expect(screen.getByRole('alert')).toHaveTextContent(
      'email: not reached yet',
    )
    expect(screen.queryByText('not reached yet')).toBeNull()
    expect(screen.queryByLabelText('Email')).toBeNull()
  })

  it('never blocks without saying so', async () => {
    const form = makeForm<Values>({ name: '', email: '', notify: false })
    render(() => (
      <Wizard
        label="Flow"
        steps={steps(step1({ validate: () => ({ 'nope.here': 'no rule' }) }))}
        form={form}
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('alert')).toHaveTextContent('nope.here: no rule')
  })

  it('Back is never gated', async () => {
    const form = makeForm<Values>({ name: 'Ada', email: '', notify: false })
    render(() => (
      <Wizard
        label="Flow"
        steps={steps(
          step1(),
          step2({ validate: () => ({ email: 'Enter an email' }) }),
        )}
        form={form}
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('keeps the values of a step the user has left', async () => {
    const form = makeForm<Values>({ name: '', email: '', notify: false })
    render(() => <Wizard label="Flow" steps={steps()} form={form} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Ada')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
  })

  it('is controllable', async () => {
    const form = makeForm<Values>({ name: '', email: '', notify: false })
    const onCurrentStepChange = vi.fn()
    render(() => (
      <Wizard
        label="Flow"
        steps={steps()}
        form={form}
        currentStep="two"
        onCurrentStepChange={onCurrentStepChange}
      />
    ))
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onCurrentStepChange).toHaveBeenCalledWith('one')
    // The parent owns the step, so the panel does not move on its own.
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('does not let the stepper skip ahead', async () => {
    const form = makeForm<Values>({ name: '', email: '', notify: false })
    render(() => <Wizard label="Flow" steps={steps()} form={form} />)
    await userEvent.click(screen.getByRole('button', { name: '2. Two' }))
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('submits on the last step and calls onSubmit with the document', async () => {
    const form = makeForm<Values>({ name: 'Ada', email: '', notify: false })
    const onSubmit = vi.fn()
    render(() => (
      <Wizard
        label="Flow"
        steps={steps()}
        form={form}
        onSubmit={onSubmit}
        submitLabel="Create"
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ name: 'Ada' })
  })

  it('renders a read-only review of every field when review is on', async () => {
    const form = makeForm<Values>({ name: 'Ada', email: '', notify: true })
    render(() => <Wizard label="Flow" steps={steps()} form={form} review />)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    // The review is the last step, and it is the only thing left to reach.
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    // Read-only: no controls in the summary.
    expect(screen.queryByLabelText('Name')).toBeNull()
    expect(screen.queryByLabelText('Email')).toBeNull()
  })

  it('leaves a field hidden by when out of the review', async () => {
    const form = makeForm<Values>({
      name: 'Ada',
      email: 'a@b.c',
      notify: false,
    })
    const fields: WizardStepField<Values>[] = [
      { name: 'name', type: 'text', label: 'Name' },
      {
        name: 'email',
        type: 'text',
        label: 'Email',
        when: (values) => values.notify,
      },
    ]
    render(() => (
      <Wizard
        label="Flow"
        steps={[
          { id: 'one', label: 'One', content: fields },
          {
            id: 'two',
            label: 'Two',
            content: [{ name: 'notify', type: 'checkbox', label: 'Notify' }],
          },
        ]}
        form={form}
        review
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.queryByText('a@b.c')).toBeNull()
  })

  describe('resume', () => {
    /** The `createConfigStore` shape, without the data package in a visual one. */
    function memoryStore() {
      const docs = new Map<string, string>()
      return {
        docs,
        load<T>(name: string) {
          const raw = docs.get(name)
          return raw ? ({ doc: JSON.parse(raw).doc } as { doc: T }) : undefined
        },
        save<T>(name: string, doc: T, options?: { type?: string }) {
          docs.set(
            name,
            JSON.stringify({ doc, type: options?.type, updatedAt: 'now' }),
          )
          return true
        },
        remove(name: string) {
          const existed = docs.has(name)
          docs.delete(name)
          return existed
        },
      }
    }

    it('remembers the step and the values across a remount', async () => {
      const store = memoryStore()
      const first = makeForm<Values>({ name: '', email: '', notify: false })
      const view = render(() => (
        <Wizard
          label="Flow"
          steps={steps()}
          form={first}
          resume={{ id: 'setup', store }}
        />
      ))
      await userEvent.type(screen.getByLabelText('Name'), 'Ada')
      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      view.unmount()

      expect(store.docs.get('setup')).toContain('"step":"two"')
      expect(store.docs.get('setup')).toContain('Ada')

      const second = makeForm<Values>({ name: '', email: '', notify: false })
      render(() => (
        <Wizard
          label="Flow"
          steps={steps()}
          form={second}
          resume={{ id: 'setup', store }}
        />
      ))
      // Back on step two, with the name still there.
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.queryByLabelText('Name')).toBeNull()
      await userEvent.click(screen.getByRole('button', { name: 'Back' }))
      expect(screen.getByLabelText('Name')).toHaveValue('Ada')
    })

    it('drops the document once the save lands', async () => {
      const store = memoryStore()
      const form = makeForm<Values>({ name: 'Ada', email: '', notify: false })
      render(() => (
        <Wizard
          label="Flow"
          steps={steps()}
          form={form}
          resume={{ id: 'setup', store }}
          onSubmit={() => {}}
        />
      ))
      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      expect(store.docs.has('setup')).toBe(false)
    })

    it('keeps the document when the save fails', async () => {
      const store = memoryStore()
      const form = makeForm<Values>({ name: 'Ada', email: '', notify: false })
      render(() => (
        <Wizard
          label="Flow"
          steps={steps()}
          form={form}
          resume={{ id: 'setup', store }}
          onSubmit={() => {
            throw new Error('the backend is down')
          }}
        />
      ))
      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      expect(screen.getByRole('alert')).toHaveTextContent('the backend is down')
      expect(store.docs.has('setup')).toBe(true)
    })
  })
})
