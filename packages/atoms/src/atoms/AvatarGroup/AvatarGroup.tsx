import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'
import { cn } from '../../lib/tv'
import type { AvatarShape, AvatarSize, AvatarTheme } from '../Avatar/Avatar'
import { Avatar } from '../Avatar/Avatar'

export interface AvatarGroupItem {
  image?: string
  /** The person's name; its initial is the fallback and the image's alt. */
  label?: string
}

export interface AvatarGroupProps {
  avatars: AvatarGroupItem[]
  /** How many render before the overflow count. @default 4 */
  max?: number
  size?: AvatarSize
  shape?: AvatarShape
  /** Theme of the fallback tiles, including the overflow count. */
  theme?: AvatarTheme
  /** Accessible name when the group needs naming (e.g. "Assignees"). */
  label?: string
  class?: string
}

/** Overlap and type scale, per Avatar size step. The ring is the surface
 * separator that keeps stacked tiles legible. */
const STEP: Record<AvatarSize, { gap: string; ring: string; text: string }> = {
  xs: { gap: '-ms-1', ring: 'ring-1', text: 'text-2xs' },
  sm: { gap: '-ms-1', ring: 'ring-1', text: 'text-2xs' },
  md: { gap: '-ms-1.5', ring: 'ring-2', text: 'text-2xs' },
  lg: { gap: '-ms-1.5', ring: 'ring-2', text: 'text-xs' },
  xl: { gap: '-ms-2', ring: 'ring-2', text: 'text-xs' },
  '2xl': { gap: '-ms-2', ring: 'ring-2', text: 'text-sm' },
  '3xl': { gap: '-ms-2', ring: 'ring-2', text: 'text-sm' },
}

/**
 * A stack of people with one box each: avatars overlap, and everyone past
 * `max` collapses into a single "+N" tile. Data-driven (like Avatar's own
 * `label`/`image` pair) so the overflow count stays the group's decision, not
 * each avatar's.
 */
export function AvatarGroup(props: AvatarGroupProps): JSX.Element {
  const max = () => props.max ?? 4
  const size = () => props.size ?? 'md'
  const visible = () => props.avatars.slice(0, max())
  const overflow = () => Math.max(0, props.avatars.length - max())
  const step = () => STEP[size()]

  // The group role and its name are one conditional unit: an unnamed stack
  // stays a plain div.
  const groupProps = () =>
    props.label ? { role: 'group' as const, 'aria-label': props.label } : {}

  return (
    <div
      data-slot="avatar-group"
      {...groupProps()}
      class={cn('flex items-center', props.class)}
    >
      <For each={visible()}>
        {(avatar, index) => (
          <Avatar
            image={avatar.image}
            label={avatar.label}
            size={size()}
            shape={props.shape}
            theme={props.theme}
            class={cn(
              step().ring,
              'ring-surface-base',
              index() > 0 && step().gap,
            )}
          />
        )}
      </For>
      <Show when={overflow() > 0}>
        <Avatar
          size={size()}
          shape={props.shape}
          class={cn(step().ring, 'ring-surface-base', step().gap)}
        >
          <span class={cn('leading-none', step().text)}>+{overflow()}</span>
        </Avatar>
      </Show>
    </div>
  )
}
