/**
 * The DevTools bridge as a Next.js route handler. Re-export it from
 * `app/api/astralis-devtools/[...path]/route.ts`:
 *
 *   export { GET } from "astralis-devtools/next/route";
 *
 * In production it answers 404 without loading the bridge, so the validator
 * never runs in a deployed app.
 */
export async function GET(request) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const { handle } = await import("../bridge/http.mjs");
  return handle(request, { root: process.cwd(), framework: "next" });
}
