# Comment reactions + reply threads (2026-10-28)

## 1. "I reacted to a comment and it never showed up"
Three causes, all in the theme:
1. `_stream-comments.scss` set `font-size: 0` on `.comment-container .mt2026-reaction-trigger`
   (twice), collapsing the control; replies rendered it at 0×0.
2. `reactionPicker.js` only updated an existing `.mt2026-summary-link`, and that element was created
   for post footers only — comments had no place to show the emoji/count.
3. `setTrigger()` only toggled a class; the trigger kept the generic smiley, so even a successful
   POST looked like nothing happened.

Fixed: 32px trigger with a 14px icon, `ensureSummaryLink()` creates the summary for comments,
and the reacted trigger renders the chosen emoji plus a 12px count. Verified: choosing ❤️ on a
comment → `POST /reactions/react` 200 → trigger shows ❤️, summary "❤️ 1 😂 1", survives reload.

## 2. Replies looked terrible / pushed over
Root cause of the layout AND the missing replies: the theme hid every reply toggle
(`display:none !important` on `a[data-action-click="comment.toggleComment"]`) and
`mobileCommentCompose.js` added `d-none` to them. HumHub then never revealed
`.nested-comments-root .comment-container` (still `d-none`), so "Comments(3)" showed one comment while
the two replies sat in hidden containers.

Fixed:
- Toggle restored and relabelled **"View 2 replies" ⇄ "Hide 2 replies"** with a chevron; HumHub's own
  handler still does the reveal; the label flips state-aware and the opened thread scrolls into view.
- Replies now sit on a **16px indent with a 2px left rail**, no nested cards/tints/shadows.
  Measured at 390px: nested container x=74 w=266 (2px solid rail); replies x=88 w=252;
  reply/parent text-width ratio 0.89–0.92 (was 0.77–0.84).
- Reply rows use a 24px avatar, 12.5px name, 13px body, and the same 32px reaction control + count
  as the parent.
- Inline reply composer is styled and its submit is a 32px control; opening a thread scrolls it into
  view so it is no longer clipped by the bottom bar.

## Mainstream reference used
X/Twitter: flat replies with one avatar-column indent and a thin connector line. Threads/Instagram:
one indent level, hairline rail, replies collapsed behind "View N replies". Reddit: rails + collapse,
never nested cards. YouTube: flat with "View N replies". The implementation follows the shared rules —
one visual level, rail instead of cards, wide text column, identical reaction control at every level.
