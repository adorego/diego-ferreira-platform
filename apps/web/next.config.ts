import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Requerido en monorepos pnpm: evita vendor-chunk splits rotos
  transpilePackages: [
    "@mui/material",
    "@mui/icons-material",
    "@mui/system",
    "@mui/utils",
    "@emotion/react",
    "@emotion/styled",
    "@emotion/cache",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.railway.app",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
