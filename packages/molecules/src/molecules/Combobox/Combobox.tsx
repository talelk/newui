import type { InputSize, InputVariant } from '@newui/atoms'
import { Icon, type IconProp, Spinner } from '@newui/atoms'
import {
  cn,
  createControllableSignal,
  createId,
  createZagApi,
  Field,
  fieldSizes,
  Portal,
  popupFieldVariants,
  useField,
} from '@newui/atoms/internal'
import * as zag from '@zag-js/combobox'
import {
  createMemo,
  createSignal,
  For,
  type JSX,
  Show,
  splitProps,
} from 'solid-js'

type ComboboxApi = ReturnType<typeof zag.connect>

export type ComboboxSize = InputSize
export type ComboboxVariant = InputVariant

export interface ComboboxOption {
  label: string
  value: string
  disabled?: boolean
  /** A `lucide-*` string or component, shown before the label (P11). */
  icon?: IconProp
  /** Secondary line under the label, shown in the row. */
  description?: string
}

/** A labelled cluster of options. `hideLabel` keeps the rows but drops the heading. */
export interface ComboboxGroup {
  group: string
  hideLabel?: boolean
  options: ComboboxOption[]
}

export type ComboboxOptions = Array<ComboboxOption | ComboboxGroup>

export interface ComboboxProps {
  /** The selectable options, optionally grouped. Filtered client-side as the user types. */
  options: ComboboxOptions
  /** Committed value; `null` when nothing is selected. */
  value?: string | null
  onValueChange?: (value: string | null) => void
  /** Controlled popover visibility. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  /** Copy shown when the filter matches nothing. */
  emptyText?: string
  disabled?: boolean
  name?: string
  id?: string
  /** @default sm */
  size?: ComboboxSize
  variant?: ComboboxVariant
  /** Replaces the results with a loading row while a fetch is in flight. */
  loading?: boolean
  /**
   * Client-side substring filtering as the user types. Defaults to `true`.
   * Set `false` when the options come from a server search.
   */
  filterable?: boolean
  /** Optional outside-in search query. Omit to let the component own it. */
  query?: string
  /** Fires on every query change, controlled or not. */
  onQueryChange?: (query: string) => void
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

const ROW =
  'flex cursor-pointer items-center justify-between gap-2 rounded-3 px-2 py-1.5 text-base text-ink-gray-8 outline-none transition-colors'

interface NormalizedGroup {
  key: string
  group: string
  hideLabel: boolean
  options: ComboboxOption[]
}

function isGroup(
  option: ComboboxOption | ComboboxGroup,
): option is ComboboxGroup {
  return 'group' in option
}

/** Split a flat/grouped option list into labelled groups; ungrouped runs become one hidden group. */
function normalizeGroups(options: ComboboxOptions): NormalizedGroup[] {
  const groups: NormalizedGroup[] = []
  let pending: ComboboxOption[] = []

  const flush = () => {
    if (!pending.length) return
    groups.push({
      key: `__ungrouped__${groups.length}`,
      group: '',
      hideLabel: true,
      options: pending,
    })
    pending = []
  }

  for (const [index, option] of options.entries()) {
    if (isGroup(option)) {
      flush()
      if (!option.options.length) continue
      groups.push({
        key: `group-${index}`,
        group: option.group,
        hideLabel: Boolean(option.hideLabel),
        options: option.options,
      })
      continue
    }
    pending.push(option)
  }

  flush()
  return groups
}

type ControlProps = Omit<
  ComboboxProps,
  'label' | 'description' | 'error' | 'required'
>

function ComboboxControl(props: ControlProps): JSX.Element {
  const [local] = splitProps(props, [
    'options',
    'value',
    'onValueChange',
    'open',
    'defaultOpen',
    'onOpenChange',
    'placeholder',
    'emptyText',
    'disabled',
    'name',
    'id',
    'size',
    'variant',
    'loading',
    'filterable',
    'query',
    'onQueryChange',
    'class',
  ])

  const field = useField()
  const size = () => local.size ?? 'sm'
  const filterable = () => local.filterable ?? true

  const [query, setQuery] = createControllableSignal<string>({
    value: () => local.query,
    defaultValue: '',
    onChange: (value) => local.onQueryChange?.(value),
  })
  // Filtering only once the user types; a committed label is not a query.
  const [typed, setTyped] = createSignal(false)
  // A consumer-supplied query is an active filter from the start.
  const queryControlled = () => local.query !== undefined
  const hasTyped = () => typed() || (queryControlled() && query() !== '')

  const normalizedGroups = createMemo(() => normalizeGroups(local.options))

  const filteredGroups = createMemo(() => {
    const needle = query().toLowerCase()
    const active = filterable() && hasTyped() && needle !== ''
    return normalizedGroups()
      .map((group) => ({
        ...group,
        options: active
          ? group.options.filter((option) =>
              option.label.toLowerCase().includes(needle),
            )
          : group.options,
      }))
      .filter((group) => group.options.length > 0)
  })

  const filtered = createMemo(() =>
    filteredGroups().flatMap((group) => group.options),
  )

  const collection = createMemo(() =>
    zag.collection({
      items: filtered(),
      itemToValue: (item: ComboboxOption) => item.value,
      itemToString: (item: ComboboxOption) => item.label,
    }),
  )

  const machineId = createId('combobox')
  const { api } = createZagApi<ComboboxApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    collection: collection(),
    value: local.value == null ? undefined : [local.value],
    inputValue: local.query,
    open: local.open,
    defaultOpen: local.defaultOpen,
    disabled: local.disabled,
    name: local.name,
    placeholder: local.placeholder,
    required: field?.required(),
    invalid: field?.hasError(),
    openOnClick: true,
    ids: field
      ? { input: field.controlId(), label: field.labelId() }
      : undefined,
    positioning: { placement: 'bottom-start', gutter: 4, sameWidth: true },
    onValueChange: (details: { value: string[] }) => {
      setTyped(false)
      local.onValueChange?.(details.value[0] ?? null)
    },
    onInputValueChange: (details: { inputValue: string; reason?: string }) => {
      setQuery(details.inputValue)
      setTyped(
        details.reason === 'input-change' ? details.inputValue !== '' : false,
      )
    },
    onOpenChange: (details: { open: boolean }) => {
      if (!details.open) setTyped(false)
      local.onOpenChange?.(details.open)
    },
  }))

  // Bare usage still needs to name the listbox: render a visually-hidden label
  // wired by the machine. With labelling props, `Field` owns the label and the
  // machine's ids point at it instead.
  const bareName = () =>
    props['aria-label'] ?? local.placeholder ?? 'Select an option'

  return (
    <div
      {...api().getRootProps()}
      data-slot="combobox"
      class={cn('flex w-full flex-col gap-1', local.class)}
    >
      <Show when={!field}>
        <label
          {...api().getLabelProps()}
          for={api().getLabelProps()['htmlFor']}
          class="sr-only"
        >
          {bareName()}
        </label>
      </Show>

      <div
        {...api().getControlProps()}
        data-slot="combobox-control"
        data-invalid={field?.hasError() ? '' : undefined}
        data-size={size()}
        data-variant={local.variant ?? 'outline'}
        class={cn(
          'relative flex w-full items-center transition-colors',
          fieldSizes[size()],
          popupFieldVariants[local.variant ?? 'outline'],
          'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-gray-2 data-[disabled]:opacity-60',
          'focus-within:focus-ring-blue data-[invalid]:border-outline-red-6',
        )}
      >
        <input
          {...api().getInputProps()}
          data-slot="combobox-input"
          aria-label={field?.hasLabel() ? undefined : bareName()}
          aria-describedby={field?.describedBy()}
          aria-errormessage={field?.hasError() ? field?.errorId() : undefined}
          class={cn(
            'h-full w-full min-w-0 bg-transparent px-2 text-inherit outline-none',
            'placeholder:text-ink-gray-6 disabled:cursor-not-allowed',
          )}
        />
        <button
          {...api().getTriggerProps()}
          data-slot="combobox-trigger"
          aria-label="Show options"
          class="grid size-6 shrink-0 place-items-center pe-2 text-ink-gray-6 outline-none disabled:cursor-not-allowed"
        >
          <span
            class="lucide-chevron-down size-4 transition-transform data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </button>
      </div>

      <Show when={api().open}>
        <Portal>
          <div
            {...api().getPositionerProps()}
            data-slot="combobox-positioner"
            class="z-50"
          >
            <div
              {...api().getContentProps()}
              data-slot="combobox-content"
              class="max-h-60 min-w-40 overflow-y-auto rounded-6 border border-outline-gray-1 bg-surface-elevation-1 p-1 text-ink-gray-9 shadow-lg focus-visible:outline-none"
            >
              <Show
                when={!local.loading}
                fallback={
                  <div
                    role="option"
                    aria-disabled="true"
                    data-slot="combobox-loading"
                    class="flex items-center gap-2 px-2 py-1.5 text-base text-ink-gray-6"
                  >
                    <span aria-hidden="true">
                      <Spinner class="size-4" />
                    </span>
                    <span>Loading...</span>
                  </div>
                }
              >
                <Show
                  when={filtered().length > 0}
                  fallback={
                    <div
                      role="option"
                      aria-disabled="true"
                      class="px-2 py-4 text-center text-sm text-ink-gray-6"
                    >
                      {local.emptyText ?? 'No results'}
                    </div>
                  }
                >
                  <For each={filteredGroups()}>
                    {(group) => (
                      <>
                        <Show when={group.group && !group.hideLabel}>
                          <div
                            data-slot="combobox-group-label"
                            class="flex h-7 items-center px-2 text-sm-medium leading-tighter text-ink-gray-6"
                          >
                            {group.group}
                          </div>
                        </Show>
                        <For each={group.options}>
                          {(option) => (
                            <div
                              {...api().getItemProps({ item: option })}
                              data-slot="combobox-item"
                              class={cn(
                                ROW,
                                'data-[highlighted]:bg-surface-gray-3',
                                'data-[state=checked]:text-ink-blue-6',
                                'data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4',
                              )}
                            >
                              <span class="flex min-w-0 flex-1 items-center gap-2">
                                <Show when={option.icon}>
                                  {(icon) => (
                                    <Icon
                                      icon={icon()}
                                      class="size-4 shrink-0 text-ink-gray-6"
                                    />
                                  )}
                                </Show>
                                <span
                                  {...api().getItemTextProps({ item: option })}
                                  class="min-w-0"
                                >
                                  <span class="block truncate">
                                    {option.label}
                                  </span>
                                  <Show when={option.description}>
                                    <span class="block truncate text-p-sm text-ink-gray-6">
                                      {option.description}
                                    </span>
                                  </Show>
                                </span>
                              </span>
                              <span
                                {...api().getItemIndicatorProps({
                                  item: option,
                                })}
                                class="text-ink-blue-6"
                              >
                                <svg
                                  viewBox="0 0 12 12"
                                  class="size-3"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M2 6.5 4.5 9 10 3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>
                          )}
                        </For>
                      </>
                    )}
                  </For>
                </Show>
              </Show>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

/**
 * A searchable single select. The trigger is a text input the user types into;
 * the option list filters client-side by substring. Built on Zag's `combobox`
 * machine, so keyboard navigation, ARIA and focus come from the primitive.
 *
 * The shared labelling contract (P5) is inherited: with any of
 * `label`/`description`/`error`/`required` present, `Field` renders them and
 * the machine's ids point at `Field`'s label so both the input and the listbox
 * are named.
 */
export function Combobox(props: ComboboxProps): JSX.Element {
  const [local] = splitProps(props, [
    'label',
    'description',
    'error',
    'required',
  ])
  return (
    <Field
      id={props.id}
      label={local.label}
      description={local.description}
      error={local.error}
      required={local.required}
      disabled={props.disabled}
    >
      <ComboboxControl {...props} />
    </Field>
  )
}
