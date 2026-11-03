import type { JSX } from 'solid-js'

export function MaximizeIcon(props: { class?: string }): JSX.Element {
  return (
    <svg
      class={props.class}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="10 2 14 2 14 6" />
      <polyline points="6 14 2 14 2 10" />
      <line x1="14" y1="2" x2="9.33" y2="6.67" />
      <line x1="2" y1="14" x2="6.67" y2="9.33" />
    </svg>
  )
}
