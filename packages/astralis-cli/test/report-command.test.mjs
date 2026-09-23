import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSnapshot } from "astralis-cli/snapshot";
import { tempProject, runCli } from "./helpers.mjs";

const SPEC = fileURLToPath(import.meta.resolve("astralis-ui/system-spec.json"));

const PAGE = `import { Card as C, CardBody, Button } from "astralis-ui";
import { Header } from "./header";

export default function Page({ user }: { user: string }) {
  return (
    <main>
      <Header />
      <C variant="glass" size="lg" onClick={() => {}}>
        <CardBody>
          <p>Hello {user}</p>
          <Button colorScheme={user} disabled href="/secret">Save</Button>
        </CardBody>
      </C>
    </main>
  );
}
`;

const project = () =>
  tempProject({
    "package.json": { name: "x", dependencies: { next: "16", react: "19", "astralis-ui": "*" } },
    "app/page.tsx": PAGE,
    "app/plain.tsx": "export const x = <div>hi</div>;\n",
  });

/** The JSON the command prints ends where its first status line begins. */
const printedSnapshot = (stdout) => JSON.parse(stdout.slice(stdout.indexOf("{"), stdout.lastIndexOf("}") + 1));

test("prints a valid snapshot of the components, with literal, described props and redacted text", async () => {
  const p = project();
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "Card loses its border", "--dry-run", "--spec", SPEC], { cwd: p.dir });
    assert.equal(result.code, 0, result.output);
    const snapshot = printedSnapshot(result.stdout);
    assert.deepEqual(checkSnapshot(snapshot), []);
    assert.equal(snapshot.source, "cli");
    assert.equal(snapshot.route, null);
    assert.equal(snapshot.environment.framework.name, "next");
    const [card] = snapshot.tree;
    assert.equal(card.component, "Card", "an aliased import is named by its export");
    assert.deepEqual(card.props, { variant: "glass", size: "lg" }, "no handlers");
    const body = card.children[0];
    assert.equal(body.component, "Card.Body", "a flat part export is named as the page names it");
    assert.deepEqual(body.children[0], { redacted: true, length: 5 }, "text inside a plain element is kept, as a placeholder; {user} is dynamic");
    const button = body.children[1];
    assert.deepEqual(button.props, { disabled: true }, "dynamic values and links are left out");
    assert.deepEqual(button.children, [{ redacted: true, length: 4 }]);
    assert.deepEqual(snapshot.findings.map((f) => [f.code, f.file]), [["invalid-recipe-value", "app/page.tsx"]]);
    assert.match(result.stdout, /dry run: nothing was sent/);
  } finally {
    p.cleanup();
  }
});

test("--include-text keeps the text, and --no-findings leaves the findings out", async () => {
  const p = project();
  try {
    const result = await runCli(
      ["report", "app/page.tsx", "--title", "t", "--include-text", "--no-findings", "--dry-run", "--spec", SPEC],
      { cwd: p.dir },
    );
    const snapshot = printedSnapshot(result.stdout);
    assert.deepEqual(snapshot.tree[0].children[0].children[1].children, [{ text: "Save" }]);
    assert.equal("findings" in snapshot, false);
  } finally {
    p.cleanup();
  }
});

test("--out writes the snapshot and sends nothing", async () => {
  const p = project();
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "t", "--out", "snap.json", "--spec", SPEC], { cwd: p.dir });
    assert.equal(result.code, 0, result.output);
    const saved = JSON.parse(readFileSync(join(p.dir, "snap.json"), "utf8"));
    assert.deepEqual(checkSnapshot(saved), []);
    assert.match(result.stdout, /nothing was sent/);
  } finally {
    p.cleanup();
  }
});

test("--yes sends the exact snapshot it printed and prints the draft's address", async () => {
  const p = project();
  let received = null;
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      received = { path: req.url, type: req.headers["content-type"], body: JSON.parse(body) };
      res.writeHead(201, { "content-type": "application/json" });
      res.end(JSON.stringify({ id: "d1", url: "/issues/new?draft=d1" }));
    });
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "t", "--yes", "--spec", SPEC], {
      cwd: p.dir,
      env: { ASTRALIS_ISSUES_URL: origin },
    });
    assert.equal(result.code, 0, result.output);
    assert.equal(received.path, "/api/issues/drafts");
    assert.equal(received.type, "application/json");
    assert.deepEqual(received.body, printedSnapshot(result.stdout));
    assert.match(result.stdout, new RegExp(`draft created: ${origin}/issues/new\\?draft=d1`));
  } finally {
    server.close();
    p.cleanup();
  }
});

test("an unreachable platform fails clearly and suggests --out", async () => {
  const p = project();
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "t", "--yes", "--spec", SPEC], {
      cwd: p.dir,
      env: { ASTRALIS_ISSUES_URL: "http://127.0.0.1:9" },
    });
    assert.equal(result.code, 1);
    assert.match(result.output, /Could not reach the Astralis issue platform/);
    assert.match(result.output, /--out snapshot\.json/);
  } finally {
    p.cleanup();
  }
});

test("refuses what it cannot report", async () => {
  const p = project();
  try {
    const cases = [
      [["report", "--dry-run"], /Name the files/],
      [["report", "app/page.tsx", "--yes"], /needs a title/],
      [["report", "package.json", "--title", "t"], /not a \.tsx or \.jsx file/],
      [["report", "app/missing.tsx", "--title", "t"], /not a \.tsx or \.jsx file/],
      [["report", "app/plain.tsx", "--title", "t"], /nothing to report/],
    ];
    for (const [args, pattern] of cases) {
      const result = await runCli([...args, "--spec", SPEC], { cwd: p.dir });
      assert.equal(result.code, 1, args.join(" "));
      assert.match(result.output, pattern, args.join(" "));
    }
    assert.equal(existsSync(join(p.dir, "snapshot.json")), false);
  } finally {
    p.cleanup();
  }
});
