import { RadioGroup } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

const test = [
  { id: 1, title: 'Newsletter', description: 'Last message sent an hour ago', users: '621 users' },
  { id: 2, title: 'Existing Customers', description: 'Last message sent 2 weeks ago', users: '1200 users' },
  { id: 3, title: 'Trial Users', description: 'Last message sent 4 days ago', users: '2740 users' },
]

export default function FieldRadioCards({ label, options, selected, setSelected, ...props}) {

  return (
    <RadioGroup value={selected} onChange={setSelected} {...props}>
      <RadioGroup.Label className="mb-3 block text-sm font-medium text-gray-700">
        {label}
      </RadioGroup.Label>

      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        {options.map((options) => (
          <RadioGroup.Option
            key={options.value}
            value={options.value}
            className={({ active }) =>
              clsx(
                active ? 'border-cyan-600 ring-2 ring-cyan-600' : 'border-gray-300',
                'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none'
              )
            }
          >
            {({ checked, active }) => (
              <>
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <RadioGroup.Label as="span" className="block text-sm font-medium text-gray-900">
                      {options.title}
                    </RadioGroup.Label>
                    <RadioGroup.Description as="span" className="mt-1 flex items-center text-sm text-gray-500">
                      {options.description}
                    </RadioGroup.Description>
                  </span>
                </span>
                <CheckCircleIcon
                  className={clsx(!checked ? 'invisible' : '', 'h-5 w-5 text-cyan-600')}
                  aria-hidden="true"
                />
                <span
                  className={clsx(
                    active ? 'border' : 'border-2',
                    checked ? 'border-cyan-600' : 'border-transparent',
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
  )
}
