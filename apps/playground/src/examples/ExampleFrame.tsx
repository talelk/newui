import {
  Avatar,
  Breadcrumbs,
  PageHeaderMobile,
  ResponsiveShell,
  ResponsiveShellMenu,
  Sidebar,
  SidebarCollapseToggle,
  SidebarRail,
  SidebarRailItem,
} from '@newui/ui'
import { A } from '@solidjs/router'
import { createSignal, For, type JSX, onCleanup, onMount, Show } from 'solid-js'
import { EXAMPLES } from '../lib/examples'
import { ThemeMenu } from '../shell/ThemeMenu'

/**
 * The frappe-style icon rail every example opens with: the mark, one
 * shortcut per application recipe (from the same catalog the gallery
 * renders, so the two cannot drift), and the account avatar at the foot.
 * The middle run scrolls on its own; the ends stay put.
 */
function ExampleRail(props: { section: string }): JSX.Element {
  const apps = EXAMPLES.filter(
    (example) => example.href !== '/examples/patterns',
  )
  const slugOf = (href: string) => href.split('/').pop() ?? ''
  const isActive = (href: string) =>
    slugOf(href).toLowerCase() === props.section.trim().toLowerCase()
  return (
    <SidebarRail class="border-e border-outline-gray-1">
      <SidebarRailItem
        label="Examples home"
        description="Back to the examples index"
        route="/examples"
      >
        <img src="/favicon.svg" alt="" class="size-7 rounded-[7px]" />
      </SidebarRailItem>
      {/* `overflow-x-clip` matters as much as the `overflow-y-auto`: with only
          the y-axis declared, `overflow-x` computes to `auto`, so the half-pixel
          the 28px items overhang this subpixel-wide rail by (28 > 27) would
          otherwise render a phantom horizontal scrollbar — with its own arrow
          buttons — across the middle of the rail. */}
      <div class="flex w-full flex-1 flex-col items-center gap-2 overflow-x-clip overflow-y-auto pt-3">
        <For each={apps}>
          {(example) => (
            <SidebarRailItem
              label={
                isActive(example.href)
                  ? `${example.name} — current app`
                  : example.name
              }
              icon={example.icon}
              variant="ghost"
              route={`${example.href}/fullscreen`}
              active={isActive(example.href)}
            />
          )}
        </For>
      </div>
      <div class="flex flex-col items-center pt-2">
        <SidebarRailItem label="Rhea Kapoor">
          <Avatar size="xs" theme="blue" label="Rhea Kapoor" />
        </SidebarRailItem>
      </div>
    </SidebarRail>
  )
}

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
  // The workspace sidebar folds to an icon rail like the library's own
  // sidebars — but only while docked. The same node becomes the drawer's body
  // below `lg` (the breakpoint the shell switches on), and a drawer of bare
  // icons with sr-only labels is no navigation at all, so there it stays
  // expanded and the toggle is not offered.
  const [collapsed, setCollapsed] = createSignal(false)
  const [docked, setDocked] = createSignal(false)
  onMount(() => {
    const media = matchMedia('(min-width: 1024px)')
    const sync = () => setDocked(media.matches)
    sync()
    media.addEventListener('change', sync)
    onCleanup(() => media.removeEventListener('change', sync))
  })
  const folded = () => docked() && collapsed()

  return (
    <ResponsiveShell
      class="h-dvh bg-surface-gray-1 text-interface text-ink-gray-9"
      title={props.section}
      label={`${props.section} navigation`}
      rail={
        // The rail itself is a plain column (as in frappe-ui); the frame
        // gives it its landmark so every link sits inside one.
        <nav aria-label="Example apps" class="h-full shrink-0">
          <ExampleRail section={props.section} />
        </nav>
      }
      // A recipe that declares no navigation gets no sidebar at all — and, below
      // the breakpoint, no drawer and no menu button. A frame with a sliver of
      // empty column and a hamburger that opens nothing is worse than a frame
      // with neither.
      sidebar={
        props.sidebar ? (
          // Fixed beside the content, full width inside the drawer — the same
          // `lg` breakpoint the shell itself switches on. The frame owns the
          // width (and animates it); the `Sidebar` inside owns the folded
          // state its items read, so it is fed `100%` both ways.
          <div
            class={`flex min-h-0 min-w-0 flex-1 flex-col border-e border-outline-gray-1 bg-surface-elevation-1 p-3 transition-[width] duration-300 ease-in-out motion-reduce:transition-none lg:flex-none ${collapsed() ? 'lg:w-[4.5rem]' : 'lg:w-52'}`}
          >
            <Sidebar
              ariaLabel={`${props.section} navigation`}
              width="100%"
              collapsedWidth="100%"
              collapsed={folded()}
              onCollapsedChange={setCollapsed}
              class="min-h-0 bg-surface-elevation-1"
            >
              {props.sidebar}
              <div class="mt-auto flex shrink-0 flex-col pt-2">
                <div class="hidden lg:block">
                  <SidebarCollapseToggle />
                </div>
                <Show when={!folded()}>
                  <A
                    href="/examples"
                    class="mt-1 block rounded-3 px-3 py-2 text-caption text-ink-gray-7 focus-visible:focus-ring"
                  >
                    All examples{' '}
                    <span
                      aria-hidden="true"
                      class="lucide-arrow-up-right inline-block size-4 align-middle"
                    />
                  </A>
                </Show>
              </div>
            </Sidebar>
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
            <span class="hidden font-normal text-ink-gray-7 sm:inline">
              / Acme workspace
            </span>
          </A>
          <div class="flex max-w-full flex-wrap items-center gap-2">
            <ThemeMenu />
            <Avatar size="sm" theme="blue" label="Rhea Kapoor" />
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
      <main
        id="workspace-content"
        class="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-3 pb-24 sm:pb-8 md:p-4"
      >
        <a href="#workspace-content" class="sr-only focus:not-sr-only">
          Skip to workspace
        </a>
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: 'Workspace', route: '/examples' },
                { label: props.section },
              ]}
            />
            <h1 class="mt-1 text-heading">{props.title}</h1>
            <p class="mt-2 max-w-2xl text-ink-gray-7">{props.description}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">{props.actions}</div>
        </div>
        {props.children}
        <footer class="flex flex-wrap justify-between gap-2 text-caption text-ink-gray-7">
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
