import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { FileCard } from './FileCard'

function card(): HTMLElement {
  return document.querySelector('[data-slot="file-card"]') as HTMLElement
}

describe('FileCard', () => {
  it('renders name, meta and a default file tile', () => {
    render(() => <FileCard name="Q4 report.pdf" meta="Ana Costa · 2.4 MB" />)
    expect(card().textContent).toContain('Q4 report.pdf')
    expect(card().textContent).toContain('Ana Costa · 2.4 MB')
    expect(card().querySelector('.lucide-file')).not.toBeNull()
  })

  it('renders a custom type icon and a badge', () => {
    render(() => (
      <FileCard
        name="Brief.docx"
        icon="lucide-file-text"
        badge={<span>Shared</span>}
      />
    ))
    expect(card().querySelector('.lucide-file-text')).not.toBeNull()
    expect(card().textContent).toContain('Shared')
  })

  it('reflects selection and disabled hooks', () => {
    const { unmount } = render(() => <FileCard name="A" selected />)
    expect(card().getAttribute('data-state')).toBe('active')
    expect(card().getAttribute('aria-current')).toBe('true')
    expect(card().className).toContain('bg-surface-blue-2')
    unmount()
    render(() => <FileCard name="B" disabled />)
    expect(card().getAttribute('data-disabled')).toBe('true')
    expect(card().className).toContain('text-ink-gray-6')
  })

  it('omits the suffix region until actions exist', () => {
    const { unmount } = render(() => <FileCard name="A" />)
    expect(card().querySelector('button')).toBeNull()
    unmount()
    render(() => (
      <FileCard name="A" suffix={<button type="button">S</button>} />
    ))
    expect(card().textContent).toContain('S')
  })

  it('renders as a button and fires clicks', async () => {
    const userEvent = (await import('@testing-library/user-event')).default
    const onOpen = vi.fn()
    render(() => <FileCard as="button" name="Open me" onClick={onOpen} />)
    const button = card()
    expect(button.tagName).toBe('BUTTON')
    expect(button.getAttribute('type')).toBe('button')
    await userEvent.click(button)
    expect(onOpen).toHaveBeenCalledOnce()
  })
})
