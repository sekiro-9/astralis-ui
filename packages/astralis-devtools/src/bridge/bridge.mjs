import { readFileSync, statSync, watch } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import {
  collectSourceFiles,
  findInstalledSpec,
  prepareSpec,
  SKIP_DIRS,
  SOURCE_FILE,
  validateSource,
} from "astralis-cli/validate";
import { projectInfo, routeFiles } from "./project.mjs";

/* The local bridge: validates the project's source files against the
   installed astralis-ui's spec, keeps the findings current as files change,
   and tells whoever is listening (the overlay's event stream). It runs inside
   the dev server process and only there. */

const DEBOUNCE_MS = 60;
/** Files validated per turn of the event loop, so a large project never stalls the dev server. */
const BATCH = 25;

const toPosix = (path) => path.split(sep).join("/");

/** fs.watch over the whole project; node_modules and build output are ignored by the caller. */
function watchProject(root, onChange) {
  const watcher = watch(root, { recursive: true }, (_event, filename) => {
    if (filename) onChange(join(root, filename.toString()));
  });
  watcher.on("error", () => {});
  return () => watcher.close();
}

const nextTurn = () => new Promise((done) => setImmediate(done));

export class Bridge {
  /**
   * @param {object} options
   * @param {string} options.root project directory
   * @param {"next" | "vite"} options.framework
   * @param {(onChange: (path: string) => void) => () => void} [options.watch]
   *   subscribe to file changes; defaults to fs.watch over `root`
   */
  constructor({ root, framework, watch: subscribe }) {
    this.root = resolve(root);
    this.framework = framework;
    this.subscribe = subscribe ?? ((onChange) => watchProject(this.root, onChange));
    this.results = new Map(); // relative path -> { errors, warnings }
    this.listeners = new Set();
    this.version = 0;
    this.pending = new Map();
    this.ready = null;
    this.problem = null;
    this.stopWatching = null;
  }

  /** Load the spec and validate everything once; later calls wait for the same run. */
  start() {
    this.ready ??= this.#load();
    return this.ready;
  }

  async #load() {
    const specPath = findInstalledSpec(this.root);
    if (!specPath) {
      this.problem = "astralis-ui is not installed in this project, so there is no spec to validate against.";
      return;
    }
    this.specText = readFileSync(specPath, "utf8");
    this.spec = JSON.parse(this.specText);
    this.prepared = prepareSpec(this.spec);
    this.info = projectInfo(this.root, this.framework, this.spec, this.specText);

    const files = collectSourceFiles(this.root) ?? [];
    for (let i = 0; i < files.length; i += BATCH) {
      for (const file of files.slice(i, i + BATCH)) this.#validate(file);
      await nextTurn();
    }
    this.version++;
    this.stopWatching = this.subscribe((path) => this.#changed(path));
  }

  /** Whether a changed path is a source file the bridge tracks. */
  #tracks(path) {
    const rel = relative(this.root, path);
    if (rel.startsWith("..") || !SOURCE_FILE.test(rel)) return false;
    return !rel.split(sep).some((part) => SKIP_DIRS.has(part));
  }

  #validate(file) {
    const rel = toPosix(relative(this.root, file));
    let source;
    try {
      source = readFileSync(file, "utf8");
    } catch {
      return this.results.delete(rel);
    }
    const { errors, warnings } = validateSource(source, this.prepared, rel);
    this.results.set(rel, { errors, warnings });
    return true;
  }

  #changed(path) {
    if (!this.#tracks(path)) return;
    clearTimeout(this.pending.get(path));
    this.pending.set(
      path,
      setTimeout(() => {
        this.pending.delete(path);
        if (statSync(path, { throwIfNoEntry: false })?.isFile()) this.#validate(path);
        else this.results.delete(toPosix(relative(this.root, path)));
        this.version++;
        const snapshot = this.findings();
        for (const listener of this.listeners) listener(snapshot);
      }, DEBOUNCE_MS),
    );
  }

  /** Every tracked file with its findings, files with problems first. */
  findings() {
    if (this.problem) return { version: this.version, problem: this.problem };
    let errors = 0;
    let warnings = 0;
    const results = [];
    for (const [file, found] of this.results) {
      errors += found.errors.length;
      warnings += found.warnings.length;
      if (found.errors.length || found.warnings.length) results.push({ file, ...found });
    }
    results.sort((a, b) => b.errors.length - a.errors.length || a.file.localeCompare(b.file));
    return { version: this.version, files: this.results.size, errors, warnings, results };
  }

  /** The files that render `pathname` (Next.js app router), project-relative. */
  routeFiles(pathname) {
    return this.framework === "next" ? routeFiles([...this.results.keys()], pathname) : [];
  }

  /** Call `listener(findings)` after every change; returns the unsubscribe. */
  listen(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  close() {
    this.stopWatching?.();
    for (const timer of this.pending.values()) clearTimeout(timer);
    this.pending.clear();
    this.listeners.clear();
  }
}

/*
 * One bridge per project per process. Next.js re-evaluates a route module
 * when it recompiles, so the instance lives on globalThis rather than in
 * module scope, or every recompile would start a second watcher.
 */
const INSTANCES = Symbol.for("astralis-devtools.bridges");

export function bridgeFor(root, framework, options = {}) {
  const instances = (globalThis[INSTANCES] ??= new Map());
  const key = `${framework}:${resolve(root)}`;
  let bridge = instances.get(key);
  if (!bridge) {
    bridge = new Bridge({ root, framework, ...options });
    instances.set(key, bridge);
  }
  return bridge;
}
