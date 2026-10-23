import { Button, Textarea, TextInput } from '@talelk/newui-atoms'
import { Dialog } from '@talelk/newui-molecules'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import { CreateDialog } from './CreateDialog'

export interface Community {
  id: string
  name: string
  icon: string
}

export interface Space {
  community: string
  name: string
  icon: string
}

export interface DiscussionReply {
  author: string
  body: string
  createdAt: number
  /** Unread replies are counted in the feed and the space navigation. */
  unread?: boolean
}

export interface Discussion {
  id: string
  title: string
  author: string
  /** One-line preview for the feed. */
  excerpt: string
  /** The complete first post shown in the thread. */
  body: string
  community: string
  space: string
  createdAt: number
  replies: DiscussionReply[]
}

/** Last activity is the later of the first post and its newest reply. */
export function lastActivityAt(post: Discussion): number {
  return Math.max(
    post.createdAt,
    ...post.replies.map((reply) => reply.createdAt),
  )
}

export function replyCount(post: Discussion): number {
  return post.replies.length
}

export function unreadCount(post: Discussion): number {
  return post.replies.reduce(
    (total, reply) => total + (reply.unread ? 1 : 0),
    0,
  )
}

export function pluralize(
  value: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return value === 1 ? singular : plural
}

export function formatRelativeTime(
  timestamp: number,
  now = Date.now(),
): string {
  const elapsed = Math.max(0, now - timestamp)
  const minutes = Math.floor(elapsed / 60_000)
  if (minutes < 1) return 'Now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}w`
}

function excerptOf(body: string): string {
  const line = body.replace(/\s+/g, ' ').trim()
  return line.length > 132 ? `${line.slice(0, 131)}…` : line
}

/**
 * Page-local demo repository: communities own spaces, spaces own a feed, and
 * unread state lives on the replies themselves so every displayed count has one
 * source. Mutations go through the store, keeping row identity for focus.
 */
export function createDiscussions(
  initial: Discussion[],
  activeCommunity: () => string,
  activeSpace: () => string,
) {
  const [state, setState] = createStore<{ posts: Discussion[] }>({
    posts: initial.map((post) => ({
      ...post,
      replies: post.replies.map((reply) => ({ ...reply })),
    })),
  })
  const [query, setQuery] = createSignal('')
  const [creating, setCreating] = createSignal(false)
  const [selected, setSelected] = createSignal<string>()
  const [title, setTitle] = createSignal('')
  const [body, setBody] = createSignal('')
  const [reply, setReply] = createSignal('')

  const inActiveSpace = (post: Discussion) =>
    post.community === activeCommunity() && post.space === activeSpace()

  /** Every post in the current space, before the query is applied. */
  const spacePosts = createMemo(() => state.posts.filter(inActiveSpace))

  const rows = createMemo(() => {
    const needle = query().trim().toLowerCase()
    return spacePosts()
      .filter((post) => {
        if (!needle) return true
        const haystack = [
          post.title,
          post.author,
          post.excerpt,
          post.body,
          ...post.replies.flatMap((item) => [item.author, item.body]),
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(needle)
      })
      .slice()
      .sort((left, right) => lastActivityAt(right) - lastActivityAt(left))
  })

  const current = createMemo(() =>
    state.posts.find((post) => post.id === selected()),
  )

  const unreadInSpace = (spaceName: string) =>
    state.posts
      .filter(
        (post) =>
          post.community === activeCommunity() && post.space === spaceName,
      )
      .reduce((total, post) => total + unreadCount(post), 0)

  const unreadInCommunity = (communityId: string) =>
    state.posts
      .filter((post) => post.community === communityId)
      .reduce((total, post) => total + unreadCount(post), 0)

  const start = () => {
    setTitle('')
    setBody('')
    setCreating(true)
  }

  const open = (post: Discussion) => {
    setSelected(post.id)
    setReply('')
    const index = state.posts.findIndex((item) => item.id === post.id)
    if (index < 0) return
    if (!state.posts[index]?.replies.some((item) => item.unread)) return
    setState('posts', index, 'replies', (replies) =>
      replies.map((item) => (item.unread ? { ...item, unread: false } : item)),
    )
  }

  const markRead = () => {
    state.posts.forEach((post, index) => {
      if (!inActiveSpace(post) || !post.replies.some((item) => item.unread))
        return
      setState('posts', index, 'replies', (replies) =>
        replies.map((item) =>
          item.unread ? { ...item, unread: false } : item,
        ),
      )
    })
  }

  /** Returns the new discussion id, or undefined when validation fails. */
  const create = (): string | undefined => {
    const cleanTitle = title().trim()
    const cleanBody = body().trim()
    if (cleanTitle.length < 3 || !cleanBody) return undefined
    if (
      state.posts.some(
        (post) => post.title.toLowerCase() === cleanTitle.toLowerCase(),
      )
    )
      return undefined

    const createdAt = Date.now()
    const post: Discussion = {
      id: `discussion-${createdAt.toString(36)}-${state.posts.length}`,
      title: cleanTitle,
      author: 'Rhea Kapoor',
      excerpt: excerptOf(cleanBody),
      body: cleanBody,
      community: activeCommunity(),
      space: activeSpace(),
      createdAt,
      replies: [],
    }
    setState('posts', (posts) => [post, ...posts])
    setQuery('')
    setCreating(false)
    return post.id
  }

  /** Returns true when the reply was accepted. */
  const sendReply = (): boolean => {
    const cleanReply = reply().trim()
    const id = selected()
    if (!cleanReply || !id) return false
    const index = state.posts.findIndex((post) => post.id === id)
    if (index < 0) return false
    setState('posts', index, 'replies', (replies) => [
      ...replies,
      {
        author: 'Rhea Kapoor',
        body: cleanReply,
        createdAt: Date.now(),
        unread: false,
      },
    ])
    setReply('')
    return true
  }

  return {
    posts: () => state.posts,
    spacePosts,
    rows,
    query,
    setQuery,
    creating,
    setCreating,
    selected,
    setSelected,
    title,
    setTitle,
    body,
    setBody,
    reply,
    setReply,
    current,
    start,
    open,
    markRead,
    create,
    sendReply,
    unreadInSpace,
    unreadInCommunity,
  }
}

export function DiscussionDialogs(props: {
  store: ReturnType<typeof createDiscussions>
  /** Focus returns to this discussion's row after the thread closes. */
  onClosed?: (id: string) => void
  onCreated?: (id: string) => void
  onPosted?: () => void
}) {
  const store = () => props.store

  const closeThread = () => {
    const id = store().selected()
    if (!id) return
    store().setSelected(undefined)
    store().setReply('')
    requestAnimationFrame(() => props.onClosed?.(id))
  }

  return (
    <>
      <CreateDialog
        open={store().creating()}
        onOpenChange={store().setCreating}
        title="New discussion"
        description="Start a conversation in the selected space. Changes stay on this page."
        submitLabel="Post discussion"
        secondaryLabel="Cancel discussion"
        onSubmit={() => {
          const id = store().create()
          if (id) props.onCreated?.(id)
        }}
        fields={(attempted) => (
          <>
            <TextInput
              label="Discussion title"
              required
              value={store().title()}
              onInput={(event) => store().setTitle(event.currentTarget.value)}
              error={
                attempted() && store().title().trim().length < 3
                  ? 'Enter a title with at least 3 characters.'
                  : attempted() &&
                      store()
                        .posts()
                        .some(
                          (post) =>
                            post.title.toLowerCase() ===
                            store().title().trim().toLowerCase(),
                        )
                    ? 'Choose a unique discussion title.'
                    : undefined
              }
            />
            <Textarea
              label="Discussion message"
              required
              rows={5}
              value={store().body()}
              onInput={(event) => store().setBody(event.currentTarget.value)}
              error={
                attempted() && !store().body().trim()
                  ? 'Write a message to start the conversation.'
                  : undefined
              }
            />
          </>
        )}
      />
      <Dialog.Root
        open={Boolean(store().current())}
        onOpenChange={(open) => {
          if (!open) closeThread()
        }}
      >
        <Dialog.Content
          size="2xl"
          class="flex max-h-[calc(100dvh-2rem)] flex-col"
        >
          <Show when={store().current()}>
            {(post) => (
              <>
                <Dialog.Close class="absolute end-3 top-3 z-raised grid size-10 place-items-center rounded-control text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring sm:size-8">
                  <span class="sr-only">Close discussion</span>
                  <span class="lucide-x size-4" aria-hidden="true" />
                </Dialog.Close>
                <Dialog.Header class="pe-10">
                  <Dialog.Title>{post().title}</Dialog.Title>
                  <Dialog.Description>
                    {post().author} · {replyCount(post())}{' '}
                    {pluralize(replyCount(post()), 'reply', 'replies')} ·
                    started {formatRelativeTime(post().createdAt)}
                  </Dialog.Description>
                </Dialog.Header>

                <section
                  aria-label="Thread conversation"
                  tabindex="0"
                  class="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pe-1 focus-visible:focus-ring"
                >
                  <div class="rounded-card border border-outline-gray-1 bg-surface-gray-1 p-3">
                    <div class="flex items-center justify-between gap-2 text-caption text-ink-gray-7">
                      <span class="font-medium text-ink-gray-8">
                        {post().author}
                      </span>
                      <time dateTime={new Date(post().createdAt).toISOString()}>
                        {formatRelativeTime(post().createdAt)}
                      </time>
                    </div>
                    <p class="mt-2 whitespace-pre-wrap">{post().body}</p>
                  </div>

                  <h3 class="mt-5 text-base-medium text-ink-gray-8">Replies</h3>
                  <Show
                    when={replyCount(post()) > 0}
                    fallback={
                      <p class="mt-2 rounded-card border border-dashed border-outline-gray-2 p-3 text-ink-gray-7">
                        No replies yet. Start the conversation.
                      </p>
                    }
                  >
                    <ol class="mt-2 flex flex-col gap-2">
                      <For each={post().replies}>
                        {(item) => (
                          <li class="rounded-card border border-outline-gray-1 p-3">
                            <div class="flex items-center justify-between gap-2 text-caption text-ink-gray-7">
                              <span class="font-medium text-ink-gray-8">
                                {item.author}
                              </span>
                              <time
                                dateTime={new Date(
                                  item.createdAt,
                                ).toISOString()}
                              >
                                {formatRelativeTime(item.createdAt)}
                              </time>
                            </div>
                            <p class="mt-1 whitespace-pre-wrap">{item.body}</p>
                          </li>
                        )}
                      </For>
                    </ol>
                  </Show>
                </section>

                <form
                  class="mt-4 shrink-0 border-t border-outline-gray-1 pt-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!store().sendReply()) return
                    closeThread()
                    props.onPosted?.()
                  }}
                >
                  <Textarea
                    label="Discussion reply"
                    required
                    rows={3}
                    value={store().reply()}
                    onInput={(event) =>
                      store().setReply(event.currentTarget.value)
                    }
                  />
                  <Dialog.Footer>
                    <Button
                      variant="outline"
                      class="h-10 sm:h-7"
                      onClick={closeThread}
                    >
                      Close
                    </Button>
                    <Button
                      type="submit"
                      variant="solid"
                      theme="blue"
                      class="h-10 sm:h-7"
                      disabled={!store().reply().trim()}
                    >
                      Post reply
                    </Button>
                  </Dialog.Footer>
                </form>
              </>
            )}
          </Show>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
