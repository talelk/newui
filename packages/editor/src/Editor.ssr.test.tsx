import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { Editor } from './Editor'
import { EditorToolbar } from './EditorToolbar'

describe('Editor SSR smoke', () => {
  it('renders the container to a string without a DOM', () => {
    const html = renderToString(() => <Editor defaultValue="<p>Hi</p>" />)
    expect(html).toContain('data-slot="editor"')
    expect(html).toContain('data-slot="editor-surface"')
  })

  it('renders the root class fallthrough', () => {
    const html = renderToString(() => (
      <Editor class="my-editor" aria-label="Note" />
    ))
    expect(html).toContain('my-editor')
  })

  it('renders the toolbar shell without an editor', () => {
    const html = renderToString(() => <EditorToolbar />)
    expect(html).toContain('data-slot="editor-toolbar"')
    expect(html).toContain('data-action="bold"')
  })
})
