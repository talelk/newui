/**
 * The widget grid's layout arithmetic — pure, JSON-shaped, no DOM.
 *
 * The document is the contract: `{ v, widgets: { [id]: { x, y, span, rows,
 * hidden? } } }`. The grid *emits* it and never stores it; persistence is the
 * app's config store (see `@talelk/newui-data`'s `createConfigStore`). Because
 * the whole geometry is materialized on every commit, the document round-trips:
 * feeding a document back in reproduces the layout exactly, and widgets that
 * are not currently rendered keep their entries untouched.
 *
 * Removed widgets keep a tombstone (`hidden: true`) so "undo remove" is one
 * flip of a flag; purge on migrate.
 */

/** One widget's geometry in the document. */
export interface WidgetGridEntry {
  /** Column index of the widget's left edge. */
  x: number
  /** Row index of the widget's top edge. */
  y: number
  /** Columns the widget spans. */
  span: number
  /** Rows the widget spans. */
  rows: number
  /** A removed widget leaves its geometry behind, hidden. */
  hidden?: boolean
}

/** The serializable layout document. */
export interface WidgetGridConfig {
  v: 1
  widgets: Record<string, WidgetGridEntry>
}

/** A widget's declared default geometry (the JSX side of the ledger). */
export interface WidgetDeclaration {
  id: string
  span: number
  rows: number
}

/** A widget placed on the grid, after config + reflow. */
export interface WidgetPlacement {
  id: string
  x: number
  y: number
  span: number
  rows: number
}

/** The current document shape. A breaking change bumps this and migrates. */
export const WIDGET_GRID_SCHEMA_VERSION = 1

/** The default column count — the 12-track dashboard grid everyone expects. */
export const WIDGET_GRID_COLUMNS = 12

/** A document with nothing in it; every widget sits at its declared default. */
export function emptyWidgetGridConfig(): WidgetGridConfig {
  return { v: 1, widgets: {} }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function integer(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.round(value) : fallback
}

/**
 * Read an unknown value (from storage, from the wire) back into a document.
 * Anything that is not a current-version document reads as empty rather than
 * half-right; every entry is clamped into the grid.
 */
export function normalizeWidgetGridConfig(value: unknown): WidgetGridConfig {
  const source = value as { v?: unknown; widgets?: unknown } | null
  if (!source || typeof source !== 'object') return emptyWidgetGridConfig()
  if (source.v !== WIDGET_GRID_SCHEMA_VERSION) return emptyWidgetGridConfig()
  const bag = source.widgets
  if (!bag || typeof bag !== 'object') return emptyWidgetGridConfig()
  const widgets: Record<string, WidgetGridEntry> = {}
  for (const [id, raw] of Object.entries(bag as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object') continue
    const entry = raw as Record<string, unknown>
    const span = Math.max(1, integer(Number(entry['span']), 1))
    const rows = Math.max(1, integer(Number(entry['rows']), 1))
    const x = Math.max(0, integer(Number(entry['x']), 0))
    const y = Math.max(0, integer(Number(entry['y']), 0))
    widgets[id] = {
      x,
      y,
      span,
      rows,
      ...(entry['hidden'] === true ? { hidden: true } : {}),
    }
  }
  return { v: WIDGET_GRID_SCHEMA_VERSION, widgets }
}

function overlaps(
  a: { x: number; y: number; span: number; rows: number },
  b: { x: number; y: number; span: number; rows: number },
): boolean {
  return (
    a.x < b.x + b.span &&
    b.x < a.x + a.span &&
    a.y < b.y + b.rows &&
    b.y < a.y + a.rows
  )
}

/**
 * Push overlapping widgets down until nothing overlaps.
 *
 * A collision is resolved by pushing the *later* widget in document order
 * down — never the earlier one. That is what makes a drop land where it
 * looks: the widget you dragged (and whatever was already below it) moves,
 * the furniture above it does not.
 */
function resolveOverlaps(placements: WidgetPlacement[]): void {
  for (let pass = 0; pass <= placements.length; pass++) {
    let moved = false
    for (let i = 1; i < placements.length; i++) {
      const item = placements[i]
      if (!item) continue
      for (let j = 0; j < i; j++) {
        const other = placements[j]
        if (other && overlaps(item, other)) {
          item.y = other.y + other.rows
          moved = true
        }
      }
    }
    if (!moved) return
  }
}

/**
 * The layout the grid renders: configured widgets at their saved geometry,
 * everything else first-fitted in document order, then pushed down until no
 * two widgets overlap. Hidden widgets are absent.
 */
export function resolveLayout(
  declared: WidgetDeclaration[],
  config: WidgetGridConfig | undefined,
  columns: number,
): WidgetPlacement[] {
  const entries = config?.widgets ?? {}
  const visible = declared.filter((widget) => !entries[widget.id]?.hidden)

  const placed: WidgetPlacement[] = []
  const autoFlow: WidgetDeclaration[] = []
  for (const widget of visible) {
    const entry = entries[widget.id]
    if (entry) {
      const span = clamp(integer(entry.span, widget.span), 1, columns)
      placed.push({
        id: widget.id,
        x: clamp(integer(entry.x, 0), 0, columns - span),
        y: Math.max(0, integer(entry.y, 0)),
        span,
        rows: Math.max(1, integer(entry.rows, widget.rows)),
      })
    } else {
      autoFlow.push(widget)
    }
  }

  // First-fit: the earliest row (then column) where the widget lands clean.
  for (const widget of autoFlow) {
    const span = clamp(widget.span, 1, columns)
    const rows = Math.max(1, widget.rows)
    let found: WidgetPlacement | undefined
    outer: for (let y = 0; y <= placed.length * rows + rows; y++) {
      for (let x = 0; x <= columns - span; x++) {
        const candidate = { id: widget.id, x, y, span, rows }
        if (!placed.some((p) => overlaps(candidate, p))) {
          found = candidate
          break outer
        }
      }
    }
    placed.push(found ?? { id: widget.id, x: 0, y: placed.length, span, rows })
  }

  resolveOverlaps(placed)
  return placed
}

/**
 * Write the resolved placements back into the document.
 *
 * Every visible widget gets a materialized entry — the document is
 * self-describing, so feeding it in reproduces the layout without re-running
 * auto-flow. Entries for widgets that are not currently rendered (and the
 * hidden tombstones) survive untouched.
 */
export function materializeWidgetGridConfig(
  placements: WidgetPlacement[],
  config: WidgetGridConfig,
): WidgetGridConfig {
  const widgets: Record<string, WidgetGridEntry> = { ...config.widgets }
  for (const placement of placements) {
    const previous = widgets[placement.id]
    widgets[placement.id] = {
      x: placement.x,
      y: placement.y,
      span: placement.span,
      rows: placement.rows,
      ...(previous?.hidden ? { hidden: true } : {}),
    }
  }
  return { v: WIDGET_GRID_SCHEMA_VERSION, widgets }
}

/**
 * Move one widget, with push-down reflow: whatever the drop lands on makes
 * way by moving down, never by overlapping. Returns a new document; the input
 * is never mutated.
 */
export function moveWidgetGrid(
  declared: WidgetDeclaration[],
  config: WidgetGridConfig,
  columns: number,
  id: string,
  target: { x: number; y: number },
): WidgetGridConfig {
  const placements = resolveLayout(declared, config, columns)
  const moved = placements.find((placement) => placement.id === id)
  if (!moved) return config
  moved.x = clamp(Math.round(target.x), 0, columns - moved.span)
  moved.y = Math.max(0, Math.round(target.y))
  for (const placement of placements) {
    if (placement.id === id) continue
    if (overlaps(placement, moved)) placement.y = moved.y + moved.rows
  }
  resolveOverlaps(placements)
  return materializeWidgetGridConfig(placements, config)
}

/**
 * Resize one widget, with the same push-down reflow. `span` clamps to the
 * grid's right edge (`columns - x`); `rows` clamps to 1.
 */
export function resizeWidgetGrid(
  declared: WidgetDeclaration[],
  config: WidgetGridConfig,
  columns: number,
  id: string,
  geometry: { span: number; rows: number },
): WidgetGridConfig {
  const placements = resolveLayout(declared, config, columns)
  const target = placements.find((placement) => placement.id === id)
  if (!target) return config
  target.span = clamp(Math.round(geometry.span), 1, columns - target.x)
  target.rows = Math.max(1, Math.round(geometry.rows))
  for (const placement of placements) {
    if (placement.id === id) continue
    if (overlaps(placement, target)) placement.y = target.y + target.rows
  }
  resolveOverlaps(placements)
  return materializeWidgetGridConfig(placements, config)
}

/**
 * Remove a widget: its geometry stays behind as a `hidden` tombstone so
 * "undo remove" is restoring one flag. A widget without an entry yet keeps
 * its current placement as the tombstone's geometry.
 */
export function removeWidgetGrid(
  declared: WidgetDeclaration[],
  config: WidgetGridConfig,
  columns: number,
  id: string,
): WidgetGridConfig {
  const widgets: Record<string, WidgetGridEntry> = { ...config.widgets }
  const existing = widgets[id]
  if (existing) {
    widgets[id] = { ...existing, hidden: true }
  } else {
    const placement = resolveLayout(declared, config, columns).find(
      (candidate) => candidate.id === id,
    )
    const declaredWidget = declared.find((widget) => widget.id === id)
    if (!placement && !declaredWidget) return config
    widgets[id] = {
      x: placement?.x ?? 0,
      y: placement?.y ?? 0,
      span: placement?.span ?? declaredWidget?.span ?? 1,
      rows: placement?.rows ?? declaredWidget?.rows ?? 1,
      hidden: true,
    }
  }
  return { v: WIDGET_GRID_SCHEMA_VERSION, widgets }
}

/** Undo a removal: flip the tombstone back, geometry and all. */
export function restoreWidgetGrid(
  config: WidgetGridConfig,
  id: string,
): WidgetGridConfig {
  const entry = config.widgets[id]
  if (!entry) return config
  return {
    v: WIDGET_GRID_SCHEMA_VERSION,
    widgets: { ...config.widgets, [id]: { ...entry, hidden: false } },
  }
}

/**
 * Reset to the defaults declared in code: every override goes, every
 * tombstone stays. A reset re-lays the dashboard out, it does not resurrect
 * widgets the user removed.
 */
export function resetWidgetGridConfig(
  config: WidgetGridConfig,
): WidgetGridConfig {
  const widgets: Record<string, WidgetGridEntry> = {}
  for (const [id, entry] of Object.entries(config.widgets)) {
    if (entry.hidden) widgets[id] = { ...entry }
  }
  return { v: WIDGET_GRID_SCHEMA_VERSION, widgets }
}
