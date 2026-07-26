import type { BlockMeta } from "../../../registry";

export default {
  id: "signup-01",
  category: "auth",
  family: "signup",
  name: "Centred card with value list",
  description:
    "Sign-up card on a tinted band: split first and last name row, work email, password with a strength hint, a terms checkbox, and a short ticked list of what the free tier includes.",
  tags: ["centred", "split-name-row", "terms-consent", "value-list", "tinted-surface"],
} satisfies BlockMeta;
