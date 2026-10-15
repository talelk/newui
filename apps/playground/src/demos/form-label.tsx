import { FormLabel, TextInput } from '@newui/ui'
export default function Demo() {
  return (
    <div class="max-w-sm space-y-1.5">
      <FormLabel id="demo-workspace-name" label="Workspace name" required />
      <TextInput id="demo-workspace-name" placeholder="Acme" required />
    </div>
  )
}
