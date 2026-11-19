"use client";

import { useState } from "react";
import { Badge, Button, Card, Heading, Stack, Text } from "astralis-ui";

const PLANS = [
  { name: "Starter", price: "Free", delay: "100" },
  { name: "Team", price: "$12", delay: "200" },
  { name: "Business", price: "$29", delay: "300" },
] as const;

// "use client" only for the Replay button. animationDelay staggers the cards.
export function AnimationStagger() {
  const [run, setRun] = useState(0);
  return (
    <Stack gap="4" w="full">
      <Stack key={run} direction={{ base: "vertical", md: "horizontal" }} gap="4">
        {PLANS.map((plan) => (
          <Card key={plan.name} animation="fade-up" animationDuration="slow" animationDelay={plan.delay} variant="outline" flex="1">
            <Card.Body>
              <Stack gap="2" align="start">
                <Badge variant="subtle">{plan.name}</Badge>
                <Heading size="xl">{plan.price}</Heading>
                <Text size="sm" color="muted">
                  Arrives {plan.delay} ms after the first.
                </Text>
              </Stack>
            </Card.Body>
          </Card>
        ))}
      </Stack>
      <Button variant="outline" size="sm" alignSelf="start" onClick={() => setRun((n) => n + 1)}>
        Replay
      </Button>
    </Stack>
  );
}
