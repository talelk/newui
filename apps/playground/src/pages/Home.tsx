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
import { LADDER_COUNTS } from '../generated/counts'
import { LADDER } from '../generated/ladder'

/**
 * The home page.
 *
 * Deliberately the cheapest route on the site: no component is imported
 * statically, so the initial chunk is this file plus the shell. The reader
 * is deciding whether to install the library, so the page answers three
 * questions (what is it, what does it cost, where do I go next) and hands
 * off to `/atoms`, `/organisms` and `/pages`. The live product composition
 * is a separate chunk loaded only when it scrolls into view — real components,
 * paid for only by readers who reach them.
 */

const HomePreviews = lazy(() => import('./home-previews'))

const INSTALL_COMMAND =
  'pnpm add @talelk/newui-atoms @talelk/newui-molecules @talelk/newui-tailwind'

function InstallCommand(): JSX.Element {
  const [copyStatus, setCopyStatus] = createSignal('')
  let resetTimer: number | undefined

  async function copy() {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND)
      setCopyStatus('Copied')
    } catch {
      setCopyStatus('Copy failed')
    }
    window.clearTimeout(resetTimer)
    resetTimer = window.setTimeout(() => setCopyStatus(''), 2000)
  }

  onCleanup(() => window.clearTimeout(resetTimer))

  return (
    <div class="flex w-fit max-w-full items-center gap-1 rounded-control border border-outline-gray-1 bg-surface-elevation-1 p-1">
      <pre
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the command scrolls horizontally on narrow screens, so the region must be keyboard reachable.
        tabIndex={0}
        class="min-w-0 overflow-x-auto rounded-control px-2 py-1 text-interface whitespace-nowrap text-ink-gray-8 focus-visible:focus-ring"
      >
        <code>{INSTALL_COMMAND}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control px-2 text-caption text-ink-gray-7 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring motion-reduce:transition-none"
      >
        <span
          aria-hidden="true"
          class={`${copyStatus() === 'Copied' ? 'lucide-check' : 'lucide-copy'} size-3.5`}
        />
        {copyStatus() || 'Copy'}
      </button>
      <span role="status" class="sr-only">
        {copyStatus() === 'Copied' ? 'Install command copied.' : copyStatus()}
      </span>
    </div>
  )
}

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
            <div class="grid min-h-44 place-items-center rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-4">
              <div class="flex w-full flex-col items-center gap-3">
                {/*
                  A static wireframe of what loads: a metric, a table, a chart.
                  Markup and tokens only, so the placeholder costs nothing and
                  never reads as an empty box.
                */}
                <div aria-hidden="true" class="flex w-full max-w-xl gap-3">
                  <div class="flex flex-1 flex-col gap-2 rounded-3 border border-outline-gray-1 bg-surface-base p-3">
                    <span class="h-1.5 w-10 rounded-1 bg-surface-gray-4" />
                    <span class="h-3 w-14 rounded-1 bg-surface-gray-3" />
                    <span class="h-1.5 w-8 rounded-1 bg-surface-gray-4" />
                  </div>
                  <div class="flex flex-1 flex-col justify-between gap-1.5 rounded-3 border border-outline-gray-1 bg-surface-base p-3">
                    <For each={[0, 1, 2, 3]}>
                      {() => (
                        <span class="flex items-center gap-1.5">
                          <span class="size-1.5 rounded-full bg-surface-gray-4" />
                          <span class="h-1.5 flex-1 rounded-1 bg-surface-gray-3" />
                          <span class="h-1.5 w-6 rounded-1 bg-surface-gray-4" />
                        </span>
                      )}
                    </For>
                  </div>
                  <div class="flex flex-1 items-end gap-1 rounded-3 border border-outline-gray-1 bg-surface-base p-3">
                    <For
                      each={['h-4', 'h-7', 'h-5', 'h-9', 'h-6', 'h-8', 'h-10']}
                    >
                      {(height, index) => (
                        <span
                          class={`w-full flex-1 rounded-1 ${height} ${
                            index() === 6
                              ? 'bg-surface-gray-5'
                              : 'bg-surface-gray-3'
                          }`}
                        />
                      )}
                    </For>
                  </div>
                </div>
                <p class="flex flex-col items-center gap-2 text-center">
                  <span class="text-caption text-ink-gray-7">
                    Live controls load as you scroll: the page stays light until
                    then.
                  </span>
                  <A
                    href="/atoms"
                    class="rounded-3 text-interface text-ink-blue-link underline decoration-dotted focus-visible:focus-ring"
                  >
                    Browse the live components
                  </A>
                </p>
              </div>
            </div>
          }
        >
          <Suspense
            fallback={
              <div class="grid min-h-44 place-items-center rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-4">
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
    body: 'surface-*, ink-*, outline-*: never a raw palette step and never a hex. Light/dark is one document attribute, so both themes come free.',
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
        <p class="max-w-[30rem] text-lg text-ink-gray-7">
          Compact controls, thoughtful charts and composed layouts for ambitious
          business software. Built with SolidJS, accessible by design, and ready
          for your data.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <A
            href="/atoms"
            class="inline-flex h-8 items-center gap-2 rounded-control bg-surface-blue-8 px-3 text-interface font-medium text-ink-base transition-colors hover:bg-surface-blue-9 focus-visible:focus-ring-blue motion-reduce:transition-none"
          >
            Browse components
            <span aria-hidden="true" class="lucide-arrow-right size-4" />
          </A>
          <A
            href="/pages"
            class="inline-flex h-8 items-center rounded-control border border-outline-gray-2 bg-surface-base px-3 text-interface font-medium text-ink-gray-8 transition-colors hover:border-outline-gray-3 hover:bg-surface-gray-1 focus-visible:focus-ring motion-reduce:transition-none"
          >
            View applications
          </A>
        </div>
        <InstallCommand />
        <p class="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-caption tabular-nums text-ink-gray-7">
          <span>{LADDER_COUNTS.atoms} atoms</span>
          <span>{LADDER_COUNTS.molecules} molecules</span>
          <span>{LADDER_COUNTS.organisms} organisms</span>
          <span>{LADDER_COUNTS.templates} templates</span>
          <A
            href="/pages"
            class="rounded-3 text-ink-blue-link underline decoration-dotted focus-visible:focus-ring"
          >
            {LADDER_COUNTS.pages} complete apps
          </A>
        </p>
      </header>

      <PreviewSection />

      <section class="flex flex-col gap-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="text-section text-ink-gray-9">The ladder</h2>
          <A
            href="/architecture"
            class="rounded-3 text-caption text-ink-blue-link focus-visible:focus-ring"
          >
            How the levels fit together →
          </A>
        </div>
        <ol class="flex flex-col divide-y divide-outline-gray-1 rounded-card border border-outline-gray-1">
          <For each={LADDER}>
            {(level, index) => (
              <li>
                <A
                  href={level.href}
                  class="flex items-center gap-3 rounded-3 p-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
                >
                  <span
                    aria-hidden="true"
                    class="w-5 shrink-0 text-xs tabular-nums text-ink-gray-6"
                  >
                    {String(index() + 1).padStart(2, '0')}
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <h3 class="text-interface font-medium text-ink-gray-9">
                        {level.title}
                      </h3>
                      <code class="text-xs text-ink-gray-7">
                        {level.package}
                      </code>
                      <span class="text-caption tabular-nums text-ink-gray-7">
                        {level.count} {level.unit}
                        {level.count === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p class="mt-1 text-caption text-ink-gray-7">
                      <span class="italic">{level.question}</span> {level.blurb}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    class="lucide-arrow-right size-4 shrink-0 text-ink-gray-7"
                  />
                </A>
              </li>
            )}
          </For>
        </ol>
      </section>

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
        <p class="max-w-[30rem] text-base text-ink-gray-7">
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
