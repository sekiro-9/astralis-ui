import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { Box } from "./layout/box";
import { Flex } from "./layout/flex";
import { Grid } from "./layout/grid";
import { Center } from "./layout/center";
import { Float } from "./layout/float";
import { Container } from "./layout/container";
import { ignoredStyleProps } from "../utils/dev-identity";
import { STATE_STYLE_MAPS } from "../utils/interaction-state";
import { CHANNEL_PROPS } from "../const/channel";
import {
  rotateTypes,
  scaleTypes,
  transformOriginTypes,
  transitionTypes,
  translateTypes,
} from "../const/transform-mappings";

const rootOf = (ui: React.ReactElement) => render(ui).container.firstElementChild as HTMLElement;
const classesOf = (el: HTMLElement) => el.className.split(/\s+/);
const varOf = (el: HTMLElement, name: string) => el.style.getPropertyValue(name);

const THEME = join(__dirname, "..", "theme");
const channelsCss = readFileSync(join(THEME, "channels.css"), "utf8");
const motionCss = readFileSync(join(THEME, "motion.css"), "utf8");

afterEach(() => vi.restoreAllMocks());

describe("transform props", () => {
  it("scale, translateX, translateY and rotate are channel props with their own slugs", () => {
    expect(CHANNEL_PROPS).toMatchObject({
      scale: "scale",
      translateX: "translate-x",
      translateY: "translate-y",
      rotate: "rotate",
    });
  });

  it("resolve tokens to a channel class and a CSS value", () => {
    const el = rootOf(<Box scale="105" translateX="-2" translateY="1/2" rotate="-45">x</Box>);
    expect(classesOf(el)).toEqual(
      expect.arrayContaining(["astralis-scale", "astralis-translate-x", "astralis-translate-y", "astralis-rotate"]),
    );
    expect(varOf(el, "--astralis-scale")).toBe("1.05");
    expect(varOf(el, "--astralis-translate-x")).toBe("calc(var(--astralis-spacing-2) * -1)");
    expect(varOf(el, "--astralis-translate-y")).toBe("50%");
    expect(varOf(el, "--astralis-rotate")).toBe("-45deg");
  });

  it("follow Tailwind's scales", () => {
    expect(Object.keys(scaleTypes)).toEqual(["0", "50", "75", "90", "95", "100", "105", "110", "125", "150"]);
    expect(scaleTypes["95"]).toBe("0.95");
    expect(translateTypes["0"]).toBe("0");
    expect(translateTypes["-0.5"]).toBe("calc(var(--astralis-spacing-0\\.5) * -1)");
    expect(translateTypes.full).toBe("100%");
    expect(translateTypes["96"]).toBe("var(--astralis-spacing-96)");
    expect(rotateTypes["0"]).toBe("0deg");
    expect(rotateTypes["180"]).toBe("180deg");
  });

  it("pass a value that is not a token through as CSS", () => {
    const el = rootOf(<Box scale="1.02" rotate="0.25turn" translateY="3px">x</Box>);
    expect(varOf(el, "--astralis-scale")).toBe("1.02");
    expect(varOf(el, "--astralis-rotate")).toBe("0.25turn");
    expect(varOf(el, "--astralis-translate-y")).toBe("3px");
  });

  it("warn about a bare number on rotate, naming degrees, but not on scale", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    rootOf(<Box rotate="30" scale="1.5">x</Box>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('"30deg"');
  });

  it("are responsive, by viewport and by container", () => {
    const el = rootOf(<Box scale={{ base: "100", md: "110", "@lg": "125" }}>x</Box>);
    expect(classesOf(el)).toEqual(
      expect.arrayContaining(["astralis-scale", "astralis-scale-md", "astralis-scale-cq-lg"]),
    );
    expect(varOf(el, "--astralis-scale-md")).toBe("1.1");
    expect(varOf(el, "--astralis-scale-cq-lg")).toBe("1.25");
  });

  it("change in hover, focusVisible and active", () => {
    const el = rootOf(
      <Box
        hover={{ scale: "105", translateY: "-1", shadow: "lg" }}
        focusVisible={{ rotate: "3" }}
        active={{ scale: "95", translateX: "1" }}
      >
        x
      </Box>,
    );
    expect(classesOf(el)).toEqual(
      expect.arrayContaining([
        "astralis-hover-scale",
        "astralis-hover-translate-y",
        "astralis-hover-shadow",
        "astralis-focus-visible-rotate",
        "astralis-active-scale",
        "astralis-active-translate-x",
      ]),
    );
    expect(varOf(el, "--astralis-scale-hover")).toBe("1.05");
    expect(varOf(el, "--astralis-translate-y-hover")).toBe("calc(var(--astralis-spacing-1) * -1)");
    expect(varOf(el, "--astralis-rotate-focus-visible")).toBe("3deg");
    expect(varOf(el, "--astralis-scale-active")).toBe("0.95");
    for (const prop of ["scale", "translateX", "translateY", "rotate"]) expect(STATE_STYLE_MAPS).toHaveProperty(prop);
  });

  it("transformOrigin and transition are keyword classes, and responsive", () => {
    for (const [name, cls] of Object.entries(transformOriginTypes)) {
      expect(rootOf(<Box transformOrigin={name as keyof typeof transformOriginTypes}>x</Box>).className, name).toContain(cls);
    }
    for (const [name, cls] of Object.entries(transitionTypes)) {
      expect(rootOf(<Box transition={name as keyof typeof transitionTypes}>x</Box>).className, name).toContain(cls);
    }
    const el = rootOf(<Box transition={{ base: "none", md: "transform" }} transformOrigin={{ md: "top-left" }}>x</Box>);
    expect(classesOf(el)).toEqual(
      expect.arrayContaining([
        "astralis:motion-transition-none",
        "astralis:md:motion-transition-transform",
        "astralis:md:origin-top-left",
      ]),
    );
  });

  it("never reach the DOM as attributes, on every Box-composing primitive", () => {
    const props = {
      scale: "105",
      translateX: "1",
      translateY: "-1",
      rotate: "3",
      transformOrigin: "top",
      transition: "transform",
      hover: { scale: "110" },
    } as const;
    for (const [name, el] of [
      ["Box", rootOf(<Box {...props}>x</Box>)],
      ["Flex", rootOf(<Flex {...props}>x</Flex>)],
      ["Grid", rootOf(<Grid {...props}>x</Grid>)],
      ["Center", rootOf(<Center {...props}>x</Center>)],
      ["Container", rootOf(<Container {...props}>x</Container>)],
    ] as const) {
      for (const attr of ["scale", "translatex", "translatey", "rotate", "transformorigin", "transform-origin", "transition", "hover"]) {
        expect(el.hasAttribute(attr), `${name} ${attr}`).toBe(false);
      }
      expect(classesOf(el), name).toEqual(expect.arrayContaining(["astralis-scale", "astralis-hover-scale"]));
    }
  });

  it("keep Float's placement class next to a translate prop", () => {
    const el = rootOf(<Float placement="top-end" translateY="-1">x</Float>);
    expect(el.className).toContain("astralis:translate-x-1/2");
    expect(classesOf(el)).toContain("astralis-translate-y");
  });

  it("the development warning for ignored style props does not fire on the components that take them", () => {
    const props = { scale: "105", translateX: "1", translateY: "1", rotate: "3", transformOrigin: "top", transition: "common" };
    for (const name of ["Box", "Flex", "Grid", "Center", "Float", "Container", "Stack"]) {
      expect(ignoredStyleProps(name, props), name).toEqual([]);
    }
    expect(ignoredStyleProps("Card", props)).toEqual(Object.keys(props));
  });
});

describe("transform CSS", () => {
  it("each axis sets its own variable and writes both, at base, breakpoints, containers and states", () => {
    for (const selector of [
      ".astralis-translate-y ",
      ".astralis-translate-y-md ",
      ".astralis-translate-y-cq-md ",
      ".astralis-hover-translate-y:hover ",
      ".astralis-active-translate-x:active ",
    ]) {
      const axis = selector.includes("-x") ? "x" : "y";
      const rule = channelsCss.split("\n").find((line) => line.trim().startsWith(selector));
      expect(rule, selector).toContain(`--tw-translate-${axis}: var(`);
      expect(rule, selector).toContain("translate: var(--tw-translate-x) var(--tw-translate-y);");
    }
    expect(channelsCss).toContain('@property --tw-translate-x { syntax: "*"; inherits: false; initial-value: 0; }');
  });

  it("scale and rotate write the individual properties, never transform", () => {
    expect(channelsCss).toContain(".astralis-hover-scale:hover { scale: var(--astralis-scale-hover); }");
    expect(channelsCss).toContain(".astralis-rotate { rotate: var(--astralis-rotate); }");
    expect(channelsCss).not.toMatch(/\btransform:/);
  });

  it("every animating transition is declared only under prefers-reduced-motion: no-preference", () => {
    for (const name of ["colors", "transform", "common"]) {
      const block = motionCss.split(`@utility motion-transition-${name} {`)[1].split("\n}\n")[0];
      expect(block, name).toMatch(/^\s*@media \(prefers-reduced-motion: no-preference\) \{\s*transition-property:/);
    }
  });
});
