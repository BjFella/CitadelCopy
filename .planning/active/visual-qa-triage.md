# Citadel application-readiness visual QA triage

Initial findings were observed against the deployed GitHub Pages site on
2026-08-01 before application-readiness edits. This file now records their
local release-candidate disposition; hosted verification remains post-merge.

## P0

- None. The homepage opens at scroll position zero, leaves focus on `BODY`, and has no horizontal overflow at 1280px or 390px.

## Resolved visual grade findings (2026-08-01)

- **P1 color:** the shared field, section, panel, border, supporting-copy, and
  social-preview palette now uses visibly chromatic ink, ocean, cyan, blue, and
  violet values. The final computed-style audit found no visible leaf text below
  the low-saturation threshold used for the initial diagnosis.
- **P1 reveal safety:** `.site-reveal` is visible in its base state and only uses
  a small transform for enhancement. The final matrix found zero hidden reveals.
- **P1 hover clearance:** `.generators` now exposes overflow and reserves 6px of
  top movement space. A transformed generator tile was captured at desktop and
  mobile widths without clipping.
- **P2 depth:** page, section, card, nested-control, and media planes now have
  distinct chromatic gradients, colored shadows, and inset highlights.
- **P2 screenful rhythm:** responsive section spacing was tightened and Research
  changes layout before its comparison values can force overflow. The actual
  39px Research overflow at 1024px was fixed.
- **P2 typography:** the sans/mono role split remains intact while supporting
  text, captions, controls, and measurements use brighter blue-white values.

The final pass covered the homepage, Evidence, Operation Control, Optimizer,
Research, and Walkthrough at 1440 by 900, 1024 by 768, and 390 by 844: 18 page
and viewport combinations with zero horizontal overflow and zero invisible
reveals. Both walkthrough videos reached ready state 4 at 1920 by 1080; their
durations remain 120 and 42 seconds.

## Resolved P1

- Research, Optimizer, and Evidence now publish v1, v2, and the representative
  v3 shakedown with exact result and claim boundaries.
- `evidence.html` is the evaluator index; `walkthrough.html` adds a two-minute
  narrative and a real-command verification supplement.
- All public pages now carry canonical, Open Graph, Twitter, manifest, sitemap,
  and shared social-preview metadata.
- The homepage preserves its historical 120-cell integrity strip and adds a
  separate 168-cell prospective proof card, avoiding denominator conflation.

## Resolved P2

- Three deliberately framed 1440 by 900 application images replace full-page
  captures; the comparison image contains all three studies and no next-section
  crop.
- Optimizer and Research lead with the failed result and exact boundary.
- Shared navigation exposes Evidence while the homepage still starts at `/do`.
- The hosted smoke workflow binds deployed pages to the release-manifest source
  digest and checks focus, overflow, titles, proof copy, and console errors at
  desktop and mobile widths.

## Acceptance targets

- `/do` remains the first and dominant homepage story.
- A new Evidence page gives a reviewer a two-minute path through claims, receipts, boundaries, reproduction commands, onboarding proof, and grant milestones.
- Research and Optimizer pages state both the v1 outcome and the new v2 outcome exactly as signed.
- All public pages have canonical, description, Open Graph, and Twitter metadata plus a shared social image.
- Local desktop, tablet, and 390px browser checks pass, including no horizontal overflow,
  dialog focus restore, tab arrow navigation, caption binding, and both videos
  reaching ready state 4. Hosted checks remain the post-merge gate.

---

# Sentient grant PDF legibility triage - 2026-08-01

## Summary

- 7 issues found and resolved: 2 broken, 3 ugly, 2 polish; 0 open.
- Area affected: all eight pages of the supporting PDF.
- Screenshots reviewed: 8/8 freshly rendered at 96 DPI under
  `tmp/pdfs/before/`.

## BROKEN

### [PDF-B1] Required supporting copy is too small and too low contrast

- **Screenshots:** `tmp/pdfs/before/page-1.png` through `page-8.png`
- **Expected:** body copy, evidence labels, table values, and URLs remain
  comfortably readable at normal PDF-viewer scale.
- **Actual:** 6.8-11.5 point mono and muted text disappears into the dark field;
  footnotes and evidence locators are functionally unreadable.
- **Root cause:** visual identity was prioritized over document-reading scale.
- **Status:** resolved - body and evidence text now use embedded Segoe UI at
  document-reading sizes on a warm light field with high-contrast ink.

### [PDF-B2] Page 5 nests critical evidence inside an unreadable screenshot

- **Screenshot:** `tmp/pdfs/before/page-5.png`
- **Expected:** the three negative findings can be scanned directly.
- **Actual:** a screenshot containing already-small UI copy occupies half the
  page, forcing the decisive evidence into tiny text twice over.
- **Root cause:** a website capture was used as content instead of supporting
  imagery.
- **Status:** resolved - the screenshot was removed and replaced by three
  direct, full-width evidence rows.

## UGLY

### [PDF-U1] The grid and corner circles compete with every page

- **Screenshots:** all pages
- **Expected:** decoration establishes identity and then recedes.
- **Actual:** high-frequency cyan grid lines and large clipped circles dominate
  the page and create visual fatigue.
- **Root cause:** full-canvas decoration has similar contrast to content rules.
- **Status:** resolved - the grid was removed; low-contrast corner fields and a
  restrained top rule carry the identity without touching reading copy.

### [PDF-U2] Dark cards create a monotonous wall of panels

- **Screenshots:** pages 1, 2, 4, 6, 7, and 8
- **Expected:** clear editorial hierarchy with breathing room.
- **Actual:** nearly every concept is boxed into another dark surface, reducing
  the distinction between primary and supporting information.
- **Root cause:** repeated dashboard-card language in a narrative document.
- **Status:** resolved - the packet now uses editorial whitespace and tinted
  evidence bands, reserving cards for actual grouped information.

### [PDF-U3] Page 6 compresses five milestones into narrow columns

- **Screenshot:** `tmp/pdfs/before/page-6.png`
- **Expected:** milestones and allocations can be compared without effort.
- **Actual:** narrow cards force small type and awkward wrapping.
- **Root cause:** five equal columns on a single 16:9 page.
- **Status:** resolved - milestones are five full-width comparison rows with
  larger type and right-aligned allocations.

## POLISH

### [PDF-P1] Mono typography is used for ordinary reading text

- **Observation:** labels, metrics, source lines, and status chips overuse
  Courier; the texture is technical but tiring.
- **Status:** resolved - mono typography is limited to none of the required
  prose; labels and metrics use the same embedded sans family as the document.

### [PDF-P2] Section labels, footer, and page numbers are too faint

- **Observation:** navigation and provenance should be quiet but still legible.
- **Status:** resolved - provenance and page navigation use higher-contrast
  8.7-10 point sans text and were checked at normal-viewer scale.

## Reviewed screenshots

- [x] `page-1.png` - [PDF-B1, PDF-U1, PDF-U2, PDF-P1, PDF-P2]
- [x] `page-2.png` - [PDF-B1, PDF-U1, PDF-U2]
- [x] `page-3.png` - [PDF-B1, PDF-U1]
- [x] `page-4.png` - [PDF-B1, PDF-U1, PDF-U2]
- [x] `page-5.png` - [PDF-B1, PDF-B2, PDF-U1]
- [x] `page-6.png` - [PDF-B1, PDF-U1, PDF-U2, PDF-U3]
- [x] `page-7.png` - [PDF-B1, PDF-U1, PDF-U2]
- [x] `page-8.png` - [PDF-B1, PDF-U1, PDF-U2, PDF-P2]

## Verification

- [x] Re-rendered all eight pages at 96 DPI under `tmp/pdfs/after/`.
- [x] Re-rendered representative normal-viewer captures at 72 DPI under
  `tmp/pdfs/after-72/`; required text remained readable without zoom.
- [x] Inspected all eight 96-DPI pages and pages 1, 2, 5, 6, and 8 at 72 DPI.
- [x] Confirmed 8 pages at 960 by 540 points, extractable required headings,
  zero replacement characters, and embedded TrueType rendering without the
  earlier display-font warnings.
- [x] `npm run application:package:test` passed with the new byte count and
  SHA-256.
- [x] Application claim, evidence, and site-release verification passed.
