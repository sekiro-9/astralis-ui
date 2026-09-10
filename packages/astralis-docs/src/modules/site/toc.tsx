"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

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
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-label-subtle">
        On this page
      </p>
      <ul className="flex flex-col border-l border-stroke-base">
        {entries.map((entry) => {
          const active = entry.id === activeId;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className={`-ml-px block border-l py-1 pr-2 transition-colors ${
                  entry.level === 3 ? "pl-7" : "pl-4"
                } ${
                  active
                    ? "border-accent font-medium text-accent-label"
                    : "border-transparent text-label-muted hover:text-label"
                }`}
              >
                {entry.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
