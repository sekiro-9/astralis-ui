"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Flex, Stack, Text } from "astralis-ui";
import { NavGroupLabel } from "./nav-item";

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

const HEADINGS = "article h2[id], article h3[id]";

/**
 * The outline as a string, so useSyncExternalStore can compare snapshots by
 * value: a fresh array on every read would never be equal and loop forever.
 */
function readOutline(): string {
  const headings = document.querySelectorAll<HTMLHeadingElement>(HEADINGS);
  return JSON.stringify(
    Array.from(headings, (h): TocEntry => ({
      id: h.id,
      text: Array.from(h.childNodes)
        .filter((node) => !(node instanceof HTMLElement && node.hasAttribute("data-heading-anchor")))
        .map((node) => node.textContent)
        .join(""),
      level: h.tagName === "H2" ? 2 : 3,
    })),
  );
}

/** Client navigation swaps the article's children, which is what re-reads the outline. */
function subscribeToArticle(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.querySelector("article") ?? document.body, {
    childList: true,
    subtree: true,
  });
  return () => observer.disconnect();
}

/**
 * Builds its outline from the rendered article's h2/h3 headings (ids come
 * from rehype-slug) and scroll-spies them with an IntersectionObserver.
 */
export function Toc() {
  const outline = useSyncExternalStore(subscribeToArticle, readOutline, () => "[]");
  const entries = useMemo(() => JSON.parse(outline) as TocEntry[], [outline]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observed) => {
        // The topmost heading inside the activation band wins.
        const visible = observed
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -70% 0px" },
    );

    document.querySelectorAll(HEADINGS).forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [outline]);

  if (entries.length === 0) return null;

  return (
    // Text, not a bare nav: the label's off-scale size keeps the line height it inherits from here.
    <Text as="nav" size="sm" aria-label="On this page">
      <NavGroupLabel mb="3">On this page</NavGroupLabel>
      <Stack as="ul" borderL="normal" borderColor="base">
        {entries.map((entry) => {
          const active = entry.id === activeId;
          return (
            <li key={entry.id}>
              {/* Pulled 1px left so its own border lies over the list's rail. */}
              <Flex
                as="a"
                href={`#${entry.id}`}
                ml="-1px"
                borderL="normal"
                // No borderColor token names the accent's solid role; "brand" is a step lighter.
                borderColor={active ? "var(--astralis-color-accent-solid)" : "transparent"}
                py="1"
                pr="2"
                pl={entry.level === 3 ? "7" : "4"}
                color={active ? "brand-label" : "muted"}
                hover={active ? undefined : { color: "base" }}
                className="transition-colors"
              >
                <Text as="span" size="sm" weight={active ? "medium" : "normal"}>
                  {entry.text}
                </Text>
              </Flex>
            </li>
          );
        })}
      </Stack>
    </Text>
  );
}
