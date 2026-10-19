/**
 * The example layer's shared formatting (H3, spec/examples-refresh.md §1).
 *
 * Four near-identical `Intl.NumberFormat` USD copies lived in the data
 * modules and the kanban demo; they all read from here now. Zero
 * dependencies, so any lazy page or demo chunk can import it freely.
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
