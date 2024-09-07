import { HomeIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

export default function Breadcrumb({ post }) {
  if (!post || post.type !== 'post') return null

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link href="/articles" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Articles Home</span>
            </Link>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <svg
              className="h-5 w-5 flex-shrink-0 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
            <Link
              href={post.link}
              className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
              aria-current="page"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
          </div>
        </li>
      </ol>
    </nav>
  )
}
