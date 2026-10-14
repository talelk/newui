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
    href: '/components/atoms',
    body: 'Atoms and molecules over Zag primitives: keyboard, focus and ARIA come from the machine, the surface comes from a tv() recipe.',
    meta: '101 compounds',
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
    <div class="flex flex-col gap-16">
      <header class="flex flex-col gap-5">
        <p class="text-sm text-ink-gray-5">SolidJS · Zag · Tailwind CSS v4</p>
        <h1 class="max-w-3xl text-3xl-bold text-ink-gray-9 sm:text-4xl-bold">
          A construction kit for building Frappe-shaped apps in Solid.
        </h1>
        <p class="max-w-2xl text-lg text-ink-gray-7">
          newui is frappe-ui's component set rebuilt on SolidJS: the same
          vocabulary (variant, theme, open, dismissible), the same density and
          the same tokens — with the keyboard, focus and ARIA handed to Zag
          instead of hand-written per component.
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <A
            href="/docs"
            class="inline-flex h-8 items-center gap-2 rounded-4 bg-surface-gray-10 px-3 text-base-medium text-ink-base transition-colors hover:bg-surface-gray-9 focus-visible:focus-ring"
          >
            Install
          </A>
          <A
            href="/components/atoms"
            class="inline-flex h-8 items-center gap-2 rounded-4 border border-outline-gray-2 px-3 text-base text-ink-gray-8 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring"
          >
            Browse components
          </A>
        </div>
      </header>

      <section class="flex flex-col gap-4">
        <h2 class="text-xl-medium text-ink-gray-9">Start here</h2>
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
                  <span class="shrink-0 text-xs text-ink-gray-5">
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
        <h2 class="text-xl-medium text-ink-gray-9">The rules it holds to</h2>
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
        <h2 class="text-xl-medium text-ink-gray-9">Why it is small</h2>
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
