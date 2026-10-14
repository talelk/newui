import { DetailHeader } from '@newui/blocks'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <DetailHeader
      breadcrumbs={[
        { label: 'Files', route: '/files' },
        { label: 'Q3 report.pdf' },
      ]}
      title="Q3 report.pdf"
      subtitle="1.2 MB · updated 2h ago by Priya Nair"
      status={{ label: 'Shared', theme: 'blue' }}
      actions={[{ label: 'Share' }, { label: 'Download' }]}
    />
  )
}
