import type { ReactNode } from "react";
import NextLink from "next/link";
import { Box, Button, Flex, Grid, Heading, Link, Stack, Tag, Text } from "astralis-ui";
import { Check, MousePointer2, Server } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionLead, SectionTitle } from "./section-title";
import styles from "./why.module.css";

/*
 * The illustrations are drawn from Box, Flex and Text and animated by
 * why.module.css. They are decoration: each is hidden from assistive
 * technology, and the card's heading and paragraph carry the meaning.
 * 11px and 12px sit off the type scale, so that type is set with classes.
 */

/** A page arriving from the server as finished HTML, with the JavaScript count at zero. */
function ServerFirstArt() {
  return (
    <Flex alignItems="center" gap="3" w="full" maxW="sm">
      <Stack alignItems="center" gap="2" shrink="0">
        <Flex size="11" alignItems="center" justifyContent="center" rounded="xl" border="normal" borderColor="base" bg="subtle" color="muted">
          <Server size={18} aria-hidden="true" />
        </Flex>
        <Box color="subtle" className="font-mono text-[11px]">server</Box>
      </Stack>

      <Flex alignItems="center" gap="2" flex="1" minW="0">
        <Box flex="1" borderT="normal" borderStyle="dashed" borderColor="control" />
        <Tag size="sm" variant="subtle" colorScheme="brand" className={styles.packet}>HTML</Tag>
        <Box flex="1" borderT="normal" borderStyle="dashed" borderColor="control" />
      </Flex>

      <Box w="44" minW="0" rounded="xl" border="normal" borderColor="base" bg="subtle" overflow="hidden" shadow="sm">
        <Flex gap="1" px="2.5" py="2" borderB="normal" borderColor="base">
          <Box size="1.5" rounded="full" bg="muted" />
          <Box size="1.5" rounded="full" bg="muted" />
          <Box size="1.5" rounded="full" bg="muted" />
        </Flex>
        <Stack gap="2" p="3">
          <Box h="2.5" w="3/4" rounded="full" bg="muted" className={styles.line} />
          <Box h="2" w="full" rounded="full" bg="muted" className={styles.line} />
          <Box h="2" w="2/3" rounded="full" bg="muted" className={styles.line} />
          <Flex gap="2" className={styles.line}>
            <Box h="6" flex="1" rounded="md" bg="brand-solid" />
            <Box h="6" flex="1" rounded="md" bg="muted" />
          </Flex>
          <Flex justifyContent="between" alignItems="center" className={styles.line}>
            <Box color="subtle" className="font-mono text-[11px]">JavaScript</Box>
            <Tag size="sm" variant="solid" colorScheme="brand" className={styles.zero}>0 kB</Tag>
          </Flex>
        </Stack>
      </Box>
    </Flex>
  );
}

/** A component picked on the page, and what DevTools says about it. */
function DevToolsArt() {
  const rows = [
    ["variant", '"solid"'],
    ["size", '"md"'],
    ["rounded", '"lg"'],
  ];
  return (
    <Flex alignItems="center" justifyContent="center" gap="5" w="full">
      <Box position="relative" shrink="0">
        <Box position="absolute" rounded="xl" className={styles.ring} style={{ inset: "-8px" }} />
        <Box position="relative">
          {/* Inert: a picture of a button, not one to press. */}
          <Button size="sm" tabIndex={-1} className="pointer-events-none">Deploy</Button>
        </Box>
        <Box position="absolute" color="base" className={styles.cursor} style={{ right: "-14px", bottom: "-18px" }}>
          <MousePointer2 size={20} fill="currentColor" aria-hidden="true" />
        </Box>
      </Box>

      <Box w="44" minW="0" rounded="xl" border="normal" borderColor="base" bg="subtle" shadow="lg" className={styles.panel}>
        <Flex alignItems="center" justifyContent="between" gap="2" px="3" py="2.5" borderB="normal" borderColor="base">
          <Text as="span" size="sm" weight="semibold">Button</Text>
          <Tag size="sm" variant="subtle" colorScheme="green">server</Tag>
        </Flex>
        <Stack gap="1.5" px="3" py="2.5" className="font-mono text-[12px]">
          <Box color="subtle" className={styles.row}>props</Box>
          {rows.map(([name, value]) => (
            <Flex key={name} justifyContent="between" gap="3" className={styles.row}>
              <Box color="muted">{name}</Box>
              <Box color="brand-label">{value}</Box>
            </Flex>
          ))}
        </Stack>
      </Box>
    </Flex>
  );
}

/** The setup a project skips, struck through, and the one line it writes. */
function NoBuildArt() {
  const skipped = ["style config", "CSS plugin", "style engine"];
  return (
    <Stack gap="4" w="full" maxW="sm">
      <Flex wrap="wrap" gap="3" justifyContent="center" color="subtle" className="font-mono text-[12px]">
        {skipped.map((step) => (
          <Box key={step} as="span" className={styles.strike}>{step}</Box>
        ))}
      </Flex>
      <Box rounded="xl" border="normal" borderColor="base" bg="subtle" shadow="sm" overflow="hidden">
        <Flex gap="1" px="3" py="2" borderB="normal" borderColor="base">
          <Box size="1.5" rounded="full" bg="muted" />
          <Box size="1.5" rounded="full" bg="muted" />
          <Box size="1.5" rounded="full" bg="muted" />
        </Flex>
        <Box px="3.5" py="3" className="font-mono text-[12px]" whiteSpace="nowrap" overflow="hidden">
          <Box as="span" color="brand-label">import</Box>{" "}
          <Box as="span" color="base">&quot;astralis-ui/styles.css&quot;</Box>
          <Box as="span" color="brand-label" className={styles.caret}>▍</Box>
        </Box>
        <Flex alignItems="center" gap="2" px="3.5" py="2.5" borderT="normal" borderColor="base">
          <Flex size="4" alignItems="center" justifyContent="center" rounded="full" bg="green-solid" color="white" className={styles.ready}>
            <Check size={11} strokeWidth={3.5} aria-hidden="true" />
          </Flex>
          <Text as="span" size="xs" color="muted">Every prop works. Nothing else to run.</Text>
        </Flex>
      </Box>
    </Stack>
  );
}

function Reason({
  art,
  title,
  href,
  link,
  children,
}: {
  art: ReactNode;
  title: string;
  href: string;
  link: string;
  children: ReactNode;
}) {
  return (
    <Stack
      as="article"
      gap="0"
      h="full"
      rounded="3xl"
      border="normal"
      borderColor="base"
      overflow="clip"
      transition="common"
      hover={{ translateY: "-1", shadow: "xl", borderColor: "brand-stroke" }}
      className={styles.card}
    >
      <Box position="relative" borderB="normal" borderColor="base" className={styles.art} aria-hidden="true">
        <Box position="absolute" inset="0" className={styles.dots} />
        <Flex position="relative" alignItems="center" justifyContent="center" px={{ base: "5", sm: "6" }} minH="60" py="8">
          {art}
        </Flex>
      </Box>
      <Stack gap="3" p="7" flex="1">
        <Heading as="h3" size="xl" weight="semibold" lineHeight="size" color="base">
          {title}
        </Heading>
        <Text size="sm" color="muted" lineHeight="relaxed">
          {children}
        </Text>
        <Link as={NextLink} href={href} mt="auto" alignSelf="start" size="sm" weight="medium">
          {link} →
        </Link>
      </Stack>
    </Stack>
  );
}

export function Why() {
  return (
    <Box as="section" mx="auto" maxW="7xl" px={{ base: "6", lg: "12" }} py={{ base: "24", lg: "28" }}>
      <Reveal>
        <SectionTitle>Why Astralis</SectionTitle>
        <SectionLead>Fast pages, components you can see, and nothing to set up.</SectionLead>
      </Reveal>

      <Grid mt="14" gap="5" columns={{ lg: "3" }}>
        <Reveal className="h-full min-w-0">
          <Reason art={<ServerFirstArt />} title="Static parts send no JavaScript" href="/docs" link="Read the introduction">
            Cards, tables, text and buttons render on the server and reach the browser as plain HTML. Only the
            parts people interact with bring JavaScript.
          </Reason>
        </Reveal>
        <Reveal delay={0.08} className="h-full min-w-0">
          <Reason art={<DevToolsArt />} title="DevTools that know your components" href="/docs/devtools" link="Set up DevTools">
            Click anything on the page to see which component it is, the props it was given and every prop it
            takes, while you build.
          </Reason>
        </Reveal>
        <Reveal delay={0.16} className="h-full min-w-0">
          <Reason art={<NoBuildArt />} title="No extra build step" href="/docs/installation" link="Installation guide">
            The styles ship ready-made. Install the package, import one stylesheet, and every prop works.
          </Reason>
        </Reveal>
      </Grid>
    </Box>
  );
}
