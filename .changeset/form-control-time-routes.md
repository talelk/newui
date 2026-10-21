---
"@newui/molecules": minor
---

FormControl routes `type="time"` to `TimePicker` and `type="datetime-local"` to
`DateTimePicker` instead of native inputs. `datetime-local` leaves the
`FormControlTextType` union, so its props move from the native `value`/`onInput`
contract to the picker's `value: string | null` + `onValueChange`. Add the two
new rows to the form spec's routed-types table.
