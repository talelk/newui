import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders subtle gray by default', () => {
    const { getByRole } = render(() => <Button>Click</Button>)
    const el = getByRole('button')
    expect(el).toHaveTextContent('Click')
    expect(el.className).toContain('bg-surface-gray-2')
  })

  it('applies theme and variant', () => {
    const { getByRole } = render(() => (
      <Button variant="solid" theme="blue">
        Go
      </Button>
    ))
    expect(getByRole('button').className).toContain('bg-surface-blue-8')
  })

  it('applies the size scale', () => {
    const { getByRole } = render(() => <Button size="lg">Big</Button>)
    const className = getByRole('button').className
    expect(className).toContain('h-10')
    expect(className).toContain('text-lg-medium')
  })

  it('is disabled and pointer-events-none while loading', () => {
    const { getByRole } = render(() => <Button loading>Busy</Button>)
    const el = getByRole('button') as HTMLButtonElement
    expect(el.disabled).toBe(true)
    expect(el.className).toContain('pointer-events-none')
  })

  it('preserves a caller aria-label on icon-only buttons', () => {
    const { getByRole } = render(() => (
      <Button icon="lucide-x" aria-label="Close" />
    ))
    expect(getByRole('button').getAttribute('aria-label')).toBe('Close')
  })

  it('renders as an anchor when href is set', () => {
    const { getByRole } = render(() => <Button href="/reports">Reports</Button>)
    const el = getByRole('link')
    expect(el.getAttribute('href')).toBe('/reports')
  })

  it('forwards passthrough props (id, data-*, aria-*)', () => {
    const { getByRole } = render(() => (
      <Button id="save-btn" data-state="active" aria-describedby="hint">
        Save
      </Button>
    ))
    const el = getByRole('button')
    expect(el.id).toBe('save-btn')
    expect(el.getAttribute('data-state')).toBe('active')
    expect(el.getAttribute('aria-describedby')).toBe('hint')
  })

  it('holds the pressed look when stamped with data-state=open', () => {
    const { getByRole } = render(() => (
      <Button data-state="open">Options</Button>
    ))
    expect(getByRole('button').getAttribute('data-state')).toBe('open')
  })

  it('renders route as an in-app anchor without a new-tab target', () => {
    const { getByRole } = render(() => (
      <Button route="/reports">Reports</Button>
    ))
    const el = getByRole('link')
    expect(el.getAttribute('href')).toBe('/reports')
    expect(el.getAttribute('target')).toBeNull()
    expect(el.getAttribute('rel')).toBeNull()
  })

  it('prefers route over href', () => {
    const { getByRole } = render(() => (
      <Button route="/in-app" href="/external">
        Go
      </Button>
    ))
    const el = getByRole('link')
    expect(el.getAttribute('href')).toBe('/in-app')
    expect(el.getAttribute('target')).toBeNull()
  })
})
