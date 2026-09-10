import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The project sits next to an unrelated package-lock.json one level up;
  // pin the workspace root so Turbopack stops warning about it.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
