import type { JSX } from 'solid-js'
import { Show, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'

export type LinkTheme = 'gray' | 'blue'
export type LinkUnderline = 'none' | 'hover' | 'always'

export interface LinkProps {
  /** External URL, opened in a new tab. */
  href?: string
  /**
   * In-app destination (CONTEXT: `route` is in-app, `href` is external). Wins
   * over `href`. Renders a plain `href`; pair it with `onClick` to intercept
   * the click and navigate with your router.
   */
  route?: string
  /** @default blue */
  theme?: LinkTheme
  /** @default hover */
  underline?: LinkUnderline
  /** Draw the external-link glyph after the content (external `href` only). */
  showExternalIcon?: boolean
  class?: string
  children: JSX.Element
}

const THEME: Record<LinkTheme, string> = {
  gray: 'text-ink-gray-7 hover:text-ink-gray-9',
  blue: 'text-ink-blue-link hover:text-ink-blue-8',
}

const UNDERLINE: Record<LinkUnderline, string> = {
  none: 'no-underline hover:no-underline',
  hover: 'no-underline hover:underline',
  always: 'underline',
}

/**
 * A text link inside prose or chrome. `route` stays in the app (a plain
 * `href` a router can intercept); `href` leaves it, opening a new tab with a
 * visible glyph when `showExternalIcon` is set and an announcement to
 * assistive tech either way.
 */
export function Link(props: LinkProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'href',
    'route',
    'theme',
    'underline',
    'showExternalIcon',
    'class',
    'children',
  ])

  const external = () => Boolean(local.href) && !local.route

  return (
    <a
      {...rest}
      data-slot="link"
      data-theme={local.theme ?? 'blue'}
      data-underline={local.underline ?? 'hover'}
      href={local.route ?? local.href}
      {...(external()
        ? { target: '_blank' as const, rel: 'noreferrer noopener' }
        : {})}
      class={cn(
        'inline-flex max-w-full items-center gap-1 rounded-2 transition-colors',
        THEME[local.theme ?? 'blue'],
        UNDERLINE[local.underline ?? 'hover'],
        local.class,
      )}
    >
      <span class="min-w-0 truncate">{local.children}</span>
      <Show when={external() && local.showExternalIcon}>
        <span
          aria-hidden="true"
          class="lucide-external-link size-3.5 shrink-0"
        />
      </Show>
      <Show when={external()}>
        <span class="sr-only">(opens in a new tab)</span>
      </Show>
    </a>
  )
}
