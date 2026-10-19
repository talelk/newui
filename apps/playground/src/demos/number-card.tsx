import { NumberCard } from '@newui/charts'
export default function Demo() {
  return (
    <NumberCard
      title="Revenue"
      value={24680}
      target={30000}
      prefix="$"
      delta={12.8}
      deltaSuffix="%"
      deltaCaption="from $21,880 last month"
      sparkline={{ data: [12, 15, 13, 18, 17, 21, 24] }}
    />
  )
}
