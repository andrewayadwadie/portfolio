# Quickstart & Validation: CV-Faithful Portfolio Redesign

How to run the site and prove each user story works. Contracts: [site-data](./contracts/site-data.contract.md) · [dom-motion](./contracts/dom-motion.contract.md).

## Prerequisites

- Python 3 (standard library only), for the two check scripts.
- A desktop browser with DevTools (Chrome or Edge recommended for the Rendering and Performance panels), plus Safari or Firefox for a cross-check.
- A touch device, or DevTools device emulation.

## Run

```bash
cd /path/to/portfolio
python3 -m http.server 8000      # then open http://localhost:8000
```

Opening `index.html` straight from disk also works, because no ES modules are used ([research R13](./research.md)).

## Automated gates (must exit 0)

```bash
python3 specs/002-cv-motion-redesign/check-cv-sync.py      # SC-001: content matches the CV in both directions
python3 specs/002-cv-motion-redesign/check-contrast.py     # SC-009: tokens + hero blob composites, both themes
```

## Scenario checks

### US1: Content matches the CV (P1)
1. Run `check-cv-sync.py`. Expect `0 failures`.
2. Visually confirm the nav reads *Summary · Experience · Skills · Education · Languages · Contact*. There's no Side Projects link and no "Core competencies" block.
3. Expect 10 skill groups, with **Payments & Monetization** 9th. English reads "Good (technical reading & writing)". The contact list includes **andrewayad.online**.
4. Click **Download CV**. Expect the PDF in `files/` to open.

### US2: Landing intro and background (P1)
1. Open a new private window and load `/`. The full intro plays (portrait wipe, name rising word by word, then headline, contact row, CTAs). With Performance recording on, all of them can be clicked by **≤1.5s** after first paint (SC-002).
2. Reload. Expect the short fade-up (≤0.5s), not the full intro.
3. In a new private window, click during the intro. Everything jumps straight to its final state.
4. Leave the landing idle. The blobs drift slowly. DevTools Rendering → *Layout Shift Regions* shows nothing.
5. Switch tabs for 5s, then come back. The blobs paused (check the `html.bg-paused` class while hidden).

### US3: Motion on every element, plus navigation (P2)
1. Scroll top to bottom. Every h2 and h3 rises word by word, every paragraph, bullet, card, chip and button fades up with a stagger, portraits wipe in, stats count up to 5+ / 10 / 2. Nothing animates a second time when you scroll back up.
2. Tab through the page. Every control shows an animated focus ring that's at least as visible as its hover state.
3. Click each nav item. The page scrolls smoothly, the heading is fully visible under the nav, the pill slides to the item, and the URL hash changes.
4. Press Back and Forward. You land on the previous and next sections with the correct pill.
5. Load `/#skills` directly. Skills is visible straight away and nothing above it is stuck hidden.
6. Load `/#nope`. The page sits at the top and the hash is cleared.
7. Scroll past the hero. The progress bar fills and back-to-top appears. Clicking it glides to the top.

### US4: Custom cursor (P2)
1. On desktop, move the mouse. The dot tracks exactly and the ring trails smoothly.
2. Hover over links, buttons and product cards. The ring grows and the dot fades. Primary CTAs lean toward the pointer by ≤6px and settle back.
3. Press and hold. The ring contracts. Hover over a paragraph and drag-select text. Selection works and the cursor is an I-beam.
4. Move the mouse out of the window. The cursor hides.
5. In touch emulation, or with reduced motion on, there's no `.cursor` element and no `html.has-cursor`.

### US5: Responsive (P2)
Check 320, 375, 768, 1024, 1440 and 1920 in **both themes**. There's no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`), no clipped text, and tap targets are ≥44px. The mobile menu animates open and closed, and its links use the same animated navigation.

### Edge cases
| Check | How | Expect |
|---|---|---|
| Reduced motion (SC-007) | DevTools Rendering → emulate `prefers-reduced-motion: reduce`, reload | all content visible on load, no intro, no cursor, still blobs, instant jumps, final stat values |
| JS disabled | DevTools → Disable JavaScript, reload | hero, summary and stats fully visible. Rendered sections empty only because they're rendered by JS (same as 001). Nothing is stuck transparent |
| Theme switch mid-reveal | toggle the theme while scrolling | circular view-transition (or colour fade), reveals not restarted |
| Long names at 320px | Innovation Agency products | "El Imam Mady Abo El Azaym University App" wraps inside its card |
| CLS (SC-008) | Lighthouse (mobile) | CLS < 0.05 |
| Smoothness (SC-005) | Performance panel with 4× CPU throttle, full-page scroll | no long frames > 50ms during scroll |
