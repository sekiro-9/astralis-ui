import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "path";

const nextConfig: NextConfig = {
  // Support both .ts/.tsx and .md/.mdx page files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  
  // astralis-blocks ships raw TS/TSX on purpose — its source IS the artifact.
  transpilePackages: ["astralis-ui", "astralis-blocks"],
  
  // Point Turbopack root to the workspace root directory
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
};

const withMDX = createMDX({
  options: {
    // Turbopack requires plugins as string names, not function references.
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
