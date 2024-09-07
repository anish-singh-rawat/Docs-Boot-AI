import { useRouter } from 'next/router'
import { useState } from 'react'
import { getAuthorizedUserCurrentTeam } from '@/middleware/getAuthorizedUserCurrentTeam'
import DashboardWrap from '@/components/DashboardWrap'
import Alert from '@/components/Alert'
import { getBot } from '@/lib/dbQueries'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import BotSearch from '@/components/BotSearch'

function Search({ team, bot }) {
    const [errorText, setErrorText] = useState(null)
    const router = useRouter()
    const { botId } = router.query

    if (!bot) return null

    const title = [bot.name, 'Search']

    return (
        <DashboardWrap page="Bots" title={title} team={team} fullWidth={true}>
            <Alert title={errorText} type="warning" />

            <div className="mb-4 flex justify-between">
                <Link
                    href={`/app/bots/${bot.id}`}
                    className="text-md flex items-center font-medium text-gray-500 hover:text-gray-700"
                >
                    <ChevronLeftIcon
                        className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                    />
                    Back
                </Link>
            </div>
            <p className="text-sm mb-8 sm:text-md text-gray-500">
            Search your bot's training data. This is a great way to test what documentation source chunks are being used to answer specific questions.
            </p>
            <BotSearch team={team} bot={bot} setErrorText={setErrorText}/>
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

export default Search
