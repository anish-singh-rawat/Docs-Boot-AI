import Link from 'next/link'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { useState } from 'react'
import { NextSeo } from 'next-seo'
import {
  ClockIcon,
  ChartBarIcon,
  UserIcon,
  UsersIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
} from '@heroicons/react/20/solid'

const features = [
  {
    name: '24/7 Availability and Real-Time Responses',
    description:
      "DocsBot AI's chatbots offer round-the-clock support, allowing customers to receive immediate responses to their queries at any time, which improves customer satisfaction and enhances your brand's reputation for reliable service.",
    icon: ClockIcon,
  },
  {
    name: 'Multilingual Support',
    description:
      'DocsBot AI can perform real-time conversations in more than 95 languages, ensuring that customers receive support in their native language without delays, no matter the language of your training documentation.',
    icon: GlobeAltIcon,
  },
  {
    name: 'Consistent Service',
    description:
      'AI-powered chatbots ensure consistent customer interactions and answers, eliminating the risk of human error or variability in service quality.',
    icon: CheckCircleIcon,
  },
  {
    name: 'Improved Customer Experience',
    description:
      'With access to your knowledge base, DocsBot AI chatbots can quickly provide accurate and personalized answers and recommendations, improving the overall customer experience.',
    icon: UserIcon,
  },
  {
    name: 'Cost Efficiency',
    description:
      'Automating routine inquiries with chatbots reduces the need for a large support staff, saving on salaries and infrastructure costs.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Scalability',
    description:
      'Chatbots can handle multiple inquiries simultaneously, allowing businesses to scale their customer service operations without additional recruitment or training costs.',
    icon: UsersIcon,
  },
  {
    name: 'Learn from Existing Content',
    description:
      "DocsBot AI can be trained on a company's existing documentation and content, turning it into an intelligent and dynamic knowledge base that provides tailored answers to user questions.",
    icon: DocumentTextIcon,
  },
  {
    name: 'Continuous Learning',
    description:
      'The scheduled source refresh feature in DocsBot AI ensures that your bot is regularly updated with your latest documentation changes. This allows it to provide accurate and up-to-date answers to customer queries.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Data-Driven Insights',
    description:
      'The AI chatbots collect valuable data about customer interactions, providing insights into customer needs, behaviors, and preferences, which can be used to improve products, services, and marketing strategies.',
    icon: ChartBarIcon,
  },
  {
    name: 'Powerful API and Integrations',
    description:
      "The API, widget, and no-code connection via Zapier and more allows for seamless integration of AI chat into products, websites, apps, or plugins, providing answers from your company's own content sources.",
    icon: Cog6ToothIcon,
  },
]

export const AiSupportSavingsCalculator = () => {
  const [supportTickets, setSupportTickets] = useState(600)
  const [timePerTicket, setTimePerTicket] = useState(10)
  const [hourlyRate, setHourlyRate] = useState(18)
  const closeRate = 0.75

  const planName = supportTickets < 500 ? 'Power' : 'Pro'
  const planCost = supportTickets < 500 ? 41 : 83
  const timeSavings = Math.round((supportTickets * closeRate * timePerTicket) / 60)
  const costSavings = Math.round(timeSavings * hourlyRate - planCost)

  const handleSupportTicketsChange = (e) => {
    setSupportTickets(e.target.value)
  }

  const handleTimePerTicketChange = (e) => {
    setTimePerTicket(e.target.value)
  }

  const handleHourlyRateChange = (e) => {
    setHourlyRate(e.target.value)
  }

  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="py-12 pb-0">
        <div className=" mx-auto rounded-xl bg-white px-6 py-10 shadow-xl ring-1 ring-slate-900/10 lg:px-8">
          <div className=" mx-auto sm:text-center">
            <h2 className="text-primary mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              You can save
              {costSavings > 0 && (
                <span className="px-2 text-cyan-600">
                  $<span>{costSavings.toLocaleString()}</span>
                </span>
              )}
              and
              <span className="px-2 text-cyan-600">
                <span>{timeSavings.toLocaleString()}</span> hours
              </span>
              <br className="hidden px-2 sm:block" />
              {costSavings > 0 && <span>every month!</span>}
            </h2>
            <p className="text-muted-foreground mt-6 hidden text-lg leading-8 sm:block">
              Calculated based on the {planName} plan ($<span>{planCost}</span>/mo) and our average
              customer AI chatbot resolution rate of 75%.
            </p>
          </div>
          <div className="mt-12 flex items-center gap-x-6">
            <div className="text-muted-foreground w-20 flex-shrink-0 sm:w-28">Support Tickets</div>
            <input
              type="range"
              value={supportTickets}
              min="50"
              max="1000"
              step="1"
              onChange={handleSupportTicketsChange}
              className="col-span-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-cyan-600"
            />
            <div className="text-muted-foreground w-20 flex-shrink-0">
              <strong>{supportTickets}</strong>
              <br />
              per month
            </div>
          </div>
          <div className="mt-12 flex items-center gap-x-6">
            <div className="text-muted-foreground w-20 flex-shrink-0 sm:w-28">Time Per Ticket</div>
            <input
              type="range"
              value={timePerTicket}
              min="5"
              max="60"
              step="1"
              onChange={handleTimePerTicketChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-cyan-600"
            />
            <div className="text-muted-foreground w-20 flex-shrink-0">
              <strong>{timePerTicket}</strong>
              <br />
              minutes
            </div>
          </div>
          <div className="mt-12 flex items-center gap-x-6">
            <div className="text-muted-foreground w-20 flex-shrink-0 sm:w-28">
              Hourly <br />
              Rate
            </div>
            <input
              type="range"
              value={hourlyRate}
              min="7"
              max="50"
              step="1"
              onChange={handleHourlyRateChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-cyan-600"
            />
            <div className="text-muted-foreground w-20 flex-shrink-0">
              <strong>${hourlyRate}</strong>
              <br />
              per hour
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Calculate() {
  return (
    <>
      <NextSeo
        title="AI-Powered Support Chatbot Savings Calculator - DocsBot AI"
        description="Calculate how much you can save in support hours and cost by automating your customer support using a custom GPT chatbot powered by DocsBot AI."
        openGraph={{
          images: [
            {
              url: 'https://docsbot.ai/og-support-calc.png',
              alt: 'AI-Powered Support Chatbot Savings Calculator',
            },
          ],
        }}
      />
      <Header />
      <main>
        <div className="relative isolate bg-gray-900">
          <div
            className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a4e2ff] to-[#32aa9c] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
          <div className="py-12 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  AI-Powered Support Chatbot Savings Calculator
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  Calculate the potential savings in support hours and cost by implementing a custom
                  GPT chatbot powered by DocsBot AI to automate your customer support.
                </p>
              </div>
              <AiSupportSavingsCalculator />
            </div>
          </div>
          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-50rem)]"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#80ccff] to-[#35bda4] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          <div className="py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-base font-semibold leading-7 text-cyan-600">
                  Automate Your Customer Support with DocsBot AI
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  GPT-Powered Customer Support
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-300 text-justify sm:text-center">
                  Experience instant, accurate, and 24/7 multilingual support with DocsBot AI. Train
                  your chatbot from your existing content and documentation in minutes to start
                  delighting your customers and saving on support costs today.
                </p>
              </div>
              <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:gap-x-16">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
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
            <div className="relative sm:py-12 mt-12">
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
                        Automate Your Customer Support Now!
                      </h2>
                      <p className="mx-auto mt-6 max-w-4xl text-lg text-white">
                        Experience instant, accurate, 24/7 multilingual support, delighted
                        customers, and substantial savings. Start enhancing your customer service
                        now with a free, easy-to-train AI chatbot. No credit card or coding
                        necessary.
                      </p>
                    </div>
                    <div className="mt-8 sm:mx-auto sm:flex sm:max-w-lg">
                      <Link
                        type="button"
                        href="/register"
                        onClick={(e) => {
                          if (window.bento !== undefined) {
                            window.bento.track('cta_click', {
                              cta: 'blog_register',
                              title: 'Automate Your Customer Support Now!',
                            })
                            Mixpanel.track('CTA Click', {
                              cta: 'Blog Register',
                              title: 'Automate Your Customer Support Now!',
                            })
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
        </div>
      </main>
      <Footer />
    </>
  )
}
