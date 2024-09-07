import { fetchHookData, addHookData, handleError, usePosts } from '@headstartwp/next'
import { getWPUrl, getHostUrl } from '@headstartwp/core'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Pagination from '@/components/blog/Pagination'
import { NextSeo } from 'next-seo'

const params = {
  postType: 'post',
  per_page: 9,
}

const ArchivePage = ({ seo }) => {
  const { data } = usePosts(params)

  return (
    <>
    {seo.yoast_head_json.title ? (
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
      ) : (
        <NextSeo
          title="Blog - DocsBot AI"
          description="DocsBot AI news, tutorials, case studies, and articles."
        />
        )}
      <Header />
      <main>
        <div className="py-12 bg-white sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {data?.queriedObject?.term?.yoast_head_json ? (
                  data?.queriedObject?.term?.yoast_head_json?.title
                ) : (
                  <>Articles</>
                )}
              </h2>
              <p className="mt-2 text-lg leading-8 text-gray-600">
                DocsBot AI news, tutorials, case studies, and articles.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {data?.posts?.map((post) => (
                <article key={post.id} className="flex flex-col items-start justify-between">
                  <a href={post.link} className="relative w-full">
                    <img
                      src={
                        (post._embedded &&
                          post._embedded['wp:featuredmedia'] &&
                          post._embedded['wp:featuredmedia'][0]?.source_url) ||
                        '/social-card.png'
                      }
                      alt=""
                      className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                  </a>
                  <div className="max-w-xl">
                    <div className="group relative mt-8">
                      <h3 className="mt-3 text-lg align-top font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                        <a href={post.link}>
                          <span className="absolute inset-0" />
                          <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                        </a>
                      </h3>
                      <div
                        className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                      ></div>
                    </div>
                    <div className="mt-8 flex items-center gap-x-4 text-xs">
                      <a
                        href={post.terms.category[0]?.link}
                        className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                      >
                        {post.terms.category[0]?.name}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <Pagination pageInfo={data?.pageInfo} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// Hardcode the main archive pagination pages
export async function getStaticPaths() {
  return {
    paths: [
      { params: { path: [] } },
      { params: { path: ['page', '1'] } },
      { params: { path: ['page', '2'] } },
      { params: { path: ['page', '3'] } },
      { params: { path: ['page', '4'] } },
      { params: { path: ['page', '5'] } },
      { params: { path: ['category', 'news'] } },
      { params: { path: ['category', 'tutorials'] } },
      { params: { path: ['category', 'case-studies'] } },
    ],
    fallback: 'blocking',
  }
}

// or export async function getServerSideProps(context)
export async function getStaticProps(context) {
  function removeYoastHead(obj) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => removeYoastHead(item))
    } else if (typeof obj === 'object') {
      for (let key in obj) {
        if (key === 'yoast_head' || key === 'yoast_head_json') {
          delete obj[key]
        } else {
          removeYoastHead(obj[key])
        }
      }
    }
  }
  try {
    // make sure to pass the same params to fetchHookData and usePost
    const usePostData = await fetchHookData(usePosts.fetcher(), context, { params })

    usePostData.data.result = usePostData.data.result.map((post) => {
      removeYoastHead(post) //strip unneeded yoast meta from posts as it 10x the size of the archives cached json
      //remove unneeded data
      return {
        title: post.title,
        id: post.id,
        link: post.link.replace(getWPUrl(), getHostUrl()).replace(/\/$/, ''), //ugly hack for now
        _embedded: post._embedded,
        excerpt: post.excerpt,
      }
    })
    return addHookData([usePostData], { revalidate: 5 * 60 })
  } catch (e) {
    return handleError(e, context)
  }
}

export default ArchivePage
