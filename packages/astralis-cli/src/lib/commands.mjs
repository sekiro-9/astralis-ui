/**
 * The one command table. `--help`, the argument parser, the README and the
 * docs site's CLI reference are all generated from it; test/reference.test.mjs
 * fails when the README or docs page drift.
 *
 * Option fields: name, short?, type ("boolean" | "string"), arg? (placeholder
 * for a string's value), description, default? (shown, not applied), group?.
 */

export const DOCS_URL = "https://astralis-zeta.vercel.app/docs/cli";

export const GLOBAL_OPTIONS = [
  {
    name: "yes",
    short: "y",
    type: "boolean",
    description: "Never prompt; take the default answer. Replacing files still needs --overwrite or --force.",
  },
  { name: "help", short: "h", type: "boolean", description: "Show this command's options." },
  { name: "debug", type: "boolean", description: "Print the stack trace if something fails unexpectedly." },
];

export const COMMANDS = [
  {
    name: "create",
    args: "<name>",
    maxPositionals: 1,
    passthrough: true,
    summary: "Scaffold a new project with create-next-app or create-vite and wire Astralis into it",
    options: [
      { name: "framework", type: "string", arg: "next|vite", description: "Skip the framework prompt." },
      {
        name: "no-starter",
        type: "boolean",
        description: "Keep the scaffolder's demo page instead of the Astralis welcome screen.",
      },
    ],
    notes: ["Any other argument passes straight to the scaffolder."],
    examples: ["astralis create my-app", "astralis create my-app --framework vite --template react"],
  },
  {
    name: "init",
    args: "",
    maxPositionals: 0,
    summary: "Wire astralis-ui into an existing Next.js or React + Vite project",
    options: [
      { name: "dry-run", type: "boolean", description: "Show the changes without writing anything." },
      {
        name: "ci",
        type: "boolean",
        description:
          "Also check every pull request: pin astralis-cli, add a validate script and write a GitHub Actions workflow.",
      },
      { name: "force", type: "boolean", description: "With --ci, replace an existing astralis-validate.yml." },
    ],
    notes: ["init --ci is safe to re-run: it adds only what is missing and never replaces a workflow without --force."],
    examples: ["astralis init", "astralis init --dry-run", "astralis init --ci"],
  },
  {
    name: "add",
    args: "<block...>",
    maxPositionals: Infinity,
    summary: "Copy a block's source into this project",
    options: [
      { name: "list", type: "boolean", description: "Print every available block, by category, and exit." },
      {
        name: "dir",
        type: "string",
        arg: "path",
        description: "Where to write.",
        default: "src/components/blocks, or components/blocks without a src/",
      },
      { name: "overwrite", type: "boolean", description: "Replace existing files without asking." },
      { name: "dry-run", type: "boolean", description: "Show what would be written; write nothing." },
      { name: "registry", type: "string", arg: "url", description: "Read blocks from a different registry host." },
    ],
    examples: ["astralis add hero-01", "astralis add login-01 dashboard-02 --dir src/ui/blocks", "astralis add --list"],
  },
  {
    name: "theme",
    args: "[hex]",
    maxPositionals: 1,
    summary: "Generate a static theme stylesheet from a seed",
    options: [
      { group: "Colours", name: "brand", type: "string", arg: "hex", description: 'Brand hue, e.g. "#8b5cf6". A bare hex argument means the same.' },
      { group: "Colours", name: "gray", type: "string", arg: "hex", description: "Neutral hue: every surface, label and border." },
      { group: "Status", name: "error", type: "string", arg: "hex", description: "Seeds the error palette.", default: "red" },
      { group: "Status", name: "warning", type: "string", arg: "hex", description: "Seeds the warning palette.", default: "orange" },
      { group: "Status", name: "success", type: "string", arg: "hex", description: "Seeds the success palette.", default: "green" },
      { group: "Status", name: "info", type: "string", arg: "hex", description: "Seeds the info palette.", default: "blue" },
      { group: "Typefaces", name: "font-heading", type: "string", arg: "stack", description: "Heading font stack." },
      { group: "Typefaces", name: "font-body", type: "string", arg: "stack", description: "Body font stack." },
      { group: "Typefaces", name: "font-mono", type: "string", arg: "stack", description: "Monospace font stack." },
      { group: "Scales", name: "radius", type: "string", arg: "n", description: "Border-radius multiplier.", default: "1" },
      { group: "Scales", name: "spacing", type: "string", arg: "n", description: "Spacing multiplier: the density dial.", default: "1" },
      { group: "Scales", name: "font-scale", type: "string", arg: "n", description: "Font-size multiplier.", default: "1" },
      { group: "Scales", name: "motion", type: "string", arg: "n", description: "Duration multiplier; 0 turns transitions off.", default: "1" },
      {
        group: "Output",
        name: "out",
        type: "string",
        arg: "file",
        description: "Where to write the stylesheet.",
        default: "src/astralis-theme.css, or astralis-theme.css without a src/",
      },
      { group: "Output", name: "force", type: "boolean", description: "Overwrite an existing file." },
      { group: "Output", name: "no-import", type: "boolean", description: "Write the file but leave the entry file alone." },
      {
        group: "Output",
        name: "strict-contrast",
        type: "boolean",
        description: "Exit 1, writing nothing, if any promised pairing fails WCAG AA.",
      },
    ],
    notes: ["The status hues' own colorScheme values are never altered; each status seeds its own palette."],
    examples: ['astralis theme "#8b5cf6"', 'astralis theme --brand "#8b5cf6" --gray "#64748b" --radius 1.5'],
  },
  {
    name: "validate",
    args: "[paths...]",
    maxPositionals: Infinity,
    summary: "Check TSX and JSX against the installed design system",
    options: [
      {
        name: "format",
        type: "string",
        arg: "text|json|github",
        description: "How to report: text for people, json for tools, github for inline pull-request annotations.",
        default: "github inside GitHub Actions, text elsewhere",
      },
      { name: "json", type: "boolean", description: "Same as --format json." },
      {
        name: "spec",
        type: "string",
        arg: "path",
        description: "Validate against this system-spec.json.",
        default: "the installed astralis-ui's",
      },
      { name: "strict-tokens", type: "boolean", description: "Also warn on raw colors that bypass the tokens." },
    ],
    notes: [
      "With no paths it checks the current directory, skipping node_modules and build output.",
      "Exits 1 when there are errors; warnings are reported but never fail the run.",
    ],
    examples: ["astralis validate", "astralis validate src/components --json", "astralis validate --strict-tokens"],
  },
  {
    name: "connect-mcp",
    args: "",
    maxPositionals: 0,
    summary: "Connect an AI coding agent to the Astralis MCP docs server",
    options: [
      {
        name: "client",
        type: "string",
        arg: "claude-code|codex|cursor|claude-desktop|antigravity",
        description: "Skip the prompt and configure this client.",
      },
    ],
    examples: ["astralis connect-mcp", "astralis connect-mcp --client cursor --yes"],
  },
];

export const commandNamed = (name) => COMMANDS.find((command) => command.name === name);
