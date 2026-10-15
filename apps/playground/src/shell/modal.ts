/** Wrap at modal boundaries instead of letting Tab visit the browser chrome. */
export function modalKeyDown(
  event: KeyboardEvent & { currentTarget: HTMLDialogElement },
) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.currentTarget.close()
    return
  }
  if (event.key !== 'Tab') return
  const items = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]',
    ),
  ].filter((element) => element.getClientRects().length > 0)
  const first = items[0]
  const last = items.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
