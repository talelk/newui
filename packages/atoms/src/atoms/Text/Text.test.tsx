import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Text } from './Text'

describe('Text', () => {
  it('renders a paragraph with the default body scale and ink', () => {
    const { container } = render(() => <Text>Copy</Text>)
    const p = container.querySelector('p[data-slot="text"]') as HTMLElement
    expect(p.className).toContain('text-p-base')
    expect(p.className).toContain('text-ink-gray-8')
  })

  it('resolves size and weight composites', () => {
    const { container } = render(() => (
      <Text size="sm" weight="medium">
        Copy
      </Text>
    ))
    expect(container.querySelector('p')?.className).toContain(
      'text-p-sm-medium',
    )
    expect(container.querySelector('p')?.getAttribute('data-size')).toBe('sm')
  })

  it('merges the caller class last', () => {
    const { container } = render(() => <Text class="text-ink-gray-6">C</Text>)
    expect(container.querySelector('p')?.className).toContain('text-ink-gray-6')
  })
})
