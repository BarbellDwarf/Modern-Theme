# Pass: reactions bug + desktop polish (2026-10-28)

## Bug fixed
**Reaction endpoint 400.** `ReactionsController::resolveTarget()` read `recordId` from the query
string; `reactionPicker.js` posts it in the body (`recordId=95&contentModel=&contentId=`), so 1.19
fell into the legacy branch and threw `Model & ID parameter required!`. Now reads
`get('recordId') ?: post('recordId')` (`a61e716`). Verified: picker opens, choosing an emoji →
HTTP 200 `{"currentUserReaction":"love","reactionCounts":{"love":1}}`, trigger updates
(`data-active`), persists after reload, same emoji toggles off, and the reaction list modal
(`/modern-theme-2026/reactions/list?recordId=…`) lists "Rook QA 👍".

## Polish fixed (pack 29 `d0d4e37`)
- Desktop post action row sat 14px deeper than the body (x=123..764 vs body 109..778). Now matches
  exactly at both widths (desktop 109..778, mobile 29..361).
- Card/sidebar copy no longer hyphenates ("impor-tant" gone); `hyphens: none`.
- Composer row vertically centred; meta icon cluster gap normalised.

## Verified this pass
Reaction picker/list/toggle/persistence; dark-mode switch (dark → persists across reload → restored
to System); notification dropdown (renders latest notification + "Show all"); Topics modal
("Manage Topics"); Move content modal (separate "Move content" dialog); space Actions menu routes
(/space/manage, /settings variants valid — a guessed /settings URL 404s as expected); 18 route/
viewport metrics: zero console errors, zero overflow; app log clean since 17:48 apart from the
pre-existing SermonAudio 401.

## Not reproduced (earlier vision flags)
Admin module Configure buttons are right-aligned in their column and there is no large gap under
"Active Modules" — measured and re-screenshotted.
