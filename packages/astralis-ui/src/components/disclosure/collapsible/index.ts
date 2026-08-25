import { CollapsibleRoot } from "./components/collapsible-root";
import { CollapsibleTrigger, CollapsibleContent } from "./components/collapsible-parts";

export const Collapsible = Object.assign(CollapsibleRoot, {
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
});

export { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent };
export type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
} from "./collapsible.types";
