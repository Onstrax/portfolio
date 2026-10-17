import { SITE } from "@/shared/config/site";

import type { ProfileText } from "../types";

export const profileEs = {
  meta: {
    title: "Perfil",
    hardwareName: "Procesador (CPU)",
    description: `Perfil profesional, formación, idiomas y reconocimientos de ${SITE.authorName}, Ingeniero de Sistemas y Computación.`,
  },
  degree: "Ingeniería de Sistemas y Computación",
  focusAreas: ["Desarrollo de software", "Cloud/DevOps", "Seguridad aplicada", "Machine Learning"],
  availability: "Tiempo completo · Presencial o híbrido en Bogotá · Remoto a nivel mundial",
  summaryTitle: "Resumen",
  summary: [
    "Ingeniero de Sistemas y Computación trilingüe de la Universidad de los Andes.",
    "Experiencia práctica en diseño, desarrollo fullstack y despliegue de software, automatización y servicios cloud en GCP y AWS.",
    "En esta etapa de exploración estoy abierto a varias áreas, como criptografía, ciberseguridad defensiva, backend y frontend, DevOps e inteligencia artificial, con el fin de perfilar mi carrera a medida que profundice en cada una.",
    "He construido soluciones en equipos ágiles y multiculturales, aplicando arquitectura de software, pruebas, Design Thinking y un enfoque centrado en las personas.",
    "Me caracterizan el pensamiento analítico, la iniciativa, la comunicación efectiva y la capacidad de colaborar y liderar; con intercambio académico en Alemania e inglés C1 certificado.",
  ],
  educationTitle: "Formación",
  education: {
    uniandes: {
      program: "Ingeniería de Sistemas y Computación",
      detail: "Tesis en desarrollo; opción académica en Machine Learning.",
    },
    hm: {
      program: "Intercambio académico · Múnich, Alemania",
      detail:
        "Ingeniería de Software, Blockchain, Interacción Humano-Computadora y UX con seguimiento ocular; trabajo en equipos internacionales.",
    },
  },
  gpaLabel: "Promedio",
  coursesLabel: "Cursos relevantes",
  courses: [
    "Programación Orientada a Objetos",
    "Estructuras de Datos y Algoritmos",
    "Diseño y Análisis de Algoritmos",
    "Arquitectura y Diseño de Software",
    "Desarrollo de Software en Equipo",
    "Construcción de Aplicaciones Móviles",
    "Infraestructura Computacional",
    "Desarrollo de Software en la Nube",
    "DevOps y Despliegue Continuo",
    "Ingeniería Criptográfica y sus Aplicaciones en TI",
    "Algoritmos de Computación Cuántica",
    "Fundamentos de Machine Learning",
    "Análisis con Deep Learning",
  ],
  additionalTraining: "Formación adicional: Academia GEAR de Google (en curso).",
  languagesTitle: "Idiomas",
  languages: {
    es: { name: "Español", level: "Nativo" },
    en: { name: "Inglés", level: "C1, IELTS General Training 7,5 (2025)" },
    de: { name: "Alemán", level: "B1, conversación cotidiana; sin certificar" },
  },
  recognitionTitle: "Reconocimientos",
  hallOfFame:
    "Hall de la Fama de Estructuras de Datos y Algoritmos (semestre 2022-20), por la implementación de los Retos 1, 2 y 3.",
  projectAwards:
    "Tres proyectos reconocidos como los mejores de su sección y dos segundos puestos.",
  projectAwardsLinkLabel: "Ver los proyectos",
} satisfies ProfileText;
