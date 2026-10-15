import { Dashboard, NumberCard } from '@newui/charts'
export default function Demo() {
  return (
    <Dashboard>
      <NumberCard title="Revenue" value={24680} />
      <NumberCard title="Customers" value={128} />
    </Dashboard>
  )
}
