import { DateTimePicker } from '@newui/ui'
export default function Demo() {
  return (
    <div class="max-w-sm">
      <DateTimePicker
        label="Schedule report"
        description="Reports are generated at this local date and time."
        defaultValue="2026-09-30T09:00"
        clearable
      />
    </div>
  )
}
