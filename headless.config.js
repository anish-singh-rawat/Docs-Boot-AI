/**
 * Headless Config
 *
 * @type {import('@headstartwp/core').HeadlessConfig}
 */
module.exports = {
  sourceUrl: process.env.NEXT_PUBLIC_HEADLESS_WP_URL,
  hostUrl: process.env.HOST_URL,
  useWordPressPlugin: true,
  customPostTypes: [
    {
      slug: 'docs',
      endpoint: '/wp-json/wp/v2/docs',
      // these should match your file-system routing
      single: '/documentation/doc',
      archive: '/documentation',
    },
  ],
  debug: {
    requests: true,
  },
  integrations: {
    yoastSEO: {
      enable: false,
    },
  },
}
