/**
 * The required-states table — the machine half of `spec/states.md`.
 *
 * Every shipped component must have a `Default` story. The states listed here
 * are the *additional* modes an app author must be able to see before using
 * the component: a state is required when the public API can enter it and it
 * changes what the user sees. Variants, themes and sizes are not states — the
 * default story already demonstrates those.
 *
 * One rule keeps the table honest: a state the `Default` story already shows
 * unambiguously does not need a duplicate (Accordion's default opens its first
 * item; an `Open` twin would be noise). Everything else is a story.
 *
 * `pnpm stories` enforces this table, so a prop cannot ship without its state.
 * Keys are registry names (`Components`, `Blocks`, `Charts`, `Editors`); the
 * names on the right are the fixed state vocabulary.
 */
export const REQUIRED_STATES: Record<string, string[]> = {
  // Actions — a disabled or busy command must still read as itself.
  Button: ['Disabled', 'Loading'],
  IconButton: ['Disabled'],
  ContextMenu: ['Open'],
  Menu: ['Open'],
  KeyboardShortcutsDialog: ['Open'],

  // Overlays — the panel is the state; a closed trigger shows nothing.
  Dialog: ['Open'],
  BottomSheet: ['Open'],
  Popover: ['Open'],
  HoverCard: ['Open'],
  Tooltip: ['Open'],
  CommandPalette: ['Open', 'Empty'],
  SettingsDialog: ['Open'],

  // Fields — every control can be disabled, and every field that accepts an
  // `error` must show what that error looks like.
  Checkbox: ['Disabled', 'Invalid'],
  Duration: ['Disabled', 'Invalid'],
  FormControl: ['Disabled', 'Invalid'],
  FormLabel: ['Disabled'],
  NumberInput: ['Disabled', 'Invalid'],
  Password: ['Disabled', 'Invalid'],
  RadioGroup: ['Disabled', 'Invalid'],
  Rating: ['Disabled', 'Invalid'],
  Slider: ['Disabled', 'Invalid'],
  Switch: ['Disabled', 'Invalid'],
  Textarea: ['Disabled', 'Invalid'],
  TextInput: ['Disabled', 'Invalid'],
  Select: ['Disabled', 'Invalid'],
  Combobox: ['Disabled', 'Invalid', 'Loading'],
  MultiSelect: ['Disabled', 'Invalid', 'Loading'],
  DatePicker: ['Disabled', 'Invalid'],
  DateRangePicker: ['Disabled', 'Invalid'],
  DateTimePicker: ['Disabled', 'Invalid'],
  TimePicker: ['Disabled', 'Invalid'],
  FileUploader: ['Disabled', 'Invalid'],
  TagInput: ['Disabled', 'Invalid'],
  PinInput: ['Disabled', 'Invalid'],
  ColorPicker: ['Disabled', 'Invalid'],
  ToggleGroup: ['Disabled'],

  // Disclosure and navigation.
  Accordion: ['Disabled'],
  Collapsible: ['Open', 'Disabled'],
  Tabs: ['Disabled'],
  TabButtons: ['Disabled'],
  Pagination: ['Disabled'],
  ItemListRow: ['Selected', 'Disabled'],
  FileCard: ['Selected', 'Disabled'],
  MessageListItem: ['Selected', 'Disabled'],
  ThreadRow: ['Selected', 'Disabled'],
  NotificationItem: ['Disabled'],
  Tree: ['Selected'],
  Sidebar: ['Collapsed'],
  AppSidebar: ['Collapsed'],
  AppShell: ['Collapsed'],

  // Editors — a read-only document is the state an app must distinguish from
  // an editable one before wiring permissions.
  CodeEditor: ['ReadOnly'],
  Editor: ['ReadOnly'],

  // Charts — loading and failure replace the plot; emptiness is the container's
  // designed surface (`ChartContainer`), not a chart's zero-data rendering.
  ChartContainer: ['Loading', 'Empty', 'Error'],
  AreaChart: ['Loading', 'Error'],
  BarChart: ['Loading', 'Error'],
  LineChart: ['Loading', 'Error'],
  ScatterChart: ['Loading', 'Error'],
  HeatmapChart: ['Loading', 'Error'],
  SankeyChart: ['Loading', 'Error'],
  FunnelChart: ['Loading', 'Error'],
  DonutChart: ['Loading', 'Error'],
  ChartBase: ['Loading', 'Error'],
  NumberCard: ['Loading', 'Error'],
}
