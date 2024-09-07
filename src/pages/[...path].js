import { usePost, fetchHookData, addHookData, handleError, usePosts } from '@headstartwp/next'
import { BlocksRenderer } from '@headstartwp/core/react'
import { getWPUrl, getHostUrl, removeSourceUrl } from '@headstartwp/core'
import { replaceUrls, replaceATagsWithLinks } from '@/utils/replaceUrls'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import ContentSection from '@/components/ContentSection'
import { resolveBatch } from '@/utils/promises'
import { NextSeo } from 'next-seo'
import RegisterCTA from '@/components/RegisterCTA'
import LoadingSpinner from '@/components/LoadingSpinner'

const params = { postType: ['page', 'post'] }

const SinglePage = ({ seo }) => {
  const { loading, error, data } = usePost(params)

  return (
    <>
      {seo?.yoast_head_json && (
        <NextSeo
          title={seo.yoast_head_json.title}
          description={seo.yoast_head_json.description}
          openGraph={{
            type: seo.yoast_head_json.og_type,
            locale: seo.yoast_head_json.og_locale,
            siteName: seo.yoast_head_json.og_site_name,
            images: seo.yoast_head_json.og_image,
            title: seo.yoast_head_json.og_title,
            description: seo.yoast_head_json.og_description,
            article: {
              publishedTime: seo.yoast_head_json.article_published_time,
              modifiedTime: seo.yoast_head_json.article_modified_time,
              authors: [seo.yoast_head_json.article_author],
            },
          }}
        />
      )}
      <Header />
      <main>
        {loading ? (
          <div className="bg-white py-12 sm:py-24">
            <div className="mx-auto max-w-7xl px-16 lg:px-24">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl flex items-center space-x-2 justify-center">
                  <LoadingSpinner large={true} />
                  <span>Loading...</span>
                </h2>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ContentSection title={data.post.title.rendered} post={data.post}>
              <BlocksRenderer html={data.post.contentReplaced} />
              {data.post.terms?.category && (
                <div className="mt-8 flex items-center gap-x-4 border-t border-gray-200 pt-4 text-xs">
                  <a
                    href={data.post.terms.category[0]?.link}
                    className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 no-underline hover:bg-gray-100"
                  >
                    {data.post.terms.category[0]?.name}
                  </a>
                </div>
              )}
            </ContentSection>
            {data.post.type === 'post' && <RegisterCTA />}
          </>
        )}
      </main>
      <Footer />
    </>
  )
}

/**
 * This is an example of pre-rendering a set of pages at build times.
 * In this specific example, we are pre-rendering the first 50 posts (within dates in the URL) and the first 50 pages.
 *
 * @returns {Promise<*>}
 */
export async function getStaticPaths() {
  const postsData = await usePosts.fetcher().get({ postType: 'post', per_page: 50 })

  const postsPath = postsData.result.map(({ link }) => {
    return {
      // path is the catch all route, so it must be array with url segments
      // if you don't want to support date urls just remove the date from the path
      params: {
        path: removeSourceUrl({ link, backendUrl: getWPUrl() }).substring(1).split('/'),
      },
    }
  })

  const pagesData = await usePosts.fetcher().get({ postType: 'page', per_page: 50 })

  const pagePaths = pagesData.result
    .map(({ link }) => {
      const normalizedLink = removeSourceUrl({ link, backendUrl: getWPUrl() })
      if (normalizedLink === '/') {
        return false
      }

      return {
        // path is the catch all route, so it must be array with url segments
        params: {
          path: normalizedLink.substring(1).split('/'),
        },
      }
    })
    .filter(Boolean)

  return {
    paths: [...postsPath, ...pagePaths],
    fallback: true,
  }
}

export async function getStaticProps(context) {
  try {
    // fetch batch of promises and throws errors selectively
    // passing `throw:false` will prevent errors from being thrown for that promise
    const settledPromises = await resolveBatch([
      {
        func: fetchHookData(usePost.fetcher(), context, { params: params }),
      },
    ])

    settledPromises[0].data.result.link = replaceUrls(settledPromises[0].data.result.link).replace(
      /\/$/,
      ''
    )
    //settledPromises[0].data.result.yoast_head = replaceUrls(
    //  settledPromises[0].data.result.yoast_head
    //)
    settledPromises[0].data.result.contentReplaced = replaceATagsWithLinks(
      settledPromises[0].data.result.content.rendered
    )

    return addHookData(settledPromises, { revalidate: 60 * 60 })
  } catch (e) {
    return handleError(e, context)
  }
}

export default SinglePage
