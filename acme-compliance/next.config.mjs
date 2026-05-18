/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.ui.sh",
      },
    ],
  },
}

export default nextConfig
