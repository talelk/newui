import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Checkbox,
  Dialog,
  Select,
  Switch,
  TabButtons,
  Textarea,
  TextInput,
} from '@newui/ui'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { ExampleFrame } from '../examples/ExampleFrame'
import {
  filterMail,
  initialMail,
  MAIL_CATEGORIES,
  type MailFolder,
  type MailMessage,
  patchMail,
} from '../examples/mail-data'

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
  let panes: HTMLDivElement | undefined
  const [folder, setFolder] = createSignal('Inbox')
  const [query, setQuery] = createSignal('')
  const [category, setCategory] = createSignal('All categories')
  const [mode, setMode] = createSignal('all')
  const [active, setActive] = createSignal<string>()
  const [selected, setSelected] = createSignal<string[]>([])
  const [reply, setReply] = createSignal('')
  const [replyKind, setReplyKind] = createSignal('Reply')
  const [forwardTo, setForwardTo] = createSignal('')
  const [replyAttempted, setReplyAttempted] = createSignal(false)
  const [notice, setNotice] = createSignal('')
  const [snapshot, setSnapshot] = createSignal<MailMessage[]>()
  const [compose, setCompose] = createSignal(false)
  const [draftId, setDraftId] = createSignal<string>()
  const [recipient, setRecipient] = createSignal('')
  const [subject, setSubject] = createSignal('')
  const [body, setBody] = createSignal('')
  const [attempted, setAttempted] = createSignal(false)
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
    setSnapshot(messages())
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
    setAttempted(false)
    setCompose(true)
  }
  const saveMessage = (target: 'Sent' | 'Drafts') => {
    setAttempted(true)
    if (
      target === 'Sent' &&
      (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient()) ||
        !subject().trim() ||
        !body().trim())
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
    setAttempted(false)
    setNotice(
      target === 'Sent'
        ? 'Message sent in this local demo. No email left this page.'
        : 'Draft saved. Find it in Drafts to continue writing.',
    )
    setActive(undefined)
  }
  const MailboxItems = () => (
    <>
      <For each={FOLDERS}>
        {(item) => (
          <button
            type="button"
            class="flex items-center justify-between gap-3 rounded-3 px-3 py-2 text-start text-ink-gray-6 hover:bg-surface-gray-2 focus-visible:focus-ring"
            classList={{
              'bg-surface-blue-2 text-ink-blue-8': folder() === item,
            }}
            aria-current={folder() === item ? 'page' : undefined}
            onClick={() => {
              selectFolder(item)
              setMailboxesOpen(false)
            }}
          >
            <span>{item}</span>
            <span class="text-caption tabular-nums">
              {item === 'Inbox'
                ? messages().filter(
                    (message) => message.folder === item && message.unread,
                  ).length
                : filterMail(messages(), item, '', false, 'All categories')
                    .length}
            </span>
          </button>
        )}
      </For>
    </>
  )
  return (
    <ExampleFrame
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
          value={[account()]}
          options={['rhea@acme.com', 'team@acme.com'].map((value) => ({
            value,
            label: value,
          }))}
          onValueChange={(value) => {
            const next = value[0] ?? 'rhea@acme.com'
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
            setSnapshot(undefined)
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
        <label class="hidden text-caption text-ink-gray-6 sm:flex sm:flex-col sm:gap-2">
          Inbox pane width
          <input
            type="range"
            aria-label="Inbox pane width"
            min="30"
            max="70"
            value="50"
            onInput={(event) => {
              const value = Number(event.currentTarget.value)
              panes?.style.setProperty(
                '--mail-list-width',
                `${value / (100 - value)}fr`,
              )
            }}
          />
        </label>
      </div>
      <Show when={notice()}>
        <div
          role="status"
          class="flex flex-wrap items-center justify-between gap-2 rounded-3 border border-outline-blue-1 bg-surface-blue-1 p-3 text-ink-blue-8"
        >
          <span>{notice()}</span>
          <Show when={snapshot()}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const previous = snapshot()
                if (previous) setMessages(previous)
                setSnapshot(undefined)
                setNotice('Change undone.')
              }}
            >
              Undo mail action
            </Button>
          </Show>
        </div>
      </Show>
      <div
        class="grid min-h-[640px] min-w-0 overflow-hidden rounded-5 border border-outline-gray-1 bg-surface-elevation-1"
        classList={{ 'xl:grid-cols-[160px_minmax(0,1fr)]': navigationOpen() }}
      >
        <nav
          aria-label="Mailboxes"
          class="hidden flex-wrap gap-1 border-b border-outline-gray-1 p-3 xl:flex-col xl:border-b-0 xl:border-e"
          classList={{ 'sm:flex': navigationOpen() }}
        >
          <MailboxItems />
        </nav>
        <BottomSheet
          open={mailboxesOpen()}
          title="Mailboxes"
          onOpenChange={setMailboxesOpen}
        >
          <nav aria-label="Mobile mailboxes">
            <MailboxItems />
          </nav>
        </BottomSheet>
        <div
          ref={panes}
          class="grid min-w-0 sm:grid-cols-[minmax(0,var(--mail-list-width,1fr))_minmax(0,1fr)]"
        >
          <section
            aria-label="Conversation list"
            class="min-w-0 border-outline-gray-1 sm:border-e"
            classList={{ 'hidden sm:block': !!active() }}
          >
            <div class="flex flex-col gap-3 border-b border-outline-gray-1 p-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-section">{folder()}</h2>
                <TabButtons
                  value={mode()}
                  onValueChange={setMode}
                  options={[
                    { label: 'All mail', value: 'all' },
                    { label: 'Unread', value: 'unread' },
                  ]}
                />
              </div>
              <TextInput
                aria-label="Search mail"
                placeholder="Search conversations…"
                prefix={
                  <span aria-hidden="true" class="lucide-search size-4" />
                }
                value={query()}
                onInput={(event) => setQuery(event.currentTarget.value)}
              />
              <Select
                label="Category"
                options={['All categories', ...MAIL_CATEGORIES].map(
                  (value) => ({ label: value, value }),
                )}
                value={[category()]}
                onValueChange={(value) =>
                  setCategory(value[0] ?? 'All categories')
                }
              />
              <Show when={selected().length}>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-caption text-ink-gray-6">
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
                    <p class="mt-1 text-caption text-ink-gray-6">
                      Choose another mailbox or clear your filters.
                    </p>
                    <Button
                      class="mt-3"
                      onClick={() => {
                        setQuery('')
                        setMode('all')
                        setCategory('All categories')
                      }}
                    >
                      Clear mail filters
                    </Button>
                  </li>
                }
              >
                {(message) => (
                  <li
                    class="flex gap-2 border-b border-outline-gray-1 p-3 last:border-b-0"
                    classList={{ 'bg-surface-blue-1': active() === message.id }}
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
                        <span class="truncate font-medium">{message.name}</span>
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
                      <span class="mt-1 line-clamp-2 text-caption text-ink-gray-6">
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
          <section
            aria-label="Reading pane"
            class="flex min-w-0 flex-col"
            classList={{ 'hidden sm:flex': !active() }}
          >
            <Show
              when={current()}
              fallback={
                <div class="grid flex-1 place-content-center p-8 text-center">
                  <span
                    aria-hidden="true"
                    class="lucide-mail mx-auto mb-3 size-8 text-ink-gray-6"
                  />
                  <h2 class="text-section">A little room to focus</h2>
                  <p class="mt-2 text-ink-gray-6">
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
                        <p class="break-all text-caption text-ink-gray-6">
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
                          <p class="mb-2 text-caption font-medium text-ink-gray-6">
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
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forwardTo()))
                          return
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
                          replyAttempted() &&
                          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forwardTo())
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
        </div>
      </div>
      <Dialog.Root open={compose()} onOpenChange={setCompose}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>New message</Dialog.Title>
            <Dialog.Description>
              Write a local demo email. Nothing is sent externally.
            </Dialog.Description>
          </Dialog.Header>
          <form
            class="mt-5 flex flex-col gap-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              saveMessage('Sent')
            }}
          >
            <TextInput
              label="To"
              type="email"
              required
              value={recipient()}
              onInput={(event) => setRecipient(event.currentTarget.value)}
              error={
                attempted() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient())
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
            <Dialog.Footer>
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
    </ExampleFrame>
  )
}
