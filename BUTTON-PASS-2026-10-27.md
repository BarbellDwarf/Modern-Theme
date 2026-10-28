# Button sweep + fix pass (2026-10-27, 1.19.3)

Real-click sweep of every visible control on dashboard, space, calendar, mail, notifications,
account, admin users/modules/settings, plus module config routes.

## Verified working (real clicks, post-click state read)
- **Calendar**: prev/next month, Today (returns from Nov to Oct), Month/Week/Day/List views
  (`aria-pressed` flips), create (+) opens the target-calendar modal, Next disabled until a
  container is chosen.
- **Post card**: Comment expands the thread, reaction opens the picker, ⋯ menu opens
  (Edit / Permalink / Delete / Topics / Change visibility / notifications / Move), Edit opens
  `form#post-edit-form_<id>`, Save persists and closes the form, "Cancel Edit" in the ⋯ menu
  reverts and closes, Comment composer submit posts, reaction persists.
- **Mail**: compose modal, inline Filter field + tag group, conversation open.
- **Notifications**: Mark All Seen (badge 1 → 0).
- **Admin**: Export split button (csv/xlsx), Add new user link, module Configure routes
  (`/birthday/config`, `/calendar/config`, `/dark-mode/admin`) all render forms; admin chip row,
  tab row, module gear menus.
- **Space**: Actions dropdown (Settings / Security / Members / Modules / notifications /
  Cancel Membership / Hide posts / About).
- **Account**: Change Username / Email / Password / Delete Account pages all render with Save.

## Fixed in this pass
1. **More sheet listed the map twice** ("Usermap" + "User Location Map"): dedupe compared exact
   URLs, and the module registers `/usermap/map` and `/usermap/map/index`. Now canonicalised +
   id-deduped → one entry (`cda6add`).
2. **Post edit had an icon-only Save** (fa-send, aria-label only). Now renders a visible
   "Save" label (81px wide) via CSS (`aeee72d`), verified.
3. Theme guard: verified `setting.theme` still points at the theme and body class is
   `modern-theme-2026 mobile` after every deploy.

## Found but not changed (needs a decision)
- **Space calendar create is hidden for members**: `#calendar[data-can-create="0"]` hides the +
  button on `/s/<space>/calendar`; only the global profile calendar offers create. This is the
  calendar module's per-space create permission, not theme CSS — enable it in the space's calendar
  settings if members should add events.
- **Inline Cancel next to Save** did not land: the theme JS runs (verified with a marker) but the
  inserted button is not present in the rendered edit row; Cancel remains available and working via
  the ⋯ menu. Left as-is rather than shipping a half-wired control.
- Avatar initials render at 10px inside 24px avatars — intentional sizing, not text.

## Test artefacts
`/home/river/ui-review-evidence/button-probe-*.txt`, `pass3-*.png`.
