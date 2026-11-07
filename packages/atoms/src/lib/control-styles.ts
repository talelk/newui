/**
 * Shared control foundations: the one density table, the field/state strings
 * and the overlay panel every peer control composes.
 *
 * Focus — one rule, decided here. Text-entry and popup fields ring blue
 * (`fieldFocus` / `fieldFocusWithin`). Discrete controls ring in their theme
 * where a theme axis exists (the Button recipe's focus map) and neutral
 * otherwise (`controlFocus`). An invalid control always rings red, overriding
 * both. Rings are the `focus-ring*` outline utilities only — never `ring-*`
 * box-shadows, which collide with `shadow-*` and vanish in forced-colors
 * mode. (The `ring-1` in `invalidToggle` is the persistent invalid edge on a
 * borderless toggle, not a focus ring.)
 *
 * State is selectors, never JS class swaps: `disabled:`, `data-[disabled]:`
 * and `aria-[invalid=true]:` variants own the look, so a recipe renders the
 * same string in every state.
 */
import { tv, type VariantProps } from './tv'

export type ControlSize = 'xs' | 'sm' | 'md' | 'lg'
export type FieldVariant = 'subtle' | 'outline' | 'ghost'

/** One row of the density table: every geometric fact a size name implies. */
export interface ControlDensity {
  /** Fixed field height (`fieldSizes`). */
  height: string
  /** Button minimum height — peers the field `height` in a form row. */
  minHeight: string
  /** Square box at the field height (pin cells, square icon fields). */
  square: string
  /** Field text composite at this size. */
  text: string
  /** Inline field padding with no adornment. */
  pad: string
  /** Inline field padding reserving the prefix glyph box. */
  padPrefix: string
  /** Inline field padding reserving the suffix glyph box. */
  padSuffix: string
  /** Horizontal text-button padding. */
  buttonPad: string
  /** Leading/trailing control glyph (Button/IconButton icons, field adornments). */
  glyph: string
  /** Inner mark glyph (checkbox check, spinner arc) — one step below `glyph`. */
  mark: string
  /** Gap between a control's glyph and its label. */
  gap: string
}

/**
 * The one density table. A size name means the same box everywhere: `md` is a
 * 32px field, a `min-h-8` button and a `size-4.5` glyph, so peers align in a
 * form row by construction. Values codify what the field and button families
 * already agreed on — per-atom copies of these maps are deleted in favour of
 * this table, never re-declared.
 */
export const controlDensity: Record<ControlSize, ControlDensity> = {
  xs: {
    height: 'h-6',
    minHeight: 'min-h-6',
    square: 'size-6',
    text: 'text-xs',
    pad: 'ps-1.5 pe-1.5',
    padPrefix: 'ps-7 pe-1.5',
    padSuffix: 'ps-1.5 pe-7',
    buttonPad: 'px-1.5',
    glyph: 'size-3.5',
    mark: 'size-3',
    gap: 'gap-1.5',
  },
  sm: {
    height: 'h-7',
    minHeight: 'min-h-7',
    square: 'size-7',
    text: 'text-base',
    pad: 'ps-2 pe-2',
    padPrefix: 'ps-8 pe-2',
    padSuffix: 'ps-2 pe-8',
    buttonPad: 'px-2',
    glyph: 'size-4',
    mark: 'size-3.5',
    gap: 'gap-2',
  },
  md: {
    height: 'h-8',
    minHeight: 'min-h-8',
    square: 'size-8',
    text: 'text-base',
    pad: 'ps-2.5 pe-2.5',
    padPrefix: 'ps-9 pe-2.5',
    padSuffix: 'ps-2.5 pe-9',
    buttonPad: 'px-2.5',
    glyph: 'size-4.5',
    mark: 'size-4',
    gap: 'gap-2',
  },
  lg: {
    height: 'h-10',
    minHeight: 'min-h-10',
    square: 'size-10',
    text: 'text-lg',
    pad: 'ps-3 pe-3',
    padPrefix: 'ps-10 pe-3',
    padSuffix: 'ps-3 pe-10',
    buttonPad: 'px-3',
    glyph: 'size-5',
    mark: 'size-4.5',
    gap: 'gap-2',
  },
}

/**
 * The touch-target floor every interactive peer keeps: 24px, the WCAG 2.5.8
 * (AA) minimum. Compact sizes meet it through their box; bare glyph buttons
 * add it explicitly instead of shrinking below it.
 */
export const touchTargetMin = 'min-h-6 min-w-6'

function bySize(
  pick: (row: ControlDensity) => string,
): Record<ControlSize, string> {
  return {
    xs: pick(controlDensity.xs),
    sm: pick(controlDensity.sm),
    md: pick(controlDensity.md),
    lg: pick(controlDensity.lg),
  }
}

/** Control glyph box per size — the one map Button/IconButton/fields share. */
export const controlGlyphSizes = bySize((row) => row.glyph)

/** Inner mark glyph per size (check marks, spinner arcs). */
export const markGlyphSizes = bySize((row) => row.mark)

/** Identical field geometry shared by text entry and popup-backed controls. */
export const fieldSizes = bySize(
  (row) => `${row.height} rounded-control ${row.text}`,
)

/** Square field geometry — a cell is as wide as the field is tall. */
export const squareFieldSizes = bySize(
  (row) => `${row.square} rounded-control ${row.text}`,
)

/** Field inline padding per size, with the adornment reservations. */
export const fieldPads: Record<
  ControlSize,
  { base: string; prefix: string; suffix: string }
> = {
  xs: {
    base: controlDensity.xs.pad,
    prefix: controlDensity.xs.padPrefix,
    suffix: controlDensity.xs.padSuffix,
  },
  sm: {
    base: controlDensity.sm.pad,
    prefix: controlDensity.sm.padPrefix,
    suffix: controlDensity.sm.padSuffix,
  },
  md: {
    base: controlDensity.md.pad,
    prefix: controlDensity.md.padPrefix,
    suffix: controlDensity.md.padSuffix,
  },
  lg: {
    base: controlDensity.lg.pad,
    prefix: controlDensity.lg.padPrefix,
    suffix: controlDensity.lg.padSuffix,
  },
}

/**
 * The one text-entry surface. `TextInput`, `Textarea` and `Duration` compose
 * this; no atom re-spells the variant strings.
 */
export const textFieldVariants: Record<FieldVariant, string> = {
  subtle:
    'border border-surface-gray-2 bg-surface-gray-2 placeholder:text-ink-gray-6 hover:border-outline-gray-3 hover:bg-surface-gray-3 focus:border-outline-gray-4 focus:bg-surface-base focus:shadow-sm',
  outline:
    'border border-outline-gray-2 bg-surface-base placeholder:text-ink-gray-6 hover:border-outline-gray-3 hover:shadow-sm focus:border-outline-gray-4 focus:bg-surface-base focus:shadow-sm',
  ghost: 'border-0 bg-transparent placeholder:text-ink-gray-6',
}

/** Popup controls share hover/open boundaries; text entry owns focus instead. */
export const popupFieldVariants = {
  subtle:
    'border border-surface-gray-2 bg-surface-gray-2 hover:border-outline-gray-3 hover:bg-surface-gray-3 data-[state=open]:border-outline-gray-4 data-[state=open]:bg-surface-base data-[state=open]:shadow-sm',
  outline:
    'border border-outline-gray-2 bg-surface-base hover:border-outline-gray-3 data-[state=open]:border-outline-gray-4 data-[state=open]:shadow-sm',
  ghost: 'border-0 bg-transparent',
} as const

/** Text-entry focus: the blue outline (see the focus rule in the header). */
export const fieldFocus = 'outline-none focus-visible:focus-ring-blue'

/** Wrapped-field focus, where the wrapper owns the ring (TagInput, Combobox). */
export const fieldFocusWithin = 'focus-within:focus-ring-blue'

/** Discrete-control focus with no theme axis: the neutral outline. */
export const controlFocus = 'outline-none focus-visible:focus-ring'

/**
 * Disabled text field, native `disabled` only. The surface goes quiet
 * (`surface-gray-1`, `ink-gray-6` — a pairing the contrast contract covers)
 * and every hover/focus depth cue is suppressed.
 */
export const disabledField =
  'disabled:cursor-not-allowed disabled:border-outline-gray-1 disabled:bg-surface-gray-1 disabled:text-ink-gray-6 disabled:placeholder:text-ink-gray-3 disabled:shadow-none disabled:hover:border-outline-gray-1 disabled:hover:bg-surface-gray-1 disabled:hover:shadow-none'

/** Disabled popup field (Zag stamps `data-disabled`): the same quiet surface. */
export const disabledPopup =
  'data-[disabled]:cursor-not-allowed data-[disabled]:border-outline-gray-1 data-[disabled]:bg-surface-gray-1 data-[disabled]:text-ink-gray-6 data-[disabled]:shadow-none data-[disabled]:hover:border-outline-gray-1 data-[disabled]:hover:bg-surface-gray-1 data-[disabled]:hover:shadow-none'

/**
 * Disabled toggle cursor + mark ink. Track and thumb surfaces stay
 * recipe-local (their geometry differs); the `opacity-*` dialect is not used —
 * disabled reads through ink/surface steps like every other state.
 */
export const disabledToggle =
  'disabled:cursor-not-allowed data-[disabled]:cursor-not-allowed disabled:text-ink-gray-4 data-[disabled]:text-ink-gray-4'

/** Invalid field edge (native `aria-invalid` or Zag `data-invalid`) + red focus. */
export const invalidField =
  'aria-[invalid=true]:border-outline-red-6 data-[invalid]:border-outline-red-6 aria-[invalid=true]:focus-visible:focus-ring-red data-[invalid]:focus-visible:focus-ring-red'

/** Invalid edge for a borderless toggle control + red focus. */
export const invalidToggle =
  'aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-outline-red-6 data-[invalid]:ring-1 data-[invalid]:ring-outline-red-6 aria-[invalid=true]:focus-visible:focus-ring-red data-[invalid]:focus-visible:focus-ring-red'

/**
 * The layer assignment every overlay obeys, read by positioners and hosts —
 * never by panels. Popups share the modal layer: a popup opened inside a
 * dialog (Select, Menu, pickers) must not render under its own modal, and at
 * equal z the later portal wins, so the nested popup lands on top. Toasts
 * and tooltips sit above both. `overlayPanel` deliberately carries no
 * z-index: Zag's popper copies the content's computed z-index onto the
 * positioner, so a z on the panel silently overrides the positioner's layer.
 */
export const overlayLayers = {
  popup: 'z-overlay',
  modal: 'z-overlay',
  toast: 'z-top',
  tooltip: 'z-top',
} as const

/**
 * The modal scrim. `surface-scrim` is the mode-flipping runtime var, so no
 * `dark:` variant is spelled here or at any call site.
 */
export const overlayScrim = 'fixed inset-0 z-overlay bg-surface-scrim'

/**
 * The one overlay panel: one elevation surface, one border edge, the overlay
 * radius role and a shadow role per modality, with the shared enter motion
 * (collapsed under reduced motion). `modal` pads like a dialog, `popup` like
 * a list; `enter: 'drawer'` is the bottom-sheet rise.
 */
export const overlayPanel = tv({
  base: 'rounded-overlay border border-outline-gray-1 bg-surface-elevation-1 text-ink-gray-9 focus-visible:outline-none motion-reduce:animate-none',
  variants: {
    kind: {
      modal: 'p-dialog-pad shadow-dialog',
      popup: 'p-menu-pad shadow-popover',
    },
    enter: {
      overlay: 'data-[state=open]:animate-overlay-in',
      drawer: 'data-[state=open]:animate-drawer-in',
      sheet:
        'data-[state=open]:animate-sheet-in rtl:data-[state=open]:animate-sheet-in-rtl',
      none: '',
    },
  },
  defaultVariants: { kind: 'popup', enter: 'overlay' },
})

export type OverlayPanelVariants = VariantProps<typeof overlayPanel>

/**
 * The one highlighted-row look for menus and listboxes. The checked step is
 * `ink-blue-8` — the step the contrast contract asserts on the panel and on
 * the highlighted row in both themes.
 */
export const listboxRow =
  'flex cursor-pointer items-center justify-between gap-2 rounded-control px-2 py-1 text-base text-ink-gray-8 outline-none transition-colors data-[highlighted]:bg-surface-gray-3 data-[state=checked]:text-ink-blue-8 data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4'

/** The one group label inside a menu or listbox panel. */
export const listboxLabel =
  'flex h-7 items-center px-2 text-sm-medium leading-tighter text-ink-gray-6'

/** The one separator rule inside an overlay panel. */
export const overlaySeparator = 'my-1 h-px bg-outline-elevation-1'

/**
 * The shared `<thead>` treatment — the one header row both `ScrollTable` and
 * the semantic `Table` parts compose. Shared between molecules, never
 * exported to consumers (P10: they style through the parts).
 */
export const tableHeadClass =
  'border-y border-outline-gray-1 bg-surface-gray-1 text-sm-medium font-stretch-semi-condensed text-ink-gray-6'
