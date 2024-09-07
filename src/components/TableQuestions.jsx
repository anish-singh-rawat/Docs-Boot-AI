import clsx from 'clsx'
import { useEffect, useState, useRef, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  HandThumbDownIcon,
  DocumentTextIcon,
  HandThumbUpIcon,
  LinkIcon,
  MinusIcon,
  XMarkIcon,
  LifebuoyIcon,
  AdjustmentsHorizontalIcon,
  UserCircleIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Paginator from '@/components/Paginator'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import Checkout from '@/components/Checkout'
import Alert from '@/components/Alert'
import ModalQA from '@/components/ModalQA'
import LocaleDateTime from '@/components/LocaleDateTime'
import QuestionFilters from '@/components/QuestionFilters'

const BLUR_LIMIT_COUNT = 2 // the amount of questions to blur before the plan limit

const filterOptions = [
  {
    id: 'rating',
    name: 'Rating',
    options: [
      { value: null, label: 'All' },
      {
        value: 1,
        label: (
          <span className="flex items-center">
            <HandThumbUpIcon className="mr-1 h-4 w-4 text-green-600" /> Up
          </span>
        ),
      },
      {
        value: 0,
        label: (
          <span className="flex items-center">
            <MinusIcon className="mr-1 h-4 w-4 text-gray-500" /> Neutral
          </span>
        ),
      },
      {
        value: -1,
        label: (
          <span className="flex items-center">
            <HandThumbDownIcon className="mr-1 h-4 w-4 text-red-600" /> Down
          </span>
        ),
      },
    ],
  },
  {
    id: 'escalated',
    name: 'Escalated',
    options: [
      { value: null, label: 'All' },
      {
        value: true,
        label: (
          <span className="flex items-center">
            <LifebuoyIcon className="mr-1 h-4 w-4 text-blue-700" /> Escalated
          </span>
        ),
      },
      /* Add this in Nov 2023 once enough logs have been collected with this feature
      {
        value: false,
        label: (
          <span className="flex items-center">
            <LifebuoyIcon className="mr-1 h-4 w-4  text-gray-500" /> Not Escalated
          </span>
        ),
      },
      */
    ],
  },
]

export default function TableQuestions({ team, bot, questions, setQuestions, changePage }) {
  const [ipFilter, setIPFilter] = useState(null)
  const [ipAlias, setIPAlias] = useState(null)
  const [filters, setFilters] = useState({ rating: null, escalated: null })

  useEffect(() => {
    changePage(0, ipFilter, filters.rating, filters.escalated)
  }, [ipFilter, filters.rating, filters.escalated])

  const Sources = ({ sources }) => {
    return (
      <ul className="my-0 list-none py-0">
        {sources.map((source, index) => (
          <Source key={index} source={source} />
        ))}
      </ul>
    )
  }
  // blur is only enabled when we've reached our plan limit
  const [blurEnabled, setBlurEnabled] = useState(() => {
    return (
      questions.questions.length + questions.pagination.perPage * questions.pagination.page >=
      questions.pagination.planLimit
    )
  })

  const Source = ({ source }) => {
    const SourceIcon = source.url ? LinkIcon : DocumentTextIcon
    const page = source.page ? ` - Page ${source.page}` : ''

    return (
      <li className="flex items-center truncate lg:w-48">
        <SourceIcon className="mr-1 h-3 w-3 text-gray-400" aria-hidden="true" />
        {source.url ? (
          <Link
            href={source.url}
            target="_blank"
            className="block truncate text-gray-500 underline hover:text-gray-700 focus:outline-none active:text-gray-700"
          >
            <p className="truncate text-left text-xs font-medium">
              {source.title}
              {page}
            </p>
          </Link>
        ) : (
          <p className="text-left text-xs font-medium text-gray-500">
            {source.title || source.url}
            {page}
          </p>
        )}
      </li>
    )
  }

  const saveRating = async (questionId, newRating) => {
    const data = { rating: newRating }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bot?.signatureKey}`,
    }

    const apiUrl = `https://api.docsbot.ai/teams/${team.id}/bots/${bot.id}/rate/${questionId}`
    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      })
      if (response.ok) {
        setQuestions((prevQuestions) => {
          const questionIndex = prevQuestions.questions.findIndex(
            (question) => question.id === questionId
          )
          const newQuestions = [...prevQuestions.questions]
          newQuestions[questionIndex].rating = newRating
          return { ...prevQuestions, questions: newQuestions }
        })
      } else {
        try {
          const data = await response.json()
          if (data.error) {
            console.warn(data.error || 'Something went wrong, please try again.')
          }
        } catch (e) {
          console.warn(e)
        }
      }
    } catch (e) {
      console.warn(e)
    }
  }

  const FullSource = ({ source }) => {
    const SourceIcon = source.url ? LinkIcon : DocumentTextIcon
    const page = source.page ? ` - Page ${source.page}` : ''

    return (
      <>
        <h4 className="mb-2 flex items-center text-sm text-gray-500">
          <SourceIcon className="mr-1 h-3 w-3 text-gray-400" aria-hidden="true" />
          {source.url ? (
            <Link
              href={source.url}
              target="_blank"
              className="block truncate underline hover:text-gray-700 focus:outline-none active:text-gray-700"
            >
              <p className="truncate text-left">
                {source.title}
                {page}
              </p>
            </Link>
          ) : (
            <p className="text-left text-gray-500">
              {source.title || source.url}
              {page}
            </p>
          )}
        </h4>
        <p className="mb-4 text-left text-xs text-gray-500">{source.content}</p>
      </>
    )
  }

  const Rating = ({ rating, escalation }) => {
    const ThumbIcon = escalation
      ? LifebuoyIcon
      : rating > 0
      ? HandThumbUpIcon
      : rating < 0
      ? HandThumbDownIcon
      : MinusIcon
    const color = escalation
      ? 'text-blue-700'
      : rating > 0
      ? 'text-green-600'
      : rating < 0
      ? 'text-red-600'
      : 'text-gray-500'
    const spanText = escalation
      ? 'Escalated to support'
      : rating > 0
      ? 'Up vote'
      : rating < 0
      ? 'Down vote'
      : 'Neutral'

    return (
      <>
        <span className="sr-only">{spanText}</span>
        <ThumbIcon className={clsx(color, 'h-6 w-6')} aria-hidden="true" />
      </>
    )
  }

  const Answer = ({ question, questionIdx, children }) => {
    const [open, setOpen] = useState(false)
    const [answerHtml, setAnswerHtml] = useState(null)
    const [shortAnswer, setShortAnswer] = useState(question.answer)
    const [qaOpen, setQAOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [disabled, setDisabled] = useState(() => {
      return (
        questionIdx + questions.pagination.perPage * questions.pagination.page + BLUR_LIMIT_COUNT >=
        questions.pagination.planLimit
      )
    })

    useEffect(() => {
      if (question.answer) {
        if (question.answer.length > 300) {
          setShortAnswer(question.answer.substring(0, 300) + '...')
        }
        remark()
          .use(html)
          .use(remarkGfm)
          .process(question.answer)
          .then((html) => {
            setAnswerHtml(html.toString())
          })
      }
    }, [question.answer])

    return (
      <>
        <button
          className={(disabled ? '' : 'cursor-pointer') + 'm-0 block px-3 py-4 text-left'}
          onClick={() => {
            if (disabled) return
            setOpen(true)
          }}
          disabled={disabled}
        >
          {children}
        </button>
        <Transition.Root show={open} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setOpen}>
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

            <div className="fixed inset-0 z-10 overflow-y-auto">
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
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl">
                    <div className="absolute right-0 top-0 flex pr-4 pt-4">
                      {question.run_id && (
                        <button
                          className="flex items-center text-gray-400 hover:text-gray-600 text-xs mr-8"
                          onClick={(e) => {
                            e.preventDefault()
                            navigator.clipboard.writeText(question.run_id)
                            setCopied(true)
                            setTimeout(() => {
                              setCopied(false)
                            }, 2000)
                          }}
                          disabled={copied}
                          title='Copy this question ID to provide to the support team.'
                        >
                          <ClipboardDocumentIcon className="mr-1 h-4 w-4" aria-hidden="true" />
                          {copied ? 'Copied!' : 'Copy ID'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="mr-2 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        onClick={() => saveRating(question.id, 1)}
                      >
                        <span className="sr-only">Up vote</span>
                        <HandThumbUpIcon
                          className={clsx(
                            'h-6 w-6',
                            question.rating > 0 ? 'text-green-600' : 'text-gray-600'
                          )}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        className="mr-2 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        onClick={() => {
                          saveRating(question.id, -1)
                        }}
                      >
                        <span className="sr-only">Up vote</span>
                        <HandThumbDownIcon
                          className={clsx(
                            'h-6 w-6',
                            question.rating < 0 ? 'text-red-600' : 'text-gray-600'
                          )}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        onClick={() => setOpen(false)}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="p-8">
                      {question?.escalation && (
                        <Alert
                          title="This user escalated this message to support"
                          type="info"
                          className="rounded-t-lg"
                        />
                      )}
                      <div className="flex-inline p-0">
                        <h2 className="text-wrap flex items-center text-sm font-medium text-gray-400">
                          <img
                            className="mr-1 inline-block h-5 w-5 rounded-full"
                            src={`https://api.dicebear.com/6.x/personas/svg?seed=${question.alias}?size=24&backgroundType=gradientLinear,solid&backgroundColor=FDE7E4,FFE8EF,FCF2FF,EBDFFF,EEF1FF,EAF5FF,E9FDFF,ECFFF6,F0FFE9,FFFDEE,FFF5DD,FFD9C9,EDEDED,FFFFFF,B3B3B3`}
                            alt="User avatar"
                          />
                          {question.alias} asked
                          {question.metadata?.referrer ? ` from ${question.metadata.referrer}` : ''}
                          :
                        </h2>
                        {ipFilter === null && question.ip !== undefined && (
                          <button
                            type="button"
                            className="ml-5 flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                            onClick={() => {
                              updateIPFilter(question.ip, question.alias)
                            }}
                          >
                            <AdjustmentsHorizontalIcon
                              className="m-auto h-4 w-4"
                              aria-hidden="true"
                            />
                            <span className="m-auto hidden pl-1 text-xs text-gray-400 sm:block">
                              Filter to user
                            </span>
                          </button>
                        )}
                      </div>
                      <h2 className="text-xl font-medium text-gray-900">{question.question}</h2>
                      {question.standaloneQuestion &&
                        question.standaloneQuestion.trim() !== question.answer.trim() &&
                        question.standaloneQuestion.trim() !== question.question.trim() && (
                          <h3 className="mb-1 mt-1 text-sm text-gray-800">
                            Standalone Question:{' '}
                            <span className="font-semibold text-gray-900">
                              {question.standaloneQuestion}
                            </span>
                          </h3>
                        )}
                      <div
                        className="prose mt-2 w-full max-w-none border-t border-gray-200 pt-2"
                        dangerouslySetInnerHTML={{ __html: answerHtml }}
                      />

                      <ModalQA
                        team={team}
                        botId={bot.id}
                        question={question}
                        open={qaOpen}
                        setOpen={setQAOpen}
                      />
                      {question.sources.length > 0 && (
                        <>
                          <h3 className="mt-2 text-base font-medium text-gray-700">
                            Used Sources:
                          </h3>
                          {question.sources.map((source, index) => (
                            <FullSource key={index} source={source} />
                          ))}
                        </>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </>
    )
  }

  const ShortAnswer = ({ answer }) => {
    const [shortAnswer, setShortAnswer] = useState(answer)

    useEffect(() => {
      if (answer.length > 300) {
        setShortAnswer(answer.substring(0, 300) + '...')
      }
    }, [answer])

    return <>{shortAnswer}</>
  }

  const updateIPFilter = (ip, alias) => {
    setIPFilter(ip)
    setIPAlias(alias)
  }

  return (
    <div className="mx-0 mt-4 rounded-lg bg-white p-4 shadow-lg lg:p-8">
      <div className="px-0">
        <div className="space-x-0 space-y-4 lg:flex lg:items-end lg:space-x-8">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold leading-6 text-gray-900">Questions</h1>
            <p className="mt-2 text-sm text-gray-700">
              A log of the recent questions you or users have asked your bot.
            </p>
          </div>
          <QuestionFilters
            filters={filters}
            setFilters={setFilters}
            filterOptions={filterOptions}
          />
          <Paginator
            perPage={questions.pagination.perPage}
            totalCount={questions.pagination.viewableCount}
            page={questions.pagination.page}
            changePage={(page) => changePage(page, ipFilter, filters.rating, filters.escalated)}
          />
        </div>
        <div className="mt-4 flex items-center space-x-4 lg:mt-2">
          {ipFilter !== null && (
            <button
              type="button"
              className="flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              onClick={() => {
                updateIPFilter(null, null)
              }}
            >
              <XMarkIcon className="m-auto h-4 w-4" aria-hidden="true" />
              <span className="m-auto flex pl-1 text-xs text-gray-400">
                <UserCircleIcon className="mr-1 h-4 w-4" /> {ipAlias}
              </span>
            </button>
          )}
          {filters.rating !== null && (
            <button
              type="button"
              className="flex items-center rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              onClick={() => {
                setFilters((prevFilters) => {
                  return { ...prevFilters, rating: null }
                })
              }}
            >
              <XMarkIcon className="m-auto h-4 w-4" aria-hidden="true" />
              <span className="m-auto flex pl-1 text-xs text-gray-400">
                {filterOptions[0].options.find((option) => option.value === filters.rating).label}
              </span>
            </button>
          )}
          {filters.escalated !== null && (
            <button
              type="button"
              className="flex items-center rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              onClick={() => {
                setFilters((prevFilters) => {
                  return { ...prevFilters, escalated: null }
                })
              }}
            >
              <XMarkIcon className="m-auto h-4 w-4" aria-hidden="true" />
              <span className="m-auto flex pl-1 text-xs text-gray-400">
                {
                  filterOptions[1].options.find((option) => option.value === filters.escalated)
                    .label
                }
              </span>
            </button>
          )}
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-2 -my-2">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-16 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="sticky top-16 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell sm:pl-0"
                    >
                      Question
                    </th>
                    <th
                      scope="col"
                      className="sticky top-16 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                    >
                      Answer
                    </th>
                    <th
                      scope="col"
                      className="sticky top-16 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                    >
                      Sources
                    </th>
                    <th
                      scope="col"
                      className="sticky top-16 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                    >
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {questions.questions.map((question, questionIdx) => {
                    return (
                      <tr
                        key={question.id}
                        className={clsx(
                          questionIdx +
                            questions.pagination.perPage * questions.pagination.page +
                            BLUR_LIMIT_COUNT >=
                            questions.pagination.planLimit && blurEnabled
                            ? 'blur-sm'
                            : 'hover:bg-gray-50',
                          question.testing ? 'bg-gray-50' : ''
                        )}
                      >
                        <td
                          className={clsx(
                            questionIdx !== questions.length - 1 ? 'border-b border-gray-200' : '',
                            'hidden text-sm text-gray-500 lg:table-cell'
                          )}
                        >
                          <Answer {...{ question, questionIdx }}>
                            <div className="flex items-center">
                              <img
                                className="inline-block h-9 w-9 rounded-full"
                                src={`https://api.dicebear.com/6.x/personas/svg?seed=${question.alias}?size=36&backgroundType=gradientLinear,solid&backgroundColor=FDE7E4,FFE8EF,FCF2FF,EBDFFF,EEF1FF,EAF5FF,E9FDFF,ECFFF6,F0FFE9,FFFDEE,FFF5DD,FFD9C9,EDEDED,FFFFFF,B3B3B3                              `}
                                alt="User avatar"
                              />
                              {question.testing && (
                                <span className="ml-2 flex items-center text-xs text-gray-400">
                                  <UserGroupIcon
                                    className="mr-1 h-4 w-4 text-gray-500"
                                    title="Staff testing"
                                  />
                                  Staff
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-xs">{question.alias}</p>
                          </Answer>
                        </td>
                        <td
                          className={clsx(
                            questionIdx !== questions.length - 1 ? 'border-b border-gray-200' : '',
                            'max-w-xs overflow-hidden break-words text-sm font-medium text-gray-700 sm:pl-0 lg:table-cell'
                          )}
                        >
                          <Answer {...{ question, questionIdx }}>
                            <p>
                              {question.standaloneQuestion &&
                              question.standaloneQuestion != question.answer &&
                              bot.language == 'en'
                                ? question.standaloneQuestion
                                : question.question}
                            </p>
                            <span className="mt-2 hidden text-xs text-gray-400 sm:block">
                              <LocaleDateTime date={question.createdAt} />
                            </span>
                            <dl className="font-normal lg:hidden">
                              <dt className="sr-only">Answer</dt>
                              <dd className="mt-1 text-sm text-gray-600">
                                <ShortAnswer answer={question.answer} />
                              </dd>
                              <dt className="sr-only">Sources</dt>
                              <dd className="mt-2 text-gray-500">
                                <Sources sources={question.sources} />
                              </dd>
                            </dl>
                          </Answer>
                        </td>
                        <td
                          className={clsx(
                            questionIdx !== questions.length - 1 ? 'border-b border-gray-200' : '',
                            'hidden break-words text-sm text-gray-500 lg:table-cell'
                          )}
                        >
                          <Answer {...{ question, questionIdx }}>
                            <ShortAnswer answer={question.answer} />
                          </Answer>
                        </td>
                        <td
                          className={clsx(
                            questionIdx !== questions.length - 1 ? 'border-b border-gray-200' : '',
                            'hidden truncate text-sm text-gray-500 lg:table-cell'
                          )}
                        >
                          <Answer {...{ question, questionIdx }}>
                            <Sources sources={question.sources} />
                          </Answer>
                        </td>
                        <td
                          className={clsx(
                            questionIdx !== questions.length - 1 ? 'border-b border-gray-200' : '',
                            'hidden whitespace-nowrap text-sm text-gray-500 lg:table-cell'
                          )}
                        >
                          <Answer {...{ question, questionIdx }}>
                            <Rating rating={question.rating} escalation={question?.escalation} />
                          </Answer>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="relative">
                  {blurEnabled && (
                    <div className="left-50 absolute bottom-0 mb-0 w-full sm:mb-24 md:mb-24 lg:mb-20 xl:mb-0">
                      <div className="py-4">
                        <Checkout team={team}>
                          <p className="mb-4 text-center text-gray-700">
                            ... and{' '}
                            {questions.pagination.totalCount -
                              questions.pagination.planLimit +
                              BLUR_LIMIT_COUNT}{' '}
                            more questions
                          </p>
                          <h3 className="text-3xl font-bold">View full chat history</h3>
                          <p className="mb-8 text-center text-gray-700">
                            Upgrade to the Premium plan or higher to unlock the full chat history of
                            your users to help you improve your documentation and products. View{' '}
                            <Link href="/#pricing" target="_blank" className="underline">
                              plan details
                            </Link>
                            .
                          </p>
                        </Checkout>
                      </div>
                    </div>
                  )}
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center md:justify-end">
          <Paginator
            perPage={questions.pagination.perPage}
            totalCount={questions.pagination.viewableCount}
            page={questions.pagination.page}
            changePage={changePage}
          />
        </div>
      </div>
    </div>
  )
}
