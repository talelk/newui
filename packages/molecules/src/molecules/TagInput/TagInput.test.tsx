import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { TagInput } from './TagInput'

describe('TagInput', () => {
  it('commits a token on Enter and reports the new list', async () => {
    const onValueChange = vi.fn()
    render(() => <TagInput label="Tags" onValueChange={onValueChange} />)
    const input = document.querySelector(
      '[data-slot="tag-input-field"]',
    ) as HTMLInputElement
    await userEvent.type(input, 'design{Enter}')
    expect(onValueChange).toHaveBeenCalledWith(['design'])
    expect(input.value).toBe('')
  })

  it('Backspace on the empty input removes the last token', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <TagInput
        label="Tags"
        defaultValue={['a', 'b']}
        onValueChange={onValueChange}
      />
    ))
    const input = document.querySelector(
      '[data-slot="tag-input-field"]',
    ) as HTMLInputElement
    await userEvent.type(input, '{backspace}')
    expect(onValueChange).toHaveBeenCalledWith(['a'])
  })

  it('skips duplicates by default and honours max', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <TagInput
        label="Tags"
        defaultValue={['a']}
        max={1}
        onValueChange={onValueChange}
      />
    ))
    const input = document.querySelector(
      '[data-slot="tag-input-field"]',
    ) as HTMLInputElement
    await userEvent.type(input, 'a{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.type(input, 'b{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('labels the input through Field and wires errors', () => {
    render(() => <TagInput label="Tags" error="At least one tag" />)
    const input = document.querySelector(
      '[data-slot="tag-input-field"]',
    ) as HTMLElement
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('At least one tag')
    expect(document.querySelector(`label[for="${input.id}"]`)).not.toBeNull()
  })

  it('every token has a remove button and disabled blocks edits', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <TagInput
        label="Tags"
        defaultValue={['a']}
        disabled
        onValueChange={onValueChange}
      />
    ))
    const remove = document.querySelector(
      '[data-slot="tag-input-remove"]',
    ) as HTMLButtonElement
    expect(remove.getAttribute('aria-label')).toBe('Remove a')
    await userEvent.click(remove)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('works controlled: the request is reported, the render follows the prop', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <TagInput label="Tags" value={[]} onValueChange={onValueChange} />
    ))
    const input = document.querySelector(
      '[data-slot="tag-input-field"]',
    ) as HTMLInputElement
    await userEvent.type(input, 'x{Enter}')
    expect(onValueChange).toHaveBeenCalledWith(['x'])
    // The parent never applied the change, so no token renders — the list
    // follows the `value` prop, not the keypress.
    expect(document.querySelector('[data-slot="tag-input-token"]')).toBeNull()
  })
})
