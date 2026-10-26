import { createSignal, type JSX, Show, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'

export type ImageRatio = '1/1' | '4/3' | '3/2' | '16/9' | '21/9'
export type ImageFit = 'cover' | 'contain'

export interface ImageProps {
  src: string
  /** Text alternative. Pass `''` only for a purely decorative image. */
  alt: string
  /** Fixed aspect box; omit and the image keeps its intrinsic ratio. */
  ratio?: ImageRatio
  /** @default cover */
  fit?: ImageFit
  /** Replaces the broken image when the source fails to load. */
  fallback?: JSX.Element
  class?: string
}

// Literal classes: the scanner (and `pnpm css:check`) can only see utilities
// that appear verbatim in source.
const RATIO: Record<ImageRatio, string> = {
  '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '16/9': 'aspect-video',
  '21/9': 'aspect-[21/9]',
}

/**
 * A framed image: a painted surface that holds its box (by `ratio` when set,
 * intrinsically when not) while the source loads or fails, so a page's layout
 * never jumps. Lazy by default.
 */
export function Image(props: ImageProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'src',
    'alt',
    'ratio',
    'fit',
    'fallback',
    'class',
  ])
  const [failed, setFailed] = createSignal(false)

  return (
    <span
      data-slot="image"
      data-ratio={local.ratio}
      class={cn(
        'relative block overflow-hidden bg-surface-gray-2',
        local.ratio && RATIO[local.ratio],
        local.class,
      )}
    >
      <Show when={!failed()} fallback={local.fallback}>
        <img
          {...rest}
          src={local.src}
          alt={local.alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          class={cn(
            'h-full w-full',
            (local.fit ?? 'cover') === 'cover'
              ? 'object-cover'
              : 'object-contain',
          )}
        />
      </Show>
    </span>
  )
}
