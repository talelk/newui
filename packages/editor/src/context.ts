import type { Editor as TiptapEditor } from '@tiptap/core'
import { createContext, useContext } from 'solid-js'

/**
 * An accessor for the live TipTap instance, not the instance itself: the editor
 * is created in `onMount`, so a plain value captured at provider time would be
 * `null` forever. Every consumer calls the accessor inside its own reactive
 * scope.
 */
export type EditorAccessor = () => TiptapEditor | null

const EditorContext = createContext<EditorAccessor>()

export { EditorContext }

/**
 * Read the accessor an ancestor `<Editor>` published. `undefined` outside one.
 * Returned as an accessor (not the instance) so consumers stay reactive across
 * mount and unmount.
 */
export function useEditorAccessor(): EditorAccessor | undefined {
  return useContext(EditorContext)
}
