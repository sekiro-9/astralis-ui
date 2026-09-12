import { Hero } from "@/modules/landing/hero";
import { Bento } from "@/modules/landing/bento";
import { Showcase } from "@/modules/landing/showcase";
import { CodeResult } from "@/modules/landing/code-result";
import { StatsStrip } from "@/modules/landing/stats-strip";
import { FinalCta } from "@/modules/landing/final-cta";
import { Footer } from "@/modules/landing/footer";
import { siteStats } from "@/lib/site-stats";

export default function Home() {
  return (
    <>
      <Hero components={siteStats.components} />
      <Bento stats={siteStats} />
      <Showcase components={siteStats.components} version={siteStats.version} />
      <CodeResult />
      <StatsStrip stats={siteStats} />
      <FinalCta />
      <Footer version={siteStats.version} />
    </>
  );
}
