import { createResource, createSignal, For, Show, Suspense } from 'solid-js'
import { LoadingNote } from './LoadingNote'
import { Markdown } from './markdown'
// The README glob lives in a `.ts` module: a glob call written in a `.tsx`
// file breaks Vite 8's dependency scan (see package-guide-sources.ts).
import { packageGuideSources as sources } from './package-guide-sources'

const packages = [
  'atoms',
  'molecules',
  'organisms',
  'templates',
  'data',
  'charts',
  'editor',
  'code-editor',
  'icons',
  'tokens',
  'tailwind',
  'vite',
]
function Guide(props: { name: string }) {
  const [markdown] = createResource(
    () => props.name,
    async (name) =>
      (await sources[`../../../../packages/${name}/README.md`]?.()) ?? '',
  )
  return (
    <Suspense fallback={<LoadingNote label="Loading package guide…" />}>
      <Markdown markdown={markdown() ?? ''} />
    </Suspense>
  )
}

/** Package source guides are loaded on demand, never copied into generated data. */
export function PackageGuides() {
  const [open, setOpen] = createSignal<string>()
  return (
    <section class="flex flex-col gap-4" aria-label="Package guides">
      <h2 class="text-section">Package guides and public helpers</h2>
      <For each={packages}>
        {(name) => (
          <details
            id={name}
            open={open() === name}
            onToggle={(event) => {
              if (event.currentTarget.open) setOpen(name)
            }}
            class="rounded-card border border-outline-gray-1 p-4"
          >
            <summary class="cursor-pointer rounded-3 font-medium focus-visible:focus-ring">
              @talelk/newui-{name}
            </summary>
            <Show when={open() === name}>
              <div class="mt-4">
                <Guide name={name} />
              </div>
            </Show>
          </details>
        )}
      </For>
    </section>
  )
}
