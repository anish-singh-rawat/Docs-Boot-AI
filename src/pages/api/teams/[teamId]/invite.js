import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuthorizedUser } from '@/middleware/getAuthorizedUser'
import { getAuth } from 'firebase-admin/auth'
import userTeamCheck from '@/lib/userTeamCheck'
import { bentoTrack } from '@/lib/bento'
import { stripePlan, isSuperAdmin } from '@/utils/helpers'
import { sendInviteEmail } from '@/utils/emails'
import { getTeam, acceptInvite } from '@/lib/dbQueries'
import { mpTrack } from '@/lib/mixpanel'

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
}

export default async function handleInvite(req, res) {
    configureFirebaseApp()
    const firestore = getFirestore()

    if (req.method === 'POST') {
      let check = null
      try {
        check = await userTeamCheck(req, res)
      } catch (error) {
        return res.status(403).json({ message: error?.message })
      }
      const { userId, team } = check

      // sanity check stripe plan
      const plan = stripePlan(team)
      if (Object.keys(team.roles).length >= plan.teamMembers && !isSuperAdmin(userId)) {
        // the user copy here isn't actually read by the user, the 403 status code is handled by showing the upgrade modal
        return res.status(403).send({ message: `You've reached your team member limit, please upgrade your plan!`})
      }

      try {
        bentoTrack(userId, 'track', {
          type: 'inviteUser',
        })
        mpTrack(userId, 'Invited Team Member', { ip: req.headers['x-forwarded-for'] })
      } catch (e) {
        console.log('Error sending bento track', e)
      }

      try {
        // grab user and invite them (or send an email if they haven't signed up)
        const { inviteEmail } = req.body

        if (!validateEmail(inviteEmail)) {
          throw new Error("Please make sure the email is valid!")
        }

        let userRecord = null
        try {
          userRecord = await getAuth().getUserByEmail(inviteEmail)
        } catch {}

        // get invites where the email && the teamId match
        const inviteRef = firestore.collection('invites')
        const invites = await inviteRef.where("email", "==", inviteEmail).where("teamId", "==", team.id).get()
        if (invites.size >= 1) {
          throw new Error('User was already invited to the team!')
        }

        if (userRecord !== null) {
          // check if user is already a part of the team
          const teamRef = firestore.collection('teams').doc(team.id)
          const teamDoc = await teamRef.get()
          const alreadyAdded = teamDoc.data().roles[userRecord.uid]
          if (alreadyAdded !== undefined) {
            throw new Error('User is already part of the team!')
          }
        }

        // add invite!
        await inviteRef.add({
          createdAt: FieldValue.serverTimestamp(),
          email: inviteEmail,
          teamId: team.id, 
        });

        const inviter = await getAuth().getUser(userId)
        await sendInviteEmail(inviteEmail, inviter, team)
        return res.status(200).send({ message: `An invite email has been sent to ${inviteEmail}`})
      } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err?.message })
      }
    } else if (req.method === 'PUT') {
      const { uid, email } = await getAuthorizedUser({ req, res })

      // user is accepting/denying an invite request
      const { status, teamId, inviteId } = req.body
      try {
        if (status === 'accept') {
          // add user to team roles
          await acceptInvite(teamId, uid, inviteId)

          return res.status(200).send({ message: 'Accepted invite', data: await getTeam(teamId)})
        } else if (status === 'deny') {
          // remove invite
          await firestore.runTransaction(async (transaction) => {
            const inviteRef = firestore.collection('invites').doc(inviteId)
            const inviteDoc = await transaction.get(inviteRef)
            if (inviteDoc.data().email !== email) {
              throw new Error('You were not invited to this team!')
            }

            await transaction.delete(inviteRef)
          })

          try {
            bentoTrack(uid, 'track', {
              type: 'denyInvite',
            })
            mpTrack(uid, 'Declined Team Invite', { ip: req.headers['x-forwarded-for'] })
          } catch (e) {
            console.log('Error sending bento track', e)
          }

          return res.status(200).send({ message: `Declined invite`, data: null})
        } else if (status === 'retry') {
          const teamDoc = await firestore.collection('teams').doc(teamId).get()
          const role = teamDoc.data().roles[uid]
          if (!role || role !== 'owner') {
            throw new Error('You are not the owner of this team!')
          }

          // resend invite email
          const inviteRef = firestore.collection('invites').doc(inviteId)
          const inviteDoc = await inviteRef.get()
          const inviter = await getAuth().getUser(uid)
          const team = await getTeam(teamId)
          await sendInviteEmail(inviteDoc.data().email, inviter, team)

          return res.status(200).send({ message: `Resent invite`, data: null})
        }
      } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err?.message })
      }
    } else {
      res.setHeader('Allow', 'POST')
      res.status(405).end('Method Not Allowed')
    }
  }