import { Fragment, useCallback } from 'react'
import Link from 'next/link'
import { Popover, Transition, Menu } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase-ui.config'
import { logout } from '@/api/logout'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/router'
import { routePaths } from '@/constants/routePaths.constants'
import clsx from 'clsx'
import docsbotLogo from '@/images/docsbot-logo.png'
import { NAVIGATION } from '@/constants/navigation.constants'
import { Mixpanel } from '@/lib/mixpanel-web'
import { HeaderBanner } from '@/components/HeaderBanners'

export default function Header() {
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

  return (
    <>
    <HeaderBanner />
    <Popover as="header" className="relative">
      <div className="bg-gray-900 py-6">
        <nav
          className="relative mx-auto flex max-w-7xl items-center justify-between px-6"
          aria-label="Global"
        >
          <div className="flex flex-1 items-center">
            <div className="flex w-full items-center justify-between md:w-auto">
              <Link href="/">
                <span className="sr-only">DocsBot</span>
                <Image className="h-8 w-auto sm:h-12" src={docsbotLogo} alt="DocsBot Logo" />
              </Link>
              <div className="-mr-2 flex items-center md:hidden">
                <Popover.Button className="focus-ring-inset inline-flex items-center justify-center rounded-md bg-gray-900 p-2 text-gray-400 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </Popover.Button>
              </div>
            </div>
            <div className="hidden space-x-8 md:ml-10 md:flex">
              {NAVIGATION.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'text-base font-medium text-white hover:border-b-2 border-solid border-teal-500',
                    router.asPath === item.href && 'border-b-2'
                  )}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
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
        </nav>
      </div>

      <Transition
        as={Fragment}
        enter="duration-150 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Panel
          focus
          className="absolute inset-x-0 top-0 origin-top transform p-2 transition md:hidden z-10"
        >
          <div className="overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black ring-opacity-5">
            <div className="flex items-center justify-between px-5 pt-4">
              <div>
                <Image className="h-8 w-auto" src={docsbotLogo} alt="DocsBot Logo" />
              </div>
              <div className="-mr-2">
                <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-600">
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </Popover.Button>
              </div>
            </div>
            <div className="pt-5 pb-6">
              <div className="space-y-1 px-2">
                {NAVIGATION.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="mt-6 px-5">
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-6 py-3 text-base font-medium text-white hover:bg-gray-700"
                >
                  Try Free
                </Link>
              </div>
              <div className="mt-6 px-5">
                <p className="text-center text-base font-medium text-gray-500">
                  Existing customer?{' '}
                  <Link href="/login" className="text-gray-900 hover:underline">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
    </>
  )
}
