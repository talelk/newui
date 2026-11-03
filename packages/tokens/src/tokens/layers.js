/**
 * Stacking and motion scales.
 *
 * Components never hard-code a z-index or a transition duration: they name the
 * layer's role or the speed's role, and this scale owns the number. Six stacked
 * layers cover the kit — content, raised chrome, floating chrome, overlays and
 * the topmost hover layer — and the named durations cover every transition and
 * animation speed a component may use.
 */
export const zIndex = {
  raised: 10,
  floating: 20,
  overlay: 50,
  top: 100,
}

export const duration = {
  instant: '75ms',
  fast: '100ms',
  base: '150ms',
  moderate: '200ms',
  slow: '300ms',
  progress: '660ms',
}

export const easing = {
  /** The kit's standard ease-in-out curve (progress fills, drawers). */
  standard: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** Enter/disclosure: fast arrival, gentle settle (disclosure-panel, overlays). */
  out: 'cubic-bezier(0.23, 1, 0.32, 1)',
  /** Exit: slow departure, fast finish. */
  in: 'cubic-bezier(0.5, 0, 0.75, 0)',
  /** The standard curve under Tailwind's conventional name. */
  'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
}
