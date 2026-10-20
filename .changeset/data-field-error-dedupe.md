---
'@newui/data': patch
---

`fieldError` prints a message once, even when a field declares it for both
`onChange` and `onSubmit`.

A field that validates as you type *and* on the way out usually uses the same
sentence for both. TanStack keeps one entry per validator, so the naive join
rendered it twice ("Use at least 8 characters. Use at least 8 characters.").
The bridge now de-duplicates the messages, which is what the single `error`
string the `Field` contract takes was always meant to be.
