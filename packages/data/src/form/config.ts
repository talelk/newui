import type { JSX } from 'solid-js'

/**
 * One entry of a config form's field map: what the engine reads, and what the
 * `ConfigForm` organism renders.
 *
 * The schema validates; the field map says how to render. A Standard Schema
 * carries zero UI information, so `createAppForm` accepts a map of static
 * field paths to these entries and reads only `when` and `dependsOn` from
 * them — everything else is renderer vocabulary, and the same object serves
 * both sides.
 *
 * `TScope` is what `when` sees first: the form's values for a top-level entry,
 * the row for a repeater's row field.
 */
export interface FieldConfig<
  TValues = Record<string, unknown>,
  TScope = TValues,
> {
  /**
   * Which control renders. The default mapping is the molecule
   * `FormControl` vocabulary (`text`, `select`, `checkbox`, `date`, …), plus
   * `repeater` for arrays of rows.
   */
  type?: string
  /** Drawn by the resolved control (P5). */
  label?: JSX.Element
  /** Helper text (P5). */
  description?: JSX.Element
  /** Error text is drawn from the field's own state, not from here. */
  placeholder?: string
  /** Marks the control required (the label's asterisk); validation is the schema's. */
  required?: boolean
  disabled?: boolean
  /** Choices for the choice controls. */
  options?: readonly { value: string; label?: string }[]
  /** Extra props handed to the resolved control. */
  props?: Record<string, unknown>
  /** Rendered instead of the `type` mapping. */
  component?: (props: FieldControlProps) => JSX.Element
  /**
   * Other field paths whose changes revalidate this field (compiled onto
   * TanStack's listeners with the `dynamic` cause). Visibility itself is
   * reactive without this — `when` reads the form's values.
   */
  dependsOn?: readonly string[]
  /**
   * Returning `false` hides the field. Unless `pruneHidden` is off, a hidden
   * field is also dropped from the submitted document — submitting a value
   * for a setting that is not shown is a lie to the backend.
   *
   * `scope` is the form's values for a top-level entry and the row for a
   * repeater's row field; `values` is always the whole form.
   */
  when?: (scope: TScope, values: TValues) => boolean
  /**
   * For `type: 'repeater'`: the row's fields, keyed by subfield name. Their
   * `when` receives the row first.
   */
  fields?: Record<string, FieldConfig<TValues, any>>
  /** For `type: 'repeater'`: the ceiling on rows. */
  maxItems?: number
}

/** The binding a custom `component` receives for one field. */
export interface FieldControlProps {
  /** The field's path in the form. */
  name: string
  value: unknown
  /** Commits the value and runs the `onChange` validators. */
  onChange: (value: unknown) => void
  /** Marks the field touched and runs the `onBlur` validators. */
  onBlur: () => void
  /** The field's error, joined to one string — the `Field` contract. */
  error?: string
  disabled?: boolean
}

/** The slice of a field-map entry the engine reads for visibility. */
interface VisibilityEntry {
  when?: (scope: any, values: any) => boolean
  fields?: Record<string, VisibilityEntry>
}

/**
 * Every path the field map currently hides.
 *
 * Top-level entries are called `when(values, values)`. A repeater's row fields
 * are expanded per row — `when(row, values)` — and reported as
 * `items[1].url`; a hidden repeater hides its rows with it, so they are not
 * expanded.
 */
export function hiddenPaths<T>(
  values: T,
  ui: Record<string, VisibilityEntry>,
): string[] {
  const hidden: string[] = []
  const walk = (
    scope: unknown,
    entries: Record<string, VisibilityEntry>,
    prefix: string,
  ) => {
    for (const [key, config] of Object.entries(entries)) {
      const path = prefix ? `${prefix}.${key}` : key
      if (config.when && !config.when(scope, values)) {
        hidden.push(path)
        continue
      }
      if (!config.fields) continue
      const rows = readPath(scope, key)
      if (!Array.isArray(rows)) continue
      rows.forEach((row, index) => {
        walk(row, config.fields ?? {}, `${path}[${index}]`)
      })
    }
  }
  walk(values, ui, '')
  return hidden
}

/**
 * Drop every hidden field from `values`. Paths may nest (`smtp.host`) and,
 * inside a repeater, address a row field (`items[1].url`) — the field leaves
 * its row, the row stays. The result is a copy, never a mutation of the
 * form's state.
 */
export function pruneHiddenValues<T extends object>(
  values: T,
  ui: Record<string, VisibilityEntry>,
): T {
  let pruned: T = values
  for (const path of hiddenPaths(values, ui)) {
    pruned = deletePath(pruned, path) as T
  }
  return pruned
}

/** True when `candidate` is the hidden path itself or lives under it. */
export function isUnderHidden(
  candidate: string,
  hidden: readonly string[],
): boolean {
  return hidden.some(
    (path) =>
      candidate === path ||
      candidate.startsWith(`${path}.`) ||
      candidate.startsWith(`${path}[`),
  )
}

function splitPath(path: string): string[] {
  return path.replace(/\[/g, '.').replace(/\]/g, '').split('.').filter(Boolean)
}

function readPath(root: unknown, path: string): unknown {
  let node = root
  for (const key of splitPath(path)) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[key]
  }
  return node
}

function deletePath(root: unknown, path: string): unknown {
  const keys = splitPath(path)
  if (keys.length === 0) return root
  const [head, ...rest] = keys as [string, ...string[]]
  if (root === null || typeof root !== 'object') return root
  if (Array.isArray(root)) {
    // A static field-map path never ends on a position: rows are not removed.
    if (rest.length === 0) return root
    const copy = [...(root as unknown[])]
    copy[Number(head)] = deletePath(copy[Number(head)], rest.join('.'))
    return copy
  }
  const copy: Record<string, unknown> = { ...(root as Record<string, unknown>) }
  if (rest.length === 0) {
    delete copy[head]
    return copy
  }
  const child = (root as Record<string, unknown>)[head]
  if (child === undefined) return root
  copy[head] = deletePath(child, rest.join('.'))
  return copy
}
