import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { routePaths } from '@/constants/routePaths.constants'
import { getAuthorizedUser } from './getAuthorizedUser'
import { isSuperAdmin } from '@/utils/helpers'
import { authDefaults, TWO_WEEKS_IN_MILLISECONDS } from '@/constants/auth.constants'
import { getTeam } from '@/lib/dbQueries'
import cookie from 'cookie'

export const getAuthorizedUserCurrentTeam = async (context) => {
  configureFirebaseApp()
  const firestore = getFirestore()
  try {
    const { uid, name } = await getAuthorizedUser(context)

    // super admin quick team switching
    if (context.query?.switchTeam && isSuperAdmin(uid)) {
      await firestore.collection('users').doc(uid).update({
        currentTeam: context.query.switchTeam,
      });

      // redirect to team's bot page
      return {
        redirect: {
          destination: routePaths.BOTS,
          permanent: false,
        },
      }
    }
    
    const userRef = await getFirestore().collection('users').doc(uid).get()
    if (userRef.exists && userRef.data().currentTeam) {
      //check if user has access to team
      const team = await getTeam(userRef.data().currentTeam)
      if (team && (team.roles[uid] || isSuperAdmin(uid))) {
        return {
          props: {
            team,
            userId: uid,
          },
        }
      }
    }

    let userName = name ? name.trim() : 'User'
    // If user does not belong to a team, create a new team for them.
    const teamRef = await firestore.collection('teams').add({
      createdAt: FieldValue.serverTimestamp(),
      name: `${userName}'s Team`,
      botCount: 0,
      sourceCount: 0,
      pageCount: 0,
      chunkCount: 0,
      questionCount: 0,
      openAIKey: null,
      roles: {
        [uid]: 'owner',
      },
    })

    const teamId = teamRef.id
    const team = await getTeam(teamId)

    // Create user with current team set
    await firestore.collection('users').doc(uid).set({
      createdAt: FieldValue.serverTimestamp(),
      currentTeam: teamId,
    })

    return {
      props: {
        team,
        userId: uid,
      },
    }
  } catch (error) {
    // If session verification fails or token expires (auth/session-cookie-expire),
    // then redirect back to login.
    console.error(error)

    // clear cookie
    context.res.setHeader(
      'set-cookie',
      cookie.serialize(
        authDefaults.COOKIE_NAME,
        '',
        {
          ...authDefaults.COOKIE_OPTIONS,
          maxAge: 0,
        }
      )
    )

    return {
      redirect: {
        destination: routePaths.LOGIN,
        permanent: false,
      },
    }
  }
}
