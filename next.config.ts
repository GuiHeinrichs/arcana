import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Card art is served through Next's optimizer (which fetches once and
    // caches/serves it from our origin) rather than hotlinking YGOPRODeck's
    // image CDN on every render. See CLAUDE.md.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ygoprodeck.com",
        pathname: "/images/**",
      },
    ],
    // Card images never change once published — cache optimized variants for
    // a long time to avoid needless revalidation against the CDN.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    formats: ["image/avif", "image/webp"],
    // 90 keeps card text crisp when zoomed in the inspector.
    qualities: [75, 90],
  },
};

export default nextConfig;
