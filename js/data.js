/* Single source of truth for every word on the page.
 * Source: files/Andrew_Ayad_Flutter_Developer_CV.docx (the PDF is its export).
 * Contract: specs/002-cv-motion-redesign/contracts/site-data.contract.md
 * Gate:     python3 specs/002-cv-motion-redesign/check-cv-sync.py
 *
 * Every string here is the CV, word for word. Do not add claims the CV does
 * not make. To publish a product link, set its `url` from null to the
 * listing URL; a null url renders as plain text with no link affordance.
 */
const SITE_DATA = Object.freeze({
  profile: {
    name: "Andrew Ayad Wadie",
    headline: "Senior Flutter Developer | Mobile Application Engineer | Dart",
    location: "Cairo, Egypt",
    summary:
      "Flutter developer with 5+ years of experience building and releasing 10 production Flutter applications on Google Play and the App Store for government, telecom, booking, and e-commerce clients. Works mainly with Clean Architecture, Bloc/Cubit, Dio/Retrofit, and GetIt/Injectable, with hands-on experience integrating payment gateways (PayFort, Paymob), Firebase, and Google Maps. Built government apps for the Saudi Ministry of Environment and Ministry of Agriculture, and handles the release cycle end to end: CI/CD builds, store submission, crash monitoring, and hotfixes. Uses AI-assisted development tools (Claude Code, OpenAI Codex, spec-driven development) in daily work.",
    // Each value is stated in the summary above (research R2).
    stats: [
      { value: 5, suffix: "+", label: "Years building Flutter apps" },
      { value: 10, suffix: "", label: "Production apps released" },
      { value: 2, suffix: "", label: "Saudi ministries served" },
    ],
    photo: "images/profile.jpg",
    photoAlt:
      "Andrew Ayad, seated with hands clasped, wearing a dark green shirt against a deep green backdrop",
    cv: "files/Andrew_Ayad_Flutter_Developer_CV.pdf",
  },

  // CV section order. Nav, section index numbers and scroll-spy read this.
  sections: [
    { id: "summary", heading: "Professional Summary", nav: "Summary", render: null },
    { id: "experience", heading: "Professional Experience", nav: "Experience", render: "experience" },
    { id: "skills", heading: "Technical Skills", nav: "Skills", render: "skills" },
    { id: "education", heading: "Education", nav: "Education", render: "education" },
    { id: "languages", heading: "Languages", nav: "Languages", render: "languages" },
    { id: "contact", heading: "Contact", nav: "Contact", render: "contact" },
  ],

  // CV header order.
  contact: [
    {
      kind: "whatsapp",
      label: "Phone / WhatsApp",
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
      kind: "website",
      label: "Website",
      value: "andrewayad.online",
      href: "https://andrewayad.online",
      icon: "#icon-globe",
    },
    {
      kind: "linkedin",
      label: "LinkedIn",
      value: "linkedin.com/in/andrew-ayad-58764315a",
      href: "https://linkedin.com/in/andrew-ayad-58764315a",
      icon: "#icon-linkedin",
    },
    {
      kind: "github",
      label: "GitHub",
      value: "github.com/andrewayadwadie",
      href: "https://github.com/andrewayadwadie",
      icon: "#icon-github",
    },
  ],

  experience: [
    {
      company: "Noor Data Network",
      location: "Sheikh Zayed, Giza, Egypt",
      role: "Mobile Application Engineer (Flutter)",
      start: "Nov 2022",
      end: "Present",
      bullets: [
        "Built and maintained 3 production Flutter applications for telecom self-service, restaurant and activity reservations, and padel court booking, with online payments integrated through PayFort and Paymob.",
        "Refactored existing codebases to Clean Architecture with Bloc/Cubit, improving maintainability and reducing UI jank and startup time on low-end Android devices.",
        "Set up CI/CD pipelines with GitHub Actions for automated builds, and wrote unit, bloc, and widget tests (bloc_test, mocktail) for core features.",
        "Introduced AI-assisted development workflows (Claude Code, OpenAI Codex, GitHub Spec Kit) to the team and wrote reusable AI agent skills used in daily feature development.",
        "Owned the release process for live apps on Google Play and the Apple App Store: versioning, staged rollouts, crash monitoring, and hotfixes.",
        "Worked with product managers and UI/UX designers in Agile sprints to turn business requirements into shipped features.",
      ],
      products: [
        { name: "Noor App", description: "telecom bill payment & quota management", url: null },
        { name: "Zabatnee", description: "restaurant/activity reservations with in-app payments", url: null },
        { name: "IPadel", description: "padel court booking with integrated payments", url: null },
      ],
    },
    {
      company: "WABC Group",
      location: "Heliopolis, Cairo, Egypt",
      role: "Mobile Application Engineer (Flutter)",
      start: "Jan 2022",
      end: "Nov 2022",
      bullets: [
        "Developed 3 government applications for the Saudi Ministry of Environment and Ministry of Agriculture, plus an e-commerce app (Arganzwina), with real-time data sync and integration with government APIs.",
        "Built offline mode with data sync when connectivity returns, in-app photo and video capture with media upload, and map-based location tracking for field inspection workflows.",
        "Implemented state management with GetX across live inspection and audit workflows.",
      ],
      products: [
        { name: "Livestock App", description: "location-based livestock tracking & inspection", url: null },
        { name: "Environmental Reporting App", description: "citizen issue reporting with media attachments", url: null },
        { name: "Quality Management App", description: "real-time audit logging", url: null },
        { name: "Arganzwina", description: "e-commerce with integrated payments", url: null },
      ],
    },
    {
      company: "Innovation Agency",
      location: "Dokki, Giza, Egypt",
      role: "Mobile Application Engineer (Flutter)",
      start: "Feb 2021",
      end: "Jan 2022",
      bullets: [
        "Developed 3 production apps end to end, from requirements analysis and UI prototyping to testing, deployment, and client handover.",
        "Integrated Firebase (Firestore, Realtime Database, Cloud Functions, FCM) and Google ML Kit for real-time features, push notifications, and on-device ML.",
        "Introduced modular code structure and unit tests to existing codebases to improve reliability and reuse across projects.",
        "Communicated directly with clients to turn business needs into technical solutions and reduce rework during acceptance.",
      ],
      products: [
        { name: "El Imam Mady Abo El Azaym University App", description: "attendance, grades, notifications", url: null },
        { name: "Elmenofy", description: "e-commerce with real-time location tracking", url: null },
        { name: "Matrix Auction App", description: "dynamic bidding with secure payments", url: null },
      ],
    },
  ],

  // Items are split on ", " outside parentheses only.
  skills: [
    {
      category: "Languages & Frameworks",
      skills: ["Dart", "Flutter (cross-platform mobile: Android & iOS)", "JavaScript"],
    },
    {
      category: "State Management",
      skills: ["Bloc", "Cubit", "Provider", "GetX"],
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
        "Performance Optimization",
      ],
    },
    {
      category: "Networking & Data",
      skills: [
        "RESTful APIs (Dio, Retrofit)",
        "Firebase (Firestore, Realtime DB, Cloud Functions, Auth, FCM)",
        "Hive",
        "SQLite (sqflite)",
        "Offline Data Sync",
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
        "custom AI agent skills",
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
        "Camera & Media Upload",
        "Localization (Arabic/English, RTL)",
        "GoRouter / Navigator 2.0",
      ],
    },
    {
      category: "Payments & Monetization",
      skills: [
        "Payment Gateway Integration (PayFort, Paymob)",
        "In-App Purchases (RevenueCat)",
        "AdMob",
      ],
    },
    {
      category: "Tools & Collaboration",
      skills: ["Figma", "FlutterFlow", "Jira", "Agile/Scrum"],
    },
  ],

  education: {
    degree: "Bachelor of Computers and Informatics, Computer Science",
    graduated: "2019",
    faculty: "Faculty of Computers and Informatics",
    institution: "Zagazig University, Egypt",
    project: "Optical Mark Recognition",
    grade: "Excellent",
  },

  languages: [
    { language: "Arabic", level: "Native" },
    { language: "English", level: "Good (technical reading & writing)" },
  ],
});
