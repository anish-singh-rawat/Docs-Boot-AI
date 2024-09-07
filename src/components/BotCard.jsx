import {
  CalendarIcon,
  Square3Stack3DIcon,
  QuestionMarkCircleIcon,
  DocumentDuplicateIcon,
  LanguageIcon,
  QueueListIcon,
  ChartBarIcon,
  CodeBracketSquareIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import BadgeStatus from '@/components/BadgeStatus'
import ModalChat from '@/components/ModalChat'
import ModalAPI from '@/components/ModalAPI'
import PrivacyStatus from '@/components/PrivacyStatus'
import Link from 'next/link'
import RobotIcon from '@/components/RobotIcon'
import ModalPrompt from '@/components/ModalPrompt'
import ModalBotEdit from '@/components/ModalBotEdit'
import GPTModel from '@/components/GPTModel'
import { i18n } from '@/constants/strings.constants'
import LocalStringNum from '@/components/LocalStringNum'

export default function BotCard({ team, bot, setBot }) {
  if (!bot || !bot.id) {
    return null
  }

  let ts = new Date(bot.createdAt)

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <h2 className="sr-only" id="profile-overview-title">
        {bot.name} Bot Overview
      </h2>
      <div className="bg-white p-6">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex items-center space-x-5">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-teal-600 to-cyan-700 p-3 shadow-lg">
                <RobotIcon className="h-8 w-8 text-cyan-100 sm:h-10 sm:w-10" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4 sm:mt-0 sm:pt-1 sm:text-left">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{bot.name}</p>
              <p className="text-sm text-gray-600">{bot.description}</p>
              <div className="mt-2 flex-wrap md:flex md:space-x-3">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon
                    className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <p>
                    <time dateTime={bot.createdAt}>{bot.createdAt.substr(0, 10)}</time>
                  </p>
                </div>
                <div className="sm:flex">
                  <PrivacyStatus bot={bot} />
                </div>
                <div className="sm:flex">
                  <GPTModel bot={bot} />
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <LanguageIcon
                    className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <p>{i18n[bot.language] ? i18n[bot.language].name : 'English'}</p>
                </div>
                <ModalPrompt team={team} bot={bot} />
                <ModalBotEdit team={team} bot={bot} setBot={setBot} />
              </div>
            </div>
          </div>
          <div className="block">
            <div className="mt-4 flex justify-between lg:mt-0 lg:block">
              <div className="hidden flex-shrink-0 justify-start sm:flex lg:justify-end">
                <BadgeStatus status={bot.status} small={false} />
              </div>
              <div className="flex w-full justify-between space-x-2 sm:justify-end lg:mt-4">
                <ModalChat team={team} bot={bot} />
                <Link
                  href={`/app/bots/${bot.id}/search`}
                  className="flex items-center justify-center gap-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <span className="hidden xl:inline">Search</span>
                </Link>
                <Link
                  href={`/app/bots/${bot.id}/questions`}
                  className="flex items-center justify-center gap-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={bot.questionCount <= 0}
                >
                  <QueueListIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <span className="hidden xl:inline">Logs</span>
                </Link>
                <Link
                  href={`/app/bots/${bot.id}/reports`}
                  className="flex items-center justify-center gap-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={bot.questionCount <= 0}
                >
                  <ChartBarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <span className="hidden xl:inline">Reports</span>
                </Link>
              </div>
            </div>
            <div className="mt-4 flex justify-between space-x-4 sm:mt-1 sm:justify-end">
              <Link
                type="button"
                className="mt-2 flex cursor-pointer items-center justify-end text-sm font-medium text-gray-500 hover:text-gray-900"
                href={`/app/bots/${bot.id}/widget`}
              >
                <CodeBracketSquareIcon className="mr-0.5 h-4 w-4" aria-hidden="true" />
                Widget Embed
              </Link>
              <ModalAPI team={team} bot={bot} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex items-center justify-center space-x-1 px-6 py-5 text-center text-sm font-medium">
          <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="text-gray-900">
            <LocalStringNum value={bot.sourceCount} />
          </span>{' '}
          <span className="text-gray-600">Sources</span>
        </div>
        <div className="flex items-center justify-center space-x-1 px-6 py-5 text-center text-sm font-medium">
          <Square3Stack3DIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="text-gray-900">
            <LocalStringNum value={bot.pageCount} />
          </span>{' '}
          <span className="text-gray-600">Indexed pages</span>
        </div>
        <Link
          className="flex items-center justify-center space-x-1 px-6 py-5 text-center text-sm font-medium hover:bg-gray-100"
          href={`/app/bots/${bot.id}/questions`}
          title="View Questions"
        >
          <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="text-gray-900">
            <LocalStringNum value={bot.questionCount} />
          </span>{' '}
          <span className="text-gray-600">Questions</span>
        </Link>
      </div>
    </div>
  )
}
