const { withContentlayer } = require("next-contentlayer")

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  swcMinify: false,
  experimental: {
    appDir: true,
    externalDir: true,
  },
  redirects: () => [
    {
      source: "/discord",
      destination: "https://discord.gg/ww6HE5xaZ2",
      permanent: true,
    },
  ],
}

module.exports = withContentlayer(nextConfig)
