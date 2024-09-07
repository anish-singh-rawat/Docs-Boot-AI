import { Testimonials } from '@/components/TestimonialsRegister'
import Image from 'next/image'
import docsbotLogo from '@/images/docsbot-logo.png'
import Link from 'next/link'
import { routePaths } from '@/constants/routePaths.constants'
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/20/solid'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Question/Answer Bots',
    description: 'Interactive documentation with detailed product-specific Q/A bots.',
    icon: ChatBubbleLeftEllipsisIcon,
  },
  {
    name: 'Internal Knowledge Bots',
    description: 'Instantly find answers from your team knowledge base & SOPs.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Embeddable Widgets',
    description: 'Easily integrate DocsBot to your website with customizable widgets.',
    icon: ChatBubbleLeftRightIcon,
  },
]

export function RegisterLayout({ teamCount, children }) {
  return (
    <>
      <div className="relative flex min-h-full justify-center md:px-12 lg:px-0">
        <div className="relative z-10 flex flex-1 flex-col bg-white px-4 py-10 shadow-2xl md:flex-none md:px-24">
          <Link href="/" aria-label="Home" className="mx-auto">
            <Image src={docsbotLogo} alt="Docsbot" />
          </Link>
          <div className="relative mt-6 border-b border-gray-200 pb-4 text-center sm:mt-8 md:text-left">
            <h1 className="text-2xl font-medium tracking-tight">Create your free account</h1>
            <p className="mt-3 text-sm">
              Already registered?{' '}
              <Link
                href={routePaths.LOGIN}
                className="font-medium text-cyan-900 underline hover:text-cyan-700"
              >
                Sign in
              </Link>{' '}
              to your account.
            </p>
          </div>
          <div className="mx-auto w-full max-w-md sm:px-4 md:max-w-md md:px-0">
            {children}
          </div>
        </div>
        <div className="hidden min-h-full bg-gradient-to-br from-teal-500 via-cyan-600 to-cyan-700 to-90% p-12 py-24 align-middle sm:contents sm:py-12 lg:relative lg:flex">
          <div className="my-auto hidden lg:block">
            <div className="mx-auto max-w-2xl text-white md:text-center">
              <h2 className="font-display text-xl tracking-tight sm:text-3xl">
                Transform your business with DocsBot AI
              </h2>
            </div>
            <div className="mx-auto mt-10 mb-20 max-w-7xl">
              <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-white xl:mx-0 xl:max-w-none xl:grid-cols-3 xl:gap-x-8 xl:gap-y-8">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
                      <feature.icon
                        className="absolute left-1 top-1 h-5 w-5 text-teal-100"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline text-white">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <Testimonials teamCount={teamCount} />
          </div>
        </div>
      </div>
    </>
  )
}
