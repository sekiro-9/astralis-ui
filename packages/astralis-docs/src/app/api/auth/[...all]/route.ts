import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/auth";

// The lambda matters: calling auth() here would build the instance at import,
// and `next build` imports every route.
export const { GET, POST } = toNextJsHandler((request) => auth().handler(request));
