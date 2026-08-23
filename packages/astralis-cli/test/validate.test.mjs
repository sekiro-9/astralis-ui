import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
// Through the package's own subpath — the same door astralis-mcp uses.
import { prepareSpec, validateSource, findInstalledSpec } from "../src/lib/validate.mjs";

/*
 * Every test seeds ONE mistake of the class the validator claims to catch —
 * mistakes that typecheck (or would, with `as never`) and still fail in the
 * browser. A validator that passes all 36 blocks proves nothing by itself;
 * this file is the proof it also REJECTS.
 *
 * The spec is the real one from the built astralis-ui, so these tests also
 * pin the spec's shape: if the emitter stops writing tokens or classes, the
 * catches below stop catching, loudly.
 */

const specPath = findInstalledSpec(dirname(fileURLToPath(import.meta.url)));
assert.ok(specPath, "system spec not found — build astralis-ui first");
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const prepared = prepareSpec(spec);

const validate = (jsx, imports = "Box, Flex, Stack, Container, Card, CardBody, Button, Text, Icon") =>
  validateSource(`import { ${imports} } from "astralis-ui";\nexport const X = () => (${jsx});`, prepared, "test.tsx");

const codes = (list) => list.map((i) => i.code);

test("a clean composition passes", () => {
  const r = validate(`<Flex direction="column" gap="4" p={{ base: "2", md: "8" }} bg="subtle" hover={{ bg: "muted" }}>
    <Text size="sm" color="brand">hi</Text>
    <Card w="full">ok</Card>
  </Flex>`);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});

test("unknown import is an error", () => {
  const r = validate(`<Box />`, "Box, Buttn");
  assert.ok(codes(r.errors).includes("unknown-import"));
});

test("keyword props are closed sets", () => {
  const r = validate(`<Box display="blorp" />`);
  assert.equal(r.errors.length, 1);
  assert.equal(r.errors[0].code, "invalid-keyword-value");
});

test("arbitrary channel values pass; bare numbers warn; unitless don't", () => {
  const good = validate(`<Box p="37px" w="calc(100vw - 200px)" bg="#0ea5e9" />`);
  assert.deepEqual(good.errors, []);
  assert.deepEqual(good.warnings, []);

  const bare = validate(`<Box p="37" />`);
  assert.deepEqual(bare.errors, []);
  assert.equal(bare.warnings[0].code, "bare-number-value");

  const unitless = validate(`<Box order="5" opacity="0.4" />`);
  assert.deepEqual(unitless.warnings, []);
});

test("responsive maps only take real breakpoint keys", () => {
  const r = validate(`<Box p={{ base: "2", tablet: "4" }} />`);
  assert.equal(r.errors[0].code, "invalid-breakpoint-key");
});

test("responsive values are validated per entry", () => {
  const r = validate(`<Box display={{ base: "flex", md: "blorp" }} />`);
  assert.equal(r.errors[0].code, "invalid-keyword-value");
});

test("state payloads carry channel props only, with valid tokens", () => {
  const bad = validate(`<Box hover={{ display: "flex" }} />`);
  assert.equal(bad.errors[0].code, "invalid-state-prop");

  const badValue = validate(`<Box hover={{ bg: "" }} />`);
  assert.equal(badValue.errors[0].code, "empty-channel-value");

  const arbitrary = validate(`<Box hover={{ bg: "oklch(0.7 0.1 200)" }} />`);
  assert.deepEqual(arbitrary.errors, []);
});

test("astralis classes must exist in the compiled CSS", () => {
  // astralis:flex is real. astralis:p-40 looks just as plausible and is not:
  // value classes died with the safelist in 0.7.0 (recipe-internal literals
  // like astralis:p-4 survive, which is exactly why a human can't eyeball this).
  const r = validate(`<div className="astralis:flex astralis:p-40" />`);
  assert.equal(r.errors.length, 1);
  assert.ok(r.errors[0].message.includes("astralis:p-40"));
  assert.equal(r.errors[0].code, "unknown-class");
});

test("template-literal classNames are checked where they are literal", () => {
  const r = validate("<div className={`astralis:p-40 ${x} astralis:flex`} />");
  assert.equal(r.errors.length, 1);
  assert.ok(r.errors[0].message.includes("astralis:p-40"));
});

test("style vars must be declared tokens or channel variables", () => {
  const bad = validate(`<Box style={{ gap: "var(--astralis-spacing-13)" }} />`);
  assert.equal(bad.errors[0].code, "unknown-css-variable");

  const good = validate(
    `<Box style={{ gap: "var(--astralis-spacing-4)", "--astralis-p": "2rem", "--astralis-p-md": "3rem" }} />`,
  );
  assert.deepEqual(good.errors, []);

  // A fallback makes the reference safe — no claim.
  const fallback = validate(`<Box style={{ gap: "var(--astralis-spacing-13, 1rem)" }} />`);
  assert.deepEqual(fallback.errors, []);
});

test("excluded props get targeted errors", () => {
  const r = validate(`<Container size="lg" />`);
  assert.equal(r.errors[0].code, "excluded-prop");
  assert.ok(r.errors[0].message.includes("maxW"));
});

test("compound dot-parts validate against the enumerated parts", () => {
  const good = validate(`<Card><Card.Body>x</Card.Body></Card>`);
  assert.deepEqual(good.errors, []);

  const bad = validate(`<Card><Card.Contents>x</Card.Contents></Card>`);
  assert.equal(bad.errors[0].code, "unknown-part");
  assert.ok(bad.errors[0].message.includes("Body"), "message lists the real parts");

  // Dot-only compounds (no MenuItem flat export) — the docs demos' false
  // positive, fixed by enumerating parts from the real export object.
  const menu = validate(`<Menu><Menu.Trigger>open</Menu.Trigger><Menu.Content><Menu.Item>a</Menu.Item></Menu.Content></Menu>`, "Menu");
  assert.deepEqual(menu.errors, []);
});

test("boolean variant props take bare attributes", () => {
  // <Text truncate> is JSX for truncate={true} — a boolean-keyed variant map.
  const r = validate(`<Text truncate gutterBottom={true}>x</Text>`);
  assert.deepEqual(r.errors, []);

  const still = validate(`<Box p />`);
  assert.equal(still.errors[0].code, "invalid-value");
});

test("rounded is a recipe prop on recipe components — no doctrine warning", () => {
  const r = validate(`<Button rounded="full">x</Button>`);
  assert.deepEqual(r.warnings, []);
});

test("paint on a recipe component warns with the doctrine", () => {
  const r = validate(`<Button bg="red-500">x</Button>`);
  assert.deepEqual(r.errors, []);
  assert.equal(r.warnings[0].code, "paint-on-recipe");
});

test("Stack speaks the axis vocabulary, not flex's", () => {
  const good = validate(`<Stack direction="vertical" gap="4" alignItems="center" />`);
  assert.deepEqual(good.errors, []);

  const bad = validate(`<Stack direction="column" />`);
  assert.equal(bad.errors[0].code, "invalid-keyword-value");
});

test("dynamic values make no claim", () => {
  const r = validate(`<Box p={someVar} display={cond ? "flex" : "hidden"} className={styles.thing} />`);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});

test("components without a props manifest still get universal checks", () => {
  const r = validate(`<CardBody className="astralis:p-40">x</CardBody>`);
  assert.equal(r.errors[0].code, "unknown-class");
});

test("non-astralis elements and components are left alone", () => {
  const r = validate(`<section someProp="x"><MyThing display="blorp" /></section>`, "Box");
  assert.deepEqual(r.errors, []);
});

/* ---- Tier C: the value grammar ------------------------------------------ */

test("a typo'd color token is condemned, not passed through", () => {
  // The Tier A gap, closed: "surfase" typechecks (arbitrary values widened
  // the type) and the runtime would deliver it — into an invalid declaration.
  const r = validate(`<Box bg="surfase" />`);
  assert.equal(r.errors.length, 1);
  assert.equal(r.errors[0].code, "channel-value-invalid");
});

test("typo'd sizing keywords get a did-you-mean", () => {
  const r = validate(`<Box w="fulll" />`);
  assert.equal(r.errors[0].code, "channel-value-invalid");
  assert.ok(r.errors[0].message.includes(`did you mean "full"`));
});

test("keyword typos get a did-you-mean too", () => {
  const r = validate(`<Box display="flxe" />`);
  assert.ok(r.errors[0].message.includes(`did you mean "flex"`));
});

test("a unit that doesn't exist is an error, not a pass-through", () => {
  const r = validate(`<Box p="37pxx" />`);
  assert.equal(r.errors[0].code, "channel-value-invalid");
});

test("valid arbitrary values still make it through the grammar", () => {
  const r = validate(`<Box p="37px" w="calc(100vw - 200px)" h="75dvh" maxW="65ch"
    bg="rebeccapurple" color="#0ea5e9" borderColor="oklch(0.7 0.1 200)"
    m="var(--astralis-spacing-4)" opacity="0.5" order="-1" basis="30%" />`);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});

test("gradients on a color channel explain themselves", () => {
  const r = validate(`<Box bg="linear-gradient(red, blue)" />`);
  assert.equal(r.errors[0].code, "channel-value-invalid");
  assert.ok(r.errors[0].message.includes("backgroundImage"));
});

test("multi-part values make no claim", () => {
  // padding shorthand and layered shadows are valid CSS the grammar cannot
  // (and must not pretend to) decide.
  const r = validate(`<Box p="4px 8px" shadow="0 1px 2px rgba(0,0,0,0.2)" />`);
  assert.deepEqual(r.errors, []);
});

test("shadow identifiers outside none are condemned", () => {
  const r = validate(`<Box shadow="fancy" />`);
  assert.equal(r.errors[0].code, "channel-value-invalid");
});

test("order and opacity reject non-numeric identifiers", () => {
  const r = validate(`<Box order="second" opacity="translucent" />`);
  assert.equal(r.errors.length, 2);
  assert.ok(r.errors.every((e) => e.code === "channel-value-invalid"));
});

test("channel values referencing unknown astralis vars are flagged", () => {
  const bad = validate(`<Box p="var(--astralis-spacing-13)" />`);
  assert.equal(bad.errors[0].code, "unknown-css-variable");

  const own = validate(`<Box p="var(--my-own-var)" />`);
  assert.deepEqual(own.errors, []);
});

/* ---- Tier B: anatomy ------------------------------------------------------ */

test("a part outside its compound root warns, inside is silent", () => {
  const inside = validate(`<Card><Card.Header><Card.Title>t</Card.Title></Card.Header></Card>`);
  assert.deepEqual(inside.warnings, []);

  const outside = validate(`<Box><CardBody>x</CardBody></Box>`, "Box, CardBody");
  assert.equal(outside.warnings[0].code, "part-outside-root");
  assert.ok(outside.warnings[0].message.includes("Card"));
});

test("an explicit Root satisfies the anatomy", () => {
  const r = validate(`<Card.Root><Card.Body>x</Card.Body></Card.Root>`, "Card");
  assert.deepEqual(r.warnings, []);
});

test("namespaced variants and containers are not anatomy children", () => {
  // Input.Password is a standalone composed input; Radio.Group WRAPS radios.
  const r = validate(
    `<Flex><InputPassword /><Radio.Group><Radio value="a" /></Radio.Group></Flex>`,
    "Flex, InputPassword, Radio",
  );
  assert.deepEqual(r.warnings, []);
});

test("detached part subtrees make no claim — composed under foreign structure does", () => {
  // A snippet whose tree is all same-compound parts (Playground content).
  const snippet = validate(
    `<DataList.Item><DataList.Label>k</DataList.Label><DataList.Value>v</DataList.Value></DataList.Item>`,
    "DataList",
  );
  assert.deepEqual(snippet.warnings, []);

  // The same parts under a foreign Box with no root anywhere: the mistake.
  const composed = validate(`<Box><DataList.Item>x</DataList.Item></Box>`, "Box, DataList");
  assert.equal(composed.warnings[0].code, "part-outside-root");
});

test("Tabs triggers and panels must pair by value", () => {
  const broken = validate(`<Tabs defaultValue="a">
    <Tabs.List><Tabs.Trigger value="a">A</Tabs.Trigger><Tabs.Trigger value="b">B</Tabs.Trigger></Tabs.List>
    <Tabs.Content value="a">1</Tabs.Content>
    <Tabs.Content value="c">3</Tabs.Content>
  </Tabs>`, "Tabs");
  assert.equal(broken.errors.length, 1);
  assert.ok(broken.errors[0].message.includes(`"b"`), "the trigger without a panel");
  assert.equal(broken.warnings.filter((w) => w.code === "tabs-value-mismatch").length, 1);

  const ok = validate(`<Tabs defaultValue="a">
    <Tabs.List><Tabs.Trigger value="a">A</Tabs.Trigger></Tabs.List>
    <Tabs.Content value="a">1</Tabs.Content>
  </Tabs>`, "Tabs");
  assert.deepEqual(ok.errors, []);
});

test("a bad Tabs defaultValue is caught; dynamic values silence the check", () => {
  const bad = validate(`<Tabs defaultValue="nope">
    <Tabs.List><Tabs.Trigger value="a">A</Tabs.Trigger></Tabs.List>
    <Tabs.Content value="a">1</Tabs.Content>
  </Tabs>`, "Tabs");
  assert.ok(bad.errors.some((e) => e.message.includes("defaultValue")));

  const dynamic = validate(`<Tabs defaultValue="x">
    <Tabs.List>{items.map((i) => <Tabs.Trigger value={i.id}>{i.label}</Tabs.Trigger>)}</Tabs.List>
    <Tabs.Content value="x">1</Tabs.Content>
  </Tabs>`, "Tabs");
  assert.deepEqual(dynamic.errors, []);
});

/* ---- Tier D: a11y ---------------------------------------------------------- */

test("typo'd aria attributes are errors with a did-you-mean", () => {
  const r = validate(`<Box aria-lable="menu" />`);
  assert.equal(r.errors[0].code, "unknown-aria-attribute");
  assert.ok(r.errors[0].message.includes("aria-label"));
});

test("abstract or invented roles are errors", () => {
  const r = validate(`<div role="botton" />`);
  assert.equal(r.errors[0].code, "invalid-role");
  assert.ok(r.errors[0].message.includes("button"));
});

test("images need a text alternative — including our Image wrapper", () => {
  const bare = validate(`<Image src="x.png" />`, "Image");
  assert.equal(bare.errors[0].code, "missing-alt");

  const img = validate(`<img src="x.png" />`, "Box");
  assert.equal(img.errors[0].code, "missing-alt");

  const fine = validate(`<Image src="x.png" alt="" />`, "Image");
  assert.deepEqual(fine.errors, []);

  const spread = validate(`<Image src="x.png" {...rest} />`, "Image");
  assert.deepEqual(spread.errors, []);
});

test("positive tabIndex warns", () => {
  const r = validate(`<Box tabIndex={3} />`);
  assert.equal(r.warnings[0].code, "positive-tabindex");
});

test("--strict-tokens flags raw colors as drift, off by default", () => {
  const src = `import { Box } from "astralis-ui";\nexport const X = () => (<Box bg="#0ea5e9" p="37px" />);`;
  const loose = validateSource(src, prepared, "test.tsx");
  assert.deepEqual(loose.warnings, []);

  const strict = validateSource(src, prepared, "test.tsx", { strictTokens: true });
  assert.equal(strict.warnings.length, 1);
  assert.equal(strict.warnings[0].code, "off-token-color");
  assert.ok(strict.warnings[0].message.includes("dark mode"));
});

/* ---- recipe props (the d.ts-derived manifest) --------------------------- */

test("recipe props are closed sets: unknown Button variant is an error with a suggestion", () => {
  const r = validate(`<Button variant="primry">go</Button>`);
  assert.equal(r.errors.length, 1);
  assert.equal(r.errors[0].code, "invalid-recipe-value");
  // The near-miss should land on a real variant, and "primary" (the Chakra
  // habit) must NOT silently pass either:
  const chakraism = validate(`<Button variant="primary">go</Button>`);
  assert.equal(chakraism.errors[0].code, "invalid-recipe-value");
});

test("valid recipe values pass, including on dot-access parts", () => {
  const r = validate(
    `<Card variant="filled" size="lg"><Card.Body>ok</Card.Body></Card>`,
  );
  assert.deepEqual(r.errors, []);
});

test("dynamic recipe values make no claim", () => {
  const src = `import { Button } from "astralis-ui";\nexport const X = ({ v }: { v: never }) => (<Button variant={v}>go</Button>);`;
  const r = validateSource(src, prepared, "test.tsx");
  assert.deepEqual(r.errors, []);
});

test("recipe check rides the spec: Alert status typo caught, colorScheme vocabulary enforced", () => {
  const r = validate(`<Alert status="eror">x</Alert>`, "Alert");
  assert.equal(r.errors[0].code, "invalid-recipe-value");
  assert.ok(r.errors[0].message.includes("error")); // the did-you-mean

  const scheme = validate(`<Button colorScheme="magenta">x</Button>`);
  assert.equal(scheme.errors[0].code, "invalid-recipe-value");
});

/* ---- container-query responsive keys ------------------------------------ */

test("container keys (@sm..@xl) are legal responsive keys; typos still caught", () => {
  const ok = validate(`<Box p={{ base: "2", "@md": "6" }} display={{ "@lg": "flex" }} />`);
  assert.deepEqual(ok.errors, []);

  const bad = validate(`<Box p={{ "@mdd": "6" }} />`);
  assert.equal(bad.errors[0].code, "invalid-breakpoint-key");
  assert.ok(bad.errors[0].message.includes("@md"));
});

test("`container` prop is spec-legal as a bare attribute", () => {
  const r = validate(`<Box container><Card>x</Card></Box>`);
  assert.deepEqual(r.errors, []);
});
