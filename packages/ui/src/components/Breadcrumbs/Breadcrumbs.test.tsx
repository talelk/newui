import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Breadcrumbs } from './Breadcrumbs'

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Sales', route: '/sales' },
  { label: 'Invoice' },
]

describe('Breadcrumbs', () => {
  it('renders a labelled nav landmark with an ordered list', () => {
    const { container } = render(() => <Breadcrumbs items={ITEMS} />)
    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb')
    expect(container.querySelector('ol')).not.toBeNull()
    expect(container.querySelectorAll('li')).toHaveLength(ITEMS.length)
  })

  it('accepts a custom aria-label', () => {
    const { container } = render(() => (
      <Breadcrumbs items={ITEMS} aria-label="Trail" />
    ))
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Trail',
    )
  })

  it('marks the last item as the current page', () => {
    const { container } = render(() => <Breadcrumbs items={ITEMS} />)
    const current = container.querySelector('[aria-current="page"]')
    expect(current?.textContent).toContain('Invoice')
    expect(current?.tagName).toBe('SPAN')
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  })

  it('renders non-current items with a destination as links', () => {
    const { container } = render(() => <Breadcrumbs items={ITEMS} />)
    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(2)
    expect(links[0]?.getAttribute('href')).toBe('/')
    expect(links[1]?.getAttribute('href')).toBe('/sales')
  })

  it('prefers route over href', () => {
    const { container } = render(() => (
      <Breadcrumbs
        items={[
          { label: 'Home', route: '/in', href: '/out' },
          { label: 'Sales' },
        ]}
      />
    ))
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/in')
  })

  it('renders an item without a destination as a button', () => {
    const { getByRole } = render(() => (
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Sales' }]} />
    ))
    const button = getByRole('button', { name: 'Home' })
    expect(button).toBeInTheDocument()
    expect(button.getAttribute('type')).toBe('button')
  })

  it('runs onClick for a button crumb', async () => {
    const onClick = vi.fn()
    const { getByRole } = render(() => (
      <Breadcrumbs items={[{ label: 'Home', onClick }, { label: 'Sales' }]} />
    ))
    getByRole('button', { name: 'Home' }).click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('runs onClick for a link crumb and prevents default navigation', () => {
    const onClick = vi.fn()
    const { container } = render(() => (
      <Breadcrumbs
        items={[{ label: 'Home', href: '/', onClick }, { label: 'Sales' }]}
      />
    ))
    const link = container.querySelector('a') as HTMLAnchorElement
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(event)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
  })

  it('leaves modified clicks to the browser', () => {
    const onClick = vi.fn()
    const { container } = render(() => (
      <Breadcrumbs
        items={[{ label: 'Home', href: '/', onClick }, { label: 'Sales' }]}
      />
    ))
    const link = container.querySelector('a') as HTMLAnchorElement
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      metaKey: true,
    })
    link.dispatchEvent(event)
    expect(onClick).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it('renders an icon before the label', () => {
    const { container } = render(() => (
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/', icon: 'lucide-home' },
          { label: 'Sales' },
        ]}
      />
    ))
    const icon = container.querySelector('.lucide-home')
    expect(icon).not.toBeNull()
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
  })

  it('hides separators from assistive tech', () => {
    const { container } = render(() => <Breadcrumbs items={ITEMS} />)
    const separators = container.querySelectorAll(
      '[data-slot="breadcrumbs-separator"]',
    )
    expect(separators).toHaveLength(ITEMS.length - 1)
    for (const separator of separators) {
      expect(separator.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('renders a single item as the current page', () => {
    const { container } = render(() => (
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
    ))
    const current = container.querySelector('[aria-current="page"]')
    expect(current?.textContent).toContain('Dashboard')
    expect(container.querySelectorAll('a')).toHaveLength(0)
    expect(container.querySelectorAll('button')).toHaveLength(0)
  })
})
