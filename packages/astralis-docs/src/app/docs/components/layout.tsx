import { Flex } from "astralis-ui";
import spec from "astralis-ui/system-spec.json";
import { ClientTierBadge } from "@/modules/docs/client-tier-badge";

/**
 * Shared layout for every component page: injects the client/server badge in
 * one place. The slug→tier map is computed here (server) from the
 * build-emitted system spec, the same artifact `astralis validate` and the
 * MCP validate_code tool read, so the badge can't drift from what ships.
 * Only this tiny map crosses to the client; the active segment is read
 * client-side because static layouts don't receive it during server render.
 */

type Tier = "none" | "leaf" | "required";

const components = (spec as { components: Record<string, { client?: Tier }> }).components;

/** `SegmentedControl` → `segmented-control`; unknown slugs get no badge. */
const slugTiers: Record<string, Tier> = {};
for (const [name, entry] of Object.entries(components)) {
  if (!entry.client) continue;
  slugTiers[name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()] = entry.client;
}
// The Toast page documents the Toaster component.
if (components.Toaster?.client) slugTiers.toast = components.Toaster.client;

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
