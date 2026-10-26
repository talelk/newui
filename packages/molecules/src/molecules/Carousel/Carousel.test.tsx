import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselStatus,
  CarouselViewport,
} from './Carousel'

function mount(overrides?: Partial<Parameters<typeof Carousel>[0]>) {
  return render(() => (
    <Carousel label="Highlights" {...overrides}>
      <CarouselViewport>
        <CarouselSlide>One</CarouselSlide>
        <CarouselSlide>Two</CarouselSlide>
        <CarouselSlide>Three</CarouselSlide>
      </CarouselViewport>
      <CarouselStatus />
      <div class="flex gap-2">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  ))
}

describe('Carousel', () => {
  it('is a named carousel section holding snap slides', () => {
    const { container } = mount()
    const root = container.querySelector(
      '[data-slot="carousel"]',
    ) as HTMLElement
    expect(root.getAttribute('aria-roledescription')).toBe('carousel')
    expect(root.getAttribute('aria-label')).toBe('Highlights')
    expect(
      container.querySelectorAll('[data-slot="carousel-slide"]').length,
    ).toBe(3)
    const slide = container.querySelector(
      '[data-slot="carousel-slide"]',
    ) as HTMLElement
    expect(slide.getAttribute('aria-roledescription')).toBe('slide')
    expect(slide.className).toContain('snap-start')
  })

  it('tracks the index from Previous/Next and announces it', async () => {
    mount()
    expect(screen.getByText('Slide 1 of 3')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByText('Slide 2 of 3')).toBeTruthy()
    await userEvent.click(
      screen.getByRole('button', { name: 'Previous slide' }),
    )
    expect(screen.getByText('Slide 1 of 3')).toBeTruthy()
  })

  it('wraps by default and stops at the edges with `loop: false`', async () => {
    const { unmount } = mount()
    await userEvent.click(
      screen.getByRole('button', { name: 'Previous slide' }),
    )
    expect(screen.getByText('Slide 3 of 3')).toBeTruthy()
    unmount()

    mount({ loop: false, defaultIndex: 2 })
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByText('Slide 3 of 3')).toBeTruthy()
  })

  it('reports changes through onIndexChange and honours a controlled index', async () => {
    const onIndexChange = vi.fn()
    const { unmount } = mount({ onIndexChange })
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(onIndexChange).toHaveBeenCalledWith(1)
    unmount()

    mount({ index: 2 })
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    // Controlled: the view does not move until the owner moves it.
    expect(screen.getByText('Slide 3 of 3')).toBeTruthy()
  })

  it('orients the strip vertically', () => {
    const { container } = mount({ orientation: 'vertical' })
    expect(
      (
        container.querySelector('[data-slot="carousel"]') as HTMLElement
      ).getAttribute('data-orientation'),
    ).toBe('vertical')
    expect(
      (container.querySelector('[data-slot="carousel-track"]') as HTMLElement)
        .className,
    ).toContain('snap-y')
  })

  it('refuses controls rendered outside a Carousel', () => {
    expect(() => render(() => <CarouselNext />)).toThrow(
      /must be rendered inside a <Carousel>/,
    )
  })
})
