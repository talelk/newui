# FileUploader

`FileUploader` — a drag-and-drop file picker. Drop files on the zone, or
click/Enter it to open the native picker. Chosen files are validated (type,
size, count), then listed with their size and a remove button. Built on Zag's
`file-upload` machine (drag state, keyboard, ARIA and the hidden input come from
the primitive).

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `File \| File[] \| null` | `null` | controlled accepted files |
| `onValueChange` | `(value: File \| File[] \| null) => void` | — | fires on select/remove |
| `accept` | `string \| string[]` | — | MIME type/pattern or list (`'image/*'`, `['.pdf']`) |
| `multiple` | `boolean` | `false` | allow more than one file |
| `maxFiles` | `number` | `1`, or unlimited with `multiple` | maximum accepted files |
| `maxFileSize` | `number` | — | maximum size of one file, in bytes |
| `transformFiles` | `(files: File[]) => Promise<File[]>` | — | async map before accept; drives the progress bar |
| `disabled` | `boolean` | `false` | |
| `name` | `string` | — | form field name on the hidden input |
| `id` | `string` | — | base for the field/control ids |
| `label` / `description` / `error` / `required` | — | — | shared labelling contract (P5) |
| `aria-label` | `string` | — | accessible name when no visible `label` |
| `class` | `string` | — | merged into the root |

## Behavior

- Picking: clicking or pressing Enter/Space on the dropzone opens the native
  picker. Dropping files onto it selects them; while a drag is over the zone the
  dropzone is marked `data-dragging`.
- Validation: files that fail the type, size or count checks are rejected and
  listed with a reason (`Invalid file type`, `File is too large`, …). Accepted
  files render as a list item with name, formatted size and a remove button.
- Value: `value` + `onValueChange` are the whole state contract (P2). A single
  control emits a `File` (or `null`); with `multiple` it emits a `File[]`.
- Processing: while `transformFiles` is pending the machine's `transforming`
  flag is set and an indeterminate progress bar shows.
- Keyboard/ARIA come from Zag: the dropzone is `role="button"` with
  `tabindex="0"`; the machine owns the visually-hidden `type="file"` input.

## Labelling (P5)

With any of `label`/`description`/`error`/`required`, `Field` renders them and
the machine's hidden input takes `Field`'s control id, so the label's `for`
opens the picker and the dropzone is named by the label (`aria-labelledby`) and
described by the description/error (`aria-describedby`). Bare, the dropzone
falls back to `aria-label`, else `"Upload a file"`.

## Styling hooks

`data-slot` (`file-uploader` / `file-uploader-dropzone` / `file-uploader-list` /
`file-uploader-item` / `file-uploader-item-name` / `file-uploader-item-size` /
`file-uploader-delete` / `file-uploader-rejected` / `file-uploader-rejected-item`
/ `file-uploader-rejected-reason` / `file-uploader-progress`), plus Zag's
`data-dragging`, `data-disabled`, `data-readonly` and `data-invalid`.

`FileUploader` selects files; it does not upload them. A server-backed upload is
the consumer's `onValueChange` (or a separate component), not a flag here (P8).
