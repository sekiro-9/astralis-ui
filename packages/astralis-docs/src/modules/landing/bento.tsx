import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  DataList,
  DataListItem,
  DataListLabel,
  DataListValue,
  Box,
  Flex,
  Grid,
  Stack,
  Link,
} from "astralis-ui";
import { CodeBlock } from "@/modules/docs/code-block";
import type { SiteStats } from "@/lib/site-stats";
import { BentoInteractive, BentoResponsiveCell, BentoSchemeCell } from "./bento-cells";
import { Reveal } from "./reveal";
import { SectionLead, SectionTitle } from "./section-title";

/**
 * astralis-bench, results/simple-bench.md: gzipped First Load JS of one bench
 * page per library, minus the bare-framework floor. Re-measure there first.
 */
const BENCH = [
  { name: "Astralis", kb: 15.1, self: true },
  { name: "shadcn/ui", kb: 36.0, self: false },
  { name: "Radix Themes", kb: 41.4, self: false },
  { name: "MUI", kb: 58.0, self: false },
  { name: "Chakra", kb: 94.5, self: false },
];
const BENCH_MAX = Math.max(...BENCH.map((row) => row.kb));
const BENCH_URL = "https://github.com/sekiro-9/astralis-bench";

const tokenRows = [
  { token: "--astralis-color-surface-base", light: "#ffffff", dark: "#000000" },
  { token: "--astralis-color-label-base", light: "#09090b", dark: "#fafafa" },
  { token: "--astralis-color-accent-solid", light: "#8b5cf6", dark: "#8b5cf6" },
  { token: "--astralis-color-stroke-subtle", light: "#f4f4f5", dark: "#18181b" },
];

function Cell({
  title,
  body,
  className = "",
  children,
}: {
  title: string;
  body: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    /*
     * Not `hoverable`: that prop means "this card is clickable" and brings
     * cursor-pointer + active:scale-95 with it. These cells lift on hover as
     * decoration only, so the lift stays a class and the semantics stay honest.
     */
    <Card
      variant="outline"
      size="lg"
      className={`flex flex-col hover:-translate-y-1 hover:shadow-lg ${className}`}
      style={{
        borderRadius: "var(--astralis-border-radius-3xl)",
        background: "var(--astralis-color-surface-subtle)",
      }}
    >
      <CardHeader>
        {/* `style`, not a class: it has to beat Title's own text-base. */}
        <CardTitle style={{ fontSize: "var(--astralis-font-size-sm)" }}>{title}</CardTitle>
        <CardDescription mt="1">{body}</CardDescription>
      </CardHeader>
      {children && <CardBody display="flex" minH="0" flex="1" className="items-center">{children}</CardBody>}
    </Card>
  );
}

export function Bento({ stats }: { stats: SiteStats }) {
  // Live marketing grid: each cell is a real component painting from tokens.
  return (
    <Box as="section" mx="auto" maxW="7xl" px={{ base: "6", lg: "12" }} py={{ base: "24", lg: "28" }}>
      <Reveal>
        <SectionTitle>Built on tokens, not guesses</SectionTitle>
        <SectionLead>Every cell below is live: the same components and tokens you’d ship.</SectionLead>
      </Reveal>

      <Grid mt="14" gap="5" columns={{ sm: "2", lg: "4" }}>
        <Cell
          title="Dark mode built in"
          body="Semantic tokens flip with one class on the root. Flip it now:"
          className="lg:col-span-1"
        >
          <BentoInteractive />
        </Cell>

        <Cell
          title={`${stats.hues} hues, ${stats.statusAliases} status aliases`}
          body="One accent channel recolors any component, with no per-hue CSS."
          className="lg:col-span-2"
        >
          <BentoSchemeCell />
        </Cell>

        <Cell
          title="Zero build step"
          body="Precompiled CSS. No plugins, no config: your bundler just serves a stylesheet."
        >
          {/* 13px sits off the type scale. */}
          <Box w="full" className="font-mono text-[13px]">
            <CodeBlock code={`pnpm add astralis-ui`} lang="bash" />
          </Box>
        </Cell>

        <Cell
          title="Responsive props"
          body="Breakpoint maps on every style prop. Resize the window."
          className="lg:col-span-2"
        >
          <BentoResponsiveCell />
        </Cell>

        <Cell
          title="Static parts ship zero JavaScript"
          body="Every static component is a true Server Component, enforced at build time and labeled on every docs page. The same page in five libraries, and the client JS each adds:"
          className="lg:col-span-2"
        >
          {/* Static markup on purpose: the cell about shipping no JS ships none. */}
          {/* 12px and 11px sit off the type scale, so the figure's type is set with classes. */}
          <Stack as="figure" w="full" gap="2" className="font-mono text-[12px]">
            {BENCH.map((row) => (
              <Flex key={row.name} alignItems="center" gap="2">
                <Box as="span" w="24" shrink="0" color="muted">{row.name}</Box>
                <Box
                  as="span"
                  h="2.5"
                  rounded="full"
                  bg={row.self ? "brand-solid" : "muted"}
                  w={`${(row.kb / BENCH_MAX) * 100}%`}
                />
                <Box as="span" shrink="0" color="muted">{row.kb.toFixed(1)} kB</Box>
              </Flex>
            ))}
            <Box as="figcaption" mt="1" color="subtle" className="font-sans text-[11px] leading-snug">
              Gzipped, over bare Next.js 16.3 and React 19.2, production build.{" "}
              <Link href={BENCH_URL} external colorScheme="gray" variant="underline">
                Method and pages
              </Link>
            </Box>
          </Stack>
        </Cell>

        <Cell
          title="Design tokens end to end"
          body="Named roles resolve per theme; components never see a hex."
          className="lg:col-span-2"
        >
          {/* Label/value pairs: DataList is exactly this, and it renders the
              proper <dl>/<dt>/<dd> the hand-rolled <ul> never did. */}
          <DataList size="sm" w="full" className="font-mono">
            {tokenRows.map((row) => (
              <DataListItem
                key={row.token}
                className="items-center justify-between border-b border-stroke pb-2 last:border-b-0 last:pb-0"
              >
                {/* Overrides the horizontal Label's fixed w-40, which would crop
                    these long token names. */}
                <DataListLabel w="auto" flex="1" className="truncate">
                  {row.token}
                </DataListLabel>
                <DataListValue display="flex" flex="none" className="items-center gap-1.5">
                  <Box as="span" size="3.5" rounded="full" border="normal" borderColor="base" bg={row.light} />
                  <Box as="span" size="3.5" rounded="full" border="normal" borderColor="base" bg={row.dark} />
                </DataListValue>
              </DataListItem>
            ))}
          </DataList>
        </Cell>
      </Grid>
    </Box>
  );
}
