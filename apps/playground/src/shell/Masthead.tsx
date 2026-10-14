import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'
import { MASTHEAD } from './nav'
import { ThemeMenu } from './ThemeMenu'

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

/**
 * The site masthead: brand, top-level destinations, the colour-scheme switch and
 * a link to the source. Sticky, and the only chrome with a backdrop blur — a
 * blurred sticky element forces a compositor layer, so exactly one is worth it.
 *
 * Active state comes from the router's own `activeClass` rather than a
 * `useLocation()` comparison here: the router knows about nesting and trailing
 * slashes, and a second implementation would drift from it.
 */
export function Masthead(): JSX.Element {
  return (
    <header class="sticky top-0 z-30 border-b border-outline-gray-1 bg-surface-base/85 backdrop-blur">
      <div class="mx-auto flex h-12 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        <A
          href="/"
          class="flex shrink-0 items-center gap-2 rounded-4 focus-visible:focus-ring"
          aria-label="newui home"
        >
          <img src="/favicon.svg" alt="" class="size-6 rounded-[6px]" />
          <span class="text-base-medium text-ink-gray-9">newui</span>
        </A>

        {/* Horizontal scroll rather than a hamburger: five destinations fit on
            one line on a phone, and a scroll area keeps them one tap away. */}
        <nav
          aria-label="Sections"
          class="ms-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
        >
          <For each={MASTHEAD}>
            {(item) => (
              <A
                href={item.href}
                class="shrink-0 rounded-3 px-2 py-1 text-sm text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring"
                activeClass="text-ink-gray-9"
                inactiveClass=""
                end={item.href === '/'}
              >
                {item.title}
              </A>
            )}
          </For>
        </nav>

        <div class="flex shrink-0 items-center gap-2">
          <a
            href="https://github.com/talelk/newui"
            target="_blank"
            rel="noreferrer"
            aria-label="Source on GitHub"
            class="grid size-7 place-items-center rounded-4 text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring"
          >
            <GithubMark class="size-4" />
          </a>
          <ThemeMenu />
        </div>
      </div>
    </header>
  )
}
