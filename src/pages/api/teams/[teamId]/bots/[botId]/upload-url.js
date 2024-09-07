import { configureFirebaseApp } from '@/config/firebase-server.config'
import { firebaseConfig } from '@/config/firebase-ui.config'
import userTeamCheck from '@/lib/userTeamCheck'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getBot } from '@/lib/dbQueries'

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

  let bot = null
  try {
    bot = await getBot(team.id, botId)
    if (!bot) {
      // doc.data() will be undefined in this case
      return res.status(404).json({ message: "botId doesn't exist." })
    }
  } catch (error) {
    console.warn('Error getting document:', error)
    return res.status(500).json({ message: error })
  }

  if (req.method === 'GET') {
    const { fileName } = req.query
    try {
      const bucket = getStorage().bucket(`gs://${firebaseConfig.storageBucket}`)

      //set proper file path for user. This is the temp directory where files get cleared after 24 hours
      const newFile = `user/${userId}/team/${team.id}/bot/${bot.id}/${fileName}`
      const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 30 * 60 * 1000, // 30 minutes
        contentType: 'application/octet-stream',
      };

      console.log(newFile)
      // Get a v4 signed URL for uploading file
      const url = (await bucket.file(newFile).getSignedUrl(options))[0];
      return res.status(200).json({ url, file: newFile })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: error?.message })
    }
  } else {
    return res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
