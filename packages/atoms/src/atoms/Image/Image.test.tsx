import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Image } from './Image'

describe('Image', () => {
  it('renders a lazy image with its text alternative', () => {
    const { container } = render(() => (
      <Image src="/board.png" alt="The project board" />
    ))
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('/board.png')
    expect(img.getAttribute('alt')).toBe('The project board')
    expect(img.getAttribute('loading')).toBe('lazy')
    expect(img.getAttribute('decoding')).toBe('async')
  })

  it('holds a fixed ratio box when `ratio` is set', () => {
    const { container } = render(() => (
      <Image src="/a.png" alt="" ratio="16/9" />
    ))
    const frame = container.querySelector(
      'span[data-slot="image"]',
    ) as HTMLElement
    expect(frame.className).toContain('aspect-video')
    expect(frame.getAttribute('data-ratio')).toBe('16/9')
  })

  it('keeps the intrinsic ratio without `ratio`', () => {
    const { container } = render(() => <Image src="/a.png" alt="" />)
    expect(
      (container.querySelector('span[data-slot="image"]') as HTMLElement)
        .className,
    ).not.toContain('aspect-')
  })

  it('switches to the fallback when the source fails', () => {
    const { container } = render(() => (
      <Image src="/missing.png" alt="" fallback={<span>Broken</span>} />
    ))
    const img = container.querySelector('img') as HTMLImageElement
    img.dispatchEvent(new Event('error'))
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('Broken')
  })

  it('paints the placeholder surface, in cover or contain', () => {
    const { container } = render(() => (
      <Image src="/a.png" alt="" fit="contain" />
    ))
    const frame = container.querySelector(
      'span[data-slot="image"]',
    ) as HTMLElement
    expect(frame.className).toContain('bg-surface-gray-2')
    const img = container.querySelector('img') as HTMLElement
    expect(img.className).toContain('object-contain')
  })

  it('merges the caller class last', () => {
    const { container } = render(() => (
      <Image src="/a.png" alt="" class="rounded-4" />
    ))
    expect(
      (container.querySelector('span[data-slot="image"]') as HTMLElement)
        .className,
    ).toContain('rounded-4')
  })
})
