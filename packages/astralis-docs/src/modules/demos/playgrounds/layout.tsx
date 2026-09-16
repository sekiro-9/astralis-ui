import {
  AspectRatio,
  Badge,
  Box,
  Center,
  Container,
  Flex,
  Float,
  Grid,
  Image,
  ScrollArea,
  Separator,
  Splitter,
  Stack,
  Text,
  VStack,
} from "astralis-ui";
import { aspectRatioProps } from "../aspect-ratio/aspect-ratio-props";
import { boxProps } from "../box/box-props";
import { containerProps } from "../container/container-props";
import { flexProps } from "../flex/flex-props";
import { floatProps } from "../float/float-props";
import { gridProps } from "../grid/grid-props";
import { scrollAreaProps } from "../scroll-area/scroll-area-props";
import { separatorProps } from "../separator/separator-props";
import { splitterProps } from "../splitter/splitter-props";
import { stackProps } from "../stack/stack-props";
import { asEntry, definePlaygrounds } from "./define";

/* The layout primitives are configured almost entirely by style props, which no
   props table documents one row at a time, so `styleProps` carries a curated
   subset rather than the whole Box vocabulary, which would be a wall of
   pickers rather than a playground. */

const threeTiles = (
  <>
    <Box p="4" bg="subtle" rounded="md">
      One
    </Box>
    <Box p="4" bg="subtle" rounded="md">
      Two
    </Box>
    <Box p="4" bg="subtle" rounded="md">
      Three
    </Box>
  </>
);

export const layoutPlaygrounds = definePlaygrounds({
  "box-demo": {
    tag: "Box",
    component: asEntry(Box),
    rows: boxProps,
    styleTokens: "box",
    styleProps: ["p", "bg", "rounded", "w", "border", "borderColor", "shadow"],
    fixture: "Box content",
  },
  "flex-demo": {
    tag: "Flex",
    component: asEntry(Flex),
    rows: flexProps,
    styleTokens: "flex",
    styleProps: ["direction", "justifyContent", "alignItems", "gap", "wrap", "p"],
    fixture: threeTiles,
  },
  "grid-demo": {
    tag: "Grid",
    component: asEntry(Grid),
    rows: gridProps,
    styleTokens: "grid",
    styleProps: ["columns", "gap", "rowGap", "columnGap", "alignItems", "p"],
    baseProps: { columns: "3" },
    fixture: threeTiles,
  },
  "stack-demo": {
    tag: "Stack",
    component: asEntry(Stack),
    rows: stackProps,
    /* Stack renders a Flex, so it accepts the same vocabulary. */
    styleTokens: "flex",
    styleProps: ["gap", "alignItems", "justifyContent", "p"],
    fixture: threeTiles,
  },
  /* Center documents no props of its own; everything it does is Box's. A
     style control would override a base prop of the same name with "unset",
     so the two lists never share a prop. */
  "center-demo": {
    tag: "Center",
    component: asEntry(Center),
    rows: [],
    styleTokens: "box",
    styleProps: ["h", "w", "rounded", "p"],
    baseProps: { bg: "brand-subtle" },
    fixture: <Text size="sm">Centered on both axes</Text>,
  },
  "container-demo": {
    tag: "Container",
    component: asEntry(Container),
    rows: containerProps,
    styleTokens: "box",
    styleProps: ["maxW", "px"],
    baseProps: { bg: "subtle", py: "5", rounded: "lg" },
    fixture: (
      <>
        <Text size="sm" weight="semibold">
          Centered content
        </Text>
        <Text size="sm" color="muted">
          The width is capped and the gutters stay on small screens.
        </Text>
      </>
    ),
  },
  "aspect-ratio-demo": {
    tag: "AspectRatio",
    component: asEntry(AspectRatio),
    rows: aspectRatioProps,
    baseProps: { rounded: "xl", overflow: "hidden" },
    fixture: <Image src="/placeholder.svg" alt="A starfield gradient" />,
  },
  /* The canvas is the positioned parent here, so the badge moves between its
     corners and edges as you change the placement. */
  "float-demo": {
    tag: "Float",
    component: asEntry(Float),
    rows: floatProps,
    fixture: <Badge colorScheme="red">3 new</Badge>,
  },
  /* A scroll area needs a bounded height to scroll at all, and content wider
     than the canvas for the horizontal directions to show anything. */
  "scroll-area-demo": {
    tag: "ScrollArea",
    component: asEntry(ScrollArea),
    rows: scrollAreaProps,
    baseProps: { style: { height: "10rem" } },
    fixture: (
      <VStack gap="3" p="3" w="xl" alignItems="stretch">
        <Text size="sm">Release note 01: a line wide enough to scroll sideways</Text>
        <Text size="sm">Release note 02: a line wide enough to scroll sideways</Text>
        <Text size="sm">Release note 03: a line wide enough to scroll sideways</Text>
        <Text size="sm">Release note 04: a line wide enough to scroll sideways</Text>
        <Text size="sm">Release note 05: a line wide enough to scroll sideways</Text>
        <Text size="sm">Release note 06: a line wide enough to scroll sideways</Text>
        <Text size="sm">Release note 07: a line wide enough to scroll sideways</Text>
      </VStack>
    ),
  },
  "splitter-demo": {
    tag: "Splitter",
    component: asEntry(Splitter),
    rows: splitterProps,
    baseProps: { style: { height: "10rem" } },
    fixture: (
      <>
        <Splitter.Panel>
          <Center h="full" bg="subtle">
            <Text size="sm" color="muted">
              First
            </Text>
          </Center>
        </Splitter.Panel>
        <Splitter.Handle aria-label="Resize panels" />
        <Splitter.Panel>
          <Center h="full">
            <Text size="sm" color="muted">
              Second
            </Text>
          </Center>
        </Splitter.Panel>
      </>
    ),
  },
  "separator-demo": { tag: "Separator", component: asEntry(Separator), rows: separatorProps },
});
