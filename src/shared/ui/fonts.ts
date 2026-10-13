import { Inter, JetBrains_Mono } from "next/font/google";

// The two families of the visual system, downloaded at build time and served by the site itself
// (VIS-R05, SYS-R33).
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

/** Class names for `<html>` that expose both families as the variables read by tokens.css. */
export const FONT_VARIABLES = `${inter.variable} ${jetBrainsMono.variable}`;
