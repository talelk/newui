import * as zag from '@zag-js/scroll-area'
import {
  type Accessor,
  createContext,
  type JSX,
  type ParentComponent,
  useContext,
} from 'solid-js'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'

type ScrollAreaApi = ReturnType<typeof zag.connect>

const ScrollAreaContext = createContext<Accessor<ScrollAreaApi>>()

function useApi() {
  const ctx = useContext(ScrollAreaContext)
  if (!ctx)
    throw new Error('ScrollArea parts must be used within <ScrollArea.Root>')
  return ctx
}

export interface ScrollAreaRootProps {
  class?: string
  children: JSX.Element
}

const Root: ParentComponent<ScrollAreaRootProps> = (props) => {
  const { api } = createZagApi<ScrollAreaApi>(zag.machine, zag.connect, () => ({
    id: createId('scroll-area'),
  }))
  return (
    <ScrollAreaContext.Provider value={api}>
      <div
        {...api().getRootProps()}
        data-slot="scroll-area"
        class={cn('relative overflow-hidden', props.class)}
      >
        {props.children}
      </div>
    </ScrollAreaContext.Provider>
  )
}

export interface ScrollAreaViewportProps {
  class?: string
  children?: JSX.Element
}

/**
 * The scroller. `viewportClass` is the one class-injection prop in the library
 * (P10's carve-out): the viewport is an element the machine owns inside the
 * root, so a layout rule that has to sit on the scroller itself has nowhere
 * else to go.
 */
const Viewport: ParentComponent<ScrollAreaViewportProps> = (props) => {
  const api = useApi()
  return (
    <div
      {...api().getViewportProps()}
      data-slot="scroll-area-viewport"
      class={cn('h-full w-full', props.class)}
    >
      {props.children}
    </div>
  )
}

export interface ScrollAreaScrollbarProps {
  orientation?: 'vertical' | 'horizontal'
  class?: string
}

const Scrollbar: ParentComponent<ScrollAreaScrollbarProps> = (props) => {
  const api = useApi()
  const orientation = () => props.orientation ?? 'vertical'
  return (
    <div
      {...api().getScrollbarProps({ orientation: orientation() })}
      data-slot="scroll-area-scrollbar"
      class={cn(
        'flex touch-none select-none bg-surface-gray-2 transition-opacity',
        orientation() === 'vertical'
          ? 'h-full w-2 flex-col'
          : 'h-2 w-full flex-row',
        props.class,
      )}
    >
      <div
        {...api().getThumbProps({ orientation: orientation() })}
        data-slot="scroll-area-thumb"
        class={cn(
          'relative rounded-full bg-surface-gray-5',
          orientation() === 'vertical' ? 'w-full' : 'h-full',
        )}
      />
    </div>
  )
}

export const ScrollArea = { Root, Viewport, Scrollbar }
