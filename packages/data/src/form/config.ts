import type { JSX } from 'solid-js'

/**
 * The config-form vocabulary: what the engine reads from a `ui` sidecar.
 *
 * The schema validates; this is the sidecar that says how to render. A
 * Standard Schema carries zero UI information, so `createAppForm` accepts a
 * map of field paths to these entries and reads only `when` and `dependsOn`
 * from them — everything else is renderer vocabulary (see the `ConfigForm`
 * organism), and the same object serves both sides.
 */
export interface FieldConfig<TValues = Record<string, unknown>> {
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
   */
  when?: (values: TValues) => boolean
  /** For `type: 'repeater'`: the row's fields, keyed by subfield name. */
  fields?: Record<string, FieldConfig<any>>
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

/** Every path the `ui` map currently hides. */
export function hiddenPaths<T>(
  values: T,
  ui: Record<string, { when?: (values: T) => boolean }>,
): string[] {
  const hidden: string[] = []
  for (const [path, config] of Object.entries(ui)) {
    if (config.when && !config.when(values)) hidden.push(path)
  }
  return hidden
}

/**
 * Drop every hidden field from `values`, keyed by the `ui` map's paths.
 * Paths may nest (`smtp.host`) and index (`items[1].title`); the result is a
 * copy, never a mutation of the form's state.
 */
export function pruneHiddenValues<T extends object>(
  values: T,
  ui: Record<string, { when?: (values: T) => boolean }>,
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

function deletePath(root: unknown, path: string): unknown {
  const keys = path
    .replace(/\[/g, '.')
    .replace(/\]/g, '')
    .split('.')
    .filter(Boolean)
  if (keys.length === 0) return root
  const [head, ...rest] = keys as [string, ...string[]]
  if (root === null || typeof root !== 'object') return root
  if (Array.isArray(root)) {
    const copy = [...(root as unknown[])]
    if (rest.length === 0) {
      const index = Number(head)
      if (!Number.isNaN(index) && index >= 0 && index < copy.length)
        copy.splice(index, 1)
      return copy
    }
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
