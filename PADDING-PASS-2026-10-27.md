# Padding pass + 1.19.3 (2026-10-27)

## Post text inset (user-reported)
Mobile card text sat 8px inside the card while desktop used 32px. Pack 21 sets a 16px content
inset on mobile for post header, body, action row, composer, comments, notification/mail/admin
rows. Measured after: card x=12, header/body/text/actions all x=29 (17px incl. border), action pill
aligned with body text. Desktop unchanged (card 77, body 109 = 32px).

## Audit
Automated scan on 8 pages at 390px: any text leaf <12px from its card edge = violation.
Result: 0 violations on dashboard, space, profile, notifications, mail, admin/users,
admin/modules, calendar. Admin table cells 16px padding; table remains horizontally scrollable by
design (620px table in 366px container) with a right fade and sticky first column.

## 1.19.3
Installed over 1.19.2 (snapshot `pre-humhub-1193`, DB dump 3.2 MB). Zipball again ships no
`protected/vendor` — composer install from repo root. Migrations up to date, theme rebuilt.
Verified on 1.19.3: post created, comment posted, mail sent, admin pages render, zero console
errors, zero 4xx assets.
