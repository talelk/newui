import { NumberCard } from '@newui/charts'
export default function Demo() {
  return (
    <NumberCard
      title="Revenue"
      value={24680}
      prefix="$"
      delta={12.8}
      deltaSuffix="%"
      deltaCaption="vs last month"
    />
  )
}
