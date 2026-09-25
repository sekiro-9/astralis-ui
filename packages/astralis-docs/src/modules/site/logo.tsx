import Link from "next/link";

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
    <Link
      href="/"
      className="group flex items-center gap-2 text-label transition-opacity hover:opacity-80"
    >
      <AstralisMark className="size-6" />
      <span className="font-display text-[15px] font-semibold tracking-tight">
        Astralis
        <span className="ml-1.5 rounded-md border border-stroke-base bg-surface-subtle px-1.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-widest text-label-muted">
          UI
        </span>
      </span>
    </Link>
  );
}
