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
import { BottomSheet, Select, TabButtons } from '@talelk/newui-molecules'
import { FilterBar } from '@talelk/newui-organisms'
import { PaneLayout } from '@talelk/newui-templates'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { AppNavigation } from '../examples/AppNavigation'
import { AppPage } from '../examples/AppPage'
import { CreateDialog } from '../examples/CreateDialog'
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
  const clearMailFilters = () => {
    setQuery('')
    setCategory('All categories')
    setMode('all')
  }
  const [active, setActive] = createSignal<string>()
  const [selected, setSelected] = createSignal<string[]>([])
  const [reply, setReply] = createSignal('')
  const [replyKind, setReplyKind] = createSignal('Reply')
  const [forwardTo, setForwardTo] = createSignal('')
  const [replyAttempted, setReplyAttempted] = createSignal(false)
  const [notice, setNotice] = createSignal('')
  const mailUndo = createUndo<MailMessage[]>()
  const [compose, setCompose] = createSignal(false)
  const [draftId, setDraftId] = createSignal<string>()
  const [recipient, setRecipient] = createSignal('')
  const [subject, setSubject] = createSignal('')
  const [body, setBody] = createSignal('')
  const rows = createMemo(() =>
    filterMail(messages(), folder(), query(), mode() === 'unread', category()),
  )
  const current = createMemo(() =>
    messages().find((message) => message.id === active()),
  )
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
    const ids = selected().length
      ? selected()
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
      setCompose(true)
    }
  }
  const newMessage = () => {
    setDraftId(undefined)
    setRecipient('')
    setSubject('')
    setBody('')
    setCompose(true)
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
      replies: [],
    }
    setMessages((previous) => [
      message,
      ...previous.filter((item) => item.id !== message.id),
    ])
    setCompose(false)
    setNotice(
      target === 'Sent'
        ? 'Message sent in this local demo. No email left this page.'
        : 'Draft saved. Find it in Drafts to continue writing.',
    )
    setActive(undefined)
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
          onClick={() => setNavigationOpen(!navigationOpen())}
        >
          Toggle mail navigation
        </Button>
        <div class="sm:hidden">
          <Button onClick={() => setMailboxesOpen(true)}>
            Mailboxes · {folder()}
          </Button>
        </div>
      </div>
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
      <div class="flex min-h-[640px] min-w-0 overflow-hidden rounded-5 border border-outline-gray-1 bg-surface-elevation-1">
        {/* `MailboxItems` renders the `Mailboxes` nav itself (AppNavigation);
          these wrappers only place it. */}
        <div
          class="hidden w-40 shrink-0 border-b border-outline-gray-1 p-3 xl:border-b-0 xl:border-e"
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
          compactAt="sm"
          active={active() ? 'end' : 'start'}
          resizeLabel="Resize the conversation list"
          start={
            <section
              aria-label="Conversation list"
              class="min-w-0 border-outline-gray-1 sm:border-e"
            >
              <div class="flex flex-col gap-3 p-3">
                <h2 class="text-section">{folder()}</h2>
                <FilterBar
                  query={{
                    placeholder: 'Search conversations…',
                    value: query(),
                    onInput: setQuery,
                  }}
                  selects={[
                    {
                      label: 'Category',
                      value: category() === 'All categories' ? '' : category(),
                      onValueChange: (value) =>
                        setCategory(value || 'All categories'),
                      options: optionsOf(MAIL_CATEGORIES),
                    },
                  ]}
                  tabs={{
                    value: mode(),
                    onValueChange: setMode,
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
                            onRemove: () => setCategory('All categories'),
                          },
                        ]
                      : []),
                    ...(mode() === 'unread'
                      ? [
                          {
                            label: 'Unread only',
                            onRemove: () => setMode('all'),
                          },
                        ]
                      : []),
                    ...(query()
                      ? [
                          {
                            label: `Search: ${query()}`,
                            onRemove: () => setQuery(''),
                          },
                        ]
                      : []),
                  ]}
                  resultCount={rows().length}
                  onClearAll={clearMailFilters}
                />
                <Show when={selected().length}>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-caption text-ink-gray-7">
                      {selected().length} selected
                    </span>
                    <Button size="sm" onClick={() => move('Archive')}>
                      Archive selected
                    </Button>
                    <Button size="sm" onClick={() => move('Trash')}>
                      Trash selected
                    </Button>
                  </div>
                </Show>
              </div>
              <ul
                class="max-h-[640px] overflow-y-auto"
                aria-label="Conversations"
              >
                <For
                  each={rows()}
                  fallback={
                    <li class="p-8 text-center">
                      <p class="font-medium">No conversations here</p>
                      <p class="mt-1 text-caption text-ink-gray-7">
                        Choose another mailbox or clear your filters.
                      </p>
                      <Button class="mt-3" onClick={clearMailFilters}>
                        Clear mail filters
                      </Button>
                    </li>
                  }
                >
                  {(message) => (
                    <li
                      class="flex gap-2 border-b border-outline-gray-1 p-3 last:border-b-0"
                      classList={{
                        'bg-surface-blue-1': active() === message.id,
                      }}
                    >
                      <Checkbox
                        label={
                          <span class="sr-only">Select {message.subject}</span>
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
                        onClick={() => openMessage(message)}
                      >
                        <span class="sr-only">Open </span>
                        <span class="flex items-center justify-between gap-2">
                          <span class="truncate font-medium">
                            {message.name}
                          </span>
                          <Show when={message.unread}>
                            <span class="text-caption text-ink-blue-link">
                              Unread
                            </span>
                          </Show>
                        </span>
                        <span
                          class="mt-1 block truncate"
                          classList={{ 'font-semibold': message.unread }}
                        >
                          {message.subject}
                        </span>
                        <span class="mt-1 line-clamp-2 text-caption text-ink-gray-7">
                          {message.body.split('\n\n')[1]}
                        </span>
                        <span class="mt-2 flex gap-2">
                          <Badge>{message.category}</Badge>
                          <Badge>{message.label}</Badge>
                        </span>
                      </button>
                      <Button
                        size="sm"
                        variant="ghost"
                        class="aria-pressed:bg-surface-amber-1 aria-pressed:text-ink-amber-8"
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
            </section>
          }
          end={
            <section aria-label="Reading pane" class="flex min-w-0 flex-col">
              <Show
                when={current()}
                fallback={
                  <div class="grid flex-1 place-content-center p-8 text-center">
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
                    <div class="flex flex-wrap items-center gap-2 border-b border-outline-gray-1 p-3">
                      <Button
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
                    <div class="flex-1 p-3">
                      <h2 class="text-section">{message().subject}</h2>
                      <div class="my-5 flex items-center gap-3">
                        <Avatar label={message().name} />
                        <div class="min-w-0">
                          <p class="font-medium">{message().name}</p>
                          <p class="break-all text-caption text-ink-gray-7">
                            {message().email} · Sep 30, 2026
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
                    </div>
                    <form
                      class="sticky bottom-0 flex flex-col gap-4 border-t border-outline-gray-1 bg-surface-elevation-1 p-3"
                      noValidate
                      onSubmit={(event) => {
                        event.preventDefault()
                        setReplyAttempted(true)
                        if (!reply().trim()) return
                        const item = message()
                        if (replyKind() === 'Forward') {
                          if (!isEmail(forwardTo())) return
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
                        rows={4}
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
      <CreateDialog
        open={compose()}
        onOpenChange={setCompose}
        title="New message"
        description="Write a local demo email. Nothing is sent externally."
        submitLabel="Send demo email"
        secondaryLabel="Save email draft"
        onSecondary={() => saveMessage('Drafts')}
        onSubmit={() => saveMessage('Sent')}
        fields={(attempted) => (
          <>
            <TextInput
              label="To"
              type="email"
              required
              value={recipient()}
              onInput={(event) => setRecipient(event.currentTarget.value)}
              error={
                attempted() && !isEmail(recipient())
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
                attempted() && !subject().trim() ? 'Add a subject.' : undefined
              }
            />
            <Textarea
              label="Email message"
              rows={6}
              required
              value={body()}
              onInput={(event) => setBody(event.currentTarget.value)}
              error={
                attempted() && !body().trim() ? 'Write a message.' : undefined
              }
            />
          </>
        )}
      />
    </AppPage>
  )
}
