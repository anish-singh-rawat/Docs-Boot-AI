import userTeamCheck from '@/lib/userTeamCheck'
import { getBots, getBot } from '@/lib/dbQueries'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { bentoTrack } from '@/lib/bento'
import { createRouter } from 'next-connect'
import { createSchema } from '@/lib/weaviate'
import { stripePlan } from '@/utils/helpers'
import crypto from 'crypto'
import { mpTrack } from '@/lib/mixpanel'
import { validateBotParams } from '@/lib/apiFunctions'

const router = createRouter()

router.post(async (req, res) => {
  configureFirebaseApp()
  const firestore = getFirestore()

  // Check if user has access to the team
  let check = null
  try {
    check = await userTeamCheck(req, res)
  } catch (error) {
    return res.status(403).json({ message: error?.message })
  }
  const { userId, team } = check

  try {
    // Check plan credits
    if (stripePlan(team).bots <= team.botCount) {
      return res.status(402).json({
        message: 'Bot limit exceeded. Please upgrade your plan.',
      })
    }

    // Must have an OpenAI key
    if (!team.openAIKey) {
      return res.status(402).json({
        message: 'Please add an OpenAI key to create bots.',
      })
    }

    // Data validation
    let botData = {}
    try {
      botData = await validateBotParams(req, team, userId, false, null)
    } catch (error) {
      return res.status(400).json({ message: error?.message })
    }

    // Create classname with a random string
    const indexId = `Document_${Math.random().toString(36).substr(2, 10)}`

    // Create schema in weaviate
    createSchema(team, indexId)

    // Create bot in db
    const docRef = await firestore
      .collection('teams')
      .doc(team.id)
      .collection('bots')
      .add({
        ...botData,
        createdAt: FieldValue.serverTimestamp(),
        status: 'pending',
        indexId: indexId,
        sourceCount: 0,
        pageCount: 0,
        chunkCount: 0,
        questionCount: 0,
      })

    const botId = docRef.id

    // Increment botCounts on team
    await firestore.runTransaction(async (transaction) => {
      const teamRef = firestore.collection('teams').doc(team.id)
      const sfDoc = await transaction.get(teamRef)
      if (!sfDoc.exists) {
        throw 'Team does not exist!'
      }

      const newBotCount = (sfDoc.data().botCount || 0) + 1
      transaction.update(teamRef, {
        botCount: newBotCount,
      })
    })

    try {
      bentoTrack(userId, 'track', {
        type: 'createBot',
        botName: botData.name,
      })
      mpTrack(userId, 'Created Bot', { 'Bot name': botData.name, ip: req.headers['x-forwarded-for'] })
    } catch (e) {
      console.log('Error sending tracking', e)
    }

    return res.status(201).json(await getBot(team.id, botId))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: error?.message })
  }
})

router.get(async (req, res) => {
  // Check if user has access to the team
  let check = null
  try {
    check = await userTeamCheck(req, res)
  } catch (error) {
    return res.status(403).json({ message: error?.message })
  }
  const { userId, team } = check

  // TODO add pagination
  try {
    const recentSources = await getBots(team, req.params?.resultLimit || 1000)
    return res.json(recentSources)
  } catch (error) {
    return res.status(500).json({ message: error?.message })
  }
})

export default router.handler({
  onError(error, req, res) {
    res.status(500).json({ message: error?.message })
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` })
  },
})
