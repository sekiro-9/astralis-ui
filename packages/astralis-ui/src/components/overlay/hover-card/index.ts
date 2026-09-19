import { HoverCardRoot, HoverCardTrigger } from "./components/hover-card-root";
import { HoverCardContent } from "./components/hover-card-content";

export const HoverCard = Object.assign(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
});

export { HoverCardRoot, HoverCardTrigger, HoverCardContent };

export type { HoverCardProps, HoverCardTriggerProps, HoverCardContentProps } from "./hover-card.types";
