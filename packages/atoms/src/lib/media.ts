import { type Accessor, createSignal, onCleanup } from 'solid-js'

/**
 * The breakpoint minimums, mirroring `screens` in `@talelk/newui-tokens`
 * (the single source `build-css` emits as `--breakpoint-*`). Atoms take no
 * tokens dependency, so the numbers are mirrored here and JS layout code
 * names a screen instead of spelling a pixel literal.
 */
export const screens = {
  xs: 360,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type ScreenName = keyof typeof screens

/** `(min-width: …)` for a named screen — the `lg:` variant, as a JS query. */
export function screenUp(name: ScreenName): string {
  return `(min-width: ${screens[name]}px)`
}

/** Below a named screen — the max-width complement of `screenUp`. */
export function screenDown(name: ScreenName): string {
  return `(max-width: ${screens[name] - 1}px)`
}

/**
 * A live media query.
 *
 * It starts from the query's *current* answer rather than from `false`, and it
 * falls back to `false` where `matchMedia` does not exist (SSR, a test in jsdom
 * without the polyfill) — so a component that lays itself out from this never
 * flashes the wrong frame on its first paint.
 */
export function createMediaQuery(query: string): Accessor<boolean> {
  const supported =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  const media = supported ? window.matchMedia(query) : undefined
  const [matches, setMatches] = createSignal(media?.matches ?? false)
  if (media) {
    const onChange = () => setMatches(media.matches)
    media.addEventListener('change', onChange)
    onCleanup(() => media.removeEventListener('change', onChange))
  }
  return matches
}
