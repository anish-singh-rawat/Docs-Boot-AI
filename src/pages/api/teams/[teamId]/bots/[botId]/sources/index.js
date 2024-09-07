import { configureFirebaseApp } from '@/config/firebase-server.config'
import { firebaseConfig } from '@/config/firebase-ui.config'
import userTeamCheck from '@/lib/userTeamCheck'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getBot, getSources, getSource } from '@/lib/dbQueries'
import { stripePlan } from '@/utils/helpers'
import { bentoTrack } from '@/lib/bento'
import { mpTrack } from '@/lib/mixpanel'
import { sourceTypes } from '@/constants/sourceTypes.constants'
import { uuidv4 } from '@firebase/util'
import { getSchema } from '@/lib/weaviate'
import { QueueSourceIngest, QueueSourceRegest } from '@/lib/service'
import { checkSourceScheduledFromInterval } from '@/utils/helpers'

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

  //create source
  if (req.method === 'POST') {
    //check plan credits
    if (stripePlan(team).pages <= team.pageCount) {
      return res.status(402).json({
        message: 'Source or page limit exceeded. Please upgrade your plan.',
      })
    }

    //check that they set an openAIKey
    if (!team.openAIKey) {
      return res.status(402).json({
        message: 'Please set your OpenAI API key to be able to train a bot.',
      })
    }

    //check that the schema is created in weaviate
    try {
      const test = await getSchema(bot.indexId)
    } catch (error) {
      console.warn('Error getting weaviate schema:', error)
      return res.status(409).json({
        message:
          'Whoops, your bot is not quite ready to train. Try again in a minute or two, or if it has been a while delete and recreate this bot.',
      })
    }

    //data validation
    let { type, title, url, file, scheduleInterval, faqs, carbonId } = req.body

    if (!type || !sourceTypes.find((sourceType) => sourceType.id === type)) {
      return res.status(400).send({ message: 'Invalid parameter "type".' })
    }

    const sourceType = sourceTypes.find((sourceType) => sourceType.id === type)

    //check plan credits
    const predictedPageCount = sourceType.isPro ? team.pageCount + 5 : team.pageCount + 1
    if (stripePlan(team).pages < predictedPageCount) {
      return res.status(402).json({
        message: 'Source page limit exceeded. Please upgrade your plan.',
      })
    }

    //check if they are pro and can use the source type
    if (sourceType.isPro && stripePlan(team).name === 'Free') {
      return res.status(402).json({
        message: 'Source type not available on your plan. Please upgrade your plan.',
      })
    }

    // https://mathiasbynens.be/demo/url-regex
    url = url?.trim() || null
    if (
      sourceType.fieldUrl === 'required' &&
      (!url || !url.match(/^(https?):\/\/[^\s\/$.?#].[^\s]*$/))
    ) {
      return res.status(400).send({ message: 'Invalid or missing parameter "url".' })
    }

    title = title?.trim() || null
    if (sourceType.fieldTitle === 'required' && !title) {
      return res.status(400).send({ message: 'Invalid or missing parameter "title".' })
    }

    if (sourceType.fieldFile === 'required' && !file) {
      return res.status(400).send({ message: 'Invalid or missing parameter "file".' })
    }

    if (sourceType.fieldQA === 'required' && !faqs) {
      return res.status(400).send({ message: 'Invalid or missing parameter "faqs".' })
    }

    if (!sourceType.fieldQA) {
      faqs = null
    }

    // sanity check faqs
    if (faqs) {
      if (!Array.isArray(faqs)) {
        return res.status(400).json({ message: 'Invalid parameter "faqs".' })
      }

      for (const faq of faqs) {
        if (!faq.question || !faq.answer || faq.answer.length === 0 || faq.question.length === 0) {
          return res.status(400).json({ message: 'Invalid parameter "faqs".' })
        }
      }

      try {
        faqs.forEach((QA) => {
          if (!QA.question || !QA.answer) {
            throw new Error()
          }
        })
      } catch (error) {
        return res.status(400).send({ message: 'Invalid parameter "faqs".' })
      }
    }

    //check file type, mostly for sanity
    if (file) {
      const bucket = getStorage().bucket(`gs://${firebaseConfig.storageBucket}`)
      const fileRef = bucket.file(file)
      const extension = file.split('.').pop()
      if (!Object.keys(sourceType.fileTypes).includes(extension)) {
        await fileRef.delete()
        return res.status(400).send({ message: 'Invalid file type.' })
      }

      // zip files are only for non-free plans
      if (extension === 'zip' && stripePlan(team).name === 'Free') {
        await fileRef.delete()
        return res.status(402).json({
          message: 'File type not available on your plan. Please upgrade your plan.',
        })
      }

      //generate uuid for file name with same extension
      const uuid = uuidv4()
      //move the file to the correct location in bucket
      const newFile = `teams/${team.id}/bots/${botId}/${uuid}.${extension}`
      await fileRef.move(newFile)
      file = newFile
    } else {
      file = null
    }

    let pageCount = 0

    if (sourceType.isCarbon) {
      // check carbonId
      if (!carbonId) {
        return res.status(400).json({ message: 'Invalid or missing parameter "carbonId".' })
      }
    } else {
      carbonId = null
    }

    try {
      let data = {
        createdAt: FieldValue.serverTimestamp(),
        type,
        title,
        url,
        file,
        status: carbonId ? 'indexing' : 'pending',
        pageCount: pageCount,
        chunkCount: 0,
        faqs,
        carbonId,
      }

      if (scheduleInterval && scheduleInterval !== 'none') {
        // make sure the source type is supported
        if (!sourceType.fieldSchedule) {
          return res
            .status(400)
            .send({ message: 'This source type does not currently support scheduled refreshes.' })
        }

        //this will throw an error if the interval is invalid or not allowed for plan
        const scheduled = checkSourceScheduledFromInterval(team, scheduleInterval)
        data = { ...data, scheduled, scheduleInterval }
      }

      // we only allow 1 qa source per bot, so we'll need to check if another qa source exists.
      // if it does, we'll need to add our faqs to it and queue a regest
      if (type === 'qa') {
        const qaSources = await firestore
          .collection('teams')
          .doc(team.id)
          .collection('bots')
          .doc(botId)
          .collection('sources')
          .where('type', '==', 'qa')
          .get()
        if (!qaSources.empty) {
          // add the faqs to the existing qa source
          const existingSource = { id: qaSources.docs[0].id, ...qaSources.docs[0].data() }
          const existingFaqs = existingSource.faqs || []

          // loop through and remove old conflicting faqs
          const newFaqs = existingFaqs.filter((newFaq) => {
            const existingFaq = faqs.find((faq) => faq.question === newFaq.question)
            if (existingFaq) {
              return false
            }
            return true
          })

          // append our new faqs
          newFaqs.push(...faqs)

          await firestore
            .collection('teams')
            .doc(team.id)
            .collection('bots')
            .doc(botId)
            .collection('sources')
            .doc(existingSource.id)
            .update({
              faqs: newFaqs,
            })

          await QueueSourceRegest(team.id, botId, existingSource.id)

          //send bento track
          try {
            bentoTrack(userId, 'track', {
              type: 'addFAQ',
              sourceType: type,
            })
            mpTrack(userId, 'Added FAQ', {
              'Source type': type,
              ip: req.headers['x-forwarded-for'],
            })
          } catch (e) {
            console.log('Error sending bento track', e)
          }

          return res.status(201).json(await getSource(team, bot, existingSource.id))
        }
      }

      const docRef = await firestore
        .collection('teams')
        .doc(team.id)
        .collection('bots')
        .doc(botId)
        .collection('sources')
        .add(data)

      //increment sourceCounts on team
      try {
        await firestore.runTransaction(async (transaction) => {
          const teamRef = firestore.collection('teams').doc(team.id)
          const sfDoc = await transaction.get(teamRef)
          if (!sfDoc.exists) {
            throw 'Team does not exist!'
          }

          const newSourceCount = (sfDoc.data().sourceCount || 0) + 1
          transaction.update(teamRef, {
            sourceCount: newSourceCount,
          })
        })

        //increment source counts on bot
        await firestore.runTransaction(async (transaction) => {
          const botRef = firestore.collection('teams').doc(team.id).collection('bots').doc(botId)
          const sfDoc = await transaction.get(botRef)
          if (!sfDoc.exists) {
            throw 'Bot does not exist!'
          }

          const newSourceCount = (sfDoc.data().sourceCount || 0) + 1
          transaction.update(botRef, {
            sourceCount: newSourceCount,
          })
        })
      } catch (e) {
        console.warn('Increment transaction failed: ', e)
      }

      //add source event to pub/sub queue for processing (carbon handled by cron)
      if (!sourceType.isCarbon) {
        await QueueSourceIngest(
          team.id,
          botId,
          docRef.id,
          stripePlan(team).pages - team.pageCount,
          bot.indexId,
          type,
          title,
          url,
          file,
          faqs
        )
      }

      //send bento track
      try {
        bentoTrack(userId, 'track', {
          type: 'addSource',
          sourceType: type,
        })
        mpTrack(userId, 'Added Source', { 'Source type': type, ip: req.headers['x-forwarded-for'] })
      } catch (e) {
        console.log('Error sending bento track', e)
      }

      //done, return source object
      return res.status(201).json(await getSource(team, bot, docRef.id))
    } catch (error) {
      console.log('Error creating source', error, error?.stack)
      return res.status(500).json({ message: error?.message })
    }
  } else if (req.method === 'GET') {
    const page = parseInt(req.query.page) || 0
    const sourceLimit = parseInt(req.query.limit) || 100
    const ascending = req.query.ascending || false
    try {
      return res.json(await getSources(team.id, bot, page, sourceLimit, ascending))
    } catch (e) {
      return res.status(500).json({ message: e?.message })
    }
  } else {
    return res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
