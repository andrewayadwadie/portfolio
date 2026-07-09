/* Single source of truth for every word on the page.
 * Contract: specs/001-cv-portfolio-redesign/contracts/site-data.contract.md
 *
 * To publish a product link, set its `url` from null to the listing URL.
 * Nothing else changes — no markup, no styles. A null url renders as plain
 * text with no link affordance, which is the correct state, not a gap.
 */
const SITE_DATA = Object.freeze({
  profile: {
    name: "Andrew Ayad Wadie",
    title: "Senior Mobile Application Engineer",
    subtitle: "Flutter Developer | Dart",
    location: "Cairo, Egypt",
    summary:
      "Senior Mobile Application Engineer with 5+ years of experience designing, building, and shipping 11+ production Flutter applications on Google Play and the App Store for government, telecom, fintech-adjacent payments, and booking domains. Expert in Clean Architecture, Bloc/Cubit state management, and performance optimization at enterprise scale, including mission-critical systems for the Saudi Ministry of Environment and Ministry of Agriculture. Pioneer of AI-assisted development workflows (Claude Code, OpenAI Codex, spec-driven development) that cut feature delivery and code review time by ~30%. Proven end-to-end ownership: architecture, CI/CD, store deployment, and post-release maintenance for apps serving thousands of active users.",
    photo: "images/profile.jpg",
    photoAlt:
      "Andrew Ayad, seated with hands clasped, wearing a dark green shirt against a deep green backdrop",
    cv: "files/Andrew_Ayad_CV.pdf",
  },

  contact: [
    {
      kind: "whatsapp",
      label: "WhatsApp",
      value: "+20 114 567 8491",
      href: "https://wa.me/201145678491",
      icon: "#icon-whatsapp",
    },
    {
      kind: "email",
      label: "Email",
      value: "andrewayad60@gmail.com",
      href: "mailto:andrewayad60@gmail.com?subject=Opportunity%20for%20Andrew%20Ayad",
      icon: "#icon-mail",
      copyable: true,
    },
    {
      kind: "linkedin",
      label: "LinkedIn",
      value: "andrew-ayad-58764315a",
      href: "https://linkedin.com/in/andrew-ayad-58764315a",
      icon: "#icon-linkedin",
    },
    {
      kind: "github",
      label: "GitHub",
      value: "andrewayadwadie",
      href: "https://github.com/andrewayadwadie",
      icon: "#icon-github",
    },
  ],

  competencies: [
    "Cross-Platform Mobile Development",
    "Flutter & Dart",
    "Clean Architecture",
    "SOLID Principles",
    "State Management (Bloc, Provider, GetX)",
    "RESTful API Integration",
    "CI/CD Pipelines",
    "Performance Optimization",
    "Unit & Widget Testing",
    "Agile/Scrum",
    "Code Review & Mentoring",
    "App Store & Google Play Release Management",
    "AI-Assisted Software Development",
  ],

  experience: [
    {
      company: "Noor Data Network",
      location: "Sheikh Zayed, Giza, Egypt",
      role: "Mobile Application Engineer (Flutter)",
      start: "Nov 2022",
      end: "Present",
      bullets: [
        "Spearheaded development of 3 production Flutter applications across telecom self-service, restaurant reservations, and sports-court booking, serving thousands of monthly active users with in-app payment integration.",
        "Re-architected legacy codebases to Clean Architecture with Bloc/Cubit, eliminating recurring performance bottlenecks and reducing UI jank and app startup time on low-end Android devices.",
        "Introduced AI-assisted development workflows (Claude Code, OpenAI Codex, GitHub Spec Kit) and authored reusable AI agent skills adopted by the team, cutting feature development and code review cycles by ~30%.",
        "Owned the full release lifecycle — versioning, staged rollouts, crash monitoring, and hotfixes — for live production apps on Google Play and the Apple App Store.",
        "Partnered with product managers and UI/UX designers in Agile sprints to translate business requirements into shipped features, improving alignment between roadmap and releases.",
      ],
      products: [
        {
          name: "Noor App",
          description: "Telecom bill payment and quota management",
          url: null,
        },
        {
          name: "Zabatnee",
          description: "Restaurant and activity reservations with in-app payments",
          url: null,
        },
        {
          name: "IPadel",
          description: "Padel court booking with integrated payments",
          url: null,
        },
      ],
    },
    {
      company: "WABC Group",
      location: "Heliopolis, Cairo, Egypt",
      role: "Mobile Application Engineer (Flutter)",
      start: "Jan 2022",
      end: "Nov 2022",
      bullets: [
        "Delivered 4 mission-critical government applications for the Saudi Ministry of Environment and Ministry of Agriculture, featuring real-time data synchronization, geolocation services, and secure governmental API integration.",
        "Met strict government compliance standards and tight deadlines through modular development, proactive stakeholder communication, and rigorous QA cycles.",
        "Optimized state management with GetX, shipping high-performance apps with minimal memory leaks across live inspection and audit workflows.",
      ],
      products: [
        {
          name: "Livestock App",
          description: "Location-based livestock tracking and inspection",
          url: null,
        },
        {
          name: "Environmental Reporting App",
          description: "Citizen issue reporting with media attachments",
          url: null,
        },
        {
          name: "Quality Management App",
          description: "Real-time audit logging",
          url: null,
        },
        {
          name: "Arganzwina",
          description: "E-commerce with integrated payments",
          url: null,
        },
      ],
    },
    {
      company: "Innovation Agency",
      location: "Dokki, Giza, Egypt",
      role: "Mobile Application Engineer (Flutter)",
      start: "Feb 2021",
      end: "Jan 2022",
      bullets: [
        "Led full-lifecycle development of 3 production apps — from requirements analysis and UI prototyping to testing, deployment, and client handover.",
        "Integrated Firebase (Firestore, Realtime Database, Cloud Functions, FCM) and Google ML Kit to deliver real-time features, push notifications, and on-device intelligence.",
        "Introduced modular code practices and unit tests to existing codebases, improving reliability and reusability across projects.",
        "Managed direct client communication, translating business needs into technical solutions and reducing rework during acceptance.",
      ],
      products: [
        {
          name: "El Imam Mady Abo El Azaym University App",
          description: "Attendance, grades, and notifications",
          url: null,
        },
        {
          name: "Elmenofy",
          description: "E-commerce with real-time location tracking",
          url: null,
        },
        {
          name: "Matrix Auction App",
          description: "Dynamic bidding with secure payments",
          url: null,
        },
      ],
    },
  ],

  sideProjects: [
    {
      name: "Glowy",
      tagline: "Wallpaper App",
      role: "Founder & Solo Developer",
      stack: [
        "Flutter",
        "Clean Architecture",
        "Cubit",
        "Node.js",
        "Fastify",
        "Cloudflare R2",
        "RevenueCat",
        "AdMob",
      ],
      bullets: [
        "Designed, built, and launched a complete consumer product end-to-end: Flutter app (Clean Architecture, Cubit) + Node.js/Fastify backend + Cloudflare R2 storage, published on Google Play.",
        "Implemented a full monetization stack — RevenueCat subscriptions, AdMob rewarded and interstitial ads — and managed the complete store submission lifecycle including closed testing and production review.",
      ],
      url: null,
      urlLabel: "Google Play",
    },
    {
      name: "ClinicQ",
      tagline: "Clinic Management Platform",
      role: "Full-Stack Developer",
      stack: ["Next.js", "Supabase", "PostgreSQL", "Supabase Auth", "Vercel"],
      bullets: [
        "Built and deployed a full-stack clinic management web application with Next.js and Supabase (PostgreSQL, Auth, Vault-managed JWT), deployed to production on Vercel with environment-managed configuration and database migrations.",
      ],
      url: null,
      urlLabel: "Visit site",
    },
  ],

  skills: [
    {
      category: "Languages & Frameworks",
      skills: [
        "Dart",
        "Flutter (Mobile, Web, Desktop)",
        "Native Android",
        "JavaScript/TypeScript (Node.js, Next.js)",
      ],
    },
    {
      category: "State Management",
      skills: ["Bloc", "Provider", "GetX"],
    },
    {
      category: "Architecture",
      skills: [
        "Clean Architecture",
        "MVVM",
        "SOLID",
        "Dependency Injection (GetIt, Injectable)",
        "Feature-First Structure",
        "Code Generation (Freezed, json_serializable)",
      ],
    },
    {
      category: "Networking & Data",
      skills: [
        "RESTful APIs (Dio, Retrofit)",
        "Firebase (Firestore, Realtime DB, Cloud Functions, Auth, FCM)",
        "Supabase",
        "Hive",
        "SQLite (sqflite)",
      ],
    },
    {
      category: "Testing",
      skills: ["Unit Testing", "Widget Testing", "bloc_test", "mocktail"],
    },
    {
      category: "DevOps & Delivery",
      skills: [
        "Git",
        "GitHub Actions CI/CD",
        "Firebase App Distribution",
        "Flutter Flavors",
        "App Store & Google Play deployment",
        "Crash Monitoring",
      ],
    },
    {
      category: "AI-Assisted Development",
      skills: [
        "Claude Code",
        "OpenAI Codex",
        "GitHub Spec Kit (spec-driven development)",
        "Custom AI agent skills",
        "LLM API integration (Claude API, OpenAI API)",
        "Google ML Kit",
      ],
    },
    {
      category: "Mobile Platform",
      skills: [
        "Background Services",
        "Push Notifications",
        "Google Maps SDK",
        "Geolocation",
        "In-App Purchases (RevenueCat)",
        "AdMob",
        "GoRouter / Navigator 2.0",
      ],
    },
    {
      category: "Tools & Collaboration",
      skills: ["Figma", "FlutterFlow", "Jira", "Agile/Scrum", "Code Review"],
    },
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
