---
'@newui/data': minor
---

`@newui/data` — the logic layer, starting with the pure helpers.

The examples had already converged on four helpers and then copied each of them
per page: formatting (four `Intl` USD copies), select plumbing, one-step undo
(three copies) and downloads (the Blob/anchor/revoke dance in nine files, the
CSV quoting in two). They are one package now, headless by contract — it imports
`solid-js` and nothing from the visual packages, and no component may import it.

`format` · `usd`, `usdK`, `count`, `bytes`, `isEmail`
`select` · `optionsOf`, `first`
`undo` · `createUndo`
`download` · `downloadBlob`, `downloadText`, `csvText`, `downloadCsv`

Twenty-five example files now import `@newui/data`; the local modules are
deleted. The async shapes (repository, queries, forms, promoted table and list)
are the next slice — `spec/data.md` is the contract for what has shipped and
says why `Notice` did *not* move here: it renders, so it is a component.
