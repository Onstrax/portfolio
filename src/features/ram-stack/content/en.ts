import { SITE } from "@/shared/config/site";

import type { StackText } from "../types";

export const stackEn = {
  meta: {
    title: "Tech stack",
    hardwareName: "RAM",
    description: `Tech stack of ${SITE.authorName}: languages, frontend, backend, cloud on GCP and AWS, DevOps, data, security and AI-assisted development.`,
  },
  groups: {
    languages: { title: "Languages" },
    frontend: { title: "Frontend and mobile" },
    backend: { title: "Backend and APIs", note: "REST API design and integration." },
    gcp: { title: "Cloud: Google Cloud" },
    aws: { title: "Cloud: AWS" },
    devops: { title: "DevOps and tooling" },
    data: {
      title: "Data and AI",
      note: "Machine Learning minor. Besides the two public projects in Projects, built an MLP that classifies gamma rays and hadrons, a CNN that diagnoses cassava diseases from photos, and linear regression and K-Means exercises, in private repositories.",
    },
    security: { title: "Security and cryptography" },
  },
  methodsTitle: "Engineering and methods",
  methods: [
    "Software architecture",
    "Data structures",
    "Big O analysis",
    "Algorithm optimization",
    "Automated testing",
    "Agile/Scrum",
    "Design Thinking",
    "ER modeling",
    "Networking: TCP/IP, UDP and DNS",
  ],
  aiTitle: "AI-assisted development",
  aiDescription:
    "Language models support me from the conception of a product to the end of its development cycle. I lean on them to research, specify, build and test, but the decisions are mine.",
  aiGroups: { harnesses: "Agent harnesses", tools: "Tools", models: "Models" },
  aboutLinkLabel: "How I built this portfolio",
} satisfies StackText;
