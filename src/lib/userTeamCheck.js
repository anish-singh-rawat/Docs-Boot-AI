import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getAuthorizedUser } from '@/middleware/getAuthorizedUser'
import { isSuperAdmin } from '@/utils/helpers'
import { getTeam } from '@/lib/dbQueries'

export default async function userTeamCheck(req, res) {
  configureFirebaseApp()

  const { teamId } = req.query
  const context = { req, res }
  const { uid } = await getAuthorizedUser(context)

  //check if user has access to team

  const team = await getTeam(teamId)
  if (team && ( team.roles[uid] || isSuperAdmin(uid) )) {
    return { userId: uid, team }
  } else {
    throw new Error('User does not have access to team')
  }
}
