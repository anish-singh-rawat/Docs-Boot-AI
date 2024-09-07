import { getTeam, getBot } from '@/lib/dbQueries'
import { EyeSlashIcon } from '@heroicons/react/24/outline'
import { NextSeo } from 'next-seo'
import Script from 'next/script'

export function ChatPage({ team, bot }) {
  const pageTitle = `${bot.name} Chatbot`

  return (
    <>
      <style>
        {`
          body {
            background-color: transparent !important;
          }
        `}
      </style>
      <NextSeo title={pageTitle} description={bot.description} noindex={true} nofollow={true} />
      {bot.privacy === 'private' ? (
        <main className="mx-auto my-16 max-w-6xl">
          <div className="mb-32 mt-64 text-center">
            <EyeSlashIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
            <h3 className="mt-2 text-2xl font-semibold text-gray-700">Private Bot</h3>
            <p className="mt-4 text-lg text-gray-500">
              Sorry, this bot is private. Only logged in team members can access it.
            </p>
          </div>
        </main>
      ) : (
        <>
          <Script id="docsbot">
            {`window.DocsBotAI=window.DocsBotAI||{},DocsBotAI.init=function(c){return new Promise(function(e,o){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="https://widget.docsbot.ai/chat.js";const n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n),t.addEventListener("load",function(){window.DocsBotAI.mount({id:c.id,supportCallback:c.supportCallback,identify:c.identify,options:c.options,signature:c.signature});let t;t=function(n){return new Promise(function(e){if(document.querySelector(n))return e(document.querySelector(n));const o=new MutationObserver(function(t){document.querySelector(n)&&(e(document.querySelector(n)),o.disconnect())});o.observe(document.body,{childList:!0,subtree:!0})})},t&&t("#docsbotai-root").then(e).catch(o)}),t.addEventListener("error",function(t){o(t.message)})})};
              DocsBotAI.init({id: "${team.id}/${bot.id}"});`}
          </Script>
          <div id="docsbot-widget-embed" className="h-full w-full bg-transparent py-0.5"></div>
        </>
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

  return data
}

export default ChatPage
