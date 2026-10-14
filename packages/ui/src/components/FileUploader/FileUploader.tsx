import * as zag from '@zag-js/file-upload'
import { For, type JSX, Show, splitProps } from 'solid-js'
import { Field, useField } from '../../lib/field'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'
import { Progress } from '../Progress'

type FileUploadApi = ReturnType<typeof zag.connect>

/**
 * The accepted files. A single `File` when the control is single-valued, a
 * `File[]` when `multiple`, and `null` when nothing is selected.
 */
export type FileUploaderValue = File | File[] | null

export interface FileUploaderProps {
  /** Controlled accepted files. Emitted back through `onValueChange`. */
  value?: FileUploaderValue
  onValueChange?: (value: FileUploaderValue) => void
  /**
   * Accepted types, as a MIME type/pattern or a list. Examples: `'image/*'`,
   * `'.pdf'`, `['image/png', 'image/jpeg']`. Passed to the native input.
   */
  accept?: string | string[]
  /** Allow more than one file at a time. */
  multiple?: boolean
  /**
   * Maximum number of accepted files. Defaults to `1`, or unlimited when
   * `multiple` is set.
   */
  maxFiles?: number
  /** Maximum size of a single file, in bytes. */
  maxFileSize?: number
  /**
   * Optional async hook that maps the selected files before they are accepted
   * (Zag's `transformFiles`). While it runs, `transforming` is true and the
   * progress bar is shown.
   */
  transformFiles?: (files: File[]) => Promise<File[]>
  disabled?: boolean
  /** Form field name carried by the hidden file input. */
  name?: string
  id?: string
  /** Shared labelling contract (P5). */
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  /** Accessible name when no visible `label` is rendered. */
  'aria-label'?: string
  /** Merged into the root. */
  class?: string
}

const ERROR_TEXT: Record<string, string> = {
  TOO_MANY_FILES: 'Too many files',
  FILE_INVALID_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File is too large',
  FILE_TOO_SMALL: 'File is too small',
  FILE_INVALID: 'Invalid file',
  FILE_EXISTS: 'File already added',
}

function rejectionText(errors: zag.FileError[]): string {
  return errors.map((error) => ERROR_TEXT[error] ?? error).join(', ')
}

const ITEM_CLASS =
  'flex items-center gap-2 rounded-4 border border-outline-gray-2 bg-surface-base px-2 py-1.5 text-base text-ink-gray-8'

const DELETE_CLASS =
  'grid size-5 shrink-0 place-items-center rounded-3 text-ink-gray-6 outline-none transition-colors hover:bg-surface-gray-3 hover:text-ink-gray-8 focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-ink-gray-4'

type ControlProps = Omit<
  FileUploaderProps,
  'label' | 'description' | 'error' | 'required'
>

function FileUploaderControl(props: ControlProps): JSX.Element {
  const [local] = splitProps(props, [
    'value',
    'onValueChange',
    'accept',
    'multiple',
    'maxFiles',
    'maxFileSize',
    'transformFiles',
    'disabled',
    'name',
    'id',
    'aria-label',
    'class',
  ])

  const field = useField()

  // Zag derives `multiple` from `maxFiles > 1`, so an unbounded multi-select
  // passes `Infinity` rather than leaving the machine's default of 1.
  const maxFiles = () =>
    local.maxFiles ?? (local.multiple ? Number.POSITIVE_INFINITY : 1)

  const valueAsFiles = () => {
    const value = local.value
    if (value == null) return undefined
    return Array.isArray(value) ? value : [value]
  }

  const emit = (files: File[]) => {
    local.onValueChange?.(local.multiple ? files : (files[0] ?? null))
  }

  const { api } = createZagApi<FileUploadApi>(zag.machine, zag.connect, () => ({
    id: createId('file-uploader'),
    accept: local.accept,
    acceptedFiles: valueAsFiles(),
    maxFiles: maxFiles(),
    maxFileSize: local.maxFileSize,
    disabled: local.disabled,
    name: local.name,
    required: field?.required(),
    invalid: field?.hasError(),
    transformFiles: local.transformFiles,
    ids: field
      ? { hiddenInput: field.controlId(), label: field.labelId() }
      : undefined,
    translations: { dropzone: local['aria-label'] ?? 'Upload a file' },
    onFileAccept: (details: { files: File[] }) => emit(details.files),
  }))

  const hint = () => {
    if (!local.multiple) return null
    const limit = local.maxFiles
    if (limit == null || !Number.isFinite(limit)) return null
    return `Up to ${limit} files`
  }

  return (
    <div
      {...api().getRootProps()}
      data-slot="file-uploader"
      class={cn('flex w-full flex-col gap-2', local.class)}
    >
      <input {...api().getHiddenInputProps()} />

      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role="button" is supplied by Zag's getDropzoneProps spread. */}
      <div
        {...api().getDropzoneProps()}
        aria-labelledby={field ? field.labelId() : undefined}
        aria-describedby={field?.describedBy()}
        data-slot="file-uploader-dropzone"
        class={cn(
          'flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-5 border border-dashed border-outline-gray-2 bg-surface-gray-1 px-4 py-6 text-center transition-colors',
          'hover:border-outline-gray-3 hover:bg-surface-gray-2',
          'data-[dragging]:border-outline-blue-4 data-[dragging]:bg-surface-blue-2',
          'data-[invalid]:border-outline-red-2',
          'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60 data-[disabled]:hover:border-outline-gray-2 data-[disabled]:hover:bg-surface-gray-1',
          'focus-visible:focus-ring',
        )}
      >
        <span class="lucide-upload size-5 text-ink-gray-6" aria-hidden="true" />
        <span class="text-base text-ink-gray-8">
          {local.multiple
            ? 'Drag and drop files here, or click to browse'
            : 'Drag and drop a file here, or click to browse'}
        </span>
        <Show when={hint()}>
          <span class="text-p-sm text-ink-gray-5">{hint()}</span>
        </Show>
      </div>

      <Show when={api().transforming}>
        <div data-slot="file-uploader-progress">
          <Progress indeterminate aria-label="Processing files" />
        </div>
      </Show>

      <Show when={api().acceptedFiles.length > 0}>
        <ul
          {...api().getItemGroupProps()}
          data-slot="file-uploader-list"
          class="flex flex-col gap-1"
        >
          <For each={api().acceptedFiles}>
            {(file) => (
              <li
                {...api().getItemProps({ file })}
                data-slot="file-uploader-item"
                class={ITEM_CLASS}
              >
                <span
                  class="lucide-file size-4 shrink-0 text-ink-gray-5"
                  aria-hidden="true"
                />
                <span
                  {...api().getItemNameProps({ file })}
                  data-slot="file-uploader-item-name"
                  class="min-w-0 flex-1 truncate"
                >
                  {file.name}
                </span>
                <span
                  {...api().getItemSizeTextProps({ file })}
                  data-slot="file-uploader-item-size"
                  class="shrink-0 text-p-sm text-ink-gray-5"
                >
                  {api().getFileSize(file)}
                </span>
                <button
                  {...api().getItemDeleteTriggerProps({ file })}
                  data-slot="file-uploader-delete"
                  class={DELETE_CLASS}
                >
                  <span class="lucide-x size-3.5" aria-hidden="true" />
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <Show when={api().rejectedFiles.length > 0}>
        <ul
          {...api().getItemGroupProps({ type: 'rejected' })}
          data-slot="file-uploader-rejected"
          class="flex flex-col gap-1"
        >
          <For each={api().rejectedFiles}>
            {(rejection) => (
              <li
                {...api().getItemProps({
                  file: rejection.file,
                  type: 'rejected',
                })}
                data-slot="file-uploader-rejected-item"
                class="flex items-center gap-2 rounded-4 border border-outline-red-2 bg-surface-red-2 px-2 py-1.5 text-base text-ink-red-7"
              >
                <span
                  {...api().getItemNameProps({
                    file: rejection.file,
                    type: 'rejected',
                  })}
                  class="min-w-0 flex-1 truncate"
                >
                  {rejection.file.name}
                </span>
                <span
                  data-slot="file-uploader-rejected-reason"
                  class="shrink-0 text-p-sm"
                >
                  {rejectionText(rejection.errors)}
                </span>
                <button
                  {...api().getItemDeleteTriggerProps({
                    file: rejection.file,
                    type: 'rejected',
                  })}
                  data-slot="file-uploader-delete"
                  class={DELETE_CLASS}
                >
                  <span class="lucide-x size-3.5" aria-hidden="true" />
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}

/**
 * A drag-and-drop file picker. Drop files on the zone or click/Enter it to open
 * the native picker; the chosen files are validated (type, size, count) and
 * listed, each with its size and a remove button. Built on Zag's `file-upload`
 * machine, so drag state, keyboard and ARIA come from the primitive.
 *
 * It is an input-like control (P2/P5): the value is `File | File[] | null` and
 * travels through `value` + `onValueChange`; when any of
 * `label`/`description`/`error`/`required` is present the shared `Field` renders
 * them and names the dropzone.
 */
export function FileUploader(props: FileUploaderProps): JSX.Element {
  const [local] = splitProps(props, [
    'label',
    'description',
    'error',
    'required',
  ])
  const hasLabeling = () =>
    Boolean(local.label || local.description || local.error || local.required)

  return (
    <Show when={hasLabeling()} fallback={<FileUploaderControl {...props} />}>
      <Field
        id={props.id}
        label={local.label}
        description={local.description}
        error={local.error}
        required={local.required}
        disabled={props.disabled}
      >
        <FileUploaderControl {...props} />
      </Field>
    </Show>
  )
}
