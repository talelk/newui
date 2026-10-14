import { createContext, type JSX, useContext } from 'solid-js'

export interface UIContextValue {
  dir: () => 'ltr' | 'rtl'
  portalTarget: () => HTMLElement | undefined
}

const UIContext = createContext<UIContextValue>()

export function useUI() {
  return useContext(UIContext)
}

export interface UIProviderProps {
  dir?: 'ltr' | 'rtl'
  portalTarget?: HTMLElement
  children: JSX.Element
}

/**
 * App-level context every overlay and input reads: writing direction and the
 * portal mount point. The Solid counterpart of `<FrappeUIProvider>`.
 */
export function UIProvider(props: UIProviderProps) {
  const value: UIContextValue = {
    dir: () => props.dir ?? 'ltr',
    portalTarget: () => props.portalTarget,
  }
  return <UIContext.Provider value={value}>{props.children}</UIContext.Provider>
}
