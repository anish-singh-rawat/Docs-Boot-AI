import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuthorizedUser } from '@/middleware/getAuthorizedUser'
import userTeamCheck from '@/lib/userTeamCheck'
import { isSuperAdmin } from '@/utils/helpers'
import { getUserTeams, getInvitesFromEmailAndTeamId, getTeamUsers } from '@/lib/dbQueries'
import { mpTrack } from '@/lib/mixpanel'

export default async function handler(req, res) {
  configureFirebaseApp()
  const firestore = getFirestore()
  let userId

  try {
    const context = { req, res }
    const { uid } = await getAuthorizedUser(context)
    userId = uid
  } catch (error) {
    return res.status(403).json({ message: error?.message })
  }

  if (req.method === 'GET') {
    // respond with team members
    let check = null
    try {
      check = await userTeamCheck(req, res)
    } catch (error) {
      return res.status(403).json({ message: error?.message })
    }
    const { team } = check

    try {
      return res.status(200).send(await getTeamUsers(team.id))
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: error?.message })
    }
  } else if (req.method === 'DELETE') {
    let check = null
    try {
      check = await userTeamCheck(req, res)
    } catch (error) {
      return res.status(403).json({ message: error?.message })
    }
    const { team } = check
    const { removeUserId, removeUserEmail } = req.body

    try {

        // sanity check that only owners can remove members
        if (team.roles[userId] !== 'owner' && !isSuperAdmin(userId)) {
          throw new Error('Only team owners can remove members!')
        }

        // remove member from teamRoles
        if (removeUserId !== undefined) {
          const isAdded = team.roles[removeUserId]
  
          // sanity check that they're not removing themselves lol
          if (userId === removeUserId) {
            throw new Error('You cannot remove yourself!')
          }

          if (isAdded === undefined) {
            throw new Error('User is not part of this team!')
          }

          // grab the first non-'this team' and assign it to the removed user's current team
          const userTeams = await getUserTeams(removeUserId)
          for (const removedUserTeam of userTeams) {
            if (removedUserTeam.id !== team.id) {
              await firestore.collection('users').doc(removeUserId).update({
                currentTeam: removedUserTeam.id
              })
              break
            }
          }

          // remove from team roles
          let newRoles = team.roles
          delete newRoles[removeUserId]
          await firestore.collection('teams').doc(team.id).update({
              roles: newRoles
          })
        } else if (removeUserEmail !== undefined) { // remove invite
          const invites = await getInvitesFromEmailAndTeamId(removeUserEmail, team.id)
          if (invites.length <= 0) {
            throw new Error('Email was not invited!')
          }
          const invite = invites[0];

          await firestore.collection('invites').doc(invite.uid).delete()
        } else {
            // something's wrong
            return res.status(500).json({ message: "Something went wrong, please try again" })
        }

      mpTrack(userId, 'Removed team user', {
        "Team name": team.name,
        ip: req.headers['x-forwarded-for'],
      })
      
      return res.status(200).send({ message: `Removed user successfully`})
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: error?.message })
    }
  } else {
    res.status(400).send({ message: 'Invalid HTTP method' })
  }
}
