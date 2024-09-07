import { useCallback, useEffect, useState, Fragment } from 'react'
import { Popover, Transition, Menu } from '@headlessui/react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { Hero } from '@/components/docs/Hero'
import { MobileNavigation } from '@/components/docs/MobileNavigation'
import { Navigation } from '@/components/docs/Navigation'
import { Prose } from '@/components/docs/Prose'
import docsbotLogo from '@/images/docsbot-logo.png'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase-ui.config'
import { logout } from '@/api/logout'
import { signOut } from 'firebase/auth'
import { routePaths } from '@/constants/routePaths.constants'
import { NAVIGATION } from '@/constants/navigation.constants'
import { Mixpanel } from '@/lib/mixpanel-web'

const navigation = [
  {
    title: 'Introduction',
    links: [
      { title: 'Getting started', href: '/documentation/developer#start' },
    ],
  },
  {
    title: 'Core concepts',
    links: [
      { title: 'Authentication', href: '/documentation/developer/authentication' },
      { title: 'API Errors', href: '/documentation/developer/api-errors' },
    ],
  },
  {
    title: 'Chat Widget',
    links: [
      { title: 'Embedding', href: '/documentation/developer/embeddable-chat-widget' },
      { title: 'HelpScout Integration', href: '/documentation/developer/widget-integrations/helpscout' },
      { title: 'Zendesk Integration', href: '/documentation/developer/widget-integrations/zendesk' },
      { title: 'Intercom Integration', href: '/documentation/developer/widget-integrations/intercom' },
      { title: 'Freshdesk Integration', href: '/documentation/developer/widget-integrations/freshdesk' },
    ]
  },
  {
    title: 'Integrations',
    links: [
      { title: 'Zapier Integration', href: '/documentation/developer/integrations/zapier' },
    ]
  },
  {
    title: 'Chat API',
    links: [
      { title: 'Overview', href: '/documentation/developer/chat-api-overview' },
      { title: 'Chat', href: '/documentation/developer/chat-api' },
      { title: 'Streaming Chat', href: '/documentation/developer/streaming-chat-api' },
      { title: 'Answer Rating & Escalation', href: '/documentation/developer/answer-rating' },
      { title: 'Semantic Search', href: '/documentation/developer/semantic-search-api' },
    ],
  },
  {
    title: 'Admin API',
    links: [
      { title: 'Overview', href: '/documentation/developer/admin-api-overview' },
      { title: 'Teams', href: '/documentation/developer/team-api' },
      { title: 'Bots', href: '/documentation/developer/bot-api' },
      { title: 'Sources', href: '/documentation/developer/source-api' },
      { title: 'Question History', href: '/documentation/developer/questions-api' },
    ],
  },
]

function GitHubIcon(props) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
    </svg>
  )
}

function Header({ navigation }) {
  let [isScrolled, setIsScrolled] = useState(false)
  const [user] = useAuthState(auth)
  const router = useRouter()
  const logoutUser = useCallback(logout, [])
  const signUserOut = () => {
    signOut(auth).then(() => {
      logoutUser({
        onComplete: () => {
          Mixpanel.reset()
          router.push(routePaths.ROOT)
        },
      })
    })
  }

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 flex flex-wrap items-center justify-between px-4 py-5 shadow-none shadow-slate-900/5 transition duration-500 sm:px-6 lg:px-8',
        isScrolled
          ? 'bg-slate-900/95 backdrop-blur [@supports(backdrop-filter:blur(0))]:bg-slate-900/75'
          : 'bg-transparent'
      )}
    >
      <style>
        {`
          body {
            background-color: rgb(15 23 42) !important;
          }
        `}
      </style>
      <div className="mr-6 flex lg:hidden">
        <MobileNavigation navigation={navigation} />
      </div>
      <div className="relative flex flex-grow basis-0 items-center">
        <Link href="/" aria-label="Home page">
          <span className="sr-only">DocsBot</span>
          <Image className="h-9 w-auto" src={docsbotLogo} alt="DocsBot Logo" />
        </Link>
      </div>
      <div className="hidden space-x-8 md:ml-10 md:flex md:flex-grow -my-5 mr-6 sm:mr-8 md:mr-0">
              {NAVIGATION.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'text-base font-medium text-white hover:border-b-2 border-solid border-teal-500',
                    item.href === '/documentation/developer'
                      ? 'border-b-2'
                      : ''
                  )}
                >
                  {item.name}
                </a>
              ))}
            </div>
      <div className="relative flex basis-0 justify-end gap-6 sm:gap-8 md:flex-grow">
      {user ? (
            <div className="flex items-center">
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="sr-only">Open user menu</span>
                    {user?.photoURL ? (
                      <Image
                        className="h-10 w-10 rounded-full"
                        src={user?.photoURL}
                        alt={user?.displayName}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <span className="inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                        <svg
                          className="h-full w-full text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                    )}
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      <div className="block px-4 py-0 text-sm text-gray-700 ">
                        {user?.displayName}
                      </div>
                    </Menu.Item>
                    <Menu.Item>
                      <div className="block border-b border-solid border-gray-200 px-4 pb-2 text-sm text-gray-700 ">
                        {user?.email}
                      </div>
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/app"
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'block border-b border-solid border-gray-200 px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          Dashboard
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/app/team"
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'block border-b border-solid border-gray-200 px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          Manage Team
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/app/account"
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'block border-b border-solid border-gray-200 px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          Account
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/#"
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'block p-2 px-4 text-sm text-gray-700'
                          )}
                          onClick={signUserOut}
                        >
                          Sign Out
                        </Link>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          ) : (
            <div className="hidden md:flex md:items-center md:space-x-6">
              <Link href="/login" className="text-base font-medium text-white hover:text-gray-300">
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-6 py-3 text-base font-medium text-white hover:bg-gray-700"
              >
                Try Free
              </Link>
            </div>
          )}
      </div>
    </header>
  )
}

function useTableOfContents(tableOfContents) {
  let [currentSection, setCurrentSection] = useState(tableOfContents[0]?.id)

  let getHeadings = useCallback((tableOfContents) => {
    return tableOfContents
      .flatMap((node) => [node.id, ...node.children.map((child) => child.id)])
      .map((id) => {
        let el = document.getElementById(id)
        if (!el) return

        let style = window.getComputedStyle(el)
        let scrollMt = parseFloat(style.scrollMarginTop)

        let top = window.scrollY + el.getBoundingClientRect().top - scrollMt
        return { id, top }
      })
  }, [])

  useEffect(() => {
    if (tableOfContents.length === 0) return
    let headings = getHeadings(tableOfContents)
    function onScroll() {
      let top = window.scrollY
      let current = headings[0].id
      for (let heading of headings) {
        if (top >= heading.top) {
          current = heading.id
        } else {
          break
        }
      }
      setCurrentSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [getHeadings, tableOfContents])

  return currentSection
}

export function Layout({ children, title, tableOfContents }) {
  let router = useRouter()
  let isHomePage = router.pathname === '/documentation/developer'
  let allLinks = navigation.flatMap((section) => section.links)
  let linkIndex = allLinks.findIndex((link) => link.href === router.pathname)
  let previousPage = allLinks[linkIndex - 1]
  let nextPage = allLinks[linkIndex + 1]
  let section = navigation.find((section) =>
    section.links.find((link) => link.href === router.pathname)
  )
  let currentSection = useTableOfContents(tableOfContents)

  function isActive(section) {
    if (section.id === currentSection) {
      return true
    }
    if (!section.children) {
      return false
    }
    return section.children.findIndex(isActive) > -1
  }

  return (
    <div className='bg-slate-900'>
      <Header navigation={navigation} />

      {isHomePage && <Hero />}

      <div className="max-w-7xl relative mx-auto flex justify-center sm:px-2 lg:px-8 xl:px-12">
        <div className="hidden lg:relative lg:block lg:flex-none">
          <div className="absolute inset-y-0 right-0 hidden w-[50vw] bg-slate-50" />
          <div className="absolute top-16 bottom-0 right-0 block h-12 w-px bg-gradient-to-t from-slate-800" />
          <div className="absolute top-28 bottom-0 right-0 block w-px bg-slate-800" />
          <div className="sticky top-[4.5rem] -ml-0.5 h-[calc(100vh-4.5rem)] overflow-y-auto overflow-x-hidden py-16 pl-0.5">
            <Navigation navigation={navigation} className="w-64 pr-8 xl:w-48" />
          </div>
        </div>
        <div className="min-w-0 max-w-2xl flex-auto px-4 py-16 lg:max-w-none lg:pr-0 lg:pl-8 xl:px-8">
          <article>
            {(title || section) && (
              <header className="mb-9 space-y-1" id="start">
                {section && (
                  <p className="font-display text-sm font-medium text-teal-500">{section.title}</p>
                )}
                {title && (
                  <h1 className="font-display text-3xl tracking-tight text-white">{title}</h1>
                )}
              </header>
            )}
            <Prose>{children}</Prose>
          </article>
          <dl className="mt-12 flex border-t  border-slate-800 pt-6">
            {previousPage && (
              <div>
                <dt className="font-display text-sm font-medium text-white">Previous</dt>
                <dd className="mt-1">
                  <Link
                    href={previousPage.href}
                    className="text-base font-semibold  text-slate-400 hover:text-slate-300"
                  >
                    <span aria-hidden="true">&larr;</span> {previousPage.title}
                  </Link>
                </dd>
              </div>
            )}
            {nextPage && (
              <div className="ml-auto text-right">
                <dt className="font-display text-sm font-medium text-white">Next</dt>
                <dd className="mt-1">
                  <Link
                    href={nextPage.href}
                    className="text-base font-semibold text-slate-400 hover:text-slate-300"
                  >
                    {nextPage.title} <span aria-hidden="true">&rarr;</span>
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="hidden xl:sticky xl:top-[4.5rem] xl:-mr-6 xl:block xl:h-[calc(100vh-4.5rem)] xl:flex-none xl:overflow-y-auto xl:py-16 xl:pr-6">
          <nav aria-labelledby="on-this-page-title" className="w-56">
            {tableOfContents.length > 0 && (
              <>
                <h2 id="on-this-page-title" className="font-display text-sm font-medium text-white">
                  On this page
                </h2>
                <ol role="list" className="mt-4 space-y-3 text-sm">
                  {tableOfContents.map((section) => (
                    <li key={section.id}>
                      <h3>
                        <Link
                          href={`#${section.id}`}
                          className={clsx(
                            isActive(section)
                              ? 'text-teal-500'
                              : 'font-normal text-slate-400 hover:text-slate-300'
                          )}
                        >
                          {section.title}
                        </Link>
                      </h3>
                      {section.children.length > 0 && (
                        <ol role="list" className="mt-2 space-y-3 pl-5  text-slate-400">
                          {section.children.map((subSection) => (
                            <li key={subSection.id}>
                              <Link
                                href={`#${subSection.id}`}
                                className={
                                  isActive(subSection) ? 'text-teal-500' : 'hover:text-slate-300'
                                }
                              >
                                {subSection.title}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}
