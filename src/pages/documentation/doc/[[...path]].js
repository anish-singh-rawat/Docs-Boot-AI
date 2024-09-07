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
import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon, ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import LoadingSpinner from '@/components/LoadingSpinner'
import Link from 'next/link'

// Function to build the hierarchical navigation object
function buildNavigation(data, currentId) {
  // Step 1: Group by terms->section[0] and handle objects with no section term
  const grouped = data.reduce((acc, cur) => {
    const section = cur.terms && cur.terms.section && cur.terms.section[0]
    if (section) {
      if (!acc[section.name]) {
        acc[section.name] = {
          name: section.name,
          href: section.link,
          current: false,
          children: [],
        }
      }
      acc[section.name].children.push({
        name: cur.title,
        href: cur.link,
        current: cur.id === currentId,
      })
    } else {
      // If no section term, make it a top-level item with no children
      acc[cur.title] = {
        name: cur.title,
        href: cur.link,
        current: cur.id === currentId,
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

const params = { postType: ['docs'] }
const postsParams = {
  postType: 'docs',
  per_page: 100,
  _embed: true,
  orderby: 'menu_order',
  order: 'asc',
}

const SinglePage = ({ seo }) => {
  const { loading, error, data } = usePost(params)
  const { loading: menuLoading, error: menuError, data: menuData } = usePosts(postsParams)

  if (loading || menuLoading) {
    return (
      <>
        <Header />
        <div className="bg-white py-12 sm:py-24">
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

  const navigation = buildNavigation(menuData.posts, data.post.id)

  // Find the index of the object with the specified id
  const index = menuData.posts.findIndex((post) => post.id === data.post.id)

  // Get the two objects immediately before and after the current object
  const before = index > 0 ? menuData.posts[index - 1] : null
  const after = index < menuData.posts.length - 1 ? menuData.posts[index + 1] : null

  return (
    <>
      {seo.yoast_head_json && (
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
      <div className="bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-start gap-x-8 px-4 py-10 sm:px-6 lg:px-8">
          <aside className="sticky top-12 hidden w-64 shrink-0 lg:block">
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        {!item.children ? (
                          <a
                            href={item.href}
                            className={clsx(
                              item.current ? 'bg-gray-50' : 'hover:bg-gray-50',
                              'block rounded-md py-2 pl-10 pr-2 text-sm font-semibold leading-6 text-gray-700'
                            )}
                          >
                            {item.name}
                          </a>
                        ) : (
                          <Disclosure as="div" defaultOpen={true}>
                            {({ open }) => (
                              <>
                                <Disclosure.Button
                                  className={clsx(
                                    item.current ? 'bg-gray-50' : 'hover:bg-gray-50',
                                    'flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6 text-gray-700'
                                  )}
                                >
                                  <ChevronRightIcon
                                    className={clsx(
                                      open ? 'rotate-90 text-gray-500' : 'text-gray-400',
                                      'h-5 w-5 shrink-0'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Disclosure.Button>
                                <Disclosure.Panel as="ul" className="mt-1 space-y-1 px-2">
                                  {item.children.map((subItem) => (
                                    <li key={subItem.name}>
                                      <Disclosure.Button
                                        as="a"
                                        href={subItem.href}
                                        className={clsx(
                                          subItem.current ? 'bg-gray-50' : 'hover:bg-gray-50',
                                          'block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-700'
                                        )}
                                      >
                                        {subItem.name}
                                      </Disclosure.Button>
                                    </li>
                                  ))}
                                </Disclosure.Panel>
                              </>
                            )}
                          </Disclosure>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </aside>

          <main className="flex-1">
            <ContentSection title={data.post.title.rendered} post={data.post}>
              <BlocksRenderer html={data.post.content.rendered} />
              <nav className="mt-12 flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
              {before && (
                <div className="-mt-px flex w-0 flex-1">
                  <Link
                    href={before.link}
                    className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    <span dangerouslySetInnerHTML={{ __html: before.title }} />
                  </Link>
                </div>
              )}
              {after && (
                <div className="-mt-px flex w-0 flex-1 justify-end">
                  <Link
                    href={after.link}
                    className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 text-right"
                  >
                    {after.title}
                    <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </nav>
            </ContentSection>
            
          </main>
        </div>

        <RegisterCTA />
      </div>
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
  const postsData = await usePosts.fetcher().get({ postType: 'docs', per_page: 100 })

  const postsPath = postsData.result.map(({ link }) => {
    return {
      // path is the catch all route, so it must be array with url segments
      // if you don't want to support date urls just remove the date from the path
      params: {
        path: removeSourceUrl({ link, backendUrl: getWPUrl() }).substring(1).split('/'),
      },
    }
  })

  return {
    paths: [...postsPath],
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
      {
        func: fetchHookData(usePosts.fetcher(), context, { params: postsParams }),
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
    settledPromises[1].data.result = settledPromises[1].data.result.map((post) => {
      return {
        id: post.id,
        title: post.title.rendered,
        link: replaceUrls(post.link).replace(/\/$/, ''),
        slug: post.slug,
        parent: post.parent,
        menu_order: post.menu_order,
        _embedded: post._embedded || {},
      }
    })

    return addHookData(settledPromises, { revalidate: 60 * 60 })
  } catch (e) {
    return handleError(e, context)
  }
}

export default SinglePage
