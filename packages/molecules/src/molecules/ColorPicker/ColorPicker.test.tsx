import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ColorPicker, normalizeHex } from './ColorPicker'

describe('normalizeHex', () => {
  it('accepts #rgb, #rrggbb, bare and mixed case, and rejects the rest', () => {
    expect(normalizeHex('#1A56db')).toBe('#1a56db')
    expect(normalizeHex('abc')).toBe('#aabbcc')
    expect(normalizeHex('  #1234  ')).toBeNull()
    expect(normalizeHex('blue')).toBeNull()
    expect(normalizeHex('#12345')).toBeNull()
  })
})

describe('ColorPicker', () => {
  it('renders a colour swatch with the native picker and a hex field', () => {
    const { container } = render(() => <ColorPicker aria-label="Brand color" />)
    const native = container.querySelector('input[type="color"]')
    expect(native).toBeTruthy()
    expect((native as HTMLInputElement).value).toBe('#6b7280')
    const text = screen.getByRole('textbox') as HTMLInputElement
    expect(text.value).toBe('#6b7280')
  })

  it('commits a valid hex from the text field and clears the draft', () => {
    const onValueChange = vi.fn()
    render(() => (
      <ColorPicker aria-label="Brand" onValueChange={onValueChange} />
    ))
    const text = screen.getByRole('textbox') as HTMLInputElement
    // A single input event, not keystrokes: every 3-hex-digit prefix of a
    // 6-digit code is itself a valid shorthand, so keystroke-by-keystroke
    // typing commits intermediates by design.
    text.value = '#1A56db'
    text.dispatchEvent(new Event('input', { bubbles: true }))
    expect(onValueChange).toHaveBeenLastCalledWith('#1a56db')
    expect(text.getAttribute('aria-invalid')).toBeNull()
    expect(text.value).toBe('#1a56db')
  })

  it('keeps an invalid draft flagged without committing', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <ColorPicker aria-label="Brand" onValueChange={onValueChange} />
    ))
    const text = screen.getByRole('textbox') as HTMLInputElement
    await userEvent.type(text, '#1a')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(text.getAttribute('aria-invalid')).toBe('true')
    expect(text.getAttribute('data-invalid')).toBe('')
  })

  it('keeps the text field in sync when the native picker reports a color', () => {
    const { container } = render(() => <ColorPicker aria-label="Brand" />)
    const native = container.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement
    native.value = '#0B7285'
    native.dispatchEvent(new Event('input', { bubbles: true }))
    const text = screen.getByRole('textbox') as HTMLInputElement
    expect(text.value).toBe('#0b7285')
  })

  it('hides the hex field with `editable: false`', () => {
    const { container } = render(() => (
      <ColorPicker aria-label="Brand" editable={false} />
    ))
    expect(container.querySelector('input[type="color"]')).toBeTruthy()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('wires the shared labelling contract', () => {
    render(() => (
      <ColorPicker
        label="Brand color"
        description="Used on the sign-in card"
        error="Required"
        required
      />
    ))
    const native = document.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement
    expect(native.hasAttribute('required')).toBe(true)
    expect(native.getAttribute('aria-describedby')).toBeTruthy()
    expect(document.querySelector(`label[for="${native.id}"]`)).not.toBeNull()
    expect(screen.getByText('Brand color')).toBeTruthy()
  })

  it('disables both controls together', () => {
    render(() => <ColorPicker aria-label="Brand" disabled />)
    expect(
      (document.querySelector('input[type="color"]') as HTMLInputElement)
        .disabled,
    ).toBe(true)
    expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(
      true,
    )
  })
})
