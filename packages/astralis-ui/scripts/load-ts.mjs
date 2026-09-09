/**
 * Import a dependency-free TypeScript module from src/ in plain Node, before
 * dist exists: esbuild bundles it to a temporary ESM file.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { build } from "esbuild";

export const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

/** `loadTs("theme/token-spec.ts", "const/channel.ts")` -> their module namespaces, in order. */
export async function loadTs(...relPaths) {
  const dir = mkdtempSync(join(tmpdir(), "astralis-ts-"));
  try {
    return await Promise.all(
      relPaths.map(async (rel, i) => {
        const outfile = join(dir, `${i}.mjs`);
        await build({
          entryPoints: [join(SRC, rel)],
          bundle: true,
          format: "esm",
          platform: "node",
          outfile,
          logLevel: "error",
        });
        return import(pathToFileURL(outfile).href);
      }),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
