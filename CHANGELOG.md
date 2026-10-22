# Changelog

All notable changes to this project are documented in this file.

The format follows Keep a Changelog and this project uses Semantic Versioning.

## [Unreleased]

### Fixed
- HumHub 1.19: `humhub\libs\Html` was replaced with `humhub\helpers\Html` (still valid on 1.18) so the theme layout no longer fatals with `Class "humhub\libs\Html" not found`.
- HumHub 1.19: published theme paths are now relative to the assets filesystem mount, so the theme CSS health check and rebuild use the asset filesystem instead of native file calls. This stops the `Detected invalid theme.css, rebuilding` loop.
- HumHub 1.19: `compile-css.php` detects core SCSS in `protected/humhub/resources/scss` (1.19) or `static/scss` (1.18), and the parent theme in `protected/humhub/themes/HumHub` (1.19) or `themes/HumHub` (1.18).
- HumHub 1.19: emoji reactions work again. The controller resolves `recordId` targets through `RecordMap`, uses the `content_id`/`content_addon_record_id` like-table layout, and the picker reads `recordId` links. A follow-up migration rebuilds the reaction index for either table layout, including installs upgraded from 1.18.
- HumHub 1.19: the context switcher no longer calls the removed `SiteIcon` widget or logs a warning; it uses its existing glyph fallback.
- Login: long site titles wrap on a balanced scale instead of four ragged lines, short desktop viewports fit without scrolling, and the login card now uses the glass treatment the theme describes.
- Mobile: body text stays at 16px, and comment/addon pills plus bottom-nav labels meet the 44px touch target guidance.
- Navigation: removed the duplicate Dashboard entry from the top menu; the context switcher and logo still link there.
- Performance: the compiled theme stylesheet is no longer loaded twice, dead CSS rules were removed, and static panels no longer lift on hover.

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
