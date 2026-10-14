import { describe, expect, it } from 'vitest'
import { buildSankeyGraph, buildSankeyOption } from './sankeyOptions'
import type { ChartTokens, SankeyChartConfig } from './types'

const tokens: ChartTokens = {
  series: ['#111111', '#222222', '#333333'],
  grid: 'grid-1',
  axis: 'axis-1',
  label: 'label-1',
}

const config = (
  overrides: Partial<SankeyChartConfig> = {},
): SankeyChartConfig => ({
  data: [
    { from: 'A', to: 'B', v: 5 },
    { from: 'A', to: 'C', v: 3 },
    { from: 'B', to: 'C', v: 2 },
  ],
  sourceColumn: 'from',
  targetColumn: 'to',
  valueColumn: 'v',
  ...overrides,
})

describe('buildSankeyGraph', () => {
  it('de-duplicates the nodes and keeps every row as a link', () => {
    const graph = buildSankeyGraph(config(), { tokens })
    expect(graph.nodes.map((node) => node.name)).toEqual(['A', 'B', 'C'])
    expect(graph.links.map((link) => [link.source, link.target])).toEqual([
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'C'],
    ])
  })

  it('reads a node by the larger of what arrives and what leaves', () => {
    const graph = buildSankeyGraph(config(), { tokens })
    expect(graph.nodes.map((node) => node.value)).toEqual([8, 5, 5])
  })

  it('paints a band in its source’s color', () => {
    const graph = buildSankeyGraph(config(), { tokens })
    expect(graph.links[0]?.color).toBe(graph.nodes[0]?.color)
    expect(graph.nodes[0]?.color).toBe('#111111')
  })

  it('drops a link that closes a cycle, and one with no positive flow', () => {
    const graph = buildSankeyGraph(
      config({
        data: [
          { from: 'A', to: 'B', v: 5 },
          { from: 'B', to: 'C', v: 2 },
          { from: 'C', to: 'A', v: 1 },
          { from: 'A', to: 'C', v: -4 },
        ],
      }),
      { tokens },
    )
    expect(graph.links.map((link) => `${link.source}→${link.target}`)).toEqual([
      'A→B',
      'B→C',
    ])
  })

  it('reads an empty node as the blank marker', () => {
    const graph = buildSankeyGraph(
      config({ data: [{ from: '', to: 'B', v: 1 }] }),
      { tokens },
    )
    expect(graph.nodes[0]?.name).toBe('(Blank)')
  })
})

describe('buildSankeyOption', () => {
  it('lays the graph out as one sankey series, not draggable', () => {
    const option = buildSankeyOption(config(), { tokens }) as unknown as {
      series: {
        type: string
        orient?: string
        draggable?: boolean
        nodeAlign?: string
        data: { name: string }[]
        links: { source: string; target: string }[]
      }[]
    }
    expect(option.series[0]?.type).toBe('sankey')
    expect(option.series[0]?.orient).toBe('horizontal')
    expect(option.series[0]?.draggable).toBe(false)
    expect(option.series[0]?.nodeAlign).toBe('justify')
    expect(option.series[0]?.data).toHaveLength(3)
    expect(option.series[0]?.links).toHaveLength(3)
  })

  it('runs top to bottom when vertical', () => {
    const option = buildSankeyOption(config({ vertical: true }), {
      tokens,
    }) as unknown as { series: { orient?: string }[] }
    expect(option.series[0]?.orient).toBe('vertical')
  })
})
