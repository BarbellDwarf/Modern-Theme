# Pass 6: mobile mail / notifications polish + reaction coverage (2026-10-28)

## Verified this pass (real clicks)
- Spaces sheet lists Grace Baptist + Pickleball Club + "View All Spaces"; View All Spaces renders.
- Notifications row + Mark All Seen button (44×123, class mt2026-mark-all-seen).
- Profile: About/Family tabs render (Family shows Spouse/Children empty states).
- Mobile search switcher filters live ("pickle" → Pickleball Club).
- Mail: thread opens inline with reply composer; reply sent via `.reply-button` and **persisted**
  after reload ("Pass5 reply check").
- Feed "Load more" appends posts (12 → 28) with real click.
- Reactions on a **post detail page**: picker opens after scrolling the trigger into view; verified
  the trigger is below the fold at 577px high viewport (false "dead" otherwise).

## Fixed
- `getUrlParams()` in reactionPicker.js now scans both like/unlike anchors and falls back to
  `likeLinkContainer_like_<recordId>` when a content page renders the like anchor with `href="#"`.
  (`7aa53a3`)
- Pack 30 (`76e02de`): mail thread subject and recipients clamp to one line; reply composer 200 → 184px;
  notification rows get a divider and a clearer Mark All Seen button.
- Pass-6 patch (`542e452`): unread dot rule (right-column attempt) and a right-edge fade on the mail
  formatting toolbar so the clipped last icon reads as scrollable.

## Notes / not fixed
- The unread dot is inline in core markup (x≈275 in a 344px row) and takes its position from text flow;
  the CSS attempt to move it does not apply because its parent is not a flex row. A proper fix needs a
  template change; left visible as-is.
- Mail formatting toolbar still scrolls horizontally (scrollWidth 701 vs 328) — the fade now hints it.
- Send button renders active with an empty composer (core behaviour), not disabled.
- Space calendar create remains permission-gated for members.
