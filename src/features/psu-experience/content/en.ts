import { SITE } from "@/shared/config/site";

import type { ExperienceText } from "../types";

export const experienceEn = {
  meta: {
    title: "Experience",
    hardwareName: "Power supply (PSU)",
    description: `Experience of ${SITE.authorName} as a freelance developer, teaching assistant and programming tutor, plus his interpersonal skills.`,
  },
  jobsTitle: "Work experience",
  jobs: {
    freelance: {
      role: "Freelance Developer",
      highlights: [
        {
          text: "Automated data extraction and the entry of hundreds to thousands of hotel reservations per run with Python/Selenium, reducing a weekly process to approximately one day.",
          emphasis: "a weekly process to approximately one day",
        },
        {
          text: "Designed and launched a dental website (Next.js, Tailwind CSS, Netlify) with a WhatsApp CTA and contact form; it has helped attract ~2-3 new clients per month.",
          emphasis: "~2-3 new clients per month",
        },
      ],
    },
    "teaching-assistant": {
      role: "Teaching Assistant",
      highlights: [
        {
          text: "Supported ~60 students in Product Design and Innovation in IT over two semesters by assessing submissions, answering questions, running support workshops and creating teaching materials.",
          emphasis: "~60 students",
        },
        "I give feedback to teams whose projects aim to reach the market, across their iterations of JTBD, ICP, customer discovery and Product-Market-Model-Channel fit; hypothesis creation and validation; an MVP built in three iterations; growth loops; market sizing and monetization.",
      ],
    },
    tutor: {
      role: "Private Programming Tutor",
      highlights: [
        {
          text: "I have tutored ~20 students in programming, OOP, data structures and algorithms; designed exercises and led personalized one-on-one and group sessions of up to four people.",
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
    "Clear and multicultural communication",
    "Collaboration and leadership",
    "Autonomy and initiative",
    "Attention to detail",
    "Working under pressure",
    "Adaptability and user focus",
    "Mentoring and teaching",
  ],
  leadershipTitle: "Leadership",
  leadership:
    "Former co-representative of the Universidad de los Andes calisthenics team: organized tournaments and activities.",
} satisfies ExperienceText;
