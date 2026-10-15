import { Editor, EditorToolbar, type EditorValue } from '@newui/editor'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [value, setValue] = createSignal<EditorValue>(
    '<p>Write a team update.</p>',
  )
  return (
    <Editor value={value()} onValueChange={setValue}>
      <EditorToolbar />
    </Editor>
  )
}
