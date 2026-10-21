/**
 * Type surface for the framework-neutral token data.
 *
 * The values themselves live in `index.js` (ported verbatim from frappe-ui so
 * the token vocabulary and resolved values stay identical). This file only
 * declares their shapes for TypeScript consumers.
 */

export type ColorRamp = Record<string, string>
export type SemanticLayer = Record<string, ColorRamp>

export interface CssVariableLayers {
  light: Record<string, string>
  dark: Record<string, string>
}

export const colors: {
  light: Record<string, ColorRamp>
  dark: Record<string, ColorRamp>
  overlay: Record<string, ColorRamp | string>
  neutral: Record<string, string>
}

export const semanticColors: {
  light: SemanticLayer
  dark: SemanticLayer
}

export const radius: Record<string, string>
export const radiusRoles: Record<
  'control' | 'card' | 'overlay' | 'pill',
  string
>

export const shadows: Record<string, string>

export const focusRing: {
  light: Record<string, string>
  dark: Record<string, string>
}

export const fontSize: Record<
  string,
  {
    fontSize: string
    lineHeight: string
    letterSpacing: string
    fontWeight: number
  }
>

export const fontWeight: Record<string, number>
export const fontFamily: Record<string, string>
export const tracking: Record<string, Record<string, Record<string, string>>>
export const spacing: Record<string, string>
export const layoutSpacing: Record<string, string>
export const screens: Record<string, string>

export const cssVariables: CssVariableLayers

export const zIndex: Record<string, number>
export const duration: Record<string, string>
export const easing: Record<string, string>
