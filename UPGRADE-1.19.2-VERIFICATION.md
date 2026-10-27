# HumHub 1.19.2 upgrade — verification report (2026-10-27)

Test instance: gbc1 (CT 102, 192.168.75.20). Snapshot `pre-humhub-1192`; DB dump and file archive in
`/root/` before the swap. Previous tree kept at `/root/hh-old-20261027-1509`.

## Upgrade mechanics (important for the next one)
- GitHub **codeload zipballs contain no `protected/vendor`**. Run
  `composer install --no-dev --prefer-dist` from the **repo root** (`/var/www/humhub`, where
  `composer.json` lives), not from `protected/`. Expected vendor size for 1.19.2 no-dev: ~37 MB.
- Stop `php8.3-fpm` and unmount the B2 uploads FUSE mount before swapping trees; rebind afterwards.
- Preserve `protected/config` and `protected/modules/*`; run `yii migrate/up --interactive=0`,
  `yii module/update-all`, theme `update.php`, then flush caches.

## 1.19 API removals found during this upgrade
- `ProfileMenu::addItem()` removed (same class of breakage as `TopMenu::addItem()`).
  Fix: `addEntry(new MenuLink([...]))` with `icon` as a glyph name (`fa-users`), not HTML.
  Applied to `family-tree/Events.php`; the Family tab renders again and the log spam stopped.
- Calendar and mail modules already used `addEntry()` and needed no change.

## Functional verification (post-upgrade)
- Post via space composer: saved correctly (`post` ids 66–67), editor resets, appears in stream.
- Comment: posted and persisted (`/comment/comment/post` 200).
- Mail: compose modal → recipient select2 → send → conversation listed.
- Reactions: picker opens, emoji applies, persists.
- Calendar: month view active (`aria-pressed=true`), Filters toggle present, create button present.
- Search: top-bar opens the space/people switcher (by design), no console errors.
- Profile: Family tab present; profile renders.
- Dark mode: `data-bs-theme=dark`, `rgb(15,23,42)` background, no light artifacts.
- Assets: zero 4xx resource loads across dashboard/space/profile/calendar/mail/directory/admin.
- App log: no new errors after the `family` fix. Only recurring entry is the SermonAudio cron
  returning **401** hourly (module API key), unrelated to the upgrade.

## Note for automated checks
HumHub's rich-text editor syncs into the hidden field on **focusout**. A scripted
`element.click()` does not blur the editor, so it submits stale text and looks like a regression.
Use real mouse clicks (agent-browser `click`) or dispatch `blur` before submitting.

## Admin mobile usability (reviewed at 390×844, fixed in packs 17–20)
Before: six-row admin menu card ~300 px tall pushed all data below the fold; tab strip showed a heavy
native scrollbar; the selected row carried an orange fill plus a blue focus ring; "Update HumHub"
sat among navigation peers; Export's chevron had no label; module intro ran ~8 lines; module rows
hyphenated words and floated actions mid-card; headings wrapped.

After (measured):
- admin menu is a **44–56 px horizontal chip row** (was ~300 px), content above the fold on every
  admin page; active chip auto-scrolls into view; right-only 40 px fade; native scrollbar hidden;
- tab strip: scrollbar hidden, right-only fade, active tab centered;
- selected rows: orange fill only, no blue ring;
- "Update HumHub" demoted to a neutral, separated chip;
- Users toolbar wraps at 390 px, Export chevron has `aria-label="Export options"`, primary action
  first;
- Users table: sticky first column, email wrapping without hyphenation, LAST column reachable;
- module page: one-line heading, intro behind an "About modules" disclosure (core warning paragraph
  stays visible), update notice stacks with a full-width action;
- post meta row keeps author/time/privacy/overflow on the intended two lines without orphaned icons.

Still open (low priority): the marketplace reports "updates available for 1 module" — do not apply
blindly, the mail module is a fork with 1.19 compatibility fixes that an update would overwrite;
SermonAudio cron 401s until its API key is set.
