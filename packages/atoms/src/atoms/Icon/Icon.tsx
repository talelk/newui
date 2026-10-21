import type { Component, JSX } from 'solid-js'
import { Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '../../lib/tv'

export type IconProp = string | Component<{ class?: string }>

export interface IconProps {
  /** Canonical icon prop. Accepts a `lucide-*` string or a component (P11). */
  icon?: IconProp | null
  /** Legacy alias; `icon` wins when both are set. */
  name?: IconProp | null
  class?: string
}

/**
 * A `lucide-*` class span or an inline component. The string form relies on the
 * icon utilities the Tailwind plugin emits, so no per-icon import is needed.
 *
 * Sizing is the caller's: like frappe-ui, no default `size-*` is injected, so a
 * glyph is sized by the class the caller passes (or by the icon utility).
 */
export function Icon(props: IconProps): JSX.Element {
  const resolved = () => (props.icon !== undefined ? props.icon : props.name)

  return (
    <Show when={resolved()}>
      {(value) => {
        const icon = () => value() as IconProp
        return (
          <Show
            when={typeof icon() === 'string'}
            fallback={
              <Dynamic
                component={icon() as Component<{ class?: string }>}
                data-slot="icon"
                class={props.class}
              />
            }
          >
            <span
              data-slot="icon"
              class={cn(icon() as string, props.class)}
              aria-hidden="true"
            />
          </Show>
        )
      }}
    </Show>
  )
}
