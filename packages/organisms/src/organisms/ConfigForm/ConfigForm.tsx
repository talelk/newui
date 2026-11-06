import { cn } from '@talelk/newui-atoms'
import { type Accessor, createMemo, For, type JSX, Show } from 'solid-js'
import {
  type ConfigFormApi,
  type ConfigFormControlComponent,
  type ConfigFormField,
  createFormRenderer,
} from './renderer'

export interface ConfigFormProps<
  TValues extends object = Record<string, unknown>,
> {
  /** The TanStack form — pass `appForm.form`. */
  form: ConfigFormApi
  /**
   * The field map, keyed by path — the same object passed to `createAppForm`
   * as `ui`. Fields render in key order.
   */
  fields: Record<string, ConfigFormField<TValues>>
  /** Custom controls by `type`, joined onto the `FormControl` vocabulary. */
  components?: Record<string, ConfigFormControlComponent>
  /** The autosave chrome: renders "Saving…/Saved" where the form chrome sits. */
  autosave?: { saving: Accessor<boolean>; saved: Accessor<boolean> }
  class?: string
  /** Extra chrome after the fields — usually the submit button. */
  children?: JSX.Element
}

/**
 * The config-form organism: a schema-driven `<form>` that renders every field
 * from its `ui` sidecar entry — the `FormControl` vocabulary for plain fields,
 * `Repeater` for arrays, and the `when` predicates for visibility, all bound
 * to the live form state. The engine's half (pruning, schema validation,
 * `dependsOn`) lives in `@talelk/newui-data/form`; this is the rendered face.
 */
export function ConfigForm<TValues extends object = Record<string, unknown>>(
  props: ConfigFormProps<TValues>,
): JSX.Element {
  // Both are setup-time reads of static props: the control map is fixed, and
  // `useSelector` is called once to subscribe the whole form.
  /* eslint-disable solid/reactivity */
  const renderField = createFormRenderer(props.components)
  const values = props.form.useSelector(
    (state) => state.values,
  ) as Accessor<TValues>
  /* eslint-enable solid/reactivity */
  const entries = createMemo(() => Object.entries(props.fields))

  return (
    <form
      data-slot="config-form"
      noValidate
      class={cn('flex flex-col gap-4', props.class)}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void props.form.handleSubmit()
      }}
    >
      <For each={entries()}>
        {([name, field]) => (
          <div data-slot="config-form-field">
            {renderField({ form: props.form, name, field, values })}
          </div>
        )}
      </For>
      <Show when={props.autosave}>
        <div
          data-slot="config-form-status"
          role="status"
          class="text-xs text-ink-gray-6"
        >
          <Show when={props.autosave?.saving()}>Saving…</Show>
          <Show when={!props.autosave?.saving() && props.autosave?.saved()}>
            Saved
          </Show>
        </div>
      </Show>
      {props.children}
    </form>
  )
}
