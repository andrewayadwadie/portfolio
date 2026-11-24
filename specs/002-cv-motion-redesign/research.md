# Research: CV-Faithful Portfolio Redesign with Full Motion System

**Feature**: `002-cv-motion-redesign` · **Date**: 2026-11-24 · **Spec**: [spec.md](./spec.md)

Every decision below resolves an open question in the plan's Technical Context. Constraints inherited from feature 001 still hold: static site, no build step, no framework, no package or animation-library dependency.

---

## R1 — Source of truth for CV text

**Decision**: Read `files/Andrew_Ayad_Flutter_Developer_CV.docx` as the text source. The PDF is the same document exported, and it stays the file visitors download. A standalone checker, `specs/002-cv-motion-redesign/check-cv-sync.py`, unzips the .docx with the Python standard library (`zipfile` + `xml.etree`), splits it into fields, and confirms that each field appears word for word in `js/data.js` or `index.html`.

**Rationale**: The PDF can't be read without third-party tools (`pdftotext` and `pypdf` are both missing on this machine). A .docx is a zip of XML, so the standard library is enough, which keeps the zero-dependency rule. A scripted check turns SC-001 (no content mismatches) from a manual review into a pass/fail gate.

**Alternatives considered**: Comparing PDF text by hand, which can't be repeated reliably. Generating `data.js` from the .docx at build time, which needs a build step and was rejected for that reason.

**Checker rules** (full contract in [contracts/site-data.contract.md](./contracts/site-data.contract.md)):
- Summary paragraph and every experience bullet must match exactly, after whitespace is normalised and HTML entities are decoded.
- A `Key products: A (x), B (y)` line is split into separate products. Each product's name and description must match.
- A `Category: a, b, c` skill line is split up. The category and every item must match, and the order must match.
- Reverse check: a list of banned strings (`11+`, `~30%`, `Glowy`, `ClinicQ`, `competencies`, `fintech-adjacent`, `Professional Working Proficiency`) must not appear in `index.html` or `js/`.

---

## R2 — Hero, summary, and stats under the CV-only rule

**Decision**:
- The hero shows only CV header fields: name, the CV headline line, and the contact row (location, phone/WhatsApp, email, website, LinkedIn, GitHub) plus CTAs. The "Open to senior Flutter roles" eyebrow is removed.
- The summary section shows the CV paragraph word for word, under the heading **Professional Summary**. The editorial h2 ("Architecture, performance, and shipped software.") is removed.
- The stats strip stays, but only with figures that appear in the CV summary: **5+** years, **10** production apps, and **2** Saudi ministries. The `11+` and `~30%` stats are removed. The numbers count up when they come into view.

**Rationale**: FR-005 bans claims the CV doesn't make. These three figures are in the CV text, so they're allowed. The count-up gives the summary a strong animated moment without inventing anything.

**Alternatives considered**: Dropping the stats completely loses a good motion moment and visual rhythm. A stat for the 3 employers is accurate but isn't stated in the CV, so it was rejected.

---

## R3 — Section headings, navigation labels, section order

**Decision**:

| Order | Section id | h2 (CV name, word for word) | Nav label |
|---|---|---|---|
| 0 | `hero` | (h1 = name) | logo → top |
| 1 | `summary` | Professional Summary | Summary |
| 2 | `experience` | Professional Experience | Experience |
| 3 | `skills` | Technical Skills | Skills |
| 4 | `education` | Education | Education |
| 5 | `languages` | Languages | Languages |
| 6 | `contact` | Contact | Contact |

Above each h2 is a small decorative index (`01`–`06`, `aria-hidden`), which replaces the old text eyebrows. All lead/tagline paragraphs are removed.

**Rationale**: FR-008 requires the CV names. Nav labels are the CV name's key word, so six items fit on one row at 1024px. Languages becomes its own section (`#languages`) because the CV lists it separately. The numeric index keeps the editorial look without adding words the CV doesn't have.

**Alternatives considered**: Full CV names in the nav overflow at tablet widths. Keeping Languages inside Education doesn't match the CV structure.

---

## R4 — Motion language (FR-013)

**Decision**: One set of motion tokens in `:root`, used by every animation:

| Token | Value | Use |
|---|---|---|
| `--dur-1` | 160ms | hover/press feedback, color changes |
| `--dur-2` | 320ms | menu, toast, small state changes |
| `--dur-3` | 700ms | scroll reveals |
| `--dur-4` | 1100ms | heading masks, image reveals, intro pieces |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | entrances (keeps existing value) |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | movement between two states (nav pill, cursor ring settle) |
| `--rise` | 28px desktop / 16px ≤720px | fade-up distance |
| `--stagger` | 70ms desktop / 45ms ≤720px | delay between siblings |
| `--stagger-cap` | 8 | stagger index stops growing here, so long lists never wait more than ~0.6s |

**Effect vocabulary** (no bounce, spin, flash, or overshoot):

| Effect | Applied to |
|---|---|
| `fade-up` | paragraphs, bullets, cards, chips, contact rows, buttons |
| `mask` (word-by-word rise from a clipped line) | h1, h2, h3 |
| `clip` (inset clip-path wipe + 1.08→1 scale) | images (portraits) |
| `line` (scaleX 0→1 from the left) | timeline rail, dividers, nav active pill |
| `count` | stat numbers |

**Rationale**: The site is calm and restrained (dark green, Sora/Inter, soft elevation), so slow eased entrances fit and springy motion doesn't. Tokens keep every element consistent (SC-003), and changing them on small screens covers FR-024.

---

## R5 — Scroll reveal mechanism

**Decision**: Mark individual elements, not whole sections. Renderers and the static markup put `data-reveal="<effect>"` on each element that animates. A single `IntersectionObserver` (threshold 0.15, rootMargin `0px 0px -8% 0px`) watches **reveal groups** (`[data-reveal-group]`, one per section block or card). When a group intersects, it gets `.is-visible`, and each child's `--i` (sibling index, capped at `--stagger-cap`) sets its `transition-delay`. The group is then unobserved, so each element animates once (FR-014).

- Hidden starting styles apply only under `html.js-motion`, which JS adds at boot. If the script fails, everything stays visible (FR-020).
- Headings are split into word `<span>`s by JS at render time, using text nodes only and never `innerHTML`. Words stay inline, so screen readers read the heading normally.
- Only `transform`, `opacity`, and `clip-path` are animated. Nothing that affects layout moves, so animation causes no layout shift (SC-008).
- **Deep links and fast jumps**: on load and on `hashchange`, every group above or at the target is marked visible right away, so nothing the visitor scrolled past stays hidden.

**Alternatives considered**: CSS `animation-timeline: view()` doesn't have consistent support across Safari and Firefox at the target baseline. GSAP/ScrollTrigger breaks the no-dependency rule.

---

## R6 — Navigation, "routing", and the URL

**Decision**: Keep the single page, and treat each section as a route identified by its hash.

1. **Click** on any `a[href^="#"]` (nav, hero CTAs, back-to-top): `preventDefault`, then `history.pushState(null, "", "#id")`, then `target.scrollIntoView({ behavior: smooth-or-auto })`, then focus the section's h2 (`tabindex="-1"`, `preventScroll`). On mobile, close the menu first.
2. **Back/forward** (`popstate`) and **deep link on load**: resolve the hash. If it's a known section, mark the groups above it as revealed and scroll to it smoothly (or instantly under reduced motion). If the hash is unknown, stay at the top and use `replaceState` to clear it.
3. **Scroll-spy**: an `IntersectionObserver` with rootMargin `-45% 0px -50% 0px` finds the section in the middle of the viewport. It updates `aria-current="true"` on the nav link, moves the **active pill** (one absolutely positioned element, translated and scaled to the link's box), and calls `history.replaceState` so the address bar shows the current section without adding a history entry for every scroll.
4. The offset for the fixed nav comes from `scroll-margin-top: calc(var(--nav-h) + var(--space-4))` on every section (FR-016).

**Rationale**: This meets US3's "route and navigate" acceptance scenarios (deep link, back/forward, shareable URL) without a router. Using `pushState` only on clicks and `replaceState` while scrolling keeps the Back button useful.

**Alternatives considered**: A hash-router that shows one section at a time would break the CV-like single page that recruiters read in one pass. Plain CSS `scroll-behavior` alone can't move focus or update the active pill.

---

## R7 — Scroll progress and back-to-top

**Decision**: A 2px bar fixed under the nav, `transform: scaleX(var(--progress))`, updated from a passive `scroll` listener and throttled with `requestAnimationFrame`. The back-to-top button is a fixed round button in the bottom-right corner (44×44). It fades and rises in once the hero leaves the viewport (watched with an IntersectionObserver), and clicking it goes through the same navigation path as R6, targeting `#hero`.

**Alternatives considered**: CSS `animation-timeline: scroll()` doesn't have full support across browsers, and the JS cost here is tiny.

---

## R8 — Landing background (FR-010, clarified: soft green and bronze blobs + grain)

**Decision**:
- Three absolutely positioned blobs inside `.hero__bg` (`aria-hidden`, `pointer-events:none`). Each is a large circle painted with a `radial-gradient` that fades to transparent: two in accent green, one in warm bronze. The gradient falloff gives the softness, so **no `filter: blur()`** is used, because a large animated blur is too expensive on phones.
- Each blob drifts with its own `@keyframes` (translate + scale only), lasting 18s, 24s, and 30s, `alternate`, `ease-in-out`. The different lengths keep the movement from visibly repeating.
- Grain: an inline SVG `feTurbulence` data-URI used as a fixed background on `.hero__bg::after`, at 0.06 opacity in dark mode and 0.04 in light.
- Opacity limits: dark-mode blobs at most 0.35 alpha, light-mode at most 0.22. Contrast is checked against the **worst-case composite** (accent at its max alpha over `--bg`). `check-contrast.py` gains composite pairs so hero text is gated at 4.5:1.
- The animation pauses (`animation-play-state: paused`) when `document.hidden` is true or when the hero is out of view (watched with an IntersectionObserver). Under reduced motion the blobs are still and the grain stays.

**Alternatives considered**: `<canvas>` metaballs are heavy and would be a rendering path with no fallback. `filter: blur(120px)` on animated layers was rejected because it drops frames on mid-range Android.

---

## R9 — Intro sequence (FR-011, clarified: full once per session)

**Decision**:
- The inline `<head>` script, which already runs before first paint for the theme, also reads `sessionStorage.introSeen` and adds `intro-full` or `intro-short` to `<html>`. Under reduced motion it adds neither. It then sets `introSeen = "1"`. Doing this before paint means there's no flash of the final layout.
- **Full intro** (finishes in ≤1.2s, inside the 1.5s budget): portrait clip-wipe (0→1100ms) ∥ h1 word mask (100→900ms) → headline fade-up (350ms) → contact row stagger (450ms+) → CTAs (600ms+) → nav slides down (700ms). Pure CSS `@keyframes` with `animation-fill-mode: both`.
- **Short entrance**: the whole hero block fades up together, 450ms.
- **Skip**: the first `pointerdown` or `keydown` during the intro adds `intro-done`. That sets `animation: none` on intro targets, so they jump to their final state straight away. The intro classes are removed on `animationend` of the last piece, or after 1.5s as a backstop.
- **No-JS**: the head script still runs because it's inline. If storage throws, it uses the short entrance. All intro styles are scoped to these classes, so a missing class means content is static and visible.

**Alternatives considered**: A full-screen preloader or curtain hides content and goes against "never blocks reading". `localStorage` (once ever) was rejected by the clarification.

---

## R10 — Custom cursor (FR-021/022, clarified: dot + trailing ring + magnetic)

**Decision**:
- Enabled only when `matchMedia("(hover: hover) and (pointer: fine)")` matches **and** `prefers-reduced-motion` doesn't. Both are checked live: if either changes, the cursor is torn down or rebuilt.
- Two fixed `aria-hidden` elements with `pointer-events: none`, created by JS: `.cursor__dot` (8px, accent) and `.cursor__ring` (36px, 1.5px accent border). They sit at the top z-index, use `mix-blend-mode: normal`, and use `--accent` so both themes work.
- The dot's transform is set **synchronously in `pointermove`**, so it has no lag. The ring is eased in a `requestAnimationFrame` loop (lerp 0.18) that stops itself once the ring has settled, so nothing runs while idle.
- **States**: hovering over `a, button, [data-cursor="hover"]` (found by event delegation on `pointerover`/`pointerout`) makes the ring scale to 1.8 with a soft accent fill and fades the dot. Over selectable text (`p, li, dd`) the ring narrows to an I-beam shape. `pointerdown` scales the ring to 0.8, and `pointerup` returns it. `pointerleave` on the document hides both, and `pointerenter` shows them again.
- **Native cursor**: hidden with `html.has-cursor { cursor: none }` while the custom cursor is active, but kept as `cursor: text` on text and `cursor: auto` on form controls. This way text selection still works and still looks right (FR-022). If the script fails, `has-cursor` is never added and the native cursor stays.
- **Magnetic**: elements marked `[data-magnetic]` (primary buttons, hero CTAs, back-to-top) shift by `(pointer − center) × 0.25`, capped at ±6px, while the pointer is over them, and spring back over `--dur-2` when it leaves. Keyboard focus never triggers the shift.

**Alternatives considered**: Moving the dot through rAF adds a frame of lag that's noticeable on a 60Hz screen. Keeping the native arrow under a dot looked cluttered.

---

## R11 — Interaction states for every control (FR-015)

**Decision**: Shared primitives cover all controls:
- `.btn`: on hover, lifts by −2px, a background fill sweeps in from the left (`::before` scaleX), and the shadow grows. Pressed scales to 0.97. On `:focus-visible`, a 2px accent outline animates its offset from 6px to 2px. The primary button also shows a sheen across it on hover.
- Nav links: on hover, an underline grows from the left. The active link has the sliding pill (R6).
- Chips, products, and cards: on hover, lift by −2px, the border shifts to the accent color, and the shadow grows.
- Theme toggle: the icon rotates and cross-fades. The theme change itself uses `document.startViewTransition` with a circular `clip-path` reveal from the toggle's position when supported. Otherwise colors transition over `--dur-2`. It's instant under reduced motion.
- Mobile menu: the panel drops in with `clip-path: inset(0 0 100% 0) → inset(0)`, and the links stagger fade-up. The burger morphs to a close icon.
- Copy email: the copy icon morphs to a check, and a toast slides up ("Email address copied", also announced through the live region).
- Every hover effect has a matching `:focus-visible` effect (US3, scenario 2).

---

## R12 — Responsive strategy (FR-023/024)

**Decision**: Keep the existing breakpoints (900px stacks the hero, 720px switches to the mobile nav) and add 480px (single-column skills, stats in a 3-up row of smaller tiles) and 1600px+ (container grows to 1240px and type steps up). `--rise` and `--stagger` are reduced at ≤720px. `@media (hover: none)` turns off hover-only lift effects, and no information is shown only on hover. Long names (e.g. "El Imam Mady Abo El Azaym University App") get `overflow-wrap: anywhere` inside product cards. The check matrix is 320/375/768/1024/1440/1920 in both themes.

---

## R13 — Script organisation without a build step

**Decision**: Three deferred scripts, which run in document order:
1. `js/data.js`: `SITE_DATA` (CV content only).
2. `js/main.js`: renders sections, theme, mobile nav, and copy. When it finishes, it dispatches `document.dispatchEvent(new CustomEvent("site:rendered"))`.
3. `js/motion.js`: reveal, heading split, count-up, scroll progress, scroll-spy and nav pill, hash navigation, back-to-top, intro skip, hero-background pause, and the theme view-transition. `js/cursor.js`: the cursor and magnetic effect.

`motion.js` and `cursor.js` subscribe to `site:rendered`. All deferred scripts run before `DOMContentLoaded`, so their listeners are in place before `main.js` dispatches. Each file is an IIFE with `"use strict"` and adds nothing to the global scope.

CSS: `css/style.css` (layers `tokens, base, primitives, sections, motion`, declared once at the top) and `css/motion.css` (contents inside `@layer motion`), linked second. Motion lives in one file that can be reviewed on its own.

**Alternatives considered**: One big `main.js` (~1000+ lines) is harder to review. ES modules would work without a build, but `file://` previews fail on module CORS, and feature 001's quickstart opens the page straight from disk.

---

## R14 — Reduced motion and no-JS guarantees (FR-019/020, SC-007)

**Decision**: There are three layers of protection:
1. CSS `@media (prefers-reduced-motion: reduce)` in `motion.css`: every reveal starts visible, the blobs stop, the intro classes have no effect, and transitions take 0.01ms.
2. JS checks `matchMedia("(prefers-reduced-motion: reduce)")` before it splits headings, starts count-up (it writes the final values instead), builds the cursor, or calls `startViewTransition`.
3. All hidden starting styles require `html.js-motion` or `html.intro-*`. These classes are added only by scripts that actually ran.

---

## R15 — Constitution status

**Decision**: `.specify/memory/constitution.md` is still the unfilled template, so it defines no gates. The plan treats feature 001's documented constraints as the working principles: zero dependencies, no build, content in a single source, WCAG AA, and progressive enhancement. The Constitution Check is checked against those.
