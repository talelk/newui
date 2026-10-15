import * as zag from '@zag-js/dialog'
import {
  createSignal,
  For,
  type JSX,
  type ParentComponent,
  Show,
  splitProps,
} from 'solid-js'
import { createDisclosure } from '../../lib/disclosure'
import { createId } from '../../lib/id'
import { Portal } from '../../lib/portal'
import { cn } from '../../lib/tv'
import { createZagApi, createZagContext, mergeProps } from '../../lib/zag'
import {
  Button,
  type ButtonSize,
  type ButtonTheme,
  type ButtonVariant,
} from '../Button'
import { Icon, type IconProp } from '../Icon'

type DialogApi = ReturnType<typeof zag.connect>

const { context, useApi } = createZagContext<DialogApi>('Dialog')

export type DialogSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'

/** Vertical placement: centred, or anchored near the top of the viewport. */
export type DialogPosition = 'center' | 'top'

/** Tone of the header icon badge. Unset renders the neutral gray badge. */
export type DialogTheme = 'amber' | 'blue' | 'red' | 'green'

/** One footer button: `Button` props plus a `{ close }` context. */
export interface DialogAction {
  label: string
  variant?: ButtonVariant
  theme?: ButtonTheme
  size?: ButtonSize
  icon?: IconProp
  disabled?: boolean
  loading?: boolean
  /** Called on click. With no handler the action closes the dialog. */
  onClick?: (context: { close: () => void }) => void | Promise<void>
}

export interface DialogRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  /** Allow outside-click and Escape to close. Default `true`. */
  dismissible?: boolean
  children: JSX.Element
}

const Root: ParentComponent<DialogRootProps> = (props) => {
  const dismissible = () => props.dismissible ?? true

  const [open, setOpen] = createDisclosure({
    value: () => props.open,
    defaultOpen: props.defaultOpen,
    onChange: (value) => props.onOpenChange?.(value),
  })

  const machineId = createId('dialog')
  const { api } = createZagApi<DialogApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    open: open(),
    modal: props.modal ?? true,
    closeOnEscape: dismissible(),
    closeOnInteractOutside: dismissible(),
    onOpenChange: (details: { open: boolean }) => setOpen(details.open),
  }))

  return <context.Provider value={api}>{props.children}</context.Provider>
}

interface PartProps {
  class?: string
  children?: JSX.Element
}

const Trigger: ParentComponent<
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'style'>
> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const api = useApi()
  return (
    <button
      {...mergeProps(api().getTriggerProps(), rest)}
      data-slot="dialog-trigger"
      class={local.class}
    >
      {local.children}
    </button>
  )
}

const SIZE: Record<DialogSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
}

const ICON_BG: Record<DialogTheme, string> = {
  amber: 'bg-surface-amber-2',
  blue: 'bg-surface-blue-2',
  red: 'bg-surface-red-2',
  green: 'bg-surface-green-2',
}

const ICON_INK: Record<DialogTheme, string> = {
  amber: 'text-ink-amber-5',
  blue: 'text-ink-blue-5',
  red: 'text-ink-red-7',
  green: 'text-ink-green-5',
}

export interface DialogHeaderProps extends PartProps {
  /** Lucide name or component (P11); renders a themed badge beside the title. */
  icon?: IconProp
  /** Tone of the icon badge. */
  theme?: DialogTheme
}

const Header: ParentComponent<DialogHeaderProps> = (props) => (
  <header
    data-slot="dialog-header"
    class={cn('flex flex-col gap-1', props.class)}
  >
    <Show when={props.icon} fallback={props.children}>
      <div class="flex items-center gap-2">
        <span
          data-slot="dialog-icon"
          data-theme={props.theme}
          class={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full',
            props.theme ? ICON_BG[props.theme] : 'bg-surface-gray-2',
          )}
        >
          <Icon
            icon={props.icon}
            class={cn(
              'size-4',
              props.theme ? ICON_INK[props.theme] : 'text-ink-gray-5',
            )}
          />
        </span>
        <div class="flex min-w-0 flex-1 flex-col gap-1">{props.children}</div>
      </div>
    </Show>
  </header>
)

const Title: ParentComponent<PartProps> = (props) => {
  const api = useApi()
  return (
    <h2
      {...api().getTitleProps()}
      data-slot="dialog-title"
      class={cn('text-2xl-semibold leading-6 text-ink-gray-8', props.class)}
    >
      {props.children}
    </h2>
  )
}

const Description: ParentComponent<PartProps> = (props) => {
  const api = useApi()
  return (
    <p
      {...api().getDescriptionProps()}
      data-slot="dialog-description"
      class={cn('text-p-base text-ink-gray-7', props.class)}
    >
      {props.children}
    </p>
  )
}

function DialogActionButton(props: {
  action: DialogAction
  close: () => void
}): JSX.Element {
  const [busy, setBusy] = createSignal(false)

  const handleClick = async () => {
    const onClick = props.action.onClick
    if (!onClick) {
      props.close()
      return
    }
    setBusy(true)
    try {
      await onClick({ close: props.close })
    } finally {
      setBusy(false)
    }
  }

  const buttonProps = () => {
    const action = props.action
    return {
      variant: action.variant,
      theme: action.theme,
      size: action.size,
      icon: action.icon,
      disabled: action.disabled,
    }
  }

  return (
    <Button
      {...buttonProps()}
      label={props.action.label}
      loading={busy() || Boolean(props.action.loading)}
      onClick={handleClick}
    />
  )
}

export interface DialogFooterProps extends PartProps {
  /**
   * Footer buttons, rendered as a row. Each takes `Button` props plus an
   * `onClick({ close })`; with no handler the button closes the dialog.
   * Overrides `children` when non-empty.
   */
  actions?: DialogAction[]
}

const Footer: ParentComponent<DialogFooterProps> = (props) => {
  const api = useApi()
  const close = () => api().setOpen(false)
  return (
    <footer
      data-slot="dialog-footer"
      class={cn('mt-4 flex justify-end gap-2', props.class)}
    >
      <Show when={props.actions?.length} fallback={props.children}>
        <For each={props.actions}>
          {(action) => <DialogActionButton action={action} close={close} />}
        </For>
      </Show>
    </footer>
  )
}

const Close: ParentComponent<PartProps> = (props) => {
  const api = useApi()
  return (
    <button
      {...api().getCloseTriggerProps()}
      data-slot="dialog-close"
      class={props.class}
    >
      {props.children}
    </button>
  )
}

export interface DialogContentProps extends PartProps {
  /** Max-width of the dialog. Default `'lg'`. */
  size?: DialogSize
  /** Vertical placement. Default `'center'`. */
  position?: DialogPosition
  /** Drop the default padding so content fills the card. */
  bare?: boolean
}

const Content: ParentComponent<DialogContentProps> = (props) => {
  const api = useApi()
  const size = () => props.size ?? 'lg'
  const position = () => props.position ?? 'center'
  return (
    <Show when={api().open}>
      <Portal>
        <div
          {...api().getBackdropProps()}
          data-slot="dialog-backdrop"
          class="fixed inset-0 z-50 bg-black-overlay-200 dark:bg-black-overlay-700"
        />
        <div
          {...api().getPositionerProps()}
          data-slot="dialog-positioner"
          data-position={position()}
          class={cn(
            'fixed inset-0 z-50 flex justify-center overflow-y-auto p-4',
            position() === 'top' ? 'items-start pt-[20vh]' : 'items-center',
          )}
        >
          <div
            {...api().getContentProps()}
            data-slot="dialog-content"
            data-size={size()}
            class={cn(
              'relative z-50 w-full overflow-hidden rounded-6 border border-outline-gray-1 bg-surface-elevation-1 text-ink-gray-9 shadow-xl',
              'focus-visible:outline-none',
              SIZE[size()],
              props.bare ? '' : 'p-4',
              props.class,
            )}
          >
            {props.children}
          </div>
        </div>
      </Portal>
    </Show>
  )
}

export const Dialog = {
  Root,
  Trigger,
  Content,
  Header,
  Title,
  Description,
  Footer,
  Close,
}

export type { DialogRootProps as DialogProps }
