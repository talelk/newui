# ScrollTable

A labelled horizontal scroll region for wide semantic tables.

## Usage

```tsx
import { ScrollTable, TABLE_HEAD_CLASS } from '@talelk/newui-molecules'

<ScrollTable label="Cashflow ledger">
  <table>
    <thead class={TABLE_HEAD_CLASS}>...</thead>
    <tbody>...</tbody>
  </table>
</ScrollTable>
```

## Props

| prop | type | notes |
| --- | --- | --- |
| `label` | `string` | accessible name of the scroll region |
| `children` | `JSX.Element` | semantic table content |

## Behavior

- The horizontal region is keyboard focusable and labelled, so users can reach
  columns outside the viewport.
- The component owns no table engine, data state or sorting behavior.
