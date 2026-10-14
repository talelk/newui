import type { EChartsCoreOption } from 'echarts/core'
import { formatValue, toNumber } from './format'
import {
  chartShell,
  DATA_LABEL_FONT_SIZE,
  mergeDeep,
  paletteColors,
} from './options'
import type {
  ChartPaletteName,
  ChartTokens,
  ChartValueFormatter,
  FunnelChartConfig,
  FunnelStage,
} from './types'

// The funnel is one echarts `funnel` series: the geometry is echarts', and the
// pure seam is the stages — coercion, percentages and the ramp — which the
// labels and the option both read, so they cannot disagree.

export type FunnelOptionContext = {
  tokens: ChartTokens
  /** Prints the value beside each stage's name. Defaults to a short number. */
  format?: ChartValueFormatter
}

const FUNNEL_PALETTE: ChartPaletteName = 'sequential'

/** A hairline between bands, so neighbouring steps do not bleed together. */
const FUNNEL_GAP = 2

const BLANK_STAGE = '(Blank)'

/**
 * The stages of a funnel, in the order the rows arrive. Rows are *not* sorted:
 * a funnel's order is its process, not its magnitude, so a stage that outgrew
 * its predecessor stays where the data put it.
 */
export function buildFunnelStages(config: FunnelChartConfig): FunnelStage[] {
  const rows = config.data ?? []
  const raw = rows
    .map((row) => {
      const name = stageName(row[config.categoryColumn])
      return {
        row,
        name,
        label: name === '' ? BLANK_STAGE : name,
        value: toNumber(row[config.valueColumn]),
      }
    })
    // A funnel counts things that got this far, and a stage that reports no
    // number did not report a zero. Dropped rather than drawn at 0, the way the
    // ring drops a slice it cannot size: the stage after it would divide by it.
    .filter(
      (
        stage,
      ): stage is {
        row: Record<string, unknown>
        name: string
        label: string
        value: number
      } => stage.value !== null && stage.value >= 0,
    )

  const first = raw[0]?.value ?? 0

  return raw.map((stage, index) => {
    const previous = index === 0 ? first : (raw[index - 1]?.value ?? first)
    return {
      index,
      name: stage.name,
      label: stage.label,
      value: stage.value,
      row: stage.row,
      percentOfFirst: share(stage.value, first),
      percentOfPrevious: share(stage.value, previous),
    }
  })
}

/**
 * The ramp the bands are painted from, first stage first. The sequential ramp
 * is reversed so the color deepens as the population narrows; a caller's own
 * list is drawn in the order it was written.
 */
export function funnelRamp(
  config: FunnelChartConfig,
  tokens: ChartTokens,
  count: number,
): string[] {
  const assigned = paletteColors(config.palette, tokens, count, FUNNEL_PALETTE)
  return (config.palette ?? FUNNEL_PALETTE) === 'sequential'
    ? assigned.slice().reverse()
    : assigned
}

export function buildFunnelOption(
  config: FunnelChartConfig,
  context: FunnelOptionContext,
): EChartsCoreOption {
  const { tokens, format } = context
  const isRTL = config.dir === 'rtl'
  const stages = buildFunnelStages(config)
  const colors = funnelRamp(config, tokens, stages.length)

  const printValue = (value: number) =>
    format ? format(value) : formatValue(value, 1, true)

  const option = {
    ...chartShell(),
    series: [
      {
        type: 'funnel',
        name: config.valueColumn,
        // The data order is the process order, so echarts must not re-sort it.
        sort: 'none',
        gap: FUNNEL_GAP,
        minSize: '0%',
        left: '5%',
        right: '5%',
        top: 4,
        bottom: 4,
        itemStyle: { borderWidth: 0 },
        emphasis: { focus: 'self' },
        label: {
          show: true,
          position: 'inside',
          // RTL reads from the other edge; the band itself cannot mirror, so
          // the label is what follows the reading direction.
          align: isRTL ? 'right' : 'left',
          color: tokens.label,
          fontSize: DATA_LABEL_FONT_SIZE,
          formatter: (params: { name?: string; value?: unknown }) =>
            `${params.name ?? ''} · ${printValue(Number(params.value ?? 0))}`,
        },
        data: stages.map((stage, index) => ({
          name: stage.label,
          value: stage.value,
          itemStyle: { color: colors[index] },
        })),
      },
    ],
  }

  return mergeDeep(option, config.echartOptions) as EChartsCoreOption
}

function share(value: number, of: number): number {
  return of > 0 ? (value / of) * 100 : 0
}

/** Identity of a stage. Empty where the category cell is. */
function stageName(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}
