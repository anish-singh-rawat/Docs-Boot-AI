import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

export default function Pagination({ pageInfo }) {
  if (!pageInfo) return null
  if (!pageInfo.totalPages || pageInfo.totalPages < 2) return null

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-12">
      {pageInfo.page > 1 && (
        <div className="-mt-px flex w-0 flex-1">
          <Link
            href={'./page/' + (pageInfo.page - 1)}
            className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
            Previous
          </Link>
        </div>
      )}
      {pageInfo.page < pageInfo.totalPages && (
        <div className="-mt-px flex w-0 flex-1 justify-end">
          <Link
            href={'./page/' + (pageInfo.page + 1)}
            className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            Next
            <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
          </Link>
        </div>
      )}
    </nav>
  )
}
