import { Fragment, useState, useEffect, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  TrashIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  CircleStackIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline'
import SourceDelete from '@/components/SourceDelete'
import Alert from '@/components/Alert'
import LoadingSpinner from '@/components/LoadingSpinner'
import BadgeStatusSource from '@/components/BadgeStatusSource'
import ModalCheckout from '@/components/ModalCheckout'
import ScheduleSelect from '@/components/ScheduleSelect'
import { canSourceTypeSchedule, canSourceTypeDownload } from '@/constants/sourceTypes.constants'
import QAForm from '@/components/QAForm'
import Link from 'next/link'

export default function ModalSource({
  team,
  bot,
  source,
  setSources,
  children,
  defaultOpen = false
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [toDelete, setToDelete] = useState(null)
  const [infoText, setInfoText] = useState(null)
  const [errorText, setErrorText] = useState(null)
  const [scheduleInterval, setScheduleInterval] = useState(source?.scheduleInterval ?? 'none')
  const [submitting, setSubmitting] = useState(false)
  const [showInterval, setShowInterval] = useState(canSourceTypeSchedule(source?.type))
  const [locked, setLocked] = useState(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [changed, setChanged] = useState(false)
  const [questions, setQuestions] = useState(source?.faqs ?? [])

  const fetchSourceDetails = async () => {
    if (source.id) {
      const response = await fetch(`/api/teams/${team.id}/bots/${bot.id}/sources/${source.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      if (response.ok) {
        const sourceData = await response.json()
        setSources((sources) => sources.map((s) => (s.id === sourceData.id ? sourceData : s)))
      }
    }
  }

  //when opening modal, fetch source details
  useEffect(() => {
    if (open) {
      fetchSourceDetails()
    }
  }, [open])
  
  useEffect(() => {
    setOpen(defaultOpen)
  }, [defaultOpen])

  useEffect(() => {
    setQuestions(source?.faqs ?? [])
  }, [source, source?.faqs])

  const downloadSource = async () => {
    const response = await fetch(
      source?.type == 'qa'
        ? `/api/teams/${team.id}/bots/${bot.id}/sources/${source?.id}/export-qa`
        : `/api/teams/${team.id}/bots/${bot.id}/sources/${source?.id}/download`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    if (response.ok) {
      // we get a signed url back
      const { url } = await response.json()
      var link = document.createElement('a')
      link.href = url
      link.download = url.substring(url.lastIndexOf('/') + 1).split('?')[0]
      link.target = '_blank'
      link.click()
      link.remove()
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
    }
  }

  const updateSource = async () => {
    setErrorText('')
    setSubmitting(true)
    const response = await fetch(
      `/api/teams/${team.id}/bots/${bot.id}/sources/${source?.id}/reingest`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduleInterval }),
      }
    )
    if (response.ok) {
      const { newScheduled } = await response.json()
      setSources((sources) =>
        sources.map((s) => (s.id === source?.id ? { ...source, scheduled: newScheduled } : s))
      )
      setSubmitting(false)
    } else {
      try {
        const data = await response.json()
        if (data.message.includes('upgrade')) {
          setShowUpgrade(true)
          setScheduleInterval(source?.scheduleInterval ?? 'none')
        } else {
          setErrorText(data.message || 'Something went wrong, please try again.')
        }
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
      setSubmitting(false)
    }
  }

  const patchSource = async () => {
    if (questions.length === 0) {
      setErrorText('Please add at least one question and answer.')
      return
    }

    // make sure they have content
    for (const q of questions) {
      if (!q.question || !q.answer || q.question.length === 0 || q.answer.length === 0) {
        setErrorText('Please fill out all questions and answers.')
        return
      }
    }

    setErrorText('')
    setSubmitting(true)
    const response = await fetch(
      `/api/teams/${team.id}/bots/${bot.id}/sources/${source?.id}/reingest`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faqs: questions }),
      }
    )
    if (response.ok) {
      const data = await response.json()

      // update source
      setSources((sources) => sources.map((s) => (s.id === data.id ? data : s)))
      setSubmitting(false)
      setOpen(false)
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
      setSubmitting(false)
    }
  }

  const refreshSource = async () => {
    setErrorText('')
    const response = await fetch(
      `/api/teams/${team.id}/bots/${bot.id}/sources/${source?.id}/reingest`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    if (response.ok) {
      const { newScheduled } = await response.json()
      setSources((sources) =>
        sources.map((s) =>
          s.id === source?.id ? { ...source, status: 'pending', scheduled: newScheduled } : s
        )
      )
      setOpen(false)
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
    }
  }

  useEffect(() => {
    setLocked(null)
    if (source?.status === 'failed') {
      setErrorText('Refresh Failed: ' + (source?.error || 'Unknown error'))
    } else if (source?.status !== 'ready') {
      setLocked('This source is currently being processed. Please wait.')
    }

    setShowInterval(canSourceTypeSchedule(source?.type))
  }, [source])

  const carbonIcon = (type) => {
    switch (type) {
      case 'NOTION':
        return <DocumentIcon className="mr-1 h-4 w-4 flex-none" aria-hidden="true" />
      case 'NOTION_DATABASE':
        return <CircleStackIcon className="mr-1 h-4 w-4 flex-none" aria-hidden="true" />
      case 'GOOGLE_DOCS':
        return <DocumentTextIcon className="mr-1 h-4 w-4 flex-none" aria-hidden="true" />
      case 'GOOGLE_SLIDES':
        return <PresentationChartBarIcon className="mr-1 h-4 w-4 flex-none" aria-hidden="true" />
      case 'GOOGLE_SHEETS':
        return <TableCellsIcon className="mr-1 h-4 w-4 flex-none" aria-hidden="true" />
      case 'INTERCOM':
        return <DocumentIcon className="mr-1 h-4 w-4 flex-none" aria-hidden="true" />
      case 'DROPBOX':
        return <DocumentIcon className="mr-1 h-4 w-4 flex-none" aria-hidden="true" />
      default:
        return <DocumentIcon className="mr-1 h-4 w-4 flex-none" aria-hidden="true" />
    }
  }

  return (
    <>
      <ModalCheckout team={team} open={showUpgrade} setOpen={setShowUpgrade} />
      <a
        type="button"
        className="m-0 block cursor-pointer"
        disabled={source?.status !== 'ready'}
        onClick={() => setOpen(true)}
      >
        {children}
      </a>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {
          setOpen(false)
        }}>
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
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:flex">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                      onClick={() => {
                        setOpen(false)
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="rounded-lg bg-white p-8 shadow">
                    <div className="pb-2">
                      <h3 className="inline-flex text-2xl font-bold">
                        {source?.title ?? source?.url}
                      </h3>
                      <h1 className="flex-end inline-flex pl-2 text-sm font-medium text-gray-500">
                        {source?.type.toUpperCase()}
                      </h1>
                    </div>
                    <div className="items-center justify-between text-center sm:flex">
                      {
                        source && <BadgeStatusSource source={source} />
                      }
                      <h1 className="flex-end text-sm font-medium text-gray-500">
                        {source?.pageCount.toString()} Pages
                      </h1>
                      <h1 className="flex-end text-sm font-medium text-gray-500">
                        {(showInterval ? 'Updated: ' : 'Created: ') +
                          new Date(source?.createdAt).toUTCString()}
                      </h1>
                    </div>
                    <Alert title={errorText} type="warning" />
                    {source?.faqs && (
                      <>
                        <QAForm
                          questions={questions}
                          setQuestions={(v) => {
                            setChanged(true)
                            setQuestions(v)
                          }}
                        />
                        <div className="flex flex-shrink-0 items-end justify-end">
                          <button
                            disabled={submitting || !changed}
                            onClick={patchSource}
                            className="ml-4 inline-flex items-center justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-75"
                          >
                            {submitting && <LoadingSpinner className="mr-3" />}
                            Save
                          </button>
                        </div>
                      </>
                    )}
                    <Alert title={infoText} type="info" />
                    {showInterval && (
                      <>
                        <Alert title={locked} type="info" />
                        <div className="mt-4 max-w-sm justify-start">
                          <ScheduleSelect
                            team={team}
                            onSelect={setScheduleInterval}
                            defaultSelected={scheduleInterval}
                          />
                          <h1 className="flex-end inline-flex pl-0.5 text-sm font-medium text-gray-500">
                            {source?.scheduled
                              ? 'Refresh scheduled for ' + new Date(source?.scheduled).toUTCString()
                              : 'This source will not be refreshed.'}
                          </h1>
                        </div>
                      </>
                    )}
                    <SourceDelete
                      team={team}
                      bot={bot}
                      source={toDelete}
                      setToDelete={setToDelete}
                      setErrorText={setErrorText}
                      setSources={setSources}
                    />
                    {source?.indexedUrls?.length > 0 && (
                      <>
                        <h2 className="mt-6 pb-2 text-sm font-medium text-gray-600">
                          Indexed URLs{' '}
                          <em className="text-sm text-slate-500">({source?.indexedUrls.length})</em>:
                        </h2>
                        <div className="border-1 max-h-96 overflow-y-scroll rounded-md border-solid border-slate-200 bg-slate-100 p-2">
                          <ul role="list" className="space-y-2">
                            {source?.indexedUrls.map((item, index) => (
                              <li
                                key={index + item.source}
                                className="overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md bg-white px-4 py-1 shadow"
                              >
                                <Link
                                  href={item.source || ''}
                                  target="_blank"
                                  className="block w-full text-sm"
                                >
                                  <em className="text-slate-600">{item.source}</em>
                                  <br />
                                  {item.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    {source?.carbonFiles && source?.carbonFiles?.length > 0 && (
                      <>
                        <h2 className="mt-6 pb-2 text-sm font-medium text-gray-600">
                          Indexed Documents{' '}
                          <em className="text-sm text-slate-500">({source?.carbonFiles.length})</em>:
                        </h2>
                        <div className="border-1 max-h-96 overflow-y-scroll rounded-md border-solid border-slate-200 bg-slate-100 p-2">
                          <ul role="list" className="grid grid-cols-2 space-x-2 space-y-2">
                            {source?.carbonFiles.map((item) => (
                              <li
                                key={item.id}
                                className=" rounded-md bg-white px-4 shadow first:ml-2 first:mt-2"
                              >
                                <Link
                                  href={item.url}
                                  target="_blank"
                                  className="flex w-full items-center justify-start overflow-hidden overflow-ellipsis whitespace-nowrap text-sm"
                                >
                                  {carbonIcon(item.type)} {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    {source?.warnsList?.length > 0 && (
                      <>
                        <h2 className="mt-6 pb-2 text-sm font-medium text-gray-600">Warnings:</h2>
                        <div className="rounded-md border-2 border-solid border-slate-200 bg-slate-100">
                          <pre className="whitespace-pre-wrap p-2 font-mono text-sm text-orange-600">
                            {source?.warnsList.join('\n')}
                          </pre>
                        </div>
                      </>
                    )}
                    {!toDelete && (
                      <div className="mb-2 mt-6 flex items-end justify-between">
                        <div className="items-middle flex flex-shrink-0 justify-end">
                          {(source?.status === 'ready' || source?.status === 'failed') && (
                            <button
                              type="button"
                              className="flex items-center rounded-md bg-white text-sm text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              onClick={() => setToDelete(source)}
                            >
                              <TrashIcon className="mr-1 h-4 w-4" aria-hidden="true" /> Delete
                            </button>
                          )}
                          {source?.type === 'url' && (
                            <Link
                              target="_blank"
                              href={source?.url}
                              className="my-1 ml-4 text-xs text-slate-600 hover:underline"
                            >
                              {source?.url}
                            </Link>
                          )}
                          {(canSourceTypeDownload(source?.type) || 'qa' == source?.type) && (
                            <button
                              type="button"
                              className="ml-2 flex items-center rounded-md bg-white text-sm text-slate-600 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                              onClick={downloadSource}
                            >
                              <ArrowDownTrayIcon className="mr-1 h-4 w-4" aria-hidden="true" />{' '}
                              Download
                            </button>
                          )}
                        </div>
                        {showInterval && (
                          <div className="flex flex-shrink-0 items-end justify-end">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-75"
                              onClick={refreshSource}
                              disabled={submitting || locked !== null}
                            >
                              <ArrowPathIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                              Refresh
                            </button>
                            <button
                              disabled={submitting || locked !== null}
                              onClick={updateSource}
                              className="ml-4 inline-flex items-center justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-75"
                            >
                              {submitting && <LoadingSpinner className="mr-3" />}
                              Save
                            </button>
                          </div>
                        )}
                      </div>
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
