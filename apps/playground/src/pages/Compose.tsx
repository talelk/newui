import { Badge, Button, Textarea, TextInput } from '@newui/atoms'
import { downloadText } from '@newui/data'
import { Editor, EditorToolbar } from '@newui/editor'
import {
  Alert,
  DatePicker,
  Dialog,
  MultiSelect,
  Select,
  TabButtons,
} from '@newui/molecules'
import { createMemo, createSignal, type JSX, Show } from 'solid-js'
import { AppPage } from '../examples/AppPage'
import { Notice } from '../examples/Notice'
import { Panel } from '../examples/Panel'
import { Markdown } from '../lib/markdown'

const INITIAL_BODY =
  '## A clearer way to work\n\nToday we are introducing a refreshed workspace for your projects, customers and reports.\n\n- Compact controls that stay out of the way\n- Clear hierarchy for the numbers that matter\n- Thoughtful interactions in every colour scheme\n\nWe cannot wait to see what you build.'

export function Compose(): JSX.Element {
  const [title, setTitle] = createSignal('Introducing the new Acme workspace')
  const [body, setBody] = createSignal(INITIAL_BODY)
  const [excerpt, setExcerpt] = createSignal(
    'A clearer view of your work, built around the way your team thinks.',
  )
  const [view, setView] = createSignal('edit')
  const [audience, setAudience] = createSignal('workspace')
  const [tags, setTags] = createSignal<string[]>(['product'])
  const [date, setDate] = createSignal('2026-09-30')
  const [saved, setSaved] = createSignal<{
    title: string
    body: string
    excerpt: string
    audience: string
    tags: string[]
    date: string
  }>()
  const [notice, setNotice] = createSignal('')
  const [error, setError] = createSignal('')
  const [publicationError, setPublicationError] = createSignal('')
  const [confirm, setConfirm] = createSignal(false)
  const [published, setPublished] = createSignal(false)
  const words = createMemo(
    () =>
      body()
        .replace(/[#*_`>]/g, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length,
  )
  const dirty = () =>
    saved()?.title !== title() ||
    saved()?.body !== body() ||
    saved()?.excerpt !== excerpt() ||
    saved()?.audience !== audience() ||
    saved()?.date !== date() ||
    saved()?.tags.join(',') !== tags().join(',')
  const save = () => {
    if (title().trim().length < 3) {
      setError('Give your post a title with at least 3 characters.')
      return
    }
    setError('')
    setSaved({
      title: title(),
      body: body(),
      excerpt: excerpt(),
      audience: audience(),
      tags: [...tags()],
      date: date(),
    })
    setNotice('Draft saved locally for this page.')
  }
  const validatePublication = () => {
    if (title().trim().length < 3) {
      setError('Give your post a title with at least 3 characters.')
      return false
    }
    if (!words()) {
      setPublicationError('Write some post content before publishing.')
      return false
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date()) ||
      Number.isNaN(Date.parse(date()))
    ) {
      setPublicationError('Choose a publication date before publishing.')
      return false
    }
    setError('')
    setPublicationError('')
    return true
  }
  const exportPost = () =>
    downloadText(
      'acme-workspace-post.md',
      `# ${title()}\n\n${body()}\n`,
      'text/markdown;charset=utf-8',
    )
  return (
    <AppPage
      section="Compose"
      title="Compose a post"
      description="Shape your ideas, review the details, and share a clear update with your team."
      actions={
        <>
          <Badge theme={published() ? 'green' : 'gray'}>
            {published()
              ? 'Published demo'
              : dirty()
                ? 'Unsaved draft'
                : 'Saved draft'}
          </Badge>
          <Button
            variant="outline"
            iconLeft="lucide-download"
            onClick={exportPost}
          >
            Export Markdown
          </Button>
          <Button variant="outline" onClick={save}>
            Save draft
          </Button>
          <Button
            variant="solid"
            theme="blue"
            onClick={() => {
              if (validatePublication()) setConfirm(true)
            }}
          >
            {published() ? 'Update demo post' : 'Publish demo'}
          </Button>
        </>
      }
    >
      <Notice text={publicationError()} tone="red" />
      <Notice text={notice()} tone="green" />
      <div class="grid items-start gap-4 xl:grid-cols-3">
        <Panel
          label="Post content"
          title="Your story"
          class="xl:col-span-2"
          actions={
            <TabButtons
              value={view()}
              onValueChange={setView}
              options={[
                { label: 'Write', value: 'edit' },
                { label: 'Preview', value: 'preview' },
              ]}
            />
          }
        >
          <TextInput
            label="Post title"
            value={title()}
            required
            error={error() || undefined}
            onInput={(event) => {
              setTitle(event.currentTarget.value)
              setError('')
            }}
          />
          <div>
            <Show
              when={view() === 'edit'}
              fallback={
                <article
                  aria-label="Post preview"
                  class="min-h-80 rounded-3 border border-outline-gray-1 p-3"
                >
                  <Markdown markdown={body()} />
                </article>
              }
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
                  setBody(typeof value === 'string' ? value : '')
                }
                aria-label="Post body"
                class="compose-editor"
              >
                <EditorToolbar class="sticky top-14 z-20 sm:static" />
              </Editor>
            </Show>
          </div>
          <div class="flex flex-wrap justify-between gap-2 text-caption text-ink-gray-7">
            <span role="status">
              {words()} words · {Math.max(1, Math.ceil(words() / 200))} min read
            </span>
            <Show when={saved() && dirty()}>
              <button
                type="button"
                class="rounded-3 text-ink-blue-link focus-visible:focus-ring"
                onClick={() => {
                  const snapshot = saved()
                  if (snapshot) {
                    setTitle(snapshot.title)
                    setBody(snapshot.body)
                    setExcerpt(snapshot.excerpt)
                    setAudience(snapshot.audience)
                    setTags([...snapshot.tags])
                    setDate(snapshot.date)
                    setNotice('Restored the last saved draft.')
                  }
                }}
              >
                Restore saved draft
              </button>
            </Show>
          </div>
        </Panel>
        <aside class="flex min-w-0 flex-col gap-4">
          <Panel
            title="Publication"
            titleId="publication-heading"
            labelledBy="publication-heading"
          >
            <Select
              label="Audience"
              value={audience()}
              options={[
                { label: 'Workspace members', value: 'workspace' },
                { label: 'Public demo', value: 'public' },
                { label: 'Only me', value: 'private' },
              ]}
              onValueChange={(value) => setAudience(value ?? 'workspace')}
            />
            <DatePicker
              label="Publication date"
              value={date()}
              onValueChange={setDate}
            />
            <MultiSelect
              label="Post labels"
              value={tags()}
              onValueChange={setTags}
              options={[
                { label: 'Product', value: 'product' },
                { label: 'Engineering', value: 'engineering' },
                { label: 'Company news', value: 'news' },
              ]}
            />
            <Textarea
              label="Short description"
              description="A short introduction shown in the feed."
              rows={4}
              value={excerpt()}
              onInput={(event) => setExcerpt(event.currentTarget.value)}
            />
          </Panel>
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
          <dl class="my-5 grid grid-cols-2 gap-3 text-interface">
            <dt class="text-ink-gray-7">Title</dt>
            <dd class="text-end font-medium">{title()}</dd>
            <dt class="text-ink-gray-7">Audience</dt>
            <dd class="text-end">
              {audience() === 'workspace'
                ? 'Workspace members'
                : audience() === 'private'
                  ? 'Only me'
                  : 'Public demo'}
            </dd>
            <dt class="text-ink-gray-7">Date</dt>
            <dd class="text-end">{date()}</dd>
          </dl>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Keep editing
            </Button>
            <Button
              variant="solid"
              theme="blue"
              onClick={() => {
                if (!validatePublication()) return
                save()
                setPublished(true)
                setConfirm(false)
                setNotice(
                  'Your demo post is published locally. No content left this page.',
                )
              }}
            >
              Confirm publication
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </AppPage>
  )
}
