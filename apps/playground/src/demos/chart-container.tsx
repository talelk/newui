import { ChartCard, ChartContainer, ChartLegend } from '@newui/charts'
import { Button } from '@newui/ui'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [state, setState] = createSignal<
    'ready' | 'loading' | 'empty' | 'error'
  >('empty')
  return (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-2">
        <Button
          aria-pressed={state() === 'ready'}
          onClick={() => setState('ready')}
        >
          Ready
        </Button>
        <Button
          aria-pressed={state() === 'loading'}
          onClick={() => setState('loading')}
        >
          Loading
        </Button>
        <Button
          aria-pressed={state() === 'empty'}
          onClick={() => setState('empty')}
        >
          Empty
        </Button>
        <Button
          aria-pressed={state() === 'error'}
          onClick={() => setState('error')}
        >
          Error
        </Button>
      </div>
      <ChartCard>
        <ChartContainer
          title="Activity"
          subtitle="Sessions per day · last 30 days"
          height={240}
          loading={state() === 'loading'}
          empty={state() === 'empty'}
          error={
            state() === 'error' ? 'The activity query timed out.' : undefined
          }
          legend={
            <ChartLegend
              items={[
                {
                  name: 'sessions',
                  label: 'Sessions',
                  color: 'var(--chart-1)',
                },
              ]}
            />
          }
        >
          <p class="grid h-full place-items-center text-sm text-ink-gray-7">
            A plot drawn by the caller sits here.
          </p>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}
