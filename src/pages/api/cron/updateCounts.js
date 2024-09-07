import { getFirestore, FieldPath } from 'firebase-admin/firestore'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getQuestionCount } from '@/lib/dbQueries'
import { mpTrack } from '@/lib/mixpanel'
import { teamOwner, bentoTrack } from '@/lib/bento'

export default async function handler(request, response) {
  configureFirebaseApp()
  const firestore = getFirestore()

  if (!request.query.key || request.query.key !== 'aowidjaowd3721') {
    response.status(404).end()
    return
  }

  console.log('cron updateCounts started!')

  try {
    const teamsSnapshot = await firestore
      .collection('teams')
      .where('needsUpdate', '==', true)
      //.limit(5)
      .get()

    const teamsPromises = teamsSnapshot.docs.map(async (teamDoc) => {
      console.log('team', teamDoc.id, 'is scheduled to have the counts updated...')

      try {
        let currentDate = new Date()
        let currentMonth = currentDate.getMonth()
        let currentYear = currentDate.getFullYear()

        const teamData = teamDoc.data()
        const botsSnapshot = await teamDoc.ref
          .collection('bots')
          .select('questionCountHistory', 'name', 'embedded')
          .get()

        let questionTotal = 0
        let pageTotal = 0
        let sourceTotal = 0
        const botCounts = []

        for (const botDoc of botsSnapshot.docs) {
          const questionCount = await getQuestionCount(teamDoc.id, botDoc.id)

          // grab the # of source pages
          const sourcesSnapshot = await botDoc.ref.collection('sources').select('pageCount').get()
          const sourceCount = sourcesSnapshot.size
          const sourcePages = sourcesSnapshot.docs.map((sourceDoc) => sourceDoc.data().pageCount)
          const pageCount = sourcePages.reduce(
            (accumulator, count) => accumulator + count,
            0
          )

          const prevHistory = botDoc.data().questionCountHistory || {}

          const botData = {
            questionCount: questionCount,
            pageCount: pageCount,
            sourceCount: sourceCount,
            questionCountHistory: {
              ...prevHistory,
              [`${currentYear}-${currentMonth}`]: questionCount,
            },
          }

          //handle tracking if the bot was used
          const embedded = botDoc.data().embedded || false
          if (embedded == 'yes') {
            try {
              bentoTrack(teamOwner(teamData), 'track', {
                type: 'botUsed',
                botName: botDoc.data().name,
              })
              mpTrack(teamOwner(teamData), 'Bot Used', { 'Bot name': botDoc.data().name })
            } catch (error) {
              console.warn('Error tracking bot used:', error)
            }
            botData.embedded = 'recorded'
          }

          // update bot count
          await botDoc.ref.update(botData)

          botCounts.push({ questionCount, pageCount, sourceCount })
        }

        // take and sum the results
        for (const { questionCount, pageCount, sourceCount } of botCounts) {
          questionTotal += questionCount
          pageTotal += pageCount
          sourceTotal += sourceCount
        }

        console.log(
          'team',
          teamDoc.id,
          'has',
          questionTotal,
          'questions,',
          sourceTotal,
          'sources,',
          pageTotal,
          'source pages'
        )

        // update team count && needsUpdate
        const prevHistory = teamData.questionCountHistory || {}
        await teamDoc.ref.update({
          questionCount: questionTotal,
          pageCount: pageTotal,
          sourceCount: sourceTotal,
          questionCountHistory: {
            ...prevHistory,
            [`${currentYear}-${currentMonth}`]: questionTotal,
          },
          needsUpdate: false,
        })
      } catch (error) {
        console.warn(`Error updating team ${teamDoc.id} counts:`, error)
        return
      }
    })

    await Promise.all(teamsPromises)
  } catch (error) {
    console.warn('Error updating counts:', error)
    response.status(500).json({ message: error })
    return
  }

  response.status(200).json({ success: true })
}
