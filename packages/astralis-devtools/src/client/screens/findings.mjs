import { filePath, h, icon, plural } from "../dom.mjs";
import { ICONS } from "../icons.mjs";
import { bridgeMissing, empty, findingRow } from "./shared.mjs";

/* Findings and Recommendations: the validator's results for the project,
   live, with the files that render the current page first. Findings are its
   errors, the things that render wrong or not at all; Recommendations are its
   warnings, the things that work but could be better. */

const KINDS = {
  findings: {
    title: "Findings",
    key: "errors",
    tone: "error",
    one: "error",
    icon: ICONS.findings,
    clean: ["Nothing broken", "Every file renders the way it is written."],
    cleanPage: (n) => (n === 1 ? "Nothing broken in the file that renders this page." : `Nothing broken in the ${n} files that render this page.`),
  },
  recommendations: {
    title: "Recommendations",
    key: "warnings",
    tone: "advice",
    one: "recommendation",
    icon: ICONS.recommendations,
    clean: ["Nothing to suggest", "The validator has no advice for this project."],
    cleanPage: (n) => (n === 1 ? "Nothing to suggest in the file that renders this page." : `Nothing to suggest in the ${n} files that render this page.`),
  },
};

export function findingsScreen(app, which) {
  const kind = KINDS[which];
  const root = h("div", {});

  function fileCard(result) {
    const list = result[kind.key].map((finding) => ({ ...finding, file: result.file, kind: kind.key === "errors" ? "error" : "warning" }));
    return h(
      "div",
      { class: "file-card" },
      h("div", { class: "file-head" }, icon(ICONS.file), h("span", { class: "grow" }, filePath(result.file)), h("span", { class: "n-pill" }, String(list.length))),
      list.map((finding) => findingRow(app, finding)),
    );
  }

  function update() {
    const { state } = app;
    const findings = state.findings;
    if (state.bridge === "unreachable" && !findings) return root.replaceChildren(bridgeMissing(app));
    if (!findings) {
      return root.replaceChildren(h("div", { class: "stack" }, h("div", { class: "skeleton", style: "width:40%" }), h("div", { class: "skeleton" }), h("div", { class: "skeleton", style: "width:70%" })));
    }
    if (findings.problem) return root.replaceChildren(h("div", { class: "notice" }, findings.problem));

    const count = findings[kind.key];
    const withAny = findings.results.filter((r) => r[kind.key].length);
    const summary = h(
      "div",
      { class: `summary ${count ? kind.tone : ""}` },
      h("div", { class: "summary-value" }, String(count)),
      h(
        "div",
        { class: "summary-text grow" },
        h("strong", {}, count === 1 ? kind.one[0].toUpperCase() + kind.one.slice(1) : `${kind.one[0].toUpperCase() + kind.one.slice(1)}s`),
        `in ${withAny.length} of ${plural(findings.files, "file")} checked`,
        state.bridge === "unreachable" ? " · reconnecting…" : "",
      ),
    );
    if (!count) {
      return root.replaceChildren(summary, empty(ICONS.check, kind.clean[0], kind.clean[1]));
    }

    const onPage = state.routeFiles;
    const byFile = new Map(withAny.map((result) => [result.file, result]));
    const pageFiles = onPage.filter((file) => byFile.has(file));
    const pageSection = onPage.length
      ? h(
          "section",
          {},
          h("h3", { class: "section-title" }, "This page"),
          pageFiles.length ? pageFiles.map((file) => fileCard(byFile.get(file))) : h("p", { class: "muted", style: "margin-bottom:16px" }, kind.cleanPage(onPage.length)),
        )
      : null;
    const rest = withAny.filter((result) => !onPage.includes(result.file));
    const restSection = rest.length
      ? h("section", {}, onPage.length ? h("h3", { class: "section-title" }, "Elsewhere in the project") : null, rest.map(fileCard))
      : null;
    root.replaceChildren(...[summary, pageSection, restSection].filter(Boolean));
  }

  update();
  return { title: [{ label: kind.title }], root, update };
}
