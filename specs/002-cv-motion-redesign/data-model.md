# Data Model: CV-Faithful Portfolio Redesign

**Feature**: `002-cv-motion-redesign` · **Source of truth**: `files/Andrew_Ayad_Flutter_Developer_CV.docx` (PDF is its export)

All content lives in one frozen object, `SITE_DATA`, in `js/data.js` (FR-007). The hero and summary are also written as static HTML so they show up before any script runs. That copy is checked against `SITE_DATA` and the CV by `check-cv-sync.py` (see [contracts/site-data.contract.md](./contracts/site-data.contract.md)).

This model has no persistence and no state changes. The only state on the client is UI state, listed at the end.

---

## Changes from feature 001

| Entity / field | Change |
|---|---|
| `profile.title` + `profile.subtitle` | **Replaced** by a single `profile.headline` = CV line 2 word for word |
| `profile.summary` | **Rewritten** to the CV paragraph |
| `profile.stats` | **New**: three figures taken from the summary (R2) |
| `contact[]` | **Adds** `website`. **Adds** `phone` display. Order changes to CV order |
| `competencies` | **Removed** (FR-005) |
| `sideProjects` | **Removed** (FR-006) |
| `experience[].bullets` | **Rewritten** to the CV, word for word |
| `skills[]` | **Rewritten** to 10 CV groups, including **Payments & Monetization** |
| `education.year` | **Renamed** `education.graduated` (CV: "Graduated 2019") |
| `languages[].level` | English → "Good (technical reading & writing)" |
| `sections[]` | **New**: section order, ids, CV headings and nav labels in one place (R3) |

---

## Entities

### Profile

| Field | Type | Rule | Value (from CV) |
|---|---|---|---|
| `name` | string | = CV line 1, title case | `Andrew Ayad Wadie` |
| `headline` | string | = CV line 2 word for word | `Senior Flutter Developer \| Mobile Application Engineer \| Dart` |
| `location` | string | = CV | `Cairo, Egypt` |
| `summary` | string | = CV Professional Summary word for word | (one paragraph) |
| `stats` | Stat[3] | each `value` must appear in `summary` | see Stat |
| `photo` | path | exists in `images/` | `images/profile.jpg` |
| `photoAlt` | string | non-empty | unchanged |
| `cv` | path | exists in `files/` | `files/Andrew_Ayad_Flutter_Developer_CV.pdf` |

### Stat

| Field | Type | Rule |
|---|---|---|
| `value` | number | target of the count-up animation |
| `suffix` | string | `"+"` or `""` |
| `label` | string | short description. The figure must be stated in the summary |

Values: `{5, "+", "Years building Flutter apps"}`, `{10, "", "Production apps released"}`, `{2, "", "Saudi ministries served"}`.

### ContactChannel

| Field | Type | Rule |
|---|---|---|
| `kind` | enum `whatsapp \| email \| website \| linkedin \| github` | unique |
| `label` | string | visible label |
| `value` | string | = CV display text word for word |
| `href` | string | `https://wa.me/201145678491`, `mailto:…?subject=…`, `https://andrewayad.online`, `https://linkedin.com/in/andrew-ayad-58764315a`, `https://github.com/andrewayadwadie` |
| `icon` | sprite id | `#icon-whatsapp`, `#icon-mail`, `#icon-globe` (**new symbol**), `#icon-linkedin`, `#icon-github` |
| `copyable` | boolean? | `true` for email only |

Order follows the CV header: phone/WhatsApp → email → website → LinkedIn → GitHub.

### ExperienceEntry (3, in CV order)

| Field | Type | Rule |
|---|---|---|
| `company` | string | = CV |
| `location` | string | = CV |
| `start` / `end` | string | = CV (`Nov 2022` / `Present`, …) |
| `role` | string | = CV |
| `bullets` | string[] | = CV bullets in order, **excluding** the "Key products:" line |
| `products` | Product[] | parsed from the CV "Key products:" line, in order |

Bullet counts per the CV: Noor Data Network **6**, WABC Group **3**, Innovation Agency **4**.

### Product

| Field | Type | Rule |
|---|---|---|
| `name` | string | = CV text before `(` |
| `description` | string | = CV text inside `( )` word for word (keeps `&`, `/`) |
| `url` | string \| null | `null` until a real listing URL is provided. Never guessed |

### SkillGroup (10, in CV order)

| # | `category` | `skills` (CV order) |
|---|---|---|
| 1 | Languages & Frameworks | Dart · Flutter (cross-platform mobile: Android & iOS) · JavaScript |
| 2 | State Management | Bloc · Cubit · Provider · GetX |
| 3 | Architecture | Clean Architecture · MVVM · SOLID · Dependency Injection (GetIt, Injectable) · Feature-First Structure · Code Generation (Freezed, json_serializable) · Performance Optimization |
| 4 | Networking & Data | RESTful APIs (Dio, Retrofit) · Firebase (Firestore, Realtime DB, Cloud Functions, Auth, FCM) · Hive · SQLite (sqflite) · Offline Data Sync |
| 5 | Testing | Unit Testing · Widget Testing · bloc_test · mocktail |
| 6 | DevOps & Delivery | Git · GitHub Actions CI/CD · Firebase App Distribution · Flutter Flavors · App Store & Google Play deployment · Crash Monitoring |
| 7 | AI-Assisted Development | Claude Code · OpenAI Codex · GitHub Spec Kit (spec-driven development) · custom AI agent skills · Google ML Kit |
| 8 | Mobile Platform | Background Services · Push Notifications · Google Maps SDK · Geolocation · Camera & Media Upload · Localization (Arabic/English, RTL) · GoRouter / Navigator 2.0 |
| 9 | Payments & Monetization | Payment Gateway Integration (PayFort, Paymob) · In-App Purchases (RevenueCat) · AdMob |
| 10 | Tools & Collaboration | Figma · FlutterFlow · Jira · Agile/Scrum |

Splitting rule: split on `, ` **only outside parentheses**, so `Dependency Injection (GetIt, Injectable)` stays one item.

### Education

| Field | Value |
|---|---|
| `degree` | `Bachelor of Computers and Informatics, Computer Science` |
| `graduated` | `2019` (displayed as "Graduated 2019") |
| `faculty` | `Faculty of Computers and Informatics` |
| `institution` | `Zagazig University, Egypt` |
| `project` | `Optical Mark Recognition` |
| `grade` | `Excellent` |

### Language

| `language` | `level` |
|---|---|
| Arabic | Native |
| English | Good (technical reading & writing) |

### Section (new: one table for structure)

| Field | Type | Rule |
|---|---|---|
| `id` | string | DOM id and URL hash. Unique |
| `heading` | string | CV section name word for word (R3) |
| `nav` | string | nav label, the key word from `heading` |
| `render` | string \| null | renderer key. `null` for static sections (`summary`) |

Order: `summary, experience, skills, education, languages, contact`. The nav, the section index numbers (`01`–`06`), and scroll-spy are all built from this list, so labels exist in one place only.

---

## UI state (client-only, not content)

| State | Where | Values / lifecycle |
|---|---|---|
| Theme | `localStorage.theme`, `html[data-theme]` | `dark \| light`. Unchanged from 001 |
| Intro mode | `sessionStorage.introSeen`, `html.intro-full \| intro-short \| intro-done` | first load in a session → `intro-full`. Later loads → `intro-short`. A click or key press → `intro-done`. Classes removed after ≤1.5s |
| Motion enabled | `html.js-motion` | added by `motion.js` at boot. Not added under reduced motion for hidden starting styles |
| Reveal group | `[data-reveal-group].is-visible` | `hidden → visible`, one way only, once per load |
| Active section | `nav a[aria-current="true"]`, URL hash | updated by scroll-spy (`replaceState`) and clicks (`pushState`) |
| Custom cursor | `html.has-cursor`, `.cursor[data-state]` | `data-state ∈ default \| hover \| text \| press \| hidden` |
| Menu | `#nav-list[data-open]` | `true \| false`. Unchanged from 001 |
