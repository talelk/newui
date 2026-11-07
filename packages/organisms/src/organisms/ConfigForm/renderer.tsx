// biome-ignore-all lint/suspicious/noExplicitAny: the form is an erased,
// structural view and the bound field is read generically — `any` is what lets a
// concrete `createAppForm` bind and lets one renderer drive every control type.
import { ErrorMessage } from '@talelk/newui-atoms'
import {
  FormControl,
  type FormControlCheckboxProps,
  type FormControlComboboxProps,
  type FormControlDateProps,
  type FormControlDateTimeProps,
  type FormControlMultiSelectProps,
  type FormControlSelectSingleProps,
  type FormControlTextareaProps,
  type FormControlTextProps,
  type FormControlTimeProps,
  Repeater,
} from '@talelk/newui-molecules'
import {
  type Accessor,
  createComponent,
  createMemo,
  For,
  type JSX,
  Show,
} from 'solid-js'

/**
 * The form surface the renderer drives: a *structural* view of TanStack's form
 * — the few members it calls. Declaring them as methods keeps them bivariant,
 * so any concrete `createAppForm` binds without a cast.
 */
export interface ConfigFormApi {
  Field: (props: any) => JSX.Element
  useSelector(selector: (state: any) => any): Accessor<any>
  validateArrayFieldsStartingFrom(
    field: any,
    index: number,
    cause: any,
  ): unknown
  handleSubmit(): unknown
}

/** The binding a custom `component` receives — the same contract the data engine documents. */
export interface ConfigFormControlProps {
  /** The field's path in the form. */
  name: string
  value: unknown
  /** Commits the value and runs the `onChange` validators. */
  onChange: (value: unknown) => void
  /** Marks the field touched and runs the `onBlur` validators. */
  onBlur: () => void
  /** The field's error, joined to one string — the `Field` contract. */
  error?: string
  disabled?: boolean
}

export type ConfigFormControlComponent = (
  props: ConfigFormControlProps,
) => JSX.Element

/**
 * The renderer's view of a field-map entry. Structurally identical to
 * `FieldConfig` in `@talelk/newui-data/form` — the same object is passed to
 * `createAppForm`'s `ui` (where only `when`/`dependsOn` are read) and here,
 * where everything else decides what renders. The mirror is forced by the
 * layering rule that visual packages never import the data layer; the
 * playground's `config-form-parity.test.ts` pins the two in both directions.
 *
 * `TScope` is what `when` sees first: the form's values for a top-level
 * entry, the row for a repeater's row field.
 */
export interface ConfigFormField<
  TValues = Record<string, unknown>,
  TScope = TValues,
> {
  /** Control vocabulary: the `FormControl` types, plus `repeater`. */
  type?: string
  label?: JSX.Element
  description?: JSX.Element
  placeholder?: string
  /** The label's asterisk; validation is the schema's. */
  required?: boolean
  disabled?: boolean
  options?: readonly { value: string; label?: string }[]
  /** Extra props passed through to the resolved control. */
  props?: Record<string, unknown>
  /** Rendered instead of the `type` mapping. */
  component?: ConfigFormControlComponent
  /** Read by the engine only; the renderer ignores it. */
  dependsOn?: readonly string[]
  /**
   * Returning `false` hides the field. `scope` is the form's values for a
   * top-level entry and the row for a repeater's row field; `values` is
   * always the whole form.
   */
  when?: (scope: TScope, values: TValues) => boolean
  /** For `type: 'repeater'`: the row's fields; their `when` sees the row first. */
  fields?: Record<string, ConfigFormField<TValues, any>>
  /** For `type: 'repeater'`: the ceiling on rows. */
  maxItems?: number
}

/** Everything `createFormRenderer`'s output needs to render one field. */
export interface ConfigFieldProps<TValues extends object> {
  form: ConfigFormApi
  name: string
  field: ConfigFormField<TValues, any>
  /** The form's values, reactive — `when` is evaluated against these. */
  values: Accessor<TValues>
  /** The row, reactive, for a repeater's row field; `when` sees it first. */
  scope?: Accessor<unknown>
}

const TEXT_TYPES = new Set([
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
])

/** The same join `fieldError` uses: one entry per validator, not per cause. */
function errorText(field: { state: { meta: { errors: unknown[] } } }) {
  const messages = [...new Set(field.state.meta.errors.map((e) => String(e)))]
  return messages.length > 0 ? messages.join(' ') : undefined
}

function errorNode(field: {
  state: { meta: { errors: unknown[] } }
}): JSX.Element | false {
  const text = errorText(field)
  return text ? <ErrorMessage message={text} /> : false
}

/** The slice of TanStack's `FieldApi` the renderer binds against. */
interface BoundField {
  state: { value: any; meta: { errors: unknown[] } }
  handleChange: (value: unknown) => void
  handleBlur: () => void
}

/** One field's control, bound to its `form.Field`. */
function BoundControl<TValues extends object>(props: {
  config: ConfigFormField<TValues>
  field: Accessor<BoundField>
}): JSX.Element {
  // A per-field control dispatcher. `config` and `type` are static for the
  // field's lifetime (the field map is fixed), so reading them once is correct;
  // the value/error/checked bindings are reactive getters, so the control tracks
  // the field. The `type` dispatch returns early on static config, not state.
  /* eslint-disable solid/reactivity, solid/components-return-once */
  const config = props.config
  const type = config.type ?? 'text'
  const error = () => errorNode(props.field())
  const shared = {
    label: config.label,
    description: config.description,
    placeholder: config.placeholder,
    disabled: config.disabled,
    ...(config.props ?? {}),
  }

  if (config.component) {
    const render = config.component
    return createComponent(render, {
      name: '',
      get value() {
        return props.field().state.value
      },
      onChange: (value: unknown) => props.field().handleChange(value),
      onBlur: () => props.field().handleBlur(),
      get error() {
        return errorText(props.field())
      },
      disabled: config.disabled,
    })
  }

  if (TEXT_TYPES.has(type)) {
    const textProps: FormControlTextProps = {
      type: type as FormControlTextProps['type'],
      ...shared,
      required: config.required,
      get value() {
        return (props.field().state.value as string) ?? ''
      },
      get error() {
        return error()
      },
      onInput: (event) =>
        props
          .field()
          .handleChange((event.currentTarget as HTMLInputElement).value),
      onBlur: () => props.field().handleBlur(),
    }
    return <FormControl {...textProps} />
  }

  if (type === 'textarea') {
    const textareaProps: FormControlTextareaProps = {
      type: 'textarea',
      ...shared,
      required: config.required,
      get value() {
        return (props.field().state.value as string) ?? ''
      },
      get error() {
        return error()
      },
      onInput: (event) =>
        props
          .field()
          .handleChange((event.currentTarget as HTMLTextAreaElement).value),
      onBlur: () => props.field().handleBlur(),
    }
    return <FormControl {...textareaProps} />
  }

  switch (type) {
    case 'checkbox': {
      const checkboxProps: FormControlCheckboxProps = {
        type: 'checkbox',
        label: config.label,
        description: config.description,
        disabled: config.disabled,
        get checked() {
          return Boolean(props.field().state.value)
        },
        onCheckedChange: (checked) => props.field().handleChange(checked),
        ...(config.props ?? {}),
      }
      return <FormControl {...checkboxProps} />
    }
    case 'select': {
      const selectProps: FormControlSelectSingleProps = {
        type: 'select',
        options: (config.options ??
          []) as FormControlSelectSingleProps['options'],
        get value() {
          return (props.field().state.value as string | null) ?? null
        },
        onValueChange: (value) => props.field().handleChange(value),
        placeholder: config.placeholder,
        label: config.label,
        disabled: config.disabled,
        ...(config.props ?? {}),
      }
      return <FormControl {...selectProps} />
    }
    case 'combobox': {
      const comboboxProps: FormControlComboboxProps = {
        type: 'combobox',
        options: (config.options ?? []) as FormControlComboboxProps['options'],
        get value() {
          return (props.field().state.value as string | null) ?? null
        },
        onValueChange: (value) => props.field().handleChange(value),
        placeholder: config.placeholder,
        label: config.label,
        description: config.description,
        get error() {
          return error()
        },
        required: config.required,
        disabled: config.disabled,
        ...(config.props ?? {}),
      }
      return <FormControl {...comboboxProps} />
    }
    case 'multiselect': {
      const multiProps: FormControlMultiSelectProps = {
        type: 'multiselect',
        options: (config.options ??
          []) as FormControlMultiSelectProps['options'],
        get value() {
          return (props.field().state.value as string[]) ?? []
        },
        onValueChange: (value) => props.field().handleChange(value),
        placeholder: config.placeholder,
        label: config.label,
        description: config.description,
        get error() {
          return error()
        },
        required: config.required,
        disabled: config.disabled,
        ...(config.props ?? {}),
      }
      return <FormControl {...multiProps} />
    }
    case 'date': {
      const dateProps: FormControlDateProps = {
        type: 'date',
        get value() {
          return (props.field().state.value as string | null) ?? null
        },
        onValueChange: (value) => props.field().handleChange(value),
        placeholder: config.placeholder,
        label: config.label,
        description: config.description,
        get error() {
          return error()
        },
        required: config.required,
        disabled: config.disabled,
        ...(config.props ?? {}),
      }
      return <FormControl {...dateProps} />
    }
    case 'time': {
      const timeProps: FormControlTimeProps = {
        type: 'time',
        get value() {
          return (props.field().state.value as string | null) ?? null
        },
        onValueChange: (value) => props.field().handleChange(value),
        placeholder: config.placeholder,
        label: config.label,
        description: config.description,
        get error() {
          return error()
        },
        required: config.required,
        disabled: config.disabled,
        ...(config.props ?? {}),
      }
      return <FormControl {...timeProps} />
    }
    case 'datetime-local': {
      const dateTimeProps: FormControlDateTimeProps = {
        type: 'datetime-local',
        get value() {
          return (props.field().state.value as string | null) ?? null
        },
        onValueChange: (value) => props.field().handleChange(value),
        placeholder: config.placeholder,
        label: config.label,
        description: config.description,
        get error() {
          return error()
        },
        required: config.required,
        disabled: config.disabled,
        ...(config.props ?? {}),
      }
      return <FormControl {...dateTimeProps} />
    }
    default: {
      const fallback: FormControlTextProps = {
        type: type as FormControlTextProps['type'],
        ...shared,
        required: config.required,
        get value() {
          return String(props.field().state.value ?? '')
        },
        get error() {
          return error()
        },
        onInput: (event) =>
          props
            .field()
            .handleChange((event.currentTarget as HTMLInputElement).value),
      }
      return <FormControl {...fallback} />
    }
  }
  /* eslint-enable solid/reactivity, solid/components-return-once */
}

/**
 * Binds the `type` vocabulary to the molecule controls. `components` overrides
 * any type with a custom control — that is where an app's own pickers join the
 * one vocabulary without forking the renderer.
 */
export function createFormRenderer(
  components: Record<string, ConfigFormControlComponent> = {},
) {
  return function ConfigField<TValues extends object>(
    props: ConfigFieldProps<TValues>,
  ): JSX.Element {
    // The control map and the field's `type` are static for this field, so the
    // custom-control lookup is a setup-time read, not a tracked one.
    /* eslint-disable solid/reactivity */
    const custom =
      Object.keys(components).length > 0
        ? components[props.field.type ?? '']
        : undefined
    /* eslint-enable solid/reactivity */
    const visible = () =>
      !props.field.when ||
      props.field.when(
        props.scope ? props.scope() : props.values(),
        props.values(),
      )
    return (
      <Show when={visible()}>
        <props.form.Field name={props.name}>
          {(field: Accessor<any>) =>
            custom ? (
              createComponent(custom, {
                name: props.name,
                get value() {
                  return field().state.value
                },
                onChange: (value: unknown) => field().handleChange(value),
                onBlur: () => field().handleBlur(),
                get error() {
                  return errorText(field())
                },
                disabled: props.field.disabled,
              })
            ) : props.field.type === 'repeater' ? (
              <Repeater
                form={props.form}
                name={props.name}
                maxItems={props.field.maxItems}
              >
                {(row) => (
                  <FieldList
                    form={props.form}
                    prefix={row.name}
                    scope={row.value}
                    fields={props.field.fields ?? {}}
                    values={props.values}
                    components={components}
                  />
                )}
              </Repeater>
            ) : (
              <BoundControl config={props.field} field={field} />
            )
          }
        </props.form.Field>
      </Show>
    )
  }
}

/** The fields of one repeater row, rendered under a shared path prefix. */
export function FieldList<TValues extends object>(props: {
  form: ConfigFormApi
  prefix: Accessor<string>
  /** The row, reactive; row fields' `when` sees it first. */
  scope: Accessor<unknown>
  fields: Record<string, ConfigFormField<TValues, any>>
  values: Accessor<TValues>
  components?: Record<string, ConfigFormControlComponent>
}): JSX.Element {
  // The control map is static, so building the renderer is a setup-time read.
  // eslint-disable-next-line solid/reactivity
  const ConfigField = createFormRenderer(props.components ?? {})
  const entries = createMemo(() => Object.entries(props.fields))
  return (
    <For each={entries()}>
      {([key, field]) => (
        <div data-slot="config-form-field">
          <ConfigField
            form={props.form}
            name={`${props.prefix()}.${key}`}
            field={field}
            values={props.values}
            scope={props.scope}
          />
        </div>
      )}
    </For>
  )
}
