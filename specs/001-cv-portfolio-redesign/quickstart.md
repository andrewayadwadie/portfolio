# Quickstart: validating the portfolio redesign

**Spec**: [spec.md](./spec.md) | **Contracts**: [dom](./contracts/dom.contract.md), [site-data](./contracts/site-data.contract.md)

No install, no build, no package manager. That is the point of FR-019.

## Prerequisites

- Any evergreen browser.
- Python 3 (already on this machine) for a local server and the contrast check.

## Run it

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. Opening `index.html` directly over `file://` also works — nothing uses `fetch`.

---

## Validation scenarios

Each maps to a success criterion. Run them in order; the first three are the ones that fail most often.

### V1 — Ten-second comprehension (SC-001)

Hard-reload with the cache disabled. Before scrolling, confirm the profile photo, name, professional title, and the **full** professional summary are all visible or reachable within two screens.

**Pass**: a stranger can state Andrew's role, seniority, and primary technology from what is on screen.
**Fail**: the summary is truncated, hidden behind a "read more", or paints only after `main.js` runs.

### V2 — Theme, no flash (US5 scenario 6, FR-017a/b)

1. Toggle to light. Reload. The page must paint light on the **first frame** — record the screen and step through it if unsure.
2. Clear `localStorage`, set the OS to light, reload. Page is light.
3. Set the OS to dark, clear storage, reload. Page is dark.
4. In Safari private mode (or with storage blocked in devtools), toggle the theme. It must switch for the session and must not throw.

**Fail**: any frame of dark before light paints. That means the theme script was deferred or moved below the stylesheet.

### V3 — Contrast, both themes (SC-005)

```bash
python specs/001-cv-portfolio-redesign/check-contrast.py
```

Recomputes every token pair against WCAG 2.1. Body text ≥ 4.5:1, large text and controls ≥ 3:1, in **both** themes. Pre-verified values are tabulated in [research.md](./research.md) R1 — the script exists to catch regressions when a token changes.

**Fail**: any row below its bar. Adjust the token's lightness, never the bar.

### V4 — Product links (SC-003, SC-003a)

1. Click every rendered product link. Each opens a live listing **in a new tab**, and the portfolio stays open behind it.
2. Every product with `url: null` renders as plain text. No anchor, no `href="#"`, no disabled styling, no tooltip. View source and confirm there is no `<a>` around it.
3. Now the real test of SC-003a. Open `js/data.js`, change one `url: null` to a real URL, save, reload. The link appears, styled, with the external-link icon, `target="_blank"`, and `rel="noopener noreferrer"` — with **zero** edits to `index.html` or `style.css`.

**Fail**: step 3 requires touching markup. The renderer is wrong.

### V5 — Contact channels (SC-004, FR-011a)

On a real phone, not an emulator:

- WhatsApp opens a chat to +20 114 567 8491.
- Email opens the mail client, addressed to andrewayad60@gmail.com, subject prefilled.
- LinkedIn and GitHub open the correct profiles in new tabs.

On desktop: the WhatsApp link resolves to WhatsApp Web. The copy button places the address on the clipboard and an `aria-live` region announces the confirmation.

Then open the Network tab and submit nothing — confirm there is **no** form and no request to any third-party origin. That is FR-011a.

### V6 — Keyboard only (SC-006)

Unplug the mouse. `Tab` from the top:

1. Skip link appears first and jumps to `#main`.
2. Every nav link, button, product link, and contact channel is reachable, in DOM order.
3. Every focused element shows a visible outline against its background, in **both** themes.
4. Open the mobile nav with `Enter`, close it with `Escape`. Focus returns to the toggle. `aria-expanded` flips.

**Fail**: any focus trap, any invisible focus ring, any `outline: none` without a replacement.

### V7 — Reduced motion (SC-007)

Enable the OS reduced-motion setting (Windows: Settings → Accessibility → Visual effects → Animation effects, off). Reload.

Every section is immediately visible. Nothing fades, rises, or parallaxes. Anchor navigation jumps instead of smooth-scrolling.

### V8 — No JavaScript (FR-024)

Disable JavaScript in devtools. Reload.

The hero and summary render fully — they are static markup. No section is left invisible by a reveal animation that never ran. The page is degraded (experience, skills, and contact render from `SITE_DATA` and will be empty) but nothing is *stranded behind an animation*, which is what the requirement actually protects against. See research R7 for why this tradeoff was accepted.

### V9 — Viewport range (SC-008)

Devtools responsive mode. Sweep 320px → 2560px.

No horizontal scrollbar at any width. No clipped text. No overlapping elements. Check 320px and 375px hardest — that is where the summary and the skill chips break first.

### V10 — Content fidelity (SC-002)

Open the CV beside the rendered page. Walk it line by line:

- [ ] Professional summary, verbatim
- [ ] All core competencies
- [ ] 3 employers, correct locations, correct date ranges, reverse-chronological
- [ ] Bullet counts: Noor 5, WABC 3, Innovation 4
- [ ] All 10 products under the correct employer, each with a description
- [ ] Glowy and ClinicQ, with role, stack, and bullets
- [ ] All 9 technical skill groups, every technology inside each
- [ ] Education: degree, faculty, university, year, **graduation project**, **grade**
- [ ] Both language proficiencies

The graduation project and grade are the two most commonly dropped items. Check them explicitly.

### V11 — Performance (SC-009)

Devtools → Network → throttle to Slow 4G, disable cache, reload.

Text is readable within 2 seconds. Confirm in the request list that there is **no** Font Awesome request — icons come from the inline sprite (research R5). Scroll the full page with the FPS meter on; reveals must not drop frames.

---

## Regression checklist before commit

```text
[ ] V3 contrast script passes, both themes
[ ] No raw hex outside the :root / [data-theme] blocks:
    grep -nE '#[0-9a-fA-F]{6}' css/style.css | grep -v ':root' | grep -v 'data-theme'
[ ] No innerHTML in js/main.js:
    grep -n 'innerHTML' js/main.js
[ ] Every external anchor has rel="noopener noreferrer"
[ ] No product with url: null renders an <a>
```
