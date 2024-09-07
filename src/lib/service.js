import { PubSub } from '@google-cloud/pubsub'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getTeam } from '@/lib/dbQueries'
import { stripePlan } from '@/utils/helpers'
import { isCarbonSourceType } from '@/constants/sourceTypes.constants'

const SERVICE_ACCOUNT = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
const PUBSUB_CLIENT = new PubSub({
  projectId: SERVICE_ACCOUNT.project_id,
  credentials: SERVICE_ACCOUNT,
})
const PUBSUB_TOPIC = 'docsbot-ingest'
const PUBSUB_REPORTS_TOPIC = 'docsbot-report'

export const QueueSourceIngest = async (
  teamId,
  botId,
  sourceId,
  pageLimit,
  indexId,
  type,
  title,
  url,
  file,
  faqs,
  runId = null
) => {
  const dataBuffer = Buffer.from(
    JSON.stringify({
      action: 'ingest',
      teamId,
      botId,
      sourceId,
      pageLimit,
      indexId,
      type,
      title,
      url,
      file,
      faqs,
      runId,
    })
  )
  // console.log(JSON.stringify({
  //   action: 'ingest',
  //   teamId,
  //   botId,
  //   sourceId,
  //   pageLimit,
  //   indexId,
  //   type,
  //   title,
  //   url,
  //   file,
  // }))
  const messageId = await PUBSUB_CLIENT.topic(PUBSUB_TOPIC).publishMessage({ data: dataBuffer })
  console.log(`Message ${messageId} published to ${PUBSUB_TOPIC}.`)
  return messageId
}

export const QueueSourceExpel = async (teamId, indexId, botId, sourceId) => {
  const dataBuffer = Buffer.from(
    JSON.stringify({
      action: 'expel',
      teamId,
      botId,
      indexId,
      sourceId,
    })
  )
  const messageId = await PUBSUB_CLIENT.topic(PUBSUB_TOPIC).publishMessage({ data: dataBuffer })
  console.log(`Message ${messageId} published to ${PUBSUB_TOPIC}.`)
  return messageId
}

export const QueueSourceRegest = async (teamId, botId, sourceId) => {
  const firestore = getFirestore()

  // check and update status to 'pending'
  let isCarbon = false
  const sourceRef = firestore
    .collection('teams')
    .doc(teamId)
    .collection('bots')
    .doc(botId)
    .collection('sources')
    .doc(sourceId)
  const source = await sourceRef.get()
  const sourceData = source.data()
  if (sourceData.status !== 'ready' && sourceData.status !== 'failed') {
    throw new Error("Cannot refresh source that is not 'ready' or 'failed.")
  }

  const data = {
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    refreshing: true,
  }

  sourceRef.update(data)

  //skip pubsub if carbon, as it uses NextJS Vercel cron that just looks for pending
  if (isCarbon) {
    return true
  }

  // grab pageLimit
  const team = await getTeam(teamId)
  const pageLimit = stripePlan(team).pages - team.pageCount

  const dataBuffer = Buffer.from(
    JSON.stringify({
      action: 'regest',
      teamId,
      botId,
      sourceId,
      pageLimit,
    })
  )

  const messageId = await PUBSUB_CLIENT.topic(PUBSUB_TOPIC).publishMessage({ data: dataBuffer })
  console.log(`Message ${messageId} published to ${PUBSUB_TOPIC}.`)
  return messageId
}

export const QueueReport = async (teamId, botId) => {
  const dataBuffer = Buffer.from(
    JSON.stringify({
      action: 'report',
      teamId,
      botId,
    })
  )
  const messageId = await PUBSUB_CLIENT.topic(PUBSUB_REPORTS_TOPIC).publishMessage({ data: dataBuffer })
  console.log(`Message ${messageId} published to ${PUBSUB_REPORTS_TOPIC}.`)
  return messageId
}
