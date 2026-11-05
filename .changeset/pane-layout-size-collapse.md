---
'@talelk/newui-templates': minor
---

`PaneLayout` grows into multi-panel layouts — the decision from issue #26, with
ADR-0013's three templates intact:

- **Controllable size.** `size`/`onSizeChange` (percent, the shared
  `createControllableSignal` pattern) plus `defaultSize`; `startSize` stays as a
  deprecated alias. Nothing is stored in the layout — "remember this split" is
  one config-store line in the app, which keeps SSR and tests clean.
- **Collapse.** `collapsible?: 'start' | 'end' | 'both'` with
  `collapsed`/`defaultCollapsed`/`onCollapseChange`, persisted like size.
  `Enter`/`Space` on the divider folds the nearer pane and unfolds it again;
  arrows, `Home`/`End` and a drag across the edge unfold, and the split returns
  to the remembered size. A folded pane leaves the accessibility tree, the
  divider moves to the edge with widened bounds, and collapsing the detail pane
  is the single-pane state below `compactAt`.
- **Three panes by composition.** A `PaneLayout` inside either pane gives a
  three-panel workspace with independent separators — no fourth template, the
  `ThreePaneWorkspace` story is the recipe.
