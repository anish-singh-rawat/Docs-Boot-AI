import { getWPUrl, getHostUrl } from '@headstartwp/core'
import * as cheerio from 'cheerio'

export function replaceUrls(obj) {
  if (typeof obj === 'string') {
    return obj.replaceAll(getWPUrl(), getHostUrl())
  } else if (Array.isArray(obj)) {
    return obj.map(replaceUrls)
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, replaceUrls(value)]))
  } else {
    return obj
  }
}

export function replaceATagsWithLinks(html) {
  const $ = cheerio.load(html)
  $('a').each((i, el) => {
    const href = $(el).attr('href') ? ` href="${$(el).attr('href').replace(getWPUrl(), getHostUrl()).replace(/\/$/, '')}"` : ''
    const target = $(el).attr('target') ? ` target="${$(el).attr('target')}"` : ''
    const rel = $(el).attr('rel') ? ` rel="${$(el).attr('rel')}"` : ''
    const className = $(el).attr('class') ? ` class="${$(el).attr('class')}"` : ''
    const text = $(el).text()
    $(el).replaceWith(`<a${href}${target}${rel}${className}>${text}</a>`)
  })
  // get html without the <html><body></body></html> tags
  return $.html().replaceAll('<html><head></head><body>', '').replaceAll('</body></html>', '')
}
