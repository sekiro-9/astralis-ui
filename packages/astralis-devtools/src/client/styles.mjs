import { FAMILIES } from "./fonts.mjs";

/* The overlay's own styles, scoped by its shadow root: nothing here reaches
   the page and nothing on the page restyles the overlay. It is Astralis's
   tool, so it wears the Astralis brand (the docs' yellow and fonts) on one
   dark palette, whatever the app's theme. */

export const STYLES = `
:host {
  all: initial;
  --bg: #0c0c0f;
  --bg-1: #121216;
  --bg-2: #18181e;
  --bg-3: #202027;
  --line: rgb(255 255 255 / 0.07);
  --line-2: rgb(255 255 255 / 0.13);
  --text: #f4f4f5;
  --muted: #a1a1aa;
  --faint: #6b6b76;
  --brand: #eab308;
  --brand-2: #facc15;
  --brand-ink: #1c1500;
  --brand-soft: rgb(234 179 8 / 0.12);
  --brand-line: rgb(234 179 8 / 0.38);
  --error: #f87171;
  --error-soft: rgb(248 113 113 / 0.12);
  --advice: #7dd3fc;
  --advice-soft: rgb(125 211 252 / 0.11);
  --ok: #4ade80;
  --ok-soft: rgb(74 222 128 / 0.12);
  --sans: "${FAMILIES.sans}", Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --display: "${FAMILIES.display}", "Space Grotesk", var(--sans);
  --mono: "${FAMILIES.mono}", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --spring: cubic-bezier(0.34, 1.4, 0.64, 1);
  font: 400 13px/1.5 var(--sans);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}
*, *::before, *::after { box-sizing: border-box; }
button, input, textarea { font: inherit; color: inherit; }
button { cursor: pointer; background: none; border: 0; padding: 0; }
[hidden] { display: none !important; }
:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.icon { display: inline-grid; place-items: center; flex: none; }
.icon svg { width: 100%; height: 100%; display: block; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: rgb(255 255 255 / 0.09); border-radius: 10px; border: 3px solid transparent; background-clip: padding-box; }
::-webkit-scrollbar-thumb:hover { background-color: rgb(255 255 255 / 0.16); }

/* ---- launcher ---------------------------------------------------------------- */

.launcher {
  position: fixed; left: 0; top: 0; z-index: 2147483001;
  display: flex; align-items: center; height: 44px; padding: 4px;
  border-radius: 14px; background: rgb(14 14 18 / 0.92);
  border: 1px solid var(--line-2);
  box-shadow: 0 10px 30px -8px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(0 0 0 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.06);
  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  touch-action: none; user-select: none;
  animation: launcher-in 520ms var(--spring) both;
  transition: box-shadow 200ms var(--ease), border-color 200ms var(--ease);
}
.launcher:hover { border-color: var(--brand-line); }
.launcher.dragging { cursor: grabbing; box-shadow: 0 18px 44px -10px rgb(0 0 0 / 0.75), 0 0 0 1px var(--brand-line); transition: none; }
.launcher.settling { transition: transform 360ms var(--spring), box-shadow 200ms var(--ease); }
@keyframes launcher-in { from { opacity: 0; scale: 0.6; } }
.launcher-button {
  position: relative; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px;
  color: var(--muted); transition: background 160ms var(--ease), color 160ms var(--ease), transform 160ms var(--ease);
}
.launcher-button:hover { background: rgb(255 255 255 / 0.07); color: var(--text); }
.launcher-button:active { transform: scale(0.92); }
.launcher-button .icon { width: 18px; height: 18px; }
.launcher-button.mark { color: var(--brand); }
.launcher-button.mark .icon { width: 20px; height: 20px; }
.launcher-button.mark:hover .b4 { transform: rotate(-8deg) translate(-1px, 1px); }
.launcher .b4 { transform-box: fill-box; transform-origin: center; transition: transform 300ms var(--spring); }
.launcher[data-open="true"] .launcher-button.mark { background: var(--brand-soft); }
.launcher-button[aria-pressed="true"] { background: var(--brand); color: var(--brand-ink); }
.launcher-sep { width: 1px; height: 18px; margin: 0 3px; background: var(--line-2); }
.dot {
  position: absolute; top: 2px; right: 1px; min-width: 16px; height: 16px; padding: 0 4px;
  border-radius: 8px; font: 600 10px/16px var(--sans); text-align: center;
  background: var(--error); color: #2a0606; box-shadow: 0 0 0 2px rgb(14 14 18);
  animation: pop 360ms var(--spring) both;
}
.dot.advice { background: var(--advice); color: #04202c; }
@keyframes pop { from { scale: 0.3; opacity: 0; } }

/* ---- panel ------------------------------------------------------------------- */

.panel {
  position: fixed; left: 0; top: 0; z-index: 2147483000;
  width: min(640px, calc(100vw - 24px)); height: min(560px, calc(100vh - 24px));
  display: grid; grid-template-columns: 60px 1fr;
  border-radius: 18px; overflow: hidden;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.025), transparent 40%), rgb(12 12 15 / 0.96);
  border: 1px solid var(--line-2);
  box-shadow: 0 30px 90px -20px rgb(0 0 0 / 0.75), 0 0 0 1px rgb(0 0 0 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.05);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  opacity: 0; scale: 0.94; translate: 0 10px; pointer-events: none; visibility: hidden;
  transition: opacity 200ms var(--ease), scale 280ms var(--ease), translate 280ms var(--ease), visibility 0s linear 280ms;
}
.panel[data-open="true"] {
  opacity: 1; scale: 1; translate: 0 0; pointer-events: auto; visibility: visible;
  transition: opacity 180ms var(--ease), scale 360ms var(--spring), translate 360ms var(--spring), visibility 0s;
}

.sidebar {
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 0; background: rgb(255 255 255 / 0.015); border-right: 1px solid var(--line);
}
.brand { display: grid; place-items: center; width: 36px; height: 36px; margin-bottom: 10px; color: var(--brand); }
.brand .icon { width: 24px; height: 24px; filter: drop-shadow(0 0 12px rgb(234 179 8 / 0.35)); }
.nav { position: relative; display: flex; flex-direction: column; gap: 4px; }
.nav-indicator {
  position: absolute; left: -10px; top: 0; width: 3px; height: 20px; margin-top: 10px;
  border-radius: 0 3px 3px 0; background: var(--brand); box-shadow: 0 0 12px var(--brand);
  transition: transform 360ms var(--spring), opacity 200ms var(--ease);
}
.nav-button {
  position: relative; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 11px;
  color: var(--faint); transition: background 160ms var(--ease), color 160ms var(--ease);
}
.nav-button .icon { width: 19px; height: 19px; transition: transform 240ms var(--spring); }
.nav-button:hover { color: var(--text); background: rgb(255 255 255 / 0.05); }
.nav-button:hover .icon { transform: scale(1.08); }
.nav-button[aria-current="page"] { color: var(--brand); background: var(--brand-soft); }
.nav-button[aria-pressed="true"] { color: var(--brand-ink); background: var(--brand); }
.nav-button .count {
  position: absolute; top: 3px; right: 2px; min-width: 15px; height: 15px; padding: 0 3px; border-radius: 8px;
  font: 600 9.5px/15px var(--sans); text-align: center; background: var(--error); color: #2a0606;
  box-shadow: 0 0 0 2px var(--bg);
}
.nav-button .count.advice { background: var(--advice); color: #04202c; }
.tip {
  position: absolute; left: calc(100% + 10px); top: 50%; translate: -4px -50%; z-index: 2;
  padding: 4px 8px; border-radius: 7px; white-space: nowrap; pointer-events: none;
  font: 500 12px/1.3 var(--sans); color: var(--text); background: var(--bg-3); border: 1px solid var(--line-2);
  box-shadow: 0 8px 20px -6px rgb(0 0 0 / 0.6); opacity: 0;
  transition: opacity 140ms var(--ease), translate 200ms var(--ease);
}
.nav-button:hover .tip, .nav-button:focus-visible .tip { opacity: 1; translate: 0 -50%; transition-delay: 250ms; }
.sidebar-end { margin-top: auto; display: flex; flex-direction: column; gap: 4px; }

.main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.topbar {
  display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 12px 0 18px; flex: none;
  border-bottom: 1px solid var(--line);
}
.crumbs { display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1; font: 600 14px/1 var(--display); letter-spacing: -0.01em; }
.crumbs .icon { width: 14px; height: 14px; color: var(--faint); }
.crumb-link { color: var(--muted); transition: color 140ms; }
.crumb-link:hover { color: var(--text); }
.crumb-current { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.crumb-current.code { font: 600 13px/1 var(--mono); }
.status {
  display: inline-flex; align-items: center; gap: 7px; padding: 4px 9px; border-radius: 999px;
  font: 500 11.5px/1 var(--sans); color: var(--muted); background: rgb(255 255 255 / 0.04); border: 1px solid var(--line);
}
.status i { width: 7px; height: 7px; border-radius: 50%; background: var(--faint); }
.status.live i { background: var(--ok); box-shadow: 0 0 0 0 rgb(74 222 128 / 0.5); animation: pulse 2.2s var(--ease) infinite; }
.status.unreachable i { background: var(--error); }
@keyframes pulse { 70% { box-shadow: 0 0 0 6px rgb(74 222 128 / 0); } 100% { box-shadow: 0 0 0 0 rgb(74 222 128 / 0); } }
.icon-button {
  display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; color: var(--muted);
  transition: background 140ms var(--ease), color 140ms var(--ease);
}
.icon-button:hover { background: rgb(255 255 255 / 0.06); color: var(--text); }
.icon-button .icon { width: 16px; height: 16px; }
.view { flex: 1; min-height: 0; overflow: hidden auto; padding: 18px; scroll-padding: 18px; }

/* ---- shared pieces ----------------------------------------------------------------- */

h1, h2, h3, h4, p { margin: 0; }
.muted { color: var(--muted); }
.faint { color: var(--faint); }
.code { font-family: var(--mono); }
.stack { display: flex; flex-direction: column; gap: 12px; }
.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.grow { flex: 1; min-width: 0; }
.section-title {
  display: flex; align-items: center; gap: 8px; margin: 2px 0 8px;
  font: 600 11px/1 var(--sans); letter-spacing: 0.08em; text-transform: uppercase; color: var(--faint);
}
.section-title .n { color: var(--muted); letter-spacing: 0; }
.card {
  position: relative; border-radius: 14px; background: var(--bg-1); border: 1px solid var(--line);
}
.pad { padding: 14px; }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 32px; padding: 0 12px;
  border-radius: 10px; font: 500 12.5px/1 var(--sans); white-space: nowrap;
  background: rgb(255 255 255 / 0.05); border: 1px solid var(--line-2); color: var(--text);
  transition: background 140ms var(--ease), border-color 140ms var(--ease), transform 140ms var(--ease), box-shadow 200ms var(--ease);
}
.btn:hover { background: rgb(255 255 255 / 0.08); border-color: rgb(255 255 255 / 0.2); }
.btn:active { transform: scale(0.97); }
.btn .icon { width: 15px; height: 15px; }
.btn.primary {
  background: linear-gradient(180deg, var(--brand-2), var(--brand)); color: var(--brand-ink); border-color: transparent; font-weight: 600;
  box-shadow: 0 6px 20px -8px rgb(234 179 8 / 0.7), inset 0 1px 0 rgb(255 255 255 / 0.35);
}
.btn.primary:hover { box-shadow: 0 8px 26px -8px rgb(234 179 8 / 0.9), inset 0 1px 0 rgb(255 255 255 / 0.35); }
.btn.ghost { background: none; border-color: transparent; color: var(--muted); }
.btn.ghost:hover { color: var(--text); background: rgb(255 255 255 / 0.05); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
.btn[aria-pressed="true"] { background: var(--brand); color: var(--brand-ink); border-color: transparent; }
.pill {
  display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 9px; border-radius: 999px;
  font: 500 11px/1 var(--sans); color: var(--muted); background: rgb(255 255 255 / 0.04); border: 1px solid var(--line);
  white-space: nowrap;
}
.pill i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.pill.none { color: var(--ok); background: var(--ok-soft); border-color: transparent; }
.pill.leaf { color: var(--brand-2); background: var(--brand-soft); border-color: transparent; }
.pill.required { color: var(--advice); background: var(--advice-soft); border-color: transparent; }
.pill.error { color: var(--error); background: var(--error-soft); border-color: transparent; }
.pill.advice { color: var(--advice); background: var(--advice-soft); border-color: transparent; }
.pill.brand { color: var(--brand-2); background: var(--brand-soft); border-color: transparent; }
.link { display: inline-flex; align-items: center; gap: 4px; color: var(--brand-2); text-decoration: none; font-weight: 500; }
.link .icon { width: 13px; height: 13px; }
.link:hover { text-decoration: underline; text-underline-offset: 3px; }
.kbd {
  display: inline-grid; place-items: center; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 6px;
  font: 500 11px/1 var(--mono); color: var(--text); background: var(--bg-3); border: 1px solid var(--line-2);
  box-shadow: inset 0 -1.5px 0 rgb(0 0 0 / 0.5);
}
.path { font: 12px/1.4 var(--mono); word-break: break-all; }
.path .dir { color: var(--faint); }
.path .base { color: var(--text); }
.empty {
  display: grid; justify-items: center; gap: 10px; padding: 36px 20px; text-align: center; color: var(--muted);
}
.empty .icon { width: 40px; height: 40px; padding: 10px; border-radius: 12px; background: var(--ok-soft); color: var(--ok); }
.empty.neutral .icon { background: rgb(255 255 255 / 0.05); color: var(--muted); }
.empty h3 { font: 600 15px/1.3 var(--display); color: var(--text); }
.notice { padding: 12px 14px; border-radius: 12px; border: 1px dashed var(--line-2); color: var(--muted); }
.notice code, p code { font: 12px var(--mono); color: var(--text); background: rgb(255 255 255 / 0.05); padding: 1px 5px; border-radius: 5px; }
.skeleton { height: 14px; border-radius: 6px; background: linear-gradient(90deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.09), rgb(255 255 255 / 0.04)); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
@keyframes shimmer { to { background-position: -200% 0; } }

/* ---- home -------------------------------------------------------------------- */

.hero { position: relative; display: flex; align-items: center; gap: 16px; padding: 4px 2px 20px; }
.hero::before {
  content: ""; position: absolute; inset: -60px -40px auto -60px; height: 220px; pointer-events: none;
  background: radial-gradient(closest-side, rgb(234 179 8 / 0.16), transparent); filter: blur(10px);
}
.hero-mark { position: relative; width: 52px; height: 52px; color: var(--brand); flex: none; }
.hero-mark svg { width: 100%; height: 100%; overflow: visible; }
.hero-mark rect { transform-box: fill-box; transform-origin: center; animation: block-in 620ms var(--spring) both; }
.hero-mark .b1 { animation-delay: 40ms; }
.hero-mark .b2 { animation-delay: 120ms; }
.hero-mark .b3 { animation-delay: 200ms; }
.hero-mark .b4 { animation: block-tip 760ms var(--spring) 300ms both; }
@keyframes block-in { from { opacity: 0; translate: 0 -10px; scale: 0.6; } }
@keyframes block-tip { from { opacity: 0; translate: 6px -14px; rotate: 40deg; } }
.hero h1 { position: relative; font: 600 22px/1.15 var(--display); letter-spacing: -0.02em; }
.hero h1 span { color: var(--brand); }
.hero p { position: relative; margin-top: 6px; color: var(--muted); }
.hero .row { position: relative; margin-top: 10px; }
.tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.tile {
  position: relative; display: flex; flex-direction: column; gap: 14px; padding: 14px; overflow: hidden; text-align: left;
  border-radius: 14px; background: var(--bg-1); border: 1px solid var(--line);
  transition: border-color 200ms var(--ease), transform 260ms var(--spring), background 200ms var(--ease);
  animation: rise 460ms var(--ease) both;
}
.tile::before {
  content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity 240ms var(--ease);
  background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 0%), rgb(234 179 8 / 0.1), transparent 60%);
}
.tile:hover { border-color: var(--brand-line); transform: translateY(-2px); background: var(--bg-2); }
.tile:hover::before { opacity: 1; }
.tile:nth-child(2) { animation-delay: 50ms; }
.tile:nth-child(3) { animation-delay: 100ms; }
.tile:nth-child(4) { animation-delay: 150ms; }
@keyframes rise { from { opacity: 0; translate: 0 8px; } }
.tile-head { display: flex; align-items: center; justify-content: space-between; }
.tile-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--brand-soft); color: var(--brand); }
.tile-icon .icon { width: 18px; height: 18px; }
.tile.error .tile-icon { background: var(--error-soft); color: var(--error); }
.tile.advice .tile-icon { background: var(--advice-soft); color: var(--advice); }
.tile.clean .tile-icon { background: var(--ok-soft); color: var(--ok); }
.tile-arrow { width: 16px; height: 16px; color: var(--faint); transition: transform 260ms var(--spring), color 200ms; }
.tile:hover .tile-arrow { transform: translateX(3px); color: var(--brand); }
.tile-value { font: 600 30px/1 var(--display); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.tile-label { margin-top: 6px; font-weight: 600; }
.tile-sub { margin-top: 2px; font-size: 12px; color: var(--muted); }
.shortcuts { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 16px; padding: 12px 14px; border-radius: 12px; background: rgb(255 255 255 / 0.02); border: 1px solid var(--line); color: var(--muted); font-size: 12px; }
.shortcut { display: inline-flex; align-items: center; gap: 4px; }
.shortcut span:last-child { margin-left: 6px; }

/* ---- lists ------------------------------------------------------------------- */

.search {
  display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; margin-bottom: 14px;
  border-radius: 11px; background: var(--bg-1); border: 1px solid var(--line); transition: border-color 160ms var(--ease), box-shadow 160ms var(--ease);
}
.search:focus-within { border-color: var(--brand-line); box-shadow: 0 0 0 3px var(--brand-soft); }
.search .icon { width: 15px; height: 15px; color: var(--faint); }
.search input { flex: 1; min-width: 0; height: 100%; background: none; border: 0; outline: none; }
.search input::placeholder { color: var(--faint); }
.list { display: flex; flex-direction: column; gap: 2px; }
.group { border-radius: 11px; transition: background 160ms var(--ease); }
.group[data-open="true"] { background: rgb(255 255 255 / 0.025); }
.group-row, .instance-row {
  display: flex; align-items: center; gap: 10px; width: 100%; min-height: 38px; padding: 6px 10px; border-radius: 10px; text-align: left;
  transition: background 140ms var(--ease);
}
.group-row:hover, .instance-row:hover { background: rgb(255 255 255 / 0.05); }
.group-row .chev { width: 14px; height: 14px; color: var(--faint); transition: transform 240ms var(--spring); }
.group[data-open="true"] .chev { transform: rotate(90deg); }
.group-row .name { font: 500 13px/1.2 var(--mono); }
.tier-dot { width: 7px; height: 7px; border-radius: 50%; flex: none; background: var(--faint); }
.tier-dot.none { background: var(--ok); }
.tier-dot.leaf { background: var(--brand); }
.tier-dot.required { background: var(--advice); }
.n-pill { min-width: 22px; padding: 2px 7px; border-radius: 999px; font: 500 11px/1.3 var(--sans); text-align: center; color: var(--muted); background: rgb(255 255 255 / 0.06); }
.mini { display: inline-flex; align-items: center; gap: 4px; font: 600 11px/1 var(--sans); }
.mini.error { color: var(--error); }
.mini.advice { color: var(--advice); }
.mini i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.instances { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 300ms var(--ease); }
.group[data-open="true"] .instances { grid-template-rows: 1fr; }
.instances > div { overflow: hidden; }
.instances .list { padding: 0 6px 6px 30px; }
.instance-row { min-height: 34px; font-size: 12.5px; }
.instance-row .idx { font: 500 11px var(--mono); color: var(--faint); width: 22px; }
.instance-row .text { color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.instance-row .props { font: 11.5px var(--mono); color: var(--faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.instance-row .go { width: 14px; height: 14px; color: var(--faint); opacity: 0; transition: opacity 140ms, transform 200ms var(--spring); }
.instance-row:hover .go { opacity: 1; transform: translateX(2px); color: var(--brand); }
.legend { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 14px; font-size: 11.5px; color: var(--faint); }
.legend span { display: inline-flex; align-items: center; gap: 6px; }

/* ---- findings ------------------------------------------------------------------ */

.summary { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.summary-value { font: 600 34px/1 var(--display); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.summary.error .summary-value { color: var(--error); }
.summary.advice .summary-value { color: var(--advice); }
.summary-text { color: var(--muted); font-size: 12.5px; }
.summary-text strong { display: block; color: var(--text); font: 600 14px/1.3 var(--display); }
.segmented { display: inline-flex; padding: 3px; margin-left: auto; border-radius: 10px; background: var(--bg-1); border: 1px solid var(--line); }
.segmented button { height: 26px; padding: 0 10px; border-radius: 7px; font-size: 12px; color: var(--muted); transition: background 160ms var(--ease), color 160ms var(--ease); }
.segmented button[aria-pressed="true"] { background: var(--bg-3); color: var(--text); box-shadow: 0 1px 2px rgb(0 0 0 / 0.4); }
.file-card { margin-bottom: 10px; border-radius: 13px; background: var(--bg-1); border: 1px solid var(--line); overflow: hidden; animation: rise 360ms var(--ease) both; }
.file-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: 1px solid var(--line); background: rgb(255 255 255 / 0.015); }
.file-head .icon { width: 14px; height: 14px; color: var(--faint); }
.finding { position: relative; display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; padding: 10px 12px 10px 15px; }
.finding + .finding { border-top: 1px solid var(--line); }
.finding::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 3px; border-radius: 0 3px 3px 0; background: var(--error); }
.finding.warning::before { background: var(--advice); }
.finding .at { font: 500 11.5px/1.6 var(--mono); color: var(--faint); }
.finding .message { line-height: 1.45; }
.finding .meta { grid-column: 2; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.finding .rule { font: 11px var(--mono); color: var(--faint); }
.chip {
  display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px; border-radius: 7px;
  font: 500 11.5px/1 var(--mono); color: var(--text); background: rgb(255 255 255 / 0.05); border: 1px solid var(--line);
  transition: border-color 140ms var(--ease), color 140ms var(--ease);
}
button.chip:hover { border-color: var(--brand-line); color: var(--brand-2); }
.chip .icon { width: 12px; height: 12px; }
.chip.exact { color: var(--brand-2); border-color: var(--brand-line); background: var(--brand-soft); }

/* ---- component detail ----------------------------------------------------------- */

.detail-head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
.detail-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 13px; flex: none; background: var(--brand-soft); color: var(--brand); border: 1px solid var(--brand-line); }
.detail-icon .icon { width: 22px; height: 22px; }
.detail-head h2 { font: 600 20px/1.2 var(--mono); letter-spacing: -0.01em; word-break: break-word; }
.detail-head .chain { margin-top: 4px; font: 12px var(--mono); color: var(--faint); }
.detail-head .row { margin-top: 10px; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.props { width: 100%; border-collapse: collapse; font: 12px/1.5 var(--mono); }
.props td { padding: 7px 0; vertical-align: top; border-top: 1px solid var(--line); }
.props tr:first-child td { border-top: 0; }
.props td:first-child { width: 1%; padding-right: 16px; white-space: nowrap; color: var(--muted); }
.props td:last-child { color: var(--brand-2); word-break: break-word; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.gone { display: flex; gap: 10px; align-items: center; padding: 10px 12px; margin-bottom: 14px; border-radius: 11px; background: var(--error-soft); color: var(--error); font-size: 12.5px; }

/* ---- report ------------------------------------------------------------------ */

.target { display: flex; align-items: center; gap: 12px; padding: 12px; }
.target .detail-icon { width: 36px; height: 36px; border-radius: 10px; }
.target .detail-icon .icon { width: 18px; height: 18px; }
.target .name { font: 600 14px/1.2 var(--mono); }
.field-label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); }
.field {
  display: block; width: 100%; margin-top: 6px; padding: 9px 11px; border-radius: 10px; resize: vertical;
  background: var(--bg-1); color: var(--text); border: 1px solid var(--line-2); outline: none;
  transition: border-color 160ms var(--ease), box-shadow 160ms var(--ease);
}
.field::placeholder { color: var(--faint); }
.field:focus { border-color: var(--brand-line); box-shadow: 0 0 0 3px var(--brand-soft); }
.switch-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 2px; cursor: pointer; }
.switch-row + .switch-row { border-top: 1px solid var(--line); }
.switch-row small { display: block; color: var(--faint); font-size: 11.5px; }
.switch { position: relative; width: 34px; height: 20px; flex: none; }
.switch input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
.switch span { position: absolute; inset: 0; border-radius: 999px; background: var(--bg-3); border: 1px solid var(--line-2); transition: background 200ms var(--ease); pointer-events: none; }
.switch span::after { content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--muted); transition: transform 260ms var(--spring), background 200ms; }
.switch input:checked + span { background: var(--brand); border-color: transparent; }
.switch input:checked + span::after { transform: translateX(14px); background: var(--brand-ink); }
.switch input:focus-visible + span { outline: 2px solid var(--brand); outline-offset: 2px; }
.shot { display: flex; align-items: center; gap: 10px; }
.thumb { max-width: 120px; max-height: 72px; border-radius: 8px; border: 1px solid var(--line-2); }
details.json-box { border-radius: 12px; background: var(--bg-1); border: 1px solid var(--line); }
details.json-box summary { display: flex; align-items: center; gap: 8px; padding: 10px 12px; cursor: pointer; list-style: none; font-weight: 500; }
details.json-box summary::-webkit-details-marker { display: none; }
details.json-box summary .icon { width: 14px; height: 14px; color: var(--faint); transition: transform 240ms var(--spring); }
details.json-box[open] summary .icon { transform: rotate(90deg); }
.json {
  margin: 0; max-height: 220px; overflow: auto; padding: 12px; border-top: 1px solid var(--line);
  font: 11px/1.5 var(--mono); color: var(--muted); white-space: pre-wrap; word-break: break-word;
}
.problems { margin: 0; padding: 10px 12px 10px 28px; border-radius: 10px; background: var(--error-soft); color: var(--error); font-size: 12px; }
.problems:empty { display: none; }
.report-status { font-size: 12.5px; min-height: 18px; }
.report-status.failed { color: var(--error); }
.report-status.sent { color: var(--ok); }

/* ---- GitHub ------------------------------------------------------------------- */

.small { font-size: 12px; }
.account { display: flex; align-items: center; gap: 12px; padding: 12px 14px; }
.account-name { font: 600 14px/1.3 var(--display); }
.account-error { margin-top: 6px; font-size: 12px; color: var(--error); }
.account-actions { display: flex; flex-direction: column; gap: 6px; }
.gh-avatar {
  display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; flex: none;
  font: 600 15px/1 var(--display); color: var(--brand-ink); background: linear-gradient(180deg, var(--brand-2), var(--brand));
}
.gh-avatar.muted-avatar { color: var(--text); background: var(--bg-3); border: 1px solid var(--line-2); }
.gh-avatar .icon { width: 18px; height: 18px; }
.account.pending { align-items: stretch; border-color: var(--brand-line); background: linear-gradient(180deg, var(--brand-soft), transparent 70%), var(--bg-1); }
.device-code {
  margin: 6px 0 8px; font: 600 28px/1 var(--mono); letter-spacing: 0.12em; color: var(--brand-2);
  text-shadow: 0 0 24px rgb(234 179 8 / 0.35); user-select: all;
}
.waiting { gap: 8px; font-size: 12px; color: var(--muted); }
.spinner { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--line-2); border-top-color: var(--brand); animation: spin 0.8s linear infinite; }
.spinning svg { animation: spin 0.8s linear infinite; }
.issue-row {
  display: flex; align-items: flex-start; gap: 10px; padding: 11px 12px; color: inherit; text-decoration: none;
  transition: background 140ms var(--ease);
}
.issue-row + .issue-row { border-top: 1px solid var(--line); }
.issue-row:hover { background: rgb(255 255 255 / 0.03); }
.issue-row .state { width: 16px; height: 16px; margin-top: 1px; }
.issue-row.open .state { color: var(--ok); }
.issue-row.done .state { color: #c4a5ff; }
.issue-row.skipped .state { color: var(--faint); }
.issue-title { font-weight: 500; line-height: 1.4; }
.issue-meta { margin-top: 2px; font-size: 12px; color: var(--faint); }
.issue-row .go { width: 14px; height: 14px; color: var(--faint); opacity: 0; transition: opacity 140ms; }
.issue-row:hover .go { opacity: 1; color: var(--brand); }
button.link { font: inherit; padding: 0; }
.similar { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.similar.likely { border-color: var(--brand-line); background: linear-gradient(180deg, var(--brand-soft), transparent 80%), var(--bg-1); }
.similar-head { display: flex; align-items: center; gap: 8px; font: 600 13.5px/1.3 var(--display); }
.similar-head .icon { width: 15px; height: 15px; color: var(--brand); }
.similar-head.quiet { margin-top: 4px; font: 600 11px/1 var(--sans); letter-spacing: 0.08em; text-transform: uppercase; color: var(--faint); }
.similar-row { display: flex; align-items: center; gap: 10px; min-height: 34px; }
.similar-row .state { width: 15px; height: 15px; }
.similar-row .state.open { color: var(--ok); }
.similar-row .state.closed { color: #c4a5ff; }
.similar-title { color: var(--text); text-decoration: none; line-height: 1.35; }
.similar-title:hover { color: var(--brand-2); }

/* ---- picking ------------------------------------------------------------------- */

.highlight {
  position: fixed; left: 0; top: 0; z-index: 2147482999; pointer-events: none;
  border: 1.5px solid var(--brand); border-radius: 6px;
  background: rgb(234 179 8 / 0.08);
  box-shadow: 0 0 0 4px rgb(234 179 8 / 0.12), 0 0 30px rgb(234 179 8 / 0.15);
  transition: transform 90ms var(--ease), width 90ms var(--ease), height 90ms var(--ease), opacity 120ms;
}
.highlight.flash { animation: flash 900ms var(--ease) 2; }
@keyframes flash { 50% { box-shadow: 0 0 0 10px rgb(234 179 8 / 0.25), 0 0 40px rgb(234 179 8 / 0.35); } }
.highlight .label {
  position: absolute; left: -1.5px; bottom: calc(100% + 6px); display: flex; align-items: center; gap: 8px;
  padding: 5px 9px; border-radius: 8px; white-space: nowrap;
  background: var(--brand); color: var(--brand-ink); font: 600 11.5px/1 var(--mono);
  box-shadow: 0 8px 20px -6px rgb(0 0 0 / 0.5);
}
.highlight .label .size { font-weight: 500; opacity: 0.7; }
.highlight.below .label { bottom: auto; top: calc(100% + 6px); }
.toast {
  position: fixed; left: 50%; top: 16px; z-index: 2147483002; translate: -50% 0;
  display: flex; align-items: center; gap: 10px; padding: 8px 10px 8px 12px; border-radius: 12px;
  background: rgb(14 14 18 / 0.94); border: 1px solid var(--brand-line); color: var(--text);
  box-shadow: 0 16px 40px -12px rgb(0 0 0 / 0.7);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  animation: toast-in 380ms var(--spring) both;
}
.toast .icon { width: 16px; height: 16px; color: var(--brand); animation: spin 6s linear infinite; }
@keyframes toast-in { from { opacity: 0; translate: -50% -14px; } }
@keyframes spin { to { rotate: 360deg; } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; }
}
`;
