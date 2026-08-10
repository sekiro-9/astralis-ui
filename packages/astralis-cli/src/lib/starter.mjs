import { join, dirname } from "node:path";

/**
 * The welcome screen `astralis create` leaves behind.
 *
 * Scope is deliberately one file. The scaffolder owns the project — router,
 * config, folder layout, tooling — and we replace only what it put on screen.
 * The moment this starts making structural decisions, Astralis owns a template,
 * and templates rot behind the framework they wrap. That is the cost the
 * wrap-the-official-scaffolder design exists to avoid.
 *
 * It earns its place by being an assertion rather than decoration: if the
 * provider, the stylesheet and the token pipeline are all wired correctly you
 * see this render. If `init` half-worked, it is visible immediately instead of
 * hiding until the first component is used.
 *
 * No hooks, so it stays a Server Component under Next without a "use client"
 * banner — ThemeToggle carries its own.
 */

/**
 * Every astralis-ui export the starter uses. The gate in test/ asserts these
 * are real exports, and that this list matches what the source actually imports.
 *
 * Flat parts (CardRoot, CardBody) rather than Card.Body: under Next this file
 * is `app/page.tsx`, a Server Component, and namespace access on a
 * client-reference stub is undefined across the RSC boundary. Same rule the
 * block authoring gate enforces, for the same reason.
 */
export const STARTER_IMPORTS = [
  "Badge",
  "Button",
  "CardBody",
  "CardRoot",
  "Code",
  "Container",
  "Flex",
  "Heading",
  "Stack",
  "Text",
  "ThemeToggle",
];

function starterSource() {
  return `import {
  ${STARTER_IMPORTS.join(",\n  ")},
} from "astralis-ui";

/**
 * Astralis is wired up — this screen is rendering through the provider, the
 * precompiled stylesheet and the token scales.
 *
 * It is an ordinary file in your project. Edit it, or delete it and start over.
 */
/**
 * The Astralis mark — an eight-point compass rose. Painted with the brand
 * token rather than fixed hex, so it re-colours with the rest of the theme.
 */
const ROTATIONS = [0, 90, 180, 270];

function AstralisMark() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      {ROTATIONS.map((deg) => (
        <g key={\`d\${deg}\`} transform={\`rotate(\${deg} 16 16)\`}>
          <path d="M22.8 9.2 L17.7 11.1 L16 16 Z" fill="var(--astralis-color-brand-500)" />
          <path d="M22.8 9.2 L20.9 14.3 L16 16 Z" fill="var(--astralis-color-brand-300)" />
        </g>
      ))}
      {ROTATIONS.map((deg) => (
        <g key={\`c\${deg}\`} transform={\`rotate(\${deg} 16 16)\`}>
          <path d="M16 0.8 L14.15 12.4 L16 16 Z" fill="var(--astralis-color-brand-200)" />
          <path d="M16 0.8 L17.85 12.4 L16 16 Z" fill="var(--astralis-color-brand-500)" />
        </g>
      ))}
    </svg>
  );
}

export default function Welcome() {
  return (
    <Container maxW="4xl" px={{ base: "6", lg: "8" }} py={{ base: "16", lg: "24" }}>
      <Stack gap="10" alignItems="stretch">
        <Flex justifyContent="between" alignItems="center" gap="4">
          <Flex alignItems="center" gap="3">
            <AstralisMark />
            <Badge variant="subtle" colorScheme="brand" size="xs">
              Astralis UI
            </Badge>
          </Flex>
          <ThemeToggle variant="text" colorScheme="gray" size="sm" aria-label="Toggle theme" />
        </Flex>

        <Stack gap="4" alignItems="start">
          <Heading as="h1" size={{ base: "2xl", lg: "3xl" }} weight="semibold" letterSpacing="tight">
            You&apos;re set up.
          </Heading>
          <Text size="lg" color="muted" lineHeight="relaxed">
            Everything here is themed through one accent channel. Change{" "}
            <Code>colorScheme</Code> on any component and the rest follows — no
            rebuild, no Tailwind config in your project.
          </Text>
        </Stack>

        {/* as="a" — Button is polymorphic, so these are real links rather than
            buttons that look clickable and do nothing. */}
        <Flex gap="3" wrap="wrap">
          <Button
            as="a"
            href="https://astralis-zeta.vercel.app/docs/quick-start"
            target="_blank"
            rel="noreferrer"
            size="lg"
            colorScheme="brand"
          >
            Get started
          </Button>
          <Button
            as="a"
            href="https://astralis-zeta.vercel.app/docs"
            target="_blank"
            rel="noreferrer"
            size="lg"
            variant="outline"
            colorScheme="gray"
          >
            Read the docs
          </Button>
        </Flex>

        {/* No width prop on Card by design — the Stack above stretches it. */}
        <CardRoot variant="outline" size="lg">
          <CardBody>
            <Stack gap="3" alignItems="start">
              <Heading as="h2" size="md" weight="semibold">
                Try it
              </Heading>
              <Text color="muted" lineHeight="relaxed">
                Drop in a prebuilt section with <Code>astralis add hero-01</Code>,
                or import anything from <Code>astralis-ui</Code> and compose your
                own.
              </Text>
              <Flex gap="2" wrap="wrap">
                <Badge variant="subtle" colorScheme="green" size="xs">
                  green
                </Badge>
                <Badge variant="subtle" colorScheme="blue" size="xs">
                  blue
                </Badge>
                <Badge variant="subtle" colorScheme="purple" size="xs">
                  purple
                </Badge>
                <Badge variant="subtle" colorScheme="orange" size="xs">
                  orange
                </Badge>
              </Flex>
            </Stack>
          </CardBody>
        </CardRoot>
      </Stack>
    </Container>
  );
}
`;
}

/**
 * Where the welcome screen goes, derived from the entry file `init` already
 * located — so this never has to guess at the project's layout a second time.
 *
 * Next renders `page.tsx` beside the root layout; Vite renders `App.tsx`
 * beside `main.tsx`. The extension follows the entry, so a JavaScript project
 * gets .jsx (the source carries no type annotations either way).
 */
export function starterTarget(framework, entryPath) {
  const dir = dirname(entryPath);
  const ext = entryPath.endsWith("x") ? (entryPath.endsWith(".tsx") ? "tsx" : "jsx") : "tsx";
  return join(dir, framework === "next" ? `page.${ext}` : `App.${ext}`);
}

export function starterFile(framework, entryPath) {
  return { path: starterTarget(framework, entryPath), source: starterSource() };
}

/**
 * The stylesheet the Vite template ships to style its demo, and which fights
 * anything you put in its place:
 *
 *   #root { text-align: center; display: flex; max-width; margin: 0 auto }
 *   :root { font; color; background; color-scheme: light dark }
 *
 * Left in place it centres text that was authored left-aligned, overrides the
 * type scale, and paints the page from the OS colour scheme rather than the
 * provider's — so toggling to light left dark bars either side of the content.
 *
 * Replaced rather than deleted: main.tsx imports it, and the import is the
 * natural place for a consumer to put their own global CSS.
 */
const VITE_RESET = `/*
 * Your global stylesheet.
 *
 * Astralis ships its own reset inside astralis-ui/styles.css, scoped so it
 * cannot leak into the rest of your app. The Vite template's demo styles were
 * removed from here because they centred and re-coloured everything.
 */
html,
body,
#root {
  margin: 0;
  min-height: 100%;
}
`;

/**
 * Files the scaffolder wrote purely to dress its demo, which stop being true
 * the moment the demo is replaced. Vite only — create-next-app's globals.css
 * may hold the Tailwind directives the user asked for, so it is never touched.
 */
export function starterCleanup(framework, entryPath) {
  if (framework !== "vite") return { rewrite: [], remove: [] };
  const dir = dirname(entryPath);
  return {
    rewrite: [{ path: join(dir, "index.css"), source: VITE_RESET }],
    // Styled the old App.tsx, which no longer exists to import it.
    remove: [join(dir, "App.css")],
  };
}
