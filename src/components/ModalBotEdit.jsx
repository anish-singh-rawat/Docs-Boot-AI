import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'
import Alert from '@/components/Alert'
import FormBot from '@/components/FormBot'

export default function ModalBotEdit({ team, bot, setBot }) {
  const [open, setOpen] = useState(false)
  const [errorText, setErrorText] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [botSettings, setBotSettings] = useState({})

  async function updateBot() {
    setErrorText('')

    setIsUpdating(true)

    const urlParams = ['teams', team.id, 'bots', bot.id]
    const apiPath = '/api/' + urlParams.join('/')

    const response = await fetch(apiPath, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(botSettings),
    })
    if (response.ok) {
      const data = await response.json()
      setOpen(false)
      setIsUpdating(false)
      setBot(data)
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText(response.status + ', please try again.')
      }
      setIsUpdating(false)
    }
  }

  return (
    <>
      <button
        className="flex items-center text-sm text-gray-600 hover:text-gray-800"
        title="Edit bot"
        onClick={() => setOpen(true)}
      >
        <PencilSquareIcon className="mr-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <p>Edit</p>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      updateBot()
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
                        Edit Bot
                      </Dialog.Title>
                      <Alert title={errorText} type="error" />
                      <p className="text-md text-gray-700">Adjust the settings for your bot.</p>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                          <div className="space-y-6 pt-6 pb-5">
                            <FormBot {...{team, bot, setBotSettings }} disabled={isUpdating} />
                          </div>
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
