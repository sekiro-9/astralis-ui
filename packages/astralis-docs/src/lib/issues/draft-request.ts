import { checkSnapshot, MAX_SNAPSHOT_BYTES, type Snapshot } from "astralis-cli/snapshot";

export type DraftRequest = { ok: true; snapshot: Snapshot } | { ok: false; status: number; error: string };

const refuse = (status: number, error: string): DraftRequest => ({ ok: false, status, error });

/**
 * Read a draft's body, at most `limit` bytes. Stops reading as soon as the
 * body passes the limit, so an oversized upload costs no more than the limit.
 */
async function readCapped(request: Request, limit: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Everything the draft endpoint checks before touching the database: a JSON
 * body, within the size limit, that is a valid astralis-snapshot/1. The
 * snapshot module is the same one the DevTools and the CLI checked it with.
 */
export async function readDraftRequest(request: Request): Promise<DraftRequest> {
  const type = request.headers.get("content-type") ?? "";
  if (!/^application\/json\b/i.test(type)) return refuse(415, "a draft must be sent as application/json");

  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_SNAPSHOT_BYTES) {
    return refuse(413, `a draft is at most ${MAX_SNAPSHOT_BYTES / 1024} kB`);
  }
  const text = await readCapped(request, MAX_SNAPSHOT_BYTES);
  if (text === null) return refuse(413, `a draft is at most ${MAX_SNAPSHOT_BYTES / 1024} kB`);

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return refuse(400, "the body is not valid JSON");
  }
  const problems = checkSnapshot(value);
  if (problems.length) return refuse(422, problems.join("; "));
  return { ok: true, snapshot: value as Snapshot };
}
