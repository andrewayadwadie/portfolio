# Contract: DOM, Motion Hooks & Navigation

Extends `specs/001-cv-portfolio-redesign/contracts/dom.contract.md`. Rules there that aren't overridden here still apply: no `innerHTML`, external anchor attributes, a single h1, the accessibility table.

## Document skeleton

```html
<html lang="en" data-theme="…" class="intro-full|intro-short (set pre-paint)">
<head>
  <!-- 1. inline script: theme + intro mode (sessionStorage), before paint -->
  <!-- 2. fonts --> <!-- 3. css/style.css --> <!-- 4. css/motion.css -->
</head>
<body>
  <svg hidden>…symbols incl. new #icon-globe, #icon-arrow-up…</svg>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="scroll-progress" aria-hidden="true"></div>

  <header class="nav">
    <a class="nav__logo" href="#hero">…</a>
    <ul class="nav__list" id="nav-list">            <!-- built from SITE_DATA.sections -->
      <li><a href="#summary" data-nav>Summary</a></li> …
      <span class="nav__pill" aria-hidden="true"></span>
    </ul>
    …theme toggle, menu toggle (unchanged ids)…
  </header>

  <main id="main">
    <section id="hero" class="hero">                 <!-- STATIC -->
      <div class="hero__bg" aria-hidden="true"><i class="blob blob--1"></i><i class="blob blob--2"></i><i class="blob blob--3"></i></div>
      … h1 name · p.hero__headline · ul.hero__contact · .hero__actions · .hero__portrait …
    </section>
    <section id="summary"    data-section>             <!-- STATIC (summary + stats) -->
    <section id="experience" data-section data-render="experience">
    <section id="skills"     data-section data-render="skills">
    <section id="education"  data-section data-render="education">
    <section id="languages"  data-section data-render="languages">
    <section id="contact"    data-section data-render="contact">
  </main>

  <footer>…</footer>
  <button class="to-top" type="button" aria-label="Back to top" data-magnetic hidden>…</button>
  <div class="toast" role="status" aria-live="polite"></div>   <!-- replaces #live-region -->

  <script src="js/data.js" defer></script>
  <script src="js/main.js" defer></script>
  <script src="js/motion.js" defer></script>
  <script src="js/cursor.js" defer></script>
</body>
```

The `#side-projects` section and its nav link are removed.

## Section head (every `[data-section]`)

```html
<div class="section__head" data-reveal-group>
  <span class="section__index" aria-hidden="true">02</span>
  <h2 id="experience-title" tabindex="-1" data-reveal="mask">Professional Experience</h2>
</div>
```

There's no lead paragraph and no editorial h2. The heading text is `SITE_DATA.sections[i].heading`.

## Motion attribute API

| Attribute / class | Set by | Meaning |
|---|---|---|
| `data-reveal-group` | markup / renderers | the unit the observer watches. Gets `.is-visible` once |
| `data-reveal="fade-up\|mask\|clip\|line\|count"` | markup / renderers | the effect for this element ([research R4](../research.md#r4--motion-language-fr-013)) |
| `style="--i:N"` | `motion.js` | sibling index within the group, capped at 8, sets the stagger delay |
| `data-count="10" data-suffix="+"` | static summary markup | count-up target. Final value already in the text for no-JS |
| `data-magnetic` | markup / renderers | the cursor magnetic effect applies |
| `data-cursor="hover"` | markup / renderers | cursor hover state on non-link elements (e.g. product cards) |
| `html.js-motion` | `motion.js` boot (skipped under reduced motion) | turns on the hidden starting styles for `[data-reveal]` |
| `html.intro-full / intro-short / intro-done` | head script / `motion.js` | landing intro mode ([R9](../research.md#r9--intro-sequence-fr-011-clarified-full-once-per-session)) |
| `html.has-cursor` | `cursor.js` | custom cursor active. Native cursor hidden except over text |
| `html.bg-paused` | `motion.js` | pauses blob keyframes (tab hidden or hero off-screen) |

**Invariant**: every hidden starting style is under `html.js-motion` or `html.intro-*`. Without those classes the page is fully visible and static.

## Events

| Event | Fired by | Consumed by |
|---|---|---|
| `site:rendered` (CustomEvent on `document`) | `main.js`, after every `[data-render]` section is filled | `motion.js`, `cursor.js`: initialise only after this |

## Navigation contract (FR-016)

| Trigger | Behaviour |
|---|---|
| Click `a[href^="#"]` that matches a known section or `#hero` | close the mobile menu → `pushState` → smooth scroll (instant under reduced motion) → focus that section's h2 with `preventScroll` → reveal groups up to the target are forced visible |
| `popstate` | same as a click, without `pushState` |
| Load with a known hash | force-reveal groups up to the target, then scroll to it (no intro delay before the target is visible) |
| Load with an unknown hash | stay at the top, `replaceState` to a URL with no hash |
| Scroll-spy (middle band of the viewport) | `aria-current="true"` on the matching nav link, pill animates to it, `replaceState` the hash (`#hero` → no hash) |
| Section offset | `scroll-margin-top: calc(var(--nav-h) + var(--space-4))` on `[data-section]` and `#hero` |

## Accessibility additions

| Concern | Guarantee |
|---|---|
| Split headings | Words wrapped in `<span class="w"><span>word</span></span>` built from text nodes. Spaces stay real text nodes, so the accessible name doesn't change |
| Cursor elements | `aria-hidden="true"`, `pointer-events:none`. Never focusable |
| Magnetic | pointer only. Keyboard focus never moves an element |
| Back-to-top | real `<button>` with `aria-label`, 44×44, visible focus ring |
| Toast | `role="status"`. Copy confirmation text is announced |
| Active nav | `aria-current="true"` (not just a color) |
| Reduced motion | no splitting, no count animation, no cursor, no intro, still blobs, instant scroll |
