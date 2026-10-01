import { specEntry } from "astralis-cli/snapshot";

/* What a named element is: read from the attributes astralis-ui renders in
   development (data-astralis, data-astralis-props) and looked up in the
   system spec. Pure, so it runs in the overlay and in Node tests alike. */

export const IDENTITY_ATTRIBUTE = "data-astralis";
export const PROPS_ATTRIBUTE = "data-astralis-props";
export const DOCS_ORIGIN = "https://astralis-ui.com";

export { specEntry };

/**
 * The components on one element, outermost first: `data-astralis="Modal.Trigger Button"`
 * is a Modal.Trigger rendering through a Button. Each has the props it was
 * configured with; an unreadable props attribute leaves them empty.
 */
export function readIdentity(element) {
  const names = (element.getAttribute(IDENTITY_ATTRIBUTE) ?? "").split(" ").filter(Boolean);
  let props = [];
  try {
    props = JSON.parse(element.getAttribute(PROPS_ATTRIBUTE) ?? "[]");
  } catch {
    props = [];
  }
  if (!Array.isArray(props) || props.length !== names.length) props = names.map(() => ({}));
  return names.map((name, index) => ({ name, props: props[index] ?? {} }));
}

/** The documented component a name belongs to: "Card.Body" is documented under Card. */
export function documentedRoot(spec, name) {
  const [root] = name.split(".");
  const components = spec?.components ?? {};
  // A flat part export ("CardBody") belongs to the root that lists it.
  for (const [key, entry] of Object.entries(components)) {
    if (Object.values(entry.partExports ?? {}).includes(root)) return key;
  }
  return root;
}

/**
 * Components documented on another page than their own name suggests: the
 * base and root variants on their component's page, the stacks on Stack, and
 * the two theme pieces in the theming guide.
 */
const DOCS_PAGE = {
  AstralisProvider: "/docs/theming",
  ThemeScript: "/docs/theming",
  HStack: "/docs/components/stack",
  VStack: "/docs/components/stack",
  InputGroup: "/docs/components/input",
  InputTextarea: "/docs/components/textarea",
  RangeSlider: "/docs/components/slider",
  Toaster: "/docs/components/toast",
};

const kebab = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

/** The docs path for a root component name, e.g. "/docs/components/checkbox-card". */
export function docsPath(root) {
  if (DOCS_PAGE[root]) return DOCS_PAGE[root];
  return `/docs/components/${kebab(root.replace(/(Root|Base)$/, ""))}`;
}

/**
 * How a component reaches the browser, from the spec's `client` field. The
 * label is a fact about the component; the detail depends on the app, since a
 * client-rendered app (Vite) renders every component in the browser.
 */
export const CLIENT_TIERS = {
  none: {
    label: "Server Component",
    server: "Renders on the server and ships no library JavaScript.",
    client: "Needs no client JavaScript of its own, so a server-rendered app ships none for it. This app renders it in the browser.",
  },
  leaf: {
    label: "Server shell, client island",
    server: "Renders on the server; a small interactive part hydrates.",
    client: "Server-renderable apart from a small interactive part. This app renders it in the browser.",
  },
  required: {
    label: "Client Component",
    server: "Hydrates in the browser to be interactive.",
    client: "Runs in the browser to be interactive.",
  },
};

/** Frameworks whose pages render on the server first. */
const SERVER_RENDERED = new Set(["next"]);

/**
 * Everything the Inspect panel shows about one name. A part the spec does not
 * list on its own (Menu.Item, Slider.Thumb) is reported as part of its root,
 * with no client tier: the spec states tiers per entry, and a part can hydrate
 * where its root does not.
 */
export function describeComponent(spec, name, framework = "next") {
  const found = specEntry(spec, name);
  const root = documentedRoot(spec, name);
  const parent = !found && name.includes(".") ? specEntry(spec, name.split(".")[0]) : null;
  const tier = found?.entry?.client;
  return {
    name,
    specKey: found?.key ?? null,
    known: Boolean(found),
    partOf: parent?.key ?? null,
    client: tier ?? null,
    clientLabel: tier ? CLIENT_TIERS[tier]?.label ?? tier : null,
    clientDetail: tier ? CLIENT_TIERS[tier]?.[SERVER_RENDERED.has(framework) ? "server" : "client"] ?? "" : "",
    category: found?.entry?.category ?? null,
    docsUrl: DOCS_ORIGIN + docsPath(root),
  };
}
