import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@newui/ui'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [saved, setSaved] = createSignal(false)
  return (
    <Card class="max-w-sm">
      <CardHeader>
        <CardTitle>Monthly report</CardTitle>
        <CardDescription>A clear view of September.</CardDescription>
      </CardHeader>
      <CardContent>
        <p class="text-metric">$128,430</p>
        <p class="mt-2 text-caption text-ink-gray-6">
          Revenue grew 18.6% from the previous month.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="solid" theme="blue" onClick={() => setSaved(true)}>
          {saved() ? 'Saved locally' : 'Save report'}
        </Button>
      </CardFooter>
    </Card>
  )
}
