import { HoverCardRoot, HoverCardTrigger } from "./components/hover-card-root";
import { HoverCardContent } from "./components/hover-card-content";

// 1️⃣ Compound API
export const HoverCard = Object.assign(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
});

// 2️⃣ Flat exports
export { HoverCardRoot, HoverCardTrigger, HoverCardContent };

// 3️⃣ Type exports
export type { HoverCardProps, HoverCardTriggerProps, HoverCardContentProps } from "./hover-card.types";
