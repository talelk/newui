import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon'

describe('Icon', () => {
  it('renders a `lucide-*` string as an aria-hidden span carrying the class', () => {
    const { container } = render(() => <Icon icon="lucide-info" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.tagName).toBe('SPAN')
    expect(el.getAttribute('data-slot')).toBe('icon')
    expect(el.className).toContain('lucide-info')
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders nothing without an icon', () => {
    const { container } = render(() => <Icon />)
    expect(container.firstElementChild).toBeNull()
  })

  it('accepts the `name` alias and lets `icon` win', () => {
    const aliased = render(() => <Icon name="lucide-search" />)
    expect(aliased.container.firstElementChild?.className).toContain(
      'lucide-search',
    )
    const both = render(() => <Icon icon="lucide-info" name="lucide-search" />)
    expect(both.container.firstElementChild?.className).toContain('lucide-info')
  })

  it('renders a component icon inline, passing the slot and class through', () => {
    const Glyph = (p: { class?: string; 'data-slot'?: string }) => (
      <svg data-glyph={p['data-slot'] ?? ''} data-glyph-class={p.class ?? ''} />
    )
    const { container } = render(() => <Icon icon={Glyph} class="size-5" />)
    const svg = container.querySelector('svg[data-glyph]')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('data-glyph')).toBe('icon')
    expect(svg?.getAttribute('data-glyph-class')).toBe('size-5')
  })

  it('merges the caller class last', () => {
    const { container } = render(() => (
      <Icon icon="lucide-info" class="size-4" />
    ))
    expect(container.firstElementChild?.className).toContain('size-4')
  })
})
