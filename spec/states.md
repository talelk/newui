# States

A component is a control, a set of states, and the transitions between them.
The site's reference page shows the *default*; Storybook shows every state as a
story of its own. This page is the contract for the second half — the part that
used to live in prose, in click handlers nobody re-opened.

States are not a documentation nicety. A disabled button that looks enabled, an
input whose error message shifts the form, a dialog stranded on a loading
skeleton: each is a bug an app author inherits. The only reliable way to notice
one is to render it on its own, every time the component changes.

## The rule

Every shipped component has exactly one story file,
`apps/playground/src/stories/<name>.stories.tsx` (blocks and charts included),
and it exports:

- **`Demo`** — *not* a story (`excludeStories`). The site's inline embed, and
  the only copy of the demo. The reference page and Storybook render the same
  function.
- **`Default`** — the story a deep link opens; the same render as `Demo`.
- **one story per state** listed for that component in
  [`scripts/story-states.ts`](../scripts/story-states.ts).

`pnpm stories` enforces the rule: a shipped component with no story file, no
`Default`, or a missing required state fails, and so does `stories:check` in CI.
Adding a state means adding the row and the story in the same change.

A state the `Default` story already shows unambiguously does not need a
duplicate — Accordion's default opens its first item, so its table asks only
for `Disabled`.

## Vocabulary

The names on the right of the table are fixed; a state story is named one of
these, so the index is predictable and the harness can address a state by id
(`components-inputs-textinput--invalid`). The **export** is the contract
(`export const ReadOnly`); Storybook may display it title-cased (`Read Only`).

| state | means |
| --- | --- |
| `Default` | the component at rest, with its representative content |
| `Disabled` | the control cannot be operated, and still reads as itself |
| `Invalid` | the field carries an error; the message and styling are visible |
| `Loading` | work is in flight; the component keeps its shape |
| `Empty` | the collection or plot has no rows, and says so on purpose |
| `Error` | the data or action failed, and the surface says what happened |
| `Open` | the overlay/popup/disclosure is open as the story renders |
| `Selected` | the row/node is chosen, distinct from hover and focus |
| `ReadOnly` | the value is visible and not editable |
| `Collapsed` | the integrated sidebar folds to labelled icons |

Choose the narrowest state that matches the prop: an `error` prop is `Invalid`
on a field, `Error` on a chart or container; an `open` prop on an overlay is
`Open`, on a collapsible is `Open`.

## Writing a state story

Set only the state. Keep the label, value and content the `Default` story uses,
so the two pictures are comparable:

```tsx
export const Disabled: Story = {
  render: () => <TextInput label="Full name" placeholder="Jane Doe" disabled />,
}

export const Invalid: Story = {
  render: () => (
    <TextInput label="Email" value="nope" error="This email is invalid" />
  ),
}
```

For an overlay, extract the demo's body into a local `Example` component and
render it already open, with a live signal so Escape still closes it:

```tsx
function Example(props: { open?: boolean; onOpenChange?: (value: boolean) => void }) {
  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      {/* trigger + content, exactly as the demo renders them */}
    </Dialog.Root>
  )
}

export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)
    return <Example open={open()} onOpenChange={setOpen} />
  },
}
```

Charts take `loading` and an `error` message; `ChartContainer` also takes
`empty`. Emptiness of a chart's *data* is not a state story — the container
owns the designed empty surface.

## What gets swept

The generic checks drive **every story**, not just the default renders: design
contract (mount, 375px overflow, box metrics), coherence, role drift, text
scale, and the screenshot loop. A state story is therefore measured the day it
lands.

The escape hatch is a story tag:

```tsx
export const Broken: Story = {
  tags: ['no-sweep'],
  render: () => <div class="w-[200vw]">…</div>,
}
```

`no-sweep` removes the story from the generic sweeps only; it stays in the
index, the docs embed and the shots. Use it for a story that *demonstrates* a
defect (calibration, a documented limitation), never to silence a real
violation — the tag is visible in the story file and reviewed with it.

(Not `!sweep`: Storybook consumes `!`-prefixed tags as negations of its own
tags, so they never reach the index the sweeps read.)

## Why these states

- **Fields** always get `Disabled` and, where the API accepts an `error`,
  `Invalid`. These are the two states an app inherits without writing CSS.
- **Overlays** get `Open`: a closed trigger proves nothing about the panel.
- **Charts** get `Loading` and `Error`; the shared `ChartContainer` also gets
  `Empty`, because that is where the designed empty state lives.
- **The AppShell and navigation sidebar** get `Collapsed`, the mode the shell
  owns rather than the page.
- **Editors** get `ReadOnly`, the state that separates "visible" from
  "editable" before permissions are wired.
