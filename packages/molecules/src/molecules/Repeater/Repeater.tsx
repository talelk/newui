// biome-ignore-all lint/suspicious/noExplicitAny: this is a deliberately erased,
// structural view of TanStack's form — `any` is what keeps the members bivariant
// so a concrete `createForm`/`createAppForm` binds without a cast.
import { Button, Icon, IconButton } from '@talelk/newui-atoms'
import { cn } from '@talelk/newui-atoms/internal'
import { type Accessor, createSignal, Index, type JSX, Show } from 'solid-js'

/**
 * The form surface a `Repeater` needs. It is a *structural* view of TanStack's
 * form — the few members the repeater drives, typed loosely. Declaring them as
 * methods (not properties) keeps them bivariant, so any concrete
 * `createForm`/`createAppForm` — including one with array fields — binds
 * without a cast.
 */
export interface RepeaterFormApi {
  Field: (props: any) => JSX.Element
  useSelector(selector: (state: any) => any): Accessor<any>
  validateArrayFieldsStartingFrom(
    field: any,
    index: number,
    cause: any,
  ): unknown
}

/** TanStack's `Field`, erased to the shape the repeater drives. */
export type FormFieldComponent = (props: {
  name?: string
  mode?: string
  children?: (field: Accessor<any>) => JSX.Element
  [key: string]: unknown
}) => JSX.Element

/** What `Repeater` hands each row: the row's identity, value, and actions. */
export interface RepeaterRow {
  /** The row's position, reactive because rows shift when one is removed. */
  index: Accessor<number>
  /** The row's path in the form, e.g. `items[1]`. */
  name: Accessor<string>
  /**
   * The form's `Field` component. Field names are paths from the form's data,
   * so a row field is `` `${row.name()}.title` ``.
   */
  Field: FormFieldComponent
  /** The row's value, reactive. */
  value: Accessor<unknown>
  /** Remove this row. Disabled below `minItems`. */
  remove: () => void
  /** Insert a copy of this row after it. */
  copy: () => void
}

export interface RepeaterProps {
  /** The TanStack form — pass `appForm.form`. */
  form: RepeaterFormApi
  /** The array field's path. */
  name: string
  /** The ceiling on rows; the add button disappears at it. */
  maxItems?: number
  /** The floor on rows; remove is disabled at it. @default 0 */
  minItems?: number
  /** Label for the add button. @default Add */
  addLabel?: string
  /** Show a copy button per row. */
  copyable?: boolean
  /** Wrap each row in a collapse, so long arrays stay scannable. */
  collapsible?: boolean
  /** Row title drawn in the collapse header. @default Item N */
  rowTitle?: (index: number) => JSX.Element
  /** The value a new row starts from. @default {} */
  newItem?: () => unknown
  /** Rendered per row. */
  children: (row: RepeaterRow) => JSX.Element
  class?: string
}

/**
 * A dynamic array of rows over a `mode="array"` field: add, remove, copy, and
 * (optionally) a collapse per row, with `maxItems`/`minItems` bounds. Rows
 * iterate with `Index`, not `For` — a row component must belong to its
 * position, or a removal silently takes the wrong row's field values with it.
 *
 * Structural changes revalidate from the changed index onward, so row errors
 * stay aligned after a shift.
 */
export function Repeater(props: RepeaterProps): JSX.Element {
  const minItems = (): number => props.minItems ?? 0

  return (
    <props.form.Field name={props.name} mode="array">
      {(field: Accessor<any>) => {
        const items = () => (field().state.value as unknown[]) ?? []
        const canAdd = () =>
          props.maxItems === undefined || items().length < props.maxItems
        const canRemove = () => items().length > minItems()

        // A row was inserted or removed; revalidate from that index so the
        // errors that survive the shift land on the right rows. The cast is
        // the form's `any` data type talking: `DeepKeysOfType<any, any[]>`
        // collapses to `never`, so the path needs one explicit widening.
        const cascade = (from: number): void => {
          const validate = props.form.validateArrayFieldsStartingFrom as (
            field: string,
            index: number,
            cause: 'dynamic',
          ) => unknown
          void validate(props.name, from, 'dynamic')
        }

        return (
          <div
            data-slot="repeater"
            class={cn('flex flex-col gap-3', props.class)}
          >
            <Index each={items()}>
              {(_, index) => {
                const [open, setOpen] = createSignal(!props.collapsible)
                const row: RepeaterRow = {
                  index: () => index,
                  name: () => `${props.name}[${index}]`,
                  Field: props.form.Field,
                  value: () => items()[index],
                  remove: () => {
                    field().removeValue(index)
                    cascade(index)
                  },
                  copy: () => {
                    const value = items()[index]
                    field().insertValue(index + 1, structuredClone(value))
                    cascade(index + 1)
                  },
                }
                return (
                  <div
                    data-slot="repeater-item"
                    class="flex flex-col gap-2 rounded-card border border-outline-gray-2 p-3"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex min-w-0 items-center gap-1.5">
                        <Show when={props.collapsible}>
                          <IconButton
                            icon="lucide-chevron-down"
                            size="sm"
                            label={`Toggle row ${index + 1}`}
                            aria-expanded={open()}
                            onClick={() => setOpen((value) => !value)}
                          />
                        </Show>
                        <span class="truncate text-sm text-ink-gray-8">
                          {props.rowTitle?.(index) ?? `Item ${index + 1}`}
                        </span>
                      </div>
                      <div class="flex shrink-0 items-center gap-1">
                        <Show when={props.copyable}>
                          <IconButton
                            icon="lucide-copy"
                            size="sm"
                            label={`Copy row ${index + 1}`}
                            onClick={row.copy}
                          />
                        </Show>
                        <IconButton
                          icon="lucide-trash-2"
                          size="sm"
                          label={`Remove row ${index + 1}`}
                          disabled={!canRemove()}
                          onClick={row.remove}
                        />
                      </div>
                    </div>
                    <Show when={open()}>{props.children(row)}</Show>
                  </div>
                )
              }}
            </Index>
            <Show when={canAdd()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const added = items().length
                  field().pushValue(props.newItem ? props.newItem() : {})
                  cascade(added)
                }}
              >
                <Icon icon="lucide-plus" class="size-4" />
                {props.addLabel ?? 'Add'}
              </Button>
            </Show>
          </div>
        )
      }}
    </props.form.Field>
  )
}
