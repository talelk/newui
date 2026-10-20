import { A, useLocation } from '@solidjs/router'
import {
  createSignal,
  For,
  type JSX,
  lazy,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from 'solid-js'
import { NAV, sectionFor } from './nav'
import { NAV_ROW } from './nav-ui'

const PageFinder = lazy(() =>
  import('./PageFinder').then((module) => ({ default: module.PageFinder })),
)

import { ThemeMenu } from './ThemeMenu'

/**
 * The flattened primary links, shown at `lg+` beside search.
 *
 * Hrefs resolve out of `NAV` rather than being restated, so a moved page
 * moves here too; `section` is the `NAV` section each link stands for, which
 * is what the active state compares against.
 */
function sectionHref(title: string, fallback: string): string {
  return NAV.find((entry) => entry.title === title)?.items[0]?.href ?? fallback
}

const TOP_LINKS: { title: string; href: string; section: string }[] = [
  {
    title: 'Docs',
    href:
      NAV.flatMap((entry) => entry.items).find((item) => item.href === '/docs')
        ?.href ?? '/docs',
    section: 'Overview',
  },
  {
    title: 'Atoms',
    href: sectionHref('Atoms', '/atoms'),
    section: 'Atoms',
  },
  {
    title: 'Organisms',
    href: sectionHref('Organisms', '/organisms'),
    section: 'Organisms',
  },
  {
    title: 'Templates',
    href: sectionHref('Templates', '/templates'),
    section: 'Templates',
  },
  {
    title: 'Pages',
    href: sectionHref('Pages', '/pages'),
    section: 'Pages',
  },
]

/**
 * The GitHub mark, inline.
 *
 * Lucide dropped its brand glyphs, so `lucide-github` is a class with no rule
 * behind it: the icon renders as nothing, silently. The library's `Icon` is for
 * the icon set; a one-off mark belongs in the markup that needs it. The path is
 * from Simple Icons (CC0).
 */
function GithubMark(props: { class?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      class={props.class}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

export function Masthead(props: {
  title?: string
  onMenu: () => void
  menuRef: (element: HTMLButtonElement) => void
}): JSX.Element {
  const location = useLocation()
  const [finding, setFinding] = createSignal(false)
  let findTrigger: HTMLButtonElement | undefined
  const section = () => sectionFor(location.pathname)
  const title = () => {
    const exact = NAV.flatMap((entry) => entry.items).find(
      (entry) => entry.href === location.pathname,
    )
    return (
      props.title ??
      exact?.title ??
      (location.pathname.split('/').at(-1) ?? '').replace(/-/g, ' ')
    )
  }
  onMount(() => {
    const find = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setFinding(true)
      }
    }
    window.addEventListener('keydown', find)
    onCleanup(() => window.removeEventListener('keydown', find))
  })
  return (
    <header class="sticky top-0 z-30 border-b border-outline-gray-1 bg-surface-base">
      <div class="flex min-h-12 flex-wrap items-center gap-1 px-2 sm:gap-2 sm:px-4">
        <button
          ref={props.menuRef}
          type="button"
          aria-label="Open navigation"
          aria-haspopup="dialog"
          onClick={() => props.onMenu()}
          class="grid size-10 shrink-0 place-items-center rounded-3 focus-visible:focus-ring lg:hidden"
        >
          <span aria-hidden="true" class="lucide-menu size-4" />
        </button>
        <A
          href="/"
          aria-label="newui home"
          class="flex shrink-0 items-center gap-2 rounded-3 focus-visible:focus-ring"
        >
          <img src="/favicon.svg" alt="" class="size-6 rounded-3" />
          <span class="hidden font-semibold sm:inline">newui</span>
        </A>
        <nav
          aria-label="Breadcrumbs"
          class="hidden min-w-0 items-center gap-2 text-interface text-ink-gray-7 sm:flex"
        >
          <span
            aria-hidden="true"
            class="lucide-chevron-right size-4 shrink-0"
          />
          <A
            href={section()?.items[0]?.href ?? '/'}
            class="rounded-3 hover:underline focus-visible:focus-ring"
          >
            {section()?.title}
          </A>
          <Show when={title() !== section()?.title}>
            <span aria-hidden="true">/</span>
            <span aria-current="page" class="truncate text-ink-gray-9">
              {title()}
            </span>
          </Show>
        </nav>
        <nav
          aria-label="Primary"
          class="ms-auto hidden shrink-0 items-center gap-0.5 lg:flex"
        >
          <For each={TOP_LINKS}>
            {(link) => (
              <A
                href={link.href}
                aria-current={
                  section()?.title === link.section ? 'true' : undefined
                }
                class={NAV_ROW}
              >
                {link.title}
              </A>
            )}
          </For>
        </nav>
        <button
          ref={findTrigger}
          type="button"
          aria-label="Find a page"
          aria-haspopup="dialog"
          onClick={() => setFinding(true)}
          class="ms-auto flex size-10 shrink-0 items-center justify-center gap-2 rounded-4 text-ink-gray-7 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring motion-reduce:transition-none sm:h-8 sm:w-auto sm:justify-start sm:border sm:border-outline-gray-1 sm:bg-surface-gray-1 sm:ps-2.5 sm:pe-1.5 lg:ms-0"
        >
          <span aria-hidden="true" class="lucide-search size-4 shrink-0" />
          <span class="hidden text-caption sm:inline">Find a page</span>
          <kbd class="hidden rounded-3 border border-outline-gray-1 bg-surface-base px-1 text-xs text-ink-gray-7 sm:inline">
            ⌘ K
          </kbd>
        </button>
        <ThemeMenu />
        <a
          href="https://github.com/talelk/newui"
          target="_blank"
          rel="noreferrer"
          aria-label="Source on GitHub"
          class="grid size-10 shrink-0 place-items-center rounded-3 text-ink-gray-6 hover:bg-surface-gray-2 focus-visible:focus-ring"
        >
          <GithubMark class="size-4" />
        </a>
      </div>
      <Show when={finding()}>
        <Suspense>
          <PageFinder
            onClose={() => {
              setFinding(false)
              // The palette is opened programmatically, so nothing else can put
              // focus back where the reader left it.
              findTrigger?.focus()
            }}
          />
        </Suspense>
      </Show>
    </header>
  )
}
