import { Card, CardHeader, CardTitle, CardDescription, CardBody, Box, Flex, Grid, Stack, Link } from "astralis-ui";
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
  { name: "Astralis", kb: 10.3, self: true },
  { name: "shadcn/ui", kb: 36.0, self: false },
  { name: "Radix Themes", kb: 41.4, self: false },
  { name: "MUI", kb: 58.0, self: false },
  { name: "Chakra", kb: 94.5, self: false },
];
const BENCH_MAX = Math.max(...BENCH.map((row) => row.kb));
const BENCH_URL = "https://github.com/sekiro-9/astralis-bench";

function Cell({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
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
      className="flex flex-col hover:-translate-y-1 hover:shadow-lg"
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
  return (
    <Box as="section" mx="auto" maxW="7xl" px={{ base: "6", lg: "12" }} py={{ base: "24", lg: "28" }}>
      <Reveal>
        <SectionTitle>Why Astralis</SectionTitle>
        <SectionLead>Less JavaScript, any style value, and nothing to set up.</SectionLead>
      </Reveal>

      <Grid mt="14" gap="5" columns={{ md: "2" }}>
        <Cell
          title="Static parts send no JavaScript"
          body="Static components render on the server and arrive as plain HTML. The same page in five libraries, and the JavaScript each adds:"
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
              Gzipped, over bare Next.js 16.3, production build.{" "}
              <Link href={BENCH_URL} external colorScheme="gray" variant="underline">
                Method and pages
              </Link>
            </Box>
          </Stack>
        </Cell>

        <Cell
          title="Dark mode and colour schemes"
          body={`Every component follows the mode you pick, and takes any of ${stats.hues} colours.`}
        >
          <Stack gap="5" alignItems="start">
            <BentoInteractive />
            <BentoSchemeCell />
          </Stack>
        </Cell>

        <Cell title="No build step" body="The styles arrive as one ready-made stylesheet. There is nothing to configure.">
          {/* 13px sits off the type scale. */}
          <Box w="full" className="font-mono text-[13px]">
            <CodeBlock code={`pnpm add astralis-ui`} lang="bash" />
          </Box>
        </Cell>

        <Cell title="Responsive props" body="Give any style prop a value for each screen size. Resize the window to see it.">
          <BentoResponsiveCell />
        </Cell>
      </Grid>
    </Box>
  );
}
