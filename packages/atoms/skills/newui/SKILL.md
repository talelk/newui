---
name: newui
description: Build user interfaces with the newui SolidJS component library (a
  SolidJS port of frappe-ui on Zag + Tailwind CSS v4). Use when scaffolding
  SolidJS pages, forms, dialogs, lists, or any UI that should look and feel like
  a Frappe product, when the user mentions newui, @newui/atoms, or asks to use
  newui components, tokens, or conventions.
metadata:
  type: core
  domain: ui
  library: '@newui/atoms'
  library_version: '0.1.0'
sources:
  - talelk/newui:AGENTS.md
  - talelk/newui:PHILOSOPHY.md
  - talelk/newui:CONTEXT.md
  - talelk/newui:skills/README.md
  - talelk/newui:spec/adr/0001-solid-no-v-model.md
  - talelk/newui:spec/inputs.md
  - talelk/newui:packages/atoms/src/atoms/Button/Button.tsx
  - talelk/newui:packages/atoms/src/lib/field.tsx
  - talelk/newui:packages/atoms/src/lib/color-scheme.ts
  - talelk/newui:packages/molecules/src/molecules/Dialog/Dialog.tsx
  - talelk/newui:packages/molecules/src/molecules/Combobox/Combobox.tsx
  - talelk/newui:packages/molecules/src/molecules/MultiSelect/MultiSelect.tsx
  - talelk/newui:packages/tailwind/src/style.css
---

# newui

Build UIs that look and feel like Frappe products by composing **newui**
components and styling with the library's **semantic Tailwind tokens**.

## Quick start

```tsx no-check
import { Button } from '@newui/atoms'
import { Dialog, FormControl } from '@newui/molecules'
import { createSignal } from 'solid-js'

export function CreateTask() {
  const [open, setOpen] = createSignal(false)
  const [name, setName] = createSignal('')

  return (
    <div class="bg-surface-base p-4 text-ink-gray-8">
      <Button variant="solid" theme="gray" onClick={() => setOpen(true)}>
        New Task
      </Button>
      <Dialog.Root open={open()} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Title>Create Task</Dialog.Title>
          <FormControl
            label="Title"
            required
            value={name()}
            onValueChange={setName}
          />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}
```

## Where to look

Prop names, value types and token names live in the installed packages, not
here. Open the file you need before writing markup.

| Writing this | Open this first |
| --- | --- |
| an atom's implementation and props | `node_modules/@newui/atoms/src/atoms/<Name>/<Name>.tsx` |
| a molecule's implementation and props | `node_modules/@newui/molecules/src/molecules/<Name>/<Name>.tsx` |
| an organism or template pattern | `node_modules/@newui/organisms/src/organisms/` or `node_modules/@newui/templates/src/templates/` |
| semantic tokens and utilities | `node_modules/@newui/tailwind/src/style.css` |
| collections, mutations and forms | load the `newui-data` skill from `@newui/data` |

## Non-negotiables

- Two colour axes only: `variant` (`solid | subtle | outline | ghost`) and
  `theme` (`gray | blue | green | amber | red`). No `intent`/`appearance`.
- No `v-model`: use `open`/`onOpenChange` or `value`/`onValueChange`.
- Every input exposes `label` / `description` / `error` / `required`.
- Semantic tokens only (`surface-*`, `ink-*`, `outline-*`) — never raw colours.
- Customise via `data-slot` / `data-state`, never class-injection props.
- Accessibility is part of done: keyboard, focus, ARIA (Zag supplies most).
