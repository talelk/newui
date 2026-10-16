import {
  PageHeaderMobile,
  ResponsiveShell,
  ResponsiveShellMenu,
} from '@newui/ui'
import { A } from '@solidjs/router'
import type { JSX } from 'solid-js'
import { ThemeMenu } from '../shell/ThemeMenu'

/**
 * The application frame every example is rendered in.
 *
 * It is `ResponsiveShell` — the docked rail-and-sidebar frame where there is
 * room, a pinned header and a drawer where there is not — rather than a second,
 * private implementation of the same switch. What stays here is what is *this
 * site's*: the workspace masthead, the demo-data footer, the link back to the
 * gallery, and the page's own title block.
 *
 * `h-dvh` is the part that makes it a frame instead of a document: the shell owns
 * the viewport, the content column scrolls inside it, and the header and the
 * filters stay where they are. That is how the reference applications behave, and
 * it is why a board can own its own overflow.
 */
export function ExampleFrame(props: {
  title: string
  description: string
  section: string
  actions?: JSX.Element
  sidebar?: JSX.Element
  children: JSX.Element
}): JSX.Element {
  return (
    <ResponsiveShell
      class="h-dvh bg-surface-gray-1 text-interface text-ink-gray-9"
      title={props.section}
      label={`${props.section} navigation`}
      // A recipe that declares no navigation gets no sidebar at all — and, below
      // the breakpoint, no drawer and no menu button. A frame with a sliver of
      // empty column and a hamburger that opens nothing is worse than a frame
      // with neither.
      sidebar={
        props.sidebar ? (
          // Fixed beside the content, full width inside the drawer — the same
          // `lg` breakpoint the shell itself switches on.
          <div class="flex min-h-0 w-full shrink-0 flex-col gap-1 border-e border-outline-gray-1 bg-surface-elevation-1 p-3 lg:w-52">
            <nav
              aria-label={`${props.section} navigation`}
              class="min-h-0 flex-1"
            >
              {props.sidebar}
            </nav>
            <A
              href="/examples"
              class="mt-4 block shrink-0 rounded-3 px-3 py-2 text-caption text-ink-gray-6 focus-visible:focus-ring"
            >
              All examples{' '}
              <span
                aria-hidden="true"
                class="lucide-arrow-up-right inline-block size-4 align-middle"
              />
            </A>
          </div>
        ) : undefined
      }
      header={
        <header class="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-outline-gray-1 bg-surface-elevation-1 px-4">
          <A
            href="/examples"
            class="flex items-center gap-2 rounded-3 font-semibold focus-visible:focus-ring"
          >
            <img src="/favicon.svg" alt="" class="size-6" />
            newui{' '}
            <span class="hidden font-normal text-ink-gray-6 sm:inline">
              / Acme workspace
            </span>
          </A>
          <div class="flex max-w-full flex-wrap items-center gap-2">
            <ThemeMenu />
            <span
              role="img"
              aria-label="Rhea Kapoor"
              class="grid size-7 place-items-center rounded-full bg-surface-blue-2 text-caption text-ink-blue-8"
            >
              RK
            </span>
          </div>
        </header>
      }
      mobileHeader={
        <PageHeaderMobile
          title={props.section}
          // The bar names the section; the page's own title below is the
          // document's `h1`. Two of them is one too many.
          titleAs="span"
          prefix={
            props.sidebar ? (
              <ResponsiveShellMenu label="Toggle workspace navigation" />
            ) : undefined
          }
          suffix={<ThemeMenu />}
        />
      }
    >
      <a href="#workspace-content" class="sr-only focus:not-sr-only">
        Skip to workspace
      </a>
      <main
        id="workspace-content"
        class="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-3 pb-24 sm:pb-8 md:p-4"
      >
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mb-1 text-caption text-ink-gray-6">
              WORKSPACE / {props.section.toUpperCase()}
            </p>
            <h1 class="text-heading">{props.title}</h1>
            <p class="mt-2 max-w-2xl text-ink-gray-6">{props.description}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">{props.actions}</div>
        </div>
        {props.children}
        <footer class="flex flex-wrap justify-between gap-2 text-caption text-ink-gray-6">
          <span>Local demo data · Built with newui</span>
          <A
            href="/examples"
            class="rounded-3 text-ink-blue-link focus-visible:focus-ring"
          >
            Explore the examples{' '}
            <span
              aria-hidden="true"
              class="lucide-arrow-right inline-block size-4 align-middle"
            />
          </A>
        </footer>
      </main>
    </ResponsiveShell>
  )
}
