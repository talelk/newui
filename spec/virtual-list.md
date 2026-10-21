# VirtualList

A fixed-row list that keeps a bounded number of records in the DOM.

## Usage

```tsx
import { VirtualList } from '@talelk/newui-organisms'

<VirtualList label="Task activity" items={rows} itemSize={72} height="440px">
  {(row) => <ActivityRow row={row} />}
</VirtualList>
```

The list owns virtualization and positioning. The page owns the row anatomy and
the card or section around it.

## Props

| prop | type | notes |
| --- | --- | --- |
| `items` | `readonly T[]` | source records |
| `label` | `string` | accessible name of the scroll region |
| `itemSize` | `number` | fixed row height in pixels |
| `height` | `string` | viewport height; defaults to `24rem` |
| `overscan` | `number` | rows rendered beyond the viewport; defaults to `6` |
| `children` | `(item: T, index: number) => JSX.Element` | row content |

## Behavior and accessibility

- Fixed `itemSize` means the virtualizer positions following rows without
  measuring every row.
- The scroll region is keyboard reachable; `Home`, `End` and arrow keys scroll
  it natively after focus.
- Each mounted row declares `aria-posinset` and `aria-setsize`, so assistive
  technology receives the full list position/size while the DOM stays bounded.
- The root is `data-slot="virtual-list"`.
