import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { FileUploader } from './FileUploader'

describe('SSR smoke', () => {
  it('FileUploader renders to a string', () => {
    const html = renderToString(() => (
      <FileUploader label="Attachment" multiple />
    ))
    expect(html).toContain('data-slot="file-uploader"')
    expect(html).toContain('data-slot="file-uploader-dropzone"')
    expect(html).toContain('type="file"')
    expect(html).toContain('Attachment')
  })
})
