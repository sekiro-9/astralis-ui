import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Alert } from "./alert";
import { Progress } from "./progress";
import { Skeleton } from "./skeleton";
import { Loader } from "./loader";

describe("Alert", () => {
  it("announces errors and warnings assertively, the rest politely", () => {
    const { rerender } = render(<Alert status="error">Failed</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
    rerender(<Alert status="warning">Careful</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(<Alert status="success">Saved</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("maps status to a hue, overridable by colorScheme", () => {
    const { rerender } = render(<Alert status="success">Saved</Alert>);
    expect(screen.getByRole("status")).toHaveClass("astralis-accent-success");
    rerender(
      <Alert status="success" colorScheme="purple">
        Saved
      </Alert>,
    );
    expect(screen.getByRole("status")).toHaveClass("astralis-accent-purple");
  });

  it("renders a dismiss button only with onClose, and hides the icon on icon={false}", () => {
    const onClose = vi.fn();
    const { container, rerender } = render(<Alert onClose={onClose}>Note</Alert>);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(container.querySelector("svg")).not.toBeNull();
    rerender(<Alert icon={false}>Note</Alert>);
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

describe("Progress", () => {
  it("names the progressbar itself and reports the value, clamped", () => {
    render(<Progress aria-label="Upload" value={150} max={200} />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "150");
    expect(bar).toHaveAttribute("aria-valuetext", "75%");
  });

  it("omits aria-valuenow while indeterminate", () => {
    render(<Progress aria-label="Loading" />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });

  it("names the circular shape the same way", () => {
    render(<Progress shape="circle" aria-label="Sync" value={40} showValueLabel />);
    expect(screen.getByRole("progressbar", { name: "Sync" })).toHaveTextContent("40%");
  });
});

describe("Skeleton", () => {
  it("is hidden from assistive tech while loading and yields its children once loaded", () => {
    const { container, rerender } = render(<Skeleton>Ready</Skeleton>);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
    rerender(<Skeleton loaded>Ready</Skeleton>);
    expect(container.textContent).toBe("Ready");
  });
});

describe("Loader", () => {
  it("is a status with a visually hidden label", () => {
    render(<Loader label="Saving" />);
    expect(screen.getByRole("status")).toHaveTextContent("Saving");
  });

  it("draws the blocks mark by default", () => {
    render(<Loader />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("data-variant", "blocks");
    expect(status.querySelectorAll("rect")).toHaveLength(4);
  });

  it.each([
    ["spinner", "circle", 1],
    ["dots", "circle", 3],
    ["bars", "rect", 4],
    ["pulse", "circle", 3],
  ] as const)("draws the %s variant", (variant, shape, count) => {
    render(<Loader variant={variant} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("data-variant", variant);
    expect(status.querySelectorAll(`svg ${shape}`)).toHaveLength(count);
    // The glyph is decoration; the label is what is announced.
    expect(status.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
