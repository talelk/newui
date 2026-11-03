import type { JSX } from 'solid-js'
import { SuccessLineIcon } from './SuccessLineIcon'

/** Alias of `SuccessLineIcon` — the same glyph, kept for existing imports. */
export function CircleCheckIcon(props: { class?: string }): JSX.Element {
  return <SuccessLineIcon class={props.class} />
}
