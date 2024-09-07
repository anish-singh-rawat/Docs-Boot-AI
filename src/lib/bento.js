import { getAuth } from 'firebase-admin/auth'
import { Analytics } from '@bentonow/bento-node-sdk'

export const bento = new Analytics({
  authentication: {
    publishableKey: process.env.BENTO_PUB_KEY,
    secretKey: process.env.BENTO_SECRET_KEY,
  },
  logErrors: false, // Set to true to see the HTTP errors logged
  siteUuid: process.env.NEXT_PUBLIC_BENTO_SITE,
})

export async function bentoTrack(userId, command, data) {
  //get user email from firebase auth
  try {
    if (!data.email) {
      if (!userId) return
      const auth = getAuth()
      const user = await auth.getUser(userId)
      if (!user?.email) return
      data.email = user.email
    }

    //send to bento
    bento.V1[command](data)
      .then((result) => console.log(result))
      .catch((error) => console.error(error))
  } catch (error) {
    console.error(error)
  }
}

//returns uid of team owner
export function teamOwner(team) {
  return Object.keys(team.roles).find((key) => team.roles[key] === 'owner')
}
