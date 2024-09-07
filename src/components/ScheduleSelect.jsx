import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { stripePlan } from '@/utils/helpers'
import classNames from '@/utils/classNames'

const intervals = [
  {value: 'none', title: 'Never'},
  {value: 'monthly', title: 'Monthly', plan: 'Power'},
  {value: 'weekly', title: 'Weekly', plan: 'Pro'},
  {value: 'daily', title: 'Daily', plan: 'Enterprise'},
]

const getTimeInterval = (interval) => {
  switch(interval) {
    case 'daily': return 24 * 60 * 60 * 1000;
    case 'weekly': return 7 * 24 * 60 * 60 * 1000;
    case 'monthly': return 30 * 24 * 60 * 60 * 1000;
    default: return 999999999999999;
  }
}

const isAvailable = (team, interval) => {
  const currentPlan = stripePlan(team)
  const selectedInterval = getTimeInterval(interval)
  const planLimit = getTimeInterval(currentPlan.scheduleInterval)
  return selectedInterval >= planLimit
}

export default function ScheduleSelect({ team, onSelect, defaultSelected }) {
  const [selected, setSelected] = useState(intervals.filter((interval) => interval.value === defaultSelected)[0])

  return (
    <Listbox value={selected} onChange={(val) => {
      setSelected(val)
      onSelect(val.value)
    }}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium text-gray-700">Scheduled refresh</Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{selected.title}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {intervals.map((interval) => (
                  <Listbox.Option
                    key={interval.value}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-cyan-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-1 pl-3 pr-9'
                      )
                    }
                    value={interval}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex">
                          <span className={classNames(
                            selected ? 'font-semibold' : 'font-normal', 
                            isAvailable(team, interval.value) ? 'text-gray-900' : 'text-gray-400',
                            'block truncate'
                          )}>
                            {interval.title}
                          </span>
                          <span className={classNames(
                            isAvailable(team, interval.value) ? 'text-green-700' : 'text-gray-400',
                            'ml-2 truncate'
                          )}>
                            {interval?.plan}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-cyan-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}