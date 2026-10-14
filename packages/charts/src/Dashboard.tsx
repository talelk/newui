import type { JSX } from 'solid-js'
import type { DashboardProps } from './types'

/**
 * A dashboard: a grid that tiles charts. Each chart draws its own title,
 * subtitle, legend and states and fills the box it is given, so the dashboard
 * only sets the grid. Left without `columns`, the tiles wrap to fit the width.
 */
export function Dashboard(props: DashboardProps): JSX.Element {
  const template = () =>
    props.columns
      ? `repeat(${Math.max(1, props.columns)}, minmax(0, 1fr))`
      : 'repeat(auto-fit, minmax(260px, 1fr))'
  const gap = () =>
    typeof props.gap === 'number' ? `${props.gap}px` : (props.gap ?? '1rem')

  return (
    <div
      data-slot="dashboard"
      class={props.class}
      style={{
        display: 'grid',
        'grid-template-columns': template(),
        gap: gap(),
        'align-items': 'stretch',
      }}
    >
      {props.children}
    </div>
  )
}
