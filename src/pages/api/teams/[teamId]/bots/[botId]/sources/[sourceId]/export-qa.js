import { configureFirebaseApp } from '@/config/firebase-server.config'
import { firebaseConfig } from '@/config/firebase-ui.config'
import { getStorage } from 'firebase-admin/storage'
import userTeamCheck from '@/lib/userTeamCheck'
import { getBot, getSource } from '@/lib/dbQueries'
import sendEmail from '@/lib/sendEmail'
import { stringify } from '@vanillaes/csv'
import { mpTrack } from '@/lib/mixpanel'

// this handler will export the question log of a bot to a csv file
const handler = async (req, res) => {
  configureFirebaseApp()
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

  if ('qa' != source.type) {
    return res.status(400).json({ message: `Source type ${source.type} cannot be exported` })
  }

  if (req.method === 'GET') {
    try {
      var csvData = []

      console.log('questions', source.faqs.length)
      // write questions to csv file
      csvData.push(['Question', 'Answer'])
      //loop through source.faqs
      source.faqs.forEach((faq) => {
        csvData.push([faq.question, faq.answer])
      })

      console.log('Export Query done', new Date().toISOString())

      // upload csv file to storage
      const filename = `docsbot_faqs_${bot.id}_${sourceId}.csv`
      const file = bucket.file(`user/${userId}/team/${team.id}/bot/${bot.id}/export/${filename}`)
      await file.save(stringify(csvData))

      // sign url for 7 days
      const url = (
        await file.getSignedUrl({
          action: 'read',
          promptSaveAs: filename,
          expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        })
      )[0]

      console.log('Export Uploaded', new Date().toISOString())

      // disabled for now
      // // email user with link to download csv file
      // const emailBody = `You can download your exported log for ${bot.name} here: ${url}`
      // await sendEmail(userId, `Your exported log for ${bot.name} is ready`, emailBody)

      mpTrack(userId, 'Exported Q&A Source', { "Bot name": bot.name, ip: req.headers['x-forwarded-for'] })

      return res.status(200).json({ url: url })
    } catch (error) {
      return res.status(400).json({ message: error?.message })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
