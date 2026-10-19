/**
 * Shared formatting: money, counts, sizes, addresses.
 *
 * Built once at module scope — an `Intl.NumberFormat` per render is the kind of
 * cost that never shows in a profile and always shows in a list. The examples
 * had four near-identical USD copies; this is the one.
 */

const usdFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** Whole-dollar USD: `usd(128430)` → `$128,430`. */
export const usd = (value: number): string => usdFormat.format(value)

/** Compact axis form: `usdK(42500)` → `$43k`. */
export const usdK = (value: number): string => `$${Math.round(value / 1000)}k`

const countFormat = new Intl.NumberFormat('en-US')

/** Grouped integer: `count(128430)` → `128,430`. */
export const count = (value: number): string => countFormat.format(value)

/** Human file size: `bytes(2048)` → `2.0 KB`. */
export const bytes = (value: number): string =>
  value < 1024
    ? `${value} B`
    : value < 1024 * 1024
      ? `${(value / 1024).toFixed(1)} KB`
      : `${(value / (1024 * 1024)).toFixed(1)} MB`

/** The one address check every example form shares. */
export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
