# ProgressCircle

`ProgressCircle` — a determinate ring: a full-circle track and a value drawn as
a dash offset on a second circle of the same geometry, so the fill always starts
at twelve o'clock and grows clockwise. Zag's `progress` machine supplies the
`role="progressbar"` bounds and the `aria-valuenow` / `aria-valuetext` wiring.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `number` | — | 0–100; clamped |
| `indeterminate` | `boolean` | `false` | spins instead of filling |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 32 / 40 / 56 / 72 px |
| `children` | `JSX.Element` | — | centred content: a percentage, a count, an icon |
| `aria-label` | `string` | — | a ring has no text of its own, so it needs one |
| `class` | `string` | — | |

## Behavior

- The viewBox is a fixed 32-unit square that the box scales, so each size
  converts its intended on-screen stroke width back into viewBox units: the ring
  reads the same weight at 32px and at 72px. Passing a stroke width straight
  through would draw a 3px ring at `sm` and a 6.75px one at `xl`.
- A known value transitions its dash offset; an unknown one uses `animate-spin`
  — the named utility, so Tailwind is guaranteed to emit the keyframes.
- Both transitions and the spin respect `prefers-reduced-motion`.

## Styling hooks

`data-slot` (`progress-circle` / `-track` / `-range`), `data-size` and
`data-state` (`determinate` / `indeterminate`) on the root.

## Not yet

No `label` / `hint` pair (the `children` slot is the hook), and no multi-step
`intervals` track — both exist on the linear `Progress`.
