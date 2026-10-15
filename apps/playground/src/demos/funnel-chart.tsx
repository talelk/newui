import { FunnelChart } from '@newui/charts'
import { Button } from '@newui/ui'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [loading, setLoading] = createSignal(false)
  const [empty, setEmpty] = createSignal(false)
  const [error, setError] = createSignal(false)
  return (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-2">
        <Button aria-pressed={empty()} onClick={() => setEmpty(!empty())}>
          Toggle empty
        </Button>
        <Button aria-pressed={loading()} onClick={() => setLoading(!loading())}>
          Toggle loading
        </Button>
        <Button aria-pressed={error()} onClick={() => setError(!error())}>
          Toggle error
        </Button>
      </div>
      <FunnelChart
        title="Monthly activity"
        data={
          empty()
            ? []
            : [
                { name: 'Visits', value: 100 },
                { name: 'Trials', value: 60 },
                { name: 'Paid', value: 24 },
              ]
        }
        category="name"
        value="value"
        loading={loading()}
        error={error() ? 'Could not load activity.' : undefined}
      />
    </div>
  )
}
