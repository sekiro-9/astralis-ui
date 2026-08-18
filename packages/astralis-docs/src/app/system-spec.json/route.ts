import spec from "astralis-ui/system-spec.json";

/**
 * The system spec of the astralis-ui version THIS docs deploy documents —
 * the machine-verifiable ground truth (components, prop vocabularies, class
 * inventory, anatomy). Served for consumers with no local install to read:
 * the MCP validate tool falls back here when no node_modules/astralis-ui is
 * found near its working directory (e.g. Claude Desktop). Static import, so
 * the payload is baked at build time and can never drift from the package
 * the demos on this site actually ran against.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return Response.json(spec, {
    headers: { "cache-control": "public, max-age=300, s-maxage=3600" },
  });
}
