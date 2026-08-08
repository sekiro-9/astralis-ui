import { parseArgs } from "node:util";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { ok, warn, info, fail, cyan, dim, bold, confirm } from "../lib/ui.mjs";
import { readPackageJson, detectPackageManager } from "../lib/detect.mjs";
import { resolveBlocksDir } from "../lib/blocks-dir.mjs";
import { registryBase, fetchIndex, fetchBlock } from "../lib/registry.mjs";

/**
 * Copies a block's source into the project.
 *
 * This is deliberately small compared with the equivalent in other libraries,
 * and the reason is architectural: a block imports only astralis-ui, react, or
 * a sibling file — the registry builder rejects anything else — and the
 * stylesheet is precompiled. So there is no import rewriting to consumer
 * aliases, no dependency graph between blocks, and no Tailwind config to
 * merge. Fetch text, write files, check one dependency.
 */

const USAGE = `Usage: astralis add <block>... [options]

  Copies a block's source into your project. The files are yours after that —
  no dependency to configure around.

  Options
    --list              print every available block and exit
    --dir <path>        where to write (default: [src/]components/blocks)
    --overwrite         replace existing files without asking
    --dry-run           show what would be written, write nothing
    --registry <url>    read from a different registry host
    -h, --help          this message

  Examples
    astralis add hero-01
    astralis add login-01 dashboard-02 --dir src/ui/blocks
    astralis add --list
`;

/** Group ids by category for a readable --list. */
function printCatalogue(blocks) {
  const byCategory = new Map();
  for (const block of blocks) {
    if (!byCategory.has(block.category)) byCategory.set(block.category, []);
    byCategory.get(block.category).push(block);
  }

  console.log(`\n${bold("Available blocks")} ${dim(`(${blocks.length})`)}\n`);
  for (const [category, items] of [...byCategory].sort()) {
    console.log(`  ${bold(category)}`);
    for (const item of items.sort((a, b) => a.id.localeCompare(b.id))) {
      console.log(`    ${cyan(item.id.padEnd(22))} ${dim(item.name)}`);
    }
    console.log("");
  }
  console.log(`  ${dim(`Add one with ${cyan("astralis add <id>")}`)}\n`);
}

export async function run(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        list: { type: "boolean", default: false },
        dir: { type: "string" },
        overwrite: { type: "boolean", default: false },
        "dry-run": { type: "boolean", default: false },
        registry: { type: "string" },
        help: { type: "boolean", short: "h", default: false },
      },
    });
  } catch (error) {
    fail(`${error.message}\n\n${USAGE}`);
  }

  const { values, positionals } = parsed;
  if (values.help) return console.log(USAGE);

  const cwd = process.cwd();
  const base = registryBase(values.registry);

  if (values.list) return printCatalogue((await fetchIndex(base)).blocks);

  if (positionals.length === 0) {
    fail(`Name at least one block — try ${cyan("astralis add --list")}.\n\n${USAGE}`);
  }

  /* --- resolve every id before writing anything -------------------------- */
  const items = [];
  for (const id of positionals) {
    const block = await fetchBlock(base, id);
    if (!block) {
      fail(
        `No block called ${cyan(id)}.\n` +
          `  Run ${cyan("astralis add --list")} to see what exists.`,
      );
    }
    items.push(block);
  }

  const { relative: dirRelative, source } = resolveBlocksDir(cwd, values.dir);
  const target = join(cwd, dirRelative);
  const dryRun = values["dry-run"];

  // Paths are shown forward-slashed on every platform: they end up in an
  // import statement, where a Windows separator would be wrong anyway.
  const posix = (path) => path.split("\\").join("/");

  console.log("");
  info(
    `Writing to ${cyan(posix(dirRelative))}` +
      (source === "default" ? "" : dim(` (from ${source})`)),
  );

  /* --- write ------------------------------------------------------------- */
  let written = 0;
  let skipped = 0;

  for (const block of items) {
    for (const file of block.contents) {
      const path = join(target, file.path);
      const shown = posix(relative(cwd, path));

      if (existsSync(path) && !values.overwrite) {
        if (dryRun) {
          warn(`${shown} ${dim("exists — would ask before replacing")}`);
          skipped += 1;
          continue;
        }
        const replace = await confirm(`${shown} already exists. Replace it?`);
        if (!replace) {
          warn(`skipped ${shown}`);
          skipped += 1;
          continue;
        }
      }

      if (dryRun) {
        ok(`${shown} ${dim(`(${Buffer.byteLength(file.content)} bytes)`)}`);
      } else {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, file.content);
        ok(shown);
      }
      written += 1;
    }
  }

  /* --- the one dependency a block actually has --------------------------- */
  const pkg = readPackageJson(cwd);
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  if (pkg && !deps["astralis-ui"]) {
    const pm = detectPackageManager(cwd);
    const install = pm === "npm" ? "npm install" : `${pm} add`;
    console.log("");
    warn(
      `astralis-ui is not in this project's dependencies — the block will not compile.\n` +
        `  Run ${cyan(`${install} astralis-ui`)}, or ${cyan("astralis init")} to wire it up fully.`,
    );
  }

  console.log("");
  const verb = dryRun ? "would write" : "wrote";
  console.log(
    `${verb} ${bold(String(written))} file(s)` +
      (skipped ? dim(`, skipped ${skipped}`) : "") +
      (dryRun ? dim(" — dry run, nothing changed") : ""),
  );
  if (!dryRun && written) {
    const first = items[0];
    const alias = posix(dirRelative.replace(/^src[\\/]/, ""));
    const file = first.contents[0].path.replace(/\.tsx?$/, "");
    console.log(dim(`  import { ${first.component} } from "@/${alias}/${file}";`));
  }
  console.log("");
}
