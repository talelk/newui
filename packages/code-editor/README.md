# @talelk/newui-code-editor

A [CodeMirror 6](https://codemirror.net/) code editor as a Solid component.
Framework-agnostic, themed with the newui semantic tokens so it follows the
light/dark `colorScheme` axis with no reconfiguration.

## Install

```sh
pnpm add @talelk/newui-code-editor solid-js
```

## Usage

```tsx
import { CodeEditor } from '@talelk/newui-code-editor'
import { createSignal } from 'solid-js'

function Query() {
  const [sql, setSql] = createSignal('SELECT 1')

  return (
    <CodeEditor
      value={sql()}
      onValueChange={setSql}
      language="sql"
      placeholder="SELECT 1"
      aria-label="SQL query"
    />
  )
}
```

Uncontrolled works too, with `defaultValue` in place of `value`:

```tsx
<CodeEditor defaultValue={'{\n  "ok": true\n}'} language="json" readonly />
```

## Props

| Prop            | Type                                                             | Default        |
| --------------- | ---------------------------------------------------------------- | -------------- |
| `value`         | `string`                                                         | —              |
| `defaultValue`  | `string`                                                         | `''`           |
| `onValueChange` | `(value: string) => void`                                        | —              |
| `language`      | `'javascript' \| 'typescript' \| 'json' \| 'html' \| 'css' \| 'python' \| 'sql' \| 'markdown'` | plain text |
| `readonly`      | `boolean`                                                        | `false`        |
| `placeholder`   | `string`                                                         | —              |
| `aria-label`    | `string`                                                         | `'Code editor'` |
| `class`         | `string`                                                         | —              |

`value` + `onValueChange` is the two-way contract (P2); the editor is
uncontrolled when `value` is omitted. The view is created in `onMount` and
destroyed in `onCleanup`, so nothing outlives the component.

## Styling

The editor is styled with the runtime custom properties (`--surface-*`,
`--ink-*`, `--outline-*`). Override them on the editor or any ancestor to retune
it; no component change is needed and dark mode flips automatically.

## Grammar loading

Language grammars load on demand. The editor initially accepts plain text while
its selected grammar arrives. Changing language reconfigures a compartment and
preserves the document, selection and undo history. A later language selection
supersedes an earlier pending import; unmounting prevents delayed writes. A
failed grammar download leaves plain-text editing available.
