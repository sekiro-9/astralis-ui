import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { AstralisProvider } from "./provider";
import { useTheme } from "./theme-context";
import { STORED_THEME_STYLE_ID, getThemeScript, tokensStorageKey } from "./theme-storage";
import { storedThemeCss } from "./theme-token-storage";

const KEY = "astralis-ui-theme";
const TOKENS_KEY = tokensStorageKey(KEY);
const VIOLET = "#8b5cf6";
const run = (script: string) => new Function(script)();
const storedStyle = () => document.getElementById(STORED_THEME_STYLE_ID);

beforeEach(() => {
  localStorage.clear();
  storedStyle()?.remove();
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Picker({ to }: { to: string | undefined }) {
  const { tokens, setTokens } = useTheme();
  return (
    <button
      type="button"
      data-brand={tokens?.brandColor ?? ""}
      onClick={() => setTokens(to ? { brandColor: to } : undefined)}
    >
      pick
    </button>
  );
}

/** The brand-500 the provider's container paints with. */
const containerBrand = (container: HTMLElement) =>
  (container.firstElementChild as HTMLElement).style.getPropertyValue("--astralis-color-brand-500");

describe("getThemeScript with persistTokens", () => {
  it("puts the stored theme on :root before first paint", () => {
    localStorage.setItem(TOKENS_KEY, storedThemeCss({ brandColor: VIOLET }));
    run(getThemeScript({ persistTokens: true }));
    expect(storedStyle()?.textContent).toContain(`--astralis-color-brand-500: ${VIOLET}`);
  });

  it("adds nothing when no theme is stored, or when not asked to", () => {
    run(getThemeScript({ persistTokens: true }));
    expect(storedStyle()).toBeNull();
    localStorage.setItem(TOKENS_KEY, storedThemeCss({ brandColor: VIOLET }));
    run(getThemeScript());
    expect(storedStyle()).toBeNull();
  });

  it("survives blocked storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(() => run(getThemeScript({ persistTokens: true }))).not.toThrow();
    expect(storedStyle()).toBeNull();
  });
});

describe("AstralisProvider persistTokens", () => {
  it("applies a chosen seed, stores it, and restores it on the next visit", () => {
    const first = render(
      <AstralisProvider persistTokens>
        <Picker to={VIOLET} />
      </AstralisProvider>,
    );
    act(() => first.getByRole("button").click());
    expect(first.getByRole("button").dataset.brand).toBe(VIOLET);
    expect(containerBrand(first.container)).toBe(VIOLET);
    expect(localStorage.getItem(TOKENS_KEY)).toContain(VIOLET);
    expect(storedStyle()?.textContent).toContain(VIOLET);
    first.unmount();

    const next = render(
      <AstralisProvider persistTokens>
        <Picker to={VIOLET} />
      </AstralisProvider>,
    );
    expect(next.getByRole("button").dataset.brand).toBe(VIOLET);
    expect(containerBrand(next.container)).toBe(VIOLET);
  });

  it("returns to the tokens prop on setTokens(undefined), and forgets the choice", () => {
    localStorage.setItem(TOKENS_KEY, storedThemeCss({ brandColor: VIOLET }));
    const { getByRole, container } = render(
      <AstralisProvider persistTokens tokens={{ brandColor: "#22c55e" }}>
        <Picker to={undefined} />
      </AstralisProvider>,
    );
    expect(containerBrand(container)).toBe(VIOLET);
    act(() => getByRole("button").click());
    expect(containerBrand(container)).toBe("#22c55e");
    expect(localStorage.getItem(TOKENS_KEY)).toBeNull();
    expect(storedStyle()).toBeNull();
  });

  it("neither reads nor writes storage without persistTokens", () => {
    localStorage.setItem(TOKENS_KEY, storedThemeCss({ brandColor: VIOLET }));
    const { getByRole } = render(
      <AstralisProvider>
        <Picker to="#3b82f6" />
      </AstralisProvider>,
    );
    expect(getByRole("button").dataset.brand).toBe("");
    act(() => getByRole("button").click());
    expect(getByRole("button").dataset.brand).toBe("#3b82f6");
    expect(localStorage.getItem(TOKENS_KEY)).toContain(VIOLET);
    expect(storedStyle()).toBeNull();
  });

  it("ignores a stored value that is not a theme", () => {
    localStorage.setItem(TOKENS_KEY, "body { display: none }");
    const { getByRole } = render(
      <AstralisProvider persistTokens>
        <Picker to={VIOLET} />
      </AstralisProvider>,
    );
    expect(getByRole("button").dataset.brand).toBe("");
  });

  it("still applies the choice when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const { getByRole, container } = render(
      <AstralisProvider persistTokens>
        <Picker to={VIOLET} />
      </AstralisProvider>,
    );
    act(() => getByRole("button").click());
    expect(containerBrand(container)).toBe(VIOLET);
  });
});
