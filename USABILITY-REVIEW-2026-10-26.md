# HumHub Modern Theme — Usability, UX, UI & Intuitiveness Review
**Instance:** gbc1 test, HumHub 1.19.0 + theme `humhub-1.19-compat` · **Date:** 2026-10-26
**Method:** dual-agent (A: independent design critique from 8 renders + theme source · B: deterministic detector + static a11y/style audit over 129 files) + parent empirical task battery (14 tasks driven live, instrumented, desktop 1280×577 and mobile 390×844)
**Question:** does it *feel good to use*, or clunky?

---

## Verdict

**It is competent, calm, and structurally sound — and it does not yet feel good.** The theme is obviously engineered by someone who cares: PJAX navigation keeps state, motion is consistent (150–250 ms), 44 px touch targets, aria-labels, reduced-motion blocks, a real skip link, a designed mobile bottom nav. None of that is the problem.

The problem is that **the three things a church member actually comes to do are the three things the interface hides or breaks**:

1. **Post an update** — no composer anywhere on the dashboard; you must know to open a Space, and on the test instance the Post module was disabled on every container (fixed during this review).
2. **Comment** — the comment box has **no visible submit control**; only Enter sends.
3. **Message someone** — **mail cannot be sent at all**: the rich-text body never syncs to the form field, so sending always fails with "Message cannot be blank" (reproduced 3×, including with the theme's mail JS disabled).

Add platform jargon ("Spaces", "Usermap", "Modules", "exact id"), empty states that state the absence and offer nothing, a calendar whose selected view looks disabled, and a phone experience with no top bar, and the result reads as *a good theme for a product*, not *a good site for a congregation*.

### Design health score

| # | Heuristic | Score | Key evidence |
|---|-----------|:---:|---|
| 1 | Visibility of System Status | 2 | PJAX + toasts work; calendar's active view renders as the *unfilled* button (verified: Month white/blue vs Week-Day-List solid blue); mobile hides the mail icon and its unread badge entirely |
| 2 | Match System / Real World | 2 | "Spaces · Usermap · Modules · Stream · exact id"; "1 Posts"; "You are not member of this space and there is no public content, yet!" |
| 3 | User Control and Freedom | 2 | Modals have Esc/close/focus trap; but empty states are dead ends and mobile has no persistent top-level escape |
| 4 | Consistency and Standards | 2 | Links consistently `#1e6ad6` and brand black across 5 pages (contradicting the independent review's "three accents"); real gaps: calendar active-state inversion, focus ring missing on Directory/Usermap only, "Comment(4)" |
| 5 | Error Prevention | 2 | Good: self-send blocked, invalid recipient gets a clear "No users found", required fields validated inline; weak: "Update HumHub" sits beside "Users" in the admin menu |
| 6 | Recognition Rather Than Recall | 2 | No dashboard composer; comment submit invisible; mail compose is an unlabeled `+`; mobile moves mail two taps deep into "More" |
| 7 | Flexibility and Efficiency | 2 | Dark mode, 12 palettes, admin-renamable nav; no keyboard shortcuts, no bulk actions, no saved views |
| 8 | Aesthetic and Minimalist Design | 3 | Calm card system, consistent radii/elevation, readable stream rhythm; dead whitespace on mail/profile, template text rendered as post body |
| 9 | Error Recovery | 2 | Precise inline errors ("You cannot send a message to yourself!", "Recipient cannot be blank") — but the blank-body bug is an unrecoverable loop |
| 10 | Help and Documentation | 2 | A real 4-step guided tour exists (1 of 4, Next/Previous/Close) — but it's HumHub stock docs plus an admin guide |
| **Total** | | **21/40 (53%)** | **Acceptable band — significant work before users are happy** |

*Independent reviewer A scored 16/40 (Poor). Three of A's deductions were corrected after live verification: accent drift (not reproducible — tokens are consistent), focus rings (present on 8 of 10 Tab stops), and admin links (visible only because the QA user is an admin). A's remaining findings held up.*

### Design specificity

**Authored at the plumbing layer, generic at the product layer.** Context switcher, thumb nav with renamable labels, `tel:`/`mailto:` profile links, docked mail composer, church-shaped sizing — all deliberate. But every string a member reads is stock HumHub, and nothing in the chrome says *church*: no service times, sermon series, giving, prayer, or ministry vocabulary. Strip the site title and it could be any club intranet.

---

## Priority issues

### P0 — blocks the core tasks

1. **Mail compose cannot send.** Typing into the body leaves `textarea[name="CreateMessage[message]"]` empty; clicking **Send** (or native `form.requestSubmit()`) returns "Message cannot be blank" while the editor visibly contains text. Reproduced with and without the theme's `mailLayout.js`. Likely the ported mail module's view still instantiates the 1.18 rich-text widget whose sync handler 1.19 no longer fires. *Fix: port the mail create view to the 1.19 `ui.richtext.RichText` widget contract, then retest send end-to-end.*

2. **No one could post anywhere on the test instance.** `contentcontainer_module` had no `post` rows on any of the 4 spaces (production has it on only 2 of 8). Fixed on test during this review; production needs a decision (enable on all spaces + dashboard).

### P1 — first-run and daily-use friction

3. **No composer on the dashboard.** The most common member action has no visible entry point; posts can only be created inside a space stream, after joining.
4. **Comment submit is invisible.** The comment form renders only a ProseMirror plus a hidden toolbar; sending requires Enter. A 65-year-old types, then stops.
5. **Joining a space is a form + approval.** Join opens a modal with a message textarea, submits a request, and waits for a space admin; the empty state says "You are not member of this space and there is no public content, yet!" with no Join button in the message; "Join" and "Follow" sit adjacent with no explanation; the count reads "1 Posts".
6. **Mobile loses its top level.** Below 992 px the header is `display:none` (verified): no search, no account menu, no mail icon or unread badge. Mail lives two taps deep inside "More", unbadged. The bottom nav is the right pattern; the header removal is not.
7. **Calendar's selected view looks disabled.** Month = white with blue text; Week/Day/List = solid blue (verified computed styles). No `aria-pressed`.
8. **Mail's empty state is a dead end.** "There are no messages yet." plus an unlabeled `+`; no "Start a conversation", no path from the empty inbox to the directory.
9. **Typography is tuned for 30-year-olds.** Bottom-nav labels 11–12 px, badges 9 px, metadata 12–13 px — below comfortable reading for the stated 50+ audience.
10. **Sermon posts publish template instructions as body copy** — "Grace Baptist Church - Channel name", "video - 'video' or 'sermon'", "Mark Hogan - Speaker name (line removed if empty)". The module's help text was pasted into the post template field; it is publishing to every sermon item.

### P2 — clunk and polish

11. **False "unsaved changes will be lost" confirm** on ordinary navigation after touching a composer (native browser dialog, no indication of which draft).
12. **Focus ring missing on exactly two top-nav links** (Directory, Usermap — verified with real Tab); elsewhere 2–3 px blue rings work.
13. **Admin on mobile**: heading breaks mid-word ("Overvie / w"), tab strip wraps "People" onto its own row; admin is desktop-shaped at 390 px.
14. **Icon-only actions without visible labels**: mail `+`, per-user gear, per-post ellipsis.
15. **Copy and pluralisation**: "Comment(4)", "1 Posts", "Show previous 2 comments" (14 px tall tap target), "Usermap", three date formats on one screen.
16. **Duplicate affordances**: Join + Follow + space gear; like + reaction picker; two composer entry points in different places.
17. **Profile is an empty shell** (default avatar, gray banner, two rows: first/last name) — the directory can't do its job.
18. **Measured polish**: dashboard CLS ≈ 0.108 (>0.1), 9 images without dimensions; 35 mobile controls under 40 px; 6 unguarded smooth scrolls in JS while reduced-motion is handled in CSS only.
19. **Empty states** on notifications ("No notifications found!"), calendar (no events, no explanation) and space streams don't teach the next action.

### What's genuinely good — keep it

- **PJAX**: navigation preserves state, 631 ms DCL on LAN, no white flash. This is why it doesn't feel like a 2009 forum.
- **Motion**: 150 ms inputs / 250 ms buttons and cards, consistent; reduced-motion kill switch present.
- **Accessibility engineering**: 0 icon buttons without labels, 0 images without alt, 0 unlabeled inputs, skip link works (visible blue button when focused), modals trap focus and close on Esc.
- **Mobile bottom nav**: five thumb-height targets with `aria-current`, safe-area insets, body padding — the one place the phone was designed, not shrunk.
- **Validation copy**: precise, human, inline ("You cannot send a message to yourself!").

---

## Personas

**Jordan (first-timer):** lands on a post full of template text; no composer; the only onboarding is HumHub docs; "Usermap" is a non-word. Concludes the site is for staff.

**Casey (phone, one-handed):** no search, account or mail in the header; mail two taps deep and unbadged; 11 px labels; "Show previous 2 comments" is a 150×14 target; comment send has no button.

**Grace (65, low confidence):** every label is platform language; "Update HumHub" is one tap from "Users"; typos and raw field labels read as error messages; empty inbox shows a small `+` and no sentence.

**Sam (keyboard/screen reader):** skip link and focus traps are real; but Directory/Usermap have no focus ring, the calendar view state isn't announced, and long empty regions produce silent tab runs.

---

## Recommended plan (in order)

1. **Harden the broken flows** — mail body sync (P0), visible comment submit, dashboard composer, post module everywhere.
2. **Onboard the first-run** — replace "Getting Started" with four church tasks (post an update, join a group, find a member, add the calendar), and put a composer at the top of the dashboard.
3. **Adapt for the phone** — restore a compact header (search + account + mail with badge) or badge "More"; raise nav labels to 13 px, metadata to 14 px; fix admin stacking.
4. **Clarify the language** — "Groups", "Members", "Member map", "Notifications"; fix plurals and empty-state copy with CTAs.
5. **Polish the states** — calendar pressed states, focus rings, mail empty state, profile schema, date/plural consistency.
6. **Re-run this review** after the fixes; target 30+/40.

Evidence: `/home/river/ui-review-evidence/` (u01–u33 task captures, L/K/I sets, m01–m08 mobile), full transcript of the task battery in this session. Report committed to the theme repo as `docs/UI-REVIEW-USABILITY-2026-10-26.md`.

### Test data left behind
`rook-qa` joined Pickleball Club; one QA post ("QA usability test post - please ignore"), one QA comment, one reaction; post module enabled on all four test spaces. No mail was sent (blocked by the P0).
