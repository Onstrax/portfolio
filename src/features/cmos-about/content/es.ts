import type { AboutText } from "../types";

export const aboutEs = {
  meta: {
    title: "Acerca de este sitio",
    hardwareName: "Pila CMOS",
    description:
      "Cómo está hecho este portfolio: desarrollo guiado por especificaciones, stack, accesibilidad y enlace al código fuente.",
  },
  intro:
    "Este portfolio es también un proyecto: una placa madre donde cada componente abre una parte de mi perfil.",
  methodTitle: "Cómo se construyó",
  method: [
    "Con desarrollo guiado por especificaciones (SDD): cada funcionalidad se escribió primero como una especificación con criterios de aceptación verificables.",
    "Cada criterio automático tiene una prueba que lo cita, y una comprobación de trazabilidad impide dar por terminada una funcionalidad sin ellas.",
    "Desarrollado con asistencia de IA, con las especificaciones como fuente de verdad.",
  ],
  stackTitle: "Stack",
  qualityTitle: "Lo que no se ve",
  quality: [
    "Sitio estático: sin servidor de aplicación, sin base de datos y sin cookies.",
    "Navegable por completo con teclado y con lector de pantalla, conforme a WCAG 2.2 AA.",
    "Sin JavaScript, o en un teléfono, el mismo contenido se muestra como una página sencilla.",
  ],
  imageTitle: "La imagen",
  image:
    "La fotografía de la placa y su versión en boceto se generaron con IA y se escalaron a alta resolución; las zonas interactivas y las auras se dibujan en código sobre ellas.",
  repositoryLabel: "Código y especificaciones en GitHub",
} satisfies AboutText;
