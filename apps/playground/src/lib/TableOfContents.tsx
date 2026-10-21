import { createEffect, createSignal, For, type JSX, onCleanup } from 'solid-js'

/**
 * The "On this page" column's contents (H15, spec/history/examples-refresh.md §1).
 *
 * Real `<a href="#id">` links — they work with the keyboard, with
 * find-in-page, and before any script runs — plus a scrollspy that marks
 * the section currently being read. The spy is a scroll listener rather
 * than an IntersectionObserver so sections that arrive late (the async
 * contract chunk on reference pages) join it without re-observing: every
 * scroll re-reads the live document. No component imports, so the lazy
 * layout chunks that pass this through the shell's `toc` slot stay lean.
 */
export interface TocEntry {
  id: string
  label: string
}

/** How far below the viewport top a section counts as "being read". */
const READ_OFFSET = 96

export function TableOfContents(props: { entries: TocEntry[] }): JSX.Element {
  const [active, setActive] = createSignal<string | undefined>(undefined)

  createEffect(() => {
    const ids = props.entries.map((entry) => entry.id)
    if (ids.length === 0) return
    let frame = 0
    const update = () => {
      frame = 0
      let current: string | undefined
      for (const id of ids) {
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top <= READ_OFFSET) current = id
        else break
      }
      setActive(current ?? ids[0])
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    // Capture phase: the shell scrolls an inner container, whose scroll
    // events never reach a bubble-phase window listener.
    window.addEventListener('scroll', schedule, {
      capture: true,
      passive: true,
    })
    window.addEventListener('resize', schedule)
    onCleanup(() => {
      window.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    })
  })

  return (
    <nav aria-label="On this page" class="flex flex-col gap-2">
      <p class="text-sm-medium text-ink-gray-7">On this page</p>
      <ul class="flex flex-col gap-0.5">
        <For each={props.entries}>
          {(entry) => (
            <li>
              <a
                href={`#${entry.id}`}
                aria-current={active() === entry.id ? 'true' : undefined}
                class="flex h-8 items-center rounded-3 px-2 text-interface text-ink-gray-7 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring motion-reduce:transition-none aria-[current=true]:bg-surface-gray-2 aria-[current=true]:font-medium aria-[current=true]:text-ink-gray-9"
              >
                <span class="min-w-0 flex-1 truncate">{entry.label}</span>
              </a>
            </li>
          )}
        </For>
      </ul>
    </nav>
  )
}
