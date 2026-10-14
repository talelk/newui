import * as zag from '@zag-js/progress'
import { type JSX, Show, splitProps } from 'solid-js'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'

type ProgressApi = ReturnType<typeof zag.connect>

export type ProgressCircleSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Box, and the ring width as it should *look*.
 *
 * The viewBox is a fixed 32-unit square that the box scales, so a stroke width
 * is a fraction of the diameter: passing `3` straight through would draw a 3px
 * ring at `sm` and a 6.75px one at `xl`. Each step therefore converts its
 * intended on-screen width back into viewBox units, and the ring reads the same
 * weight at every size.
 */
const SIZE: Record<
  ProgressCircleSize,
  { box: string; boxPx: number; strokePx: number; text: string }
> = {
  sm: { box: 'size-8', boxPx: 32, strokePx: 3, text: 'text-2xs' },
  md: { box: 'size-10', boxPx: 40, strokePx: 4, text: 'text-xs' },
  lg: { box: 'size-14', boxPx: 56, strokePx: 5, text: 'text-sm' },
  xl: { box: 'size-18', boxPx: 72, strokePx: 6, text: 'text-base' },
}

/** An SVG unit circle scaled to the box: radius 16, centre 16. */
const RADIUS = 16
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export interface ProgressCircleProps {
  /** 0–100. `null` (with `indeterminate`) for a spinning ring. */
  value?: number
  /** A ring with no known end — spins instead of filling. */
  indeterminate?: boolean
  size?: ProgressCircleSize
  /** Content in the middle: a percentage, a count, an icon. */
  children?: JSX.Element
  'aria-label'?: string
  class?: string
}

/**
 * A determinate ring.
 *
 * The track is a full circle and the value is a dash offset on a second circle
 * of the same geometry, so the fill always starts at twelve o'clock and grows
 * clockwise — the shape a bar cannot express when it has to sit in a square (a
 * toolbar, an avatar, a card corner).
 *
 * Zag's `progress` machine supplies the `role="progressbar"` bounds and the
 * `aria-valuenow` / `aria-valuetext` wiring; the ring itself is two SVG circles,
 * which is the one part that needs no machine. The viewBox is a fixed 32-unit
 * square and the box scales it, so every size shares one geometry.
 */
export function ProgressCircle(props: ProgressCircleProps): JSX.Element {
  const [local] = splitProps(props, [
    'value',
    'indeterminate',
    'size',
    'children',
    'aria-label',
    'class',
  ])

  const size = () => SIZE[local.size ?? 'md']
  /** The ring width in viewBox units, so it lands at `strokePx` on screen. */
  const stroke = () => (size().strokePx * 32) / size().boxPx
  const clamped = () => Math.min(100, Math.max(0, local.value ?? 0))

  const { api } = createZagApi<ProgressApi>(zag.machine, zag.connect, () => ({
    id: createId('progress-circle'),
    value: local.indeterminate ? null : clamped(),
    'aria-label': local['aria-label'],
  }))

  return (
    <div
      {...api().getRootProps()}
      data-slot="progress-circle"
      data-size={local.size ?? 'md'}
      data-state={local.indeterminate ? 'indeterminate' : 'determinate'}
      class={cn(
        'relative inline-grid shrink-0 place-items-center',
        size().box,
        local.class,
      )}
    >
      {/*
        Zag hangs `role="progressbar"` and the `aria-valu*` bounds off
        `getTrackProps`, not off the root — the ring is the track.
      */}
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role="progressbar" is supplied by Zag's getTrackProps spread. */}
      <div
        {...api().getTrackProps()}
        aria-label={local['aria-label']}
        class="grid size-full place-items-center"
      >
        <svg
          viewBox="0 0 32 32"
          class="size-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            data-slot="progress-circle-track"
            cx="16"
            cy="16"
            r={RADIUS}
            fill="none"
            stroke-width={String(stroke())}
            class="stroke-surface-gray-3"
          />
          <circle
            data-slot="progress-circle-range"
            cx="16"
            cy="16"
            r={RADIUS}
            fill="none"
            stroke-width={String(stroke())}
            stroke-linecap="round"
            stroke-dasharray={String(
              local.indeterminate ? CIRCUMFERENCE * 0.28 : CIRCUMFERENCE,
            )}
            stroke-dashoffset={String(
              local.indeterminate ? 0 : CIRCUMFERENCE * (1 - clamped() / 100),
            )}
            class={cn(
              'stroke-surface-gray-10',
              // A known value glides to its new position; an unknown one spins.
              // `animate-spin` rather than an arbitrary `animate-[spin_…]`: the
              // named utility guarantees Tailwind emits the `@keyframes`.
              local.indeterminate
                ? 'animate-spin'
                : 'transition-[stroke-dashoffset] duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
            )}
          />
        </svg>
        <Show when={local.children}>
          <span
            class={cn(
              'absolute grid place-items-center font-medium text-ink-gray-8',
              size().text,
            )}
          >
            {local.children}
          </span>
        </Show>
      </div>
    </div>
  )
}
