---
'@newui/data': minor
---

`@newui/data/virtual` — the bounded list.

```tsx
<VirtualList label="Task activity" items={rows} itemSize={72} height="440px">
  {(row) => <Row row={row} />}
</VirtualList>
```

A thousand-row feed does not need a thousand nodes: this keeps about a
viewport's worth mounted and positions them. Fixed `itemSize` by design (a
virtualiser that measures every row defeats the point), a focusable scroll
region (WCAG 2.1.1, the same contract as `ScrollArea`), and `aria-posinset` /
`aria-setsize` on each row so assistive tech knows the list's real length.

It renders only the region, the list and the positioned rows — the row's
anatomy and the card around it stay with the page, as the task activity stream
shows. 20 kB gzip on its own budgeted entry.

With this, all four TanStack adapters are behind `@newui/data`: Query, Form,
Table and Virtual. The playground no longer depends on any of them directly.
