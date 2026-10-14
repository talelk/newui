# @newui/blocks

Composed sections built from `@newui/ui` — the shapes a screen is assembled
from, as opposed to the parts it is made of.

A component answers "what is this control"; a block answers "how does a page
open". The distinction is the reason this is a package and not a folder inside
`@newui/ui`: a block is opinionated about layout, is allowed to be replaced
wholesale, and pulls several components together — so it should not be able to
change a component's budget, and a consumer should be able to take the blocks
without the reference pages that describe them.

Blocks import from `@newui/ui` and nothing else. If one needs a chart or an
editor, it belongs in that package's own surface, not here.
