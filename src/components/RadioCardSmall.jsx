import { useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import classNames from '@/utils/classNames'

const memoryOptions = [
  { name: '4 GB', disabled: true },
  { name: '8 GB', disabled: true },
  { name: '16 GB', disabled: true },
  { name: '32 GB', disabled: true },
  { name: '64 GB', disabled: true },
  { name: '128 GB', disabled: false },
]

export default function RadioCardSmall({options, title, value, setValue}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium leading-6">{title}</h2>
      </div>

      <RadioGroup value={value} onChange={setValue} className="mt-2">
        <RadioGroup.Label className="sr-only">Choose a {title} option</RadioGroup.Label>
        <div className="grid grid-cols-3 gap-0">
          {options.map((option) => (
            <RadioGroup.Option
              key={option.name}
              value={option}
              className={({ active, checked }) =>
                classNames(
                  !option.disabled ? 'cursor-pointer focus:outline-none' : 'cursor-not-allowed opacity-25',
                  active ? 'ring-1 ring-offset-2' : '',
                  checked
                    ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                    : 'ring-1 ring-inset ring-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20',
                  'flex items-center justify-center first:rounded-l-md last:rounded-r-md py-3 px-3 text-sm font-semibold sm:flex-1'
                )
              }
              disabled={option.disabled}
            >
              <RadioGroup.Label as="span">{option.name}</RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
