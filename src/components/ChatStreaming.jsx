import { useEffect, useState, useRef, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  HandThumbDownIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  HandThumbUpIcon,
  LinkIcon,
  UserCircleIcon,
  LightBulbIcon,
  ClipboardIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkExternalLinks from 'remark-external-links'
import Alert from '@/components/Alert'
import RobotIcon from '@/components/RobotIcon'
import classNames from '@/utils/classNames'
import LoadingDots from './LoadingDots'
import { grabQuestions } from '@/utils/helpers'
import { Mixpanel } from '@/lib/mixpanel-web'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase-ui.config'

export default function Chat({ teamId, bot, showResearchMode = false }) {
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [answerHtml, setAnswerHtml] = useState('')
  const [currentSource, setCurrentSource] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [errorText, setErrorText] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [ratings, setRatings] = useState({})
  const [isResearchMode, setIsResearchMode] = useState(false)
  const [showQuestion, setShowQuestion] = useState(true)
  const [researchDisabled, setResearchDisabled] = useState(bot.model === 'gpt-3.5-turbo-0613')
  const [questions, setQuestions] = useState(
    bot.questions ? (bot.questions.length >= 4 ? grabQuestions(bot) : bot.questions.slice(0, 2)) : []
  )
  const [isCopied, setIsCopied] = useState(false)
  const [copiedId, setCopiedId] = useState('')
  const [user] = useAuthState(auth)
  const textareaRef = useRef(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }, [question])

  //clear error text when question changes
  useEffect(() => {
    if (question) {
      setErrorText(null)
    }
  }, [question])

  //convert markdown to html when answer changes or is appended to
  useEffect(() => {
    if (currentAnswer) {
      remark()
        .use(html)
        .use(remarkGfm)
        .use(remarkExternalLinks, { target: '_blank', rel: ['noopener'] })
        .process(currentAnswer)
        .then((html) => {
          setAnswerHtml(html.toString())
        })
    }
  }, [currentAnswer])

  //update answer html when answers change
  useEffect(() => {
    if (answers.length > 0 && answerHtml) {
      const lastAnswer = answers[answers.length - 1]
      if (lastAnswer.type === 'answer') {
        setAnswers((prev) => {
          //edit last answer
          prev[prev.length - 1].html = answerHtml
          return [...prev]
        })
      }
    }
  }, [answerHtml])

  // make api call to ask question
  const askQuestion = async (askedQuestion) => {
    if (!askedQuestion || askedQuestion.length < 2) {
      setErrorText('Please enter a full question.')
      return
    }
    setLoading(true)
    setErrorText(null)
    setAnswerHtml('')
    setCurrentAnswer('')
    setLoadingMessage('Sending...')

    //get apiBase from env
    const apiUrl = `${process.env.NEXT_PUBLIC_BOT_WEBSOCKET}/teams/${teamId}/bots/${bot.id}/chat`
    const ws = new WebSocket(apiUrl)

    // Send message to server when connection is established
    ws.onopen = function (event) {
      setShowQuestion(false)
      setLoadingMessage('Thinking...')
      setAnswers((prev) => {
        //add new question
        return [...prev, { type: 'question', question: askedQuestion }]
      })
      setQuestion('')

      //get name and email
      const metadata = {}
      let testing = false
      if (user) {
        metadata.name = user.displayName
        metadata.email = user.email
        testing = true
      }
      const req = {
        question: askedQuestion,
        history: chatHistory,
        testing,
        metadata,
        full_source: showResearchMode,
      }
      if (bot.privacy === 'private') {
        //add token to request
        req.auth = bot.signature
      }
      if (isResearchMode) {
        req.context_items = 16
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
      setLoading(false)
      setLoadingMessage(null)
      setErrorText('There was a connection error. Please try again.')
      //strip all empty answers
      if (answers.length > 0) {
        setAnswers((prev) => {
          return [...prev.filter((a) => a.type !== 'answer' || a.html)]
        })
      }
    }

    ws.onclose = function (event) {
      if (!event.wasClean) {
        setLoading(false)
        setLoadingMessage(null)
        setErrorText('Network error, please try again.')
        //strip all empty answers
        if (answers.length > 0) {
          setAnswers((prev) => {
            return [...prev.filter((a) => a.type !== 'answer' || a.html)]
          })
        }
      }
    }

    // Receive message from server word by word. Display the words as they are received.
    ws.onmessage = function (event) {
      const data = JSON.parse(event.data)
      if (data.sender === 'bot') {
        if (data.type === 'start') {
          setLoadingMessage('Checking my sources...')
          setAnswers((prev) => {
            //add new question
            return [...prev, { type: 'answer', html: null, rating: 0 }]
          })
        } else if (data.type === 'stream') {
          setLoadingMessage('Answering...')
          //append to answer
          setCurrentAnswer((prev) => {
            return prev + data.message
          })
        } else if (data.type === 'info') {
          setLoadingMessage(data.message)
        } else if (data.type === 'end') {
          const endData = JSON.parse(data.message)
          setChatHistory(endData.history)
          setCurrentAnswer(endData.answer)
          setAnswers((prev) => {
            prev[prev.length - 1].markdown = endData.answer
            prev[prev.length - 1].sources = endData.sources
            prev[prev.length - 1].id = endData.id
            return prev
          })
          setLoading(false)
          setLoadingMessage(null)
          ws.close()
        } else if (data.type === 'error') {
          setErrorText(data.message)
          //strip all empty answers
          if (answers.length > 0) {
            setAnswers((prev) => {
              return [...prev.filter((a) => a.type !== 'answer' || a.html)]
            })
          }
          setLoading(false)
          setLoadingMessage(null)
          ws.close()
        }
      }
    }
  }

  // make api call to rate
  const setRating = async (answerId, newRating = 0) => {
    if (!answerId) {
      return
    }

    setErrorText(null)
    setRatings((prev) => {
      prev[answerId] = newRating
      return { ...prev }
    })

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
          setRatings((prev) => {
            prev[answerId] = 0
            return { ...prev }
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
        setRatings((prev) => {
          prev[answerId] = 0
          return { ...prev }
        })
      }
    } catch (e) {
      console.warn(e)
      setErrorText('Something went wrong, please try again.')
      setLoading(false)
      setRatings((prev) => {
        prev[answerId] = 0
        return { ...prev }
      })
    }
  }

  const handleCopyText = (htmlText, id) => {
    navigator.clipboard.writeText(htmlText)
    setCopiedId(id)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
      setCopiedId('')
    }, 1500)
  }

  const FullSource = () => {
    const [content, setContent] = useState(null)

    //convert markdown to html when answer changes or is appended to
    useEffect(() => {
      if (currentSource?.content) {
        remark()
          .use(html)
          .use(remarkGfm)
          .use(remarkExternalLinks, { target: '_blank', rel: ['noopener'] })
          .process(currentSource.content)
          .then((html) => {
            setContent(html.toString())
          })
      }
    }, [currentSource])

    if (!currentSource) return null

    const page = currentSource?.page ? ` - Page ${currentSource?.page}` : ''
    const SourceIcon = currentSource?.url ? LinkIcon : DocumentTextIcon

    return (
      <Transition.Root show={!!currentSource} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setCurrentSource}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                      onClick={() => setCurrentSource(null)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div>
                    <div className="mt-1 text-center sm:mt-2">
                      <Dialog.Title
                        as="h3"
                        className="flex items-center justify-center text-xl font-semibold leading-6 text-gray-900"
                      >
                        <SourceIcon
                          className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-800"
                          aria-hidden="true"
                        />
                        {currentSource.url ? (
                          <Link
                            href={currentSource.url}
                            target="_blank"
                            className="focus:outline-none"
                          >
                            <p className="text-left">
                              {currentSource.title}
                              {page}
                            </p>
                          </Link>
                        ) : (
                          <p className="text-left">
                            {currentSource.title || currentSource.url}
                            {page}
                          </p>
                        )}
                      </Dialog.Title>
                      <div
                        className="prose mt-4 min-w-full text-left"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    )
  }

  const SourceResearch = ({ source }) => {
    const SourceIcon = source.url ? LinkIcon : DocumentTextIcon
    const page = source.page ? ` - Page ${source.page}` : ''

    return (
      <li className="my-1 flex cursor-pointer items-center">
        <button
          onClick={() => setCurrentSource(source)}
          className="flex items-center text-left text-sm font-medium leading-tight text-gray-500"
        >
          <SourceIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
          {source.title || source.url}
          {page}
        </button>
      </li>
    )
  }

  const Source = ({ source }) => {
    const SourceIcon = source.url ? LinkIcon : DocumentTextIcon
    const page = source.page ? ` - Page ${source.page}` : ''

    return (
      <li className="my-1 flex cursor-pointer items-center">
        <SourceIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
        {source.url ? (
          <Link href={source.url} target="_blank" className="focus:outline-none">
            <p className="text-left">
              {source.title}
              {page}
            </p>
          </Link>
        ) : (
          <p className="text-left">
            {source.title || source.url}
            {page}
          </p>
        )}
      </li>
    )
  }

  const ChatRow = ({ answer }) => {
    const gridItemRef = useRef(null)

    useEffect(() => {
      if (gridItemRef.current) {
        const gridItems = gridItemRef.current.children

        let minHeight = Infinity
        Array.from(gridItems).forEach((item) => {
          if (item.offsetHeight < minHeight) {
            minHeight = item.offsetHeight
          }
        })

        Array.from(gridItems).forEach((item) => {
          item.style.height = `${minHeight}px`
        })
      }
    }, [])

    if (answer.type === 'question') {
      return (
        <div className="relative mt-4 max-w-fit rounded-md bg-teal-50 text-left shadow-sm sm:rounded-lg">
          <div className="absolute -inset-7 flex h-28 w-12 items-center text-2xl font-extrabold tracking-tighter">
            <span className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 p-2 shadow-lg">
              <UserCircleIcon className="h-7 w-7 text-white" aria-hidden="true" />
            </span>
          </div>
          <div className="prose min-w-full p-4 px-6 sm:px-8">{answer.question}</div>
        </div>
      )
    } else {
      return (
        <div
          ref={gridItemRef}
          className={classNames('grid gap-4', showResearchMode ? 'grid-cols-12' : 'grid-cols-8')}
        >
          <div
            className="relative col-span-8 mt-4 h-fit rounded-md border bg-white text-left shadow-sm sm:rounded-lg"
            id={answer.id || null}
          >
            <div className="absolute -inset-7 flex h-32 w-12 items-center text-2xl font-extrabold tracking-tighter">
              <span className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 p-2 shadow-lg">
                <RobotIcon className="h-7 w-7 text-white" aria-hidden="true" />
              </span>
            </div>
            {answer.html ? (
              <div
                className={classNames(
                  answer.sources?.length > 0 ? 'pb-2 sm:pb-2' : '',
                  'prose min-w-full p-6 sm:px-8'
                )}
                dangerouslySetInnerHTML={{ __html: answer.html }}
              />
            ) : (
              <div
                className={classNames(
                  answer.sources?.length > 0 ? 'pb-2 sm:pb-2' : '',
                  'prose min-w-full p-6 sm:px-8'
                )}
              >
                <LoadingDots />
              </div>
            )}

            {answer.sources?.length > 0 && (
              <div
                className={classNames(
                  'flex items-end px-6 pb-4 pr-4 sm:px-8 sm:pr-4',
                  !showResearchMode ? 'justify-between' : 'justify-end'
                )}
              >
                {answer.sources?.length > 0 && !showResearchMode && (
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-800">{bot.labels.sources}</div>
                    <ul className="mt-2">
                      {answer.sources.map((source, index) => (
                        <Source key={index} source={source} />
                      ))}
                    </ul>
                  </div>
                )}
                {answer.id && (
                  <div className="flex items-center justify-between space-x-1">
                    <button
                      onClick={() => handleCopyText(answer.markdown, answer.id || '')}
                      title="Copy answer to clipboard"
                      className="rounded-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:text-cyan-600"
                    >
                      {isCopied && copiedId === answer.id ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : (
                        <ClipboardIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRating(answer.id, 1)}
                      disabled={ratings[answer.id] === 1}
                      className="rounded-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:text-cyan-600"
                    >
                      <span className="sr-only">{bot.labels.helpful}</span>
                      <HandThumbUpIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRating(answer.id, -1)}
                      disabled={ratings[answer.id] === -1}
                      className="rounded-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:text-cyan-600"
                    >
                      <span className="sr-only">{bot.labels.unhelpful}</span>
                      <HandThumbDownIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {answer.sources?.length > 0 && showResearchMode && (
            <div className="col-span-4 mt-4 overflow-y-scroll text-left">
              <div className="text-sm font-semibold text-gray-800">{bot.labels.sources}</div>
              <ul className="mt-2">
                {answer.sources.map((source, index) => (
                  <SourceResearch key={index} source={source} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div className="relative flex justify-center py-8">
      <div className="flex w-full flex-col px-10 text-center sm:max-w-3xl lg:max-w-7xl lg:px-12">
        <div className="my-auto">
          {bot.logo && !showResearchMode && (
            <div className="flex items-center justify-center">
              <img src={bot.logo} alt={bot.name} className="max-h-9 w-auto" />
            </div>
          )}
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {bot.name}
          </p>
          <p className="mx-auto mt-5 max-w-prose text-xl text-gray-500">{bot.description}</p>
        </div>

        <FullSource />

        <div className="mt-16">
          {answers.map((answer, index) => (
            <ChatRow key={index} answer={answer} />
          ))}

          <Alert title={errorText} type="warning" />

          {showQuestion && (
            <div className="mx-auto mt-5 grid w-full gap-3 grid-cols-1 md:grid-cols-2">
              {questions &&
                questions.length > 0 &&
                questions.map((recommendedQuestion) => (
                  <button
                    type="button"
                    className="flex w-full items-center rounded-lg border border-gray-300 p-3 text-cyan-700 hover:bg-white hover:text-cyan-800 focus:ring-cyan-600 focus:ring-offset-cyan-50"
                    onClick={() => {
                      setQuestion(recommendedQuestion)
                      askQuestion(recommendedQuestion)
                    }}
                    key={recommendedQuestion}
                  >
                    <LightBulbIcon className="mr-1 h-4 w-4 text-cyan-700" aria-hidden="true" />
                    <p className="text-left text-xs">{recommendedQuestion}</p>
                  </button>
                ))}
            </div>
          )}

          <form
            className="mt-4 flex justify-center"
            onSubmit={(e) => {
              e.preventDefault()
              if (!loading) {
                askQuestion(question)
              }
            }}
            disabled={loading}
          >
            <div className="mt-1 w-full rounded-md sm:flex sm:shadow-sm">
              <div className="relative flex w-full flex-grow items-end shadow-sm sm:shadow-inherit">
                <textarea
                  ref={textareaRef}
                  name="query"
                  id="query"
                  value={question}
                  maxLength={2000}
                  minLength={2}
                  required
                  rows={1}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    //this detects if the user is typing in a IME session (ie Kanji autocomplete) to avoid premature submission
                    if (e.isComposing || e.keyCode === 229) {
                      return
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (e.shiftKey) {
                        setQuestion((prevQuestion) => `${prevQuestion}\n`)
                      } else if (!e.shiftKey && !loading) {
                        askQuestion(question)
                      }
                    }
                  }}
                  tabIndex={1}
                  autoComplete="off"
                  className="text-lg block max-h-48 w-full resize-none rounded-md border border-gray-300 py-4 pl-2 pr-10 outline-none focus:border-none focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-50 sm:py-2 sm:pl-4 sm:pr-12 sm:text-lg"
                  placeholder={answers.length ? '' : bot.labels.firstMessage}
                />

                <button
                  type="submit"
                  tabIndex={2}
                  disabled={loading}
                  className="absolute right-0 my-3 mr-2 rounded-sm  px-1 text-cyan-600 hover:text-cyan-700 hover:ring-cyan-600 focus:outline-none focus:ring-1 focus:ring-offset-2 disabled:opacity-50"
                >
                  <span className="sr-only">{bot.labels.inputPlaceholder}</span>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="relative w-5">
                        <div className="h-5 w-5 rounded-full border border-teal-400"></div>
                        <div className="absolute left-0 top-0 h-5 w-5 animate-spin rounded-full border-t-2 border-cyan-600"></div>
                      </div>
                    </div>
                  ) : (
                    <PaperAirplaneIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </form>
          <div className="mt-2 flex items-start justify-between">
            <div className="text-left">
              {showResearchMode && (
                <label className="relative inline-flex cursor-pointer justify-start items-center">
                  <input
                    type="checkbox"
                    value={isResearchMode}
                    checked={isResearchMode}
                    onChange={() => setIsResearchMode((prevOpen) => !prevOpen)}
                    className="peer sr-only"
                    disabled={researchDisabled}
                  />
                  <div className="peer h-4 w-7 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] disabled:opacity-25 peer-checked:bg-cyan-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-600 peer-focus:ring-offset-2 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700"></div>
                  <span className="ms-3 text-xs text-gray-600 dark:text-gray-300">
                    Research mode
                  </span>
                </label>
              )}
              {isResearchMode && showResearchMode && (
                <p className="mx-auto mt-1 max-w-prose text-left text-xs text-gray-500">
                  Note: Enabling Research Mode passes more source context in order to answer
                  detailed questions at the expense of more token usage.
                </p>
              )}
            </div>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <span>Use Shift + Enter to skip to a new line.</span>
              {!showQuestion && (
                <button
                  type="button"
                  className="ml-1 flex items-center text-gray-600 hover:text-cyan-700 focus:outline-none focus:ring-1 focus:ring-offset-2"
                  onClick={() => {
                    setAnswers([])
                    setShowQuestion(true)
                    setQuestion('')
                  }}
                >
                  <ArrowPathIcon className="mr-0.5 h-3 w-3" aria-hidden="true" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
