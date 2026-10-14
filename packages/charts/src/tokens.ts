import { type Accessor, createSignal, onCleanup, onMount } from 'solid-js'
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
 * itself, so `var(--ink-gray-5)` would reach the SVG as a literal attribute with
 * no substitution — every token has to be read through `getComputedStyle` first.
 *
 * `--chart-grid` / `--chart-axis` are the semantic names; the runtime
 * properties they stand for are the outline stops, so those are the fallback
 * when a build inlines the theme instead of emitting the alias.
 */
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
    series,
    grid: read('--chart-grid') || read('--outline-gray-1'),
    axis: read('--chart-axis') || read('--outline-gray-3'),
    label: read('--ink-gray-5') || read('--outline-gray-3'),
  }
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
        attributeFilter: ['data-theme'],
      })
      onCleanup(() => observer.disconnect())
    }
  })

  return tokens
}
