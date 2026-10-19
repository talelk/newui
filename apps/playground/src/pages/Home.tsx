import { A } from '@solidjs/router'
import {
  createSignal,
  For,
  type JSX,
  lazy,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from 'solid-js'

/**
 * The home page.
 *
 * Deliberately the cheapest route on the site: no component is imported
 * statically, so the initial chunk is this file plus the shell. The reader
 * is deciding whether to install the library, so the page answers three
 * questions (what is it, what does it cost, where do I go next) and hands
 * off to `/components`, `/blocks` and `/examples`. The one live preview
 * strip is a separate chunk loaded only when it scrolls into view — real
 * components, paid for only by readers who reach them.
 */

const HomePreviews = lazy(() => import('./home-previews'))

function PreviewSection(): JSX.Element {
  const [visible, setVisible] = createSignal(false)
  let anchor: HTMLDivElement | undefined
  onMount(() => {
    if (!anchor || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    // Only once the reader actually scrolls: on a tall viewport the
    // section is already on screen at first paint, and loading then would
    // put preview weight back on the initial route cost this section
    // exists to keep at zero. The shell scrolls an inner container, not
    // the window, so "scrolled" is tracked from capture-phase scroll
    // events rather than `window.scrollY`.
    let scrolled = false
    let intersecting = false
    const maybeLoad = () => {
      if (!scrolled || !intersecting) return
      setVisible(true)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll, true)
    }
    const onScroll = () => {
      scrolled = true
      maybeLoad()
    }
    const observer = new IntersectionObserver(
      (entries) => {
        intersecting = entries.some((entry) => entry.isIntersecting)
        maybeLoad()
      },
      { rootMargin: '240px' },
    )
    observer.observe(anchor)
    window.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    })
    onCleanup(() => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll, true)
    })
  })
  return (
    <section class="flex flex-col gap-4">
      <h2 class="text-section text-ink-gray-9">See it working</h2>
      <div ref={anchor}>
        <Show
          when={visible()}
          fallback={
            <div class="grid min-h-44 place-items-center rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-4">
              <p class="flex flex-col items-center gap-2 text-center">
                <span class="text-caption text-ink-gray-7">
                  Live controls load as you scroll — the page stays light until
                  then.
                </span>
                <A
                  href="/components"
                  class="rounded-3 text-interface text-ink-blue-link underline decoration-dotted focus-visible:focus-ring"
                >
                  Browse the live components
                </A>
              </p>
            </div>
          }
        >
          <Suspense
            fallback={
              <div class="grid min-h-44 place-items-center rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-4">
                <p class="text-caption text-ink-gray-7" role="status">
                  Loading previews…
                </p>
              </div>
            }
          >
            <HomePreviews />
          </Suspense>
        </Show>
      </div>
    </section>
  )
}

interface HandOff {
  title: string
  href: string
  body: string
}

const HAND_OFFS: HandOff[] = [
  {
    title: 'Components',
    href: '/components',
    body: 'Atoms and molecules over Zag primitives — keyboard, focus and ARIA come from the machine.',
  },
  {
    title: 'Blocks',
    href: '/blocks',
    body: 'The shapes a page is assembled from: a filter bar, a toolbar, a sidebar, a stat grid.',
  },
  {
    title: 'Examples',
    href: '/examples',
    body: 'Whole screens rebuilt end to end, every control wired to real state.',
  },
]

const RULES: { title: string; body: string }[] = [
  {
    title: 'Two colour axes, never more',
    body: 'variant (solid · subtle · outline · ghost) and theme (gray · blue · green · amber · red). Error, disabled and loading are states, not colours.',
  },
  {
    title: 'No v-model',
    body: 'Overlays take open + onOpenChange. Inputs take value + onValueChange, or default* when uncontrolled. The machine owns the rest.',
  },
  {
    title: 'Semantic tokens only',
    body: 'surface-*, ink-*, outline-* — never a raw palette step and never a hex. Light/dark is one document attribute, so both themes come free.',
  },
  {
    title: 'Zag supplies the behaviour',
    body: 'Every interactive component connects a @zag-js machine through createZagApi. We own the markup and the recipe, never the keyboard map.',
  },
]

export function Home(): JSX.Element {
  return (
    <div class="flex flex-col gap-10">
      <header class="flex flex-col gap-5">
        <h1 class="max-w-3xl text-hero text-ink-gray-9">
          Clarity for your next data application.
        </h1>
        <p class="max-w-2xl text-lg text-ink-gray-7">
          Compact controls, thoughtful charts and composed layouts for ambitious
          business software. Built with SolidJS, accessible by design, and ready
          for your data.
        </p>
        <pre class="w-fit max-w-full overflow-x-auto rounded-3 border border-outline-gray-1 bg-surface-elevation-1 p-3 text-interface text-ink-gray-8">
          <code>pnpm add @newui/ui @newui/tailwind</code>
        </pre>
      </header>

      <section class="flex flex-col gap-4">
        <h2 class="text-section text-ink-gray-9">Start here</h2>
        <div class="flex flex-col divide-y divide-outline-gray-1 rounded-5 border border-outline-gray-1">
          <For each={HAND_OFFS}>
            {(item) => (
              <A
                href={item.href}
                class="flex min-h-11 items-center gap-3 rounded-3 p-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
              >
                <div class="min-w-0 flex-1">
                  <h3 class="text-interface font-medium">{item.title}</h3>
                  <p class="mt-1 text-caption text-ink-gray-7">{item.body}</p>
                </div>
                <span
                  aria-hidden="true"
                  class="lucide-arrow-right size-4 shrink-0 text-ink-gray-7"
                />
              </A>
            )}
          </For>
        </div>
      </section>

      <PreviewSection />

      <section class="flex flex-col gap-4">
        <h2 class="text-section text-ink-gray-9">The rules it holds to</h2>
        <dl class="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <For each={RULES}>
            {(rule) => (
              <div class="flex flex-col gap-1 border-t border-outline-gray-1 pt-4">
                <dt class="text-base-medium text-ink-gray-8">{rule.title}</dt>
                <dd class="text-base text-ink-gray-7">{rule.body}</dd>
              </div>
            )}
          </For>
        </dl>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-section text-ink-gray-9">Why it is small</h2>
        <p class="max-w-2xl text-base text-ink-gray-7">
          Components are priced. A gzip budget per entry and a tree-shaking
          assertion run in CI, so importing{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">Button</code>{' '}
          cannot drag the dialog machine in behind it. The site you are reading
          holds itself to the same rule: every route is its own chunk, and the
          shell imports no component at all.
        </p>
      </section>
    </div>
  )
}
