import { SITE } from "@/shared/config/site";

import type { StackText } from "../types";

export const stackEn = {
  meta: {
    title: "Tech stack",
    hardwareName: "RAM",
    description: `Tech stack of ${SITE.authorName}: languages, frontend, backend, cloud on GCP and AWS, DevOps, data, security and engineering methods.`,
  },
  groups: {
    languages: { title: "Languages" },
    frontend: { title: "Frontend and mobile" },
    backend: { title: "Backend and APIs", note: "REST API design and integration." },
    gcp: { title: "Cloud: Google Cloud" },
    aws: { title: "Cloud: AWS" },
    devops: { title: "DevOps and tooling" },
    data: { title: "Data and AI", note: "Machine Learning fundamentals." },
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
} satisfies StackText;
