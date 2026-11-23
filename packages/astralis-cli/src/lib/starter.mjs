import { join, dirname, extname } from "node:path";

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
 * Flat parts (Card, CardBody) rather than Card.Body: under Next this file
 * is `app/page.tsx`, a Server Component, and namespace access on a
 * client-reference stub is undefined across the RSC boundary. Same rule the
 * block authoring gate enforces, for the same reason.
 */
export const STARTER_IMPORTS = [
  "Badge",
  "Box",
  "Button",
  "Card",
  "CardBody",
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
 * The Astralis mark: four blocks, the last still being placed. Painted with
 * the brand token, so it re-colours with your theme, and the last block
 * settles into place on hover.
 */
function AstralisLogo() {
  return (
    <Flex className="starter-logo" alignItems="center" gap="2" color="base">
      <style>{\`
        .starter-block {
          transform-box: fill-box;
          transform-origin: center;
          rotate: 14deg;
          opacity: 0.6;
          transition: rotate 300ms ease-out, translate 300ms ease-out, opacity 300ms ease-out;
        }
        .starter-logo:hover .starter-block { rotate: 0deg; translate: -2px 2px; opacity: 1; }
        @media (prefers-reduced-motion: reduce) { .starter-block { transition: none; } }
      \`}</style>
      <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true" style={{ overflow: "visible" }}>
        <g fill="var(--astralis-color-brand-500)">
          <rect x="3" y="17" width="12" height="12" rx="3" />
          <rect x="17" y="17" width="12" height="12" rx="3" />
          <rect x="3" y="3" width="12" height="12" rx="3" />
          <rect className="starter-block" x="19" y="1" width="12" height="12" rx="3" />
        </g>
      </svg>
      {/* 15px and 10px sit between the type scale's steps. */}
      <Text as="span" fontFamily="heading" weight="semibold" letterSpacing="tight" lineHeight="normal" style={{ fontSize: "15px" }}>
        Astralis
        <Box
          as="span"
          ml="1.5"
          px="1.5"
          py="0.5"
          rounded="md"
          border="normal"
          borderColor="base"
          bg="subtle"
          color="muted"
          style={{
            verticalAlign: "middle",
            fontSize: "10px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          UI
        </Box>
      </Text>
    </Flex>
  );
}

/**
 * Astralis is wired up: this screen renders through the provider, the
 * precompiled stylesheet and the token scales.
 *
 * It is an ordinary file in your project. Edit it, or delete it and start over.
 */
export default function Welcome() {
  return (
    <Container maxW="4xl" px={{ base: "6", lg: "8" }} py={{ base: "16", lg: "24" }}>
      <Stack gap="10" alignItems="stretch">
        <Flex justifyContent="between" alignItems="center" gap="4">
          <AstralisLogo />
          <ThemeToggle variant="text" colorScheme="gray" size="sm" aria-label="Toggle theme" />
        </Flex>

        <Stack gap="4" alignItems="start">
          <Heading as="h1" size={{ base: "2xl", lg: "3xl" }} weight="semibold" letterSpacing="tight">
            You&apos;re set up.
          </Heading>
          <Text size="lg" color="muted" lineHeight="relaxed">
            Welcome to Astralis. Your project is ready: edit this page to start building, add
            ready-made blocks from the CLI, or browse the docs to see every component.
          </Text>
        </Stack>

        {/* as="a" — Button is polymorphic, so these are real links rather than
            buttons that look clickable and do nothing. */}
        <Flex gap="3" wrap="wrap">
          <Button
            as="a"
            href="https://astralis-ui.com/docs/quick-start"
            target="_blank"
            rel="noreferrer"
            size="lg"
            colorScheme="brand"
          >
            Get started
          </Button>
          <Button
            as="a"
            href="https://astralis-ui.com/docs"
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
        <Card variant="outline" size="lg">
          <CardBody>
            <Stack gap="3" alignItems="start">
              <Heading as="h2" size="md" weight="semibold">
                Try it
              </Heading>
              <Text color="muted" lineHeight="relaxed">
                Drop in a prebuilt section with <Code>npx astralis-cli add hero-01</Code>,
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
        </Card>
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
 * gets .jsx or .js (the source carries no type annotations either way).
 */
export function starterTarget(framework, entryPath) {
  const dir = dirname(entryPath);
  const ext = extname(entryPath).slice(1);
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
