import type { ComponentPropsWithoutRef } from "react";
import type { PlacementProps } from "../../../utils/placement";

export interface TableOfContentsItem {
  /** The id of the heading element this entry targets (`<h2 id="...">`). */
  id: string;
  title: string;
  /** Nesting depth, 0-based — indents the entry. @default 0 */
  depth?: number;
}

export interface TableOfContentsProps extends ComponentPropsWithoutRef<"nav">, PlacementProps {
  items: TableOfContentsItem[];
  /** Accessible name for the nav. @default "On this page" */
  label?: string;
  /** Show `label` as a visible heading above the list. @default true */
  showLabel?: boolean;
  /** Top inset (sticky headers) subtracted when deciding the active heading, px. @default 80 */
  offset?: number;
}
