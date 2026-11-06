import { type JSX, Show } from 'solid-js'
import { ChartGroupProvider } from './chartGroup'
import { CARD_SURFACE } from './tokens'
import type { ChartCardProps } from './types'

/**
 * The surface a chart sits on. It is structure, not chrome: a chart draws
 * inside this box and expects the box to clip it. `card: false` removes the
 * surface only, leaving the clipping box behind.
 *
 * The surface reads runtime custom properties, so it follows the light/dark
 * axis without a second recipe; the package ships no stylesheet.
 */
export function ChartCard(props: ChartCardProps): JSX.Element {
  const surface = () => (props.card === false ? undefined : CARD_SURFACE)

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
      {/* The card's group reaches the charts inside it through context, so
          linking a card's plots is one prop, not a prop per chart. */}
      <Show when={props.group} keyed fallback={props.children}>
        {(id) => (
          <ChartGroupProvider id={id}>{props.children}</ChartGroupProvider>
        )}
      </Show>
    </div>
  )
}
