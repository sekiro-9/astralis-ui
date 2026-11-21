"use client";

import { useState } from "react";
import { Box, Button, Grid, Stack, Text } from "astralis-ui";

const DISTANCES = ["sm", "md", "lg", "xl"] as const;

// "use client" only for the Replay button, as in the entrance demo.
export function AnimationDistance() {
  const [run, setRun] = useState(0);
  return (
    <Stack gap="4" w="full">
      <Grid key={run} columns={{ base: "2", md: "4" }} gap="3">
        {DISTANCES.map((distance) => (
          <Box
            key={distance}
            animation="fade-up"
            animationDuration="slow"
            animationDistance={distance}
            bg="brand-subtle"
            rounded="lg"
            p="4"
          >
            <Text size="sm" weight="medium">
              {distance}
            </Text>
          </Box>
        ))}
      </Grid>
      <Button variant="outline" size="sm" alignSelf="start" onClick={() => setRun((n) => n + 1)}>
        Replay
      </Button>
    </Stack>
  );
}
