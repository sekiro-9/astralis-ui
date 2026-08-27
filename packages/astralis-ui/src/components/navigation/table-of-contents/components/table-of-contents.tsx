"use client";

import { useEffect, useState } from "react";
import type { TableOfContentsProps } from "../table-of-contents.types";
import { tocLabel, tocList, tocLink, tocLinkActive } from "../table-of-contents.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

/**
 * "On this page" navigation with scroll-spy: the entry whose heading is
 * currently on screen is highlighted (IntersectionObserver — no scroll
 * handler). Entries are plain anchor links, so navigation works before
 * hydration and with JavaScript disabled; only the highlight is enhanced.
 */
export function TableOfContents({
  items,
  label = "On this page",
  showLabel = true,
  offset = 80,
  className = "",
  ...rest
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Highlight the first visible heading in document order; when none is
        // visible (mid-section), keep the last active one steady instead of
        // flickering off.
        const first = items.find((item) => visible.has(item.id));
        if (first) setActiveId(first.id);
      },
      { rootMargin: `-${offset}px 0px -55% 0px` },
    );
    for (const el of headings) observer.observe(el);
    return () => observer.disconnect();
  }, [items, offset]);

  return (
    <nav aria-label={label} className={className} {...rest}>
      {showLabel && <div className={tocLabel}>{label}</div>}
      <ul className={tocList}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              style={item.depth ? { paddingLeft: `${0.75 + item.depth * 0.75}rem` } : undefined}
              className={astralisMerge(tocLink, activeId === item.id && tocLinkActive)}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

TableOfContents.displayName = "TableOfContents";
