import { Badge, Box, Card, Flex, Heading, Stack, Text } from "astralis-ui";

const CARDS = [
  { name: "Starter", delay: undefined },
  { name: "Team", delay: "100" },
  { name: "Business", delay: "200" },
] as const;

const MODES = [
  { mode: "scroll", title: "Scroll-linked", note: "Fades back out as you scroll it down again." },
  { mode: "once", title: "Once", note: "Plays the first time, then stays." },
] as const;

// No "use client": a Server Component. animationDelay staggers the cards along
// the scroll, and revealMode="once" plays them once, with no JavaScript.
export function AnimationRevealStagger() {
  return (
    <Box w="full" h="80" overflowY="auto" rounded="lg" border="normal" borderColor="base" p="4">
      <Stack gap="32">
        <Text size="sm" color="muted">
          Scroll this box, then scroll back up.
        </Text>
        {MODES.map(({ mode, title, note }) => (
          <Stack key={mode} gap="3">
            <Heading size="sm">{title}</Heading>
            <Flex gap="3" direction={{ base: "column", md: "row" }}>
              {CARDS.map((card) => (
                <Card
                  key={card.name}
                  reveal="fade-up"
                  revealMode={mode}
                  animationDelay={card.delay}
                  animationDistance="lg"
                  variant="outline"
                  flex="1"
                >
                  <Card.Body>
                    <Stack gap="2" alignItems="start">
                      <Badge variant="subtle">{card.name}</Badge>
                      <Text size="sm" color="muted">
                        {card.delay ? `animationDelay="${card.delay}"` : "no delay"}
                      </Text>
                    </Stack>
                  </Card.Body>
                </Card>
              ))}
            </Flex>
            <Text size="sm" color="muted">
              {note}
            </Text>
          </Stack>
        ))}
        <Box h="40" />
      </Stack>
    </Box>
  );
}
