import { render } from '@solidjs/testing-library'
import {
  Extension,
  type JSONContent,
  type Editor as TiptapEditor,
} from '@tiptap/core'
import { Bold } from '@tiptap/extension-bold'
import { createEffect, createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { useEditorAccessor } from './context'
import { Editor, normalizeContent, setPlaceholder } from './Editor'

/** Reads the editor `<Editor>` publishes, for tests that need the instance. */
function Probe(props: { onReady: (editor: TiptapEditor) => void }) {
  const accessor = useEditorAccessor()
  createEffect(() => {
    const editor = accessor?.()
    if (editor) props.onReady(editor)
  })
  return null
}

/** A structural stand-in for the two fields `setPlaceholder` touches. */
function fakeEditor(overrides: Record<string, unknown> = {}) {
  return {
    isDestroyed: false,
    storage: { placeholder: { text: '' } },
    state: { tr: { id: 'tr' } },
    view: { dispatch: vi.fn() },
    ...overrides,
  } as unknown as TiptapEditor
}

describe('normalizeContent', () => {
  it('coerces null and undefined to an empty document', () => {
    expect(normalizeContent(null)).toBe('')
    expect(normalizeContent(undefined)).toBe('')
  })

  it('passes strings through unchanged', () => {
    expect(normalizeContent('<p>hi</p>')).toBe('<p>hi</p>')
    expect(normalizeContent('')).toBe('')
  })
})

describe('setPlaceholder', () => {
  it('writes the text and refreshes the decoration', () => {
    const editor = fakeEditor()
    setPlaceholder(editor, 'Write…')
    const storage = editor.storage as unknown as {
      placeholder: { text: string }
    }
    expect(storage.placeholder.text).toBe('Write…')
    expect(editor.view.dispatch).toHaveBeenCalledTimes(1)
  })

  it('is a no-op when the text is unchanged', () => {
    const editor = fakeEditor()
    setPlaceholder(editor, 'Same')
    setPlaceholder(editor, 'Same')
    expect(editor.view.dispatch).toHaveBeenCalledTimes(1)
  })

  it('is a no-op for a missing or destroyed editor', () => {
    expect(() => setPlaceholder(null, 'x')).not.toThrow()
    expect(() => setPlaceholder(undefined, 'x')).not.toThrow()
    const destroyed = fakeEditor({ isDestroyed: true })
    setPlaceholder(destroyed, 'x')
    expect(destroyed.view.dispatch).not.toHaveBeenCalled()
  })

  it('is a no-op when the Placeholder extension is not loaded', () => {
    const editor = fakeEditor({ storage: {} })
    expect(() => setPlaceholder(editor, 'x')).not.toThrow()
    expect(editor.view.dispatch).not.toHaveBeenCalled()
  })
})

describe('Editor', () => {
  it('renders the root and the surface with styling hooks', () => {
    const { container } = render(() => <Editor />)
    expect(container.querySelector('[data-slot="editor"]')).not.toBeNull()
    expect(
      container.querySelector('[data-slot="editor-surface"]'),
    ).not.toBeNull()
  })

  it('mounts a TipTap view without crashing', () => {
    const { container } = render(() => <Editor defaultValue="<p>Hello</p>" />)
    // jsdom does not lay the document out, but ProseMirror still constructs its
    // DOM, which is the mount/no-crash contract this test pins.
    const surface = container.querySelector('.tiptap')
    expect(surface).not.toBeNull()
    expect(surface?.textContent).toContain('Hello')
  })

  it('exposes the editable surface with its ARIA wiring', () => {
    const { container } = render(() => (
      <Editor defaultValue="<p>x</p>" aria-label="Note" />
    ))
    const surface = container.querySelector('.tiptap')
    expect(surface?.getAttribute('contenteditable')).toBe('true')
    expect(surface?.getAttribute('aria-label')).toBe('Note')
    expect(surface?.getAttribute('role')).toBe('textbox')
  })

  it('writes an external controlled value into the document', async () => {
    const [value, setValue] = createSignal('<p>a</p>')
    const { container } = render(() => <Editor value={value()} />)
    setValue('<p>abc</p>')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(container.querySelector('.tiptap')?.textContent).toContain('abc')
  })

  it('reports edits through onValueChange', async () => {
    const onValueChange = vi.fn()
    let instance: TiptapEditor | null = null
    render(() => (
      <Editor defaultValue="<p>a</p>" onValueChange={onValueChange}>
        <Probe
          onReady={(editor) => {
            instance = editor
          }}
        />
      </Editor>
    ))
    expect(instance).not.toBeNull()
    ;(instance as unknown as TiptapEditor).commands.insertContent('b')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(onValueChange).toHaveBeenCalled()
    expect(onValueChange).toHaveBeenLastCalledWith(expect.stringContaining('b'))
  })

  it('shows the placeholder while the document is empty', () => {
    const { container } = render(() => <Editor placeholder="Write…" />)
    expect(container.querySelector('[data-placeholder]')).not.toBeNull()
  })

  it('applies the class fallthrough', () => {
    const { container } = render(() => <Editor class="my-editor" />)
    const root = container.querySelector('[data-slot="editor"]')
    expect(root?.className).toContain('my-editor')
  })

  it('renders read-only when readonly is set', () => {
    const { container } = render(() => (
      <Editor defaultValue="<p>x</p>" readonly />
    ))
    expect(
      container.querySelector('.tiptap')?.getAttribute('contenteditable'),
    ).toBe('false')
  })

  it('ships table and image nodes in the default schema', () => {
    let instance: TiptapEditor | null = null
    render(() => (
      <Editor defaultValue="<p>x</p>">
        <Probe
          onReady={(editor) => {
            instance = editor
          }}
        />
      </Editor>
    ))
    expect(instance).not.toBeNull()
    ;(instance as unknown as TiptapEditor)
      .chain()
      .focus()
      .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
      .run()
    expect((instance as unknown as TiptapEditor).getHTML()).toContain('<table')
    ;(instance as unknown as TiptapEditor)
      .chain()
      .focus()
      .setImage({ src: 'https://example.com/x.png' })
      .run()
    expect((instance as unknown as TiptapEditor).getHTML()).toContain('<img')
  })

  it('enables table column resizing', () => {
    let instance: TiptapEditor | null = null
    const { container } = render(() => (
      <Editor defaultValue="<p>x</p>">
        <Probe
          onReady={(editor) => {
            instance = editor
          }}
        />
      </Editor>
    ))
    expect(instance).not.toBeNull()
    const table = (
      instance as unknown as TiptapEditor
    ).extensionManager.extensions.find(
      (extension) => extension.name === 'table',
    )
    expect(table?.options.resizable).toBe(true)

    ;(instance as unknown as TiptapEditor)
      .chain()
      .focus()
      .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
      .run()
    // The resizable path renders through the extension's own table view, which
    // wraps the table in the scroll container that owns the resize handles.
    expect(container.querySelector('.tableWrapper')).not.toBeNull()
  })

  it('enables image resizing with drag handles', () => {
    let instance: TiptapEditor | null = null
    const { container } = render(() => (
      <Editor defaultValue="<p>x</p>">
        <Probe
          onReady={(editor) => {
            instance = editor
          }}
        />
      </Editor>
    ))
    expect(instance).not.toBeNull()
    const image = (
      instance as unknown as TiptapEditor
    ).extensionManager.extensions.find(
      (extension) => extension.name === 'image',
    )
    expect(image?.options.resize).toMatchObject({ enabled: true })

    ;(instance as unknown as TiptapEditor)
      .chain()
      .focus()
      .setImage({ src: 'https://example.com/x.png' })
      .run()
    // TipTap's `ResizableNodeView` wraps the image and attaches its handles.
    expect(container.querySelector('[data-resize-wrapper]')).not.toBeNull()
  })

  it('renders a suggestion-less mention with the configured char', () => {
    let instance: TiptapEditor | null = null
    render(() => (
      <Editor mentionChar="#" defaultValue="<p>x</p>">
        <Probe
          onReady={(editor) => {
            instance = editor
          }}
        />
      </Editor>
    ))
    expect(instance).not.toBeNull()
    ;(instance as unknown as TiptapEditor).commands.insertContent({
      type: 'mention',
      attrs: { id: 'u1', label: 'Ann' },
    })
    const html = (instance as unknown as TiptapEditor).getHTML()
    expect(html).toContain('data-type="mention"')
    expect(html).toContain('#Ann')
  })

  it('merges consumer extensions after the built-ins', () => {
    const Custom = Extension.create({ name: 'customTest' })
    let instance: TiptapEditor | null = null
    render(() => (
      <Editor extensions={[Custom]}>
        <Probe
          onReady={(editor) => {
            instance = editor
          }}
        />
      </Editor>
    ))
    expect(instance).not.toBeNull()
    const names = (
      instance as unknown as TiptapEditor
    ).extensionManager.extensions.map((extension) => extension.name)
    expect(names).toContain('customTest')
  })

  it('lets a consumer extension replace a same-named built-in', () => {
    let instance: TiptapEditor | null = null
    render(() => (
      <Editor extensions={[Bold]}>
        <Probe
          onReady={(editor) => {
            instance = editor
          }}
        />
      </Editor>
    ))
    expect(instance).not.toBeNull()
    const boldCount = (
      instance as unknown as TiptapEditor
    ).extensionManager.extensions.filter(
      (extension) => extension.name === 'bold',
    ).length
    expect(boldCount).toBe(1)
  })

  it('speaks JSON when format is json', async () => {
    const [value, setValue] = createSignal<JSONContent>({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }],
    })
    const { container } = render(() => <Editor format="json" value={value()} />)
    expect(container.querySelector('.tiptap')?.textContent).toContain('a')

    setValue({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'abc' }] },
      ],
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(container.querySelector('.tiptap')?.textContent).toContain('abc')
  })

  it('reports JSON edits through onValueChange', async () => {
    const onValueChange = vi.fn()
    let instance: TiptapEditor | null = null
    render(() => (
      <Editor
        format="json"
        defaultValue={{
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'a' }] },
          ],
        }}
        onValueChange={onValueChange}
      >
        <Probe
          onReady={(editor) => {
            instance = editor
          }}
        />
      </Editor>
    ))
    expect(instance).not.toBeNull()
    ;(instance as unknown as TiptapEditor).commands.insertContent('b')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(onValueChange).toHaveBeenCalled()
    const last = onValueChange.mock.calls.at(-1)?.[0]
    expect(typeof last).toBe('object')
    expect(JSON.stringify(last)).toContain('b')
  })

  it('parses and emits markdown when format is markdown', async () => {
    const [value, setValue] = createSignal('a')
    const onValueChange = vi.fn()
    const { container } = render(() => (
      <Editor format="markdown" value={value()} onValueChange={onValueChange} />
    ))
    expect(container.querySelector('.tiptap')?.textContent).toContain('a')

    setValue('**bold**')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(container.querySelector('.tiptap')?.innerHTML).toContain('<strong>')
  })
})
