/**
 * The DevTools bridge as a Next.js route handler. Re-export both methods from
 * `app/api/astralis-devtools/[...path]/route.ts`:
 *
 *   export { GET, POST } from "astralis-devtools/next/route";
 *
 * Answers the local machine only in development, and 404 in production.
 */
export function GET(request: Request): Promise<Response>;
export function POST(request: Request): Promise<Response>;
