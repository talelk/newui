import type { InputSize, InputVariant } from '@talelk/newui-atoms'
import {
  cn,
  createControllableSignal,
  createDisclosure,
  createId,
  createZagApi,
  Field,
  fieldSizes,
  Portal,
  popupFieldVariants,
  useField,
} from '@talelk/newui-atoms/internal'
import * as zag from '@zag-js/popover'
import {
  createMemo,
  createSignal,
  For,
  type JSX,
  Show,
  splitProps,
} from 'solid-js'
import {
  baseValue,
  generateTimeOptions,
  isOutOfRange,
  minutesFromHHMM,
  normalize24,
  parseFlexibleTime,
  type TimeOption,
} from './utils'

type TimePickerApi = ReturnType<typeof zag.connect>

export type TimePickerSize = InputSize
export type TimePickerVariant = InputVariant

export interface TimePickerOption {
  /** Canonical time value; flexible forms are normalized to `HH:mm`. */
  value: string
  /** Display label; defaults to the value. */
  label?: string
}

export interface TimePickerProps {
  /** Controlled value, canonical `HH:mm` (or `HH:mm:ss`). `null` clears it. */
  value?: string | null
  /** Uncontrolled initial value. */
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** Minute interval between generated options. Default: `15`. */
  interval?: number
  /** Caller-provided options; bypasses the generated grid. */
  options?: TimePickerOption[]
  /** Minimum selectable time as `HH:mm[:ss]`. */
  min?: string
  /** Maximum selectable time as `HH:mm[:ss]`. */
  max?: string
  placeholder?: string
  variant?: TimePickerVariant
  /** @default sm */
  size?: TimePickerSize
  /** Whether the input accepts typed times. Default: `true`. */
  typeable?: boolean
  /** Keeps the popover open after a time is selected. */
  keepOpen?: boolean
  disabled?: boolean
  /** Controlled popover visibility. */
  open?: boolean
  /** Uncontrolled initial popover visibility. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Opens the popover when the input receives focus. Default: `false`. */
  openOnFocus?: boolean
  /** Opens the popover when the input is clicked. Default: `true`. */
  openOnClick?: boolean
  /** Form field name. */
  name?: string
  /** `id` of the rendered input. */
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

const OPTION =
  'flex h-7 w-full cursor-pointer items-center rounded-4 px-2 text-left leading-tighter tabular-nums outline-none text-ink-gray-6 hover:bg-surface-gray-2 hover:text-ink-gray-8 data-[highlighted]:bg-surface-gray-3 data-[highlighted]:text-ink-gray-8 data-[selected]:bg-surface-gray-3 data-[selected]:text-ink-gray-8'

type ControlProps = Omit<
  TimePickerProps,
  'label' | 'description' | 'error' | 'required'
>

function TimePickerControl(props: ControlProps): JSX.Element {
  const [local] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'interval',
    'options',
    'min',
    'max',
    'placeholder',
    'variant',
    'size',
    'typeable',
    'keepOpen',
    'disabled',
    'open',
    'defaultOpen',
    'onOpenChange',
    'openOnFocus',
    'openOnClick',
    'name',
    'id',
    'class',
  ])

  const field = useField()
  const size = () => local.size ?? 'sm'
  const isTypeable = () => local.typeable !== false

  let inputEl: HTMLInputElement | undefined

  const panelId = createId('time-picker-listbox')
  const optionId = (index: number) => `${panelId}-option-${index}`

  const [open, setOpen] = createDisclosure({
    value: () => local.open,
    defaultOpen: local.defaultOpen,
    onChange: (value) => local.onOpenChange?.(value),
  })

  const [value, setValue] = createControllableSignal<string>({
    value: () =>
      local.value === undefined ? undefined : normalize24(local.value ?? ''),
    defaultValue: normalize24(local.defaultValue ?? ''),
    onChange: (next) => local.onValueChange?.(next === '' ? null : next),
  })

  const [highlight, setHighlight] = createSignal(-1)
  // Typed text while the user edits; `null` means "mirror the committed value".
  const [draft, setDraft] = createSignal<string | null>(null)

  const display = () => draft() ?? value()

  const minMinutes = () => minutesFromHHMM(local.min ?? '')
  const maxMinutes = () => minutesFromHHMM(local.max ?? '')

  const options = createMemo<TimeOption[]>(() => {
    if (local.options?.length) {
      return local.options.map((option) => {
        const canonical = normalize24(option.value) || option.value
        return { value: canonical, label: option.label || canonical }
      })
    }
    return generateTimeOptions({
      interval: local.interval ?? 15,
      minMinutes: minMinutes(),
      maxMinutes: maxMinutes(),
    })
  })

  const bareName = () =>
    props['aria-label'] ?? local.placeholder ?? 'Select time'

  const isSelected = (optionValue: string) =>
    baseValue(value()) !== '' && baseValue(value()) === optionValue

  function scrollHighlightedIntoView() {
    const index = highlight()
    if (index < 0) return
    queueMicrotask(() => {
      const el = document.getElementById(optionId(index))
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' })
      }
    })
  }

  function seedHighlight() {
    const index = options().findIndex((option) => isSelected(option.value))
    setHighlight(index)
  }

  function openList() {
    if (local.disabled) return
    if (!open()) setOpen(true)
  }

  function move(delta: number) {
    const list = options()
    if (!list.length) return
    const current = highlight()
    setDraft(null)
    if (current < 0) {
      const selected = list.findIndex((option) => isSelected(option.value))
      setHighlight(selected > -1 ? selected : delta > 0 ? 0 : list.length - 1)
    } else {
      setHighlight((current + delta + list.length) % list.length)
    }
    scrollHighlightedIntoView()
  }

  function commit(next: string | null) {
    setValue(next ?? '')
    setDraft(null)
  }

  function commitTyped() {
    const raw = draft()
    if (raw == null) return
    const parsed = parseFlexibleTime(raw)
    if (
      !parsed.valid ||
      isOutOfRange(parsed.total, minMinutes(), maxMinutes())
    ) {
      setDraft(null)
      return
    }
    commit(
      parsed.ss
        ? `${parsed.hh24}:${parsed.mm}:${parsed.ss}`
        : `${parsed.hh24}:${parsed.mm}`,
    )
  }

  function selectOption(optionValue: string) {
    commit(optionValue)
    setHighlight(-1)
    if (!local.keepOpen) setOpen(false)
    inputEl?.focus()
  }

  function onInput(event: InputEvent & { currentTarget: HTMLInputElement }) {
    setDraft(event.currentTarget.value)
    setHighlight(-1)
  }

  function onClick() {
    if (local.disabled) return
    if (local.openOnClick !== false && !open()) openList()
  }

  function onFocus() {
    if (local.openOnFocus && !open()) openList()
  }

  function onBlur(event: FocusEvent & { currentTarget: HTMLInputElement }) {
    const related = event.relatedTarget
    const root = event.currentTarget.closest('[data-slot="time-picker"]')
    if (related instanceof Node && root?.contains(related)) return
    commitTyped()
    setOpen(false)
  }

  function onKeyDown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement },
  ) {
    if (local.disabled) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open()) openList()
      else move(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open()) openList()
      else move(-1)
    } else if (event.key === 'Home') {
      if (open()) {
        event.preventDefault()
        setHighlight(0)
      }
    } else if (event.key === 'End') {
      if (open()) {
        event.preventDefault()
        setHighlight(options().length - 1)
      }
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const index = highlight()
      const option = open() && index > -1 ? options()[index] : undefined
      if (option) selectOption(option.value)
      else {
        commitTyped()
        if (!local.keepOpen) setOpen(false)
      }
    } else if (event.key === 'Escape') {
      if (open()) {
        event.preventDefault()
        setOpen(false)
      }
    } else if (event.key === 'Tab') {
      commitTyped()
      setOpen(false)
    }
  }

  const machineId = createId('time-picker')
  const { api } = createZagApi<TimePickerApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    open: open(),
    autoFocus: false,
    ids: { content: panelId },
    positioning: { placement: 'bottom-start', gutter: 4, sameWidth: true },
    onOpenChange: (details: { open: boolean }) => {
      setOpen(details.open)
      if (details.open) seedHighlight()
      else {
        setHighlight(-1)
        setDraft(null)
      }
    },
    onInteractOutside: (event: Event) => {
      const target = event.target
      if (
        target instanceof Element &&
        target.closest('[data-slot="time-picker"]')
      ) {
        event.preventDefault()
      }
    },
  }))

  return (
    <div
      data-slot="time-picker"
      class={cn('flex w-full flex-col', local.class)}
    >
      <div
        {...api().getAnchorProps()}
        data-slot="time-picker-anchor"
        data-state={open() ? 'open' : 'closed'}
        class={cn(
          'relative flex w-full items-center transition-colors',
          fieldSizes[size()],
          popupFieldVariants[local.variant ?? 'outline'],
          'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-gray-2 data-[disabled]:opacity-60',
          'focus-within:focus-ring-blue data-[invalid]:border-outline-red-6',
        )}
        data-disabled={local.disabled ? '' : undefined}
      >
        <input
          ref={(el) => {
            inputEl = el
          }}
          id={local.id ?? field?.controlId()}
          name={local.name}
          type="text"
          role="combobox"
          autocomplete="off"
          spellcheck={false}
          aria-haspopup="listbox"
          aria-expanded={open() ? 'true' : 'false'}
          aria-controls={open() ? panelId : undefined}
          aria-activedescendant={
            open() && highlight() > -1 ? optionId(highlight()) : undefined
          }
          aria-label={field?.hasLabel() ? undefined : bareName()}
          aria-invalid={field?.hasError() ? 'true' : undefined}
          aria-required={field?.required() ? 'true' : undefined}
          aria-describedby={field?.describedBy()}
          aria-errormessage={field?.hasError() ? field?.errorId() : undefined}
          disabled={local.disabled}
          readonly={!isTypeable()}
          placeholder={local.placeholder}
          value={display()}
          onInput={onInput}
          onClick={onClick}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          data-slot="time-picker-input"
          class={cn(
            'h-full w-full min-w-0 bg-transparent px-2 text-inherit outline-none',
            'placeholder:text-ink-gray-6 disabled:cursor-not-allowed',
            isTypeable() ? 'cursor-text' : 'cursor-pointer',
          )}
        />

        <button
          {...api().getTriggerProps()}
          type="button"
          aria-label="Show times"
          disabled={local.disabled}
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
            data-slot="time-picker-positioner"
            class="z-overlay"
          >
            <div
              {...api().getContentProps()}
              role="listbox"
              aria-label={bareName()}
              data-slot="time-picker-listbox"
              class="max-h-48 w-44 overflow-y-auto rounded-overlay border border-outline-gray-1 bg-surface-elevation-1 p-1 text-ink-gray-9 shadow-lg focus-visible:outline-none"
            >
              <For each={options()}>
                {(option, index) => (
                  // biome-ignore lint/a11y/useFocusableInteractive: options are reached through the input's aria-activedescendant (combobox pattern), so they are intentionally not focusable.
                  // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection lives on the input's keydown; options are pointer-only.
                  <div
                    id={optionId(index())}
                    role="option"
                    aria-selected={isSelected(option.value)}
                    data-selected={isSelected(option.value) ? '' : undefined}
                    data-highlighted={highlight() === index() ? '' : undefined}
                    data-value={option.value}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlight(index())}
                    onClick={() => selectOption(option.value)}
                    data-slot="time-picker-option"
                    class={OPTION}
                  >
                    <span class="truncate">{option.label}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

/**
 * A time input that opens a popover list of selectable times. The value is a
 * canonical `HH:mm` string; options are generated at a configurable `interval`
 * (bounded by `min`/`max`) or supplied via `options`. The input accepts typed
 * times (`typeable`, default true), parsed flexibly on Enter/blur.
 *
 * The popover reuses the Zag `popover` machine for positioning and dismiss, and
 * `Portal` for mounting. Keyboard/ARIA follow the combobox + listbox pattern:
 * `role="combobox"` on the input, `role="listbox"`/`role="option"` in the
 * popover, arrow-key navigation with `aria-activedescendant`.
 *
 * The shared labelling contract (P5) is inherited: with any of
 * `label`/`description`/`error`/`required` present, `Field` renders them and the
 * input id points at `Field`'s label.
 */
export function TimePicker(props: TimePickerProps): JSX.Element {
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
      <TimePickerControl {...props} />
    </Field>
  )
}
