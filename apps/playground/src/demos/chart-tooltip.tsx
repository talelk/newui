import { ChartTooltip } from '@newui/charts'
import { Button } from '@newui/ui'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [open, setOpen] = createSignal(false)
  const [position, setPosition] = createSignal({ x: 0, y: 0 })
  return (
    <>
      <Button
        aria-expanded={open()}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          setPosition({ x: bounds.left, y: bounds.bottom + 8 })
          setOpen(!open())
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
      >
        Toggle chart readout
      </Button>
      <ChartTooltip
        open={open()}
        x={position().x}
        y={position().y}
        label="January"
        items={[
          {
            name: 'revenue',
            label: 'Revenue',
            formattedValue: '$120',
            kind: 'series',
            value: 120,
            color: 'var(--chart-1)',
          },
        ]}
      />
    </>
  )
}
