import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Alert from '@/components/Alert'
import { useRouter } from 'next/router'
import { stripePlan } from '@/utils/helpers'
import ModalOpenAI from '@/components/ModalOpenAI'
import FormBot from '@/components/FormBot'
import ModalCheckout from '@/components/ModalCheckout'
import va from '@vercel/analytics'

export default function NewBotPanel({ team, open, setOpen }) {
  const [errorText, setErrorText] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showOpenAI, setShowOpenAI] = useState(false)
  const [botSettings, setBotSettings] = useState({})
  const [showUpgrade, setShowUpgrade] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open && stripePlan(team).bots <= team.botCount) {
      setOpen(false)
      setShowUpgrade(true)
    }
    if (open && !showOpenAI && !team.openAIKey) {
      setOpen(false)
      setShowOpenAI(true)
    }
  }, [open])

  async function createBot() {
    if (!botSettings.name) {
      setErrorText('Please enter a name for your bot.')
      return
    }
    setErrorText('')
    setIsUpdating(true)

    const urlParams = ['teams', team.id, 'bots']
    const apiPath = '/api/' + urlParams.join('/')

    const response = await fetch(apiPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(botSettings),
    })
    if (response.ok) {
      const data = await response.json()
      setBotSettings({})
      setIsUpdating(false)
      setOpen(false)
      va.track('Bot Created')
      router.push(`/app/bots/${data.id}`)
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ' creating bot, please try again later. Please be patient while our DB provider is trying to scale to meet the extreme demand.')
      }
      setIsUpdating(false)
    }
  }

  return (
    <>
      <ModalOpenAI team={team} open={showOpenAI} setOpen={setShowOpenAI} onKey={(key) => {
        team.openAIKey = key
        setOpen(true)
      }}/>
      <ModalCheckout team={team} open={showUpgrade} setOpen={setShowUpgrade} />
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <div className="fixed inset-0" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <form
                      action="#"
                      className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                      onSubmit={(e) => {
                        e.preventDefault()
                        createBot()
                      }}
                    >
                      <div className="h-0 flex-1 overflow-y-auto">
                        <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 py-6 px-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <Dialog.Title className="text-lg font-medium text-white">
                              Create a new DocsBot
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="rounded-md text-cyan-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                onClick={() => setOpen(false)}
                              >
                                <span className="sr-only">Close panel</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-cyan-100">
                              Fill in the information below to create your new bot. Once created you
                              can add source documentation and content then start chatting!
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="divide-y divide-gray-200 px-4 sm:px-6">
                            <Alert title={errorText} type="error" />
                            <div className="space-y-6 pt-6 pb-5">
                            <FormBot {...{team, setBotSettings }} disabled={isUpdating} short={true} />
                          </div>
                            <div className=" pt-4 pb-6">
                              <div className="mt-4 flex text-sm">
                                  <InformationCircleIcon
                                    className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                    aria-hidden="true"
                                  />
                                  <span className="ml-2">You can change these settings later.</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 justify-end px-4 py-4">
                        <button
                          type="button"
                          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                          onClick={() => setOpen(false)}
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                        <input
                          type="submit"
                          disabled={isUpdating}
                          value={isUpdating ? 'Creating...' : 'Create Bot'}
                          className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-75"
                        />
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
