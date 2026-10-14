import {
  type Component,
  createSignal,
  type JSX,
  Show,
  splitProps,
} from 'solid-js'
import { cn, tv, type VariantProps } from '../../lib/tv'
import {
  Button,
  type ButtonSize,
  type ButtonTheme,
  type ButtonVariant,
} from '../Button'
import { Icon } from '../Icon'

export type AlertTheme = 'gray' | 'blue' | 'green' | 'amber' | 'red'
export type AlertVariant = 'subtle' | 'outline'

// The container is always the neutral surface: only the icon and the action
// label carry the theme colour (frappe-ui's model). `variant` keeps our
// outline/subtle axis, but neither tints the container by theme.
const VARIANT: Record<AlertVariant, string> = {
  subtle: 'bg-surface-gray-1',
  outline: 'border border-outline-gray-2',
}

const DEFAULT_ICON: Record<AlertTheme, string> = {
  gray: 'lucide-info',
  blue: 'lucide-info',
  green: 'lucide-circle-check',
  amber: 'lucide-triangle-alert',
  red: 'lucide-circle-alert',
}

// frappe-ui paints the status glyph `ink-<theme>-5`; green and amber at that
// step fall below the 3:1 non-text contrast floor on `surface-gray-1` in the
// light theme, so we use one step darker (`-6`). Gray has its own step.
const ICON_COLOR: Record<AlertTheme, string> = {
  gray: 'text-ink-gray-7',
  blue: 'text-ink-blue-6',
  green: 'text-ink-green-6',
  amber: 'text-ink-amber-6',
  red: 'text-ink-red-6',
}

export const alert = tv({
  base: 'flex gap-2 rounded-6',
  variants: {
    variant: { subtle: VARIANT.subtle, outline: VARIANT.outline },
    theme: { gray: '', blue: '', green: '', amber: '', red: '' },
    // Content-driven (frappe-ui): a description, children or a secondary
    // action switches the row to a stacked banner.
    layout: {
      row: 'h-10 items-center py-1.5 pl-3.5 pr-1.5',
      banner: 'relative items-start p-3',
    },
  },
  defaultVariants: { theme: 'gray', variant: 'subtle', layout: 'row' },
})

/** Context handed to an action's `onClick`. */
export interface AlertActionContext {
  /** Fires the alert's `onDismiss`. The parent owns hiding. */
  dismiss: () => void
}

export interface AlertAction {
  label: string
  onClick?: (context: AlertActionContext) => void | Promise<void>
  variant?: ButtonVariant
  theme?: ButtonTheme
  size?: ButtonSize
  /** Forces the button's spinner; otherwise an async `onClick` drives it. */
  loading?: boolean
}

export interface AlertProps extends VariantProps<typeof alert> {
  title?: JSX.Element
  description?: JSX.Element
  /** A `lucide-*` string or a component. Falls back to a theme default. */
  icon?: string | Component<{ class?: string }>
  /** Shows the × control; the parent owns hiding. */
  dismissible?: boolean
  onDismiss?: () => void
  /** Single-action shorthand. Prefer `primaryAction`. */
  action?: AlertAction
  /** Primary action button. Its presence keeps the row layout. */
  primaryAction?: AlertAction
  /** Second action; its presence forces the banner layout. */
  secondaryAction?: AlertAction
  class?: string
  children?: JSX.Element
}

export function Alert(props: AlertProps): JSX.Element {
  const [local] = splitProps(props, [
    'theme',
    'variant',
    'title',
    'description',
    'icon',
    'dismissible',
    'onDismiss',
    'action',
    'primaryAction',
    'secondaryAction',
    'class',
    'children',
  ])

  const theme = () => local.theme ?? 'gray'
  const primary = () => local.primaryAction ?? local.action
  const hasBody = () =>
    Boolean(local.description || local.children || local.secondaryAction)
  // Button has no `amber` theme (frappe-ui's set is gray|blue|green|red), so the
  // warning tone falls back to gray for its action button.
  const buttonTheme = (): ButtonTheme => {
    const value = theme()
    return value === 'amber' || value === 'gray' ? 'gray' : value
  }

  const dismiss = () => local.onDismiss?.()

  const [pending, setPending] = createSignal({
    primary: false,
    secondary: false,
  })

  async function run(
    slot: 'primary' | 'secondary',
    action: AlertAction,
  ): Promise<void> {
    if (!action.onClick || pending()[slot]) return
    setPending((state) => ({ ...state, [slot]: true }))
    try {
      await action.onClick({ dismiss })
    } finally {
      setPending((state) => ({ ...state, [slot]: false }))
    }
  }

  const actionProps = (slot: 'primary' | 'secondary', action: AlertAction) => {
    const banner = hasBody()
    const fallback =
      slot === 'primary'
        ? banner
          ? {
              variant: 'outline' as const,
              theme: 'gray' as const,
              size: 'md' as const,
            }
          : {
              variant: 'ghost' as const,
              theme: buttonTheme(),
              size: 'sm' as const,
            }
        : {
            variant: 'ghost' as const,
            theme: 'gray' as const,
            size: 'md' as const,
          }
    return {
      variant: action.variant ?? fallback.variant,
      theme: action.theme ?? fallback.theme,
      size: action.size ?? fallback.size,
      loading: action.loading ?? pending()[slot],
      onClick: () => void run(slot, action),
    }
  }

  return (
    <div
      data-slot="alert"
      role={theme() === 'red' || theme() === 'amber' ? 'alert' : 'status'}
      class={cn(
        alert({
          theme: local.theme,
          variant: local.variant,
          layout: hasBody() ? 'banner' : 'row',
        }),
        local.class,
      )}
    >
      <Icon
        icon={local.icon ?? DEFAULT_ICON[theme()]}
        class={cn(
          'size-4 shrink-0',
          ICON_COLOR[theme()],
          hasBody() && 'mt-0.5',
        )}
      />

      <div class="flex flex-1 flex-col gap-0.5">
        <Show when={local.title}>
          <span class="text-base-medium text-ink-gray-8">{local.title}</span>
        </Show>
        <Show when={hasBody()}>
          <div class="text-base text-ink-gray-6">
            {local.children ?? local.description}
          </div>
        </Show>
      </div>

      <Show when={primary() || local.secondaryAction}>
        <div
          data-slot="alert-actions"
          class={cn('flex shrink-0 items-center gap-1', !hasBody() && 'ml-1.5')}
        >
          <Show when={primary()}>
            {(action) => (
              <Button {...actionProps('primary', action())}>
                {action().label}
              </Button>
            )}
          </Show>
          <Show when={local.secondaryAction}>
            {(action) => (
              <Button {...actionProps('secondary', action())}>
                {action().label}
              </Button>
            )}
          </Show>
        </div>
      </Show>

      <Show when={local.dismissible}>
        <Button
          variant="ghost"
          theme="gray"
          size={hasBody() ? 'xs' : 'sm'}
          icon="lucide-x"
          aria-label="Dismiss"
          class={hasBody() ? 'absolute end-1.5 top-1.5' : 'shrink-0'}
          onClick={dismiss}
        />
      </Show>
    </div>
  )
}
