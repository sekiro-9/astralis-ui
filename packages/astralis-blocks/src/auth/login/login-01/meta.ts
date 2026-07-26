import type { BlockMeta } from "../../../registry";

export default {
  id: "login-01",
  category: "auth",
  family: "login",
  name: "Centred card with social sign-in",
  description:
    "Sign-in card on a tinted band: brand mark and heading above, then email and password fields with an inline forgot-password link, a keep-signed-in checkbox, and Google and GitHub providers below a divider.",
  tags: ["centred", "social-providers", "remember-me", "tinted-surface", "panel-card"],
} satisfies BlockMeta;
