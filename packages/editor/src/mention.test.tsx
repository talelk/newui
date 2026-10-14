import { render } from '@solidjs/testing-library'
import type { Editor as TiptapEditor } from '@tiptap/core'
import { createEffect, createSignal } from 'solid-js'
import { beforeAll, describe, expect, it } from 'vitest'
import { useEditorAccessor } from './context'
import { Editor } from './Editor'
import { filterMentionItems, type MentionItem } from './mention'

// jsdom has no geometry on ranges, and ProseMirror's `focus()` walks into it
// (`scrollToSelection` → `coordsAtPos` → `Range.getClientRects`) when a mention
// command focuses the editor. A zero rect is enough; layout is not under test.
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

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

/** Reads the editor `<Editor>` publishes, for tests that need the instance. */
function Probe(props: { onReady: (editor: TiptapEditor) => void }) {
  const accessor = useEditorAccessor()
  createEffect(() => {
    const editor = accessor?.()
    if (editor) props.onReady(editor)
  })
  return null
}

const ITEMS: MentionItem[] = [
  { id: 'u1', label: 'Ann' },
  { id: 'u2', label: 'Bob' },
  { id: 'u3', label: 'Anna' },
]

function setup(items: MentionItem[] = ITEMS, mentionChar = '@') {
  let instance: TiptapEditor | null = null
  const utils = render(() => (
    <Editor
      defaultValue="<p></p>"
      mentionChar={mentionChar}
      mentionItems={items}
    >
      <Probe
        onReady={(editor) => {
          instance = editor
        }}
      />
    </Editor>
  ))
  const editor = () => {
    if (!instance) throw new Error('editor not mounted')
    return instance
  }
  const popup = () =>
    document.querySelector('[data-slot="editor-mention-listbox"]')
  const options = () =>
    Array.from(
      document.querySelectorAll('[data-slot="editor-mention-option"]'),
    ).map((node) => node.textContent)
  const press = (key: string) =>
    editor().view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    )

  return { ...utils, editor, popup, options, press }
}

describe('filterMentionItems', () => {
  it('returns every item (capped) for an empty query', () => {
    expect(filterMentionItems(ITEMS, '')).toEqual(ITEMS)
  })

  it('matches case-insensitively anywhere in the label', () => {
    expect(filterMentionItems(ITEMS, 'an').map((item) => item.id)).toEqual([
      'u1',
      'u3',
    ])
    expect(filterMentionItems(ITEMS, 'BO').map((item) => item.id)).toEqual([
      'u2',
    ])
  })

  it('caps the list', () => {
    const many = Array.from({ length: 25 }, (_, index) => ({
      id: `u${index}`,
      label: `User ${index}`,
    }))
    expect(filterMentionItems(many, '')).toHaveLength(10)
  })
})

describe('Editor mention suggestion', () => {
  it('opens a portalled listbox of candidates when the trigger is typed', async () => {
    const { editor, popup, options } = setup()
    editor().commands.insertContent('@')
    await tick()

    // Portalled to <body>, not inside the render container.
    expect(document.body.contains(popup())).toBe(true)
    expect(popup()?.getAttribute('role')).toBe('listbox')
    expect(options()).toEqual(['Ann', 'Bob', 'Anna'])
    expect(
      document
        .querySelectorAll('[data-slot="editor-mention-option"]')[0]
        ?.getAttribute('role'),
    ).toBe('option')
  })

  it('filters the list by the typed query', async () => {
    const { editor, options } = setup()
    editor().commands.insertContent('@an')
    await tick()

    expect(options()).toEqual(['Ann', 'Anna'])
  })

  it('marks the first option active and points the editor at it', async () => {
    const { editor, popup } = setup()
    editor().commands.insertContent('@')
    await tick()

    const first = document.querySelector('[data-slot="editor-mention-option"]')
    expect(first?.getAttribute('aria-selected')).toBe('true')
    expect(editor().view.dom.getAttribute('aria-controls')).toBe(popup()?.id)
    expect(editor().view.dom.getAttribute('aria-activedescendant')).toBe(
      first?.id,
    )
  })

  it('moves the active option with the arrow keys and wraps', async () => {
    const { editor, press } = setup()
    editor().commands.insertContent('@')
    await tick()

    const activeId = () =>
      editor().view.dom.getAttribute('aria-activedescendant')
    const ids = Array.from(
      document.querySelectorAll('[data-slot="editor-mention-option"]'),
    ).map((node) => node.id)
    expect(activeId()).toBe(ids[0])

    press('ArrowDown')
    expect(activeId()).toBe(ids[1])

    press('ArrowDown')
    press('ArrowDown')
    expect(activeId()).toBe(ids[0]) // wrapped past the end

    press('ArrowUp')
    expect(activeId()).toBe(ids[2]) // wrapped before the start
  })

  it('inserts the active mention on Enter and closes the popup', async () => {
    const { editor, popup, press } = setup()
    editor().commands.insertContent('@')
    await tick()

    press('Enter')
    await tick()

    const html = editor().getHTML()
    expect(html).toContain('data-type="mention"')
    expect(html).toContain('data-id="u1"')
    expect(html).toContain('@Ann')
    expect(popup()).toBeNull()
    expect(editor().view.dom.getAttribute('aria-activedescendant')).toBeNull()
  })

  it('inserts the highlighted mention on Tab', async () => {
    const { editor, press } = setup()
    editor().commands.insertContent('@')
    await tick()
    press('ArrowDown')

    press('Tab')
    await tick()

    expect(editor().getHTML()).toContain('data-id="u2"')
  })

  it('dismisses on Escape', async () => {
    const { editor, popup, press } = setup()
    editor().commands.insertContent('@')
    await tick()
    expect(popup()).not.toBeNull()

    press('Escape')
    await tick()

    expect(popup()).toBeNull()
    expect(editor().view.dom.getAttribute('aria-activedescendant')).toBeNull()
  })

  it('reads the live candidate list on each query', async () => {
    const [items, setItems] = createSignal<MentionItem[]>(ITEMS)
    let instance: TiptapEditor | null = null
    render(() => (
      <Editor defaultValue="<p></p>" mentionItems={items()}>
        <Probe
          onReady={(editor) => {
            instance = editor
          }}
        />
      </Editor>
    ))
    const editor = instance as unknown as TiptapEditor
    const options = () =>
      Array.from(
        document.querySelectorAll('[data-slot="editor-mention-option"]'),
      ).map((node) => node.textContent)

    editor.commands.insertContent('@')
    await tick()
    expect(options()).toEqual(['Ann', 'Bob', 'Anna'])

    // The prop is read when the query runs, so a replacement list is used by the
    // next keystroke without rebuilding the editor.
    setItems([{ id: 'u9', label: 'Zoe' }])
    editor.commands.insertContent('z')
    await tick()
    expect(options()).toEqual(['Zoe'])
  })

  it('ships a suggestion-less node when mentionItems is omitted', async () => {
    let instance: TiptapEditor | null = null
    render(() => (
      <Editor defaultValue="<p></p>">
        <Probe
          onReady={(editor) => {
            instance = editor
          }}
        />
      </Editor>
    ))
    expect(instance).not.toBeNull()
    ;(instance as unknown as TiptapEditor).commands.insertContent('@')
    await tick()
    expect(document.querySelector('[data-slot="editor-mention-listbox"]')).toBe(
      null,
    )
  })
})
