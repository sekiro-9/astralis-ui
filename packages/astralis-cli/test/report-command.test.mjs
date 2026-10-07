import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

/**
 * A fake github.com and api.github.com on one local server: the device flow,
 * the user, and the issues endpoint. `pending` is how many polls answer
 * "authorization_pending" before the token is granted.
 */
async function fakeGitHub({ pending = 1, revoked = [], duplicates = [], related = [], searchFails = false } = {}) {
  const seen = [];
  const issues = [];
  const comments = [];
  let polls = 0;
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      seen.push({ method: req.method, path: req.url, auth: req.headers.authorization ?? null, body });
      const send = (status, data) => {
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify(data));
      };
      if (req.url === "/login/device/code") {
        return send(200, { device_code: "dev-1", user_code: "WDJB-MJHT", verification_uri: "https://github.com/login/device", expires_in: 900, interval: 0 });
      }
      if (req.url === "/login/oauth/access_token") {
        return polls++ < pending ? send(200, { error: "authorization_pending" }) : send(200, { access_token: "tok-new", token_type: "bearer" });
      }
      if (revoked.includes(req.headers.authorization)) return send(401, { message: "Bad credentials" });
      if (req.url === "/user") return send(200, { login: "sam" });
      if (req.url.startsWith("/search/issues")) {
        if (searchFails) return send(403, { message: "API rate limit exceeded" });
        const q = new URL(req.url, "http://x").searchParams.get("q");
        return send(200, { items: / afp[0-9a-f]{12}$/.test(q) ? duplicates : / is:open acmp\w+$/.test(q) ? related : [] });
      }
      const comment = req.url.match(/^\/repos\/sekiro-9\/astralis-ui\/issues\/(\d+)\/comments$/);
      if (comment && req.method === "POST") {
        comments.push({ issue: Number(comment[1]), body: JSON.parse(body).body });
        return send(201, { html_url: `https://github.com/sekiro-9/astralis-ui/issues/${comment[1]}#issuecomment-1` });
      }
      if (req.url === "/repos/sekiro-9/astralis-ui/issues" && req.method === "POST") {
        const issue = JSON.parse(body);
        issues.push(issue);
        return send(201, { number: 7, html_url: "https://github.com/sekiro-9/astralis-ui/issues/7" });
      }
      send(404, { message: "Not Found" });
    });
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const url = `http://127.0.0.1:${server.address().port}`;
  return {
    seen,
    issues,
    comments,
    env: (configDir) => ({
      ASTRALIS_GITHUB_URL: url,
      ASTRALIS_GITHUB_API_URL: url,
      ASTRALIS_GITHUB_CLIENT_ID: "Iv1.test",
      ASTRALIS_CONFIG_DIR: configDir,
    }),
    close: () => new Promise((done) => server.close(done)),
  };
}

const savedSignIn = (dir, token = "tok-saved") => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "github.json"), JSON.stringify({ token, login: "sam", savedAt: "2026-10-07T00:00:00.000Z" }));
};

test("--yes opens the issue as the saved GitHub user, with the snapshot it printed", async () => {
  const p = project();
  const github = await fakeGitHub();
  const config = join(p.dir, ".config");
  savedSignIn(config);
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "Card loses its border", "--happened", "No border", "--yes", "--spec", SPEC], {
      cwd: p.dir,
      env: github.env(config),
    });
    assert.equal(result.code, 0, result.output);
    const create = github.seen.find((r) => r.method === "POST" && r.path.endsWith("/issues"));
    assert.equal(create.auth, "Bearer tok-saved");
    const [issue] = github.issues;
    assert.equal(issue.title, "Card loses its border");
    assert.match(issue.body, /^### What happened\n\nNo border/);
    assert.match(issue.body, /`invalid-recipe-value` app\/page\.tsx:/);
    assert.match(issue.body, /```tsx\n\/\/ Reproduction of an Astralis issue snapshot/);
    const json = issue.body.slice(issue.body.indexOf("```json\n") + 8, issue.body.indexOf("\n```\n\n</details>"));
    assert.deepEqual(JSON.parse(json), printedSnapshot(result.stdout), "the body carries exactly the snapshot shown");
    assert.match(result.stdout, /issue #7 opened as sam: https:\/\/github\.com\/sekiro-9\/astralis-ui\/issues\/7/);
  } finally {
    await github.close();
    p.cleanup();
  }
});

test("with no saved sign-in it signs in with a code first, and saves the sign-in", async () => {
  const p = project();
  const github = await fakeGitHub({ pending: 2 });
  const config = join(p.dir, ".config");
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "t", "--yes", "--spec", SPEC], { cwd: p.dir, env: github.env(config) });
    assert.equal(result.code, 0, result.output);
    assert.match(result.stdout, /open https:\/\/github\.com\/login\/device and enter WDJB-MJHT/);
    assert.match(result.stdout, /signed in as sam/);
    assert.equal(github.seen.filter((r) => r.path === "/login/oauth/access_token").length, 3);
    assert.equal(github.seen.find((r) => r.path === "/login/device/code").body, "client_id=Iv1.test");
    assert.deepEqual(
      (({ token, login }) => ({ token, login }))(JSON.parse(readFileSync(join(config, "github.json"), "utf8"))),
      { token: "tok-new", login: "sam" },
    );
    assert.equal(github.issues.length, 1);
  } finally {
    await github.close();
    p.cleanup();
  }
});

test("a revoked sign-in is replaced once, then the issue is opened", async () => {
  const p = project();
  const github = await fakeGitHub({ pending: 0, revoked: ["Bearer tok-saved"] });
  const config = join(p.dir, ".config");
  savedSignIn(config);
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "t", "--yes", "--spec", SPEC], { cwd: p.dir, env: github.env(config) });
    assert.equal(result.code, 0, result.output);
    assert.match(result.stdout, /enter WDJB-MJHT/);
    assert.equal(github.issues.length, 1);
    assert.equal(github.seen.filter((r) => r.path.endsWith("/issues")).at(-1).auth, "Bearer tok-new");
  } finally {
    await github.close();
    p.cleanup();
  }
});

const ISSUE_3 = { number: 3, title: "Card variant glass is not reported", state: "open", html_url: "https://github.com/sekiro-9/astralis-ui/issues/3", comments: 1, labels: [] };
const ISSUE_5 = { number: 5, title: "Card padding in dark mode", state: "open", html_url: "https://github.com/sekiro-9/astralis-ui/issues/5", comments: 0, labels: [] };

test("the issue carries the keys a later report is matched on", async () => {
  const p = project();
  const github = await fakeGitHub();
  const config = join(p.dir, ".config");
  savedSignIn(config);
  try {
    await runCli(["report", "app/page.tsx", "--title", "t", "--yes", "--spec", SPEC], { cwd: p.dir, env: github.env(config) });
    assert.match(github.issues[0].body, /Match keys: afp[0-9a-f]{12} acmpcard<\/sub>$/);
    const searches = github.seen.filter((r) => r.path.startsWith("/search/issues")).map((r) => new URL(r.path, "http://x").searchParams.get("q"));
    assert.deepEqual(searches.map((q) => q.replace(/afp[0-9a-f]{12}/, "afp…")).sort(), [
      "repo:sekiro-9/astralis-ui is:issue afp…",
      "repo:sekiro-9/astralis-ui is:issue is:open acmpcard",
    ]);
  } finally {
    await github.close();
    p.cleanup();
  }
});

test("a likely duplicate is offered, and choosing it adds the report to that issue", async () => {
  const p = project();
  const github = await fakeGitHub({ duplicates: [ISSUE_3], related: [ISSUE_5] });
  const config = join(p.dir, ".config");
  savedSignIn(config);
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "Card loses its border", "--happened", "No border", "--expected", "A border", "--spec", SPEC], {
      cwd: p.dir,
      env: github.env(config),
      input: "y\n1\n",
    });
    assert.equal(result.code, 0, result.output);
    assert.match(result.stdout, /open issues about the same component:\n\s+#5 Card padding in dark mode/);
    assert.match(result.stdout, /This may already be reported:\n\s+#3 Card variant glass is not reported/);
    assert.equal(github.issues.length, 0, "no second issue");
    assert.equal(github.comments[0].issue, 3);
    assert.match(github.comments[0].body, /^\*\*Another report of this problem:\*\* Card loses its border\n\n### What happened\n\nNo border/);
    assert.match(result.stdout, /report added to issue #3 as sam/);
  } finally {
    await github.close();
    p.cleanup();
  }
});

test("with --yes a new issue is opened, and the possible duplicates are listed to check", async () => {
  const p = project();
  const github = await fakeGitHub({ duplicates: [ISSUE_3] });
  const config = join(p.dir, ".config");
  savedSignIn(config);
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "t", "--yes", "--spec", SPEC], { cwd: p.dir, env: github.env(config) });
    assert.equal(result.code, 0, result.output);
    assert.match(result.stdout, /#3 Card variant glass is not reported/);
    assert.match(result.stdout, /pass --add-to 3 to add your report/);
    assert.equal(github.issues.length, 1);
  } finally {
    await github.close();
    p.cleanup();
  }
});

test("--add-to adds to that issue without searching, and --new opens one without searching", async () => {
  const p = project();
  const github = await fakeGitHub({ duplicates: [ISSUE_3] });
  const config = join(p.dir, ".config");
  savedSignIn(config);
  try {
    const added = await runCli(["report", "app/page.tsx", "--title", "t", "--add-to", "#7", "--yes", "--spec", SPEC], { cwd: p.dir, env: github.env(config) });
    assert.equal(added.code, 0, added.output);
    assert.equal(github.comments[0].issue, 7);
    const opened = await runCli(["report", "app/page.tsx", "--title", "t", "--new", "--yes", "--spec", SPEC], { cwd: p.dir, env: github.env(config) });
    assert.equal(opened.code, 0, opened.output);
    assert.equal(github.issues.length, 1);
    assert.equal(github.seen.some((r) => r.path.startsWith("/search/issues")), false);
  } finally {
    await github.close();
    p.cleanup();
  }
});

test("a failed search does not stop the report", async () => {
  const p = project();
  const github = await fakeGitHub({ searchFails: true });
  const config = join(p.dir, ".config");
  savedSignIn(config);
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "t", "--yes", "--spec", SPEC], { cwd: p.dir, env: github.env(config) });
    assert.equal(result.code, 0, result.output);
    assert.match(result.stdout, /could not check for an existing issue \(GitHub refused the request: API rate limit exceeded\.\); opening a new one/);
    assert.equal(github.issues.length, 1);
  } finally {
    await github.close();
    p.cleanup();
  }
});

test("--link prints GitHub's own form, filled in, and signs in to nothing", async () => {
  const p = project();
  const config = join(p.dir, ".config");
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "Card loses its border", "--link", "--yes", "--spec", SPEC], {
      cwd: p.dir,
      env: { ASTRALIS_CONFIG_DIR: config, ASTRALIS_GITHUB_API_URL: "http://127.0.0.1:9", ASTRALIS_GITHUB_URL: "http://127.0.0.1:9" },
    });
    assert.equal(result.code, 0, result.output);
    const link = result.stdout.match(/https:\/\/github\.com\/sekiro-9\/astralis-ui\/issues\/new\?\S+/)[0];
    assert.equal(new URL(link).searchParams.get("title"), "Card loses its border");
    assert.match(new URL(link).searchParams.get("body"), /### Reproduction/);
    assert.equal(existsSync(join(config, "github.json")), false, "no sign-in");
  } finally {
    p.cleanup();
  }
});

test("--sign-out forgets the saved sign-in", async () => {
  const p = project();
  const config = join(p.dir, ".config");
  savedSignIn(config);
  try {
    const result = await runCli(["report", "--sign-out"], { cwd: p.dir, env: { ASTRALIS_CONFIG_DIR: config } });
    assert.equal(result.code, 0, result.output);
    assert.match(result.stdout, /signed out of GitHub \(sam\)/);
    assert.equal(existsSync(join(config, "github.json")), false);
  } finally {
    p.cleanup();
  }
});

test("an unreachable GitHub fails clearly, sends nothing and suggests --out", async () => {
  const p = project();
  const config = join(p.dir, ".config");
  savedSignIn(config);
  try {
    const result = await runCli(["report", "app/page.tsx", "--title", "t", "--yes", "--spec", SPEC], {
      cwd: p.dir,
      env: { ASTRALIS_GITHUB_API_URL: "http://127.0.0.1:9", ASTRALIS_CONFIG_DIR: config },
    });
    assert.equal(result.code, 1);
    assert.match(result.output, /Could not reach GitHub/);
    assert.match(result.output, /Nothing was sent/);
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
