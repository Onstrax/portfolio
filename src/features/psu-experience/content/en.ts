import { SITE } from "@/shared/config/site";

import type { ExperienceText } from "../types";

export const experienceEn = {
  meta: {
    title: "Experience",
    hardwareName: "Power supply (PSU)",
    description: `Experience of ${SITE.authorName} as a teaching assistant, freelance developer and programming tutor, plus his interpersonal skills.`,
  },
  jobsTitle: "Work experience",
  jobs: {
    "teaching-assistant": {
      role: "Teaching Assistant",
      highlights: [
        {
          text: "Support ~30 students in IT Product Design and Innovation through assessment, in-class Q&A, supplementary workshops and creation of learning materials.",
          emphasis: "~30 students",
        },
      ],
    },
    freelance: {
      role: "Freelance Software Developer",
      highlights: [
        {
          text: "Automated data extraction and entry for hundreds to thousands of hotel bookings per run, cutting approximately one week of repetitive work to one day.",
          emphasis: "approximately one week of repetitive work to one day",
        },
        "Designed and deployed a dental practice website, which I still maintain.",
      ],
    },
    tutor: {
      role: "Private Programming Tutor",
      highlights: [
        {
          text: "Tutored ~20 students in programming, OOP, data structures and algorithms; designed practice exercises and led one-on-one sessions and groups of up to five.",
          emphasis: "~20 students",
        },
        "Courses: Introduction to Programming; Data Structures and Algorithms; Object-Oriented Design and Programming; Team Software Development.",
        "My students improve their performance in projects and exams; most come back for later courses and recommend me.",
      ],
    },
  },
  dentalSiteLinkLabel: "See the project",
  automationLinkLabel: "See the repository",
  skillsTitle: "Interpersonal skills",
  skills: [
    "Analytical problem-solving",
    "Clear cross-cultural communication",
    "Teamwork and leadership",
    "Teaching and mentoring",
    "Ownership and initiative",
    "Adaptability and user empathy",
  ],
  leadershipTitle: "Leadership",
  leadership:
    "Former co-representative of the Universidad de los Andes calisthenics team: organized tournaments and activities.",
} satisfies ExperienceText;
