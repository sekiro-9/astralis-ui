import type { Snapshot } from "astralis-cli/snapshot";

/** A valid snapshot, as the DevTools send it: a Card with a variant the spec does not have. */
export function sampleSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    format: "astralis-snapshot/1",
    source: "devtools",
    library: {
      name: "astralis-ui",
      version: "0.7.8",
      specVersion: 3,
      specSha256: "734be736ad289de1fd406b452779ea70019411d2a56dc9eb8fbe8e8636f4f333",
    },
    environment: {
      framework: { name: "next", version: "16.3.3" },
      react: "19.2.8",
      browser: "Chrome 152",
      viewport: { width: 1024, height: 768 },
      colorMode: "dark",
    },
    route: "/",
    tree: [
      {
        component: "Card",
        props: { variant: "glass", size: "lg" },
        client: "none",
        children: [
          {
            component: "Card.Body",
            props: {},
            client: "none",
            children: [{ component: "Text", props: {}, client: "none", children: [{ redacted: true, length: 24 }] }],
          },
        ],
      },
    ],
    findings: [
      {
        code: "invalid-recipe-value",
        file: "app/page.tsx",
        line: 8,
        column: 13,
        message: 'Card: "glass" is not a variant value (valid: outline, elevated, filled, unstyled)',
      },
    ],
    description: {
      title: "Card loses its border with variant glass",
      happened: "The card renders flat, with no border or background.",
    },
    ...overrides,
  };
}
