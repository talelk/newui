import { Badge, Button } from '@talelk/newui-atoms'
import {
  layoutSpacing,
  radius,
  radiusRoles,
  semanticColors,
} from '@talelk/newui-tokens'
import { For, type JSX } from 'solid-js'
import { PageSection } from '../lib/PageSection'
import { TableOfContents } from '../lib/TableOfContents'
import { PageIntro } from '../shell/PageIntro'
import { usePageToc } from '../shell/SiteLayout'

/**
 * The token specimen sheet.
 *
 * A reference page, not a swatch dump: every plate shows the role in the
 * medium the role is actually used in — fills as surfaces, ink as text,
 * outline as rules — and labels it with the exact name and value a reader
 * copies. The page imports the token data it documents, so a renamed or
 * removed token fails the build here rather than drifting.
 */

const STEPS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const

/** The six hues the vocabulary uses. The remaining ramps ship unwired. */
const HUES = [
  { hue: 'gray', role: 'structure' },
  { hue: 'blue', role: 'action' },
  { hue: 'green', role: 'success' },
  { hue: 'amber', role: 'attention' },
  { hue: 'red', role: 'danger' },
  { hue: 'violet', role: 'category' },
] as const

/** The floating planes, in the order a page stacks them. */
const PLANES = [
  { key: 'base', label: 'base' },
  { key: 'elevation-1', label: 'elevation-1' },
  { key: 'elevation-2', label: 'elevation-2' },
  { key: 'elevation-3', label: 'elevation-3' },
  { key: 'sidebar', label: 'sidebar' },
] as const

/** Ink is demonstrated as text, because that is what it colours. */
const INKS = [
  {
    token: 'ink-gray-9',
    class: 'text-ink-gray-9',
    sample: 'Headings and figures',
  },
  {
    token: 'ink-gray-8',
    class: 'text-ink-gray-8',
    sample: 'Body copy, cells, navigation',
  },
  {
    token: 'ink-gray-7',
    class: 'text-ink-gray-7',
    sample: 'Captions and metadata',
  },
  {
    token: 'ink-gray-6',
    class: 'text-ink-gray-6',
    sample: 'Placeholders and quiet icons',
  },
] as const

/** Outline is demonstrated as the 1px rules it draws. */
const OUTLINES = [
  {
    token: 'outline-gray-1',
    class: 'bg-outline-gray-1',
    sample: 'Cards and panels',
  },
  {
    token: 'outline-gray-2',
    class: 'bg-outline-gray-2',
    sample: 'Dividers and fields',
  },
  {
    token: 'outline-gray-3',
    class: 'bg-outline-gray-3',
    sample: 'Controls and hover steps',
  },
  {
    token: 'outline-gray-4',
    class: 'bg-outline-gray-4',
    sample: 'Strong separations',
  },
] as const

/** The three treatments each hue ships, by the steps its recipes use. */
const TREATMENTS = [
  {
    hue: 'gray',
    wash: { step: '2', class: 'bg-surface-gray-2 text-ink-gray-7' },
    outline: {
      step: '2',
      class: 'border border-outline-gray-2 text-ink-gray-7',
    },
    solid: { step: '10', class: 'bg-surface-gray-10 text-ink-base' },
  },
  {
    hue: 'blue',
    wash: { step: '2', class: 'bg-surface-blue-2 text-ink-blue-8' },
    outline: {
      step: '3',
      class: 'border border-outline-blue-3 text-ink-blue-8',
    },
    solid: { step: '8', class: 'bg-surface-blue-8 text-ink-base' },
  },
  {
    hue: 'green',
    wash: { step: '2', class: 'bg-surface-green-2 text-ink-green-8' },
    outline: {
      step: '3',
      class: 'border border-outline-green-3 text-ink-green-8',
    },
    solid: { step: '8', class: 'bg-surface-green-8 text-ink-base' },
  },
  {
    hue: 'amber',
    wash: { step: '2', class: 'bg-surface-amber-2 text-ink-amber-8' },
    outline: {
      step: '3',
      class: 'border border-outline-amber-3 text-ink-amber-8',
    },
    solid: { step: '9', class: 'bg-surface-amber-9 text-ink-base' },
  },
  {
    hue: 'red',
    wash: { step: '2', class: 'bg-surface-red-2 text-ink-red-8' },
    outline: { step: '3', class: 'border border-outline-red-3 text-ink-red-8' },
    solid: { step: '8', class: 'bg-surface-red-8 text-ink-base' },
  },
  {
    hue: 'violet',
    wash: { step: '2', class: 'bg-surface-violet-2 text-ink-violet-8' },
    outline: {
      step: '3',
      class: 'border border-outline-violet-3 text-ink-violet-8',
    },
    solid: { step: '8', class: 'bg-surface-violet-8 text-ink-base' },
  },
] as const

const TYPE_ROLES = [
  {
    name: 'Hero',
    meta: '36 / 40 · 600 · −0.035em',
    sample: 'Clarity for your next data application.',
    class: 'text-hero text-ink-gray-9',
  },
  {
    name: 'Heading',
    meta: '24 / 30 · 600 · −0.025em',
    sample: 'Revenue overview',
    class: 'text-heading text-ink-gray-9',
  },
  {
    name: 'Section',
    meta: '18 / 24 · 600 · −0.015em',
    sample: 'Recent transactions',
    class: 'text-section text-ink-gray-9',
  },
  {
    name: 'Metric',
    meta: '28 / 32 · 600 · tabular',
    sample: '$128,430',
    class: 'text-metric tabular-nums text-ink-gray-9',
  },
  {
    name: 'Interface',
    meta: '14 / 20 · 420 · 0',
    sample:
      'Filters, labels and body copy share one size; hierarchy comes from the roles above.',
    class: 'text-interface text-ink-gray-8',
  },
  {
    name: 'Caption',
    meta: '12 / 16 · 420 · 0',
    sample: 'Compared with the previous quarter · updated 4 minutes ago',
    class: 'text-caption text-ink-gray-7',
  },
] as const

const TYPE_SCALE = [
  { token: 'text-2xs', meta: '11 / 420', class: 'text-2xs' },
  { token: 'text-xs', meta: '12 / 420', class: 'text-xs' },
  { token: 'text-sm', meta: '13 / 420', class: 'text-sm' },
  { token: 'text-base', meta: '14 / 420', class: 'text-base' },
  { token: 'text-base-medium', meta: '14 / 500', class: 'text-base-medium' },
  { token: 'text-md', meta: '15 / 420', class: 'text-md' },
  { token: 'text-lg-medium', meta: '16 / 500', class: 'text-lg-medium' },
  { token: 'text-xl-semibold', meta: '17 / 600', class: 'text-xl-semibold' },
  { token: 'text-2xl-semibold', meta: '18 / 600', class: 'text-2xl-semibold' },
  { token: 'text-3xl-bold', meta: '20 / 700', class: 'text-3xl-bold' },
  { token: 'text-4xl-bold', meta: '24 / 700', class: 'text-4xl-bold' },
] as const

const RADIUS_ROLES = [
  { role: 'control', class: 'rounded-control', shape: 'size-16' },
  { role: 'card', class: 'rounded-card', shape: 'size-16' },
  { role: 'overlay', class: 'rounded-overlay', shape: 'size-16' },
  { role: 'pill', class: 'rounded-pill', shape: 'h-10 w-24' },
] as const

const ELEVATION = [
  { name: 'none', class: 'bg-surface-base', note: 'resting' },
  {
    name: 'sm',
    class: 'bg-surface-elevation-2 shadow-sm',
    note: 'lift',
  },
  {
    name: 'base',
    class: 'bg-surface-elevation-2 shadow-base',
    note: 'raised',
  },
  {
    name: 'md',
    class: 'bg-surface-elevation-2 shadow-md',
    note: 'popover',
  },
  {
    name: 'lg',
    class: 'bg-surface-elevation-2 shadow-lg',
    note: 'panel',
  },
  {
    name: 'xl',
    class: 'bg-surface-elevation-2 shadow-xl',
    note: 'dialog',
  },
  {
    name: '2xl',
    class: 'bg-surface-elevation-2 shadow-2xl',
    note: 'large modal',
  },
] as const

const FOCUS = [
  { name: 'default', var: '--focus-outline-default' },
  { name: 'blue', var: '--focus-outline-blue' },
  { name: 'green', var: '--focus-outline-green' },
  { name: 'amber', var: '--focus-outline-amber' },
  { name: 'red', var: '--focus-outline-red' },
  { name: 'violet', var: '--focus-outline-violet' },
] as const

function tokenValue(
  layer: Record<string, string>,
  key: string,
  fallback = 'transparent',
): string {
  return layer[key] ?? fallback
}

/** An inline token name, set in the same chip the docs use for code. */
function Token(props: { children: JSX.Element }): JSX.Element {
  return (
    <code class="rounded-3 bg-surface-gray-2 px-1 py-px font-mono text-caption break-words text-ink-gray-8">
      {props.children}
    </code>
  )
}

/**
 * One hue, ten steps, drawn as a single band. The step axis is printed once at
 * the top because all six bands share it.
 */
function Ramp(props: { hue: string; role: string }): JSX.Element {
  return (
    <div class="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
      <div class="min-w-0">
        <p class="text-base-medium text-ink-gray-9">{props.hue}</p>
        <p class="text-caption leading-tight break-words text-ink-gray-7">
          {props.role}
        </p>
      </div>
      <div
        role="img"
        aria-label={`${props.hue} ramp, steps 1 to 10`}
        class="grid grid-cols-10 gap-px overflow-hidden rounded-control border border-outline-gray-1"
      >
        <For each={STEPS}>
          {(step) => (
            <div
              aria-hidden="true"
              class="h-10"
              style={{
                'background-color': `var(--surface-${props.hue}-${step})`,
              }}
            />
          )}
        </For>
      </div>
    </div>
  )
}

/**
 * The same semantic roles at both ends of the colour mode, rendered from the
 * token data rather than from the page's own CSS variables: both columns stay
 * legible whichever theme the reader is in.
 */
function ThemeProof(props: {
  title: string
  layer: (typeof semanticColors)['light']
}): JSX.Element {
  const ramp = (name: string): Record<string, string> => props.layer[name] ?? {}
  const surface = (key: string) => tokenValue(ramp('surface'), key)
  const ink = (key: string) => tokenValue(ramp('ink'), key, 'inherit')
  const outline = (key: string) => tokenValue(ramp('outline'), key)
  return (
    <div
      class="flex min-w-0 flex-col gap-3 rounded-card border p-card-pad"
      style={{
        'background-color': surface('base'),
        'border-color': outline('gray-1'),
      }}
    >
      <p class="text-base-medium" style={{ color: ink('gray-9') }}>
        {props.title}
      </p>
      <div class="flex flex-col gap-2">
        <div class="grid grid-cols-3 gap-1">
          <For each={PLANES.slice(0, 3)}>
            {(plane) => (
              <div
                class="flex h-14 min-w-0 items-end rounded-control p-1.5"
                style={{
                  'background-color': surface(plane.key),
                  border: `1px solid ${outline('gray-1')}`,
                }}
              >
                <span
                  class="min-w-0 font-mono text-caption leading-tight break-words"
                  style={{ color: ink('gray-7') }}
                >
                  {plane.label}
                </span>
              </div>
            )}
          </For>
        </div>
        <div
          class="flex flex-wrap items-baseline justify-between gap-2 rounded-control px-2 py-1.5"
          style={{ 'background-color': surface('gray-2') }}
        >
          <span class="text-interface" style={{ color: ink('gray-9') }}>
            Primary ink
          </span>
          <span class="text-caption" style={{ color: ink('gray-7') }}>
            muted
          </span>
        </div>
        <div
          class="h-px w-full"
          style={{ 'background-color': outline('gray-1') }}
        />
        <div
          class="inline-flex w-fit items-center rounded-control px-2 py-1 text-caption"
          style={{
            'background-color': surface('blue-8'),
            color: ink('base'),
          }}
        >
          selected
        </div>
      </div>
    </div>
  )
}

export function Foundations(): JSX.Element {
  usePageToc(() => (
    <TableOfContents
      entries={[
        { id: 'semantic-colors', label: 'Semantic colour' },
        { id: 'color-scheme', label: 'Colour scheme' },
        { id: 'typography-roles', label: 'Type roles' },
        { id: 'numbered-typography', label: 'Numbered scale' },
        { id: 'layout-rhythm', label: 'Layout rhythm' },
        { id: 'radius', label: 'Radius' },
        { id: 'elevation', label: 'Elevation' },
        { id: 'focus-rings', label: 'Focus rings' },
      ]}
    />
  ))

  return (
    <div class="flex flex-col gap-8">
      <PageIntro
        title="Design tokens"
        description="The vocabulary every component is built from. Colours are semantic — surface-*, ink-*, outline-* — so light and dark come from one document attribute rather than a second set of classes."
      />

      <PageSection
        id="semantic-colors"
        title="Semantic colour"
        description="Six hues, ten steps each. A step is addressable as a fill, a text colour or a line, and each family is drawn here in the medium it actually paints."
      >
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <section
              class="min-w-0 overflow-x-auto rounded-control focus-visible:focus-ring"
              aria-label="Colour ramps, steps 1 to 10"
              tabindex="0"
            >
              <div class="flex flex-col gap-2">
                <div class="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
                  <span class="text-caption text-ink-gray-6">step</span>
                  <div class="grid grid-cols-10 gap-px">
                    <For each={STEPS}>
                      {(step) => (
                        <span class="text-center font-mono text-caption text-ink-gray-6">
                          {step}
                        </span>
                      )}
                    </For>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <For each={HUES}>
                    {(entry) => <Ramp hue={entry.hue} role={entry.role} />}
                  </For>
                </div>
              </div>
            </section>
            <p class="max-w-[30rem] text-caption text-ink-gray-7">
              Found under three prefixes: <Token>surface-</Token> for a fill,{' '}
              <Token>ink-</Token> for text and icons, <Token>outline-</Token>{' '}
              for a border. Step 1 is the plane nearest the page; step 10
              carries the strongest contrast against it. Dark mode inverts the
              values, not the names. The token file also carries yellow, orange,
              teal, cyan, purple and pink ramps for specialised data colour; no
              recipe uses them.
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <h3 class="text-base-medium text-ink-gray-9">Fills</h3>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <For each={PLANES}>
                {(plane) => (
                  <div
                    class="flex h-16 min-w-0 items-end rounded-control border border-outline-gray-1 p-2"
                    style={{
                      'background-color': `var(--surface-${plane.key})`,
                    }}
                  >
                    <span class="min-w-0 font-mono text-caption leading-tight break-words text-ink-gray-7">
                      {plane.label}
                    </span>
                  </div>
                )}
              </For>
            </div>
            <p class="max-w-[30rem] text-caption text-ink-gray-7">
              Gray is the working surface ramp. <Token>base</Token> is the page
              and card plane; <Token>elevation-*</Token> and{' '}
              <Token>sidebar</Token> are the planes that sit on it.
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <h3 class="text-base-medium text-ink-gray-9">Text</h3>
            <div class="flex flex-col border-t border-outline-gray-1">
              <For each={INKS}>
                {(entry) => (
                  <div class="grid gap-1 border-b border-outline-gray-1 py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-baseline sm:gap-4">
                    <span class="font-mono text-caption text-ink-gray-7">
                      {entry.token}
                    </span>
                    <span class={`text-interface ${entry.class}`}>
                      {entry.sample}
                    </span>
                  </div>
                )}
              </For>
              <div class="grid gap-2 py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-4">
                <span class="font-mono text-caption text-ink-gray-7">
                  ink-base
                </span>
                <span class="w-fit rounded-control bg-surface-gray-10 px-2 py-1 text-interface text-ink-base">
                  The inverse ink, on a solid fill
                </span>
              </div>
            </div>
            <p class="max-w-[30rem] text-caption text-ink-gray-7">
              <Token>ink-gray-5</Token> is the disabled step. It is never used
              for body copy, and a disabled control always keeps its label.
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <h3 class="text-base-medium text-ink-gray-9">Rules</h3>
            <div class="flex flex-col gap-2">
              <For each={OUTLINES}>
                {(entry) => (
                  <div class="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-4">
                    <span class="font-mono text-caption text-ink-gray-7">
                      {entry.token}
                    </span>
                    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <span
                        aria-hidden="true"
                        class={`h-px flex-1 ${entry.class}`}
                      />
                      <span class="text-caption text-ink-gray-7 sm:w-40 sm:shrink-0">
                        {entry.sample}
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <h3 class="text-base-medium text-ink-gray-9">Treatments</h3>
            <section
              class="min-w-0 overflow-x-auto rounded-card border border-outline-gray-1 focus-visible:focus-ring"
              aria-label="Semantic colour treatments"
              tabindex="0"
            >
              <table class="w-full border-collapse text-start">
                <caption class="sr-only">
                  Semantic colour treatments by hue: wash, outline and solid
                </caption>
                <thead class="bg-surface-gray-2 text-caption text-ink-gray-7">
                  <tr>
                    <th scope="col" class="p-1.5 text-start font-medium sm:p-2">
                      Hue
                    </th>
                    <th scope="col" class="p-1.5 text-start font-medium sm:p-2">
                      wash
                    </th>
                    <th scope="col" class="p-1.5 text-start font-medium sm:p-2">
                      outline
                    </th>
                    <th scope="col" class="p-1.5 text-start font-medium sm:p-2">
                      solid
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <For each={TREATMENTS}>
                    {(row) => (
                      <tr class="border-t border-outline-gray-1">
                        <th
                          scope="row"
                          class="p-1.5 text-start text-base-medium text-ink-gray-9 sm:p-2"
                        >
                          {row.hue}
                        </th>
                        <td class="p-1.5 sm:p-2">
                          <span
                            class={`flex h-8 items-center justify-center rounded-control px-1 font-mono text-caption sm:px-2 ${row.wash.class}`}
                          >
                            {row.hue}-{row.wash.step}
                          </span>
                        </td>
                        <td class="p-1.5 sm:p-2">
                          <span
                            class={`flex h-8 items-center justify-center rounded-control bg-surface-base px-1 font-mono text-caption sm:px-2 ${row.outline.class}`}
                          >
                            {row.hue}-{row.outline.step}
                          </span>
                        </td>
                        <td class="p-1.5 sm:p-2">
                          <span
                            class={`flex h-8 items-center justify-center rounded-control px-1 font-mono text-caption sm:px-2 ${row.solid.class}`}
                          >
                            {row.hue}-{row.solid.step}
                          </span>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </section>
            <p class="max-w-[30rem] text-caption text-ink-gray-7">
              Wash is a selected or informational fill; outline is a removable
              filter or a quiet chip; solid is one emphasised status. The label
              always names the state — colour never carries it alone.
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection
        id="color-scheme"
        title="Colour scheme"
        description="Every role keeps its name across modes. The two columns are the same specimen, resolved from the light and dark token layers; at runtime one data-theme attribute on the document switches between them."
      >
        <div class="grid grid-cols-[minmax(0,1fr)] gap-card-gap rounded-card bg-surface-gray-2 p-card-pad sm:grid-cols-2">
          <ThemeProof title="Light" layer={semanticColors.light} />
          <ThemeProof title="Dark" layer={semanticColors.dark} />
        </div>
        <p class="mt-field-gap max-w-[30rem] text-caption text-ink-gray-7">
          The masthead stores the reader's choice — light, dark or the system
          preference — and the CSS <code>color-scheme</code> property follows,
          so native scrollbars and controls match the page.
        </p>
      </PageSection>

      <PageSection
        id="typography-roles"
        title="Type roles"
        description="One family, six working roles. Size, weight and tracking move together; body copy sits at 420, not 400."
      >
        <div class="flex flex-col">
          <For each={TYPE_ROLES}>
            {(role) => (
              <div class="grid gap-2 border-t border-outline-gray-1 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-baseline sm:gap-4">
                <div class="flex min-w-0 flex-col gap-0.5">
                  <span class="text-base-medium text-ink-gray-9">
                    {role.name}
                  </span>
                  <span class="font-mono text-caption text-ink-gray-7">
                    {role.meta}
                  </span>
                </div>
                <div class="min-w-0">
                  <p class={`max-w-[38rem] break-words ${role.class}`}>
                    {role.sample}
                  </p>
                </div>
              </div>
            )}
          </For>
          <div class="border-b border-outline-gray-1" />
        </div>
      </PageSection>

      <PageSection
        id="numbered-typography"
        title="Numbered scale"
        description="The standalone size classes the recipes use when a role is not the right unit. Weight is built into the name, so tracking can follow it."
      >
        <div class="flex flex-col">
          <For each={TYPE_SCALE}>
            {(entry) => (
              <div class="flex flex-col gap-1 border-t border-outline-gray-1 py-2.5 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)_5rem] sm:items-baseline sm:gap-4">
                <span class="font-mono text-caption text-ink-gray-7">
                  {entry.token}
                </span>
                <span class={`${entry.class} text-ink-gray-9`}>Aa 123</span>
                <span class="font-mono text-caption text-ink-gray-6 sm:text-end">
                  {entry.meta}
                </span>
              </div>
            )}
          </For>
          <div class="border-b border-outline-gray-1" />
        </div>
        <p class="mt-field-gap max-w-[30rem] text-caption text-ink-gray-7">
          Numbers that can sit in a column — money, counts, percentages — get{' '}
          <Token>tabular-nums</Token>, so the figures line up and a changing
          value does not move its neighbours.
        </p>
      </PageSection>

      <PageSection
        id="layout-rhythm"
        title="Layout rhythm"
        description="Spacing is a named role over the 4px scale, not an invented value. The page gutter, card padding, field gap and control gap are the four a screen spends most."
      >
        <dl class="grid border-t border-outline-gray-1 sm:grid-flow-col sm:grid-rows-6 sm:gap-x-8">
          <For each={Object.entries(layoutSpacing)}>
            {([name, value]) => (
              <div class="flex items-baseline justify-between gap-3 border-b border-outline-gray-1 py-2">
                <dt class="min-w-0 break-words text-interface text-ink-gray-8">
                  {name}
                </dt>
                <dd class="shrink-0 font-mono text-caption text-ink-gray-7">
                  {value}
                </dd>
              </div>
            )}
          </For>
        </dl>

        <div class="mt-6 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-card-gap lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div class="rounded-card border border-outline-gray-1 bg-surface-gray-1 p-page-gutter-compact sm:p-page-gutter">
            <div class="rounded-card border border-outline-gray-1 bg-surface-elevation-2 p-card-pad">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-caption text-ink-gray-7">Invoice 1042</p>
                  <p class="text-section break-words text-ink-gray-9">
                    Northwind Supply
                  </p>
                </div>
                <Badge theme="amber" variant="subtle">
                  Pending
                </Badge>
              </div>
              <div class="mt-field-gap flex flex-wrap items-baseline justify-between gap-3 border-t border-outline-gray-1 pt-field-gap">
                <span class="text-caption text-ink-gray-7">Amount due</span>
                <span class="text-base-medium tabular-nums break-words text-ink-gray-9">
                  $24,600.00
                </span>
              </div>
              <div class="mt-card-gap flex flex-wrap gap-control-gap">
                <Button size="sm" variant="outline" theme="gray">
                  View
                </Button>
                <Button size="sm" variant="solid" theme="blue">
                  Send reminder
                </Button>
              </div>
            </div>
          </div>

          <div class="flex min-w-0 flex-col gap-3">
            <p class="text-caption text-ink-gray-7">The roles, outside in</p>
            <dl class="flex flex-col gap-2">
              <For
                each={[
                  ['page-gutter', 'the frame'],
                  ['card-pad', 'the card'],
                  ['field-gap', 'label to value'],
                  ['control-gap', 'between actions'],
                ]}
              >
                {([role, use]) => (
                  <div class="flex flex-wrap items-baseline justify-between gap-2">
                    <dt class="font-mono text-caption text-ink-gray-8">
                      {role}
                    </dt>
                    <dd class="text-caption text-ink-gray-7">{use}</dd>
                  </div>
                )}
              </For>
            </dl>
            <p class="text-caption text-ink-gray-7">
              A card's padding is a role, not a leftover. On a narrow screen the
              gutter compacts first; the controls keep their height while the
              frame gives way.
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection
        id="radius"
        title="Radius"
        description="Three surface roles plus a pill. The restricted scale is the point: a reader can tell a control from a card from a dialog by silhouette alone."
      >
        <div class="grid grid-cols-[minmax(0,1fr)] gap-px overflow-hidden rounded-card border border-outline-gray-1 bg-outline-gray-1 sm:grid-cols-2 xl:grid-cols-4">
          <For each={RADIUS_ROLES}>
            {(entry) => (
              <div class="flex min-w-0 flex-wrap items-center gap-field-gap bg-surface-elevation-1 p-card-pad">
                <div
                  aria-hidden="true"
                  class={`${entry.shape} shrink-0 border border-outline-gray-3 bg-surface-gray-3 ${entry.class}`}
                />
                <div class="min-w-0">
                  <p class="text-base-medium break-words text-ink-gray-9">
                    {entry.role}
                  </p>
                  <p class="font-mono text-caption text-ink-gray-7">
                    {radiusRoles[entry.role]}
                  </p>
                </div>
              </div>
            )}
          </For>
        </div>
        <details class="mt-field-gap">
          <summary class="cursor-pointer rounded-control text-caption text-ink-blue-link focus-visible:focus-ring">
            The primitive scale
          </summary>
          <div class="flex flex-wrap items-end gap-card-gap pt-card-gap">
            <For
              each={Object.entries(radius).filter(
                ([key]) => !(key in radiusRoles),
              )}
            >
              {([key, value]) => (
                <div class="flex flex-col items-center gap-1">
                  <div
                    aria-hidden="true"
                    class="size-11 border border-outline-gray-3 bg-surface-gray-3"
                    style={{ 'border-radius': `var(--radius-${key})` }}
                  />
                  <span class="font-mono text-caption text-ink-gray-7">
                    {key} · {value}
                  </span>
                </div>
              )}
            </For>
          </div>
        </details>
      </PageSection>

      <PageSection
        id="elevation"
        title="Elevation"
        description="Resting surfaces are flat and drawn with a 1px border. A shadow means the surface floats above the page, and it is always paired with an opaque surface."
      >
        <div class="grid grid-cols-2 gap-card-gap rounded-card border border-outline-gray-1 bg-surface-base p-card-pad sm:grid-cols-4 lg:grid-cols-7">
          <For each={ELEVATION}>
            {(step) => (
              <div class="flex flex-col items-center gap-2">
                <div
                  class={`grid h-20 w-full place-items-center rounded-card border border-outline-gray-1 text-caption text-ink-gray-7 ${step.class}`}
                >
                  {step.name}
                </div>
                <span class="text-caption text-ink-gray-7">{step.note}</span>
              </div>
            )}
          </For>
        </div>
        <p class="mt-field-gap max-w-[30rem] text-caption text-ink-gray-7">
          Dialogs, popovers and menus take <Token>shadow-xl</Token>; a hover
          lift on a control takes <Token>shadow-sm</Token>. Dark mode swaps each
          step for its dark counterpart instead of reusing a light shadow.
        </p>
      </PageSection>

      <PageSection
        id="focus-rings"
        title="Focus rings"
        description="Focus is an outline, not a box-shadow: 2px in light mode and 3px in dark. It survives forced-colours mode and never collides with a shadow utility."
      >
        <div class="rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad">
          <div class="flex flex-wrap gap-x-8 gap-y-6">
            <For each={FOCUS}>
              {(ring) => (
                <div class="flex flex-col items-center gap-2">
                  <div
                    aria-hidden="true"
                    class="grid h-9 w-20 place-items-center rounded-control border border-outline-gray-2 bg-surface-base text-caption text-ink-gray-7"
                    style={{
                      outline: `var(${ring.var})`,
                      'outline-offset': '0px',
                    }}
                  >
                    Focus
                  </div>
                  <span class="font-mono text-caption text-ink-gray-7">
                    {ring.name}
                  </span>
                </div>
              )}
            </For>
          </div>
        </div>
        <p class="mt-field-gap max-w-[30rem] text-caption text-ink-gray-7">
          A control's ring follows its theme: a red field draws the red ring, a
          neutral one the default. Tab through this page to see the live
          version.
        </p>
      </PageSection>

      <p class="max-w-[30rem] text-caption text-ink-gray-7">
        The data lives in <Token>@talelk/newui-tokens</Token>; the utilities
        live in <Token>@talelk/newui-tailwind</Token>. A token that is not in
        either package does not reach a component.
      </p>
    </div>
  )
}
