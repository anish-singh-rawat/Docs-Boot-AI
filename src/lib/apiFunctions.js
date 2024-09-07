import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore, FieldPath } from 'firebase-admin/firestore'
import { firebaseConfig } from '@/config/firebase-ui.config'
import { getStorage } from 'firebase-admin/storage'
import { getBot } from '@/lib/dbQueries'
import { deleteSchema } from '@/lib/weaviate'
import { QueueSourceExpel } from '@/lib/service'
import { isCarbonSourceType } from '@/constants/sourceTypes.constants'
import { getCarbonCustomerID } from '@/lib/carbon'
import axios from 'axios'
import { stripePlan, isSuperAdmin } from '@/utils/helpers'
import { i18n } from '@/constants/strings.constants'
import crypto from 'crypto'

export const deleteSource = async (teamId, bot, sourceId, deleteCarbon = true) => {
  configureFirebaseApp()
  const firestore = getFirestore()

  //if source is in a ready state, we need to delete it from weaviate
  QueueSourceExpel(teamId, bot.indexId, bot.id, sourceId)

  //delete source from db
  let source = null
  await firestore.runTransaction(async (transaction) => {
    const teamRef = firestore.collection('teams').doc(teamId)
    const botRef = teamRef.collection('bots').doc(bot.id)
    const sourceRef = botRef.collection('sources').doc(sourceId)
    const teamDoc = await transaction.get(teamRef)
    const botDoc = await transaction.get(botRef)
    const sourceDoc = await transaction.get(sourceRef)
    if (!teamDoc.exists) {
      throw 'Team does not exist!'
    }

    source = sourceDoc.data()

    // decrement team counts (if the source was ingested)
    if (sourceDoc.data().status == 'ready' || sourceDoc.data().status == 'failed') {
      const newTeamSourceCount = (teamDoc.data().sourceCount || 0) - 1
      const newTeamChunkCount = (teamDoc.data().chunkCount || 0) - sourceDoc.data().chunkCount
      const newTeamPageCount = (teamDoc.data().pageCount || 0) - sourceDoc.data().pageCount
      transaction.update(teamRef, {
        sourceCount: newTeamSourceCount,
        chunkCount: newTeamChunkCount,
        pageCount: newTeamPageCount,
        needsUpdate: true,
      })

      // decrement bot counts
      const newBotSourceCount = (botDoc.data().sourceCount || 0) - 1
      const newBotChunkCount = (botDoc.data().chunkCount || 0) - sourceDoc.data().chunkCount
      const newBotPageCount = (botDoc.data().pageCount || 0) - sourceDoc.data().pageCount
      const newBotStatus = newBotSourceCount == 0 ? 'pending' : 'ready'
      transaction.update(botRef, {
        sourceCount: newBotSourceCount,
        chunkCount: newBotChunkCount,
        pageCount: newBotPageCount,
        status: newBotStatus,
      })
    }

    // remove source
    transaction.delete(sourceRef)
  })

  // for Carbon sources we need to delete the files from the Carbon API
  /*
  if (deleteCarbon && isCarbonSourceType(source.type)) {
    try {
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          'customer-id': getCarbonCustomerID(teamId, bot.id),
          authorization: `Bearer ${process.env.CARBON_API_KEY}`,
        },
      }

      await Promise.all(
        source.carbonFiles.map(async (file) => {
          if (file.fileId) {
            // https://api.carbon.ai/redoc#tag/user_files/operation/del_file_deletefile__file_id__delete
            const resp = await axios.delete(
              `https://api.carbon.ai/deletefile/${file.fileId}`,
              {},
              headers
            )
            console.log('Deleted file from Carbon API', resp.status)
          }
        })
      )
    } catch (e) {
      console.log('Error deleting file from Carbon API', e)
    }
  }
  */

  return true
}

export const deleteBot = async (teamId, botId) => {
  configureFirebaseApp()
  const firestore = getFirestore()
  const bot = await getBot(teamId, botId)

  //delete bot from db

  // Delete all sources for bot
  const querySnapshot = await firestore
    .collection('teams')
    .doc(teamId)
    .collection('bots')
    .doc(botId)
    .collection('sources')
    .select(FieldPath.documentId()) //less data to retrieve
    .get()

  // Once we get the results, begin a batch
  let toDelete = []
  querySnapshot.forEach(function (doc) {
    toDelete.push(doc.ref)
  })

  //loop through toDelete and delete in batches of 500
  let counter = 0
  let sourcesBatch = firestore.batch()
  for (let i = 0; i < toDelete.length; i++) {
    sourcesBatch.delete(toDelete[i])
    counter++
    // Commit the batch every 50 operations
    if (counter % 50 === 0) {
      await sourcesBatch.commit()
      sourcesBatch = firestore.batch()
    }
  }
  // Commit the remaining batch
  await sourcesBatch.commit()

  // Delete all questions for bot
  const questionsSnapshot = await firestore
    .collection('teams')
    .doc(teamId)
    .collection('bots')
    .doc(botId)
    .collection('questions')
    .select(FieldPath.documentId()) //less data to retrieve
    .get()
  // Once we get the results, begin a batch
  toDelete = []
  questionsSnapshot.forEach(function (doc) {
    toDelete.push(doc.ref)
  })
  //loop through toDelete and delete in batches of 500
  counter = 0
  let questionsBatch = firestore.batch()
  for (let i = 0; i < toDelete.length; i++) {
    questionsBatch.delete(toDelete[i])
    counter++
    // Commit the batch every 50 operations
    if (counter % 50 === 0) {
      await questionsBatch.commit()
      questionsBatch = firestore.batch()
    }
  }
  // Commit the remaining batch
  await questionsBatch.commit()

  //delete bot
  await firestore.collection('teams').doc(teamId).collection('bots').doc(botId).delete()

  //decrement botCounts on team
  await firestore.runTransaction(async (transaction) => {
    const teamRef = firestore.collection('teams').doc(teamId)
    const sfDoc = await transaction.get(teamRef)
    if (!sfDoc.exists) {
      throw 'Team does not exist!'
    }

    const newBotCount = Math.max(0, (sfDoc.data().botCount || 0) - 1)
    const newSourceCount = Math.max(0, (sfDoc.data().sourceCount || 0) - (bot.sourceCount || 0))
    const newPageCount = Math.max(0, (sfDoc.data().pageCount || 0) - (bot.pageCount || 0))
    const newChunkCount = Math.max(0, (sfDoc.data().chunkCount || 0) - (bot.chunkCount || 0))
    transaction.update(teamRef, {
      botCount: newBotCount,
      sourceCount: newSourceCount,
      pageCount: newPageCount,
      chunkCount: newChunkCount,
    })
  })

  //delete all bot data from bucket
  const bucket = getStorage().bucket(`gs://${firebaseConfig.storageBucket}`)
  await bucket.deleteFiles({ prefix: `teams/${teamId}/bots/${botId}` })

  //delete schema in weaviate async
  if (bot.indexId) {
    try {
      deleteSchema(bot.indexId)
    } catch (error) {
      console.warn('Error deleting Weaviate Schema:', error)
    }
  }

  return true
}

export function validateBotParams(req, team, userId, isUpdate, bot) {
  const {
    name,
    description,
    privacy,
    model,
    language,
    customPrompt,
    allowedDomains,
    color,
    icon,
    alignment,
    botIcon,
    branding,
    supportLink,
    showButtonLabel,
    labels,
    questions,
    rateLimitMessages,
    rateLimitSeconds,
    rateLimitIPAllowlist,
    hideSources,
    logo,
    headerAlignment,
    resetkey,
    recordIP,
  } = req.body

  const botData = {}

  if (name !== undefined) {
    if (name.trim().length > 0) {
      botData.name = name.trim()
    } else {
      throw new Error('Bot name is required.')
    }
  } else if (!isUpdate) {
    throw new Error('Bot name is required.')
  }

  if (description !== undefined || !isUpdate) {
    botData.description = description ? description.trim() : ''
  }

  if (privacy !== undefined) {
    if (privacy === 'private') {
      if (stripePlan(team).name === 'Free') {
        throw new Error('Private bots are not available at your plan level.')
      }
      botData.privacy = privacy
    } else {
      botData.privacy = 'public'
    }
  } else if (!isUpdate) {
    botData.privacy = 'public'
  }

  if (model !== undefined) {
    if (model === 'gpt-4' || model === 'gpt-4-1106-preview') {
      if (!team.supportsGPT4) {
        throw new Error('Your OpenAI account is not approved for GPT-4 yet.')
      } else if (stripePlan(team).name === 'Free' && !isSuperAdmin(userId)) {
        throw new Error('GPT-4 is not available at your plan level.')
      }
    }
    //check if model is valid
    const validModels = ['gpt-3.5-turbo', 'gpt-3.5-turbo-0613', 'gpt-4', 'gpt-4-1106-preview']
    if (!validModels.includes(model)) {
      throw new Error('Invalid model name.')
    }
    botData.model = model
  } else if (!isUpdate) {
    botData.model = 'gpt-3.5-turbo'
  }

  if (customPrompt !== undefined) {
    // Check if their plan allows custom prompts
    if (customPrompt && stripePlan(team).bots < 10 && !isSuperAdmin(userId)) {
      throw new Error('Custom prompts are not available at your plan level.')
    }
    botData.customPrompt = customPrompt
  }

  if (allowedDomains !== undefined) {
    botData.allowedDomains = allowedDomains
      ? allowedDomains
        .filter((s) => s)
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean)
      : []
  }

  if (color !== undefined) {
    botData.color = color ? (/#[0-9A-F]{6}/i.test(color) ? color : '') : ''
  }

  if (icon !== undefined) {
    const validIconOptions = ['default', 'comments', 'robot', 'life-ring', 'question', 'book']
    botData.icon = icon && (validIconOptions.includes(icon) || icon.includes('://')) ? icon : ''
  }

  if (alignment !== undefined) {
    if (alignment === 'left' || alignment === 'right') {
      botData.alignment = alignment
    }
  }

  if (botIcon !== undefined) {
    const validBotIconOptions = [false, 'comment', 'robot', 'life-ring', 'info', 'book']
    botData.botIcon =
      validBotIconOptions.includes(botIcon) || botIcon.includes('://') ? botIcon : ''
  }

  if (logo !== undefined) {
    botData.logo = logo && logo.includes('://') ? logo : false
  }

  if (headerAlignment !== undefined) {
    if (headerAlignment === 'left' || headerAlignment === 'center') {
      botData.headerAlignment = headerAlignment
    }
  }

  if (branding !== undefined) {
    if (branding === false && stripePlan(team).bots < 10) {
      throw new Error('Disabling branding is not available at your plan level.')
    }
    botData.branding = !!branding
  }

  if (supportLink !== undefined) {
    botData.supportLink = supportLink || ''
  }

  if (showButtonLabel !== undefined) {
    botData.showButtonLabel = !!showButtonLabel
  }

  if (hideSources !== undefined) {
    botData.hideSources = !!hideSources
  }

  if (resetkey !== undefined || !bot?.signatureKey) {
    botData.signatureKey = crypto.randomBytes(32).toString('hex')
  }

  if (labels !== undefined) {
    botData.labels = labels || {}
    const validLabels = Object.keys(i18n.en.labels)
    Object.keys(botData.labels).forEach((label) => {
      if (!validLabels.includes(label)) {
        delete botData.labels[label]
      }
    })
  }

  if (language !== undefined || !isUpdate) {
    botData.language = language ? language : 'en'
    // reset our labels
    if (bot?.language !== botData.language) {
      botData.labels = i18n[botData.language].labels
    }
  }

  if (questions !== undefined) {
    botData.questions = questions || []
  }

  if (
    rateLimitMessages !== undefined &&
    rateLimitMessages != bot?.rateLimitMessages &&
    rateLimitMessages != 10 &&
    stripePlan(team).bots < 100 &&
    !isSuperAdmin(userId)
  ) {
    throw new Error('Rate limiting is not available at your plan level.')
  }
  if (rateLimitMessages !== undefined) {
    botData.rateLimitMessages = rateLimitMessages ? parseInt(rateLimitMessages) : 10
  }

  if (
    rateLimitSeconds !== undefined &&
    rateLimitSeconds != bot?.rateLimitSeconds &&
    rateLimitSeconds != 60 &&
    stripePlan(team).bots < 100 &&
    !isSuperAdmin(userId)
  ) {
    throw new Error('Rate limiting is not available at your plan level.')
  }
  if (rateLimitSeconds !== undefined) {
    botData.rateLimitSeconds = rateLimitSeconds ? parseInt(rateLimitSeconds) : 60
  }

  if (rateLimitIPAllowlist !== undefined) {
    botData.rateLimitIPAllowlist = rateLimitIPAllowlist
      ? rateLimitIPAllowlist
        .map((ip) => ip.trim())
        .filter((ip) => {
          return (
            ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) ||
            ip.match(/^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)
          )
        })
      : []
  }

  if (recordIP !== undefined) {
    if (stripePlan(team).bots >= 100) {
      botData.recordIP = Boolean(recordIP)
    } else if (recordIP && bot?.recordIP !== true) {
      throw new Error('Recording IPs is not available at your plan level.')
    } else {
      botData.recordIP = false
    }
  }

  return botData
}
