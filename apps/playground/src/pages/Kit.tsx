import { A } from '@solidjs/router'
import { For, type JSX, Show } from 'solid-js'
import { LADDER_COUNTS } from '../generated/counts'
import { PageSection } from '../lib/PageSection'
import { TableOfContents } from '../lib/TableOfContents'
import { PageIntro } from '../shell/PageIntro'
import { usePageToc } from '../shell/SiteLayout'

/**
 * Build an app.
 *
 * The four questions a reader has after the reference pages stop answering:
 * where am I in the ladder, how does a page open, where do the records come
 * from, and what do I copy. Each answer points at a surface that is live on this
 * site and at the file in the skeleton that shows it.
 */

function Code(props: { title?: string; children: string }): JSX.Element {
  return (
    <figure class="flex flex-col gap-1">
      <Show when={props.title}>
        <figcaption class="text-caption text-ink-gray-7">
          {props.title}
        </figcaption>
      </Show>
      <pre class="overflow-x-auto rounded-5 border border-outline-gray-1 bg-surface-gray-1 p-3 text-sm leading-relaxed text-ink-gray-8">
        <code>{props.children.trim()}</code>
      </pre>
    </figure>
  )
}

const LADDER = [
  {
    level: 'Foundations',
    package: '@newui/tailwind',
    href: '/foundations',
    count: `${LADDER_COUNTS.foundations} tokens`,
    answers: 'What does it look like?',
  },
  {
    level: 'Atoms',
    package: '@newui/ui',
    href: '/atoms',
    count: `${LADDER_COUNTS.atoms} atoms`,
    answers: 'What is this single element?',
  },
  {
    level: 'Molecules',
    package: '@newui/ui · @newui/charts',
    href: '/molecules',
    count: `${LADDER_COUNTS.molecules} molecules`,
    answers: 'What is this interaction?',
  },
  {
    level: 'Organisms',
    package: '@newui/blocks · charts · editor',
    href: '/organisms',
    count: `${LADDER_COUNTS.organisms} organisms`,
    answers: 'What is this section?',
  },
  {
    level: 'Templates',
    package: '@newui/layouts · @newui/ui',
    href: '/templates',
    count: `${LADDER_COUNTS.templates} templates`,
    answers: 'How does the page open?',
  },
  {
    level: 'Pages',
    package: 'apps/*',
    href: '/pages',
    count: `${LADDER_COUNTS.pages} pages`,
    answers: 'What does the product do?',
  },
] as const

const FILES = [
  ['src/App.tsx', 'The provider, the router, the toast host.'],
  ['src/shell/Shell.tsx', 'AppLayout, the rail, the navigation, the account.'],
  ['src/shell/theme.ts', 'The single light/dark controller.'],
  ['src/data/records.ts', 'The repository: four methods, in memory.'],
  ['src/data/session.ts', 'The demo session — the shape of auth, not auth.'],
  [
    'src/pages/Records.tsx',
    'Collection, filters, stats, table, create + detail.',
  ],
  ['src/pages/Settings.tsx', 'The form surface at page scale.'],
  ['src/pages/SignIn.tsx', 'AuthCard + a validated sign-in.'],
] as const

export function Kit(): JSX.Element {
  usePageToc(() => (
    <TableOfContents
      entries={[
        { id: 'ladder', label: 'The ladder' },
        { id: 'compose', label: 'Compose a page' },
        { id: 'data', label: 'Wire data' },
        { id: 'start', label: 'Start an app' },
      ]}
    />
  ))

  return (
    <article class="flex max-w-3xl flex-col gap-10">
      <PageIntro
        title="Build an app"
        description="Four questions, four answers, and a skeleton that already answers all of them."
      />

      <PageSection
        id="ladder"
        title="1 · The ladder"
        description="Each level imports only from the level below it. That is the whole rule; everything else follows from it."
      >
        <div class="overflow-x-auto rounded-5 border border-outline-gray-1">
          <table class="w-full border-collapse text-start text-sm">
            <thead class="bg-surface-gray-1 text-caption text-ink-gray-7">
              <tr>
                <th class="p-2 text-start font-medium">Level</th>
                <th class="p-2 text-start font-medium">Package</th>
                <th class="p-2 text-start font-medium">Answers</th>
                <th class="p-2 text-end font-medium">Ships</th>
              </tr>
            </thead>
            <tbody>
              <For each={LADDER}>
                {(rung) => (
                  <tr class="border-t border-outline-gray-1">
                    <td class="p-2">
                      <A
                        href={rung.href}
                        class="font-medium text-ink-blue-6 underline decoration-dotted"
                      >
                        {rung.level}
                      </A>
                    </td>
                    <td class="p-2 font-mono text-xs text-ink-gray-7">
                      {rung.package}
                    </td>
                    <td class="p-2 text-ink-gray-7">{rung.answers}</td>
                    <td class="p-2 text-end tabular-nums text-ink-gray-7">
                      {rung.count}
                    </td>
                  </tr>
                )}
              </For>
              <tr class="border-t border-outline-gray-1">
                <td class="p-2">
                  <A
                    href="/architecture"
                    class="font-medium text-ink-blue-6 underline decoration-dotted"
                  >
                    Logic
                  </A>
                </td>
                <td class="p-2 font-mono text-xs text-ink-gray-7">
                  @newui/data
                </td>
                <td class="p-2 text-ink-gray-7">How does it behave?</td>
                <td class="p-2 text-end text-ink-gray-7">1 + 4 entries</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-base text-ink-gray-7">
          A page is made of templates, a template of organisms, an organism of
          molecules, and a molecule of atoms — never the other way round. The
          logic layer sits beside the ladder: it answers a question about
          behaviour, not about appearance, so it is imported by any level and
          imports none of them.
        </p>
        <p class="text-base text-ink-gray-7">
          The long form, including the rules the dependency checker enforces, is
          on{' '}
          <A
            href="/architecture"
            class="text-ink-blue-6 underline decoration-dotted"
          >
            Architecture
          </A>
          .
        </p>
      </PageSection>

      <PageSection
        id="compose"
        title="2 · Compose a page"
        description="AppLayout owns the arrangement; the app owns its chrome."
      >
        <Code title="src/shell/Shell.tsx — the frame, once">
          {`
<AppLayout
  title="Projects, at a glance"
  description="One collection, filtered in the browser."
  breadcrumbs={[{ label: 'Workspace', href: '/' }, { label: 'Projects' }]}
  actions={<Button onClick={() => setOpen(true)}>New project</Button>}
  rail={<Rail />}
  sidebar={<Nav />}
  brand={<Brand />}
  headerActions={<Account />}
>
  {props.children}
</AppLayout>
          `}
        </Code>
        <p class="text-base text-ink-gray-7">
          The slots are the API. The rail, the navigation, the brand, the header
          controls and the footer are the parts two apps never agree on; the
          order — trail, title, description, actions, content under a fixed
          header — is the part they always do. That split is why{' '}
          <A
            href="/templates/app-layout"
            class="text-ink-blue-6 underline decoration-dotted"
          >
            AppLayout
          </A>{' '}
          is a layout and not a component.
        </p>
        <Code title="A page fills the content slot">
          {`
<div class="flex flex-col gap-4">
  <StatGrid stats={stats} />
  <FilterBar selects={selects} chips={chips} resultCount={rows().length} />
  <DataTable title="Projects" rows={rows()} columns={columns} />
</div>
          `}
        </Code>
        <p class="text-base text-ink-gray-7">
          Organisms answer "how does this section open" — a toolbar, a filter
          bar, a stat row, a detail header. Browse them at{' '}
          <A
            href="/organisms"
            class="text-ink-blue-6 underline decoration-dotted"
          >
            Organisms
          </A>
          ; the live page is at{' '}
          <A
            href="/pages/tasks"
            class="text-ink-blue-6 underline decoration-dotted"
          >
            Tasks
          </A>
          .
        </p>
      </PageSection>

      <PageSection
        id="data"
        title="3 · Wire data"
        description="One repository, one collection, one form surface."
      >
        <p class="text-base text-ink-gray-7">
          A repository is the seam between a page and wherever its records live.
          It has four methods and no domain verbs — "complete" is{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            update(id, {'{ status: "Done" }'})
          </code>{' '}
          at the call site.
        </p>
        <Code title="src/data/records.ts — the only file that knows where records live">
          {`
export function createProjectRepository(): Repository<Project, NewProject> {
  let rows = seed()
  return {
    async list({ signal } = {}) { await wait(signal); return rows.map(copy) },
    async create(input, { signal } = {}) {
      await wait(signal)
      const record = { ...input, id: nextId(), updatedAt: stamp() }
      rows = [record, ...rows]
      return record
    },
    async update(id, patch, { signal } = {}) { /* merge, stamp */ },
    async remove(ids, { signal } = {}) { /* filter */ },
  }
}
          `}
        </Code>
        <p class="text-base text-ink-gray-7">
          A page never touches the cache. It reads{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            collection.query.rows()
          </code>{' '}
          and calls mutations; updates are optimistic and roll back on failure.
        </p>
        <Code title="src/pages/Records.tsx — one list, four actions">
          {`
const collection = createCollection<Project, NewProject>(() => ({
  key: ['projects'],
  repository: projectRepository,
  onError: (error) => setNotice({ text: error.message, tone: 'red' }),
}))

collection.create.mutateAsync(input)         // repository owns the id
collection.update.mutate({ id, patch })      // optimistic, rolls back
collection.updateMany.mutate({ ids, patch }) // the bulk action
collection.remove.mutate({ ids })
          `}
        </Code>
        <p class="text-base text-ink-gray-7">
          Forms are the same idea: TanStack Form stays the engine, and{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @newui/data/form
          </code>{' '}
          adds the submit lifecycle and the field-error bridge. A submit button
          reads{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            loading={'{'}submitting(){'}'}
          </code>{' '}
          and each control takes{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            error={'{'}fieldError(field()){'}'}
          </code>
          .
        </p>
        <Code title="src/pages/SignIn.tsx — a validated form">
          {`
const { form, submitting } = createAppForm({
  defaultValues: { email: 'rhea@acme.test', password: '' },
  onSubmit: async (value) => { await signIn(value); navigate('/') },
})

<Form form={form}>
  <form.Field name="email" validators={{ onChange: emailError }}>
    {(field) => (
      <TextInput
        label="Email"
        value={field().state.value}
        error={fieldError(field())}
        onInput={(event) => field().handleChange(event.currentTarget.value)}
      />
    )}
  </form.Field>
  <Button type="submit" loading={submitting()}>Sign in</Button>
</Form>
          `}
        </Code>
        <p class="text-base text-ink-gray-7">
          The full contract — optimistic semantics, rollback, what a create does
          not do — is in{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            spec/data.md
          </code>{' '}
          beside the code.
        </p>
      </PageSection>

      <PageSection
        id="start"
        title="4 · Start an app"
        description="apps/starter is a real application in this repository, gated like one."
      >
        <p class="text-base text-ink-gray-7">
          It is not a screenshot or a template zip: the type-check, the CSS
          emission check, the accessibility pass and a smoke suite in a real
          browser run against it. Run it with:
        </p>
        <Code>
          {`
pnpm install
pnpm dev:starter     # http://localhost:4183
pnpm build:starter   # 138 kB gzip: frame, router, data layer, table, forms
          `}
        </Code>
        <div class="overflow-x-auto rounded-5 border border-outline-gray-1">
          <table class="w-full border-collapse text-start text-sm">
            <thead class="bg-surface-gray-1 text-caption text-ink-gray-7">
              <tr>
                <th class="p-2 text-start font-medium">File</th>
                <th class="p-2 text-start font-medium">What it shows</th>
              </tr>
            </thead>
            <tbody>
              <For each={FILES}>
                {([file, what]) => (
                  <tr class="border-t border-outline-gray-1">
                    <td class="p-2 font-mono text-xs text-ink-gray-8">
                      {file}
                    </td>
                    <td class="p-2 text-ink-gray-7">{what}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
        <p class="text-base text-ink-gray-7">
          To use it as your own: copy{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            apps/starter
          </code>{' '}
          out of the repository, rename its `package.json`, point the `@newui/*`
          dependencies at the published versions, and replace{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            src/data/records.ts
          </code>{' '}
          with your API. Nothing above that file changes — which is the property
          the layer exists for.
        </p>
        <p class="text-base text-ink-gray-7">
          It deliberately leaves out an auth backend, an HTTP client and
          internationalisation: the kit is not an app framework, and a skeleton
          that guessed your answers to those three would be harder to delete
          than to write.
        </p>
        <p class="text-base text-ink-gray-7">
          The starter is also where the query, form and table surfaces meet in
          one place — read it beside{' '}
          <A
            href="/pages/tasks"
            class="text-ink-blue-6 underline decoration-dotted"
          >
            Tasks
          </A>{' '}
          (a thousand records) and{' '}
          <A
            href="/pages/files"
            class="text-ink-blue-6 underline decoration-dotted"
          >
            Files
          </A>{' '}
          (bulk actions and undo).
        </p>
      </PageSection>
    </article>
  )
}
