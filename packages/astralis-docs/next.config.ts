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

  async headers() {
    return [
      {
        /**
         * The block gallery holds one iframe per block, and navigating into a
         * block and back remounts every one of them — client-side routing
         * unmounts the page component, and no router cache preserves a live
         * document. So the frames WILL reload; the question is whether they
         * reload off the network.
         *
         * Next prerenders these previews and sends `s-maxage=31536000`, which
         * is a shared-cache directive the browser ignores. With no `max-age`
         * the browser cached none of them, so every return to the gallery
         * refetched all 36 documents. Giving the browser its own window lets a
         * remount paint from memory instead.
         *
         * The content only changes when the block source does, i.e. at build
         * time, and `stale-while-revalidate` keeps a deploy from serving stale
         * previews for longer than one navigation.
         */
        source: "/preview/blocks/:id",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=86400",
          },
        ],
      },
    ];
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
