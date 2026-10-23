import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Switch,
  Textarea,
  TextInput,
} from '@talelk/newui-atoms'
import { createUndo, isEmail, optionsOf } from '@talelk/newui-data'
import {
  BottomSheet,
  Dialog,
  EmptyState,
  Select,
  TabButtons,
} from '@talelk/newui-molecules'
import { FilterBar, SelectionBar } from '@talelk/newui-organisms'
import { PaneLayout } from '@talelk/newui-templates'
import {
  createMemo,
  createSignal,
  For,
  type JSX,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import { AppNavigation } from '../examples/AppNavigation'
import { AppPage } from '../examples/AppPage'
import {
  filterMail,
  initialMail,
  MAIL_CATEGORIES,
  type MailFolder,
  type MailMessage,
  patchMail,
} from '../examples/mail-data'
import { Notice } from '../examples/Notice'

const FOLDERS = [
  'Inbox',
  'Starred',
  'Sent',
  'Drafts',
  'Archive',
  'Snoozed',
  'Trash',
  'Work',
  'Personal',
]

const CATEGORY_OPTIONS = [
  { label: 'All categories', value: 'All categories' },
  ...optionsOf(MAIL_CATEGORIES),
]

/** Space for the AppShell content wrapper's bottom padding. */
const FRAME_BOTTOM_GUTTER = 32

const LIST_TIME = new Intl.DateTimeFormat('en', {
  hour: 'numeric',
  minute: '2-digit',
})
const LIST_WEEKDAY = new Intl.DateTimeFormat('en', { weekday: 'short' })
const LIST_DATE = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
})
const FULL_DATE = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function dayStart(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** The row-level time: a clock today, "Yesterday", a weekday, then a date. */
function formatListTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const days = Math.round((dayStart(new Date()) - dayStart(date)) / 86_400_000)
  if (days <= 0) return LIST_TIME.format(date)
  if (days === 1) return 'Yesterday'
  if (days < 7) return LIST_WEEKDAY.format(date)
  return LIST_DATE.format(date)
}

function formatFullTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : FULL_DATE.format(date)
}

export function Mail(): JSX.Element {
  const [messages, setMessages] = createSignal<MailMessage[]>(
    initialMail.map((message) => ({ ...message, replies: [] })),
  )
  const [account, setAccount] = createSignal('rhea@acme.com')
  const accounts = new Map<string, MailMessage[]>()
  const [mailboxesOpen, setMailboxesOpen] = createSignal(false)
  const [navigationOpen, setNavigationOpen] = createSignal(true)
  const [folder, setFolder] = createSignal('Inbox')
  const [query, setQuery] = createSignal('')
  const [category, setCategory] = createSignal('All categories')
  const [mode, setMode] = createSignal('all')
  const [active, setActive] = createSignal<string>()
  const [selected, setSelected] = createSignal<string[]>([])
  const clearMailFilters = () => {
    setQuery('')
    setCategory('All categories')
    setMode('all')
    setSelected([])
  }
  const [reply, setReply] = createSignal('')
  const [replyKind, setReplyKind] = createSignal('Reply')
  const [forwardTo, setForwardTo] = createSignal('')
  const [replyAttempted, setReplyAttempted] = createSignal(false)
  const [notice, setNotice] = createSignal('')
  const mailUndo = createUndo<MailMessage[]>()
  const [compose, setCompose] = createSignal(false)
  const [composeAttempted, setComposeAttempted] = createSignal(false)
  const [draftId, setDraftId] = createSignal<string>()
  const [recipient, setRecipient] = createSignal('')
  const [subject, setSubject] = createSignal('')
  const [body, setBody] = createSignal('')
  const [frameHeight, setFrameHeight] = createSignal(480)
  let frame: HTMLDivElement | undefined
  let composeForm: HTMLFormElement | undefined
  let replyForm: HTMLFormElement | undefined
  const rows = createMemo(() =>
    filterMail(messages(), folder(), query(), mode() === 'unread', category()),
  )
  /** Selection is always an intersection with what is on screen. */
  const selectedVisible = createMemo(() => {
    const visible = new Set(rows().map((message) => message.id))
    return selected().filter((id) => visible.has(id))
  })
  const current = createMemo(() =>
    messages().find((message) => message.id === active()),
  )
  const hasFilters = () =>
    query().trim() !== '' || category() !== 'All categories' || mode() !== 'all'
  const updateFrameHeight = () => {
    if (!frame) return
    const next = Math.max(
      320,
      Math.floor(window.innerHeight - frame.offsetTop - FRAME_BOTTOM_GUTTER),
    )
    setFrameHeight(next)
  }
  onMount(() => {
    updateFrameHeight()
    void document.fonts.ready.then(updateFrameHeight)
    window.addEventListener('resize', updateFrameHeight)
    onCleanup(() => window.removeEventListener('resize', updateFrameHeight))
  })
  let nextId = initialMail.length + 1

  const selectFolder = (value: string) => {
    setFolder(value)
    setActive(undefined)
    setSelected([])
    setQuery('')
    setCategory('All categories')
    setMode('all')
  }
  const update = (
    ids: string[],
    patch: Partial<MailMessage>,
    description: string,
  ) => {
    mailUndo.capture(messages())
    setMessages(patchMail(messages(), ids, patch))
    setNotice(description)
    setSelected([])
  }
  const move = (target: MailFolder) => {
    const ids = selectedVisible().length
      ? selectedVisible()
      : active()
        ? [active() as string]
        : []
    if (!ids.length) return
    update(
      ids,
      { folder: target },
      `${ids.length} conversation${ids.length === 1 ? '' : 's'} moved to ${target.toLowerCase()}.`,
    )
    setActive(undefined)
  }
  const openMessage = (message: MailMessage) => {
    setActive(message.id)
    setSelected([])
    setReply('')
    setReplyKind('Reply')
    setForwardTo('')
    setReplyAttempted(false)
    setMessages(patchMail(messages(), [message.id], { unread: false }))
    if (message.folder === 'Drafts') {
      setDraftId(message.id)
      setRecipient(message.email)
      setSubject(message.subject)
      setBody(message.body)
      setComposeAttempted(false)
      setCompose(true)
    }
  }
  const newMessage = () => {
    setDraftId(undefined)
    setRecipient('')
    setSubject('')
    setBody('')
    setSelected([])
    setComposeAttempted(false)
    setCompose(true)
  }
  const handleComposeOpen = (open: boolean) => {
    setCompose(open)
    if (!open) setComposeAttempted(false)
  }
  const submitCompose = (event: SubmitEvent) => {
    event.preventDefault()
    setComposeAttempted(true)
    if (!isEmail(recipient()) || !subject().trim() || !body().trim()) {
      queueMicrotask(() => {
        composeForm
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus()
      })
      return
    }
    saveMessage('Sent')
  }
  const saveMessage = (target: 'Sent' | 'Drafts') => {
    if (
      target === 'Sent' &&
      (!isEmail(recipient()) || !subject().trim() || !body().trim())
    )
      return
    const message: MailMessage = {
      id: draftId() ?? `MAIL-${nextId++}`,
      name: 'Rhea Kapoor',
      email: recipient(),
      subject: subject().trim() || 'Untitled draft',
      body: body(),
      folder: target,
      category: 'Primary',
      unread: false,
      starred: false,
      muted: false,
      label: 'Work',
      receivedAt: new Date().toISOString(),
      replies: [],
    }
    setMessages((previous) => [
      message,
      ...previous.filter((item) => item.id !== message.id),
    ])
    setCompose(false)
    setComposeAttempted(false)
    setNotice(
      target === 'Sent'
        ? 'Message sent in this local demo. No email left this page.'
        : 'Draft saved. Find it in Drafts to continue writing.',
    )
    setActive(undefined)
  }
  const composeAction = () => (
    <Button variant="outline" iconLeft="lucide-pen-line" onClick={newMessage}>
      Compose email
    </Button>
  )
  const inboxAction = () => (
    <Button onClick={() => selectFolder('Inbox')}>Back to inbox</Button>
  )
  const emptyState = () => {
    if (hasFilters()) {
      return (
        <EmptyState
          icon="lucide-search-x"
          size="sm"
          class="min-h-0 flex-1"
          title="No conversations here"
          description="Choose another mailbox or clear your filters."
          action={
            <Button onClick={clearMailFilters}>Clear mail filters</Button>
          }
        />
      )
    }
    switch (folder()) {
      case 'Inbox':
        return (
          <EmptyState
            icon="lucide-inbox"
            size="sm"
            class="min-h-0 flex-1"
            title="Inbox is clear"
            description="You're all caught up. New conversations will land here."
            action={composeAction()}
          />
        )
      case 'Starred':
        return (
          <EmptyState
            icon="lucide-star"
            size="sm"
            class="min-h-0 flex-1"
            title="No starred conversations"
            description="Star a conversation to keep it here."
            action={inboxAction()}
          />
        )
      case 'Sent':
        return (
          <EmptyState
            icon="lucide-send"
            size="sm"
            class="min-h-0 flex-1"
            title="Nothing sent yet"
            description="Messages you send from this demo appear here."
            action={composeAction()}
          />
        )
      case 'Drafts':
        return (
          <EmptyState
            icon="lucide-file-pen"
            size="sm"
            class="min-h-0 flex-1"
            title="No drafts yet"
            description="Saved messages appear here so you can finish them later."
            action={composeAction()}
          />
        )
      case 'Archive':
        return (
          <EmptyState
            icon="lucide-archive"
            size="sm"
            class="min-h-0 flex-1"
            title="Nothing archived"
            description="Archived conversations stay here, out of the inbox."
            action={inboxAction()}
          />
        )
      case 'Snoozed':
        return (
          <EmptyState
            icon="lucide-clock"
            size="sm"
            class="min-h-0 flex-1"
            title="Nothing snoozed"
            description="Snoozed conversations wait here until you need them."
            action={inboxAction()}
          />
        )
      case 'Trash':
        return (
          <EmptyState
            icon="lucide-trash-2"
            size="sm"
            class="min-h-0 flex-1"
            title="Trash is empty"
            description="Conversations you delete will stay here until the demo reloads."
          />
        )
      case 'Work':
      case 'Personal':
        return (
          <EmptyState
            icon={folder() === 'Work' ? 'lucide-briefcase' : 'lucide-user'}
            size="sm"
            class="min-h-0 flex-1"
            title={`No ${folder()} conversations`}
            description={`Conversations labelled ${folder()} will appear here.`}
            action={inboxAction()}
          />
        )
      default:
        return (
          <EmptyState
            icon="lucide-mail"
            size="sm"
            class="min-h-0 flex-1"
            title="No conversations here"
            description="This mailbox is empty."
            action={inboxAction()}
          />
        )
    }
  }
  const FOLDER_ICONS: Record<string, string> = {
    Inbox: 'lucide-inbox',
    Starred: 'lucide-star',
    Sent: 'lucide-send',
    Drafts: 'lucide-file-pen',
    Archive: 'lucide-archive',
    Snoozed: 'lucide-clock',
    Trash: 'lucide-trash-2',
    Work: 'lucide-briefcase',
    Personal: 'lucide-user',
  }
  const MailboxItems = () => (
    <AppNavigation
      label="Mailboxes"
      value={folder()}
      onChange={(item) => {
        selectFolder(item)
        setMailboxesOpen(false)
      }}
      items={FOLDERS.map((item) => ({
        label: item,
        icon: FOLDER_ICONS[item] ?? 'lucide-folder',
        count:
          item === 'Inbox'
            ? messages().filter(
                (message) => message.folder === item && message.unread,
              ).length
            : filterMail(messages(), item, '', false, 'All categories').length,
      }))}
    />
  )
  return (
    <AppPage
      title="Your inbox, in focus"
      section="Mail"
      description="A clear home for conversations, updates and the work that happens between them."
      actions={
        <Button
          class="max-sm:min-h-10"
          variant="solid"
          theme="blue"
          iconLeft="lucide-pen-line"
          onClick={newMessage}
        >
          Compose email
        </Button>
      }
    >
      <div class="flex flex-wrap items-end gap-3">
        <Select
          label="Mail account"
          value={account()}
          options={['rhea@acme.com', 'team@acme.com'].map((value) => ({
            value,
            label: value,
          }))}
          onValueChange={(value) => {
            const next = value ?? 'rhea@acme.com'
            accounts.set(account(), messages())
            setMessages(
              accounts.get(next) ??
                initialMail.map((message) => ({
                  ...message,
                  replies: [],
                  subject:
                    next === 'team@acme.com'
                      ? `Team: ${message.subject}`
                      : message.subject,
                })),
            )
            setAccount(next)
            selectFolder('Inbox')
            mailUndo.clear()
          }}
        />
        <Button
          class="hidden sm:inline-flex"
          aria-expanded={navigationOpen()}
          aria-controls="mail-mailboxes"
          onClick={() => setNavigationOpen(!navigationOpen())}
        >
          Toggle mail navigation
        </Button>
        <div class="sm:hidden">
          <Button
            class="max-sm:min-h-10"
            onClick={() => setMailboxesOpen(true)}
          >
            Mailboxes · {folder()}
          </Button>
        </div>
      </div>
      <div
        ref={(element) => (frame = element)}
        style={{ height: `${frameHeight()}px` }}
        class="relative flex min-h-0 min-w-0 overflow-hidden rounded-card border border-outline-gray-1 bg-surface-elevation-1"
      >
        {/* `MailboxItems` renders the `Mailboxes` nav itself (AppNavigation);
          these wrappers only place it. */}
        <div
          id="mail-mailboxes"
          class="hidden w-40 shrink-0 overflow-y-auto border-b border-outline-gray-1 p-3 xl:border-b-0 xl:border-e"
          classList={{ 'sm:block': navigationOpen() }}
        >
          <MailboxItems />
        </div>
        <BottomSheet
          open={mailboxesOpen()}
          title="Mailboxes"
          onOpenChange={setMailboxesOpen}
        >
          <MailboxItems />
        </BottomSheet>
        <PaneLayout
          startSize={50}
          compactAt="lg"
          active={active() ? 'end' : 'start'}
          resizeLabel="Resize the conversation list"
          start={
            <section
              aria-label="Conversation list"
              class="flex h-full min-h-0 min-w-0 flex-col border-outline-gray-1 sm:border-e"
            >
              <div class="flex shrink-0 flex-col gap-3 p-3">
                <h2 class="text-section">{folder()}</h2>
                <FilterBar
                  surface="bare"
                  class="[&>div>div:last-child]:col-span-1"
                  query={{
                    placeholder: 'Search conversations…',
                    value: query(),
                    onInput: (value) => {
                      setQuery(value)
                      setSelected([])
                    },
                  }}
                  selects={[
                    {
                      label: 'Category',
                      value: category() === 'All categories' ? '' : category(),
                      onValueChange: (value) => {
                        setCategory(value || 'All categories')
                        setSelected([])
                      },
                      options: CATEGORY_OPTIONS,
                    },
                  ]}
                  tabs={{
                    label: 'Mail view',
                    value: mode(),
                    onValueChange: (value) => {
                      setMode(value)
                      setSelected([])
                    },
                    options: [
                      { label: 'All', value: 'all' },
                      { label: 'Unread', value: 'unread' },
                    ],
                  }}
                  chips={[
                    ...(category() !== 'All categories'
                      ? [
                          {
                            label: `Category: ${category()}`,
                            onRemove: () => {
                              setCategory('All categories')
                              setSelected([])
                            },
                          },
                        ]
                      : []),
                    ...(mode() === 'unread'
                      ? [
                          {
                            label: 'Unread only',
                            onRemove: () => {
                              setMode('all')
                              setSelected([])
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
                              setSelected([])
                            },
                          },
                        ]
                      : []),
                  ]}
                  resultCount={rows().length}
                  onClearAll={clearMailFilters}
                />
                <Show when={selectedVisible().length}>
                  <SelectionBar
                    count={selectedVisible().length}
                    summary={`in ${folder()}`}
                    primary={{
                      label: 'Archive',
                      icon: 'lucide-archive',
                      onClick: () => move('Archive'),
                    }}
                    secondary={
                      <Button
                        size="sm"
                        variant="ghost"
                        theme="red"
                        onClick={() => move('Trash')}
                      >
                        Trash
                      </Button>
                    }
                    onClear={() => setSelected([])}
                    placement="sticky"
                  />
                </Show>
              </div>
              <Show when={rows().length} fallback={emptyState()}>
                <ul
                  class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
                  aria-label="Conversations"
                >
                  <For each={rows()}>
                    {(message) => (
                      <li
                        class="flex gap-2 border-b border-outline-gray-1 p-3 transition-colors last:border-b-0 hover:bg-surface-gray-1"
                        classList={{
                          'bg-surface-blue-1': active() === message.id,
                          'bg-surface-gray-2':
                            selectedVisible().includes(message.id) &&
                            active() !== message.id,
                        }}
                        data-active={active() === message.id ? '' : undefined}
                        data-selected={
                          selectedVisible().includes(message.id)
                            ? ''
                            : undefined
                        }
                      >
                        <Checkbox
                          class="max-sm:size-10 max-sm:justify-center"
                          label={
                            <span class="sr-only">
                              Select {message.subject}
                            </span>
                          }
                          checked={selected().includes(message.id)}
                          onCheckedChange={(checked) =>
                            setSelected((previous) =>
                              checked
                                ? [...previous, message.id]
                                : previous.filter((id) => id !== message.id),
                            )
                          }
                        />
                        <button
                          type="button"
                          class="min-w-0 flex-1 rounded-3 text-start focus-visible:focus-ring"
                          aria-current={
                            active() === message.id ? 'true' : undefined
                          }
                          onClick={() => openMessage(message)}
                        >
                          <span class="sr-only">Open conversation from </span>
                          <span class="flex items-center justify-between gap-2">
                            <span class="truncate font-medium">
                              {message.name}
                            </span>
                            <span class="flex shrink-0 items-center gap-2">
                              <Show when={message.unread}>
                                <span class="text-caption font-medium text-ink-gray-8">
                                  Unread
                                </span>
                              </Show>
                              <time
                                dateTime={message.receivedAt}
                                title={formatFullTime(message.receivedAt)}
                                class="text-caption tabular-nums text-ink-gray-7"
                              >
                                {formatListTime(message.receivedAt)}
                              </time>
                            </span>
                          </span>
                          <span class="mt-0.5 flex items-center gap-2">
                            <span
                              class="truncate"
                              classList={{
                                'font-semibold': message.unread,
                              }}
                            >
                              {message.subject}
                            </span>
                            <Badge class="hidden shrink-0 sm:inline-flex">
                              {message.category}
                            </Badge>
                          </span>
                          <span class="mt-0.5 flex items-center gap-2">
                            <span class="min-w-0 flex-1 truncate text-caption text-ink-gray-7">
                              {message.body.split('\n\n')[1] ?? message.body}
                            </span>
                            <span class="hidden shrink-0 text-caption text-ink-gray-7 sm:inline">
                              {message.label}
                            </span>
                          </span>
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          class="max-sm:size-10 aria-pressed:bg-surface-amber-1 aria-pressed:text-ink-amber-8"
                          icon="lucide-star"
                          aria-label={`${message.starred ? 'Unstar' : 'Star'} ${message.subject}`}
                          aria-pressed={message.starred}
                          onClick={() =>
                            setMessages(
                              patchMail(messages(), [message.id], {
                                starred: !message.starred,
                              }),
                            )
                          }
                        />
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </section>
          }
          end={
            <section
              aria-label="Reading pane"
              class="flex h-full min-h-0 min-w-0 flex-col"
            >
              <Show
                when={current()}
                fallback={
                  <div class="grid min-h-0 flex-1 place-content-center overflow-y-auto p-8 text-center">
                    <span
                      aria-hidden="true"
                      class="lucide-mail mx-auto mb-3 size-8 text-ink-gray-7"
                    />
                    <h2 class="text-section">A little room to focus</h2>
                    <p class="mt-2 text-ink-gray-7">
                      Select a conversation to read and reply.
                    </p>
                  </div>
                }
              >
                {(message) => (
                  <>
                    <div class="flex shrink-0 flex-wrap items-center gap-2 border-b border-outline-gray-1 p-3">
                      <Button
                        class="lg:hidden"
                        variant="ghost"
                        icon="lucide-arrow-left"
                        aria-label="Back to conversations"
                        onClick={() => setActive(undefined)}
                      />
                      <Button
                        variant="ghost"
                        icon="lucide-archive"
                        aria-label="Archive conversation"
                        onClick={() => move('Archive')}
                      />
                      <Button
                        variant="ghost"
                        icon="lucide-trash-2"
                        aria-label="Trash conversation"
                        onClick={() => move('Trash')}
                      />
                      <Button
                        variant="ghost"
                        icon="lucide-clock"
                        aria-label="Snooze conversation"
                        onClick={() => move('Snoozed')}
                      />
                      <Show
                        when={
                          message().folder === 'Trash' ||
                          message().folder === 'Archive' ||
                          message().folder === 'Snoozed'
                        }
                      >
                        <Button size="sm" onClick={() => move('Inbox')}>
                          Move to inbox
                        </Button>
                      </Show>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          update(
                            [message().id],
                            { unread: true },
                            'Conversation marked unread.',
                          )
                          setActive(undefined)
                        }}
                      >
                        Mark unread
                      </Button>
                    </div>
                    {/* The scrollable email body must be focusable so keyboard users can scroll it (axe). */}
                    <article
                      ref={(element) => {
                        element.tabIndex = 0
                      }}
                      aria-label="Message body"
                      class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 focus-visible:focus-ring"
                    >
                      <h2 class="text-section">{message().subject}</h2>
                      <div class="my-5 flex items-center gap-3">
                        <Avatar label={message().name} />
                        <div class="min-w-0">
                          <p class="font-medium">{message().name}</p>
                          <p class="break-all text-caption text-ink-gray-7">
                            {message().email} ·{' '}
                            <time
                              dateTime={message().receivedAt}
                              title={formatFullTime(message().receivedAt)}
                            >
                              {formatFullTime(message().receivedAt)}
                            </time>
                          </p>
                        </div>
                      </div>
                      <p class="whitespace-pre-wrap leading-relaxed">
                        {message().body}
                      </p>
                      <For each={message().replies}>
                        {(text) => (
                          <div class="mt-5 rounded-3 border border-outline-gray-1 bg-surface-gray-1 p-3">
                            <p class="mb-2 text-caption font-medium text-ink-gray-7">
                              Rhea Kapoor · Local reply
                            </p>
                            <p class="whitespace-pre-wrap">{text}</p>
                          </div>
                        )}
                      </For>
                    </article>
                    <form
                      ref={(element) => (replyForm = element)}
                      class="flex shrink-0 flex-col gap-3 border-t border-outline-gray-1 bg-surface-elevation-1 p-3"
                      noValidate
                      onSubmit={(event) => {
                        event.preventDefault()
                        setReplyAttempted(true)
                        if (!reply().trim()) return
                        const item = message()
                        if (replyKind() === 'Forward') {
                          if (!isEmail(forwardTo())) {
                            queueMicrotask(() => {
                              replyForm
                                ?.querySelector<HTMLElement>(
                                  '[aria-invalid="true"]',
                                )
                                ?.focus()
                            })
                            return
                          }
                          setMessages((previous) => [
                            {
                              ...item,
                              id: `MAIL-${nextId++}`,
                              name: 'Rhea Kapoor',
                              email: forwardTo().trim(),
                              subject: `Fwd: ${item.subject}`,
                              body: `${reply().trim()}\n\n---------- Forwarded message ----------\nFrom: ${item.name} <${item.email}>\nSubject: ${item.subject}\n\n${item.body}`,
                              folder: 'Sent',
                              unread: false,
                              starred: false,
                              muted: false,
                              receivedAt: new Date().toISOString(),
                              replies: [],
                            },
                            ...previous,
                          ])
                          setReply('')
                          setForwardTo('')
                          setReplyAttempted(false)
                          setNotice(
                            'Message forwarded in this local demo. Find it in Sent. No email left this page.',
                          )
                          return
                        }
                        setMessages(
                          patchMail(messages(), [item.id], {
                            replies: [...item.replies, reply().trim()],
                          }),
                        )
                        setReply('')
                        setNotice(
                          'Reply sent in this local demo. No email left this page.',
                        )
                      }}
                    >
                      <TabButtons
                        label="Reply action"
                        value={replyKind()}
                        onValueChange={(value) => {
                          setReplyKind(value)
                          setReplyAttempted(false)
                        }}
                        options={['Reply', 'Reply all', 'Forward'].map(
                          (value) => ({ label: value, value }),
                        )}
                      />
                      <Show when={replyKind() === 'Forward'}>
                        <TextInput
                          label="Forward to"
                          type="email"
                          required
                          value={forwardTo()}
                          error={
                            replyAttempted() && !isEmail(forwardTo())
                              ? 'Enter a valid recipient email.'
                              : undefined
                          }
                          onInput={(event) =>
                            setForwardTo(event.currentTarget.value)
                          }
                        />
                      </Show>
                      <Textarea
                        label={`${replyKind()} message`}
                        rows={3}
                        required
                        value={reply()}
                        onInput={(event) => setReply(event.currentTarget.value)}
                        placeholder="Write a thoughtful reply…"
                      />
                      <div class="flex flex-wrap items-center justify-between gap-3">
                        <Switch
                          label="Mute this thread"
                          checked={message().muted}
                          onCheckedChange={(checked) =>
                            setMessages(
                              patchMail(messages(), [message().id], {
                                muted: checked,
                              }),
                            )
                          }
                        />
                        <Button
                          type="submit"
                          variant="solid"
                          theme="blue"
                          disabled={!reply().trim()}
                        >
                          {replyKind() === 'Forward'
                            ? 'Forward demo email'
                            : 'Send demo reply'}
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </Show>
            </section>
          }
        />
      </div>
      <Show when={notice()}>
        <div
          class="pointer-events-none fixed inset-x-4 z-overlay flex justify-center sm:justify-end"
          classList={{
            'bottom-4': true,
            'max-sm:bottom-20': selectedVisible().length > 0,
          }}
        >
          <div class="pointer-events-auto w-full max-w-md">
            <Notice
              text={notice()}
              onUndo={
                mailUndo.snapshot()
                  ? () => {
                      mailUndo.undo(setMessages)
                      setNotice('Change undone.')
                    }
                  : undefined
              }
              undoLabel="Undo mail action"
              onDismiss={() => setNotice('')}
            />
          </div>
        </div>
      </Show>
      <Dialog.Root open={compose()} onOpenChange={handleComposeOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 flex-col gap-1">
                <Dialog.Title>New message</Dialog.Title>
                <Dialog.Description>
                  Write a local demo email. Nothing is sent externally.
                </Dialog.Description>
              </div>
              <Dialog.Close class="grid size-10 shrink-0 place-items-center rounded-3 text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring motion-reduce:transition-none">
                <span class="sr-only">Close composer</span>
                <span aria-hidden="true" class="lucide-x size-4" />
              </Dialog.Close>
            </div>
          </Dialog.Header>
          <form
            ref={(element) => (composeForm = element)}
            noValidate
            class="mt-5 flex flex-col gap-4"
            onSubmit={submitCompose}
          >
            <TextInput
              label="To"
              type="email"
              required
              value={recipient()}
              onInput={(event) => setRecipient(event.currentTarget.value)}
              error={
                composeAttempted() && !isEmail(recipient())
                  ? 'Enter a valid recipient email.'
                  : undefined
              }
            />
            <TextInput
              label="Subject"
              required
              value={subject()}
              onInput={(event) => setSubject(event.currentTarget.value)}
              error={
                composeAttempted() && !subject().trim()
                  ? 'Add a subject.'
                  : undefined
              }
            />
            <Textarea
              label="Email message"
              rows={6}
              required
              value={body()}
              onInput={(event) => setBody(event.currentTarget.value)}
              error={
                composeAttempted() && !body().trim()
                  ? 'Write a message.'
                  : undefined
              }
            />
            <Dialog.Footer>
              <Button variant="ghost" onClick={() => handleComposeOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => saveMessage('Drafts')}>
                Save email draft
              </Button>
              <Button type="submit" variant="solid" theme="blue">
                Send demo email
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </AppPage>
  )
}
