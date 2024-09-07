import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Mixpanel } from '@/lib/mixpanel-web'

export default function RegisterCTA() {

  // a list of random CTA titles
  const titles = [
    'Get Started with DocsBot AI Today!',
    'Your Documentation, AI-Enhanced',
    'Try DocsBot AI Free!',
    'Unleash the Power of AI Chatbots for Your Business',
    'Experience Seamless AI Customer Support',
    'Automate Your Customer Support Now!',
    'Streamline Your Business with AI',
  ]

  const [title, setTitle] = useState(titles[0])
  const Title = ({title}) => {
    return title
  }

  // load the component on the client-side only
  const DynamicTitle = dynamic(() => Promise.resolve(Title), { ssr: false })

  // set the title on the client-side only
  useEffect(() => {
    setTitle(titles[Math.floor(Math.random() * titles.length)])
  }, [])

  return (
    <div className="bg-white pb-8">
      <div className="relative sm:py-12">
        <div aria-hidden="true" className="hidden sm:block">
          <div className="absolute inset-y-0 left-0 w-1/2 rounded-r-3xl bg-gray-50" />
          <svg
            className="absolute left-1/2 top-4 -ml-3"
            width={404}
            height={392}
            fill="none"
            viewBox="0 0 404 392"
          >
            <defs>
              <pattern
                id="8228f071-bcee-4ec8-905a-2a059a2cc4fb"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-teal-300"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect width={404} height={392} fill="url(#8228f071-bcee-4ec8-905a-2a059a2cc4fb)" />
          </svg>
        </div>
        <div className="mx-auto max-w-md px-6 sm:max-w-3xl lg:max-w-7xl lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-cyan-600 px-6 py-6 shadow-xl sm:px-12 sm:py-12">
            <div aria-hidden="true" className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0">
              <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 1463 360"
              >
                <path
                  className="text-teal-500 text-opacity-40"
                  fill="currentColor"
                  d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z"
                />
                <path
                  className="text-cyan-700 text-opacity-40"
                  fill="currentColor"
                  d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z"
                />
              </svg>
            </div>
            <div className="relative">
              <div className="sm:text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  <DynamicTitle title={title} />
                </h2>
                <p className="mx-auto mt-6 max-w-4xl text-lg text-white">
                  Sign up for DocsBot AI today and empower your customers and team with AI-driven
                  solutions. Train your first chatbot completely free, no credit card required.
                </p>
              </div>
              <div className="mt-8 sm:mx-auto sm:flex sm:max-w-lg">
                <Link
                  type="button"
                  href="/register"
                  onClick={(e) => {
                    if (window.bento !== undefined) {
                      window.bento.track('cta_click', { cta: 'blog_register', title: title })
                      Mixpanel.track('CTA Click', { cta: 'Blog Register', title: title })
                    }
                  }}
                  className="block w-full rounded-md border border-cyan-600 bg-gradient-to-b from-teal-300 to-cyan-400 px-5 py-3  text-center text-base font-medium text-cyan-900 shadow hover:bg-teal-200 hover:from-teal-200 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cyan-600 sm:px-10"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
