import { PopoutRoot } from "./components/popout-root";
import { PopoutTrigger } from "./components/popout-parts";
import { PopoutContent } from "./components/popout-content";

export const Popout = Object.assign(PopoutRoot, {
  Trigger: PopoutTrigger,
  Content: PopoutContent,
});

export { PopoutRoot, PopoutTrigger, PopoutContent };
export type {
  PopoutProps,
  PopoutTriggerProps,
  PopoutContentProps,
  PopoutSide,
  PopoutAlign,
} from "./popout.types";
