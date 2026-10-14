import { createEffect, createSignal, onCleanup } from 'solid-js'

export type ColorScheme = 'light' | 'dark' | 'system'
export type ResolvedColorScheme = 'light' | 'dark'

export interface ColorSchemeOptions {
  /** localStorage key. Matches frappe-ui so a migrated app keeps its choice. */
  storageKey?: string
  /** Document attribute flipped between light and dark. */
  attribute?: string
}

/**
 * The light/dark axis (CONTEXT: `colorScheme`), the only writer of the
 * document's theme attribute.
 *
 * Follows frappe-ui's contract: the preference persists, `system` tracks the OS
 * live, and each swap suppresses CSS transitions for two frames so a page with
 * many transitioning surfaces does not visibly cross-fade.
 */
export function createColorScheme(options?: ColorSchemeOptions) {
  const key = options?.storageKey ?? 'theme'
  const attribute = options?.attribute ?? 'data-theme'

  const stored =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem(key) as ColorScheme | null)
      : null

  const [colorScheme, setColorSchemeSignal] = createSignal<ColorScheme>(
    stored ?? 'system',
  )
  const [resolved, setResolved] = createSignal<ResolvedColorScheme>('light')

  const media =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : undefined

  const resolve = (scheme: ColorScheme): ResolvedColorScheme =>
    scheme === 'system' ? (media?.matches ? 'dark' : 'light') : scheme

  const apply = (next: ResolvedColorScheme) => {
    setResolved(next)
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.classList.add('no-transition')
    root.setAttribute(attribute, next)
    // Two frames: one for the attribute to paint, one to re-enable transitions.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove('no-transition')),
    )
  }

  createEffect(() => apply(resolve(colorScheme())))

  if (media) {
    const onChange = () => {
      if (colorScheme() === 'system') apply(resolve('system'))
    }
    media.addEventListener('change', onChange)
    onCleanup(() => media.removeEventListener('change', onChange))
  }

  const setColorScheme = (next: ColorScheme) => {
    localStorage.setItem(key, next)
    setColorSchemeSignal(next)
  }

  return { colorScheme, resolved, setColorScheme }
}
