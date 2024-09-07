import { getAuth } from 'firebase-admin/auth'
import cookie from 'cookie'
import * as jose from 'jose'
import { getFirestore } from 'firebase-admin/firestore'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { authDefaults, TWO_WEEKS_IN_MILLISECONDS } from '@/constants/auth.constants'
import { bentoTrack } from '@/lib/bento'
import { stripePlan } from '@/utils/helpers'
import { assignDefaultTeam, getInvitesFromEmail, acceptInvite } from '@/lib/dbQueries'
import { mpProfile } from '@/lib/mixpanel'

export default async function handler(req, res) {
  configureFirebaseApp()

  const authorizationHeader = req.headers.authorization
  const accessToken = authorizationHeader.slice(7)

  const auth = getAuth()

  const sessionCookie = await auth.createSessionCookie(accessToken, {
    expiresIn: TWO_WEEKS_IN_MILLISECONDS,
  })
  const decodedJwt = jose.decodeJwt(sessionCookie)
  const userId = decodedJwt?.user_id

  const serializedCookie = cookie.serialize(
    authDefaults.COOKIE_NAME,
    sessionCookie,
    authDefaults.COOKIE_OPTIONS
  )

  const { name, isNewUser } = req.body

  const invites = await getInvitesFromEmail(decodedJwt?.email.toLowerCase())
  const invited = isNewUser && invites.length > 0

  const mpData = {
    $email: decodedJwt?.email,
    $name: name,
  }
  if (invited) {
    mpData['Invited'] = true
  }

  // update mixpanel profile
  mpProfile(userId, mpData)

  if (isNewUser) {

    try {
      await assignDefaultTeam(userId, name)

      // if the new user is invited to just one team, accept the invite on registration, no confirmation needed
      if (invited && invites.length === 1) {
        await acceptInvite(invites[0].teamId, userId, invites[0].inviteId)
      }

      //track with bento
      bentoTrack(userId, 'addSubscriber', {
        email: decodedJwt?.email,
        fields: {
          invited,
          name,
        },
      })
    } catch (error) {
      console.error(error)
      return res.status(500).send({ message: error?.message })
    }
  }

  res.setHeader('set-cookie', serializedCookie)

  return res.send({ message: 'success' })
}
