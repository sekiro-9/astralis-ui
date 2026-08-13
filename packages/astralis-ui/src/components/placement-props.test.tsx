import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Card } from "./data-display/card";
import { Stat, StatLabel, StatValue } from "./data-display/stat";
import { Select } from "./data-entry/select";
import { Badge } from "./data-display/badge";
import { Kbd } from "./typography/kbd";
import { Breadcrumb } from "./navigation/breadcrumb";
import { CodeBlock } from "./typography/code-block";
import { Table } from "./data-display/table";
import { Steps } from "./navigation/steps";
import { Tabs } from "./navigation/tabs";
import { Tag } from "./data-display/tag";
import { Skeleton } from "./feedback/skeleton";
import { Spinner } from "./feedback/spinner";
import { Icon } from "./icon";
import { Link } from "./typography/link";
import { Alert } from "./feedback/alert";
import { Input } from "./data-entry/input";
import { Checkbox } from "./data-entry/checkbox";
import { Switch } from "./data-entry/switch";
import { Radio } from "./data-entry/radio";
import { Progress } from "./feedback/progress";
import { NumberInput } from "./data-entry/number-input";
import { Field } from "./data-entry/field";
import { Button } from "./buttons/button";
import { Text } from "./typography/text";
import { Heading } from "./typography/heading";
import { Highlight } from "./typography/highlight";
import { Avatar } from "./data-display/avatar";
import { Accordion } from "./disclosure/accordion";
import { Carousel } from "./disclosure/carousel";
import { Pagination } from "./disclosure/pagination";
import { PinInput } from "./data-entry/pin-input";
import { QrCode } from "./data-display/qr-code";
import { Slider } from "./data-entry/slider";
import { Timeline } from "./data-display/timeline";
import { DataList } from "./data-display/data-list";
import { ButtonGroup } from "./buttons/button-group";
import { Marquee } from "./data-display/marquee";
import { Calendar } from "./data-display/calendar";
import { Combobox } from "./data-entry/combobox";
import { MultiSelect } from "./data-entry/multi-select";
import { ThemeToggle } from "./buttons/theme-toggle";
import { Image } from "./data-display/image";
import { AstralisProvider } from "../theme/provider";

/**
 * The rule these pin down:
 *
 *   A component owns how it LOOKS. Its parent owns WHERE IT SITS and HOW BIG.
 *
 * Recipe components take the placement set (size, flex-item, margin) and none
 * of Box's paint props. Before this, sizing a Card cost a wrapper node purely
 * to reach one prop, which is why no block used Card at all.
 *
 * The failure mode being guarded is the one this library keeps producing: a
 * prop that looks valid and does nothing — or worse, reaches the DOM as a
 * stray attribute.
 */

/**
 * Phase 2 — the same contract across every component that adopts the rule.
 *
 * Table-driven rather than one test each: the wiring is identical everywhere,
 * so what matters is that no component is missed and none of them leaks a
 * placement key onto the DOM. A component added to the rule and left out of
 * this table is the failure this cannot catch, so the list is kept in step
 * Each entry names the COMPOUND export, which is the root — Object.assign
 * returns the root function itself, so Steps and StepsRoot are one value and
 * only the compound name is exported.
 */
const ADOPTERS: Array<[string, (props: Record<string, unknown>) => React.ReactElement]> = [
  ["Badge", (p) => <Badge {...p}>badge</Badge>],
  ["Kbd", (p) => <Kbd {...p}>K</Kbd>],
  ["Breadcrumb", (p) => <Breadcrumb {...p}><span>a</span></Breadcrumb>],
  ["CodeBlock", (p) => <CodeBlock {...p} code="x" />],
  ["Table", (p) => <Table {...p}><tbody><tr><td>a</td></tr></tbody></Table>],
  ["Steps", (p) => <Steps {...p}><span>a</span></Steps>],
  ["Tabs", (p) => <Tabs {...p} defaultValue="a"><span>a</span></Tabs>],
  ["Tag", (p) => <Tag {...p}>tag</Tag>],
  ["Skeleton", (p) => <Skeleton {...p} />],
  ["Spinner", (p) => <Spinner {...p} />],
  ["Icon", (p) => <Icon {...p} as="svg" />],
  ["Link", (p) => <Link {...p} href="#">link</Link>],
  ["Alert", (p) => <Alert {...p}>alert</Alert>],
  ["Input", (p) => <Input {...p} />],
  ["Checkbox", (p) => <Checkbox {...p} />],
  ["Switch", (p) => <Switch {...p} />],
  ["Radio", (p) => <Radio {...p} value="a" />],
  ["Progress", (p) => <Progress {...p} value={50} />],
  ["NumberInput", (p) => <NumberInput {...p} />],
  ["Field", (p) => <Field {...p} />],
  ["Button", (p) => <Button {...p}>go</Button>],
  ["Text", (p) => <Text {...p}>text</Text>],
  ["Heading", (p) => <Heading {...p}>head</Heading>],
  ["Highlight", (p) => <Highlight {...p} query="a">abc</Highlight>],
  ["Avatar", (p) => <Avatar {...p} name="A B" />],
  ["Accordion", (p) => <Accordion {...p} />],
  ["Carousel", (p) => <Carousel {...p}><span>a</span></Carousel>],
  ["Pagination", (p) => <Pagination {...p} count={3} />],
  ["PinInput", (p) => <PinInput {...p} />],
  ["QrCode", (p) => <QrCode {...p} value="x" />],
  ["Slider", (p) => <Slider {...p} />],
  ["Timeline", (p) => <Timeline {...p}><span>a</span></Timeline>],
  ["DataList", (p) => <DataList {...p}><span>a</span></DataList>],
  ["ButtonGroup", (p) => <ButtonGroup {...p}><span>a</span></ButtonGroup>],
  ["Marquee", (p) => <Marquee {...p}><span>a</span></Marquee>],
  ["Calendar", (p) => <Calendar {...p} />],
  ["Combobox", (p) => <Combobox {...p} options={[]} />],
  ["MultiSelect", (p) => <MultiSelect {...p} options={[]} />],
  ["Image", (p) => <Image {...p} src="x.png" alt="x" />],
];

describe.each(ADOPTERS)("placement on %s", (_name, render_) => {
  it("resolves w and mt to channel classes + vars and keeps both off the DOM", () => {
    const { container } = render(render_({ w: "full", mt: "4" }));
    const root = container.firstElementChild as HTMLElement;

    expect([...root.classList]).toEqual(
      expect.arrayContaining(["astralis-w", "astralis-mt"]),
    );
    expect(root.style.getPropertyValue("--astralis-w")).toBe("var(--astralis-size-full)");
    expect(root.style.getPropertyValue("--astralis-mt")).toBe("var(--astralis-spacing-4)");
    expect(root.hasAttribute("w")).toBe(false);
    expect(root.hasAttribute("mt")).toBe(false);
  });
});

describe("placement props on recipe components", () => {
  it("resolves placement props to classes on Card", () => {
    const { container } = render(
      <Card w="full" maxW="lg" flex="1" mt="4">
        card
      </Card>,
    );
    const card = container.firstElementChild as HTMLElement;

    // `flex` stays a keyword class; w/maxW/mt are channel props.
    expect([...card.classList]).toEqual(
      expect.arrayContaining([
        "astralis-w",
        "astralis-max-w",
        "astralis:flex-1",
        "astralis-mt",
      ]),
    );
    expect(card.style.getPropertyValue("--astralis-w")).toBe("var(--astralis-size-full)");
    expect(card.style.getPropertyValue("--astralis-max-w")).toBe("var(--astralis-size-lg)");
    expect(card.style.getPropertyValue("--astralis-mt")).toBe("var(--astralis-spacing-4)");
  });

  it("never leaks a placement prop onto the DOM as an attribute", () => {
    const { container } = render(<Card w="full" alignSelf="end" mb="2" />);
    const card = container.firstElementChild!;

    for (const leaked of ["w", "alignself", "mb"]) {
      expect(card.hasAttribute(leaked)).toBe(false);
    }
  });

  it("keeps the caller's style alongside placement vars — fold, never stomp", () => {
    // The trap this pins: destructuring `style` and rendering it BEFORE the
    // rest spread let the folded placement vars REPLACE the user's style.
    const { container } = render(
      <Card mt="4" style={{ outline: "1px solid red" }}>
        x
      </Card>,
    );
    const card = container.firstElementChild as HTMLElement;

    expect(card.style.getPropertyValue("--astralis-mt")).toBe("var(--astralis-spacing-4)");
    expect(card.style.outline).toBe("1px solid red");
  });

  it("keeps the recipe's own variant classes alongside placement", () => {
    const { container } = render(<Card variant="outline" size="lg" w="full" />);
    const classes = [...container.firstElementChild!.classList];

    // `size` here is the Card recipe's scale, not Box's width+height.
    expect(classes).toEqual(expect.arrayContaining(["astralis-w"]));
    expect(classes.some((c) => c.includes("border"))).toBe(true);
  });

  it("accepts responsive placement, the same as on Box", () => {
    const { container } = render(<Card w={{ base: "full", md: "1/2" }} />);
    const card = container.firstElementChild as HTMLElement;

    expect([...card.classList]).toEqual(
      expect.arrayContaining(["astralis-w", "astralis-w-md"]),
    );
    expect(card.style.getPropertyValue("--astralis-w")).toBe("var(--astralis-size-full)");
    // Fraction tokens ride the escaped size ident (size.css declares 1\/2).
    expect(card.style.getPropertyValue("--astralis-w-md")).toBe("var(--astralis-size-1\\/2)");
  });

  it("gives Stat placement props", () => {
    const { container } = render(
      <Stat w="full" mt="2">
        <StatLabel>Revenue</StatLabel>
        <StatValue>$12k</StatValue>
      </Stat>,
    );
    const stat = container.firstElementChild as HTMLElement;

    expect([...stat.classList]).toEqual(
      expect.arrayContaining(["astralis-w", "astralis-mt"]),
    );
    expect(stat.style.getPropertyValue("--astralis-w")).toBe("var(--astralis-size-full)");
    expect(stat.style.getPropertyValue("--astralis-mt")).toBe("var(--astralis-spacing-2)");
    expect(stat.hasAttribute("w")).toBe(false);
  });

  it("forwards placement through ThemeToggle to the Button it renders", () => {
    // Needs the provider to render at all, so the table-driven check cannot be
    // used — its root element would be the provider, not the control.
    const { container } = render(
      <AstralisProvider>
        <ThemeToggle w="full" mt="4" />
      </AstralisProvider>,
    );
    const button = container.querySelector("button")!;

    expect([...button.classList]).toEqual(
      expect.arrayContaining(["astralis-w", "astralis-mt"]),
    );
    expect(button.style.getPropertyValue("--astralis-w")).toBe("var(--astralis-size-full)");
    expect(button.style.getPropertyValue("--astralis-mt")).toBe("var(--astralis-spacing-4)");
    expect(button.hasAttribute("w")).toBe(false);
  });

  it("passes an aria-label through to Select's combobox", () => {
    // Select destructured every prop with no rest, so a label passed from
    // outside was dropped and a Field wrapper was the only way to name one.
    const { container } = render(<Select aria-label="Pick a plan" options={[]} w="full" />);

    const combobox = container.querySelector('[role="combobox"]')!;
    expect(combobox.getAttribute("aria-label")).toBe("Pick a plan");

    // Placement belongs to the wrapper, not the trigger.
    expect([...container.firstElementChild!.classList]).toContain("astralis:w-full");
  });
});
