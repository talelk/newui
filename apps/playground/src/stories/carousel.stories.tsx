import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselStatus,
  CarouselViewport,
} from '@talelk/newui-molecules'
import { For, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const METRICS = [
  {
    title: 'A clearer view',
    metric: '$128,430',
    label: 'Monthly recurring revenue',
  },
  { title: 'Built for your team', metric: '2,847', label: 'Active customers' },
  { title: 'Keep moving forward', metric: '+18.6%', label: 'Revenue growth' },
]

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <Carousel label="Workspace highlights" class="max-w-xl">
      <CarouselViewport>
        <For each={METRICS}>
          {(slide) => (
            <CarouselSlide class="flex min-h-48 flex-col justify-between rounded-card border border-outline-blue-1 bg-surface-blue-1 p-6">
              <h2 class="text-section text-ink-gray-9">{slide.title}</h2>
              <div>
                <p class="text-metric text-ink-gray-9">{slide.metric}</p>
                <p class="mt-1 text-caption text-ink-gray-7">{slide.label}</p>
              </div>
            </CarouselSlide>
          )}
        </For>
      </CarouselViewport>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <CarouselStatus class="text-caption text-ink-gray-7" />
        <div class="flex gap-2">
          <CarouselPrevious class="rounded-control border border-outline-gray-2 px-2 py-0.5 text-base hover:bg-surface-gray-2" />
          <CarouselNext class="rounded-control border border-outline-gray-2 px-2 py-0.5 text-base hover:bg-surface-gray-2" />
        </div>
      </div>
    </Carousel>
  )
}

const meta = {
  title: 'Molecules/Display/Carousel',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
