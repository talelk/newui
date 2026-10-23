import { Badge, Button, type ButtonTheme } from '@talelk/newui-atoms'
import { type BreadcrumbItem, Breadcrumbs } from '@talelk/newui-molecules'
import { For, type JSX, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export interface DetailAction {
  label: string
  onClick?: () => void
}

export interface DetailHeaderProps {
  /** The trail above the title. Omitted → no breadcrumbs. */
  breadcrumbs?: BreadcrumbItem[]
  title: JSX.Element
  /** Semantic level of the title. @default 1 */
  headingLevel?: 1 | 2 | 3 | 4
  /** Muted line under the title — a record id, an owner, a timestamp. */
  subtitle?: JSX.Element
  /** Status pill beside the title. */
  status?: { label: string; theme?: ButtonTheme }
  /**
   * Trailing actions in order. Everything but the last renders as an outline
   * button; the last is the primary one.
   */
  actions?: DetailAction[]
  /** Anything else on the trailing edge, before the actions. */
  children?: JSX.Element
  class?: string
}

/**
 * The top of a record page: where it sits, what it is, what state it is in, and
 * what you can do to it.
 *
 * The order is the point. A reader arrives from a list and needs three questions
 * answered in that order — the trail first, so they know this is the record they
 * clicked; then the name; then the status, because a status only means something
 * once you know what it belongs to. Actions sit on the trailing edge with the
 * primary one last, so the least-common (often destructive) action is never the
 * one nearest the title.
 */
export function DetailHeader(props: DetailHeaderProps): JSX.Element {
  const secondary = () => (props.actions ?? []).slice(0, -1)
  const primary = () => (props.actions ?? []).at(-1)

  return (
    <header class={`flex flex-col gap-field-gap ${props.class ?? ''}`}>
      <Show when={props.breadcrumbs}>
        {(crumbs) => <Breadcrumbs items={crumbs()} />}
      </Show>

      <div class="flex flex-wrap items-start justify-between gap-card-gap">
        <div class="flex min-w-0 flex-col gap-1">
          <div class="flex min-w-0 items-center gap-control-gap">
            <Dynamic
              component={`h${props.headingLevel ?? 1}`}
              class="min-w-0 text-metric text-ink-gray-9 [overflow-wrap:anywhere]"
            >
              {props.title}
            </Dynamic>
            <Show when={props.status}>
              {(status) => (
                <Badge
                  theme={status().theme ?? 'gray'}
                  label={status().label}
                />
              )}
            </Show>
          </div>
          <Show when={props.subtitle}>
            <p class="truncate text-base text-ink-gray-7">{props.subtitle}</p>
          </Show>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-control-gap">
          {props.children}
          <For each={secondary()}>
            {(action) => (
              <Button variant="outline" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
          </For>
          <Show when={primary()}>
            {(action) => (
              <Button variant="solid" onClick={action().onClick}>
                {action().label}
              </Button>
            )}
          </Show>
        </div>
      </div>
    </header>
  )
}
