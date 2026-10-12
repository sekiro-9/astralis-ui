/*
 * Reads exactly one line of input, writes it to stdout, exits. Exit code 3
 * means stdin was already at EOF: nobody is there to answer.
 *
 * Why a CHILD process: the CLI itself must never read stdin. On Windows libuv
 * services a TTY on a thread blocked in ReadConsoleInputW that cannot be
 * stopped once started (not by readline.close(), pause(), or dropping
 * listeners), so a process that read stdin once keeps eating console input for
 * the rest of its life. `astralis create` then handed over to create-vite,
 * whose arrow-key menu drew and never received a keystroke. Here the read
 * thread dies when this process exits.
 *
 * Why BYTE BY BYTE: readline buffers ahead, which swallows the rest of a piped
 * input and leaves the next prompt's child at EOF. Stopping at the first
 * newline leaves the rest of the pipe for the next prompt. Line editing still
 * works: the terminal driver releases only the finished line.
 *
 * The prompt goes to stderr (inherited, so the user sees it); the answer goes
 * to stdout, which the parent pipes.
 *
 * MENU MODE (`--menu <json>`): an arrow-key menu, drawn on stderr, with the
 * chosen index on stdout. Exit 3: not a terminal, so the parent falls back to
 * a numbered prompt. Exit 130: cancelled (Ctrl+C or Esc). Raw mode and the
 * console read thread end with this process, as above.
 */
import { readSync } from "node:fs";
import { emitKeypressEvents } from "node:readline";
import { drawDone, drawOpen, press } from "./menu.mjs";

const ESC = "\u001b";

if (process.argv[2] === "--menu") menu(JSON.parse(process.argv[3]));
else line(process.argv[2] ?? "");

function menu({ question, options, index = 0, color = true }) {
  if (!process.stdin.isTTY || !process.stderr.isTTY) process.exit(3);
  const out = process.stderr;
  let state = { question, options, index, done: null };
  let drawn = 0;
  const draw = (lines) => {
    // Back to the menu's first line and clear what was drawn, then draw again.
    if (drawn) out.write(`${ESC}[${drawn}A${ESC}[0J`);
    out.write(lines.join("\n") + "\n");
    drawn = lines.length;
  };
  out.write(`${ESC}[?25l`); // hide the cursor while the menu is open
  process.on("exit", () => out.write(`${ESC}[?25h`));
  draw(drawOpen(state, { color }));
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on("keypress", (_text, key) => {
    state = press(state, key ?? {});
    if (state.done === null) return draw(drawOpen(state, { color }));
    draw(drawDone(state, { color }));
    process.stdin.setRawMode(false);
    if (state.done === "cancel") process.exit(130);
    process.stdout.write(String(state.done));
    process.exit(0);
  });
}

function line(prompt) {
  if (prompt) process.stderr.write(prompt);

  const byte = Buffer.alloc(1);
  const bytes = [];
  const pause = new Int32Array(new SharedArrayBuffer(4));
  let atEof = false;

  while (true) {
    let read;
    try {
      read = readSync(0, byte, 0, 1, null);
    } catch (error) {
      // Non-blocking stdin yields EAGAIN until data arrives: wait rather than spin.
      if (error.code === "EAGAIN") {
        Atomics.wait(pause, 0, 0, 20);
        continue;
      }
      if (error.code === "EOF") {
        atEof = true;
        break;
      }
      throw error;
    }
    if (read === 0) {
      atEof = true;
      break;
    }
    if (byte[0] === 0x0a) break; // \n: the line is done
    if (byte[0] === 0x0d) continue; // \r from CRLF
    bytes.push(byte[0]);
  }

  if (atEof && bytes.length === 0) process.exit(3);
  process.stdout.write(Buffer.from(bytes).toString("utf8"));
}
