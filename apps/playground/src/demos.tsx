import type { Component } from 'solid-js'

/**
 * One live demo per component, keyed by its public name.
 *
 * Each value is a lazy module rather than a rendered element: as one module this
 * imported every component in the library, so showing a single demo cost 231 kB
 * gzip in 29 chunks. Split, `/play?c=Button` and `/components/button` fetch one
 * demo each — and the reference pages share exactly the demo `/play` serves.
 */
export const DEMOS: Record<string, () => Promise<{ default: Component }>> = {
  Accordion: () => import('./demos/accordion'),
  AppSidebar: () => import('./demos/app-sidebar'),
  AuthCard: () => import('./demos/auth-card'),
  DetailHeader: () => import('./demos/detail-header'),
  FilterBar: () => import('./demos/filter-bar'),
  PageToolbar: () => import('./demos/page-toolbar'),
  StatGrid: () => import('./demos/stat-grid'),
  Collapsible: () => import('./demos/collapsible'),
  EmptyState: () => import('./demos/empty-state'),
  Pagination: () => import('./demos/pagination'),
  ProgressCircle: () => import('./demos/progress-circle'),
  Timeline: () => import('./demos/timeline'),
  ToggleGroup: () => import('./demos/toggle-group'),
  Alert: () => import('./demos/alert'),
  Avatar: () => import('./demos/avatar'),
  Badge: () => import('./demos/badge'),
  Breadcrumbs: () => import('./demos/breadcrumbs'),
  Button: () => import('./demos/button'),
  Checkbox: () => import('./demos/checkbox'),
  Combobox: () => import('./demos/combobox'),
  DatePicker: () => import('./demos/date-picker'),
  Dialog: () => import('./demos/dialog'),
  Divider: () => import('./demos/divider'),
  Duration: () => import('./demos/duration'),
  FileUploader: () => import('./demos/file-uploader'),
  FormControl: () => import('./demos/form-control'),
  ItemListRow: () => import('./demos/item-list-row'),
  KeyboardShortcut: () => import('./demos/keyboard-shortcut'),
  List: () => import('./demos/list'),
  Menu: () => import('./demos/menu'),
  MultiSelect: () => import('./demos/multi-select'),
  NumberInput: () => import('./demos/number-input'),
  Password: () => import('./demos/password'),
  Popover: () => import('./demos/popover'),
  Progress: () => import('./demos/progress'),
  RadioGroup: () => import('./demos/radio-group'),
  Rating: () => import('./demos/rating'),
  ScrollArea: () => import('./demos/scroll-area'),
  Select: () => import('./demos/select'),
  Skeleton: () => import('./demos/skeleton'),
  Slider: () => import('./demos/slider'),
  Spinner: () => import('./demos/spinner'),
  Switch: () => import('./demos/switch'),
  TabButtons: () => import('./demos/tab-buttons'),
  Tabs: () => import('./demos/tabs'),
  Textarea: () => import('./demos/textarea'),
  TextInput: () => import('./demos/text-input'),
  TimePicker: () => import('./demos/time-picker'),
  Tooltip: () => import('./demos/tooltip'),
  Tree: () => import('./demos/tree'),
}
