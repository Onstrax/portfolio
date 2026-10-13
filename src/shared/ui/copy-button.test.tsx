import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "./copy-button";

const PROPS = {
  text: "juanalvarezgcl@gmail.com",
  label: "Copiar",
  accessibleName: "Copiar la dirección de correo",
  copiedLabel: "Copiado",
};

function setup() {
  const user = userEvent.setup();
  const writeText = vi.spyOn(navigator.clipboard, "writeText");
  render(<CopyButton {...PROPS} />);
  return { user, writeText, button: screen.getByRole("button", { name: PROPS.accessibleName }) };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CopyButton", () => {
  it("IO-AC05: is rendered hidden on the server and loses the attribute once mounted", () => {
    expect(renderToString(<CopyButton {...PROPS} />)).toContain('hidden=""');

    const { button } = setup();
    expect(button).not.toHaveAttribute("hidden");
    expect(button).toHaveTextContent("Copiar");
  });

  it("IO-AC05: copies the text, then shows and announces the confirmation for two seconds", async () => {
    const { user, writeText, button } = setup();
    // The copy is held back so that the clock can be faked before the confirmation starts.
    let finishCopy: () => void = () => undefined;
    writeText.mockReturnValue(
      new Promise<void>((resolve) => {
        finishCopy = resolve;
      }),
    );

    await user.click(button);
    expect(writeText).toHaveBeenCalledWith("juanalvarezgcl@gmail.com");
    expect(button).toHaveTextContent("Copiar");

    vi.useFakeTimers();
    await act(async () => {
      finishCopy();
      await Promise.resolve();
    });
    expect(button).toHaveTextContent("Copiado");
    expect(screen.getByRole("status")).toHaveTextContent("Copiado");

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(button).toHaveTextContent("Copiado");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(button).toHaveTextContent("Copiar");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("IO-AC05: does not change and does not throw when the clipboard rejects the copy", async () => {
    const { user, writeText, button } = setup();
    writeText.mockRejectedValue(new Error("NotAllowedError"));

    await user.click(button);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(button).toHaveTextContent("Copiar");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("IO-AC05: stays hidden when the browser has no clipboard API", () => {
    vi.spyOn(navigator, "clipboard", "get").mockImplementation(() => {
      throw new Error("no clipboard");
    });
    render(<CopyButton {...PROPS} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { hidden: true })).toHaveAttribute("hidden");
  });
});
