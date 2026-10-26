import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselStatus,
  CarouselViewport,
} from './Carousel'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

describe('Carousel accessibility', () => {
  it('has no axe violations with controls and status', async () => {
    const { container } = render(() => (
      <Carousel label="Highlights">
        <CarouselViewport>
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
          <CarouselSlide>Three</CarouselSlide>
        </CarouselViewport>
        <CarouselStatus />
        <div class="flex gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations as a bare vertical strip', async () => {
    const { container } = render(() => (
      <Carousel label="Highlights" orientation="vertical">
        <CarouselViewport>
          <CarouselSlide>One</CarouselSlide>
          <CarouselSlide>Two</CarouselSlide>
        </CarouselViewport>
      </Carousel>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
