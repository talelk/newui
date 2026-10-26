import { For, type JSX } from 'solid-js'

export type AppSilhouetteKind =
  | 'analytics'
  | 'board'
  | 'table'
  | 'mail'
  | 'compose'
  | 'files'
  | 'cards'
  | 'auth'
  | 'threads'
  | 'settings'

const bar = 'h-1.5 rounded-1 bg-surface-gray-3'
const dot = 'size-1.5 shrink-0 rounded-full bg-surface-gray-4'

/**
 * One wireframe per screen shape, drawn in tokens only. Static decor: these
 * render inside an `aria-hidden` frame and never carry state, so plain
 * functions (not components) keep the JSX honest about that.
 */
const SHAPES: Record<AppSilhouetteKind, () => JSX.Element> = {
  analytics: () => (
    <div class="flex min-h-0 flex-1 flex-col gap-1.5">
      <div class="flex gap-1.5">
        <span class="h-6 flex-1 rounded-3 border border-outline-gray-1" />
        <span class="h-6 flex-1 rounded-3 border border-outline-gray-1" />
        <span class="h-6 flex-1 rounded-3 border border-outline-gray-1" />
      </div>
      <div class="flex min-h-0 flex-1 items-end gap-1 rounded-3 border border-outline-gray-1 p-1.5">
        <For each={[5, 9, 7, 12, 8, 14, 11]}>
          {(height, index) => (
            <span
              class={`w-full rounded-1 ${index() === 5 ? 'bg-surface-gray-5' : 'bg-surface-gray-3'}`}
              style={{ height: `${height * 2}px` }}
            />
          )}
        </For>
      </div>
    </div>
  ),
  board: () => (
    <div class="flex min-h-0 flex-1 gap-1.5">
      <For each={[3, 2, 4]}>
        {(cards) => (
          <div class="flex min-h-0 flex-1 flex-col gap-1 rounded-3 border border-outline-gray-1 p-1.5">
            <For each={[...Array(cards)]}>
              {() => <span class="h-3 w-full rounded-2 bg-surface-gray-2" />}
            </For>
          </div>
        )}
      </For>
    </div>
  ),
  table: () => (
    <div class="flex min-h-0 flex-1 flex-col gap-1 rounded-3 border border-outline-gray-1 p-1.5">
      <For each={[0, 1, 2, 3]}>
        {() => (
          <span class="flex flex-1 items-center gap-1.5">
            <span class={dot} />
            <span class={`flex-1 ${bar}`} />
            <span class={`w-6 ${bar}`} />
          </span>
        )}
      </For>
    </div>
  ),
  mail: () => (
    <div class="flex min-h-0 flex-1 gap-1.5">
      <div class="flex min-h-0 flex-1 flex-col gap-1 rounded-3 border border-outline-gray-1 p-1.5">
        <For each={[0, 1, 2]}>
          {() => (
            <span class="flex items-center gap-1.5">
              <span class={dot} />
              <span class={`flex-1 ${bar}`} />
            </span>
          )}
        </For>
      </div>
      <div class="flex min-h-0 flex-[1.4] flex-col gap-1.5 rounded-3 border border-outline-gray-1 p-1.5">
        <span class={`w-2/3 ${bar}`} />
        <span class={`w-full ${bar}`} />
        <span class={`w-5/6 ${bar}`} />
      </div>
    </div>
  ),
  compose: () => (
    <div class="flex min-h-0 flex-1 flex-col gap-1.5 rounded-3 border border-outline-gray-1 p-1.5">
      <span class={`w-1/3 ${bar}`} />
      <span class={`w-full ${bar}`} />
      <span class={`w-full ${bar}`} />
      <span class={`w-3/4 ${bar}`} />
      <span class="mt-auto h-3 w-12 rounded-2 bg-surface-gray-5" />
    </div>
  ),
  files: () => (
    <div class="grid min-h-0 flex-1 grid-cols-3 gap-1.5">
      <For each={[0, 1, 2, 3, 4, 5]}>
        {() => (
          <span class="flex flex-col justify-end gap-1 rounded-3 border border-outline-gray-1 p-1.5">
            <span class={`w-full ${bar}`} />
          </span>
        )}
      </For>
    </div>
  ),
  cards: () => (
    <div class="grid min-h-0 flex-1 grid-cols-2 gap-1.5">
      <For each={[0, 1, 2, 3]}>
        {() => (
          <span class="flex flex-col gap-1 rounded-3 border border-outline-gray-1 p-1.5">
            <span class="size-2 rounded-full bg-surface-gray-4" />
            <span class={`w-3/4 ${bar}`} />
          </span>
        )}
      </For>
    </div>
  ),
  auth: () => (
    <div class="flex min-h-0 flex-1 gap-1.5">
      <span class="flex-1 rounded-3 border border-outline-gray-1 bg-surface-gray-2" />
      <span class="flex flex-1 items-center justify-center rounded-3 border border-outline-gray-1 p-2">
        <span class="flex w-full flex-col gap-1">
          <span class={`w-full ${bar}`} />
          <span class={`w-full ${bar}`} />
          <span class="h-2.5 w-full rounded-2 bg-surface-gray-5" />
        </span>
      </span>
    </div>
  ),
  threads: () => (
    <div class="flex min-h-0 flex-1 flex-col gap-1 rounded-3 border border-outline-gray-1 p-1.5">
      <For each={[0, 1, 2, 3]}>
        {() => (
          <span class="flex flex-1 items-center gap-1.5">
            <span class={dot} />
            <span class={`w-1/3 ${bar}`} />
            <span class={`flex-1 ${bar}`} />
          </span>
        )}
      </For>
    </div>
  ),
  settings: () => (
    <div class="flex min-h-0 flex-1 gap-1.5">
      <span class="flex w-1/4 flex-col justify-center gap-1 rounded-3 border border-outline-gray-1 p-1.5">
        <span class={`w-full ${bar}`} />
        <span class={`w-2/3 ${bar}`} />
      </span>
      <span class="flex min-h-0 flex-1 flex-col justify-center gap-1.5 rounded-3 border border-outline-gray-1 p-1.5">
        <span class={`w-1/2 ${bar}`} />
        <span class="h-3 w-full rounded-2 border border-outline-gray-1" />
        <span class="h-3 w-2/3 rounded-2 border border-outline-gray-1" />
      </span>
    </div>
  ),
}

/**
 * A static wireframe of an application's shape, drawn in tokens only.
 *
 * The pages index is the site's proof surface; each card shows the silhouette
 * of the screen it opens. Decorative by construction (`aria-hidden`): the
 * row's text carries the meaning.
 */
export function AppSilhouette(props: { kind: AppSilhouetteKind }): JSX.Element {
  return (
    <div
      aria-hidden="true"
      class="flex aspect-[16/9] w-full flex-col gap-1.5 rounded-3 border border-outline-gray-1 bg-surface-base p-2"
    >
      <span class="h-1.5 w-10 shrink-0 rounded-1 bg-surface-gray-3" />
      {SHAPES[props.kind]()}
    </div>
  )
}
