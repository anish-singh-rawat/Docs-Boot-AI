/* This example requires Tailwind CSS v3.0+ */
import { Disclosure } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'

const faqs = [
  {
    question: "Does it work with languages other than English?",
    answer: "Unlike traditional search, DocsBot inherits GPT's understanding of any language found on the Internet. So even if you index your documentation in English, it can respond in the language of the question. Asking questions in a different language than what you trained it on may not be as effective right now, as it will be less likely to be able to find the best context from our embeddings index. We are working on improving this!"
  },
  {
    question: 'How does DocsBot work?',
    answer:
      "It's a bit technical, but here is a brief overview. We use OpenAI's embedding and ChatGPT APIs, as well as vector databases to store our index. All ingested documentation is cleaned up and divided into smaller chunks and labeled by source. We then use the GPT embedding API to generate a vector representation of each chunk and store it in our vector db index. When a user asks a question, we convert it to an embedding, and perform an advanced semantic search for closest matches to the user's query. Then we take the most relevant chunks, included them as context along with the original question, and use the ChatGPT API to generate a response in markdown format that we then convert to HTML and display to the user.",
  },
  {
    question: 'Why do I need to provide my own OpenAI API key?',
    answer:
      'To use DocsBot, you need to provide your own OpenAI API key. Instead of simply reselling API access at a premium, we think it is much fairer to have you only pay for the usage you need. We also think it is important for you to have full control and ownership of your data. This also prevents rate limits from causing outages for you if another of our customers has a spike in usage. OpenAI currently provides $18 of free credit when you signup, which should be enough to try out DocsBot for a few months and thousands of questions. Each question uses <$0.004 of credit, so costs are minimal. We store your API key securely with AES256 encryption, and it is only used to make calls to OpenAI on your behalf.',
  },
  {
    question: "Can I automatically update my DocsBot sources?",
    answer: "Yes you can enable scheduled source updates for dynamic sources like URLs, RSS feeds, and Sitemaps. Depending on your plan you can do this monthly, weekly, or daily. You can also manually refresh your sources at any time on all plans."
  },
  {
    question: "What are source 'Pages'?",
    answer: "When you train your bot using various sources we calculate how many pages were imported. This is equivalent to one webpage url, or a page of a PDF or other document file. For example if you import your website via sitemap that may have hundreds of pages. For long document files we calculate a page as roughly 4000 characters of cleaned-up raw text. Different plans have different page limits depending on your needs."
  },
  {
    question: "Do you have an API I can use?",
    answer: "Yes! We have a public API that you can use to integrate DocsBot into your own applications. You can find the documentation here: https://docsbot.ai/documentation/developer. We also have our admin API for managing your DocsBots and sources."
  },
  {
    question: "What are your privacy protections?",
    answer: "We generally don't store PII unless you specifically upload it, or a user provides it in a question to your bots. We store queries and responses in our database to be able to privide and improve on the service. Queries and responses also pass through OpenAI and are subject to their privacy policy as well. We use Bento (https://bentonow.com/) for usage tracking, email, and marketing. Please see our privacy policy for more details: https://docsbot.ai/legal/privacy-policy.",
  },
  {
    question: "Do you have an affiliate program?",
    answer: "Yes! We have a generous affiliate program that pays out 20% of the revenue from any customer you refer to us for the first 12 months of their account. This includes plan upgrades, and can provide as much as a $1,200 commission per referral! We provide a 60 day cookie and 45 day payout schedule via PayPal. You can signup here: https://docsbot.firstpromoter.com/.",
  },
]

export default function Faq() {
  return (
    <div id="faq" className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
            Frequently asked questions
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
            {faqs.map((faq) => (
              <Disclosure as="div" key={faq.question} className="pt-6">
                {({ open }) => (
                  <>
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
                        <span className="text-DocsBot font-semibold leading-7">
                          {faq.question}
                        </span>
                        <span className="ml-6 flex h-7 items-center">
                          {open ? (
                            <PlusSmallIcon
                              className="h-6 w-6"
                              aria-hidden="true"
                            />
                          ) : (
                            <MinusSmallIcon
                              className="h-6 w-6"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-DocsBot leading-7 text-gray-600">
                        {faq.answer}
                      </p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
