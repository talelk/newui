/**
 * Select plumbing for the examples (H5, spec/examples-refresh.md §1).
 *
 * Every page turned a string list into `{ label, value }` options inline,
 * and unwrapped the single-value array the same way. Two spellings, once.
 */

export interface SelectOption {
  label: string
  value: string
}

/** `['Name', 'Size']` → `[{ label: 'Name', value: 'Name' }, …]`. */
export const optionsOf = (values: readonly string[]): SelectOption[] =>
  values.map((value) => ({ label: value, value }))

/** The chosen value, or `fallback` when the selection is empty. */
export const first = (value: string[], fallback: string): string =>
  value[0] ?? fallback
