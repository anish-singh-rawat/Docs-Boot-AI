import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getBot, getSource } from '@/lib/dbQueries'
import { QueueSourceRegest } from '@/lib/service'
import { checkSourceScheduledFromInterval } from '@/utils/helpers'
import { bentoTrack } from '@/lib/bento'
import { mpTrack } from '@/lib/mixpanel'
import { canSourceTypeSchedule } from '@/constants/sourceTypes.constants'
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

  if (req.method === 'PUT') {
    if (!canSourceTypeSchedule(source.type)) {
      return res
        .status(403)
        .json({ message: 'Only sources of a dynamic type (URLs) can be refreshed!' })
    }

    try {
      const { scheduleInterval } = req.body

      // if interval is none, remove the scheduled field
      if (scheduleInterval === 'none') {
        firestore
          .collection('teams')
          .doc(team.id)
          .collection('bots')
          .doc(botId)
          .collection('sources')
          .doc(sourceId)
          .update({
            scheduled: FieldValue.delete(),
            scheduleInterval: scheduleInterval,
          })
        return res.status(200).json({ message: 'success' })
      }

      const scheduled = checkSourceScheduledFromInterval(team, scheduleInterval)
      firestore
        .collection('teams')
        .doc(team.id)
        .collection('bots')
        .doc(botId)
        .collection('sources')
        .doc(sourceId)
        .update({
          scheduled,
          scheduleInterval: scheduleInterval,
        })

      mpTrack(userId, 'Source Refreshed', { ip: req.headers['x-forwarded-for'] })

      return res.status(200).json({ newScheduled: scheduled.toJSON() })
    } catch (error) {
      console.warn('Error setting source interval:', error)
      return res.status(500).json({ message: error?.message })
    }
  } else if (req.method === 'PATCH') {
    try {
      const { faqs } = req.body

      if (source.type !== 'qa') {
        return res.status(403).json({ message: "Only sources of type 'qa' can be updated!" })
      }

      // validate request body
      if (!faqs || !Array.isArray(faqs)) {
        return res.status(400).json({ message: 'Invalid request body' })
      }

      for (const faq of faqs) {
        if (!faq.question || !faq.answer || faq.answer.length === 0 || faq.question.length === 0) {
          return res.status(400).json({ message: 'Invalid request body' })
        }
      }

      await firestore
        .collection('teams')
        .doc(team.id)
        .collection('bots')
        .doc(botId)
        .collection('sources')
        .doc(sourceId)
        .update({
          faqs,
        })

      await QueueSourceRegest(team.id, botId, sourceId)

      mpTrack(userId, 'Q&A Source Updated', { ip: req.headers['x-forwarded-for'] })

      return res.status(200).json(await getSource(team, bot, sourceId))
    } catch (error) {
      console.warn('Error updating source:', error)
      return res.status(500).json({ message: error?.message })
    }
  } else if (req.method === 'POST') {
    if (!canSourceTypeSchedule(source.type)) {
      return res
        .status(403)
        .json({ message: 'Only sources of a dynamic type (URLs) can be refreshed!' })
    }

    try {
      if (!source.scheduleInterval || source.scheduleInterval === 'none') {
        await QueueSourceRegest(team.id, botId, sourceId)
        return res.status(200).json({ message: 'success' })
      }

      // grab next schedule date
      const nextSchedule = checkSourceScheduledFromInterval(team, source.scheduleInterval)

      // update and reingest source
      await firestore
        .collection('teams')
        .doc(team.id)
        .collection('bots')
        .doc(botId)
        .collection('sources')
        .doc(sourceId)
        .update({
          scheduled: nextSchedule,
        })

      await QueueSourceRegest(team.id, botId, sourceId)

      mpTrack(userId, 'Source Refreshed', { ip: req.headers['x-forwarded-for'] })

      return res.status(200).json({ newScheduled: nextSchedule.toJSON() })
    } catch (error) {
      console.warn('Error setting source interval:', error)
      return res.status(500).json({ message: error?.message })
    }
  } else {
    return res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
