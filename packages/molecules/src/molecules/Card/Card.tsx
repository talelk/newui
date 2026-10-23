import { cn, tv, type VariantProps } from '@talelk/newui-atoms/internal'
import { type JSX, type ParentComponent, splitProps } from 'solid-js'

export const card = tv({
  base: 'flex flex-col rounded-card border border-outline-gray-1 bg-surface-elevation-1 text-ink-gray-9',
  variants: {
    elevation: {
      none: '',
      sm: 'shadow-sm',
      base: 'shadow-base',
      md: 'shadow-md',
      lg: 'shadow-lg',
    },
    padding: {
      none: '',
      sm: 'p-card-pad-compact',
      md: 'p-card-pad',
      lg: 'p-card-pad-wide',
    },
  },
  defaultVariants: { elevation: 'none', padding: 'sm' },
})

export interface CardProps extends VariantProps<typeof card> {
  class?: string
  children?: JSX.Element
}

export function Card(props: CardProps): JSX.Element {
  const [local] = splitProps(props, [
    'elevation',
    'padding',
    'class',
    'children',
  ])
  return (
    <div
      data-slot="card"
      class={cn(
        card({ elevation: local.elevation, padding: local.padding }),
        local.class,
      )}
    >
      {local.children}
    </div>
  )
}

interface PartProps {
  class?: string
  children?: JSX.Element
}

export const CardHeader: ParentComponent<PartProps> = (props) => (
  <div data-slot="card-header" class={cn('flex flex-col gap-1', props.class)}>
    {props.children}
  </div>
)

export const CardTitle: ParentComponent<PartProps> = (props) => (
  <h3
    data-slot="card-title"
    class={cn('text-section text-ink-gray-9', props.class)}
  >
    {props.children}
  </h3>
)

export const CardDescription: ParentComponent<PartProps> = (props) => (
  <p
    data-slot="card-description"
    class={cn('text-interface text-ink-gray-6', props.class)}
  >
    {props.children}
  </p>
)

export const CardContent: ParentComponent<PartProps> = (props) => (
  <div
    data-slot="card-content"
    class={cn('flex-1 text-base text-ink-gray-8', props.class)}
  >
    {props.children}
  </div>
)

export const CardFooter: ParentComponent<PartProps> = (props) => (
  <div
    data-slot="card-footer"
    class={cn('mt-4 flex items-center gap-2', props.class)}
  >
    {props.children}
  </div>
)
