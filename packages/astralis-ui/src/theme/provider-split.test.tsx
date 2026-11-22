import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { AstralisProvider } from "./provider";
import { useTheme } from "./theme-context";
import { generateThemeTokens } from "./theme-math";
import type { ThemeSeed } from "./token-spec";

/*
 * AstralisProvider computes the `tokens` seed's variables on the server and
 * hands them to its client half as plain style objects. These pin that the
 * markup is exactly what the old all-client provider rendered.
 */

const SEED: ThemeSeed = {
  brandColor: "#8b5cf6",
  grayColor: "#64748b",
  errorColor: "#dc2626",
  warningColor: "#d97706",
  successColor: "#16a34a",
  infoColor: "#0284c7",
  fontHeading: "Georgia, serif",
  fontBody: "Inter, sans-serif",
  fontMono: "Menlo, monospace",
  radiusScale: 1.5,
  spacingScale: 1.25,
  fontSizeScale: 1.1,
  motionScale: 0.5,
};
const OTHER: ThemeSeed = { brandColor: "#22c55e" };

/** The wrapper div exactly as the old provider rendered it: inline vars for one mode. */
const oldWrapper = (seed: ThemeSeed | undefined, mode: "light" | "dark") =>
  renderToString(
    createElement(
      "div",
      {
        className: "astralis",
        style: { minHeight: "100vh", width: "100%", ...generateThemeTokens(seed, mode) },
      },
      "x",
    ),
  );

const darkMedia = (matches: boolean) =>
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({ matches, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList,
  );

/** The container's custom properties, as a plain record. */
const varsOf = (element: Element) => {
  const style = (element as HTMLElement).style;
  const out: Record<string, string> = {};
  for (let i = 0; i < style.length; i++) {
    const name = style[i];
    if (name.startsWith("--")) out[name] = style.getPropertyValue(name);
  }
  return out;
};
const expectedVars = (seed: ThemeSeed, mode: "light" | "dark") => {
  const probe = document.createElement("div");
  for (const [name, value] of Object.entries(generateThemeTokens(seed, mode))) probe.style.setProperty(name, value);
  return varsOf(probe);
};

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("astralis-dark");
  darkMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AstralisProvider on the server", () => {
  it("renders the same CSS variables for a tokens seed as the old computation", () => {
    const html = renderToString(<AstralisProvider tokens={SEED}>x</AstralisProvider>);
    expect(html).toBe(oldWrapper(SEED, "light"));
    expect(html).toContain("--astralis-color-brand-500:#8b5cf6");
  });

  it("renders no seed variables without tokens", () => {
    expect(renderToString(<AstralisProvider>x</AstralisProvider>)).toBe(oldWrapper(undefined, "light"));
  });

  it("renders the dark variables when the default theme is dark", () => {
    const html = renderToString(
      <AstralisProvider tokens={SEED} defaultTheme="dark">
        x
      </AstralisProvider>,
    );
    expect(html).toBe(oldWrapper(SEED, "dark"));
    expect(html).not.toBe(oldWrapper(SEED, "light"));
  });

  it("keeps each nested provider's own seed on its own wrapper", () => {
    const html = renderToString(
      <AstralisProvider tokens={SEED}>
        <AstralisProvider tokens={OTHER}>x</AstralisProvider>
      </AstralisProvider>,
    );
    const outer = oldWrapper(SEED, "light").replace(/x<\/div>$/, "");
    const inner = oldWrapper(OTHER, "light");
    expect(html).toBe(`${outer}${inner}</div>`);
  });
});

describe("AstralisProvider in the browser", () => {
  it("hydrates the server markup without a mismatch", async () => {
    const tree = (
      <AstralisProvider tokens={SEED} defaultTheme="dark">
        <span>x</span>
      </AstralisProvider>
    );
    const host = document.createElement("div");
    const serverHtml = renderToString(tree);
    host.innerHTML = serverHtml;
    document.body.appendChild(host);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const recoverable = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(host, tree, { onRecoverableError: recoverable });
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    // Hydration kept the server's style attribute (the dark seed variables).
    expect(serverHtml).toBe(oldWrapper(SEED, "dark").replace("x</div>", "<span>x</span></div>"));
    expect(host.innerHTML).toBe(serverHtml);
    act(() => root?.unmount());
    host.remove();
  });

  it("switches the seed's variables to dark with the system preference", () => {
    darkMedia(true);
    const { container } = render(<AstralisProvider tokens={SEED}>x</AstralisProvider>);
    expect(document.documentElement.classList.contains("astralis-dark")).toBe(true);
    expect(varsOf(container.firstElementChild!)).toEqual(expectedVars(SEED, "dark"));
  });

  it("switches the variables when setTheme changes the mode", () => {
    function Toggle() {
      const { setTheme } = useTheme();
      return (
        <button type="button" onClick={() => setTheme("dark")}>
          dark
        </button>
      );
    }
    const { container, getByRole } = render(
      <AstralisProvider tokens={SEED} defaultTheme="light">
        <Toggle />
      </AstralisProvider>,
    );
    expect(varsOf(container.firstElementChild!)).toEqual(expectedVars(SEED, "light"));
    act(() => getByRole("button").click());
    expect(varsOf(container.firstElementChild!)).toEqual(expectedVars(SEED, "dark"));
  });

  it("applies a new theme with setTokens, loading the maths on demand", async () => {
    function Picker() {
      const { tokens, setTokens } = useTheme();
      return (
        <button type="button" data-brand={tokens?.brandColor} onClick={() => setTokens(SEED)}>
          pick
        </button>
      );
    }
    const { container, getByRole } = render(
      <AstralisProvider tokens={OTHER}>
        <Picker />
      </AstralisProvider>,
    );
    expect(varsOf(container.firstElementChild!)).toEqual(expectedVars(OTHER, "light"));
    act(() => getByRole("button").click());
    expect(getByRole("button").dataset.brand).toBe(SEED.brandColor);
    await waitFor(() => expect(varsOf(container.firstElementChild!)).toEqual(expectedVars(SEED, "light")));
  });

  it("re-themes only the nested provider setTokens was called under", async () => {
    function Picker() {
      const { setTokens } = useTheme();
      return (
        <button type="button" onClick={() => setTokens(SEED)}>
          pick
        </button>
      );
    }
    const { container, getByRole } = render(
      <AstralisProvider tokens={OTHER}>
        <AstralisProvider>
          <Picker />
        </AstralisProvider>
      </AstralisProvider>,
    );
    const outer = container.firstElementChild!;
    const inner = outer.firstElementChild!;
    act(() => getByRole("button").click());
    await waitFor(() => expect(varsOf(inner)).toEqual(expectedVars(SEED, "light")));
    expect(varsOf(outer)).toEqual(expectedVars(OTHER, "light"));
  });
});
