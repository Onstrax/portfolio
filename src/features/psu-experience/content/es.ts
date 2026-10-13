import { SITE } from "@/shared/config/site";

import type { ExperienceText } from "../types";

export const experienceEs = {
  meta: {
    title: "Experiencia",
    hardwareName: "Fuente de poder (PSU)",
    description: `Experiencia de ${SITE.authorName} como monitor académico, desarrollador freelance y tutor de programación, y sus competencias interpersonales.`,
  },
  jobsTitle: "Experiencia laboral",
  jobs: {
    "teaching-assistant": {
      role: "Monitor académico",
      highlights: [
        "Acompaño a ~30 estudiantes de Diseño de Productos e Innovación en TI mediante evaluación de entregas, resolución de dudas, talleres de apoyo y creación de material didáctico.",
      ],
    },
    freelance: {
      role: "Desarrollador freelance",
      highlights: [
        "Automaticé la extracción de datos y el registro de cientos a miles de reservas hoteleras por ejecución, reduciendo un proceso semanal a aproximadamente un día.",
        "Diseñé y publiqué la web de un consultorio odontológico, que sigo manteniendo.",
      ],
    },
    tutor: {
      role: "Tutor particular de programación",
      highlights: [
        "He acompañado a ~20 estudiantes en programación, POO, estructuras de datos y algoritmos; diseñé ejercicios y dirigí sesiones individuales y grupos de hasta cinco personas.",
        "Materias: Introducción a la Programación; Estructuras de Datos y Algoritmos; Diseño y Programación Orientada a Objetos; Desarrollo de Software en Equipo.",
        "Mis estudiantes mejoran su desempeño en proyectos y exámenes; la mayoría vuelve a contactarme en materias posteriores y me recomienda.",
      ],
    },
  },
  dentalSiteLinkLabel: "Ver el proyecto",
  skillsTitle: "Competencias interpersonales",
  skills: [
    "Resolución analítica de problemas",
    "Comunicación clara y multicultural",
    "Colaboración y liderazgo",
    "Mentoría y docencia",
    "Autonomía e iniciativa",
    "Adaptabilidad y orientación al usuario",
  ],
  leadershipTitle: "Liderazgo",
  leadership:
    "Ex co-representante del equipo de calistenia de la Universidad de los Andes: organización de torneos y actividades.",
} satisfies ExperienceText;
