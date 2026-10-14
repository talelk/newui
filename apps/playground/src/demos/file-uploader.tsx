import { FileUploader } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="max-w-sm">
      <FileUploader
        label="Attachments"
        description="Drop files or click to browse"
        multiple
      />
    </div>
  )
}
