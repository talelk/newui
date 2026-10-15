/** Port destinations for the 68 examples in the checked-out solid-ui registry. */
const destinations: Record<string, string> = {
  'progress-demo': '/components/progress',
  'progress-circle-demo': '/components/progress-circle',
  'command-demo': '/examples/patterns/command',
  'command-dialog-demo': '/examples/patterns/command',
  'badge-demo': '/components/badge',
  'menubar-demo': '/examples/patterns/navigation',
  'separator-demo': '/components/divider',
  'slider-demo': '/components/slider',
  'context-menu-demo': '/components/context-menu',
  'collapsible-demo': '/components/collapsible',
  'mode-toggle': '/foundations',
  'data-table-demo': '/examples/tasks',
  'toast-demo': '/components/toast',
  'sonner-demo': '/components/toast',
  'timeline-demo': '/components/timeline',
  'pagination-demo': '/components/pagination',
  'bar-chart-demo': '/charts/bar-chart',
  'area-chart-demo': '/charts/area-chart',
  'pie-chart-demo': '/charts/donut-chart',
  'hover-card-demo': '/components/hover-card',
  'aspect-ratio-demo': '/examples/patterns/layout',
  'text-field-error-demo': '/components/text-input',
  'badge-delta-demo': '/examples/patterns/analytics-widgets',
  'number-field-demo': '/components/number-input',
  'tooltip-demo': '/components/tooltip',
  'calendar-demo': '/components/date-picker',
  'card-demo': '/components/card',
  'date-range-demo': '/components/date-range-picker',
  'drawer-demo': '/components/bottom-sheet',
  'alert-dialog-demo': '/components/dialog',
  'date-picker-demo': '/components/date-picker',
  'alert-demo': '/components/alert',
  'resizable-demo': '/examples/patterns/layout',
  'otp-field-demo': '/examples/patterns/verification',
  'breadcrumb-demo': '/components/breadcrumbs',
  'dropdown-menu-demo': '/components/dropdown',
  'toggle-group-demo': '/components/toggle-group',
  'checkbox-demo': '/components/checkbox',
  'checkbox-indeterminate-demo': '/components/checkbox',
  'text-field-demo': '/components/text-input',
  'text-field-textarea-demo': '/components/textarea',
  'button-demo': '/components/button',
  'accordion-demo': '/components/accordion',
  'tabs-demo': '/components/tabs',
  'delta-bar-demo': '/examples/patterns/analytics-widgets',
  'popover-demo': '/components/popover',
  'switch-demo': '/components/switch',
  'radio-group-demo': '/components/radio-group',
  'avatar-demo': '/components/avatar',
  'bar-list-demo': '/examples/patterns/analytics-widgets',
  'drawer-dialog': '/examples/patterns/navigation',
  'navigation-menu-demo': '/examples/patterns/navigation',
  'dialog-demo': '/components/dialog',
  'callout-demo': '/examples/patterns/analytics-widgets',
  'combobox-demo': '/components/combobox',
  'skeleton-demo': '/components/skeleton',
  'sheet-demo': '/components/bottom-sheet',
  'grid-demo': '/examples/patterns/layout',
  'flex-demo': '/examples/patterns/layout',
  'toggle-demo': '/components/toggle-group',
  'select-demo': '/components/select',
  'table-demo': '/examples/tasks',
  ...Object.fromEntries(
    [
      'carousel-demo',
      'carousel-orientation-demo',
      'carousel-size-demo',
      'carousel-spacing-demo',
      'carousel-plugin-demo',
      'carousel-api-demo',
    ].map((name) => [name, '/examples/patterns/carousel']),
  ),
}
export const REFERENCE_EXAMPLES = Object.entries(destinations)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([source, href]) => ({
    source,
    href: `/examples/registry/${source}`,
    implementation: href,
    name: source.replace(/-demo$/, '').replaceAll('-', ' '),
  }))

export const PATTERNS = [
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
