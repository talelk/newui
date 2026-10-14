---
'@newui/ui': patch
---

Two more classes the merge config mis-classified, both found by the all-pairs
sweep rather than by a bug report:

- `border-collapse` / `border-separate` matched the `border-<anything>` colour
  validator, so `cn('border-outline-gray-2', 'border-collapse')` dropped the
  colour and left the table utility standing alone. They are now declared as the
  table-layout pair they are.
- Named `tracking-*` steps (`wide`, `tight`, …) were not recognised at all, so a
  consumer's `tracking-wide` and a recipe's `tracking-[0.02em]` both survived and
  the cascade decided.

`pnpm css:check` also stopped throwing on the second one: its utility resolver
read only the function form of a validator, while the stock configuration (which
this config mirrors) also uses bare strings.
