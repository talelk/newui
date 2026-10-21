import { Button, Switch } from '@newui/atoms'
import { Select } from '@newui/molecules'
import {
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
  untrack,
} from 'solid-js'

const SLIDES = [
  {
    title: 'A clearer view',
    description: 'Turn the numbers into a next step.',
    metric: '$128,430',
    label: 'Monthly recurring revenue',
  },
  {
    title: 'Built for your team',
    description: 'Make room for focused, thoughtful work.',
    metric: '2,847',
    label: 'Active customers',
  },
  {
    title: 'Keep moving forward',
    description: 'Small improvements add up to meaningful growth.',
    metric: '+18.6%',
    label: 'Revenue growth',
  },
  {
    title: 'Every detail matters',
    description: 'Clarity, from the big picture to the smallest control.',
    metric: '99.9%',
    label: 'Service availability',
  },
  {
    title: 'Better, together',
    description: 'A shared workspace for every part of the business.',
    metric: '4.9 / 5',
    label: 'Customer satisfaction',
  },
]
export default function Carousel(props: { example?: string }) {
  const [index, setIndex] = createSignal(0)
  const [orientation, setOrientation] = createSignal(
    untrack(() =>
      props.example === 'carousel-orientation-demo' ? 'Vertical' : 'Horizontal',
    ),
  )
  const [size, setSize] = createSignal(
    untrack(() =>
      props.example === 'carousel-size-demo' ? 'Compact cards' : 'Full width',
    ),
  )
  const [spacing, setSpacing] = createSignal(
    untrack(() => (props.example === 'carousel-spacing-demo' ? '24' : '16')),
  )
  const [autoplay, setAutoplay] = createSignal(
    untrack(() => props.example === 'carousel-plugin-demo'),
  )
  const [paused, setPaused] = createSignal(false)
  const [reduced, setReduced] = createSignal(false)
  let track: HTMLElement | undefined
  onMount(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener('change', sync)
    onCleanup(() => media.removeEventListener('change', sync))
  })
  const go = (next: number) => {
    const normalized = (next + SLIDES.length) % SLIDES.length
    setIndex(normalized)
    const slide = track?.children[normalized]
    if (slide && track) {
      const target = slide.getBoundingClientRect()
      const viewport = track.getBoundingClientRect()
      const rtl = getComputedStyle(track).direction === 'rtl'
      track.scrollBy({
        top: orientation() === 'Vertical' ? target.top - viewport.top : 0,
        left:
          orientation() === 'Horizontal'
            ? rtl
              ? target.right - viewport.right
              : target.left - viewport.left
            : 0,
        behavior: reduced() ? 'instant' : 'smooth',
      })
    }
  }
  createEffect(() => {
    if (!autoplay() || paused() || reduced()) return
    const timer = setInterval(() => go(index() + 1), 4000)
    onCleanup(() => clearInterval(timer))
  })
  createEffect(
    on([orientation, size, spacing], () => {
      const frame = requestAnimationFrame(() => go(index()))
      onCleanup(() => cancelAnimationFrame(frame))
    }),
  )
  return (
    <div class="flex min-w-0 flex-col gap-5">
      <div class="flex flex-wrap items-end gap-3">
        <Select
          label="Orientation"
          value={orientation()}
          options={['Horizontal', 'Vertical'].map((value) => ({
            label: value,
            value,
          }))}
          onValueChange={(value) => setOrientation(value ?? 'Horizontal')}
        />
        <Select
          label="Slide size"
          value={size()}
          options={['Full width', 'Compact cards'].map((value) => ({
            label: value,
            value,
          }))}
          onValueChange={(value) => setSize(value ?? 'Full width')}
        />
        <Select
          label="Slide spacing"
          value={spacing()}
          options={['8', '16', '24'].map((value) => ({
            label: `${value}px`,
            value,
          }))}
          onValueChange={(value) => setSpacing(value ?? '16')}
        />
        <Switch
          label="Automatic playback"
          checked={autoplay()}
          onCheckedChange={setAutoplay}
        />
      </div>
      <section
        aria-roledescription="carousel"
        aria-label="Workspace highlights"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusIn={() => setPaused(true)}
        onFocusOut={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setPaused(false)
        }}
      >
        <section
          ref={track}
          class="flex snap-mandatory overflow-auto rounded-5 focus-visible:focus-ring"
          classList={{
            'h-72 snap-y flex-col': orientation() === 'Vertical',
            'snap-x': orientation() === 'Horizontal',
            'gap-2': spacing() === '8',
            'gap-4': spacing() === '16',
            'gap-6': spacing() === '24',
          }}
          tabindex="0"
          aria-label="Slides"
          onScrollEnd={(event) => {
            const viewport = event.currentTarget.getBoundingClientRect()
            const rtl =
              getComputedStyle(event.currentTarget).direction === 'rtl'
            const vertical = orientation() === 'Vertical'
            const distances = Array.from(
              event.currentTarget.children,
              (child) => {
                const rect = child.getBoundingClientRect()
                return Math.abs(
                  vertical
                    ? rect.top - viewport.top
                    : rtl
                      ? rect.right - viewport.right
                      : rect.left - viewport.left,
                )
              },
            )
            setIndex(distances.indexOf(Math.min(...distances)))
          }}
          onKeyDown={(event) => {
            const rtl =
              getComputedStyle(event.currentTarget).direction === 'rtl'
            const next =
              orientation() === 'Vertical'
                ? 'ArrowDown'
                : rtl
                  ? 'ArrowLeft'
                  : 'ArrowRight'
            const previous =
              orientation() === 'Vertical'
                ? 'ArrowUp'
                : rtl
                  ? 'ArrowRight'
                  : 'ArrowLeft'
            if ([next, previous, 'Home', 'End'].includes(event.key)) {
              event.preventDefault()
              go(
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? SLIDES.length - 1
                    : index() + (event.key === next ? 1 : -1),
              )
            }
          }}
        >
          <For each={SLIDES}>
            {(slide, position) => (
              <article
                aria-roledescription="slide"
                aria-label={`${position() + 1} of ${SLIDES.length}`}
                class="flex min-h-64 shrink-0 snap-start flex-col justify-between rounded-5 border border-outline-blue-1 bg-surface-blue-1 p-6"
                classList={{
                  'w-full': size() === 'Full width',
                  'w-64': size() === 'Compact cards',
                  'h-72': orientation() === 'Vertical',
                }}
              >
                <div>
                  <p class="text-caption text-ink-blue-8">
                    Acme workspace / 0{position() + 1}
                  </p>
                  <h2 class="mt-3 text-section text-ink-gray-9">
                    {slide.title}
                  </h2>
                  <p class="mt-2 text-interface text-ink-gray-7">
                    {slide.description}
                  </p>
                </div>
                <div class="mt-6">
                  <p class="text-metric text-ink-gray-9">{slide.metric}</p>
                  <p class="mt-1 text-caption text-ink-gray-7">{slide.label}</p>
                </div>
              </article>
            )}
          </For>
        </section>
        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p role="status" class="text-caption text-ink-gray-7">
            Slide {index() + 1} of {SLIDES.length}
            {reduced() ? ' · Automatic motion disabled by your preference' : ''}
          </p>
          <div class="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go(index() - 1)}>
              Previous slide
            </Button>
            <Button variant="outline" onClick={() => go(index() + 1)}>
              Next slide
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
