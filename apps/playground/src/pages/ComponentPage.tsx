import { Badge, Button } from '@newui/ui'
import { A, useParams } from '@solidjs/router'
import {
  createMemo,
  createResource,
  For,
  type JSX,
  lazy,
  Show,
  Suspense,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { DEMOS } from '../demos'
import { componentBySlug } from '../generated/components'
import { Markdown, renderInline } from '../lib/markdown'
import { InlinePreview, ResponsivePreview } from '../lib/ResponsivePreview'
import { loadSpec } from '../lib/specs'

/**
 * One component's reference page.
 *
 * Assembled from three things that already exist, in this order of authority:
 *
 *  1. the live demo — the same function `/play` renders, so there is one demo
 *     and not a documentation copy of one;
 *  2. the prop tables, from this component's slice of `api.json`;
 *  3. the contract, from `spec/<name>.md`.
 *
 * Nothing here is hand-maintained per component: adding one to the library and
 * running `pnpm api` + `pnpm site` produces its page. That is the property worth
 * protecting — a reference site that drifts from the code is worse than none.
 */

interface ApiMember {
  name: string
  type: string
  optional: boolean
  description?: string
  default?: string
}

/**
 * Prop tables load per component. The glob is inside the app root, so it needs
 * no `fs.allow` and Vite gives each slice its own chunk — a component page
 * fetches ~1 kB of tables rather than the 111 kB `api.json`.
 */
const API_SLICES = import.meta.glob<{ API: Record<string, ApiMember[]> }>(
  '../generated/api/*.ts',
)

const DEMO_SOURCES = import.meta.glob<{ default: string }>('../demos/*.tsx', {
  query: '?raw',
})

function ApiTable(props: { part: string; members: ApiMember[] }): JSX.Element {
  return (
    <div class="flex flex-col gap-2">
      <h3 class="text-base-medium text-ink-gray-8">{props.part}</h3>
      {/* The table keeps its shape and the *container* scrolls: a `w-full`
          table on a phone squeezes the notes column to four words a line. */}
      <section
        tabindex="0"
        aria-label={`${props.part} properties`}
        class="overflow-x-auto rounded-5 border border-outline-gray-1"
      >
        <table class="w-full min-w-[38rem] border-collapse text-base">
          <thead>
            <tr class="bg-surface-gray-1">
              <th class="border-b border-outline-gray-1 px-3 py-2 text-start text-sm-medium text-ink-gray-8">
                prop
              </th>
              <th class="border-b border-outline-gray-1 px-3 py-2 text-start text-sm-medium text-ink-gray-8">
                type
              </th>
              <th class="border-b border-outline-gray-1 px-3 py-2 text-start text-sm-medium text-ink-gray-8">
                default
              </th>
              <th class="border-b border-outline-gray-1 px-3 py-2 text-start text-sm-medium text-ink-gray-8">
                notes
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={props.members}>
              {(member) => (
                <tr>
                  <td class="border-b border-outline-gray-1 px-3 py-2 align-top whitespace-nowrap text-ink-gray-8">
                    <code>{member.name}</code>
                    <Show when={!member.optional}>
                      <span class="ms-1 text-ink-red-7" title="required">
                        *
                      </span>
                    </Show>
                  </td>
                  <td class="border-b border-outline-gray-1 px-3 py-2 align-top font-mono text-sm text-ink-gray-6">
                    {member.type}
                  </td>
                  <td class="border-b border-outline-gray-1 px-3 py-2 align-top text-ink-gray-6">
                    <code>{member.default ?? '—'}</code>
                  </td>
                  <td class="border-b border-outline-gray-1 px-3 py-2 align-top text-ink-gray-6">
                    {/* The JSDoc is markdown (`**rows**`, backticks), so it
                        goes through the same inline renderer as the specs. */}
                    {renderInline(member.description ?? '')}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </section>
    </div>
  )
}

function ApiTables(props: { slug: string }): JSX.Element {
  const [tables] = createResource(
    () => props.slug,
    async (slug) => {
      const loader = API_SLICES[`../generated/api/${slug}.ts`]
      if (!loader) return {}
      return (await loader()).API
    },
  )

  return (
    <Suspense
      fallback={<p class="text-base text-ink-gray-6">Loading props…</p>}
    >
      <Show
        when={tables() && Object.keys(tables() ?? {}).length > 0}
        fallback={
          <p class="text-base text-ink-gray-6">
            No documented props for this component.
          </p>
        }
      >
        <div class="flex flex-col gap-6">
          <For each={Object.entries(tables() ?? {})}>
            {([part, members]) => (
              <ApiTable part={part} members={members as ApiMember[]} />
            )}
          </For>
        </div>
      </Show>
    </Suspense>
  )
}

function Contract(props: { slug: string }): JSX.Element {
  const [markdown] = createResource(
    () => props.slug,
    async (slug) => {
      const load = loadSpec(slug)
      return load ? await load() : null
    },
  )

  return (
    <Suspense
      fallback={<p class="text-base text-ink-gray-6">Loading the contract…</p>}
    >
      <Show
        when={markdown()}
        fallback={
          <p class="text-base text-ink-gray-6">
            The contract could not be loaded. Reload the page to try again.
          </p>
        }
      >
        {(text) => <Markdown markdown={text()} />}
      </Show>
    </Suspense>
  )
}

export function ComponentPage(): JSX.Element {
  const params = useParams()
  const entry = createMemo(() => componentBySlug(params['name'] ?? ''))

  return (
    <Show
      when={entry()}
      fallback={
        <div class="flex flex-col gap-2">
          <h1 class="text-heading text-ink-gray-9">
            No component called “{params['name']}”
          </h1>
          <p class="text-base text-ink-gray-6">
            The index lists every documented component —{' '}
            <A
              href="/components"
              class="text-ink-blue-6 underline decoration-dotted"
            >
              browse it
            </A>
            .
          </p>
        </div>
      }
    >
      {(component) => {
        // The demo module is lazy, and wrapped so `<Show>` cannot mistake a
        // component for a plain value.
        const demo = createMemo(() => {
          const load = DEMOS[component().name]
          return load ? { Component: lazy(load) } : undefined
        })

        return (
          <article class="flex flex-col gap-4">
            <header class="flex flex-col gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-heading text-ink-gray-9">{component().name}</h1>
                <Badge
                  size="sm"
                  theme={component().kind === 'block' ? 'violet' : 'gray'}
                >
                  {component().kind === 'block' ? 'block' : component().group}
                </Badge>
                <Show when={component().spec}>
                  <Badge size="sm" theme="blue" label="contract" />
                </Show>
              </div>
              <p class="max-w-2xl text-interface text-ink-gray-6">
                {component().description}
              </p>
              <p class="text-caption text-ink-gray-6">
                {component().package} · {component().parts.length} parts
              </p>
              <nav
                aria-label="Reference sections"
                class="flex flex-wrap gap-3 text-interface text-ink-gray-6"
              >
                <a
                  href="#preview"
                  class="rounded-3 hover:underline focus-visible:focus-ring"
                >
                  Preview
                </a>
                <a
                  href="#usage"
                  class="rounded-3 hover:underline focus-visible:focus-ring"
                >
                  Usage
                </a>
                <a
                  href="#props"
                  class="rounded-3 hover:underline focus-visible:focus-ring"
                >
                  Props
                </a>
                <a
                  href="#contract"
                  class="rounded-3 hover:underline focus-visible:focus-ring"
                >
                  Contract
                </a>
              </nav>
              <div class="flex flex-wrap gap-2">
                {/* `route` renders a plain anchor, which is what a standalone
                    demo wants: its own document, not a router transition. */}
                <Button
                  route={`/play?c=${component().name}`}
                  target="_blank"
                  variant="outline"
                  size="sm"
                  iconLeft="lucide-external-link"
                >
                  Open standalone
                </Button>
                <Button
                  href={`https://github.com/talelk/newui/tree/main/${component().source}`}
                  variant="ghost"
                  size="sm"
                  iconLeft="lucide-code"
                >
                  Source
                </Button>
              </div>
            </header>

            <section id="preview" class="flex scroll-mt-16 flex-col gap-3">
              <h2 class="text-section text-ink-gray-9">Live demo</h2>
              <Show
                when={component().kind === 'block'}
                fallback={
                  <InlinePreview
                    title={component().name}
                    source={() =>
                      DEMO_SOURCES[`../demos/${component().slug}.tsx`]?.().then(
                        (module) => module.default,
                      ) ?? Promise.resolve('')
                    }
                  >
                    <Show
                      when={demo()}
                      fallback={
                        <p class="text-base text-ink-gray-6">
                          No demo registered for this component yet.
                        </p>
                      }
                    >
                      {(entry) => (
                        <Suspense
                          fallback={
                            <p class="text-base text-ink-gray-6">
                              Loading demo…
                            </p>
                          }
                        >
                          <Dynamic component={entry().Component} />
                        </Suspense>
                      )}
                    </Show>
                  </InlinePreview>
                }
              >
                <ResponsivePreview
                  title={component().name}
                  src={`/play?c=${component().name}`}
                  source={() =>
                    DEMO_SOURCES[`../demos/${component().slug}.tsx`]?.().then(
                      (module) => module.default,
                    ) ?? Promise.resolve('')
                  }
                />
              </Show>
            </section>

            <section id="usage" class="flex scroll-mt-16 flex-col gap-3">
              <h2 class="text-section text-ink-gray-9">Usage</h2>
              <pre class="overflow-x-auto rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-4 text-caption">
                <code>{`import { ${component().name} } from '${component().package}'`}</code>
              </pre>
            </section>
            <section id="props" class="flex scroll-mt-16 flex-col gap-3">
              <h2 class="text-section text-ink-gray-9">Props</h2>
              <ApiTables slug={component().slug} />
            </section>

            <section id="contract" class="flex scroll-mt-16 flex-col gap-3">
              <div class="flex items-baseline gap-2">
                <h2 class="text-section text-ink-gray-9">Contract</h2>
                <A
                  href={`https://github.com/talelk/newui/blob/main/spec/${component().spec ?? component().slug}.md`}
                  class="text-sm text-ink-gray-6 underline decoration-dotted"
                >
                  spec/{component().spec ?? component().slug}.md
                </A>
              </div>
              <Contract slug={component().spec ?? component().slug} />
            </section>
          </article>
        )
      }}
    </Show>
  )
}
