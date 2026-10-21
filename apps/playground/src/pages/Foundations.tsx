import { Button, Switch } from '@newui/atoms'
import { Dialog } from '@newui/molecules'
import {
  layoutSpacing,
  radius,
  radiusRoles,
  semanticColors,
} from '@newui/tokens'
import { For } from 'solid-js'
import { PageSection } from '../lib/PageSection'
import { TableOfContents } from '../lib/TableOfContents'
import { PageIntro } from '../shell/PageIntro'
import { usePageToc } from '../shell/SiteLayout'

function Swatch(props: { label: string; cssVar: string }) {
  return (
    <div class="flex flex-col gap-1">
      <div
        class="h-10 rounded-3 border border-outline-gray-1"
        style={{ 'background-color': props.cssVar }}
      />
      <span class="truncate text-2xs text-ink-gray-7">{props.label}</span>
    </div>
  )
}

export function Foundations() {
  usePageToc(() => (
    <TableOfContents
      entries={[
        { id: 'semantic-colors', label: 'Semantic colors' },
        { id: 'color-scheme', label: 'Color scheme' },
        { id: 'layout-rhythm', label: 'Layout rhythm' },
        { id: 'radius', label: 'Radius' },
        { id: 'typography-roles', label: 'Typography roles' },
        { id: 'numbered-typography', label: 'Numbered typography' },
        { id: 'elevation', label: 'Elevation' },
        { id: 'focus-rings', label: 'Focus rings' },
        { id: 'button', label: 'Button' },
        { id: 'switch', label: 'Switch' },
        { id: 'dialog', label: 'Dialog' },
      ]}
    />
  ))
  return (
    <div class="flex flex-col gap-4">
      <PageIntro
        title="Design tokens"
        description="The vocabulary every component is built from. Colours are semantic — surface-*, ink-*, outline-* — so light and dark come from one document attribute rather than a second set of classes."
      />
      <PageSection id="semantic-colors" title="Semantic colors">
        <For each={Object.entries(semanticColors.light)}>
          {([category, entries]) => (
            <div class="flex flex-col gap-2">
              <h3 class="text-sm-medium text-ink-gray-7">{category}</h3>
              <div class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                <For each={Object.keys(entries)}>
                  {(name) => (
                    <Swatch
                      label={name}
                      cssVar={`var(--${category}-${name})`}
                    />
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </PageSection>

      <PageSection id="color-scheme" title="Color scheme">
        <div class="grid gap-control-gap sm:grid-cols-2">
          <div class="flex flex-col gap-control-gap rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad">
            <span class="text-caption text-ink-gray-6">Light</span>
            <div class="rounded-control bg-surface-base p-control-pad text-ink-gray-9">
              Surface base · ink gray 9
            </div>
          </div>
          <div
            data-theme="dark"
            class="flex flex-col gap-control-gap rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad"
          >
            <span class="text-caption text-ink-gray-6">Dark</span>
            <div class="rounded-control bg-surface-base p-control-pad text-ink-gray-9">
              Surface base · ink gray 9
            </div>
          </div>
        </div>
        <p class="mt-field-gap text-caption text-ink-gray-7">
          Surfaces, ink, outlines and native controls follow the persisted
          light, dark or system preference set in the masthead.
        </p>
      </PageSection>

      <PageSection
        id="layout-rhythm"
        title="Layout rhythm"
        description="Named spacing roles map page gutters, sections, cards, fields and controls onto the shared 4px base scale."
      >
        <div class="grid gap-control-gap sm:grid-cols-2 xl:grid-cols-3">
          <For each={Object.entries(layoutSpacing)}>
            {([name, value]) => (
              <div class="flex min-w-0 flex-col gap-control-gap rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad-compact">
                <div class="flex items-baseline justify-between gap-2">
                  <span class="min-w-0 break-words text-sm-medium">{name}</span>
                  <span class="shrink-0 font-mono text-xs text-ink-gray-7">
                    {value}
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  class="h-2 max-w-full rounded-full bg-surface-blue-6"
                  style={{ width: value }}
                />
              </div>
            )}
          </For>
        </div>
        <p class="mt-section-gap text-caption text-ink-gray-7">
          Use the compact gutter on narrow screens, the page gutter at standard
          widths, and the wide gutter when a content frame has room to breathe.
          Controls and fields use smaller internal gaps than sections.
        </p>
        <div class="mt-field-gap grid gap-card-gap sm:grid-cols-3">
          <div class="grid aspect-video place-content-center rounded-card border border-outline-blue-1 bg-surface-blue-1 p-card-pad text-center">
            <span class="text-sm-medium text-ink-blue-8">16 : 9</span>
            <span class="mt-1 text-caption text-ink-gray-7">
              Stable media ratio
            </span>
          </div>
          <div class="grid gap-control-gap rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad sm:col-span-2 sm:grid-cols-2">
            <div class="rounded-control bg-surface-gray-2 p-control-pad text-caption">
              Grid cell
            </div>
            <div class="rounded-control bg-surface-gray-2 p-control-pad text-caption">
              Grid cell
            </div>
            <div class="rounded-control bg-surface-gray-2 p-control-pad text-caption sm:col-span-2">
              A full-width cell in the same 4px rhythm
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection id="radius" title="Radius">
        <p class="mb-field-gap text-caption text-ink-gray-7">
          Components use four semantic roles; the numbered scale remains
          available for specialized geometry.
        </p>
        <div class="grid gap-control-gap sm:grid-cols-2 xl:grid-cols-4">
          <For each={Object.entries(radiusRoles)}>
            {([key, value]) => (
              <div class="flex items-center gap-field-gap rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad-compact">
                <div
                  class="size-12 shrink-0 border border-outline-gray-3 bg-surface-gray-3"
                  style={{ 'border-radius': `var(--radius-${key})` }}
                />
                <div class="min-w-0">
                  <p class="text-sm-medium">{key}</p>
                  <p class="text-caption text-ink-gray-7">{value}</p>
                </div>
              </div>
            )}
          </For>
        </div>
        <details class="mt-field-gap">
          <summary class="cursor-pointer rounded-control py-control-pad text-caption text-ink-blue-link focus-visible:focus-ring">
            Show the primitive radius scale
          </summary>
          <div class="flex flex-wrap items-end gap-control-gap pt-control-pad">
            <For each={Object.entries(radius)}>
              {([key, value]) => (
                <div class="flex flex-col items-center gap-control-gap">
                  <div
                    class="size-14 border border-outline-gray-3 bg-surface-gray-3"
                    style={{ 'border-radius': `var(--radius-${key})` }}
                  />
                  <span class="text-2xs text-ink-gray-7">
                    {key} · {value}
                  </span>
                </div>
              )}
            </For>
          </div>
        </details>
      </PageSection>

      <PageSection id="typography-roles" title="Typography roles">
        <div class="flex flex-col gap-4 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3">
          <div>
            <p class="text-caption text-ink-gray-7">Page heading · 24 / 30</p>
            <p class="text-heading">Revenue overview</p>
          </div>
          <div>
            <p class="text-caption text-ink-gray-7">
              Section heading · 18 / 24
            </p>
            <p class="text-section">Recent transactions</p>
          </div>
          <div>
            <p class="text-caption text-ink-gray-7">Metric · 28 / 32</p>
            <p class="text-metric tabular-nums">$128,430</p>
          </div>
          <div>
            <p class="text-interface">
              Interface · 14 / 20 · Filters, labels and body copy
            </p>
            <p class="text-caption text-ink-gray-7">
              Supporting text · 12 / 16 · Compared with last month
            </p>
          </div>
        </div>
      </PageSection>
      <PageSection id="numbered-typography" title="Numbered typography">
        <div class="flex flex-col gap-1.5">
          <span class="text-2xs">text-2xs · 11px</span>
          <span class="text-xs">text-xs · 12px</span>
          <span class="text-sm">text-sm · 13px</span>
          <span class="text-base">text-base · 14px</span>
          <span class="text-base-medium">text-base-medium · 14px</span>
          <span class="text-md">text-md · 15px</span>
          <span class="text-lg-medium">text-lg-medium · 16px</span>
          <span class="text-xl-semibold">text-xl-semibold · 17px</span>
          <span class="text-2xl-semibold">text-2xl-semibold · 18px</span>
          <span class="text-3xl-bold">text-3xl-bold · 20px</span>
          <span class="text-4xl-bold">text-4xl-bold · 24px</span>
        </div>
      </PageSection>

      <PageSection id="elevation" title="Elevation">
        <div class="flex flex-wrap gap-4 py-4">
          <div class="flex size-20 items-center justify-center rounded-5 bg-surface-base shadow-sm">
            sm
          </div>
          <div class="flex size-20 items-center justify-center rounded-5 bg-surface-base shadow-base">
            base
          </div>
          <div class="flex size-20 items-center justify-center rounded-5 bg-surface-base shadow-md">
            md
          </div>
          <div class="flex size-20 items-center justify-center rounded-5 bg-surface-base shadow-lg">
            lg
          </div>
          <div class="flex size-20 items-center justify-center rounded-5 bg-surface-base shadow-xl">
            xl
          </div>
          <div class="flex size-20 items-center justify-center rounded-5 bg-surface-base shadow-2xl">
            2xl
          </div>
        </div>
      </PageSection>

      <PageSection id="focus-rings" title="Focus rings">
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-4 bg-surface-base px-3 py-1.5 text-sm focus-ring"
          >
            default
          </button>
          <button
            type="button"
            class="rounded-4 bg-surface-base px-3 py-1.5 text-sm focus-ring-blue"
          >
            blue
          </button>
          <button
            type="button"
            class="rounded-4 bg-surface-base px-3 py-1.5 text-sm focus-ring-green"
          >
            green
          </button>
          <button
            type="button"
            class="rounded-4 bg-surface-base px-3 py-1.5 text-sm focus-ring-amber"
          >
            amber
          </button>
          <button
            type="button"
            class="rounded-4 bg-surface-base px-3 py-1.5 text-sm focus-ring-red"
          >
            red
          </button>
        </div>
      </PageSection>

      <PageSection id="button" title="Button">
        <div class="flex flex-col gap-4">
          <For each={['solid', 'subtle', 'outline', 'ghost'] as const}>
            {(variant) => (
              <div class="flex flex-wrap items-center gap-3">
                <span class="w-16 text-xs text-ink-gray-7">{variant}</span>
                <Button variant={variant} theme="gray">
                  Gray
                </Button>
                <Button variant={variant} theme="blue">
                  Blue
                </Button>
                <Button variant={variant} theme="green">
                  Green
                </Button>
                <Button variant={variant} theme="red">
                  Red
                </Button>
                <Button variant={variant} icon="lucide-plus" aria-label="Add" />
                <Button variant={variant} disabled>
                  Disabled
                </Button>
              </div>
            )}
          </For>
          <div class="flex flex-wrap items-center gap-3">
            <Button size="xs">xs</Button>
            <Button size="sm">sm</Button>
            <Button size="md">md</Button>
            <Button size="lg">lg</Button>
            <Button loading>Loading</Button>
            <Button iconLeft="lucide-plus" variant="solid" theme="blue">
              Create
            </Button>
          </div>
        </div>
      </PageSection>

      <PageSection id="switch" title="Switch">
        <div class="flex flex-wrap items-center gap-4">
          <Switch label="Notifications" defaultChecked />
          <Switch label="Disabled" disabled />
          <Switch label="Unchecked" />
        </div>
      </PageSection>

      <PageSection id="dialog" title="Dialog">
        <Dialog.Root>
          <Dialog.Trigger class="w-fit rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base">
            Open dialog
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete workspace?</Dialog.Title>
              <Dialog.Description>
                This can't be undone. The machine handles focus trap, Escape and
                outside click.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close class="rounded-4 px-3 py-1.5 text-base text-ink-gray-7">
                Cancel
              </Dialog.Close>
              <Dialog.Close class="rounded-4 bg-surface-red-7 px-3 py-1.5 text-base text-ink-base">
                Delete
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </PageSection>
    </div>
  )
}
