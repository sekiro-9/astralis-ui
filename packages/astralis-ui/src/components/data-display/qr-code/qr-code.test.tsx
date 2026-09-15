import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QrCode } from "./index";
import { encodeQr, qrPath } from "./qr-encoder";

const pathOf = (container: HTMLElement) =>
  container.querySelector('svg[role="img"] path')?.getAttribute("d");

describe("QrCode", () => {
  it("renders the code on the first render, with no async step", () => {
    const { container } = render(<QrCode value="hello" />);
    expect(pathOf(container)).toBe(qrPath(encodeQr("hello", "M"), 1));
  });

  it("always shows the current value when it changes quickly", () => {
    const { container, rerender } = render(<QrCode value="first" />);
    rerender(<QrCode value="second" />);
    rerender(<QrCode value="third" errorLevel="H" />);
    expect(pathOf(container)).toBe(qrPath(encodeQr("third", "H"), 1));
  });

  it("applies colour and background without injecting markup", () => {
    const { container } = render(<QrCode value="x" color='red"/><script>' bgColor="#eee" />);
    const svg = container.querySelector('svg[role="img"]')!;
    expect(svg.querySelector("path")!.getAttribute("fill")).toBe('red"/><script>');
    expect(svg.querySelector("rect")!.getAttribute("fill")).toBe("#eee");
    expect(container.querySelector("script")).toBeNull();
  });

  it("leaves the background transparent by default", () => {
    const { container } = render(<QrCode value="x" />);
    expect(container.querySelector('svg[role="img"] rect')).toBeNull();
  });

  it("injects no <style> element into the document", () => {
    const before = document.querySelectorAll("style").length;
    render(<QrCode value="x" status="loading" />);
    expect(document.querySelectorAll("style").length).toBe(before);
  });

  it("shows the error state when the value exceeds capacity", () => {
    render(<QrCode value={"a".repeat(3000)} errorLevel="H" />);
    expect(screen.getByText("Failed to generate QR code")).toBeTruthy();
  });

  it("downloads the rendered SVG", () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:qr");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(<QrCode value="x" downloadable downloadFileName="ticket" />);
    fireEvent.click(screen.getByRole("button", { name: /download svg/i }));

    expect(click).toHaveBeenCalledOnce();
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe("image/svg+xml");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:qr");
    click.mockRestore();
  });
});
