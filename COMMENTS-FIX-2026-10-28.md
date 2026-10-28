# Comments fix — raw placeholder markup (2026-10-28)

## Symptom (user screenshot)
Two comments on a post rendered the editor's own placeholder markup as escaped text:
`<p><div class="placeholder atwho-placeholder ProseMirror-widget" ...>Write a new comment...</div>...`
plus a nested reply showing the same. Visually useless, huge, and it wrapped behind the bottom nav.

## Root cause
`commentSubmit.js` decided "has content" from `$.trim($editor.text())`. An empty ProseMirror editor
still contains the placeholder widget whose text is "Write a new comment...", so:
1. the submit button enabled on an empty editor, and
2. the fallback serialisation copied `editor.innerHTML`, placeholder widget included, into
   `Comment[message]`. HumHub escaped it, so it displayed as literal HTML.

## Fix (`930bba8`)
- `cleanText()` clones the editor, removes `.ProseMirror-widget`, `.atwho-placeholder`,
  `img.ProseMirror-separator`, `br.ProseMirror-trailingBreak`, then trims.
- `hasContent()` uses `cleanText()`; empty comments keep the button disabled.
- Every serialised value is run through `stripWidgetsFromHtml()`.
- Placeholder-only editors clear the hidden field instead of submitting.

## Cleanup
Two polluted rows (comment ids 29, 30, parent + child) deleted in FK-safe order; zero rows matching
`%ProseMirror%` remain, and their `content` rows were removed.

## Layout polish (`80fc65f`)
- Comment reaction trigger had `margin-left: -14px` (2 rules) — sat left of the text column. Now 0:
  measured text x=130, reaction x=130.
- The online-status dot is positioned against the 44px tap target while comment avatars render at
  25px, so it floated beside the image. Hidden in comments only; presence stays on the top-bar avatar.

## Verified
Empty editor → submit disabled; typed comment → enabled; submitted "Placeholder fix check" stored
clean (`SELECT` shows plain text, no HTML); comment list renders text only; reaction icons aligned;
no stray dot; comment editor clears the bottom nav at max scroll (content bottom 780 vs nav 725...).
