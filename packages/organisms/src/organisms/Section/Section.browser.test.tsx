import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Section } from './Section'

describe('Section (browser, real CSS)', () => {
  it('sits the footer under a real rule', () => {
    const { container } = render(() => (
      <Section title="Ledger" footer={<span>18 records</span>}>
        <div>Body</div>
      </Section>
    ))
    const footer = Array.from(container.querySelectorAll('div')).find(
      (node) => node.textContent === '18 records',
    ) as HTMLElement
    const style = getComputedStyle(footer)
    // "Pagination, totals or selection feedback, under a rule" — the rule is
    // the contract; losing it strands the footer in the body.
    expect(style.borderTopStyle).toBe('solid')
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.paddingTop)).toBeGreaterThan(0)
  })

  it('paints the card surface and leaves the plain one bare', () => {
    const card = render(() => (
      <Section surface="card" title="Ledger">
        <div>Body</div>
      </Section>
    ))
    const cardBox = card.container.querySelector(
      '[data-slot="section"]',
    ) as HTMLElement
    const cardStyle = getComputedStyle(cardBox)
    expect(cardStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(cardStyle.borderRadius)).toBeGreaterThan(0)
    expect(Number.parseFloat(cardStyle.paddingTop)).toBeGreaterThan(0)
    card.unmount()

    const plain = render(() => (
      <Section title="Ledger">
        <div>Body</div>
      </Section>
    ))
    const plainBox = plain.container.querySelector(
      '[data-slot="section"]',
    ) as HTMLElement
    expect(getComputedStyle(plainBox).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(plainBox).paddingTop).toBe('0px')
  })

  it('renders the heading in its type scale', () => {
    const { container } = render(() => (
      <Section title="Pending expenses">
        <div>Body</div>
      </Section>
    ))
    const heading = container.querySelector('h2') as HTMLElement
    // `text-section` — a dropped scale utility drops the heading into body text.
    expect(
      Number.parseFloat(getComputedStyle(heading).fontSize),
    ).toBeGreaterThan(16)
    expect(heading.getBoundingClientRect().height).toBeGreaterThan(0)
  })
})
