import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  ArrowTopRightOnSquareIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import Alert from '@/components/Alert'
import openAILogo from '@/images/logos/openai-logo.svg'
import va from '@vercel/analytics'

export default function ModalOpenAI({ team, open, setOpen, onKey }) {
  //const [open, setOpen] = useState(team.openAIKey ? false : true)

  const [errorText, setErrorText] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [openAIKey, setOpenAIKey] = useState('')
  const [hasPaymentCard, setHasPaymentCard] = useState(false)

  async function updateTeam() {
    if (!openAIKey || (!team.AzureDeploymentBase && !/^sk\-[a-zA-Z0-9]{48}$/.test(openAIKey))) {
      setErrorText('Please enter your OpenAI API key.')
      return
    }

    if (!hasPaymentCard) {
      setErrorText('Please confirm you added a payment card to your OpenAI account.')
      return
    }

    setErrorText('')
    setIsUpdating(true)

    const urlParams = ['teams', team.id]
    const apiPath = '/api/' + urlParams.join('/')

    const response = await fetch(apiPath, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ openAIKey }),
    })
    if (response.ok) {
      const data = await response.json()
      onKey(openAIKey)
      setOpenAIKey('')
      setIsUpdating(false)
      setOpen(false)
      va.track('OpenAI Key Updated')
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
      setIsUpdating(false)
    }
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={setOpen}>
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

        <div className="fixed inset-0 z-20 overflow-y-auto">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                <form onSubmit={(e) => {
                    e.preventDefault()
                    updateTeam()
                }}>
                <div>
                  <div className="mx-auto flex items-center justify-center">
                    <Image src={openAILogo} alt="OpenAI logo" width={130} height={90} />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Alert title={errorText} type="error" />
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Add your OpenAI API key
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        We need to connect your bots to your OpenAI account so you have full control
                        and ownership of your data.
                      </p>
                      <p className="text-xs text-gray-600">
                        (Creating an account is free and takes less than a minute!)
                      </p>
                    </div>

                    <div className="mt-5 sm:mt-6">
                      <Link
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:text-sm"
                        href="https://beta.openai.com/account/api-keys"
                        target="_blank"
                      >
                        Get my OpenAI key{' '}
                        <ArrowTopRightOnSquareIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                      </Link>
                    </div>

                    <div className="mt-4 text-left">
                      <label
                        htmlFor="openai-key"
                        className="block text-left text-sm font-medium text-gray-700"
                      >
                        API Key
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="openai-key"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                          placeholder="sk-xxxxxxxxxxxxxxxx"
                          aria-describedby="openai-key-description"
                          value={openAIKey}
                          onChange={(e) => setOpenAIKey(e.target.value)}
                          disabled={isUpdating}
                          pattern={team.AzureDeploymentBase ? false : "sk-[a-zA-Z0-9]{48}"}
                        />
                      </div>
                      <p
                        className="mt-1 text-left text-xs text-gray-500"
                        id="openai-key-description"
                      >
                        Securely stored with AES256 encryption.
                      </p>
                    </div>

                    <div className="relative mt-6 flex items-start text-left">
                      <div className="flex h-5 items-center">
                        <input
                          id="payment-card"
                          aria-describedby="comments-description"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                          disabled={isUpdating}
                          onChange={(e) => setHasPaymentCard(e.target.checked)}
                          checked={hasPaymentCard}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="payment-card" className="font-medium text-gray-700">
                          Added a payment card to OpenAI?
                        </label>
                        <p id="comments-description" className="text-gray-500">
                          You must{' '}
                          <Link
                            href="https://platform.openai.com/account/billing/payment-methods"
                            className="underline"
                            target="_blank"
                          >
                            add a payment method
                          </Link>{' '}
                          to your OpenAI account to increase rate limits even if only using their free credits.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    name="submit-form"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-75 sm:text-sm"
                    disabled={isUpdating}
                  >
                    <LockClosedIcon className=" mr-2 h-5 w-5" aria-hidden="true" />
                    {!isUpdating ? <span>Save Securely</span> : <span>Saving...</span>}
                  </button>
                </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
