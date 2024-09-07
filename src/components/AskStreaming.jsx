import { useEffect, useState } from 'react'
import {
  HandThumbDownIcon,
  LightBulbIcon,
  DocumentTextIcon,
  HandThumbUpIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkExternalLinks from 'remark-external-links'
import Alert from '@/components/Alert'
import { grabQuestions } from '@/utils/helpers'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { Mixpanel } from '@/lib/mixpanel-web'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase-ui.config'

export default function AskStreaming({ teamId, bot }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [answerId, setAnswerId] = useState(null)
  const [resultHtml, setResultHtml] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [errorText, setErrorText] = useState(null)
  const [rating, setRating] = useState(0)
  const [questions, setQuestions] = useState(bot.questions ? (bot.questions.length > 3 ? grabQuestions(bot) : bot.questions) : [])
  const [user] = useAuthState(auth)

  //clear error text when question changes
  useEffect(() => {
    if (question) {
      setErrorText(null)
    }
  }, [question])

  //convert markdown to html when answer changes or is appended to
  useEffect(() => {
    if (answer) {
      remark()
        .use(html)
        .use(remarkGfm)
        .use(remarkExternalLinks, { target: '_blank', rel: ['noopener'] })
        .process(answer)
        .then((html) => {
          setResultHtml(html.toString())
        })
    }
  }, [answer])

  // make api call to ask question
  const askQuestion = async () => {
    if (!question || question.length < 2) {
      setErrorText('Please enter a full question.')
      return
    }
    setLoading(true)
    setErrorText(null)
    setAnswer('')
    setResultHtml('')
    setSources([])
    setRating(0)
    setAnswerId(null)
    setLoadingMessage(bot.labels.thinking)

    //get apiBase from env
    const apiUrl = `${process.env.NEXT_PUBLIC_BOT_WEBSOCKET}/teams/${teamId}/bots/${bot.id}/chat`
    const ws = new WebSocket(apiUrl)

    // Send message to server when connection is established
    ws.onopen = function (event) {
      setLoadingMessage(bot.labels.thinking)
      //get name and email
      const metadata = {}
      let testing = false
      if (user) {
        metadata.name = user.displayName
        metadata.email = user.email
        testing = true
      }
      const req = {
        question: question,
        testing,
        metadata,
      }
      if (bot.privacy === 'private') {
        //add token to request
        req.auth = bot.signature
      }
      ws.send(JSON.stringify(req))

      if (testing) {
        Mixpanel.track('Bot Tested', { 'Bot name': bot.name })
        if (window.bento !== undefined) {
          window.bento.track('botTested', { botName: bot.name })
        }
      }
    }

    ws.onerror = function (event) {
      console.log('error', event)
      setErrorText('There was a connection error. Please try again.')
      setLoading(false)
      setLoadingMessage(null)
    }
    
    ws.onclose = function (event) {
      if (!event.wasClean) {
        setErrorText('Network error, please try again.')
        setLoading(false)
        setLoadingMessage(null)
      }
    }

    // Receive message from server word by word. Display the words as they are received.
    ws.onmessage = function (event) {
      const data = JSON.parse(event.data)
      if (data.sender === 'bot') {
        if (data.type === 'start') {
          setLoadingMessage(bot.labels.thinking)
        } else if (data.type === 'stream') {
          setLoadingMessage(bot.labels.thinking)
          //append to answer
          setAnswer((prev) => prev + data.message)
        } else if (data.type === 'info') {
          setLoadingMessage(data.message)
        } else if (data.type === 'end') {
          data = JSON.parse(data.message)
          setSources(data.sources)
          setAnswer(data.answer)
          setAnswerId(data.id)
          setLoading(false)
          setLoadingMessage(null)
          ws.close()
        } else if (data.type === 'error') {
          setErrorText(data.message)
          setLoading(false)
          setLoadingMessage(null)
          ws.close()
        }
      }
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

    if (bot.privacy === 'private') {
      //add token to request
      headers['Authorization'] = 'Bearer ' + bot.signature
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BOT_API_URL}/teams/${teamId}/bots/${bot.id}/rate/${answerId}`
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
              <div className="mt-4 flex items-center justify-center">
                <div className="relative w-5">
                  <div className="h-5 w-5 rounded-full border border-teal-400"></div>
                  <div className="absolute left-0 top-0 h-5 w-5 animate-spin rounded-full border-t-2 border-cyan-600"></div>
                </div>
                <p className="ml-2 animate-pulse text-lg text-cyan-700">{loadingMessage}</p>
              </div>
            </>
          ) : (
            <>
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
                      onKeyDown={(e) => {
                        //submit on enter
                        if (e.key === 'Enter') {
                          askQuestion()
                        }
                      }}
                      tabIndex={1}
                      autoComplete="off"
                      className="block w-full rounded-md border-gray-300 py-4  pl-4 pr-10 text-sm focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 sm:rounded-none sm:rounded-l-md sm:py-0 sm:pl-6 sm:pr-12 sm:text-lg"
                      placeholder={bot.labels.firstMessage}
                    />
                  </div>
                  <button
                    type="submit"
                    tabIndex={2}
                    className="relative mt-4 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 py-3 px-4 text-sm font-bold text-white shadow hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 sm:-ml-px sm:mt-0 sm:w-16 sm:rounded-none sm:rounded-r-md sm:text-lg"
                  >
                    <span className="sr-only">{bot.labels.inputPlaceholder}</span>
                    <PaperAirplaneIcon className="h-6 w-6" />
                  </button>
                </div>
              </form>
              <div className='sm:flex items-center justify-between mt-3'>
                {questions && questions.length > 0 && (
                  questions.map((recommendedQuestion) => (
                    <button
                      type="button"
                      className="flex items-center justify-center text-cyan-700 hover:text-cyan-800 focus:ring-cyan-600 focus:ring-offset-cyan-50 mr-2"
                      onClick={() => {
                        setQuestion(recommendedQuestion)
                        askQuestion()
                      }}
                      key={recommendedQuestion}
                    >
                      <LightBulbIcon className="h-5 w-5 mr-1 text-cyan-700" aria-hidden="true" />
                      <p className='text-xs text-left'>
                        {recommendedQuestion}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {resultHtml && (
          <>
            <div className="relative mt-16 rounded-sm bg-white text-left shadow-sm sm:rounded-lg ">
              <div className="absolute -inset-4 flex h-12 items-center text-2xl font-extrabold tracking-tighter text-gray-800 opacity-25">
                <svg
                  className="mr-2 h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
               
              </div>
              <div
                className="wpchat-code prose min-w-full p-4 pb-2 sm:p-8 sm:pb-4"
                dangerouslySetInnerHTML={{ __html: resultHtml }}
              />
              {answerId && (
                <div className="flex items-center justify-end space-x-2 pb-4 pr-4">
                  <button
                    type="button"
                    onClick={() => setRating(1)}
                    disabled={rating === 1}
                    className="rounded-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:text-cyan-600"
                  >
                    <span className="sr-only">{bot.labels.helpful}</span>
                    <HandThumbUpIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating(-1)}
                    disabled={rating === -1}
                    className="rounded-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:text-cyan-600"
                  >
                    <span className="sr-only">{bot.labels.unhelpful}</span>
                    <HandThumbDownIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            {sources?.length > 0 && (
              <div className="relative mt-16 pt-1">
                <div className="absolute -inset-6 ml-8 flex h-12 items-center text-2xl font-extrabold tracking-tighter text-gray-800 opacity-25">
                  {bot.labels.sources}
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {sources.map((source, index) => (
                    <Source key={index} source={source} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
