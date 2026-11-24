import fs from "fs";
import path from "path";
import { demos } from "@/modules/demos";
import { CodeBlock } from "@/modules/docs/code-block";
import { CodeResultSwitcher } from "./code-result-switcher";
import { Box } from "astralis-ui";
import { Reveal } from "./reveal";
import { SectionLead, SectionTitle } from "./section-title";

const examples = [
  { key: "field-error", title: "Forms", blurb: "One invalid flag restyles the field and swaps the message." },
  { key: "button-loading", title: "Async actions", blurb: "Loading states without layout shift." },
  { key: "grid-responsive", title: "Responsive", blurb: "Breakpoint maps instead of media queries." },
] as const;

/* The code shown is the exact demo source rendered next to it, read from disk. */
export function CodeResult() {
  const panels = examples.map(({ key, title, blurb }) => {
    const demo = demos[key];
    const source = fs.readFileSync(
      path.join(process.cwd(), "src", "modules", "demos", demo.file),
      "utf8",
    );
    const Demo = demo.component;
    return {
      title,
      blurb,
      code: <CodeBlock code={source} lang="tsx" />,
      preview: <Demo />,
    };
  });

  return (
    <Box as="section" mx="auto" maxW="7xl" px={{ base: "6", lg: "12" }} py={{ base: "28", lg: "36" }}>
      <Reveal>
        <SectionTitle>What the code looks like</SectionTitle>
        <SectionLead>Forms, loading states and responsive layout, in a few lines each.</SectionLead>
      </Reveal>
      <Reveal delay={0.1}>
        <Box mt="12">
          <CodeResultSwitcher panels={panels} />
        </Box>
      </Reveal>
    </Box>
  );
}
