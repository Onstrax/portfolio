import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SCENE_ASSETS } from "@/shared/assets/manifest.generated";

import { CALIBRATION_QUERY, CalibrationOverlay } from "./calibration-overlay";
import { ScenePoster } from "./scene-poster";
import { Vignette } from "./vignette";

describe("ScenePoster", () => {
  it("draws one block per variant with its average color and its blurred placeholder", () => {
    render(<ScenePoster />);
    const poster = screen.getByTestId("scene-poster");
    expect(poster).toHaveAttribute("aria-hidden", "true");

    const blocks = [...poster.querySelectorAll<HTMLElement>("[data-variant]")];
    expect(blocks.map((block) => block.dataset["variant"])).toEqual(["photo", "sketch"]);
    for (const block of blocks) {
      const variant = block.dataset["variant"] === "sketch" ? "sketch" : "photo";
      const { color, dataUrl } = SCENE_ASSETS[variant].placeholder;
      expect(block.style.getPropertyValue("--poster-color")).toBe(color);
      expect(block.style.getPropertyValue("--poster-image")).toBe(`url("${dataUrl}")`);
    }
  });

  it("requests no file: it has no image element and its only URLs are embedded data", () => {
    const { container } = render(<ScenePoster />);
    expect(container.querySelector("img, picture, source")).toBeNull();
    const urls = container.innerHTML.match(/url\([^)]*\)/g) ?? [];
    expect(urls).toHaveLength(2);
    for (const url of urls) expect(url.startsWith("url(&quot;data:image/webp;base64,")).toBe(true);
  });
});

describe("Vignette", () => {
  it("covers the four edges of the stage with a band of 64 units", () => {
    const { container } = render(<Vignette />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("viewBox", "0 0 1600 900");

    const bands = Object.fromEntries(
      [...container.querySelectorAll("rect")].map((band) => [
        band.getAttribute("data-edge") ?? "",
        ["x", "y", "width", "height"].map((name) => Number(band.getAttribute(name))),
      ]),
    );
    expect(bands).toEqual({
      left: [0, 0, 64, 900],
      top: [0, 0, 1600, 64],
      right: [1536, 0, 64, 900],
      bottom: [0, 836, 1600, 64],
    });
  });

  it("fades each band from the border of the stage towards its inside", () => {
    const { container } = render(<Vignette />);
    const direction = (edge: string) => {
      const gradient = container.querySelector(`#scene-vignette-${edge}`);
      return ["x1", "y1", "x2", "y2"].map((name) => gradient?.getAttribute(name));
    };
    expect(direction("left")).toEqual(["0", "0", "1", "0"]);
    expect(direction("right")).toEqual(["1", "0", "0", "0"]);
    expect(direction("top")).toEqual(["0", "0", "0", "1"]);
    expect(direction("bottom")).toEqual(["0", "1", "0", "0"]);
    for (const gradient of container.querySelectorAll("linearGradient")) {
      const [opaque, transparent] = gradient.querySelectorAll("stop");
      expect(opaque).not.toHaveAttribute("stop-opacity");
      expect(transparent).toHaveAttribute("stop-opacity", "0");
    }
  });
});

describe("CalibrationOverlay", () => {
  it("is opened by the query that AST names", () => {
    expect(CALIBRATION_QUERY).toBe(["debug", "hotspots"].join("="));
  });

  it("draws every hotspot with its identifier, its silhouette and the box of its hit area", () => {
    render(<CalibrationOverlay />);
    const overlay = screen.getByTestId("calibration-overlay");
    expect(overlay).toHaveAttribute("aria-hidden", "true");

    const groups = [...overlay.querySelectorAll("[data-hotspot]")];
    expect(groups.map((group) => group.getAttribute("data-hotspot"))).toEqual([
      "cpu",
      "psu",
      "ssd",
      "ram",
      "io",
      "fan",
      "cmos",
      "settings",
      "post-display",
    ]);
    for (const group of groups) {
      expect(group.querySelector("polygon")).not.toBeNull();
      expect(group.querySelector("rect")).not.toBeNull();
      expect(group.querySelector("text")).toHaveTextContent(
        group.getAttribute("data-hotspot") ?? "",
      );
    }

    const coin = overlay.querySelector('[data-hotspot="cmos"] rect');
    expect(coin).toHaveAttribute("width", "69");
    expect(coin).toHaveAttribute("height", "69");
  });

  it("draws a grid every 100 units with its coordinates", () => {
    render(<CalibrationOverlay />);
    const overlay = screen.getByTestId("calibration-overlay");
    expect(overlay.querySelectorAll("line")).toHaveLength(17 + 10);
    const coordinates = [...overlay.querySelectorAll("g > text")].map((text) => text.textContent);
    expect(coordinates).toContain("1600");
    expect(coordinates).toContain("900");
  });

  it("shows the position of the pointer in scene units", () => {
    render(<CalibrationOverlay />);
    const overlay = screen.getByTestId("calibration-overlay");
    overlay.getBoundingClientRect = () =>
      DOMRect.fromRect({ x: 100, y: 50, width: 800, height: 450 });
    expect(screen.getByRole("status")).toHaveTextContent("–");

    fireEvent.pointerMove(window, { clientX: 500, clientY: 275 });
    expect(screen.getByRole("status")).toHaveTextContent("800, 450");
  });
});
