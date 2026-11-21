import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { Box } from "./layout/box";
import { Card } from "./data-display/card";
import { Button } from "./buttons/button";
import { Text } from "./typography/text";
import { Heading } from "./typography/heading";
import { Carousel } from "./disclosure/carousel";
import { ScrollArea } from "./layout/scroll-area";
import { Table } from "./data-display/table";
import { animationTypes, revealTypes, animationDurationTypes, animationDelayTypes } from "../const/motion-mappings";

const rootOf = (ui: React.ReactElement) => render(ui).container.firstElementChild as HTMLElement;

describe("motion props", () => {
  it("animation puts the entrance class on Box, for every name", () => {
    for (const [name, cls] of Object.entries(animationTypes)) {
      const el = rootOf(<Box animation={name as keyof typeof animationTypes}>x</Box>);
      expect(el.className, name).toContain(cls);
    }
  });

  it("reveal puts the scroll class on Box, for every name", () => {
    for (const [name, cls] of Object.entries(revealTypes)) {
      const el = rootOf(<Box reveal={name as keyof typeof revealTypes}>x</Box>);
      expect(el.className, name).toContain(cls);
    }
  });

  it("animationDuration and animationDelay set their classes", () => {
    const el = rootOf(
      <Box animation="fade-up" animationDuration="slow" animationDelay="200">
        x
      </Box>,
    );
    expect(el.className).toContain(animationDurationTypes.slow);
    expect(el.className).toContain(animationDelayTypes["200"]);
  });

  it("the props never reach the DOM as attributes", () => {
    const el = rootOf(
      <Box animation="pop" reveal="fade-in" animationDuration="fast" animationDelay="100">
        x
      </Box>,
    );
    for (const attr of ["animation", "reveal", "animationduration", "animationdelay"]) {
      expect(el.hasAttribute(attr), attr).toBe(false);
    }
  });

  it("recipe and typography components take them as placement props", () => {
    expect(rootOf(<Card animation="fade-up">x</Card>).className).toContain(animationTypes["fade-up"]);
    expect(rootOf(<Button reveal="scale-in">x</Button>).className).toContain(revealTypes["scale-in"]);
    expect(rootOf(<Text animation="blur-in">x</Text>).className).toContain(animationTypes["blur-in"]);
    expect(rootOf(<Heading reveal="slide-left">x</Heading>).className).toContain(revealTypes["slide-left"]);
  });

  it("a responsive map gives the breakpoint its own class", () => {
    const el = rootOf(<Box animation={{ base: "fade-in", md: "fade-up" }}>x</Box>);
    expect(el.className).toContain("astralis:animate-fade-in");
    expect(el.className).toContain("astralis:md:animate-fade-up");
  });

  it("Carousel keeps animation for its own slide transition", () => {
    const el = rootOf(
      <Carousel animation="fade">
        <Carousel.Track>
          <Carousel.Slide>one</Carousel.Slide>
        </Carousel.Track>
      </Carousel>,
    );
    expect(el.className).not.toContain("astralis:animate-");
  });
});

describe("reveal inside the library's scroll containers", () => {
  const SCOPE = "astralis:motion-reveal-scope";

  it("a horizontal ScrollArea gives the reveals inside it a timeline the page scroll moves", () => {
    expect(rootOf(<ScrollArea direction="horizontal">x</ScrollArea>).className).toContain(SCOPE);
    // A vertical one scrolls its own content, and reveals inside follow that.
    expect(rootOf(<ScrollArea>x</ScrollArea>).className).not.toContain(SCOPE);
    expect(rootOf(<ScrollArea direction="both">x</ScrollArea>).className).not.toContain(SCOPE);
  });

  it("Table, which scrolls sideways, carries the scope", () => {
    const el = rootOf(
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>x</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(el.className).toContain(SCOPE);
  });

  it("Carousel.Track clips instead of hiding, so it is not a scroll container", () => {
    for (const animation of ["slide", "fade"] as const) {
      const root = rootOf(
        <Carousel animation={animation}>
          <Carousel.Track data-testid="track">
            <Carousel.Slide>one</Carousel.Slide>
          </Carousel.Track>
        </Carousel>,
      );
      const track = root.querySelector("[data-testid=track]") as HTMLElement;
      expect(track.className, animation).toContain("astralis:overflow-clip");
      expect(track.className, animation).not.toContain("astralis:overflow-hidden");
    }
  });
});

describe("motion stylesheet", () => {
  const css = readFileSync(join(process.cwd(), "src", "theme", "motion.css"), "utf8");

  it("declares every animation inside prefers-reduced-motion: no-preference", () => {
    const utilities = css.split("@utility ").slice(1).filter((block) => /^(animate|reveal)-/.test(block));
    expect(utilities.length).toBe(Object.keys(animationTypes).length + Object.keys(revealTypes).length);
    for (const block of utilities) {
      expect(block, block.slice(0, 24)).toMatch(/@media \(prefers-reduced-motion: no-preference\)\s*\{[^}]*animation:/s);
    }
  });

  it("guards every scroll animation with @supports, so other browsers show the content", () => {
    const reveals = css.split("@utility ").slice(1).filter((block) => block.startsWith("reveal-"));
    for (const block of reveals) expect(block).toContain("@supports (animation-timeline: view())");
  });

  it("reads the reveal timeline from the nearest scope, falling back to the element's own view", () => {
    const reveals = css.split("@utility ").slice(1).filter((block) => block.startsWith("reveal-"));
    for (const block of reveals) expect(block).toContain("animation-timeline: var(--astralis-reveal-source, view());");
    expect(css).toMatch(/@utility motion-reveal-scope \{[^}]*view-timeline: --astralis-reveal-scope block;\s*--astralis-reveal-source: --astralis-reveal-scope;/s);
  });

  it("has a class for every name the props accept", () => {
    const classes = [animationTypes, revealTypes, animationDurationTypes, animationDelayTypes].flatMap((map) => Object.values(map));
    for (const cls of classes) expect(css, cls).toContain(`@utility ${cls.replace("astralis:", "")} {`);
  });
});
