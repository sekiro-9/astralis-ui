import { isAbsolute, relative, resolve } from "node:path";
import { posix } from "./ui.mjs";

/**
 * GitHub Actions workflow commands: one `::error` / `::warning` line per
 * finding, which GitHub shows on the changed line of the pull request.
 * https://docs.github.com/actions/reference/workflow-commands-for-github-actions
 */

const escapeData = (text) => String(text).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
const escapeProperty = (text) => escapeData(text).replaceAll(":", "%3A").replaceAll(",", "%2C");

/**
 * GitHub places an annotation by its path from the repository root, which is
 * not the working directory when the project sits in a subfolder of the repo.
 */
export function repositoryPath(file, { cwd = process.cwd(), workspace = process.env.GITHUB_WORKSPACE } = {}) {
  const absolute = isAbsolute(file) ? file : resolve(cwd, file);
  return posix(workspace ? relative(workspace, absolute) : relative(cwd, absolute));
}

export function annotation(kind, finding, options) {
  const file = repositoryPath(finding.file, options);
  const properties = [`file=${escapeProperty(file)}`, `line=${finding.line}`, `col=${finding.column}`, `title=${escapeProperty(`astralis ${finding.code}`)}`];
  return `::${kind === "error" ? "error" : "warning"} ${properties.join(",")}::${escapeData(finding.message)}`;
}
