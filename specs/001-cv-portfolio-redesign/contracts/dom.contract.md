# Contract: DOM & rendering

What `index.html` guarantees to `js/main.js`, and what the rendered page guarantees to a visitor, a screen reader, and a search crawler.

## Document skeleton

```html
<html lang="en">            <!-- data-theme stamped by the inline head script, pre-paint -->
<head>
  <!-- 1. inline theme script (blocking, before the stylesheet — see research R4) -->
  <!-- 2. preconnect + Google Fonts, display=swap -->
  <!-- 3. css/style.css -->
</head>
<body>
  <svg hidden>…<symbol id="icon-*">…</symbol>…</svg>   <!-- sprite, ~2KB, no request -->

  <a class="skip-link" href="#main">Skip to content</a>

  <header class="nav">…</header>

  <main id="main">
    <section id="hero">        <!-- STATIC markup. Not rendered from JS. -->
    <section id="summary">     <!-- STATIC. The SC-001 payload. -->
    <section id="experience"   data-render="experience">
    <section id="side-projects" data-render="sideProjects">
    <section id="skills"       data-render="skills">
    <section id="education"    data-render="education">
    <section id="contact"      data-render="contact">
  </main>

  <footer>…</footer>

  <script src="js/data.js"></script>
  <script src="js/main.js" defer></script>
</body>
```

## Rules

**Hero and summary are static markup.** They contain the name, title, photo, and the full professional summary as literal HTML text. They must paint without waiting for any script — this is SC-001 (ten-second comprehension) and it is not negotiable. Every other section is rendered from `SITE_DATA` into its `[data-render]` shell.

This means the profile name, title, and summary appear in *two* places: `index.html` and `SITE_DATA.profile`. That duplication is deliberate and is the one exception to the single-source rule. The renderer must not overwrite the static hero; `SITE_DATA.profile` exists for the contact section, the `<title>`, and the meta description.

**Section shells carry `[data-reveal]`.** The reveal observer selects `[data-reveal]`, adds `.is-visible` on first intersection, then unobserves. Initial-hidden styles are scoped under `html.js-reveal`, a class `main.js` adds on boot, so a script failure leaves everything visible (FR-024).

**Every external anchor** carries `target="_blank"` and `rel="noopener noreferrer"` (FR-014).

**A product with `url: null`** renders as `<span class="product__name">`, not an anchor. No `href`, no `aria-disabled`, no visual hint that a link is missing (FR-006).

## Accessibility contract

| Requirement | Guarantee |
|---|---|
| FR-026 keyboard | Focus order follows DOM order. Skip link first. Mobile nav is a `<button aria-expanded>` controlling a `<ul id>`, and `Escape` closes it, returning focus to the trigger. |
| FR-026 focus visible | `:focus-visible` outline, `2px solid var(--accent)`, `outline-offset: 2px`. Never `outline: none` without a replacement. |
| FR-027 images | `<img alt>` on the photo, non-empty and descriptive. Decorative sprite icons carry `aria-hidden="true"` and `focusable="false"`. |
| Icon-only buttons | Theme toggle and copy button carry `aria-label`. The toggle updates `aria-label` and `aria-pressed` on switch. |
| Copy confirmation | An `aria-live="polite"` region announces "Email address copied". A silent icon swap is not enough. |
| Headings | One `<h1>` (the name). Each section opens with `<h2>`. No level skipped. |
| FR-021 scroll offset | `scroll-margin-top` on each section equals the nav height, so a jumped-to heading is never hidden behind the fixed header. |

## Motion contract

| Condition | Behavior |
|---|---|
| Default | Sections fade + rise 1.5rem over `--dur-base`, once, on first intersection. |
| `prefers-reduced-motion: reduce` | All durations collapse to `0.01ms`, transforms neutralized, `scroll-behavior: auto`. Content is immediately visible. No parallax, no reveal. (FR-023, SC-007) |
| JavaScript disabled or failed | `html.js-reveal` is never added; the initial-hidden rule never matches; every section renders visible. (FR-024) |
| Element already scrolled past on load | Observer fires immediately on observe, so it reveals rather than staying hidden. |

## Theming contract

`data-theme` is `"dark"` or `"light"`, stamped on `<html>` before first paint by the inline head script. Every color in the stylesheet resolves through a custom property defined once on `:root` and overridden under `[data-theme="light"]`. No component references a raw color value.

The toggle writes to `localStorage.theme`. On `QuotaExceededError` or a `SecurityError` (Safari private mode), the write is swallowed and the theme still switches for the session (spec edge case).

## What this contract forbids

- `innerHTML` with any value that traces back to `SITE_DATA`. Use `textContent`.
- Any raw hex color, `px` font-size, or `px` spacing value outside the token block (FR-018).
- Any network request beyond: the stylesheet, two scripts, the Google Fonts CSS + woff2, the profile image, and the CV PDF on demand. No analytics, no icon CDN, no form endpoint (FR-011a).
- Any element that renders a link for a product whose `url` is `null`.
