import { useEffect, useState, useCallback } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { stripePlan } from '@/utils/helpers'
import Link from 'next/link'
import ModalCheckout from '@/components/ModalCheckout'
import { i18n } from '@/constants/strings.constants'
import FieldToggle from '@/components/FieldToggle'

export default function FormBot({ team, bot, setBotSettings, disabled, short = false }) {
  const [language, setLanguage] = useState(bot?.language || 'en')
  const [botName, setBotName] = useState(bot?.name || '')
  const [botDescription, setBotDescription] = useState(bot?.description || '')
  const [privacy, setPrivacy] = useState(bot?.privacy || 'public')
  const [model, setModel] = useState(bot?.model || 'gpt-3.5-turbo')
  const [questions, setQuestions] = useState(bot?.questions || [])
  const [rateLimitMessages, setRateLimitMessages] = useState(bot?.rateLimitMessages || 10)
  const [labels, setLabels] = useState(bot?.labels || i18n[bot?.language]?.labels || null)
  const [rateLimitSeconds, setRateLimitSeconds] = useState(bot?.rateLimitSeconds || 60)
  const [rateLimitIPAllowlist, setRateLimitIPAllowlist] = useState(bot?.rateLimitIPAllowlist || [])
  const [rateLimitIPField, setRateLimitIPField] = useState(
    bot?.rateLimitIPAllowlist?.join(', ') || ''
  )
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [recordIP, setRecordIP] = useState(bot?.recordIP || false)

  useEffect(() => {
    setBotSettings({
      language,
      name: botName,
      description: botDescription,
      privacy,
      model,
      questions,
      rateLimitMessages,
      rateLimitSeconds,
      rateLimitIPAllowlist,
      labels,
      recordIP,
    })
  }, [
    language,
    botName,
    botDescription,
    privacy,
    model,
    questions,
    rateLimitMessages,
    rateLimitSeconds,
    rateLimitIPAllowlist,
    labels,
    recordIP,
  ])

  //show upgrade if they change privacy to private
  useEffect(() => {
    if (privacy === 'private' && stripePlan(team).name === 'Free') {
      setShowUpgrade(true)
      setPrivacy('public')
    }
  }, [privacy])

  //show upgrade if they change model to gpt-4
  useEffect(() => {
    if ((model === 'gpt-4' || model === 'gpt-4-1106-preview') && stripePlan(team).name === 'Free') {
      setShowUpgrade(true)
      setModel('gpt-3.5-turbo')
    }
  }, [model])

  const updateQuestion = (index, newQuestion) => {
    setQuestions((questions) => {
      const newQuestions = [...questions]
      newQuestions[index] = newQuestion
      return newQuestions
    })
  }

  const removeQuestion = (index) => {
    setQuestions((questions) => {
      const newQuestions = [...questions]
      newQuestions.splice(index, 1)
      return newQuestions
    })
  }

  const addQuestion = () => {
    setQuestions((questions) => {
      const newQuestions = [...questions]
      newQuestions.push('')
      return newQuestions
    })
  }

  useEffect(() => {
    //check for valid IPv4 and IPv6 addresses
    const ipArray = rateLimitIPField
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => {
        if (ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
          return true
        } else if (ip.match(/^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)) {
          //does not support shorthand notation
          return true
        }
        return false
      })
    setRateLimitIPAllowlist(ipArray)
  }, [rateLimitIPField])

  const QuestionPrompt = ({ index }) => {
    const [question, setQuestion] = useState(questions[index])

    return (
      <div className="flex items-start pt-2">
        <div className="w-full text-sm">
          <input
            type="text"
            value={question}
            autoComplete="off"
            onChange={(e) => setQuestion(e.target.value)}
            onBlur={(e) => {
              updateQuestion(index, e.target.value)
            }}
            placeholder={`What is ${bot.name}?`}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-600 focus:ring-cyan-600 sm:text-sm"
          />
        </div>
        <div className="m-auto flex items-center text-center">
          <button
            type="button"
            className="ml-1 flex h-5 w-5 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => removeQuestion(index)}
          >
            <span className="sr-only">Remove question: {question}</span>
            <XMarkIcon className="h-5 w-5 text-gray-700" aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <ModalCheckout team={team} open={showUpgrade} setOpen={setShowUpgrade} />
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-900">
          Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="project-name"
            id="project-name"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            disabled={disabled}
            placeholder="What would you like to call your bot?"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-600 focus:ring-cyan-600 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-900">
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            placeholder="(optional) Describe what your bot will do and how it will be used, e.g. 'Ask me anything about my product!'"
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-600 focus:ring-cyan-600 sm:text-sm"
            value={botDescription}
            disabled={disabled}
            onChange={(e) => setBotDescription(e.target.value)}
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-gray-900">Privacy</legend>
        <div className="mt-2 space-y-2">
          <div className="relative flex items-start">
            <div className="absolute flex h-5 items-center">
              <input
                id="privacy-public"
                name="privacy"
                value="public"
                aria-describedby="privacy-public-description"
                type="radio"
                className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-500"
                checked={privacy === 'public'}
                onChange={() => setPrivacy('public')}
                disabled={disabled}
              />
            </div>
            <div className="pl-7 text-sm">
              <label htmlFor="privacy-public" className="font-medium text-gray-900">
                Public access
              </label>
              <p id="privacy-public-description" className="text-gray-500">
                Allows for embedding on the frontend of websites.
              </p>
            </div>
          </div>
          <div>
            <div className="relative flex items-start">
              <div className="absolute flex h-5 items-center">
                <input
                  id="privacy-private"
                  name="privacy"
                  value="private"
                  aria-describedby="privacy-private-to-project-description"
                  type="radio"
                  className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  checked={privacy === 'private'}
                  onChange={() => setPrivacy('private')}
                  disabled={disabled}
                />
              </div>
              <div className="pl-7 text-sm">
                <label htmlFor="privacy-private" className="font-medium text-gray-900">
                  Private
                  {stripePlan(team).name === 'Free' && (
                    <span className="ml-4 inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                      Paid
                    </span>
                  )}
                </label>
                <p id="privacy-private-description" className="text-gray-500">
                  Authenticated API access only. Good for internal company content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-gray-900">OpenAI Model</legend>
        <div className="mt-2 space-y-2">
          <div className="relative flex items-start">
            <div className="absolute flex h-5 items-center">
              <input
                id="gpt-3.5-turbo"
                name="model"
                value="gpt-3.5-turbo"
                aria-describedby="gpt-3.5-turbo-description"
                type="radio"
                className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-500"
                checked={model === 'gpt-3.5-turbo'}
                onChange={() => setModel('gpt-3.5-turbo')}
                disabled={disabled}
              />
            </div>
            <div className="pl-7 text-sm">
              <label htmlFor="gpt-3.5-turbo" className="font-medium text-gray-900">
                GPT 3.5 Turbo (Latest)
              </label>
              <p id="gpt-3.5-turbo-description" className="text-gray-500">
                The fastest and cheapest (&lt;$0.0025/question) model good for most use cases.
              </p>
            </div>
          </div>
          {!short && (
            <div className="relative flex items-start">
              <div className="absolute flex h-5 items-center">
                <input
                  id="gpt-3.5-turbo-0613"
                  name="model"
                  value="gpt-3.5-turbo-0613"
                  aria-describedby="gpt-3.5-turbo-0613-description"
                  type="radio"
                  className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  checked={model === 'gpt-3.5-turbo-0613'}
                  onChange={() => setModel('gpt-3.5-turbo-0613')}
                  disabled={disabled}
                />
              </div>
              <div className="pl-7 text-sm">
                <label htmlFor="gpt-3.5-turbo-0613" className="font-medium text-gray-500">
                  GPT 3.5 Turbo (Old June 2023 Version)
                </label>
                <p id="gpt-3.5-turbo-0613-description" className="text-gray-500">
                  The previous (&lt;$0.003/question) model retiring June 2024. Not recommended.
                </p>
              </div>
            </div>
          )}

          <div>
            <div className="relative flex items-start">
              <div className="absolute flex h-5 items-center">
                <input
                  id="gpt-4-1106-preview"
                  name="model"
                  value="gpt-4-1106-preview"
                  aria-describedby="gpt-4-1106-preview-description"
                  type="radio"
                  className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  checked={model === 'gpt-4-1106-preview'}
                  onChange={() => setModel('gpt-4-1106-preview')}
                  disabled={disabled || !team.supportsGPT4}
                />
              </div>
              <div className="pl-7 text-sm">
                <label htmlFor="gpt-4-1106-preview" className="font-medium text-gray-900">
                  GPT-4 Turbo (Preview)
                  {stripePlan(team).name === 'Free' && (
                    <span className="ml-4 inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                      Paid
                    </span>
                  )}
                </label>
                <p id="gpt-4-1106-preview-description" className="text-gray-500">
                  Newest (&lt;$0.03/question) model with April 2023 knowledge cutoff for advanced
                  reasoning or content creation needs. Check your rate limits before using for busy
                  bots.
                  {!team.supportsGPT4 && (
                    <Link
                      href="/app/api"
                      className="ml-1 inline-block underline hover:text-gray-800"
                    >
                      Request access
                    </Link>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="relative flex items-start">
              <div className="absolute flex h-5 items-center">
                <input
                  id="gpt-4"
                  name="model"
                  value="gpt-4"
                  aria-describedby="gpt-4-description"
                  type="radio"
                  className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  checked={model === 'gpt-4'}
                  onChange={() => setModel('gpt-4')}
                  disabled={disabled || !team.supportsGPT4}
                />
              </div>
              <div className="pl-7 text-sm">
                <label htmlFor="gpt-4" className="font-medium text-gray-900">
                  GPT-4
                  {stripePlan(team).name === 'Free' && (
                    <span className="ml-4 inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                      Paid
                    </span>
                  )}
                </label>
                <p id="gpt-4-description" className="text-gray-500">
                  Powerful but slower and more expensive (&lt;$0.07/question) model for advanced
                  reasoning or content creation needs.
                  {!team.supportsGPT4 && (
                    <Link
                      href="/app/api"
                      className="ml-1 inline-block underline hover:text-gray-800"
                    >
                      Request access
                    </Link>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <div>
        <label htmlFor="language" className="text-sm font-medium text-gray-900">
          Language
        </label>
        <select
          id="language"
          name="language"
          className="mt-2 block w-1/2 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6"
          defaultValue={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={disabled}
        >
          {Object.keys(i18n).map((key) => (
            <option key={key} value={key}>
              {i18n[key].name}
            </option>
          ))}
        </select>
      </div>

      {!short && (
        <>
          <fieldset id="suggested-questions" aria-describedby="suggested-questions-description">
            <div>
              <legend
                htmlFor="suggested-questions"
                className="block text-sm font-medium text-gray-900"
              >
                Suggested questions
              </legend>
              <p id="suggested-questions-description" className="text-sm text-gray-500">
                A random selection of these sample questions will be shown to users in the chat
                interfaces.
              </p>
              {questions !== undefined &&
                questions.map((_, index) => <QuestionPrompt index={index} key={index} />)}
              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  className="flex items-center justify-center text-cyan-700 hover:text-cyan-900 focus:ring-cyan-600 focus:ring-offset-cyan-50"
                  onClick={() => addQuestion()}
                >
                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                  Add
                </button>
              </div>
            </div>
          </fieldset>

          <div className="border-t border-gray-900/10 pt-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Rate Limiting
              {stripePlan(team).bots < 100 && (
                <span className="ml-4 inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                  Business Plan
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Rate limiting is a way to prevent abuse of your bot and excessive OpenAI usage costs.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-1 sm:col-start-1">
                <label
                  htmlFor="rateLimitMessages"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Messages
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    min={1}
                    name="rateLimitMessages"
                    id="rateLimitMessages"
                    value={rateLimitMessages}
                    onChange={(e) => setRateLimitMessages(e.target.value)}
                    disabled={disabled || stripePlan(team).bots < 100}
                    aria-describedby="rateLimitMessages-description"
                    className="block w-full rounded-md border-0 py-1.5 text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500" id="rateLimitMessages-description">
                  {rateLimitMessages} Messages (questions)
                </p>
              </div>

              <div className="sm:col-span-1">
                <label
                  htmlFor="rateLimitSeconds"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Seconds
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    min={1}
                    name="rateLimitSeconds"
                    id="rateLimitSeconds"
                    value={rateLimitSeconds}
                    onChange={(e) => setRateLimitSeconds(e.target.value)}
                    disabled={disabled || stripePlan(team).bots < 100}
                    aria-describedby="rateLimitSeconds-description"
                    className="block w-full rounded-md border-0 py-1.5 text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500" id="rateLimitSeconds-description">
                  Per {rateLimitSeconds} seconds
                </p>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="rateLimitIPAllowlist"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  IP Allowlist
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="rateLimitIPAllowlist"
                    id="rateLimitIPAllowlist"
                    value={rateLimitIPField}
                    onChange={(e) => setRateLimitIPField(e.target.value)}
                    disabled={disabled || stripePlan(team).bots < 100}
                    aria-describedby="rateLimitMessages-description"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500" id="rateLimitIPAllowlist-description">
                  Comma-separated IPs that should be exempt from rate limiting.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="rateLimitMessage"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Warning Message
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="rateLimitMessage"
                  id="rateLimitMessage"
                  value={labels?.rateLimitMessage}
                  onChange={(e) => setLabels({ ...labels, rateLimitMessage: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="mt-4">
              <FieldToggle
                label="Record IP Addresses"
                description="Record unhashed IP addresses of users to help monitor abuse. Has privacy implications."
                enabled={recordIP}
                setEnabled={setRecordIP}
                disabled={!stripePlan(team).bots >= 100}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
