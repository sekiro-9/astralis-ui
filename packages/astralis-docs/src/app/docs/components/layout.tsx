import { Flex } from "astralis-ui";
import spec from "astralis-ui/system-spec.json";
import { ClientTierBadge } from "@/modules/docs/client-tier-badge";

/**
 * Shared layout for every component page: injects the client/server badge in
 * one place instead of 62. The slug→tier map is computed here (server) from
 * the build-emitted system spec — the same artifact `astralis validate` and
 * the MCP validate_code tool read, so the badge can't drift from what ships.
 * Only this tiny map crosses to the client; the active segment is read
 * client-side because static layouts don't receive it during server render.
 */

// Slugs that don't pascal-case straight into their export name.
const SLUG_EXCEPTIONS: Record<string, string> = {
  toast: "Toaster",
};

const pascal = (slug: string) =>
  slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

const components = (spec as { components: Record<string, { client?: "none" | "leaf" | "required" }> })
  .components;

const tiers: Record<string, "none" | "leaf" | "required"> = {};
for (const [name, entry] of Object.entries(components)) {
  if (entry.client) tiers[name] = entry.client;
}

/** slug → tier, resolved once at build time. */
function tierForSlug(slug: string) {
  return tiers[SLUG_EXCEPTIONS[slug] ?? pascal(slug)];
}

// Precompute for every possible slug the badge may see; unknown slugs get no
// badge (e.g. the [file] source-viewer route).
const slugTiers: Record<string, "none" | "leaf" | "required"> = {};
for (const name of Object.keys(tiers)) {
  const slug = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  slugTiers[slug] = tiers[name];
}
slugTiers["toast"] = tierForSlug("toast");

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Flex justifyContent="end" pt="4">
        <ClientTierBadge tiers={slugTiers} />
      </Flex>
      {children}
    </>
  );
}
