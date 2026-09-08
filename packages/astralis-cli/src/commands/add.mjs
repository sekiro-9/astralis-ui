import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { ok, warn, info, fail, cyan, dim, bold, confirm, isAssumeYes, posix } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { readPackageJson, detectPackageManager } from "../lib/detect.mjs";
import { resolveBlocksDir } from "../lib/blocks-dir.mjs";
import { registryBase, fetchIndex, fetchBlock, isBlockId, resolveBlockFile } from "../lib/registry.mjs";

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
  const args = parseCommandArgs(commandNamed("add"), argv);
  if (!args) return;
  const { values, positionals } = args;

  const cwd = process.cwd();
  const base = registryBase(values.registry);

  if (values.list) return printCatalogue((await fetchIndex(base)).blocks);

  if (positionals.length === 0) {
    fail(`Name at least one block, or list them with ${cyan("astralis add --list")}.`);
  }

  const badIds = positionals.filter((id) => !isBlockId(id));
  if (badIds.length > 0) {
    fail(`Not a block id: ${badIds.map((id) => cyan(id)).join(", ")} — ids are lowercase, like hero-01.`);
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

  // Every destination is checked before the first write, so a bad entry
  // leaves the project untouched rather than half-written.
  const writes = items.flatMap((block) =>
    (Array.isArray(block.contents) ? block.contents : []).map((file) => {
      const path = resolveBlockFile(target, file?.path);
      if (!path || typeof file.content !== "string") {
        fail(`The registry entry for ${cyan(block.id)} has an unsafe or malformed file (${JSON.stringify(file?.path)}) — nothing was written.`);
      }
      return { path, content: file.content };
    }),
  );

  console.log("");
  info(
    `Writing to ${cyan(posix(dirRelative))}` +
      (source === "default" ? "" : dim(` (from ${source})`)),
  );

  /* --- write ------------------------------------------------------------- */
  let written = 0;
  let skipped = 0;

  for (const { path, content } of writes) {
    const shown = posix(relative(cwd, path));

    if (existsSync(path) && !values.overwrite) {
      if (dryRun || isAssumeYes()) {
        warn(`${shown} ${dim(dryRun ? "exists — would ask before replacing" : "exists — skipped; --overwrite replaces it")}`);
        skipped += 1;
        continue;
      }
      const replace = await confirm(`${shown} already exists. Replace it?`, {
        hint: "Pass --overwrite to replace existing files.",
      });
      if (!replace) {
        warn(`skipped ${shown}`);
        skipped += 1;
        continue;
      }
    }

    if (dryRun) {
      ok(`${shown} ${dim(`(${Buffer.byteLength(content)} bytes)`)}`);
    } else {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
      ok(shown);
    }
    written += 1;
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
