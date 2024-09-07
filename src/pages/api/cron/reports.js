import { getFirestore, FieldPath } from 'firebase-admin/firestore'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { mpTrack } from '@/lib/mixpanel'
import { teamOwner, bentoTrack } from '@/lib/bento'
import { stripePlan } from '@/utils/helpers'
import { QueueReport } from '@/lib/service'

export default async function handler(request, response) {
  configureFirebaseApp()
  const firestore = getFirestore()

  if (!request.query.key || request.query.key !== '34hjslm8492hs521ds') {
    response.status(404).end()
    return
  }

  let currentDate = new Date()
  currentDate.setMonth(currentDate.getMonth() - 1)
  let currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0')
  let statsMonth = currentDate.getMonth()
  let currentYear = currentDate.getFullYear()
  const reportId = `${currentYear}-${currentMonth}`
  const historyKey = `${currentYear}-${statsMonth}`

  console.log('Cron reports started for month', reportId)

  try {
    const teamsSnapshot = await firestore
      .collection('teams')
      .where('stripeSubscriptionStatus', '==', 'active')
      .get()

    const teamsPromises = teamsSnapshot.docs.map(async (teamDoc) => {
      try {
        const team = teamDoc.data()
        //check if team is Business
        if (stripePlan(team).bots < 100) {
          //console.log('Skipping team', teamDoc.id, 'is not Business+')
          return
        } else {
          const botsSnapshot = await teamDoc.ref
            .collection('bots')
            .select('questionCountHistory', 'status')
            .get()

          const botPromises = botsSnapshot.docs.map(async (botDoc) => {
            const bot = botDoc.data()
            //check basic question counts
            if (
              bot.status !== 'ready' ||
              !bot.questionCountHistory ||
              !bot.questionCountHistory[historyKey] ||
              bot.questionCountHistory[historyKey] < 100
            ) {
              //console.log('Skipping bot', teamDoc.id, botDoc.id, 'has no question count for', reportId);
              return
            } else {
              const report = await botDoc.ref.collection('reports').doc(reportId).get()
              if (report.exists) {
                //console.log('Skipping bot', teamDoc.id, botDoc.id, 'already has report for', reportId)
                return
              } else {
                console.log('Queueing report for', teamDoc.id, botDoc.id, 'for', reportId)
                QueueReport(teamDoc.id, botDoc.id)
              }
            }
          })
          await Promise.all(botPromises)
        }
      } catch (error) {
        console.error('Error processing team', teamDoc.id, error)
      }
    })
    await Promise.all(teamsPromises)
  } catch (error) {
    console.warn('Error queuing reports:', error)
    response.status(500).json({ message: error })
    return
  }

  response.status(200).json({ success: true })
}
