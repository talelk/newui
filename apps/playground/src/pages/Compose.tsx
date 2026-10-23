import { Badge, Button, Textarea, TextInput } from '@talelk/newui-atoms'
import { downloadText } from '@talelk/newui-data'
import { Editor, EditorToolbar } from '@talelk/newui-editor'
import {
  Alert,
  DatePicker,
  Dialog,
  MultiSelect,
  Select,
  TabButtons,
} from '@talelk/newui-molecules'
import { Section } from '@talelk/newui-organisms'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  Show,
} from 'solid-js'
import { AppPage } from '../examples/AppPage'
import { Notice } from '../examples/Notice'

const INITIAL_TITLE = 'Introducing the new Acme workspace'
const INITIAL_EXCERPT =
  'A clearer view of your work, built around the way your team thinks.'
const INITIAL_BODY =
  '## A clearer way to work\n\nToday we are introducing a refreshed workspace for your projects, customers and reports.\n\n- Compact controls that stay out of the way\n- Clear hierarchy for the numbers that matter\n- Thoughtful interactions in every colour scheme\n\nWe cannot wait to see what you build.'

const AUDIENCE_OPTIONS = [
  { label: 'Workspace members', value: 'workspace' },
  { label: 'Public demo', value: 'public' },
  { label: 'Only me', value: 'private' },
]

const TAG_OPTIONS = [
  { label: 'Product', value: 'product' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Company news', value: 'news' },
]

interface DraftSnapshot {
  title: string
  body: string
  excerpt: string
  audience: string
  tags: string[]
  date: string
}

type DraftStatus = {
  label: string
  theme: 'gray' | 'amber' | 'green'
}

/** A local calendar date, not the UTC day. */
function localIsoDate(value: Date): string {
  const offset = value.getTimezoneOffset()
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  )
}

function formatDate(value: string): string {
  if (!value) return 'No date set'
  const parsed = new Date(`${value}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
    parsed,
  )
}

function sameTags(left: string[], right: string[]): boolean {
  return (
    left.length === right.length && left.every((tag) => right.includes(tag))
  )
}

function sameDraft(left: DraftSnapshot, right: DraftSnapshot): boolean {
  return (
    left.title === right.title &&
    left.body === right.body &&
    left.excerpt === right.excerpt &&
    left.audience === right.audience &&
    left.date === right.date &&
    sameTags(left.tags, right.tags)
  )
}

function optionLabel(
  options: { label: string; value: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value
}

const INITIAL_DRAFT: DraftSnapshot = {
  title: INITIAL_TITLE,
  body: INITIAL_BODY,
  excerpt: INITIAL_EXCERPT,
  audience: 'workspace',
  tags: ['product'],
  date: localIsoDate(new Date()),
}

export function Compose(): JSX.Element {
  const [title, setTitle] = createSignal(INITIAL_DRAFT.title)
  const [body, setBody] = createSignal(INITIAL_DRAFT.body)
  const [excerpt, setExcerpt] = createSignal(INITIAL_DRAFT.excerpt)
  const [view, setView] = createSignal('edit')
  const [audience, setAudience] = createSignal(INITIAL_DRAFT.audience)
  const [tags, setTags] = createSignal<string[]>([...INITIAL_DRAFT.tags])
  const [date, setDate] = createSignal(INITIAL_DRAFT.date)
  const [saved, setSaved] = createSignal<DraftSnapshot>()
  const [publishedSnapshot, setPublishedSnapshot] =
    createSignal<DraftSnapshot>()
  const [notice, setNotice] = createSignal('')
  const [error, setError] = createSignal('')
  const [bodyError, setBodyError] = createSignal('')
  const [dateError, setDateError] = createSignal('')
  const [confirm, setConfirm] = createSignal(false)

  let titleField: HTMLDivElement | undefined
  let bodyField: HTMLDivElement | undefined
  let dateField: HTMLDivElement | undefined

  const currentDraft = (): DraftSnapshot => ({
    title: title(),
    body: body(),
    excerpt: excerpt(),
    audience: audience(),
    tags: [...tags()],
    date: date(),
  })

  const words = createMemo(
    () =>
      body()
        .replace(/[#*_`>]/g, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length,
  )
  const minutes = createMemo(() => (words() ? Math.ceil(words() / 200) : 0))

  /** Changes since the last save (or the loaded draft before the first save). */
  const dirty = () => !sameDraft(currentDraft(), saved() ?? INITIAL_DRAFT)

  /** Changes since the post was last published. */
  const dirtySincePublish = () => {
    const snapshot = publishedSnapshot()
    return snapshot ? !sameDraft(currentDraft(), snapshot) : false
  }

  const published = () => publishedSnapshot() !== undefined

  const status = createMemo<DraftStatus>(() => {
    if (published()) {
      return dirtySincePublish()
        ? { label: 'Unpublished changes', theme: 'amber' }
        : { label: 'Published', theme: 'green' }
    }
    return dirty()
      ? { label: 'Unsaved changes', theme: 'amber' }
      : { label: 'Draft', theme: 'gray' }
  })

  const clearNotice = () => setNotice('')

  const syncBodyValidation = (invalid: boolean) => {
    const control = bodyField?.querySelector<HTMLElement>(
      '[data-slot="editor-content"]',
    )
    if (!control) return
    control.setAttribute('aria-required', 'true')
    if (invalid) {
      control.setAttribute('aria-invalid', 'true')
      control.setAttribute('aria-describedby', 'post-body-error')
    } else {
      control.removeAttribute('aria-invalid')
      control.removeAttribute('aria-describedby')
    }
  }

  const focusField = (field: 'title' | 'body' | 'date') => {
    if (field !== 'date') setView('edit')
    queueMicrotask(() => {
      if (field === 'body') syncBodyValidation(true)
      const root =
        field === 'title'
          ? titleField
          : field === 'body'
            ? bodyField
            : dateField
      const control =
        field === 'body'
          ? root?.querySelector<HTMLElement>('[data-slot="editor-content"]')
          : root?.querySelector<HTMLElement>('input')
      control?.focus()
    })
  }

  createEffect(() => {
    const invalid = Boolean(bodyError())
    // Keep the live editor's ARIA contract in sync without editing the shared
    // Editor package. The preview has no editable surface to mark.
    if (view() !== 'edit') return
    queueMicrotask(() => syncBodyValidation(invalid))
  })

  const updateTitle = (value: string) => {
    setTitle(value)
    setError('')
    clearNotice()
  }

  const updateBody = (value: string) => {
    setBody(value)
    setBodyError('')
    clearNotice()
  }

  const updateAudience = (value: string | null) => {
    setAudience(value ?? 'workspace')
    clearNotice()
  }

  const updateDate = (value: string | null) => {
    setDate(value ?? '')
    setDateError('')
    clearNotice()
  }

  const updateTags = (value: string[]) => {
    setTags(value)
    clearNotice()
  }

  const updateExcerpt = (value: string) => {
    setExcerpt(value)
    clearNotice()
  }

  const save = (): boolean => {
    if (title().trim().length < 3) {
      setNotice('')
      setError('Give your post a title with at least 3 characters.')
      focusField('title')
      return false
    }
    setError('')
    setBodyError('')
    setDateError('')
    setSaved(currentDraft())
    setNotice(
      published()
        ? 'Draft saved locally. The published demo is unchanged.'
        : 'Draft saved locally for this page.',
    )
    return true
  }

  const validateFields = (): boolean => {
    const titleInvalid = title().trim().length < 3
    const bodyInvalid = words() === 0
    const dateInvalid = !isIsoDate(date())

    setNotice('')
    setError(
      titleInvalid ? 'Give your post a title with at least 3 characters.' : '',
    )
    setBodyError(
      bodyInvalid ? 'Write some post content before publishing.' : '',
    )
    setDateError(
      dateInvalid ? 'Choose a publication date before publishing.' : '',
    )

    if (titleInvalid) {
      focusField('title')
      return false
    }
    if (bodyInvalid) {
      focusField('body')
      return false
    }
    if (dateInvalid) {
      focusField('date')
      return false
    }
    return true
  }

  const requestPublication = () => {
    if (validateFields()) setConfirm(true)
  }

  const confirmPublication = () => {
    const valid = validateFields()
    setConfirm(false)
    if (!valid) return
    if (!save()) return
    setPublishedSnapshot(currentDraft())
    setNotice('Your demo post is published locally. No content left this page.')
  }

  const restoreDraft = () => {
    const snapshot = saved()
    if (!snapshot) return
    setTitle(snapshot.title)
    setBody(snapshot.body)
    setExcerpt(snapshot.excerpt)
    setAudience(snapshot.audience)
    setTags([...snapshot.tags])
    setDate(snapshot.date)
    setError('')
    setBodyError('')
    setDateError('')
    setNotice('Restored the last saved draft.')
  }

  const exportPost = () =>
    downloadText(
      'acme-workspace-post.md',
      `# ${title()}\n\n${body()}\n`,
      'text/markdown;charset=utf-8',
    )

  const audienceLabel = () => optionLabel(AUDIENCE_OPTIONS, audience())
  const tagLabel = (value: string) => optionLabel(TAG_OPTIONS, value)

  return (
    <AppPage
      section="Compose"
      title="Compose a post"
      description="Shape your ideas, review the details, and share a clear update with your team."
      actions={
        <div class="flex w-full flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            icon="lucide-download"
            aria-label="Export Markdown"
            title="Export Markdown"
            class="sm:hidden"
            onClick={exportPost}
          />
          <Button
            variant="outline"
            iconLeft="lucide-download"
            class="max-sm:hidden"
            onClick={exportPost}
          >
            Export Markdown
          </Button>
          <div class="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={save}>
              Save draft
            </Button>
            <Button variant="solid" theme="blue" onClick={requestPublication}>
              {published() ? 'Update demo post' : 'Publish demo'}
            </Button>
          </div>
        </div>
      }
    >
      <Notice text={notice()} tone="green" onDismiss={() => setNotice('')} />
      <div class="grid items-start gap-4 xl:grid-cols-3">
        <Section
          id="post-content"
          title="Your story"
          description={<Badge theme={status().theme}>{status().label}</Badge>}
          surface="card"
          class="gap-4 p-card-pad-compact xl:col-span-2"
          actions={
            <TabButtons
              label="Editor view"
              value={view()}
              onValueChange={setView}
              options={[
                { label: 'Write', value: 'edit' },
                { label: 'Preview', value: 'preview' },
              ]}
            />
          }
        >
          <Show when={view() === 'edit'}>
            <div
              ref={(el) => {
                titleField = el
              }}
            >
              <TextInput
                label="Post title"
                value={title()}
                required
                error={error() || undefined}
                onInput={(event) => updateTitle(event.currentTarget.value)}
              />
            </div>
          </Show>
          <Show when={bodyError()}>
            <p
              id="post-body-error"
              role="alert"
              class="text-caption text-ink-red-7"
            >
              {bodyError()}
            </p>
          </Show>
          <div>
            <Show
              when={view() === 'edit'}
              fallback={
                <article
                  aria-label="Post preview"
                  class="flex flex-col gap-4 rounded-3 border border-outline-gray-1 p-3"
                >
                  <header class="flex flex-col gap-2">
                    <div class="flex flex-wrap items-center gap-2 text-caption text-ink-gray-7">
                      <span>{audienceLabel()}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        <Show when={date()} fallback="No date set">
                          {(value) => (
                            <time dateTime={value()}>
                              {formatDate(value())}
                            </time>
                          )}
                        </Show>
                      </span>
                    </div>
                    <h3 class="max-w-[30rem] text-heading text-ink-gray-9 [overflow-wrap:anywhere]">
                      {title().trim() || 'Untitled post'}
                    </h3>
                    <Show when={excerpt().trim()}>
                      <p class="max-w-[30rem] text-base text-ink-gray-7 [overflow-wrap:anywhere]">
                        {excerpt()}
                      </p>
                    </Show>
                    <Show when={tags().length}>
                      <ul aria-label="Post labels" class="flex flex-wrap gap-1">
                        <For each={tags()}>
                          {(tag) => (
                            <li>
                              <Badge>{tagLabel(tag)}</Badge>
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                  </header>
                  <Editor
                    readonly
                    format="markdown"
                    value={body()}
                    aria-label="Post body preview"
                    class="compose-editor compose-preview"
                  />
                </article>
              }
            >
              <div
                ref={(el) => {
                  bodyField = el
                }}
              >
                <Editor
                  mentionItems={[
                    { id: 'rhea', label: 'Rhea Kapoor' },
                    { id: 'priya', label: 'Priya Nair' },
                    { id: 'sam', label: 'Sam Rivera' },
                  ]}
                  format="markdown"
                  value={body()}
                  onValueChange={(value) =>
                    updateBody(typeof value === 'string' ? value : '')
                  }
                  placeholder="Start writing your update…"
                  aria-label="Post body"
                  class="compose-editor"
                >
                  <EditorToolbar class="sticky top-0 z-floating sm:static" />
                </Editor>
              </div>
            </Show>
          </div>
          <div class="flex flex-wrap justify-between gap-2 text-caption text-ink-gray-7">
            <span>
              {words()} {words() === 1 ? 'word' : 'words'} · {minutes()} min
              read
            </span>
            <Show when={saved() && dirty()}>
              <button
                type="button"
                class="rounded-3 text-ink-blue-link focus-visible:focus-ring"
                onClick={restoreDraft}
              >
                Restore saved draft
              </button>
            </Show>
          </div>
        </Section>
        <aside class="flex min-w-0 flex-col gap-4">
          <Section
            id="publication"
            title="Publication"
            surface="card"
            class="gap-4 p-card-pad-compact"
          >
            <Select
              label="Audience"
              value={audience()}
              options={AUDIENCE_OPTIONS}
              onValueChange={updateAudience}
            />
            <div
              ref={(el) => {
                dateField = el
              }}
            >
              <DatePicker
                label="Publication date"
                value={date()}
                required
                error={dateError() || undefined}
                onValueChange={updateDate}
              />
            </div>
            <MultiSelect
              label="Post labels"
              value={tags()}
              onValueChange={updateTags}
              options={TAG_OPTIONS}
            />
            <Textarea
              label="Short description"
              description="A short introduction shown in the feed."
              rows={4}
              value={excerpt()}
              onInput={(event) => updateExcerpt(event.currentTarget.value)}
            />
          </Section>
          <Alert
            theme="blue"
            title="A thoughtful update goes a long way."
            description="Use clear headings, short paragraphs and a preview before you share."
          />
        </aside>
      </div>
      <Dialog.Root open={confirm()} onOpenChange={setConfirm}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {published()
                ? 'Update this demo post?'
                : 'Publish this demo post?'}
            </Dialog.Title>
            <Dialog.Description>
              Review the audience and publication details before continuing.
            </Dialog.Description>
          </Dialog.Header>
          <dl class="my-5 grid grid-cols-1 gap-x-4 gap-y-3 text-interface sm:grid-cols-2">
            <dt class="text-ink-gray-7">Title</dt>
            <dd class="min-w-0 font-medium [overflow-wrap:anywhere] sm:text-end">
              {title()}
            </dd>
            <dt class="text-ink-gray-7">Audience</dt>
            <dd class="sm:text-end">{audienceLabel()}</dd>
            <dt class="text-ink-gray-7">Date</dt>
            <dd class="sm:text-end">{formatDate(date())}</dd>
          </dl>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Keep editing
            </Button>
            <Button variant="solid" theme="blue" onClick={confirmPublication}>
              Confirm publication
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </AppPage>
  )
}
