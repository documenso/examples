import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore markdown files and other non-JS assets from libsql packages
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/resource",
    });

    // Externalize problematic packages on the server side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@libsql/client": "commonjs @libsql/client",
        "@prisma/adapter-libsql": "commonjs @prisma/adapter-libsql",
      });
    }

    return config;
  },
  // Ensure server components can use these packages
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
};

export default nextConfig;
