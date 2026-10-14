import { type JSX, Show, splitProps } from 'solid-js'
import { cn, tv, type VariantProps } from '../../lib/tv'

export type BadgeTheme = 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet'
export type BadgeVariant = 'solid' | 'subtle' | 'outline' | 'ghost'
export type BadgeSize = 'sm' | 'md' | 'lg'

// Transcribed from frappe-ui's Badge so the rendered utilities match. The
// semantic scale is uniform across themes; gray is the one exception.
const THEME: Record<BadgeTheme, Record<BadgeVariant, string>> = {
  gray: {
    solid: 'text-ink-base bg-surface-gray-10',
    subtle: 'text-ink-gray-6 bg-surface-gray-2',
    outline: 'text-ink-gray-6 border border-outline-gray-2',
    ghost: 'text-ink-gray-6',
  },
  blue: {
    solid: 'text-ink-base bg-surface-blue-8',
    subtle: 'text-ink-blue-8 bg-surface-blue-2',
    outline: 'text-ink-blue-8 border border-outline-blue-3',
    ghost: 'text-ink-blue-8',
  },
  green: {
    solid: 'text-ink-base bg-surface-green-8',
    subtle: 'text-ink-green-8 bg-surface-green-2',
    outline: 'text-ink-green-8 border border-outline-green-3',
    ghost: 'text-ink-green-8',
  },
  amber: {
    solid: 'text-ink-base bg-surface-amber-9',
    subtle: 'text-ink-amber-8 bg-surface-amber-2',
    outline: 'text-ink-amber-8 border border-outline-amber-3',
    ghost: 'text-ink-amber-8',
  },
  red: {
    solid: 'text-ink-base bg-surface-red-8',
    subtle: 'text-ink-red-8 bg-surface-red-2',
    outline: 'text-ink-red-8 border border-outline-red-3',
    ghost: 'text-ink-red-8',
  },
  violet: {
    solid: 'text-ink-base bg-surface-violet-8',
    subtle: 'text-ink-violet-8 bg-surface-violet-2',
    outline: 'text-ink-violet-8 border border-outline-violet-3',
    ghost: 'text-ink-violet-8',
  },
}

const THEMES = Object.keys(THEME) as BadgeTheme[]
const VARIANTS: BadgeVariant[] = ['solid', 'subtle', 'outline', 'ghost']

export const badge = tv({
  base: 'inline-flex select-none items-center gap-1 overflow-clip whitespace-nowrap rounded-full leading-tighter',
  variants: {
    variant: { solid: '', subtle: '', outline: '', ghost: '' },
    theme: {
      gray: '',
      blue: '',
      green: '',
      amber: '',
      red: '',
      violet: '',
    },
    size: {
      sm: 'h-4 px-1.5 text-xs',
      md: 'h-5 px-1.5 text-xs',
      lg: 'h-6 px-2 text-sm tracking-[0.02em]',
    },
  },
  compoundVariants: THEMES.flatMap((theme) =>
    VARIANTS.map((variant) => ({
      theme,
      variant,
      class: THEME[theme][variant],
    })),
  ),
  defaultVariants: { theme: 'gray', variant: 'subtle', size: 'md' },
})

export interface BadgeProps extends VariantProps<typeof badge> {
  label?: string | number
  prefix?: JSX.Element
  suffix?: JSX.Element
  class?: string
  children?: JSX.Element
}

export function Badge(props: BadgeProps): JSX.Element {
  const [local] = splitProps(props, [
    'theme',
    'variant',
    'size',
    'label',
    'prefix',
    'suffix',
    'class',
    'children',
  ])

  const iconSize = () => (local.size === 'lg' ? 'size-3' : 'size-2.5')

  return (
    <div
      class={cn(
        badge({
          theme: local.theme,
          variant: local.variant,
          size: local.size,
        }),
        local.class,
      )}
    >
      <Show when={local.prefix}>
        <div
          class={cn(
            'inline-flex shrink-0 items-center justify-center',
            iconSize(),
          )}
        >
          {local.prefix}
        </div>
      </Show>
      {local.children ?? local.label}
      <Show when={local.suffix}>
        <div
          class={cn(
            'inline-flex shrink-0 items-center justify-center',
            iconSize(),
          )}
        >
          {local.suffix}
        </div>
      </Show>
    </div>
  )
}
