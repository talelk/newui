import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('preserves the typed value and focused control when validation appears', async () => {
    const [error, setError] = createSignal<string>()
    const { getByRole } = render(() => (
      <Textarea aria-label="Notes" error={error()} />
    ))
    const area = getByRole('textbox') as HTMLTextAreaElement
    await userEvent.type(area, 'hello')
    setError('Say more.')
    expect(getByRole('textbox')).toBe(area)
    expect(area.value).toBe('hello')
    expect(document.activeElement).toBe(area)
  })

  it('renders a bare textarea without labelling props', () => {
    const { getByRole } = render(() => <Textarea placeholder="Notes" />)
    expect(getByRole('textbox').getAttribute('aria-invalid')).toBeNull()
  })

  it('defaults to three rows and forwards native attributes', () => {
    const { getByRole } = render(() => (
      <Textarea maxLength={280} data-size="md" size="md" variant="subtle" />
    ))
    const area = getByRole('textbox')
    expect(area.getAttribute('rows')).toBe('3')
    expect(area.getAttribute('maxlength')).toBe('280')
    expect(area.getAttribute('data-size')).toBe('md')
    expect(area.getAttribute('data-variant')).toBe('subtle')
  })

  it('wires the shared labelling contract', () => {
    const { getByRole, getByText } = render(() => (
      <Textarea
        label="Notes"
        description="Visible to your team"
        error="Required"
        required
      />
    ))
    const area = getByRole('textbox')
    expect(area.getAttribute('aria-invalid')).toBe('true')
    expect(area.getAttribute('aria-required')).toBe('true')

    const describedBy = area.getAttribute('aria-describedby') ?? ''
    expect(describedBy.split(' ').length).toBe(2)

    const errormessage = area.getAttribute('aria-errormessage')
    expect(errormessage).toBeTruthy()
    const errorEl = errormessage ? document.getElementById(errormessage) : null
    expect(errorEl?.textContent).toContain('Required')

    expect(document.querySelector(`label[for="${area.id}"]`)).not.toBeNull()
    expect(getByText('Notes')).toBeTruthy()
  })

  it('links label and textarea by a generated id', () => {
    const { getByRole } = render(() => <Textarea label="Notes" />)
    expect(getByRole('textbox').id).toBeTruthy()
  })
})
