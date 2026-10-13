import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BootScreen } from "./boot-screen";

function lines(): readonly HTMLElement[] {
  return [...screen.getByTestId("boot-screen").querySelectorAll<HTMLElement>('[data-part="line"]')];
}

describe("BootScreen", () => {
  it("BOOT-AC04: renders the whole log as static markup, marked as English and decorative", () => {
    render(<BootScreen locale="es" />);
    const log = screen.getByTestId("boot-screen").querySelector('[data-part="log"]');

    expect(log).toHaveAttribute("lang", "en");
    expect(log).toHaveAttribute("aria-hidden", "true");
    expect(lines().length).toBeGreaterThanOrEqual(11);
    expect(lines().every((line) => log?.contains(line) === true)).toBe(true);
    expect(lines()[0]).toHaveTextContent(
      "[ 0.000000] Booting portfolio kernel 1.0 (juan-esteban-alvarez-garcia)",
    );
    expect(lines().at(-1)?.textContent).toMatch(/Reached target portfolio\.target \[ {2}OK {2}\]$/);
  });

  it("writes the time mark, the message and the OK tag with the spacing of dmesg", () => {
    render(<BootScreen locale="es" />);
    expect(lines()[1]?.textContent).toBe("[    0.142512] Detecting hardware on motherboard...");
    expect(lines()[3]?.textContent).toMatch(/^\[ {4}0\.400112\] .+ \[ {2}OK {2}\]$/);
  });

  it("gives each line the delay at which it appears, the last one within 1400 ms", () => {
    render(<BootScreen locale="es" />);
    const delays = lines().map((line) => Number.parseInt(line.style.animationDelay, 10));

    expect(delays[0]).toBe(0);
    expect(delays[1]).toBe(Math.floor(1400 / (delays.length - 1)));
    expect(delays).toEqual([...delays].sort((first, second) => first - second));
    expect(delays.at(-1)).toBeLessThanOrEqual(1400);
    expect(delays.at(-1)).toBeGreaterThan(1300);
  });

  it("BOOT-AC12: shows the hint and the skip button in the language of the page, outside the log", () => {
    const { unmount } = render(<BootScreen locale="es" />);
    const bootScreen = screen.getByTestId("boot-screen");
    const skip = within(bootScreen).getByRole("button", { name: "Saltar" });

    expect(skip.closest("[lang]")).toBeNull();
    expect(within(bootScreen).getByText("Cualquier tecla salta el arranque")).toBeInTheDocument();
    expect(within(bootScreen).getAllByRole("button")).toHaveLength(1);
    unmount();

    render(<BootScreen locale="en" />);
    expect(screen.getByRole("button", { name: "Skip" })).toBeInTheDocument();
    expect(screen.getByText("Any key skips the boot sequence")).toBeInTheDocument();
  });

  it("announces that the portfolio is starting to screen readers", () => {
    render(<BootScreen locale="es" />);
    expect(screen.getByRole("status")).toHaveTextContent("Iniciando el portfolio");
  });
});
