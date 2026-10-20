import { A } from '@solidjs/router'
import { For, type JSX, Show } from 'solid-js'
import { LADDER, type LadderLevel } from '../generated/ladder'
import { PageSection } from '../lib/PageSection'
import { TableOfContents } from '../lib/TableOfContents'
import { PageIntro } from '../shell/PageIntro'
import { usePageToc } from '../shell/SiteLayout'

/**
 * The ladder, written down.
 *
 * The site has had four reference sections for a while — components, blocks,
 * layouts, examples — but nothing said *why* they are separate, and the
 * vocabulary ("atomic design") appeared nowhere. A reader could browse every
 * page and never learn that a block may import a component but a component may
 * not import a block, or that the answer to "should this be a block?" is a
 * question about what the thing *is*, not where it happened to be written.
 *
 * The counts come from the same generated file the sidebar reads, so this page
 * cannot claim a size the registry disagrees with.
 */

/** Atomic design's vocabulary, mapped once rather than re-explained per level. */
const VOCABULARY: {
  atomic: string
  here: string
  package: string
  answers: string
}[] = [
  {
    atomic: 'Atoms · molecules',
    here: 'Components',
    package: '@newui/ui',
    answers: 'What is this control?',
  },
  {
    atomic: 'Organisms',
    here: 'Blocks',
    package: '@newui/blocks',
    answers: 'How does this section open?',
  },
  {
    atomic: 'Templates',
    here: 'Layouts',
    package: '@newui/layouts',
    answers: 'How does the page open?',
  },
  {
    atomic: 'Pages',
    here: 'Applications',
    package: 'apps/playground',
    answers: 'What does the product do?',
  },
]

const RULES: { title: string; body: JSX.Element }[] = [
  {
    title: 'Downward only',
    body: (
      <>
        A level may import the level below it and nothing above it.{' '}
        <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
          ui ← blocks ← layouts ← apps
        </code>
        . The rule is enforced, not agreed:{' '}
        <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
          the-ladder-only-points-down
        </code>{' '}
        fails the architecture gate on the first upward import.
      </>
    ),
  },
  {
    title: 'Promote or reuse',
    body: (
      <>
        A pattern that appears twice moves down a level or is reused from the
        level above. Copying it a third time is how two pages start disagreeing
        about what a filter bar is.
      </>
    ),
  },
  {
    title: 'One done-checklist per unit',
    body: (
      <>
        Implementation, recipe and types, tests and a11y, a spec, a story with
        the states{' '}
        <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
          spec/states.md
        </code>{' '}
        requires, a site page, a budget entry and a changeset. “It renders” is
        the first line of the checklist, not the last.
      </>
    ),
  },
]

/** One rung: the number, the card, and the line that joins it to the next. */
function Rung(props: { level: LadderLevel; index: number }): JSX.Element {
  const last = () => props.index === LADDER.length - 1
  return (
    <li class="relative flex gap-3 sm:gap-4">
      <div class="flex w-9 shrink-0 flex-col items-center">
        <span
          aria-hidden="true"
          class="grid size-9 shrink-0 place-items-center rounded-full border border-outline-gray-2 bg-surface-elevation-1 text-sm-medium tabular-nums text-ink-gray-7"
        >
          {String(props.index + 1).padStart(2, '0')}
        </span>
        <Show when={!last()}>
          <span aria-hidden="true" class="mt-1 w-px flex-1 bg-outline-gray-2" />
        </Show>
      </div>

      <div class="mb-4 min-w-0 flex-1 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-4">
        <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 class="text-base-medium text-ink-gray-9">{props.level.title}</h3>
          <code class="rounded-3 border border-outline-gray-1 bg-surface-gray-1 px-1 text-xs text-ink-gray-7">
            {props.level.package}
          </code>
          <span class="ms-auto text-caption tabular-nums text-ink-gray-7">
            {props.level.count} {props.level.unit}
            {props.level.count === 1 ? '' : 's'}
          </span>
        </div>

        <p class="mt-1 text-base italic text-ink-gray-8">
          “{props.level.question}”
        </p>
        <p class="mt-2 max-w-2xl text-base text-ink-gray-7">
          {props.level.blurb}
        </p>

        <A
          href={props.level.href}
          class="mt-3 inline-flex items-center gap-1 rounded-3 text-interface text-ink-blue-link focus-visible:focus-ring"
        >
          Browse {props.level.title.toLowerCase()}
          <span aria-hidden="true" class="lucide-arrow-right size-3.5" />
        </A>
      </div>
    </li>
  )
}

export function Architecture(): JSX.Element {
  usePageToc(() => (
    <TableOfContents
      entries={[
        { id: 'ladder', label: 'The ladder' },
        { id: 'logic', label: 'The logic layer' },
        { id: 'atomic-design', label: 'Atomic design' },
        { id: 'rules', label: 'The rules' },
      ]}
    />
  ))

  return (
    <div class="flex flex-col gap-8">
      <PageIntro
        title="Architecture"
        description="Five levels, one question each. Every level may import the one below it and nothing above it — that is what keeps a component from knowing what a page is."
      />

      <PageSection
        id="ladder"
        title="The ladder"
        description="A component answers what this control is; a block answers how this section opens; a layout answers how the page opens; an application answers what the product does. Read from the bottom up, each level is made of the one below it."
      >
        <ol class="flex flex-col">
          <For each={LADDER}>
            {(level, index) => <Rung level={level} index={index()} />}
          </For>
        </ol>
      </PageSection>

      <PageSection
        id="logic"
        title="The logic layer"
        description="One rung is not visual. Formatting, selection, undo and downloads behave the same in every app, and no two apps agree on them when they each write their own — so they are a package too."
      >
        <div class="flex flex-col gap-3 text-base text-ink-gray-7">
          <p class="max-w-2xl">
            <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
              @newui/data
            </code>{' '}
            sits <em>beside</em> the ladder rather than on it: a page uses it
            the way it uses a component, but nothing above it is made of it. It
            is headless by contract — it imports <code>solid-js</code> for
            signals and nothing from the visual packages — and no component may
            import it. That is what keeps a control from acquiring an opinion
            about money.
          </p>
          <pre class="w-fit max-w-full overflow-x-auto rounded-3 border border-outline-gray-1 bg-surface-elevation-1 p-3 text-interface text-ink-gray-8">
            <code>{`import { createUndo, downloadCsv, optionsOf, usd } from '@newui/data'
import { DataProvider, createCollection } from '@newui/data/query'`}</code>
          </pre>
          <p class="max-w-2xl">
            What renders stays in the kit. The examples copied their status
            strip eleven times too, but it renders a banner with buttons —
            promoting it here would have made the layer lie about itself.
          </p>
        </div>
      </PageSection>

      <PageSection
        id="atomic-design"
        title="Atomic design, translated"
        description="The vocabulary is Brad Frost's; the names here are the ones the packages use. What matters is not the metaphor but the constraint: each row may only build on the rows under it."
      >
        <div class="overflow-x-auto rounded-5 border border-outline-gray-1">
          {/* `table-fixed`: auto layout lets a long answered-question column
              squeeze the others to a character on a phone. */}
          <table class="w-full table-fixed border-collapse text-start">
            <thead class="bg-surface-gray-1 text-caption text-ink-gray-7">
              <tr>
                <th scope="col" class="p-3 text-start font-medium">
                  Atomic design
                </th>
                <th scope="col" class="p-3 text-start font-medium">
                  Here
                </th>
                <th
                  scope="col"
                  class="hidden p-3 text-start font-medium sm:table-cell"
                >
                  Package
                </th>
                <th scope="col" class="p-3 text-start font-medium">
                  Answers
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={VOCABULARY}>
                {(row) => (
                  <tr class="border-t border-outline-gray-1">
                    <td class="p-3 text-ink-gray-7">{row.atomic}</td>
                    <td class="p-3 font-medium text-ink-gray-9">{row.here}</td>
                    <td class="hidden p-3 sm:table-cell">
                      <code class="block text-xs break-words text-ink-gray-7">
                        {row.package}
                      </code>
                    </td>
                    <td class="p-3 text-ink-gray-7">{row.answers}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </PageSection>

      <PageSection
        id="rules"
        title="The rules"
        description="Three rules hold the ladder together. The first is enforced by a test; the other two are enforced by the done-checklist, because no test can see a copy you did not make."
      >
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

        <pre class="w-fit max-w-full overflow-x-auto rounded-3 border border-outline-gray-1 bg-surface-elevation-1 p-3 text-interface text-ink-gray-8">
          <code>{`@newui/tokens
  ↓  colour · type · radius · motion
@newui/ui
  ↓  controls  (+ icons · tailwind)
@newui/blocks
  ↓  sections
@newui/layouts
  ↓  page frames
apps/playground
  ↓  applications`}</code>
        </pre>
      </PageSection>
    </div>
  )
}
