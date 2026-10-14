import type { JSX } from 'solid-js'
import { Portal as SolidPortal } from 'solid-js/web'
import { useUI } from './provider'

export interface PortalProps {
  mount?: HTMLElement
  children: JSX.Element
}

/** Overlay portal that honours the app's configured mount point. */
export function Portal(props: PortalProps) {
  const ui = useUI()
  const target = () => props.mount ?? ui?.portalTarget?.() ?? undefined
  return <SolidPortal mount={target()}>{props.children}</SolidPortal>
}
