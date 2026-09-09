/* Writes every generated token stylesheet (see token-css.mjs). */
import { writeFileSync } from "node:fs";
import {
  OUTPUTS,
  accentCss,
  breakpointsCss,
  channelsCss,
  loadLayout,
  loadPalette,
  loadSpec,
  semanticCss,
} from "./token-css.mjs";

const [spec, layout] = await Promise.all([loadSpec(), loadLayout()]);

const files = {
  [OUTPUTS.semantic]: semanticCss(spec, loadPalette()),
  [OUTPUTS.accent]: accentCss(spec),
  [OUTPUTS.breakpoints]: breakpointsCss(layout),
  [OUTPUTS.channels]: channelsCss(layout),
};

for (const [path, css] of Object.entries(files)) {
  writeFileSync(path, css);
  console.log(`✓ generated ${path}`);
}
