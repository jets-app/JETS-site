import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client", "bcryptjs"],
  images: {
    remotePatterns: [
      { protocol: "https" as const, hostname: "www.jetsschool.org" },
    ],
  },
};

export default nextConfig;
