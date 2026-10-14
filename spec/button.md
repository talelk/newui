# Button

`Button` — an action control. Not an input; P5 does not apply.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `variant` | `solid \| subtle \| outline \| ghost` | `subtle` | |
| `theme` | `gray \| blue \| green \| red` | `gray` | |
| `size` | `xs \| sm \| md \| lg` | `sm` | |
| `label` | `string` | — | text label |
| `icon` | `string \| Component` | — | icon-only form when no label/children |
| `iconLeft` / `iconRight` | `string \| Component` | — | adornments (string = `lucide-*`) |
| `loading` | `boolean` | `false` | disables + spinner; keeps the resting look |
| `href` | `string` | — | renders an `<a>` (new tab) |
| `route` | `string` | — | in-app destination; wins over `href`; renders an `<a>` with no `target` |
| `disabled` | `boolean` | `false` | |
| `prefix` / `suffix` | `JSX.Element` | — | full-control adornment override |
| `class` | `string` | — | merged last via `cn()` |

## Behavior

- Without `label`/`children`, renders the icon-only square form.
- `loading` sets `aria-busy` and `disabled`, and adds `pointer-events-none`
  while keeping the resting colour (an explicit `disabled` dims instead).
- The pressed look is driven by `data-state` (`open`/`active`), so a Button
  used as a menu trigger holds the pressed look with no JS.
- `aria-label` falls back to `label`; icon-only buttons must supply one.
- `route` renders an anchor with a plain `href` (no new tab) and no `rel`;
  pair it with `onClick` to intercept the click and navigate with your router
  (CONTEXT: `route` = in-app, `href` = external).
- **No `tooltip` prop** (a deliberate non-mirror of frappe-ui): wrapping the
  button in the `Tooltip` family would statically pull `@zag-js/tooltip` into
  every `Button` import — 9 → 32 kB gzip. Compose `<Tooltip>` around a button
  where you need one; the `Button` stays machine-free.

## Styling hooks

`data-slot` is not set (single root). State is read from `:disabled` and
`[data-state]`.
