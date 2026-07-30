import type { BlockMeta } from "../../registry";

export default {
  id: "forgot-password-01",
  category: "forgot-password",
  name: "Single-field reset request",
  description:
    "Password reset request on a tinted band: envelope mark, an explanation of what happens next, one email field with a privacy-preserving hint, and a route back to sign-in.",
  tags: ["centred", "single-field", "help-text", "back-link", "tinted-surface"],
} satisfies BlockMeta;
