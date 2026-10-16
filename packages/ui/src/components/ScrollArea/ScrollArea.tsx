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
  const machineId = createId('scroll-area')
  const { api } = createZagApi<ScrollAreaApi>(zag.machine, zag.connect, () => ({
    id: machineId,
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
  const horizontal = () => orientation() === 'horizontal'

  return (
    <div
      {...api().getScrollbarProps({ orientation: orientation() })}
      data-slot="scroll-area-scrollbar"
      class={cn(
        // An overlay bar, not a gutter: `bg-transparent` and no reserved space,
        // so the content stays flush to the edge. It hides itself when its axis
        // does not overflow — the machine reports that as `data-overflow-*`, and
        // without this a perfectly short list still wears a gray strip.
        'group z-20 flex touch-none select-none bg-transparent p-0.5 transition-opacity duration-150 ease-out',
        horizontal()
          ? 'h-2.5 w-full flex-row data-[overflow-x=false]:hidden'
          : 'h-full w-2.5 flex-col data-[overflow-y=false]:hidden',
        // The track never takes a click: it overlays content, so an interactive
        // 10px gutter would swallow the click aimed at what is underneath it.
        'pointer-events-none',
        props.class,
      )}
    >
      <div
        {...api().getThumbProps({ orientation: orientation() })}
        data-slot="scroll-area-thumb"
        class={cn(
          // Fades in with the pointer or a scroll, and only then accepts a drag
          // — an invisible thumb that still grabs is a dead 10px strip.
          'relative flex-1 rounded-full bg-surface-gray-5 opacity-0 transition-opacity duration-150 ease-out',
          'group-data-[hover]:pointer-events-auto group-data-[dragging]:pointer-events-auto',
          'group-data-[hover]:opacity-100 group-data-[scrolling]:opacity-100 group-data-[dragging]:opacity-100',
          horizontal() ? 'h-full' : 'w-full',
        )}
      />
    </div>
  )
}

export const ScrollArea = { Root, Viewport, Scrollbar }
