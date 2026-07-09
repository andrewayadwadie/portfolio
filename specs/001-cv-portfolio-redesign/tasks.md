---

description: "Task list for CV-Driven Portfolio Redesign"
---

# Tasks: CV-Driven Portfolio Redesign

**Input**: Design documents from `/specs/001-cv-portfolio-redesign/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: No automated test tasks. The spec never requested TDD, and FR-019 forbids the package manager every browser-test runner needs. Verification is `check-contrast.py` (already passing) plus the eleven manual scenarios in [quickstart.md](./quickstart.md). This tradeoff is recorded in plan.md → Complexity Tracking.

**Organization**: Tasks are grouped by user story so each can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel — different files, no dependency on incomplete work
- **[Story]**: Which user story the task serves (US1…US6)
- Exact file paths in every description

## Path Conventions

Flat static site at the repository root: `index.html`, `css/`, `js/`, `images/`, `files/`. No `src/`, no `tests/`, no build output — FR-019 forbids the build step that would justify them.

---

## A note on parallelism, before you trust the [P] markers

This feature has three files that nearly every task touches: `index.html`, `css/style.css`, `js/main.js`. Genuine parallelism is therefore **low**, and marking tasks `[P]` that all edit `style.css` would be a lie that produces merge conflicts.

`[P]` here means strictly: *this task's only writes land in a file no other unblocked task writes to.* Most of the real concurrency lives in Phase 2 and Phase 9. Within a user story, expect to work sequentially. A solo developer should read the phase order as a to-do list and ignore `[P]` entirely.

---

## A note on User Story 5

Spec priority says US5 (design system + motion) is P2. Dependency reality says its **token layer blocks every other story** — nothing renders correctly without `--bg`, `--text`, `--accent`.

The token and base layers are therefore hoisted into **Phase 2 (Foundational)**. What remains in the US5 phase is the part that is genuinely independent and independently testable: the theme toggle, the reveal observer, and the reduced-motion contract. This is a deliberate deviation from strict priority order, made because the alternative — building US1 against hard-coded colors and retrofitting tokens later — would violate FR-018 in the interim and require rework.

---

## Phase 1: Setup

**Purpose**: Establish a working baseline and a way to see what you are changing.

- [X] T001 Create and switch to branch `001-cv-portfolio-redesign` from `main` (the repo is currently on `main`; do not commit this feature there)
- [X] T002 [P] Capture "before" screenshots of the current site at 375px and 1440px into `specs/001-cv-portfolio-redesign/before/` for the SC-010 comparison (zero sections may retain the old visual language)
- [X] T003 [P] Run `python specs/001-cv-portfolio-redesign/check-contrast.py` and confirm it exits 0, establishing the SC-005 gate before any CSS changes

**Checkpoint**: Local server serves the old site; the contrast gate runs green.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The design system and the document skeleton. Nothing in any user story renders correctly until this is done.

**⚠️ CRITICAL**: No user story work can begin until Phase 2 completes.

- [X] T004 Replace the entire `:root` and `[data-theme="light"]` token blocks in `css/style.css` with the `@layer tokens` layer, using the exact contrast-verified values from [research.md](./research.md) R1 — dark: `--bg:#0d1514`, `--surface:#121d1d`, `--text:#e6ede9`, `--text-muted:#9db0a8`, `--accent:#4ade9b`, `--accent-warm:#c99b70`, `--border:#2b4837`; light: `--bg:#f7f5f1`, `--surface:#ffffff`, `--text:#111d1a`, `--text-muted:#4a5a53`, `--accent:#0f6b45`, `--accent-warm:#7a5334`. Delete `--primary:#40c4ff` and every other cyan value.
- [X] T005 Add the type, space, elevation, and motion token families to `@layer tokens` in `css/style.css`: fluid `--step--1`…`--step-5` via `clamp()`, a 4px-based `--space-1`…`--space-16`, green-tinted `--shadow-1`…`--shadow-3` (not black), and `--dur-fast`/`--dur-base`/`--ease-out`
- [X] T006 Write the `@layer base` layer in `css/style.css`: reset, `box-sizing`, body typography bound to the type tokens, `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }`, and `scroll-margin-top` on `section` equal to the nav height (FR-021)
- [X] T007 Add the inline blocking theme script to `<head>` in `index.html`, **before** the stylesheet link, exactly as specified in [research.md](./research.md) R4 — reads `localStorage.theme`, falls back to `matchMedia('(prefers-color-scheme: light)')`, falls back to dark, wrapped in `try/catch` for Safari private mode. This must be inline and synchronous or V2 fails.
- [X] T008 Add the inline SVG `<symbol>` sprite as the first child of `<body>` in `index.html` with twelve icons — `github`, `linkedin`, `mail`, `whatsapp`, `sun`, `moon`, `menu`, `close`, `external-link`, `copy`, `check`, `download` — each `<symbol>` carrying `fill="currentColor"`. Sourced from Simple Icons (brands) and Lucide (UI).
- [X] T009 Remove the Font Awesome `<link>` from `<head>` in `index.html` and trim the Google Fonts request to four weights (body 400/500, headings 600/700) with `display=swap` (research R5, R6)
- [X] T010 Rewrite the `index.html` document skeleton per [contracts/dom.contract.md](./contracts/dom.contract.md): skip link, `<header class="nav">`, `<main id="main">` containing seven `<section>` shells (`#hero`, `#summary`, `#experience`, `#side-projects`, `#skills`, `#education`, `#contact`), each non-static section carrying `data-render` and `data-reveal`, plus `<footer>`. Section bodies stay empty — Phases 3–8 fill them.
- [X] T011 Create `js/data.js` with the frozen `SITE_DATA` object skeleton per [contracts/site-data.contract.md](./contracts/site-data.contract.md) — top-level keys `profile`, `contact`, `competencies`, `experience`, `sideProjects`, `skills`, `education`, `languages`, all present, arrays empty for now, wrapped in `Object.freeze`
- [X] T012 Rewrite `js/main.js` as a boot shell: add `js-reveal` to `document.documentElement`, wait for `DOMContentLoaded`, then dispatch to per-section render functions looked up from `[data-render]`. Every render function is a no-op stub at this point. Never use `innerHTML` (dom.contract.md forbids it).
- [X] T013 Write the `@layer primitives` layer in `css/style.css`: `.btn`, `.card`, `.chip`, `.link`, `.section`, `.skip-link`, and an `.icon` rule sizing `<svg>` to `1em` with `fill: currentColor`. Every value resolves through a token — no raw hex, no raw px.

**Checkpoint**: The page loads dark, paints the correct theme on the first frame, shows a nav and seven empty sections, and the contrast gate still passes. Nothing has content yet.

---

## Phase 3: User Story 1 — Recruiter grasps the candidate in ten seconds (Priority: P1) 🎯 MVP

**Goal**: Photo, name, title, and the full professional summary readable within two screens, painted without waiting for any script.

**Independent Test**: Load on a fresh 1440px and 375px viewport. A stranger can state Andrew's role, seniority, and primary technology. Disable JavaScript — it still works.

**Critical constraint**: the hero and summary are **static markup**, not rendered from `SITE_DATA` (research R7). They are the SC-001 payload and must not wait on `main.js`.

- [X] T014 [US1] Write the `#hero` section body as static HTML in `index.html`: `<h1>` with the name (the page's only `h1`), the professional title and subtitle, the `<img>` with descriptive `alt` (not `"profile"`), and primary actions linking to `#contact`, `#experience`, and the CV
- [X] T015 [US1] Write the `#summary` section body as static HTML in `index.html` containing the CV professional summary **verbatim** — not truncated, not rewritten, not behind a "read more" (FR-002)
- [X] T016 [US1] Populate `SITE_DATA.profile` in `js/data.js` with `name`, `title`, `subtitle`, `location`, `summary`, `photo`, `photoAlt`, `cv`. This duplicates the static hero text by design — it serves the contact section and the document title (contracts/site-data.contract.md)
- [X] T017 [US1] Style the hero and summary in `@layer sections` of `css/style.css`: a responsive two-column grid collapsing to stacked at narrow widths, the photo with a green-tinted elevation, and summary prose capped near 65ch for readability
- [X] T018 [US1] Update `<title>` and `<meta name="description">` in `index.html` to Andrew's name and current professional title (FR-028)
- [X] T019 [US1] Verify quickstart V1 and V9 for the hero at 320px, 375px, and 1440px — no horizontal scroll, no clipped summary text

**Checkpoint**: The MVP. A recruiter who lands and never scrolls still knows who Andrew is. Deployable on its own.

---

## Phase 4: User Story 2 — Recruiter verifies work history and shipped products (Priority: P1)

**Goal**: Three employers, every achievement bullet, all ten products — each linked if a URL exists, plain text if not.

**Independent Test**: All three employers appear reverse-chronologically with correct dates. Bullet counts match the CV: Noor 5, WABC 3, Innovation 4. Every product appears under the correct employer with a description. No product with `url: null` renders an `<a>`.

- [X] T020 [US2] Populate `SITE_DATA.experience` in `js/data.js` with three entries — Noor Data Network, WABC Group, Innovation Agency — each with `company`, `location`, `role`, `start`, `end`, all CV `bullets` verbatim, and its `products` array. Every product gets `url: null` until Andrew supplies links (data-model.md).
- [X] T021 [US2] Populate `SITE_DATA.competencies` in `js/data.js` with the full Core Competencies list from the CV
- [X] T022 [US2] Implement `renderExperience()` in `js/main.js` building each employer card with `document.createElement` and `textContent` only. Array order is rendering order — do not sort (data-model.md).
- [X] T023 [US2] Implement the product-link branch inside `renderExperience()` in `js/main.js`: a `string` `url` produces `<a target="_blank" rel="noopener noreferrer">` with a trailing `#icon-external-link`; a `null` `url` produces a `<span>` — no `href="#"`, no `aria-disabled`, no "coming soon" badge, nothing that hints a link is missing (FR-006, FR-006b)
- [X] T024 [US2] Style the experience timeline in `@layer sections` of `css/style.css`: employer cards, a date rail, bullet lists, and product entries that read as distinct items rather than prose
- [X] T025 [US2] Verify quickstart V4 — including step 3, the one that actually proves SC-003a: flip one `url: null` to a real URL in `js/data.js`, reload, and confirm the styled anchor appears with **zero** edits to `index.html` or `css/style.css`. Revert the URL afterward.

**Checkpoint**: Work history is verifiable. US1 and US2 both stand alone.

---

## Phase 5: User Story 3 — Visitor explores the independent products (Priority: P2)

**Goal**: Glowy and ClinicQ in their own section, visually distinct from employed work.

**Independent Test**: Both appear with role, stack chips, and CV bullets. The section is unmistakably not the Experience section. `url: null` still renders no link.

- [X] T026 [US3] Populate `SITE_DATA.sideProjects` in `js/data.js` with Glowy and ClinicQ — `name`, `tagline`, `role`, `stack[]`, `bullets[]`, `url: null`, and `urlLabel` (`"Google Play"` for Glowy, `"Visit site"` for ClinicQ — ClinicQ is a Vercel web app, not a Play Store listing)
- [X] T027 [US3] Implement `renderSideProjects()` in `js/main.js`, reusing the same null-URL branch as T023 rather than duplicating the logic
- [X] T028 [US3] Style the side-projects section in `@layer sections` of `css/style.css` so it is structurally distinct from Experience — a two-up card grid rather than a timeline, using `--accent-warm` where Experience uses `--accent`, so the two are never confused (FR-007)
- [X] T029 [US3] Verify at 320px that stack chips wrap without overflowing (this is the first place SC-008 breaks)

**Checkpoint**: Independent work is distinguishable from employed work at a glance.

---

## Phase 6: User Story 4 — Visitor makes contact through their preferred channel (Priority: P2)

**Goal**: Four channels, one tap each, no form, no third-party request.

**Independent Test**: On a real phone, WhatsApp opens a chat to the number, email opens the mail client prefilled. On desktop, `wa.me` opens WhatsApp Web and the copy button works with an announced confirmation.

- [X] T030 [US4] Populate `SITE_DATA.contact` in `js/data.js` with exactly four entries — `whatsapp` → `https://wa.me/201145678491` (no `+`, no separators), `email` → `mailto:andrewayad60@gmail.com?subject=…` percent-encoded and `copyable: true`, `linkedin`, `github`. A fifth entry violates FR-013.
- [X] T031 [US4] Implement `renderContact()` in `js/main.js`, emitting the profile photo, the four channels as one-tap targets, and every external anchor with `target="_blank" rel="noopener noreferrer"` (FR-014)
- [X] T032 [US4] Implement the copy-to-clipboard handler in `js/main.js` for the email address: Clipboard API with a `document.execCommand` fallback, swapping `#icon-copy` to `#icon-check` for ~2s, and announcing "Email address copied" through an `aria-live="polite"` region. A silent icon swap fails the a11y contract.
- [X] T033 [US4] Style the contact section in `@layer sections` of `css/style.css` with touch targets no smaller than 44×44px, and confirm the email address stays visible as text so it can be copied by hand (FR-011)
- [X] T034 [US4] Confirm no form element exists anywhere in `index.html` and, with the Network tab open, that no request reaches any third-party origin beyond Google Fonts (FR-011a)
- [ ] T035 [US4] Verify quickstart V5 on a physical phone, not an emulator — emulators routinely fake `mailto` and `wa.me` handling

**Checkpoint**: The portfolio is actionable. A recruiter can reach Andrew.

---

## Phase 7: User Story 5 — Coherent, motion-aware visual identity (Priority: P2)

**Goal**: Theme toggle with persistence and no flash; section reveals that fire once; full reduced-motion compliance.

**Independent Test**: Toggle to light, reload — light paints on the first frame. Scroll — each section reveals once. Enable OS reduced-motion — everything is instantly visible and nothing moves.

**Note**: the token and base layers this story depends on already landed in Phase 2. What follows is the behavior.

- [X] T036 [US5] Implement the theme toggle in `js/main.js`: swap `data-theme` on `<html>`, write `localStorage.theme` inside a `try/catch` (blocked storage must still switch for the session), swap `#icon-sun`/`#icon-moon`, and update both `aria-label` and `aria-pressed` on the button
- [X] T037 [US5] Implement the reveal observer in `js/main.js`: `IntersectionObserver` at `{ threshold: 0.15, rootMargin: '0px 0px -10% 0px' }` over `[data-reveal]`, adding `.is-visible` and calling `unobserve` on first intersection so nothing re-animates (FR-020)
- [X] T038 [US5] Add the JS-gated reveal styles to `css/style.css`: `.js-reveal [data-reveal] { opacity: 0; transform: translateY(1.5rem) }` and `[data-reveal].is-visible { opacity: 1; transform: none }`. The `.js-reveal` gate is what guarantees FR-024 — with JS dead, the hidden rule never matches and nothing is stranded invisible.
- [X] T039 [US5] Add the `@media (prefers-reduced-motion: reduce)` block to `css/style.css`: collapse all durations to `0.01ms`, neutralize transforms, set `scroll-behavior: auto`. Near-zero rather than `none` so any future `transitionend` listener still fires. (FR-023)
- [X] T040 [US5] Implement the mobile nav in `js/main.js` as a `<button aria-expanded>` controlling the `<ul id>`, closing on `Escape` and returning focus to the trigger
- [X] T041 [US5] Restyle `images/logo.svg` to use the new accent green in place of the old cyan
- [ ] T042 [US5] Verify quickstart V2 and V7. For V2, record the screen and step frame-by-frame — a flash of dark before light means the theme script got deferred or moved below the stylesheet.

**Checkpoint**: The site has an identity, and it respects the visitor's motion preference.

---

## Phase 8: User Story 6 — Visitor reviews the full technical and academic record (Priority: P3)

**Goal**: Every remaining CV item on the page. Nothing omitted.

**Independent Test**: Diff the rendered page against the CV, line by line. Zero absences.

- [X] T043 [US6] Populate `SITE_DATA.skills` in `js/data.js` with all nine CV categories — Languages & Frameworks, State Management, Architecture, Networking & Data, Testing, DevOps & Delivery, AI-Assisted Development, Mobile Platform, Tools & Collaboration — with every technology named inside each. This is the highest-risk entity for SC-002: one dropped skill is a silent failure.
- [X] T044 [P] [US6] Populate `SITE_DATA.education` and `SITE_DATA.languages` in `js/data.js`. The graduation project ("Optical Mark Recognition") and grade ("Excellent") are the two items most often dropped in redesigns — include them.
- [X] T045 [US6] Implement `renderSkills()`, `renderEducation()`, and `renderLanguages()` in `js/main.js`
- [X] T046 [US6] Style the skills, education, and languages sections in `@layer sections` of `css/style.css`, skills as grouped chip clusters under their CV category headings
- [X] T047 [US6] Add the CV download action in `index.html`, linking `files/Andrew_Ayad_CV.pdf` with `#icon-download` (FR-008)
- [X] T048 [US6] Run the full quickstart V10 content-fidelity audit against the CV, checking every box in that list

**Checkpoint**: All six stories are functional. The site carries the whole CV.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: The checks that catch what section-by-section work misses.

- [X] T049 [P] Run `python specs/001-cv-portfolio-redesign/check-contrast.py`. If any token drifted during styling, fix the token's lightness — never lower the bar. (SC-005)
- [X] T050 [P] Grep for token violations: `grep -nE '#[0-9a-fA-F]{6}' css/style.css | grep -v ':root' | grep -v 'data-theme'` must return nothing (FR-018)
- [X] T051 [P] Grep for `innerHTML` in `js/main.js` — must return nothing (dom.contract.md)
- [X] T052 Full keyboard traversal, quickstart V6: skip link first, logical order, visible focus ring on every control in **both** themes, `Escape` closes the mobile nav and restores focus. No focus trap. (SC-006)
- [X] T053 Verify quickstart V8 with JavaScript disabled — hero and summary render fully, no section is stranded invisible by a reveal that never ran (FR-024)
- [X] T054 Verify quickstart V9 across the full 320px–2560px sweep. No horizontal scrollbar, no clipped text, no overlap. (SC-008)
- [ ] T055 Verify quickstart V11 on throttled Slow 4G with the cache disabled: text readable within 2s, **zero** Font Awesome requests in the network list, reveals holding frame rate while scrolling (SC-009)
- [X] T056 Compare against the Phase 1 "before" screenshots: no section retains the old cyan-on-grey visual language (SC-010)
- [X] T057 [P] Confirm every external anchor in the rendered DOM carries `rel="noopener noreferrer"`, and that no product with `url: null` rendered an `<a>`
- [X] T058 Delete the stale `files/cv (1).pdf` (already deleted in the working tree, not yet committed) and confirm `files/Andrew_Ayad_CV.pdf` is the only linked CV

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup — **blocks every user story**
- **User Stories (Phases 3–8)**: all depend on Phase 2. In priority order: US1 → US2 → US3 → US4 → US5 → US6
- **Polish (Phase 9)**: depends on every story you intend to ship

### User Story Dependencies

- **US1 (P1)**: after Phase 2. Depends on nothing else. This is the MVP.
- **US2 (P1)**: after Phase 2. Independent of US1, though it reuses the primitives layer.
- **US3 (P2)**: after Phase 2. **Soft dependency on US2** — T027 reuses the null-URL branch written in T023. Doing US3 first means writing that logic in `renderSideProjects()` and hoisting it later.
- **US4 (P2)**: after Phase 2. Fully independent. Needs `SITE_DATA.profile` (T016) for the photo.
- **US5 (P2)**: after Phase 2. Its token dependency already landed there. The reveal observer expects `[data-reveal]` shells from T010.
- **US6 (P3)**: after Phase 2. Fully independent.

### Within Each User Story

Data first (`js/data.js`), then the renderer (`js/main.js`), then the styles (`css/style.css`), then verification. Populating data before rendering means you can inspect `SITE_DATA` in the console before any DOM code exists.

### Parallel Opportunities

Genuinely parallel, because they write to different files or no files:

- **T002 + T003** — screenshots and the contrast gate
- **T044** — `data.js` edits while another developer works in `main.js` (risky if both edit `data.js`)
- **T049, T050, T051, T057** — all four are read-only checks over the finished code

Everything else in Phases 2–8 serializes on `index.html`, `css/style.css`, or `js/main.js`. Do not parallelize them.

---

## Parallel Example: Phase 9

```bash
# All four are read-only and touch nothing:
python specs/001-cv-portfolio-redesign/check-contrast.py
grep -nE '#[0-9a-fA-F]{6}' css/style.css | grep -v ':root' | grep -v 'data-theme'
grep -n 'innerHTML' js/main.js
grep -c 'rel="noopener noreferrer"' index.html
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup — T001–T003
2. Phase 2: Foundational — T004–T013 (**blocks everything**)
3. Phase 3: User Story 1 — T014–T019
4. **STOP and validate**: quickstart V1. A recruiter who never scrolls knows who Andrew is.
5. Deployable as-is. The remaining sections are empty shells, so hide them until filled.

### Incremental Delivery

Setup + Foundational → US1 (MVP, deploy) → US2 (work history verifiable, deploy) → US3 → US4 (site becomes actionable) → US5 (site gets its identity) → US6 (full CV depth) → Polish.

The natural stopping point for a first public deploy is after **US4**. At that point the site says who Andrew is, proves what he shipped, and lets a recruiter reach him. US5 and US6 make it good; US1–US4 make it work.

### Solo Developer Strategy

Ignore the `[P]` markers and work top to bottom. Commit at each checkpoint. The phase boundaries are the safe places to stop.

---

## Open tasks and why (implementation run, 2026-07-09)

55 of 58 tasks are done. Three cannot be honestly checked off from an automated browser session — they need hardware or an OS setting the agent cannot toggle:

- **T035** — verify WhatsApp and `mailto` on a **physical phone**. Emulators fake both handlers, so a passing emulator result would be meaningless. The `wa.me` and `mailto:` hrefs are confirmed correct in the DOM; what is unverified is that a real device hands them to the right app.
- **T042** — verify no flash of the wrong theme, frame by frame. The inline blocking head script sits above the stylesheet (the structural condition for passing), and theme persistence, `aria-pressed`, and the OS-preference fallback are all verified. What is unverified is the first *painted frame*, which needs a screen recording.
- **T055** — Slow 4G throttling with an FPS meter. Verified statically instead: zero Font Awesome requests remain, and the only third-party origin left is Google Fonts.

**Found during implementation, beyond the task list:**

- Two real bugs, both fixed. `grid-template-columns: minmax(320px, 1fr)` forced a horizontal scrollbar at a 320px viewport (an SC-008 failure) — fixed with `minmax(min(100%, …), 1fr)` across all four grids. The logo's crossbar was `#e6ede9`, invisible on the light background, because an SVG loaded through `<img>` cannot inherit `currentColor` — changed to the wood tone, legible on both themes.
- An error in the **specs themselves**: the CV names **ten** company products, not eleven. The "11+ applications" in the CV summary is a career total, not the named list. `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, and this file were corrected.
- `js/script.js` (the old theme and nav script) was deleted — nothing loaded it after the rewrite.

## Notes

- 58 tasks. No test tasks — see the Tests note at the top and plan.md → Complexity Tracking.
- All ten company products and both side projects ship with `url: null`. The renderer handles it. Supplying a URL later is one line in `js/data.js` — that is what T025 step 3 verifies.
- The single most likely regression is a **flash of the wrong theme** (T007, verified by T042). It happens the moment someone "cleans up" the inline head script by moving it to `main.js` or adding `defer`. It must stay inline, synchronous, and above the stylesheet.
- The second most likely regression is a **dropped skill** in T043. Nine categories, dozens of technologies, and no test will catch an omission. Diff against the CV.
- Commit after each task or logical group. Stop at any checkpoint to validate.
