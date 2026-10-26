import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CodeEditor } from './CodeEditor'

describe('CodeEditor (browser, real engine)', () => {
  it('keeps typed text in the document and reports changes', async () => {
    const seen: string[] = []
    render(() => (
      <CodeEditor
        defaultValue="SELECT 1"
        language="sql"
        aria-label="Query"
        onValueChange={(value) => seen.push(value)}
      />
    ))
    const surface = screen.getByRole('textbox', { name: 'Query' })
    await userEvent.click(surface)
    await userEvent.keyboard(' -- by quarter')
    expect(surface.textContent).toContain('-- by quarter')
    expect(seen.some((value) => value.includes('-- by quarter'))).toBe(true)
  })

  it('renders read-only: typing changes nothing, the box stays', async () => {
    const seen: string[] = []
    render(() => (
      <CodeEditor
        defaultValue="SELECT 1"
        readonly
        aria-label="Query"
        onValueChange={(value) => seen.push(value)}
      />
    ))
    const surface = screen.getByRole('textbox', { name: 'Query' })
    await userEvent.click(surface)
    await userEvent.keyboard(' nope')
    // The editable compartment rejects input; the document is untouched.
    expect(seen).toEqual([])
    expect(surface.textContent).toContain('SELECT 1')
    expect(surface.getBoundingClientRect().height).toBeGreaterThan(0)
  })
})
