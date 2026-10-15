import { DateRangePicker } from '@newui/ui'
export default function Demo() {
  return (
    <div class="max-w-md">
      <DateRangePicker
        label="Reporting period"
        description="Choose a start and end date."
        defaultValue={['2026-09-01', '2026-09-30']}
        clearable
      />
      <div class="mt-5">
        <DateRangePicker
          label="Required period"
          error="Choose a complete date range."
          required
        />
      </div>
    </div>
  )
}
