import type { JSX } from 'solid-js'

/**
 * The bordered stage a block demo sits in (H14, spec/examples-refresh.md
 * §1). Four demos spelled the wrapper out; the only real difference is
 * whether the block needs a fixed height to compose against — `medium`
 * for a sidebar, `tall` for a board, neither for a toolbar or a card.
 */
export function DemoFrame(props: {
  medium?: boolean
  tall?: boolean
  children: JSX.Element
}): JSX.Element {
  return (
    <div
      // A fixed-height stage that clips is a scroll path waiting to happen:
      // `auto` renders identically to `hidden` while the content fits and
      // keeps the bottom reachable when it does not.
      class="overflow-auto rounded-6 border border-outline-gray-2"
      classList={{
        'h-80': props.medium === true,
        'h-[26rem]': props.tall === true,
      }}
    >
      {props.children}
    </div>
  )
}
