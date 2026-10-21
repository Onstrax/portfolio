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
  caseLinkLabel: "Leer el caso completo",
  projects: {
    thesis: {
      name: "Tesis: autenticación poscuántica de conocimiento cero",
      tagline: "Investigación en desarrollo",
      highlights: [
        {
          text: "Codiseño de un protocolo de autenticación Zero-Knowledge resistente a ataques cuánticos, basado en Learning with Errors (LWE); lidero el componente matemático LWE.",
          emphasis: "resistente a ataques cuánticos",
        },
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
        {
          text: "Desarrollo asistido por IA con especificaciones (SDD) y TDD; más de 100 pruebas automatizadas exitosas y ~94 % de cobertura reportada.",
          emphasis: "~94 % de cobertura reportada",
        },
      ],
    },
    "dental-site": {
      name: "Web para un consultorio odontológico",
      tagline: "Sitio en producción para un cliente real",
      highlights: [
        "Diseñé, desarrollé y publiqué el sitio completo: tratamientos, profesionales, preguntas frecuentes, mapa de sedes y páginas legales.",
        {
          text: "Llamada a la acción por WhatsApp y formulario de contacto; ha contribuido a atraer ~2-3 nuevos clientes al mes.",
          emphasis: "~2-3 nuevos clientes al mes",
        },
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
    "respiratory-etl": {
      name: "ETL de enfermedades respiratorias agudas en Bogotá",
      tagline: "Ingeniería de datos",
      highlights: [
        "Construí todo el proceso ETL: extracción, transformación y carga incremental a un data warehouse en SQLite, servido con una API en FastAPI. El resto del equipo entrenó un modelo de regresión y creó los tableros de Power BI.",
      ],
    },
    "sdg-text-classifier": {
      name: "Clasificador de textos según los Objetivos de Desarrollo Sostenible",
      tagline: "Machine Learning",
      highlights: [
        "Entrené y evalué un modelo SVM que clasifica textos en 4 Objetivos de Desarrollo Sostenible, y exploré y procesé los datos.",
        "Desarrollé la interfaz web en Next.js y su conexión con la API del modelo, implementé la aumentación de datos y comparé sus resultados, y coordiné las entregas del equipo.",
      ],
    },
  },
  cases: {
    thesis: {
      title: "Tesis de autenticación poscuántica",
      description:
        "Caso de estudio de mi tesis: un protocolo de autenticación de conocimiento cero, resistente a la computación cuántica y basado en Module-LWE.",
      problem: [
        "Se estima que, entre 2028 y 2035, la computación cuántica podrá romper la criptografía que hoy protege la autenticación. A la vez, para demostrar quién es, el usuario suele entregar más información de la que debería, y pierde el control de sus datos.",
        "Si no se resuelve, el riesgo es doble: la suplantación de identidad y la filtración de información personal sensible.",
      ],
      team: "Tesis en equipo de 2. Los dos aportamos a todo el trabajo, pero cada uno lidera una parte.",
      contributions: [
        "Lidero el componente matemático de Learning with Errors (LWE), incluida la elección de su variante y de sus parámetros.",
        "Codiseño el protocolo de autenticación y su prototipo.",
      ],
      teamContributions: "Mi compañero lidera la parte de pruebas de conocimiento cero (ZKP).",
      decisions: [
        {
          options:
            "Un protocolo interactivo o uno no interactivo; y, para LWE, la variante binaria, Ring-LWE, Module-LWE o la de redondeo (Learning with Rounding).",
          choice: "Un protocolo no interactivo basado en Module-LWE.",
          reason:
            "Los dos se parametrizan con facilidad hasta alcanzar un objetivo de seguridad concreto, son ligeros y funcionan en dispositivos de gama baja.",
        },
      ],
      changes: [
        "La primera versión del prototipo podía filtrar el secreto del usuario. La rediseñamos: en lugar de enviar el compromiso por la red, ahora solo se envían sus bits altos, que el verificador reconstruye.",
      ],
      outcome: [
        {
          text: "El tráfico de red pasó de megabytes a pocos kilobytes.",
          emphasis: "de megabytes a pocos kilobytes",
        },
        {
          text: "El tiempo de ejecución pasó de varios segundos a menos de medio segundo.",
          emphasis: "menos de medio segundo",
        },
        "El marco teórico está completo; los benchmarks de tiempo, memoria, tráfico de red y seguridad en bits siguen en desarrollo.",
      ],
      learned: [
        "Sumaría al equipo a alguien de ingeniería electrónica que pudiera llevar la NTT (transformada teórica de números) de la teoría a una implementación real.",
      ],
    },
    andespace: {
      title: "AndeSpace",
      description:
        "Caso de estudio de AndeSpace: una app para reservar espacios de la universidad y coordinarse con amigos según sus horarios.",
      problem: [
        "En la universidad había espacios desaprovechados, y no existía una forma sencilla de reservar espacios para grupos ni de organizarse con amigos según sus horarios.",
        "Sin ella se desperdician espacios y tiempo, y los grupos no llegan a coordinarse porque encontrar un horario común cuesta demasiado.",
      ],
      team: "Equipo de 6: tres personas en la app de Kotlin y tres en la de Flutter, todas también en el backend y la base de datos compartidos. Yo trabajé en la de Flutter.",
      contributions: [
        "Diseñé y construí la pantalla de inicio, la búsqueda, la reserva de salones y la red de amigos con estados de visibilidad (ocupado, en casa, libre…).",
        "Cada una de punta a punta: lluvia de ideas, diseño, documentación, base de datos, backend y Flutter.",
      ],
      teamContributions:
        "Mis compañeros hicieron, también de punta a punta, los ajustes, los favoritos, el historial, el horario personal, el cruce de horarios con amigos, las notificaciones y el detalle de cada salón.",
      decisions: [
        {
          options:
            "Una pantalla de inicio con muchas funciones o solo con lo esencial, y un diseño cargado o sobrio.",
          choice: "Un inicio sencillo y un diseño sobrio.",
          reason:
            "Reducir la fricción, que la app se entendiera sin explicaciones y no abrumar a quien la usa.",
        },
        {
          options: "Mostrar siempre a los amigos o no.",
          choice: "Que cada persona decida su visibilidad frente a sus amigos.",
          reason: "La privacidad la controla el usuario, no la app.",
        },
      ],
      changes: [
        "La parte social no estaba en el plan inicial. Con el feedback vimos que era imprescindible, porque el círculo social es inseparable de cómo se aprovechan los espacios, y pivotamos para incorporarla.",
      ],
      outcome: [
        {
          text: "Mejor proyecto de su sección en Construcción de Aplicaciones Móviles.",
          emphasis: "Mejor proyecto de su sección",
        },
        "Aprendí a trabajar con un backend unificado e independiente de dos frontends distintos, algo que no había hecho antes.",
      ],
      learned: [
        "Incorporaría mucho antes la parte de amigos y horarios, porque era la que más valor aportaba.",
      ],
    },
    "dental-site": {
      title: "Web de un consultorio odontológico",
      description:
        "Caso de estudio de la web de un consultorio odontológico: del problema a un sitio en producción que atrae pacientes nuevos cada mes.",
      problem: [
        "El consultorio no tenía presencia en línea.",
        "Eso significaba perder a los pacientes que buscan por canales digitales, un mercado nuevo para el consultorio.",
      ],
      team: "Trabajo individual, para un cliente real.",
      contributions: [
        "Identifiqué el problema y conversé con la doctora para entender lo que necesitaba.",
        "Especifiqué los requisitos, diseñé, implementé y desplegué el sitio, y lo sigo manteniendo.",
      ],
      decisions: [
        {
          options: "Escribir con el vocabulario de la doctora o con uno pensado para el paciente.",
          choice: "Reescribir los textos con un lenguaje cercano al paciente.",
          reason:
            "El vocabulario técnico de la doctora hacía difícil conectar con quien llega como paciente. La decisión ha dado buenos resultados.",
        },
      ],
      changes: [
        "Al principio no había previsto la versión móvil. Luego fue evidente que la mayoría de pacientes llegaría desde el teléfono y no desde el escritorio, y la incorporé.",
      ],
      outcome: [
        {
          text: "Ha contribuido a atraer unos 2–3 pacientes nuevos al mes.",
          emphasis: "unos 2–3 pacientes nuevos al mes",
        },
        "Sigue en producción, con mantenimiento continuo.",
      ],
      learned: [
        "Iteraría más rápido sobre los textos finales, contrastándolos antes con la doctora para su aprobación.",
      ],
    },
  },
} satisfies ProjectsText;
