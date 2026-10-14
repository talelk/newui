import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge (browser, real CSS)', () => {
  it('paints a solid fill that is not transparent', () => {
    const { container } = render(() => (
      <Badge label="New" variant="solid" theme="blue" />
    ))
    const el = container.firstElementChild as HTMLElement
    expect(getComputedStyle(el).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('grows from sm to lg', () => {
    const { container, unmount } = render(() => <Badge label="New" size="sm" />)
    const small = (
      container.firstElementChild as HTMLElement
    ).getBoundingClientRect().height
    unmount()
    const { container: second } = render(() => <Badge label="New" size="lg" />)
    const large = (
      second.firstElementChild as HTMLElement
    ).getBoundingClientRect().height
    expect(large).toBeGreaterThan(small)
  })
})
