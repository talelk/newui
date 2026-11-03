import type { Component, JSX } from 'solid-js'
import { Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { controlGlyphSizes } from '../../lib/control-styles'
import { cn } from '../../lib/tv'
import {
  type ButtonSize,
  type ButtonTheme,
  type ButtonVariant,
  button,
} from '../Button/recipe'
import { Spinner } from '../Spinner'

type IconProp = string | Component<{ class?: string }>

export interface IconButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * The accessible name. An icon-only control is unnamed without it — this
   * prop is the point of the component.
   */
  label: string
  icon?: IconProp
  variant?: ButtonVariant
  theme?: ButtonTheme
  /** @default sm */
  size?: ButtonSize
  disabled?: boolean
  /** Busy: shows the shared spinner, keeps resting colours, blocks clicks. */
  loading?: boolean
  /** External URL, opened in a new tab. */
  href?: string
  /**
   * In-app destination (CONTEXT: `route` is in-app, `href` is external). Wins
   * over `href`. Renders a plain `href`; pair it with `onClick` to intercept
   * the click and navigate with your router.
   */
  route?: string
  target?: string
  type?: 'button' | 'submit' | 'reset'
  class?: string
}

/**
 * A square, icon-only command sharing the Button recipe's box and states.
 * The `label` is its accessible name — an icon alone names nothing.
 */
export function IconButton(props: IconButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'label',
    'icon',
    'variant',
    'theme',
    'size',
    'disabled',
    'loading',
    'href',
    'route',
    'target',
    'type',
    'class',
    'onClick',
  ])

  const size = () => local.size ?? 'sm'
  const isDisabled = () => Boolean(local.disabled) || Boolean(local.loading)
  // Mirrors Button: a disabled/loading control never renders a navigable
  // anchor, and loading keeps the resting palette (no native `disabled`).
  const tag = () =>
    (local.route ?? local.href) && !isDisabled() ? 'a' : 'button'

  const glyph = () => {
    const icon = local.icon
    if (!icon) return null
    if (typeof icon === 'string') {
      if (!icon.startsWith('lucide-')) return null
      return (
        <span class={cn(icon, controlGlyphSizes[size()])} aria-hidden="true" />
      )
    }
    return <Dynamic component={icon} class={controlGlyphSizes[size()]} />
  }

  const rootProps = () => {
    if (tag() === 'a') {
      if (local.route) return { href: local.route }
      return {
        href: local.href,
        target: local.target ?? '_blank',
        rel: 'noreferrer noopener',
      }
    }
    return { type: local.type ?? 'button', disabled: Boolean(local.disabled) }
  }

  return (
    <Dynamic
      component={tag()}
      {...rest}
      {...rootProps()}
      data-slot="icon-button"
      data-size={size()}
      data-variant={local.variant ?? 'subtle'}
      data-theme={local.theme ?? 'gray'}
      data-disabled={local.disabled ? '' : undefined}
      data-state={local.loading ? 'loading' : undefined}
      aria-busy={local.loading ? 'true' : undefined}
      aria-disabled={local.loading && !local.disabled ? 'true' : undefined}
      aria-label={local.label}
      onClick={(event: MouseEvent) => {
        if (local.loading && !local.disabled) {
          event.preventDefault()
          return
        }
        const handler = local.onClick as
          | ((event: MouseEvent) => void)
          | undefined
        handler?.(event)
      }}
      class={cn(
        button({
          variant: local.variant,
          theme: local.theme,
          size: size(),
          icon: true,
        }),
        local.loading && !local.disabled ? 'pointer-events-none' : '',
        local.class,
      )}
    >
      <Show when={local.loading} fallback={glyph()}>
        <span aria-hidden="true" class="inline-flex shrink-0">
          <Spinner size={size()} />
        </span>
      </Show>
    </Dynamic>
  )
}
