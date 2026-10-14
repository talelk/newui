import { Breadcrumbs } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', route: '/' },
        { label: 'Projects', route: '/projects' },
        { label: 'Website' },
      ]}
    />
  )
}
