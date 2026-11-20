import NextLink from "next/link";
import { Box, Flex } from "astralis-ui";

/**
 * The Astralis mark: four blocks, the last still being placed. Painted with
 * the brand token, so it re-colours with the theme. Inside a `group`, the
 * last block settles into place on hover.
 */
export function AstralisMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`overflow-visible ${className}`} aria-hidden="true">
      <g fill="var(--astralis-color-brand-500)">
        <rect x="3" y="17" width="12" height="12" rx="3" />
        <rect x="17" y="17" width="12" height="12" rx="3" />
        <rect x="3" y="3" width="12" height="12" rx="3" />
        <rect
          x="19"
          y="1"
          width="12"
          height="12"
          rx="3"
          className="origin-center rotate-[14deg] opacity-60 transition-[rotate,translate,opacity] duration-300 ease-out [transform-box:fill-box] group-hover:translate-x-[-2px] group-hover:translate-y-[2px] group-hover:rotate-0 group-hover:opacity-100 motion-reduce:transition-none"
        />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <Flex as={NextLink} href="/" alignItems="center" gap="2" color="base" className="group transition-opacity hover:opacity-80">
      <AstralisMark className="size-6" />
      {/* 15px and 10px sit between the type scale's steps, so the wordmark's type is set with classes. */}
      <Box as="span" className="font-display text-[15px] font-semibold tracking-tight">
        Astralis
        <Box
          as="span"
          ml="1.5"
          px="1.5"
          py="0.5"
          rounded="md"
          border="normal"
          borderColor="base"
          bg="subtle"
          color="muted"
          className="align-middle text-[10px] font-medium uppercase tracking-widest"
        >
          UI
        </Box>
      </Box>
    </Flex>
  );
}
