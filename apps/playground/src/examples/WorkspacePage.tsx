import { AppLayout } from '@newui/layouts'
import { Avatar, SidebarRail, SidebarRailItem } from '@newui/ui'
import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'
import { EXAMPLES } from '../lib/examples'
import { ThemeMenu } from '../shell/ThemeMenu'

/**
 * The workspace page every example is rendered in.
 *
 * `AppLayout` owns the frame — the rail slot, the folding navigation column, the
 * title block, the mobile bar, the scroller. What is left here is what is *this
 * site's*: which apps the rail lists, the "Acme workspace" mark, the colour
 * scheme, the demo-data footer. That split is the point of the layout level:
 * two apps share the arrangement and never share their chrome.
 */

/**
 * The frappe-style icon rail: the mark, one shortcut per application recipe
 * (from the same catalog the gallery renders, so the two cannot drift), and the
 * account avatar at the foot. The middle run scrolls on its own; the ends stay
 * put.
 */
function ExampleRail(props: { section: string }): JSX.Element {
  const apps = EXAMPLES.filter((example) => example.href !== '/pages/patterns')
  const slugOf = (href: string) => href.split('/').pop() ?? ''
  const isActive = (href: string) =>
    slugOf(href).toLowerCase() === props.section.trim().toLowerCase()

  return (
    <SidebarRail class="border-e border-outline-gray-1">
      <SidebarRailItem
        label="Examples home"
        description="Back to the examples index"
        route="/pages"
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

export function WorkspacePage(props: {
  title: string
  description: string
  section: string
  actions?: JSX.Element
  sidebar?: JSX.Element
  children: JSX.Element
}): JSX.Element {
  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Workspace', route: '/pages' },
        { label: props.section },
      ]}
      title={props.title}
      description={props.description}
      actions={props.actions}
      navLabel={`${props.section} navigation`}
      mobileTitle={props.section}
      rail={<ExampleRail section={props.section} />}
      sidebar={props.sidebar}
      sidebarFooter={
        <A
          href="/pages"
          class="block rounded-3 px-3 py-2 text-caption text-ink-gray-7 focus-visible:focus-ring"
        >
          All examples{' '}
          <span
            aria-hidden="true"
            class="lucide-arrow-up-right inline-block size-4 align-middle"
          />
        </A>
      }
      brand={
        <A
          href="/pages"
          class="flex items-center gap-2 rounded-3 font-semibold focus-visible:focus-ring"
        >
          <img src="/favicon.svg" alt="" class="size-6" />
          newui{' '}
          <span class="hidden font-normal text-ink-gray-7 sm:inline">
            / Acme workspace
          </span>
        </A>
      }
      headerActions={
        <>
          <ThemeMenu />
          <Avatar size="sm" theme="blue" label="Rhea Kapoor" />
        </>
      }
      footer={
        <footer class="flex flex-wrap justify-between gap-2 text-caption text-ink-gray-7">
          <span>Local demo data · Built with newui</span>
          <A
            href="/pages"
            class="rounded-3 text-ink-blue-link focus-visible:focus-ring"
          >
            Explore the examples{' '}
            <span
              aria-hidden="true"
              class="lucide-arrow-right inline-block size-4 align-middle"
            />
          </A>
        </footer>
      }
    >
      {props.children}
    </AppLayout>
  )
}
