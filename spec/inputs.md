# Inputs — the labelling contract

Every control that holds a value the user enters, selects or toggles exposes the
same four props with identical semantics (P5):

| prop | type | notes |
| --- | --- | --- |
| `label` | `JSX.Element` | rendered by `Field` |
| `description` | `JSX.Element` | `aria-describedby` |
| `error` | `JSX.Element \| false` | non-empty ⇒ invalid; `aria-errormessage` |
| `required` | `boolean` | visible `*` + `sr-only (required)` |

## Implementation

`Field` (`packages/ui/src/lib/field.tsx`) owns the wiring: it generates the
control id, label id, description id and error id, and exposes them through
context so a control reads `useField()` rather than re-deriving ids.

- Text entry uses `<label for={controlId}>`. Native checkbox/switch labels and
  group labels stay inline; Field still owns ids, supporting text and errors.
  Their required markers reuse the same internal FieldLabelContent helper.
- `required` renders `*` (aria-hidden) plus `<span class="sr-only">(required)</span>`.
- The error region has `role="alert"` and is linked via `aria-errormessage`.
- If both description and error are present, `aria-describedby` lists both.

Controls opt in by reading `useField()` for `controlId`/`describedBy`; atoms
that put their own root in the DOM (Zag parts) apply those ids to the
appropriate element.

Not an input (P5 does not apply): icon-only buttons, action toggles.

## Analytics defaults

TextInput, Textarea, Select, Combobox, MultiSelect, Duration and date/time entry
use size sm (28px) and variant outline by default. Explicit md (32px) and subtle retain
the previous density and filled surface. Select's Field label targets the
visible trigger; description and error are linked to that trigger. Both input
adornments reserve space independently, including in RTL. Focus and invalid
states remain visible on each surface. See visual-system.md.
