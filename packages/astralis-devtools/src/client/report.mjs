import { LIMITS, cleanConsoleMessage, contentOf, keptText, redactedText } from "astralis-cli/snapshot";
import { IDENTITY_ATTRIBUTE, readIdentity } from "./identity.mjs";

/* The page's part of an issue snapshot: the component tree under the
   selected element, the browser's facts, console errors and an optional
   screenshot. Nothing here sends anything; the bridge assembles the rest. */

const SKIP = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"]);

/**
 * One element's chain as nested nodes. "Modal.Trigger Button" is a trigger
 * wrapping the Button the page wrote, because a Trigger takes one element
 * (its spec content is "element"); "Card.Body Box" would be Card.Body
 * rendering its own Box, which the page never wrote, so it is recorded under
 * `renders` instead of as a child.
 */
function chainNode(chain, spec, children) {
  const [first, ...rest] = chain;
  const node = { component: first.name, props: first.props, children };
  if (rest.length === 0) return node;
  if (contentOf(spec, first.name) === "element") {
    node.children = [chainNode(rest, spec, children)];
  } else {
    node.renders = rest.map((c) => c.name);
  }
  return node;
}

/**
 * The astralis-ui components at and under `element`, as snapshot tree nodes.
 * Plain elements in between are passed through; text becomes a placeholder
 * unless `includeText`. The overlay's own element is never included.
 */
export function treeFromElement(element, spec, { includeText = false, skip = null } = {}) {
  let count = 0;
  const walk = (nodes, depth) => {
    const out = [];
    for (const node of nodes) {
      if (count >= LIMITS.nodes || depth > LIMITS.depth) break;
      if (node.nodeType === 3) {
        const text = node.textContent.replace(/\s+/g, " ").trim();
        if (text) out.push(includeText ? keptText(text) : redactedText(text));
        continue;
      }
      if (node.nodeType !== 1 || node === skip || SKIP.has(node.tagName)) continue;
      if (node.hasAttribute(IDENTITY_ATTRIBUTE)) {
        count++;
        out.push(chainNode(readIdentity(node), spec, walk(node.childNodes, depth + 1)));
      } else {
        out.push(...walk(node.childNodes, depth));
      }
    }
    return out;
  };
  return walk([element], 0).filter((node) => "component" in node);
}

/** "Chrome 140", "Firefox 131", "Safari 18": the browser and its major version, no more. */
export function browserName(userAgent = globalThis.navigator?.userAgent ?? "") {
  const rules = [
    [/Edg\/(\d+)/, "Edge"],
    [/OPR\/(\d+)/, "Opera"],
    [/Firefox\/(\d+)/, "Firefox"],
    [/Chrome\/(\d+)/, "Chrome"],
    [/Version\/(\d+)[\d.]* Safari/, "Safari"],
  ];
  for (const [pattern, name] of rules) {
    const m = userAgent.match(pattern);
    if (m) return `${name} ${m[1]}`;
  }
  return null;
}

/** The facts about this browser a snapshot carries. */
export function browserEnvironment(win = globalThis.window) {
  const dark = win.document.documentElement.classList.contains("astralis-dark");
  return {
    browser: browserName(win.navigator.userAgent),
    viewport: { width: Math.round(win.innerWidth), height: Math.round(win.innerHeight) },
    colorMode: dark ? "dark" : "light",
  };
}

/**
 * Record console errors, uncaught errors and unhandled rejections from now
 * on, cleaned as they arrive, keeping the last few. Returns { messages, stop }.
 */
export function recordConsoleErrors(win = globalThis.window) {
  const messages = [];
  const origin = win.location.origin;
  const push = (parts) => {
    const text = parts.map((p) => (p instanceof Error ? p.stack || p.message : typeof p === "string" ? p : safeString(p))).join(" ");
    messages.push(cleanConsoleMessage(text, origin));
    if (messages.length > LIMITS.console) messages.shift();
  };
  const original = win.console.error;
  win.console.error = function (...args) {
    push(args);
    return original.apply(this, args);
  };
  const onError = (event) => push([event.error ?? event.message]);
  const onRejection = (event) => push(["Unhandled rejection:", event.reason]);
  win.addEventListener("error", onError);
  win.addEventListener("unhandledrejection", onRejection);
  return {
    messages,
    stop() {
      if (win.console.error !== original) win.console.error = original;
      win.removeEventListener("error", onError);
      win.removeEventListener("unhandledrejection", onRejection);
    },
  };
}

function safeString(value) {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

const MAX_SCREENSHOT_BYTES = 180 * 1024;

/**
 * A screenshot of this tab through the browser's own capture prompt, as a
 * JPEG data URL small enough for a snapshot. `hide` and `show` take the
 * overlay out of the picture. Rejects if the reporter declines the prompt.
 */
export async function captureScreenshot({ hide = () => {}, show = () => {}, win = globalThis.window } = {}) {
  const stream = await win.navigator.mediaDevices.getDisplayMedia({
    video: { displaySurface: "browser" },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: "include",
  });
  const video = win.document.createElement("video");
  try {
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    hide();
    // Two frames, so the capture shows the page without the overlay.
    await new Promise((done) => win.requestAnimationFrame(() => win.requestAnimationFrame(done)));
    for (const [width, quality] of [[1280, 0.72], [960, 0.6], [720, 0.5]]) {
      const scale = Math.min(1, width / video.videoWidth);
      const canvas = win.document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL("image/jpeg", quality);
      if (url.length * 0.75 <= MAX_SCREENSHOT_BYTES) return url;
    }
    throw new Error("The screenshot is too large to include.");
  } finally {
    show();
    for (const track of stream.getTracks()) track.stop();
    video.srcObject = null;
  }
}

