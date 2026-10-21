# KeyboardShortcut

`KeyboardShortcut` — draws a key combination as `<kbd>` glyphs.
`KeyboardShortcutsDialog` — a `Dialog` that lists shortcuts in groups, with
search.

## KeyboardShortcut

### Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `combo` | `string` | — | e.g. `"Mod+Shift+K"` |
| `bg` | `boolean` | `false` | draw each part as a filled chip |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | glyph size |
| `useIcons` | `boolean` | `true` | draw arrow/Enter/Backspace/Delete keys as icons |
| `showPlus` | `boolean \| 'auto'` | `'auto'` | `+` between keys; `auto` = only between two text keys (plain mode) |
| `altCombos` | `string[]` | `[]` | equivalent combos, drawn after a `/` |
| `class` | `string` | — | merged into the root (P10) |
| `children` | `JSX.Element` | — | fallback shown when there is no `combo` |

### Combo grammar

A combo is `Mod+Ctrl+Meta+Shift+Alt+<Key>`, modifiers in any order and the key
last. `Mod` draws `⌘` on macOS and `Ctrl` elsewhere; `Ctrl` is Control on every
platform. `Mod` and `Ctrl` collapse into one chip off macOS, where they name the
same key.

Key names mirror a `keydown` event: letters and named keys by name (`K`,
`Escape`, `ArrowUp`, `F5`), digits and punctuation by the physical key
(`Digit1` → `1`, `Slash` → `/`, `BracketLeft` → `[`). An unknown token renders
as written.

### Structure

The root is a `<span data-slot="keyboard-shortcut">`. Each part is a
`<kbd data-slot="key" data-key-type="…">`; plain mode puts a
`<span data-slot="separator">+</span>` between parts. `altCombos` renders a
`<span data-slot="alt-combos">` after a `/`.

Modifier glyphs (⌘/⇧/⌥) are drawn as lucide icons in plain mode; `useIcons`
extends that to the arrow, Enter, Backspace and Delete keys. `showPlus="auto"`
(the default) omits the `+` whenever either side is an icon, so `⌘K` and `⇧F2`
read as one chord while `Ctrl+K` stays separated.

### Accessibility

With a `combo`, the root is a labelled `role="img"` that spells the whole
sequence (e.g. `"Shortcut Control + Shift + K"`). That role replaces everything
inside it, so a screen reader reads each key once. Without a `combo`, the root
has no role and the fallback content reads normally.

### Exports

`KeyboardShortcut`, `parseCombo`, `displayText`, `spellOut`, `isMacPlatform`,
`keyboardShortcut`, `keyboardShortcutKey`, and the types `KeyboardShortcutProps`,
`KeyboardShortcutSize`, `ShortcutPart`, `ShortcutPartType`.

`parseCombo(combo, isMac?)` splits a combo into `ShortcutPart[]`; `isMac`
defaults to the browser platform.

## KeyboardShortcutsDialog

### Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `open` | `boolean` | — | controlled |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `shortcuts` | `KeyboardShortcutEntry[]` | — | the rows, in order |
| `title` | `string` | `"Keyboard Shortcuts"` | |
| `searchThreshold` | `number` | `20` | search shows above this row count |
| `class` | `string` | — | merged into the dialog content |

`KeyboardShortcutEntry` is `{ group?, label?, description?, combo, altCombos? }`.
`label` names a row; `description` adds the supporting line.
Rows without a `group` fall under `General`.

### Behavior

The dialog reuses the `Dialog` compound (`Root`/`Content`/`Header`/`Title`), so
focus trapping, Escape and the backdrop are Dialog's — not reimplemented.

Rows are grouped by `group`, preserving order. Search appears once the row count
passes `searchThreshold` and matches the label, the raw combo, and the drawn
text (so `Mod+Slash` matches both `slash` and `/`). The query clears on every
close. Empty states: no shortcuts at all, and no search results.
