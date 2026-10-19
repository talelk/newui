import { Dashboard, NumberCard } from '@newui/charts'
export default function Demo() {
  return (
    <Dashboard>
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
      <NumberCard
        title="Customers"
        value={128}
        delta={4.1}
        deltaSuffix="%"
        deltaCaption="from 123 last month"
        sparkline={{ data: [96, 104, 101, 112, 118, 121, 128], type: 'bar' }}
      />
      <NumberCard
        title="Monthly churn"
        value={2.1}
        suffix="%"
        delta={-0.4}
        deltaSuffix=" pts"
        deltaCaption="from 2.5% last month"
        negativeIsBetter
      />
    </Dashboard>
  )
}
