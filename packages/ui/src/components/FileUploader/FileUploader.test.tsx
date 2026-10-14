import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { FileUploader, type FileUploaderValue } from './FileUploader'

function fileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]')
  if (!(input instanceof HTMLInputElement)) throw new Error('no file input')
  return input
}

/**
 * `userEvent.upload` drops files the input's `accept` rejects, so a rejected
 * type never reaches the machine. Set the FileList directly and fire the input
 * event Zag listens for.
 */
function selectFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, 'files', { configurable: true, value: files })
  fireEvent.input(input)
}

function textFile(name = 'notes.txt', size = 5): File {
  return new File(['x'.repeat(size)], name, { type: 'text/plain' })
}

describe('FileUploader', () => {
  it('renders a dropzone named by its label', () => {
    const { container } = render(() => <FileUploader label="Attachment" />)
    const dropzone = screen.getByRole('button', { name: /Attachment/ })
    expect(dropzone).toHaveAttribute('data-slot', 'file-uploader-dropzone')
    expect(fileInput(container).getAttribute('type')).toBe('file')
  })

  it('wires the shared labelling contract', () => {
    const { container } = render(() => (
      <FileUploader
        label="Attachment"
        description="PDF only"
        error="Required"
        required
      />
    ))

    const input = fileInput(container)
    const label = document.querySelector(`label[for="${input.id}"]`)
    expect(label?.textContent).toContain('Attachment')

    const dropzone = screen.getByRole('button')
    expect(dropzone.getAttribute('aria-describedby')?.split(' ').length).toBe(2)
    expect(input.getAttribute('required')).not.toBeNull()
  })

  it('selects a file and lists it', async () => {
    const onValueChange = vi.fn()
    const { container } = render(() => (
      <FileUploader onValueChange={onValueChange} />
    ))

    const file = textFile('notes.txt')
    await userEvent.upload(fileInput(container), file)

    expect(onValueChange).toHaveBeenCalledWith(file)
    expect(await screen.findByText('notes.txt')).toBeTruthy()
  })

  it('removes a file through its delete trigger', async () => {
    const { container } = render(() => <FileUploader />)
    await userEvent.upload(fileInput(container), textFile('notes.txt'))
    await screen.findByText('notes.txt')

    await userEvent.click(
      screen.getByRole('button', { name: /delete file notes\.txt/i }),
    )

    expect(screen.queryByText('notes.txt')).toBeNull()
  })

  it('accepts several files when multiple', async () => {
    const onValueChange = vi.fn()
    const { container } = render(() => (
      <FileUploader multiple onValueChange={onValueChange} />
    ))

    const files = [textFile('a.txt'), textFile('b.txt')]
    await userEvent.upload(fileInput(container), files)

    expect(onValueChange).toHaveBeenCalledWith(files)
    expect(await screen.findByText('a.txt')).toBeTruthy()
    expect(await screen.findByText('b.txt')).toBeTruthy()
  })

  it('rejects a file whose type is not accepted', async () => {
    const { container } = render(() => <FileUploader accept="image/*" />)
    const input = fileInput(container)
    expect(input.getAttribute('accept')).toBe('image/*')

    selectFiles(input, [textFile('notes.txt')])

    expect(await screen.findByText('Invalid file type')).toBeTruthy()
  })

  it('rejects a file over the size limit', async () => {
    const { container } = render(() => <FileUploader maxFileSize={1} />)
    await userEvent.upload(fileInput(container), textFile('big.txt', 10))
    expect(await screen.findByText('File is too large')).toBeTruthy()
  })

  it('marks the dropzone disabled', () => {
    render(() => <FileUploader label="Attachment" disabled />)
    expect(screen.getByRole('button')).toHaveAttribute('data-disabled')
  })

  it('works as a controlled value', async () => {
    const [value, setValue] = createSignal<FileUploaderValue>(null)
    const onValueChange = vi.fn((next: FileUploaderValue) => setValue(next))
    const { container } = render(() => (
      <FileUploader value={value()} onValueChange={onValueChange} />
    ))

    const file = textFile('notes.txt')
    await userEvent.upload(fileInput(container), file)

    expect(onValueChange).toHaveBeenCalledWith(file)
    expect(await screen.findByText('notes.txt')).toBeTruthy()
  })

  it('shows a progress bar while transformFiles is pending', async () => {
    let resolveTransform: ((files: File[]) => void) | undefined
    const transformFiles = () =>
      new Promise<File[]>((resolve) => {
        resolveTransform = resolve
      })

    const { container } = render(() => (
      <FileUploader transformFiles={transformFiles} />
    ))

    await userEvent.upload(fileInput(container), textFile('notes.txt'))
    expect(await screen.findByRole('progressbar')).toBeTruthy()

    resolveTransform?.([])
    await waitFor(() => expect(screen.queryByRole('progressbar')).toBeNull())
  })
})
