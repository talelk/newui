import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { VisuallyHidden } from './VisuallyHidden'

describe('VisuallyHidden', () => {
  it('keeps the content for assistive tech out of the layout', () => {
    const { container } = render(() => (
      <p>
        Recipients <VisuallyHidden>(required)</VisuallyHidden>
      </p>
    ))
    const hidden = container.querySelector('span[data-slot="visually-hidden"]')
    expect(hidden).toBeTruthy()
    expect(hidden?.className).toContain('sr-only')
    expect(screen.getByText('(required)')).toBeTruthy()
  })

  it('merges the caller class last', () => {
    const { container } = render(() => (
      <VisuallyHidden class="focus:not-sr-only">Skip</VisuallyHidden>
    ))
    expect(
      container.querySelector('span[data-slot="visually-hidden"]')?.className,
    ).toContain('focus:not-sr-only')
  })
})
