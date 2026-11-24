# Implementation Plan: CV-Faithful Portfolio Redesign with Full Motion System

**Branch**: `002-cv-motion-redesign` | **Date**: 2026-11-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-cv-motion-redesign/spec.md`

## Summary

Rewrite every piece of site content from the new CV (`files/Andrew_Ayad_Flutter_Developer_CV.*`):
- new headline and summary
- the three roles with CV bullets and key products
- ten skill groups, including Payments & Monetization
- "Graduated 2019"
- English level "Good"
- website added to contact
- side projects, core competencies and unsupported stats removed

Section headings and nav use the CV section names, in CV order. Languages becomes its own section.

On top of the content, add one motion system, built only on CSS and vanilla JS:
- token-based reveals (word-mask headings, fade-up text and cards, clip-wipe images, count-up stats)
- animated states for every control
- hash-based section routing with smooth scroll, scroll-spy, a sliding nav pill and back/forward support
- scroll progress and back-to-top
- a landing with drifting green and bronze gradient blobs plus grain, and a once-per-session intro
- a dot-and-ring custom cursor with magnetic CTAs

Everything falls back to static and fully visible content under reduced motion, on touch devices, or when JS fails. A standard-library Python checker gates CV fidelity.

## Technical Context

**Language/Version**: HTML5, CSS (cascade layers, custom properties, `clip-path`, View Transitions where available), JavaScript ES2017 in classic deferred scripts (IIFEs, no modules); Python 3 standard library for the check scripts

**Primary Dependencies**: None. Google Fonts (Inter, Sora) as already used. No animation library ([research R5](./research.md), [R13](./research.md))

**Storage**: `localStorage.theme` (existing), `sessionStorage.introSeen` (new). Content is static in `js/data.js`

**Testing**: `check-cv-sync.py` (new: CV ↔ site fidelity in both directions), `check-contrast.py` (moved from 001 and extended with hero-blob composite pairs), and the manual scenario matrix in [quickstart.md](./quickstart.md), with Lighthouse for CLS

**Target Platform**: Evergreen browsers, the last two versions of Chrome, Edge, Safari (macOS and iOS) and Firefox, from 320px to 1920px+

**Project Type**: Static single-page website (personal portfolio)

**Performance Goals**: Hero readable and interactive ≤1.5s after first paint. Scrolling with no long frames >50ms at 4× CPU throttle. CLS < 0.05. Only transform, opacity and clip-path are animated, and the idle rAF loops stop themselves

**Constraints**: No build step. Zero package dependencies. Works opened from `file://`. WCAG AA in both themes. Progressive enhancement: all hidden starting styles are gated on JS-added classes. `prefers-reduced-motion` turns off all non-essential motion. No `innerHTML`

**Scale/Scope**: 1 page, 7 sections, about 2.2k → about 3k lines across 4 JS files and 2 CSS files. 1 content file. 2 check scripts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template, so it defines no ratified gates ([research R15](./research.md)). These gates come from feature 001's working principles:

| Gate | Pre-research | Post-design |
|---|---|---|
| Zero dependencies, no build step | ✅ planned | ✅ R5/R13: vanilla CSS/JS, classic scripts, stdlib-only checkers |
| Content in a single source | ✅ | ✅ `SITE_DATA` + `sections[]`. The static hero/summary copy is guarded by `check-cv-sync.py` |
| WCAG AA contrast in both themes | ✅ | ✅ R8: blob alpha limits + composite pairs in `check-contrast.py` |
| Progressive enhancement (no stuck-hidden content) | ✅ | ✅ R14: gated classes, live reduced-motion checks, no-JS check in quickstart |
| Accessibility (keyboard, focus, semantics) | ✅ | ✅ dom-motion contract: `aria-current`, h2 focus on navigation, keyboard never moves magnetic elements, cursor is `aria-hidden` |
| Simplicity | ✅ | ✅ one observer per concern, no router library, single page kept |

No violations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/002-cv-motion-redesign/
├── plan.md                       # This file
├── research.md                   # Phase 0: R1–R15 decisions
├── data-model.md                 # Phase 1: SITE_DATA entities, UI state
├── quickstart.md                 # Phase 1: run + validation matrix
├── contracts/
│   ├── site-data.contract.md     # SITE_DATA shape + CV fidelity rules
│   └── dom-motion.contract.md    # DOM skeleton, motion attribute API, navigation
├── check-cv-sync.py              # (implementation phase) CV ↔ site gate
├── check-contrast.py             # (implementation phase) moved from 001 + blob composites
├── checklists/requirements.md
└── tasks.md                      # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
index.html            # REWRITE: head script (theme + intro), CV hero/summary, section shells, progress bar, to-top, toast, new icons
css/
├── style.css         # EDIT: layer order adds `motion`; motion tokens; CV section layouts; languages section; remove side-project/competency styles; 480/1600 breakpoints
└── motion.css        # NEW: @layer motion: reveal effects, intro keyframes, blobs + grain, cursor, nav pill, progress, to-top, toast, view-transition, reduced-motion overrides
js/
├── data.js           # REWRITE: SITE_DATA from the CV (sections[], stats, website; no sideProjects/competencies)
├── main.js           # EDIT: renderers per new data; nav from sections[]; section heads; languages renderer; remove side projects; dispatch site:rendered
├── motion.js         # NEW: reveal observer + --i stagger, heading split, count-up, progress, scroll-spy + pill, hash routing, to-top, intro skip, bg pause, theme view-transition
└── cursor.js         # NEW: dot/ring cursor, states, magnetic
files/                # UNCHANGED (CV source of truth)
images/               # UNCHANGED
```

**Structure Decision**: Keep the existing static single-project layout. Motion is split into its own CSS layer/file and two new scripts, so content rendering (`main.js`) stays separate from enhancement (`motion.js`, `cursor.js`). They communicate through the single `site:rendered` event.

## Implementation Phasing (input for /speckit-tasks)

1. **Content (US1, can ship alone)**: `data.js` rewrite → `index.html` hero/summary/nav/sections → `main.js` renderers → remove dead CSS → `check-cv-sync.py` passes.
2. **Motion foundation**: tokens + `motion.css` reveal primitives → `motion.js` reveal, split and count → control states (R11).
3. **Navigation (US3)**: hash routing, scroll-spy, pill, progress, back-to-top, mobile menu animation.
4. **Landing (US2)**: blobs + grain + pause → head-script intro mode → intro keyframes + skip → contrast composites.
5. **Cursor (US4)**: `cursor.js` + magnetic.
6. **Responsive and hardening (US5 + edge cases)**: breakpoints, reduced motion and no-JS passes, run the full quickstart matrix.

## Complexity Tracking

No constitution violations to justify.
