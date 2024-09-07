import Link from 'next/link'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import classNames from '@/utils/classNames'
import { Fragment, useState } from 'react'
import { NextSeo } from 'next-seo'
import RegisterCTA from '@/components/RegisterCTA'
import RadioCardSmall from '@/components/RadioCardSmall'

const pricing = {
  'Chat/Completion Models': [
    {
      model_name: 'GPT-3.5 Turbo',
      context: '16K',
      provider: 'OpenAI / Azure',
      input_token_cost_per_thousand: 0.001,
      output_token_cost_per_thousand: 0.002,
    },
    {
      model_name: 'GPT-4 Turbo',
      context: '128K',
      provider: 'OpenAI / Azure',
      input_token_cost_per_thousand: 0.01,
      output_token_cost_per_thousand: 0.03,
    },
    {
      model_name: 'GPT-4',
      context: '8K',
      provider: 'OpenAI / Azure',
      input_token_cost_per_thousand: 0.03,
      output_token_cost_per_thousand: 0.06,
    },
    {
      model_name: 'Claude Instant',
      context: '100K',
      provider: 'Anthropic',
      input_token_cost_per_thousand: 0.0008,
      output_token_cost_per_thousand: 0.0024,
    },
    {
      model_name: 'Claude 2.1',
      context: '200K',
      provider: 'Anthropic',
      input_token_cost_per_thousand: 0.008,
      output_token_cost_per_thousand: 0.024,
    },
    {
      model_name: 'Llama 2 70b',
      context: '4K',
      provider: 'Meta (via Anyscale)',
      input_token_cost_per_thousand: 0.001,
      output_token_cost_per_thousand: 0.001,
    },
    {
      model_name: 'Gemini Pro',
      context: '32K',
      provider: 'Google',
      input_token_cost_per_thousand: 0.001,
      output_token_cost_per_thousand: 0.002,
    },
    {
      model_name: 'PaLM 2',
      context: '8K',
      provider: 'Google',
      input_token_cost_per_thousand: 0.002,
      output_token_cost_per_thousand: 0.002,
    },
    {
      model_name: 'Command',
      context: '4K',
      provider: 'Cohere',
      input_token_cost_per_thousand: 0.01,
      output_token_cost_per_thousand: 0.02,
    },
    {
      model_name: 'Mistral-Small (Mixtral)',
      context: '32K',
      provider: 'Mistral AI (via Anyscale)',
      input_token_cost_per_thousand: 0.0005,
      output_token_cost_per_thousand: 0.0005,
    },
    {
      model_name: 'Mistral-Medium',
      context: '32K',
      provider: 'Mistral AI',
      input_token_cost_per_thousand: 0.00275,
      output_token_cost_per_thousand: 0.00825,
    }
  ],
  'Fine-tuning models': [
    {
      model_name: 'GPT-3.5 Turbo',
      context: '4K',
      provider: 'OpenAI',
      input_token_cost_per_thousand: 0.012,
      output_token_cost_per_thousand: 0.016,
    },
    {
      model_name: 'PaLM 2',
      context: '8K',
      provider: 'Google',
      input_token_cost_per_thousand: 0.002,
      output_token_cost_per_thousand: 0.002,
    },
  ],
  'Embedding models': [
    {
      model_name: 'Ada v2',
      provider: 'OpenAI / Azure',
      input_token_cost_per_thousand: 0.0001,
    },
    {
      model_name: 'PaLM 2',
      provider: 'Google',
      input_token_cost_per_thousand: 0.0004,
    },
    {
      model_name: 'Embed',
      provider: 'Cohere',
      input_token_cost_per_thousand: 0.0001,
    },
  ],
}

const radioOptions = [
  { name: 'Tokens', multiplier: 1 },
  { name: 'Words', multiplier: 1.3333333333 },
  { name: 'Characters', multiplier: 0.25 },
]

export default function Calculate() {
  const [inputTokens, setInputTokens] = useState(100)
  const [outputTokens, setOutputTokens] = useState(500)
  const [apiCalls, setAPICalls] = useState(100)
  const [type, setType] = useState(radioOptions[0])

  const getCost = (model) => {
    return (
      (model.input_token_cost_per_thousand || 0) * ((inputTokens * type.multiplier) / 1000) +
      (model.output_token_cost_per_thousand || 0) * ((outputTokens * type.multiplier) / 1000)
    )
  }

  return (
    <>
      <NextSeo
        title="OpenAI & other LLM API Pricing Calculator - DocsBot AI"
        description="Calculate and compare the cost of using OpenAI, Azure, Anthropic, Llama 2, Google Gemini, Mistral, and Cohere APIs with our powerful FREE pricing calculator."
        openGraph={{
          images: [
            {
              url: 'https://docsbot.ai/og-openai-pricing.png',
              alt: 'LLM API Pricing Calculator',
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
          <div className="py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  OpenAI & other LLM API Pricing Calculator
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  Calculate and compare the cost of using OpenAI, Azure, Anthropic Claude, Llama 2,
                  Google Gemini, Mistral, and Cohere LLM APIs for your AI project with our simple and
                  powerful free calculator. Latest numbers as of Dec. 2023.
                </p>
                <div className="mx-auto mt-10 max-w-xl text-left">
                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-9">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="input-tokens"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Input {type.name}
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          name="input-tokens"
                          id="input-tokens"
                          autoComplete="off"
                          min={1}
                          step={100}
                          value={inputTokens}
                          onChange={(e) => setInputTokens(e.target.value)}
                          className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-center text-xl font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="output-tokens"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Output {type.name}
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          id="output-tokens"
                          autoComplete="off"
                          min={1}
                          step={100}
                          value={outputTokens}
                          onChange={(e) => setOutputTokens(e.target.value)}
                          className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-center text-xl font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="api-calls"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        API Calls
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          id="api-calls"
                          autoComplete="off"
                          min={1}
                          step={10}
                          value={apiCalls}
                          onChange={(e) => setAPICalls(e.target.value)}
                          className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-center text-xl font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="text-white sm:col-span-9">
                      <RadioCardSmall
                        options={radioOptions}
                        title="Calculate by"
                        value={type}
                        setValue={setType}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="-mx-6 mt-16 max-w-7xl bg-white p-4 px-2 shadow-2xl ring-1 ring-white/10 sm:mx-6 sm:mt-24 sm:rounded-lg sm:p-6 lg:p-8">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">
                      Pricing Calculations
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                      The following pricing calculations are based on the input tokens, output
                      tokens, and API calls you have entered above.
                    </p>
                  </div>
                </div>
                <div className="mt-8 flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full">
                        <thead className="bg-white">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                            >
                              Provider
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Model
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Context
                            </th>
                            <th
                              scope="col"
                              className="hidden px-3 py-3.5 pl-6 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                            >
                              Input/1k Tokens
                            </th>
                            <th
                              scope="col"
                              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                            >
                              Output/1k Tokens
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                            >
                              Per Call
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                            >
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {Object.keys(pricing).map((key) => {
                            const category = pricing[key]
                            return (
                              <Fragment key={key}>
                                <tr className="border-t border-gray-200">
                                  <th
                                    colSpan={8}
                                    scope="colgroup"
                                    className="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                                  >
                                    {key}
                                  </th>
                                </tr>
                                {category.map((model, modelIdx) => (
                                  <tr
                                    key={model.provider + model.model_name + model.context}
                                    className={classNames(
                                      modelIdx === 0 ? 'border-gray-300' : 'border-gray-200',
                                      'border-t'
                                    )}
                                  >
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                                      {model.provider}
                                    </td>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                                      {model.model_name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {model.context}
                                    </td>
                                    <td className="hidden whitespace-nowrap border-l border-gray-200 px-3 py-4 pl-6 text-sm text-gray-500 sm:table-cell">
                                      ${model.input_token_cost_per_thousand}
                                    </td>
                                    <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                                      {model.output_token_cost_per_thousand && (
                                        <>${model.output_token_cost_per_thousand}</>
                                      )}
                                    </td>
                                    <td className="relative whitespace-nowrap border-l border-gray-200 py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                      ${getCost(model).toFixed(4)}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                      ${(getCost(model) * apiCalls).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
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

          <div className="prose relative mx-auto max-w-5xl px-4 pb-32 text-white sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              AI LLM Model Pricing: A Comprehensive Overview
            </h2>
            <p>
              OpenAI, Anthropic, Google, Cohere, and Meta offer a diverse range of models, each
              tailored to specific tasks and capabilities. Understanding the pricing structure is
              crucial for businesses and developers looking to integrate these models into their
              applications. Here&#39;s a detailed look at how they structure their pricing.
            </p>
            <h3 className="text-white" id="1-tokens-the-fundamental-unit-of-pricing-">
              Tokens: The Fundamental Unit of Pricing
            </h3>
            <p>
              LLM pricing usually revolves around the concept of &quot;tokens.&quot; A token can be
              thought of as a piece of a word. To give you a perspective, 1,000 tokens equate to
              approximately 750 words. For instance, the sentence &quot;This paragraph is 5
              tokens&quot; itself is 5 tokens long.
            </p>
            <p>
              A useful guideline to remember when working with tokens is that, for typical English
              text, one token usually equates to approximately four characters. This means that a
              token represents about three-quarters of a word. Non-English languages like Japanese
              can change this calculation significantly.
            </p>

            <h3 className="text-white" id="1-tokens-the-fundamental-unit-of-pricing-">
              Context Length
            </h3>
            <p>
              With Large Language Models (LLMs), especially those developed by OpenAI, the term
              "context length" is common. It's an important concept to grasp, as it directly impacts
              the model's performance, capabilities, and, consequently, the cost. Here's a deep dive
              into what context length means and why it matters.
            </p>
            <h4 className="text-white">What is Context Length?</h4>
            <p>
              Context length refers to the amount of information or the number of tokens a model can
              consider or "remember" from a given input at one time. It's essentially the model's
              "working memory" when processing a request. For instance, if a model has a context
              length of 8,000 (8K) tokens, it can consider up to 8,000 tokens from the input and
              output in a single pass.
            </p>
            <h4 className="text-white">Why Does Context Length Matter?</h4>
            <ul>
              <li>
                <strong className="text-white">Complexity of Tasks</strong>: Longer context lengths
                allow the model to handle more complex tasks that require understanding and
                processing larger chunks of information. For instance, summarizing a long article or
                answering questions about a detailed technical document might require a model with a
                longer context length.
              </li>
              <li>
                <strong className="text-white">Continuity in Conversations</strong>: In chatbot
                applications, a longer context ensures that the model remembers more of the previous
                conversation, leading to more coherent and contextually relevant responses.
              </li>
              <li>
                <strong className="text-white">Cost Implications</strong>: Models with longer
                context lengths typically come at a higher price point due to the increased
                computational resources they consume.
              </li>
            </ul>
            <h3 className="text-white" id="2-language-models-power-and-flexibility-">
              Language Models: Chat, Text Generation, and Reasoning
            </h3>
            <p>
              OpenAI and others offer multiple language models, each with distinct capabilities and
              price points. The pricing for these models is typically per 1,000 tokens.
            </p>
            <ul>
              <li>
                <p>
                  <strong className="text-white">OpenAI GPT-4</strong>: Known for its broad general
                  knowledge and domain expertise, GPT-4 is adept at following intricate instructions
                  in natural language and solving challenging problems with precision. It's also
                  slower and more expensive than other models. The recently released GPT-4 Turbo
                  (gpt-4-1106-preview) is 3x more affordable and supports an amazing 128K context
                  limit! Also available via Microsoft's Azure OpenAI Service.
                </p>
              </li>
              <li>
                <p>
                  <strong className="text-white">OpenAI GPT-3.5 Turbo</strong>: This model is
                  optimized for dialogue, making it ideal for chatbot applications and
                  conversational interfaces. It is also the fastest and most cost-effective model
                  for generating text. Also available via Microsoft's Azure OpenAI Service.
                </p>
              </li>
              <li>
                <p>
                  <strong className="text-white">Anthropic's Claude 2</strong>: This model is known
                  for it's huge 100k context length. This makes it great for summarization or Q&A
                  over large documents. However it's fairly slow and expensive because of this.
                </p>
              </li>
              <li>
                <p>
                  <strong className="text-white">Llama 2</strong>: Llama 2 is an open-source large
                  language model (LLM) developed by Meta, the parent company of Facebook. It stands
                  as Meta's answer to OpenAI's GPT series and Google's AI models such as PaLM 2.
                  However, it distinguishes itself by being freely accessible for both research and
                  commercial endeavors. Generally similar to GPT-3.5 Turbo in performace, Llama 2 is
                  a powerful model that can be used for a variety of tasks, including text
                  generation, summarization, and question answering. It is also at a comparable
                  level to GPT-4 for English text summarization for 30x less cost. One downside it
                  Llama 2 is an English only model.
                </p>
              </li>
              <li>
                <p>
                  <strong className="text-white">Gemini</strong>: Gemini is the newest family of multimodal large language models developed by Google, serving as the successor to PaLM 2. Comprising Gemini Ultra, Gemini Pro, and Gemini Nano, it was announced on December 6, 2023. Gemini Ultra is positioned as the first contender to OpenAI's GPT-4, while Gemini Pro is closer in performance to GPT-3.5.
                </p>
              </li>
              <li>
                <p>
                  <strong className="text-white">PaLM 2</strong>: PaLM 2 is an older language model from Google boasting enhanced multilingual,
                  reasoning, and coding capabilities. Trained on multilingual text from over 100
                  languages, it excels in understanding and translating intricate text forms like
                  idioms and poems. Its dataset, rich with scientific papers and web content,
                  empowers it with superior logic, reasoning, and mathematical skills. Additionally,
                  its proficiency in coding is evident from its training on vast source code
                  datasets, making it adept in languages from Python to Fortran.
                </p>
              </li>
              <li>
                <p>
                  <strong className="text-white">Mistral</strong>: Mistral AI is a new exciting startup that has released a number of small open source models that are very fast and cheap to use. Mistral 7B and Mixtral 8x7B (Mixtral) are two of their most popular models. Mixtral beats Llama 2 and compares in performance to GPT-3.5 Turbo and is 2.5x cheaper to use. Mistral medium is a private model with slightly better benchmarks than GPT-3.5 Turbo.
                </p>
              </li>
            </ul>
            <h3 className="text-white" id="3-fine-tuning-models-customization-at-its-best-">
              Fine-tuning Models
            </h3>
            <p>
              OpenAI allows users to create custom models by fine-tuning base models with their
              training data. Once a model is fine-tuned, users are billed only for the tokens they
              use in requests to that specific model. This offers a level of customization that can
              be tailored to specific business needs. It can save costs by eliminating the need to
              include common system prompts or few-shot examples in every request if it will be used
              over and over again.
            </p>
            <h3 className="text-white" id="4-embedding-models-advanced-functionalities-">
              Embedding Models: Semantic Search and Clustering
            </h3>
            <p>
              Embedding models are designed to build advanced functionalities like search,
              clustering, topic modeling, and classification. They are essential for applications
              that require nuanced understanding and categorization of data like{' '}
              <Link
                className="text-teal-400"
                href="/article/you-shouldnt-build-your-own-ai-support-bot"
              >
                AI support chatbots using Retreival Augmented Generation (RAG)
              </Link>
              .
            </p>
          </div>
          <RegisterCTA />
        </div>
      </main>
      <Footer />
    </>
  )
}
