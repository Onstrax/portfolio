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
} satisfies ProjectsText;
