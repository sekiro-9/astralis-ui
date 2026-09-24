import { readDraftRequest } from "@/lib/issues/draft-request";
import { clientAddress } from "@/lib/issues/request";
import { createDraft, IssueError, platformReady } from "@/server/issues";

/**
 * Where the DevTools and `astralis report` send a snapshot: anonymously, as
 * a private draft that lives 24 hours. Answers 201 with the draft's page,
 * where the reporter signs in with GitHub, reviews it and submits it.
 *
 * Both senders post from Node (the dev server's bridge and the CLI), never
 * from a browser page, so there is no CORS to answer.
 */
export async function POST(request: Request): Promise<Response> {
  if (!platformReady()) return Response.json({ error: "the issue platform is not configured on this site" }, { status: 503 });

  const read = await readDraftRequest(request);
  if (!read.ok) return Response.json({ error: read.error }, { status: read.status });

  try {
    const id = await createDraft(read.snapshot, clientAddress(request.headers));
    // The canonical origin, not whichever alias the request arrived on: the
    // sign-in cookie belongs to that origin alone.
    const url = new URL(`/issues/new?draft=${id}`, process.env.BETTER_AUTH_URL || request.url).toString();
    return Response.json({ id, url }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof IssueError) return Response.json({ error: error.message }, { status: error.status });
    // Most often the database is unreachable. The sender shows this message
    // as it is, and keeps the snapshot (Copy JSON, Download, --out).
    console.error(error);
    return Response.json({ error: "the issue platform is unavailable right now; try again shortly" }, { status: 503 });
  }
}
