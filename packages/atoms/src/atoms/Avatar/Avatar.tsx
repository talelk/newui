import { createSignal, type JSX, Show, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'

export type AvatarTheme = 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet'
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
export type AvatarShape = 'circle' | 'square'

export interface AvatarProps {
  image?: string
  /** Fallback text; its first letter is shown when there is no image. */
  label?: string
  size?: AvatarSize
  shape?: AvatarShape
  theme?: AvatarTheme
  /**
   * Status dot rendered at the bottom-end corner (an online marker, a presence
   * ring). The dot's box is sized from `size`; the content you pass is drawn
   * inside it.
   */
  indicator?: JSX.Element
  class?: string
  children?: JSX.Element
}

const SIZE: Record<AvatarSize, string> = {
  xs: 'size-4',
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-7',
  xl: 'size-8',
  '2xl': 'size-10',
  '3xl': 'size-11.5',
}

const SQUARE_RADIUS: Record<AvatarSize, string> = {
  xs: 'rounded-[4px]',
  sm: 'rounded-[5px]',
  md: 'rounded-[5px]',
  lg: 'rounded-[6px]',
  xl: 'rounded-[6px]',
  '2xl': 'rounded-[8px]',
  '3xl': 'rounded-[10px]',
}

const LABEL_SIZE: Record<AvatarSize, string> = {
  xs: 'text-2xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
  xl: 'text-lg',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
}

// Per-size box the default slot is wrapped in, so a glyph dropped in as
// children (an icon, a component) is scaled to the avatar. Mirrors frappe-ui's
// `iconClasses`.
const ICON_SIZE: Record<AvatarSize, string> = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
  xl: 'h-4 w-4',
  '2xl': 'h-5 w-5',
  '3xl': 'h-5 w-5',
}

// Indicator container (the ring that lifts the dot off the avatar) and the dot
// itself, both scaled per size. frappe-ui's `indicatorContainerClasses` /
// `indicatorClasses`, with logical `end`/`bottom` offsets so the dot flips to
// the reading-start corner under RTL.
const INDICATOR_CONTAINER: Record<AvatarSize, string> = {
  xs: '-me-[.1rem] -mb-[.1rem] h-2 w-2',
  sm: '-me-[.1rem] -mb-[.1rem] h-[9px] w-[9px]',
  md: '-me-[.1rem] -mb-[.1rem] h-2.5 w-2.5',
  lg: '-me-[.1rem] -mb-[.1rem] h-3 w-3',
  xl: '-me-[.1rem] -mb-[.1rem] h-3 w-3',
  '2xl': '-me-[.1rem] -mb-[.1rem] h-3.5 w-3.5',
  '3xl': '-me-[.2rem] -mb-[.2rem] h-4 w-4',
}

const INDICATOR_DOT: Record<AvatarSize, string> = {
  xs: 'h-1 w-1',
  sm: 'h-[5px] w-[5px]',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
  xl: 'h-2 w-2',
  '2xl': 'h-2.5 w-2.5',
  '3xl': 'h-3 w-3',
}

const THEME: Record<AvatarTheme, string> = {
  gray: 'bg-surface-gray-2 text-ink-gray-6',
  blue: 'bg-surface-blue-2 text-ink-blue-8',
  green: 'bg-surface-green-2 text-ink-green-8',
  amber: 'bg-surface-amber-2 text-ink-amber-8',
  red: 'bg-surface-red-2 text-ink-red-8',
  violet: 'bg-surface-violet-2 text-ink-violet-8',
}

/**
 * A sizing utility on `class` (`size-*`, `w-*`, `h-*`, and the min/max forms)
 * replaces the `size` enum's width/height, so an avatar can be sized beyond the
 * largest enum step without the two fighting. Unprefixed tokens only: a
 * responsive `sm:size-16` works *alongside* `size` (the enum sizes it below the
 * breakpoint, the class takes over at `sm`).
 */
function hasSizeOverride(className: string | undefined): boolean {
  if (!className) return false
  return className
    .split(/\s+/)
    .some(
      (token) =>
        !token.includes(':') &&
        /^-?(size|w|h|min-w|max-w|min-h|max-h)-/.test(token),
    )
}

export function Avatar(props: AvatarProps): JSX.Element {
  const [local] = splitProps(props, [
    'image',
    'label',
    'size',
    'shape',
    'theme',
    'indicator',
    'class',
    'children',
  ])
  const [failed, setFailed] = createSignal(false)

  const size = () => local.size ?? 'md'
  const shape = () => local.shape ?? 'circle'
  const radius = () =>
    shape() === 'circle' ? 'rounded-full' : SQUARE_RADIUS[size()]
  const showImage = () => Boolean(local.image) && !failed()

  return (
    <div
      class={cn(
        'relative inline-block shrink-0',
        !hasSizeOverride(local.class) && SIZE[size()],
        local.class,
      )}
    >
      <Show
        when={showImage()}
        fallback={
          <div
            class={cn(
              'flex h-full w-full select-none items-center justify-center font-medium uppercase',
              radius(),
              LABEL_SIZE[size()],
              THEME[local.theme ?? 'gray'],
            )}
          >
            <Show when={local.children} fallback={local.label?.[0]}>
              <div class={ICON_SIZE[size()]}>{local.children}</div>
            </Show>
          </div>
        }
      >
        <img
          src={local.image}
          alt={local.label}
          class={cn('h-full w-full object-cover', radius())}
          onError={() => setFailed(true)}
        />
      </Show>

      <Show when={local.indicator}>
        <div
          data-slot="avatar-indicator"
          class={cn(
            'absolute bottom-0 end-0 grid place-items-center rounded-full bg-surface-base',
            INDICATOR_CONTAINER[size()],
          )}
        >
          <div
            class={cn('overflow-hidden rounded-full', INDICATOR_DOT[size()])}
          >
            {local.indicator}
          </div>
        </div>
      </Show>
    </div>
  )
}
