import { SITE } from "@/shared/config/site";

import type { ProfileText } from "../types";

export const profileEn = {
  meta: {
    title: "Profile",
    hardwareName: "Processor (CPU)",
    description: `Professional profile, education, languages and recognition of ${SITE.authorName}, Systems and Computing Engineer.`,
  },
  degree: "Systems and Computing Engineering",
  focusAreas: ["Software development", "Cloud/DevOps", "Applied security", "Machine Learning"],
  availability: "Full-time · On-site or hybrid in Bogotá · Remote worldwide",
  summaryTitle: "Summary",
  summary: [
    "Trilingual Systems and Computing Engineer from Universidad de los Andes.",
    "Hands-on experience in software design, fullstack development and deployment, automation and cloud services on GCP and AWS.",
    "At this exploratory stage I am open to several areas, such as cryptography, defensive cybersecurity, backend and frontend, DevOps and artificial intelligence, in order to shape my career as I learn more about each one.",
    "I have built solutions in agile and multicultural teams, applying software architecture, testing, Design Thinking and a human-centered approach.",
    "My strengths include analytical thinking, initiative, effective communication and the ability to collaborate and lead, with an academic exchange in Germany and certified C1 English.",
  ],
  educationTitle: "Education",
  education: {
    uniandes: {
      program: "Systems and Computing Engineering",
      detail: "Thesis in progress; Machine Learning minor.",
    },
    hm: {
      program: "Academic exchange · Munich, Germany",
      detail:
        "Software Engineering, Blockchain, Human-Computer Interaction and eye-tracking UX; international team collaboration.",
    },
  },
  gpaLabel: "GPA",
  coursesLabel: "Relevant coursework",
  courses: [
    "Object-Oriented Programming",
    "Data Structures and Algorithms",
    "Design and Analysis of Algorithms",
    "Software Architecture and Design",
    "Team Software Development",
    "Mobile Application Development",
    "Computational Infrastructure",
    "Cloud Software Development",
    "DevOps and Continuous Deployment",
    "Cryptographic Engineering and Its Applications in IT",
    "Quantum Computing Algorithms",
    "Fundamentals of Machine Learning",
    "Deep Learning Analysis",
  ],
  additionalTraining: "Additional training: Google GEAR Academy (ongoing).",
  languagesTitle: "Languages",
  languages: {
    es: { name: "Spanish", level: "Native" },
    en: { name: "English", level: "C1, IELTS General Training 7.5 (2025)" },
    de: { name: "German", level: "B1, everyday conversation; uncertified" },
  },
  recognitionTitle: "Recognition",
  hallOfFame:
    "Data Structures and Algorithms Hall of Fame (semester 2022-20), for the implementation of Challenges 1, 2 and 3.",
  projectAwards:
    "Three projects recognized as the best in their section, plus two runner-up awards.",
  projectAwardsLinkLabel: "See the projects",
} satisfies ProfileText;
