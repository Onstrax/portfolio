import { SITE } from "@/shared/config/site";

import type { ProfileText } from "../types";

export const profileEs = {
  meta: {
    title: "Perfil",
    hardwareName: "Procesador (CPU)",
    description: `Perfil profesional, formación, idiomas y reconocimientos de ${SITE.authorName}, estudiante de Ingeniería de Sistemas y Computación.`,
  },
  degree: "Ingeniería de Sistemas y Computación",
  focusAreas: ["Desarrollo de software", "Cloud/DevOps", "Seguridad aplicada", "Machine Learning"],
  availability: "Disponible desde enero de 2027 · Tiempo completo · Presencial o híbrido en Bogotá",
  summaryTitle: "Resumen",
  summary: [
    "Estudiante trilingüe de Ingeniería de Sistemas y Computación en la Universidad de los Andes, en el último semestre de asignaturas y desarrollando la tesis.",
    "Experiencia práctica en diseño, desarrollo fullstack y despliegue de software, automatización y servicios cloud en GCP y AWS.",
    "Interés especial en criptografía, ciberseguridad defensiva, backend/frontend, optimización algorítmica, DevOps e inteligencia artificial.",
    "He construido soluciones en equipos ágiles y multiculturales, aplicando arquitectura de software, pruebas, Design Thinking y un enfoque centrado en las personas.",
  ],
  educationTitle: "Formación",
  education: {
    uniandes: {
      program: "Ingeniería de Sistemas y Computación",
      detail:
        "Último semestre de asignaturas; tesis en desarrollo; opción académica en Machine Learning, que se completa con el grado.",
    },
    hm: {
      program: "Intercambio académico · Múnich, Alemania",
      detail:
        "Ingeniería de Software, Blockchain, Interacción Humano-Computadora y UX con seguimiento ocular; trabajo en equipos internacionales.",
    },
  },
  gpaLabel: "Promedio",
  graduationLabel: "Graduación prevista",
  coursesLabel: "Cursos relevantes",
  courses: [
    "Ingeniería Criptográfica y sus Aplicaciones en TI",
    "Computación Cuántica y Criptografía",
    "Algoritmos de Computación Cuántica",
    "Infraestructura Computacional",
    "Diseño y Análisis de Algoritmos",
    "Fundamentos de Machine Learning",
    "Inteligencia de Negocios",
    "Modelado, Simulación y Optimización",
    "El Hombre Artificial",
    "Análisis con Deep Learning",
    "Principios y Fundamentos del Deep Learning",
    "Desarrollo de Software en Equipo",
    "Construcción de Aplicaciones Móviles",
    "Desarrollo de Software en la Nube",
    "DevOps y Despliegue Continuo",
  ],
  additionalTraining: "Formación adicional: Academia GEAR de Google (en curso).",
  languagesTitle: "Idiomas",
  languages: {
    es: { name: "Español", level: "Nativo" },
    en: { name: "Inglés", level: "C1, IELTS General Training 7,5 (2025)" },
    de: { name: "Alemán", level: "B1, sin certificar; cursado en Hochschule München" },
  },
  recognitionTitle: "Reconocimientos",
  hallOfFame:
    "Hall de la Fama de Estructuras de Datos y Algoritmos (semestre 2022-20), por la implementación de los Retos 1, 2 y 3.",
  projectAwards:
    "Tres proyectos reconocidos como los mejores de su sección y dos segundos puestos.",
  projectAwardsLinkLabel: "Ver los proyectos",
} satisfies ProfileText;
