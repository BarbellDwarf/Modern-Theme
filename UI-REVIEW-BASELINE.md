# HumHub UI Baseline Review — Modern Theme 2026
**Target:** gbc-social1 test instance (HumHub 1.19.0, theme branch `humhub-1.19-compat` @ 2bce703)
**Reviewed:** 2026-10-23 · Desktop 1280px + iPhone 14 (390×844) · QA account `rook-qa`
**Purpose:** baseline for the next theme release. Fixes land via opencode runs on the theme repo, deploy → verify → repeat.

---

## Fixed during this review
| Issue | Status |
|---|---|
| Double box around posts (column card + post card) | **FIXED** `2bce703` — verified single card on dashboard |
| Comments touching with no gap | **FIXED** same commit |
| HumHub 1.19 compat (Html class, SCSS paths, ProfileImage, SiteIcon, TopMenu API, reaction index migration) | **FIXED** earlier commits |

---

## Cross-cutting issues (fix once, benefit every page)

**C1. Orange accent overload.** Orange is used for: page bg (login/404), brand text, links, "Read more", notification bell, dark-mode moon, username, buttons, input borders. Nothing reads as primary. **Decide one role per element** — links only, everything else neutral.

**C2. Contrast failures (WCAG AA).** White-on-orange links/buttons ≈3:1 (footer links, "English (US)", "Powered by HumHub", button labels); gray meta/timestamp text ≈2.8:1; orange links on white ≈3.5:1; white space-title on light banner gradient ≈2.5:1; white initials on green avatar ≈2:1; 404 "Back to dashboard" is orange-on-orange (~2:1). Systematic token pass needed.

**C3. Touch targets under 44px.** Bell/moon/search-carets/kebabs ≈24–32px; comment/reaction pills; admin tabs; row gear split-buttons; video player controls ≈16–20px. Global 44px floor with desktop relaxation (pattern already exists in the CSS — extend it).

**C4. Small text.** 13–14px body on mobile feeds/guides/activity (16px comfort floor); 11–12px timestamps/counts. Mobile body sizing landed for stream content but sidebar/widgets and admin pages still shrink.

**C5. Duplicate/redundant text.** "Email or Username" as label AND placeholder (login); space/author name repeated 3× per post (header, byline, body first line); sermon title truncated 3× in one post; "Guide:" prefix on all 4 onboarding links; "Overview" as tab + page heading (admin).

**C6. Inconsistent radii/alignment systems.** Card ~10px vs input/button ~4px; "…" kebabs at three different positions; three date formats on one screen ("Jul 5, 2026" / "7/5/26" / "Jul 30, 2026"); mixed icon weights (filled bell vs outline moon); comment footer actions scattered on one baseline.

**C7. Redundant controls.** Search = magnifier + separate caret (two targets); account = avatar + caret + duplicate username chip in admin nav; nav pattern mixes boxed pill + icon-over-label + bare icons.

---

## Per-surface findings

### Login (desktop + mobile)
1. Input border is always-on orange — reads as a focus/error state and as a second button next to the orange button. Border should be neutral until focus.
2. Label + placeholder duplicate "Email or Username" — drop the placeholder.
3. Card is top-weighted: huge dead space below, content not vertically centered; title-to-card gap ~8px.
4. Divider under "Sign In" spans edge-to-edge ignoring card padding — floating line.
5. Footer links fail contrast; globe icon misaligned with text baseline.
6. Card shadow nearly invisible on orange; radius inconsistency.
7. Two-step login (email → Continue → password) gives no hint a second step follows — mobile cost is an extra tap with no signpost.

### 404 / error page (desktop + mobile)
1. "Back to dashboard" orange-on-orange — worst contrast on the whole site; also chevron glyphs render on top of the label.
2. Inverted hierarchy: "Ooops…" helper above the "Page not found." heading; trailing-period inconsistency.
3. "Powered by HumHub" twice (either side of the language picker) — keep one.
4. Card is near-full-width for three lines of content — constrain ~560px, center vertically, pin footer.
5. No recovery affordance for logged-in users ("Back to dashboard" only appears when logged in; guests get "Back to login").

### Dashboard (desktop + mobile)
1. ✅ Double box fixed. Remaining: comment footer actions scattered ("Comment(4)" far left, smiley floating, like far right) — group them.
2. Video embed: fade-to-white bottom edge reads as a rendering bug; face cropped mid-forehead; square corners vs rounded everywhere; truncated title collides with the "sa" logo mark; unlabeled "45" (views?); player controls not ≥44px hit areas.
3. "Comment(4)" → "Comments (4)"; lone smiley needs tooltip/label.
4. Sidebar: "Getting Started" shown to active users (should dismiss once used); "…" kebabs on static cards add noise; hyphenated "impor-tant"; ~40% of each guide row is dead space.
5. Activity feed: raw nested quotes; no relative timestamps.
6. Nav: red brand text + orange links = two competing accents; filled orange bell with no badge reads as an error state; dark-mode moon low-discoverability.
7. Avatar placeholder styles conflict (silhouette in post vs initials in sidebar).

### Space page (desktop + mobile)
1. Header: banner placeholder gradient + white title = ~2.5:1; title clipped at banner right edge on mobile ("Pickleball Clu"); avatar overlaps banner into the stats row.
2. Non-member sees Join + Follow + gear simultaneously — redundant states; gear is a third mismatched button style; caret micro-target.
3. "Stream" nav pill wrapped in its own card (double-box leftover in the space layout); hamburger glyph semantically wrong for "Stream".
4. Empty-state card has ~60pt dead internal space; three-boxing (card → content column → page).
5. "1 Posts" pluralization bug; "Powered by HumHub" floats unanchored between header and content.
6. Bottom-nav active indicator clipped to a ~6pt sliver above the bar (mobile).
7. No safe-area inset: content starts at 8pt from top; tab labels sit in the home-indicator zone.

### Mail (desktop + mobile)
Not yet reviewed in depth (captured; initial render acceptable) — deep pass in next round.

### Calendar (mobile + desktop)
1. **FUNCTIONAL: the space calendar route 404s** (`/s/<space>/calendar`) even though the calendar module is enabled on all three spaces (verified in DB). Logged-in admin gets "Page not found." Either the 1.19 route changed or the module needs re-enable. **This blocks the calendar UI review entirely.**
2. 404 page polish applies here too (orange-on-orange button, dead space).

### Admin (desktop + mobile)
1. **Mobile: admin pages render the desktop layout** — sidebar eats 255px, tables can't fit, no drawer/collapse. Admin needs its own responsive treatment (the theme's mobile rules don't cover the admin module).
2. Tab bar wraps ("People" on second row) with no grouping; active-tab indicator clipped at card top.
3. "Overview" heading + tab duplicate; description filler pushes the user table below the fold.
4. Search placeholder truncates mid-word; search row cut off behind the bottom tab bar (no scroll-padding).
5. Three action buttons (Add new user / Export / caret) with inconsistent colors; Export belongs in the caret menu.
6. Desktop: "Rook QA" appears twice in the navbar; row gear detached from row content; focus ring bleeds past card edge; table row clipped at fold with no fade.

### Account settings (desktop + mobile)
Captured; looks structurally fine — deep pass next round with forms in edit state.

---

## Priority order for the next release
1. **P1 — Calendar 404** (functional regression; investigate route/module state)
2. **P1 — Contrast token pass** (C2): links, footer text, button labels, banner titles, avatars — all fail AA
3. **P1 — Admin module responsive treatment** (mobile renders desktop layout)
4. **P2 — Accent discipline** (C1/C7): one role for orange, one search control, one account chip, kebab alignment
5. **P2 — Login page** (border state, duplicate label, vertical centering, divider)
6. **P2 — 404 page** (button contrast + icon collision, hierarchy, single footer)
7. **P2 — Space header** (banner contrast + title clip, Join/Follow/gear redundancy, active-indicator clip)
8. **P3 — Video embed polish** (crop, corners, controls, labeled counts, title collision)
9. **P3 — Comment row grouping + "Comments (4)" + tooltip on reactions**
10. **P3 — Small-text and touch-target sweep** beyond the stream (widgets, admin tabs, player controls)

## Review tooling notes (for the next round)
- The automation browser reaches gbc1 directly at `http(s)://192.168.75.20` — no tunnel needed; tunnels kept dying.
- `agent-browser set device "iPhone 14"` is the only working mobile emulation (`-p ios` is a simulator profile, it does NOT set the browser viewport).
- Login has TWO forms on the page — target the form containing the field, fill+submit in a single eval; submits over http get redirected to https and lose the POST.
- QA admin on the test instance: `rook-qa` / password in the run scripts (`Tst-QA-2026!x`).
