# Contract: `SITE_DATA` ↔ CV

Replaces `specs/001-cv-portfolio-redesign/contracts/site-data.contract.md` for this feature. Entity fields: [data-model.md](../data-model.md).

## Shape

```js
const SITE_DATA = Object.freeze({
  profile:    { name, headline, location, summary, stats: [{ value, suffix, label }], photo, photoAlt, cv },
  sections:   [{ id, heading, nav, render }],          // 6 entries, CV order
  contact:    [{ kind, label, value, href, icon, copyable? }],   // 5 entries, CV header order
  experience: [{ company, location, role, start, end, bullets: [], products: [{ name, description, url }] }],
  skills:     [{ category, skills: [] }],              // 10 entries
  education:  { degree, graduated, faculty, institution, project, grade },
  languages:  [{ language, level }],                   // 2 entries
});
```

Keys that must **not** exist: `competencies`, `sideProjects`, `profile.title`, `profile.subtitle`, `education.year`.

## Fidelity rules (checked by `check-cv-sync.py`)

The checker reads `word/document.xml` from the .docx using the standard library only. It normalises text (NFC, collapses whitespace, decodes `&amp;` / `&middot;` / `&#…;`, treats `–` and `—` as the same in date ranges) and builds a haystack from `js/data.js` + `index.html`.

| CV source | Rule | Fails when |
|---|---|---|
| Line 1 (name) | title-cased match in `index.html` h1 and `profile.name` | missing or different |
| Line 2 (headline) | exact | different |
| Contact lines | each `•`-separated token is present | any token missing (website included) |
| PROFESSIONAL SUMMARY paragraph | exact, in `profile.summary` **and** the static `#summary` markup | either copy drifts |
| Each employer heading `Company \| Location ⇥ Dates` | company, location, start, end each present | any missing |
| Each role line | exact | different |
| Each bullet (except `Key products:`) | exact, and in CV order within that employer | missing, reordered, or reworded |
| `Key products:` line | split on `), ` → `name (description)`. Each name and description is exact | any product missing or drifted |
| `Category: items` skill lines | category exact. Items split on `, ` outside parentheses, each exact, in order | missing, extra, or reordered |
| Education lines | degree, "Graduated 2019", faculty, institution, project, grade present | any missing |
| Languages line | `Arabic`/`Native`, `English`/`Good (technical reading & writing)` | different |

**Reverse rule (no extra claims)**: none of these may appear in `index.html`, `js/*.js`, or the `<title>`/meta description: `11+`, `~30%`, `30%`, `Glowy`, `ClinicQ`, `competencies`, `Core competencies`, `fintech-adjacent`, `Professional Working Proficiency`, `Open to senior Flutter roles`, `side-projects`.

**Exit code**: 0 when every rule passes. Otherwise 1, and each failure prints as `FAIL <rule>: expected "<cv text>"`.

## Product URL rule (unchanged from 001)

`url: null` renders as plain text: no anchor, no `href="#"`, no disabled styling. A string URL renders as an external anchor with `target="_blank" rel="noopener noreferrer"` and the external-link icon.
