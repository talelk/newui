# Card

Card composes a bordered surface with CardHeader, CardTitle, CardDescription,
CardContent and CardFooter. Each part accepts children and the existing root
class. Parts do not inject classes into other parts.

The default is a 10px radius, a semantic elevated surface, 12px padding and no
shadow. `padding="none" | "sm" | "md" | "lg"` selects no padding, 12px, 16px or
20px. `elevation="none" | "sm" | "base" | "md" | "lg"` makes an explicit shadow
choice. Borders define ordinary cards; elevation is reserved for a reason.

CardTitle is an `h3` using the 18px/24px section role. Place it under a section
heading so page heading order is coherent. CardDescription is supporting copy;
CardContent uses 14px interface text. CardFooter wraps application actions, which
choose their own Button variant and theme.

Hooks: `card`, `card-header`, `card-title`, `card-description`, `card-content`,
`card-footer` through `data-slot`.
