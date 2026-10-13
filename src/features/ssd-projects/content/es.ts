import { SITE } from "@/shared/config/site";

import type { ProjectsText } from "../types";

export const projectsEs = {
  meta: {
    title: "Proyectos",
    hardwareName: "SSD NVMe",
    description: `Proyectos de ${SITE.authorName}: tesis de autenticación poscuántica, AndeSpace, HabiCapital, una web en producción y trabajos de cloud y DevOps.`,
  },
  featuredTitle: "Destacados",
  moreTitle: "Más proyectos",
  linkLabels: {
    repository: "Repositorio",
    code: "Código",
    flutter: "Flutter",
    frontend: "Frontend",
    backend: "Backend",
    wiki: "Wiki",
    landing: "Landing",
    "live-site": "Sitio en vivo",
  },
  projects: {
    thesis: {
      name: "Tesis: autenticación poscuántica de conocimiento cero",
      tagline: "Investigación en desarrollo",
      highlights: [
        "Codiseño de un protocolo de autenticación Zero-Knowledge resistente a ataques cuánticos, basado en Learning with Errors (LWE); lidero el componente matemático LWE.",
        "Marco teórico completado; en desarrollo, benchmarks de tiempo, memoria, tráfico de red y estimación de seguridad en bits.",
      ],
      note: "Asesorada en la Universidad de los Andes.",
    },
    andespace: {
      tagline: "Reservas de espacios universitarios",
      highlights: [
        "Implementé de extremo a extremo los módulos de búsqueda, inicio, reservas y perfil/amigos, integrando interfaz móvil, API y datos.",
        "Calidad de código apoyada en SonarQube.",
      ],
      award: "Mejor proyecto de su sección · Construcción de Aplicaciones Móviles",
    },
    habicapital: {
      tagline: "Simulación de banca digital segura",
      highlights: [
        "Diseñé y construí individualmente una plataforma P2P con seguridad aplicada: JWT, Argon2id, AES-256-GCM, HMAC, ledger inmutable e idempotencia.",
        "Desarrollo asistido por IA con especificaciones (SDD) y TDD; más de 100 pruebas automatizadas exitosas y ~94 % de cobertura reportada.",
      ],
    },
    "dental-site": {
      name: "Web para un consultorio odontológico",
      tagline: "Sitio en producción para un cliente real",
      highlights: [
        "Diseñé, desarrollé y publiqué el sitio completo: tratamientos, profesionales, preguntas frecuentes, mapa de sedes y páginas legales.",
        "Llamada a la acción por WhatsApp y formulario de contacto; ha contribuido a atraer ~2-3 nuevos clientes al mes.",
        "Mantenimiento continuo desde su publicación.",
      ],
    },
    "monitoring-platform": {
      name: "Plataforma de seguimiento de monitorías",
      tagline: "Cloud",
      highlights: [
        "Desarrollé en equipo un sistema de seguimiento semanal entre docentes y monitores sobre Cloud Run, Compute Engine, Cloud SQL, Cloud Storage, IAM y Artifact Registry.",
      ],
    },
    "email-blacklist": {
      name: "Microservicio de lista negra de correos",
      tagline: "DevOps",
      highlights: [
        "Participé en el desarrollo y la entrega de un microservicio con integración y despliegue automatizados sobre ECS/Fargate, RDS, CloudWatch, CodeBuild y CodePipeline.",
      ],
    },
    ahorrapp: {
      tagline: "Finanzas personales para universitarios",
      highlights: [
        "Desarrollé la aplicación funcional y participé en entrevistas, definición de JTBD/ICP, iteraciones con usuarios y validación del producto.",
      ],
      award: "Mejor proyecto de su sección · Diseño de Productos e Innovación en TI",
    },
    dogspa: {
      tagline: "Gestión de sedes y servicios",
      highlights: [
        "Implementé módulos fullstack de sedes, ciudades y catálogo de servicios, con integración frontend-backend.",
      ],
      award: "Mejor proyecto final de su sección · Desarrollo de Software en Equipo",
    },
    algorithms: {
      name: "Proyectos de Diseño y Análisis de Algoritmos",
      tagline: "Optimización y heurísticas",
      highlights: [
        "Minimización de costos sobre grafos, con algoritmos de recorrido y manipulación.",
        "Solución aproximada, basada en heurística, al problema NP-completo de ordenamiento de panqueques.",
      ],
      award: "Dos segundos puestos de su sección",
    },
  },
} satisfies ProjectsText;
