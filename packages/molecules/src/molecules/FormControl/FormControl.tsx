import {
  Checkbox,
  type InputSize,
  type InputVariant,
  Textarea,
  TextInput,
} from '@talelk/newui-atoms'
import { type JSX, Match, Switch } from 'solid-js'
import { Combobox, type ComboboxOption } from '../Combobox'
import { DatePicker } from '../DatePicker'
import { DateTimePicker } from '../DateTimePicker'
import { MultiSelect, type MultiSelectOption } from '../MultiSelect'
import { Select, type SelectOption } from '../Select'
import { TimePicker } from '../TimePicker'

/**
 * Native HTML input types routed to `TextInput`. `password` renders
 * a plain masked input here — use the `Password` component when the reveal
 * toggle is wanted (frappe-ui draws the same line). `time` and
 * `datetime-local` have their own pickers and are routed to `TimePicker` /
 * `DateTimePicker`, not to the native inputs.
 */
export type FormControlTextType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'search'
  | 'tel'
  | 'url'
  | 'month'
  | 'week'
  | 'file'
  | 'range'

const TEXT_TYPES: readonly FormControlTextType[] = [
  'text',
  'email',
  'password',
  'number',
  'search',
  'tel',
  'url',
  'month',
  'week',
  'file',
  'range',
]

export type FormControlType =
  | FormControlTextType
  | 'textarea'
  | 'select'
  | 'combobox'
  | 'multiselect'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'datetime-local'

function isTextType(
  type: FormControlType | undefined,
): type is FormControlTextType | undefined {
  return type === undefined || (TEXT_TYPES as readonly string[]).includes(type)
}

/** Props every `FormControl` type shares. Which ones a control honours depends on it — see the notes below. */
interface FormControlShared {
  /** `id` of the rendered control. Only the text and `textarea` types take one. */
  id?: string
  /** Label drawn by the rendered control. Honoured by every type. */
  label?: JSX.Element
  /** Accessible name when no visible `label` is rendered. */
  'aria-label'?: string
  disabled?: boolean
  /** Form field name. */
  name?: string
  /** Merged into the rendered control's root. */
  class?: string
}

export interface FormControlTextProps extends FormControlShared {
  type?: FormControlTextType
  value?: string
  onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>
  onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>
  placeholder?: string
  /** Helper text; `TextInput` draws it. */
  description?: JSX.Element
  /** Error text; `TextInput` draws it and marks the field invalid. */
  error?: JSX.Element | false
  required?: boolean
  readonly?: boolean
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
  prefix?: JSX.Element
  suffix?: JSX.Element
}

export interface FormControlTextareaProps extends FormControlShared {
  type: 'textarea'
  value?: string
  onInput?: JSX.EventHandlerUnion<HTMLTextAreaElement, InputEvent>
  placeholder?: string
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  readonly?: boolean
  rows?: number
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
}

export interface FormControlSelectSingleProps extends FormControlShared {
  type: 'select'
  options: SelectOption[]
  /** Selected value; `null` clears it. */
  value?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  multiple?: false
}

export interface FormControlSelectMultiProps extends FormControlShared {
  type: 'select'
  options: SelectOption[]
  /** Selected values. */
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  multiple: true
}

export type FormControlSelectProps =
  | FormControlSelectSingleProps
  | FormControlSelectMultiProps

export interface FormControlCheckboxProps extends FormControlShared {
  type: 'checkbox'
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Helper text; `Checkbox` draws it. */
  description?: JSX.Element
}

export interface FormControlComboboxProps extends FormControlShared {
  type: 'combobox'
  /** The selectable options; filtered client-side as the user types. */
  options: ComboboxOption[]
  /** Committed value; `null` when nothing is selected. */
  value?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  /** `Combobox` is fully labelled through the P5 contract. */
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
}

export interface FormControlMultiSelectProps extends FormControlShared {
  type: 'multiselect'
  /** The selectable options; filtered client-side as the user types. */
  options: MultiSelectOption[]
  /** Selected values. */
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  /** `MultiSelect` is fully labelled through the P5 contract. */
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
}

export interface FormControlDateProps extends FormControlShared {
  type: 'date'
  /** Selected date as `YYYY-MM-DD`; `null` when none. */
  value?: string | null
  onValueChange?: (value: string | null) => void
  min?: string
  max?: string
  placeholder?: string
  locale?: string
  readonly?: boolean
  clearable?: boolean
  /** `DatePicker` is fully labelled through the P5 contract. */
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
}

export interface FormControlTimeProps extends FormControlShared {
  type: 'time'
  /** Selected time as `HH:mm` (or `HH:mm:ss`); `null` when cleared. */
  value?: string | null
  onValueChange?: (value: string | null) => void
  /** Minute interval between generated options. Default `15`. */
  interval?: number
  /** Minimum selectable time as `HH:mm[:ss]`. */
  min?: string
  /** Maximum selectable time as `HH:mm[:ss]`. */
  max?: string
  placeholder?: string
  /** Whether the input accepts typed times. Default `true`. */
  typeable?: boolean
  /** `TimePicker` is fully labelled through the P5 contract. */
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
}

export interface FormControlDateTimeProps extends FormControlShared {
  type: 'datetime-local'
  /** Selected date+time as ISO `YYYY-MM-DDTHH:mm`; `null` when cleared. */
  value?: string | null
  onValueChange?: (value: string | null) => void
  /** Earliest selectable date/time (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm[:ss]`). */
  min?: string
  /** Latest selectable date/time (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm[:ss]`). */
  max?: string
  /** BCP 47 locale for formatting/parsing. */
  locale?: string
  /** Minute interval between generated time options. Default `30`. */
  interval?: number
  placeholder?: string
  /** Allow typing the date. Default `true`. */
  typeable?: boolean
  readonly?: boolean
  /** `DateTimePicker` is fully labelled through the P5 contract. */
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
}

export type FormControlProps =
  | FormControlTextProps
  | FormControlTextareaProps
  | FormControlSelectProps
  | FormControlCheckboxProps
  | FormControlComboboxProps
  | FormControlMultiSelectProps
  | FormControlDateProps
  | FormControlTimeProps
  | FormControlDateTimeProps

// Spread keeps the props proxy intact — a materialized object would freeze
// the values at first read. The `type` key is inert: Select ignores it.
function renderSelectSingle(props: FormControlSelectSingleProps): JSX.Element {
  return (
    <Select
      {...props}
      value={props.value}
      onValueChange={props.onValueChange}
    />
  )
}

function renderSelectMulti(props: FormControlSelectMultiProps): JSX.Element {
  return (
    <Select
      {...props}
      multiple
      value={props.value}
      onValueChange={props.onValueChange}
    />
  )
}

function renderCombobox(props: FormControlComboboxProps): JSX.Element {
  return (
    <Combobox
      options={props.options}
      value={props.value}
      onValueChange={props.onValueChange}
      placeholder={props.placeholder}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      aria-label={props['aria-label']}
      disabled={props.disabled}
      name={props.name}
      id={props.id}
      size={props.size}
      variant={props.variant}
      class={props.class}
    />
  )
}

function renderMultiSelect(props: FormControlMultiSelectProps): JSX.Element {
  return (
    <MultiSelect
      options={props.options}
      value={props.value}
      onValueChange={props.onValueChange}
      placeholder={props.placeholder}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      aria-label={props['aria-label']}
      disabled={props.disabled}
      name={props.name}
      id={props.id}
      size={props.size}
      variant={props.variant}
      class={props.class}
    />
  )
}

function renderDate(props: FormControlDateProps): JSX.Element {
  return (
    <DatePicker
      value={props.value}
      onValueChange={props.onValueChange}
      min={props.min}
      max={props.max}
      placeholder={props.placeholder}
      locale={props.locale}
      readonly={props.readonly}
      clearable={props.clearable}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      aria-label={props['aria-label']}
      disabled={props.disabled}
      name={props.name}
      id={props.id}
      size={props.size}
      variant={props.variant}
      class={props.class}
    />
  )
}

function renderTime(props: FormControlTimeProps): JSX.Element {
  return (
    <TimePicker
      value={props.value}
      onValueChange={props.onValueChange}
      interval={props.interval}
      min={props.min}
      max={props.max}
      placeholder={props.placeholder}
      typeable={props.typeable}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      aria-label={props['aria-label']}
      disabled={props.disabled}
      name={props.name}
      id={props.id}
      size={props.size}
      variant={props.variant}
      class={props.class}
    />
  )
}

function renderDateTime(props: FormControlDateTimeProps): JSX.Element {
  return (
    <DateTimePicker
      value={props.value}
      onValueChange={props.onValueChange}
      min={props.min}
      max={props.max}
      locale={props.locale}
      interval={props.interval}
      placeholder={props.placeholder}
      typeable={props.typeable}
      readonly={props.readonly}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      aria-label={props['aria-label']}
      disabled={props.disabled}
      name={props.name}
      id={props.id}
      size={props.size}
      variant={props.variant}
      class={props.class}
    />
  )
}

function renderCheckbox(props: FormControlCheckboxProps): JSX.Element {
  return (
    <Checkbox
      checked={props.checked}
      defaultChecked={props.defaultChecked}
      onCheckedChange={props.onCheckedChange}
      disabled={props.disabled}
      label={props.label}
      description={props.description}
      name={props.name}
      class={props.class}
    />
  )
}

function renderTextarea(props: FormControlTextareaProps): JSX.Element {
  return (
    <Textarea
      id={props.id}
      value={props.value}
      onInput={props.onInput}
      placeholder={props.placeholder}
      name={props.name}
      disabled={props.disabled}
      readonly={props.readonly}
      rows={props.rows}
      size={props.size}
      variant={props.variant}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      aria-label={props['aria-label']}
      class={props.class}
    />
  )
}

function renderText(props: FormControlTextProps): JSX.Element {
  return (
    <TextInput
      id={props.id}
      type={props.type ?? 'text'}
      value={props.value}
      onInput={props.onInput}
      onChange={props.onChange}
      placeholder={props.placeholder}
      name={props.name}
      disabled={props.disabled}
      readonly={props.readonly}
      size={props.size}
      variant={props.variant}
      prefix={props.prefix}
      suffix={props.suffix}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      aria-label={props['aria-label']}
      class={props.class}
    />
  )
}

/**
 * One component that renders any form field from its `type` prop, with the same
 * `label` / `description` / `error` / `required` props where the resolved
 * control supports them (P5). It is a thin dispatcher: type-specific props (and
 * the value shape) follow that control.
 *
 * Ported from frappe-ui's `FormControl`. The types it routes are the controls
 * this library ships today. `type="date"`, `type="time"` and
 * `type="datetime-local"` render `DatePicker`, `TimePicker` and
 * `DateTimePicker`; only month/week inputs stay native (via `TextInput`).
 *
 * Only the text and `textarea` types expose `description` / `error` /
 * `required` and an `id`; `select` and `checkbox` have their own narrower
 * surfaces, so passing an unsupported prop to them is a type error rather than
 * a silent drop.
 */
export function FormControl(props: FormControlProps): JSX.Element {
  return (
    <Switch>
      <Match when={props.type === 'select' && props.multiple === true}>
        {renderSelectMulti(props as FormControlSelectMultiProps)}
      </Match>
      <Match when={props.type === 'select'}>
        {renderSelectSingle(props as FormControlSelectSingleProps)}
      </Match>
      <Match when={props.type === 'combobox'}>
        {renderCombobox(props as FormControlComboboxProps)}
      </Match>
      <Match when={props.type === 'multiselect'}>
        {renderMultiSelect(props as FormControlMultiSelectProps)}
      </Match>
      <Match when={props.type === 'date'}>
        {renderDate(props as FormControlDateProps)}
      </Match>
      <Match when={props.type === 'time'}>
        {renderTime(props as FormControlTimeProps)}
      </Match>
      <Match when={props.type === 'datetime-local'}>
        {renderDateTime(props as FormControlDateTimeProps)}
      </Match>
      <Match when={props.type === 'checkbox'}>
        {renderCheckbox(props as FormControlCheckboxProps)}
      </Match>
      <Match when={props.type === 'textarea'}>
        {renderTextarea(props as FormControlTextareaProps)}
      </Match>
      <Match when={isTextType(props.type)}>
        {renderText(props as FormControlTextProps)}
      </Match>
    </Switch>
  )
}
