import { SITE } from "@/shared/config/site";

import type { EcosystemText } from "../types";

export const ecosystemEs = {
  meta: {
    title: "Ecosistema personal",
    hardwareName: "Ventilador ARGB",
    description: `El ecosistema personal de ${SITE.authorName}: su entorno Linux, proyectos propios, homelab y aficiones fuera de la pantalla.`,
  },
  intro: "Me gusta entender mis herramientas y ajustarlas hasta que dejan de estorbar.",
  setupTitle: "Mi entorno",
  setup: {
    system: {
      name: "Linux a diario",
      description:
        "Trabajo sobre una distribución basada en Arch con un gestor de ventanas en mosaico; mi configuración (ricing) vive en un repositorio privado.",
    },
    shell: {
      name: "Interfaz de escritorio",
      description:
        "Mi escritorio parte del proyecto abierto caelestia, que adapto a mi forma de trabajar.",
      linkLabel: "Proyecto caelestia",
    },
  },
  builtTitle: "Desarrollado por mí",
  built: {
    "bongo-cat": {
      name: "Bongo Cat View",
      description:
        "Plugin para Obsidian: un gato que tamborilea mientras se escribe, con estados de reposo y sueño. Funciona sin conexión.",
      linkLabel: "Repositorio",
    },
    "steam-library-hub": {
      name: "Steam Local Library Hub",
      description:
        "Aplicación web local para explorar, filtrar y ordenar mi biblioteca de Steam, con datos guardados en la propia máquina.",
      linkLabel: "Disponible en mi perfil de GitHub",
    },
  },
  configuredTitle: "Configurado e integrado",
  configured: {
    homelab: {
      name: "Homelab en contenedores",
      description:
        "Síntesis de voz local y control de las luces de mi habitación, que manejo con atajos de teclado globales.",
    },
    sync: {
      name: "Sincronización entre dispositivos",
      description:
        "Mi bóveda de notas se sincroniza directamente entre el PC y el móvil, de igual a igual.",
    },
  },
  offlineTitle: "Fuera de la pantalla",
  interests: ["Calistenia", "Parkour", "Gaming"],
  leadershipTraining: "Formación en liderazgo ignaciano durante el colegio.",
} satisfies EcosystemText;
