import { SplitterRoot } from "./components/splitter-root";
import { SplitterPanel, SplitterHandle } from "./components/splitter-parts";

// 1️⃣ Compound API
export const Splitter = Object.assign(SplitterRoot, {
  Panel: SplitterPanel,
  Handle: SplitterHandle,
});

// 2️⃣ Flat exports
export { SplitterPanel, SplitterHandle };

// 3️⃣ Type exports
export type {
  SplitterProps,
  SplitterPanelProps,
  SplitterHandleProps,
  SplitterOrientation,
  SplitterContextValue,
} from "./splitter.types";
