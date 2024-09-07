import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

export default function Paginator({ page, totalCount, perPage, changePage }) {
  const currentPage = page
  const pages = []
  const maxPages = Math.ceil(totalCount / perPage)
  const maxPagesToShow = 6
  const maxPagesToShowOnEachSide = Math.floor(maxPagesToShow / 2)

  if (maxPages <= maxPagesToShow) {
    for (let i = 0; i < maxPages; i++) {
      pages.push(i)
    }
  } else {
    if (page <= maxPagesToShowOnEachSide) {
      for (let i = 0; i < maxPagesToShow; i++) {
        pages.push(i)
      }
    } else if (page > maxPages - maxPagesToShowOnEachSide) {
      for (let i = maxPages - maxPagesToShow; i < maxPages; i++) {
        pages.push(i)
      }
    } else {
      for (let i = page - maxPagesToShowOnEachSide; i < page + maxPagesToShowOnEachSide; i++) {
        pages.push(i)
      }
    }
  }

  if (pages.length <= 1) return null
  
  const Page = ({ page, current }) => {
    if (page === false) {
      return (
        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
          ...
        </span>
      )
    }

    if (current) {
      return (
        <button
          aria-current="page"
          disabled={true}
          className="relative z-10 inline-flex items-center bg-cyan-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
        >
          {page + 1}
        </button>
      )
    } else {
      return (
        <button
          onClick={() => changePage(page)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
        >
          {page + 1}
        </button>
      )
    }
  }

  return (
    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
      <button
        onClick={() => changePage(currentPage - 1)}
        disabled={page === 0}
        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
      >
        <span className="sr-only">Previous</span>
        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
      </button>
      {/* Current: "z-10 bg-cyan-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
      {pages.map((page) => {
        return <Page key={page} page={page} current={page === currentPage} />
      })}
      <button
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage * perPage + perPage >= totalCount}
        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
      >
        <span className="sr-only">Next</span>
        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </nav>
  )
}
