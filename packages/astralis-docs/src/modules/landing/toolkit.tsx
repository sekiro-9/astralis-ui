import Link from "next/link";
import { Card, CardBody, Text } from "astralis-ui";
import { Bot, Bug, LayoutTemplate, MousePointerClick, Palette, TerminalSquare } from "lucide-react";
import { Reveal } from "./reveal";

export function Toolkit({ blocks }: { blocks: number }) {
  const tools = [
    {
      icon: TerminalSquare,
      title: "Start in one command",
      body: "The CLI scaffolds a Next.js or Vite project, or adds Astralis to one you already have.",
      href: "/docs/cli",
    },
    {
      icon: LayoutTemplate,
      title: `${blocks} ready-made blocks`,
      body: "Heroes, pricing, sign-in, FAQs and more, copied into your project as code you own.",
      href: "/blocks",
    },
    {
      icon: Palette,
      title: "Design your theme visually",
      body: "Pick colours, fonts and radii in the theme builder, watch every component follow, then export.",
      href: "/theme-builder",
    },
    {
      icon: Bot,
      title: "Your AI assistant knows it",
      body: "Connect Claude Code, Cursor or Codex, and it writes Astralis code from the real docs, then checks it.",
      href: "/docs/ai-agents",
    },
    {
      icon: MousePointerClick,
      title: "See components on the page",
      body: "DevTools show which components a page is built from and flag mistakes while you work.",
      href: "/docs/devtools",
    },
    {
      icon: Bug,
      title: "Report a problem in one click",
      body: "Send a bug to the maintainers with everything they need to reproduce it, and follow the fix.",
      href: "/issues",
    },
  ];

  return (
    <section className="mx-auto max-w-screen-xl px-6 py-24 lg:px-12 lg:py-28">
      <Reveal>
        <h2 className="font-display text-balance text-4xl font-semibold tracking-tight text-label">
          More than components
        </h2>
        <p className="mt-4 text-balance text-lg text-label-muted lg:whitespace-nowrap">
          Everything around the library helps you go from idea to shipped page faster.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => (
          <Reveal key={tool.title} delay={i * 0.05} className="h-full">
            <Link
              href={tool.href}
              className="block h-full rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ring"
            >
              <Card
                variant="outline"
                size="lg"
                hoverable
                className="h-full"
                style={{
                  borderRadius: "var(--astralis-border-radius-3xl)",
                  background: "var(--astralis-color-surface-subtle)",
                }}
              >
                <CardBody className="flex flex-col gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent-subtle text-accent-label">
                    <tool.icon size={18} aria-hidden="true" />
                  </span>
                  <h3 className="font-display mt-2 text-lg font-semibold tracking-tight text-label">
                    {tool.title}
                  </h3>
                  <Text as="p" size="sm" color="muted" className="leading-relaxed">
                    {tool.body}
                  </Text>
                </CardBody>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
