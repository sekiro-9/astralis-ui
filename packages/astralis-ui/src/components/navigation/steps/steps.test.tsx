import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Steps } from "./index";
import type { StepsProps } from "./steps.types";

function Flow({ errorAt, ...props }: Partial<StepsProps> & { errorAt?: number }) {
  return (
    <Steps defaultStep={1} {...props}>
      <Steps.List>
        {["Account", "Profile", "Review"].map((title, i) => (
          <Steps.Item key={title} error={i === errorAt}>
            <Steps.Indicator />
            <Steps.Title>{title}</Steps.Title>
          </Steps.Item>
        ))}
      </Steps.List>
    </Steps>
  );
}

describe("Steps aria-current", () => {
  it("marks the active step exactly once", () => {
    const { container } = render(<Flow />);
    const current = container.querySelectorAll('[aria-current="step"]');

    expect(current).toHaveLength(1);
    expect(current[0].tagName).toBe("LI");
    expect(current[0].getAttribute("data-index")).toBe("1");
  });

  it("moves it to the step's button when steps are clickable", () => {
    const { container } = render(<Flow clickable />);
    const current = container.querySelectorAll('[aria-current="step"]');

    expect(current).toHaveLength(1);
    expect(current[0].tagName).toBe("BUTTON");
  });
});

describe("Steps status is not colour-only", () => {
  it("announces a completed step", () => {
    const { container } = render(<Flow />);
    const done = container.querySelector('[data-index="0"]')!;

    expect(done.textContent).toContain("Completed");
  });

  it("announces an error step", () => {
    const { container } = render(<Flow errorAt={2} />);
    const failed = container.querySelector('[data-index="2"]')!;

    expect(failed.textContent).toContain("Error");
  });

  it("carries the status into a clickable step's name", () => {
    render(<Flow clickable />);
    expect(screen.getByRole("button", { name: "Go to step 1, Completed" })).toBeTruthy();
  });

  it("takes translated labels", () => {
    const { container } = render(<Flow statusLabels={{ completed: "Terminé" }} />);
    expect(container.querySelector('[data-index="0"]')!.textContent).toContain("Terminé");
  });

  it("says nothing extra for upcoming and active steps", () => {
    const { container } = render(<Flow />);
    for (const index of ["1", "2"]) {
      expect(container.querySelector(`[data-index="${index}"] .astralis\\:sr-only`)).toBeNull();
    }
  });
});

describe("Steps colour", () => {
  it("scopes the accent channel to colorScheme", () => {
    const { container } = render(<Flow colorScheme="green" />);
    expect(container.firstElementChild!.classList.contains("astralis-accent-green")).toBe(true);
  });

  it("paints progress with accent tokens, never a hard-coded brand hue", () => {
    const { container } = render(<Flow />);
    const classes = [...container.querySelectorAll("[class]")].flatMap((el) => [...el.classList]);

    expect(classes.some((c) => /accent-solid$/.test(c))).toBe(true);
    expect(classes.filter((c) => /brand-/.test(c))).toEqual([]);
  });
});

describe("Steps.Item finds its indicator by identity", () => {
  it("does not mistake a look-alike displayName for the indicator", () => {
    function Impostor() {
      return <span data-impostor="" />;
    }
    Impostor.displayName = "Steps.Indicator";

    const { container } = render(
      <Steps clickable>
        <Steps.List>
          <Steps.Item>
            <Impostor />
            <Steps.Title>One</Steps.Title>
          </Steps.Item>
        </Steps.List>
      </Steps>,
    );

    expect(container.querySelector("button [data-impostor]")).toBeNull();
    expect(container.querySelector("[data-impostor]")).not.toBeNull();
  });

  it("places the real indicator in the indicator slot", () => {
    const { container } = render(<Flow clickable />);
    expect(container.querySelectorAll("button > [data-status]")).toHaveLength(3);
  });
});
