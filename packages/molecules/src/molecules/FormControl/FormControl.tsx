import {
  Checkbox,
  type InputSize,
  type InputVariant,
  Textarea,
  TextInput,
} from '@newui/atoms'
import { type JSX, Match, Switch } from 'solid-js'
import { Combobox, type ComboboxOption } from '../Combobox'
import { DatePicker } from '../DatePicker'
import { MultiSelect, type MultiSelectOption } from '../MultiSelect'
import { Select, type SelectOption } from '../Select'

/**
 * Native HTML input types routed to `TextInput`. `password` renders
 * a plain masked input here — use the `Password` component when the reveal
 * toggle is wanted (frappe-ui draws the same line).
 */
export type FormControlTextType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'search'
  | 'tel'
  | 'url'
  | 'datetime-local'
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
  'datetime-local',
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

export interface FormControlSelectProps extends FormControlShared {
  type: 'select'
  options: SelectOption[]
  /** Selected values. Pass more than one with `multiple`. */
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  multiple?: boolean
}

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

export type FormControlProps =
  | FormControlTextProps
  | FormControlTextareaProps
  | FormControlSelectProps
  | FormControlCheckboxProps
  | FormControlComboboxProps
  | FormControlMultiSelectProps
  | FormControlDateProps

function renderSelect(props: FormControlSelectProps): JSX.Element {
  return (
    <Select
      options={props.options}
      value={props.value}
      onValueChange={props.onValueChange}
      placeholder={props.placeholder}
      label={props.label}
      aria-label={props['aria-label']}
      disabled={props.disabled}
      multiple={props.multiple}
      name={props.name}
      class={props.class}
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
 * this library ships today. `type="date"` renders `DatePicker`; `type="time"`
 * and `type="datetime-local"` are still the browser's native inputs (via
 * `TextInput`) until `TimePicker` lands.
 *
 * Only the text and `textarea` types expose `description` / `error` /
 * `required` and an `id`; `select` and `checkbox` have their own narrower
 * surfaces, so passing an unsupported prop to them is a type error rather than
 * a silent drop.
 */
export function FormControl(props: FormControlProps): JSX.Element {
  return (
    <Switch>
      <Match when={props.type === 'select'}>
        {renderSelect(props as FormControlSelectProps)}
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
