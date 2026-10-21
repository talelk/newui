import {
  Icon,
  type InputSize,
  type InputVariant,
  TextInput,
  type TextInputProps,
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '@newui/atoms'
import { createControllableSignal } from '@newui/atoms/internal'
import { createSignal, type JSX, splitProps } from 'solid-js'

export interface PasswordProps
  extends Omit<
    TextInputProps,
    'type' | 'value' | 'onInput' | 'onKeyDown' | 'suffix'
  > {
  /** Controlled value. */
  value?: string
  /** Uncontrolled initial value. */
  defaultValue?: string
  /** Called on every user-initiated change (controlled or not). */
  onValueChange?: (value: string) => void
}

// Re-exported so consumers do not have to reach into TextInput for the sizing
// vocabulary a Password shares with it.
export type PasswordSize = InputSize
export type PasswordVariant = InputVariant

/**
 * A password field: a `TextInput` with a reveal toggle. The toggle is a button
 * (not an adornment), so it lives in the input's `suffix` with
 * `pointer-events-auto` — the socket TextInput wraps adornments in is
 * `pointer-events-none` so clicks fall through to the input.
 *
 * `Mod+I` / `Ctrl+I` toggles too, matching frappe-ui. The same labelling
 * contract as every input (P5) is inherited from `TextInput`.
 */
export function Password(props: PasswordProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
  ])

  const [value, setValue] = createControllableSignal<string>({
    value: () => local.value,
    defaultValue: local.defaultValue,
    onChange: (next) => local.onValueChange?.(next),
  })
  const [show, setShow] = createSignal(false)

  const toggle = () => setShow((current) => !current)
  const toggleLabel = () => (show() ? 'Hide password' : 'Show password')
  // A value masked by the server (frappe-ui's `*`) is not revealable.
  const showToggle = () => !value()?.includes('*')

  const onKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (
    event,
  ) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'i') {
      event.preventDefault()
      toggle()
    }
  }

  return (
    <TextInput
      {...rest}
      type={show() ? 'text' : 'password'}
      value={value()}
      onInput={(event) => setValue(event.currentTarget.value)}
      onKeyDown={onKeyDown}
      suffix={
        showToggle() ? (
          <TooltipRoot>
            <TooltipTrigger
              type="button"
              data-slot="password-toggle"
              disabled={props.disabled}
              aria-label={toggleLabel()}
              aria-pressed={show() ? 'true' : 'false'}
              aria-keyshortcuts="Control+I Meta+I"
              onClick={toggle}
              class="pointer-events-auto grid size-6 place-items-center rounded-3 text-ink-gray-5 transition-colors hover:bg-surface-gray-3 hover:text-ink-gray-7 disabled:pointer-events-none disabled:text-ink-gray-4"
            >
              <Icon
                icon={show() ? 'lucide-eye-off' : 'lucide-eye'}
                class="size-3.5"
              />
            </TooltipTrigger>
            <TooltipContent>
              <span class="flex items-center gap-1.5">
                {toggleLabel()}
                <span class="opacity-70">⌘I</span>
              </span>
            </TooltipContent>
          </TooltipRoot>
        ) : undefined
      }
    />
  )
}
