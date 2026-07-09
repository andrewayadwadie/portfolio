# Phase 1 Data Model: CV-Driven Portfolio Redesign

**Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

There is no database and no server. "Data model" here means the shape of the single frozen `SITE_DATA` object in `js/data.js`, which is the sole source of truth for every word rendered on the page (R7, FR-006a).

---

## Entity: Profile

The person. Exactly one.

| Field | Type | Required | Rule |
|---|---|---|---|
| `name` | string | yes | Rendered in hero and `<title>` |
| `title` | string | yes | Professional title from the CV |
| `location` | string | yes | `"Cairo, Egypt"` |
| `summary` | string | yes | The full CV professional summary. Not truncated. Not rewritten. (FR-002) |
| `photo` | string | yes | Path to `images/profile.jpg` |
| `photoAlt` | string | yes | Meaningful alt text, not `"profile"` (FR-027) |
| `cv` | string | yes | Path to `files/Andrew_Ayad_CV.pdf` (FR-008) |

**Validation**: `summary` must match the CV summary verbatim. This is the SC-002 line-item check and the SC-001 payload.

---

## Entity: ContactChannel

Exactly four instances. FR-009 and FR-013 both constrain this set — no fifth channel may be added without a spec change.

| Field | Type | Required | Rule |
|---|---|---|---|
| `kind` | enum | yes | One of `whatsapp` \| `email` \| `linkedin` \| `github` |
| `label` | string | yes | Visible text |
| `value` | string | yes | The human-readable address (`+20 114 567 8491`, `andrewayad60@gmail.com`) |
| `href` | string | yes | The activation URL. Formats fixed in R8. |
| `icon` | string | yes | Sprite symbol id, e.g. `#icon-whatsapp` |
| `copyable` | boolean | no | Only `email` sets this true (FR-011) |

**Validation**:
- Exactly four entries, one per `kind`. A fifth entry, or a duplicate `kind`, is a spec violation.
- `email.href` must be a `mailto:` URL with an encoded subject. It must never point at a form endpoint (FR-011a).
- `whatsapp.href` must be `https://wa.me/<digits>` with no `+` and no separators.

---

## Entity: Employment

Three instances, rendered in reverse-chronological order (FR-004).

| Field | Type | Required | Rule |
|---|---|---|---|
| `company` | string | yes | |
| `location` | string | yes | As stated in the CV |
| `role` | string | yes | |
| `start` | string | yes | `"Feb 2021"` — display form, ordering is by array position |
| `end` | string | yes | `"Present"` for the current role |
| `bullets` | string[] | yes | Every achievement bullet from the CV. None omitted, none summarized. (FR-001) |
| `products` | Product[] | yes | Non-empty |

**Ordering**: the array is authored newest-first. Rendering preserves array order; it does not sort. Dates are display strings, not parseable values, so no date library is needed and no timezone bug is possible.

**Validation**: three entries — Noor Data Network, WABC Group, Innovation Agency. Bullet count per employer must equal the CV's: 5, 3, 4 respectively.

---

## Entity: Product

Ten instances across the three employers. This entity carries the feature's one genuinely conditional behavior.

| Field | Type | Required | Rule |
|---|---|---|---|
| `name` | string | yes | |
| `description` | string | yes | One line, what the product does (FR-005) |
| `url` | string \| null | **no** | `null` is a valid, expected state |

**The `url` rule** (FR-006, FR-006a, FR-006b, SC-003, SC-003a):

- `url` is a **string** → render as an `<a>` with `target="_blank" rel="noopener noreferrer"` and a trailing external-link icon.
- `url` is `null` → render as a `<span>`. No `<a>`, no `href="#"`, no `aria-disabled` link, no "coming soon" badge, no tooltip explaining the absence. The product's *description* still renders in full. A visitor should not be able to tell that a link was ever contemplated.
- `url` is **never inferred** from the product name. No Play Store search, no guessed bundle id. Absent means absent.

Adding a link later is a single-line edit in `js/data.js` — `url: null` becomes `url: "https://..."` — and the renderer picks it up. Zero markup edits. That is SC-003a, and it is the entire reason this data structure exists.

**Expected initial state**: all ten `url` fields are `null` at first ship. The three Saudi ministry applications (Livestock, Environmental Reporting, Quality Management) are likely to stay `null` permanently — government apps are commonly unlisted or region-locked.

**Product inventory** (from the CV, grouped by owning Employment):

| Employment | Products |
|---|---|
| Noor Data Network | Noor App, Zabatnee, IPadel |
| WABC Group | Livestock App, Environmental Reporting App, Quality Management App, Arganzwina |
| Innovation Agency | El Imam Mady Abo El Azaym University App, Elmenofy, Matrix Auction App |

---

## Entity: IndependentProduct

Two instances. A Product with three added fields and no owning Employment. Rendered in its own section, visually distinct from Experience (FR-007).

| Field | Type | Required | Rule |
|---|---|---|---|
| `name` | string | yes | |
| `tagline` | string | yes | `"Wallpaper App"`, `"Clinic Management Platform"` |
| `role` | string | yes | `"Founder & Solo Developer"`, `"Full-Stack Developer"` |
| `stack` | string[] | yes | Rendered as chips |
| `bullets` | string[] | yes | Achievement bullets from the CV |
| `url` | string \| null | no | Same `null` semantics as Product |
| `urlLabel` | string | no | `"Google Play"` for Glowy, `"Visit site"` for ClinicQ |

**Validation**: two entries — Glowy and ClinicQ. Note that ClinicQ is a Next.js web app on Vercel, so its `urlLabel` is not a store label, per the spec's Assumptions.

---

## Entity: SkillGroup

Nine instances, one per CV Technical Skills category, plus one for Core Competencies.

| Field | Type | Required |
|---|---|---|
| `category` | string | yes |
| `skills` | string[] | yes |

**Validation** (FR-001, SC-002): categories must be exactly the CV's — Languages & Frameworks, State Management, Architecture, Networking & Data, Testing, DevOps & Delivery, AI-Assisted Development, Mobile Platform, Tools & Collaboration. Every named technology inside each appears. A skill dropped here is a silent SC-002 failure, so this is the highest-risk entity for content fidelity.

---

## Entity: EducationEntry

One instance.

| Field | Type | Required |
|---|---|---|
| `degree` | string | yes |
| `faculty` | string | yes |
| `institution` | string | yes |
| `year` | string | yes |
| `project` | string | yes |
| `grade` | string | yes |

All six render. FR-006's acceptance scenario names the graduation project and grade explicitly — they are frequently dropped in redesigns.

---

## Entity: LanguageProficiency

Two instances: Arabic (Native), English (Professional Working Proficiency).

| Field | Type | Required |
|---|---|---|
| `language` | string | yes |
| `level` | string | yes |

---

## Design tokens

Not part of `SITE_DATA` — these live in CSS, on `:root`. Listed here because FR-018 makes them a first-class entity that every component must consume.

| Family | Tokens | Source |
|---|---|---|
| Color | `--bg`, `--surface`, `--surface-raised`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-warm`, `--accent-contrast` | Values fixed and contrast-verified in R1 |
| Type | `--step--1` … `--step-5`, `--font-body`, `--font-display` | Fluid `clamp()` scale |
| Space | `--space-1` … `--space-16` | 4px base |
| Elevation | `--shadow-1` … `--shadow-3` | Green-tinted, not black |
| Motion | `--dur-fast`, `--dur-base`, `--ease-out` | Collapsed under reduced-motion |

**Validation**: no component may declare a raw hex, px font-size, or px margin outside the token block (FR-018). Grepping the stylesheet for `#[0-9a-f]{6}` outside `:root` and `[data-theme]` should return nothing.

---

## Relationships

```text
Profile ──1:4── ContactChannel
Profile ──1:3── Employment ──1:N── Product (url: string | null)
Profile ──1:2── IndependentProduct (url: string | null)
Profile ──1:10─ SkillGroup ──1:N── skill (string)
Profile ──1:1── EducationEntry
Profile ──1:2── LanguageProficiency
```

Flat, acyclic, no identity or uniqueness concerns beyond the `ContactChannel.kind` enum. Nothing has a lifecycle or a state transition — the one piece of mutable state on the whole page is the active theme, which lives in `localStorage`, not here.
