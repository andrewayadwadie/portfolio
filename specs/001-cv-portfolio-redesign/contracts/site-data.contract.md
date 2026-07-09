# Contract: `SITE_DATA` (js/data.js)

The authoring interface. This is the file Andrew edits; everything else is machinery. A change here must never require a change to `index.html` or `css/style.css`.

## Shape

```js
const SITE_DATA = Object.freeze({
  profile: {
    name: "Andrew Ayad Wadie",
    title: "Senior Mobile Application Engineer",
    subtitle: "Flutter Developer | Dart",
    location: "Cairo, Egypt",
    summary: "…full CV professional summary, verbatim…",
    photo: "images/profile.jpg",
    photoAlt: "Andrew Ayad, seated, hands clasped, against a dark green backdrop",
    cv: "files/Andrew_Ayad_CV.pdf",
  },

  contact: [
    { kind: "whatsapp", label: "WhatsApp", value: "+20 114 567 8491",
      href: "https://wa.me/201145678491", icon: "#icon-whatsapp" },
    { kind: "email", label: "Email", value: "andrewayad60@gmail.com",
      href: "mailto:andrewayad60@gmail.com?subject=Opportunity%20for%20Andrew%20Ayad",
      icon: "#icon-mail", copyable: true },
    { kind: "linkedin", label: "LinkedIn", value: "andrew-ayad-58764315a",
      href: "https://linkedin.com/in/andrew-ayad-58764315a", icon: "#icon-linkedin" },
    { kind: "github", label: "GitHub", value: "andrewayadwadie",
      href: "https://github.com/andrewayadwadie", icon: "#icon-github" },
  ],

  competencies: ["Cross-Platform Mobile Development", "Flutter & Dart", /* … */],

  experience: [
    {
      company: "Noor Data Network",
      location: "Sheikh Zayed, Giza, Egypt",
      role: "Mobile Application Engineer (Flutter)",
      start: "Nov 2022",
      end: "Present",
      bullets: [ /* all 5 CV bullets, verbatim */ ],
      products: [
        { name: "Noor App", description: "Telecom bill payment and quota management", url: null },
        { name: "Zabatnee", description: "Restaurant and activity reservations with in-app payments", url: null },
        { name: "IPadel", description: "Padel court booking with integrated payments", url: null },
      ],
    },
    // WABC Group (4 products), Innovation Agency (3 products)
  ],

  sideProjects: [
    {
      name: "Glowy",
      tagline: "Wallpaper App",
      role: "Founder & Solo Developer",
      stack: ["Flutter", "Clean Architecture", "Cubit", "Node.js", "Fastify",
              "Cloudflare R2", "RevenueCat", "AdMob"],
      bullets: [ /* CV bullets, verbatim */ ],
      url: null,
      urlLabel: "Google Play",
    },
    {
      name: "ClinicQ",
      tagline: "Clinic Management Platform",
      role: "Full-Stack Developer",
      stack: ["Next.js", "Supabase", "PostgreSQL", "Vercel"],
      bullets: [ /* CV bullets, verbatim */ ],
      url: null,
      urlLabel: "Visit site",
    },
  ],

  skills: [
    { category: "Languages & Frameworks", skills: ["Dart", "Flutter (Mobile, Web, Desktop)", /* … */] },
    // 8 more groups, exactly as the CV names them
  ],

  education: {
    degree: "Bachelor of Computers and Informatics, Computer Science",
    faculty: "Faculty of Computers and Informatics",
    institution: "Zagazig University, Egypt",
    year: "2019",
    project: "Optical Mark Recognition",
    grade: "Excellent",
  },

  languages: [
    { language: "Arabic", level: "Native" },
    { language: "English", level: "Professional Working Proficiency" },
  ],
});
```

## Invariants

1. `Object.freeze` at the top level. Nothing mutates `SITE_DATA` at runtime.
2. `contact` has exactly four entries, one per `kind`, in the order shown. Adding a fifth violates FR-013.
3. Every `url` field is `string | null`. `undefined`, `""`, and `"#"` are all invalid — the renderer treats only `null` as "no link", and anything else as a live URL it will render as an anchor.
4. Arrays render in authored order. No sorting anywhere.
5. Text fields are plain strings, inserted with `textContent`, never `innerHTML`. This is the whole XSS story for a page with no user input, and it stays that way.

## Consumer

`js/main.js` reads `SITE_DATA` once on `DOMContentLoaded` and renders into the section shells declared in `index.html`. It never writes back.

## Adding a product link later

```diff
- { name: "Zabatnee", description: "…", url: null },
+ { name: "Zabatnee", description: "…", url: "https://play.google.com/store/apps/details?id=…" },
```

One line, one file, zero markup. The anchor, the `target="_blank" rel="noopener noreferrer"`, and the external-link icon all appear automatically. This diff *is* SC-003a.
