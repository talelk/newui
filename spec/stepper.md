# Stepper

Wizard progress: an ordered list inside a named navigation landmark. Markers
read done (check), current (index + `aria-current="step"`) or upcoming; the
label and optional description sit beside the marker.

`linear` (default `true`) is the wizard rule: only completed steps and the
current one are clickable, so a flow cannot be skipped. `linear={false}` turns
the stepper into a progress overview where every enabled step navigates.
Clicking a reachable step reports its `value` — rendering the matching panel
is the caller's job.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `steps` | `StepperStep[]` | — | `{ value, label, description?, disabled? }` |
| `value` | `string` | — | the current step's `value` (controlled) |
| `defaultValue` | `string` | first step | uncontrolled initial step |
| `onValueChange` | `(value: string) => void` | — | a reachable step was clicked |
| `linear` | `boolean` | `true` | future steps are not clickable |
| `label` | `string` | — | accessible name for the landmark (required) |

## Behavior and accessibility

`data-slot` hooks: `stepper`, `stepper-step`, `stepper-marker`,
`stepper-label`, `stepper-description`. The current step's marker is a status,
not a destination, so it is not clickable; a disabled step is never reachable.
Markers are buttons with a compound `aria-label` (`3. Review`), the list
reflows to a column under the horizontal breakpoint.
