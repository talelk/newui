import type { Component, JSX } from 'solid-js'
import { Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '../../lib/tv'
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

const GLYPH_SIZE: Record<ButtonSize, string> = {
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

function Spinner(props: { size: ButtonSize }) {
  return (
    <span
      class={cn(
        GLYPH_SIZE[props.size],
        'animate-spin rounded-full border-2 border-current border-t-transparent',
      )}
      aria-hidden="true"
    />
  )
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
      return <span class={cn(icon, GLYPH_SIZE[size()])} aria-hidden="true" />
    }
    return <Dynamic component={icon} class={GLYPH_SIZE[size()]} />
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
          <Spinner size={size()} />
        </Show>
        <span class="truncate leading-tighter">
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
    return { type: local.type ?? 'button', disabled: isDisabled() }
  }

  const triggerProps = () => ({
    ...rootProps(),
    class: classes(),
    'aria-label':
      local['aria-label'] ?? (isIconButton() ? undefined : local.label),
    'aria-busy': local.loading ? ('true' as const) : undefined,
    onClick: local.onClick,
  })

  const plainButton = () => (
    <Dynamic component={tag()} {...rest} {...triggerProps()}>
      {main()}
    </Dynamic>
  )

  return plainButton()
}
