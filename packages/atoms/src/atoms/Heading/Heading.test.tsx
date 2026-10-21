import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Heading } from './Heading'

describe('Heading', () => {
  it('renders the level as the heading element', () => {
    const { container } = render(() => <Heading level={1}>Title</Heading>)
    expect(container.querySelector('h1')?.textContent).toBe('Title')
    render(() => <Heading>Title</Heading>)
    expect(document.querySelector('h2[data-slot="heading"]')).toBeTruthy()
    render(() => <Heading level={3}>Title</Heading>)
    expect(document.querySelector('h3[data-slot="heading"]')).toBeTruthy()
  })

  it('maps level 1 to the page-title role and 2/3 to the section role', () => {
    const { container } = render(() => <Heading level={1}>Title</Heading>)
    expect(container.querySelector('h1')?.className).toContain('text-heading')
    const section = render(() => <Heading level={2}>Title</Heading>)
    expect(section.container.querySelector('h2')?.className).toContain(
      'text-section',
    )
  })

  it('merges the caller class last', () => {
    const { container } = render(() => <Heading class="mt-8">Title</Heading>)
    expect(container.querySelector('h2')?.className).toContain('mt-8')
  })
})
