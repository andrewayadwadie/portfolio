# Phase 0 Research: CV-Driven Portfolio Redesign

**Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md)

All Technical Context unknowns are resolved below. No NEEDS CLARIFICATION remains.

---

## R1. Palette derivation from the profile photograph

**Decision**: Sample `images/profile.jpg` by quantization, then derive two tokenized themes from the sampled hues rather than using the raw pixel values as UI colors.

Measured dominant colors (8-color quantization, 160×240 resample):

| Sampled | Share | HSL | Role in the photo |
|---|---|---|---|
| `#121d1d` | 95.2% | `180 23% 9%` | Background / ambient dark |
| `#2b4837` | 1.2% | `145 25% 23%` | Shirt, mid-shadow |
| `#375445` | 1.0% | `149 21% 27%` | Shirt, lit side |
| `#956d4f` | 0.7% | `26 31% 45%` | Wood chair, lit |
| `#b28c67` | 0.4% | `30 33% 55%` | Wood chair, highlight |

Two hue families fall out cleanly: a green axis at **145–150°** and a wood axis at **26–30°**. The near-black is a *desaturated teal* (180°), not a neutral grey — this is what gives the image its character, and neutral greys would flatten it.

**Rationale**: The raw shirt greens (`#2b4837`, contrast 1.84:1 on the dark background) are unusable as text or accents — they are surface and border colors. Interactive accents must be *derived*: same hue, lifted lightness and chroma until they clear the contrast bar. This is exactly what FR-016 and FR-017 together require.

**Verified token values** (contrast computed against each theme's background and surface, WCAG 2.1 relative luminance):

Dark theme — bg `#0d1514`, surface `#121d1d`:

| Token | Value | vs bg | vs surface | Bar |
|---|---|---|---|---|
| `--text` | `#e6ede9` | 15.56:1 | 14.48:1 | 4.5 ✅ |
| `--text-muted` | `#9db0a8` | 8.12:1 | 7.55:1 | 4.5 ✅ |
| `--accent` (emerald) | `#4ade9b` | 10.77:1 | 10.02:1 | 3.0 ✅ |
| `--accent-warm` (wood) | `#c99b70` | 7.41:1 | 6.89:1 | 3.0 ✅ |
| `--border` | `#2b4837` | 1.84:1 | 1.71:1 | n/a — non-text |

Light theme — bg `#f7f5f1` (warm off-white, borrowed from the wood highlight), surface `#ffffff`:

| Token | Value | vs bg | vs surface | Bar |
|---|---|---|---|---|
| `--text` | `#111d1a` | 15.88:1 | 17.29:1 | 4.5 ✅ |
| `--text-muted` | `#4a5a53` | 6.70:1 | 7.30:1 | 4.5 ✅ |
| `--accent` (emerald) | `#0f6b45` | 6.01:1 | 6.54:1 | 3.0 ✅ |
| `--accent-warm` (wood) | `#7a5334` | 6.19:1 | 6.74:1 | 3.0 ✅ |

The light theme is the same two hues at inverted lightness, per the spec's Assumptions — not a different palette.

**Alternatives considered**: Using the raw sampled colors directly (fails contrast); a generated tonal palette from a single seed hue (loses the wood/green duality that makes the photo distinctive); a neutral grey scale with one green accent (generic, indistinguishable from every other dev portfolio).

---

## R2. Design system architecture with no build step

**Decision**: One layered stylesheet, `css/style.css`, authored in four commented layers — tokens, base/reset, primitives, sections — consumed through CSS custom properties. No `@import`, no preprocessor, no bundler.

**Rationale**: FR-019 forbids a build step. Splitting into multiple `<link>` tags costs a request per file on the critical path; `@import` serializes fetches and is strictly worse. A single file keeps one render-blocking request, and the layer comments give the same navigability a multi-file structure would. Native CSS nesting and `@layer` are safe in evergreen browsers (the spec's stated target) and let the cascade be declared explicitly rather than fought with specificity.

Token families, all defined on `:root` and overridden under `[data-theme="light"]`:

- **color** — `--bg`, `--surface`, `--surface-raised`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-warm`, `--accent-contrast`
- **type** — a fluid scale via `clamp()`: `--step--1` through `--step-5`
- **space** — a 4px-based scale, `--space-1` … `--space-16`
- **elevation** — `--shadow-1` … `--shadow-3`, tinted with the green hue rather than pure black
- **motion** — `--dur-fast`, `--dur-base`, `--ease-out`

**Alternatives considered**: Tailwind (rejected in clarification — needs a build); Open Props via CDN (adds a render-blocking request and ~30KB for tokens we can write in 60 lines); Sass (build step).

---

## R3. Section reveal animation that degrades safely

**Decision**: `IntersectionObserver` with `{ threshold: 0.15, rootMargin: '0px 0px -10% 0px' }`, unobserving each element after its first intersection. Reveal styles are gated behind a class that JavaScript adds to `<html>` on boot.

```css
.js-reveal [data-reveal] { opacity: 0; transform: translateY(1.5rem); }
[data-reveal].is-visible { opacity: 1; transform: none; }
```

**Rationale**: This is what satisfies FR-024 and the "JS disabled" edge case at once. Without JS, `.js-reveal` is never added, the initial-hidden rule never matches, and every section renders visible — no section can be stranded invisible by a script that failed to load. Unobserving after first intersection satisfies FR-020's "MUST NOT re-animate".

Under `@media (prefers-reduced-motion: reduce)`, the observer still runs (it is cheap and harmless) but transition durations collapse to `0.01ms` and transforms are neutralized, so content appears instantly. Setting duration to near-zero rather than `none` keeps `transitionend` listeners firing if any are ever added.

**Alternatives considered**: Scroll-event listeners with `getBoundingClientRect` (forces layout on every frame, jank on low-end Android — the exact thing Andrew's CV says he fixes); the Web Animations API with `ScrollTimeline` (not yet safe across all evergreen targets); a library like AOS (a dependency, forbidden by FR-019).

---

## R4. Theme persistence without a flash of the wrong theme

**Decision**: A small, *synchronous, inline* `<script>` in `<head>`, before the stylesheet link, that resolves the theme and stamps `data-theme` on `document.documentElement` before first paint.

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('theme');
      if (t !== 'light' && t !== 'dark') {
        t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
      document.documentElement.dataset.theme = t;
    } catch (e) {
      document.documentElement.dataset.theme = 'dark';
    }
  })();
</script>
```

**Rationale**: FR-017b requires the OS preference to seed the first visit; the User Story 5 acceptance scenario forbids a flash of dark before light paints. Any deferred or external script paints the default theme first. This must be inline and blocking — it is the one place where a blocking script is correct.

The `try/catch` covers the spec's storage-blocked edge case: Safari private mode throws on `localStorage` access. On throw we fall back to dark, and the toggle still switches for the session.

**Alternatives considered**: CSS-only via `prefers-color-scheme` (cannot honor an explicit user override); `<script defer>` in head (paints wrong theme first); cookies (no server to read them).

---

## R5. Icon strategy

**Decision**: Drop the Font Awesome CDN. Inline an SVG `<symbol>` sprite at the top of `<body>`, reference icons with `<svg><use href="#icon-github"></use></svg>`.

**Rationale**: The current page pulls ~75KB of render-blocking CSS plus a webfont from `cdnjs.cloudflare.com` to draw roughly eight icons. That is the single largest lever on SC-009 (readable within 2 seconds on mobile). An inline sprite of eight icons costs under 2KB, needs zero requests, inherits `currentColor` so it themes for free, and removes a third-party origin from the critical path.

Icons needed: `github`, `linkedin`, `mail`, `whatsapp`, `sun`, `moon`, `menu`, `close`, `external-link`, `copy`, `check`, `download`. Twelve, all available under permissive licenses from Simple Icons (brands) and Lucide (UI).

**Alternatives considered**: Keeping Font Awesome (render-blocking third-party request for eight glyphs); an icon font subset (still a font load, worse a11y); individual `<img src="*.svg">` (a request each, cannot inherit `currentColor`).

---

## R6. Typography and font loading

**Decision**: Keep the two-family pairing but reduce it to one variable font where possible. Retain Google Fonts with `preconnect` + `display=swap`, requesting only the weights actually used.

**Rationale**: The current request asks for six weights across Inter and Poppins. The redesign needs four: body 400/500, headings 600/700. Halving the weight count roughly halves font bytes. `display=swap` guarantees text is readable during font load, which protects SC-009 directly — the page becomes readable before the font arrives.

**Alternatives considered**: Self-hosting the woff2 files (fastest — removes a third-party origin — but adds binary assets to the repo and requires manual subsetting; a reasonable follow-up, deliberately deferred); system font stack only (loses the typographic identity the redesign is meant to create).

---

## R7. Content as data, not markup

**Decision**: All CV content lives in `js/data.js` as a single frozen `SITE_DATA` object. `js/main.js` renders sections from it into the DOM on load. `index.html` holds section shells, the nav, and the SVG sprite.

**Rationale**: FR-006a demands that adding a product URL touches exactly one file and zero markup (SC-003a). Hand-written markup for three employers × ten products cannot satisfy that. A data object also makes FR-001 (total CV fidelity) auditable — you diff one object against the CV, not 500 lines of HTML.

**Tension worth naming**: this makes the rendered content JavaScript-dependent, which sits awkwardly beside R3's no-JS guarantee. R3 protects against *animation* failing; it cannot protect against *rendering* failing. Two mitigations, and the plan takes the second:

1. Duplicate content in static HTML and hydrate over it — defeats the single-source-of-truth goal.
2. Accept it. This is a portfolio for recruiters on evergreen browsers, not a document that must survive with scripting off. Search engines execute JavaScript. The spec's no-JS edge case is written narrowly, about animation stranding content, and R3 satisfies it as written.

The hero — name, title, summary, photo — stays in static HTML regardless, because it is the SC-001 ten-second payload and must paint without waiting for a script.

**Alternatives considered**: JSON fetched at runtime (an extra request, and `fetch` on `file://` fails, breaking local preview); a static-site generator (build step, forbidden); inline `<script type="application/json">` (works, but loses comments and editor support in the one file Andrew will edit most).

---

## R8. Contact channel URL formats

**Decision**:

| Channel | Href | Notes |
|---|---|---|
| WhatsApp | `https://wa.me/201145678491` | No `+`, no spaces. Resolves to the app on mobile, WhatsApp Web on desktop — satisfies FR-012 on both. |
| Email | `mailto:andrewayad60@gmail.com?subject=...` | Subject percent-encoded. |
| Copy | Clipboard API, with a `document.execCommand` fallback | Confirmation swaps the icon to a check for ~2s (FR-011). |
| LinkedIn | `https://linkedin.com/in/andrew-ayad-58764315a` | From the CV. |
| GitHub | `https://github.com/andrewayadwadie` | From the CV. |

**Rationale**: `wa.me` is WhatsApp's own documented deep link and handles the mobile/desktop split without user-agent sniffing. All external links carry `target="_blank" rel="noopener noreferrer"` per FR-014.

---

## R9. Verification approach

**Decision**: Manual verification against `quickstart.md`, with a scripted contrast check. No test framework.

**Rationale**: FR-019 forbids a package manager, which rules out Vitest, Playwright, and axe-core as installed dependencies. The success criteria are all observable in a browser: contrast (computable, and pre-verified in R1), keyboard traversal (tab through it), reduced motion (an OS toggle), viewport range (devtools), link liveness (click them).

The one criterion worth automating is SC-005, because it regresses silently whenever a token changes. A standalone script — not a project dependency — recomputes contrast ratios for every token pair and prints pass/fail. It lives beside the spec, not in the shipped site.

**Alternatives considered**: Adding Playwright and axe (violates FR-019 for a single-page static site); Lighthouse CI (same); skipping verification entirely (SC-005 and SC-006 would be unfalsifiable claims).
