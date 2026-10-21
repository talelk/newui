/** Port destinations for the 68 examples in the checked-out solid-ui registry. */
const destinations: Record<string, string> = {
  'progress-demo': '/atoms/progress',
  'progress-circle-demo': '/atoms/progress-circle',
  'command-demo': '/organisms/command-palette',
  'command-dialog-demo': '/organisms/command-palette',
  'badge-demo': '/atoms/badge',
  'menubar-demo': '/kit/recipes/navigation',
  'separator-demo': '/atoms/divider',
  'slider-demo': '/atoms/slider',
  'context-menu-demo': '/molecules/context-menu',
  'collapsible-demo': '/molecules/collapsible',
  'mode-toggle': '/foundations#color-scheme',
  'data-table-demo': '/organisms/data-table',
  'toast-demo': '/molecules/toast',
  'sonner-demo': '/molecules/toast',
  'timeline-demo': '/molecules/timeline',
  'pagination-demo': '/molecules/pagination',
  'bar-chart-demo': '/organisms/bar-chart',
  'area-chart-demo': '/organisms/area-chart',
  'pie-chart-demo': '/organisms/donut-chart',
  'hover-card-demo': '/molecules/hover-card',
  'aspect-ratio-demo': '/foundations#layout-rhythm',
  'text-field-error-demo': '/atoms/text-input',
  'badge-delta-demo': '/kit/recipes/analytics-widgets',
  'number-field-demo': '/molecules/number-input',
  'tooltip-demo': '/atoms/tooltip',
  'calendar-demo': '/molecules/date-picker',
  'card-demo': '/molecules/card',
  'date-range-demo': '/molecules/date-range-picker',
  'drawer-demo': '/molecules/bottom-sheet',
  'alert-dialog-demo': '/molecules/dialog',
  'date-picker-demo': '/molecules/date-picker',
  'alert-demo': '/molecules/alert',
  'resizable-demo': '/templates/pane-layout',
  'otp-field-demo': '/kit/recipes/verification',
  'breadcrumb-demo': '/molecules/breadcrumbs',
  'dropdown-menu-demo': '/molecules/dropdown',
  'toggle-group-demo': '/molecules/toggle-group',
  'checkbox-demo': '/atoms/checkbox',
  'checkbox-indeterminate-demo': '/atoms/checkbox',
  'text-field-demo': '/atoms/text-input',
  'text-field-textarea-demo': '/atoms/textarea',
  'button-demo': '/atoms/button',
  'accordion-demo': '/molecules/accordion',
  'tabs-demo': '/molecules/tabs',
  'delta-bar-demo': '/kit/recipes/analytics-widgets',
  'popover-demo': '/molecules/popover',
  'switch-demo': '/atoms/switch',
  'radio-group-demo': '/molecules/radio-group',
  'avatar-demo': '/atoms/avatar',
  'bar-list-demo': '/kit/recipes/analytics-widgets',
  'drawer-dialog': '/kit/recipes/navigation',
  'navigation-menu-demo': '/kit/recipes/navigation',
  'dialog-demo': '/molecules/dialog',
  'callout-demo': '/kit/recipes/analytics-widgets',
  'combobox-demo': '/molecules/combobox',
  'skeleton-demo': '/atoms/skeleton',
  'sheet-demo': '/molecules/bottom-sheet',
  'grid-demo': '/foundations#layout-rhythm',
  'flex-demo': '/foundations#layout-rhythm',
  'toggle-demo': '/molecules/toggle-group',
  'select-demo': '/molecules/select',
  'table-demo': '/organisms/data-table',
  ...Object.fromEntries(
    [
      'carousel-demo',
      'carousel-orientation-demo',
      'carousel-size-demo',
      'carousel-spacing-demo',
      'carousel-plugin-demo',
      'carousel-api-demo',
    ].map((name) => [name, '/kit/recipes/carousel']),
  ),
}
export const REFERENCE_EXAMPLES = Object.entries(destinations)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([source, href]) => ({
    source,
    href,
    implementation: href,
    name: source.replace(/-demo$/, '').replaceAll('-', ' '),
  }))

export const PATTERNS = [
  {
    slug: 'forms',
    title: 'Multi-step forms',
    description:
      'A responsive setup wizard with validation, review, back/continue flow and a completion state.',
  },
  {
    slug: 'overlays',
    title: 'Enterprise overlays',
    description:
      'Confirmation dialogs, bounded edit forms and a mobile-first bottom sheet.',
  },
  {
    slug: 'carousel',
    title: 'Carousel',
    description:
      'Keyboard navigation, sizing, spacing, orientation and optional automatic playback.',
  },
  {
    slug: 'command',
    title: 'Command search',
    description:
      'A searchable action palette, inline and in a keyboard-accessible dialog.',
  },
  {
    slug: 'layout',
    title: 'Layout & resizing',
    description:
      'Aspect ratios, flex, grid and adjustable panels using native layout and controls.',
  },
  {
    slug: 'navigation',
    title: 'Navigation & drawers',
    description:
      'Menu bars, grouped navigation and responsive editing dialogs.',
  },
  {
    slug: 'verification',
    title: 'Verification code',
    description:
      'A paste-friendly numeric code field with validation and accessible feedback.',
  },
  {
    slug: 'analytics-widgets',
    title: 'Analytics widgets',
    description:
      'Delta badges, bars, ranked lists and callouts with readable semantic colour.',
  },
] as const
