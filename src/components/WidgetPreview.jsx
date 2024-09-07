import {
  ArrowPathIcon,
  ChevronLeftIcon,
  XMarkIcon,
  PhotoIcon,
  FlagIcon,
} from '@heroicons/react/24/outline'
import {
  faComment,
  faComments,
  faRobot,
  faLifeRing,
  faQuestion,
  faInfo,
  faBook,
  faPlus,
  faChevronDown,
  faFlag,
  faBullhorn,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from '@/utils/classNames'
import { decideTextColor, getLighterColor } from '@/utils/colors'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import { useEffect, useState } from 'react'

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

export default function WidgetPreview({
  bot,
  color,
  logo,
  headerAlignment,
  alignment,
  branding,
  icon,
  botIcon,
  showButtonLabel,
  labels,
  hideSources,
  supportLink,
}) {
  return (
    <div className="sticky top-20">
      <h3 className="mb-4 text-2xl font-bold">Preview</h3>
      <div className="overflow-hidden rounded-xl bg-gray-50 shadow-xl">
        <div
          className="flex items-center justify-center px-3 py-3 text-xs"
          style={{
            backgroundColor: color,
            color: decideTextColor(color || '#1292EE'),
          }}
        >
          <div className="relative w-full">
            <button
              className="absolute right-0 top-0 font-semibold focus:outline-none"
              title="Reset conversation"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
            <div className={classNames(headerAlignment === 'left' ? 'text-left' : 'text-center')}>
              {logo ? (
                <div
                  className="flex items-center justify-center"
                  style={{
                    justifyContent: headerAlignment === 'left' ? 'start' : 'center',
                  }}
                >
                  <img src={logo} alt={bot.name} className="max-h-9 w-auto" />
                </div>
              ) : (
                <>
                  <h1 className="text-base font-bold">{bot.name}</h1>
                  <span>{bot.description}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex h-full flex-col overflow-y-scroll px-3 pt-4">
          <BotMessage text={labels.firstMessage} {...{ botIcon, iconMap, labels, color }} />

          <div className="mb-3 self-end rounded-2xl rounded-tr-none border bg-white px-3 py-2 text-sm text-gray-700">
            Why are you so amazing?
          </div>

          <BotMessage
            text={
              "Thank you for the compliment! As an AI assistant, I strive to provide helpful and accurate information about your business or products to the best of my abilities. Is there anything specific you would like to know about DocsBot AI or the [Embeddable Chat Widget](https://docsbot.ai/documentation/developer/embeddable-chat-widget)? I'm here to assist you!"
            }
            {...{ botIcon, iconMap, labels, color, sources: true, hideSources }}
          />

          {supportLink && (
            <div className="mb-4 mt-6 flex justify-end">
              <a
                href={supportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hove:opacity-100 relative text-xs text-gray-500 opacity-80 hover:border-b-2 hover:border-gray-600"
                style={{
                  color: decideTextColor(getLighterColor(color || '#1292EE', 0.93)),
                }}
              >
                {labels.getSupport}
                <FontAwesomeIcon
                  icon={faBullhorn}
                  style={{
                    color: decideTextColor(getLighterColor(color || '#1292EE', 0.93)),
                    marginLeft: 5,
                  }}
                />
              </a>
            </div>
          )}

          {branding && (
            <div className="mb-3 mt-8 flex w-full items-center justify-center text-center">
              <button className="flex items-center justify-center text-xs text-gray-400 hover:text-gray-600">
                {bot.labels.poweredBy} DocsBot
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-300 bg-white px-3 py-3 text-xs">
          <div className="text-gray-400">{labels.inputPlaceholder}</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w-4"
            style={{
              fill: ['#ffffff', '#FFFFFF', 'rgb(255, 255, 255)'].includes(color) ? '#b3b3b3' : color,
            }}
          >
            <path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"></path>
          </svg>
        </div>
      </div>
      <div className="mt-6 flex">
        <div
          className={classNames(
            alignment === 'right' ? 'ml-auto' : 'mr-auto',
            showButtonLabel ? 'px-5' : 'w-14',
            'inline-flex h-14 items-center justify-center rounded-full text-lg font-medium text-white shadow-lg hover:opacity-90'
          )}
          style={{
            backgroundColor: color,
            color: decideTextColor(color),
          }}
        >
          {iconMap[icon] ? (
            <FontAwesomeIcon icon={iconMap[icon].icon} size="xl" />
          ) : icon.includes('://') ? (
            <img src={icon} alt="icon" className="h-7 w-7 object-scale-down" />
          ) : null}
          {showButtonLabel && (
            <span className="text-md ml-3 font-normal">{labels.floatingButton}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function BotMessage({ text, botIcon, labels, color, sources, hideSources }) {
  const avatarBgColor = getLighterColor(color || '#1292EE', 0.6)
  const avatarFontColor = decideTextColor(avatarBgColor)

  const bgColor = getLighterColor(color || '#1292EE')
  const fontColor = decideTextColor(bgColor)

  const [markdown, setMarkdown] = useState(text)

  useEffect(() => {
    remark()
      .use(html)
      .use(remarkGfm)
      .process(text)
      .then((html) => {
        setMarkdown(html.toString())
      })
  }, [text])

  return (
    <div className="items-top mb-3 flex justify-start">
      {botIcon !== 'none' && (
        <div
          className="mr-2 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gray-100"
          style={{
            backgroundColor: avatarBgColor,
            color: avatarFontColor,
          }}
        >
          {botIcon.includes('://') ? (
            <img src={botIcon} alt="icon" className="h-auto w-4/6 object-scale-down" />
          ) : (
            <FontAwesomeIcon icon={botIconMap[botIcon].icon} size="sm" />
          )}
        </div>
      )}
      <div
        className="prose rounded-2xl rounded-tl-none border px-3 py-2 text-sm leading-snug text-gray-700 first:prose-p:my-0"
        style={{
          backgroundColor: bgColor,
          color: fontColor,
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: markdown }} />
        {sources && (
          <div
            className={classNames(
              hideSources ? 'justify-end' : 'justify-between',
              'mt-2 flex items-center'
            )}
          >
            {!hideSources && (
              <button className="text-sm font-semibold">
                {labels.sources}
                <FontAwesomeIcon icon={faChevronDown} size="sm" />
              </button>
            )}
            <div>
              <button title={labels.unhelpful} className="text-gray-500 hover:text-red-600">
                <FlagIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
