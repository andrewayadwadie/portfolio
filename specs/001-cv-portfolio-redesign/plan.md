# Implementation Plan: CV-Driven Portfolio Redesign

**Branch**: `001-cv-portfolio-redesign` | **Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-cv-portfolio-redesign/spec.md`

## Summary

Rebuild the existing single-page portfolio on a new, hand-authored design system whose palette is sampled from Andrew's profile photograph, and restructure it so the page renders the *entire* CV — three employers with all ten shipped products, both independent products, nine technical skill groups, education, and languages — from one data object rather than from hand-written markup.

Three decisions shape everything downstream:

1. **No build step** (FR-019, settled in clarification). Plain CSS custom properties, vanilla JavaScript, static files. This removes Tailwind, bundlers, and every off-the-shelf component library from consideration, and it is why the token system is written by hand.
2. **Content is data** (FR-006a). All CV text lives in a frozen `SITE_DATA` object in `js/data.js`. Adding a product URL later is a one-line edit in one file with zero markup changes — that constraint is what makes the data structure necessary rather than merely tidy.
3. **The palette is derived, not sampled.** The photo's dominant colors were measured (95% of pixels are `#121d1d`; greens cluster at hue 145–150°, wood at 26–30°), but the raw shirt green scores 1.84:1 against the background and cannot carry text. Accents are the same hues lifted in lightness until they clear WCAG. Every token pair is contrast-verified and gated by a script.

## Technical Context

**Language/Version**: HTML5, CSS (custom properties, `@layer`, native nesting, `clamp()`, container queries), JavaScript ES2020 (no modules — plain scripts, so `file://` preview works)

**Primary Dependencies**: None at runtime. Google Fonts via CDN (`display=swap`, four weights) is the only third-party origin, and the Font Awesome CDN is removed.

**Storage**: `localStorage`, one key (`theme`). No database, no backend.

**Testing**: Manual validation against [quickstart.md](./quickstart.md), plus `check-contrast.py` — a standalone script, not a project dependency — gating SC-005.

**Target Platform**: Evergreen browsers, desktop and mobile. Static hosting (Netlify).

**Project Type**: Static single-page site.

**Performance Goals**: Readable text within 2s on Slow 4G (SC-009). Reveal animations hold 60fps. Critical path: one stylesheet, two scripts, one font CSS — no icon CDN.

**Constraints**: No build step, no package manager, no framework runtime (FR-019). No form, no third-party data submission (FR-011a). 4.5:1 body / 3:1 large-and-controls contrast in *both* themes (FR-017). No horizontal scroll from 320px to 2560px (FR-025). Full keyboard operability (FR-026). All non-essential motion suppressed under `prefers-reduced-motion` (FR-023).

**Scale/Scope**: One page, seven sections, ~13 products, 2 themes, 12 icons. Roughly 500 lines of CSS, 250 of JS, 150 of HTML shell, 200 of data.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is the **unmodified Spec Kit template** — every principle is still a `[PRINCIPLE_N_NAME]` placeholder, and the governance section is unfilled. There are no ratified project principles to check against.

**Gate result: PASS by vacuity, not by merit.** No principle is violated because none exists.

This is worth naming rather than silently passing. Two template principles, had they been filled in, would have bitten this feature:

- *Test-First (NON-NEGOTIABLE)* — this plan ships no automated test suite. FR-019 forbids the package manager that Vitest or Playwright would need. The mitigation is `check-contrast.py` plus an eleven-scenario manual guide, which is proportionate for a static page with no user input and no business logic, but it would not survive a literal TDD principle.
- *Simplicity / YAGNI* — rendering seven sections from a data object is more machinery than writing seven sections of HTML. It is justified only by FR-006a and SC-003a, which demand that a future URL edit touch one file and zero markup. Absent that requirement, static markup would win.

Both are recorded in Complexity Tracking below. If Andrew ever runs `/speckit-constitution`, these are the two decisions to re-examine first.

**Post-Phase 1 re-check**: still PASS. The design added no new dependency, no new origin, and no new persistent state beyond the single `theme` key.

## Project Structure

### Documentation (this feature)

```text
specs/001-cv-portfolio-redesign/
├── plan.md                        # This file
├── spec.md                        # Feature specification (4 clarifications recorded)
├── research.md                    # Phase 0 — 9 decisions, all unknowns resolved
├── data-model.md                  # Phase 1 — SITE_DATA entity shapes and invariants
├── quickstart.md                  # Phase 1 — 11 validation scenarios, V1–V11
├── check-contrast.py              # Phase 1 — standalone SC-005 gate (passing)
├── contracts/
│   ├── site-data.contract.md      # The authoring interface (js/data.js)
│   └── dom.contract.md            # DOM skeleton, a11y, motion, theming guarantees
└── checklists/
    └── requirements.md            # Spec quality checklist — 16/16
```

### Source Code (repository root)

```text
index.html          # Rewritten. Section shells, static hero + summary,
                    # inline theme script, inline SVG icon sprite.

css/
└── style.css       # Rewritten as one layered file:
                    #   @layer tokens     — color, type, space, elevation, motion
                    #   @layer base       — reset, typography, focus-visible
                    #   @layer primitives — button, card, chip, link, section
                    #   @layer sections   — hero, experience, side-projects,
                    #                       skills, education, contact

js/
├── data.js         # NEW. The frozen SITE_DATA object. The only file Andrew
│                   # edits to add a product URL.
└── main.js         # Rewritten. Theme toggle, mobile nav, reveal observer,
                    # copy-to-clipboard, and the SITE_DATA renderers.

images/
├── profile.jpg     # Unchanged. Palette source.
└── logo.svg        # Restyled to the new accent.

files/
└── Andrew_Ayad_CV.pdf   # Unchanged. Linked for download.
```

**Structure Decision**: The existing flat static layout is kept — `index.html` at the root with sibling `css/`, `js/`, `images/`, `files/`. No `src/`, no `tests/`, no build output directory, because FR-019 forbids the build step that would justify them. The one structural addition is `js/data.js`, which exists solely to satisfy FR-006a's single-edit-point requirement.

Two things that exist today do **not** survive: the Font Awesome `<link>` (replaced by the inline sprite, research R5) and the current token block in `css/style.css` (`--primary: #40c4ff`, a cyan with no relationship to the photograph).

## Phase 0 — Research

Complete. See [research.md](./research.md). Nine decisions, no NEEDS CLARIFICATION remaining:

| # | Decision |
|---|---|
| R1 | Palette derived from measured photo hues; all 16 token pairs contrast-verified |
| R2 | One layered stylesheet, CSS custom properties, no `@import`, no preprocessor |
| R3 | `IntersectionObserver` reveal, unobserve after first fire, JS-gated hidden styles |
| R4 | Inline blocking head script stamps `data-theme` pre-paint; `try/catch` for blocked storage |
| R5 | Font Awesome dropped for a ~2KB inline SVG sprite — the single largest SC-009 lever |
| R6 | Google Fonts retained, weights cut from six to four, `display=swap` |
| R7 | Content lives in `SITE_DATA`; hero and summary stay static markup |
| R8 | `wa.me` deep link, `mailto` with encoded subject, Clipboard API with fallback |
| R9 | Manual validation + standalone contrast script; no test framework (FR-019) |

## Phase 1 — Design & Contracts

Complete.

- **[data-model.md](./data-model.md)** — eight entities. `Product.url` is `string | null`, and `null` is a first-class rendering state, not an error. Flat, acyclic, no lifecycles. The only mutable state on the page is the active theme.
- **[contracts/site-data.contract.md](./contracts/site-data.contract.md)** — the authoring interface, with the one-line diff that satisfies SC-003a spelled out.
- **[contracts/dom.contract.md](./contracts/dom.contract.md)** — document skeleton, the a11y guarantees (skip link, focus order, `aria-live` copy confirmation, `scroll-margin-top`), the three-state motion contract, and an explicit list of what the implementation is forbidden from doing (`innerHTML`, raw hex outside tokens, any request to a third-party origin, any link on a `null`-URL product).
- **[quickstart.md](./quickstart.md)** — V1–V11, each mapped to a success criterion. V4 step 3 is the one that proves SC-003a; V2 is the one that catches a deferred theme script.
- **[check-contrast.py](./check-contrast.py)** — runs green: all 16 pairs clear their bar in both themes.

**Agent context**: not updated. This Spec Kit installation exposes no agent-context script under `.specify/scripts/powershell/`, and the repository has no `CLAUDE.md`. Skipped rather than fabricated.

## Complexity Tracking

> Filled because two decisions would violate common constitution principles, had this project ratified any. Recorded so the tradeoff is visible rather than assumed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No automated test suite | FR-019 forbids a package manager, which every browser-test runner requires. Success criteria are observable in a browser. | Adding Playwright + axe-core would introduce `node_modules`, a lockfile, and a build step to a static page with no user input, no business logic, and no server. The one criterion that regresses silently — contrast — *is* automated, via a dependency-free script. |
| Rendering content from a data object rather than static markup | FR-006a and SC-003a require that supplying a product URL later touches exactly one file and zero markup. Ten products across three employers cannot satisfy that as hand-written HTML. | Static markup would mean editing `index.html` for every URL, and would make the SC-002 line-by-line CV audit a 500-line diff instead of a one-object comparison. Mitigated by keeping the hero and summary — the SC-001 payload — as static markup that paints without JavaScript. |

## Deliberately deferred

- **Self-hosting the fonts.** Removes the last third-party origin and would help SC-009 further, but adds binary assets and manual subsetting. Research R6 records it as a clean follow-up.
- **The twelve product URLs.** Every product ships with `url: null` until Andrew supplies them. The renderer handles both states, so this is content, not a blocker (settled in clarification).
- **A light-theme photo treatment.** The photograph is low-key; on a warm off-white background it may want a subtle border or a slight lift in exposure. Cosmetic — decide when it is on screen.

## Next

`/speckit-tasks` to decompose. The natural order follows the user-story priorities: tokens and the layered stylesheet first (nothing renders correctly without them), then the static hero and summary (SC-001, testable alone), then the data object and renderers, then contact, then motion and the accessibility pass.
