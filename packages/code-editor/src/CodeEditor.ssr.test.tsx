import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { CodeEditor } from './CodeEditor'

describe('CodeEditor SSR smoke', () => {
  it('renders the container to a string without a DOM', () => {
    const html = renderToString(() => <CodeEditor defaultValue="SELECT 1" />)
    expect(html).toContain('data-slot="code-editor"')
  })

  it('renders the root class fallthrough', () => {
    const html = renderToString(() => (
      <CodeEditor class="my-editor" aria-label="Query" language="sql" />
    ))
    expect(html).toContain('my-editor')
  })
})
