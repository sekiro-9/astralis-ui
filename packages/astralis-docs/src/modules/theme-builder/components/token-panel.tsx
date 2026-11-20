"use client";

import { useState } from "react";
import { Button, Code, CodeBlock, Flex, Stack, Tabs, Text } from "astralis-ui";
import { isDefaultState, type BuilderState } from "@/lib/theme-builder";
import { useShikiHtml } from "@/lib/use-shiki";

/**
 * The two artifacts a consumer can actually use: a stylesheet for build-time
 * theming, or the seed object for `<AstralisProvider tokens={…}>` at runtime.
 */
const EXPORTS = [
  { value: "css", label: "Stylesheet", filename: "astralis-theme.css", lang: "css" },
  { value: "json", label: "Provider props", filename: "tokens", lang: "json" },
] as const;

type ExportTab = (typeof EXPORTS)[number];

/**
 * One export panel. Split out so `useShikiHtml` runs for the visible tab only:
 * Tabs unmounts the inactive panel, which also replaces the manual `key` remount
 * that used to stop the copy control holding the other tab's text.
 */
function ExportView({ tab, source }: { tab: ExportTab; source: string }) {
  const html = useShikiHtml(source, tab.lang);

  return (
    <>
      {/* CodeBlock has no display/direction props, and its Content no layout
          props at all: those stay classes so the code area scrolls inside. */}
      <CodeBlock.Root variant="solid" size="sm" code={source} h="full" minH="0" className="flex! flex-col">
        <CodeBlock.Header>
          <CodeBlock.Title>{tab.filename}</CodeBlock.Title>
          <CodeBlock.Control>
            <CodeBlock.CopyTrigger />
          </CodeBlock.Control>
        </CodeBlock.Header>
        <CodeBlock.Content className="shiki docs-scroll min-h-0 flex-1 overflow-y-auto">
          {html != null ? <CodeBlock.Code highlightedHtml={html} /> : <CodeBlock.Code />}
        </CodeBlock.Content>
      </CodeBlock.Root>

      <Text size="xs" color="subtle">
        {tab.value === "css" ? (
          <>
            Import after <Code>astralis-ui/styles.css</Code>. Or generate it from the terminal:{" "}
            <Code>npx astralis-cli theme</Code>
          </>
        ) : (
          <>
            Pass to <Code>{"<AstralisProvider tokens={…}>"}</Code>, same math as the stylesheet.
          </>
        )}
      </Text>
    </>
  );
}

/** The right rail: empty at the defaults, then the copyable output. */
export function TokenPanel({ state, css, json }: { state: BuilderState; css: string; json: string }) {
  const [tab, setTab] = useState<ExportTab["value"]>("css");
  const untouched = isDefaultState(state);

  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked: the URL is in the address bar either way.
    }
  };

  if (untouched) {
    return (
      <Stack as="aside" minH="0" gap="2" h={{ base: "70vh", lg: "auto" }}>
        <Stack
          h="full"
          minH="0"
          alignItems="center"
          justifyContent="center"
          gap="2"
          rounded="xl"
          border="normal"
          borderStyle="dashed"
          borderColor="base"
          p="6"
        >
          <Text size="sm" weight="medium" align="center">
            Everything is at the library defaults
          </Text>
          <Text size="xs" color="subtle" align="center">
            Change any token on the left and your custom tokens appear here, ready to copy.
          </Text>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack as="aside" minH="0" h={{ base: "70vh", lg: "auto" }}>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as ExportTab["value"])}
        variant="segmented"
        size="sm"
        minH="0"
        flex="1"
        /* Tabs has no gap prop; inline style so the override beats the root's
           own gap class. */
        style={{ gap: "var(--astralis-spacing-2)" }}
      >
        <Flex alignItems="center" justifyContent="between" gap="2">
          <Tabs.List aria-label="Export format">
            {EXPORTS.map((item) => (
              <Tabs.Trigger key={item.value} value={item.value}>
                {item.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Button size="xs" variant="outline" colorScheme="gray" onClick={share}>
            {copied ? "Link copied" : "Share"}
          </Button>
        </Flex>

        {EXPORTS.map((item) => (
          // Tabs.Content takes no layout props.
          <Tabs.Content key={item.value} value={item.value} className="flex min-h-0 flex-col gap-2">
            <ExportView tab={item} source={item.value === "css" ? css : json} />
          </Tabs.Content>
        ))}
      </Tabs>
    </Stack>
  );
}
