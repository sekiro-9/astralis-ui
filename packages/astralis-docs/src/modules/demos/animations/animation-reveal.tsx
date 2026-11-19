import { Box, Card, Heading, Stack, Text } from "astralis-ui";

const STEPS = [
  { reveal: "fade-up", title: "Design", body: "Tokens set the colours, spacing and type." },
  { reveal: "slide-left", title: "Build", body: "Components render on the server." },
  { reveal: "scale-in", title: "Check", body: "The validator reads every prop." },
  { reveal: "blur-in", title: "Ship", body: "The gates run on every build." },
  { reveal: "slide-right", title: "Learn", body: "Reports come back with evidence." },
] as const;

// No "use client": this demo is a Server Component. Each card animates as it
// scrolls into the box, on a CSS view timeline, with no JavaScript.
export function AnimationReveal() {
  return (
    <Box w="full" maxW="md" h="72" overflowY="auto" rounded="lg" border="normal" borderColor="base" p="4">
      <Stack gap="24">
        <Text size="sm" color="muted">
          Scroll this box.
        </Text>
        {STEPS.map((step) => (
          <Card key={step.title} reveal={step.reveal} variant="outline">
            <Card.Body>
              <Heading size="md">{step.title}</Heading>
              <Text size="sm" color="muted">
                {step.body}
              </Text>
            </Card.Body>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
