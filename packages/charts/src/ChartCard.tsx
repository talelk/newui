import type { JSX } from 'solid-js'
import type { ChartCardProps } from './types'

/**
 * The surface a chart sits on. It is structure, not chrome: a chart draws
 * inside this box and expects the box to clip it. `card: false` removes the
 * surface only, leaving the clipping box behind.
 *
 * The surface reads runtime custom properties, so it follows the light/dark
 * axis without a second recipe; the package ships no stylesheet.
 */
const SURFACE: JSX.CSSProperties = {
  'border-width': '1px',
  'border-style': 'solid',
  'border-color': 'var(--outline-gray-1)',
  'background-color': 'var(--surface-elevation-1)',
  'border-radius': '10px',
  padding: '16px',
}

export function ChartCard(props: ChartCardProps): JSX.Element {
  const surface = () => (props.card === false ? undefined : SURFACE)

  return (
    <div
      data-slot="chart-card"
      dir={props.dir}
      class={props.class}
      style={{
        position: 'relative',
        width: '100%',
        'min-width': '0',
        overflow: 'hidden',
        ...surface(),
      }}
    >
      {props.children}
    </div>
  )
}
