"use client";

import { useState } from "react";
import { Box, Button, Grid, Stack, Text } from "astralis-ui";

const NAMES = ["fade-in", "fade-up", "fade-down", "slide-left", "slide-right", "scale-in", "pop", "blur-in"] as const;

// "use client" only for the Replay button: an entrance plays once, so the demo
// remounts the grid to play it again. The animation itself is CSS.
export function AnimationEntrance() {
  const [run, setRun] = useState(0);
  return (
    <Stack gap="4" w="full">
      <Grid key={run} columns={{ base: "2", md: "4" }} gap="3">
        {NAMES.map((name) => (
          <Box key={name} animation={name} bg="brand-subtle" rounded="lg" p="4">
            <Text size="sm" weight="medium">
              {name}
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
