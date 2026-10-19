import { BarChart, ChartCard } from '@newui/charts'
export default function Demo() {
  return (
    <ChartCard>
      <BarChart
        title="Revenue by channel"
        subtitle="Paid revenue · USD · last 30 days"
        data={[
          { channel: 'Organic', revenue: 120 },
          { channel: 'Referral', revenue: 86 },
          { channel: 'Ads', revenue: 64 },
        ]}
        x="channel"
        y="revenue"
        height={220}
      />
    </ChartCard>
  )
}
