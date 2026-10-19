import { render } from '@solidjs/testing-library'
import type { Editor as TiptapEditor } from '@tiptap/core'
import { createEffect, createSignal } from 'solid-js'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useEditorAccessor } from './context'
import { Editor } from './Editor'
import { EditorToolbar } from './EditorToolbar'

function Probe(props: { ready: (editor: TiptapEditor) => void }) {
  const accessor = useEditorAccessor()
  createEffect(() => {
    const editor = accessor?.()
    if (editor) props.ready(editor)
  })
  return null
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

// jsdom has no geometry on ranges, and ProseMirror's `focus()` walks into it
// (`scrollToSelection` → `coordsAtPos` → `Range.getClientRects`). A zero rect is
// enough for the command to run; layout is not what these tests pin. The repo's
// shared setup already polyfills `matchMedia`/observers for the same reason.
beforeAll(() => {
  const rect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => ({}),
    }) as DOMRect
  const proto = Range.prototype as unknown as {
    getClientRects?: () => DOMRectList
    getBoundingClientRect?: () => DOMRect
  }
  if (!proto.getClientRects) {
    proto.getClientRects = () => [rect()] as unknown as DOMRectList
    proto.getBoundingClientRect = () => rect()
  }
})

describe('EditorToolbar', () => {
  it('renders a toolbar with the lean action set', () => {
    const { container } = render(() => <EditorToolbar />)
    const toolbar = container.querySelector('[data-slot="editor-toolbar"]')
    expect(toolbar).not.toBeNull()
    expect(toolbar?.getAttribute('role')).toBe('toolbar')
    expect(
      container.querySelectorAll('[data-slot="editor-toolbar-item"]').length,
    ).toBe(13)
  })

  it('disables its buttons without an editor', () => {
    const { container } = render(() => <EditorToolbar />)
    const bold = container.querySelector(
      '[data-action="bold"]',
    ) as HTMLButtonElement
    expect(bold.disabled).toBe(true)
  })

  it('applies the class fallthrough and accessible name', () => {
    const { container } = render(() => (
      <EditorToolbar class="my-toolbar" aria-label="Formatting tools" />
    ))
    const toolbar = container.querySelector('[data-slot="editor-toolbar"]')
    expect(toolbar?.className).toContain('my-toolbar')
    expect(toolbar?.getAttribute('aria-label')).toBe('Formatting tools')
  })

  it('binds to the editor from <Editor> context', async () => {
    const { container } = render(() => (
      <Editor defaultValue="<p>a</p>">
        <EditorToolbar />
      </Editor>
    ))
    const bold = container.querySelector(
      '[data-action="bold"]',
    ) as HTMLButtonElement
    expect(bold.disabled).toBe(false)
    expect(bold.getAttribute('aria-pressed')).toBe('false')

    bold.click()
    await tick()
    expect(bold.getAttribute('aria-pressed')).toBe('true')
    expect(bold.getAttribute('data-active')).toBe('')
    expect(bold.getAttribute('data-state')).toBe('active')
  })

  it('toggles a heading and a list through their commands', async () => {
    const { container } = render(() => (
      <Editor defaultValue="<p>a</p>">
        <EditorToolbar />
      </Editor>
    ))
    const h1 = container.querySelector(
      '[data-action="heading-1"]',
    ) as HTMLButtonElement
    h1.click()
    await tick()
    expect(h1.getAttribute('aria-pressed')).toBe('true')

    const bullet = container.querySelector(
      '[data-action="bullet-list"]',
    ) as HTMLButtonElement
    bullet.click()
    await tick()
    expect(bullet.getAttribute('aria-pressed')).toBe('true')
  })

  it('inserts a table from the table action', async () => {
    const { container } = render(() => (
      <Editor defaultValue="<p>a</p>">
        <EditorToolbar />
      </Editor>
    ))
    const table = container.querySelector(
      '[data-action="table"]',
    ) as HTMLButtonElement
    table.click()
    await tick()
    expect(container.querySelector('.tiptap table')).not.toBeNull()
  })

  it('inserts an image from the prompt URL', async () => {
    const prompt = vi
      .spyOn(window, 'prompt')
      .mockReturnValue('https://example.com/pic.png')
    try {
      const { container } = render(() => (
        <Editor defaultValue="<p>a</p>">
          <EditorToolbar />
        </Editor>
      ))
      const image = container.querySelector(
        '[data-action="image"]',
      ) as HTMLButtonElement
      image.click()
      await tick()
      expect(prompt).toHaveBeenCalled()
      expect(container.querySelector('.tiptap img')?.getAttribute('src')).toBe(
        'https://example.com/pic.png',
      )
    } finally {
      prompt.mockRestore()
    }
  })

  it('leaves the document untouched when the image prompt is cancelled', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null)
    try {
      const { container } = render(() => (
        <Editor defaultValue="<p>a</p>">
          <EditorToolbar />
        </Editor>
      ))
      const image = container.querySelector(
        '[data-action="image"]',
      ) as HTMLButtonElement
      image.click()
      await tick()
      expect(container.querySelector('.tiptap img')).toBeNull()
    } finally {
      prompt.mockRestore()
    }
  })

  it('creates, edits, cancels and removes a selected link, with undo and redo', async () => {
    let instance: TiptapEditor | undefined
    const prompt = vi
      .spyOn(window, 'prompt')
      .mockReturnValue('https://example.com/one')
    const { container } = render(() => (
      <Editor defaultValue="<p>Project notes</p>">
        <Probe
          ready={(editor) => {
            instance = editor
          }}
        />
        <EditorToolbar />
      </Editor>
    ))
    const editor = instance as unknown as TiptapEditor
    const button = (action: string) =>
      container.querySelector(`[data-action="${action}"]`) as HTMLButtonElement
    expect(button('undo').disabled).toBe(true)
    expect(button('redo').disabled).toBe(true)
    editor.commands.selectAll()
    button('link').click()
    await tick()
    expect(container.querySelector('.tiptap a')?.getAttribute('href')).toBe(
      'https://example.com/one',
    )
    expect(button('link').getAttribute('aria-pressed')).toBe('true')
    prompt.mockReturnValue(null)
    button('link').click()
    await tick()
    expect(container.querySelector('.tiptap a')?.getAttribute('href')).toBe(
      'https://example.com/one',
    )
    prompt.mockReturnValue('https://example.com/two')
    button('link').click()
    await tick()
    expect(prompt).toHaveBeenLastCalledWith(
      'Link URL (leave empty to remove)',
      'https://example.com/one',
    )
    expect(container.querySelector('.tiptap a')?.getAttribute('href')).toBe(
      'https://example.com/two',
    )
    prompt.mockReturnValue('')
    button('link').click()
    await tick()
    expect(container.querySelector('.tiptap a')).toBeNull()
    expect(button('undo').disabled).toBe(false)
    button('undo').click()
    await tick()
    expect(button('redo').disabled).toBe(false)
    button('redo').click()
    await tick()
    expect(container.querySelector('.tiptap')?.textContent).toBe(
      'Project notes',
    )
    expect(container.querySelector('.tiptap a')).toBeNull()
  })

  it('disables formatting when readonly changes and restores it when editable', async () => {
    const [readonly, setReadonly] = createSignal(false)
    const { container } = render(() => (
      <Editor defaultValue="<p>Protected notes</p>" readonly={readonly()}>
        <EditorToolbar />
      </Editor>
    ))
    const bold = container.querySelector(
      '[data-action="bold"]',
    ) as HTMLButtonElement
    expect(bold.disabled).toBe(false)
    setReadonly(true)
    await tick()
    expect(bold.disabled).toBe(true)
    bold.click()
    expect(container.querySelector('.tiptap strong')).toBeNull()
    setReadonly(false)
    await tick()
    expect(bold.disabled).toBe(false)
  })

  it('does not report a pressed state for command actions', async () => {
    const { container } = render(() => (
      <Editor defaultValue="<p>a</p>">
        <EditorToolbar />
      </Editor>
    ))
    const table = container.querySelector(
      '[data-action="table"]',
    ) as HTMLButtonElement
    expect(table.getAttribute('aria-pressed')).toBeNull()
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})
