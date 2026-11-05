---
'@talelk/newui-data': minor
---

The headless data layer grows the analytics primitives decided in issues #22,
#23, #24 and #32 — everything an analytics page kept writing by hand:

- **URL state.** `createUrlState(initial, { adapter? })` serializes
  controllable signals to `URLSearchParams` behind an app-supplied router
  adapter: replace-not-push, one `replace` per coalesced tick, read-once on
  mount so a shared link deep-links without a redirect, and a 300ms debounce
  for search-like keys. Without an adapter it is a plain signal, so tests and
  SSR stay clean.
- **Config store.** `createConfigStore({ key, storage?, migrate? })` stores
  saved views and dashboard configs as versioned envelopes
  (`{ v, name, type?, updatedAt, doc }`) with `list/load/save/remove/rename`
  over a storage seam — `localStorage` by default, a server adapter by
  substitution. Documents are capped at 64KB with a loud dev warning.
- **Transforms.** Pure `aggregate(rows, { by, metrics })` with the eleven
  metric names table aggregation uses, `timeBucket(date, unit)` and
  `rollup(rows, { field, unit, metric? })` for chart series — no query, no
  components, nothing that pretends to be a warehouse.
- **Refresh.** `createCollection` accepts `refetchInterval?: number | false`;
  focus-refetch stays off, the interval is the explicit dial.
- **Realtime.** `connectRealtime(queryClient, resource, { onEvent })`
  subscribes a `createRealtime` socket to the query cache — list events
  invalidate the `[doctype]` prefix, doc events exactly `[doctype, name]`.
