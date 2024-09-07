import {
  ShieldCheckIcon,
  MapIcon,
  DocumentMagnifyingGlassIcon,
  TableCellsIcon,
  RssIcon,
  CursorArrowRippleIcon,
  CloudArrowDownIcon,
} from '@heroicons/react/24/outline'
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/20/solid'
import qaHeader from '@/images/docsbot-header.svg'
import demoScreenshot from '@/images/demo-screenshot.png'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import Signup from '@/components/Signup'
import Faq from '@/components/Faq'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Pricing from '@/components/Pricing'
import chatwpLogo from '@/images/logos/chatwp.svg'
import iuLogo from '@/images/logos/iu-logo-words.svg'
import dollieLogo from '@/images/logos/logo-dollie.png'
import a8cLogo from '@/images/logos/logo-automattic.png'
import extendifyLogo from '@/images/logos/logo-extendify.png'
import conversionLogo from '@/images/logos/logo-conversion.svg'
import sonyLogo from '@/images/logos/logo-sony.svg'
import logoWingarc from '@/images/logos/logo-wingarc.png'
import logoSentry from '@/images/logos/logo-sentry.svg'
import { Testimonials } from '@/components/Testimonials'
import WPMUDEVLogo from '@/components/WPMUDEVLogo'

const integrations = [
  {
    name: 'URL & Sitemaps',
    description:
      'Index a webpage, your support docs, or an entire website including inline images in minutes with our url and sitemap importers. Simply add a link and we take care of the rest. Schedule regular updates to keep your content fresh.',
    icon: MapIcon,
  },
  {
    name: 'Document Files',
    description:
      'Upload any files in TXT, DOC, PPT, EML, HTML, PDF format, or in bulk via ZIP. We will index your content and turn it into a ChatGPT-powered bot for you or your users.',
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: 'Blog Posts',
    description:
      "Quickly train your DocsBot on your blog content via WordPress export files or RSS feeds. It's a simple way to surface your best content to those looking for answers.",
    icon: RssIcon,
  },
  {
    name: 'Bulk Import',
    description:
      'Add your content in bulk by uploading a specially formatted CSV file containing text blocks and sources to index.',
    icon: TableCellsIcon,
  },
  {
    name: 'Zapier Integration',
    description:
      'Connect DocsBot to thousands of apps via Zapier. Pass your trained bots questions and route answers to your favorite apps.',
    icon: CursorArrowRippleIcon,
  },
  {
    name: 'Cloud Sources',
    description:
      'Connect your Notion, Google Drive, Dropbox, Intercom, or OneDrive account to DocsBot and we will index your files & content automatically.',
    icon: CloudArrowDownIcon,
  },
]

const features = [
  {
    name: 'Question/Answer Bots',
    description:
      'Make your documentation interactive with our Q/A bot. Get detailed and direct answers about your product, including code examples and formatted output.',
    icon: ChatBubbleLeftEllipsisIcon,
  },
  {
    name: 'Embeddable Widgets',
    description:
      'We make it simple to add DocsBot to your website in minute with fully customizable widgets. Just add a script tag or WordPress plugin (coming soon) and you are ready to go.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Custom Copywriting',
    description:
      'Need help writing marketing copy and blog posts? With DocsBot, you can do that too. Use a customized ChatGPT that knows everything about your product, so it can help you generate high-quality content in no time.',
    icon: PencilSquareIcon,
  },
  {
    name: 'Reply to Support Tickets',
    description:
      'Tired of writing the same responses to support tickets over and over again? Train your DocBot on your support history and docs so it can reply to new tickets automatically, saving you time and money!',
    icon: LifebuoyIcon,
  },
  {
    name: 'Internal Knowledge Bots',
    description:
      'Employees spend too much time just searching for what they need. DocsBot can help them find answers instantly by indexing your internal knowledge base and documentation.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Powerful API',
    description:
      'Our API allows you to integrate AI chat into your own products. Provide answers to your users from your site, app, or WordPress plugin.',
    icon: Cog6ToothIcon,
  },
]

export default function Home() {
  return (
    <>
      <Head />
      <div className="bg-white">
        <div className="relative overflow-hidden">
          <Header />
          <main>
            <div className="bg-gray-900 pt-4 sm:pt-10 lg:overflow-hidden lg:pb-14 lg:pt-2">
              <div className="mx-auto max-w-7xl lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                  <div className="mx-auto max-w-md px-6 sm:max-w-2xl sm:text-center lg:flex lg:items-center lg:px-0 lg:text-left">
                    <div className="lg:py-24">
                      <div className="inline-flex items-center rounded-full bg-black p-1 pl-3 text-white hover:text-gray-200 sm:text-base lg:text-sm xl:text-base">
                        <span className="pr-1 text-sm">Powered by</span>
                        <span className="rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 px-2 py-0.5 text-sm font-semibold leading-5 text-white">
                          ChatGPT & GPT-4 Turbo!
                        </span>
                      </div>
                      <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl">
                        <span className="block text-6xl sm:text-8xl">DocsBot AI</span>
                        <span className="block bg-gradient-to-r from-teal-200 to-cyan-400 bg-clip-text pb-3 text-4xl text-transparent sm:pb-5 sm:text-5xl">
                          ChatGPT for{' '}
                          <span className="relative whitespace-nowrap text-white">
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 418 42"
                              className="absolute left-0 top-2/3 h-[0.58em] w-full fill-cyan-400/70"
                              preserveAspectRatio="none"
                            >
                              <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
                            </svg>
                            <span className="relative text-white">your</span>
                          </span>{' '}
                          docs
                        </span>
                      </h1>
                      <p className="text-base text-gray-300 sm:text-xl lg:text-lg xl:text-xl">
                        Get instant answers for you, your customers, or your team with AI powered
                        chatbots trained with your content and documentation. Save money and improve
                        the support experience for your customers, the productivity of your team,
                        and AI copywriting with existing knowledge of your business!
                      </p>
                      <div className="mt-8">
                        <Link
                          href="/register"
                          type="button"
                          className="block w-full rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-3 text-center font-bold text-white shadow hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                          Create your own free DocsBot
                        </Link>
                      </div>
                      <p className="mt-3 text-sm text-gray-300 sm:mt-4">
                        Get started today, no credit card required!
                      </p>
                    </div>
                  </div>
                  <div className="-mb-16 mt-12 sm:-mb-48 lg:relative lg:m-0">
                    <div className="mx-auto max-w-md px-6 sm:max-w-2xl lg:max-w-none lg:px-0">
                      <Image
                        className="w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                        src={qaHeader}
                        alt="DocsBot Illustration"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/*---------------Trusted by---------- */}
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-8 xl:py-4">
                <h2 className="mb-8 text-center text-lg font-semibold leading-8 text-white">
                  Trusted by
                </h2>
                
                <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-2 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-4 xl:grid-cols-8">
                  
                  <Link
                    href="https://infiniteuploads.com"
                    target="_blank"
                    title="Infinite Uploads"
                    className="flex justify-center"
                  >
                    <Image
                      className="col-span-2 max-h-8 w-full object-contain lg:col-span-1"
                      src={iuLogo}
                      alt="Infinite Uploads Logo"
                      width={125}
                      height={32}
                    />
                  </Link>

                  <Image
                    className="col-span-2 max-h-8 w-full object-contain lg:col-span-1"
                    src={sonyLogo}
                    alt="Sony Logo"
                    width={125}
                    height={26}
                  />
                 
                  <Image
                    className="col-span-2 max-h-8 w-full object-contain lg:col-span-1"
                    src={extendifyLogo}
                    alt="Extendify Logo"
                    width={125}
                    height={32}
                  />

                  <Image
                    className="col-span-2 max-h-8 w-full object-contain lg:col-span-1"
                    src={conversionLogo}
                    alt="Conversion Logo"
                    width={125}
                    height={32}
                  />

                  <Image
                    className="col-span-2 max-h-8 w-full object-contain lg:col-span-1"
                    src={dollieLogo}
                    alt="Dollie Logo"
                    width={125}
                    height={32}
                  />
                  <Image
                    className="col-span-2 max-h-8 w-full object-contain lg:col-span-1"
                    src={logoWingarc}
                    alt="WingArc1st Logo"
                    width={125}
                    height={32}
                  />
                  <Image
                    className="col-span-2 max-h-8 w-full object-contain lg:col-span-1"
                    src={logoSentry}
                    alt="SENTRY.io Logo"
                    width={108}
                    height={32}
                  />

                  <WPMUDEVLogo className="col-span-1 max-h-8 w-full object-contain text-white" />
                </div>
              </div>
            </div>

            {/* Feature section with screenshot */}
            <div id="features" className="bg-gray-50 py-24 sm:py-32">
              <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
                <div className="">
                  <h2 className="text-lg font-semibold text-cyan-600">
                    ChatGPT-powered customer support
                  </h2>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Train and deploy custom chatbots in minutes!
                  </p>
                  <p className="mx-auto mt-5 max-w-7xl text-xl text-gray-500">
                    Are you tired of answering the same questions over and over again? Do you wish
                    you had a way to automate your customer support and give your team more time to
                    focus on other tasks? With DocsBot, you can do just that. We make it simple to
                    build ChatGPT-powered bots that are trained with your content and documentation,
                    so they can provide instant answers to your customers' most detailed questions.
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden pt-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                  <Image
                    src={demoScreenshot}
                    alt="Application screenshot"
                    className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
                  />
                  <div className="relative" aria-hidden="true">
                    <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-gray-50 pt-[7%]" />
                  </div>
                </div>
              </div>
              <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
                <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-gray-900">
                        <feature.icon
                          className="absolute left-1 top-1 h-5 w-5 text-cyan-600"
                          aria-hidden="true"
                        />
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Feature section with grid */}
            <div className="relative bg-white pb-12 pt-16 sm:pt-24 lg:pt-32">
              <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
                <h2 className="text-lg font-semibold text-cyan-600">
                  A simple managed chatbot service
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Powerful integrations and API
                </p>
                <p className="mx-auto mt-5 max-w-7xl text-xl text-gray-500">
                  Our intuitive interface makes it easy to index your documentation, blog posts, or
                  any other content with just a few clicks. Then use our simple API and embeddable
                  widgets to integrate your custom DocsBot into your website, WordPress, app/plugin,
                  Slack, or anywhere else you want to use it!
                </p>
                <div className="mt-12">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {integrations.map((feature) => (
                      <div key={feature.name} className="pt-6">
                        <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                          <div className="-mt-6">
                            <div>
                              <span className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 p-3 shadow-lg">
                                <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                              </span>
                            </div>
                            <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                              {feature.name}
                            </h3>
                            <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Testimonials />

            {/* Pricing section */}
            <Pricing />

            <Faq />

            <Signup />
          </main>
          <Footer />
        </div>
      </div>
    </>
  )
}
