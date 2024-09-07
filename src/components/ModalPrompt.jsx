import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CommandLineIcon, XMarkIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'
import ModalCheckout from '@/components/ModalCheckout'
import { stripePlan, isSuperAdmin } from '@/utils/helpers'
import Alert from '@/components/Alert'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase-ui.config'

export default function ModalPrompt({ team, bot }) {
  const [open, setOpen] = useState(false)
  const [errorText, setErrorText] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [prompt, setPrompt] = useState(bot.customPrompt || '')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [user] = useAuthState(auth)

  async function updatePrompt() {
    setErrorText('')

    //show upgrade modal if they are not pro and doing anything other than erasing the prompt
    if (prompt && stripePlan(team).bots < 10 && !isSuperAdmin(user.uid)) {
      setShowUpgrade(true)
      return
    }

    setIsUpdating(true)

    const urlParams = ['teams', team.id, 'bots', bot.id]
    const apiPath = '/api/' + urlParams.join('/')

    const response = await fetch(apiPath, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customPrompt: prompt }),
    })
    if (response.ok) {
      const data = await response.json()
      setOpen(false)
      setIsUpdating(false)
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
    <>
      <button
        className="flex items-center text-sm text-gray-600 hover:text-gray-800"
        title="Customize prompt"
        onClick={() => setOpen(true)}
      >
        <CommandLineIcon className="mr-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
        {bot.customPrompt ? <p>Custom prompt</p> : <p>Default prompt</p>}
      </button>
      <ModalCheckout team={team} open={showUpgrade} setOpen={setShowUpgrade} />
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      updatePrompt()
                    }}
                  >
                    <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        onClick={() => setOpen(false)}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="">
                      <Dialog.Title
                        as="h3"
                        className="mb-4 text-xl font-medium leading-6 text-gray-900"
                      >
                        Customize Prompt (advanced)
                        {stripePlan(team).bots < 10 && (
                          <span className="ml-4 inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                            Pro
                          </span>
                        )}
                      </Dialog.Title>
                      <Alert title={errorText} type="error" />
                      <p className="text-md text-gray-700">
                        Add some custom instructions to your prompt to adjust your bot's answer
                        output to your specific use case. You can use this powerful tool to make
                        highly specific changes to your bot's output.
                      </p>
                      <h3 className="mt-4 text-lg font-medium text-gray-800">Examples</h3>
                      <ul className="mt-2 ml-4 list-disc text-sm text-gray-700">
                        <li className="text-sm text-gray-700">
                          "Politely refuse to answer questions unrelated to {bot.name}."
                        </li>
                        <li className="text-sm text-gray-700">
                          "Begin each answer with the phrase 'I think...'."
                        </li>
                        <li className="text-sm text-gray-700">
                          "End each answer with the phrase 'I hope that helps!'."
                        </li>
                        <li className="text-sm text-gray-700">
                          "If the answer is not in the provided context, recommend they contact the{' '}
                          {bot.name} support team and provide a link to https://mysite.com/support/"
                        </li>
                        <li className="text-sm text-gray-700">
                          "Always answer in the form of a rhyming couplet."
                        </li>
                      </ul>
                      <div className="mt-4 text-left">
                        <label
                          htmlFor="prompt"
                          className="block text-left text-sm font-medium text-gray-700"
                        >
                          Custom Prompt
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="prompt"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                            placeholder="Enter any custom prompt here..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isUpdating}
                          />
                        </div>
                      </div>
                      <div className="mt-5 flex justify-end sm:mt-6">
                        <button
                          type="submit"
                          name="submit-form"
                          className="inline-flex w-1/4 items-center justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-75 sm:text-sm"
                          disabled={isUpdating}
                        >
                          {!isUpdating ? (
                            <span>Save</span>
                          ) : (
                            <span>
                              <LoadingSpinner /> Saving...
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
