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
 */
import { readSync } from "node:fs";

const prompt = process.argv[2] ?? "";
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
