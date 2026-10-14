import { SITE } from "@/shared/config/site";

import type { StackText } from "../types";

export const stackEs = {
  meta: {
    title: "Stack tecnológico",
    hardwareName: "Memoria RAM",
    description: `Stack tecnológico de ${SITE.authorName}: lenguajes, frontend, backend, cloud en GCP y AWS, DevOps, datos, seguridad y metodologías.`,
  },
  groups: {
    languages: { title: "Lenguajes" },
    frontend: { title: "Frontend y móvil" },
    backend: { title: "Backend y APIs", note: "Diseño e integración de APIs REST." },
    gcp: { title: "Cloud: Google Cloud" },
    aws: { title: "Cloud: AWS" },
    devops: { title: "DevOps y herramientas" },
    data: {
      title: "Datos e inteligencia artificial",
      note: "Opción académica en Machine Learning. Además de los dos proyectos públicos de Proyectos, he construido un MLP que clasifica rayos gamma y hadrones, una CNN que diagnostica enfermedades de la yuca a partir de fotos y ejercicios de regresión lineal y K-Means, en repositorios privados.",
    },
    security: { title: "Seguridad y criptografía" },
  },
  methodsTitle: "Ingeniería y metodologías",
  methods: [
    "Arquitectura de software",
    "Estructuras de datos",
    "Análisis Big O",
    "Optimización de algoritmos",
    "Pruebas automatizadas",
    "Agile/Scrum",
    "Design Thinking",
    "Modelado ER",
    "Redes: TCP/IP, UDP y DNS",
  ],
} satisfies StackText;
