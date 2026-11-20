"use client";

import type { ReactNode } from "react";
import { Flex, Tabs } from "astralis-ui";

interface PreviewTabsProps {
  preview: ReactNode;
  code: ReactNode;
  align?: "center" | "start";
}

export function PreviewTabs({ preview, code, align = "center" }: PreviewTabsProps) {
  return (
    /* keepMounted: both panels stay mounted (hidden) so demo state survives a
       tab switch (the reason this was hand-rolled before Tabs had the prop). */
    <Tabs
      defaultValue="preview"
      variant="segmented"
      size="sm"
      keepMounted
      my="6"
      /* Inline style beats the root's own gap class (value utilities no
         longer ship since the var-channel). */
      style={{ gap: "var(--astralis-spacing-3)" }}
    >
      {/* self-start: the list is a segmented pill, not a full-width bar.
          Tabs.List takes no alignSelf prop. */}
      <Tabs.List aria-label="Demo view" className="self-start">
        <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
        <Tabs.Trigger value="code">Code</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="preview">
        <Flex
          minH="44"
          wrap="wrap"
          gap="4"
          rounded="xl"
          border="normal"
          borderColor="base"
          p={{ base: "8", sm: "10" }}
          alignItems={align === "center" ? "center" : "start"}
          justifyContent={align === "center" ? "center" : "start"}
          // The dot grid is a background image, which has no prop.
          className="preview-grid"
        >
          {preview}
        </Flex>
      </Tabs.Content>

      <Tabs.Content value="code">{code}</Tabs.Content>
    </Tabs>
  );
}
