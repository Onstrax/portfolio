import { SITE } from "@/shared/config/site";

import type { UiDictionary } from "./en";

/** Interface dictionary in Spanish. A missing, extra or mistyped key does not compile. */
export const es: UiDictionary = {
  common: {
    skipToContentLabel: "Saltar al contenido",
    opensInNewTabHint: "se abre en una pestaña nueva",
    privateRepositoryLabel: "Repositorio privado",
    present: "actualidad",
    individualWorkLabel: "Trabajo individual",
    teamOfLabel: ({ count }) => `Equipo de ${String(count)}`,
    languageLabel: "Idioma",
    visitedSectionsLabel: ({ count, total }) =>
      `${String(count)} de ${String(total)} secciones visitadas`,
    downloadCvLabel: "Descargar CV (PDF)",
    copyLabel: "Copiar",
    copiedAnnouncement: "Copiado",
  },
  site: {
    homeTitle: `${SITE.authorName} · Portfolio interactivo`,
    sectionTitle: ({ title }) => `${title} · ${SITE.authorName}`,
    cvTitle: `Currículum · ${SITE.authorName}`,
    description: `Portfolio de ${SITE.authorName}, estudiante de Ingeniería de Sistemas en la Universidad de los Andes: software, cloud/DevOps y seguridad aplicada.`,
    cvDescription: `Perfil, experiencia, proyectos, stack y contacto de ${SITE.authorName} en una sola página, lista para leer o imprimir.`,
    ogImageAlt: "Placa madre sobre un banco de trabajo, vista desde arriba",
  },
  languageGate: {
    title: `${SITE.authorName} — Portfolio`,
    continueLabel: "Continuar en español",
  },
  notFound: {
    title: "Página no encontrada",
    description: "La dirección que abriste no existe en este sitio.",
    homeLabel: "Ir al portfolio",
  },
  boot: {
    skipLabel: "Saltar",
    skipHint: "Cualquier tecla salta el arranque",
    loadingAnnouncement: "Iniciando el portfolio",
  },
  scene: {
    pageTitle: `${SITE.authorName}: portfolio interactivo`,
    hotspotName: ({ hardwareName, title }) => `${hardwareName}: ${title}`,
    settingsHardwareName: "Panel frontal",
    settingsTitle: "Ajustes",
    postDisplayName: "Display de diagnóstico",
    hintLabel: "Cada componente iluminado abre una sección.",
  },
  panel: {
    closeAriaLabel: "Cerrar",
    previousAriaLabel: ({ title }) => `Sección anterior: ${title}`,
    nextAriaLabel: ({ title }) => `Sección siguiente: ${title}`,
    positionLabel: ({ position, total }) => `${String(position)} / ${String(total)}`,
    positionAriaLabel: ({ position, total }) => `Sección ${String(position)} de ${String(total)}`,
  },
  settings: {
    barAriaLabel: "Controles del sitio",
    simpleViewLabel: "Vista simple",
    menuTitle: "Ajustes",
    closeAriaLabel: "Cerrar ajustes",
    soundLabel: "Sonido",
    soundDescription: "Efectos breves al abrir y cerrar secciones.",
    resetLabel: "Reiniciar sesión",
    resetDescription: "Repite el arranque y borra el progreso.",
    sceneImageLabel: "Imagen de la escena",
    scenePhotoLabel: "Fotografía",
    sceneSketchLabel: "Boceto",
  },
  simpleView: {
    navAriaLabel: "Secciones",
    desktopHint:
      "La versión interactiva de este portfolio está disponible en pantallas de escritorio.",
    interactiveLinkLabel: "Ver la versión interactiva",
    backToTopLabel: "Volver arriba",
  },
};
