# Feature Specification: CV-Faithful Portfolio Redesign with Full Motion System

**Feature Branch**: `002-cv-motion-redesign`

**Created**: 2026-11-24

**Status**: Draft

**Input**: User description: "rewrite files in folder files and based on data exist in cv redesign all project and loop in whole sections and edit it all to be typically like cv in pdf change every single data , make every title,text,button,image,scroll,route and navigate work with animation and choose style of animation based on style of portofoio and don't forget responsive and make style and animation for landing page and cursor use /design"

## Context

The CV in `files/` (`Andrew_Ayad_Flutter_Developer_CV.pdf` / `.docx`) was replaced in the latest commit, but the portfolio content still reflects the previous CV. Material differences between the current site and the new CV include:

| Area | Current site | New CV (source of truth) |
|------|--------------|--------------------------|
| Headline | "Senior Mobile Application Engineer" / "Flutter Developer \| Dart" | "Senior Flutter Developer \| Mobile Application Engineer \| Dart" |
| Summary | 11+ apps, "~30%" claims, fintech-adjacent wording | 10 production apps; PayFort/Paymob, Firebase, Google Maps; no percentage claims |
| Noor Data Network | 5 bullets, ~30% claim | 7 bullets incl. PayFort/Paymob, GitHub Actions CI/CD and testing; no percentage claim |
| WABC Group | "4 mission-critical apps", GetX "minimal memory leaks" | 3 government apps + Arganzwina; offline sync, media capture, map tracking bullet |
| Innovation Agency | "Led", "on-device intelligence" wording | Revised wording of all four bullets |
| Skills | 9 groups; includes Native Android, Node.js/Next.js, Supabase, LLM APIs | 10 groups; adds Cubit, Offline Data Sync, Camera & Media Upload, Localization (Arabic/English, RTL), and a new "Payments & Monetization" group; drops Native Android, Node/Next, Supabase, LLM APIs |
| Core competencies | 13-item list | Not present in CV |
| Side projects | Glowy, ClinicQ | Not present in CV |
| Contact | WhatsApp, email, LinkedIn, GitHub | Adds personal website `andrewayad.online` |
| Education | "Year 2019" | "Graduated 2019" |
| Languages | English: "Professional Working Proficiency" | English: "Good (technical reading & writing)" |

## Clarifications

### Session 2026-11-24

- Q: Side projects (Glowy, ClinicQ) are on the site but not in the new CV — remove or keep? → A: Remove the section entirely so the site matches the CV exactly.
- Q: Does "typically like the CV in PDF" mean the content, or the visual layout too? → A: Keep the portfolio visual identity (dark-green, cards, timeline), but use the CV's exact section headings, order, and wording; drop the extra taglines and lead-in text.
- Q: What should the moving landing background look like? → A: Soft blurred blobs of green and warm bronze drifting slowly behind the content, with a faint grain texture.
- Q: What should the custom cursor look like and do? → A: Small accent dot tracking the pointer exactly, plus a thin trailing ring that grows over interactive elements (dot fades); primary buttons gently lean toward the cursor (magnetic effect).
- Q: Should the landing intro play on every visit or only once? → A: Full intro once per browser session; later loads/reloads in the same session get a short, light fade-up entrance.

This feature brings every word on the site into line with the CV and layers a coherent motion system, a styled landing experience, and a custom cursor over the whole page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor reads exactly what the CV says (Priority: P1)

A recruiter has the PDF CV open in one tab and the portfolio in another. Section by section — header, summary, experience, skills, education, languages — the portfolio shows the same headings, the same order, and the same words. Nothing on the site contradicts or overstates the CV, and nothing in the CV is missing from the site.

**Why this priority**: A portfolio that disagrees with the CV damages credibility more than any visual flaw. This story alone, shipped without any new animation, is a complete and valuable release.

**Independent Test**: Place the CV text and the rendered page side by side and compare every field: name, headline, location, phone, email, website, LinkedIn, GitHub, summary, each employer's name/location/dates/role/bullets/key products, each skill group and item, education lines, and language levels.

**Acceptance Scenarios**:

1. **Given** the site is loaded, **When** a visitor reads the hero, **Then** the name reads "Andrew Ayad Wadie" and the headline reads "Senior Flutter Developer | Mobile Application Engineer | Dart".
2. **Given** the summary section, **When** compared with the CV's Professional Summary, **Then** the text matches word for word (10 production apps, PayFort/Paymob, Firebase, Google Maps, Saudi ministries, AI-assisted tooling).
3. **Given** the experience section, **When** compared with the CV, **Then** each of the three roles shows the CV's exact bullets in the CV's order, and its key products with their CV descriptions.
4. **Given** the skills section, **When** compared with the CV, **Then** it shows all ten CV skill groups in CV order — including "Payments & Monetization" — and no item that the CV lacks.
5. **Given** the contact area, **When** a visitor scans it, **Then** phone/WhatsApp, email, website (andrewayad.online), LinkedIn, and GitHub are all present and working.
6. **Given** the languages area, **When** read, **Then** it shows "Arabic: Native" and "English: Good (technical reading & writing)".

---

### User Story 2 - Visitor experiences a polished, animated landing (Priority: P1)

On first load, the visitor sees a short, branded intro: the name, headline, and photo animate into place in a choreographed sequence that matches the portfolio's calm, premium dark-green aesthetic. The landing area has its own distinct visual treatment (background depth, subtle ambient motion) and clear calls to action (Download CV, Contact). The intro never blocks reading for more than a moment.

**Why this priority**: The landing is the first impression and the user explicitly asked for its own style and animation.

**Independent Test**: Hard-reload the page on desktop and mobile; time from first paint until name, headline, and primary CTAs are fully readable and interactive.

**Acceptance Scenarios**:

1. **Given** a first visit, **When** the page loads, **Then** the name, headline, photo, and CTAs enter in a staggered sequence and are fully visible and clickable within 1.5 seconds.
2. **Given** the landing is visible, **When** the visitor does nothing, **Then** an ambient background effect plays subtly without distracting from text or causing layout shift.
3. **Given** a visitor clicks or presses a key during the intro, **When** the intro is still running, **Then** it completes immediately to its final state.
4. **Given** the visitor has already seen the intro in this browser session, **When** they reload or return to the page, **Then** the landing appears with a short fade-up (≤0.5s) instead of the full intro.

---

### User Story 3 - Every element responds with consistent motion (Priority: P2)

As the visitor scrolls and interacts, every section title, paragraph, list, card, image, and button animates in a single consistent visual language: section titles reveal, text and list items appear in sequence, images reveal gracefully, buttons respond to hover/focus/press, and the page shows scroll progress. Clicking a navigation link glides smoothly to the target section, the active nav item updates, and the URL reflects the current section so it can be shared or revisited.

**Why this priority**: Explicitly requested ("every title, text, button, image, scroll, route and navigate"), but the site remains fully usable without it.

**Independent Test**: Scroll from top to bottom and confirm each element type has an entrance animation; use every nav link, the browser back/forward buttons, and a deep link to a section.

**Acceptance Scenarios**:

1. **Given** any section enters the viewport, **When** it becomes ~15% visible, **Then** its title, text, list items, cards, and images animate in with a consistent style and staggered timing, each element only once per page load.
2. **Given** any button or link, **When** hovered, focused, or pressed, **Then** it gives visible animated feedback, and keyboard focus feedback is at least as visible as mouse hover feedback.
3. **Given** a visitor clicks a navigation item, **When** the page moves, **Then** it scrolls smoothly to the section, the heading is not hidden under the fixed navigation, the active nav indicator animates to the new item, and the address bar updates to that section.
4. **Given** a visitor opens a deep link (e.g. `…/#experience`) or uses back/forward, **When** the page responds, **Then** it lands on the right section with the same animated transition and the correct active nav state.
5. **Given** the visitor scrolls, **When** progress changes, **Then** a scroll-progress indicator reflects position, and a "back to top" control appears after the first screen and animates back to the landing.

---

### User Story 4 - Desktop visitor sees a custom cursor (Priority: P2)

On a device with a fine pointer (mouse/trackpad), the system cursor is complemented by a custom cursor in the portfolio's accent color that follows the pointer smoothly, grows or changes state over interactive elements (links, buttons, cards), and gives feedback on press.

**Why this priority**: Explicitly requested signature detail; desktop-only enhancement.

**Independent Test**: On desktop, move the pointer across text, links, buttons, and cards; press and release; move the pointer out of the window. On a touch device, confirm no custom cursor appears.

**Acceptance Scenarios**:

1. **Given** a fine-pointer device, **When** the pointer moves, **Then** the custom cursor follows with smooth, lag-free trailing motion.
2. **Given** the pointer is over an interactive element, **When** hovering, **Then** the trailing ring enlarges and the dot fades, primary buttons lean slightly toward the pointer, and all of it returns to rest when leaving.
3. **Given** a touch-only device, or a visitor with reduced-motion enabled, **When** the page loads, **Then** no custom cursor is rendered and the native cursor/behavior is used.
4. **Given** text fields or selectable text, **When** hovered, **Then** text selection and the text cursor still work normally.

---

### User Story 5 - Visitor on any screen size gets a first-class layout (Priority: P2)

Every section — including the landing, experience timeline, skills groups, and contact — adapts from small phones to wide desktops, with animations adapted to each size (smaller travel distances on mobile, no hover-only information).

**Independent Test**: Review at 320, 375, 768, 1024, 1440, and 1920px widths in both themes.

**Acceptance Scenarios**:

1. **Given** any width from 320px to 1920px, **When** the page renders, **Then** there is no horizontal scroll, no overlapping or clipped text, and tap targets are at least 44×44px on touch devices.
2. **Given** a mobile viewport, **When** the menu opens or closes, **Then** it animates in and out and every menu link triggers the same animated navigation as on desktop.

---

### Edge Cases

- **Reduced motion**: With the OS "reduce motion" setting on, all entrance, scroll, cursor, and ambient animations are disabled or replaced by instant/opacity-only transitions; all content is visible immediately.
- **Scripting disabled or failed**: All CV content remains visible and readable; nothing stays hidden waiting for an animation.
- **Fast scrolling / jumping via deep link**: Sections skipped over do not leave content stuck invisible; content at the landing point is visible immediately.
- **Unknown section in the URL** (e.g. `#foo`): Page loads at the top normally.
- **Theme switch mid-animation**: Theme changes animate smoothly and do not restart or break in-progress animations.
- **Very long words** (e.g. "El Imam Mady Abo El Azaym University App", long skill items) wrap cleanly on 320px screens.
- **Pointer leaves the window**: The custom cursor hides; it reappears on return.
- **Background tab**: Ambient animations pause when the page is not visible.
- **CV download**: The download control still delivers the current PDF in `files/`.

## Requirements *(mandatory)*

### Functional Requirements

**Content fidelity (CV as single source of truth)**

- **FR-001**: The site MUST present every field of the CV in `files/Andrew_Ayad_Flutter_Developer_CV.pdf`, with wording identical to the CV, in the CV's section order: Header → Professional Summary → Professional Experience → Technical Skills → Education → Languages.
- **FR-002**: The header/landing MUST show name, headline, location, phone, email, website (andrewayad.online), LinkedIn, and GitHub exactly as in the CV.
- **FR-003**: Each experience entry MUST show company, location, dates, role, the CV's bullets in order, and the CV's "Key products" with their descriptions.
- **FR-004**: The skills section MUST show all ten CV skill groups with their exact items, in CV order, and MUST NOT show items absent from the CV.
- **FR-005**: Content not present in the CV MUST be removed from the site, including the "core competencies" list and any statistic or claim the CV does not make (e.g. "11+ apps", "~30%").
- **FR-006**: The Side Projects section (Glowy, ClinicQ) MUST be removed entirely — including its navigation item and its data — so the site matches the CV exactly.
- **FR-007**: All displayed content MUST continue to come from a single central content source, so future CV edits require changing only that source.
- **FR-008**: Section headings and navigation labels MUST use the CV's section names (Professional Summary, Professional Experience, Technical Skills, Education, Languages, plus Contact). Editorial taglines and lead-in sentences not present in the CV (e.g. "Architecture, performance, and shipped software.") MUST be removed. The visual identity (dark-green palette, cards, experience timeline) is retained; the site is not restyled as a paper document.
- **FR-009**: The CV download/view actions MUST point to the current CV file in `files/`.

**Landing**

- **FR-010**: The landing MUST have a distinct visual treatment — an ambient background of large, soft, blurred color blobs in the accent green and warm bronze, drifting slowly behind the content, with a faint grain texture (adapted to each theme) — and a choreographed intro sequence for photo, name, headline, contact row, and CTAs. The background MUST keep all landing text at WCAG AA contrast.
- **FR-011**: The intro MUST make primary content readable and interactive within 1.5 seconds and MUST be skippable by any click or key press. The full intro plays only on the first page load of a browser session; subsequent loads and reloads in the same session use a short, light fade-up entrance (no more than 0.5 seconds).
- **FR-012**: The landing MUST offer primary actions: Download CV and Contact, plus quick links to LinkedIn, GitHub, email, and WhatsApp.

**Motion system**

- **FR-013**: The site MUST define one motion language (shared durations, easings, distances, stagger) matching the portfolio's calm, premium style — smooth fades, short upward rises, soft scale and clip reveals; no bouncy, spinning, or flashing effects.
- **FR-014**: Every section title, body text block, list item, card, tag/chip, image, and button MUST have an entrance animation triggered on scroll, run once per page load.
- **FR-015**: Every interactive control (buttons, links, chips, nav items, theme toggle, menu toggle, copy controls) MUST have animated hover, focus, and pressed states.
- **FR-016**: In-page navigation MUST scroll smoothly to the target section, offset for the fixed navigation, update the URL fragment, animate the active-nav indicator, and support back/forward and deep links.
- **FR-017**: The site MUST show a scroll-progress indicator and an animated back-to-top control that appears after the landing.
- **FR-018**: The mobile menu, theme switch, and copy-to-clipboard confirmation MUST animate.
- **FR-019**: When the "reduce motion" preference is set, all non-essential motion MUST be disabled and all content shown immediately.
- **FR-020**: Animations MUST NOT cause layout shift, and MUST NOT hide content permanently if scripting fails.

**Custom cursor**

- **FR-021**: On fine-pointer devices, the site MUST render a custom cursor in the accent color made of two parts: a small dot that tracks the pointer exactly, and a thin ring that trails it smoothly. Over interactive elements the ring enlarges and the dot fades; on press the ring briefly contracts. Primary buttons and the landing CTAs MUST lean gently toward the pointer (magnetic effect, a few pixels at most) and settle back when it leaves.
- **FR-022**: The custom cursor MUST NOT appear on touch-only devices or under reduced motion, MUST hide when the pointer leaves the window, and MUST NOT interfere with clicking, text selection, or keyboard use.

**Responsive & quality**

- **FR-023**: All sections MUST render correctly from 320px to 1920px wide in both dark and light themes, with no horizontal scrolling.
- **FR-024**: Animation distances and staggering MUST scale down on small screens; no information may be available only on hover.
- **FR-025**: Existing qualities MUST be preserved: dark/light themes with persistence, WCAG AA contrast, visible keyboard focus, semantic headings, and alt text for the profile photo.

### Key Entities

- **Profile**: name, headline, location, summary, photo, CV file reference.
- **Contact channel**: kind (phone/WhatsApp, email, website, LinkedIn, GitHub), display value, link.
- **Experience entry**: company, location, start/end dates, role, ordered bullets, key products.
- **Product**: name, short description, optional public link.
- **Skill group**: category name and ordered list of skills (ten groups per CV).
- **Education**: degree, faculty, institution, graduation year, graduation project, grade.
- **Language**: language name and proficiency level.
- **Motion token set**: named durations, easings, distances, and stagger values shared by every animation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A side-by-side audit finds 100% of CV fields present on the site, 0 wording mismatches, and 0 claims not found in the CV.
- **SC-002**: Name, headline, and primary CTAs are readable and clickable within 1.5 seconds of first paint on a mid-range phone.
- **SC-003**: 100% of titles, text blocks, list items, cards, images, and buttons have an entrance or interaction animation (verified by element-type checklist).
- **SC-004**: Every navigation path (nav click, mobile menu, deep link, back/forward, back-to-top) lands on the correct section with its heading fully visible, 100% of the time.
- **SC-005**: Scrolling the full page stays visually smooth (no visible stutter) on a mid-range phone and a standard laptop.
- **SC-006**: No horizontal scroll and no clipped text at 320, 375, 768, 1024, 1440, and 1920px in both themes.
- **SC-007**: With reduce-motion enabled, all content is visible on load with zero entrance animations and no custom cursor.
- **SC-008**: Cumulative layout shift caused by animations is effectively zero (below 0.05).
- **SC-009**: All text/background pairs continue to meet WCAG AA contrast in both themes.

## Assumptions

- **"Rewrite files in folder files"** is interpreted as: the CV files in `files/` are the source of truth and the site is rewritten from them; the CV files themselves are not edited.
- **"Use /design"** refers to applying a design pass; no `/design` command exists in this project, so the existing token-based design system (dark-green palette derived from the profile photo, Sora/Inter typography) is extended with motion tokens rather than replaced.
- **"Route and navigate"** refers to in-page section navigation within the single-page site; no additional pages are introduced.
- The existing technical constraints from feature 001 continue: static site, no build step, no framework or third-party animation dependencies, works offline once loaded.
- The phone number doubles as the WhatsApp contact, as on the current site.
- Product listing links remain unlinked unless URLs are provided; no URL is guessed.
- The CV's "Key products" stay attached to their employer, as in the CV.
- Animation style choice: calm/premium (fade + short rise, soft clip reveals for images and headings, gentle stagger, accent-colored highlights) to match the existing restrained dark-green aesthetic.
