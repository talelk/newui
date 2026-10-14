import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Progress } from './Progress'

describe('Progress', () => {
  it('exposes value as aria-valuenow and clamps it', () => {
    const { getByRole } = render(() => <Progress value={150} aria-label="Up" />)
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
  })

  it('renders the label and uses it as the accessible name', () => {
    const { getByRole, getByText } = render(() => (
      <Progress value={40} label="Uploading" />
    ))
    expect(getByRole('progressbar').getAttribute('aria-label')).toBe(
      'Uploading',
    )
    expect(getByText('Uploading')).toBeTruthy()
  })

  it('shows the percentage when hint is set', () => {
    const { getByText } = render(() => (
      <Progress value={40} label="Uploading" hint />
    ))
    expect(getByText('40%')).toBeTruthy()
  })

  it('renders one segment per interval', () => {
    const { getByRole } = render(() => (
      <Progress value={50} intervals={4} aria-label="Steps" />
    ))
    expect(getByRole('progressbar').children).toHaveLength(4)
  })

  it('applies the size class to the track', () => {
    const { getByRole } = render(() => (
      <Progress value={10} size="xl" aria-label="Big" />
    ))
    expect(getByRole('progressbar').className).toContain('h-3')
  })
})
