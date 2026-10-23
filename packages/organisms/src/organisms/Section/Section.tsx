import { cn } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export type SectionHeadingLevel = 1 | 2 | 3 | 4

export interface SectionProps {
  title?: JSX.Element
  description?: JSX.Element
  /** Page or section actions, rendered opposite the title. */
  actions?: JSX.Element
  /** Controls that change the data, between the header and the body. */
  toolbar?: JSX.Element
  /** Pagination, totals or selection feedback, under a rule. */
  footer?: JSX.Element
  /** @default 2 */
  headingLevel?: SectionHeadingLevel
  /** Explicit id for the rendered heading. Defaults to `<id>-title`. */
  headingId?: string
  /** Accessible name when the section has no visible title. */
  label?: string
  /** Id of the element that names the region; beats `label`/the heading id. */
  labelledBy?: string
  /** Surface treatment. @default 'plain' */
  surface?: 'plain' | 'card' | 'inset'
  /** @default 'comfortable' */
  density?: 'comfortable' | 'compact'
  id?: string
  class?: string
  children: JSX.Element
}

const HEADING: Record<SectionHeadingLevel, string> = {
  1: 'text-heading',
  2: 'text-section',
  3: 'text-base-medium',
  4: 'text-interface font-medium',
}

/**
 * One page-region anatomy: header, optional toolbar, body, optional footer.
 *
 * Data organisms should not each invent their own title row or footer rule.
 * `Section` owns the region; the organism owns the data surface inside it.
 */
export function Section(props: SectionProps): JSX.Element {
  const surface = () => props.surface ?? 'plain'
  const density = () => props.density ?? 'comfortable'
  const hasHeader = () =>
    Boolean(props.title || props.description || props.actions)
  const headingId = () =>
    props.headingId ?? (props.id ? `${props.id}-title` : undefined)
  const labelledBy = () =>
    props.labelledBy ?? (props.title ? headingId() : undefined)
  return (
    <section
      id={props.id}
      aria-label={props.label}
      aria-labelledby={labelledBy()}
      data-slot="section"
      data-surface={surface()}
      data-density={density()}
      class={cn(
        'flex min-w-0 flex-col',
        density() === 'compact' ? 'gap-2' : 'gap-3',
        surface() === 'card' &&
          'rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad',
        surface() === 'inset' && 'rounded-card bg-surface-gray-1 p-card-pad',
        props.class,
      )}
    >
      <Show when={hasHeader()}>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-1">
            <Show when={props.title}>
              <Dynamic
                component={`h${props.headingLevel ?? 2}`}
                id={headingId()}
                class={cn(
                  'min-w-0 text-ink-gray-9',
                  HEADING[props.headingLevel ?? 2],
                )}
              >
                {props.title}
              </Dynamic>
            </Show>
            <Show when={props.description}>
              <p class="max-w-[56ch] text-caption text-ink-gray-7">
                {props.description}
              </p>
            </Show>
          </div>
          <Show when={props.actions}>
            <div class="flex shrink-0 flex-wrap items-center gap-2">
              {props.actions}
            </div>
          </Show>
        </div>
      </Show>
      <Show when={props.toolbar}>{props.toolbar}</Show>
      <div class="min-w-0">{props.children}</div>
      <Show when={props.footer}>
        <div class="border-t border-outline-gray-1 pt-3">{props.footer}</div>
      </Show>
    </section>
  )
}
