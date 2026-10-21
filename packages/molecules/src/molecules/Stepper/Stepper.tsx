import { cn, createControllableSignal } from '@newui/atoms/internal'
import { For, type JSX, Show } from 'solid-js'

export interface StepperStep {
  /** Stable id — the `value` the stepper reports. */
  value: string
  label: string
  /** Secondary line under the label. */
  description?: string
  disabled?: boolean
}

export interface StepperProps {
  steps: StepperStep[]
  /** The current step's `value`. */
  value?: string
  defaultValue?: string
  /** A completed (or, when `linear` is off, any) step was clicked. */
  onValueChange?: (value: string) => void
  /**
   * Default `true`: completed steps and the current step are clickable,
   * future steps are not — a wizard cannot be skipped. Turn off to let every
   * enabled step navigate (a progress overview).
   */
  linear?: boolean
  /** Accessible name for the navigation landmark, e.g. `Checkout progress`. */
  label: string
  class?: string
}

/**
 * Wizard progress. The document is an ordered list inside a navigation
 * landmark; markers read done (check), current (index + `aria-current`) or
 * upcoming. Clicking a reachable step reports it — showing the matching
 * panel is the caller's job.
 */
export function Stepper(props: StepperProps): JSX.Element {
  const [value, setValue] = createControllableSignal<string>({
    value: () => props.value,
    defaultValue: props.defaultValue ?? props.steps[0]?.value,
    onChange: (next) => props.onValueChange?.(next),
  })

  const currentIndex = () =>
    props.steps.findIndex((step) => step.value === value())

  const reachable = (index: number): boolean => {
    const step = props.steps[index]
    if (!step || step.disabled) return false
    if (props.linear !== false) return index <= currentIndex()
    return true
  }

  const state = (index: number): 'complete' | 'current' | 'upcoming' => {
    if (index < currentIndex()) return 'complete'
    if (index === currentIndex()) return 'current'
    return 'upcoming'
  }

  return (
    <nav aria-label={props.label} data-slot="stepper" class={props.class}>
      <ol class="flex w-full list-none flex-col gap-3 sm:flex-row sm:items-start sm:gap-0">
        <For each={props.steps}>
          {(step, index) => {
            const stepState = () => state(index())
            const clickable = () =>
              reachable(index()) && stepState() !== 'current'
            return (
              <li
                data-slot="stepper-step"
                data-state={stepState()}
                class="flex min-w-0 flex-1 items-start gap-2 sm:flex-col sm:gap-1"
              >
                <div class="flex min-w-0 flex-1 items-start gap-2">
                  <button
                    type="button"
                    data-slot="stepper-marker"
                    disabled={!clickable()}
                    aria-current={
                      stepState() === 'current' ? 'step' : undefined
                    }
                    aria-label={`${index() + 1}. ${step.label}`}
                    onClick={() => clickable() && setValue(step.value)}
                    class={cn(
                      'grid size-6 shrink-0 place-items-center rounded-full border text-xs tabular-nums transition-colors',
                      'data-[state=complete]:border-outline-gray-8 data-[state=complete]:bg-surface-gray-10 data-[state=complete]:text-ink-base',
                      'data-[state=current]:border-outline-blue-6 data-[state=current]:bg-surface-blue-8 data-[state=current]:text-ink-base',
                      'data-[state=upcoming]:border-outline-gray-3 data-[state=upcoming]:bg-surface-base data-[state=upcoming]:text-ink-gray-6',
                      'focus-visible:focus-ring',
                      'disabled:pointer-events-none data-[disabled]:text-ink-gray-4',
                      clickable() && 'cursor-pointer',
                    )}
                  >
                    <Show
                      when={stepState() === 'complete'}
                      fallback={<span>{index() + 1}</span>}
                    >
                      <span class="lucide-check size-3.5" aria-hidden="true" />
                    </Show>
                  </button>
                  <div class="min-w-0 sm:ps-1">
                    <span
                      data-slot="stepper-label"
                      class={cn(
                        'block truncate text-interface-medium',
                        stepState() === 'upcoming' && 'text-ink-gray-6',
                        step.disabled && 'text-ink-gray-4',
                      )}
                    >
                      {step.label}
                    </span>
                    <Show when={step.description}>
                      <span
                        data-slot="stepper-description"
                        class="block text-p-xs text-ink-gray-6"
                      >
                        {step.description}
                      </span>
                    </Show>
                  </div>
                </div>
              </li>
            )
          }}
        </For>
      </ol>
    </nav>
  )
}
