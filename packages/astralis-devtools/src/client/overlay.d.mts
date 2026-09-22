export interface MountOptions {
  /** Where the bridge is served. Default "/api/astralis-devtools". */
  base?: string;
  /** Which framework's route hints to show. */
  framework?: "next" | "vite" | null;
}

/** Mount the overlay on this page. Returns a function that removes it. */
export function mountOverlay(options?: MountOptions): () => void;
