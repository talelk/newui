import { CircleCheckIcon } from '@newui/icons'
import { Icon } from '@newui/ui'
export default function Demo() {
  return (
    <div class="flex flex-wrap gap-4 text-ink-gray-6">
      <CircleCheckIcon class="size-5" />
      <Icon icon="lucide-search" class="size-5" />
      <Icon icon="lucide-chart-no-axes-combined" class="size-5" />
      <Icon icon="lucide-settings-2" class="size-5" />
      <Icon icon="lucide-check" class="size-5 text-ink-green-7" />
    </div>
  )
}
