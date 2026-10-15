import { Button, Dialog, Textarea, TextInput } from '@newui/ui'
import { createMemo, createSignal, For, Show } from 'solid-js'

export interface Discussion {
  title: string
  author: string
  excerpt: string
  comments: number
  lastActivity: string
  unread: number
  space?: string
  replies?: string[]
}

/** Page-local demo repository: a space owns its feed, unread state and replies. */
export function createDiscussions(
  initial: Discussion[],
  activeSpace: () => string,
) {
  const [posts, setPosts] = createSignal(
    initial.map((post) => ({
      ...post,
      space: 'Design System',
      replies: [] as string[],
    })),
  )
  const [query, setQuery] = createSignal('')
  const [creating, setCreating] = createSignal(false)
  const [selected, setSelected] = createSignal<string>()
  const [title, setTitle] = createSignal('')
  const [body, setBody] = createSignal('')
  const [reply, setReply] = createSignal('')
  const [attempted, setAttempted] = createSignal(false)
  const current = createMemo(() =>
    posts().find((post) => post.title === selected()),
  )
  const rows = createMemo(() =>
    posts().filter(
      (post) =>
        post.space === activeSpace() &&
        `${post.title} ${post.author} ${post.excerpt}`
          .toLowerCase()
          .includes(query().trim().toLowerCase()),
    ),
  )
  const start = () => {
    setTitle('')
    setBody('')
    setAttempted(false)
    setCreating(true)
  }
  const open = (post: Discussion) => {
    setSelected(post.title)
    setReply('')
    setPosts((previous) =>
      previous.map((item) =>
        item.title === post.title ? { ...item, unread: 0 } : item,
      ),
    )
  }
  const markRead = () =>
    setPosts((previous) =>
      previous.map((post) =>
        post.space === activeSpace() ? { ...post, unread: 0 } : post,
      ),
    )
  const create = () => {
    setAttempted(true)
    if (title().trim().length < 3 || !body().trim()) return
    if (posts().some((post) => post.title === title().trim())) return
    setPosts((previous) => [
      {
        title: title().trim(),
        excerpt: body().trim(),
        author: 'Rhea Kapoor',
        comments: 0,
        lastActivity: 'Now',
        unread: 0,
        space: activeSpace(),
        replies: [],
      },
      ...previous,
    ])
    setQuery('')
    setCreating(false)
  }
  const sendReply = () => {
    if (!reply().trim()) return
    setPosts((previous) =>
      previous.map((post) =>
        post.title === selected()
          ? {
              ...post,
              comments: post.comments + 1,
              replies: [...post.replies, reply().trim()],
              lastActivity: 'Now',
            }
          : post,
      ),
    )
    setReply('')
  }
  return {
    posts,
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
    attempted,
    current,
    start,
    open,
    markRead,
    create,
    sendReply,
  }
}

export function DiscussionDialogs(props: {
  store: ReturnType<typeof createDiscussions>
}) {
  const store = () => props.store
  return (
    <>
      <Dialog.Root open={store().creating()} onOpenChange={store().setCreating}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>New discussion</Dialog.Title>
            <Dialog.Description>
              Start a conversation in the selected space. Changes stay on this
              page.
            </Dialog.Description>
          </Dialog.Header>
          <form
            class="mt-4 flex flex-col gap-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              store().create()
            }}
          >
            <TextInput
              label="Discussion title"
              required
              value={store().title()}
              onInput={(event) => store().setTitle(event.currentTarget.value)}
              error={
                store().attempted() && store().title().trim().length < 3
                  ? 'Enter a title with at least 3 characters.'
                  : store().attempted() &&
                      store()
                        .posts()
                        .some((post) => post.title === store().title().trim())
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
                store().attempted() && !store().body().trim()
                  ? 'Write a message to start the conversation.'
                  : undefined
              }
            />
            <Dialog.Footer>
              <Button
                type="button"
                variant="outline"
                onClick={() => store().setCreating(false)}
              >
                Cancel discussion
              </Button>
              <Button type="submit" variant="solid" theme="blue">
                Post discussion
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root
        open={Boolean(store().current())}
        onOpenChange={(open) => {
          if (!open) store().setSelected(undefined)
        }}
      >
        <Dialog.Content>
          <Show when={store().current()}>
            {(post) => (
              <>
                <Dialog.Header>
                  <Dialog.Title>{post().title}</Dialog.Title>
                  <Dialog.Description>
                    {post().author} · {post().comments} replies
                  </Dialog.Description>
                </Dialog.Header>
                <p class="my-5 whitespace-pre-wrap">{post().excerpt}</p>
                <For each={post().replies}>
                  {(text) => (
                    <p class="my-3 rounded-3 border border-outline-gray-1 bg-surface-gray-1 p-3 whitespace-pre-wrap">
                      {text}
                    </p>
                  )}
                </For>
                <form
                  class="flex flex-col gap-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    store().sendReply()
                  }}
                >
                  <Textarea
                    label="Discussion reply"
                    required
                    value={store().reply()}
                    onInput={(event) =>
                      store().setReply(event.currentTarget.value)
                    }
                  />
                  <Button
                    type="submit"
                    variant="solid"
                    theme="blue"
                    disabled={!store().reply().trim()}
                  >
                    Post reply
                  </Button>
                </form>
              </>
            )}
          </Show>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
