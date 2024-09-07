const fs = require('fs')
const globby = require('globby')

function addPage(page) {
  //remove exstension
  const path = page.replace(/\.[^/.]+$/, '').replace('src/pages', '').replace('/index', '')

  return `  <url>
    <loc>${`https://docsbot.ai${path}`}</loc>
    <changefreq>daily</changefreq>
  </url>`
}

async function generateSitemap() {
  // Ignore Next.js specific files (e.g., _app.js) and API routes.
  const pages = await globby([
    'src/pages/**/*{.js,.jsx,.mdx,.md}',
    '!src/pages/_*{.jsx,.js}',
    '!src/pages/**/[*{.jsx,.js}',
    '!src/pages/{api,app,ask,chat,iframe,404,register}{**/*,*}',
  ])
  const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(addPage).join('\n')}
</urlset>`

  fs.writeFileSync('public/sitemap-next.xml', sitemap)

  const axios = require('axios');

// Fetch the external sitemap and merge it with the existing sitemap
const response = await axios.get('https://blog.docsbot.ai/sitemap_index.xml');
let externalSitemap = response.data;
  externalSitemap = externalSitemap
  .replace('//blog.docsbot.ai/wp-content/plugins/wordpress-seo/css/main-sitemap.xsl', '/main-sitemap.xsl')
  .replace(
    '</sitemapindex>',
    `\t<sitemap>
\t\t<loc>https://docsbot.ai/sitemap-next.xml</loc>
\t\t<lastmod>${new Date().toISOString()}</lastmod>
\t</sitemap>
</sitemapindex>`
  )

  fs.writeFileSync('public/sitemap.xml', externalSitemap)
}

generateSitemap()
