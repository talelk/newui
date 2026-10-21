import { tv, type VariantProps } from '../../lib/tv'

export type ButtonVariant = 'solid' | 'subtle' | 'outline' | 'ghost'
export type ButtonTheme = 'gray' | 'blue' | 'green' | 'red'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

type Combo = `${ButtonTheme}-${ButtonVariant}`

// The resting look, per theme×variant. Transcribed from frappe-ui's Button so
// the rendered utilities match one-for-one.
const REST: Record<Combo, string> = {
  'gray-solid':
    'text-ink-base bg-surface-gray-10 hover:bg-surface-gray-9 active:bg-surface-gray-8',
  'blue-solid':
    'text-ink-base bg-surface-blue-8 hover:bg-surface-blue-9 active:bg-surface-blue-9',
  'green-solid':
    'text-ink-base bg-surface-green-8 hover:bg-surface-green-9 active:bg-surface-green-9',
  'red-solid':
    'text-ink-base dark:text-ink-red-9 bg-surface-red-8 hover:bg-surface-red-9 active:bg-surface-red-9',

  'gray-subtle':
    'text-ink-gray-8 bg-surface-gray-2 hover:bg-surface-gray-3 active:bg-surface-gray-4',
  'blue-subtle':
    'text-ink-blue-8 bg-surface-blue-2 hover:bg-surface-blue-3 active:bg-surface-blue-4',
  'green-subtle':
    'text-ink-green-8 bg-surface-green-2 hover:bg-surface-green-3 active:bg-surface-green-4',
  'red-subtle':
    'text-ink-red-8 bg-surface-red-2 hover:bg-surface-red-3 active:bg-surface-red-4',

  'gray-outline':
    'text-ink-gray-8 bg-surface-base border border-outline-gray-2 hover:border-outline-gray-3 active:border-outline-gray-3 active:bg-surface-gray-4',
  'blue-outline':
    'text-ink-blue-8 bg-surface-base border border-outline-blue-1 hover:border-outline-blue-4 active:border-outline-blue-4 active:bg-surface-blue-4',
  'green-outline':
    'text-ink-green-8 bg-surface-base border border-outline-green-3 hover:border-outline-green-5 active:border-outline-green-5 active:bg-surface-green-4',
  'red-outline':
    'text-ink-red-8 bg-surface-base border border-outline-red-1 hover:border-outline-red-3 active:border-outline-red-3 active:bg-surface-red-3',

  'gray-ghost':
    'text-ink-gray-8 bg-transparent hover:bg-surface-gray-3 active:bg-surface-gray-4',
  'blue-ghost':
    'text-ink-blue-8 bg-transparent hover:bg-surface-blue-3 active:bg-surface-blue-4',
  'green-ghost':
    'text-ink-green-8 bg-transparent hover:bg-surface-green-3 active:bg-surface-green-4',
  'red-ghost':
    'text-ink-red-8 bg-transparent hover:bg-surface-red-3 active:bg-surface-red-4',
}

// The pressed look, held. `data-state` is stamped by whatever primitive uses
// the Button as a trigger (Dropdown/Popover/Select) or by a toggle itself, so
// there is no JS state swap — CSS reads the attribute.
const ACTIVE_BASE: Record<Combo, string> = {
  'gray-solid': 'bg-surface-gray-8',
  'blue-solid': 'bg-surface-blue-9',
  'green-solid': 'bg-surface-green-9',
  'red-solid': 'bg-surface-red-9',

  'gray-subtle': 'bg-surface-gray-4',
  'blue-subtle': 'bg-surface-blue-4',
  'green-subtle': 'bg-surface-green-4',
  'red-subtle': 'bg-surface-red-4',

  'gray-outline': 'bg-surface-gray-4 border-outline-gray-3',
  'blue-outline': 'bg-surface-blue-4 border-outline-blue-4',
  'green-outline': 'bg-surface-green-4 border-outline-green-5',
  'red-outline': 'bg-surface-red-3 border-outline-red-3',

  'gray-ghost': 'bg-surface-gray-4',
  'blue-ghost': 'bg-surface-blue-4',
  'green-ghost': 'bg-surface-green-4',
  'red-ghost': 'bg-surface-red-4',
}

const DISABLED: Record<Combo, string> = {
  'gray-solid': 'disabled:bg-surface-gray-2 disabled:text-ink-gray-4',
  'gray-subtle': 'disabled:bg-surface-gray-2 disabled:text-ink-gray-4',
  'gray-outline':
    'disabled:bg-surface-gray-2 disabled:text-ink-gray-4 disabled:border disabled:border-outline-gray-2',
  'gray-ghost': 'disabled:text-ink-gray-4',

  'blue-solid': 'disabled:bg-surface-blue-4 disabled:text-ink-base',
  'blue-subtle': 'disabled:bg-surface-blue-2 disabled:text-ink-blue-link',
  'blue-outline':
    'disabled:bg-surface-blue-2 disabled:text-ink-blue-link disabled:border disabled:border-outline-blue-1',
  'blue-ghost': 'disabled:text-ink-blue-link',

  'green-solid': 'disabled:bg-surface-green-2 disabled:text-ink-green-4',
  'green-subtle': 'disabled:bg-surface-green-2 disabled:text-ink-green-4',
  'green-outline':
    'disabled:bg-surface-green-2 disabled:text-ink-green-4 disabled:border disabled:border-outline-green-3',
  'green-ghost': 'disabled:text-ink-green-4',

  'red-solid': 'disabled:bg-surface-red-2 disabled:text-ink-red-4',
  'red-subtle': 'disabled:bg-surface-red-2 disabled:text-ink-red-4',
  'red-outline':
    'disabled:bg-surface-red-2 disabled:text-ink-red-4 disabled:border disabled:border-outline-red-1',
  'red-ghost': 'disabled:text-ink-red-4',
}

const FOCUS: Record<ButtonTheme, string> = {
  gray: 'focus-visible:focus-ring',
  blue: 'focus-visible:focus-ring-blue',
  green: 'focus-visible:focus-ring-green',
  red: 'focus-visible:focus-ring-red',
}

/** Prefix every token with both `data-state` values the pressed look uses. */
function activeStates(classes: string) {
  return classes
    .split(' ')
    .flatMap((c) => [`data-[state=open]:${c}`, `data-[state=active]:${c}`])
    .join(' ')
}

const THEMES: ButtonTheme[] = ['gray', 'blue', 'green', 'red']
const VARIANTS: ButtonVariant[] = ['solid', 'subtle', 'outline', 'ghost']
const SIZES: ButtonSize[] = ['xs', 'sm', 'md', 'lg']

const TEXT_SIZE: Record<ButtonSize, string> = {
  xs: 'h-auto min-h-6 text-xs px-1.5 py-0.5 rounded-control',
  sm: 'h-auto min-h-7 text-base px-2 py-0.5 rounded-control',
  md: 'h-auto min-h-8 text-base-medium px-2.5 py-1 rounded-control',
  lg: 'h-auto min-h-10 text-lg-medium px-3 py-1.5 rounded-control',
}

const ICON_SIZE: Record<ButtonSize, string> = {
  xs: 'h-6 w-6 px-0 py-0 rounded-control',
  sm: 'h-7 w-7 px-0 py-0 rounded-control',
  md: 'h-8 w-8 px-0 py-0 rounded-control',
  lg: 'h-10 w-10 px-0 py-0 rounded-control',
}

export const button = tv({
  base: 'inline-flex max-w-full items-center justify-center gap-2 shrink-0 cursor-pointer transition-colors disabled:cursor-not-allowed',
  variants: {
    variant: {
      solid: '',
      subtle: '',
      outline: 'bg-surface-base border',
      ghost: 'bg-transparent',
    },
    theme: { gray: '', blue: '', green: '', red: '' },
    size: {
      xs: TEXT_SIZE.xs,
      sm: TEXT_SIZE.sm,
      md: TEXT_SIZE.md,
      lg: TEXT_SIZE.lg,
    },
    icon: { true: '', false: '' },
  },
  compoundVariants: [
    ...VARIANTS.flatMap((variant) =>
      THEMES.map((theme) => ({
        variant,
        theme,
        class: [
          REST[`${theme}-${variant}`],
          activeStates(ACTIVE_BASE[`${theme}-${variant}`]),
          DISABLED[`${theme}-${variant}`],
          FOCUS[theme],
        ],
      })),
    ),
    ...SIZES.map((size) => ({
      icon: true,
      size,
      class: ICON_SIZE[size],
    })),
  ],
  defaultVariants: {
    variant: 'subtle',
    theme: 'gray',
    size: 'sm',
    icon: false,
  },
})

export type ButtonRecipeVariants = VariantProps<typeof button>
