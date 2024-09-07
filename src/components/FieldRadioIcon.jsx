import { RadioGroup } from '@headlessui/react'
import {
  faComment,
  faComments,
  faRobot,
  faLifeRing,
  faQuestion,
  faInfo,
  faBook,
  faUpload,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from '@/utils/classNames'

//icon can be default, robot, life-ring, or question-circle
const iconMap = {
  default: { icon: faComment, label: 'Comment' },
  comments: { icon: faComments, label: 'Comments' },
  robot: { icon: faRobot, label: 'Robot' },
  'life-ring': { icon: faLifeRing, label: 'Life Ring' },
  question: { icon: faQuestion, label: 'Question Mark' },
  book: { icon: faBook, label: 'Book' },
  custom: { icon: faPlus, label: 'Custom Icon' },
}

const botIconMap = {
  none: { icon: false, label: 'None' },
  comment: { icon: faComment, label: 'Comment' },
  robot: { icon: faRobot, label: 'Robot' },
  'life-ring': { icon: faLifeRing, label: 'Life Ring' },
  info: { icon: faInfo, label: 'Info' },
  book: { icon: faBook, label: 'Book' },
  custom: { icon: faPlus, label: 'Custom Icon' },
}

export default function FieldRadioIcon({ type, label, icon, disabled, setIcon, props }) {
  const list = type === 'bot' ? botIconMap : iconMap
  const selectedIcon = list[icon] ? icon : 'custom'
  return (
    <RadioGroup value={selectedIcon} onChange={setIcon} {...{ props }}>
      <RadioGroup.Label className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </RadioGroup.Label>
      <div className="mt-4 flex flex-wrap items-center space-x-3">
        {list &&
          Object.keys(list).map((key) => (
            <RadioGroup.Option
              key={key}
              value={key}
              disabled={disabled}
              className={({ active, checked }) =>
                classNames(
                  'ring-cyan-700',
                  checked ? 'text-cyan-700' : 'text-gray-400',
                  active && checked ? 'ring ring-offset-2' : '',
                  !active && checked ? 'ring-2 ring-offset-1' : '',
                  key === 'custom' ? 'border-dashed border-2 hover:text-gray-500' : '',
                  'relative mb-3 -m-0.5 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-black border-opacity-10 p-0.5 focus:outline-none'
                )
              }
            >
              <RadioGroup.Label as="span" className="sr-only">
                {list[key].label}
              </RadioGroup.Label>
              {key === 'none' ? (
                <span className="">None</span>
              ) : key === 'custom' && icon.includes('://') ? (
                <img src={icon} alt="icon" className="w-7 h-7 object-scale-down" />
              ) : (
                <FontAwesomeIcon icon={list[key].icon} size="xl" />
              )}
            </RadioGroup.Option>
          ))}
      </div>
    </RadioGroup>
  )
}
