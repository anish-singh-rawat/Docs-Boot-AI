import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { getAuthorizedUserCurrentTeam } from '@/middleware/getAuthorizedUserCurrentTeam'
import DashboardWrap from '@/components/DashboardWrap'
import Alert from '@/components/Alert'
import { getBot, getSources } from '@/lib/dbQueries'
import BotCard from '@/components/BotCard'
import SourceForm from '@/components/SourceForm'
import SourceGrid from '@/components/SourceGrid'
import SourceFailed from '@/components/SourceFailed'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

const sourcePerPage = 60

function Bot({ team, preBot, preSources, autoOpenSourceId }) {
  const [sources, setSources] = useState(preSources?.sources)
  const [paginationData, setPaginationData] = useState(preSources?.pagination)
  const [page, setPage] = useState(preSources?.pagination?.page || 0)
  const [perPage] = useState(sourcePerPage)
  const [bot, setBot] = useState(preBot)
  const [errorText, setErrorText] = useState(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [autoOpenSourceIdState, setAutoOpenSourceIdState] = useState(autoOpenSourceId)
  const router = useRouter()
  const { botId } = router.query

  async function refreshBot() {

    const urlParams = ['teams', team.id, 'bots', botId]
    let path = '/api/' + urlParams.join('/')
    const response = await fetch(path, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      setBot(data)
      setErrorText('')
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
    }
  }

  async function refreshSources() {

    const urlParams = ['teams', team.id, 'bots', botId, 'sources']
    let path = '/api/' + urlParams.join('/') + `?page=${page}&limit=${perPage}`
    const response = await fetch(path, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      setSources(data.sources)
      setPaginationData(data.pagination)
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
    }
  }

  const handleChangePage = (page) => {
    setPage(page)
  }

  useEffect(() => {
    refreshSources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  //restart polling when sources change
  useEffect(() => {
    let interval = null
    if (bot) {
      if (isProcessing && !interval) {
        clearInterval(interval)
        interval = setInterval(() => {
          refreshBot()
          refreshSources()
        }, 10000)
      }
      if (!isProcessing && interval) {
        clearInterval(interval)
      }
    }

    return () => clearInterval(interval)
  }, [isProcessing])

  useEffect(() => {
    //set processing if there are any sources with status 'indexing'
    if (sources.some((source) => ['pending', 'indexing', 'processing'].includes(source.status))) {
      setIsProcessing(true)
    } else {
      setIsProcessing(false)
    }

    refreshBot()
  }, [sources])

  const deleteSource = async (id) => {
    setErrorText('')
    const response = await fetch(`/api/teams/${team.id}/bots/${bot.id}/sources/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      setSources((prev) => prev.filter((source) => source.id !== id))
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
    }
  }

  const retrySource = async (id) => {
    setErrorText('')
    const response = await fetch(`/api/teams/${team.id}/bots/${bot.id}/sources/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      setSources((prev) => prev.map((source) => source.id === id ? data : source))
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
    }
  }

  if (!bot) return null

  return (
    <DashboardWrap page="Bots" title={bot.name} team={team}>
      <Alert title={errorText} type="warning" />
      <div className="mb-4 flex justify-start">
        <Link
          href={`/app/bots`}
          className="text-md flex items-center font-medium text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon
            className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400"
            aria-hidden="true"
          />
          Back
        </Link>
      </div>
      <BotCard team={team} bot={bot} setBot={setBot} />
      <SourceFailed {...{ sources, deleteSource, retrySource }} />

      <SourceGrid {...{ team, bot, sources, setSources, autoOpenSourceId: autoOpenSourceIdState, paginationData, handleChangePage, retrySource }} />

      <SourceForm {...{ team, bot, sources, setSources, setOpenSourceID: setAutoOpenSourceIdState }} />
    </DashboardWrap>
  )
}

export const getServerSideProps = async (context) => {
  const data = await getAuthorizedUserCurrentTeam(context)
  const { botId } = context.params
  const { sourceId } = context.query

  if (data?.props?.team) {
    data.props.preBot = await getBot(data.props.team.id, botId)
    //return 404 if bot doesn't exist
    if (!data.props.preBot) {
      return {
        notFound: true,
      }
    }

    data.props.preSources = await getSources(data.props.team.id, data.props.preBot, 0, sourcePerPage)
    data.props.autoOpenSourceId = sourceId ? sourceId : null
  }

  return data
}

export default Bot
