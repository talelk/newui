import { A } from '@solidjs/router'
import { createMemo, createSignal, For, onMount } from 'solid-js'
import { COMPONENTS } from '../generated/components'
import { modalKeyDown } from './modal'
import { NAV_ORDER } from './nav'

/** Loaded only on demand; the home shell never fetches reference metadata. */
export function PageFinder(props: { onClose: () => void }) {
  let dialog: HTMLDialogElement | undefined
  const previous = document.activeElement as HTMLElement | null
  const [query, setQuery] = createSignal('')
  const entries = [
    ...NAV_ORDER,
    ...COMPONENTS.filter((entry) => entry.shipped).map((entry) => ({
      title: entry.name,
      href: `/${entry.kind === 'block' ? 'blocks' : entry.group === 'Charts' ? 'charts' : entry.group === 'Editors' ? 'editors' : 'components'}/${entry.slug}`,
    })),
  ]
  const results = createMemo(() =>
    entries
      .filter((entry) =>
        `${entry.title} ${entry.href}`
          .toLowerCase()
          .includes(query().toLowerCase()),
      )
      .slice(0, 60),
  )
  onMount(() => dialog?.showModal())
  return (
    <dialog
      onKeyDown={modalKeyDown}
      ref={dialog}
      aria-label="Find a page"
      onClose={() => {
        previous?.focus()
        props.onClose()
      }}
      onClick={(event) => {
        if (event.target === dialog) dialog?.close()
      }}
      class="mx-auto mt-16 w-[calc(100%-2rem)] max-w-lg rounded-5 border border-outline-gray-1 bg-surface-elevation-2 p-3 text-ink-gray-9 shadow-lg backdrop:bg-surface-gray-7/50"
    >
      <div class="flex items-center gap-2">
        <input
          autofocus
          type="search"
          aria-label="Search pages"
          placeholder="Search pages…"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              dialog?.querySelector<HTMLAnchorElement>('a')?.focus()
            }
            if (event.key === 'Enter')
              dialog?.querySelector<HTMLAnchorElement>('a')?.click()
          }}
          class="h-10 min-w-0 flex-1 rounded-3 border border-outline-gray-2 bg-surface-base px-2 text-interface focus-visible:focus-ring"
        />
        <button
          type="button"
          aria-label="Close page finder"
          onClick={() => dialog?.close()}
          class="grid size-10 place-items-center rounded-3 focus-visible:focus-ring"
        >
          <span aria-hidden="true" class="lucide-x size-4" />
        </button>
      </div>
      <p role="status" class="py-2 text-caption text-ink-gray-6">
        {results().length} pages
      </p>
      <ul
        class="max-h-[60dvh] overflow-auto"
        onKeyDown={(event) => {
          if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
          const links = [
            ...(dialog?.querySelectorAll<HTMLAnchorElement>('a') ?? []),
          ]
          const index = links.indexOf(
            document.activeElement as HTMLAnchorElement,
          )
          event.preventDefault()
          links[
            (index + (event.key === 'ArrowDown' ? 1 : links.length - 1)) %
              links.length
          ]?.focus()
        }}
      >
        <For each={results()}>
          {(entry) => (
            <li>
              <A
                href={entry.href}
                onClick={() => dialog?.close()}
                class="flex justify-between gap-2 rounded-3 px-2 py-2 text-interface hover:bg-surface-gray-2 focus-visible:focus-ring"
              >
                <span>{entry.title}</span>
                <span class="truncate text-caption text-ink-gray-6">
                  {entry.href}
                </span>
              </A>
            </li>
          )}
        </For>
      </ul>
    </dialog>
  )
}
