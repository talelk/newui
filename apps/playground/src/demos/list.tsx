import { Badge, List, ListCell, ListRow } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <List class="max-w-md">
      <ListRow>
        <ListCell>Draft</ListCell>
        <ListCell class="justify-end">
          <Badge theme="gray" label="12" />
        </ListCell>
      </ListRow>
      <ListRow>
        <ListCell>Paid</ListCell>
        <ListCell class="justify-end">
          <Badge theme="green" label="8" />
        </ListCell>
      </ListRow>
    </List>
  )
}
