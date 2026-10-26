import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('is named by `label`, not by its glyph', () => {
    render(() => <IconButton label="Add row" icon="lucide-plus" />)
    const button = screen.getByRole('button', { name: 'Add row' })
    expect(button.getAttribute('data-slot')).toBe('icon-button')
    expect(
      button.querySelector('[aria-hidden="true"].lucide-plus'),
    ).toBeTruthy()
  })

  it('renders a component icon inline', () => {
    const Glyph = (p: { class?: string }) => (
      <svg class={p.class} data-glyph="" />
    )
    const { container } = render(() => <IconButton label="Mark" icon={Glyph} />)
    expect(container.querySelector('svg[data-glyph]')).toBeTruthy()
  })

  it('forwards type and disabled', () => {
    render(() => (
      <IconButton label="Save" type="submit" disabled icon="lucide-check" />
    ))
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.getAttribute('type')).toBe('submit')
    expect((button as HTMLButtonElement).disabled).toBe(true)
    expect(button.getAttribute('data-disabled')).toBe('')
  })

  it('renders an in-app anchor for `route`, keeping the name', () => {
    render(() => (
      <IconButton
        label="Open settings"
        route="/settings"
        icon="lucide-settings"
      />
    ))
    const link = screen.getByRole('link', { name: 'Open settings' })
    expect(link.getAttribute('href')).toBe('/settings')
    expect(link.getAttribute('target')).toBeNull()
  })

  it('treats `href` as external', () => {
    render(() => (
      <IconButton
        label="Repository"
        href="https://github.com"
        icon="lucide-github"
      />
    ))
    const link = screen.getByRole('link', { name: 'Repository' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noreferrer noopener')
  })

  it('stamps the axes as data attributes', () => {
    const { container } = render(() => (
      <IconButton
        label="Delete"
        variant="solid"
        theme="red"
        size="lg"
        icon="lucide-trash-2"
      />
    ))
    const button = container.querySelector('button') as HTMLElement
    expect(button.getAttribute('data-variant')).toBe('solid')
    expect(button.getAttribute('data-color')).toBe('red')
    expect(button.getAttribute('data-size')).toBe('lg')
    expect(button.className).toContain('bg-surface-red-8')
  })
})
