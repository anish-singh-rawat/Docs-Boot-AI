import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore } from 'firebase-admin/firestore'
import { getBot, getQuestionCount } from '@/lib/dbQueries'
import userTeamCheck from '@/lib/userTeamCheck'
import axios from 'axios'
import { getCarbonCustomerID } from '@/lib/carbon'

export default async function handler(req, res) {
  configureFirebaseApp()

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
    try {
      const bot = await getBot(team.id, botId)
      if (!bot) {
        // doc.data() will be undefined in this case
        return res.status(404).json({ message: "botId doesn't exist." })
      }

      // grab token from carbon
      const response = await axios.get('https://api.carbon.ai/auth/v1/access_token', {
        headers: {
          'Content-Type': 'application/json',
          'customer-id': getCarbonCustomerID(team.id, botId),
          'authorization': `Bearer ${process.env.CARBON_API_KEY}`,
        },
      });
      if (response.status === 200 && response.data) {
        res.status(200).json(response.data);
      } else {
        res.status(500).json({ message: 'Error fetching carbon tokens' })
      }
    } catch (error) {
      console.warn('Error getting document:', error)
      return res.status(500).json({ message: error })
    }
    
  } else {
    return res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
