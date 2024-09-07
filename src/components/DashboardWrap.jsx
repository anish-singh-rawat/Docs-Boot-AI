import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Fragment, useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import {
  Bars3BottomLeftIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  ServerStackIcon,
  CreditCardIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline'
import RobotIcon from '@/components/RobotIcon'
import classNames from '@/utils/classNames'
import { useCallback } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { signOut } from 'firebase/auth'
import { stripePlan } from '@/utils/helpers'
import { logout } from '@/api/logout'
import { auth } from '@/config/firebase-ui.config'
import { routePaths } from '@/constants/routePaths.constants'
import logo from '@/images/docsbot-logo-white.png'
import { NextSeo } from 'next-seo'
import { Mixpanel } from '@/lib/mixpanel-web'

export default function DashboardWrap({ page, title, team, fullWidth = false, children }) {
  const router = useRouter()
  const [user] = useAuthState(auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logoutUser = useCallback(logout, [])
  const signUserOut = () => {
    signOut(auth).then(() => {
      logoutUser({
        onComplete: () => {
          Mixpanel.reset()
          router.push(routePaths.LOGIN)
        },
      })
    })
  }

  useEffect(() => {
    if (
      user &&
      team &&
      'Beacon' in window &&
      Beacon !== undefined &&
      typeof Beacon === 'function'
    ) {
      const ident = {
        email: user.email,
      }
      if (user.displayName) {
        ident.name = user.displayName
      }
      if (team) {
        ident.company = team.name
        ident['connected-sites'] = `https://docsbot.ai/app/team?switchTeam=${team.id}`
        if (team.stripeSubscriptionPrice && stripePlan(team).name !== 'Free') {
          ident['monthly-price'] = '$' + team.stripeSubscriptionPrice / 100
        }
        ident['storage-plan'] = stripePlan(team).name
        if (team.stripeCustomerId) {
          ident['stripe-customer'] = `https://dashboard.stripe.com/customers/${team.stripeCustomerId}`
        }
        if (team.stripeSubscriptionId) {
          ident['stripe-subscription'] = `https://dashboard.stripe.com/subscriptions/${team.stripeSubscriptionId}`
        }
      }
      Beacon('identify', ident)
    }
  }, [user, team])

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: HomeIcon },
    { name: 'Bots', href: '/app/bots', icon: RobotIcon },
    { name: 'Team', href: '/app/team', icon: UsersIcon },
    { name: 'Account', href: '/app/account', icon: CreditCardIcon },
    { name: 'API', href: '/app/api', icon: ServerStackIcon },
    //{ name: 'Reports', href: '/app/reports', icon: ChartBarIcon, current: false },
  ]
  const userNavigation = [{ name: 'Account', href: '/app/account' }]

  const currentPageLink = navigation.find((nav) => nav.name === page).href

  const pageTitle = `${page} ${title ? ` | ${title}` : ''}`

  const Breadcrumbs = ({ title }) => {
    if (!title) return null

    let titles = title
    //if title is not array cast to array
    if (!Array.isArray(title)) {
      titles = [title]
    }

    return (
      <>
        {titles.map((title, index) => (
          <div key={index} className="flex-inline ml-1 flex items-center lg:ml-2">
            <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <h1 className="ml-1 text-sm leading-tight font-medium text-gray-800 lg:ml-2 lg:text-xl">{title}</h1>
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <NextSeo
        title={pageTitle}
        description="DocsBot AI Dashboard"
        noindex={true}
      />
      <main>
        <div>
          <Transition.Root show={sidebarOpen} as={Fragment}>
            <Dialog as="div" className="relative z-40 md:hidden print:hidden" onClose={setSidebarOpen}>
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75" />
              </Transition.Child>

              <div className="fixed inset-0 z-40 flex">
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-in-out duration-300 transform"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transition ease-in-out duration-300 transform"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gradient-to-r from-cyan-700 to-cyan-800 pt-5 pb-4">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-300"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                          type="button"
                          className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="sr-only">Close sidebar</span>
                          <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                        </button>
                      </div>
                    </Transition.Child>
                    <div className="flex flex-shrink-0 items-center px-4">
                      <Link href="/app" title="Dashboard" className="fill-white">
                        <Image src={logo} height={38} width={150} alt="DocsBot Logo" />
                      </Link>
                    </div>
                    <div className="mt-5 h-0 flex-1 overflow-y-auto">
                      <nav className="space-y-1 px-2">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.name === page
                                ? 'bg-cyan-800 text-white'
                                : 'text-cyan-100 hover:bg-cyan-600 hover:text-white',
                              'group flex items-center rounded-md px-2 py-2 text-base font-medium'
                            )}
                          >
                            <item.icon
                              className="mr-4 h-6 w-6 flex-shrink-0 text-cyan-200"
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
                <div className="w-14 flex-shrink-0" aria-hidden="true">
                  {/* Dummy element to force sidebar to shrink to fit close icon */}
                </div>
              </div>
            </Dialog>
          </Transition.Root>

          {/* Static sidebar for desktop */}
          <div className="hidden md:fixed md:inset-y-0 md:flex md:w-48 md:flex-col print:!hidden">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-r from-cyan-700 to-cyan-800">
              <div className="flex h-16 flex-shrink-0 items-center justify-between bg-cyan-800 px-4 text-white">
                <Link href="/app" title="Dashboard" className="fill-white">
                  <Image src={logo} height={38} width={150} alt="DocsBot Logo" />
                </Link>
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-2 py-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.name === page
                          ? 'bg-cyan-800 text-white'
                          : 'text-cyan-100 hover:bg-cyan-600 hover:text-white',
                        'group flex items-center rounded-md px-2 py-2 text-base font-medium'
                      )}
                    >
                      <item.icon
                        className="mr-4 h-6 w-6 flex-shrink-0 text-cyan-200"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          <div className="flex flex-col print:!pl-0 md:pl-48">
            <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow print:hidden">
              <button
                type="button"
                className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="flex flex-1 justify-between px-4">
                <div className="flex flex-1 items-center">
                  <h1 className="lg:ml-4 text-md lg:text-xl font-semibold text-gray-900">
                    <Link href={currentPageLink}>{page}</Link>
                  </h1>
                  <Breadcrumbs title={title} />
                </div>
                <p className="ml-2 flex leading-tight items-center text-xs md:text-sm text-gray-500 overflow-hidden">
                  {team?.name || ''}
                </p>
                <Link className='ml-1 flex leading-tight items-center text-xs md:text-sm text-gray-500 overflow-hidden' href={'/app/team'} title="Switch Team">
                  <ChevronUpDownIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                  <span className="sr-only">Switch Team</span>
                </Link>
                <div className="ml-2 flex flex-none items-center md:ml-6">
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        {user?.photoURL ? (
                          <Image
                            className="h-8 w-8 rounded-full"
                            src={user?.photoURL}
                            alt={user?.displayName}
                            width={32}
                            height={32}
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
                        <div className="px-4 py-2 text-sm">
                          <div className="mb-1 text-base font-medium leading-none text-gray-600">
                            {user?.displayName}
                          </div>
                          <div className="text-sm font-medium leading-none text-gray-400">
                            {user?.email}
                          </div>
                        </div>
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                href={item.href}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {item.name}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              type="button"
                              href="#"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                              onClick={signUserOut}
                            >
                              Logout
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>

            <main className="flex-1">
              <div className="py-4 sm:py-8">
                <div className={
                  classNames(
                    'mx-auto px-4 sm:px-6 md:px-8',
                    fullWidth ? '' : 'max-w-7xl'
                  )
                }>{children}</div>
              </div>
            </main>
          </div>
        </div>
      </main>
    </>
  )
}
