import type { ScrollAreaDirection } from "./scroll-area.types";

/* The scrollbars are the PLATFORM's, restyled with CSS — ::-webkit-scrollbar
   for Chromium/WebKit, scrollbar-width/scrollbar-color for Firefox. No JS
   thumb, no ResizeObserver, no synthetic scrolling: native behavior
   (keyboard, momentum, RTL) is untouched and the component ships zero
   client JavaScript. */

export const scrollAreaDirections: Record<ScrollAreaDirection, string> = {
  vertical: "astralis:overflow-y-auto astralis:overflow-x-hidden",
  horizontal: "astralis:overflow-x-auto astralis:overflow-y-hidden",
  both: "astralis:overflow-auto",
};

export const scrollAreaBar =
  "astralis:[scrollbar-width:thin] astralis:[scrollbar-color:var(--astralis-color-stroke-muted)_transparent] " +
  "astralis:[&::-webkit-scrollbar]:size-2 " +
  "astralis:[&::-webkit-scrollbar-track]:bg-transparent " +
  "astralis:[&::-webkit-scrollbar-thumb]:rounded-full " +
  "astralis:[&::-webkit-scrollbar-thumb]:bg-stroke-muted " +
  "astralis:[&::-webkit-scrollbar-thumb:hover]:bg-stroke-base";

export const scrollAreaHidden =
  "astralis:[scrollbar-width:none] astralis:[&::-webkit-scrollbar]:hidden";
