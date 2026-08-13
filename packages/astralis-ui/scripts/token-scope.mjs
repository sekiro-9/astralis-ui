/**
 * Shared token extraction for the safelist generator and the CSS coverage
 * gate. Two scopes:
 *
 * - ALL tokens: every `astralis:*` class any component can emit — these must
 *   exist at BASE in the compiled CSS (Tailwind's scanner handles that; the
 *   coverage gate asserts it).
 *
 * - RESPONSIVE tokens: only classes that the runtime responsive engine can
 *   breakpoint-prefix — i.e. values inside the token maps handed to
 *   `resolveStyleProps` (everything in src/const, plus `export const
 *   *Map = {...}` blocks in *.styles.ts). Only these need sm/md/lg/xl
 *   variants force-generated.
 *
 * Since the var-channel migration, both scopes cover KEYWORD props only —
 * value-bearing props (spacing, sizing, colors, ...) resolve to channel
 * classes in theme/channels.css plus a custom property, and their maps hold
 * CSS values that this scraper never sees. The channel side of the gate is
 * driven by CHANNEL_PROPS (see collectChannelSlugs).
 *
 * Interaction states are channel-only (all 3 states x every channel prop, 3
 * static rules per prop) — no enumerated state classes remain.
 *
 * Test files are excluded: tests assert on classes, they don't emit them, and
 * scanning them made a partial class literal in an assertion fail the build.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "src");

export function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, acc);
    else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.stories\./.test(entry.name) &&
      !/\.test\./.test(entry.name)
    ) {
      acc.push(full);
    }
  }
  return acc;
}

function tokensInText(text, set) {
  for (const m of text.matchAll(/["'`]([^"'`]*astralis:[^"'`]+)["'`]/g)) {
    for (const cls of m[1].split(/\s+/)) {
      if (cls.startsWith("astralis:")) set.add(cls.slice("astralis:".length));
    }
  }
}

/** Every astralis-prefixed class in src/const + src/components. */
export function collectAllTokens() {
  const tokens = new Set();
  for (const root of [join(SRC, "const"), join(SRC, "components")]) {
    for (const file of collectFiles(root)) tokensInText(readFileSync(file, "utf8"), tokens);
  }
  return tokens;
}

/** Slice out `export const <name>Map = { ... }` blocks (brace-balanced). */
function mapBlocks(text) {
  const blocks = [];
  const re = /export const \w*Map(?:\s*:[^=]+)? = \{/g;
  let m;
  while ((m = re.exec(text))) {
    let depth = 0;
    let i = m.index + m[0].length - 1; // at the opening brace
    for (; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    blocks.push(text.slice(m.index, i + 1));
  }
  return blocks;
}

/** Only classes reachable by the runtime responsive engine. */
export function collectResponsiveTokens() {
  const tokens = new Set();
  for (const file of collectFiles(join(SRC, "const"))) {
    tokensInText(readFileSync(file, "utf8"), tokens);
  }
  for (const file of collectFiles(join(SRC, "components"))) {
    if (!/\.styles\.tsx?$/.test(file)) continue;
    for (const block of mapBlocks(readFileSync(file, "utf8"))) tokensInText(block, tokens);
  }
  return tokens;
}

/**
 * The channel-prop slugs from src/const/channel.ts — the source of truth for
 * which fixed classes theme/channels.css must define. Parsed from the
 * CHANNEL_PROPS literal (this is build tooling; importing TS isn't an option
 * here and dist may not exist yet when the safelist generator runs).
 */
export function collectChannelSlugs() {
  const text = readFileSync(join(SRC, "const", "channel.ts"), "utf8");
  const m = text.match(/export const CHANNEL_PROPS = \{([\s\S]*?)\} as const/);
  if (!m) throw new Error("[astralis] CHANNEL_PROPS block not found in src/const/channel.ts");
  const slugs = [];
  for (const entry of m[1].matchAll(/\w+:\s*"([\w-]+)"/g)) slugs.push(entry[1]);
  if (slugs.length === 0) throw new Error("[astralis] CHANNEL_PROPS parsed to zero slugs");
  return slugs;
}
