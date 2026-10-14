import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

function Example(props: {
  count?: number
  pageSize?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
}) {
  return (
    <Pagination.Root
      count={props.count ?? 120}
      pageSize={props.pageSize ?? 10}
      defaultPage={props.defaultPage ?? 1}
      onPageChange={props.onPageChange}
    >
      <Pagination.PrevTrigger />
      <Pagination.Pages />
      <Pagination.NextTrigger />
      <Pagination.Range />
    </Pagination.Root>
  )
}

describe('Pagination', () => {
  it('is a labelled navigation landmark', () => {
    render(() => <Example />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeTruthy()
  })

  it('derives the page count from the row count', () => {
    render(() => <Example count={120} pageSize={10} />)
    // 12 pages: the boundary pages are 1 and 12.
    expect(screen.getByRole('button', { name: 'Page 12' })).toBeTruthy()
  })

  it('names the range from the machine, not from arithmetic at the call site', () => {
    const { container } = render(() => (
      <Example count={348} pageSize={20} defaultPage={2} />
    ))
    // The range is several text nodes; read the element rather than a string.
    // Zag reports the rows *before* the page, so the first visible row is
    // `start + 1` — the off-by-one this part exists to own.
    const range = container.querySelector('[data-slot="pagination-range"]')
    expect(range?.textContent).toBe('21–40 of 348')
  })

  it('starts at row one on the first page', () => {
    const { container } = render(() => <Example count={348} pageSize={20} />)
    const range = container.querySelector('[data-slot="pagination-range"]')
    expect(range?.textContent).toBe('1–20 of 348')
  })

  it('reads zero rows as zero, not as a range', () => {
    const { container } = render(() => <Example count={0} pageSize={20} />)
    const range = container.querySelector('[data-slot="pagination-range"]')
    expect(range?.textContent).toBe('0–0 of 0')
  })

  it('reports a page change', async () => {
    const onPageChange = vi.fn()
    render(() => <Example onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
  })

  it('moves one page at a time with the arrows', async () => {
    const onPageChange = vi.fn()
    render(() => <Example onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
  })

  it('disables the previous arrow on the first page', () => {
    render(() => <Example defaultPage={1} />)
    expect(
      screen
        .getByRole('button', { name: 'Previous page' })
        .hasAttribute('disabled'),
    ).toBe(true)
  })

  it('disables the next arrow on the last page', () => {
    render(() => <Example defaultPage={12} />)
    expect(
      screen
        .getByRole('button', { name: 'Next page' })
        .hasAttribute('disabled'),
    ).toBe(true)
  })

  it('replaces the middle of a long run with ellipses', () => {
    render(() => <Example count={1000} pageSize={10} defaultPage={50} />)
    expect(screen.getAllByText('…').length).toBeGreaterThan(0)
  })
})
