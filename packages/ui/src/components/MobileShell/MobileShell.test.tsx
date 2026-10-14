import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { MobileShell, PageHeaderMobile } from './MobileShell'

describe('MobileShell', () => {
  it('renders header, scrolling body and nav regions', () => {
    render(() => (
      <MobileShell header={<div>Header</div>} nav={<div>Nav</div>}>
        Body
      </MobileShell>
    ))

    expect(document.querySelector('[data-slot="mobile-shell"]')).toBeTruthy()
    expect(
      document.querySelector('[data-slot="mobile-shell-header"]'),
    ).toBeTruthy()
    expect(
      document.querySelector('[data-slot="mobile-shell-scroll"]'),
    ).toBeTruthy()
    expect(screen.getByText('Header')).toBeTruthy()
    expect(screen.getByText('Body')).toBeTruthy()
    expect(screen.getByText('Nav')).toBeTruthy()
  })

  it('omits the header and nav regions when they are not provided', () => {
    render(() => <MobileShell>Body</MobileShell>)

    expect(
      document.querySelector('[data-slot="mobile-shell-header"]'),
    ).toBeNull()
    expect(
      document.querySelector('[data-slot="mobile-shell-scroll"]'),
    ).toBeTruthy()
    expect(screen.getByText('Body')).toBeTruthy()
  })

  it('merges a caller class into the root', () => {
    render(() => <MobileShell class="test-root">Body</MobileShell>)
    expect(
      document
        .querySelector('[data-slot="mobile-shell"]')
        ?.classList.contains('test-root'),
    ).toBe(true)
  })
})

describe('PageHeaderMobile', () => {
  it('renders prefix, title and suffix', () => {
    render(() => (
      <PageHeaderMobile
        title="Discussion"
        prefix={<button type="button">Back</button>}
        suffix={<button type="button">More</button>}
      />
    ))

    expect(
      screen.getByRole('heading', { level: 1, name: 'Discussion' }),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'More' })).toBeTruthy()
    expect(
      document.querySelector('[data-slot="page-header-mobile-prefix"]'),
    ).toBeTruthy()
    expect(
      document.querySelector('[data-slot="page-header-mobile-suffix"]'),
    ).toBeTruthy()
  })

  it('lets children override the title', () => {
    render(() => (
      <PageHeaderMobile title="Fallback">
        <span>Custom</span>
      </PageHeaderMobile>
    ))

    expect(screen.getByText('Custom')).toBeTruthy()
    expect(screen.queryByText('Fallback')).toBeNull()
  })

  it('omits the prefix and suffix regions when not provided', () => {
    render(() => <PageHeaderMobile title="Home" />)

    expect(
      document.querySelector('[data-slot="page-header-mobile-prefix"]'),
    ).toBeNull()
    expect(
      document.querySelector('[data-slot="page-header-mobile-suffix"]'),
    ).toBeNull()
  })
})
