import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  typedRoutes: true,
  images: {
    domains: [
      "loremflickr.com",
      "images.unsplash.com",
      "rpdourwztdpwdebggkkc.supabase.co", // Supabase storage domain
      "example.com",
      "picsum.photos",
    ],
  },
};

export default nextConfig;
