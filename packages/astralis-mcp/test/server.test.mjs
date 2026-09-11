import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/* A stdio smoke test of the real server process, against a docs site that's down or faked. */

const SERVER = fileURLToPath(new URL("../server.mjs", import.meta.url));
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
// The library's built spec, from the monorepo (a stand-in for a project's installed copy).
const SPEC_FILE = fileURLToPath(new URL("../../astralis-ui/dist/system-spec.json", import.meta.url));

const scratch = mkdtempSync(join(tmpdir(), "astralis-mcp-test-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

/** Start the server with the given docs URL and cwd; returns a connected client. */
async function connect(docsUrl, cwd = scratch) {
  const client = new Client({ name: "smoke-test", version: "0.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [SERVER],
      cwd,
      env: { ...process.env, ASTRALIS_DOCS_URL: docsUrl },
      stderr: "pipe",
    }),
  );
  return client;
}

const call = (client, name, args = {}) => client.callTool({ name, arguments: args });
const text = (result) => result.content.map((c) => c.text).join("\n");

/** A fake docs site; `routes` values are bodies, { status, body }, or functions returning either. */
async function fakeSite(routes) {
  const requests = [];
  const server = createServer((request, response) => {
    requests.push(request.url);
    let route = routes[request.url];
    if (typeof route === "function") route = route();
    if (route === undefined) {
      response.statusCode = 404;
      return response.end("not found");
    }
    const { status = 200, body } = typeof route === "object" && "body" in route ? route : { body: route };
    response.statusCode = status;
    response.end(typeof body === "string" ? body : JSON.stringify(body));
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    requests,
    close: () => new Promise((done) => server.close(done)),
  };
}

const LLMS = `# Astralis UI

## Getting Started

- [Theming](https://x/docs/theming.md): Tokens and dark mode
- [Tokens](https://x/docs/tokens.md): Every scale

## Components

- [Button](https://x/docs/components/button.md): Clickable action
- [Modal](https://x/docs/components/modal.md): Dialog with a focus trap
`;

const LLMS_FULL = `# Astralis UI — full documentation

---

<!-- Getting Started / Theming — /docs/theming -->

# Theming

Brand colour at runtime.

---

<!-- Components / Button — /docs/components/button -->

# Button

Variants: solid, outline.

---

<!-- Components / Modal — /docs/components/modal -->

# Modal

Traps focus: the focus trap returns focus to the trigger on close.
`;

test("initialize, then list eight read-only tools", async () => {
  const client = await connect("http://127.0.0.1:9");
  try {
    assert.equal(client.getServerVersion().version, pkg.version);
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name).sort(), [
      "get_block", "get_component", "get_guide", "get_theming",
      "list_blocks", "list_components", "search_docs", "validate_code",
    ]);
    for (const tool of tools) {
      assert.equal(tool.annotations?.readOnlyHint, true, tool.name);
      assert.equal(typeof tool.title, "string", tool.name);
    }
  } finally {
    await client.close();
  }
});

/* MCP-F6 / F7: offline, get_component said "Unknown component" and get_theming returned an empty success. */
test("offline, every docs tool returns an error that says the site is unreachable", async () => {
  const client = await connect("http://127.0.0.1:9");
  try {
    for (const [name, args] of [
      ["get_component", { slug: "button" }],
      ["get_guide", { slug: "theming" }],
      ["get_theming", {}],
      ["search_docs", { query: "focus" }],
      ["list_components", {}],
      ["list_blocks", {}],
      ["get_block", { id: "hero-01" }],
      ["validate_code", { code: "<div />" }],
    ]) {
      const result = await call(client, name, args);
      assert.equal(result.isError, true, name);
      assert.match(text(result), /Could not reach the Astralis docs/, name);
      assert.doesNotMatch(text(result), /Unknown/, name);
    }
  } finally {
    await client.close();
  }
});

test("a real 404 is still an unknown slug, and a 500 is not", async () => {
  const site = await fakeSite({
    "/llms.txt": LLMS,
    "/docs/components/button.md": "# Button\n",
    "/docs/components/broken.md": { status: 500, body: "boom" },
  });
  const client = await connect(site.url);
  try {
    assert.equal(text(await call(client, "get_component", { slug: "button" })), "# Button\n");
    const unknown = await call(client, "get_component", { slug: "nope" });
    assert.equal(unknown.isError, true);
    assert.match(text(unknown), /Unknown component "nope"/);
    const broken = await call(client, "get_component", { slug: "broken" });
    assert.equal(broken.isError, true);
    assert.match(text(broken), /500/);
    assert.doesNotMatch(text(broken), /Unknown component/);
  } finally {
    await client.close();
    await site.close();
  }
});

test("get_theming is an error when either half is missing", async () => {
  const site = await fakeSite({ "/docs/theming.md": "# Theming\n" });
  const client = await connect(site.url);
  try {
    const result = await call(client, "get_theming");
    assert.equal(result.isError, true);
    assert.match(text(result), /tokens/);
  } finally {
    await client.close();
    await site.close();
  }
});

/* MCP-F16: a cold search fetched every page one after another. */
test("search_docs reads the one-file corpus, not every page", async () => {
  const site = await fakeSite({ "/llms.txt": LLMS, "/llms-full.txt": LLMS_FULL });
  const client = await connect(site.url);
  try {
    const hits = JSON.parse(text(await call(client, "search_docs", { query: "Focus Trap" })));
    assert.deepEqual(hits.map((h) => h.slug), ["modal"]);
    assert.equal(hits[0].kind, "component");
    assert.equal(hits[0].description, "Dialog with a focus trap");
    assert.match(hits[0].snippet, /the focus trap returns focus/);
    assert.deepEqual([...new Set(site.requests)].sort(), ["/llms-full.txt", "/llms.txt"]);
    assert.equal(text(await call(client, "search_docs", { query: "zzz" })), "No matches.");
  } finally {
    await client.close();
    await site.close();
  }
});

/* MCP-1: remote text reached the agent with no size limit. */
test("an oversized response is refused, not passed to the agent", async () => {
  const site = await fakeSite({ "/docs/components/huge.md": "x".repeat(6_000_000) });
  const client = await connect(site.url);
  try {
    const result = await call(client, "get_component", { slug: "huge" });
    assert.equal(result.isError, true);
    assert.match(text(result), /larger than/);
  } finally {
    await client.close();
    await site.close();
  }
});

test("validate_code judges against the project's installed spec", async () => {
  const project = join(scratch, "project");
  mkdirSync(join(project, "node_modules", "astralis-ui", "dist"), { recursive: true });
  copyFileSync(SPEC_FILE, join(project, "node_modules", "astralis-ui", "dist", "system-spec.json"));
  const client = await connect("http://127.0.0.1:9", project);
  try {
    const result = await call(client, "validate_code", {
      code: 'import { Button } from "astralis-ui";\nexport const A = () => <Button variant="primary">x</Button>;',
    });
    assert.equal(result.isError, false);
    const verdict = JSON.parse(text(result));
    assert.equal(verdict.valid, false);
    assert.equal(verdict.spec.source, "installed astralis-ui");
    assert.equal(verdict.errors[0].code, "invalid-recipe-value");
  } finally {
    await client.close();
  }
});

/* MCP-F21: the remote spec was cached for the life of the process. */
test("a remote spec that changes is picked up", async () => {
  const spec = JSON.parse(readFileSync(SPEC_FILE, "utf8"));
  let version = "1.0.0";
  const site = await fakeSite({ "/system-spec.json": () => ({ ...spec, version }) });
  const client = await connect(site.url);
  try {
    const first = JSON.parse(text(await call(client, "validate_code", { code: "<div />" })));
    version = "2.0.0";
    const second = JSON.parse(text(await call(client, "validate_code", { code: "<div />" })));
    assert.equal(first.spec.version, "1.0.0");
    assert.equal(second.spec.version, "2.0.0");
  } finally {
    await client.close();
    await site.close();
  }
});
