import { fetchHookData, addHookData, handleError, usePosts } from '@headstartwp/next'
import { getWPUrl, getHostUrl } from '@headstartwp/core'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { ArrowDownIcon } from '@heroicons/react/20/solid'

const params = {
  postType: 'docs',
  per_page: 100,
  _embed: true,
  orderby: 'menu_order',
  order: 'asc',
}

// Function to build the hierarchical navigation object
function buildNavigation(data, currentId) {
  // Step 1: Group by terms->section[0] and handle objects with no section term
  const grouped = data.reduce((acc, cur) => {
    const section = cur.terms && cur.terms.section && cur.terms.section[0]
    if (section) {
      if (!acc[section.name]) {
        acc[section.name] = {
          name: section.name,
          slug: section.slug,
          children: [],
        }
      }
      acc[section.name].children.push({
        name: cur.title.rendered,
        href: cur.link,
        excerpt: cur.excerpt.rendered,
      })
    } else {
      // If no section term, make it a top-level item with no children
      acc[cur.title] = {
        name: cur.title.rendered,
        href: cur.link,
        excerpt: cur.excerpt.rendered,
      }
    }
    return acc
  }, {})

  // Step 2: Order by menu_order (assuming you want to order the children by menu_order)
  for (const section in grouped) {
    if (grouped[section].children) {
      grouped[section].children.sort((a, b) => a.menu_order - b.menu_order)
    }
  }

  // Step 3: Convert the grouped object to an array
  const navigation = Object.values(grouped)

  return navigation
}

export function Section({ section }) {
  if (section.children) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-6 sm:pt-8 lg:px-8 lg:py-10" id={section.slug}>
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <h2 className="ml-4 text-2xl font-bold leading-10 tracking-tight text-gray-900">
              {section.name}
            </h2>
          </div>
          <div className="mt-8 lg:col-span-9 lg:mt-0">
            <dl className="space-y-2">
              {section.children.map((doc) => (
                <Link
                  key={doc.name}
                  href={doc.href}
                  className="block rounded-xl p-4 hover:bg-gray-50"
                >
                  <dt
                    className="text-base font-semibold leading-7 text-gray-900"
                    dangerouslySetInnerHTML={{ __html: doc.name }}
                  />
                </Link>
              ))}
            </dl>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="mx-auto max-w-7xl px-6 py-6 sm:pt-8 lg:px-8 lg:py-10">
        <div className="mt-8">
          <dl className="space-y-6">
            <Link
              key={section.name}
              href={section.href}
              className="block rounded-xl p-4 hover:bg-gray-50"
            >
              <dt
                className="text-base font-semibold leading-7 text-gray-900"
                dangerouslySetInnerHTML={{ __html: section.name }}
              />
              <dd
                className="mt-2 text-base leading-7 text-gray-600"
                dangerouslySetInnerHTML={{ __html: section.excerpt }}
              ></dd>
            </Link>
          </dl>
        </div>
      </div>
    )
  }
}

const ArchivePage = ({ seo }) => {
  const { data, loading, error } = usePosts(params)

  if (loading) {
    return (
      <>
        <Header />
        <div className="sm:py-18 bg-white py-10">
          <div className="mx-auto max-w-7xl px-16 lg:px-24">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="flex items-center justify-center space-x-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                <LoadingSpinner large={true} />
                <span>Loading...</span>
              </h2>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const navigation = buildNavigation(data.posts)

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
          title="Documentation - DocsBot AI"
          description="DocsBot AI documentation and knowlegebase."
        />
      )}
      <Header />
      <main>
        <div className="bg-gray-900 px-6 py-16 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-2 text-base font-semibold leading-7 text-teal-500">
              Get the help you need
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Documentation
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Welcome to the DocsBot AI Documentation! These pages are designed to provide you with
              all the information you need to understand, integrate, and make the most out of
              DocsBot AI.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none flex justify-center">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base font-semibold leading-7 text-white sm:grid-cols-2 md:flex lg:gap-x-10">
              {navigation.map((section) => (
                <>
                  {section.slug && (
                    <a key={section.slug} href={'#' + section.slug}>
                      {section.name} <ArrowDownIcon className="inline-block w-4 h-4" />
                    </a>
                  )}
                </>
              ))}
              <Link key="dev-api" href="/documentation/developer">
                Developer/API <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-white py-2 sm:py-6">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {navigation.map((section) => (
              <Section key={section.name} section={section} />
            ))}
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
    paths: [{ params: { path: [] } }],
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
        _embedded: post._embedded || {},
        excerpt: post.excerpt,
      }
    })
    return addHookData([usePostData], { revalidate: 5 * 60 })
  } catch (e) {
    return handleError(e, context)
  }
}

export default ArchivePage
