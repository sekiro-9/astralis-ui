import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

export const CLI = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/** A throwaway directory holding `files` ({ relativePath: content }). Removed by the returned cleanup. */
export function tempProject(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), "astralis-cli-test-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), typeof content === "string" ? content : JSON.stringify(content, null, 2));
  }
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

/**
 * Run the real CLI entry point in a child process. Asynchronous on purpose: a
 * registry served by this process must keep answering while the child runs.
 */
export function runCli(args, { cwd, input = "", env = {} } = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, ...args], {
      cwd,
      env: { ...process.env, NO_COLOR: "1", ASTRALIS_REGISTRY: "", npm_config_user_agent: "", ...env },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => resolve({ code, stdout, stderr, output: stdout + stderr }));
    child.stdin.end(input);
  });
}

/** Serve `routes` ({ "/path": body | { status, body } }) on 127.0.0.1; 404 otherwise. */
export async function serve(routes) {
  const server = createServer((request, response) => {
    const route = routes[request.url];
    if (route === undefined) {
      response.statusCode = 404;
      return response.end();
    }
    const { status = 200, body } = typeof route === "object" && "body" in route ? route : { body: route };
    response.statusCode = status;
    response.end(typeof body === "string" ? body : JSON.stringify(body));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  return { url, close: () => new Promise((resolve) => server.close(resolve)) };
}

/**
 * Put a fake executable called `name` in `dir`, running `script` (JS source)
 * with node: a .cmd shim on Windows, a sh script elsewhere. Prepend `dir` to
 * PATH to have the CLI find it instead of the real one.
 */
export function fakeBin(dir, name, script) {
  mkdirSync(dir, { recursive: true });
  const js = join(dir, `${name}.fake.mjs`);
  writeFileSync(js, script);
  if (process.platform === "win32") {
    writeFileSync(join(dir, `${name}.cmd`), `@"${process.execPath}" "${js}" %*\r\n`);
  } else {
    writeFileSync(join(dir, name), `#!/bin/sh\nexec "${process.execPath}" "${js}" "$@"\n`, { mode: 0o755 });
  }
}

/** PATH with `dir` first, under whichever key this platform spells it. */
export function pathWith(dir) {
  const key = Object.keys(process.env).find((k) => k.toUpperCase() === "PATH") ?? "PATH";
  return { [key]: `${dir}${delimiter}${process.env[key] ?? ""}` };
}
