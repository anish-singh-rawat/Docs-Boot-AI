import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { QueueSourceIngest } from '@/lib/service'
import axios from 'axios'

export default async function handler(request, response) {
  configureFirebaseApp()
  const firestore = getFirestore()

  // this is a public endpoint, however our 'cron' path is protected by a key; TODO: can this be an env var?
  if (!request.query.key || request.query.key !== 'efjl95hdjysgq26912') {
    response.status(404).end()
    return
  }

  // select sources being crawled by apify
  const sourcesRef = await firestore
    .collectionGroup('sources')
    .where('type', 'in', ['urls', 'sitemap'])
    .where('status', '==', 'indexing')
    .get()
  try {
    console.log(sourcesRef.size, 'sources found indexing')
    const sourcePromises = sourcesRef.docs.map(async (doc) => {
      const source = doc.data()
      console.log('source', doc.id, 'checking if apify crawler is done')

      const botRef = doc.ref.parent.parent
      const botId = botRef.id
      const bot = { id: botId, ...(await botRef.get()).data() }

      const teamRef = botRef.parent.parent
      const teamId = teamRef.id

      try {
        // fetch the run
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }
        const run_url = `https://api.apify.com/v2/actor-runs/${source.crawlId}`
        const params = {
          token: process.env.APIFY_TOKEN,
        }
        const result = await axios.get(run_url, { headers, params })

        if (result.status !== 200) {
          throw new Error(`Apify API returned status ${response.status}`)
        }

        console.log('Source', doc.id, 'apify crawler status:', result.data.data.statusMessage)
        // if the run is finished, trigger an ingest pub/sub message
        if (result.data.data.status === 'SUCCEEDED') {
          await QueueSourceIngest(
            teamId,
            botId,
            doc.id,
            1000000, //this was checked before starting the crawler
            bot.indexId,
            'crawler',
            source.title, //null
            source.url,
            source.file, //null
            source.faqs, //null
            source.crawlId
          )
          //await doc.ref.update({ status: 'processing' }) // the Cloud funciton marks the source as processing to prevent multiple crawler ingests
          console.log('source', doc.id, 'ingest queued')
        } else if (result.data.status === 'FAILED') {
          // if the run failed, mark the source as failed
          await doc.ref.update({ status: 'failed' })
          console.log('source', doc.id, 'failed')
        }
      } catch (error) {
        console.log(doc.id, 'Cron error:', error)
      }
    })
    await Promise.all(sourcePromises)
  } catch (error) {
    console.warn('Error getting document:', error)
    response.status(500).json({ message: error })
    return
  }

  response.status(200).json({ success: true })
}
