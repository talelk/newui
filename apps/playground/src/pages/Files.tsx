import { Badge, Button, Checkbox, TextInput } from '@talelk/newui-atoms'
import {
  createUndo,
  downloadBlob,
  optionsOf,
  bytes as size,
} from '@talelk/newui-data'
import {
  BottomSheet,
  Breadcrumbs,
  Dialog,
  EmptyState,
  Select,
} from '@talelk/newui-molecules'
import {
  DataTable,
  type DataTableColumn,
  FilterBar,
  Section,
  SelectionBar,
} from '@talelk/newui-organisms'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { AppNavigation } from '../examples/AppNavigation'
import { AppPage } from '../examples/AppPage'
import { CreateDialog } from '../examples/CreateDialog'
import {
  countLabel,
  INITIAL,
  relativeDay,
  type WorkspaceFile,
} from '../examples/files-data'
import { Notice } from '../examples/Notice'

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
  const [actionId, setActionId] = createSignal<string>()
  const actionFile = createMemo(() =>
    items().find((item) => item.id === actionId()),
  )
  const [active, setActive] = createSignal<string>()
  const [preview, setPreview] = createSignal('')
  const [notice, setNotice] = createSignal('')
  const [editName, setEditName] = createSignal('')
  const [moveTo, setMoveTo] = createSignal('root')
  const [selectedIds, setSelectedIds] = createSignal<string[]>([])
  const undo = createUndo<WorkspaceFile[]>()
  let upload: HTMLInputElement | undefined
  let nextId = 100
  let previewRequest = 0
  const current = createMemo(() => items().find((item) => item.id === active()))
  const clearSelection = () => setSelectedIds([])
  const isSelected = (id: string) => selectedIds().includes(id)
  const toggleSelected = (id: string, checked: boolean) =>
    setSelectedIds((previous) =>
      checked
        ? [...new Set([...previous, id])]
        : previous.filter((entry) => entry !== id),
    )
  const hasFilters = () => query().trim().length > 0 || type() !== 'All types'
  const canUndo = () => undo.snapshot() !== undefined
  const announce = (text: string) => {
    undo.clear()
    setNotice(text)
  }
  const dismissNotice = () => {
    undo.clear()
    setNotice('')
  }
  const handleUndo = () => {
    if (!undo.undo(setItems)) return
    clearSelection()
    setNotice('Change undone.')
  }
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
  const currentFolder = createMemo(() => breadcrumbs().at(-1))
  const homeCount = createMemo(
    () =>
      items().filter((item) => !item.trashed && item.parent === null).length,
  )
  const heading = () =>
    section() === 'Home' && currentFolder()
      ? (currentFolder()?.name ?? 'Home')
      : section()
  const pageDescription = () => {
    if (section() === 'Trash')
      return 'Restore files you removed, or review what is here.'
    if (section() === 'Recents') return 'Files modified in the last three days.'
    if (section() === 'Favourites') return 'Files you have starred.'
    if (section() === 'Shared with me') return 'Files shared with you.'
    if (currentFolder()) return 'Browse files and folders in this location.'
    return 'Browse files and folders in your workspace.'
  }
  const clearFilters = () => {
    setQuery('')
    setType('All types')
    clearSelection()
  }
  const goHome = () => {
    setSection('Home')
    setFolder(null)
    clearFilters()
    setSort('Name')
  }
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
  const visibleSelected = createMemo(() => {
    const visible = new Set(rows().map((item) => item.id))
    return selectedIds().filter((id) => visible.has(id))
  })
  const nextFocusAfter = (affected: Set<string>): string | undefined => {
    const visible = rows().map((item) => item.id)
    const first = visible.findIndex((id) => affected.has(id))
    if (first < 0) return undefined
    return [
      ...visible.slice(first + 1),
      ...visible.slice(0, first).reverse(),
    ].find((id) => !affected.has(id))
  }
  const focusFileAfter = (id: string | undefined) => {
    window.setTimeout(() => {
      const target = id
        ? document.querySelector<HTMLElement>(
            `[data-file-id="${id}"][data-file-open], [data-file-id="${id}"] [data-file-open]`,
          )
        : undefined
      const search = document.querySelector<HTMLElement>(
        '[data-slot="filter-bar"] input[type="search"]',
      )
      ;(target ?? search)?.focus()
    }, 40)
  }
  const patch = (id: string, values: Partial<WorkspaceFile>) =>
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...values } : item)),
    )
  const trash = (ids: string[], trashed: boolean) => {
    const affected = new Set(ids.flatMap((id) => [...descendants(id)]))
    if (!trashed) {
      const visited = new Set<string>()
      for (const id of ids) {
        let parent = items().find((item) => item.id === id)?.parent
        while (parent && !visited.has(parent)) {
          visited.add(parent)
          const parentItem = items().find((item) => item.id === parent)
          if (!parentItem) break
          if (parentItem.trashed) affected.add(parent)
          parent = parentItem.parent
        }
      }
    }
    const focusId = nextFocusAfter(affected)
    undo.capture(items())
    setItems((previous) =>
      previous.map((item) =>
        affected.has(item.id) ? { ...item, trashed } : item,
      ),
    )
    setNotice(
      trashed
        ? `${countLabel(affected.size, 'item')} moved to trash.`
        : `${countLabel(affected.size, 'item')} restored.`,
    )
    setActive(undefined)
    setActionId(undefined)
    clearSelection()
    focusFileAfter(focusId)
  }
  const toggleStar = (item: WorkspaceFile) => {
    const removing = item.starred && section() === 'Favourites'
    const affected = new Set([item.id])
    const focusId = removing ? nextFocusAfter(affected) : undefined
    if (removing) {
      undo.capture(items())
      setNotice('Removed from favourites.')
      setSelectedIds((previous) => previous.filter((id) => id !== item.id))
    } else {
      // A later mutation invalidates the one-step snapshot.
      undo.clear()
    }
    patch(item.id, { starred: !item.starred })
    if (removing) focusFileAfter(focusId)
  }
  const open = async (item: WorkspaceFile) => {
    if (item.trashed) return
    if (item.type === 'folder') {
      setSection('Home')
      setFolder(item.id)
      setQuery('')
      setType('All types')
      setSort('Name')
      clearSelection()
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
  const download = (item: WorkspaceFile) =>
    downloadBlob(
      item.name,
      item.file ??
        new Blob([item.content ?? ''], { type: 'text/plain;charset=utf-8' }),
    )
  const emptyTitle = () => {
    if (hasFilters()) return 'No files match'
    if (section() === 'Trash') return 'Trash is empty'
    if (section() === 'Favourites') return 'No favourites yet'
    if (section() === 'Shared with me') return 'Nothing shared with you'
    if (section() === 'Recents') return 'Nothing recent'
    return currentFolder() ? 'This folder is empty' : 'Home is empty'
  }
  const emptyHint = () => {
    if (hasFilters())
      return query().trim()
        ? `Nothing matches “${query().trim()}”.`
        : 'No files match the selected type.'
    if (section() === 'Trash') return 'Files you move to trash appear here.'
    if (section() === 'Favourites')
      return 'Star a file or folder to keep it here.'
    if (section() === 'Shared with me')
      return 'Files shared with you appear here.'
    if (section() === 'Recents')
      return 'Files modified in the last three days appear here.'
    return currentFolder()
      ? 'Upload files or create a subfolder to get started.'
      : 'Upload files or create a folder to get started.'
  }
  const emptyIcon = () => {
    if (hasFilters()) return 'lucide-search'
    if (section() === 'Trash') return 'lucide-trash-2'
    if (section() === 'Favourites') return 'lucide-star'
    if (section() === 'Shared with me') return 'lucide-users'
    if (section() === 'Recents') return 'lucide-clock'
    return 'lucide-folder-open'
  }
  const emptyAction = () => {
    if (hasFilters())
      return (
        <Button variant="outline" onClick={clearFilters}>
          Clear filters
        </Button>
      )
    if (section() === 'Home')
      return (
        <Button
          variant="outline"
          iconLeft="lucide-upload"
          onClick={() => upload?.click()}
        >
          Upload files
        </Button>
      )
    if (section() === 'Trash') return undefined
    return (
      <Button variant="outline" onClick={goHome}>
        Browse Home
      </Button>
    )
  }
  const emptySecondary = () => {
    if (hasFilters() || section() !== 'Home') return undefined
    return (
      <Button
        variant="ghost"
        iconLeft="lucide-folder-plus"
        onClick={() => {
          setName('')
          setNewFolder(true)
        }}
      >
        New folder
      </Button>
    )
  }
  const storageUsed = createMemo(() =>
    items()
      .filter((item) => !item.trashed)
      .reduce((sum, item) => sum + item.bytes, 0),
  )
  const columns = createMemo<DataTableColumn<WorkspaceFile>[]>(() => {
    const base: DataTableColumn<WorkspaceFile>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { mobile: 'title' },
        cell: (context) => (
          <Show
            when={!context.row.original.trashed}
            fallback={<span>{context.row.original.name}</span>}
          >
            <button
              type="button"
              data-file-id={context.row.original.id}
              data-file-open
              class="rounded-3 text-start text-ink-blue-link focus-visible:focus-ring"
              onClick={() => void open(context.row.original)}
            >
              {context.row.original.name}
            </button>
          </Show>
        ),
      },
      {
        accessorKey: 'owner',
        header: 'Owner',
        meta: { mobile: 'subtitle' },
        cell: (context) => (
          <span>
            {context.row.original.owner}
            <Show
              when={
                context.row.original.shared && !context.row.original.trashed
              }
            >
              <span class="text-caption text-ink-gray-7"> · Shared</span>
            </Show>
          </span>
        ),
      },
      {
        accessorKey: 'day',
        header: 'Modified',
        meta: { mobile: 'meta' },
        cell: (context) => relativeDay(context.row.original.day),
      },
      {
        accessorKey: 'bytes',
        header: 'Size',
        meta: { mobile: 'amount', align: 'end' },
        cell: (context) =>
          context.row.original.type === 'folder'
            ? countLabel(
                items().filter(
                  (item) =>
                    item.parent === context.row.original.id && !item.trashed,
                ).length,
                'item',
              )
            : size(context.row.original.bytes),
      },
    ]
    if (section() !== 'Trash')
      base.push({
        id: 'star',
        header: () => <span class="sr-only">Favourite</span>,
        enableSorting: false,
        enableHiding: false,
        meta: { mobile: 'status' },
        cell: (context) => (
          <Show when={!context.row.original.trashed}>
            <Button
              variant="ghost"
              size="sm"
              class="size-10 md:size-7 aria-pressed:bg-surface-amber-1 aria-pressed:text-ink-amber-8"
              icon="lucide-star"
              aria-pressed={context.row.original.starred}
              aria-label={`${context.row.original.starred ? 'Unfavourite' : 'Favourite'} ${context.row.original.name}`}
              onClick={() => toggleStar(context.row.original)}
            />
          </Show>
        ),
      })
    return base
  })
  return (
    <AppPage
      navigation={() => (
        <AppNavigation
          label="File views"
          value={section()}
          onChange={(value) => {
            setSection(value)
            setFolder(null)
            setQuery('')
            setType('All types')
            setSort(value === 'Recents' ? 'Modified' : 'Name')
            clearSelection()
          }}
          items={[
            {
              label: 'Home',
              icon: 'lucide-house',
              count: homeCount(),
            },
            {
              label: 'Recents',
              icon: 'lucide-clock',
              count: items().filter((item) => !item.trashed && item.day <= 3)
                .length,
            },
            {
              label: 'Favourites',
              icon: 'lucide-star',
              count: items().filter((item) => !item.trashed && item.starred)
                .length,
            },
            {
              label: 'Shared with me',
              icon: 'lucide-users',
              count: items().filter((item) => !item.trashed && item.shared)
                .length,
            },
            {
              label: 'Trash',
              icon: 'lucide-trash-2',
              count: items().filter((item) => item.trashed).length,
            },
          ]}
        />
      )}
      title="Files"
      section="Files"
      mobileTitle="Files"
      description={pageDescription()}
      actions={
        section() === 'Home' ? (
          <>
            <Button
              variant="outline"
              iconLeft="lucide-folder-plus"
              onClick={() => {
                setName('')
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
              tabindex="-1"
              class="hidden"
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
                clearSelection()
                announce(
                  `${countLabel(files.length, 'local file')} added. Nothing was uploaded to a server.`,
                )
                event.currentTarget.value = ''
              }}
            />
          </>
        ) : undefined
      }
    >
      <Notice
        text={notice()}
        onDismiss={dismissNotice}
        onUndo={canUndo() ? handleUndo : undefined}
        undoLabel="Undo"
      />
      <Section
        id="files-view"
        title={heading()}
        density="compact"
        toolbar={
          <FilterBar
            query={{
              placeholder: 'Search files…',
              value: query(),
              onInput: (value) => {
                setQuery(value)
                clearSelection()
              },
            }}
            selects={[
              {
                label: 'Type',
                value: type() === 'All types' ? '' : type(),
                onValueChange: (value) => {
                  setType(value || 'All types')
                  clearSelection()
                },
                options: optionsOf(['Folders', 'Files']),
              },
            ]}
            tabs={{
              label: 'File view',
              value: view(),
              onValueChange: (value) => {
                setView(value)
                clearSelection()
              },
              options: [
                { label: 'Grid', value: 'grid' },
                { label: 'List', value: 'list' },
              ],
            }}
            chips={[
              ...(type() !== 'All types'
                ? [
                    {
                      label: `Type: ${type()}`,
                      onRemove: () => {
                        setType('All types')
                        clearSelection()
                      },
                    },
                  ]
                : []),
              ...(query()
                ? [
                    {
                      label: `Search: ${query()}`,
                      onRemove: () => {
                        setQuery('')
                        clearSelection()
                      },
                    },
                  ]
                : []),
            ]}
            resultCount={rows().length}
            onClearAll={clearFilters}
          >
            <span class="self-center text-caption text-ink-gray-7">Sort</span>
            <Select
              aria-label="Sort files"
              variant="subtle"
              class="w-40 max-w-full"
              value={sort()}
              options={optionsOf(['Name', 'Modified', 'Size'])}
              onValueChange={(value) => setSort(value ?? 'Name')}
            />
          </FilterBar>
        }
        footer={
          <p class="text-caption text-ink-gray-7">
            Local demo storage · {size(storageUsed())} used. Nothing leaves this
            page.
          </p>
        }
      >
        <div class="flex flex-col gap-3">
          <Show when={section() === 'Home' && breadcrumbs().length > 0}>
            <Breadcrumbs
              aria-label="Folder path"
              items={[
                { label: 'Home', onClick: goHome },
                ...breadcrumbs().map((item) => ({
                  label: item.name,
                  onClick: () => {
                    setSection('Home')
                    setFolder(item.id)
                    setQuery('')
                    setType('All types')
                    clearSelection()
                  },
                })),
              ]}
            />
          </Show>
          <Show
            when={view() === 'grid'}
            fallback={
              <div class="md:-mx-px lg:mx-0">
                <DataTable
                  title="Files"
                  hideSearch
                  rows={rows()}
                  columns={columns()}
                  cardBreakpoint="lg"
                  recordsLabel="files"
                  emptyTitle={emptyTitle()}
                  emptyHint={emptyHint()}
                  onClearFilters={hasFilters() ? clearFilters : undefined}
                  selectionSummary={() => countLabel(rows().length, 'file')}
                  actionLabel={
                    section() === 'Trash'
                      ? 'Restore selected'
                      : 'Trash selected'
                  }
                  onRowsAction={(ids) => trash(ids, section() !== 'Trash')}
                />
              </div>
            }
          >
            <div class="flex flex-col gap-3">
              <ul
                class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                aria-label="Workspace files"
              >
                <For
                  each={rows()}
                  fallback={
                    <li class="col-span-full">
                      <EmptyState
                        bordered
                        icon={emptyIcon()}
                        title={emptyTitle()}
                        description={emptyHint()}
                        action={emptyAction()}
                        secondaryAction={emptySecondary()}
                      />
                    </li>
                  }
                >
                  {(item) => (
                    <li
                      data-file-id={item.id}
                      data-selected={isSelected(item.id) ? '' : undefined}
                      class="min-w-0 rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-3"
                      classList={{
                        'border-outline-blue-1 bg-surface-blue-1': isSelected(
                          item.id,
                        ),
                      }}
                    >
                      <div class="mb-4 flex items-start justify-between gap-2">
                        <div class="flex min-w-0 items-center gap-1">
                          <Checkbox
                            aria-label={`Select ${item.name}`}
                            checked={isSelected(item.id)}
                            onCheckedChange={(checked) =>
                              toggleSelected(item.id, checked)
                            }
                            padded
                            class="size-10 shrink-0 sm:size-7"
                          />
                          <span
                            aria-hidden="true"
                            class="grid size-12 shrink-0 place-items-center rounded-card bg-surface-blue-1 text-ink-blue-8"
                          >
                            <span
                              class={
                                item.type === 'folder'
                                  ? 'lucide-folder size-6'
                                  : 'lucide-file-text size-6'
                              }
                            />
                          </span>
                        </div>
                        <Show when={!item.trashed}>
                          <Button
                            variant="ghost"
                            size="sm"
                            class="size-10 shrink-0 aria-pressed:bg-surface-amber-1 aria-pressed:text-ink-amber-8 sm:size-7"
                            icon="lucide-star"
                            aria-pressed={item.starred}
                            aria-label={`${item.starred ? 'Unfavourite' : 'Favourite'} ${item.name}`}
                            onClick={() => toggleStar(item)}
                          />
                        </Show>
                      </div>
                      <Show
                        when={!item.trashed}
                        fallback={
                          <span class="block max-w-full truncate font-medium text-ink-gray-8">
                            {item.name}
                          </span>
                        }
                      >
                        <button
                          type="button"
                          data-file-open
                          class="block max-w-full truncate rounded-3 text-start font-medium text-ink-blue-link focus-visible:focus-ring"
                          onClick={() => void open(item)}
                        >
                          {item.name}
                        </button>
                      </Show>
                      <p class="mt-1 text-caption text-ink-gray-7">
                        {item.owner} ·{' '}
                        {item.type === 'folder'
                          ? countLabel(
                              items().filter(
                                (child) =>
                                  child.parent === item.id && !child.trashed,
                              ).length,
                              'item',
                            )
                          : size(item.bytes)}
                      </p>
                      <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <div class="flex flex-wrap items-center gap-2">
                          <span class="text-caption tabular-nums text-ink-gray-7">
                            {relativeDay(item.day)}
                          </span>
                          <Show when={item.shared && !item.trashed}>
                            <Badge theme="violet">Shared</Badge>
                          </Show>
                        </div>
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
                          data-file-open={item.trashed ? '' : undefined}
                          onClick={() => trash([item.id], !item.trashed)}
                        >
                          {item.trashed ? 'Restore' : 'Move to trash'}
                        </Button>
                      </div>
                    </li>
                  )}
                </For>
              </ul>
              <SelectionBar
                count={visibleSelected().length}
                summary={countLabel(rows().length, 'file')}
                primary={{
                  label:
                    section() === 'Trash'
                      ? 'Restore selected'
                      : 'Trash selected',
                  onClick: () =>
                    trash(visibleSelected(), section() !== 'Trash'),
                }}
                onClear={clearSelection}
                placement="sticky"
              />
              <Show when={visibleSelected().length > 0}>
                <div class="h-16 sm:hidden" aria-hidden="true" />
              </Show>
            </div>
          </Show>
        </div>
      </Section>
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
              <Show when={!file().trashed}>
                <Button
                  onClick={() => {
                    void open(file())
                    setActionId(undefined)
                  }}
                >
                  {file().type === 'folder' ? 'Open folder' : 'Preview file'}
                </Button>
                <Show when={file().type === 'file'}>
                  <Button onClick={() => download(file())}>
                    Download file
                  </Button>
                </Show>
              </Show>
              <Show when={!file().trashed}>
                <Button
                  onClick={() => {
                    toggleStar(file())
                    setActionId(undefined)
                  }}
                >
                  {file().starred ? 'Remove favourite' : 'Add favourite'}
                </Button>
              </Show>
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
      <CreateDialog
        open={newFolder()}
        onOpenChange={setNewFolder}
        title="Create a folder"
        description="Keep related files together."
        submitLabel="Create folder"
        onSubmit={() => {
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
          announce('Folder created.')
        }}
        fields={(attempted) => (
          <TextInput
            label="Folder name"
            required
            value={name()}
            onInput={(event) => setName(event.currentTarget.value)}
            error={
              attempted() && !name().trim() ? 'Enter a folder name.' : undefined
            }
          />
        )}
      />
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
                <Dialog.Close class="absolute end-4 top-4 grid size-10 place-items-center rounded-3 text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring sm:size-7">
                  <span class="lucide-x size-4" aria-hidden="true" />
                  <span class="sr-only">Close preview</span>
                </Dialog.Close>
                <Dialog.Header class="pe-10">
                  <Dialog.Title>{item().name}</Dialog.Title>
                  <Dialog.Description>
                    {item().owner} · {size(item().bytes)} · Local preview
                  </Dialog.Description>
                </Dialog.Header>
                <section
                  class="my-5 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-3 border border-outline-gray-1 bg-surface-gray-1 p-3 text-caption focus-visible:focus-ring"
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
                    value={moveTo()}
                    options={[
                      { label: 'Home', value: 'root' },
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
                    onValueChange={(value) => setMoveTo(value ?? 'root')}
                  />
                </div>
                <Dialog.Footer>
                  <Button
                    variant="outline"
                    disabled={!editName().trim()}
                    onClick={() => {
                      patch(item().id, {
                        name: editName().trim(),
                        parent: moveTo() === 'root' ? null : moveTo(),
                      })
                      setActive(undefined)
                      announce('File details updated.')
                    }}
                  >
                    Save file details
                  </Button>
                  <Button
                    variant="solid"
                    theme="blue"
                    onClick={() => download(item())}
                  >
                    Download file
                  </Button>
                </Dialog.Footer>
              </>
            )}
          </Show>
        </Dialog.Content>
      </Dialog.Root>
    </AppPage>
  )
}
