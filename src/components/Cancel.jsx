import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase-ui.config'
import LoadingDots from '@/components/LoadingDots'
import Alert from '@/components/Alert'
import { Mixpanel } from '@/lib/mixpanel-web'

export default function Cancel({ team, bots }) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [reason, setReason] = useState(null)
  const [details, setDetails] = useState(null)
  const [answer, setAnswer] = useState('')
  const [resultHtml, setResultHtml] = useState('')
  const [answerDone, setAnswerDone] = useState(false)
  const [user] = useAuthState(auth)
  const [errorText, setErrorText] = useState(null)
  const [cancelled, setCancelled] = useState(
    !team.stripeCustomerId ||
      !['active', 'trialing', 'past_due', 'incomplete'].includes(team.stripeSubscriptionStatus) ||
      team.stripeSubscriptionCancelAtPeriodEnd
  )

  useEffect(() => {
    if (!open) {
      setCurrentStep(0)
    }
  }, [open])

  useEffect(() => {
    if (currentStep === 3 && reason && details) {
      let prompt = `Cancelation reason: ${
          reasons.find((item) => item.id === reason).value
        }\nFollowup question: ${
          reasons.find((item) => item.id === reason).followup_question
        }\nAnswer: ${details}`
      if (user.displayName) {
        prompt += `\nCustomer name: ${user.displayName}`
      }
      if (!team.name.includes(user.displayName)) {
        prompt += `\nTeam/organization name: ${team.name}`
      }

      //loop through bots and get the name and description of each, adding to prompt
      prompt += `\n\nThe following bots were being used by the user:`
      for (let i = 0; i < bots.length; i++) {
        const bot = bots[i]
        prompt += `\n---`
        prompt += `\nBot name: ${bot.name}`
        prompt += `\nBot description: ${bot.description}`
        prompt += `\nBot question count: ${bot.questionCount}`
      }
      //cut the prompt to 2000 characters
      prompt = prompt.substring(0, 2000)

      askQuestion(prompt)
    }
  }, [currentStep])

  //convert markdown to html when answer changes or is appended to
  useEffect(() => {
    if (answer) {
      remark()
        .use(html)
        .use(remarkGfm)
        .process(answer)
        .then((html) => {
          setResultHtml(html.toString())
        })
    }
  }, [answer])

  // make api call to ask question
  const askQuestion = async (prompt) => {
    setAnswer('')
    setResultHtml('')
    setAnswerDone(false)

    //get apiBase from env
    const apiUrl = `wss://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/FzpZv43hHhFNWZJ038xf/chat`
    const ws = new WebSocket(apiUrl)

    // Send message to server when connection is established
    ws.onopen = function (event) {
      //get name and email
      const metadata = {}
      if (user) {
        metadata.name = user.displayName
        metadata.email = user.email
      }
      const req = {
        question: prompt,
        metadata,
      }
      ws.send(JSON.stringify(req))
    }

    ws.onerror = function (event) {
      console.log('There was a connection error', event)
      setAnswerDone(true)
    }

    ws.onclose = function (event) {
      if (!event.wasClean) {
        console.error('Network error, please try again.')
        setAnswerDone(true)
      }
    }

    // Receive message from server word by word. Display the words as they are received.
    ws.onmessage = function (event) {
      const data = JSON.parse(event.data)
      if (data.sender === 'bot') {
        if (data.type === 'stream') {
          //append to answer
          setAnswer((prev) => prev + data.message)
        } else if (data.type === 'end') {
          data = JSON.parse(data.message)
          setAnswer(data.answer)
          setAnswerDone(true)
          ws.close()
        } else if (data.type === 'error') {
          setErrorText(data.message)
          setAnswerDone(true)
          ws.close()
        }
      }
    }
  }

  async function cancelSubscription() {
    setErrorText(null)
    if (!reason || !details) {
      setErrorText('Please select a reason and provide details.')
      return
    }

    const response = await fetch(`/api/teams/${team.id}/stripe-portal`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason, details }),
    })
    if (response.ok) {
      const data = await response.json()
      setOpen(false)
      setReason(null)
      setDetails(null)
      setCancelled(true)
      return
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
    }
  }

  const cancelButtonRef = useRef(null)
  const steps = [
    {
      title: 'Begin Cancellation',
      text: "We're sorry to see you go! To start the cancellation process for your DocsBot AI subscription, click 'Next'. Your feedback is valuable to us, and we'd appreciate it if you could share your reasons for cancellation in the next steps.",
    },
    {
      title: 'Share Your Thoughts',
      text: 'Your feedback helps us improve DocsBot AI. Please select your main reason for cancelling your subscription from the options below.',
    },
    {
      title: 'Can we have more details?',
      text: 'Please provide some additional details to help us improve DocsBot AI.',
    },
    {
      title: 'Suggestions',
      text: '',
    },
    {
      title: 'Confirm Your Cancellation',
      text: "Are you absolutely sure you are ready to cancel your DocsBot AI plan? By clicking 'Confirm', cancellation will be scheduled for the end of your current billing period, after which all bots, question logs, reports, and other data will be deleted!",
    },
  ]

  const reasons = [
    {
      id: 'too_expensive',
      value: 'It’s too expensive',
      followup_question: 'What features would provide enough value to be worth the cost?',
      suggestion:
        "We understand that cost can be a concern. Did you know we offer a variety of pricing plans? Let's find one that fits your budget. Would you be interested in exploring our [discounted/lesser-priced] plans?",
    },
    {
      id: 'missing_features',
      value: 'Some features are missing',
      followup_question: 'What needed features are missing?',
    },
    {
      id: 'switched_service',
      value: 'I’m switching to a different service',
      followup_question: 'Which service are you switching to?',
      suggestion:
        "We're sad to hear you're considering a switch. We'd love to offer a comparison to ensure you're getting the best value.",
    },
    {
      id: 'unused',
      value: 'I don’t use the service enough',
      followup_question: 'How could we improve DocsBot to make it more useful for you?',
      suggestion:
        'We want DocsBot AI to be a vital part of your daily activities. Here are some ways our other users integrate it into their workflow. Perhaps these could make it more useful for you too?',
    },
    {
      id: 'customer_service',
      value: 'Customer service was less than expected',
      followup_question: 'What could we have done better?',
      suggestion:
        "We apologize if our service didn't meet your expectations. Your satisfaction is our priority. Can we offer you a one-on-one session with our founder to address any unresolved issues? Book a time here: https://tidycal.com/docsbot/customer-support-escalation",
    },
    {
      id: 'too_complex',
      value: 'Ease of use was less than expected',
      followup_question: 'What was complex or difficult to use?',
      suggestion:
        'Ease of use is critical for us. Would you be open to a guided walkthrough to help streamline your experience and get  you setup with DocsBot AI? Book a time here: https://tidycal.com/docsbot/onboarding',
    },
    {
      id: 'low_quality',
      value: 'Quality was less than expected',
      followup_question: 'What was the issue with quality?',
      suggestion:
        "Your experience with our platform should be nothing less than excellent. Please let us know the specific issues, and we'll work swiftly to resolve them—perhaps a service credit could make up for our shortcoming in the meantime?",
    },
    {
      id: 'other',
      value: 'Other reason',
      followup_question: 'Please specify your reason for cancellation?',
    },
  ]

  const CancelReason = () => {
    return (
      <div className="my-4">
        <label className="text-base font-semibold text-gray-900">Reason</label>
        <fieldset className="mt-4">
          <legend className="sr-only">Reason</legend>
          <div className="space-y-4">
            {reasons.map((item) => (
              <div key={item.id} className="flex items-center">
                <input
                  id={item.id}
                  value={item.id}
                  name="reason"
                  type="radio"
                  defaultChecked={item.id === reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-600"
                />
                <label
                  htmlFor={item.id}
                  className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                >
                  {item.value}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    )
  }

  const Progress = () => {
    return (
      <nav className="flex items-center justify-center" aria-label="Progress">
        <p className="text-xs font-medium">
          Step {currentStep + 1} of {steps.length}
        </p>
        <ol role="list" className="ml-8 flex items-center space-x-5">
          {steps.map((step, index) => (
            <li key={step.title}>
              {index < currentStep ? (
                <div className="block h-2.5 w-2.5 rounded-full bg-red-600 hover:bg-red-900">
                  <span className="sr-only">{step.title}</span>
                </div>
              ) : currentStep === index ? (
                <div className="relative flex items-center justify-center" aria-current="step">
                  <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
                    <span className="h-full w-full rounded-full bg-red-200" />
                  </span>
                  <span
                    className="relative block h-2.5 w-2.5 rounded-full bg-red-600"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.title}</span>
                </div>
              ) : (
                <div className="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
                  <span className="sr-only">{step.title}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }

  if (cancelled) return null

  return (
    <>
      <div className="mt-6 flex justify-center text-center">
        <button
          type="button"
          className="text-sm font-medium text-red-600 hover:text-red-900 hover:underline focus:outline-none"
          onClick={(e) => {
            setOpen(true)
            Mixpanel.track('Started Cancellation')
            if (window.bento !== undefined) {
              window.bento.track('startedCancel')
            }
          }}
        >
          Cancel Plan
        </button>
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
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
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <Alert title={errorText} type="error" />
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon
                          className="h-6 w-6 text-red-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          {steps[currentStep].title}
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="my-4 text-sm text-gray-600">{steps[currentStep].text}</p>
                          {currentStep === 1 ? (
                            <CancelReason />
                          ) : currentStep === 2 ? (
                            <div className="my-4">
                              <label
                                htmlFor="details"
                                className="text-base font-semibold text-gray-900"
                              >
                                {reasons.find((item) => item.id === reason).followup_question}
                              </label>
                              <textarea
                                id="details"
                                name="details"
                                rows={2}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                                placeholder="Please provide details..."
                                onChange={(e) => setDetails(e.target.value)}
                                defaultValue={details}
                              />
                            </div>
                          ) : currentStep === 3 ? (
                            resultHtml ? (
                              <div
                                className="prose my-4 text-sm text-gray-800"
                                dangerouslySetInnerHTML={{ __html: resultHtml }}
                              />
                            ) : (
                              <div className="my-4">
                                <LoadingDots />
                              </div>
                            )
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="items-center bg-gray-50 px-4 py-3 sm:flex sm:justify-between sm:px-6">
                    <Progress />
                    <div className="mt-3 flex items-center justify-between space-x-2 sm:mt-0">
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center rounded-md bg-cyan-600 px-6 py-2 text-sm font-medium text-white shadow-md hover:bg-cyan-700 focus:outline-none sm:w-auto"
                        onClick={() => setOpen(false)}
                        ref={cancelButtonRef}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className={clsx(
                          'inline-flex w-auto justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold shadow-sm disabled:opacity-25',
                          currentStep === steps.length - 1
                            ? 'bg-red-600 text-white hover:bg-red-500'
                            : 'bg-red-50 text-red-600 ring-2 ring-inset ring-red-600 hover:bg-red-100'
                        )}
                        onClick={() => {
                          if (currentStep === steps.length - 1) {
                            //cancel subscription
                            cancelSubscription()
                          } else {
                            setCurrentStep(currentStep + 1)
                          }
                        }}
                        disabled={
                          currentStep === 1 && !reason
                            ? true
                            : currentStep === 2 && (!details || details.length <= 5)
                            ? true
                            : currentStep === 3 && !answerDone
                            ? true
                            : false
                        }
                      >
                        {currentStep === steps.length - 1
                          ? 'Confirm Cancellation'
                          : currentStep === 3
                          ? 'I still want to cancel'
                          : 'Next'}
                      </button>
                    </div>
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
