import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { CopyButton } from "./index";

describe("CopyButton", () => {
  it("writes the value to the clipboard and flips to the copied state", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const { getByRole } = render(<CopyButton value="npm i astralis-ui" />);
    const button = getByRole("button");
    expect(button.textContent).toContain("Copy");

    fireEvent.click(button);
    expect(writeText).toHaveBeenCalledWith("npm i astralis-ui");
    await waitFor(() => expect(button.textContent).toContain("Copied"));
    expect(button.getAttribute("data-copied")).toBe("true");
  });

  it("passes Button props through", () => {
    const { getByRole } = render(<CopyButton value="x" variant="outline" size="sm">Copy link</CopyButton>);
    expect(getByRole("button").textContent).toContain("Copy link");
  });
});
