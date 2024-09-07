import { getAuthorizedUser } from '@/middleware/getAuthorizedUser'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore } from 'firebase-admin/firestore'
import { getTeam, getTeamUsers, getInvitesFromTeam } from '@/lib/dbQueries'
import { isSuperAdmin } from '@/utils/helpers'
import { getAuth } from 'firebase-admin/auth'
import crypto from 'crypto'

export default async function handler(req, res) {
  configureFirebaseApp()
  const firestore = getFirestore()

  const { userId } = req.query

  try {
    const context = { req, res }
    const { uid } = await getAuthorizedUser(context)
    if (uid !== userId) {
      return res.status(403).json({ message: 'No access to this user' })
    }
  } catch (error) {
    return res.status(401).json({ message: error?.message })
  }

  if (req.method === 'PUT') {
    //update user
    let { currentTeam, apiKey } = req.body

    if (currentTeam) {
      //If we passed an email instead of a teamId, get the teamId via user's currentTeam
      try {
        if (
          isSuperAdmin(userId) &&
          !(
            currentTeam.match(/^[a-zA-Z0-9]{20}$/) ||
            'storybook' === currentTeam ||
            'portrait' === currentTeam
          )
        ) {
          //get user via email from firebase
          const user = await getAuth().getUserByEmail(currentTeam)
          if (user) {
            const userRef = await firestore.collection('users').doc(user.uid).get()
            if (userRef.exists) {
              currentTeam = userRef.data().currentTeam
            } else {
              return res.status(404).json({ message: 'User not found in DB' })
            }
          } else {
            return res.status(404).json({ message: 'No user found with that email' })
          }
        }
      } catch (error) {
        return res.status(400).json({ message: error?.message })
      }

      //check if user is already in team
      const users = await getTeamUsers(currentTeam)
      const userInTeam = users.find((user) => user.uid === userId)
      const invites = await getInvitesFromTeam(currentTeam)
      if (userInTeam || isSuperAdmin(userId)) {
        await firestore.collection('users').doc(userId).update({ currentTeam })
        return res.json({ users: users, invites: invites, team: await getTeam(currentTeam) })
      } else {
        return res.status(403).json({ message: 'User not in team' })
      }
    } else if (apiKey) {
      try {
        //create a random string for the apiKey
        const apiKey = crypto.randomBytes(32).toString('hex')
        //store it hashed. Safe as input has enough entropy but still fast to compare
        const hash = crypto.createHash('sha256').update(apiKey).digest('hex')
        const apiKeyPreview = apiKey.slice(0, 4) + '...' + apiKey.slice(-4)
        await firestore.collection('users').doc(userId).update({ apiKey: hash, apiKeyPreview })
        return res.json({ apiKey })
      } catch (error) {
        return res.status(500).json({ message: error?.message })
      }
    } else {
      return res.status(400).json({ message: 'Invalid request body' })
    }
  } else {
    return res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
