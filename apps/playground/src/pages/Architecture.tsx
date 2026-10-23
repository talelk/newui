import { A } from '@solidjs/router'
import { For, type JSX, Show } from 'solid-js'
import { LADDER, type LadderLevel } from '../generated/ladder'
import { PageSection } from '../lib/PageSection'
import { TableOfContents } from '../lib/TableOfContents'
import { PageIntro } from '../shell/PageIntro'
import { usePageToc } from '../shell/SiteLayout'

/**
 * Atomic design, written down.
 *
 * The site is organised by Brad Frost's five levels — atoms, molecules,
 * organisms, templates, pages — because they answer the question a reader
 * actually has ("how much is this thing made of?") rather than the question a
 * package layout answers ("where does this file live?"). The two mostly agree;
 * the page is honest about where they don't.
 *
 * The counts come from the same generated file the sidebar reads, so this page
 * cannot claim a size the registry disagrees with.
 */

/** Where each level's entries come from. The one place the two axes meet. */
const PACKAGES: {
  level: string
  packages: string
  answers: string
}[] = [
  {
    level: 'Foundations',
    packages: '@talelk/newui-tokens · @talelk/newui-tailwind',
    answers: 'What does it look like?',
  },
  {
    level: 'Atoms',
    packages: '@talelk/newui-atoms',
    answers: 'What is this single element?',
  },
  {
    level: 'Molecules',
    packages: '@talelk/newui-molecules · @talelk/newui-charts',
    answers: 'What is this interaction?',
  },
  {
    level: 'Organisms',
    packages:
      '@talelk/newui-organisms · @talelk/newui-charts · @talelk/newui-editor',
    answers: 'What is this section?',
  },
  {
    level: 'Templates',
    packages: '@talelk/newui-templates',
    answers: 'How does the page open?',
  },
  {
    level: 'Pages',
    packages: 'apps/playground · apps/starter',
    answers: 'What does the product do?',
  },
]

const RULES: { title: string; body: JSX.Element }[] = [
  {
    title: 'Downward only',
    body: (
      <>
        A level may import the level below it and nothing above it. The rule is
        enforced, not agreed:{' '}
        <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
          the-ladder-only-points-down
        </code>{' '}
        fails the architecture gate on the first upward import.
      </>
    ),
  },
  {
    title: 'One level per entry',
    body: (
      <>
        An entry is filed once, by what it *is*, and the registry records that
        as <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">atomic</code>.
        A chart widget is an organism even though its package calls it a
        component; the package is where the code lives, not what the thing is.
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

      <div class="mb-4 min-w-0 flex-1 rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-4">
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
        <p class="mt-2 max-w-[30rem] text-base text-ink-gray-7">
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
        { id: 'ladder', label: 'The five levels' },
        { id: 'classification', label: 'How an entry is filed' },
        { id: 'packages', label: 'Levels and packages' },
        { id: 'logic', label: 'The logic layer' },
        { id: 'rules', label: 'The rules' },
      ]}
    />
  ))

  return (
    <div class="flex flex-col gap-8">
      <PageIntro
        title="Atomic design"
        description="Five levels, one question each. Every level may import the one below it and nothing above it — that is what keeps a button from knowing what a page is."
      />

      <PageSection
        id="ladder"
        title="The five levels"
        description="Read from the top down: a page is made of templates, a template of organisms, an organism of molecules, a molecule of atoms. The site is organised in this order, and every entry lives on exactly one level."
      >
        <ol class="flex flex-col">
          <For each={LADDER}>
            {(level, index) => <Rung level={level} index={index()} />}
          </For>
        </ol>
      </PageSection>

      <PageSection
        id="classification"
        title="How an entry is filed"
        description="One level per entry, decided by composition rather than by package. These are the judgement calls; they live in one file and the registry records the result."
      >
        <div class="flex flex-col gap-3 text-base text-ink-gray-7">
          <p class="max-w-[30rem]">
            <strong class="text-ink-gray-8">Atom</strong> — one element or
            control, with no other kit component inside it: a button, a mark, an
            input, a label, the scroll viewport itself.
          </p>
          <p class="max-w-[30rem]">
            <strong class="text-ink-gray-8">Molecule</strong> — one interaction
            or small unit assembled from atoms: a field, a picker, a menu, a
            card, a list row, a dialog shell, a chart's legend.
          </p>
          <p class="max-w-[30rem]">
            <strong class="text-ink-gray-8">Organism</strong> — a independent
            region of a page: a sidebar, a block, a chart widget, an editor, a
            full search surface.
          </p>
          <p class="max-w-[30rem]">
            <strong class="text-ink-gray-8">Template</strong> — the arrangement
            of a page: a shell or a page layout. It may contain everything below
            and is the thing a route mounts.
          </p>
          <p class="max-w-[30rem]">
            The package axis still says where code lives:{' '}
            <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
              @talelk/newui-charts
            </code>{' '}
            ships molecules (a legend) and organisms (a bar chart) in one
            package, and{' '}
            <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
              @talelk/newui-atoms
            </code>{' '}
            ships organisms (a sidebar) beside atoms. Filing by package instead
            would have hidden that; filing by composition is what makes the
            levels useful.
          </p>
          <p class="max-w-[30rem]">
            The classification is in{' '}
            <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
              scripts/atomic.ts
            </code>{' '}
            — an exhaustive map: a new public entry has no implicit level.
          </p>
        </div>
      </PageSection>

      <PageSection
        id="packages"
        title="Levels and packages"
        description="The two axes, side by side. Most rows are one package; the rows that are not are the reason the level exists."
      >
        <div class="overflow-x-auto rounded-card border border-outline-gray-1">
          {/* `table-fixed`: auto layout lets a long answered-question column
              squeeze the others to a character on a phone. */}
          <table class="w-full table-fixed border-collapse text-start">
            <thead class="bg-surface-gray-1 text-caption text-ink-gray-7">
              <tr>
                <th scope="col" class="p-3 text-start font-medium">
                  Level
                </th>
                <th scope="col" class="p-3 text-start font-medium">
                  Package
                </th>
                <th scope="col" class="p-3 text-start font-medium">
                  Answers
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={PACKAGES}>
                {(row) => (
                  <tr class="border-t border-outline-gray-1">
                    <td class="p-3 font-medium text-ink-gray-9">{row.level}</td>
                    <td class="p-3">
                      <code class="block text-xs break-words text-ink-gray-7">
                        {row.packages}
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
        id="logic"
        title="The logic layer"
        description="One level is not visual. Formatting, selection, undo and downloads behave the same in every app, and no two apps agree on them when they each write their own — so they are a package too."
      >
        <div class="flex flex-col gap-3 text-base text-ink-gray-7">
          <p class="max-w-[30rem]">
            <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
              @talelk/newui-data
            </code>{' '}
            sits <em>beside</em> the levels rather than on them: a page uses it
            the way it uses a component, but nothing above it is made of it. It
            is headless by contract — it imports <code>solid-js</code> for
            signals and nothing from the visual packages — and no component may
            import it. Tables and virtual lists are organisms; the data package
            supplies their state, not their pixels. That is what keeps a control
            from acquiring an opinion about money.
          </p>
          <pre class="w-fit max-w-full whitespace-pre-wrap break-words rounded-3 border border-outline-gray-1 bg-surface-elevation-1 p-3 text-interface text-ink-gray-8">
            <code>{`import { createUndo, downloadCsv, optionsOf, usd } from '@talelk/newui-data'
import { DataProvider, createCollection } from '@talelk/newui-data/query'`}</code>
          </pre>
          <p class="max-w-[30rem]">
            What renders stays in the atomic visual packages. The examples
            copied their status strip eleven times too, but it renders a banner
            with buttons — promoting it here would have made the layer lie about
            itself.
          </p>
        </div>
      </PageSection>

      <PageSection
        id="rules"
        title="The rules"
        description="Three rules hold the levels together. The first two are enforced by tests; the third is enforced by the done-checklist, because no test can see a copy you did not make."
      >
        <dl class="grid gap-x-8 gap-y-6 sm:grid-cols-3">
          <For each={RULES}>
            {(rule) => (
              <div class="flex flex-col gap-1 border-t border-outline-gray-1 pt-4">
                <dt class="text-base-medium text-ink-gray-8">{rule.title}</dt>
                <dd class="text-base text-ink-gray-7">{rule.body}</dd>
              </div>
            )}
          </For>
        </dl>

        <pre class="w-fit max-w-full whitespace-pre-wrap break-words rounded-3 border border-outline-gray-1 bg-surface-elevation-1 p-3 text-interface text-ink-gray-8">
          <code>{`@talelk/newui-tokens · @talelk/newui-tailwind      foundations
  ↓  colour · type · radius · motion · controls' classes
@talelk/newui-atoms                         atoms
  ↓
@talelk/newui-molecules                     molecules
  ↓
@talelk/newui-organisms · charts · editor    organisms
  ↓  sections and widgets
@talelk/newui-templates                     templates
  ↓  page frames
apps/playground · apps/starter        pages`}</code>
        </pre>
      </PageSection>
    </div>
  )
}
