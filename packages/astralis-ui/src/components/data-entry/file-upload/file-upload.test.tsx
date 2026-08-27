import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { FileUpload } from "./index";

const file = (name: string, size = 100) =>
  new File([new ArrayBuffer(size)], name, { type: "text/plain" });

function Fixture(props: Parameters<typeof FileUpload>[0] extends infer P ? Partial<P> : never) {
  return (
    <FileUpload multiple {...props}>
      <FileUpload.Dropzone />
      <FileUpload.ItemGroup />
    </FileUpload>
  );
}

describe("FileUpload", () => {
  it("keeps dropped files and lists them with name, size and a remove control", () => {
    const onFilesChange = vi.fn();
    const { container, getByRole } = render(<Fixture onFilesChange={onFilesChange} />);
    const dropzone = getByRole("button");
    fireEvent.drop(dropzone, { dataTransfer: { files: [file("report.pdf", 2048)] } });
    expect(onFilesChange).toHaveBeenCalledWith([expect.objectContaining({ name: "report.pdf" })]);
    expect(container.textContent).toContain("report.pdf");
    expect(container.textContent).toContain("2.0 KB");

    fireEvent.click(container.querySelector('button[aria-label="Remove report.pdf"]')!);
    expect(container.textContent).not.toContain("report.pdf");
  });

  it("rejects oversized and over-count picks instead of silently truncating", () => {
    const onReject = vi.fn();
    const onFilesChange = vi.fn();
    const { getByRole } = render(
      <Fixture maxSize={1000} maxFiles={2} onReject={onReject} onFilesChange={onFilesChange} />,
    );
    const dropzone = getByRole("button");
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file("ok.txt", 10), file("big.bin", 5000), file("b.txt", 10), file("c.txt", 10)] },
    });
    const reasons = onReject.mock.calls[0][0].map((r: { file: File; reason: string }) => [r.file.name, r.reason]);
    expect(reasons).toContainEqual(["big.bin", "size"]);
    expect(reasons).toContainEqual(["c.txt", "count"]);
    expect(onFilesChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(["ok.txt", "b.txt"]);
  });

  it("marks the dropzone while dragging over it", () => {
    const { getByRole } = render(<Fixture />);
    const dropzone = getByRole("button");
    fireEvent.dragOver(dropzone);
    expect(dropzone.getAttribute("data-dragging")).toBe("true");
    fireEvent.dragLeave(dropzone);
    expect(dropzone.getAttribute("data-dragging")).toBeNull();
  });
});
