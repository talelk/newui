import type { JSX } from 'solid-js'

export function MinimizeIcon(props: { class?: string }): JSX.Element {
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
      <polyline points="2.67 9.33 6.67 9.33 6.67 13.33" />
      <polyline points="13.33 6.67 9.33 6.67 9.33 2.67" />
      <line x1="9.33" y1="6.67" x2="14" y2="2" />
      <line x1="2" y1="14" x2="6.67" y2="9.33" />
    </svg>
  )
}
