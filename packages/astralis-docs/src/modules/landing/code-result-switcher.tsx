"use client";

import type { ReactNode } from "react";
import { Box, Flex, Grid, Tabs, Text } from "astralis-ui";

interface Panel {
  title: string;
  blurb: string;
  code: ReactNode;
  preview: ReactNode;
}

export function CodeResultSwitcher({ panels }: { panels: Panel[] }) {
  return (
    <Tabs
      defaultValue={panels[0]?.title}
      variant="subtle"
      rounded
      style={{ gap: "var(--astralis-spacing-6)" }}
    >
      {/* Tabs.List takes no layout props. */}
      <Tabs.List aria-label="Examples" className="flex-wrap self-start">
        {panels.map((panel) => (
          <Tabs.Trigger key={panel.title} value={panel.title}>
            {panel.title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* One panel mounts at a time, so each owns its blurb and grid outright:
          no `contents` wrapper juggling `hidden` children to hold the layout. */}
      {panels.map((panel) => (
        <Tabs.Content key={panel.title} value={panel.title}>
          <Text size="sm" color="muted" mb="4">
            {panel.blurb}
          </Text>
          <Grid gap="4" columns={{ lg: "2" }}>
            {/* Stretches the code block, which this file does not render, to the preview's height. */}
            <Box minW="0" className="[&_figure]:h-full">{panel.code}</Box>
            <Flex
              minH="56"
              alignItems="center"
              justifyContent="center"
              rounded="xl"
              border="normal"
              borderColor="base"
              p="8"
              className="preview-grid"
            >
              {panel.preview}
            </Flex>
          </Grid>
        </Tabs.Content>
      ))}
    </Tabs>
  );
}
