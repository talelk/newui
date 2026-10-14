import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './Card'

describe('Card', () => {
  it('renders its parts on an elevated surface', () => {
    const { container } = render(() => (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>This month</CardDescription>
        </CardHeader>
        <CardContent>12 open</CardContent>
      </Card>
    ))

    const card = container.querySelector('[data-slot="card"]')
    expect(card?.className).toContain('bg-surface-elevation-1')
    expect(card?.className).toContain('shadow-base')
    expect(
      container.querySelector('[data-slot="card-title"]')?.textContent,
    ).toBe('Invoices')
    expect(
      container.querySelector('[data-slot="card-content"]')?.textContent,
    ).toBe('12 open')
  })

  it('honours elevation and padding variants', () => {
    const { container } = render(() => <Card elevation="lg" padding="none" />)
    const card = container.querySelector('[data-slot="card"]')
    expect(card?.className).toContain('shadow-lg')
    expect(card?.className).not.toContain('p-4')
  })
})
