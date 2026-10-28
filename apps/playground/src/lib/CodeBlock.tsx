import { createSignal, type JSX, Show } from 'solid-js'

export function CodeBlock(props: {
  code: string
  title?: string
}): JSX.Element {
  const [copyStatus, setCopyStatus] = createSignal('')
  return (
    <div class="flex min-w-0 flex-col gap-1">
      <Show when={props.title}>
        <span class="text-caption text-ink-gray-7">{props.title}</span>
      </Show>
      <div class="relative min-w-0">
        <pre class="whitespace-pre-wrap break-words rounded-card border border-outline-gray-1 bg-surface-gray-1 p-4 pe-16 text-sm leading-relaxed text-ink-gray-8">
          <code>{props.code}</code>
        </pre>
        <button
          type="button"
          aria-label="Copy code"
          class="absolute end-2 top-2 rounded-3 border border-outline-gray-2 bg-surface-elevation-1 px-2 py-1 text-caption text-ink-gray-8 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring motion-reduce:transition-none"
          onClick={() => {
            void navigator.clipboard?.writeText(props.code).then(
              () => setCopyStatus('Copied'),
              () => setCopyStatus('Copy failed'),
            )
          }}
        >
          {copyStatus() || 'Copy'}
        </button>
        <span class="sr-only" role="status">
          {copyStatus()}
        </span>
      </div>
    </div>
  )
}
