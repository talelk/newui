import { cn, createControllableSignal } from '@talelk/newui-atoms/internal'
import {
  type Accessor,
  createContext,
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  type ParentComponent,
  splitProps,
  untrack,
  useContext,
} from 'solid-js'

export type CarouselOrientation = 'horizontal' | 'vertical'

interface CarouselContextValue {
  index: Accessor<number>
  count: Accessor<number>
  /** True for a vertical strip — the viewport snaps on the Y axis. */
  vertical: Accessor<boolean>
  go: (index: number) => void
  registerTrack: (el: HTMLElement | undefined) => void
  handleScrollEnd: (el: HTMLElement) => void
}

const CarouselContext = createContext<CarouselContextValue>()

function useCarousel(part: string): CarouselContextValue {
  const context = useContext(CarouselContext)
  if (!context)
    throw new Error(
      `${part} must be rendered inside a <Carousel>: it reads the carousel's index and movement.`,
    )
  return context
}

export interface CarouselProps {
  /** Controlled slide index. */
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** @default horizontal */
  orientation?: CarouselOrientation
  /**
   * Advance automatically every `interval` milliseconds. Paused while the
   * pointer or focus is inside, and never runs under `prefers-reduced-motion`.
   */
  autoplay?: boolean
  /** @default 5000 */
  interval?: number
  /** Wrap from the last slide back to the first. @default true */
  loop?: boolean
  /** The accessible name — a carousel is a named section, not anonymous slides. */
  label: string
  class?: string
  children: JSX.Element
}

/**
 * A scroll-snap strip of slides. Scrolling is the interaction — touch,
 * trackpad and arrow keys move it natively, and the index follows where the
 * scroll settled rather than fighting it. Compose it from the compounds:
 * `Carousel.Viewport` holds the slides; `Carousel.Previous`, `Carousel.Next`
 * and `Carousel.Status` sit anywhere inside — above, below, aside.
 *
 * Autoplay (opt-in) pauses under the pointer or focus and never runs under
 * `prefers-reduced-motion`.
 */
export function Carousel(props: CarouselProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'index',
    'defaultIndex',
    'onIndexChange',
    'orientation',
    'autoplay',
    'interval',
    'loop',
    'label',
    'class',
    'children',
  ])

  const [internal, setInternal] = createControllableSignal<number>({
    value: () => local.index,
    defaultValue: untrack(() => local.defaultIndex ?? 0),
    onChange: (next) => local.onIndexChange?.(next),
  })
  const [paused, setPaused] = createSignal(false)
  const [reduced, setReduced] = createSignal(false)
  let track: HTMLElement | undefined
  const vertical = () => local.orientation === 'vertical'

  /** The slide count is the viewport's own child count — no second truth. */
  const count = () => track?.children.length ?? 0

  onMount(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener('change', sync)
    onCleanup(() => media.removeEventListener('change', sync))
  })

  const go = (next: number) => {
    const total = count()
    if (total === 0 || !track) return
    const wrapped =
      local.loop === false
        ? Math.min(total - 1, Math.max(0, next))
        : (next + total) % total
    setInternal(wrapped)
    const slide = track.children[wrapped] as HTMLElement | undefined
    if (!slide) return
    const target = slide.getBoundingClientRect()
    const viewport = track.getBoundingClientRect()
    const rtl = getComputedStyle(track).direction === 'rtl'
    const top = vertical() ? target.top - viewport.top : 0
    const left = vertical()
      ? 0
      : rtl
        ? target.right - viewport.right
        : target.left - viewport.left
    // jsdom has no `scrollBy` (the dialog `showModal` precedent): degrade to
    // a jump instead of throwing in tests and SSR renders.
    if (typeof track.scrollBy === 'function') {
      track.scrollBy({
        top,
        left,
        behavior: reduced() ? 'instant' : 'smooth',
      })
    } else {
      track.scrollTop = top
      track.scrollLeft = left
    }
  }

  const handleScrollEnd = (el: HTMLElement) => {
    const viewport = el.getBoundingClientRect()
    const rtl = getComputedStyle(el).direction === 'rtl'
    const isVertical = vertical()
    const distances = Array.from(el.children, (child) => {
      const rect = (child as HTMLElement).getBoundingClientRect()
      return Math.abs(
        isVertical
          ? rect.top - viewport.top
          : rtl
            ? rect.right - viewport.right
            : rect.left - viewport.left,
      )
    })
    setInternal(distances.indexOf(Math.min(...distances)))
  }

  // Autoplay: off under reduced motion, paused under the pointer or focus.
  createEffect(() => {
    if (!local.autoplay || paused() || reduced()) return
    const timer = setInterval(() => go(internal() + 1), local.interval ?? 5000)
    onCleanup(() => clearInterval(timer))
  })

  const context: CarouselContextValue = {
    index: internal,
    count,
    vertical,
    go,
    registerTrack: (el) => {
      track = el
    },
    handleScrollEnd,
  }

  return (
    <CarouselContext.Provider value={context}>
      <section
        {...rest}
        data-slot="carousel"
        data-orientation={local.orientation ?? 'horizontal'}
        aria-roledescription="carousel"
        aria-label={local.label}
        class={cn('flex min-w-0 flex-col gap-3', local.class)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusIn={() => setPaused(true)}
        onFocusOut={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setPaused(false)
        }}
      >
        {local.children}
      </section>
    </CarouselContext.Provider>
  )
}

export interface CarouselViewportProps {
  class?: string
  children: JSX.Element
}

/**
 * The scrollable strip. Focusable (arrow keys page it), `snap-mandatory`, and
 * the slide index follows where a scroll settles. Size it with utilities —
 * a vertical strip wants a fixed height.
 */
export const CarouselViewport: ParentComponent<CarouselViewportProps> = (
  props,
) => {
  const carousel = useCarousel('Carousel.Viewport')
  return (
    <section
      ref={carousel.registerTrack}
      data-slot="carousel-track"
      aria-label="Slides"
      tabindex="0"
      onScrollEnd={(event) =>
        carousel.handleScrollEnd(event.currentTarget as HTMLElement)
      }
      class={cn(
        'flex snap-mandatory overflow-auto rounded-card focus-visible:focus-ring',
        carousel.vertical() ? 'h-72 snap-y flex-col' : 'snap-x',
        props.class,
      )}
    >
      {props.children}
    </section>
  )
}

export interface CarouselSlideProps {
  class?: string
  children: JSX.Element
}

/**
 * One slide. Full-width by default, so the strip behaves before any styling:
 * pass a width utility for peeking neighbours — `Carousel` owns the snap.
 */
export const CarouselSlide: ParentComponent<CarouselSlideProps> = (props) => (
  <article
    data-slot="carousel-slide"
    aria-roledescription="slide"
    class={cn('w-full shrink-0 snap-start', props.class)}
  >
    {props.children}
  </article>
)

export interface CarouselControlProps {
  class?: string
  children?: JSX.Element
}

/** Steps to the previous slide. */
export const CarouselPrevious: ParentComponent<CarouselControlProps> = (
  props,
) => {
  const carousel = useCarousel('Carousel.Previous')
  return (
    <button
      type="button"
      data-slot="carousel-previous"
      onClick={() => carousel.go(carousel.index() - 1)}
      class={cn(props.class)}
    >
      {props.children ?? 'Previous slide'}
    </button>
  )
}

/** Steps to the next slide. */
export const CarouselNext: ParentComponent<CarouselControlProps> = (props) => {
  const carousel = useCarousel('Carousel.Next')
  return (
    <button
      type="button"
      data-slot="carousel-next"
      onClick={() => carousel.go(carousel.index() + 1)}
      class={cn(props.class)}
    >
      {props.children ?? 'Next slide'}
    </button>
  )
}

/** The live "Slide 2 of 5" line, mirrored to assistive tech via `role="status"`. */
export const CarouselStatus: ParentComponent<CarouselControlProps> = (
  props,
) => {
  const carousel = useCarousel('Carousel.Status')
  return (
    <p role="status" data-slot="carousel-status" class={cn(props.class)}>
      {props.children ?? (
        <>
          Slide {carousel.index() + 1} of {carousel.count()}
        </>
      )}
    </p>
  )
}
