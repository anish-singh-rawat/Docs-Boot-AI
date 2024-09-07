import { useState, useEffect, useRef } from 'react'
import { getAuthorizedUserCurrentTeam } from '@/middleware/getAuthorizedUserCurrentTeam'
import DashboardWrap from '@/components/DashboardWrap'
import Alert from '@/components/Alert'
import { getBot } from '@/lib/dbQueries'
import BotHistory from '@/components/BotHistory'
import BotReport from '@/components/BotReport'
import { QueueListIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

function Reports({ team, bot }) {
  const [errorText, setErrorText] = useState(null)
  const [infoText, setInfoText] = useState(null)

  if (!bot) return null

  const title = [bot.name, 'Reports']

  return (
    <DashboardWrap page="Bots" title={title} team={team}>
      <Alert title={infoText} type="info" />
      <Alert title={errorText} type="warning" />

      <div className="mb-4 flex justify-between">
        <Link
          href={`/app/bots/${bot.id}`}
          className="text-md flex items-center font-medium text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400" aria-hidden="true" />
          Back
        </Link>
        <Link
          href={`/app/bots/${bot.id}/questions`}
          className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <QueueListIcon className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
          Logs
        </Link>
      </div>

      <BotHistory team={team} botId={bot.id} />

      <BotReport team={team} bot={bot} />
    </DashboardWrap>
  )
}

export const getServerSideProps = async (context) => {
  const data = await getAuthorizedUserCurrentTeam(context)
  const { botId } = context.params

  if (data?.props?.team) {
    data.props.bot = await getBot(data.props.team.id, botId)
    //return 404 if bot doesn't exist
    if (!data.props.bot) {
      return {
        notFound: true,
      }
    }
  }

  return data
}

export default Reports
