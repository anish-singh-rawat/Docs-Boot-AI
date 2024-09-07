import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

export default function BreadcrumbHeader({ page, baseUrl, crumbs, backHref }) {
  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-7xl py-2 sm:py-4 sm:px-6 lg:px-8">

      <header>
        {crumbs.length > 0 && (
          <div className="mb-1">
            <nav className="sm:hidden ml-4" aria-label="Back">
              <Link
                href={backHref || "../"}
                className="flex items-center text-lg font-medium text-white hover:text-gray-300"
              >
                <ChevronLeftIcon
                  className="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-300"
                  aria-hidden="true"
                />
                Back
              </Link>
            </nav>
            <nav className="hidden sm:flex" aria-label="Breadcrumb">
              <ol role="list" className="flex items-center space-x-4">
                <li>
                  <div className="flex">
                    <Link
                      href={baseUrl}
                      className="text-md font-medium text-white hover:text-gray-300"
                    >
                      {page}
                    </Link>
                  </div>
                </li>
                {crumbs.map((crumb, index) => (
                  <li key={index}>
                    <div className="flex items-center">
                      <ChevronRightIcon
                        className="h-5 w-5 flex-shrink-0 text-gray-300"
                        aria-hidden="true"
                      />
                      <Link
                        href={crumb.href}
                        className="ml-4 text-md font-medium text-white hover:text-gray-300"
                      >
                        {crumb.title}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        )}
        {!crumbs.length && (
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-7 text-white mb-0 ml-4 sm:m-0 sm:truncate sm:text-2xl sm:tracking-tight">
              { page}
            </h2>
          </div>
          )}
        </header>
      </div>
    </div>
  )
}
