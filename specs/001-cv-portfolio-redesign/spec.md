# Feature Specification: CV-Driven Portfolio Redesign

**Feature Branch**: `001-cv-portfolio-redesign`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "read @files/Andrew_Ayad_CV.pdf based on this cv redesign whole project use another design system and change whole project ui : - add my image add in contact whatsapp +201145678491 and mail to : andrewayad60@gmail.com - add my social add just linkedin and github and mail - add links of my projects in every company i worked on it and if you don't have link ask me - add section to my side project and add links of google play store link of glowy and clinicq - add section for my project - add section for contact us on mai - add animations for transaction and in every section - show my summary at the begaining of landing page - change colors of whole project based on profile imaged - add everything and every details on cv"

## Clarifications

### Session 2026-07-09

- Q: What kind of design system should replace the current one, and what delivery constraints apply? → A: Custom token-based CSS design system — CSS custom properties for color, type, space and elevation; modern CSS (grid, container queries, reduced-motion media query); vanilla JavaScript. No build step, no framework, no package dependencies.
- Q: Dark-only, or dark plus a light theme? → A: Dark default plus a full light theme. Both fully tokenized, both meeting the contrast bar. Visible toggle, choice persisted across visits.
- Q: Should "contact us on mail" be a `mailto` link or a form posted to a third-party service? → A: `mailto` only, opening the visitor's own mail client with recipient and subject prefilled, alongside a click-to-copy address. No form, no third-party service, no external dependency.
- Q: Twelve product listing URLs are not yet available. Block on them, guess them, or ship without? → A: Ship unlinked now, link later. All product data — including the optional listing URL — lives in one central data structure, so a product renders correctly with or without a URL and adding a link later requires no markup change. No URL is ever guessed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recruiter grasps the candidate in ten seconds (Priority: P1)

A recruiter opens the portfolio for the first time. Above the fold they see Andrew's photo, his name, his title (Senior Mobile Application Engineer / Flutter Developer), and his full professional summary rendered as readable prose — not a marketing tagline. Within one screen they know his seniority, years of experience, domains, and headline achievements, and they can reach his CV, contact details, and social profiles without hunting.

**Why this priority**: This is the entire purpose of the page. If a visitor bounces before understanding who Andrew is, every other section is wasted. This story alone, shipped standalone, is a viable portfolio.

**Independent Test**: Load the landing page on a fresh desktop and mobile viewport. Confirm the profile image, name, title, and complete professional summary are visible or reachable within the first scroll, and that primary actions (view CV, contact, socials) are present.

**Acceptance Scenarios**:

1. **Given** a visitor loads the site on a 1440px desktop viewport, **When** the hero renders, **Then** the profile image, name, professional title, and the professional summary text from the CV are all visible without scrolling past the first two screens.
2. **Given** a visitor loads the site on a 375px mobile viewport, **When** the hero renders, **Then** the same content is legible in a stacked layout with no horizontal scroll and no text truncation.
3. **Given** a visitor reads the hero, **When** they look for next actions, **Then** links to the CV, the contact section, LinkedIn, GitHub, and email are reachable from the hero or the persistent navigation.

---

### User Story 2 - Recruiter verifies work history and the shipped products (Priority: P1)

A recruiter scrolls to Experience. For each of the three employers (Noor Data Network, WABC Group, Innovation Agency) they see role, location, dates, and the achievement bullets from the CV. Under each employer the named products are listed as individual, clickable entries pointing at the live app store or web listing for that product, so the recruiter can verify the work rather than take it on trust. Where no public link exists for a product, the entry is still shown with its description but presented as unlinked rather than as a dead link.

**Why this priority**: Verifiable shipped work is the strongest hiring signal a mobile engineer has. Experience plus product links is what converts a skim into an interview.

**Independent Test**: Scroll to the Experience section. Confirm all three employers appear with correct dates and all ten named products are listed under the correct employer. Click every product link and confirm it resolves to a live listing. Confirm unlinked products render without a broken affordance.

**Acceptance Scenarios**:

1. **Given** the Experience section is rendered, **When** a visitor reads it, **Then** all three employers appear in reverse-chronological order with company name, location, role title, and date range exactly as stated in the CV.
2. **Given** an employer entry, **When** a visitor reads its product list, **Then** every product named in the CV for that employer is present with a one-line description of what it does.
3. **Given** a product with a known public listing, **When** a visitor activates it, **Then** the listing opens in a new browser tab and the original page remains open.
4. **Given** a product with no public listing, **When** a visitor sees it, **Then** it renders as plain informational content with no link affordance and no broken URL.

---

### User Story 3 - Visitor explores the independent products (Priority: P2)

A visitor reaches a dedicated Independent Products & Side Projects section, separate from employed work. Glowy (wallpaper app) and ClinicQ (clinic management platform) each get their own card describing the role held, the full stack used, and the notable engineering and monetization work, with a direct link to the live product listing.

**Why this priority**: Side projects prove end-to-end ownership — product, backend, store submission, monetization — which employer bullets cannot demonstrate. High value, but only after the visitor already trusts the professional history.

**Independent Test**: Scroll to the Side Projects section. Confirm both products render as distinct cards with stack, role, and achievements. Activate each link and confirm the correct live listing loads.

**Acceptance Scenarios**:

1. **Given** the Side Projects section, **When** it renders, **Then** Glowy and ClinicQ each appear as a distinct entry with role, stack, and the achievement bullets from the CV.
2. **Given** the Glowy entry, **When** a visitor activates its link, **Then** its public product listing opens in a new tab.
3. **Given** the ClinicQ entry, **When** a visitor activates its link, **Then** its public product listing opens in a new tab.
4. **Given** the Side Projects section, **When** compared to the Experience section, **Then** the two are visually and structurally distinct so a visitor never confuses employed work with independent work.

---

### User Story 4 - Visitor makes contact through their preferred channel (Priority: P2)

A visitor who wants to hire or collaborate reaches a Contact section offering Andrew's photo alongside four channels: WhatsApp at +20 114 567 8491, email to andrewayad60@gmail.com, LinkedIn, and GitHub. Each is a one-tap action from mobile. The email path opens a prefilled message in the visitor's own mail client rather than requiring them to fill in a form and trust a server.

**Why this priority**: A portfolio that impresses but cannot be acted upon has failed. This must work on the first tap, especially on mobile, where the majority of recruiter link-clicks originate.

**Independent Test**: On a mobile device, activate each of the four contact channels. Confirm WhatsApp opens a chat to the stated number, email opens the device mail client addressed to the stated address, and the two social links open the correct profiles in a new tab.

**Acceptance Scenarios**:

1. **Given** a visitor on a mobile device, **When** they activate the WhatsApp action, **Then** WhatsApp opens a conversation addressed to +20 114 567 8491.
2. **Given** a visitor on any device, **When** they activate the email action, **Then** their default mail client opens a new message addressed to andrewayad60@gmail.com with a relevant prefilled subject.
3. **Given** a visitor on a desktop with no mail client configured, **When** they activate the email action, **Then** the address remains visible on the page and a copy action places it on their clipboard with visible confirmation.
4. **Given** the Contact section, **When** a visitor scans it for social links, **Then** exactly three social destinations are offered — LinkedIn, GitHub, and email — and no others.

---

### User Story 5 - Visitor experiences a coherent, motion-aware visual identity (Priority: P2)

Every surface of the site is rebuilt on a single new design system whose palette is derived from Andrew's profile photograph: deep forest greens, near-black backgrounds, an emerald accent for interactive elements, and a warm wood-brown secondary. Sections reveal themselves as the visitor scrolls, navigation between sections is smooth rather than jarring, and interactive elements respond to hover and focus. The site respects a visitor's reduced-motion preference by disabling non-essential animation.

**Why this priority**: The visual system is what separates a memorable portfolio from a template. It is high value but must not block the content stories above it.

**Independent Test**: Load every section with an eyedropper and confirm rendered colors trace to the profile-image palette. Scroll the full page and observe reveal animations firing once per section. Enable the OS reduced-motion setting, reload, and confirm content is fully readable with animation suppressed.

**Acceptance Scenarios**:

1. **Given** any page section, **When** its colors are sampled, **Then** background, surface, text, and accent colors all resolve from the single palette derived from the profile image.
2. **Given** a visitor scrolls toward an unseen section, **When** that section enters the viewport, **Then** its content animates into place once and does not re-animate on subsequent scrolls past it.
3. **Given** a visitor activates a navigation link, **When** the page moves to the target section, **Then** the transition is smooth and the target heading is not hidden beneath the fixed navigation.
4. **Given** a visitor with the reduced-motion system preference enabled, **When** they load and scroll the page, **Then** all content is immediately visible and no reveal, parallax, or decorative motion plays.
5. **Given** any interactive element, **When** it receives keyboard focus, **Then** a visible focus indicator appears with sufficient contrast against its background.
6. **Given** a visitor switches to the light theme, **When** they reload the page or return on a later visit from the same device, **Then** the light theme is still applied and no flash of the dark theme occurs before it paints.

---

### User Story 6 - Visitor reviews the full technical and academic record (Priority: P3)

A technically minded visitor — an engineering manager or lead — finds the complete contents of the CV on the page: core competencies, the eight technical skill groups (languages and frameworks, state management, architecture, networking and data, testing, DevOps and delivery, AI-assisted development, mobile platform, tools), education with the graduation project and grade, and language proficiency. Nothing from the CV is omitted from the site.

**Why this priority**: Depth matters to the person who makes the technical yes/no call, but they only reach it after the recruiter screen. Last in the funnel, still mandatory.

**Independent Test**: Diff the site's rendered text against the CV document section by section. Confirm every named skill, every employer bullet, the education entry with grade, and both language proficiencies appear somewhere on the site.

**Acceptance Scenarios**:

1. **Given** the Skills section, **When** it renders, **Then** every technology named in the CV's Technical Skills block appears, grouped under its CV category heading.
2. **Given** the Education section, **When** it renders, **Then** the degree, faculty, university, year, graduation project title, and grade all appear.
3. **Given** the full page, **When** its text is compared against the CV, **Then** no CV line item is absent from the site.
4. **Given** a visitor wanting the source document, **When** they activate the resume action, **Then** the CV PDF opens or downloads.

---

### Edge Cases

- A product named in the CV has no public listing anywhere. It must still be described, rendered without a link, and must not display a broken or placeholder URL.
- A visitor on desktop with no registered `mailto` handler activates the email action. The address must remain readable and copyable on the page.
- A visitor on desktop activates the WhatsApp action. It must resolve to the web WhatsApp entry point rather than failing silently.
- A visitor loads the page with JavaScript disabled or failing. All CV content must remain readable — scroll-reveal must not leave sections permanently invisible.
- A visitor has the reduced-motion preference enabled. Every non-essential animation must be suppressed while content stays fully accessible.
- A visitor blocks persistent storage, so the theme choice cannot be saved. The toggle must still switch themes for the current visit, and the next visit must fall back to the OS preference without erroring.
- A returning visitor stored the light theme. The correct theme must paint on first frame, with no flash of the dark theme.
- The profile image fails to load. Layout must not collapse, and a meaningful alternative text must be announced.
- A visitor uses a 320px-wide viewport. No horizontal scrolling and no clipped text at any section.
- A visitor navigates the entire page by keyboard alone. Every link, button, and control must be reachable and visibly focused, in a logical order.
- An external listing URL later goes dead. The link must open in a new tab so the portfolio itself is never replaced by an error page.

## Requirements *(mandatory)*

### Functional Requirements

**Content fidelity**

- **FR-001**: The site MUST present every content item from the CV: professional summary, core competencies, all three employment entries with every achievement bullet, all named products, both independent products, all technical skill groups, education, and language proficiency.
- **FR-002**: The landing page MUST display the professional summary in full near the top of the page, before any other narrative section.
- **FR-003**: The site MUST display the profile photograph in the hero and again in the contact section.
- **FR-004**: Employment entries MUST appear in reverse-chronological order with company name, location, role title, and date range as stated in the CV.
- **FR-005**: Each employment entry MUST list its named products as discrete items, each with a short description of what the product does.
- **FR-006**: Each named product with a known public listing MUST link to that listing; each product without one MUST render as unlinked informational content, with no placeholder, no disabled link, and no "coming soon" affordance.
- **FR-006a**: Every product's data — name, description, owning context, and optional listing URL — MUST live in a single central data structure. Adding a URL later MUST require editing only that structure, never the markup or styles.
- **FR-006b**: A product's listing URL MUST NOT be inferred, guessed, or matched by name. A URL appears only when explicitly supplied.
- **FR-007**: The site MUST contain a Side Projects section, visually and structurally distinct from Experience, containing Glowy and ClinicQ with their role, stack, achievements, and a link to each product's public listing.
- **FR-008**: The site MUST offer the CV PDF for viewing or download.

**Contact and social**

- **FR-009**: The site MUST contain a dedicated Contact section offering exactly four channels: WhatsApp (+20 114 567 8491), email (andrewayad60@gmail.com), LinkedIn, and GitHub.
- **FR-010**: The email channel MUST open the visitor's own mail client, prefilled with the recipient address and a relevant subject line, and MUST NOT submit data to any third-party service.
- **FR-011**: The email address MUST remain visible as text and MUST offer a one-click copy action with visible confirmation, so a visitor without a mail client can still reach Andrew.
- **FR-011a**: The site MUST NOT contain a message-submission form and MUST NOT transmit visitor input to any third-party service.
- **FR-012**: The WhatsApp channel MUST open a conversation addressed to the stated number on both mobile and desktop.
- **FR-013**: Social links MUST be limited to LinkedIn, GitHub, and email; no other social destinations may appear anywhere on the site.
- **FR-014**: Every link to an external destination MUST open in a new browser tab, leaving the portfolio open behind it.

**Visual system**

- **FR-015**: The site MUST be rebuilt on a single, coherent design system replacing the current one, applied consistently to every section — no section may retain the prior visual language.
- **FR-016**: The color palette MUST be derived from the profile photograph: deep forest green and near-black as base and surface tones, emerald as the interactive accent, warm wood-brown as a secondary accent.
- **FR-017**: All body text MUST meet a contrast ratio of at least 4.5:1 against its background, and all large text and interactive controls at least 3:1, in **both** the dark and the light theme.
- **FR-017a**: The site MUST offer a dark theme (default) and a light theme, both expressed through the same token names so every component resolves correctly under either. A visible control MUST let the visitor switch themes, and the chosen theme MUST persist across visits on the same device.
- **FR-017b**: On a first visit with no stored preference, the site MUST honour the visitor's operating-system color-scheme preference, falling back to the dark theme when none is expressed.
- **FR-018**: The design system MUST define reusable tokens for color, type scale, spacing, and elevation, and every component MUST consume them rather than hard-coded values.
- **FR-019**: The site MUST remain deployable as static files with no build step, no package manager, and no framework runtime.

**Motion**

- **FR-020**: Each major section MUST animate into view once as it enters the viewport, and MUST NOT re-animate on subsequent scrolls.
- **FR-021**: Navigation between sections MUST use a smooth transition that leaves the target section's heading clear of any fixed navigation bar.
- **FR-022**: Interactive elements MUST respond visibly to hover and to keyboard focus.
- **FR-023**: All non-essential motion MUST be suppressed when the visitor's system indicates a reduced-motion preference, with all content remaining fully readable.
- **FR-024**: Content MUST remain readable if scroll-triggered animation never runs; no section may be left permanently hidden by a failed animation.

**Reach and access**

- **FR-025**: The site MUST render without horizontal scrolling or clipped content at viewport widths from 320px through 2560px.
- **FR-026**: Every interactive element MUST be reachable and operable by keyboard alone, in a logical order, with a visible focus indicator.
- **FR-027**: Every image MUST carry meaningful alternative text, and the layout MUST NOT collapse if an image fails to load.
- **FR-028**: The site MUST carry a page title and description reflecting Andrew's name and current professional title.

### Key Entities

- **Profile**: The person. Name, professional title, location, professional summary, profile photograph, CV document.
- **Contact Channel**: A way to reach the profile. Kind (WhatsApp, email, LinkedIn, GitHub), destination address, display label.
- **Employment**: A period of employed work. Company, location, role title, start date, end date, achievement bullets, and a set of Products.
- **Product**: A shipped application. Name, one-line description, an owning context (an Employment, or independent), and an *optional* public listing link. Absence of the link is a valid, expected state that changes how the product renders but never whether it renders.
- **Independent Product**: A Product owned by the profile rather than an employer. Adds role held, technology stack, and achievement bullets.
- **Skill Group**: A named category from the CV (e.g. State Management) holding an ordered list of named skills.
- **Education Entry**: Degree, field, faculty, institution, year, graduation project, grade.
- **Language Proficiency**: Language name and proficiency level.
- **Design Token**: A named visual constant — color, type step, spacing step, elevation level — consumed by every component.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can state Andrew's role, seniority, and primary technology within 10 seconds of the page loading, without scrolling past the second screen.
- **SC-002**: 100% of the CV's content items appear on the site, verified by a line-by-line comparison against the source document.
- **SC-003**: Every product link rendered on the page resolves to a live listing. Zero links produce an error page or a placeholder destination, and every product lacking a supplied URL renders as unlinked text rather than a dead affordance.
- **SC-003a**: Supplying a previously missing product URL requires a change to exactly one file and zero markup edits.
- **SC-004**: A visitor can initiate contact through any of the four channels in a single tap or click from the contact section.
- **SC-005**: Every page section passes a 4.5:1 contrast check for body text and 3:1 for large text and controls, under both the dark and the light theme.
- **SC-006**: The full page can be operated end to end using only a keyboard, with a visible focus indicator at every step.
- **SC-007**: With the reduced-motion preference enabled, 100% of content is immediately readable and no decorative motion plays.
- **SC-008**: The page renders without horizontal scrolling at every viewport width from 320px to 2560px.
- **SC-009**: The page becomes readable within 2 seconds on a typical mobile connection, and reveal animations sustain smooth motion without visible stutter.
- **SC-010**: Zero sections retain the previous visual language, verified by comparing rendered colors and typography against the new token set.

## Assumptions

- The portfolio remains a single-page static site with no backend, no database, and no user accounts. Adding a server is out of scope.
- The visual rebuild uses a hand-authored token system in plain CSS with vanilla JavaScript, keeping the site buildless and dependency-free (see Clarifications). Existing CDN links for fonts and icons may be retained or replaced, but no framework or bundler is introduced.
- The contact section uses a `mailto` action rather than a hosted form, because no backend exists and no third-party form service was requested. This satisfies "contact us on mail" literally and avoids sending visitor data to an external processor.
- Social presence is deliberately narrowed to LinkedIn, GitHub, and email per explicit instruction; any existing links to other networks are removed.
- The palette is derived from the profile photograph's dominant tones — deep forest green, near-black, emerald highlight, warm wood-brown — as sampled from the image. Exact token values are an implementation decision.
- The site is dark-first, consistent with the photograph's low-key lighting, and ships a light theme alongside it (see Clarifications). The light theme reinterprets the same photo-derived hues at inverted lightness — the forest green becomes a deep ink on a warm off-white surface — rather than introducing unrelated colors.
- "Add animations for transaction" is read as *transitions* — section reveals, smooth scrolling, and hover/focus states — not payment transactions.
- The existing CV PDF at `files/Andrew_Ayad_CV.pdf` is the canonical source of content and stays the downloadable artifact.
- Product listing URLs not supplied by Andrew are rendered as unlinked entries rather than guessed. The first release is expected to ship with several products unlinked — notably the Saudi ministry applications, which are commonly unlisted or region-locked. This is an accepted, non-blocking state (see Clarifications).
- ClinicQ is a Next.js web application deployed to Vercel, so its link is a web URL, not a Google Play listing, despite the original request wording.
- Browser support targets current evergreen browsers; no support for Internet Explorer.
