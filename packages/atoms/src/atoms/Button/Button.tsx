import type { Component, JSX } from 'solid-js'
import { Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { controlGlyphSizes } from '../../lib/control-styles'
import { cn } from '../../lib/tv'
import { Spinner } from '../Spinner'
import {
  type ButtonSize,
  type ButtonTheme,
  type ButtonVariant,
  button,
} from './recipe'

type IconProp = string | Component<{ class?: string }>

export interface ButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'prefix'> {
  variant?: ButtonVariant
  theme?: ButtonTheme
  /** @default sm */
  size?: ButtonSize
  label?: string
  icon?: IconProp
  iconLeft?: IconProp
  iconRight?: IconProp
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  /** External URL, opened in a new tab. */
  href?: string
  /**
   * In-app destination (CONTEXT: `route` is in-app, `href` is external). Wins
   * over `href`. Renders an anchor with a plain `href`; pair it with `onClick`
   * to intercept the click and navigate with your router.
   */
  route?: string
  target?: string
  type?: 'button' | 'submit' | 'reset'
  class?: string
  prefix?: JSX.Element
  suffix?: JSX.Element
  children?: JSX.Element
}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    'variant',
    'theme',
    'size',
    'label',
    'icon',
    'iconLeft',
    'iconRight',
    'loading',
    'loadingText',
    'disabled',
    'href',
    'route',
    'target',
    'type',
    'class',
    'prefix',
    'suffix',
    'children',
    'aria-label',
    'onClick',
  ])

  const size = () => local.size ?? 'sm'
  const isDisabled = () => Boolean(local.disabled) || Boolean(local.loading)
  // Loading keeps the resting palette (busy is not disabled): the native
  // `disabled` attribute — and with it the recipe's disabled colours — is
  // reserved for a real `disabled`; loading blocks interaction via
  // `pointer-events-none` + `aria-busy`/`aria-disabled` instead.
  const nativeDisabled = () => Boolean(local.disabled)
  const isIconButton = () =>
    local.children === undefined && local.label === undefined
  const tag = () =>
    (local.route ?? local.href) && !isDisabled() ? 'a' : 'button'

  const classes = () =>
    cn(
      button({
        variant: local.variant,
        theme: local.theme,
        size: local.size,
        icon: isIconButton(),
      }),
      local.loading && !local.disabled ? 'pointer-events-none' : '',
      local.class,
    )

  const renderIcon = (icon: IconProp | undefined) => {
    if (!icon) return null
    if (typeof icon === 'string') {
      if (!icon.startsWith('lucide-')) return null
      return (
        <span class={cn(icon, controlGlyphSizes[size()])} aria-hidden="true" />
      )
    }
    return <Dynamic component={icon} class={controlGlyphSizes[size()]} />
  }

  const main = () => {
    if (isIconButton() && !local.loading) {
      return local.icon ? renderIcon(local.icon) : local.children
    }
    if (local.loading && local.loadingText) return local.loadingText
    return (
      <>
        <Show
          when={local.loading}
          fallback={local.prefix ?? renderIcon(local.iconLeft)}
        >
          <span aria-hidden="true" class="inline-flex shrink-0">
            <Spinner size={size()} />
          </span>
        </Show>
        <span class="min-w-0 whitespace-normal break-words leading-tighter">
          {local.children ?? local.label}
        </span>
        {local.suffix ?? renderIcon(local.iconRight)}
      </>
    )
  }

  const rootProps = () => {
    if (tag() === 'a') {
      // `route` is in-app: a real `href` with no new-tab behaviour. `onClick`
      // is where a router intercepts it.
      if (local.route) return { href: local.route }
      return {
        href: local.href,
        target: local.target ?? '_blank',
        rel: 'noreferrer noopener',
      }
    }
    return { type: local.type ?? 'button', disabled: nativeDisabled() }
  }

  const triggerProps = () => ({
    ...rootProps(),
    'data-slot': 'button',
    'data-size': size(),
    'data-variant': local.variant ?? 'subtle',
    'data-theme': local.theme ?? 'gray',
    'data-disabled': nativeDisabled() ? '' : undefined,
    // The square icon-only presentation is a distinct peer of the labelled
    // button (recipe `icon: true`, zero inline padding) — the hook says so.
    'data-icon-only': isIconButton() ? '' : undefined,
    class: classes(),
    'aria-label':
      local['aria-label'] ?? (isIconButton() ? undefined : local.label),
    'aria-busy': local.loading ? ('true' as const) : undefined,
    'aria-disabled':
      local.loading && !local.disabled ? ('true' as const) : undefined,
    // Keyboard activation still reaches a `pointer-events-none` button, so a
    // loading button swallows the click instead of firing it.
    onClick: (event: MouseEvent) => {
      if (local.loading && !local.disabled) {
        event.preventDefault()
        return
      }
      const handler = local.onClick as ((event: MouseEvent) => void) | undefined
      handler?.(event)
    },
    ...(local.loading ? { 'data-state': 'loading' } : {}),
  })

  const plainButton = () => (
    <Dynamic component={tag()} {...rest} {...triggerProps()}>
      {main()}
    </Dynamic>
  )

  return plainButton()
}
