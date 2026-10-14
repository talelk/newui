import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { AppShell, PageBody, PageHeader } from './AppShell'

describe('AppShell (browser, real CSS)', () => {
  it('is a flex frame whose body owns the scroll', () => {
    const { container } = render(() => (
      <AppShell>
        <PageHeader>Header</PageHeader>
        <PageBody>Body</PageBody>
      </AppShell>
    ))
    const shell = container.querySelector(
      '[data-slot="app-shell"]',
    ) as HTMLElement
    expect(getComputedStyle(shell).display).toBe('flex')
    expect(getComputedStyle(shell).overflow).toBe('hidden')

    const body = container.querySelector(
      '[data-slot="page-body"]',
    ) as HTMLElement
    expect(getComputedStyle(body).overflowY).toBe('auto')
  })
})
