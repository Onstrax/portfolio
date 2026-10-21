import { SITE } from "@/shared/config/site";

import type { ProjectsText } from "../types";

export const projectsEn = {
  meta: {
    title: "Projects",
    hardwareName: "NVMe SSD",
    description: `Projects by ${SITE.authorName}: post-quantum authentication thesis, AndeSpace, HabiCapital, a production website, and cloud and DevOps work.`,
  },
  featuredTitle: "Featured",
  moreTitle: "More projects",
  linkLabels: {
    repository: "Repository",
    code: "Code",
    flutter: "Flutter",
    frontend: "Frontend",
    backend: "Backend",
    wiki: "Wiki",
    landing: "Landing",
    "live-site": "Live site",
  },
  caseLinkLabel: "Read the full case study",
  projects: {
    thesis: {
      name: "Thesis: post-quantum zero-knowledge authentication",
      tagline: "Ongoing research",
      highlights: [
        {
          text: "Co-designing a quantum-resistant Zero-Knowledge authentication protocol based on Learning with Errors (LWE); leading the LWE mathematical component.",
          emphasis: "quantum-resistant",
        },
        "Theoretical framework completed; developing benchmarks for runtime, memory, network traffic and estimated security strength in bits.",
      ],
      note: "Advised at Universidad de los Andes.",
    },
    andespace: {
      tagline: "University space booking app",
      highlights: [
        "Owned the search, home, booking and profile/friends features end to end, integrating mobile UI, API and data layer.",
        "Used SonarQube for code quality checks.",
      ],
      award: "Best Project in its section · Mobile Application Development",
    },
    habicapital: {
      tagline: "Secure digital banking simulation",
      highlights: [
        "Individually designed and built a P2P platform with applied security: JWT, Argon2id, AES-256-GCM, HMAC, immutable ledger and idempotency.",
        {
          text: "AI-assisted specification-driven development (SDD) and TDD; over 100 passing automated tests and ~94% reported code coverage.",
          emphasis: "~94% reported code coverage",
        },
      ],
    },
    "dental-site": {
      name: "Dental practice website",
      tagline: "Production site for a real client",
      highlights: [
        "Designed, built and deployed the whole site: treatments, team, FAQ, clinic map and legal pages.",
        {
          text: "WhatsApp call to action and contact form; it has helped attract an estimated 2-3 new clients per month.",
          emphasis: "2-3 new clients per month",
        },
        "Ongoing maintenance since launch.",
      ],
    },
    "monitoring-platform": {
      name: "Teaching assistant tracking platform",
      tagline: "Cloud",
      highlights: [
        "Co-developed a weekly progress-tracking platform for faculty and teaching assistants on Cloud Run, Compute Engine, Cloud SQL, Cloud Storage, IAM and Artifact Registry.",
      ],
    },
    "email-blacklist": {
      name: "Email blacklist microservice",
      tagline: "DevOps",
      highlights: [
        "Collaborated on a microservice with automated integration and deployment on ECS/Fargate, RDS, CloudWatch, CodeBuild and CodePipeline.",
      ],
    },
    ahorrapp: {
      tagline: "Personal finance for university students",
      highlights: [
        "Built the functional application and contributed to interviews, JTBD/ICP definition, user feedback cycles and product validation.",
      ],
      award: "Best Project in its section · IT Product Design and Innovation",
    },
    dogspa: {
      tagline: "Location and services management",
      highlights: [
        "Built end-to-end location, city and service-catalog modules with frontend-backend integration.",
      ],
      award: "Best Final Project in its section · Team Software Development",
    },
    algorithms: {
      name: "Design and Analysis of Algorithms projects",
      tagline: "Optimization and heuristics",
      highlights: [
        "Cost minimization on graphs, using traversal and manipulation algorithms.",
        "Heuristic-based approximate solution to the NP-complete pancake sorting problem.",
      ],
      award: "Two runner-up awards in its section",
    },
    "respiratory-etl": {
      name: "Acute respiratory disease ETL for Bogotá",
      tagline: "Data engineering",
      highlights: [
        "Built the whole ETL pipeline: extraction, transformation and incremental loading into a SQLite data warehouse served through a FastAPI API. Teammates trained a regression model and built the Power BI dashboards.",
      ],
    },
    "sdg-text-classifier": {
      name: "Sustainable Development Goals text classifier",
      tagline: "Machine Learning",
      highlights: [
        "Trained and evaluated an SVM model that classifies texts into 4 Sustainable Development Goals, and explored and processed the data.",
        "Built the Next.js web interface and its connection to the model API, implemented data augmentation and compared its results, and coordinated the team’s deliverables.",
      ],
    },
  },
  cases: {
    thesis: {
      title: "Post-quantum authentication thesis",
      description:
        "Case study of my thesis: a quantum-resistant zero-knowledge authentication protocol based on Module-LWE.",
      problem: [
        "Quantum computing is expected to break the cryptography that protects authentication today somewhere between 2028 and 2035. At the same time, users usually hand over more information than they should just to prove who they are, and lose control of their data.",
        "Left unsolved, the risk is twofold: identity theft and leaks of sensitive personal information.",
      ],
      team: "Thesis written in a team of 2. Both of us contribute to every part, but each one leads a different area.",
      contributions: [
        "Lead the Learning with Errors (LWE) mathematical component, including the choice of its variant and parameters.",
        "Co-design the authentication protocol and its prototype.",
      ],
      teamContributions: "My partner leads the zero-knowledge proof (ZKP) part.",
      decisions: [
        {
          options:
            "An interactive or a non-interactive protocol; and, for LWE, the binary, Ring-LWE, Module-LWE or rounding (Learning with Rounding) variant.",
          choice: "A non-interactive protocol based on Module-LWE.",
          reason:
            "Both can be tuned easily to reach a given security target, are lightweight and run on low-end devices.",
        },
      ],
      changes: [
        "The first version of the prototype could leak the user’s secret, so it was redesigned: instead of sending the commitment over the network, it now sends only its high bits, which the verifier reconstructs.",
      ],
      outcome: [
        {
          text: "Network traffic went from megabytes down to a few kilobytes.",
          emphasis: "from megabytes down to a few kilobytes",
        },
        {
          text: "Runtime went from several seconds to under half a second.",
          emphasis: "under half a second",
        },
        "The theoretical framework is complete; benchmarks for runtime, memory, network traffic and security in bits are still in progress.",
      ],
      learned: [
        "Would add someone with an electronic engineering background to the team, to take the NTT (number-theoretic transform) from theory to a real implementation.",
      ],
    },
    andespace: {
      title: "AndeSpace",
      description:
        "AndeSpace case study: an app to book university spaces and coordinate with friends based on their schedules.",
      problem: [
        "University spaces went unused, and there was no simple way to book group spaces or to get together with friends based on everyone’s schedule.",
        "Without it, spaces and time are wasted, and groups fail to coordinate because finding a common slot takes too much effort.",
      ],
      team: "Team of 6: three people on the Kotlin app and three on the Flutter app, all of them also on the shared backend and database. Worked on the Flutter app.",
      contributions: [
        "Designed and built the home screen, search, classroom booking and the friends network with visibility statuses (busy, at home, free…).",
        "Each one end to end: brainstorming, design, documentation, database, backend and Flutter.",
      ],
      teamContributions:
        "Teammates built, also end to end, settings, favorites, history, personal schedules, schedule matching with friends, in-app notifications and the room detail view.",
      decisions: [
        {
          options:
            "A home screen with many features or only the essentials, and a busy or a restrained design.",
          choice: "A simple home screen and a restrained design.",
          reason:
            "To reduce friction, make the app understandable without explanations and avoid overwhelming its users.",
        },
        {
          options: "Always showing friends or not.",
          choice: "Letting each person decide how visible they are to their friends.",
          reason: "Privacy stays in the user’s hands, not the app’s.",
        },
      ],
      changes: [
        "The social side was not in the original plan. Feedback showed it was essential, because people’s social circle is inseparable from how they use spaces, so the team pivoted to include it.",
      ],
      outcome: [
        {
          text: "Best Project in its section in Mobile Application Development.",
          emphasis: "Best Project in its section",
        },
        "Learned, for the first time, to build one unified backend that serves two different frontends.",
      ],
      learned: [
        "Would bring the friends and schedules features in much earlier, since they added the most value.",
      ],
    },
    "dental-site": {
      title: "Dental practice website",
      description:
        "Case study of a dental practice website: from the problem to a live site that brings in new patients every month.",
      problem: [
        "The practice had no online presence.",
        "That meant losing the patients who search through digital channels, a new market for the practice.",
      ],
      team: "Individual work for a real client.",
      contributions: [
        "Identified the problem and talked with the dentist to understand what she needed.",
        "Specified the requirements, designed, built and deployed the site, and still maintain it.",
      ],
      decisions: [
        {
          options: "Writing with the dentist’s vocabulary or with one meant for patients.",
          choice: "Rewriting the copy in plain, patient-friendly language.",
          reason:
            "Her technical vocabulary made it hard to connect with people arriving as patients. The decision has paid off.",
        },
      ],
      changes: [
        "The mobile version was not planned at first. It then became clear that most patients would arrive from their phones rather than from a desktop, so it was added.",
      ],
      outcome: [
        {
          text: "It has helped bring in about 2–3 new patients a month.",
          emphasis: "about 2–3 new patients a month",
        },
        "Still live, with ongoing maintenance.",
      ],
      learned: [
        "Would iterate faster on the final copy, checking it with the dentist earlier for approval.",
      ],
    },
  },
} satisfies ProjectsText;
