---

description: "Task list for CV-Faithful Portfolio Redesign with Full Motion System"
---

# Tasks: CV-Faithful Portfolio Redesign with Full Motion System

**Input**: Design documents from `/specs/002-cv-motion-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/site-data.contract.md, contracts/dom-motion.contract.md, quickstart.md

**Tests**: No TDD suite was requested. The two standard-library check scripts (`check-cv-sync.py`, `check-contrast.py`) are deliverables named in the plan, and they act as automated gates inside US1 and US2.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1–US5 from spec.md)
- Paths are relative to the repository root (static single-project site: `index.html`, `css/`, `js/`, `files/`, `images/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new files and wire them into the page.

- [X] T001 [P] Create `css/motion.css` containing only an `@layer motion { }` block and a header comment pointing to `specs/002-cv-motion-redesign/contracts/dom-motion.contract.md`
- [X] T002 [P] Create `js/motion.js` as a strict-mode IIFE that registers `document.addEventListener("site:rendered", init)` with an empty `init` (research R13)
- [X] T003 [P] Create `js/cursor.js` as a strict-mode IIFE that registers `document.addEventListener("site:rendered", init)` with an empty `init` (research R13)
- [X] T004 [P] Copy `specs/001-cv-portfolio-redesign/check-contrast.py` to `specs/002-cv-motion-redesign/check-contrast.py` and update its docstring run path
- [X] T005 Update `index.html` head and body tail: link `css/motion.css` after `css/style.css`, and load `js/data.js`, `js/main.js`, `js/motion.js` and `js/cursor.js` all with `defer`, in that order (contracts/dom-motion.contract.md "Document skeleton")

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared tokens, layer order, event plumbing and icons that every story relies on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 In `css/style.css`, change the layer statement to `@layer tokens, base, primitives, sections, motion;` and replace the Motion token block with `--dur-1..4`, `--ease-out`, `--ease-in-out`, `--rise`, `--stagger` and `--stagger-cap`, with the ≤720px overrides for `--rise`/`--stagger` (research R4). Keep the old `--dur-fast`/`--dur-base` names as aliases until Phase 8
- [X] T007 In `js/main.js`, dispatch `document.dispatchEvent(new CustomEvent("site:rendered"))` at the end of the `DOMContentLoaded` boot, after every `[data-render]` section is filled and theme and nav are initialised (contracts/dom-motion.contract.md "Events")
- [X] T008 [P] Add `#icon-globe` and `#icon-arrow-up` symbols to the SVG sprite in `index.html` (24×24, `currentColor`, same stroke style as the existing symbols)
- [X] T009 In `css/style.css`, add `scroll-margin-top: calc(var(--nav-h) + var(--space-4))` to `[data-section]` and `#hero`. Add `html { scroll-behavior: smooth }`, already overridden by the existing reduced-motion block

**Checkpoint**: The page loads unchanged, with no console errors, and both new scripts receive `site:rendered`.

---

## Phase 3: User Story 1 - Visitor reads exactly what the CV says (Priority: P1) 🎯 MVP

**Goal**: Every word on the site matches `files/Andrew_Ayad_Flutter_Developer_CV.docx`/`.pdf`, in CV section order, with nothing extra.

**Independent Test**: `python3 specs/002-cv-motion-redesign/check-cv-sync.py` exits 0, and the manual walk-through in quickstart.md "US1" passes.

### Gate for User Story 1

- [X] T010 [P] [US1] Write `specs/002-cv-motion-redesign/check-cv-sync.py` (standard library only: `zipfile`, `xml.etree`, `html`, `re`, `unicodedata`). It extracts the paragraphs of `word/document.xml`, normalises the text, builds a haystack from `js/data.js` + `index.html`, and applies every row of the fidelity table and the reverse banned-strings list in `contracts/site-data.contract.md`. It prints `FAIL <rule>: expected "<text>"` for each failure, exits 1 on any failure, and splits skill items on `, ` outside parentheses only (data-model.md `SkillGroup.skills`)

### Implementation for User Story 1

- [X] T011 [US1] Rewrite `js/data.js` to the shape in `contracts/site-data.contract.md` and update its header comment to cite the new contract. Populate:
  - `profile` (data-model.md `Profile.name`, `Profile.headline`, `Profile.location`, `Profile.summary`, `Profile.photo`, `Profile.photoAlt`, `Profile.cv`)
  - `profile.stats` (data-model.md `Profile.stats`, `Stat.value`, `Stat.suffix`, `Stat.label`)
  - `sections` (data-model.md `Section.id`, `Section.heading`, `Section.nav`, `Section.render`)
  - `contact`, in CV header order (data-model.md `ContactChannel.kind`, `ContactChannel.label`, `ContactChannel.value`, `ContactChannel.href`, `ContactChannel.icon`, `ContactChannel.copyable`)
  - `experience`, with the `Key products:` line moved into `products` (data-model.md `ExperienceEntry.company`, `ExperienceEntry.location`, `ExperienceEntry.start`, `ExperienceEntry.end`, `ExperienceEntry.role`, `ExperienceEntry.bullets`, `ExperienceEntry.products`, `Product.name`, `Product.description`, `Product.url`)
  - `skills`, all 10 groups (data-model.md `SkillGroup.category`, `SkillGroup.skills`)
  - `education` (data-model.md `Education.degree`, `Education.graduated`, `Education.faculty`, `Education.institution`, `Education.project`, `Education.grade`)
  - `languages` (data-model.md `Language.language`, `Language.level`)

  Delete `competencies` and `sideProjects`.
- [X] T012 [US1] Rewrite the `<head>` metadata in `index.html`: `<title>Andrew Ayad Wadie | Senior Flutter Developer</title>`, and a meta description built only from CV facts (5+ years, 10 production apps, Flutter/Dart, government/telecom/booking/e-commerce). No `11+`
- [X] T013 [US1] Rewrite the static `#hero` in `index.html`:
  - h1 `Andrew Ayad <span>Wadie</span>`
  - `p.hero__headline` = data-model.md `Profile.headline` word for word
  - `ul.hero__contact` with location, WhatsApp/phone, email, website, LinkedIn and GitHub (icons from the sprite; external anchors with `target="_blank" rel="noopener noreferrer"`)
  - `.hero__actions` with **Download CV** (`files/Andrew_Ayad_Flutter_Developer_CV.pdf`) and **Contact** (`#contact`)
  - the portrait

  Remove the "Open to senior Flutter roles" eyebrow and the `11+` meta
- [X] T014 [US1] Rewrite the static `#summary` in `index.html` as `data-section`, with a section head (`span.section__index` "01" `aria-hidden`, h2 `id="summary-title" tabindex="-1"` "Professional Summary"), the CV summary paragraph word for word, and a stats list of the three data-model.md `Profile.stats`, each with the final value already in the text plus `data-count`/`data-suffix`. Delete the old editorial h2 and the `~30%`/`11+` stats
- [X] T015 [US1] Replace the `<main>` section shells in `index.html` with `#experience`, `#skills`, `#education`, `#languages` and `#contact`, each with `data-section data-render="<key>"`. Delete `#side-projects`. Replace the hard-coded nav `<li>`s with an empty `<ul class="nav__list" id="nav-list">` and point the logo link at `#hero`
- [X] T016 [US1] In `js/main.js`, add `renderNav()`, which builds the nav `<li><a href="#id" data-nav>nav</a></li>` items from `SITE_DATA.sections` (data-model.md `Section.nav`). Replace `sectionHead()` so it renders `span.section__index` (zero-padded position in `sections`) plus an h2 with `id="<id>-title" tabindex="-1"` taken from `Section.heading`, with no eyebrow or lead
- [X] T017 [US1] Update `renderExperience()` in `js/main.js` to the new section head, CV bullets and a "Key products" list. Keep the null-URL rule in `renderProduct()` (data-model.md `Product.url`)
- [X] T018 [US1] Update `renderSkills()` in `js/main.js`: remove the competencies block and render the 10 groups as cards with chips in CV order (data-model.md `SkillGroup.category`, `SkillGroup.skills`)
- [X] T019 [US1] Split `renderEducation()` in `js/main.js` into an education-only card (degree, faculty, institution, "Graduated " + data-model.md `Education.graduated`, project, grade). Add a new `renderLanguages()` for the `#languages` section (data-model.md `Language.language`, `Language.level`) and register it in `RENDERERS`
- [X] T020 [US1] Update `renderContact()` in `js/main.js` to the new section head and the 5 channels, including the website with `#icon-globe` (data-model.md `ContactChannel.kind`, `ContactChannel.href`, `ContactChannel.icon`). Remove the "Let's build something" heading and the lead
- [X] T021 [US1] Delete `renderSideProjects()` and its `RENDERERS` entry from `js/main.js`
- [X] T022 [P] [US1] In `css/style.css`, delete the side-projects and competencies rules. Add `.section__index`, `.hero__headline`, `.hero__contact`, `.stats` (3-up) and `.langs-section` layout rules, and replace any `.section__eyebrow`/`.section__lead` usage
- [X] T023 [US1] Run `python3 specs/002-cv-motion-redesign/check-cv-sync.py` and fix every reported mismatch in `js/data.js` or `index.html` until it exits 0

**Checkpoint**: US1 is shippable on its own. The site is a static, CV-exact portfolio and the existing 001 reveal still works.

---

## Phase 4: User Story 2 - Visitor experiences a polished, animated landing (Priority: P1)

**Goal**: Drifting green and bronze gradient blobs with grain behind the hero, a choreographed intro once per session (a short fade on later loads) that can be skipped and finishes within 1.5s.

**Independent Test**: quickstart.md "US2" steps 1–5, plus `python3 specs/002-cv-motion-redesign/check-contrast.py` exits 0.

- [X] T024 [US2] Add `<div class="hero__bg" aria-hidden="true">` with three `<i class="blob blob--1|2|3">` inside `#hero` in `index.html`, placed first so it sits behind the content
- [X] T025 [P] [US2] In `css/motion.css`, style `.hero__bg` (absolute, `inset:0`, `overflow:hidden`, `pointer-events:none`, `z-index` below content):
  - three radial-gradient blobs (2 accent green, 1 `--accent-warm`), no `filter: blur`, with alpha capped at 0.35 dark / 0.22 light
  - `@keyframes` drifts of 18s/24s/30s, `alternate ease-in-out`, transform-only
  - a `::after` grain overlay using an inline SVG `feTurbulence` data-URI at 0.06/0.04 opacity
  - `html.bg-paused .blob { animation-play-state: paused }`

  (research R8)
- [X] T026 [US2] In `js/motion.js`, add `initBackgroundPause()`. It toggles `html.bg-paused` on `visibilitychange` and from an IntersectionObserver on `#hero` (paused when off-screen)
- [X] T027 [US2] Extend the inline `<head>` script in `index.html` to choose the intro mode before paint. When `prefers-reduced-motion` is off, it adds `intro-full` if `sessionStorage.introSeen` is unset, otherwise `intro-short`, and then sets `introSeen="1"`. If storage throws, it uses `intro-short` (research R9)
- [X] T028 [P] [US2] In `css/motion.css`, add the intro keyframes, scoped to `html.intro-full`, with `animation-fill-mode: both`. The sequence is: portrait clip-wipe (0–1100ms), h1 word mask (100–900ms), headline fade-up (350ms), contact-row stagger (450ms+), CTAs (600ms+), then the nav slides down (700ms). Everything is interactive by 1.2s. Also add `html.intro-short #hero > .container` (450ms fade-up) and `html.intro-done` (`animation: none` on every intro target)
- [X] T029 [US2] In `js/motion.js`, add `initIntro()`:
  - while an `intro-*` class is present, split the hero h1 into word spans (text nodes only)
  - the first `pointerdown`/`keydown` adds `intro-done`
  - remove the `intro-*` classes on the last `animationend`, or after a 1500ms backstop
- [X] T030 [US2] Extend `specs/002-cv-motion-redesign/check-contrast.py` with the hero composite pairs. For both themes, compute the worst-case background as `--accent` at max blob alpha over `--bg`, and `--accent-warm` at max alpha over `--bg`. Gate `text` and `text-muted` at 4.5 against each, then run the script and adjust the blob alpha in `css/motion.css` until it exits 0

**Checkpoint**: The landing intro and background work on top of the US1 content. Reduced motion shows a static hero.

---

## Phase 5: User Story 3 - Every element responds with consistent motion (Priority: P2)

**Goal**: Scroll reveals for every title, text block, list item, card, image and button. Animated states on every control. Hash-based section navigation with smooth scroll, scroll-spy pill, back/forward, deep links, scroll progress and back-to-top.

**Independent Test**: quickstart.md "US3" steps 1–7.

### Reveal system

- [X] T031 [P] [US3] In `css/motion.css`, add the reveal effects, all scoped to `html.js-motion`:
  - `[data-reveal="fade-up"]` (opacity + `translateY(var(--rise))`)
  - `mask` (`.w` overflow-clip with the inner span `translateY(110%)`)
  - `clip` (`clip-path: inset(0 0 100% 0)` + `scale(1.08)`)
  - `line` (`scaleX(0)`, origin left)
  - `[data-reveal-group].is-visible` resolves each to its final state with `transition-delay: calc(min(var(--i), var(--stagger-cap)) * var(--stagger))`

  Use transform, opacity and clip-path only (research R4, R5)
- [X] T032 [US3] Add `data-reveal-group`/`data-reveal` attributes to the static markup in `index.html`: the hero is handled by the intro; the summary head gets `mask`, the paragraph `fade-up`, stat items `fade-up`, stat numbers `count`. Remove the old section-level `data-reveal` attributes
- [X] T033 [US3] Add `data-reveal-group`/`data-reveal` attributes in `js/main.js`:
  - section heads: h2 `mask`
  - each job `article`: group; h3 `mask`; dates, role and location `fade-up`; each `li` `fade-up`; each product `fade-up` with `data-cursor="hover"`
  - each skill card: group, h3 `mask`, each chip `fade-up`
  - education and language cards: group, rows `fade-up`
  - contact: group, portrait `clip`, each channel `fade-up`
  - the timeline rail `line`
- [X] T034 [US3] In `js/motion.js`, add `initReveal()`. It returns early (no `js-motion`) under reduced motion. Otherwise it adds `html.js-motion`, splits every `[data-reveal="mask"]` heading into `<span class="w"><span>word</span></span>` with spaces kept as text nodes, sets `--i` on each `[data-reveal]` by sibling index within its group, and observes `[data-reveal-group]` (threshold 0.15, rootMargin `0px 0px -8% 0px`), adding `.is-visible` once and then unobserving. Delete the old `initReveal()` and `js-reveal` code from `js/main.js` and the old `[data-reveal]` rules from `css/style.css`
- [X] T035 [US3] In `js/motion.js`, add `initCountUp()`. When a stats group becomes visible, animate each `[data-count]` from 0 to its value over `--dur-4` with ease-out using rAF. Under reduced motion it leaves the static final text alone (data-model.md `Stat.value`, `Stat.suffix`)
- [X] T036 [US3] In `js/motion.js`, add `revealUpTo(sectionEl)`. It adds `.is-visible` to every `[data-reveal-group]` at or above the target section and unobserves them, so deep links and fast jumps never leave stranded hidden content

### Controls

- [X] T037 [P] [US3] In `css/motion.css`, add the control states:
  - `.btn`: −2px lift, `::before` fill sweep (scaleX), shadow step-up, `:active` scale 0.97; the primary button gets a sheen sweep
  - `:focus-visible`: animated ring with outline-offset going 6px → 2px
  - nav links: underline grows on hover
  - chips, products and cards: −2px lift, accent border, shadow
  - `@media (hover: none)` disables the lifts

  Every hover style has a matching `:focus-visible` (research R11)
- [X] T038 [P] [US3] In `css/motion.css`, animate the mobile menu: the panel uses `clip-path: inset(0 0 100% 0)` → `inset(0)` over `--dur-2`, and the links stagger fade-up via `--i` when `#nav-list[data-open="true"]`. The burger/close icon cross-fades and rotates
- [X] T039 [US3] Replace the copy-confirmation flow in `js/main.js` and `index.html`. Swap `#live-region` for `<div class="toast" role="status" aria-live="polite">`; the copy icon morphs to the check; the toast slides up with "Email address copied" and hides after 2s. Style `.toast` in `css/motion.css`
- [X] T040 [US3] In `js/motion.js`, add `initThemeTransition()`. It wraps the theme toggle so that, when `document.startViewTransition` exists and reduced motion is off, the switch runs inside a view transition whose `::view-transition-new(root)` animates `clip-path: circle()` from the toggle's centre (CSS in `css/motion.css`). Otherwise it falls back to `--dur-2` colour transitions. Expose a small hook from `js/main.js` `initTheme()` (e.g. a `theme:toggle-request` event) instead of duplicating the toggle logic

### Navigation & routing

- [X] T041 [US3] Add `<span class="nav__pill" aria-hidden="true">` inside `#nav-list` (from `renderNav()` in `js/main.js`), and style it in `css/motion.css` as absolutely positioned, with `transform`/`width` transitions on `--dur-2 var(--ease-in-out)`
- [X] T042 [US3] In `js/motion.js`, add `initScrollSpy()`. An IntersectionObserver with rootMargin `-45% 0px -50% 0px` over `#hero` and `[data-section]` sets `aria-current="true"` on the matching `[data-nav]` link (cleared for the hero), moves `.nav__pill` to that link's box, and calls `history.replaceState` with `#id` (no hash for the hero). It recomputes the pill on resize
- [X] T043 [US3] In `js/motion.js`, add `initHashNav()`, following contracts/dom-motion.contract.md "Navigation contract":
  - delegated click on `a[href^="#"]` for known ids: close the mobile menu, `pushState`, `revealUpTo`, `scrollIntoView` (smooth, or `auto` under reduced motion), then focus `#<id>-title` with `preventScroll`
  - `popstate` handled the same way without `pushState`
  - on load, a known hash gets `revealUpTo` + scroll; an unknown hash gets `replaceState` to no hash and stays at the top
- [X] T044 [P] [US3] Add `<div class="scroll-progress" aria-hidden="true">` after the skip link in `index.html`. Style it in `css/motion.css` (fixed below the nav, 2px, accent, `transform: scaleX(var(--progress, 0))`, origin left). Add `initProgress()` in `js/motion.js` (passive scroll listener + rAF throttle writing `--progress` on the element)
- [X] T045 [US3] Add `<button class="to-top" type="button" aria-label="Back to top" data-magnetic hidden>` with `#icon-arrow-up` before the scripts in `index.html`. Style it in `css/motion.css` (fixed bottom-right, 44×44, fade/rise in via `.is-shown`). In `js/motion.js`, remove `hidden` at boot, toggle `.is-shown` from the hero IntersectionObserver, and route the click through the `initHashNav` path to `#hero`

**Checkpoint**: Every element type animates, and every navigation path in quickstart.md US3 works.

---

## Phase 6: User Story 4 - Desktop visitor sees a custom cursor (Priority: P2)

**Goal**: An accent dot plus trailing ring that changes state over interactive elements, text and presses, with magnetic CTAs. Never shown on touch devices or under reduced motion.

**Independent Test**: quickstart.md "US4" steps 1–5.

- [X] T046 [P] [US4] In `css/motion.css`, style `.cursor__dot` (8px accent circle) and `.cursor__ring` (36px, 1.5px accent border), fixed, `pointer-events:none`, top z-index, transform-positioned. Add the states via `.cursor[data-state="hover|text|press|hidden"]`: hover scales the ring to 1.8 with an `--accent-soft` fill and dot opacity 0; text gives a narrow I-beam ring; press scales to 0.8; hidden sets opacity 0. Add `html.has-cursor { cursor: none }`, with `cursor: text` on `p, li, dd, h1, h2, h3` and `cursor: auto` on form controls (research R10)
- [X] T047 [US4] In `js/cursor.js`, implement `init()`:
  - enabled only when `(hover: hover) and (pointer: fine)` matches and reduced motion doesn't, re-checked on `change` of both media queries (build/teardown)
  - create the `aria-hidden` `.cursor` wrapper with the dot and ring, and add `html.has-cursor`
  - in `pointermove`, set the dot's transform synchronously and start a self-stopping rAF lerp (0.18) for the ring
  - delegated `pointerover`/`pointerout` on `a, button, [data-cursor="hover"]` → hover state, and on `p, li, dd` → text state
  - `pointerdown`/`pointerup` → press
  - `pointerleave`/`pointerenter` on the document → hidden/shown
- [X] T048 [US4] In `js/cursor.js`, add the magnetic effect for `[data-magnetic]`. On `pointermove` within the element, set `transform: translate()` to `(pointer − centre) × 0.25`, clamped to ±6px. On `pointerleave`, reset with a `--dur-2` transition. It never responds to focus or keyboard
- [X] T049 [US4] Add `data-magnetic` to the hero CTAs in `index.html` and to primary buttons rendered in `js/main.js` (contact channel links excluded)

**Checkpoint**: The cursor works on desktop. Touch emulation and reduced motion show no cursor and no `has-cursor`.

---

## Phase 7: User Story 5 - Visitor on any screen size gets a first-class layout (Priority: P2)

**Goal**: A correct layout and scaled-down motion from 320px to 1920px+ in both themes.

**Independent Test**: quickstart.md "US5" width × theme matrix, with no horizontal scroll and ≥44px tap targets.

- [X] T050 [P] [US5] In `css/style.css`, add the `@media (max-width: 480px)` rules (single-column skills; stats as a compact 3-up row; hero contact list wraps to 1 column; section padding reduced) and the `@media (min-width: 1600px)` rules (`--container: 1240px`, type steps scaled up) (research R12)
- [X] T051 [P] [US5] In `css/style.css`, add `overflow-wrap: anywhere` to `.product__name`, `.chip` and `.channel__value`, and make sure every interactive element in the ≤720px and `(pointer: coarse)` contexts has `min-block-size: 44px`/`min-inline-size: 44px`
- [X] T052 [P] [US5] In `css/motion.css`, under `@media (max-width: 720px)`, reduce the clip/mask travel and blob size (each blob ≤ 80vmax), and stack the hero background so it never causes horizontal overflow (`#hero { overflow: clip }`)
- [X] T053 [US5] Verify the layout at 320/375/768/1024/1440/1920 in both themes per quickstart.md "US5", and fix any overflow or clipping found in `css/style.css` or `css/motion.css`

**Checkpoint**: All five user stories work independently.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T054 [P] In `css/motion.css`, add the `@media (prefers-reduced-motion: reduce)` block: `[data-reveal]` in its final state, `.blob { animation: none }`, intro classes inert, no view-transition animation, `.cursor { display:none }`, instant progress (research R14). Then remove the now-redundant reveal overrides from the reduced-motion block in `css/style.css`
- [X] T055 [P] Remove the `--dur-fast`/`--dur-base` aliases from `css/style.css` after replacing their remaining uses with the `--dur-1..4` tokens (`grep -n "dur-fast\|dur-base" css/ js/` returns nothing)
- [X] T056 Run the quickstart.md "Edge cases" table (reduced motion, JS disabled, theme switch mid-reveal, long names at 320px, Lighthouse CLS < 0.05, 4× CPU scroll with no frames > 50ms) and fix any failures in `css/motion.css` or `js/motion.js`
- [X] T057 Re-run both gates, `python3 specs/002-cv-motion-redesign/check-cv-sync.py` and `python3 specs/002-cv-motion-redesign/check-contrast.py`, and confirm both exit 0. Then add a pointer comment at the top of `js/main.js` and `js/data.js` referencing `specs/002-cv-motion-redesign/contracts/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup, and blocks every story.
- **US1 (Phase 3, P1)**: Depends on Foundational. **MVP.**
- **US2 (Phase 4, P1)**: Depends on Foundational. Its hero markup edits (T024, T027) touch the same `#hero` as T013, so do them after T013.
- **US3 (Phase 5, P2)**: Depends on US1, because it adds reveal attributes to the renderers and markup that US1 rewrites.
- **US4 (Phase 6, P2)**: Depends on Foundational only for the cursor itself (T046–T048). T049 needs the hero CTAs from T013.
- **US5 (Phase 7, P2)**: Depends on US1–US4 markup existing, since it tunes their layout.
- **Polish (Phase 8)**: Depends on every story.

### Story Completion Order

```text
Setup → Foundational → US1 ─┬─→ US2 ─┐
                            ├─→ US3 ─┼─→ US5 → Polish
                            └─→ US4 ─┘
```

### Within Each Story

- US1: T010 (checker) can be written alongside T011–T022. T023 runs last.
- US2: markup (T024, T027) → CSS (T025, T028) → JS (T026, T029) → contrast gate (T030).
- US3: reveal CSS (T031) → attributes (T032, T033) → reveal JS (T034–T036) → controls (T037–T040) → navigation (T041–T045).
- US4: CSS (T046) → cursor JS (T047) → magnetic (T048) → attributes (T049).

---

## Parallel Opportunities

- **Setup**: T001–T004 all run in parallel (four different files).
- **Foundational**: T008 runs in parallel with T006/T007.
- **US1**: T010 (`check-cv-sync.py`) and T022 (`css/style.css`) run in parallel with the `js/data.js` → `index.html` → `js/main.js` chain.
- **US2 + US4**: once US1 is done, US2's `css/motion.css` blob/intro work (T025, T028) and US4's cursor (T046–T048, `js/cursor.js`) can go to different people. They only share `css/motion.css`, so commit those changes in separate sections of the file.
- **US3**: T031, T037, T038 and T044 are independent CSS blocks that can be written in parallel with each other.
- **US5**: T050, T051 and T052 run in parallel.

### Parallel Example: User Story 1

```text
Task: "T010 [US1] Write specs/002-cv-motion-redesign/check-cv-sync.py"
Task: "T022 [US1] Delete side-projects/competencies CSS and add new section styles in css/style.css"
Task: "T011 [US1] Rewrite js/data.js from the CV"   # then T012–T021 sequentially
```

### Parallel Example: User Story 3

```text
Task: "T031 [US3] Reveal effects in css/motion.css"
Task: "T037 [US3] Control interaction states in css/motion.css (separate block)"
Task: "T044 [US3] Scroll progress markup + CSS + initProgress()"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational.
2. Phase 3 (US1) → `check-cv-sync.py` exits 0.
3. **Stop and validate**: the site now matches the CV exactly. It can be deployed as-is.

### Incremental Delivery

1. US1 → deploy (content is correct).
2. US2 → deploy (landing intro and background).
3. US3 → deploy (motion everywhere, routing).
4. US4 → deploy (cursor).
5. US5 + Polish → final deploy.

Each increment leaves the page fully usable, because all motion is progressive enhancement.

---

## Notes

- [P] = different files and no dependency on incomplete tasks.
- Never use `innerHTML`. Every string from `SITE_DATA` goes through `textContent` (001 contract still applies).
- Never guess a product URL. `url: null` renders as plain text (data-model.md `Product.url`).
- Commit after each task or logical group, and stop at any checkpoint to validate that story on its own.
