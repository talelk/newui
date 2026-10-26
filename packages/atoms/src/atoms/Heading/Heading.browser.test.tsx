import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Heading } from './Heading'

describe('Heading (browser, real CSS)', () => {
  it('sets the page-title scale on h1 and the section scale on h2', () => {
    const page = render(() => <Heading level={1}>Title</Heading>)
    const h1 = page.container.querySelector('h1') as HTMLElement
    expect(getComputedStyle(h1).fontSize).toBe('24px')
    expect(h1.getBoundingClientRect().height).toBeGreaterThan(0)
    page.unmount()

    const section = render(() => <Heading level={2}>Title</Heading>)
    const h2 = section.container.querySelector('h2') as HTMLElement
    expect(getComputedStyle(h2).fontSize).toBe('18px')
  })
})
