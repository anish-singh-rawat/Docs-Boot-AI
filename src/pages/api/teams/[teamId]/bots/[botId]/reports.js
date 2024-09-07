import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore } from 'firebase-admin/firestore'
import { getBot, getQuestionCount } from '@/lib/dbQueries'
import userTeamCheck from '@/lib/userTeamCheck'

export default async function handler(req, res) {
  configureFirebaseApp()
  const firestore = getFirestore()

  //check if user has access to team
  let check = null
  try {
    check = await userTeamCheck(req, res)
  } catch (error) {
    return res.status(403).json({ message: error?.message })
  }
  const { userId, team } = check
  const { botId } = req.query

  if (req.method === 'GET') {
    let { month } = req.query

    try {
      const bot = await getBot(team.id, botId)
      if (!bot) {
        // doc.data() will be undefined in this case
        return res.status(404).json({ message: "botId doesn't exist." })
      }
  
      // grab questions within the last week
      const reports = await firestore.collection('teams').doc(team.id).collection('bots').doc(botId).collection('reports').select('id').get()
      const availableReports = reports.docs.map(doc => doc.id)

      //TODO - limit if they are on wrong

      // check if month is valid and available
      if (!month || !availableReports.includes(month)) {
        month = availableReports[0] // default to latest report
      }

      if (month) {
        const report = await firestore.collection('teams').doc(team.id).collection('bots').doc(botId).collection('reports').doc(month).get()
        return res.status(200).json({ availableReports, report: report.data() })
      } else {
        return res.status(200).json({ availableReports, report: null })
      }
      
    } catch (error) {
      console.warn('Error getting document:', error)
      return res.status(500).json({ message: error })
    }
    
  } else {
    return res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
