import {
  type Accessor,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
} from 'solid-js'
import type { ChartTokens } from './types'

/** The `--chart-1…8` categorical ramp, light or dark, whichever is on the page. */
const SERIES_COUNT = 8

/** What a chart draws with before the runtime tokens have been read. */
export const EMPTY_TOKENS: ChartTokens = {
  series: [],
  grid: '',
  axis: '',
  label: '',
}

/**
 * Reads the plot-area colors back as concrete values. echarts parses colors
 * itself, so `var(--ink-gray-6)` would reach the SVG as a literal attribute with
 * no substitution — every token has to be read through `getComputedStyle` first.
 *
 * `--chart-grid` / `--chart-axis` are the semantic names; the runtime
 * properties they stand for are the outline stops, so those are the fallback
 * when a build inlines the theme instead of emitting the alias.
 */
/** The visually-hidden box, shared by every chart shell (one copy, no drift). */
export const SR_ONLY: JSX.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  'white-space': 'nowrap',
  'border-width': '0',
}

/**
 * The one card surface every chart widget sits on: the Card recipe's chrome
 * (card radius, outline-gray-1 edge, elevation-1, card-pad) mirrored as
 * runtime vars, because this package imports no component package.
 */
export const CARD_SURFACE: JSX.CSSProperties = {
  'border-width': '1px',
  'border-style': 'solid',
  'border-color': 'var(--outline-gray-1)',
  'background-color': 'var(--surface-elevation-1)',
  'border-radius': 'var(--radius-card)',
  // Dense surfaces: the compact pad is the default chart chrome.
  padding: 'var(--spacing-card-pad-compact)',
}

export function readChartTokens(el?: Element | null): ChartTokens {
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') {
    return EMPTY_TOKENS
  }
  const target =
    el ?? (typeof document !== 'undefined' ? document.documentElement : null)
  if (!target) return EMPTY_TOKENS

  const styles = getComputedStyle(target)
  const read = (name: string) => styles.getPropertyValue(name).trim()

  const series: string[] = []
  for (let index = 1; index <= SERIES_COUNT; index += 1) {
    const value = read(`--chart-${index}`)
    if (value) series.push(value)
  }

  return {
    fontScale:
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize) /
        16 || 1,
    series,
    grid: read('--chart-grid') || read('--outline-gray-1'),
    axis: read('--chart-axis') || read('--outline-gray-3'),
    label: read('--ink-gray-6') || read('--outline-gray-3'),
    metric: read('--ink-gray-9') || read('--ink-gray-7'),
  }
}

/** The steps a single-hue ramp samples from the semantic surface scale. */
const RAMP_STEPS = [2, 3, 4, 5, 6, 7, 8, 9]

/**
 * A single-hue ramp, low end first, read from the `--surface-{hue}-{2…9}`
 * steps. The surface scale re-values under `[data-theme]`, so one ramp reads
 * pale-to-saturated in light and deep-to-bright in dark without a second
 * palette — and it is tokens all the way down, which is what a chart ramp may
 * be built from.
 */
export function readPaletteRamp(hue: 'blue' | 'amber'): string[] {
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') {
    return []
  }
  const styles = getComputedStyle(document.documentElement)
  const stops: string[] = []
  for (const step of RAMP_STEPS) {
    const value = styles.getPropertyValue(`--surface-${hue}-${step}`).trim()
    if (value) stops.push(value)
  }
  return stops
}

/**
 * The chart tokens, resolved after mount and re-resolved when the color scheme
 * flips. `data-theme` on `<html>` is the single writer of light/dark (see the
 * library's `createColorScheme`), so watching that attribute is enough to keep
 * a plot in step with the page.
 *
 * Returns `EMPTY_TOKENS` until the DOM is available, which keeps the option
 * builder SSR-safe: it runs, it just carries no colors yet.
 */
export function useChartTokens(): Accessor<ChartTokens> {
  const [tokens, setTokens] = createSignal<ChartTokens>(EMPTY_TOKENS)

  onMount(() => {
    setTokens(readChartTokens())

    if (
      typeof MutationObserver === 'function' &&
      typeof document !== 'undefined'
    ) {
      const observer = new MutationObserver(() => setTokens(readChartTokens()))
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'style', 'class'],
      })
      onCleanup(() => observer.disconnect())
    }
  })

  return tokens
}
