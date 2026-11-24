import Link from "next/link";
import { Box, Card, CardBody, Flex, Grid, Heading, Stack, Text } from "astralis-ui";
import { Bot, LayoutTemplate, MousePointerClick, Palette, ShieldCheck, TerminalSquare } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionLead, SectionTitle } from "./section-title";

export function Toolkit({ blocks }: { blocks: number }) {
  const tools = [
    {
      icon: TerminalSquare,
      title: "Start in one command",
      body: "The CLI scaffolds a Next.js or Vite project, or adds Astralis to one you already have.",
      href: "/docs/cli",
      link: "Read the CLI guide",
    },
    {
      icon: LayoutTemplate,
      title: `${blocks} ready-made blocks`,
      body: "Heroes, pricing, sign-in, FAQs and more, copied into your project as code you own.",
      href: "/blocks",
      link: "Browse the blocks",
    },
    {
      icon: Palette,
      title: "Design your theme visually",
      body: "Pick colours, fonts and radii in the theme builder, watch every component follow, then export.",
      href: "/theme-builder",
      link: "Open the theme builder",
    },
    {
      icon: Bot,
      title: "Your AI assistant knows it",
      body: "Connect Claude Code, Cursor or Codex, and it writes Astralis code from the real docs, then checks it.",
      href: "/docs/ai-agents",
      link: "Connect your assistant",
    },
    {
      icon: MousePointerClick,
      title: "See components on the page",
      body: "DevTools show which components a page is built from and flag mistakes while you work.",
      href: "/docs/devtools",
      link: "Set up DevTools",
    },
    {
      icon: ShieldCheck,
      title: "Checked on every pull request",
      body: "Run the validator in CI, so every pull request uses the design system the way it was meant.",
      href: "/docs/validate-in-ci",
      link: "Add the check to CI",
    },
  ];

  return (
    <Box as="section" mx="auto" maxW="7xl" px={{ base: "6", lg: "12" }} py={{ base: "24", lg: "28" }}>
      <Reveal>
        <SectionTitle>More than components</SectionTitle>
        <SectionLead>Everything around the library helps you go from idea to shipped page faster.</SectionLead>
      </Reveal>

      <Grid mt="14" gap="5" columns={{ sm: "2", lg: "3" }}>
        {tools.map((tool, i) => (
          <Reveal key={tool.title} delay={i * 0.05} className="h-full">
            <Box
              as={Link}
              href={tool.href}
              display="block"
              h="full"
              rounded="3xl"
              // A focus outline has no prop.
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ring"
            >
              <Card
                variant="outline"
                size="lg"
                hoverable
                h="full"
                // Card takes no radius or background prop.
                style={{
                  borderRadius: "var(--astralis-border-radius-3xl)",
                  background: "var(--astralis-color-surface-subtle)",
                }}
              >
                <CardBody h="full">
                  <Stack gap="3" h="full">
                    <Flex
                      as="span"
                      size="10"
                      alignItems="center"
                      justifyContent="center"
                      rounded="xl"
                      bg="brand-subtle"
                      color="brand-label"
                    >
                      <tool.icon size={18} aria-hidden="true" />
                    </Flex>
                    <Heading as="h3" mt="2" size="lg" weight="semibold" lineHeight="size" color="base">
                      {tool.title}
                    </Heading>
                    <Text size="sm" color="muted" lineHeight="relaxed">
                      {tool.body}
                    </Text>
                    {/* The whole card is the link; this line says where it goes. */}
                    <Text as="span" mt="auto" size="sm" weight="medium" color="brand-label">
                      {tool.link} →
                    </Text>
                  </Stack>
                </CardBody>
              </Card>
            </Box>
          </Reveal>
        ))}
      </Grid>
    </Box>
  );
}
