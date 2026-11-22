import { describe, expect, it } from "vitest";
import { astralisMerge } from "./astralis-merge";
import { MERGE_CONFIG } from "./merge-config.generated";

/* `a:` stands for the `astralis:` prefix, to keep the tables readable. */
const merge = (classes: string) =>
  astralisMerge(classes.replace(/(^| )a:/g, "$1astralis:")).replace(/(^| )astralis:/g, "$1a:");

/* Expected results are what tailwind-merge's full default config returns
   (check-merge-config proves that for every class in the stylesheet); these
   pin one representative case per group family. */
const cases: Record<string, [string, string][]> = {
  spacing: [
    ["a:p-4 a:p-2", "a:p-2"],
    ["a:px-2 a:p-4", "a:p-4"],
    ["a:p-4 a:px-2", "a:p-4 a:px-2"],
    ["a:mt-2 a:m-0", "a:m-0"],
    ["a:gap-x-6 a:gap-2", "a:gap-2"],
    ["a:gap-2 a:gap-x-6", "a:gap-2 a:gap-x-6"],
  ],
  sizing: [
    ["a:w-full a:w-1/3", "a:w-1/3"],
    ["a:w-1/3 a:w-[160px]", "a:w-[160px]"],
    ["a:h-[120px] a:h-full", "a:h-full"],
    ["a:max-w-[calc(100vw-2rem)] a:max-w-full", "a:max-w-full"],
    ["a:shrink-0 a:shrink", "a:shrink"],
  ],
  colour: [
    ["a:bg-surface-base a:bg-surface-muted", "a:bg-surface-muted"],
    ["a:text-label-base a:text-accent-label", "a:text-accent-label"],
    // a text colour and a font size are different groups
    ["a:text-sm a:text-accent-label", "a:text-sm a:text-accent-label"],
    // the neutral stroke ladder is a border colour, not a width
    ["a:border-stroke-base a:border-stroke-subtle", "a:border-stroke-subtle"],
    ["a:border-stroke-subtle a:border-accent-stroke", "a:border-accent-stroke"],
    ["a:border-stroke-base a:border-normal", "a:border-stroke-base a:border-normal"],
  ],
  "border width per side": [
    ["a:border-normal a:border-thick", "a:border-thick"],
    ["a:border-0 a:border-normal", "a:border-normal"],
    ["a:border-b-normal a:border-b-thick", "a:border-b-thick"],
    // a one-sided width overrides only its side…
    ["a:border-normal a:border-b-thick", "a:border-normal a:border-b-thick"],
    ["a:border-t-normal a:border-b-normal", "a:border-t-normal a:border-b-normal"],
    // …and the all-sides width replaces it
    ["a:border-b-thick a:border-normal", "a:border-normal"],
  ],
  rounded: [
    ["a:rounded a:rounded-lg", "a:rounded-lg"],
    ["a:rounded-t-md a:rounded-lg", "a:rounded-lg"],
    ["a:rounded-lg a:rounded-t-md", "a:rounded-lg a:rounded-t-md"],
  ],
  display: [
    ["a:block a:flex", "a:flex"],
    ["a:inline-flex a:hidden", "a:hidden"],
    ["a:grid-cols-2 a:grid-cols-3", "a:grid-cols-3"],
    ["a:col-span-2 a:col-span-full", "a:col-span-full"],
  ],
  "named scale steps": [
    ["a:z-low a:z-high", "a:z-high"],
    ["a:z-10 a:z-max", "a:z-max"],
    ["a:opacity-low a:opacity-high", "a:opacity-high"],
    ["a:opacity-high a:opacity-0", "a:opacity-0"],
    ["a:aspect-square a:aspect-wide", "a:aspect-wide"],
    ["a:aspect-golden a:aspect-portrait", "a:aspect-portrait"],
  ],
  "position and inset": [
    ["a:relative a:absolute", "a:absolute"],
    ["a:sticky a:relative", "a:relative"],
    ["a:top-4 a:inset-0", "a:inset-0"],
    ["a:inset-0 a:top-4", "a:inset-0 a:top-4"],
  ],
  typography: [
    ["a:text-sm a:text-lg", "a:text-lg"],
    // Text's size="inherit" is a font size
    ["a:text-sm a:text-size-inherit", "a:text-size-inherit"],
    ["a:text-size-inherit a:text-accent-label", "a:text-size-inherit a:text-accent-label"],
    ["a:font-medium a:font-bold", "a:font-bold"],
    ["a:leading-tight a:leading-none", "a:leading-none"],
    ["a:text-left a:text-center", "a:text-center"],
    ["a:uppercase a:lowercase", "a:lowercase"],
  ],
  "motion and animation": [
    ["a:animate-spin a:animate-pulse", "a:animate-pulse"],
    // the library's own keyframes are animations too
    ["a:animate-slide-left a:animate-fade-in", "a:animate-fade-in"],
    ["a:animate-fade-up a:animate-pop", "a:animate-pop"],
    ["a:animate-spin a:animate-blur-in", "a:animate-blur-in"],
    ["a:motion-reduce:animate-none a:animate-fade-up", "a:motion-reduce:animate-none a:animate-fade-up"],
    ["a:reveal-fade-up a:reveal-slide-left", "a:reveal-slide-left"],
    ["a:duration-150 a:duration-200", "a:duration-200"],
    // named durations are durations, and override the numbered ones
    ["a:duration-fast a:duration-moderate", "a:duration-moderate"],
    ["a:duration-moderate a:duration-fast", "a:duration-fast"],
    ["a:duration-150 a:duration-moderate", "a:duration-moderate"],
    ["a:duration-moderate a:ease-out", "a:duration-moderate a:ease-out"],
    ["a:motion-duration-fast a:motion-duration-slow", "a:motion-duration-slow"],
    ["a:motion-delay-100 a:motion-delay-1000", "a:motion-delay-1000"],
    ["a:motion-distance-sm a:motion-distance-xl", "a:motion-distance-xl"],
    ["a:motion-duration-fast a:motion-delay-100 a:motion-distance-sm", "a:motion-duration-fast a:motion-delay-100 a:motion-distance-sm"],
    ["a:motion-reveal-scroll a:motion-reveal-once", "a:motion-reveal-once"],
    // the scope marks the scrolling container, so a mode does not replace it
    ["a:motion-reveal-scope a:motion-reveal-once", "a:motion-reveal-scope a:motion-reveal-once"],
    ["a:motion-transition-colors a:motion-transition-common", "a:motion-transition-common"],
    ["a:transition a:transition-[width]", "a:transition-[width]"],
    ["a:transition-[opacity,transform] a:transition-none", "a:transition-none"],
    ["a:motion-reduce:animate-none a:animate-spin", "a:motion-reduce:animate-none a:animate-spin"],
  ],
  transforms: [
    ["a:rotate-45 a:rotate-90", "a:rotate-90"],
    ["a:scale-95 a:scale-100", "a:scale-100"],
    ["a:translate-x-1/2 a:-translate-x-1/2", "a:-translate-x-1/2"],
    ["a:-translate-x-1/2 a:translate-x-1/2", "a:translate-x-1/2"],
  ],
  "state variants": [
    ["a:hover:bg-surface-base a:hover:bg-surface-muted", "a:hover:bg-surface-muted"],
    ["a:hover:bg-surface-muted a:bg-surface-base", "a:hover:bg-surface-muted a:bg-surface-base"],
    ["a:focus-visible:outline-none a:outline-none", "a:focus-visible:outline-none a:outline-none"],
    ["a:[scrollbar-width:none] a:[scrollbar-width:thin]", "a:[scrollbar-width:thin]"],
  ],
  "responsive variants": [
    ["a:sm:flex a:sm:hidden", "a:sm:hidden"],
    ["a:hidden a:sm:flex a:flex", "a:sm:flex a:flex"],
    ["a:sm:hidden a:md:flex a:sm:block", "a:md:flex a:sm:block"],
    ["a:@min-[40rem]:flex a:@min-[40rem]:hidden", "a:@min-[40rem]:hidden"],
    ["a:@min-[40rem]:flex a:@min-[64rem]:hidden", "a:@min-[40rem]:flex a:@min-[64rem]:hidden"],
  ],
  "non-library classes": [
    ["my-card a:p-4 a:p-2", "my-card a:p-2"],
    ["p-4 p-2", "p-4 p-2"],
    ["astralis-accent-blue astralis-accent-red", "astralis-accent-blue astralis-accent-red"],
  ],
};

describe("astralisMerge", () => {
  for (const [family, list] of Object.entries(cases)) {
    it.each(list)(`${family}: %s -> %s`, (input, expected) => {
      expect(merge(input)).toBe(expected);
    });
  }

  it("flattens clsx inputs before merging", () => {
    expect(
      astralisMerge("astralis:p-4", undefined, ["astralis:p-2"], { "astralis:m-0": true, "astralis:p-1": false }),
    ).toBe("astralis:p-2 astralis:m-0");
  });
});

describe("MERGE_CONFIG (generated)", () => {
  /* Flattens a group's definitions (plain names or `{ prefix: [...] }`) to class names. */
  const classesOf = (group: readonly unknown[], prefix = ""): string[] =>
    group.flatMap((definition) => {
      if (typeof definition === "string") {
        return [prefix && definition ? `${prefix}-${definition}` : prefix || definition];
      }
      if (typeof definition === "function") throw new Error("validator in generated config");
      return Object.entries(definition as Record<string, readonly unknown[]>).flatMap(([key, value]) =>
        classesOf(value, prefix ? `${prefix}-${key}` : key),
      );
    });

  it("is static: no validators or theme getters, only class names", () => {
    expect(MERGE_CONFIG.theme).toEqual({});
    for (const group of Object.values(MERGE_CONFIG.classGroups)) {
      expect(() => classesOf(group)).not.toThrow();
    }
  });

  it("keeps the library's own groups", () => {
    const groups = MERGE_CONFIG.classGroups as Record<string, readonly unknown[]>;
    expect(classesOf(groups["font-size"])).toContain("text-size-inherit");
    expect(classesOf(groups["border-w"])).toContain("border-normal");
    expect(classesOf(groups["border-w-b"])).toContain("border-b-normal");
    expect(classesOf(groups["border-color"])).toContain("border-stroke-base");
    expect(classesOf(groups.duration)).toEqual(expect.arrayContaining(["duration-fast", "duration-moderate"]));
    expect(classesOf(groups.animate)).toEqual(expect.arrayContaining(["animate-fade-up", "animate-slide-left"]));
    expect(classesOf(groups.reveal)).toContain("reveal-fade-up");
    expect(classesOf(groups["motion-delay"])).toContain("motion-delay-100");
  });
});
