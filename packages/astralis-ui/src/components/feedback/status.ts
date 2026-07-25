import type { ColorScheme } from "../../const/color-schemes";
import { InfoIcon, CircleCheckIcon, TriangleAlertIcon, CircleAlertIcon } from "../icon/internal-icons";

/** The shared status vocabulary for feedback components (Alert, Toast). */
export type FeedbackStatus = "info" | "success" | "warning" | "error";

/**
 * Default palette per status — components allow a colorScheme override.
 *
 * These point at the ROLE palettes, not the literal hues. `error` defaults to
 * red, but it is a first-class palette that `errorColor` reseeds; `red` is a
 * literal that must always contain red. Pointing at `red` here meant a themed
 * `errorColor` regenerated a palette that Alert and Toast never read.
 * Identical rendering until a seed is supplied, since each role palette
 * aliases the hue below it.
 */
export const STATUS_SCHEME: Record<FeedbackStatus, ColorScheme> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

export const STATUS_ICON: Record<FeedbackStatus, typeof InfoIcon> = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  error: CircleAlertIcon,
};

/** Interruptive statuses announce assertively; informational ones politely. */
export const statusRole = (status: FeedbackStatus): "alert" | "status" =>
  status === "error" || status === "warning" ? "alert" : "status";
