import { A, useParams } from '@solidjs/router'
import { Icon } from '@talelk/newui-atoms'
import {
  createMemo,
  createResource,
  createSignal,
  For,
  lazy,
  Show,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { applicationSources } from '../lib/application-sources'
import { CatalogList } from '../lib/CatalogList'
import { patternComponents } from '../lib/pattern-sources'
import { SourcePanel } from '../lib/ResponsivePreview'
import { PATTERNS, REFERENCE_EXAMPLES } from '../lib/reference-examples'
import { PageIntro } from '../shell/PageIntro'

const modules = {
  forms: lazy(() => import('../patterns/Forms')),
  overlays: lazy(() => import('../patterns/Overlays')),
  carousel: lazy(() => import('../patterns/Carousel')),
  command: lazy(() => import('../patterns/Command')),
  layout: lazy(() => import('../patterns/Layout')),
  navigation: lazy(() => import('../patterns/Navigation')),
  verification: lazy(() => import('../patterns/Verification')),
  'analytics-widgets': lazy(() => import('../patterns/AnalyticsWidgets')),
}

/** `analytics-widgets` → `Analytics Widgets`, for destination labels. */
const titleCase = (value: string) =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

/** The atomic level an example destination belongs to, from its path. */
function exampleSection(href: string): string {
  if (href.startsWith('/atoms/')) return 'Atoms'
  if (href.startsWith('/molecules/')) return 'Molecules'
  if (href.startsWith('/organisms/')) return 'Organisms'
  if (href.startsWith('/templates/')) return 'Templates'
  if (href.startsWith('/kit/recipes/')) return 'Compositions'
  return 'Foundations'
}

/** Where an example lands, in words: the public page that owns its API. */
function destinationLabel(href: string): string {
  const anchor = href.split('#')[1]
  if (anchor) return titleCase(anchor)
  const slug = href.split('/').at(-1) ?? ''
  if (href.startsWith('/kit/recipes/'))
    return (
      PATTERNS.find((pattern) => pattern.slug === slug)?.title ??
      titleCase(slug)
    )
  return titleCase(slug)
}

interface ExampleRow {
  name: string
  slug: string
  description: string
  href: string
}

const EXAMPLE_GROUP_ORDER = [
  'Atoms',
  'Molecules',
  'Organisms',
  'Templates',
  'Compositions',
  'Foundations',
]

export function Patterns() {
  const params = useParams()
  const pattern = () => PATTERNS.find((item) => item.slug === params['name'])
  const Content = () => (
    <Dynamic component={modules[pattern()?.slug ?? 'carousel']} />
  )
  const [query, setQuery] = createSignal('')

  const exampleSections = createMemo(() => {
    const needle = query().trim().toLowerCase()
    const visible = REFERENCE_EXAMPLES.filter(
      (item) =>
        needle === '' ||
        item.name.includes(needle) ||
        destinationLabel(item.href).toLowerCase().includes(needle),
    ).map(
      (item): ExampleRow => ({
        name: item.name,
        slug: item.source,
        description: destinationLabel(item.href),
        href: item.href,
      }),
    )
    return EXAMPLE_GROUP_ORDER.map((group) => ({
      group,
      entries: visible.filter((item) => exampleSection(item.href) === group),
    })).filter((section) => section.entries.length > 0)
  })

  /** The generated "built from" list for the open recipe. */
  const [builtFrom] = createResource(
    () => pattern()?.slug,
    (slug) => patternComponents(slug),
  )

  return (
    <div class="flex min-w-0 flex-col gap-8">
      <PageIntro
        title={pattern()?.title ?? 'Recipes and examples'}
        description={
          pattern()?.description ??
          'Small, working compositions and registry examples, linked to the public atoms, molecules and organisms they demonstrate.'
        }
      />
      <Show
        when={pattern()}
        fallback={
          <>
            <section
              class="flex flex-col divide-y divide-outline-gray-1 rounded-card border border-outline-gray-1"
              aria-label="Additional patterns"
            >
              <For each={PATTERNS}>
                {(item) => (
                  <A
                    href={`/kit/recipes/${item.slug}`}
                    class="flex min-h-11 items-center gap-3 rounded-3 p-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
                  >
                    <div class="min-w-0 flex-1">
                      <h2 class="text-interface font-medium">{item.title}</h2>
                      <p class="mt-1 text-caption text-ink-gray-7">
                        {item.description}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      class="lucide-arrow-up-right size-4 shrink-0 text-ink-gray-7"
                    />
                  </A>
                )}
              </For>
            </section>
            <section aria-labelledby="registry-heading">
              <h2 id="registry-heading" class="mb-4 text-section">
                All {REFERENCE_EXAMPLES.length} reference examples
              </h2>
              <label class="relative mb-6 flex max-w-sm items-center">
                <span class="sr-only">Filter reference examples</span>
                <Icon
                  icon="lucide-search"
                  class="pointer-events-none absolute start-2.5 size-4 text-ink-gray-6"
                />
                <input
                  type="search"
                  value={query()}
                  onInput={(event) => setQuery(event.currentTarget.value)}
                  placeholder="Filter by name or destination…"
                  class="h-7 w-full rounded-4 border border-outline-gray-2 bg-surface-base ps-8 pe-2 text-base text-ink-gray-8 placeholder:text-ink-gray-6 focus-visible:focus-ring"
                />
              </label>
              <CatalogList
                sections={exampleSections()}
                href={(entry) => entry.href}
                trailing={() => (
                  <span
                    aria-hidden="true"
                    class="lucide-arrow-up-right size-4 shrink-0 text-ink-gray-7"
                  />
                )}
              />
            </section>
          </>
        }
      >
        <div class="min-w-0">
          <Content />
        </div>
        <Show when={builtFrom()?.length}>
          <section
            aria-labelledby="built-from-heading"
            class="flex flex-col gap-2"
          >
            <h2 id="built-from-heading" class="text-section">
              Built from
            </h2>
            <p class="text-caption text-ink-gray-7">
              The public components this composition imports, generated from its
              source.
            </p>
            <ul class="flex flex-wrap gap-2">
              <For each={builtFrom()}>
                {(component) => (
                  <li>
                    <A
                      href={component.href}
                      class="inline-flex min-h-8 items-center gap-1.5 rounded-3 border border-outline-gray-1 bg-surface-elevation-1 px-2.5 text-caption text-ink-gray-8 hover:bg-surface-gray-2 focus-visible:focus-ring"
                    >
                      {component.name}
                      <span
                        aria-hidden="true"
                        class="lucide-arrow-up-right size-3.5 text-ink-gray-6"
                      />
                    </A>
                  </li>
                )}
              </For>
            </ul>
          </section>
        </Show>
        <Show when={pattern()}>
          {(open) => (
            <section
              aria-labelledby="source-heading"
              class="flex flex-col gap-2"
            >
              <h2 id="source-heading" class="text-section">
                Source
              </h2>
              <p class="text-caption text-ink-gray-7">
                The full composition, ready to copy — the same files the demo
                above renders.
              </p>
              <SourcePanel
                sourceKey={open().slug}
                source={() => applicationSources(`pattern-${open().slug}`)}
              />
            </section>
          )}
        </Show>
        <A
          href="/kit/recipes"
          class="w-fit rounded-3 text-ink-blue-link focus-visible:focus-ring"
        >
          <span
            aria-hidden="true"
            class="lucide-arrow-left inline-block size-4 align-middle"
          />{' '}
          All recipes
        </A>
      </Show>
    </div>
  )
}
