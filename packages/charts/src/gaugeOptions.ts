import type { EChartsCoreOption } from 'echarts/core'
import { formatValue } from './format'
import { CHART_FONT_FAMILY, chartShell, mergeDeep } from './options'
import type {
  ChartTokens,
  ChartValueFormatter,
  GaugeChartConfig,
} from './types'

// The gauge is the KPI-to-target widget: one reading against one span. The
// house dial is deliberately not a speedometer — a 1px track, a single blue
// progress arc and the reading centered in metric type. A needle, ticks and a
// saturated ring would put heavy fill under thin text, which is how a gauge
// becomes a contrast violation; so the palette is locked to tokens.

export type GaugeOptionContext = {
  tokens: ChartTokens
  /** Prints the reading in the middle. Defaults to a shortened number. */
  format?: ChartValueFormatter
}

/** The reading's size: the `metric` step, the one the KPI cards print at. */
export const METRIC_FONT_SIZE = 28

/** The progress arc's width, against the 1px track under it. */
const PROGRESS_WIDTH = 6

export function buildGaugeOption(
  config: GaugeChartConfig,
  context: GaugeOptionContext,
): EChartsCoreOption {
  const { tokens } = context
  const scale = tokens.fontScale ?? 1
  // The palette is locked: the first blue of the chart ramp for the arc, the
  // grid hairline for the track, metric ink for the reading. No palette prop.
  const progress = tokens.series[0] ?? tokens.axis
  const hasReading = config.value !== null && config.value !== undefined

  return mergeDeep(
    {
      ...chartShell(),
      series: [
        {
          type: 'gauge',
          min: config.min,
          max: config.max,
          // A 240° sweep, opening downward: the shape a dial is read as.
          startAngle: 210,
          endAngle: -30,
          radius: '86%',
          center: ['50%', '50%'],
          axisLine: {
            lineStyle: {
              width: 1,
              color: [[1, tokens.grid]],
            },
          },
          progress: {
            show: true,
            width: PROGRESS_WIDTH,
            roundCap: true,
            itemStyle: { color: progress },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          anchor: { show: false },
          title: {
            show: Boolean(config.caption),
            offsetCenter: [0, '68%'],
            color: tokens.label,
            fontSize: 12 * scale,
          },
          detail: {
            // No value tween: a number counting up is motion, and reduced
            // motion is the lifecycle's business, not the option's.
            valueAnimation: false,
            offsetCenter: [0, 0],
            fontSize: METRIC_FONT_SIZE * scale,
            fontWeight: 600,
            fontFamily: CHART_FONT_FAMILY,
            color: tokens.metric || tokens.label,
            formatter: (value: unknown) => {
              const reading = Number(value)
              if (!Number.isFinite(reading)) return ''
              return context.format
                ? context.format(reading)
                : formatValue(reading, 1, true)
            },
          },
          data: hasReading
            ? [{ value: config.value, name: config.caption ?? '' }]
            : [],
        },
      ],
    },
    config.echartOptions,
  ) as EChartsCoreOption
}
