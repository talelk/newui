import * as zag from '@zag-js/combobox'
import {
  createMemo,
  createSignal,
  For,
  type JSX,
  Show,
  splitProps,
} from 'solid-js'
import { createControllableSignal } from '../../lib/controllable'
import { Field, useField } from '../../lib/field'
import { createId } from '../../lib/id'
import { Portal } from '../../lib/portal'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'
import { Icon, type IconProp } from '../Icon'
import { Spinner } from '../Spinner'
import type { InputSize, InputVariant } from '../TextInput'

type MultiSelectApi = ReturnType<typeof zag.connect>

export type MultiSelectSize = InputSize
export type MultiSelectVariant = InputVariant

export interface MultiSelectOption {
  label: string
  value: string
  disabled?: boolean
  /** A `lucide-*` string or component, shown before the label (P11). */
  icon?: IconProp
  /** Secondary line under the label, shown in the row. */
  description?: string
}

/** A labelled cluster of options. `hideLabel` keeps the rows but drops the heading. */
export interface MultiSelectGroup {
  group: string
  hideLabel?: boolean
  options: MultiSelectOption[]
}

export type MultiSelectOptions = Array<MultiSelectOption | MultiSelectGroup>

export interface MultiSelectProps {
  /** The selectable options, optionally grouped. Filtered client-side as the user types. */
  options: MultiSelectOptions
  /** Selected values, in selection order. */
  value?: string[]
  onValueChange?: (value: string[]) => void
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
  size?: MultiSelectSize
  variant?: MultiSelectVariant
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

const SIZE: Record<MultiSelectSize, string> = {
  xs: 'min-h-6 rounded-3 text-xs',
  sm: 'min-h-7 rounded-3 text-base',
  md: 'min-h-8 rounded-3 text-base',
  lg: 'min-h-10 rounded-3 text-lg',
}

const VARIANT: Record<MultiSelectVariant, string> = {
  subtle:
    'border border-surface-gray-2 bg-surface-gray-2 hover:border-outline-gray-3 hover:bg-surface-gray-3 data-[state=open]:border-outline-gray-4 data-[state=open]:bg-surface-base data-[state=open]:shadow-sm',
  outline:
    'border border-outline-gray-2 bg-surface-base hover:border-outline-gray-3 data-[state=open]:border-outline-gray-4 data-[state=open]:shadow-sm',
  ghost: 'border-0 bg-transparent',
}

const ROW =
  'flex cursor-pointer items-center justify-between gap-2 rounded-3 px-2 py-1.5 text-base text-ink-gray-8 outline-none transition-colors'

interface NormalizedGroup {
  key: string
  group: string
  hideLabel: boolean
  options: MultiSelectOption[]
}

function isGroup(
  option: MultiSelectOption | MultiSelectGroup,
): option is MultiSelectGroup {
  return 'group' in option
}

/** Split a flat/grouped option list into labelled groups; ungrouped runs become one hidden group. */
function normalizeGroups(options: MultiSelectOptions): NormalizedGroup[] {
  const groups: NormalizedGroup[] = []
  let pending: MultiSelectOption[] = []

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
  MultiSelectProps,
  'label' | 'description' | 'error' | 'required'
>

function MultiSelectControl(props: ControlProps): JSX.Element {
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
  const [typed, setTyped] = createSignal(false)
  const queryControlled = () => local.query !== undefined
  const hasTyped = () => typed() || (queryControlled() && query() !== '')

  const normalizedGroups = createMemo(() => normalizeGroups(local.options))
  const allOptions = createMemo(() =>
    normalizedGroups().flatMap((group) => group.options),
  )

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
      itemToValue: (item: MultiSelectOption) => item.value,
      itemToString: (item: MultiSelectOption) => item.label,
    }),
  )

  const machineId = createId('multiselect')
  const { api } = createZagApi<MultiSelectApi>(
    zag.machine,
    zag.connect,
    () => ({
      id: machineId,
      collection: collection(),
      value: local.value,
      multiple: true,
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
        local.onValueChange?.(details.value)
      },
      onInputValueChange: (details: {
        inputValue: string
        reason?: string
      }) => {
        setQuery(details.inputValue)
        setTyped(
          details.reason === 'input-change' ? details.inputValue !== '' : false,
        )
      },
      onOpenChange: (details: { open: boolean }) => {
        if (!details.open) setTyped(false)
        local.onOpenChange?.(details.open)
      },
    }),
  )

  // The machine owns the value when uncontrolled; read the selection back from
  // the connected API rather than the prop, so an uncontrolled multi-select
  // accumulates picks instead of resetting to the (absent) prop.
  const selected = () => api().value ?? []

  const bareName = () =>
    props['aria-label'] ?? local.placeholder ?? 'Select options'

  const optionByValue = (value: string) =>
    allOptions().find((option) => option.value === value)

  function remove(value: string) {
    api().setValue(selected().filter((current) => current !== value))
  }

  function selectAll() {
    api().setValue(
      allOptions()
        .filter((option) => !option.disabled)
        .map((option) => option.value),
    )
  }

  function clearAll() {
    api().setValue([])
  }

  return (
    <div
      {...api().getRootProps()}
      data-slot="multiselect"
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
        data-slot="multiselect-control"
        data-invalid={field?.hasError() ? '' : undefined}
        data-size={size()}
        data-variant={local.variant ?? 'outline'}
        class={cn(
          'flex w-full flex-wrap items-center gap-1 px-1.5 py-0.5 transition-colors',
          SIZE[size()],
          VARIANT[local.variant ?? 'outline'],
          'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-gray-2 data-[disabled]:opacity-60',
          'focus-within:focus-ring-blue data-[invalid]:border-outline-red-6',
        )}
      >
        <For each={selected()}>
          {(value) => (
            <span
              data-slot="multiselect-chip"
              class="inline-flex items-center gap-1 rounded-3 bg-surface-gray-3 px-1.5 py-0.5 text-xs text-ink-gray-8"
            >
              {optionByValue(value)?.label ?? value}
              <button
                type="button"
                disabled={local.disabled}
                aria-label={`Remove ${optionByValue(value)?.label ?? value}`}
                onClick={(event) => {
                  event.stopPropagation()
                  remove(value)
                }}
                class="grid size-3.5 place-items-center rounded-2 text-ink-gray-5 transition-colors hover:text-ink-gray-8 disabled:pointer-events-none"
              >
                <span class="lucide-x size-3" aria-hidden="true" />
              </button>
            </span>
          )}
        </For>

        <input
          {...api().getInputProps()}
          data-slot="multiselect-input"
          aria-label={field?.hasLabel() ? undefined : bareName()}
          aria-describedby={field?.describedBy()}
          aria-errormessage={field?.hasError() ? field?.errorId() : undefined}
          class="min-w-8 flex-1 bg-transparent text-inherit outline-none placeholder:text-ink-gray-6 disabled:cursor-not-allowed"
        />

        <button
          {...api().getTriggerProps()}
          data-slot="multiselect-trigger"
          aria-label="Show options"
          class={cn(
            'ms-auto grid shrink-0 place-items-center text-ink-gray-6 outline-none disabled:cursor-not-allowed',
            { xs: 'size-4', sm: 'size-5', md: 'size-6', lg: 'size-7' }[size()],
          )}
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
            data-slot="multiselect-positioner"
            class="z-50"
          >
            {/*
              The panel is presentation and the listbox owns only the rows: a
              listbox may contain options and nothing else, so the select-all
              footer lives beside the list, not inside it.
            */}
            <div class="flex max-h-60 min-w-40 flex-col rounded-6 border border-outline-gray-1 bg-surface-elevation-1 text-ink-gray-9 shadow-lg">
              <div
                {...api().getContentProps()}
                data-slot="multiselect-content"
                class="min-h-0 flex-1 overflow-y-auto p-1 focus-visible:outline-none"
              >
                <Show
                  when={!local.loading}
                  fallback={
                    <div
                      role="option"
                      aria-disabled="true"
                      data-slot="multiselect-loading"
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
                              data-slot="multiselect-group-label"
                              class="flex h-7 items-center px-2 text-sm-medium leading-tighter text-ink-gray-6"
                            >
                              {group.group}
                            </div>
                          </Show>
                          <For each={group.options}>
                            {(option) => (
                              <div
                                {...api().getItemProps({ item: option })}
                                data-slot="multiselect-item"
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
                                    {...api().getItemTextProps({
                                      item: option,
                                    })}
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

              <div
                data-slot="multiselect-footer"
                class="flex shrink-0 items-center justify-between gap-2 border-t border-outline-gray-1 px-2 py-1"
              >
                <button
                  type="button"
                  disabled={local.disabled}
                  onClick={selectAll}
                  class="rounded-3 px-1.5 py-0.5 text-xs text-ink-gray-6 transition-colors hover:bg-surface-gray-3 hover:text-ink-gray-8 disabled:pointer-events-none"
                >
                  Select all
                </button>
                <button
                  type="button"
                  disabled={local.disabled || selected().length === 0}
                  onClick={clearAll}
                  class="rounded-3 px-1.5 py-0.5 text-xs text-ink-gray-6 transition-colors hover:bg-surface-gray-3 hover:text-ink-gray-8 disabled:pointer-events-none disabled:text-ink-gray-4"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

/**
 * A multi-valued select: the same searchable popover as `Combobox`, but the
 * committed value is a `string[]` and the trigger renders each selection as a
 * removable chip — its own component, not a `multiple` flag (P8).
 *
 * Built on Zag's `combobox` with `multiple`, so keyboard/ARIA/focus come from
 * the primitive and the popover stays open on select. The labelling contract
 * (P5) is inherited the same way as `Combobox`.
 */
export function MultiSelect(props: MultiSelectProps): JSX.Element {
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
      <MultiSelectControl {...props} />
    </Field>
  )
}
