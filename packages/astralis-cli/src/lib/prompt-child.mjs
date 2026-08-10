/*
 * Reads exactly one line of input, writes it to stdout, exits.
 *
 * Two constraints shape this, and both were found the hard way.
 *
 * 1. It runs as a short-lived CHILD of the CLI, so the CLI process itself
 *    never reads stdin. On Windows libuv services a TTY on a dedicated thread
 *    blocked in ReadConsoleInputW, and once started that thread cannot be
 *    stopped — not by readline.close(), not by pause(), not by dropping
 *    listeners. A process that has read stdin even once keeps consuming
 *    console input records for the rest of its life, starving any interactive
 *    child it later spawns: `astralis create` asked which framework, then
 *    handed to create-vite, whose arrow-key menu drew perfectly and never saw
 *    a keystroke. Here the read thread dies when this process exits.
 *
 * 2. It reads BYTE BY BYTE rather than with readline. readline buffers ahead,
 *    which is harmless on a terminal but swallows the whole pipe when input
 *    is piped — the next prompt's child would then see EOF. Stopping at the
 *    first newline leaves the rest of the pipe for the next prompt.
 *
 * Line editing still works: the terminal driver (or Windows console) handles
 * backspace in cooked mode and only releases the finished line to us.
 *
 * Prompt text goes to stderr, which is inherited so the user sees it; the
 * answer goes to stdout, which the parent pipes.
 */
import { readSync } from "node:fs";

const prompt = process.argv[2] ?? "";
if (prompt) process.stderr.write(prompt);

const byte = Buffer.alloc(1);
const bytes = [];

while (true) {
  let read;
  try {
    read = readSync(0, byte, 0, 1, null);
  } catch (error) {
    // Non-blocking stdin yields EAGAIN before data arrives; EOF ends the line.
    if (error.code === "EAGAIN") continue;
    if (error.code === "EOF") break;
    throw error;
  }
  if (read === 0) break; // EOF
  if (byte[0] === 0x0a) break; // \n — the line is done
  if (byte[0] === 0x0d) continue; // \r from CRLF
  bytes.push(byte[0]);
}

process.stdout.write(Buffer.from(bytes).toString("utf8"));
