import { getFirestore, FieldPath } from 'firebase-admin/firestore'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { mpTrack } from '@/lib/mixpanel'
import { teamOwner, bentoTrack } from '@/lib/bento'
import { stripePlan } from '@/utils/helpers'
import { sendReportEmail } from '@/utils/emails'

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
  //get string like "October 2023"
  const reportName =
    currentDate.toLocaleString('default', { month: 'long' }) + ' ' + currentDate.getFullYear()
  let currentYear = currentDate.getFullYear()
  const reportId = `${currentYear}-${currentMonth}`

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
            .select('questionCountHistory', 'status', 'name')
            .get()

          const botPromises = botsSnapshot.docs.map(async (botDoc) => {
            const bot = botDoc.data()
            const report = await botDoc.ref.collection('reports').doc(reportId).get()
            if (report.exists) {
              if (report.data().allQuestions) {
                return Promise.resolve({ botId: botDoc.id, name: bot.name })
              }
            }
          })
          return Promise.resolve({
            teamId: teamDoc.id,
            roles: team.roles,
            name: team.name,
            plan: stripePlan(team).name,
            reports: (await Promise.all(botPromises)).filter(Boolean),
          })
        }
      } catch (error) {
        console.error('Error processing team', teamDoc.id, error)
      }
    })
    const reports = (await Promise.all(teamsPromises)).filter((team) => team && team.reports && team.reports.length > 0)
    console.log(reports.length, 'teams with reports to email')

    reports.forEach(async (report) => {
      Object.keys(report.roles).forEach((userId) => {
        sendReportEmail(userId, reportName, report)
      })
    })

    return response.status(200).json({ reports })
  } catch (error) {
    console.warn('Error queuing reports:', error)

    return response.status(500).json({ message: error })
  }
}
