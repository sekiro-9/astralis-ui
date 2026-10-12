/* The arrow-key menu's logic, apart from any terminal: what a key does to the
   choice, and the lines that show it. prompt-child.mjs drives it in a
   throwaway process (the CLI itself never reads stdin), and the tests drive
   it with plain objects. Also the one-line banner. */

const ESC = "\u001b";
const sgr = (open, close) => (color) => (text) => (color ? `${ESC}[${open}m${text}${ESC}[${close}m` : text);
const brand = sgr("38;2;234;179;8", "39"); // the brand yellow, #eab308

const paint = (color) => ({
  brand: brand(color),
  bold: sgr("1", "22")(color),
  dim: sgr("2", "22")(color),
  green: sgr("32", "39")(color),
});

/**
 * A key, as Node's keypress events name it, applied to the menu.
 * Returns the next state; `done` is the chosen index, or "cancel".
 */
export function press(state, key = {}) {
  const count = state.options.length;
  if (key.ctrl && key.name === "c") return { ...state, done: "cancel" };
  if (key.name === "escape") return { ...state, done: "cancel" };
  if (key.name === "return" || key.name === "enter") return { ...state, done: state.index };
  if (key.name === "up" || key.name === "k") return { ...state, index: (state.index - 1 + count) % count };
  if (key.name === "down" || key.name === "j" || key.name === "tab") return { ...state, index: (state.index + 1) % count };
  const digit = Number(key.sequence);
  if (Number.isInteger(digit) && digit >= 1 && digit <= count) return { ...state, index: digit - 1, done: digit - 1 };
  return state;
}

/** The menu while it is open: the question, then each option, the current one marked. */
export function drawOpen(state, { color = true } = {}) {
  const c = paint(color);
  const lines = [`${c.brand("◆")}  ${c.bold(state.question)}`];
  state.options.forEach((option, i) => {
    const current = i === state.index;
    const mark = current ? c.brand("●") : c.dim("○");
    const label = current ? option.label : c.dim(option.label);
    const hint = option.hint && current ? `  ${c.dim(option.hint)}` : "";
    lines.push(`${c.dim("│")}  ${mark} ${label}${hint}`);
  });
  lines.push(`${c.dim("└")}  ${c.dim("↑/↓ to move · enter to choose")}`);
  return lines;
}

/** The menu once answered: one line, the question and the answer. */
export function drawDone(state, { color = true } = {}) {
  const c = paint(color);
  if (state.done === "cancel") return [`${c.dim("◇")}  ${c.dim(state.question)} ${c.dim("· cancelled")}`];
  return [`${c.green("◇")}  ${state.question} ${c.dim("›")} ${state.options[state.done].label}`];
}

/** The banner: one line, the name and version, then what is about to happen. */
export function banner({ version, subtitle, color = true }) {
  const c = paint(color);
  return `\n${c.brand("◆")}  ${c.bold("Astralis CLI")} ${c.dim(`v${version}`)}  ${c.dim("·")}  ${subtitle}\n`;
}
