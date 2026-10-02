import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    const value = process.env.GEARSPHERE_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

    return value
      ? new URL(value).hostname
      : null;
  } catch {
      return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      ...(supabaseHost
        ? [
          {
            protocol: "https" as const,
            hostname: supabaseHost,
            pathname:
              "/storage/v1/object/public/**",
          },
        ]
        : []),
    ],
  },
};

export default nextConfig;
