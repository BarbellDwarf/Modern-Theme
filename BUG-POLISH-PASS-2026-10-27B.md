# Bug & polish pass — 2026-10-27 (1.19.3, theme ffe59fc→72b98e1)

## Bugs found and fixed
1. **Test baseUrl was `https://social.graebaptistvan.net`** — misspelled host, wrong TLD, and pointing
   at production instead of the test instance, so every generated absolute link (emails, notifications)
   went nowhere. Set to `https://192.168.75.20`.
2. **Post action row undersized**: Like/Unlike 11px/15px tall, like count 11px, "Back to stream"
   10.5px. Now 12px text with ≥36–40px targets; pills measure 100×40.
3. **Space filter chip 70×19px** — now 90×36 with a 12.5px label and 8px separation from the composer.
4. **Settings tab strips** wrapped (Change Password/Delete Account on a second row) or clipped
   ("Notific…"). Now nowrap, horizontal scroll, hidden scrollbar, right fade, 44px targets.
5. **Calendar "Choose target calendar"** had Next enabled with nothing selected and an unboxed
   select; Next is disabled until a choice is made, controls are boxed.
6. **Sub-12px text** across timestamps, badges, Configure buttons and module version strings — 12px
   floor applied; the tiny-text scan now returns zero (only `.visually-hidden` remains).
7. **Theme silently fell back to the core theme** during an earlier pack: a malformed selector
   (`href$=/user/...` unquoted) made the SCSS build fail with "Expected identifier", HumHub logged it
   and served core. The theme was restored by resetting `setting.theme`; the selector is fixed and
   the build has been clean since (22:xx). This looks exactly like "all theme fixes disappeared",
   so after any theme change verify `document.body.className` contains `modern-theme-2026`.

## Verified
- 18 page/viewport combinations (12 routes at 390×844, 6 at 1280×577): no console errors, no
  horizontal overflow, no 4xx assets.
- Post created end-to-end through the real UI (`post` id 70), comment posted, mail sent, notifications
  mark-all works, calendar create modal opens, account/admin settings forms render with Save.
- Server log: only the recurring SermonAudio 401 (module API key), no application errors.

## Notes / known
- Scripted `element.click()` does not blur the rich-text editor, so automated submits can post the
  previous draft (observed once, id 69 "test"). Real mouse clicks sync correctly (id 70). Use real
  clicks or dispatch blur in automation.
- Dashboard composer's "Write" opens the space composer (`/s/<space>/?compose=1`) — by design.
- Two accents coexist: orange for navigation/brand, blue for primary buttons. Intentional for now.
- Marketplace: Updater 2.4.2 → 2.4.3 pending; do not batch-update mail (forked with 1.19 fixes).
