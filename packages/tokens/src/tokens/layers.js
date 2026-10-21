/**
 * Stacking and motion scales.
 *
 * Components never hard-code a z-index or a transition duration: they name the
 * layer's role or the speed's role, and this scale owns the number. Six stacked
 * layers cover the kit — content, raised chrome, floating chrome, overlays and
 * the topmost hover layer — and three durations cover transition speeds.
 */
export const zIndex = {
  raised: 10,
  floating: 20,
  overlay: 50,
  top: 100,
}

export const duration = {
  fast: '100ms',
  base: '150ms',
  slow: '300ms',
}

export const easing = {
  /** The kit's standard ease-in-out curve (progress fills, drawers). */
  standard: 'cubic-bezier(0.65, 0, 0.35, 1)',
}
