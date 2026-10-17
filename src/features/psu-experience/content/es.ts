import { SITE } from "@/shared/config/site";

import type { ExperienceText } from "../types";

export const experienceEs = {
  meta: {
    title: "Experiencia",
    hardwareName: "Fuente de poder (PSU)",
    description: `Experiencia de ${SITE.authorName} como desarrollador freelance, monitor académico y tutor de programación, y sus competencias interpersonales.`,
  },
  jobsTitle: "Experiencia laboral",
  jobs: {
    freelance: {
      role: "Desarrollador freelance",
      highlights: [
        {
          text: "Automaticé con Python/Selenium la extracción de datos y el registro de cientos a miles de reservas hoteleras por ejecución, reduciendo un proceso semanal a aproximadamente un día.",
          emphasis: "un proceso semanal a aproximadamente un día",
        },
        {
          text: "Diseñé y publiqué una web odontológica (Next.js, Tailwind CSS, Netlify) con CTA a WhatsApp y formulario de contacto; ha contribuido a atraer ~2-3 nuevos clientes al mes.",
          emphasis: "~2-3 nuevos clientes al mes",
        },
      ],
    },
    "teaching-assistant": {
      role: "Monitor académico",
      highlights: [
        {
          text: "He acompañado a ~60 estudiantes de Diseño de Productos e Innovación en TI, en dos semestres, mediante evaluación de entregas, resolución de dudas, talleres de apoyo y creación de material didáctico.",
          emphasis: "~60 estudiantes",
        },
        "Doy retroalimentación a equipos cuyos proyectos buscan llegar al mercado, en sus iteraciones de JTBD, ICP, customer discovery y encaje Producto-Mercado-Modelo-Canal; creación y validación de hipótesis; un MVP en tres iteraciones; growth loops; estimación de mercado y monetización.",
      ],
    },
    tutor: {
      role: "Tutor particular de programación",
      highlights: [
        {
          text: "He acompañado a ~20 estudiantes en programación, POO, estructuras de datos y algoritmos; diseñé ejercicios y dirigí sesiones personalizadas individuales y grupales de hasta cuatro personas.",
          emphasis: "~20 estudiantes",
        },
        "Materias: Introducción a la Programación; Estructuras de Datos y Algoritmos; Diseño y Programación Orientada a Objetos; Desarrollo de Software en Equipo.",
        "Mis estudiantes mejoran su desempeño en proyectos y exámenes; la mayoría vuelve a contactarme en materias posteriores y me recomienda.",
      ],
    },
  },
  dentalSiteLinkLabel: "Ver el proyecto",
  automationLinkLabel: "Ver el repositorio",
  skillsTitle: "Competencias interpersonales",
  skills: [
    "Resolución analítica de problemas",
    "Comunicación clara y multicultural",
    "Colaboración y liderazgo",
    "Autonomía e iniciativa",
    "Orientación al detalle",
    "Trabajo bajo presión",
    "Adaptabilidad y orientación al usuario",
    "Mentoría y docencia",
  ],
  leadershipTitle: "Liderazgo",
  leadership:
    "Ex co-representante del equipo de calistenia de la Universidad de los Andes: organización de torneos y actividades.",
} satisfies ExperienceText;
