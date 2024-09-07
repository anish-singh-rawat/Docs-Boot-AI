import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { QueueSourceRegest } from '@/lib/service'
import { checkSourceScheduledFromInterval } from '@/utils/helpers'
import { getTeam } from '@/lib/dbQueries'

export default async function handler(request, response) {
  configureFirebaseApp()
  const firestore = getFirestore()

  // this is a public endpoint, however our 'cron' path is protected by a key; TODO: can this be an env var?
  if (!request.query.key || request.query.key !== 'iuefhisue24182') {
    response.status(404).end()
    return
  }

  console.log('cron reingest started!')

  // select scheduled sources based on current time
  const currentTime = Timestamp.now()
  const sourcesRef = await firestore
    .collectionGroup('sources')
    .where('scheduled', '<=', currentTime)
    .get()
  try {
    sourcesRef.forEach(async (doc) => {
      const source = doc.data()
      console.log(
        'source',
        doc.id,
        'is scheduled to be reingested at',
        source.scheduled.toDate(),
        ' -- reingesting...'
      )

      const botRef = doc.ref.parent.parent
      const botId = botRef.id

      const teamRef = botRef.parent.parent
      const teamId = teamRef.id

      try {
        // grab next schedule date
        const nextSchedule = checkSourceScheduledFromInterval(
          await getTeam(teamId),
          source.scheduleInterval
        )

        // update and reingest source
        await doc.ref.update({
          scheduled: nextSchedule,
        })

        await QueueSourceRegest(teamId, botId, doc.id)
      } catch (error) {
        console.log(doc.id, 'refresh error:', error)

        // remove schedule
        doc.ref.update({
          scheduled: FieldValue.delete(),
          scheduleInterval: 'none',
        })
        // ignore reingestion errors
        return
      }
    })
  } catch (error) {
    console.warn('Error getting document:', error)
    response.status(500).json({ message: error })
    return
  }

  response.status(200).json({ success: true })
}
