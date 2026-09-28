"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Search as SearchIcon } from "lucide-react";
import { Button, Highlight, HStack, Icon, Input, Kbd, Modal, ScrollArea, Text } from "astralis-ui";
import { navigation } from "@/lib/navigation";

/*
 * Pagefind's runtime and index are static files that scripts/build-search-index.mjs
 * writes into public/ before `next dev` and `next build`. They are fetched on
 * first open, never bundled, so the import has to stay out of the bundler's reach.
 */
const PAGEFIND_URL = "/pagefind/pagefind.js";
const MAX_HITS = 8;

interface PagefindSubResult {
  title: string;
  url: string;
  locations: number[];
}

interface PagefindData {
  url: string;
  excerpt: string;
  meta: { title?: string };
  sub_results?: PagefindSubResult[];
}

interface Pagefind {
  init: () => Promise<void>;
  debouncedSearch: (
    query: string,
    options?: object,
    debounceMs?: number,
  ) => Promise<{ results: { id: string; data: () => Promise<PagefindData> }[] } | null>;
}

let pagefind: Promise<Pagefind> | null = null;

function loadPagefind(): Promise<Pagefind> {
  pagefind ??= import(/* webpackIgnore: true */ /* turbopackIgnore: true */ PAGEFIND_URL).then(
    async (module: Pagefind) => {
      await module.init();
      return module;
    },
  );
  // A failed load is not cached, so the next open tries again.
  pagefind.catch(() => (pagefind = null));
  return pagefind;
}

interface Hit {
  id: string;
  href: string;
  title: string;
  section: string;
  heading: string | null;
  excerpt: string;
  terms: string[];
}

const SECTIONS = new Map(
  navigation.flatMap((group) => group.items.map((item) => [item.href, group.title] as const)),
);

const sectionOf = (url: string) =>
  url.startsWith("/blocks/") ? "Blocks" : (SECTIONS.get(url) ?? "Docs");

/**
 * Pagefind's excerpt is HTML with `<mark>` around matches. Parsed rather than
 * injected, so the dialog renders text through Highlight and never sets HTML.
 */
function readExcerpt(html: string): { text: string; terms: string[] } {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const terms = Array.from(doc.querySelectorAll("mark"), (mark) =>
    (mark.textContent ?? "").replace(/[^\p{L}\p{N}_-]+$/u, ""),
  ).filter(Boolean);
  return { text: doc.body.textContent ?? "", terms: [...new Set(terms)] };
}

function toHit(id: string, data: PagefindData): Hit {
  const title = data.meta.title ?? data.url;
  // The section that matched most often, unless it is the page's own title.
  const best = [...(data.sub_results ?? [])].sort(
    (a, b) => b.locations.length - a.locations.length,
  )[0];
  const deep = best && best.title !== title ? best : null;
  const { text, terms } = readExcerpt(data.excerpt);
  return {
    id,
    href: deep?.url ?? data.url,
    title,
    section: sectionOf(data.url),
    heading: deep?.title ?? null,
    excerpt: text,
    terms,
  };
}

type Status = "idle" | "loading" | "ready" | "unavailable";

const subscribeNever = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform);

/** The header's search: a trigger, the Ctrl/⌘ K and "/" shortcuts, and the dialog. */
export function Search() {
  const [open, setOpenState] = useState(false);
  // Bumped on every open: the panel remounts, so each search starts empty,
  // while the closing panel keeps its content through the exit animation.
  const [session, setSession] = useState(0);
  const apple = useSyncExternalStore(subscribeNever, isApple, () => false);

  const setOpen = (next: boolean) => {
    if (next && !open) setSession((current) => current + 1);
    setOpenState(next);
  };

  // The shortcut listener is registered once; the ref hands it today's state.
  const toggle = useRef((force?: boolean) => setOpen(force ?? !open));
  useEffect(() => {
    toggle.current = (force?: boolean) => setOpen(force ?? !open);
  });

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle.current();
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        toggle.current(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Modal open={open} onOpenChange={setOpen} size="lg" centered={false}>
      <Modal.Trigger>
        <Button
          variant="outline"
          colorScheme="gray"
          size="sm"
          aria-label="Search the docs"
          aria-keyshortcuts={apple ? "Meta+K" : "Control+K"}
          rightIcon={
            <Kbd size="sm" className="hidden md:inline-flex">
              {apple ? "⌘K" : "Ctrl K"}
            </Kbd>
          }
          className="justify-between md:w-56"
        >
          <span className="flex items-center gap-2">
            <Icon as={SearchIcon} size={14} />
            <span className="hidden text-xs font-normal text-label-muted sm:inline">Search docs</span>
          </span>
        </Button>
      </Modal.Trigger>

      <Modal.Content>
        <SearchPanel key={session} onNavigate={() => setOpen(false)} />
      </Modal.Content>
    </Modal>
  );
}

function SearchPanel({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const latest = useRef("");

  const search = (value: string) => {
    latest.current = value;
    setQuery(value);
    setActive(0);
    if (!value.trim()) {
      setHits([]);
      setStatus("idle");
      return;
    }
    setStatus((current) => (current === "unavailable" ? current : "loading"));
    loadPagefind()
      .then(async (engine) => {
        const response = await engine.debouncedSearch(value, {}, 120);
        // null: a later keystroke superseded this search.
        if (!response) return;
        const top = response.results.slice(0, MAX_HITS);
        const data = await Promise.all(top.map((result) => result.data()));
        // Cleared while the fragments loaded; an empty box shows no results.
        if (latest.current !== value) return;
        setHits(data.map((entry, i) => toHit(top[i].id, entry)));
        setStatus("ready");
      })
      .catch(() => setStatus("unavailable"));
  };

  const go = (hit: Hit | undefined) => {
    if (!hit) return;
    onNavigate();
    router.push(hit.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (hits.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + hits.length) % hits.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(hits[active]);
    }
  };

  const optionId = (index: number) => `${listId}-${index}`;

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [listId, active]);

  let message: ReactNode = null;
  if (status === "unavailable") {
    message = "Search could not load. Check your connection and try again.";
  } else if (status === "ready" && hits.length === 0) {
    message = `Nothing matches “${query}”. Try a component name or a prop.`;
  } else if (status === "idle") {
    message = "Search every guide, component page and block.";
  }

  return (
    <>
      <Modal.Title className="sr-only">Search the docs</Modal.Title>

      <div className="border-b border-stroke-base p-3">
        <Input.Search
          value={query}
          onChange={(event) => search(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Components, props, guides, blocks…"
          aria-label="Search the docs"
          role="combobox"
          aria-expanded={hits.length > 0}
          aria-controls={hits.length > 0 ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={hits.length > 0 ? optionId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <ScrollArea tabIndex={-1} style={{ maxHeight: "min(60vh, 32rem)" }}>
        {message && (
          <Text size="sm" color="muted" className="px-5 py-8 text-center">
            {message}
          </Text>
        )}

        {hits.length > 0 && (
          <ul id={listId} role="listbox" aria-label="Results" className="flex flex-col gap-0.5 p-2">
            {hits.map((hit, index) => (
              <li
                key={hit.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === active}
                onMouseMove={() => setActive(index)}
              >
                <NextLink
                  href={hit.href}
                  tabIndex={-1}
                  onClick={onNavigate}
                  className={`flex flex-col gap-1 rounded-lg px-3 py-2.5 transition-colors ${
                    index === active ? "bg-accent-subtle" : ""
                  }`}
                >
                  <span className="flex items-baseline gap-2">
                    <Text as="span" size="sm" weight="medium">
                      {hit.title}
                      {hit.heading && <span className="text-label-muted"> › {hit.heading}</span>}
                    </Text>
                    <Text as="span" size="xs" color="subtle" className="ml-auto shrink-0">
                      {hit.section}
                    </Text>
                  </span>
                  <Text as="span" size="xs" color="muted" lineClamp="2">
                    {hit.terms.length > 0 ? (
                      <Highlight query={hit.terms}>{hit.excerpt}</Highlight>
                    ) : (
                      hit.excerpt
                    )}
                  </Text>
                </NextLink>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>

      <p aria-live="polite" className="sr-only">
        {status === "ready" ? `${hits.length} result${hits.length === 1 ? "" : "s"}` : ""}
      </p>

      <HStack gap="4" className="border-t border-stroke-base px-4 py-2.5 text-xs text-label-subtle">
        <HStack gap="1.5">
          <Kbd size="sm">↑</Kbd>
          <Kbd size="sm">↓</Kbd> to move
        </HStack>
        <HStack gap="1.5">
          <Kbd size="sm">Enter</Kbd> to open
        </HStack>
        <HStack gap="1.5">
          <Kbd size="sm">Esc</Kbd> to close
        </HStack>
      </HStack>
    </>
  );
}
