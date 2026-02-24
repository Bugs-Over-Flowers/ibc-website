import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  cacheComponents: true,
  cacheLife: {
    publicHours: {
      stale: 300,
      revalidate: 3600,
      expire: 86400,
    },
    admin5m: {
      stale: 30,
      revalidate: 300,
      expire: 3600,
    },
    realtime60s: {
      stale: 30,
      revalidate: 60,
      expire: 300,
    },
  },
  typedRoutes: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
      {
        protocol: "https",
        hostname: "rpdourwztdpwdebggkkc.supabase.co",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "http",
        hostname: "host.docker.internal",
        port: "54321",
        pathname: "/storage/v1/object/**",
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
  serverExternalPackages: ["@react-email/components", "@react-email/render"],
};

export default nextConfig;
