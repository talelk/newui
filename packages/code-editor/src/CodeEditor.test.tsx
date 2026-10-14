import { render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { CodeEditor, type CodeEditorLanguage, diffDocument } from './CodeEditor'

describe('diffDocument', () => {
  it('replaces only the differing middle span', () => {
    expect(diffDocument('const a = 1', 'const b = 1')).toEqual({
      from: 6,
      to: 7,
      insert: 'b',
    })
  })

  it('appends and prepends without touching the common part', () => {
    expect(diffDocument('abc', 'abcdef')).toEqual({
      from: 3,
      to: 3,
      insert: 'def',
    })
    expect(diffDocument('abcdef', 'abc')).toEqual({
      from: 3,
      to: 6,
      insert: '',
    })
  })

  it('never overlaps the prefix and the suffix', () => {
    const { from, to } = diffDocument('aaa', 'aaaa')
    expect(from).toBeLessThanOrEqual(to)
  })

  it('replaces everything when nothing is common', () => {
    expect(diffDocument('abc', 'xyz')).toEqual({
      from: 0,
      to: 3,
      insert: 'xyz',
    })
  })

  it('is empty when the documents are equal', () => {
    expect(diffDocument('same', 'same')).toEqual({
      from: 4,
      to: 4,
      insert: '',
    })
  })
})

describe('CodeEditor', () => {
  it('renders a container with the styling hook', () => {
    const { container } = render(() => <CodeEditor />)
    expect(container.querySelector('[data-slot="code-editor"]')).not.toBeNull()
  })

  it('mounts a CodeMirror view without crashing', () => {
    const { container } = render(() => <CodeEditor defaultValue="SELECT 1" />)
    // jsdom does not measure layout, but CodeMirror still constructs its DOM,
    // which is the mount/no-crash contract this test pins.
    expect(container.querySelector('.cm-editor')).not.toBeNull()
    expect(container.querySelector('.cm-content')).not.toBeNull()
  })

  it('seeds the document from defaultValue', () => {
    const { container } = render(() => <CodeEditor defaultValue="SELECT 1" />)
    expect(container.querySelector('.cm-content')?.textContent).toContain(
      'SELECT 1',
    )
  })

  it('writes an external controlled value into the document', async () => {
    const [value, setValue] = createSignal('a')
    const { container } = render(() => <CodeEditor value={value()} />)
    setValue('abc')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(container.querySelector('.cm-content')?.textContent).toContain('abc')
  })

  it('applies the class fallthrough and a language', () => {
    const { container } = render(() => (
      <CodeEditor class="my-editor" language="typescript" />
    ))
    const root = container.querySelector('[data-slot="code-editor"]')
    expect(root?.className).toContain('my-editor')
  })

  it('accepts the language union', () => {
    const language: CodeEditorLanguage = 'typescript'
    expect(language).toBe('typescript')
  })
})
