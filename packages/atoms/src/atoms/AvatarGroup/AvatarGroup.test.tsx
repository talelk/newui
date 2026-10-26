import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { AvatarGroup } from './AvatarGroup'

const PEOPLE = [
  { label: 'Rhea Kapoor' },
  { label: 'Marco Diaz' },
  { label: 'Ada Lovelace' },
  { label: 'Linus Ahlberg' },
  { label: 'Sofia Marino' },
]

/** The group's tiles are the Avatar roots; the "+N" tile is identifiable by
 * its text, since it is an Avatar like the rest. */
function tiles(container: HTMLElement) {
  const group = container.querySelector(
    '[data-slot="avatar-group"]',
  ) as HTMLElement
  return Array.from(group.children).filter(
    (el) => !el.textContent?.startsWith('+'),
  )
}

function overflowTile(container: HTMLElement) {
  const group = container.querySelector(
    '[data-slot="avatar-group"]',
  ) as HTMLElement
  return Array.from(group.children).find((el) =>
    el.textContent?.startsWith('+'),
  )
}

describe('AvatarGroup', () => {
  it('renders one overlapping tile per person up to `max`', () => {
    const { container } = render(() => <AvatarGroup avatars={PEOPLE} max={3} />)
    expect(tiles(container).length).toBe(3)
  })

  it('collapses the rest into a single "+N" tile', () => {
    const { container } = render(() => <AvatarGroup avatars={PEOPLE} max={4} />)
    expect(overflowTile(container)?.textContent).toBe('+1')
  })

  it('renders everyone when the list fits under `max`', () => {
    const { container } = render(() => (
      <AvatarGroup avatars={PEOPLE.slice(0, 2)} />
    ))
    expect(tiles(container).length).toBe(2)
    expect(overflowTile(container)).toBeUndefined()
  })

  it('names the group when `label` is given', () => {
    render(() => <AvatarGroup avatars={PEOPLE} label="Assignees" />)
    expect(screen.getByRole('group', { name: 'Assignees' })).toBeTruthy()
  })

  it('stays a plain stack without `label`', () => {
    const { container } = render(() => <AvatarGroup avatars={PEOPLE} />)
    expect(container.querySelector('[role="group"]')).toBeNull()
  })

  it('overlaps from the second tile onward with a surface ring', () => {
    const { container } = render(() => <AvatarGroup avatars={PEOPLE} />)
    const [first, second] = tiles(container)
    expect(first?.className).not.toContain('-ms-')
    expect(second?.className).toContain('-ms-1.5')
    expect(second?.className).toContain('ring-2')
  })

  it('shows an image when the item provides one', () => {
    const { container } = render(() => (
      <AvatarGroup avatars={[{ image: '/rhea.png', label: 'Rhea Kapoor' }]} />
    ))
    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe('/rhea.png')
    expect(img?.getAttribute('alt')).toBe('Rhea Kapoor')
  })
})
