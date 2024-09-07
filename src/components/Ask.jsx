import { useEffect, useState } from 'react'
import {
  HandThumbDownIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  HandThumbUpIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { remark } from 'remark'
import html from 'remark-html'
import Alert from '@/components/Alert'

export default function Ask({ team, bot }) {
  const [question, setQuestion] = useState('')
  const [resultHtml, setResultHtml] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [answerId, setAnswerId] = useState(null)
  const [rating, setRating] = useState(0)
  const [errorText, setErrorText] = useState(null)

  //clear error text when question changes
  useEffect(() => {
    setErrorText(null)
  }, [question])

  // make api call to ask question
  const askQuestion = async () => {
    if (!question || question.length < 2) {
      setErrorText('Please enter a full question.')
      return
    }
    setLoading(true)
    setErrorText(null)
    setResultHtml('')
    setSources([])
    setAnswerId(null)
    setRating(0)

    const data = { question: question, format: 'markdown' }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }

    const apiUrl = `https://api.docsbot.ai/teams/${team.id}/bots/${bot.id}/ask`
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })
      if (response.ok) {
        const data = await response.json()
        //if trimmed answer is empty, show error
        if (data.error) {
          setErrorText(data.error)
          setLoading(false)
        } else if (!data.answer.trim()) {
          setErrorText('No answer found, please try again.')
          setLoading(false)
        } else {
          setAnswerId(data.id)
          // Use remark to convert markdown into HTML string
          remark()
            .use(html)
            .process(data.answer)
            .then((html) => {
              setResultHtml(html.toString())
              setSources(data.sources)
              setLoading(false)
            })
        }
      } else {
        try {
          const data = await response.json()
          setErrorText(data.error || 'Something went wrong, please try again.')
        } catch (e) {
          setErrorText('Something went wrong, please try again.')
        }
        setLoading(false)
      }
    } catch (e) {
      console.warn(e)
      setErrorText('Something went wrong, please try again.')
      setLoading(false)
    }
  }

  //trigger api call when rating changes
  useEffect(() => {
    if (rating) {
      rateAnswer(rating)
    }
  }, [rating])

  // make api call to rate
  const rateAnswer = async (newRating) => {
    if (!answerId) {
      return
    }

    setErrorText(null)

    const data = { rating: newRating }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }

    const apiUrl = `https://api.docsbot.ai/teams/${team.id}/bots/${bot.id}/rate/${answerId}`
    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      })
      if (response.ok) {
        const data = await response.json()
        //if trimmed answer is empty, show error
        if (data.error) {
          setErrorText(data.error)
        }
      } else {
        try {
          const data = await response.json()
          setErrorText(data.error || 'Something went wrong, please try again.')
        } catch (e) {
          setErrorText('Something went wrong, please try again.')
        }
        setLoading(false)
      }
    } catch (e) {
      console.warn(e)
      setErrorText('Something went wrong, please try again.')
      setLoading(false)
    }
  }

  const Source = ({ source }) => {
    const SourceIcon = source.url ? LinkIcon : DocumentTextIcon
    const page = source.page ? ` Page ${source.page}` : ''

    return (
      <div className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 p-3 shadow-lg">
            <SourceIcon className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          {source.url ? (
            <Link href={source.url} target="_blank" className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-left text-sm font-medium text-gray-900">
                {source.title}
                {page}
              </p>
            </Link>
          ) : (
            <p className="text-left text-sm font-medium text-gray-900">
              {source.title || source.url}
              {page}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-8 px-4">
      <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
        <div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {bot.name}
          </p>
          <p className="mx-auto mt-5 max-w-prose text-xl text-gray-500">{bot.description}</p>
        </div>
        <div className="mt-12">
          <Alert title={errorText} type="warning" />

          {loading ? (
            <>
              <div className="mt-6 flex justify-center">
                <div className="relative w-20">
                  <ChatBubbleLeftEllipsisIcon className="absolute m-6 h-8 w-8 animate-pulse text-teal-500" />
                  <div className="h-20 w-20 rounded-full border-2 border-teal-400"></div>
                  <div className="absolute left-0 top-0 h-20 w-20 animate-spin rounded-full border-t-4 border-cyan-600"></div>
                </div>
              </div>
            </>
          ) : (
            <form
              className="flex justify-center"
              onSubmit={(e) => {
                askQuestion()
                e.preventDefault()
              }}
              disabled={loading}
            >
              <div className="mt-1 w-full rounded-md sm:flex sm:shadow-sm">
                <div className="relative flex w-full flex-grow items-stretch shadow-sm sm:shadow-inherit">
                  <input
                    type="text"
                    name="query"
                    id="query"
                    value={question}
                    maxLength={2000}
                    minLength={2}
                    required
                    onChange={(e) => setQuestion(e.target.value)}
                    onDoubleClick={() => {
                      //highlight the text
                      document.getElementById('query').select()
                    }}
                    onKeyDown={(e) => {
                      //submit on enter
                      if (e.key === 'Enter') {
                        askQuestion()
                      }
                    }}
                    tabIndex={1}
                    className="block w-full rounded-md border-gray-300 py-4  pl-4 pr-10 text-sm focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 sm:rounded-none sm:rounded-l-md sm:py-0 sm:pl-6 sm:pr-12 sm:text-lg"
                    placeholder="What can I help you with?"
                  />
                </div>
                <button
                  type="submit"
                  tabIndex={2}
                  className="relative mt-4 inline-flex w-full items-center justify-center space-x-2 rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 py-3 px-4 text-sm font-bold text-white shadow hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 sm:-ml-px sm:mt-0 sm:w-32 sm:rounded-none sm:rounded-r-md sm:text-lg"
                >
                  Ask
                </button>
              </div>
            </form>
          )}

          {!resultHtml && (
            <div className="mx-auto mt-8 max-w-7xl text-left">
              <h3 className="text-xl font-medium leading-6 text-gray-900">Tips:</h3>
              <ul className="mt-4 ml-6 list-disc text-left">
                <li className="text-md text-gray-500">
                  Ask me full questions, I'm not a search engine!
                </li>
                <li className="text-md text-gray-500">
                  Tell me how to respond, like "with code examples", "as a list", or "with a haiku".
                </li>
              </ul>
            </div>
          )}
        </div>

        {resultHtml && (
          <>
            <div className="relative mt-16 rounded-sm bg-white text-left shadow-sm sm:rounded-lg ">
              <div className="absolute -inset-6 flex h-12 items-center text-3xl font-extrabold tracking-tighter text-gray-800 opacity-25">
                <svg
                  className="mr-2 h-12 w-12"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                Answer:
              </div>
              <div
                className="wpchat-code prose min-w-full p-4 pb-0 sm:p-8 sm:pb-0"
                dangerouslySetInnerHTML={{ __html: resultHtml }}
              />
              {answerId && (
                <div className="flex items-center justify-end space-x-1 pb-4 pr-4">
                  <button
                    type="button"
                    onClick={() => setRating(1)}
                    disabled={rating === 1}
                    className="rounded-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:text-cyan-600"
                  >
                    <span className="sr-only">Downvote</span>
                    <HandThumbUpIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating(-1)}
                    disabled={rating === -1}
                    className="rounded-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:text-cyan-600"
                  >
                    <span className="sr-only">Upvote</span>
                    <HandThumbDownIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative mt-16 pt-1">
              <div className="absolute -inset-6 flex h-12 items-center text-3xl font-extrabold tracking-tighter text-gray-800 opacity-25">
                Sources:
              </div>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sources.map((source) => (
                  <Source key={source.id} source={source} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
