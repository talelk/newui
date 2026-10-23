import { useNavigate } from '@solidjs/router'
import {
  createResource,
  createSignal,
  ErrorBoundary,
  For,
  type JSX,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from 'solid-js'
import { BASE_PATH, sitePath, stripBase } from './base'
import { LoadingNote } from './LoadingNote'
import { type StoryGlobals, storyUrl } from './storybook'

export const VIEWPORTS = {
  mobile: { label: 'Mobile', width: 390, height: 844 },
  tablet: { label: 'Tablet', width: 768, height: 900 },
  desktop: { label: 'Desktop', width: 1440, height: 900 },
} as const
export type Viewport = keyof typeof VIEWPORTS

export interface PreviewSources {
  files: { path: string; load: () => Promise<string> }[]
  packages: string[]
}

/** Shared source panel; mounted on first use and retained while browsing Preview. */
function SourcePanel(props: {
  sourceKey: string
  source: () => Promise<string | PreviewSources>
}): JSX.Element {
  const [copyStatus, setCopyStatus] = createSignal('')
  const [selectedFile, setSelectedFile] = createSignal('')
  const [source] = createResource(
    () => props.sourceKey,
    () => props.source(),
  )
  const bundle = () => {
    // This accessor also drives fileSource outside the rendered error boundary.
    // Let the panel's source read report failures without throwing from here.
    if (source.error) return undefined
    const value = source()
    return typeof value === 'object' ? value : undefined
  }
  const currentFile = () =>
    bundle()?.files.find((file) => file.path === selectedFile()) ??
    bundle()?.files[0]
  const [fileSource] = createResource(currentFile, (file) => file.load())
  const currentSource = () =>
    typeof source() === 'string' ? (source() as string) : (fileSource() ?? '')
  async function copy(all: boolean) {
    try {
      const files = bundle()?.files
      const contents =
        all && files
          ? (
              await Promise.all(
                files.map(
                  async (file) => `// ${file.path}\n${await file.load()}`,
                ),
              )
            ).join('\n\n')
          : currentSource()
      await navigator.clipboard.writeText(contents)
      setCopyStatus(all ? 'All files copied' : 'Source copied')
    } catch {
      setCopyStatus('Copy failed. Select and copy the source below.')
    }
  }
  return (
    <div data-slot="preview-controls">
      <ErrorBoundary
        fallback={
          <p role="alert" class="p-4">
            Source could not be loaded. Reload this page to try again.
          </p>
        }
      >
        <Suspense
          fallback={
            <div class="p-4">
              <LoadingNote label="Loading source…" />
            </div>
          }
        >
          <div class="flex flex-wrap items-end gap-2 p-2">
            <Show when={bundle()}>
              {(files) => (
                <>
                  <label class="flex min-w-0 max-w-full flex-1 basis-full flex-col gap-1 text-caption sm:basis-auto">
                    Source file
                    <select
                      value={currentFile()?.path}
                      onChange={(event) => {
                        setSelectedFile(event.currentTarget.value)
                        setCopyStatus('')
                      }}
                      class="h-7 min-w-0 max-w-full rounded-3 border border-outline-gray-2 bg-surface-elevation-1 px-2 focus-visible:focus-ring"
                    >
                      <For each={files().files}>
                        {(file) => (
                          <option value={file.path}>{file.path}</option>
                        )}
                      </For>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => copy(true)}
                    class="h-7 rounded-3 border border-outline-gray-2 px-2 text-caption focus-visible:focus-ring"
                  >
                    Copy all files
                  </button>
                </>
              )}
            </Show>
            <button
              type="button"
              onClick={() => copy(false)}
              class="h-7 rounded-3 border border-outline-gray-2 px-2 text-caption focus-visible:focus-ring"
            >
              Copy source
            </button>
            <span
              role="status"
              aria-label="Source clipboard"
              class="text-caption"
            >
              {copyStatus()}
            </span>
          </div>
          <Show when={bundle()}>
            {(files) => (
              <details class="px-3 pb-2 text-caption text-ink-gray-7">
                <summary class="cursor-pointer rounded-3 focus-visible:focus-ring">
                  Package setup
                </summary>
                <p class="py-2">
                  {files().files.length} local files. Package imports:{' '}
                  {files().packages.join(', ')}. Keep the paths shown here and
                  use the site's Tailwind setup.
                </p>
              </details>
            )}
          </Show>
          <pre class="max-h-[900px] overflow-auto border-t border-outline-gray-1 p-3 text-caption">
            <code>{currentSource()}</code>
          </pre>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

function Preview(props: {
  title: string
  /** A same-origin document; theme and direction are mirrored into it. */
  src?: string
  /**
   * A Storybook story id. The frame is cross-origin, so theme and direction
   * ride the URL globals instead and the frame reloads when they change.
   */
  story?: string
  source: () => Promise<string | PreviewSources>
  children?: JSX.Element
}): JSX.Element {
  const initial = new URLSearchParams(location.search).get('viewport')
  /** A phone preview should open at phone size, not as a 24%-scale desktop. */
  const defaultViewport = (): Viewport =>
    window.innerWidth < 640
      ? 'mobile'
      : window.innerWidth < 1024
        ? 'tablet'
        : 'desktop'
  const [viewport, setViewport] = createSignal<Viewport>(
    initial && initial in VIEWPORTS ? (initial as Viewport) : defaultViewport(),
  )
  const [tab, setTab] = createSignal<'preview' | 'source'>('preview')
  const [sourceOpened, setSourceOpened] = createSignal(false)
  const dimensions = () => VIEWPORTS[viewport()]
  /**
   * The host's scheme and direction, as primitives so a re-read that changed
   * nothing cannot reload the frame. `sync` keeps them current.
   */
  const [theme, setTheme] = createSignal<StoryGlobals['theme']>(
    document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light',
  )
  const [dir, setDir] = createSignal<StoryGlobals['dir']>(
    document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr',
  )
  const frameSrc = () => {
    if (props.story)
      return storyUrl(props.story, { theme: theme(), dir: dir() })
    if (!props.src) return undefined
    const url = new URL(props.src, location.origin)
    if (url.origin !== location.origin) return props.src
    const pathname = url.pathname.startsWith(`${BASE_PATH}/`)
      ? url.pathname
      : sitePath(url.pathname)
    // The isolated story document reads the theme/direction from its query.
    // Application previews already mirror the host document through `sync`,
    // and their fullscreen links must stay exactly as the app wrote them.
    if (!pathname.startsWith(`${BASE_PATH}/preview/`))
      return `${pathname}${url.search}${url.hash}`
    url.searchParams.set('theme', theme() ?? 'light')
    url.searchParams.set('dir', dir() ?? 'ltr')
    return `${pathname}${url.search}${url.hash}`
  }
  let frame: HTMLIFrameElement | undefined
  let stage: HTMLDivElement | undefined
  const [stageWidth, setStageWidth] = createSignal(0)
  /**
   * Presets wider than the stage (a 1440 desktop inside the docs column)
   * scale down to fit instead of cropping: the iframe keeps its true
   * viewport, only its rendering shrinks. At 1:1 no transform is applied.
   */
  const scale = () => {
    const width = stageWidth()
    return width > 0 ? Math.min(1, width / dimensions().width) : 1
  }
  onMount(() => {
    if (!stage || typeof ResizeObserver === 'undefined') return
    const resize = new ResizeObserver(() =>
      setStageWidth(stage?.clientWidth ?? 0),
    )
    resize.observe(stage)
    setStageWidth(stage.clientWidth)
    onCleanup(() => resize.disconnect())
  })
  let observer: MutationObserver | undefined
  let releaseDocument: (() => void) | undefined
  const sync = () => {
    setTheme(
      document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light',
    )
    setDir(document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr')
    const root = frame?.contentDocument?.documentElement
    if (!root) return
    root.dataset['theme'] = document.documentElement.dataset['theme'] ?? 'light'
    root.dir = document.documentElement.dir || 'ltr'
    root.style.colorScheme = root.dataset['theme'] ?? 'light'
  }
  const navigate = useNavigate()
  const loaded = () => {
    releaseDocument?.()
    sync()
    const doc = frame?.contentDocument
    // Zag observes parent-window interactions for embedded overlays. Preview
    // controls belong to the host, and must not dismiss an open preview record.
    const retainOverlay = (event: Event) => {
      const target = (event as CustomEvent<{ target?: Element }>).detail?.target
      if (
        target?.ownerDocument !== doc &&
        target?.closest('[data-slot="preview-controls"]')
      )
        event.preventDefault()
    }
    // Keyboard focus inside a native-size frame must also be visible through
    // the host's scrollport, especially while an iframe-owned modal is open.
    let keyboardFocus = false
    const keyboard = (event: KeyboardEvent) => {
      keyboardFocus = event.key === 'Tab'
    }
    const pointer = () => {
      keyboardFocus = false
    }
    const revealFocus = (event: FocusEvent) => {
      if (!keyboardFocus) return
      const target = event.target as HTMLElement | null
      // The scrollport is the stage, two levels up since the scaling
      // wrapper sits between it and the frame.
      const port = stage
      if (!target || !frame || !port) return
      const bounds = target.getBoundingClientRect()
      const frameBounds = frame.getBoundingClientRect()
      const portBounds = port.getBoundingClientRect()
      const bottom = Math.min(portBounds.bottom, window.innerHeight - 16)
      const top = Math.max(portBounds.top, 48)
      if (bounds.bottom + frameBounds.top > bottom)
        port.scrollTop += bounds.bottom + frameBounds.top - bottom + 48
      else if (bounds.top + frameBounds.top < top)
        port.scrollTop -= top - bounds.top - frameBounds.top + 16
    }
    // A link that leaves the application — the breadcrumb back to the docs, a
    // "read more" — must move the *host*, not paint the documentation site
    // inside its own preview frame. An application route (a fullscreen screen)
    // keeps the session: the preview is there to show the app, not to leave it.
    const leaveFrame = (event: MouseEvent) => {
      // The target lives in the frame's realm, so `instanceof` against the
      // host's `HTMLAnchorElement` is false; duck-type instead.
      const anchor = (event.target as Element | null)?.closest?.('a[href]')
      if (!anchor) return
      const element = anchor as HTMLAnchorElement
      if (element.target === '_blank' || element.hasAttribute('download'))
        return
      const href = anchor.getAttribute('href') ?? ''
      if (!href.startsWith('/')) return
      // The app writes base-aware URLs; router calls take the app-relative
      // path, so strip the deploy prefix before deciding where the click goes.
      const pathname = stripBase(new URL(href, location.origin).pathname)
      if (/^\/pages\/[^/]+\/fullscreen$/.test(pathname)) return
      event.preventDefault()
      navigate(pathname)
    }
    doc?.addEventListener('keydown', keyboard)
    doc?.addEventListener('pointerdown', pointer)
    doc?.addEventListener('focusin', revealFocus)
    doc?.addEventListener('click', leaveFrame)
    for (const type of ['pointerdown.outside', 'focus.outside'])
      doc?.addEventListener(type, retainOverlay, true)
    releaseDocument = () => {
      doc?.removeEventListener('keydown', keyboard)
      doc?.removeEventListener('pointerdown', pointer)
      doc?.removeEventListener('focusin', revealFocus)
      doc?.removeEventListener('click', leaveFrame)
      for (const type of ['pointerdown.outside', 'focus.outside'])
        doc?.removeEventListener(type, retainOverlay, true)
    }
    observer?.disconnect()
    observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'dir'],
    })
  }
  onCleanup(() => {
    observer?.disconnect()
    releaseDocument?.()
  })
  function select(value: Viewport) {
    setViewport(value)
    const url = new URL(location.href)
    url.searchParams.set('viewport', value)
    history.replaceState(history.state, '', url)
  }
  return (
    <section
      aria-label={`${props.title} responsive preview`}
      class="min-w-0 rounded-card border border-outline-gray-1 bg-surface-gray-1"
    >
      <div
        data-slot="preview-controls"
        class="flex flex-wrap items-center gap-2 border-b border-outline-gray-1 p-2"
      >
        <fieldset aria-label="Example view" class="flex gap-1">
          <For each={['preview', 'source'] as const}>
            {(value) => (
              <button
                type="button"
                aria-pressed={tab() === value}
                onClick={() => {
                  setTab(value)
                  if (value === 'source') setSourceOpened(true)
                }}
                class="h-7 rounded-3 px-2 text-interface capitalize aria-pressed:bg-surface-elevation-1 aria-pressed:shadow-sm focus-visible:focus-ring"
              >
                {value === 'preview' ? 'Preview' : 'Source'}
              </button>
            )}
          </For>
        </fieldset>
        <Show when={props.src ?? props.story}>
          <fieldset aria-label="Preview viewport" class="ms-auto flex gap-1">
            <For
              each={
                Object.entries(VIEWPORTS) as [
                  Viewport,
                  (typeof VIEWPORTS)[Viewport],
                ][]
              }
            >
              {([key, value]) => (
                <button
                  type="button"
                  aria-label={value.label}
                  title={value.label}
                  aria-pressed={viewport() === key}
                  onClick={() => select(key)}
                  class="grid size-10 sm:size-7 place-items-center rounded-3 text-ink-gray-6 aria-pressed:bg-surface-elevation-1 aria-pressed:text-ink-gray-9 focus-visible:focus-ring"
                >
                  <span
                    aria-hidden="true"
                    class={`${key === 'mobile' ? 'lucide-smartphone' : key === 'tablet' ? 'lucide-tablet' : 'lucide-monitor'} size-4`}
                  />
                </button>
              )}
            </For>
          </fieldset>
          <output aria-live="polite" class="text-caption text-ink-gray-7">
            {dimensions().width} × {dimensions().height}
          </output>
          <a
            href={frameSrc()}
            target="_blank"
            rel="noreferrer"
            aria-label="Open fullscreen"
            title="Open fullscreen"
            class="grid size-10 sm:size-7 place-items-center rounded-3 text-ink-gray-6 focus-visible:focus-ring"
          >
            <span aria-hidden="true" class="lucide-maximize size-4" />
            <span class="sr-only">Open fullscreen</span>
          </a>
        </Show>
      </div>
      <div
        ref={stage}
        hidden={tab() !== 'preview'}
        class="max-w-full overflow-auto"
        classList={{ 'max-h-[70dvh]': !!(props.src ?? props.story) }}
      >
        <Show
          when={props.src ?? props.story}
          fallback={<div class="p-3">{props.children}</div>}
        >
          <div
            style={{
              width: `${dimensions().width * scale()}px`,
              height: `${dimensions().height * scale()}px`,
            }}
          >
            <iframe
              ref={frame}
              title={`${props.title} preview`}
              src={frameSrc()}
              width={dimensions().width}
              height={dimensions().height}
              loading="lazy"
              onLoad={loaded}
              style={{
                transform: scale() < 1 ? `scale(${scale()})` : undefined,
                'transform-origin': '0 0',
              }}
              class="block max-w-none border-0 bg-surface-base"
            />
          </div>
        </Show>
      </div>
      <div hidden={tab() !== 'source'}>
        <Show
          when={sourceOpened() && (props.src ?? props.story ?? props.title)}
          keyed
        >
          {(key) => <SourcePanel sourceKey={key} source={props.source} />}
        </Show>
      </div>
    </section>
  )
}

/**
 * A framed preview. `src` renders a same-origin document and mirrors the
 * host's theme into it; `story` renders a Storybook story cross-origin, so
 * its theme rides URL globals instead. Changing dimensions preserves the
 * document, its machines and domain state.
 */
export function ResponsivePreview(props: {
  title: string
  src?: string
  story?: string
  source: () => Promise<string | PreviewSources>
}): JSX.Element {
  return <Preview {...props} />
}

/** Inline demos share source controls while keeping the mounted demo alive. */
export function InlinePreview(props: {
  title: string
  source: () => Promise<string>
  children: JSX.Element
}): JSX.Element {
  return <Preview {...props} />
}
