import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DetailHeader } from './DetailHeader'

describe('DetailHeader', () => {
  it('renders the trail, the title, the status and the subtitle', () => {
    render(() => (
      <DetailHeader
        breadcrumbs={[{ label: 'Files', route: '/files' }, { label: 'Report' }]}
        title="Q3 report.pdf"
        subtitle="1.2 MB · updated 2h ago"
        status={{ label: 'Shared', theme: 'blue' }}
      />
    ))

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Q3 report.pdf' }),
    ).toBeTruthy()
    expect(screen.getByText('Shared')).toBeTruthy()
    expect(screen.getByText('1.2 MB · updated 2h ago')).toBeTruthy()
  })

  it('puts the primary action last and calls the right handler', async () => {
    const onShare = vi.fn()
    const onDownload = vi.fn()
    render(() => (
      <DetailHeader
        title="Report"
        actions={[
          { label: 'Share', onClick: onShare },
          { label: 'Download', onClick: onDownload },
        ]}
      />
    ))

    const buttons = screen.getAllByRole('button')
    expect(buttons.at(-1)?.textContent).toBe('Download')

    await userEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(onShare).toHaveBeenCalled()
    expect(onDownload).not.toHaveBeenCalled()
  })

  it('renders one action as primary with no outline sibling', () => {
    render(() => <DetailHeader title="Report" actions={[{ label: 'Edit' }]} />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('omits the trail when there is none', () => {
    const { container } = render(() => <DetailHeader title="Report" />)
    expect(container.querySelector('nav')).toBeNull()
  })
})
