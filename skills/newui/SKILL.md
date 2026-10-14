---
name: newui
description: Build user interfaces with the newui SolidJS component library (a SolidJS port of frappe-ui on Zag + Tailwind CSS v4). Use when scaffolding SolidJS pages, forms, dialogs, lists, or any UI that should look and feel like a Frappe product, when the user mentions newui, @newui/ui, or asks to use newui components, tokens, or conventions.
---

# newui

Build UIs that look and feel like Frappe products by composing **newui**
components and styling with the library's **semantic Tailwind tokens**.

## Quick start

```tsx
import { Button, Dialog, FormControl } from '@newui/ui'
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

Prop names, value types and token names live in the repo, not here. Open the file
you need before writing markup.

| Writing this | Open this first |
| --- | --- |
| any component, any page, any Tailwind class | `AGENTS.md`, `PHILOSOPHY.md`, `CONTEXT.md` |
| a specific component's API | `spec/<component>.md`, `packages/ui/api.json` |
| a component's implementation pattern | `packages/ui/src/components/<Name>/<Name>.tsx` |

## Non-negotiables

- Two colour axes only: `variant` (`solid | subtle | outline | ghost`) and
  `theme` (`gray | blue | green | amber | red`). No `intent`/`appearance`.
- No `v-model`: use `open`/`onOpenChange` or `value`/`onValueChange`.
- Every input exposes `label` / `description` / `error` / `required`.
- Semantic tokens only (`surface-*`, `ink-*`, `outline-*`) — never raw colours.
- Customise via `data-slot` / `data-state`, never class-injection props.
- Accessibility is part of done: keyboard, focus, ARIA (Zag supplies most).
