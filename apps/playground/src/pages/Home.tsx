import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'

/**
 * The home page.
 *
 * Deliberately the cheapest route on the site: no component is imported, so the
 * chunk is this file plus the shell. A library's home page is not a place to
 * demo twelve widgets — the reader is deciding whether to install it, so the
 * page answers three questions (what is it, what does it cost, where do I go
 * next) and hands off to `/components`, `/blocks` and `/examples`.
 */

interface Pillar {
  title: string
  href: string
  body: string
  meta: string
}

const PILLARS: Pillar[] = [
  {
    title: 'Foundations',
    href: '/foundations',
    body: 'Colour, type, radius, elevation, focus and motion — the tokens every component is built from, and the two axes that carry meaning (variant, theme).',
    meta: 'tokens',
  },
  {
    title: 'Components',
    href: '/components/button',
    body: 'Atoms and molecules over Zag primitives: keyboard, focus and ARIA come from the machine, the surface comes from a tv() recipe.',
    meta: 'Zag primitives',
  },
  {
    title: 'Blocks',
    href: '/blocks',
    body: 'The shapes a page is actually assembled from — a filter bar, a settings panel, an empty state, a toolbar.',
    meta: 'composed',
  },
  {
    title: 'Examples',
    href: '/examples',
    body: 'Whole screens taken from real products and rebuilt: rail, sidebar, feed, settings dialog, mobile shell.',
    meta: 'recipes',
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
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-5">
        <p class="text-sm text-ink-gray-6">SolidJS · Zag · Tailwind CSS v4</p>
        <h1 class="max-w-3xl text-heading text-ink-gray-9 sm:text-hero">
          Clarity for your next data application.
        </h1>
        <p class="max-w-2xl text-lg text-ink-gray-7">
          Compact controls, thoughtful charts and composed layouts for ambitious
          business software. Built with SolidJS, accessible by design, and ready
          for your data.
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <A
            href="/docs"
            class="inline-flex h-7 items-center gap-2 rounded-4 bg-surface-blue-8 px-3 text-base-medium text-ink-base transition-colors hover:bg-surface-blue-9 focus-visible:focus-ring"
          >
            Install
          </A>
          <A
            href="/components/button"
            class="inline-flex h-7 items-center gap-2 rounded-4 border border-outline-gray-2 px-3 text-base text-ink-gray-8 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring"
          >
            Browse components
          </A>
        </div>
      </header>

      <section class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-section">From data to decisions.</h2>
          <A
            href="/examples/analytics"
            class="text-interface text-ink-blue-link focus-visible:focus-ring"
          >
            Explore the live dashboard{' '}
            <span
              aria-hidden="true"
              class="lucide-arrow-up-right inline-block size-4 align-middle"
            />
          </A>
        </div>
        <A
          href="/examples/analytics"
          class="overflow-hidden rounded-5 border border-outline-gray-1 bg-surface-gray-1 p-3 focus-visible:focus-ring sm:p-4"
        >
          <div class="mb-5 flex justify-between gap-3">
            <div>
              <p class="text-caption text-ink-gray-6">ACME WORKSPACE</p>
              <h3 class="mt-1 text-section">Revenue overview</h3>
            </div>
            <span class="h-fit rounded-3 border border-outline-gray-2 bg-surface-elevation-1 px-2 py-1 text-caption text-ink-gray-6">
              Last 30 days
            </span>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <For
              each={[
                ['Total revenue', '$120,840'],
                ['Transactions', '2,486'],
                ['Average order', '$486'],
              ]}
            >
              {(metric) => (
                <div class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3">
                  <p class="text-caption text-ink-gray-6">{metric[0]}</p>
                  <p class="mt-2 text-metric">{metric[1]}</p>
                  <p class="mt-2 text-caption text-ink-green-7">
                    <span
                      aria-hidden="true"
                      class="lucide-arrow-up-right inline-block size-4 align-middle"
                    />{' '}
                    Growing this month
                  </p>
                </div>
              )}
            </For>
          </div>
          <div class="mt-4 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3">
            <p class="text-interface font-medium">Revenue over time</p>
            <svg
              viewBox="0 0 800 160"
              class="mt-3 h-36 w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 140 L50 120 L100 128 L150 90 L200 100 L250 80 L300 105 L350 70 L400 85 L450 48 L500 58 L550 35 L600 55 L650 18 L700 30 L750 10 L800 20 L800 160 L0 160 Z"
                fill="var(--surface-blue-2)"
              />
              <path
                d="M0 140 L50 120 L100 128 L150 90 L200 100 L250 80 L300 105 L350 70 L400 85 L450 48 L500 58 L550 35 L600 55 L650 18 L700 30 L750 10 L800 20"
                fill="none"
                stroke="var(--ink-blue-link)"
                stroke-width="3"
              />
            </svg>
            <div class="flex justify-between text-caption text-ink-gray-6">
              <span>Sep 1</span>
              <span>Sep 15</span>
              <span>Sep 30</span>
            </div>
          </div>
        </A>
        <pre class="overflow-x-auto rounded-3 border border-outline-gray-1 bg-surface-elevation-1 p-3 text-interface text-ink-gray-8">
          <code>pnpm add @newui/ui @newui/tailwind</code>
        </pre>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-section text-ink-gray-9">Start here</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <For each={PILLARS}>
            {(pillar) => (
              <A
                href={pillar.href}
                class="flex flex-col gap-2 rounded-6 border border-outline-gray-2 p-5 transition-colors hover:border-outline-gray-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
              >
                <span class="flex items-baseline justify-between gap-3">
                  <span class="text-lg-medium text-ink-gray-9">
                    {pillar.title}
                  </span>
                  <span class="shrink-0 text-xs text-ink-gray-6">
                    {pillar.meta}
                  </span>
                </span>
                <span class="text-base text-ink-gray-6">{pillar.body}</span>
              </A>
            )}
          </For>
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-section text-ink-gray-9">The rules it holds to</h2>
        <dl class="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <For each={RULES}>
            {(rule) => (
              <div class="flex flex-col gap-1 border-t border-outline-gray-1 pt-4">
                <dt class="text-base-medium text-ink-gray-8">{rule.title}</dt>
                <dd class="text-base text-ink-gray-6">{rule.body}</dd>
              </div>
            )}
          </For>
        </dl>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-section text-ink-gray-9">Why it is small</h2>
        <p class="max-w-2xl text-base text-ink-gray-6">
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
