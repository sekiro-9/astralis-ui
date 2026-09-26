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
  Link,
} from "astralis-ui";
import { CodeBlock } from "@/modules/docs/code-block";
import type { SiteStats } from "@/lib/site-stats";
import { BentoInteractive, BentoResponsiveCell, BentoSchemeCell } from "./bento-cells";
import { Reveal } from "./reveal";

/**
 * reports/bench-hydration.md, final table: gzipped First Load JS of one bench
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
const BENCH_URL = "https://github.com/SekiroDev360/astralis-ui/tree/main/bench";

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
      className={`flex flex-col hover:-translate-y-1 hover:border-stroke-base hover:shadow-lg ${className}`}
      style={{
        borderRadius: "var(--astralis-border-radius-3xl)",
        background: "var(--astralis-color-surface-subtle)",
      }}
    >
      <CardHeader>
        {/* `style`, not a class: it has to beat Title's own text-base. */}
        <CardTitle style={{ fontSize: "var(--astralis-font-size-sm)" }}>{title}</CardTitle>
        <CardDescription className="mt-1">{body}</CardDescription>
      </CardHeader>
      {children && <CardBody className="flex min-h-0 flex-1 items-center">{children}</CardBody>}
    </Card>
  );
}

export function Bento({ stats }: { stats: SiteStats }) {
  // Live marketing grid: each cell is a real component painting from tokens.
  return (
    <section className="mx-auto max-w-screen-xl px-6 py-24 lg:px-12 lg:py-28">
      <Reveal>
        <h2 className="font-display text-balance text-4xl font-semibold tracking-tight text-label">
          Built on tokens, not guesses
        </h2>
        <p className="mt-4 text-balance text-lg text-label-muted lg:whitespace-nowrap">
          Every cell below is live: the same components and tokens you’d ship.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="w-full font-mono text-[13px]">
            <CodeBlock code={`pnpm add astralis-ui`} lang="bash" />
          </div>
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
          <figure className="flex w-full flex-col gap-2 font-mono text-[12px]">
            {BENCH.map((row) => (
              <div key={row.name} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-label-muted">{row.name}</span>
                <span
                  className={`h-2.5 rounded-full ${row.self ? "bg-brand-solid" : "bg-surface-muted"}`}
                  style={{ width: `${(row.kb / BENCH_MAX) * 100}%` }}
                />
                <span className="shrink-0 text-label-muted">{row.kb.toFixed(1)} kB</span>
              </div>
            ))}
            <figcaption className="mt-1 font-sans text-[11px] leading-snug text-label-subtle">
              Gzipped, over bare Next.js 16.3 and React 19.2, production build.{" "}
              <Link href={BENCH_URL} external colorScheme="gray" variant="underline">
                Method and pages
              </Link>
            </figcaption>
          </figure>
        </Cell>

        <Cell
          title="Design tokens end to end"
          body="Named roles resolve per theme; components never see a hex."
          className="lg:col-span-2"
        >
          {/* Label/value pairs: DataList is exactly this, and it renders the
              proper <dl>/<dt>/<dd> the hand-rolled <ul> never did. */}
          <DataList size="sm" className="w-full font-mono">
            {tokenRows.map((row) => (
              <DataListItem
                key={row.token}
                className="items-center justify-between border-b border-stroke-base pb-2 last:border-b-0 last:pb-0"
              >
                {/* Overrides the horizontal Label's fixed w-40, which would crop
                    these long token names. */}
                <DataListLabel className="truncate" style={{ width: "auto", flex: "1 1 0%" }}>
                  {row.token}
                </DataListLabel>
                <DataListValue className="flex items-center gap-1.5" style={{ flex: "none" }}>
                  <span
                    className="size-3.5 rounded-full border border-stroke-base"
                    style={{ backgroundColor: row.light }}
                  />
                  <span
                    className="size-3.5 rounded-full border border-stroke-base"
                    style={{ backgroundColor: row.dark }}
                  />
                </DataListValue>
              </DataListItem>
            ))}
          </DataList>
        </Cell>
      </div>
    </section>
  );
}
