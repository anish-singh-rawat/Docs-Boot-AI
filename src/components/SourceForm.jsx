import { useEffect, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { sourceTypes } from '@/constants/sourceTypes.constants'
import {
  PlusIcon,
  LinkIcon,
  DocumentArrowUpIcon,
  PaperClipIcon,
  DocumentPlusIcon,
} from '@heroicons/react/24/outline'
import { ref, uploadBytesResumable } from 'firebase/storage'
import LoadingSpinner from '@/components/LoadingSpinner'
import Alert from '@/components/Alert'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, storage } from '@/config/firebase-ui.config'
import { stripePlan } from '@/utils/helpers'
import ModalCheckout from '@/components/ModalCheckout'
import classNames from '@/utils/classNames'
import ScheduleSelect from '@/components/ScheduleSelect'
import QAForm from '@/components/QAForm'
import { CarbonConnect } from 'carbon-connect'

export default function SourceForm({ team, bot, sources, setSources, setOpenSourceID }) {
  const [showForm, setShowForm] = useState(bot.sourceCount === 0) //show form if bot has no sources
  const [selectedSourceType, setSelectedSourceType] = useState(null)
  const [user] = useAuthState(auth)
  // State to store uploaded file
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [percent, setPercent] = useState(0)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [errorText, setErrorText] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [validated, setValidated] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [urlDescription, setUrlDescription] = useState(null)
  const [scheduleInterval, setScheduleInterval] = useState('none')
  const [questions, setQuestions] = useState([{ question: '', answer: '' }])
  const [carbonId, setCarbonId] = useState(null)
  const [carbonFiles, setCarbonFiles] = useState(null)

  useEffect(() => {
    if (showForm && stripePlan(team).pages <= team.pageCount) {
      setShowForm(false)
      setShowUpgrade(true)
    }
  }, [showForm])

  //validate fields
  useEffect(() => {
    if (selectedSourceType) {
      let valid = true
      if (selectedSourceType.fieldUrl === 'required' && !url) {
        valid = false
      }
      if (selectedSourceType.fieldFile === 'required' && !file) {
        valid = false
      }
      if (selectedSourceType.fieldTitle === 'required' && !title) {
        valid = false
      }

      if (selectedSourceType.fieldQA === 'required') {
        // sanity check faqs
        if (questions.length) {
          if (!Array.isArray(questions)) {
            valid = false
          }

          try {
            questions.forEach((QA) => {
              if (!QA.question || !QA.answer) {
                throw new Error()
              }
            })
          } catch (error) {
            valid = false
          }
        } else {
          valid = false
        }
      }

      setValidated(valid)
    } else {
      setValidated(false)
    }

    if (selectedSourceType?.id === 'rss') {
      setUrlDescription('URL of the RSS feed to learn from.')
    } else if (selectedSourceType?.id === 'sitemap') {
      setUrlDescription('URL of the site to crawl for all discovered sitemaps.')
    } else {
      setUrlDescription('Clickable URL of source link displayed with answers.')
    }
  }, [selectedSourceType, url, file, title, questions])

  const carbonTokenFetcher = async () => {
    const response = await fetch(`/api/teams/${team.id}/bots/${bot.id}/fetchCarbonTokens`)
    const data = await response.json()

    // carbon expects the full promise response
    return data
  }

  const carbonOnSuccess = async (response) => {
    console.log('OnSuccess callback called!', response)
    if (!response.data || !response.data?.files || !response.data?.files?.length) {
      return
    }

    let carbon;
    if (response.data.data_source_external_id.includes('|')) { //new format
      carbon = response.data.data_source_external_id.split('|');
    } else if (response.data.data_source_external_id.includes('-')) {
      carbon = response.data.data_source_external_id.split('-');
    }
    setTitle('Account: ' + carbon[1]);
    setCarbonId(carbon[1]);
    setCarbonFiles(response.data.files)
  }

  // create carbon source automatically
  useEffect(() => {
    if (carbonId && title) {
      createSource()
    }
  }, [carbonId, title])

  async function createSource() {
    if (!validated) {
      setErrorText('Please complete required fields.')
      return
    }
    setErrorText('')
    setIsUpdating(true)

    const urlParams = ['teams', team.id, 'bots', bot.id, 'sources']
    const apiPath = '/api/' + urlParams.join('/')

    const response = await fetch(apiPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: selectedSourceType.id,
        title,
        url,
        file,
        scheduleInterval,
        faqs: questions,
        carbonId,
      }),
    })
    if (response.ok) {
      const data = await response.json()
      // check if sent source is already in our sources
      //  (this can happen if we added a QA source and we already have a QA source for example)
      const existingSource = sources.find((s) => s.id === data.id)
      if (existingSource) {
        // if so, replace it and open the modal!
        setSources([data, ...sources.filter((s) => s.id !== data.id)])
        // sike, don't open the modal actually
        // setOpenSourceID(data.id)
      } else {
        setSources([data, ...sources])
      }
      setFile(null)
      setFileName(null)
      setUrl(null)
      setTitle('')
      setSelectedSourceType(null)
      setValidated(false)
      setIsUpdating(false)
      setPercent(0)
      setShowForm(false)
      setScheduleInterval('none')
    } else {
      try {
        const data = await response.json()
        if (data.message.includes('upgrade')) {
          setShowUpgrade(true)
        } else {
          setErrorText(data.message || 'Something went wrong, please try again.')
        }
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
      setIsUpdating(false)
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      setPercent(0)
      setIsUploading(true)
      setFileName(file.name)
      if (!title) {
        setTitle(file.name)
      }

      //upload to firebase cloud storage
      const filepath = `user/${user.uid}/team/${team.id}/bot/${bot.id}/${file.name}`
      const storageRef = ref(storage, filepath)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) // update progress
          setPercent(percent)
        },
        (err) => () => {
          console.warn(err)
          setErrorText(
            'Error uploading file, please try again. If the problem persists, try logging out then back in again.'
          )
          setIsUploading(false)
          setFileName(null)
        },
        () => {
          setFile(filepath)
          setIsUploading(false)
        }
      )
    }
  }

  if (showForm) {
    return (
      <>
        <ModalCheckout team={team} open={showUpgrade} setOpen={setShowUpgrade} />
        <p className="text-md mb-2 ml-2 mt-8 text-gray-800">
          Add any content sources you want your bot to be able to answer questions about. You can
          always add more later on.
        </p>
        <div className="mb-4 rounded-lg bg-white px-4 py-4 shadow sm:px-6">
          <Alert title={errorText} type="error" />

          {!selectedSourceType ? (
            <RadioGroup
              value={selectedSourceType}
              onChange={(e) => {
                if (e.isPro && stripePlan(team).name === 'Free') {
                  setShowUpgrade(true)
                  return
                } else {
                  setSelectedSourceType(e)
                }
              }}
            >
              <RadioGroup.Label className="text-sm font-medium text-gray-700">
                Source type
              </RadioGroup.Label>

              <div className="mt-2 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 xl:grid-cols-4">
                {sourceTypes.map((sourceType) => (
                  <RadioGroup.Option
                    key={sourceType.id}
                    value={sourceType}
                    disabled={sourceType.coming || isUpdating}
                    className={({ checked, active }) =>
                      classNames(
                        checked ? 'border-transparent' : 'border-gray-300',
                        active ? 'border-cyan-500 ring-2 ring-cyan-500' : '',
                        'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none',
                        sourceType.coming ? 'opacity-50' : ''
                      )
                    }
                  >
                    {({ checked, active }) => (
                      <>
                        <span className="mr-2 flex-shrink-0 items-center">
                          <sourceType.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                        </span>
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <RadioGroup.Label
                              as="span"
                              className="block text-sm font-medium text-gray-900"
                            >
                              {sourceType.title}
                              {sourceType.isPro &&
                                !sourceType.coming &&
                                stripePlan(team).name === 'Free' && (
                                  <span className="ml-4 inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                                    Paid
                                  </span>
                                )}
                              {sourceType.coming && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                  Coming soon
                                </span>
                              )}
                            </RadioGroup.Label>
                            <RadioGroup.Description
                              as="span"
                              className="mt-1 flex items-center text-sm text-gray-500"
                            >
                              {sourceType.description}
                            </RadioGroup.Description>
                          </span>
                        </span>
                        <CheckCircleIcon
                          className={classNames(
                            !checked ? 'invisible' : '',
                            'h-5 w-5 text-cyan-600'
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={classNames(
                            active ? 'border' : 'border-2',
                            checked ? 'border-cyan-500' : 'border-transparent',
                            'pointer-events-none absolute -inset-px rounded-lg'
                          )}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="col text-sm text-gray-600">
                <h3 className="mb-4 inline-flex items-center text-xl font-medium text-gray-800">
                  <selectedSourceType.icon
                    className="mr-2 h-6 w-6 text-gray-400"
                    aria-hidden="true"
                  />
                  {selectedSourceType?.title}
                </h3>
                <p>{selectedSourceType?.fullDescription || selectedSourceType?.description}</p>
                {selectedSourceType?.id === 'csv' && (
                  <a href="/csv-import-template.csv" download={true} className="underline">
                    Download CSV template
                  </a>
                )}
                {selectedSourceType?.id === 'document' && (
                  <a href="/infinite-uploads.pdf" download={true} className="underline">
                    Download an example PDF document
                  </a>
                )}
                {selectedSourceType?.id === 'urls' && (
                  <a href="/urls-import-template.csv" download={true} className="underline">
                    Download an example CSV urls file
                  </a>
                )}
              </div>
              <div className="col">
                {selectedSourceType?.fieldUrl && (
                  <div className="mb-4">
                    <div className="flex justify-between">
                      <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                        Source URL
                      </label>
                      <span className="text-sm capitalize text-gray-500">
                        {selectedSourceType.fieldUrl}
                      </span>
                    </div>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="url"
                        name="url"
                        id="url"
                        value={url}
                        disabled={isUpdating}
                        onChange={(e) => setUrl(e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                        placeholder={
                          selectedSourceType?.id === 'sitemap'
                            ? 'https://example.com/'
                            : 'https://example.com/page/'
                        }
                        aria-describedby="url-description"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500" id="url-description">
                      {urlDescription}
                    </p>
                  </div>
                )}
                {selectedSourceType?.fieldTitle && (
                  <div className="mb-4">
                    <div className="flex justify-between">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Source title
                      </label>
                      <span className="text-sm capitalize text-gray-500">
                        {selectedSourceType.fieldTitle}
                      </span>
                    </div>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={title}
                        disabled={isUpdating}
                        onChange={(e) => setTitle(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                        placeholder=""
                        aria-describedby="title-description"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500" id="title-description">
                      Title of source displayed alongside answers. Defaults to page title or file
                      name.
                    </p>
                  </div>
                )}

                {selectedSourceType?.fieldQA && (
                  <QAForm questions={questions} setQuestions={setQuestions} />
                )}

                {selectedSourceType?.fieldFile && (
                  <div>
                    <div className="flex justify-between">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Source file
                      </label>
                      <span className="text-sm capitalize text-gray-500">
                        {selectedSourceType.fieldFile}
                      </span>
                    </div>
                    {file || isUploading ? (
                      <div className="mt-1">
                        <div
                          className={classNames(
                            file
                              ? 'border-cyan-500 text-cyan-600'
                              : 'border-gray-300 text-gray-500',
                            'flex items-center justify-between rounded-md border-2 bg-gray-50 px-6 py-4 text-lg shadow-sm'
                          )}
                        >
                          <div className="flex items-center">
                            <PaperClipIcon className="mr-4 h-6 w-6" aria-hidden="true" />
                            {fileName}
                          </div>
                          {isUploading && (
                            <p className="flex items-center text-sm">
                              <LoadingSpinner /> Uploading ({percent}%)
                            </p>
                          )}
                          {file && <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />}
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="file-upload"
                        className={classNames(
                          'mt-1 flex cursor-pointer justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5 text-center hover:border-gray-400'
                        )}
                      >
                        <div className="space-y-1 text-center">
                          <DocumentArrowUpIcon
                            className="mx-auto h-12 w-12 text-gray-300"
                            aria-hidden="true"
                          />
                          <div className="text-sm text-gray-600">
                            Upload your source file
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept={Object.values(selectedSourceType?.fileTypes).join(',')}
                              onChange={handleFileChange}
                              className="sr-only"
                              disabled={isUploading || file || isUpdating}
                            />
                          </div>
                          <p className="text-xs uppercase text-gray-500">
                            {Object.keys(selectedSourceType?.fileTypes).join(', ')}
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                )}
                {selectedSourceType?.fieldSchedule && (
                  <div className="mt-4 justify-start">
                    <ScheduleSelect
                      team={team}
                      onSelect={setScheduleInterval}
                      defaultSelected={scheduleInterval}
                      disabled={isUpdating}
                    />
                    <p className="mt-2 text-sm text-gray-500" id="title-description">
                      This will automatically refresh the source at the selected interval.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="mb-2 mt-6 flex flex-shrink-0 items-end justify-end">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              onClick={() => {
                setFile(null)
                setCarbonFiles(null)
                if (selectedSourceType) {
                  setSelectedSourceType(null)
                } else {
                  setShowForm(false)
                  setSelectedSourceType(null)
                }
              }}
              disabled={isUpdating}
            >
              Cancel
            </button>

            {selectedSourceType?.isCarbon ? (
              <CarbonConnect
                tokenFetcher={carbonTokenFetcher}
                orgName="DocsBot AI"
                brandIcon="/.well-known/logo.png"
                primaryBackgroundColor="#0891B2"
                primaryTextColor="#FFFFFF"
                secondaryBackgroundColor="#FFFFFF"
                onSuccess={carbonOnSuccess}
                onError={(error) => console.warn(error)}
                tags={{ botId: bot.id, teamId: team.id }}
                entryPoint={selectedSourceType?.isCarbon}
                enabledIntegrations={[
                  {
                    id: selectedSourceType?.isCarbon,
                    chunkSize: 500,
                    overlapSize: 50,
                  },
                ]}
              >
                <button
                  disabled={isUpdating}
                  className="ml-4 inline-flex items-center justify-center space-x-2 rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-75"
                >
                  {isUpdating ? (
                    <>
                      <LoadingSpinner className="mr-3" />
                      <span>Adding {carbonFiles.length} pages</span>
                    </>
                  ) : (
                    <>
                      <selectedSourceType.icon className="h-5 w-5" />
                      <span>Connect to {selectedSourceType?.title}</span>
                    </>
                  )}
                </button>
              </CarbonConnect>
            ) : (
              <button
                disabled={isUpdating || !validated}
                onClick={createSource}
                className="ml-4 inline-flex items-center justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-75"
              >
                {isUpdating ? (
                  <LoadingSpinner className="mr-3" />
                ) : (
                  <PlusIcon className="-ml-1 mr-2 h-6 w-6" aria-hidden="true" />
                )}
                Add source
              </button>
            )}
          </div>
        </div>
      </>
    )
  } else {
    return (
      <>
        <ModalCheckout team={team} open={showUpgrade} setOpen={setShowUpgrade} />
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Add source</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add source content to {bot.name} that you want your bot to be able to answer questions
            about. Don't index the same content multiple times.
          </p>
          <div className="mt-8">
            <button
              className="inline-flex items-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 active:text-white"
              onClick={() => setShowForm(true)}
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Source
            </button>
          </div>
        </div>
      </>
    )
  }
}
