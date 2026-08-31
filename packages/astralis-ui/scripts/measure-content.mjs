/* ==========================================================================
   ASTRALIS — CONTENT MEASUREMENT FOR THE SYSTEM SPEC
   --------------------------------------------------------------------------
   Whether a component shows text it is given as children. Not derivable
   from the types (React's DOM attributes put `children` on everything, an
   <input> included), so it is measured: each component is server-rendered
   with a probe string and the output is read back. A throw, a React
   complaint, or a probe that never lands all mean "none".

   Parts that need their compound's root render inside it, so the answer is
   about the part in its place, not about it standing alone.
   ========================================================================== */

import { createElement } from "react";
import { renderToString } from "react-dom/server";

const PROBE = "astralis-content-probe";

const NEEDS_ROOT = /must be used (within|inside)/i;

/** React's own complaint from cloneElement on a non-element. */
const WANTS_ELEMENT = /must be a React element|Element type is invalid/i;

/**
 * @param {Record<string, any>} rootExports the built package's exports
 * @param {Record<string, { parts?: string[], anatomy?: { children: string[] } }>} components
 * @returns {{ content: Map<string, "text"|"block"|"element"|"none">, partContent: Map<string, Record<string, "text"|"block"|"element"|"none">>, needsRoot: Map<string, string[]>, within: Map<string, Record<string, string>>, partExports: Map<string, Record<string, string>> }}
 */
export function measureContent(rootExports, components) {
  const content = new Map();
  const partContent = new Map();
  const domRoot = new Map();
  const partDomRoot = new Map();
  const needsRoot = new Map();
  const within = new Map();
  const partExports = new Map();
  const byIdentity = new Map(
    Object.keys(components).map((name) => [rootExports[name], name]),
  );

  for (const [name, entry] of Object.entries(components)) {
    const Root = rootExports[name];
    if (typeof Root !== "function" && typeof Root !== "object") continue;

    content.set(name, probe((child) => createElement(Root, null, child)));
    domRoot.set(name, rendersRoot((props) => createElement(Root, props)));

    if (!entry.parts) continue;
    const perPart = {};
    const perPartRoot = {};
    const throwing = [];
    const nesting = {};
    const exportsOfParts = {};
    for (const part of entry.parts) {
      const Part = Root[part];
      if (!Part) continue;
      // The flat export that IS this part, whatever it is called
      // (Tag.Group is CheckableTagGroup), so its props are findable.
      const flat = byIdentity.get(Part);
      if (flat && flat !== name) exportsOfParts[part] = flat;
      // Needing the root is the library's own "must be used within" throw,
      // and one the root cures. A part that throws for a missing data prop
      // is not anatomy.
      const alone = attempt(() => renderToString(createElement(Part)));
      const nested = attempt(() =>
        renderToString(createElement(Root, null, createElement(Part))),
      );
      if (alone.threw && NEEDS_ROOT.test(alone.message)) {
        if (!nested.threw) throwing.push(part);
        else if (NEEDS_ROOT.test(nested.message)) {
          // Needed further down: Accordion.Trigger wants Accordion.Item
          // between it and the root. Found by trying each sibling part.
          const host = entry.parts.find((candidate) => {
            const Host = Root[candidate];
            if (!Host || candidate === part) return false;
            const deeper = attempt(() =>
              renderToString(
                createElement(Root, null, createElement(Host, null, createElement(Part))),
              ),
            );
            return !deeper.threw;
          });
          if (host) {
            throwing.push(part);
            nesting[part] = host;
          }
        }
      }
      // Measured inside the root whenever it is a child, alone otherwise:
      // Input.Password is a standalone input and must not be nested.
      const inside = entry.anatomy?.children?.includes(part);
      const Host = nesting[part] ? Root[nesting[part]] : null;
      perPart[part] = probe((child) =>
        Host
          ? createElement(Root, null, createElement(Host, null, createElement(Part, null, child)))
          : inside
            ? createElement(Root, null, createElement(Part, null, child))
            : createElement(Part, null, child),
      );
      // A slot part clones the element it wraps, so it is measured with one.
      const filler = perPart[part] === "element" ? createElement("button", null, "x") : undefined;
      perPartRoot[part] = rendersRoot((props) =>
        Host
          ? createElement(Root, null, createElement(Host, null, createElement(Part, props, filler)))
          : inside
            ? createElement(Root, null, createElement(Part, props, filler))
            : createElement(Part, props, filler),
      );
    }
    partContent.set(name, perPart);
    partDomRoot.set(name, perPartRoot);
    if (throwing.length) needsRoot.set(name, throwing);
    if (Object.keys(nesting).length) within.set(name, nesting);
    if (Object.keys(exportsOfParts).length) partExports.set(name, exportsOfParts);
  }
  return { content, partContent, needsRoot, within, partExports, domRoot, partDomRoot };
}

/** Elements that carry text of their own. A probe landing anywhere else —
 *  a div, a section, a list — means the component lays children out rather
 *  than showing text, which a builder treats as a container. */
const TEXT_ELEMENTS = new Set([
  "a", "abbr", "b", "blockquote", "button", "caption", "cite", "code", "dd", "del", "dt", "em",
  "figcaption", "h1", "h2", "h3", "h4", "h5", "h6", "i", "ins", "kbd", "label", "legend", "li",
  "mark", "option", "p", "pre", "q", "s", "samp", "small", "span", "strong", "sub", "summary",
  "sup", "td", "th", "time", "u", "var",
]);

const ROOT_PROBE = "data-astralis-root-probe";

/** Whether a DOM attribute given to the component reaches an element: a
 *  Modal is a context and a Portal a relocation, and a builder must know
 *  which nodes have nothing on the canvas to point at. */
function rendersRoot(build) {
  const result = attempt(() => renderToString(build({ [ROOT_PROBE]: "1" })));
  return !result.threw && result.html.includes(`${ROOT_PROBE}="1"`);
}

/** The tag of the element the probe text sits in, or null. */
function textElementOf(html) {
  const at = html.indexOf(PROBE);
  if (at === -1) return null;
  const before = html.slice(0, at);
  const open = before.lastIndexOf("<");
  const tag = /^<([a-z0-9-]+)/i.exec(before.slice(open));
  return tag ? tag[1].toLowerCase() : null;
}

/** "text" when the probe string lands in a text-bearing element, "block"
 *  when it lands in a layout element, "element" when only an element child
 *  renders (a Trigger that clones what it wraps); otherwise "none". */
function probe(build) {
  const result = attempt(() => renderToString(build(PROBE)));
  if (!result.threw && !result.complained) {
    const tag = textElementOf(result.html);
    if (tag === null) return "none";
    return TEXT_ELEMENTS.has(tag) ? "text" : "block";
  }
  if (!result.threw || !WANTS_ELEMENT.test(result.message)) return "none";
  const wrapped = attempt(() => renderToString(build(createElement("button", null, PROBE))));
  return !wrapped.threw && !wrapped.complained && wrapped.html.includes(PROBE) ? "element" : "none";
}

/** Runs a render with React's console.error captured: a void element given
 *  children is a complaint, not a throw. */
function attempt(run) {
  const original = console.error;
  let complained = false;
  console.error = () => {
    complained = true;
  };
  try {
    return { html: run(), threw: false, complained, message: "" };
  } catch (error) {
    return { html: "", threw: true, complained, message: String(error?.message ?? error) };
  } finally {
    console.error = original;
  }
}
