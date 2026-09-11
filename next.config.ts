import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The project sits next to an unrelated package-lock.json one level up;
  // pin the workspace root so Turbopack stops warning about it.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Real vehicle photos live in Firebase Storage (see lib/inventory-store.ts
    // and components/admin/*-inventory-modal.tsx) and are referenced by their
    // https download URL — next/image refuses to optimize a remote host
    // that isn't allow-listed here, which silently blank-renders those photos.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
    ],
  },
};

export default nextConfig;
