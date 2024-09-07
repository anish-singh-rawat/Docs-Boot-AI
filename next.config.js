const withMarkdoc = require('@markdoc/next.js')
const { withHeadlessConfig } = require('@headstartwp/next/config')
const headlessConfig = require('./headless.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md'],
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    newNextLinkBehavior: true,
    scrollRestoration: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.cloud.google.com',
      },
      {
        protocol: 'https',
        hostname: '**.docsbot.ai',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: '**.tempurl.host',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/business',
        destination: '/#features',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: '/legal/privacy-policy',
        permanent: true,
      },
      {
        source: '/terms-of-service',
        destination: '/legal/terms-of-service',
        permanent: true,
      },
      {
        source: '/docs',
        destination: '/documentation/developer',
        permanent: true,
      },
      {
        source: '/docs/:slug*',
        destination: '/documentation/developer/:slug*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/mp/lib.min.js",
        destination: "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js",
      },
      {
        source: "/mp/lib.js",
        destination: "https://cdn.mxpnl.com/libs/mixpanel-2-latest.js",
      },
      {
        source: "/mp/decide",
        destination: "https://decide.mixpanel.com/decide",
      },
      {
        source: "/mp/:slug",
        // use "api-eu.mixpanel.com" if you need to use EU servers
        destination: "https://api-eu.mixpanel.com/:slug",
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      require('./scripts/generate-sitemap')
    }

    return config
  },
}

module.exports = withHeadlessConfig(withMarkdoc()(nextConfig), headlessConfig)
