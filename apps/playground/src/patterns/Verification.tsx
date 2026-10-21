import { Button, TextInput } from '@newui/atoms'
import { createSignal, For, Show } from 'solid-js'

export default function Verification() {
  const [code, setCode] = createSignal('')
  const [attempted, setAttempted] = createSignal(false)
  const [verified, setVerified] = createSignal(false)
  const [notice, setNotice] = createSignal('')
  return (
    <form
      noValidate
      class="flex max-w-sm flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        setAttempted(true)
        setVerified(code() === '123456')
        setNotice(
          code() === '123456' ? 'Code verified in this local demo.' : '',
        )
      }}
    >
      <div>
        <h2 class="text-section">Check your inbox</h2>
        <p class="mt-2 text-ink-gray-7">
          Use the demonstration code{' '}
          <strong class="font-medium text-ink-gray-9">123456</strong>. No
          message is sent.
        </p>
      </div>
      <TextInput
        label="Verification code"
        description="Enter or paste the six digits. Non-numeric characters are ignored."
        required
        value={code()}
        onInput={(event) => {
          setCode(event.currentTarget.value.replace(/\D/g, '').slice(0, 6))
          setAttempted(false)
          setVerified(false)
        }}
        error={
          attempted() && !verified()
            ? 'The demo code is 123456. Enter all six digits.'
            : undefined
        }
      />
      <div aria-hidden="true" class="flex gap-2">
        <For each={Array.from({ length: 6 })}>
          {(_, index) => (
            <span class="grid h-12 min-w-0 flex-1 place-items-center rounded-3 border border-outline-gray-2 bg-surface-gray-1 text-section tabular-nums">
              {code()[index()] ?? '·'}
            </span>
          )}
        </For>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button type="submit" variant="solid" theme="blue">
          Verify code
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setCode('')
            setAttempted(false)
            setVerified(false)
            setNotice(
              'Your local demo code is still 123456. No message was sent.',
            )
          }}
        >
          Resend demo code
        </Button>
      </div>
      <Show when={notice()}>
        <p role="status" class="text-interface text-ink-gray-7">
          {notice()}
        </p>
      </Show>
    </form>
  )
}
