import { configureFirebaseApp } from '@/config/firebase-server.config'
import { firebaseConfig } from '@/config/firebase-ui.config'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getBot, getSource } from '@/lib/dbQueries'
import { canSourceTypeDownload } from '@/constants/sourceTypes.constants'
import userTeamCheck from '@/lib/userTeamCheck'
import { mpTrack } from '@/lib/mixpanel'

export default async function handler(req, res) {
  configureFirebaseApp()
  const firestore = getFirestore()
  const bucket = getStorage().bucket(`gs://${firebaseConfig.storageBucket}`)

  //check if user has access to team
  let check = null
  try {
    check = await userTeamCheck(req, res)
  } catch (error) {
    return res.status(403).json({ message: error?.message })
  }
  const { userId, team } = check
  const { botId, sourceId } = req.query

  let bot = null
  let source = null
  try {
    bot = await getBot(team.id, botId)
    if (!bot) {
      // doc.data() will be undefined in this case
      return res.status(404).json({ message: "botId doesn't exist." })
    }
    source = await getSource(team, bot, sourceId)
    if (!source) {
      return res.status(404).json({ message: "sourceId doesn't exist." })
    }
  } catch (error) {
    console.warn('Error getting document:', error)
    return res.status(500).json({ message: error?.message })
  }

  if (!canSourceTypeDownload(source.type) || source?.file === undefined) {
    return res.status(400).json({ message: `Source type ${source.type} cannot be downloaded`})
  }

  if (req.method === 'GET') {
    const file = bucket.file(source.file)

    // sign url for 7 days
    const url = (await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
    }))[0];

    mpTrack(userId, 'Downloaded Source File', { ip: req.headers['x-forwarded-for'] })

    return res.status(200).json({ url })
  } else {
    return res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
