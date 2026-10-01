import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createServer } from "node:http";
import { isBlockId, resolveBlockFile, fetchWithTimeout, registryBase } from "../src/lib/registry.mjs";
import { tempProject, runCli, serve } from "./helpers.mjs";

const HERO = {
  id: "hero-01",
  name: "Hero 01",
  component: "Hero01",
  contents: [{ path: "hero-01.tsx", content: "export function Hero01() { return null; }\n" }],
};

test("block ids are lowercase words and dashes", () => {
  for (const id of ["hero-01", "dashboard-02", "a"]) assert.equal(isBlockId(id), true, id);
  for (const id of ["../x", "Hero-01", "hero_01", "hero-", "", "a/b", "hero-01.json"]) {
    assert.equal(isBlockId(id), false, id);
  }
});

/* CLI-F3: registry paths went straight into join(target, path). */
test("registry file paths may not leave the target directory", () => {
  const target = resolve("/project/src/components/blocks");
  assert.equal(resolveBlockFile(target, "hero-01.tsx"), join(target, "hero-01.tsx"));
  assert.equal(resolveBlockFile(target, "parts/cta.tsx"), join(target, "parts", "cta.tsx"));
  for (const bad of [
    "../../../../escaped.txt",
    "parts/../../x.tsx",
    "..\\x.tsx",
    "/etc/passwd",
    "\\\\server\\share\\x",
    "C:\\x.tsx",
    "c:x.tsx",
    "",
    "a//b.tsx",
    "x\0.tsx",
    undefined,
    42,
  ]) {
    assert.equal(resolveBlockFile(target, bad), null, JSON.stringify(bad));
  }
});

test("add refuses a registry entry that writes outside the project, and writes nothing", async () => {
  const evil = {
    ...HERO,
    id: "evil-01",
    contents: [
      { path: "ok.tsx", content: "export {};\n" },
      { path: "../../../../escaped.txt", content: "pwned" },
    ],
  };
  const registry = await serve({ "/r/evil-01.json": evil });
  const project = tempProject({ "package.json": { name: "x", dependencies: { "astralis-ui": "*" } }, "src/.keep": "" });
  try {
    const result = await runCli(["add", "evil-01", "--registry", `${registry.url}/r`], { cwd: project.dir });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /unsafe or malformed file/);
    assert.equal(existsSync(join(project.dir, "src/components/blocks/ok.tsx")), false);
    assert.equal(existsSync(resolve(project.dir, "src/components/blocks", "../../../../escaped.txt")), false);
  } finally {
    project.cleanup();
    await registry.close();
  }
});

test("add rejects an id that isn't one before touching the network", async () => {
  const project = tempProject({ "package.json": { name: "x" } });
  try {
    const result = await runCli(["add", "../../secrets", "--registry", "http://127.0.0.1:9/r"], { cwd: project.dir });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Not a block id/);
  } finally {
    project.cleanup();
  }
});

test("add writes a block into src/components/blocks and prints the import", async () => {
  const registry = await serve({ "/r/hero-01.json": HERO });
  const project = tempProject({ "package.json": { name: "x", dependencies: { "astralis-ui": "*" } }, "src/.keep": "" });
  try {
    const result = await runCli(["add", "hero-01", "--registry", `${registry.url}/r`], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    const written = join(project.dir, "src/components/blocks/hero-01.tsx");
    assert.equal(readFileSync(written, "utf8"), HERO.contents[0].content);
    assert.match(result.stdout, /import \{ Hero01 \} from "@\/components\/blocks\/hero-01";/);
  } finally {
    project.cleanup();
    await registry.close();
  }
});

/* CLI-F14: a registry that accepts the connection and never answers used to hang add forever. */
test("a registry that never answers times out with a readable error", async () => {
  const sockets = new Set();
  const server = createServer(() => {}); // accepts, never responds
  server.on("connection", (socket) => sockets.add(socket));
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  try {
    await assert.rejects(
      fetchWithTimeout(`http://127.0.0.1:${server.address().port}/r/index.json`, 200),
      /timed out after 0\.2s/,
    );
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise((done) => server.close(done));
  }
});

test("an empty ASTRALIS_REGISTRY falls back to the default host", () => {
  const saved = process.env.ASTRALIS_REGISTRY;
  process.env.ASTRALIS_REGISTRY = "";
  try {
    assert.equal(registryBase(undefined), "https://astralis-ui.com/r");
    assert.equal(registryBase("http://localhost:3000/r/"), "http://localhost:3000/r");
  } finally {
    if (saved === undefined) delete process.env.ASTRALIS_REGISTRY;
    else process.env.ASTRALIS_REGISTRY = saved;
  }
});

test("add reports an unknown block id", async () => {
  const registry = await serve({});
  const project = tempProject({ "package.json": { name: "x" } });
  try {
    const result = await runCli(["add", "nope-01", "--registry", `${registry.url}/r`], { cwd: project.dir });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /No block called nope-01/);
  } finally {
    project.cleanup();
    await registry.close();
  }
});
