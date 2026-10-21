import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { FileUploader } from './FileUploader'

describe('FileUploader (browser, real CSS)', () => {
  it('draws a dashed, padded dropzone with a surface fill', () => {
    const { container } = render(() => <FileUploader aria-label="Upload" />)
    const zone = container.querySelector(
      '[data-slot="file-uploader-dropzone"]',
    ) as HTMLElement
    const style = getComputedStyle(zone)
    expect(style.borderTopStyle).toBe('dashed')
    expect(Number.parseFloat(style.paddingTop)).toBeGreaterThan(0)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
