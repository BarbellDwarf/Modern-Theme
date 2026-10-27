# Changelog

All notable changes to this project are documented in this file.

The format follows Keep a Changelog and this project uses Semantic Versioning.

## [Unreleased]

### Added
- `Mobile header title` theme setting. When set, the phone header shows it instead of the full site name, at 15px on one line with an ellipsis. Empty falls back to the site name.

### Changed
- Phone space and profile headers collapse into one grid card: 56px avatar, title and subtitle beside it, join/follow and gear on the title row, stats 4px below on the title's left edge. Card padding is 12px and the card measures about 100px at 390px; the banner wrapper, scrim and reserved cover height are gone.
- Bottom navigation: every inactive item is `--color-text-muted`, and only the active item takes the brand colour on its icon, label and top indicator. Dark mode drops the filled pill behind the active item.
- Dashboard composer: the Write pill is now a filled primary button (white on `--color-primary-strong`) instead of orange on peach, and its prompt shortens to "Share something…" below 768px.
- Phone stream timestamps and meta are 13px, including inside the stream header where core's 11px used to win. Calendar view buttons are 12px with their 44px targets intact.
- A subtitle that only repeats the title is hidden. A stream post authored by its own space no longer prints the space name twice in the byline.
- Comment pills read "Comments (4)" and "Comment" below two. The mobile pill is inline-block with `nowrap`, so the count cannot drop to a second line, and the count keeps a plain space. Post timestamps keep relative text but use one fixed `Jul 5, 2026, 4:32 PM` format in the tooltip and accessible label, and dates never wrap mid-phrase.
- Non-members see Join only. Follow stays for members, where it belongs; the explanatory hint under the controls is gone.
- Calendar months with no events show a quiet muted line above the grid, with no tinted alert box and no dismiss button.
- Notification overview with nothing in it shows the centred "You're all caught up." state and hides the panel heading and filter sidebar.
- Embedded media inherits the card radius and clips provider corners.
- Dashboard composer is now a link, not a form. It points at the chosen space's stream with `?compose=1`, and `composerFocus.js` scrolls to HumHub's own composer and focuses ProseMirror (the flag is dropped from the URL afterwards). The embedded copy of the wall form lost 3 of 5 submits and once reposted a restored draft; the space stream composer does not.
- Admin on phones: panel headings and their action buttons stack (actions get their own 44px row), sub-menu tabs scroll in a single row with snap points, and panel tables scroll sideways instead of wrapping cell text.
- Admin on phones, round 3: the chip row and tab strip fade only on the right (30px) and drop the fade at the end; the active chip and tab recenter on load and on width change. Page headings are 18px/1.3 with balanced wrapping. The module overview intro clamps to three lines behind a More/Less button while the data-loss warning stays visible. Module rows stack description then actions, with hyphenation off and 40px targets. The Users search placeholder shortens to "Search users…" below 768px.
- Admin on phones, round 4: the module overview intro is a native `About modules` disclosure, closed to a single 44px row while the data-loss warning stays visible; the text no longer hyphenates or cuts a word. Module update notices put the copy above a full-width 44px button. `Module administration` and `User administration` stay on one line at 18px with -0.01em tracking. The chip row and tab strip fade 40px and snap. The Users table pins the avatar and name columns, keeps long email addresses readable at 12.5px, and scrolls all the way to the actions column.
- Post meta (dashboard and spaces) is one nowrap row at every width: author, time and the privacy icon share a line, long names ellipsize, and the overflow menu keeps its own pinned space.
- Top navigation keeps a visible focus ring on every link. `Directory` and `Usermap` were losing it to core `:focus { outline: none }` specificity.
- Post author avatars, the profile photo and the composer avatar have explicit boxes (`aspect-ratio`, fixed dimensions) to cut layout shift.
- Phone stream posts show their full text by default. Content only clamps past 600px, with a 44px `Read more` / `Show less` button and a fade that ends above it. Tapping the post body no longer expands anything.
- Phone top bar is now brand, search and avatar. The notification bell is hidden below 992px and the bottom nav badge carries the unread count. Mail and appearance stay reachable from the avatar menu, and search plus avatar are 44x44.

### Fixed
- Phone space and profile headers: the 40px dead band under the identity row came from Bootstrap 3 clearfix pseudo-elements, which `display: contents` promoted to grid rows. The header now also zeroes its own `min-height`, padding and border so no cover-image rule can reserve space again.
- The unsaved-changes prompt no longer fires after touching a search or filter field. `unsavedGuard.js` disarms core's acknowledged forms unless they hold an editor with text or a file, so only a real draft prompts on leave.
- HumHub 1.19: `humhub\libs\Html` was replaced with `humhub\helpers\Html` (still valid on 1.18) so the theme layout no longer fatals with `Class "humhub\libs\Html" not found`.
- HumHub 1.19: published theme paths are now relative to the assets filesystem mount, so the theme CSS health check and rebuild use the asset filesystem instead of native file calls. This stops the `Detected invalid theme.css, rebuilding` loop.
- HumHub 1.19: `compile-css.php` detects core SCSS in `protected/humhub/resources/scss` (1.19) or `static/scss` (1.18), and the parent theme in `protected/humhub/themes/HumHub` (1.19) or `themes/HumHub` (1.18).
- HumHub 1.19: emoji reactions work again. The controller resolves `recordId` targets through `RecordMap`, uses the `content_id`/`content_addon_record_id` like-table layout, and the picker reads `recordId` links.
- Upgrade safety: a migration restores the core `unique-object-user`/`idx_unique_user` index names that an earlier reaction migration had renamed. HumHub 1.19's like migration drops `unique-object-user` unconditionally, so the old name would have aborted the 1.19 upgrade.
- HumHub 1.19: the context switcher no longer calls the removed `SiteIcon` widget or logs a warning; it uses its existing glyph fallback.
- Login: long site titles wrap on a balanced scale instead of four ragged lines, short desktop viewports fit without scrolling, and the login card now uses the glass treatment the theme describes.
- Mobile: body text stays at 16px, and comment/addon pills plus bottom-nav labels meet the 44px touch target guidance.
- Readability: muted text now clears AA contrast on every light and dark surface it uses.
- Navigation: removed the duplicate Dashboard entry from the top menu; the context switcher and logo still link there.
- Performance: the compiled theme stylesheet is no longer loaded twice, dead CSS rules were removed, and static panels no longer lift on hover.

### Removed
- `resources/js/dashboardComposer.js` and the SCSS for the embedded composer body: the form they expanded no longer exists.
- Deleted the stale pre-1.19 compiled stylesheet `themes/ModernTheme2026/dist/theme.css`. Nothing loads it (the theme layout serves the published `resources/css/theme.css`), and it still referenced a `select_arrow.png` that the shipped theme does not contain. `compile-css.php` keeps writing a fresh `dist/theme.css` for standalone builds.

## [1.1.1] - 2026-07-30

### Added
- One-command update: `php yii modern-theme-2026/update` rebuilds CSS, flushes cache, and republishes assets.

### Fixed
- Reaction summary link visibility: removed `!important` on `display` so JS `.show()`/`.hide()` can control visibility.

### Removed
- All references to the removed Clean Theme module from comments and documentation.

## [1.1.0] - 2026-07-29

### Added
- Stronger comment card backgrounds for better visual separation in light and dark modes.
- Reply functionality removed to simplify UI and fix reply/post-as-comment bug.

### Fixed
- Emoji chooser picker position in comment controls (left-aligned).
- Comment reply button hiding now works across all themes via JS + high-specificity CSS.

## [1.0.6] - 2026-05-16

### Fixed
- iOS stream comment composer parsing issue caused by duplicate `&.show-on-mobile` SCSS blocks.

### Changed
- `install.sh` now supports CSS compile modes: auto (default), force (`--compile-css`), and skip (`--skip-compile-css`).
- Installer auto-compiles CSS only when SCSS files are newer than `themes/ModernTheme2026/dist/theme.css`.
- Updated installation and update documentation to use explicit compile + cache/assets refresh workflow.

## [1.0.5] - 2026-05-15

### Fixed
- Continued investigation and stabilization of mobile keyboard behavior on Android devices.
- Mobile mail fullscreen composer positioning and viewport handling.

## [1.0.4] - 2026-05-12

### Fixed
- Mobile stream comment reliability by scoping hidden mobile composer behavior to top-level stream composer forms only.
- Reaction picker initialization order so native like/unlike links remain available as fallback if custom picker setup is interrupted.

### Changed
- AI lifecycle instructions now require release branch version alignment across `module.json`, `package.json`, and `CHANGELOG.md`.

## [1.0.3] - 2026-05-12

### Fixed
- Mobile comment composer regression where tapping `Send` could fail after composer focus/visibility changes.
- Mobile comment trigger handling to avoid overriding nested reply actions.

### Changed
- Improved mobile comment composer focus behavior when tapping `Comment`.

## [1.0.2] - 2026-05-07

### Added
- Development branch initialized for Stream UI and Messages UI issue fixes.

### Changed
- Space Stream desktop layout fixes: keep Upcoming Events in the right sidebar and correct three-column width allocation so the right rail does not wrap below the stream.
- Calendar event modal fixes: normalize checkbox/toggle field layout to prevent stretched controls and simplify the dark-mode form chrome.
- Context switcher recent list fixes: dedupe repeated entries per context/space and auto-remove stale items not visited for a few days.
- Messages conversation picker dark-mode fix: sidebar styling now follows the in-app light/dark toggle instead of OS color-scheme preference.
- Messages sidebar state fix: unselected conversation cards no longer stay dark when viewing the picker in light mode.
- Messages sidebar active-card fix: Bootstrap list-group active state is now explicitly overridden so selected conversation cards keep light-mode colors.
- Pending targeted layout and interaction improvements for Messages UI.

## [1.0.1] - 2026-05-07

### Added
- Theme customization panel with preset palettes and configurable color tokens.
- Mobile navigation enhancements and context-switcher refinements.
- Mail interaction enhancements in `resources/js/mailLayout.js`, including desktop Enter-to-send and Ctrl/Cmd+Enter newline behavior.

### Changed
- Mail conversation layout improvements across desktop and mobile:
  - own messages align right, other users align left
  - improved bubble spacing and timestamp placement
  - edit button placement refined to remain adjacent to its message
  - fixed z-index clipping issues with compose overlay and message interactions
  - refined spacing between messages and improved layout constraints
  - conversation auto-scroll behavior improved after updates and sends
- Additional mobile UX and dropdown handling refinements.

### Removed
- Entire `tests/` folder containing outdated Playwright debug and MCP server testing scripts (local development only, not part of release).
- Obsolete local infra files no longer required in this branch:
  - `docker-compose.yml`
  - `caddy/Caddyfile`
