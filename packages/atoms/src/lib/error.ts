/**
 * Error normalisation, shared by `ErrorMessage` and any surface that renders a
 * captured `Error`.
 *
 * One message, several messages, or an `Error`. An `Error` renders its
 * `messages` when it has any (a whitelisted method can return several) and its
 * `message` otherwise. There is one implementation so two error surfaces can
 * never disagree about what an empty array or a blank string means.
 */
export type ErrorMessageValue =
  | string
  | string[]
  | (Error & { messages?: string | string[] })

/**
 * Collapse an error value to the lines that render. An empty array, an empty
 * string and an `Error` with neither `message` nor `messages` all report no
 * error (an empty result), which is also the "no error" test.
 */
export function errorLines(value?: ErrorMessageValue | null): string[] {
  if (!value) return []
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.filter(Boolean).map(String)

  // An empty `messages` array is not an answer, so fall through to `message`.
  const messages = value.messages
  if (Array.isArray(messages) && messages.length) {
    const lines = messages.filter(Boolean).map(String)
    if (lines.length) return lines
  } else if (typeof messages === 'string' && messages) {
    return [messages]
  }
  return value.message ? [value.message] : []
}
