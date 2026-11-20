import Link from "next/link";
import { Box, Card, CardBody, Flex, Grid, Stack, Text } from "astralis-ui";
import { Bot, Bug, LayoutTemplate, MousePointerClick, Palette, TerminalSquare } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionLead, SectionTitle } from "./section-title";

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
                <CardBody>
                  <Stack gap="3">
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
                    <Text as="h3" mt="2" fontFamily="heading" size="lg" weight="semibold" letterSpacing="tight" color="base">
                      {tool.title}
                    </Text>
                    <Text size="sm" color="muted" lineHeight="relaxed">
                      {tool.body}
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
