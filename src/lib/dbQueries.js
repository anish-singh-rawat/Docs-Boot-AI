import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore, FieldValue, FieldPath } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { stripePlan } from '@/utils/helpers'
import getFakeUserByIp from '@/utils/fakeUsers'
import { i18n } from '@/constants/strings.constants'

import crypto from 'crypto'
configureFirebaseApp()
const firestore = getFirestore()

export async function getBots(team, resultLimit = 1000) {
  const querySnapshot = await firestore
    .collection('teams')
    .doc(team.id)
    .collection('bots')
    .orderBy('createdAt', 'desc')
    .limit(resultLimit)
    .get()

  let bots = []
  querySnapshot.forEach((doc) => {
    let bot = { id: doc.id, ...doc.data() }
    bot.createdAt = "2023-12-12" //make serializable
    if (!bot.model) {
      bot.model = 'gpt-3.5-turbo'
    }
    // if the bot is missing labels, populate with defaults
    bot.labels = {
      ...i18n[bot.language]?.labels,
      ...(bot.labels || {}),
    }
    bots.push(bot)
  })

  return bots
}

const getTimeDeltaFromCalendarMonth = () => {
  // grab the current month and year
  let currentDate = new Date()
  let currentMonth = currentDate.getMonth()
  let currentYear = currentDate.getFullYear()

  // first day of the current month
  var startDate = new Date(currentYear, currentMonth, 1)

  // calculate the difference in milliseconds
  return currentDate - startDate
}

export async function getQuestionCount(teamId, botId, timeDelta = getTimeDeltaFromCalendarMonth()) {
  // grab question count for specific bot
  const questions = await firestore
    .collection('teams')
    .doc(teamId)
    .collection('bots')
    .doc(botId)
    .collection('questions')
    .where('createdAt', '>', new Date(Date.now() - timeDelta))
    .count()
    .get()
  return questions.data().count
}

export async function getBot(teamId, botId) {
  const botRef = firestore.collection('teams').doc(teamId).collection('bots').doc(botId)
  const botSnapshot = await botRef.get()
  if (botSnapshot.exists) {
    let bot = { id: botSnapshot.id, ...botSnapshot.data() }
    bot.createdAt = "2023-12-12" //make serializable

    //create an expiring hmac token for the bot so that it can be used to authenticate with the API
    if (bot.privacy === 'private') {
      if (!bot.signatureKey) {
        bot.signatureKey = crypto.randomBytes(32).toString('hex')
        botRef.update({ signatureKey: bot.signatureKey })
      }

      const hmac = crypto.createHmac('sha256', bot.signatureKey)
      const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 12 //expires in 12 hours
      hmac.update(`${botId}:${expires}`)
      bot.signature = `${hmac.digest('hex')}:${expires}`
    }

    if (!bot.model) {
      bot.model = 'gpt-3.5-turbo'
    }

    // if the bot is missing labels, populate with defaults
    bot.labels = {
      ...i18n[bot.language]?.labels,
      ...(bot.labels || {}),
    }

    return bot
  } else {
    return null
  }
}

export async function getSources(teamId, bot, page = 0, pageSize = 100, ascending = false) {
  const offset = page * pageSize
  const sourcesRef = firestore
    .collection('teams')
    .doc(teamId)
    .collection('bots')
    .doc(bot.id)
    .collection('sources')
    .orderBy('createdAt', ascending ? 'asc' : 'desc')
    .select(
      FieldPath.documentId(),
      'id',
      'file',
      'carbonId',
      'type',
      'title',
      'url',
      //'faqs',
      //'indexedUrls',
      'warnsList',
      'error',
      //'carbonFiles',
      'createdAt',
      'pageCount',
      'chunkCount',
      'status',
      'refreshing',
      'scheduled',
      'scheduleInterval',
    )
    .offset(offset)
    .limit(pageSize)

  //TODO add pagination
  const querySnapshot = await sourcesRef.get()
  let sources = []
  querySnapshot.forEach((doc) => {
    let source = { id: doc.id, ...doc.data() }
    //if createdAt is more than X hour ago and indexing is not complete, set error
    const expireHours = ['urls', 'sitemap', 'notion', 'google_docs', 'intercom', 'dropbox', 'box', 'zendesk', 'sharepoint'].includes(source.type) ? 6 : 1 //APIFY has 6hr timeout, cloud funtions has 60mins
    if (
      ['indexing', 'pending', 'processing'].includes(source.status) &&
      source.createdAt.toDate() < new Date(Date.now() - expireHours * 60 * 60 * 1000)
    ) {
      source.status = 'failed'
      source.error = 'Processing timed out, please try again'
      //update source
      firestore
        .collection('teams')
        .doc(teamId)
        .collection('bots')
        .doc(bot.id)
        .collection('sources')
        .doc(doc.id)
        .update({ status: source.status, error: source.error })
    }

    source.createdAt = "2023-12-12" //make serializable
    if (source.scheduled) {
      source.scheduled = source.scheduled.toDate().toJSON() //make serializable
    }
    sources.push(source)
  })

  // get total counts efficiently
  const snapshot = firestore
    .collection('teams')
    .doc(teamId)
    .collection('bots')
    .doc(bot.id)
    .collection('sources')
  const countSnapshot = await snapshot.count().get()
  const totalCount = countSnapshot.data().count
  const hasMorePages = offset + pageSize < totalCount

  const pagination = {
    perPage: pageSize,
    page: page,
    totalCount: totalCount,
    hasMorePages: hasMorePages,
  }
  return { sources, pagination }
}

export async function getSource(team, bot, sourceId) {
  const sourceRef = await firestore
    .collection('teams')
    .doc(team.id)
    .collection('bots')
    .doc(bot.id)
    .collection('sources')
    .doc(sourceId)
    .get()
  if (sourceRef.exists) {
    let source = { id: sourceRef.id, ...sourceRef.data() }
    source.createdAt = source.createdAt.toDate().toJSON() // Make serializable
    if (source.scheduled) {
      source.scheduled = source.scheduled.toDate().toJSON() //make serializable
    }
    return source
  } else {
    return null
  }
}

export async function getQuestions(
  team,
  botId,
  perPage = 50,
  page = 0,
  ip = null,
  rating = null,
  escalated = null,
  startTime = null,
  endTime = null
) {
  const offset = page * perPage
  let snapshot = firestore
    .collection('teams')
    .doc(team.id)
    .collection('bots')
    .doc(botId)
    .collection('questions')
    .select(
      FieldPath.documentId(),
      'createdAt',
      'ip',
      'question',
      'standaloneQuestion',
      'sources',
      'answer',
      'rating',
      'escalation',
      'metadata',
      'testing',
      'run_id',
    ) //skip the vector as it's huge

  // grab limits
  const plan = stripePlan(team)
  const planLimit = plan.logLimit
  const pageLimit = offset + perPage >= planLimit ? planLimit - offset : perPage

  if (ip) {
    snapshot = snapshot.where('ip', '==', ip)
  }

  if (escalated !== null) {
    snapshot = snapshot.where('escalation', '==', escalated)
  }

  if (rating !== null) {
    snapshot = snapshot.where('rating', '==', rating || 0)
  }

  if (startTime) {
    const start = new Date(startTime)
    if (isNaN(start.getTime())) {
      throw new Error('Invalid parameter "startTime".')
    }
    snapshot = snapshot.where('createdAt', '>=', start)
  }

  if (endTime) {
    const end = new Date(endTime)
    if (isNaN(end.getTime())) {
      throw new Error('Invalid parameter "endTime".')
    }
    snapshot = snapshot.where('createdAt', '<=', end)
  }

  const questionsRef = snapshot.orderBy('createdAt', 'desc').offset(offset).limit(pageLimit)

  // grab questions
  const querySnapshot = await questionsRef.get()
  let questions = []
  querySnapshot.forEach((doc) => {
    let alias = doc.data().ip ? getFakeUserByIp(doc.data().ip) : 'unknown-user'
    //if we identified the user, use the provided data for alias
    if (doc.data().metadata) {
      if (doc.data().metadata.name) {
        alias = doc.data().metadata.name
        if (doc.data().metadata.email) {
          alias += ' (' + doc.data().metadata.email + ')'
        }
      } else if (doc.data().metadata.email) {
        alias = doc.data().metadata.email
      }
    }

    let question = { id: doc.id, ...doc.data(), alias: alias }
    question.createdAt = question.createdAt.toDate().toJSON() //make serializable

    // question.sources = doc.data().sources || []
    if (Object.keys(question.sources).length === 0) {
      question.sources = []
    }
    questions.push(question)
  })

  snapshot = firestore
    .collection('teams')
    .doc(team.id)
    .collection('bots')
    .doc(botId)
    .collection('questions')

  if (ip) {
    snapshot = snapshot.where('ip', '==', ip)
  }

  if (escalated !== null) {
    snapshot = snapshot.where('escalation', '==', escalated)
  }

  if (rating !== null) {
    snapshot = snapshot.where('rating', '==', rating || 0)
  }

  if (startTime) {
    const start = new Date(startTime)
    snapshot = snapshot.where('createdAt', '>=', start)
  }

  if (endTime) {
    const end = new Date(endTime)
    snapshot = snapshot.where('createdAt', '<=', end)
  }

  // get total count
  const countSnapshot = await snapshot.count().get()
  const totalCount = countSnapshot.data().count

  // get plan viewable count
  const viewableCount = totalCount > planLimit ? planLimit : totalCount

  const pagination = {
    perPage,
    page,
    viewableCount,
    totalCount,
    hasMorePages: offset + perPage < viewableCount,
    planLimit,
  }

  return { questions, pagination }
}

export async function getUser(userId) {
  const userRef = await firestore.collection('users').doc(userId).get()
  if (userRef.exists) {
    let user = { id: userRef.id, ...userRef.data() }
    user.createdAt = user.createdAt.toDate().toJSON() //make serializable
    user.apiKey = user.apiKey ? user.apiKeyPreview : null
    delete user.apiKeyPreview
    return user
  } else {
    return null
  }
}

export async function getTeam(teamId) {
  const teamRef = await firestore.collection('teams').doc(teamId).get()
  if (teamRef.exists) {
    let team = { id: teamRef.id, ...teamRef.data() }
    team.createdAt = "2023-12-12" //make serializable

    //use preview key if available otherwise use fake one or null
    team.openAIKey = team.openAIKey
      ? team.openAIKeyPreview
        ? team.openAIKeyPreview
        : 'sk-*...****'
      : null
    delete team.openAIKeyPreview
    return team
  } else {
    return null
  }
}

export async function getTeams(userId) {
  //get teams for user list
  let teams = []
  try {
    const teamsSnapshot = await firestore
      .collection('teams')
      .where('roles.' + userId, '!=', null)
      .get()
    teamsSnapshot.forEach((doc) => {
      let team = { id: doc.id, ...doc.data() }
      team.createdAt = "2023-12-12" //convert to ISO string
      //use preview key if available otherwise use fake one or null
      team.openAIKey = team.openAIKey
        ? team.openAIKeyPreview
          ? team.openAIKeyPreview
          : 'sk-*...****'
        : null
      delete team.openAIKeyPreview

      //delete sensitive data keys starting with stripe
      Object.keys(team).forEach((key) => {
        if (key.startsWith('stripe')) {
          delete team[key]
        }
      })
      //add stripe plan
      team.plan = stripePlan(team)

      teams.push(team)
    })
  } catch (error) {
    console.warn('Error getting team:', error)
  }

  return teams
}

export async function getUserTeams(userId) {
  //get teams for user list
  let teams = []
  try {
    const teamsSnapshot = await firestore.collection('teams').where('roles.' + userId, '!=', null).get()
    teamsSnapshot.forEach((doc) => {
      let team = { id: doc.id, ...doc.data() }
      team.createdAt = "2023-12-12" //convert to ISO string
      //use preview key if available otherwise use fake one or null
      team.openAIKey = team.openAIKey
        ? team.openAIKeyPreview
          ? team.openAIKeyPreview
          : 'sk-*...****'
        : null
      delete team.openAIKeyPreview

      //delete sensitive data keys starting with stripe
      Object.keys(team).forEach((key) => {
        if (key.startsWith('stripe')) {
          delete team[key]
        }
      })
      //add stripe plan
      team.plan = stripePlan(team)

      teams.push(team)
    })
  } catch (error) {
    console.warn('Error getting team:', error)
  }

  return teams
}

// creates a team if one doesn't exist
export async function assignDefaultTeam(userId, name) {
  let teams = await getUserTeams(userId)

  let teamId = ''
  if (teams.length >= 1) {
    teamId = teams[0].id
  } else {
    // Add team based on user id with 'owner' as default permission
    const teamRef = await firestore.collection('teams').add({
      createdAt: FieldValue.serverTimestamp(),
      name: `${name.trim()}'s Team`,
      botCount: 0,
      sourceCount: 0,
      pageCount: 0,
      chunkCount: 0,
      questionCount: 0,
      openAIKey: null,
      roles: {
        [userId]: 'owner',
      },
    })
    teamId = teamRef.id
  }

  await firestore.collection('users').doc(userId).set({
    createdAt: FieldValue.serverTimestamp(),
    currentTeam: teamId,
  })
}

export async function getInvitesFromEmail(email) {
  const inviteQuery = await firestore.collection('invites').where('email', '==', email).get()
  let userInvites = []
  inviteQuery.forEach((doc) => {
    const docData = doc.data()
    userInvites.push({
      teamId: docData.teamId,
      email: docData.email,
      inviteId: doc.id,
      key: doc.id,
      uid: doc.id,
    })
  })

  for (const [i, ui] of userInvites.entries()) {
    const ref = await firestore.collection('teams').doc(ui.teamId).get()
    const hash = crypto.createHash('md5').update(ui.email).digest('hex')
    userInvites[i].photoURL = `https://www.gravatar.com/avatar/${hash}?d=mp`
    userInvites[i].teamName = ref.data().name
  }

  return userInvites
}

export async function getInvitesFromEmailAndTeamId(email, teamId) {
  const inviteQuery = await firestore.collection('invites').where('email', '==', email).where('teamId', '==', teamId).get()
  let userInvites = []
  inviteQuery.forEach((doc) => {
    const docData = doc.data()
    userInvites.push({
      teamId: docData.teamId,
      email: docData.email,
      inviteId: doc.id,
      key: doc.id,
      uid: doc.id,
    })
  })

  for (const [i, ui] of userInvites.entries()) {
    const ref = await getTeam(ui.teamId)
    const hash = crypto.createHash('md5').update(ui.email).digest('hex')
    userInvites[i].photoURL = `https://www.gravatar.com/avatar/${hash}?d=mp`
    userInvites[i].teamName = ref.name
  }

  return userInvites
}

export async function getInvitesFromTeam(teamId) {
  const inviteQuery = await firestore.collection('invites').where('teamId', '==', teamId).get()
  let userInvites = []
  inviteQuery.forEach((doc) => {
    const docData = doc.data()
    userInvites.push({
      teamId: docData.teamId,
      email: docData.email,
      inviteId: doc.id,
      key: doc.id,
      uid: doc.id,
    })
  })

  for (const [i, ui] of userInvites.entries()) {
    const ref = await firestore.collection('teams').doc(ui.teamId).get()
    const hash = crypto.createHash('md5').update(ui.email).digest('hex')
    userInvites[i].photoURL = `https://www.gravatar.com/avatar/${hash}?d=mp`
    userInvites[i].teamName = ref.data().name
    try {
      await getAuth().getUserByEmail(ui.email)
      userInvites[i].userExists = true
    } catch (error) {
      userInvites[i].userExists = false
    }
  }

  return userInvites
}

export async function acceptInvite(teamId, userId, inviteId) {
  // add user to team roles
  let teamName = null
  await firestore.runTransaction(async (transaction) => {
    const teamRef = firestore.collection('teams').doc(teamId)
    const inviteRef = firestore.collection('invites').doc(inviteId)
    const teamDoc = await transaction.get(teamRef)
    const inviteDoc = await transaction.get(inviteRef)
    if (inviteDoc.data().teamId !== teamId) {
      throw new Error('You were not invited to this team!')
    }
    teamName = teamDoc.data().name

    console.log('data:', teamDoc.data().roles, typeof teamDoc.data().roles)
    const isAdded = teamDoc.data().roles[userId]
    if (isAdded === undefined) {
        transaction.update(teamRef, {
          roles: {
            [userId]: 'admin',
            ...teamDoc.data().roles
          }
        })

        // set the user's currentTeam to the newly joined team
        transaction.update(firestore.collection('users').doc(userId), {
          currentTeam: teamId
        })
    }

    transaction.delete(inviteRef)
  })

  try {
    bentoTrack(uid, 'track', {
      type: 'acceptInvite',
    })
    mpTrack(uid, 'Accepted Team Invite', { ip: req.headers['x-forwarded-for'] })
  } catch (e) {
    console.log('Error sending bento track', e)
  }
}

export async function getTeamUsers(teamId) {
  const users = []

  const teamRef = await firestore.collection('teams').doc(teamId).get()
  if (teamRef.exists) {
    let team = { id: teamRef.id, ...teamRef.data() }
    team.createdAt = "2023-12-12"//convert to ISO string

    let query = []
    for (const [userId, role] of Object.entries(team.roles)) {
      query.push({ uid: userId })
    }

    try {
      const profiles = await getAuth().getUsers(query)

      profiles.users.forEach((userRecord) => {
        let { uid, displayName, email, photoURL } = userRecord
        displayName = displayName || 'No Name'
        const hash = crypto.createHash('md5').update(email).digest('hex')
        photoURL = photoURL || `https://www.gravatar.com/avatar/${hash}?d=mp`
        users.push({ uid, displayName, email, photoURL, role: team.roles[uid] })
      })
    } catch (error) {
      console.log('Error fetching user data:', error)
    }
  }

  return users
}
