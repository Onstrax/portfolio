import { SITE } from "@/shared/config/site";

import type { ProfileText } from "../types";

export const profileEn = {
  meta: {
    title: "Profile",
    hardwareName: "Processor (CPU)",
    description: `Professional profile, education, languages and recognition of ${SITE.authorName}, Systems and Computing Engineering student.`,
  },
  degree: "Systems and Computing Engineering",
  focusAreas: ["Software development", "Cloud/DevOps", "Applied security", "Machine Learning"],
  availability: "Available from January 2027 · Full-time · On-site or hybrid in Bogotá",
  summaryTitle: "Summary",
  summary: [
    "Trilingual Systems and Computing Engineering student at Universidad de los Andes, completing final coursework and an undergraduate thesis.",
    "Hands-on experience designing, building and deploying fullstack software, automating workflows and using cloud services on GCP and AWS.",
    "Particularly interested in cryptography, defensive cybersecurity, backend/frontend engineering, algorithm optimization, DevOps and applied AI.",
    "Experienced in agile and multicultural teams, applying software architecture, testing, Design Thinking and user-centered problem-solving.",
  ],
  educationTitle: "Education",
  education: {
    uniandes: {
      program: "B.Sc. in Systems and Computing Engineering",
      detail:
        "Final semester of coursework; thesis in progress; Machine Learning minor, completed with the degree.",
    },
    hm: {
      program: "Academic exchange · Munich, Germany",
      detail:
        "Software Engineering, Blockchain, Human-Computer Interaction and eye-tracking UX; international team collaboration.",
    },
  },
  gpaLabel: "GPA",
  graduationLabel: "Expected graduation",
  coursesLabel: "Relevant coursework",
  courses: [
    "Cryptographic Engineering and IT Applications",
    "Quantum Computing and Cryptography",
    "Quantum Computing Algorithms",
    "Computer Infrastructure",
    "Design and Analysis of Algorithms",
    "Machine Learning Fundamentals",
    "Business Intelligence",
    "Modeling, Simulation and Optimization",
    "The Artificial Man",
    "Deep Learning Analysis",
    "Principles and Foundations of Deep Learning",
    "Team Software Development",
    "Mobile Application Development",
    "Cloud Software Development",
    "DevOps and Continuous Deployment",
  ],
  additionalTraining: "Additional training: Google GEAR Academy (ongoing).",
  languagesTitle: "Languages",
  languages: {
    es: { name: "Spanish", level: "Native" },
    en: { name: "English", level: "C1, IELTS General Training 7.5 (2025)" },
    de: { name: "German", level: "B1, uncertified; studied at Hochschule München" },
  },
  recognitionTitle: "Recognition",
  hallOfFame:
    "Data Structures and Algorithms Hall of Fame (semester 2022-20), for the implementation of Challenges 1, 2 and 3.",
  projectAwards:
    "Three projects recognized as the best in their section, plus two runner-up awards.",
  projectAwardsLinkLabel: "See the projects",
} satisfies ProfileText;
