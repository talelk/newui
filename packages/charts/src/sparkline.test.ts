import { describe, expect, it } from 'vitest'
import {
  sparklineAreaPath,
  sparklineBars,
  sparklineLinePath,
  sparklinePoints,
} from './sparkline'

describe('sparklinePoints', () => {
  it('spans the box edge to edge, largest at the top', () => {
    const points = sparklinePoints([0, 10], {
      width: 100,
      height: 100,
      inset: 0,
    })
    expect(points).toEqual([
      { x: 0, y: 100 },
      { x: 100, y: 0 },
    ])
  })

  it('drops gaps rather than plotting them as zero', () => {
    const points = sparklinePoints([1, null, 3, undefined, 5], {
      width: 100,
      height: 100,
      inset: 0,
    })
    expect(points.map((p) => p.x)).toEqual([0, 50, 100])
  })

  it('draws a flat line down the middle when there is nothing to compare', () => {
    expect(
      sparklinePoints([5, 5], { width: 100, height: 100, inset: 0 }),
    ).toEqual([
      { x: 0, y: 50 },
      { x: 100, y: 50 },
    ])
    expect(sparklinePoints([], {})).toEqual([])
  })
})

describe('sparkline paths', () => {
  it('writes a move then lines', () => {
    expect(
      sparklineLinePath([
        { x: 0, y: 10 },
        { x: 50, y: 0 },
        { x: 100, y: 10 },
      ]),
    ).toBe('M0,10 L50,0 L100,10')
    expect(sparklineLinePath([])).toBe('')
  })

  it('closes the area against the bottom of the box', () => {
    expect(
      sparklineAreaPath(
        [
          { x: 0, y: 10 },
          { x: 100, y: 10 },
        ],
        100,
      ),
    ).toBe('M0,10 L100,10 L100,100 L0,100 Z')
  })
})

describe('sparklineBars', () => {
  it('stands every bar on the bottom edge, tallest at the top', () => {
    const bars = sparklineBars([0, 10], {
      width: 100,
      height: 100,
      inset: 0,
      minHeight: 0,
      gapRatio: 0,
    })
    expect(bars).toEqual([
      { x: 0, y: 100, width: 50, height: 0 },
      { x: 50, y: 0, width: 50, height: 100 },
    ])
  })

  it('has nothing to draw without readings', () => {
    expect(sparklineBars([null, undefined], {})).toEqual([])
  })
})
