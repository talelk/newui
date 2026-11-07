// biome-ignore-all lint/suspicious/noExplicitAny: the form is an erased,
// structural view — `any` is what lets a concrete `createAppForm` bind to the
// wizard's seam without the visual package importing the data layer.
import { Button, cn } from '@talelk/newui-atoms'
import { createControllableSignal } from '@talelk/newui-atoms/internal'
import { Stepper } from '@talelk/newui-molecules'
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  onCleanup,
  Show,
} from 'solid-js'
import {
  type ConfigFormApi,
  type ConfigFormControlComponent,
  type ConfigFormField,
  createFormRenderer,
} from '../ConfigForm/renderer'

/** The `id` of the step `review` appends, when it is on. */
export const WIZARD_REVIEW_STEP = 'review'

/**
 * What a step's `validate` returns to block "Next": messages for the whole
 * step, or a map from field path to that field's message. Returning nothing —
 * `undefined` — passes.
 */
export type WizardStepErrors =
  | string
  | string[]
  | Record<string, string | string[]>

/** One field of a step's `content` array: a `FieldConfig` plus its path. */
export interface WizardStepField<TValues = Record<string, unknown>>
  extends ConfigFormField<TValues> {
  /** The field's path in the form. */
  name: string
}

/** One step of a wizard, in order. */
export interface WizardStep<TValues extends object = Record<string, unknown>> {
  /** Stable id — the `value` the stepper reports and `currentStep` takes. */
  id: string
  label: string
  /** Secondary line under the stepper label. */
  description?: string
  /**
   * The gate for leaving this step forward. Return messages to block "Next"
   * and put them on the fields; leaving it `undefined` means the step is
   * always passable. It runs when the user tries to advance — never while
   * they type, and never for a step they have not reached.
   */
  validate?: (
    values: TValues,
  ) => undefined | WizardStepErrors | Promise<undefined | WizardStepErrors>
  /** The step's body: its own JSX, or the fields the wizard renders. */
  content?: JSX.Element | WizardStepField<TValues>[]
}

/** The storage half of `resume`, read structurally so organisms stay visual. */
export interface WizardResumeStore {
  load<T>(name: string): { doc: T } | undefined
  save<T>(name: string, doc: T, options?: { type?: string }): boolean
  remove(name: string): boolean
}

/** Where the wizard remembers itself. */
export interface WizardResume {
  /** The document name — one wizard's worth of state per id. */
  id: string
  /** A `createConfigStore` from `@talelk/newui-data`, keyed `newui.wizard`. */
  store: WizardResumeStore
}

/**
 * The form surface the wizard drives: `ConfigFormApi` plus what navigation
 * needs — the values it persists and hands to `validate`, the field meta it
 * writes step errors into, and a reset.
 */
export interface WizardFormApi extends ConfigFormApi {
  state: { values: any }
  setFieldMeta(name: string, updater: (prev: any) => any): void
  /** `reset(values)` is also how a remembered document gets applied. */
  reset(values?: any): void
}

/** The payload under `newui.wizard:<id>`. */
interface WizardResumeDoc<TValues> {
  step: string
  values: TValues
}

export interface WizardProps<TValues extends object = Record<string, unknown>> {
  /** Accessible name for the step navigation (the stepper's landmark). */
  label: string
  /** The steps, in order. */
  steps: WizardStep<TValues>[]
  /** The form the field steps bind to — pass `appForm.form`. */
  form: WizardFormApi
  /**
   * The save path: called once, on the last step, after that step's gate.
   * Omit it to hand the document to the form's own `handleSubmit`.
   */
  onSubmit?: (
    values: TValues,
    api: { reset: () => void },
  ) => void | Promise<void>
  /** The current step's `id` (controlled). */
  currentStep?: string
  /** The step that opens first, when nothing is controlled or remembered. */
  defaultStep?: string
  /** Reports every step change the user makes. */
  onCurrentStepChange?: (id: string) => void
  /** Append the generated read-only summary as the last step. */
  review?: boolean
  /** Remember the step and the values, and come back to them. */
  resume?: WizardResume
  /** Custom controls for a step's `type`s, joined onto the vocabulary. */
  components?: Record<string, ConfigFormControlComponent>
  /** The label of the final button. @default "Submit" */
  submitLabel?: string
  class?: string
}

/** A step after the wizard resolves it: `review` appends one of its own. */
interface ResolvedStep<TValues extends object> {
  id: string
  label: string
  description?: string
  validate?: WizardStep<TValues>['validate']
  content?: JSX.Element | WizardStepField<TValues>[]
  /** The synthesized summary step, which no caller declared. */
  isReview: boolean
}

/** The cause the wizard writes its step errors under. */
const WIZARD_ERROR_CAUSE = 'wizard'

/** Debounce for value persistence — a keystroke is not a checkpoint. */
const RESUME_DEBOUNCE = 300

/** True when `path` is one of the step's fields, or lives under it. */
function belongsToStep(path: string, names: readonly string[]): boolean {
  return names.some(
    (name) =>
      path === name ||
      path.startsWith(`${name}.`) ||
      path.startsWith(`${name}[`),
  )
}

/** Read `smtp.host` or `items[1].title` out of a document. */
function readPath(root: unknown, path: string): unknown {
  let current: unknown = root
  for (const key of path
    .replace(/\[/g, '.')
    .replace(/\]/g, '')
    .split('.')
    .filter(Boolean)) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

/** The summary's rendering of a value: readable, and never an empty row. */
function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.map(formatValue).join(', ')
  if (value instanceof Date) return value.toLocaleString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/**
 * The wizard organism: a multi-step flow over a form. It is the composition of
 * two things that already exist — `Stepper` for progress and navigation,
 * `ConfigForm`'s renderer for the fields — plus the three things every
 * multi-step page was writing by hand: the gate between steps, the review that
 * closes the flow, and the state that survives a closed tab.
 *
 * The gate is per step and runs on the attempt to leave, so an unreached step
 * is never shown red; the errors it raises land on the fields, through the
 * same `error` contract every other field uses. `onSubmit` stays the save
 * path — `resume` is only ever a place to come back to.
 */
export function Wizard<TValues extends object = Record<string, unknown>>(
  props: WizardProps<TValues>,
): JSX.Element {
  // The control map is fixed, so the renderer is built once, like ConfigForm's.
  /* eslint-disable solid/reactivity */
  const renderField = createFormRenderer(props.components ?? {})
  /* eslint-enable solid/reactivity */

  const steps = createMemo((): ResolvedStep<TValues>[] => {
    const resolved: ResolvedStep<TValues>[] = props.steps.map((step) => ({
      id: step.id,
      label: step.label,
      ...(step.description !== undefined
        ? { description: step.description }
        : {}),
      validate: step.validate,
      content: step.content,
      isReview: false,
    }))
    if (props.review) {
      resolved.push({ id: WIZARD_REVIEW_STEP, label: 'Review', isReview: true })
    }
    return resolved
  })

  // A `JSX.Element` is structurally array-ish, so the narrowing is a cast on
  // what the caller declared: an array `content` is fields, never markup.
  const fieldsOf = (
    step?: ResolvedStep<TValues>,
  ): WizardStepField<TValues>[] =>
    Array.isArray(step?.content)
      ? (step.content as WizardStepField<TValues>[])
      : []

  /** The step's fields, keyed by path — what the renderer binds against. */
  const fieldMapOf = (
    step?: ResolvedStep<TValues>,
  ): [string, ConfigFormField<TValues>][] =>
    fieldsOf(step).map(({ name, ...config }) => [name, config])

  // A setup-time subscription for the whole component, the same one ConfigForm
  // takes: the selector is called once and the accessor it returns is reactive.
  /* eslint-disable solid/reactivity */
  const values = props.form.useSelector(
    (state) => state.values,
  ) as Accessor<TValues>
  /* eslint-enable solid/reactivity */

  // --- resume ---------------------------------------------------------------
  const remembered = (): WizardResumeDoc<TValues> | undefined => {
    const { store, id } = props.resume ?? {}
    if (!store || !id) return undefined
    return store.load<WizardResumeDoc<TValues>>(id)?.doc
  }

  const rememberedStep = () => {
    const doc = remembered()
    if (!doc || typeof doc.step !== 'string') return undefined
    return steps().some((entry) => entry.id === doc.step) ? doc.step : undefined
  }

  const [currentStep, setCurrentStep] = createControllableSignal<string>({
    value: () => props.currentStep,
    // A remembered step wins over `defaultStep`: coming back is the point.
    defaultValue:
      rememberedStep() ??
      props.defaultStep ??
      steps()[0]?.id ??
      WIZARD_REVIEW_STEP,
    onChange: (next) => props.onCurrentStepChange?.(next),
  })

  const stepIndex = () => {
    const index = steps().findIndex((entry) => entry.id === currentStep())
    return index === -1 ? 0 : index
  }
  const step = () => steps()[stepIndex()]
  const isReviewStep = () => step()?.isReview === true
  const isFirst = () => stepIndex() === 0
  const isLast = () => stepIndex() >= steps().length - 1

  // Both halves are setup-time reads of storage, not tracked ones: the wizard
  // restores once, at mount. `reset(values)` is the public way to hand a form a
  // whole document — the draft becomes the baseline a later reset returns to.
  /* eslint-disable solid/reactivity */
  const rememberedDoc = remembered()
  if (rememberedDoc && rememberedDoc.values !== undefined) {
    props.form.reset(rememberedDoc.values)
  }
  /* eslint-enable solid/reactivity */

  // --- step errors ----------------------------------------------------------
  const [stepErrors, setStepErrors] = createSignal<string[]>([])
  /** The fields carrying a wizard error, so leaving or fixing clears them. */
  let flagged: string[] = []

  const setWizardError = (path: string, message: string | undefined) => {
    props.form.setFieldMeta(path, (prev: any) => ({
      ...prev,
      errorMap: {
        ...(prev?.errorMap ?? {}),
        [WIZARD_ERROR_CAUSE]: message,
      },
    }))
  }

  const clearFlagged = () => {
    for (const path of flagged) setWizardError(path, undefined)
    flagged = []
  }

  const clearStepErrors = () => {
    clearFlagged()
    setStepErrors([])
  }

  // An error the user has fixed is an error that should stop being shown, so
  // the wizard's own errors go away the moment the document changes.
  createEffect(() => {
    values()
    if (flagged.length > 0) clearFlagged()
  })

  /** Run one step's gate; `false` means the step did not pass. */
  const gate = async (target?: ResolvedStep<TValues>): Promise<boolean> => {
    clearStepErrors()
    const result = await target?.validate?.(values())
    if (result === undefined) return true
    if (typeof result === 'string') {
      setStepErrors([result])
      return false
    }
    if (Array.isArray(result)) {
      setStepErrors(result)
      return false
    }
    // A map: the messages belong to fields, so they go to the fields' own
    // error state and render through the `error` contract like any other.
    // A path this step does not own has no field to carry it, and a gate that
    // blocks without saying so is the one failure mode that must not happen.
    const names = fieldsOf(target).map((field) => field.name)
    const matched: string[] = []
    const orphans: string[] = []
    for (const [path, message] of Object.entries(result)) {
      const text = Array.isArray(message) ? message.join(' ') : message
      if (belongsToStep(path, names)) {
        setWizardError(path, text)
        matched.push(path)
      } else {
        orphans.push(`${path}: ${text}`)
      }
    }
    flagged = matched
    if (orphans.length > 0) setStepErrors(orphans)
    return false
  }

  const goTo = (id: string) => {
    if (!steps().some((entry) => entry.id === id)) return
    setCurrentStep(id)
  }

  const goNext = async () => {
    if (isLast()) return
    const target = steps()[stepIndex() + 1]
    if (!target) return
    if (await gate(step())) goTo(target.id)
  }

  /** Back is never gated: a step already passed is a step already answered. */
  const goBack = () => {
    if (isFirst()) return
    const target = steps()[stepIndex() - 1]
    if (!target) return
    clearStepErrors()
    goTo(target.id)
  }

  const [submitting, setSubmitting] = createSignal(false)

  const finish = async () => {
    if (!(await gate(step()))) return
    setSubmitting(true)
    try {
      if (props.onSubmit) {
        await props.onSubmit(values(), { reset: () => props.form.reset() })
      } else {
        await props.form.handleSubmit()
      }
      // The document is saved; there is nothing left to come back to.
      const { store, id } = props.resume ?? {}
      if (store && id) store.remove(id)
    } catch (error) {
      setStepErrors([error instanceof Error ? error.message : String(error)])
      return
    } finally {
      setSubmitting(false)
    }
  }

  // --- persistence ----------------------------------------------------------
  const persist = () => {
    const { store, id } = props.resume ?? {}
    if (!store || !id) return
    store.save(
      id,
      { step: currentStep(), values: values() },
      { type: 'wizard' },
    )
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  const persistSoon = () => {
    clearTimeout(timer)
    timer = setTimeout(persist, RESUME_DEBOUNCE)
  }

  // A step change is a decision, so it is written at once; typing is not.
  createEffect(() => {
    currentStep()
    persist()
  })
  createEffect(() => {
    values()
    persistSoon()
  })
  onCleanup(() => {
    clearTimeout(timer)
    clearFlagged()
  })

  // --- review ---------------------------------------------------------------
  interface ReviewGroup {
    step: string
    rows: { label: string; value: string }[]
  }

  const reviewGroups = createMemo<ReviewGroup[]>(() => {
    const document = values()
    const groups: ReviewGroup[] = []
    for (const entry of steps()) {
      if (entry.isReview) continue
      const rows = fieldsOf(entry)
        .filter((field) => !field.when || field.when(document))
        .map((field) => ({
          label: typeof field.label === 'string' ? field.label : field.name,
          value: formatValue(readPath(document, field.name)),
        }))
      if (rows.length > 0) groups.push({ step: entry.label, rows })
    }
    return groups
  })

  const stepperSteps = () =>
    steps().map((entry) => ({
      value: entry.id,
      label: entry.label,
      ...(entry.description !== undefined
        ? { description: entry.description }
        : {}),
    }))

  const stepFields = () => (isReviewStep() ? [] : fieldMapOf(step()))
  /** A step's own JSX, when it has any; an array `content` is fields, not body. */
  const stepBody = (): JSX.Element | undefined => {
    if (isReviewStep()) return undefined
    const content = step()?.content
    return content === undefined || Array.isArray(content) ? undefined : content
  }

  return (
    <div
      data-slot="wizard"
      class={cn('flex flex-col gap-section-gap', props.class)}
    >
      <div data-slot="wizard-progress">
        <Stepper
          steps={stepperSteps()}
          value={currentStep()}
          onValueChange={goTo}
          label={props.label}
        />
      </div>

      <section
        data-slot="wizard-content"
        aria-label={step()?.label}
        class="flex flex-col gap-field-gap"
      >
        <Show when={stepFields().length > 0}>
          <For each={stepFields()}>
            {([name, field]) => (
              <div data-slot="wizard-field">
                {renderField({ form: props.form, name, field, values })}
              </div>
            )}
          </For>
        </Show>
        <Show when={stepBody() !== undefined}>{stepBody()}</Show>
        <Show when={isReviewStep()}>
          <div data-slot="wizard-review" class="flex flex-col gap-field-gap">
            <For each={reviewGroups()}>
              {(group) => (
                <div data-slot="wizard-review-group">
                  <p class="text-caption text-ink-gray-6">{group.step}</p>
                  <dl class="mt-control-gap grid gap-control-gap sm:grid-cols-2">
                    <For each={group.rows}>
                      {(row) => (
                        <div data-slot="wizard-review-item">
                          <dt class="text-caption text-ink-gray-6">
                            {row.label}
                          </dt>
                          <dd
                            data-slot="wizard-review-value"
                            class="text-interface font-medium"
                          >
                            {row.value}
                          </dd>
                        </div>
                      )}
                    </For>
                  </dl>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Show when={stepErrors().length > 0}>
          <div
            data-slot="wizard-error"
            role="alert"
            class="text-caption text-ink-red-8"
          >
            <For each={stepErrors()}>{(message) => <div>{message}</div>}</For>
          </div>
        </Show>
      </section>

      <div
        data-slot="wizard-footer"
        class="flex flex-wrap items-center justify-between gap-control-gap border-t border-outline-gray-1 pt-card-pad-compact"
      >
        <Button
          data-slot="wizard-back"
          type="button"
          variant="outline"
          disabled={isFirst()}
          onClick={goBack}
        >
          Back
        </Button>
        <Show
          when={!isLast()}
          fallback={
            <Button
              data-slot="wizard-submit"
              type="button"
              variant="solid"
              theme="blue"
              loading={submitting()}
              onClick={() => {
                void finish()
              }}
            >
              {props.submitLabel ?? 'Submit'}
            </Button>
          }
        >
          <Button
            data-slot="wizard-next"
            type="button"
            variant="solid"
            theme="blue"
            onClick={() => {
              void goNext()
            }}
          >
            Next
          </Button>
        </Show>
      </div>
    </div>
  )
}
