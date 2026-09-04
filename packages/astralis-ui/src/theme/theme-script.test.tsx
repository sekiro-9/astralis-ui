import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { AstralisProvider } from "./provider";
import { ThemeScript } from "./theme-script";
import { getThemeScript } from "./theme-storage";
import { useTheme } from "./theme-context";

const KEY = "astralis-ui-theme";
const root = () => document.documentElement;

function mockSystemDark(dark: boolean) {
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches: dark && query.includes("dark"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

beforeEach(() => {
  localStorage.clear();
  root().classList.remove("astralis-dark");
  mockSystemDark(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const run = (script: string) => new Function(script)();

describe("getThemeScript", () => {
  it("applies a stored dark preference", () => {
    localStorage.setItem(KEY, "dark");
    run(getThemeScript());
    expect(root().classList.contains("astralis-dark")).toBe(true);
  });

  it("follows prefers-color-scheme for the system default", () => {
    mockSystemDark(true);
    run(getThemeScript());
    expect(root().classList.contains("astralis-dark")).toBe(true);
  });

  it("removes the class for a stored light preference", () => {
    root().classList.add("astralis-dark");
    localStorage.setItem(KEY, "light");
    run(getThemeScript());
    expect(root().classList.contains("astralis-dark")).toBe(false);
  });

  it("ignores an invalid stored value and uses the default", () => {
    localStorage.setItem("custom", "purple");
    run(getThemeScript({ storageKey: "custom", defaultTheme: "dark" }));
    expect(root().classList.contains("astralis-dark")).toBe(true);
  });

  it("survives blocked storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(() => run(getThemeScript({ defaultTheme: "dark" }))).not.toThrow();
    expect(root().classList.contains("astralis-dark")).toBe(true);
  });

  it("cannot be broken out of by the storage key", () => {
    const script = getThemeScript({ storageKey: "</script><script>alert(1)//" });
    expect(script).not.toContain("</script>");
    expect(() => run(script)).not.toThrow();
  });
});

describe("ThemeScript", () => {
  it("renders the same script inline, with the nonce", () => {
    const html = renderToStaticMarkup(<ThemeScript defaultTheme="dark" nonce="abc" />);
    expect(html).toContain('nonce="abc"');
    expect(html).toContain(`>${getThemeScript({ defaultTheme: "dark" })}</script>`);
  });
});

describe("AstralisProvider storage", () => {
  function Probe() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    return (
      <button type="button" data-theme={theme} data-resolved={resolvedTheme} onClick={() => setTheme("dark")}>
        toggle
      </button>
    );
  }

  it("renders when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const { getByRole } = render(<AstralisProvider><Probe /></AstralisProvider>);
    act(() => getByRole("button").click());
    expect(getByRole("button").dataset.resolved).toBe("dark");
  });

  it("ignores an invalid stored value", () => {
    localStorage.setItem(KEY, "neon");
    const { getByRole } = render(<AstralisProvider defaultTheme="light"><Probe /></AstralisProvider>);
    expect(getByRole("button").dataset.theme).toBe("light");
  });

  it("writes storage only when the user picks a theme", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { getByRole } = render(<AstralisProvider defaultTheme="light"><Probe /></AstralisProvider>);
    expect(setItem).not.toHaveBeenCalled();
    act(() => getByRole("button").click());
    expect(setItem).toHaveBeenCalledWith(KEY, "dark");
  });

  it("lets a changed default reach visitors who never chose", () => {
    const first = render(<AstralisProvider defaultTheme="light"><Probe /></AstralisProvider>);
    first.unmount();
    const { getByRole } = render(<AstralisProvider defaultTheme="dark"><Probe /></AstralisProvider>);
    expect(getByRole("button").dataset.resolved).toBe("dark");
  });

  it("keeps the class a pre-paint script set when the stored theme is dark", () => {
    localStorage.setItem(KEY, "dark");
    run(getThemeScript());
    const remove = vi.spyOn(root().classList, "remove");
    const toggle = vi.spyOn(root().classList, "toggle");
    render(<AstralisProvider><Probe /></AstralisProvider>);
    expect(remove).not.toHaveBeenCalled();
    expect(toggle.mock.calls.every(([, force]) => force === true)).toBe(true);
    expect(root().classList.contains("astralis-dark")).toBe(true);
  });
});
