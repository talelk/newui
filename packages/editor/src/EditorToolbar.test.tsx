import { render } from '@solidjs/testing-library'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { Editor } from './Editor'
import { EditorToolbar } from './EditorToolbar'

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
    ).toBe(9)
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
