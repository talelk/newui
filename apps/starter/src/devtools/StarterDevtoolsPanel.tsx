import { For, type JSX, Show } from 'solid-js'
import {
  clearStarterEvents,
  STARTER_DEVTOOLS_PLUGIN_ID,
  starterEventLog,
} from './events'

const time = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function payloadText(payload: unknown): string {
  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return String(payload)
  }
}

/**
 * The product panel registered beside the library panel.
 *
 * It reads the same typed log the app writes, so filters, record mutations,
 * session changes and settings saves are visible without opening the console.
 * `border-current` and inherited colour keep it legible in either devtools
 * theme; the shell owns the surrounding typography and palette.
 */
export function StarterDevtoolsPanel(): JSX.Element {
  return (
    <div class="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3 text-xs">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-semibold">Acme runtime</p>
          <p class="mt-0.5 text-caption opacity-70">
            Typed product events, newest first.
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-3 border border-current/20 px-2 py-1 text-caption transition-opacity hover:opacity-80 focus-visible:focus-ring"
          onClick={clearStarterEvents}
        >
          Clear
        </button>
      </div>

      <Show
        when={starterEventLog().length > 0}
        fallback={
          <div class="grid flex-1 place-items-center rounded-3 border border-current/20 border-dashed p-4 text-center">
            <p class="max-w-64 opacity-70">
              Interact with the app. Filters, records, sessions and settings
              land here as typed events.
            </p>
          </div>
        }
      >
        <ul class="flex min-h-0 flex-1 flex-col gap-2 overflow-auto pe-1">
          <For each={starterEventLog()}>
            {(event) => (
              <li class="rounded-3 border border-current/20 p-2">
                <div class="flex items-baseline justify-between gap-2">
                  <code class="truncate font-mono font-semibold">
                    {event.name}
                  </code>
                  <span class="shrink-0 text-caption opacity-60">
                    {time.format(event.at)}
                  </span>
                </div>
                <pre class="mt-1 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-4 opacity-80">
                  {payloadText(event.payload)}
                </pre>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <p class="text-caption opacity-60">
        Event client <code class="font-mono">{STARTER_DEVTOOLS_PLUGIN_ID}</code>{' '}
        · hold{' '}
        <kbd class="rounded border border-current/20 px-1 font-mono">Shift</kbd>{' '}
        + <kbd class="rounded border border-current/20 px-1 font-mono">Alt</kbd>{' '}
        +{' '}
        <kbd class="rounded border border-current/20 px-1 font-mono">
          Ctrl/Cmd
        </kbd>{' '}
        to inspect source
      </p>
    </div>
  )
}
