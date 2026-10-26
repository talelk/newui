import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Editor } from './Editor'
import { EditorToolbar } from './EditorToolbar'

describe('Editor (browser, real engine)', () => {
  it('accepts typing and reports the document as HTML', async () => {
    const seen: string[] = []
    render(() => (
      <Editor
        defaultValue="<p></p>"
        onValueChange={(value) => seen.push(String(value))}
        aria-label="Report body"
      />
    ))
    const surface = screen.getByRole('textbox', { name: 'Report body' })
    await userEvent.click(surface)
    await userEvent.keyboard('Quarterly summary')
    expect(surface.textContent).toContain('Quarterly summary')
    expect(seen.some((value) => value.includes('Quarterly summary'))).toBe(true)
  })

  it('keeps the editable box non-zero with the toolbar present', () => {
    render(() => (
      <Editor defaultValue="<p>Ready</p>" aria-label="Body">
        <EditorToolbar />
      </Editor>
    ))
    const surface = screen.getByRole('textbox', { name: 'Body' })
    // The ProseMirror mirror is transparent by design — the wrapper paints.
    // The box metrics are the dropped-utility guard.
    expect(surface.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(
      surface.parentElement?.getBoundingClientRect().height,
    ).toBeGreaterThan(0)
  })
})
