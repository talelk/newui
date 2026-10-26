import type { Component, JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '../../lib/tv'
import {
  type ButtonSize,
  type ButtonTheme,
  type ButtonVariant,
  button,
} from '../Button/recipe'

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

const GLYPH_SIZE: Record<ButtonSize, string> = {
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
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
    'href',
    'route',
    'target',
    'type',
    'class',
  ])

  const size = () => local.size ?? 'sm'
  const tag = () => ((local.route ?? local.href) ? 'a' : 'button')

  const glyph = () => {
    const icon = local.icon
    if (!icon) return null
    if (typeof icon === 'string') {
      if (!icon.startsWith('lucide-')) return null
      return <span class={cn(icon, GLYPH_SIZE[size()])} aria-hidden="true" />
    }
    return <Dynamic component={icon} class={GLYPH_SIZE[size()]} />
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
    return { type: local.type ?? 'button', disabled: local.disabled }
  }

  return (
    <Dynamic
      component={tag()}
      {...rest}
      {...rootProps()}
      data-slot="icon-button"
      data-size={size()}
      data-variant={local.variant ?? 'subtle'}
      data-color={local.theme ?? 'gray'}
      data-disabled={local.disabled ? '' : undefined}
      aria-label={local.label}
      class={cn(
        button({
          variant: local.variant,
          theme: local.theme,
          size: size(),
          icon: true,
        }),
        local.class,
      )}
    >
      {glyph()}
    </Dynamic>
  )
}
