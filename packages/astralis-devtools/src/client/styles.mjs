/* The overlay's own styles, scoped by its shadow root: nothing here reaches
   the page and nothing on the page restyles the overlay. One dark palette,
   the usual look of developer tools, whatever the app's theme. */

export const STYLES = `
:host {
  all: initial;
  --bg: #16181d;
  --bg-raised: #1f2229;
  --line: #2e323b;
  --text: #e8eaef;
  --muted: #9aa1ad;
  --accent: #7c8cff;
  --error: #ff6b6b;
  --warning: #f5b945;
  --ok: #4fd18b;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font: 13px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--text);
}
*, *::before, *::after { box-sizing: border-box; }
button { font: inherit; color: inherit; cursor: pointer; }
[hidden] { display: none !important; }

.launcher {
  position: fixed; right: 16px; bottom: 16px; z-index: 2147483000;
  width: 44px; height: 44px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--bg); border: 1px solid var(--line);
  box-shadow: 0 6px 24px rgb(0 0 0 / 0.35);
}
.launcher:hover, .launcher[aria-expanded="true"] { border-color: var(--accent); }
.launcher:focus-visible, .panel button:focus-visible, .panel a:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
.launcher svg { width: 22px; height: 22px; }
.badge {
  position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 9px; font-size: 11px; font-weight: 600; line-height: 18px; text-align: center;
  background: var(--error); color: #16181d;
}
.badge.warning { background: var(--warning); }

.panel {
  position: fixed; right: 16px; bottom: 72px; z-index: 2147483000;
  width: min(420px, calc(100vw - 32px)); max-height: min(70vh, 640px);
  display: flex; flex-direction: column;
  background: var(--bg); border: 1px solid var(--line); border-radius: 10px;
  box-shadow: 0 12px 40px rgb(0 0 0 / 0.45); overflow: hidden;
}
.panel header {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  border-bottom: 1px solid var(--line); background: var(--bg-raised);
}
.panel h2 { margin: 0; font-size: 13px; font-weight: 600; flex: 1; }
.tabs { display: flex; gap: 2px; padding: 6px 8px 0; border-bottom: 1px solid var(--line); }
.tab {
  background: none; border: 0; border-bottom: 2px solid transparent;
  padding: 6px 10px; color: var(--muted);
}
.tab[aria-selected="true"] { color: var(--text); border-bottom-color: var(--accent); }
.close { background: none; border: 0; color: var(--muted); font-size: 18px; line-height: 1; padding: 2px 6px; }
.close:hover { color: var(--text); }
.body { overflow: auto; padding: 12px; }

.muted { color: var(--muted); }
.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.primary {
  background: var(--accent); color: #0d0f14; border: 0; border-radius: 6px; padding: 6px 12px; font-weight: 600;
}
.primary[aria-pressed="true"] { background: var(--ok); }
.link { color: var(--accent); text-decoration: none; }
.link:hover { text-decoration: underline; }

.component { margin-top: 12px; }
.component h3 { margin: 0; font: 600 16px/1.3 var(--mono); }
.pill {
  display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px;
  border: 1px solid var(--line); color: var(--muted);
}
.pill.none { color: var(--ok); border-color: color-mix(in srgb, var(--ok) 40%, transparent); }
.pill.leaf { color: var(--warning); border-color: color-mix(in srgb, var(--warning) 40%, transparent); }
.pill.required { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
.chain { font-family: var(--mono); color: var(--muted); margin: 4px 0 0; }
.section { margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--line); }
.section h4 { margin: 0 0 6px; font-size: 12px; font-weight: 600; }
table { width: 100%; border-collapse: collapse; font-family: var(--mono); font-size: 12px; }
td { padding: 3px 0; vertical-align: top; }
td:first-child { color: var(--muted); padding-right: 12px; white-space: nowrap; width: 1%; }
td:last-child { word-break: break-word; }
.crumbs { display: flex; flex-wrap: wrap; gap: 4px; }
.crumb {
  background: var(--bg-raised); border: 1px solid var(--line); border-radius: 4px;
  padding: 1px 6px; font: 12px var(--mono); color: var(--muted);
}
.crumb:hover { color: var(--text); border-color: var(--accent); }

.summary { margin-bottom: 10px; }
.count-error { color: var(--error); font-weight: 600; }
.count-warning { color: var(--warning); font-weight: 600; }
.group-title { margin: 14px 0 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
.file { margin-bottom: 10px; }
.file-name { font: 12px var(--mono); margin-bottom: 4px; word-break: break-all; }
.finding { display: grid; grid-template-columns: 14px auto 1fr; gap: 6px; padding: 3px 0; font-size: 12px; }
.finding .mark { font-weight: 700; }
.finding.error .mark { color: var(--error); }
.finding.warning .mark { color: var(--warning); }
.finding .at { font-family: var(--mono); color: var(--muted); }
.finding code { font: 11px var(--mono); color: var(--muted); }
.clean { color: var(--ok); }
.notice { padding: 10px; border: 1px dashed var(--line); border-radius: 6px; color: var(--muted); }
.notice code { font-family: var(--mono); color: var(--text); }

.highlight {
  position: fixed; z-index: 2147482999; pointer-events: none;
  border: 2px solid var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent);
  border-radius: 3px;
}
.highlight .label {
  position: absolute; left: -2px; bottom: 100%; margin-bottom: 4px; padding: 2px 6px; border-radius: 4px;
  background: var(--accent); color: #0d0f14; font: 600 11px var(--mono); white-space: nowrap;
}
.highlight.below .label { bottom: auto; top: 100%; margin: 4px 0 0; }
`;
