/** Port destinations for the 68 examples in the checked-out solid-ui registry. */
const destinations: Record<string, string> = {
  'progress-demo': '/atoms/progress',
  'progress-circle-demo': '/atoms/progress-circle',
  'command-demo': '/pages/patterns/command',
  'command-dialog-demo': '/pages/patterns/command',
  'badge-demo': '/atoms/badge',
  'menubar-demo': '/pages/patterns/navigation',
  'separator-demo': '/atoms/divider',
  'slider-demo': '/atoms/slider',
  'context-menu-demo': '/molecules/context-menu',
  'collapsible-demo': '/molecules/collapsible',
  'mode-toggle': '/foundations',
  'data-table-demo': '/pages/tasks',
  'toast-demo': '/molecules/toast',
  'sonner-demo': '/molecules/toast',
  'timeline-demo': '/molecules/timeline',
  'pagination-demo': '/molecules/pagination',
  'bar-chart-demo': '/organisms/bar-chart',
  'area-chart-demo': '/organisms/area-chart',
  'pie-chart-demo': '/organisms/donut-chart',
  'hover-card-demo': '/molecules/hover-card',
  'aspect-ratio-demo': '/pages/patterns/layout',
  'text-field-error-demo': '/atoms/text-input',
  'badge-delta-demo': '/pages/patterns/analytics-widgets',
  'number-field-demo': '/molecules/number-input',
  'tooltip-demo': '/atoms/tooltip',
  'calendar-demo': '/molecules/date-picker',
  'card-demo': '/molecules/card',
  'date-range-demo': '/molecules/date-range-picker',
  'drawer-demo': '/molecules/bottom-sheet',
  'alert-dialog-demo': '/molecules/dialog',
  'date-picker-demo': '/molecules/date-picker',
  'alert-demo': '/molecules/alert',
  'resizable-demo': '/pages/patterns/layout',
  'otp-field-demo': '/pages/patterns/verification',
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
  'delta-bar-demo': '/pages/patterns/analytics-widgets',
  'popover-demo': '/molecules/popover',
  'switch-demo': '/atoms/switch',
  'radio-group-demo': '/molecules/radio-group',
  'avatar-demo': '/atoms/avatar',
  'bar-list-demo': '/pages/patterns/analytics-widgets',
  'drawer-dialog': '/pages/patterns/navigation',
  'navigation-menu-demo': '/pages/patterns/navigation',
  'dialog-demo': '/molecules/dialog',
  'callout-demo': '/pages/patterns/analytics-widgets',
  'combobox-demo': '/molecules/combobox',
  'skeleton-demo': '/atoms/skeleton',
  'sheet-demo': '/molecules/bottom-sheet',
  'grid-demo': '/pages/patterns/layout',
  'flex-demo': '/pages/patterns/layout',
  'toggle-demo': '/molecules/toggle-group',
  'select-demo': '/molecules/select',
  'table-demo': '/pages/tasks',
  ...Object.fromEntries(
    [
      'carousel-demo',
      'carousel-orientation-demo',
      'carousel-size-demo',
      'carousel-spacing-demo',
      'carousel-plugin-demo',
      'carousel-api-demo',
    ].map((name) => [name, '/pages/patterns/carousel']),
  ),
}
export const REFERENCE_EXAMPLES = Object.entries(destinations)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([source, href]) => ({
    source,
    href: `/pages/registry/${source}`,
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
