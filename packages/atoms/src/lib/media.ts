import { type Accessor, createSignal, onCleanup } from 'solid-js'

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
