import { Switch } from '@headlessui/react'
import classNames from '@/utils/classNames'

export default function FieldToggle({label, description, enabled, setEnabled, disabled}) {

  return (
    <Switch.Group as="div" className="flex items-center justify-between w-full space-x-2">
      <span className="flex flex-grow flex-col">
        <Switch.Label as="span" className="text-sm font-medium leading-6 text-gray-900" passive>
          {label}
        </Switch.Label>
        <Switch.Description as="span" className="text-sm text-gray-500">
          {description}
        </Switch.Description>
      </span>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        disabled={disabled}
        className={classNames(
          enabled ? 'bg-cyan-600' : 'bg-gray-200',
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2'
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
    </Switch.Group>
  )
}
