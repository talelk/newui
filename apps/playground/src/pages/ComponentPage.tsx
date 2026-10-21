import { Badge, Button } from '@newui/atoms'
import { A, useLocation, useParams } from '@solidjs/router'
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
import { componentBySlug } from '../generated/components'
import { STORIES } from '../generated/stories'
import { ATOMIC } from '../lib/atomic'
import { stripBase } from '../lib/base'
// The globs behind the tables and the story source text live here rather than
// in this page: Vite 8's dep scan cannot parse `.tsx` files that hold a source
// glob, so a page hosting one breaks pre-bundling.
import {
  API_SLICES,
  type ApiMember,
  STORY_SOURCES,
} from '../lib/component-sources'
import { LoadingNote } from '../lib/LoadingNote'
import {
  Markdown,
  markdownHeadings,
  renderInline,
  withoutPropsSections,
} from '../lib/markdown'
import { PageSection } from '../lib/PageSection'
import { InlinePreview, ResponsivePreview } from '../lib/ResponsivePreview'
import { hrefOf, sectionOf } from '../lib/reference-href'
import { loadSpec } from '../lib/specs'
import { storyUrl } from '../lib/storybook'
import { TableOfContents } from '../lib/TableOfContents'
import { usePageToc } from '../shell/SiteLayout'

/**
 * One component's reference page.
 *
 * Assembled from three things that already exist, in this order of authority:
 *
 *  1. the live demo — the story file's `Demo` export, the same function
 *     Storybook's stories render, so there is one demo and not a copy;
 *  2. the prop tables, from this component's slice of `api.json`;
 *  3. the contract, from `spec/<name>.md`.
 *
 * Nothing here is hand-maintained per component: adding one to the library and
 * running `pnpm api` + `pnpm site` produces its page. That is the property worth
 * protecting — a reference site that drifts from the code is worse than none.
 */

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
                  <td class="border-b border-outline-gray-1 px-3 py-2 align-top font-mono text-sm text-ink-gray-7">
                    {member.type}
                  </td>
                  <td class="border-b border-outline-gray-1 px-3 py-2 align-top text-ink-gray-7">
                    <code>{member.default ?? '—'}</code>
                  </td>
                  <td class="border-b border-outline-gray-1 px-3 py-2 align-top text-ink-gray-7">
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
    <Suspense fallback={<LoadingNote label="Loading props…" />}>
      <Show
        when={tables() && Object.keys(tables() ?? {}).length > 0}
        fallback={
          <p class="text-base text-ink-gray-7">
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

function Contract(props: { slug: string; stripProps: boolean }): JSX.Element {
  const [markdown] = createResource(
    () => props.slug,
    async (slug) => {
      const load = loadSpec(slug)
      return load ? await load() : null
    },
  )

  return (
    <Suspense fallback={<LoadingNote label="Loading the contract…" />}>
      <Show
        when={markdown()}
        fallback={
          <p class="text-base text-ink-gray-7">
            The contract could not be loaded. Reload the page to try again.
          </p>
        }
      >
        {(text) => (
          <Markdown
            markdown={props.stripProps ? withoutPropsSections(text()) : text()}
          />
        )}
      </Show>
    </Suspense>
  )
}

const REFERENCE_SECTIONS = [
  { id: 'preview', label: 'Live demo' },
  { id: 'usage', label: 'Usage' },
  { id: 'props', label: 'Props' },
  { id: 'contract', label: 'Contract' },
]

/**
 * The reference page's table of contents: the four fixed sections plus the
 * contract's own level-2 headings once the spec chunk arrives.
 */
function ReferenceToc(props: {
  slug: string
  stripProps: boolean
}): JSX.Element {
  const [markdown] = createResource(
    () => props.slug,
    async (slug) => {
      const load = loadSpec(slug)
      return load ? await load() : null
    },
  )
  const entries = createMemo(() => [
    ...REFERENCE_SECTIONS,
    ...markdownHeadings(
      props.stripProps
        ? withoutPropsSections(markdown() ?? '')
        : (markdown() ?? ''),
    )
      .filter((heading) => heading.level === 2)
      .map((heading) => ({ id: heading.id, label: heading.label })),
  ])
  return <TableOfContents entries={entries()} />
}

export function ComponentPage(): JSX.Element {
  const params = useParams()
  const location = useLocation()
  const entry = createMemo(() => componentBySlug(params['name'] ?? ''))
  const here = () => stripBase(location.pathname).split('/')[1] ?? ''
  const misplaced = () => {
    const found = entry()
    return found && here() !== sectionOf(found) ? found : undefined
  }
  usePageToc(() => (
    <Show
      when={entry()}
      fallback={<TableOfContents entries={REFERENCE_SECTIONS} />}
    >
      {(component) => (
        <ReferenceToc
          slug={component().spec ?? component().slug}
          stripProps={component().parts.length > 0}
        />
      )}
    </Show>
  ))

  return (
    <>
      {/* One canonical URL per entry. A template reached at `/atoms/...` is
          the same page under the wrong breadcrumb, which is how duplicate
          content starts; it says where it lives instead. */}
      <Show when={misplaced()}>
        {(component) => (
          <div class="flex flex-col gap-2">
            <h1 class="text-heading text-ink-gray-9">
              {component().name} is {component().atomic === 'atom' ? 'an' : 'a'}{' '}
              {ATOMIC[component().atomic].singular}
            </h1>
            <p class="text-base text-ink-gray-7">
              Every entry has one section.{' '}
              <A
                href={hrefOf(component())}
                class="text-ink-blue-6 underline decoration-dotted"
              >
                Open {component().name} under {ATOMIC[component().atomic].label}
              </A>
              .
            </p>
          </div>
        )}
      </Show>

      <Show
        when={!misplaced() && entry()}
        fallback={
          entry() ? undefined : (
            <div class="flex flex-col gap-2">
              <h1 class="text-heading text-ink-gray-9">
                No component called “{params['name']}”
              </h1>
              <p class="text-base text-ink-gray-7">
                The index lists every documented component —{' '}
                <A
                  href="/atoms"
                  class="text-ink-blue-6 underline decoration-dotted"
                >
                  browse it
                </A>
                .
              </p>
            </div>
          )
        }
      >
        {(component) => {
          // The story module is lazy, and wrapped so `<Show>` cannot mistake a
          // component for a plain value.
          const demo = createMemo(() => {
            const entry = STORIES[component().name]
            return entry
              ? {
                  Component: lazy(() =>
                    entry.load().then((module) => ({ default: module.Demo })),
                  ),
                  id: entry.id,
                }
              : undefined
          })
          // The "show the code" panel reads the story file itself: the demo and
          // its states are one source.
          const source = () =>
            STORY_SOURCES[
              `../stories/${component().slug}.stories.tsx`
            ]?.().then((module) => module.default) ?? Promise.resolve('')

          return (
            <article class="flex flex-col gap-4">
              <header class="flex flex-col gap-3">
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="text-heading text-ink-gray-9">
                    {component().name}
                  </h1>
                  <Badge size="sm" theme="gray">
                    {ATOMIC[component().atomic].singular}
                  </Badge>
                  <Badge size="sm" theme="gray">
                    {component().group}
                  </Badge>
                  <Show when={component().spec}>
                    <Badge size="sm" theme="blue" label="contract" />
                  </Show>
                </div>
                <p class="max-w-2xl text-interface text-ink-gray-7">
                  {component().description}
                </p>
                <p class="text-caption text-ink-gray-7">
                  {component().package} · {component().parts.length} parts
                </p>
                <nav
                  aria-label="Reference sections"
                  class="flex flex-wrap gap-3 text-interface text-ink-gray-7"
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
                  {/* A plain anchor, absolute: the story lives on Storybook's
                    origin, so it is an href and not an in-app `route`. */}
                  <Show when={demo()}>
                    {(entry) => (
                      <Button
                        href={storyUrl(entry().id)}
                        variant="outline"
                        size="sm"
                        iconLeft="lucide-external-link"
                      >
                        Open in Storybook
                      </Button>
                    )}
                  </Show>
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

              <PageSection id="preview" title="Live demo">
                <Show
                  when={demo()}
                  fallback={
                    <p class="text-base text-ink-gray-7">
                      No demo registered for this component yet.
                    </p>
                  }
                >
                  {(entry) => (
                    <Show
                      when={
                        component().atomic === 'organism' ||
                        component().atomic === 'template'
                      }
                      fallback={
                        <InlinePreview title={component().name} source={source}>
                          <Suspense
                            fallback={<LoadingNote label="Loading demo…" />}
                          >
                            <Dynamic component={entry().Component} />
                          </Suspense>
                        </InlinePreview>
                      }
                    >
                      <ResponsivePreview
                        title={component().name}
                        src={`/preview/${component().slug}`}
                        source={source}
                      />
                    </Show>
                  )}
                </Show>
              </PageSection>

              <PageSection id="usage" title="Usage">
                <pre class="whitespace-pre-wrap break-words rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-4 text-caption">
                  <code>{`import { ${component().name} } from '${component().package}'`}</code>
                </pre>
              </PageSection>
              <PageSection id="props" title="Props">
                <ApiTables slug={component().slug} />
              </PageSection>

              <PageSection
                id="contract"
                title="Contract"
                actions={
                  <A
                    href={`https://github.com/talelk/newui/blob/main/spec/${component().spec ?? component().slug}.md`}
                    class="text-sm text-ink-gray-7 underline decoration-dotted"
                  >
                    spec/{component().spec ?? component().slug}.md
                  </A>
                }
              >
                <Contract
                  slug={component().spec ?? component().slug}
                  stripProps={component().parts.length > 0}
                />
              </PageSection>
            </article>
          )
        }}
      </Show>
    </>
  )
}
