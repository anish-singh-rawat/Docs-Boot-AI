import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { getTeam, getBot } from '@/lib/dbQueries'
import ChatStreaming from '@/components/ChatStreaming'
import docsbotLogo from '@/images/docsbot-logo.png'
import { EyeSlashIcon } from '@heroicons/react/24/outline'
import { stripePlan, grabQuestions } from '@/utils/helpers'
import { NextSeo } from 'next-seo'

export function ChatPage({ team, bot }) {
  const pageTitle = `${bot.name} Chatbot`

  return (
    <>
      <NextSeo title={pageTitle} description={bot.description} noindex={true} nofollow={true} />
      <main className="mx-auto my-16 max-w-6xl">
        {bot.privacy === 'private' ? (
          <div className="mb-32 mt-64 text-center">
            <EyeSlashIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
            <h3 className="mt-2 text-2xl font-semibold text-gray-700">Private Bot</h3>
            <p className="mt-4 text-lg text-gray-500">
              Sorry, this bot is private. Only logged in team members can access it.
            </p>
          </div>
        ) : (
          <ChatStreaming teamId={team.id} bot={bot} />
        )}
      </main>
      {stripePlan(team).bots < 10 && (
        <div className="mb-4 mt-32 text-center">
          <p className="flex items-center justify-center text-lg text-teal-600">
            <span className="mb-2 block">{bot.labels.poweredBy}</span>
            <Link href="/" target="_blank" className="ml-1 block">
              <span className="sr-only">DocsBot AI</span>
              <Image className="" src={docsbotLogo} alt="DocsBot Logo" height={24} width={95} />
            </Link>
          </p>
          <p>
            <Link
              href="/"
              target="_blank"
              className="text-sm text-gray-500 underline hover:text-gray-600"
            >
              {bot.labels.create}
            </Link>
          </p>
        </div>
      )}
    </>
  )
}

export const getServerSideProps = async (context) => {
  const { teamId, botId } = context.params

  const data = { props: {} }
  data.props.team = await getTeam(teamId)
  data.props.bot = await getBot(teamId, botId)
  //return 404 if bot doesn't exist
  if (!data.props.bot) {
    return {
      notFound: true,
    }
  }

  data.props.bot.questions = grabQuestions(data.props.bot)

  return data
}

export default ChatPage
