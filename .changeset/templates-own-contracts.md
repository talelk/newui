---
"@talelk/newui-templates": patch
---

The templates package now owns the contracts `spec/kit.md` promises for it.
`AppShell` gains in-package coverage for the drawer close control, the one-`h1`
rule, footer ordering, desktop fold (uncontrolled and controlled via
`collapsed`/`onCollapsedChange`) and header actions. `AuthLayout` gains
contract tests for the aside panel, the header row, the brand order and the
layout slot, and a story showing the desktop context panel.
