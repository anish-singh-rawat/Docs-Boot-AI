import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getCarbonCustomerID } from '@/lib/carbon'
import axios from 'axios'
import { getSources } from '@/lib/dbQueries'
import { deleteSource } from '@/lib/apiFunctions'
import { stripePlan } from '@/utils/helpers'
import { QueueSourceIngest } from '@/lib/service'

export default async function handler(request, response) {
  configureFirebaseApp()
  const firestore = getFirestore()

  // this is a public endpoint, however our 'cron' path is protected by a key; TODO: can this be an env var?
  // To test: curl "http://localhost:3000/api/cron/carbon?key=efjlnczww7236912"
  if (!request.query.key || request.query.key !== 'efjlnczww7236912') {
    response.status(404).end()
    return
  }

  // grab all carbon sources
  const sourcesRef = await firestore
    .collectionGroup('sources')
    .where('type', 'in', ['notion', 'google_docs', 'intercom', 'dropbox', 'box', 'zendesk', 'sharepoint'])
    .where('status', 'in', ['pending', 'indexing'])
    .get()

  try {
    const sourcePromises = sourcesRef.docs.map(async (doc) => {
      const source = doc.data()
      const sourceId = doc.id

      const botRef = doc.ref.parent.parent
      const botId = botRef.id
      const bot = { id: botId, ...(await botRef.get()).data() }

      const teamRef = botRef.parent.parent
      const teamId = teamRef.id
      const team = { id: teamId, ...(await teamRef.get()).data() }

      console.log('Checking Carbon status', teamId, botId, sourceId)
      try {
        const headers = {
          headers: {
            'Content-Type': 'application/json',
            'customer-id': getCarbonCustomerID(teamId, botId),
            authorization: `Bearer ${process.env.CARBON_API_KEY}`,
          },
        }

        const sourceFilters = {
          notion: ['NOTION', 'NOTION_DATABASE'],
          google_docs: ['GOOGLE_DRIVE'],
          intercom: ['INTERCOM'],
          dropbox: ['DROPBOX'],
          box: ['BOX'],
          zendesk: ['ZENDESK'],
          sharepoint: ['SHAREPOINT'],
        }

        const carbonFiles = []

        const response = await axios.post(
          `https://api.carbon.ai/user_files_v2`,
          {
            filters: {
              source: sourceFilters[source.type],
            },
            pagination: {
              limit: 10000,
            },
          },
          headers
        )

        if (response.status !== 200) {
          throw new Error(`Carbon API returned status ${response.status}`)
        }

        carbonFiles.push(...response.data.results)

        let newCarbonFiles = []
        let ready = true
        for (const file of carbonFiles) {
          // Do something with the file
          if (file.sync_status !== 'READY' && file.sync_status !== 'SYNC_ERROR') {
            ready = false
          }

          if (file.sync_status !== 'SYNC_ERROR') {
            newCarbonFiles.push({
              id: file.id,
              name: file.name || file.title || 'DB Item', //gdocs has name, others have title
              url: file.external_url,
              type: file.file_statistics?.file_format || file.source,
              status: file.sync_status,
            })
          }
        }

        //if this will exceed the page count, fail and return
        if (newCarbonFiles.length + team.pageCount > stripePlan(team).pages) {
          throw new Error( `This source has ${newCarbonFiles.length} pages, exceeding the remaining plan limit of ${stripePlan(team).pages - team.pageCount}. Please upgrade your plan.`)
        }

        //update source
        doc.ref.update({
          status: 'indexing', //avoid race condition since it's a 1min cron and 5min timeout
          pageCount: newCarbonFiles.length,
          carbonFiles: newCarbonFiles, //update carbon files with new int ids for delete later
        })

        console.log(newCarbonFiles.length, 'Carbon files, ready:', ready, teamId, botId, sourceId)

        if (ready) {

          await QueueSourceIngest(
            teamId,
            botId,
            sourceId,
            stripePlan(team).pages - team.pageCount,
            bot.indexId,
            'carbon',
            source.title, //null
            source.url,
            source.file, //null
            source.faqs //null
          )
          console.log('Source', teamId, botId, sourceId, 'queued for ingest')

          //TODO ideally we should wait for the ingest to complete before deleting the source
          // we only allow unique carbon type sources per bot, so we'll need to check if a carbon type.
          // if it does, we'll need to delete it
          const data = await getSources(teamId, bot, 0, 1000)
          const existingSources = data.sources.filter(
            (oldSource) => oldSource.type === source.type && oldSource.id !== sourceId
          )
          // loop through existing sources and delete them
          const newIds = [source.carbonId]
          await existingSources.forEach(async (existingSource) => {
            newIds.push(existingSource.carbonId)
            console.log('Deleting old existing source', existingSource.id)
            await deleteSource(teamId, bot, existingSource.id, false) //don't delete files from carbon as they might be resused
          })
          //update source with list of cloud logins
          doc.ref.update({
            carbonId: newIds.join(', '),
          })
        } else {
          console.log('Source not ready yet in Carbon', teamId, botId, sourceId)
        }
      } catch (error) {
        console.log(doc.id, 'carbon cron error:', error)

        doc.ref.update({
          status: 'failed',
          error: error.message,
        })
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
