import {
  Badge,
  BottomSheet,
  Button,
  Dialog,
  Progress,
  Select,
  TabButtons,
  TextInput,
} from '@newui/ui'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { DataTable, type DataTableColumn } from '../examples/DataTable'
import { ExampleFrame } from '../examples/ExampleFrame'

import { INITIAL, size, type WorkspaceFile } from '../examples/files-data'

export function Files(): JSX.Element {
  const [items, setItems] = createSignal(INITIAL)
  const [folder, setFolder] = createSignal<string | null>(null)
  const [section, setSection] = createSignal('Home')
  const [view, setView] = createSignal('grid')
  const [query, setQuery] = createSignal('')
  const [type, setType] = createSignal('All types')
  const [sort, setSort] = createSignal('Name')
  const [newFolder, setNewFolder] = createSignal(false)
  const [name, setName] = createSignal('')
  const [attempted, setAttempted] = createSignal(false)
  const [actionId, setActionId] = createSignal<string>()
  const actionFile = createMemo(() =>
    items().find((item) => item.id === actionId()),
  )
  const [active, setActive] = createSignal<string>()
  const [preview, setPreview] = createSignal('')
  const [notice, setNotice] = createSignal('')
  const [editName, setEditName] = createSignal('')
  const [moveTo, setMoveTo] = createSignal('root')
  let upload: HTMLInputElement | undefined
  let nextId = 100
  let previewRequest = 0
  const current = createMemo(() => items().find((item) => item.id === active()))
  const descendants = (id: string): Set<string> => {
    const ids = new Set([id])
    let count = 0
    while (count !== ids.size) {
      count = ids.size
      for (const item of items())
        if (item.parent && ids.has(item.parent)) ids.add(item.id)
    }
    return ids
  }
  const breadcrumbs = createMemo(() => {
    const found: WorkspaceFile[] = []
    let cursor = folder()
    const visited = new Set<string>()
    while (cursor && !visited.has(cursor)) {
      visited.add(cursor)
      const item = items().find((entry) => entry.id === cursor)
      if (!item) break
      found.unshift(item)
      cursor = item.parent
    }
    return found
  })
  const rows = createMemo(() => {
    const order = sort()
    return items()
      .filter(
        (item) =>
          (section() === 'Trash' ? item.trashed : !item.trashed) &&
          (section() === 'Home'
            ? item.parent === folder()
            : section() === 'Favourites'
              ? item.starred
              : section() === 'Shared with me'
                ? item.shared
                : section() === 'Recents'
                  ? item.day <= 3
                  : true) &&
          (type() === 'All types' ||
            (type() === 'Folders'
              ? item.type === 'folder'
              : item.type === 'file')) &&
          item.name.toLowerCase().includes(query().toLowerCase()),
      )
      .sort((a, b) =>
        order === 'Size'
          ? b.bytes - a.bytes
          : order === 'Modified'
            ? a.day - b.day
            : a.type === b.type
              ? a.name.localeCompare(b.name)
              : a.type === 'folder'
                ? -1
                : 1,
      )
  })
  const patch = (id: string, values: Partial<WorkspaceFile>) =>
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...values } : item)),
    )
  const trash = (ids: string[], trashed: boolean) => {
    const affected = new Set(ids.flatMap((id) => [...descendants(id)]))
    setItems((previous) =>
      previous.map((item) =>
        affected.has(item.id) ? { ...item, trashed } : item,
      ),
    )
    setNotice(
      trashed
        ? 'Items moved to trash. You can restore them from Trash.'
        : 'Items restored.',
    )
    setActive(undefined)
  }
  const open = async (item: WorkspaceFile) => {
    if (item.type === 'folder') {
      setSection('Home')
      setFolder(item.id)
      setQuery('')
      return
    }
    setActive(item.id)
    setEditName(item.name)
    setMoveTo(item.parent ?? 'root')
    setPreview('Loading preview…')
    const request = ++previewRequest
    if (item.file) {
      if (/\.(txt|md|csv|json)$/i.test(item.name)) {
        const text = await item.file.slice(0, 64000).text()
        if (request === previewRequest) setPreview(text)
      } else
        setPreview(
          'Preview is available for text, Markdown, CSV and JSON files. Download this local file to open it.',
        )
    } else setPreview(item.content ?? 'No preview available.')
  }
  const download = (item: WorkspaceFile) => {
    const url = URL.createObjectURL(
      item.file ??
        new Blob([item.content ?? ''], { type: 'text/plain;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = item.name
    link.click()
    URL.revokeObjectURL(url)
  }
  const columns: DataTableColumn<WorkspaceFile>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (context) => (
        <button
          type="button"
          class="rounded-3 text-start text-ink-blue-link focus-visible:focus-ring"
          onClick={() => void open(context.row.original)}
        >
          {context.row.original.name}
        </button>
      ),
    },
    { accessorKey: 'owner', header: 'Owner' },
    {
      accessorKey: 'day',
      header: 'Modified',
      cell: (context) =>
        context.row.original.day === 0
          ? 'Today'
          : `${context.row.original.day} days ago`,
    },
    {
      accessorKey: 'bytes',
      header: 'Size',
      cell: (context) =>
        context.row.original.type === 'folder'
          ? `${items().filter((item) => item.parent === context.row.original.id && !item.trashed).length} items`
          : size(context.row.original.bytes),
    },
  ]
  return (
    <ExampleFrame
      title="A home for your team's work"
      section="Files"
      description="Keep documents, assets and ideas organised. Explore folders, share context and find what matters."
      actions={
        <>
          <Button
            variant="outline"
            iconLeft="lucide-folder-plus"
            onClick={() => {
              setName('')
              setAttempted(false)
              setNewFolder(true)
            }}
          >
            New folder
          </Button>
          <Button
            variant="solid"
            theme="blue"
            iconLeft="lucide-upload"
            onClick={() => upload?.click()}
          >
            Upload files
          </Button>
          <input
            ref={upload}
            type="file"
            multiple
            class="sr-only"
            aria-label="Choose local files"
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? [])
              setItems((previous) => [
                ...previous,
                ...files.map(
                  (file): WorkspaceFile => ({
                    id: `UPLOAD-${nextId++}`,
                    parent: folder(),
                    name: file.name,
                    type: 'file',
                    bytes: file.size,
                    owner: 'Rhea Kapoor',
                    starred: false,
                    shared: false,
                    trashed: false,
                    day: 0,
                    file,
                  }),
                ),
              ])
              setSection('Home')
              setNotice(
                `${files.length} local files added. Nothing was uploaded to a server.`,
              )
              event.currentTarget.value = ''
            }}
          />
        </>
      }
    >
      <nav aria-label="File views" class="flex flex-wrap gap-2">
        <For
          each={['Home', 'Recents', 'Favourites', 'Shared with me', 'Trash']}
        >
          {(value) => (
            <Button
              variant={section() === value ? 'solid' : 'outline'}
              theme={section() === value ? 'blue' : 'gray'}
              onClick={() => {
                setSection(value)
                setFolder(null)
                setQuery('')
              }}
            >
              {value}
            </Button>
          )}
        </For>
      </nav>
      <Show when={notice()}>
        <p
          role="status"
          class="rounded-3 border border-outline-blue-1 bg-surface-blue-1 p-3 text-ink-blue-8"
        >
          {notice()}
        </p>
      </Show>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="flex flex-wrap items-end gap-3">
          <TextInput
            label="Search files"
            value={query()}
            onInput={(event) => setQuery(event.currentTarget.value)}
          />
          <Select
            label="File type"
            value={[type()]}
            options={['All types', 'Folders', 'Files'].map((value) => ({
              label: value,
              value,
            }))}
            onValueChange={(value) => setType(value[0] ?? 'All types')}
          />
          <Select
            label="Sort files"
            value={[sort()]}
            options={['Name', 'Modified', 'Size'].map((value) => ({
              label: value,
              value,
            }))}
            onValueChange={(value) => setSort(value[0] ?? 'Name')}
          />
        </div>
        <TabButtons
          value={view()}
          onValueChange={setView}
          options={[
            { label: 'Grid', value: 'grid' },
            { label: 'List', value: 'list' },
          ]}
        />
      </div>
      <nav
        aria-label="Folder path"
        class="flex flex-wrap items-center gap-2 text-interface"
      >
        <button
          type="button"
          class="rounded-3 text-ink-blue-link focus-visible:focus-ring"
          onClick={() => {
            setSection('Home')
            setFolder(null)
          }}
        >
          All files
        </button>
        <For each={breadcrumbs()}>
          {(item) => (
            <>
              <span aria-hidden="true" class="text-ink-gray-6">
                /
              </span>
              <button
                type="button"
                class="rounded-3 text-ink-blue-link focus-visible:focus-ring"
                onClick={() => setFolder(item.id)}
              >
                {item.name}
              </button>
            </>
          )}
        </For>
      </nav>
      <Show
        when={view() === 'grid'}
        fallback={
          <DataTable
            title="Files"
            rows={rows()}
            columns={columns}
            actionLabel={
              section() === 'Trash' ? 'Restore selected' : 'Trash selected'
            }
            onRowsAction={(ids) => trash(ids, section() !== 'Trash')}
          />
        }
      >
        <ul
          class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          aria-label="Workspace files"
        >
          <For
            each={rows()}
            fallback={
              <li class="rounded-5 border border-dashed border-outline-gray-3 p-8 text-center sm:col-span-2">
                <h2 class="text-section">No files here yet</h2>
                <p class="mt-2 text-ink-gray-6">
                  Try another view or add a file to this folder.
                </p>
              </li>
            }
          >
            {(item) => (
              <li class="min-w-0 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3">
                <div class="mb-4 flex items-start justify-between">
                  <span
                    aria-hidden="true"
                    class="grid size-12 place-items-center rounded-5 bg-surface-blue-1 text-ink-blue-8"
                  >
                    <span
                      class={
                        item.type === 'folder'
                          ? 'lucide-folder size-6'
                          : 'lucide-file-text size-6'
                      }
                    />
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="lucide-star"
                    aria-pressed={item.starred}
                    aria-label={`${item.starred ? 'Unfavourite' : 'Favourite'} ${item.name}`}
                    onClick={() => patch(item.id, { starred: !item.starred })}
                  />
                </div>
                <button
                  type="button"
                  class="block max-w-full truncate rounded-3 text-start font-medium focus-visible:focus-ring"
                  onClick={() => void open(item)}
                >
                  {item.name}
                </button>
                <p class="mt-1 text-caption text-ink-gray-6">
                  {item.owner} ·{' '}
                  {item.type === 'folder'
                    ? `${items().filter((child) => child.parent === item.id && !child.trashed).length} items`
                    : size(item.bytes)}
                </p>
                <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <Badge>
                    {item.day === 0 ? 'Today' : `${item.day} days ago`}
                  </Badge>
                  <Button
                    class="sm:hidden"
                    variant="ghost"
                    size="sm"
                    aria-label={`Actions for ${item.name}`}
                    onClick={() => setActionId(item.id)}
                  >
                    Actions
                  </Button>
                  <Button
                    class="hidden sm:inline-flex"
                    variant="ghost"
                    size="sm"
                    onClick={() => trash([item.id], !item.trashed)}
                  >
                    {item.trashed ? 'Restore' : 'Move to trash'}
                  </Button>
                </div>
              </li>
            )}
          </For>
        </ul>
      </Show>
      <BottomSheet
        open={!!actionFile()}
        onOpenChange={(value) => {
          if (!value) setActionId(undefined)
        }}
        title={actionFile()?.name}
      >
        <Show when={actionFile()}>
          {(file) => (
            <div class="flex flex-col gap-2">
              <Button
                onClick={() => {
                  void open(file())
                  setActionId(undefined)
                }}
              >
                {file().type === 'folder' ? 'Open folder' : 'Preview file'}
              </Button>
              <Show when={file().type === 'file'}>
                <Button onClick={() => download(file())}>Download file</Button>
              </Show>
              <Button
                onClick={() => {
                  patch(file().id, { starred: !file().starred })
                  setActionId(undefined)
                }}
              >
                {file().starred ? 'Remove favourite' : 'Add favourite'}
              </Button>
              <Button
                onClick={() => {
                  trash([file().id], !file().trashed)
                  setActionId(undefined)
                }}
              >
                {file().trashed ? 'Restore file' : 'Move to trash'}
              </Button>
            </div>
          )}
        </Show>
      </BottomSheet>
      <div class="max-w-sm">
        <Progress
          label="Local demo storage"
          value={Math.min(
            100,
            (items()
              .filter((item) => !item.trashed)
              .reduce((sum, item) => sum + item.bytes, 0) /
              (10 * 1024 * 1024)) *
              100,
          )}
          size="md"
        />
        <p class="mt-2 text-caption text-ink-gray-6">
          {size(
            items()
              .filter((item) => !item.trashed)
              .reduce((sum, item) => sum + item.bytes, 0),
          )}{' '}
          in this page · 10 MB demonstration scale
        </p>
      </div>
      <Dialog.Root open={newFolder()} onOpenChange={setNewFolder}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Create a folder</Dialog.Title>
            <Dialog.Description>
              Keep related files together.
            </Dialog.Description>
          </Dialog.Header>
          <form
            class="mt-5 flex flex-col gap-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              setAttempted(true)
              if (!name().trim()) return
              setItems((previous) => [
                ...previous,
                {
                  id: `FOLDER-${nextId++}`,
                  parent: folder(),
                  name: name().trim(),
                  type: 'folder',
                  bytes: 0,
                  owner: 'Rhea Kapoor',
                  starred: false,
                  shared: false,
                  trashed: false,
                  day: 0,
                },
              ])
              setSection('Home')
              setNewFolder(false)
              setNotice('Folder created.')
            }}
          >
            <TextInput
              label="Folder name"
              required
              value={name()}
              onInput={(event) => setName(event.currentTarget.value)}
              error={
                attempted() && !name().trim()
                  ? 'Enter a folder name.'
                  : undefined
              }
            />
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setNewFolder(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="solid" theme="blue">
                Create folder
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root
        open={!!active()}
        onOpenChange={(value) => {
          if (!value) {
            setActive(undefined)
            previewRequest++
          }
        }}
      >
        <Dialog.Content>
          <Show when={current()}>
            {(item) => (
              <>
                <Dialog.Header>
                  <Dialog.Title>{item().name}</Dialog.Title>
                  <Dialog.Description>
                    {item().owner} · {size(item().bytes)} · Local preview
                  </Dialog.Description>
                </Dialog.Header>
                <section
                  class="my-5 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-3 border border-outline-gray-1 bg-surface-gray-1 p-3 text-caption"
                  tabindex="0"
                  aria-label="File preview"
                >
                  <pre>{preview()}</pre>
                </section>
                <div class="flex flex-col gap-3">
                  <TextInput
                    label="File name"
                    value={editName()}
                    onInput={(event) => setEditName(event.currentTarget.value)}
                  />
                  <Select
                    label="Move to folder"
                    value={[moveTo()]}
                    options={[
                      { label: 'All files', value: 'root' },
                      ...items()
                        .filter(
                          (entry) =>
                            entry.type === 'folder' &&
                            !entry.trashed &&
                            !descendants(item().id).has(entry.id),
                        )
                        .map((entry) => ({
                          label: entry.name,
                          value: entry.id,
                        })),
                    ]}
                    onValueChange={(value) => setMoveTo(value[0] ?? 'root')}
                  />
                </div>
                <Dialog.Footer>
                  <Button variant="outline" onClick={() => download(item())}>
                    Download file
                  </Button>
                  <Button
                    variant="solid"
                    theme="blue"
                    disabled={!editName().trim()}
                    onClick={() => {
                      patch(item().id, {
                        name: editName().trim(),
                        parent: moveTo() === 'root' ? null : moveTo(),
                      })
                      setActive(undefined)
                      setNotice('File details updated.')
                    }}
                  >
                    Save file details
                  </Button>
                </Dialog.Footer>
              </>
            )}
          </Show>
        </Dialog.Content>
      </Dialog.Root>
    </ExampleFrame>
  )
}
