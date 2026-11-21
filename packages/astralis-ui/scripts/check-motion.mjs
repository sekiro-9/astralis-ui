/* ==========================================================================
   ASTRALIS — MOTION GATE
   --------------------------------------------------------------------------
   Fails the build if the library would move for someone who asked their
   device for less motion (prefers-reduced-motion: reduce).

   Every animation the library ships must be one of:

   - SAFE: declared inside `@media (prefers-reduced-motion: no-preference)`,
     so it never runs under reduced motion. All the motion props are this.
   - PAIRED: a decorative animation class that every source use pairs with
     `astralis:motion-reduce:animate-none`, or an inline animation in a file
     that reads the user's preference (usePrefersReducedMotion).
   - ESSENTIAL: it conveys state rather than decoration (a loader says
     "working"), listed below with its reason. WCAG 2.3.3 exempts these.

   Scroll timelines and scroll triggers must also sit inside an @supports
   guard for their feature, so a browser without them shows the content.

   Anything else is a failure, named with where it comes from. Run after the
   stylesheet is compiled.
   ========================================================================== */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { collectFiles } from "./token-scope.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const css = readFileSync(join(ROOT, "dist", "styles.css"), "utf8");

/** Keyframes that convey state. Each needs its reason. */
const ESSENTIAL = {
  spin: "a spinner says work is in progress",
  "astralis-loader-place": "Loader: says work is in progress",
  "astralis-loader-place-tipped": "Loader: says work is in progress",
  "astralis-loader-dot": "Loader: says work is in progress",
  "astralis-loader-bar": "Loader: says work is in progress",
  "astralis-loader-ring": "Loader: says work is in progress",
  "astralis-progress-slide": "indeterminate Progress: says work is in progress",
};

const REDUCE_CLASS = "astralis:motion-reduce:animate-none";
const READS_PREFERENCE = /usePrefersReducedMotion|prefers-reduced-motion/;

const failures = [];
const counts = { safe: 0, paired: 0, essential: 0 };

/* ---- 1. the compiled stylesheet ------------------------------------------ */

/** Walk the CSS, yielding each style rule with the at-rules around it. */
function* styleRules(text) {
  const stack = [];
  let header = "";
  let body = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") {
      stack.push({ header: header.trim(), body: "" });
      header = "";
    } else if (ch === "}") {
      const block = stack.pop();
      if (block && !block.header.startsWith("@")) {
        yield { selector: block.header, body: block.body + header, context: stack.map((b) => b.header) };
      } else if (block && /^@(media|supports|layer|container)/.test(block.header) === false && block.header.startsWith("@")) {
        // @keyframes, @font-face, @property: not style rules.
      }
      header = "";
    } else if (ch === ";") {
      if (stack.length) stack[stack.length - 1].body += header + ";";
      header = "";
    } else {
      header += ch;
    }
  }
  void body;
}

const keyframeName = (value) => {
  const token = value.match(/var\(--astralis-animation-([a-z-]+)\)/);
  if (token) return token[1];
  const names = value.split(/[\s,]+/).filter((part) => /^[a-z][a-z0-9-]*$/i.test(part) &&
    !/^(none|linear|ease|ease-in|ease-out|ease-in-out|both|forwards|backwards|infinite|alternate|normal|reverse|running|paused|step-start|step-end)$/.test(part));
  return names[0] ?? null;
};

const unescape = (selector) => selector.replace(/\\/g, "");
/** Decorative animation classes found outside a no-preference block: class -> keyframes. */
const needsPairing = new Map();

for (const rule of styleRules(css)) {
  for (const decl of rule.body.split(";")) {
    // A scroll timeline or trigger outside its @supports guard would apply in
    // a browser that cannot run it, and a reveal there must simply show.
    const guarded = decl.match(/^\s*(animation-timeline|timeline-trigger|animation-trigger)\s*:\s*(.+)$/s);
    if (guarded && !/^(auto|none|initial|unset|inherit|revert)$/.test(guarded[2].trim())) {
      const feature = guarded[1] === "animation-timeline" ? "animation-timeline" : "timeline-trigger";
      if (!rule.context.some((at) => at.startsWith("@supports") && at.includes(feature))) {
        failures.push(`${unescape(rule.selector)}: ${guarded[1]} is set outside @supports (${feature}: ...)`);
      }
    }
    const m = decl.match(/^\s*(animation|animation-name)\s*:\s*(.+)$/s);
    if (!m) continue;
    const value = m[2].trim();
    if (/^(none|unset|initial|inherit|revert)$/.test(value)) continue;
    const name = keyframeName(value);
    if (!name) continue;
    const safe = rule.context.some((at) => /prefers-reduced-motion\s*:\s*no-preference/.test(at));
    if (safe) counts.safe++;
    else if (ESSENTIAL[name]) counts.essential++;
    else needsPairing.set(unescape(rule.selector).replace(/^\./, ""), name);
  }
}

/* ---- 2. the component source --------------------------------------------- */

const sources = collectFiles(join(ROOT, "src", "components")).map((file) => ({
  file: relative(ROOT, file).replace(/\\/g, "/"),
  text: readFileSync(file, "utf8"),
}));

// A decorative animation class must travel with the reduce class, in the same string.
for (const [cls, name] of needsPairing) {
  let used = 0;
  for (const { file, text } of sources) {
    for (const literal of text.matchAll(/["'`]([^"'`]*)["'`]/g)) {
      const classes = literal[1].split(/\s+/);
      if (!classes.includes(cls)) continue;
      used++;
      if (classes.includes(REDUCE_CLASS)) counts.paired++;
      else failures.push(`${file}: "${cls}" (${name}) runs under reduced motion. Add "${REDUCE_CLASS}" beside it.`);
    }
  }
  if (!used) counts.paired++; // emitted but unused by any component
}

// An inline animation (keyframes named in a component file) must be essential
// or sit in a file that reads the user's preference.
const keyframes = new Set([...css.matchAll(/@keyframes\s+([a-zA-Z0-9_-]+)/g)].map((m) => m[1]));
for (const { file, text } of sources) {
  for (const literal of text.matchAll(/["'`]([^"'`\s]+)["'`]/g)) {
    const name = literal[1];
    if (!name.startsWith("astralis-") || !(keyframes.has(name) || /^astralis-marquee-/.test(name))) continue;
    if (ESSENTIAL[name]) counts.essential++;
    else if (READS_PREFERENCE.test(text)) counts.paired++;
    else failures.push(`${file}: inline animation "${name}" runs under reduced motion. Read usePrefersReducedMotion, or list it as essential with its reason.`);
  }
}

/* ---- 3. the motion props must exist, and be safe -------------------------- */

for (const cls of ["animate-fade-in", "reveal-fade-in"]) {
  if (!css.includes(`.astralis\\:${cls}`)) failures.push(`motion prop class "astralis:${cls}" is missing from the stylesheet`);
}
if (counts.safe === 0) failures.push("no animation is declared inside prefers-reduced-motion: no-preference");

if (failures.length) {
  console.error(`\n[astralis] motion gate FAILED (${failures.length}):`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  console.error("");
  process.exit(1);
}

console.log(
  `[astralis] motion: ${counts.safe} animations stand down under reduced motion, ${counts.paired} paired with a reduced-motion rule, ` +
    `${counts.essential} essential (they convey state)`,
);
